import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import { wsManager } from '@/services/websocket';
import type {
  Group,
  GroupMember,
  GroupMemberRole,
  GroupJoinMode,
  CreateGroupRequest,
  WsGroupInvitedPayload,
  WsGroupKickedPayload,
  WsGroupMemberJoinedPayload,
  WsGroupMemberLeftPayload,
  WsGroupUpdatedPayload,
  WsGroupMutedPayload,
  WsGroupUnmutedPayload,
  WsGroupDissolvedPayload,
} from '@/types';

interface GroupState {
  // 状态
  groups: Group[];
  currentGroup: Group | null;
  members: Record<string, GroupMember[]>;
  isLoading: boolean;
  error: string | null;

  // 群组操作
  fetchGroups: () => Promise<void>;
  fetchGroup: (groupId: string) => Promise<Group | null>;
  createGroup: (params: CreateGroupRequest) => Promise<Group | null>;
  updateGroup: (groupId: string, updates: {
    name?: string;
    avatar?: string;
    description?: string;
    joinMode?: GroupJoinMode;
    muteAll?: boolean;
  }) => Promise<void>;
  dissolveGroup: (groupId: string) => Promise<void>;

  // 成员操作
  fetchMembers: (groupId: string) => Promise<void>;
  inviteMembers: (groupId: string, userIds: string[]) => Promise<GroupMember[]>;
  kickMember: (groupId: string, userId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  transferOwner: (groupId: string, newOwnerId: string) => Promise<void>;
  setAdmin: (groupId: string, userId: string) => Promise<void>;
  removeAdmin: (groupId: string, userId: string) => Promise<void>;
  muteMember: (groupId: string, userId: string, duration?: number) => Promise<void>;
  unmuteMember: (groupId: string, userId: string) => Promise<void>;

  // 辅助方法
  setCurrentGroup: (group: Group | null) => void;
  setupWsListeners: () => () => void;
  clearError: () => void;
}

const initialState = {
  groups: [],
  currentGroup: null,
  members: {},
  isLoading: false,
  error: null,
};

export const useGroupStore = create<GroupState>()(
  immer((set, get) => ({
    ...initialState,

    // ============================================================
    // 群组操作
    // ============================================================

    fetchGroups: async (): Promise<void> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<Group[]>('/api/im/groups');
        const groups = response as unknown as Group[];

        set((state) => {
          state.groups = groups;
          state.isLoading = false;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取群组列表失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
      }
    },

    fetchGroup: async (groupId: string): Promise<Group | null> => {
      try {
        // 后端返回 { group: Group, membership: GroupMember }
        const response = await api.get<{ 
          group: Group; 
          membership: {
            id: string;
            groupId: string;
            userId: string;
            role: GroupMemberRole;
            groupNickname: string | null;
            isMuted: boolean;
            muteUntil: Date | null;
            doNotDisturb: boolean;
            joinedAt: Date;
          }
        }>(`/api/im/groups/${groupId}`);
        const data = response as unknown as { 
          group: Group; 
          membership: {
            id: string;
            groupId: string;
            userId: string;
            role: GroupMemberRole;
            groupNickname: string | null;
            isMuted: boolean;
            muteUntil: Date | null;
            doNotDisturb: boolean;
            joinedAt: Date;
          }
        };
        
        // 合并 membership 信息到 group
        const group: Group = {
          ...data.group,
          membership: {
            role: data.membership.role,
            groupNickname: data.membership.groupNickname,
            doNotDisturb: data.membership.doNotDisturb,
            isMuted: data.membership.isMuted,
            muteUntil: data.membership.muteUntil ? data.membership.muteUntil.toString() : null
          }
        };

        set((state) => {
          state.currentGroup = group;
          // 同步更新列表中的数据
          const index = state.groups.findIndex((g) => g.id === groupId);
          if (index !== -1) {
            state.groups[index] = group;
          }
        });

        return group;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取群组详情失败';
        set((state) => {
          state.error = message;
        });
        return null;
      }
    },

    createGroup: async (params: CreateGroupRequest): Promise<Group | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.post<Group>('/api/im/groups', params);
        const group = response as unknown as Group;

        set((state) => {
          state.groups.unshift(group);
          state.isLoading = false;
        });

        return group;
      } catch (err) {
        const message = err instanceof Error ? err.message : '创建群组失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    updateGroup: async (groupId: string, updates): Promise<void> => {
      try {
        const response = await api.put<Group>(`/api/im/groups/${groupId}`, updates);
        const group = response as unknown as Group;

        set((state) => {
          const index = state.groups.findIndex((g) => g.id === groupId);
          if (index !== -1) {
            state.groups[index] = group;
          }
          if (state.currentGroup?.id === groupId) {
            state.currentGroup = group;
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新群组信息失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    dissolveGroup: async (groupId: string): Promise<void> => {
      try {
        await api.delete(`/api/im/groups/${groupId}`);

        set((state) => {
          state.groups = state.groups.filter((g) => g.id !== groupId);
          if (state.currentGroup?.id === groupId) {
            state.currentGroup = null;
          }
          delete state.members[groupId];
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '解散群组失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    // ============================================================
    // 成员操作
    // ============================================================

    fetchMembers: async (groupId: string): Promise<void> => {
      try {
        const response = await api.get<GroupMember[]>(`/api/im/groups/${groupId}/members`);
        const members = response as unknown as GroupMember[];

        set((state) => {
          state.members[groupId] = members;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取群成员列表失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    inviteMembers: async (groupId: string, userIds: string[]): Promise<GroupMember[]> => {
      try {
        const response = await api.post<GroupMember[]>(`/api/im/groups/${groupId}/invite`, { userIds });
        const newMembers = response as unknown as GroupMember[];

        set((state) => {
          const existing = state.members[groupId] || [];
          state.members[groupId] = [...existing, ...newMembers];
          // 更新群成员数
          const groupIndex = state.groups.findIndex((g) => g.id === groupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].memberCount += newMembers.length;
          }
        });

        return newMembers;
      } catch (err) {
        const message = err instanceof Error ? err.message : '邀请成员失败';
        set((state) => {
          state.error = message;
        });
        return [];
      }
    },

    kickMember: async (groupId: string, userId: string): Promise<void> => {
      try {
        await api.post(`/api/im/groups/${groupId}/kick/${userId}`);

        set((state) => {
          if (state.members[groupId]) {
            state.members[groupId] = state.members[groupId].filter((m) => m.userId !== userId);
          }
          // 更新群成员数
          const groupIndex = state.groups.findIndex((g) => g.id === groupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].memberCount = Math.max(0, state.groups[groupIndex].memberCount - 1);
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '踢出成员失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    // removeMember 是 kickMember 的别名
    removeMember: async (groupId: string, userId: string): Promise<void> => {
      return get().kickMember(groupId, userId);
    },

    leaveGroup: async (groupId: string): Promise<void> => {
      try {
        await api.post(`/api/im/groups/${groupId}/leave`);

        set((state) => {
          state.groups = state.groups.filter((g) => g.id !== groupId);
          if (state.currentGroup?.id === groupId) {
            state.currentGroup = null;
          }
          delete state.members[groupId];
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '退出群组失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    transferOwner: async (groupId: string, newOwnerId: string): Promise<void> => {
      try {
        await api.post(`/api/im/groups/${groupId}/transfer`, { newOwnerId });

        set((state) => {
          const groupIndex = state.groups.findIndex((g) => g.id === groupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].ownerId = newOwnerId;
          }
          if (state.currentGroup?.id === groupId) {
            state.currentGroup.ownerId = newOwnerId;
          }
          // 更新成员角色
          if (state.members[groupId]) {
            state.members[groupId] = state.members[groupId].map((m) => {
              if (m.userId === newOwnerId) {
                return { ...m, role: 'owner' as const };
              }
              if (m.role === 'owner') {
                return { ...m, role: 'member' as const };
              }
              return m;
            });
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '转让群主失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    setAdmin: async (groupId: string, userId: string): Promise<void> => {
      try {
        await api.post(`/api/im/groups/${groupId}/admin/${userId}`);

        set((state) => {
          if (state.members[groupId]) {
            const memberIndex = state.members[groupId].findIndex((m) => m.userId === userId);
            if (memberIndex !== -1) {
              state.members[groupId][memberIndex].role = 'admin';
            }
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '设置管理员失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    removeAdmin: async (groupId: string, userId: string): Promise<void> => {
      try {
        await api.delete(`/api/im/groups/${groupId}/admin/${userId}`);

        set((state) => {
          if (state.members[groupId]) {
            const memberIndex = state.members[groupId].findIndex((m) => m.userId === userId);
            if (memberIndex !== -1) {
              state.members[groupId][memberIndex].role = 'member';
            }
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '取消管理员失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    muteMember: async (groupId: string, userId: string, duration?: number): Promise<void> => {
      try {
        await api.post(`/api/im/groups/${groupId}/mute/${userId}`, { duration });

        set((state) => {
          if (state.members[groupId]) {
            const memberIndex = state.members[groupId].findIndex((m) => m.userId === userId);
            if (memberIndex !== -1 && duration) {
              const muteEndAt = new Date(Date.now() + duration * 1000).toISOString();
              state.members[groupId][memberIndex].muteEndAt = muteEndAt;
            }
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '禁言成员失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    unmuteMember: async (groupId: string, userId: string): Promise<void> => {
      try {
        await api.delete(`/api/im/groups/${groupId}/mute/${userId}`);

        set((state) => {
          if (state.members[groupId]) {
            const memberIndex = state.members[groupId].findIndex((m) => m.userId === userId);
            if (memberIndex !== -1) {
              state.members[groupId][memberIndex].muteEndAt = null;
            }
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '解除禁言失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    // ============================================================
    // 辅助方法
    // ============================================================

    setCurrentGroup: (group: Group | null): void => {
      set((state) => {
        state.currentGroup = group;
      });
    },

    setupWsListeners: (): (() => void) => {
      // 被邀请加入群组
      const handleInvited = (payload: WsGroupInvitedPayload) => {
        const newGroup: Group = {
          id: payload.groupId,
          name: payload.groupName,
          avatar: payload.groupAvatar,
          description: null,
          ownerId: '',
          joinMode: 'invite',
          muteAll: false,
          memberCount: 0,
          createdAt: new Date(payload.invitedAt).toISOString(),
        };

        set((state) => {
          // 避免重复添加
          if (!state.groups.some((g) => g.id === payload.groupId)) {
            state.groups.unshift(newGroup);
          }
        });

        // 异步获取完整群组信息
        get().fetchGroup(payload.groupId);
      };

      // 被踢出群组
      const handleKicked = (payload: WsGroupKickedPayload) => {
        set((state) => {
          state.groups = state.groups.filter((g) => g.id !== payload.groupId);
          if (state.currentGroup?.id === payload.groupId) {
            state.currentGroup = null;
          }
          delete state.members[payload.groupId];
        });
      };

      // 新成员加入
      const handleMemberJoined = (payload: WsGroupMemberJoinedPayload) => {
        set((state) => {
          // 更新成员数
          const groupIndex = state.groups.findIndex((g) => g.id === payload.groupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].memberCount += 1;
          }
          // 如果已加载成员列表，添加新成员
          if (state.members[payload.groupId]) {
            const newMember: GroupMember = {
              id: '',
              groupId: payload.groupId,
              userId: payload.member.id,
              role: 'member',
              nickname: null,
              muteEndAt: null,
              joinedAt: new Date(payload.joinedAt).toISOString(),
              user: payload.member,
            };
            state.members[payload.groupId].push(newMember);
          }
        });
      };

      // 成员离开
      const handleMemberLeft = (payload: WsGroupMemberLeftPayload) => {
        set((state) => {
          // 更新成员数
          const groupIndex = state.groups.findIndex((g) => g.id === payload.groupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].memberCount = Math.max(0, state.groups[groupIndex].memberCount - 1);
          }
          // 移除成员
          if (state.members[payload.groupId]) {
            state.members[payload.groupId] = state.members[payload.groupId].filter(
              (m) => m.userId !== payload.userId
            );
          }
        });
      };

      // 群组信息更新
      const handleUpdated = (payload: WsGroupUpdatedPayload) => {
        set((state) => {
          const groupIndex = state.groups.findIndex((g) => g.id === payload.groupId);
          if (groupIndex !== -1) {
            const group = state.groups[groupIndex];
            if (payload.changes.name !== undefined) group.name = payload.changes.name;
            if (payload.changes.avatar !== undefined) group.avatar = payload.changes.avatar;
            if (payload.changes.description !== undefined) group.description = payload.changes.description;
            if (payload.changes.muteAll !== undefined) group.muteAll = payload.changes.muteAll;
          }
          if (state.currentGroup?.id === payload.groupId) {
            if (payload.changes.name !== undefined) state.currentGroup.name = payload.changes.name;
            if (payload.changes.avatar !== undefined) state.currentGroup.avatar = payload.changes.avatar;
            if (payload.changes.description !== undefined) state.currentGroup.description = payload.changes.description;
            if (payload.changes.muteAll !== undefined) state.currentGroup.muteAll = payload.changes.muteAll;
          }
        });
      };

      // 被禁言
      const handleMuted = (payload: WsGroupMutedPayload) => {
        set((state) => {
          if (state.members[payload.groupId]) {
            // 这里的userId是当前用户，需要从auth获取
            // 暂时更新所有匹配的成员
            state.members[payload.groupId] = state.members[payload.groupId].map((m) => {
              // 标记：实际应该检查是否是当前用户
              return m;
            });
          }
        });
        // 可以在这里触发UI提示
        if (__DEV__) {
          console.log('[GroupStore] 被禁言:', payload.groupName, payload.duration);
        }
      };

      // 解除禁言
      const handleUnmuted = (payload: WsGroupUnmutedPayload) => {
        if (__DEV__) {
          console.log('[GroupStore] 解除禁言:', payload.groupName);
        }
      };

      // 群组解散
      const handleDissolved = (payload: WsGroupDissolvedPayload) => {
        set((state) => {
          state.groups = state.groups.filter((g) => g.id !== payload.groupId);
          if (state.currentGroup?.id === payload.groupId) {
            state.currentGroup = null;
          }
          delete state.members[payload.groupId];
        });
      };

      // 注册所有监听器
      const unsubInvited = wsManager.on<WsGroupInvitedPayload>('group:invited', handleInvited);
      const unsubKicked = wsManager.on<WsGroupKickedPayload>('group:kicked', handleKicked);
      const unsubMemberJoined = wsManager.on<WsGroupMemberJoinedPayload>('group:member_joined', handleMemberJoined);
      const unsubMemberLeft = wsManager.on<WsGroupMemberLeftPayload>('group:member_left', handleMemberLeft);
      const unsubUpdated = wsManager.on<WsGroupUpdatedPayload>('group:updated', handleUpdated);
      const unsubMuted = wsManager.on<WsGroupMutedPayload>('group:muted', handleMuted);
      const unsubUnmuted = wsManager.on<WsGroupUnmutedPayload>('group:unmuted', handleUnmuted);
      const unsubDissolved = wsManager.on<WsGroupDissolvedPayload>('group:dissolved', handleDissolved);

      return () => {
        unsubInvited();
        unsubKicked();
        unsubMemberJoined();
        unsubMemberLeft();
        unsubUpdated();
        unsubMuted();
        unsubUnmuted();
        unsubDissolved();
      };
    },

    clearError: (): void => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);

// 选择器
export const selectGroups = (state: GroupState) => state.groups;
export const selectCurrentGroup = (state: GroupState) => state.currentGroup;
export const selectGroupMembers = (groupId: string) => (state: GroupState) => state.members[groupId] || [];
export const selectGroupById = (groupId: string) => (state: GroupState) => 
  state.groups.find((g) => g.id === groupId);
export const selectIsGroupOwner = (groupId: string, userId: string) => (state: GroupState) => {
  const group = state.groups.find((g) => g.id === groupId);
  return group?.ownerId === userId;
};
export const selectIsGroupAdmin = (groupId: string, userId: string) => (state: GroupState) => {
  const members = state.members[groupId] || [];
  const member = members.find((m) => m.userId === userId);
  return member?.role === 'admin' || member?.role === 'owner';
};

import type { UserPublic } from './user';

// 群组加入方式
export type GroupJoinMode = 'open' | 'approval' | 'invite';

// 群成员角色
export type GroupMemberRole = 'owner' | 'admin' | 'member';

// 群组实体
export interface Group {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  joinMode: GroupJoinMode;
  muteAll: boolean;
  memberCount: number;
  createdAt: string;
  // 后端返回的 membership 信息
  membership?: {
    role: GroupMemberRole;
    groupNickname: string | null;
    doNotDisturb: boolean;
    isMuted?: boolean;
    muteUntil?: string | null;
  };
}

// 群成员
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  nickname: string | null;
  muteEndAt: string | null;
  joinedAt: string;
  user?: UserPublic;
}

// 创建群组请求
export interface CreateGroupRequest {
  name: string;
  avatar?: string;
  description?: string;
  joinMode?: GroupJoinMode;
  memberIds?: string[];
}

// WebSocket 事件 payload
export interface WsGroupInvitedPayload {
  groupId: string;
  groupName: string;
  groupAvatar: string | null;
  inviter: UserPublic;
  invitedAt: number;
}

export interface WsGroupKickedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  kickedAt: number;
}

export interface WsGroupMemberJoinedPayload {
  groupId: string;
  member: UserPublic;
  inviterId: string | null;
  joinedAt: number;
}

export interface WsGroupMemberLeftPayload {
  groupId: string;
  userId: string;
  leftAt: number;
}

export interface WsGroupUpdatedPayload {
  groupId: string;
  changes: {
    name?: string;
    avatar?: string | null;
    description?: string | null;
    announcement?: string | null;
    muteAll?: boolean;
  };
  operatorId: string;
  updatedAt: number;
}

export interface WsGroupMutedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  duration: number | null;
  muteEndAt: string | null;
  mutedAt: number;
}

export interface WsGroupUnmutedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  unmutedAt: number;
}

export interface WsGroupDissolvedPayload {
  groupId: string;
  groupName: string;
  dissolvedAt: number;
}

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import { wsManager } from '@/services/websocket';
import type { PresenceStatus, WsPresenceOnlinePayload, WsPresenceOfflinePayload } from '@/types';

interface PresenceState {
  // 状态 - userId -> PresenceStatus
  statusMap: Record<string, PresenceStatus>;
  friendsOnline: PresenceStatus[];
  isLoading: boolean;
  error: string | null;

  // 操作
  checkOnline: (userId: string) => Promise<boolean>;
  getStatus: (userId: string) => Promise<PresenceStatus | null>;
  batchGetStatus: (userIds: string[]) => Promise<PresenceStatus[]>;
  fetchFriendsOnline: () => Promise<PresenceStatus[]>;

  // 内部更新
  setUserOnline: (userId: string, deviceId: string) => void;
  setUserOffline: (userId: string, deviceId: string) => void;

  // WebSocket
  setupWsListeners: () => () => void;
  clearError: () => void;
}

const initialState = {
  statusMap: {},
  friendsOnline: [],
  isLoading: false,
  error: null,
};

export const usePresenceStore = create<PresenceState>()(
  immer((set, get) => ({
    ...initialState,

    checkOnline: async (userId: string): Promise<boolean> => {
      try {
        const response = await api.get<{ userId: string; isOnline: boolean }>(
          `/api/im/presence/check/${userId}`
        );
        const data = response as unknown as { userId: string; isOnline: boolean };

        set((state) => {
          state.statusMap[userId] = {
            ...state.statusMap[userId],
            userId,
            isOnline: data.isOnline,
          };
        });

        return data.isOnline;
      } catch {
        return false;
      }
    },

    getStatus: async (userId: string): Promise<PresenceStatus | null> => {
      try {
        const response = await api.get<PresenceStatus>(`/api/im/presence/status/${userId}`);
        const status = response as unknown as PresenceStatus;

        set((state) => {
          state.statusMap[userId] = status;
        });

        return status;
      } catch {
        return null;
      }
    },

    batchGetStatus: async (userIds: string[]): Promise<PresenceStatus[]> => {
      if (userIds.length === 0) return [];

      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // 后端返回 { [userId: string]: { isOnline: boolean, lastActiveAt: Date | null } }
        const response = await api.post<Record<string, { isOnline: boolean; lastActiveAt: Date | null }>>(
          '/api/im/presence/batch', 
          { userIds }
        );
        const statusObj = response as unknown as Record<string, { isOnline: boolean; lastActiveAt: Date | null }>;
        
        // 转换为数组格式
        const statuses: PresenceStatus[] = Object.entries(statusObj).map(([userId, data]) => ({
          userId,
          isOnline: data.isOnline,
          lastActiveAt: data.lastActiveAt ? data.lastActiveAt.toString() : null,
          onlineDeviceCount: data.isOnline ? 1 : 0
        }));

        set((state) => {
          statuses.forEach((status) => {
            state.statusMap[status.userId] = status;
          });
          state.isLoading = false;
        });

        return statuses;
      } catch (err) {
        const message = err instanceof Error ? err.message : '批量获取在线状态失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return [];
      }
    },

    fetchFriendsOnline: async (): Promise<PresenceStatus[]> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<PresenceStatus[]>('/api/im/presence/friends');
        const statuses = response as unknown as PresenceStatus[];

        set((state) => {
          state.friendsOnline = statuses;
          statuses.forEach((status) => {
            state.statusMap[status.userId] = status;
          });
          state.isLoading = false;
        });

        return statuses;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取好友在线状态失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return [];
      }
    },

    setUserOnline: (userId: string, deviceId: string): void => {
      set((state) => {
        const existing = state.statusMap[userId];
        state.statusMap[userId] = {
          userId,
          isOnline: true,
          lastOnlineAt: new Date().toISOString(),
          onlineDeviceCount: (existing?.onlineDeviceCount || 0) + 1,
        };
        // 更新好友在线列表
        if (!state.friendsOnline.some((f) => f.userId === userId)) {
          state.friendsOnline.push(state.statusMap[userId]);
        }
      });
    },

    setUserOffline: (userId: string, deviceId: string): void => {
      set((state) => {
        const existing = state.statusMap[userId];
        if (existing) {
          const newCount = Math.max(0, (existing.onlineDeviceCount || 1) - 1);
          state.statusMap[userId] = {
            ...existing,
            isOnline: newCount > 0,
            lastOnlineAt: new Date().toISOString(),
            onlineDeviceCount: newCount,
          };
          // 如果完全离线，从好友在线列表移除
          if (newCount === 0) {
            state.friendsOnline = state.friendsOnline.filter((f) => f.userId !== userId);
          }
        }
      });
    },

    setupWsListeners: (): (() => void) => {
      const handleOnline = (payload: WsPresenceOnlinePayload) => {
        get().setUserOnline(payload.userId, payload.deviceId);
      };

      const handleOffline = (payload: WsPresenceOfflinePayload) => {
        get().setUserOffline(payload.userId, payload.deviceId);
      };

      const unsubOnline = wsManager.on<WsPresenceOnlinePayload>('presence:online', handleOnline);
      const unsubOffline = wsManager.on<WsPresenceOfflinePayload>('presence:offline', handleOffline);

      return () => {
        unsubOnline();
        unsubOffline();
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
export const selectPresenceStatus = (userId: string) => (state: PresenceState) =>
  state.statusMap[userId];
export const selectIsOnline = (userId: string) => (state: PresenceState) =>
  state.statusMap[userId]?.isOnline ?? false;
export const selectFriendsOnline = (state: PresenceState) => state.friendsOnline;
export const selectOnlineCount = (state: PresenceState) => state.friendsOnline.length;

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import { wsManager } from '@/services/websocket';
import type { 
  Friend, 
  FriendRequest, 
  FriendSource,
  SendFriendRequestBody,
  WsFriendRequestPayload,
  WsFriendAcceptedPayload 
} from '@/types';

interface PaginatedFriends {
  list: Friend[];
  total: number;
  page: number;
  limit: number;
}

interface FriendState {
  // 状态
  friends: Friend[];
  blockedFriends: Friend[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
  
  // 新申请数量
  pendingRequestCount: number;

  // 操作
  fetchFriends: (params?: { isBlocked?: boolean; isPinned?: boolean }) => Promise<void>;
  fetchFriend: (userId: string) => Promise<Friend | null>;
  updateFriend: (userId: string, updates: { alias?: string; isBlocked?: boolean; doNotDisturb?: boolean; isPinned?: boolean }) => Promise<void>;
  deleteFriend: (userId: string) => Promise<void>;
  checkIsFriend: (userId: string) => Promise<boolean>;
  
  // 好友申请
  fetchReceivedRequests: () => Promise<void>;
  fetchSentRequests: () => Promise<void>;
  sendRequest: (params: SendFriendRequestBody) => Promise<FriendRequest | null>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;

  // WebSocket
  setupWsListeners: () => () => void;
  clearError: () => void;
}

const initialState = {
  friends: [],
  blockedFriends: [],
  receivedRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null,
  pendingRequestCount: 0,
};

export const useFriendStore = create<FriendState>()(
  immer((set, get) => ({
    ...initialState,

    fetchFriends: async (params?: { isBlocked?: boolean; isPinned?: boolean }): Promise<void> => {
      console.log('[friendStore] fetchFriends start', params);
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<PaginatedFriends>('/api/im/friends', { params });
        const data = response as unknown as PaginatedFriends;

        console.log('[friendStore] fetchFriends response:', {
          hasData: !!data,
          hasList: !!data?.list,
          isArray: Array.isArray(data?.list),
          listLength: data?.list?.length,
          rawDataKeys: Object.keys(data || {}),
          rawData: JSON.stringify(data).substring(0, 300)
        });

        // 后端通过 pagedOk 返回: { list: [], total, page, limit }
        // Axios 拦截器已转换为此格式
        if (!data || !Array.isArray(data.list)) {
          throw new Error(`Invalid friends response: expected {list: []}, got ${JSON.stringify(data)}`);
        }

        // 后端返回的字段是 friendUser，需要映射为前端期望的 friend
        const friends = data.list.map((item: any) => ({
          ...item,
          friend: item.friendUser, // 映射 friendUser -> friend
        }));

        set((state) => {
          if (params?.isBlocked) {
            state.blockedFriends = friends;
          } else {
            state.friends = friends;
          }
          state.isLoading = false;
        });

        console.log('[friendStore] fetchFriends success, count:', data.list.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取好友列表失败';
        console.error('[friendStore] fetchFriends error:', {
          error: err,
          message,
          stack: err instanceof Error ? err.stack : 'no stack'
        });
        set((state) => {
          state.isLoading = false;
          state.error = message;
          // 确保即使出错也有空数组
          if (params?.isBlocked) {
            state.blockedFriends = [];
          } else {
            state.friends = [];
          }
        });
      }
    },

    fetchFriend: async (userId: string): Promise<Friend | null> => {
      try {
        // 后端返回 { friend: Friend, user: UserPublic }
        const response = await api.get<{ 
          friend: Friend; 
          user: { 
            id: string; 
            name: string; 
            avatar: string | null; 
            gender: 'male' | 'female' | 'unknown' 
          } 
        }>(`/api/im/friends/${userId}`);
        const data = response as unknown as { 
          friend: Friend; 
          user: { 
            id: string; 
            name: string; 
            avatar: string | null; 
            gender: 'male' | 'female' | 'unknown' 
          } 
        };
        
        // 合并 user 信息到 friend.friend 字段
        return {
          ...data.friend,
          friend: data.user
        };
      } catch {
        return null;
      }
    },

    updateFriend: async (userId: string, updates): Promise<void> => {
      try {
        const response = await api.put<Friend>(`/api/im/friends/${userId}`, updates);
        const friend = response as unknown as Friend;

        set((state) => {
          const index = state.friends.findIndex((f) => f.friendId === userId);
          if (index !== -1) {
            state.friends[index] = friend;
          }
          
          // 如果设置了拉黑
          if (updates.isBlocked === true) {
            state.friends = state.friends.filter((f) => f.friendId !== userId);
            state.blockedFriends.push(friend);
          }
          // 如果取消拉黑
          if (updates.isBlocked === false) {
            state.blockedFriends = state.blockedFriends.filter((f) => f.friendId !== userId);
            state.friends.push(friend);
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新好友设置失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    deleteFriend: async (userId: string): Promise<void> => {
      try {
        await api.delete(`/api/im/friends/${userId}`);

        set((state) => {
          state.friends = state.friends.filter((f) => f.friendId !== userId);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除好友失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    checkIsFriend: async (userId: string): Promise<boolean> => {
      try {
        const response = await api.get<{ isFriend: boolean }>(`/api/im/friends/check/${userId}`);
        const data = response as unknown as { isFriend: boolean };
        return data.isFriend;
      } catch {
        return false;
      }
    },

    fetchReceivedRequests: async (): Promise<void> => {
      try {
        const response = await api.get<FriendRequest[]>('/api/im/friends/requests/received', {
          params: { status: 'pending' },
        });
        const requests = response as unknown as FriendRequest[];

        set((state) => {
          state.receivedRequests = requests;
          state.pendingRequestCount = requests.length;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取好友申请失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    fetchSentRequests: async (): Promise<void> => {
      try {
        const response = await api.get<FriendRequest[]>('/api/im/friends/requests/sent');
        const requests = response as unknown as FriendRequest[];

        set((state) => {
          state.sentRequests = requests;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取已发送申请失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    sendRequest: async (params: SendFriendRequestBody): Promise<FriendRequest | null> => {
      try {
        const response = await api.post<FriendRequest>('/api/im/friends/requests', params);
        const request = response as unknown as FriendRequest;

        set((state) => {
          state.sentRequests.unshift(request);
        });

        return request;
      } catch (err) {
        const message = err instanceof Error ? err.message : '发送好友申请失败';
        set((state) => {
          state.error = message;
        });
        return null;
      }
    },

    acceptRequest: async (requestId: string): Promise<void> => {
      try {
        // 后端返回 { friend: Friend & { friendUser }, reverse: Friend, conversationId: string }
        const response = await api.post<{ friend: any; reverse: any; conversationId: string }>(
          `/api/im/friends/requests/${requestId}/accept`
        );
        const data = response as unknown as { friend: any; reverse: any; conversationId: string };

        // 映射 friendUser -> friend
        const friendWithUser: Friend = {
          ...data.friend,
          friend: data.friend.friendUser,
        };

        set((state) => {
          state.receivedRequests = state.receivedRequests.filter((r) => r.id !== requestId);
          state.pendingRequestCount = Math.max(0, state.pendingRequestCount - 1);
          state.friends.unshift(friendWithUser);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '接受好友申请失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    rejectRequest: async (requestId: string): Promise<void> => {
      try {
        await api.post(`/api/im/friends/requests/${requestId}/reject`);

        set((state) => {
          state.receivedRequests = state.receivedRequests.filter((r) => r.id !== requestId);
          state.pendingRequestCount = Math.max(0, state.pendingRequestCount - 1);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '拒绝好友申请失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    setupWsListeners: (): (() => void) => {
      const handleFriendRequest = (payload: WsFriendRequestPayload) => {
        const request: FriendRequest = {
          id: payload.requestId,
          fromUserId: payload.fromUser.id,
          toUserId: '', // 当前用户
          message: payload.message,
          source: payload.source,
          status: 'pending',
          createdAt: new Date(payload.createdAt).toISOString(),
          fromUser: payload.fromUser,
        };

        set((state) => {
          state.receivedRequests.unshift(request);
          state.pendingRequestCount += 1;
        });
      };

      const handleFriendAccepted = (payload: WsFriendAcceptedPayload) => {
        const friend: Friend = {
          id: '',
          userId: '',
          friendId: payload.friendUser.id,
          alias: null,
          isBlocked: false,
          doNotDisturb: false,
          isPinned: false,
          source: 'search',
          createdAt: new Date(payload.acceptedAt).toISOString(),
          friend: payload.friendUser,
        };

        set((state) => {
          state.sentRequests = state.sentRequests.filter((r) => r.id !== payload.requestId);
          state.friends.unshift(friend);
        });
      };

      const unsubRequest = wsManager.on<WsFriendRequestPayload>('friend:request', handleFriendRequest);
      const unsubAccepted = wsManager.on<WsFriendAcceptedPayload>('friend:accepted', handleFriendAccepted);

      return () => {
        unsubRequest();
        unsubAccepted();
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
export const selectFriends = (state: FriendState) => state.friends;
export const selectBlockedFriends = (state: FriendState) => state.blockedFriends;
export const selectReceivedRequests = (state: FriendState) => state.receivedRequests;
export const selectPendingRequestCount = (state: FriendState) => state.pendingRequestCount;

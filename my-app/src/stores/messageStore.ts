import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import { wsManager } from '@/services/websocket';
import { soundService } from '@/services/sound';
import { useConversationStore } from './conversationStore';
import { useAuthStore } from './authStore';
import type { 
  Message, 
  MessageType,
  SendMessageRequest,
  WsMessageNewPayload,
  WsMessageRecalledPayload,
  WsMessageReadPayload,
  WsMessageDeliveredPayload 
} from '@/types';

interface PaginatedMessages {
  list: Message[];
  total: number;
  page: number;
  limit: number;
}

interface SearchMessagesParams {
  keyword: string;
  conversationId?: string;
  senderId?: string;
  type?: MessageType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface SearchMessagesResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

interface MessageState {
  // 状态 - 按会话分组存储
  messagesByConversation: Record<string, Message[]>;
  searchResults: Message[];
  isLoading: boolean;
  isSending: boolean;
  isSearching: boolean;
  error: string | null;
  hasMore: Record<string, boolean>;
  searchHasMore: boolean;

  // 操作
  fetchMessages: (conversationId: string, page?: number, limit?: number) => Promise<void>;
  fetchMessage: (messageId: string) => Promise<Message | null>;
  sendMessage: (params: SendMessageRequest) => Promise<Message | null>;
  recallMessage: (messageId: string, conversationId: string) => Promise<void>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  markAsDelivered: (messageId: string) => Promise<void>;
  forwardMessage: (messageId: string, conversationIds: string[]) => Promise<Message[]>;
  batchMarkAsDelivered: (messageIds: string[]) => Promise<void>;
  searchMessages: (params: SearchMessagesParams) => Promise<SearchMessagesResult>;
  getMessagesByConversation: (conversationId: string) => Message[];

  // 内部更新
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  
  // WebSocket
  setupWsListeners: () => () => void;
  clearError: () => void;
  clearMessages: (conversationId: string) => void;
  clearSearchResults: () => void;
}

const initialState = {
  messagesByConversation: {},
  searchResults: [],
  isLoading: false,
  isSending: false,
  isSearching: false,
  error: null,
  hasMore: {},
  searchHasMore: false,
};

let localIdCounter = 0;
function generateLocalId(): string {
  return `local_${Date.now()}_${++localIdCounter}`;
}

export const useMessageStore = create<MessageState>()(
  immer((set, get) => ({
    ...initialState,

    fetchMessages: async (conversationId: string, page = 1, limit = 30): Promise<void> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<PaginatedMessages>(
          `/api/im/messages/conversation/${conversationId}`,
          { params: { page, limit } }
        );
        const data = response as unknown as PaginatedMessages;

        console.log('[messageStore] fetchMessages response:', {
          conversationId,
          page,
          dataKeys: Object.keys(data || {}),
          listLength: data?.list?.length,
          hasListProperty: 'list' in (data || {}),
          rawData: JSON.stringify(data).substring(0, 200)
        });

        if (!data || !Array.isArray(data.list)) {
          throw new Error(`Invalid response structure: expected {list: []}, got ${JSON.stringify(data)}`);
        }

        set((state) => {
          if (page === 1) {
            state.messagesByConversation[conversationId] = data.list;
          } else {
            const existing = state.messagesByConversation[conversationId] || [];
            state.messagesByConversation[conversationId] = [...existing, ...data.list];
          }
          state.hasMore[conversationId] = data.list.length === limit;
          state.isLoading = false;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取消息失败';
        console.error('[messageStore] fetchMessages error:', {
          conversationId,
          page,
          error: err,
          message,
          stack: err instanceof Error ? err.stack : 'no stack'
        });
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
      }
    },

    fetchMessage: async (messageId: string): Promise<Message | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<Message>(`/api/im/messages/${messageId}`);
        const message = response as unknown as Message;

        set((state) => {
          // 如果消息所属会话已加载，更新该会话中的消息
          const conversationId = message.conversationId;
          if (state.messagesByConversation[conversationId]) {
            const index = state.messagesByConversation[conversationId].findIndex(
              (m) => m.id === messageId
            );
            if (index !== -1) {
              state.messagesByConversation[conversationId][index] = message;
            } else {
              // 如果消息不在列表中，添加到列表
              state.messagesByConversation[conversationId].push(message);
            }
          }
          state.isLoading = false;
        });

        return message;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取消息详情失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    sendMessage: async (params: SendMessageRequest): Promise<Message | null> => {
      const localId = generateLocalId();
      const currentUser = useAuthStore.getState().user;
      const currentUserId = currentUser?.id || null;
      
      console.log('[messageStore] sendMessage start:', {
        params,
        localId,
        currentUserId
      });

      // 乐观更新 - 立即显示消息
      const optimisticMessage: Message = {
        id: localId,
        localId,
        conversationId: params.conversationId,
        senderId: currentUserId, // 设置当前用户ID，以便正确显示在右侧
        type: params.type,
        content: params.content || null,
        mediaUrl: params.mediaUrl || null,
        mediaDuration: params.mediaDuration || null,
        replyToId: params.replyToId || null,
        isRecalled: false,
        recalledAt: null,
        deliveredAt: null,
        readAt: null,
        createdAt: new Date().toISOString(),
        status: 'pending',
        // 添加 sender 信息用于头像显示
        sender: currentUser ? {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          gender: currentUser.gender,
        } : undefined,
      };

      set((state) => {
        state.isSending = true;
        const messages = state.messagesByConversation[params.conversationId] || [];
        state.messagesByConversation[params.conversationId] = [optimisticMessage, ...messages];
      });

      try {
        const response = await api.post<Message>('/api/im/messages', params);
        const message = response as unknown as Message;

        console.log('[messageStore] sendMessage success:', {
          localId,
          messageId: message.id,
          conversationId: params.conversationId
        });

        set((state) => {
          state.isSending = false;
          const messages = state.messagesByConversation[params.conversationId] || [];
          const index = messages.findIndex((m) => m.localId === localId);
          if (index !== -1) {
            messages[index] = { ...message, localId, status: 'sent' };
          }
        });

        // 更新会话的最后消息
        useConversationStore.getState().updateLastMessage(params.conversationId, message);

        return message;
      } catch (err) {
        console.error('[messageStore] sendMessage error:', {
          localId,
          params,
          error: err,
          stack: err instanceof Error ? err.stack : 'no stack'
        });
        set((state) => {
          state.isSending = false;
          const messages = state.messagesByConversation[params.conversationId] || [];
          const index = messages.findIndex((m) => m.localId === localId);
          if (index !== -1) {
            messages[index].status = 'failed';
          }
        });
        return null;
      }
    },

    recallMessage: async (messageId: string, conversationId: string): Promise<void> => {
      try {
        await api.post(`/api/im/messages/${messageId}/recall`);

        set((state) => {
          const messages = state.messagesByConversation[conversationId] || [];
          const index = messages.findIndex((m) => m.id === messageId);
          if (index !== -1) {
            messages[index].isRecalled = true;
            messages[index].recalledAt = new Date().toISOString();
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '撤回失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    markAsRead: async (conversationId: string, messageId: string): Promise<void> => {
      try {
        await api.post(`/api/im/messages/conversation/${conversationId}/read`, { messageId });
      } catch {
        // 静默处理
      }
    },

    markAsDelivered: async (messageId: string): Promise<void> => {
      try {
        await api.post(`/api/im/messages/${messageId}/delivered`);
      } catch {
        // 静默处理
      }
    },

    forwardMessage: async (messageId: string, conversationIds: string[]): Promise<Message[]> => {
      try {
        const response = await api.post<Message[]>(`/api/im/messages/${messageId}/forward`, {
          conversationIds,
        });
        const messages = response as unknown as Message[];

        // 将转发的消息添加到对应的会话
        messages.forEach((msg) => {
          get().addMessage(msg.conversationId, msg);
          useConversationStore.getState().updateLastMessage(msg.conversationId, msg);
        });

        return messages;
      } catch (err) {
        const message = err instanceof Error ? err.message : '转发消息失败';
        set((state) => {
          state.error = message;
        });
        return [];
      }
    },

    batchMarkAsDelivered: async (messageIds: string[]): Promise<void> => {
      if (messageIds.length === 0) return;
      try {
        await api.post('/api/im/messages/batch-delivered', { messageIds });
      } catch {
        // 静默处理
      }
    },

    searchMessages: async (params: SearchMessagesParams): Promise<SearchMessagesResult> => {
      set((state) => {
        state.isSearching = true;
        state.error = null;
      });

      try {
        const response = await api.post<SearchMessagesResult>('/api/im/messages/search', params);
        const result = response as unknown as SearchMessagesResult;

        set((state) => {
          if (params.offset === 0 || params.offset === undefined) {
            state.searchResults = result.messages;
          } else {
            state.searchResults = [...state.searchResults, ...result.messages];
          }
          state.searchHasMore = result.hasMore;
          state.isSearching = false;
        });

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '搜索消息失败';
        set((state) => {
          state.isSearching = false;
          state.error = message;
        });
        return { messages: [], total: 0, hasMore: false };
      }
    },

    addMessage: (conversationId: string, message: Message): void => {
      set((state) => {
        const messages = state.messagesByConversation[conversationId] || [];
        // 检查是否已存在
        if (!messages.some((m) => m.id === message.id)) {
          state.messagesByConversation[conversationId] = [message, ...messages];
        }
      });
    },

    updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>): void => {
      set((state) => {
        const messages = state.messagesByConversation[conversationId] || [];
        const index = messages.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          Object.assign(messages[index], updates);
        }
      });
    },

    setupWsListeners: (): (() => void) => {
      // 初始化音频服务
      soundService.init();

      const handleNewMessage = (payload: WsMessageNewPayload) => {
        console.log('[messageStore] WS message:new received:', {
          payload,
          conversationId: payload?.conversationId,
          messageId: payload?.message?.id
        });

        try {
          const { conversationId, message } = payload;
          if (!conversationId || !message) {
            console.error('[messageStore] Invalid message:new payload:', payload);
            return;
          }

          get().addMessage(conversationId, message);
          useConversationStore.getState().updateLastMessage(conversationId, message);
          useConversationStore.getState().incrementUnread(conversationId);
          
          // 播放消息提示音
          soundService.playMessageSound();
          
          // 标记送达
          get().markAsDelivered(message.id);
        } catch (err) {
          console.error('[messageStore] handleNewMessage error:', err);
        }
      };

      const handleRecalled = (payload: WsMessageRecalledPayload) => {
        console.log('[messageStore] WS message:recalled received:', payload);
        try {
          get().updateMessage(payload.conversationId, payload.messageId, {
            isRecalled: true,
            recalledAt: new Date(payload.recalledAt).toISOString(),
          });
        } catch (err) {
          console.error('[messageStore] handleRecalled error:', err);
        }
      };

      const handleRead = (payload: WsMessageReadPayload) => {
        console.log('[messageStore] WS message:read received:', payload);
        try {
          set((state) => {
            const messages = state.messagesByConversation[payload.conversationId] || [];
            messages.forEach((m) => {
              if (m.senderId !== payload.userId && !m.readAt) {
                m.readAt = new Date(payload.readAt).toISOString();
                m.status = 'read';
              }
            });
          });
        } catch (err) {
          console.error('[messageStore] handleRead error:', err);
        }
      };

      const handleDelivered = (payload: WsMessageDeliveredPayload) => {
        console.log('[messageStore] WS message:delivered received:', payload);
        try {
          get().updateMessage(payload.conversationId, payload.messageId, {
            deliveredAt: new Date(payload.deliveredAt).toISOString(),
            status: 'delivered',
          });
        } catch (err) {
          console.error('[messageStore] handleDelivered error:', err);
        }
      };

      console.log('[messageStore] Setting up WebSocket listeners');
      const unsubNew = wsManager.on<WsMessageNewPayload>('message:new', handleNewMessage);
      const unsubRecalled = wsManager.on<WsMessageRecalledPayload>('message:recalled', handleRecalled);
      const unsubRead = wsManager.on<WsMessageReadPayload>('message:read', handleRead);
      const unsubDelivered = wsManager.on<WsMessageDeliveredPayload>('message:delivered', handleDelivered);

      return () => {
        console.log('[messageStore] Cleaning up WebSocket listeners');
        unsubNew();
        unsubRecalled();
        unsubRead();
        unsubDelivered();
      };
    },

    clearError: (): void => {
      set((state) => {
        state.error = null;
      });
    },

    clearMessages: (conversationId: string): void => {
      set((state) => {
        delete state.messagesByConversation[conversationId];
        delete state.hasMore[conversationId];
      });
    },

    clearSearchResults: (): void => {
      set((state) => {
        state.searchResults = [];
        state.searchHasMore = false;
      });
    },

    getMessagesByConversation: (conversationId: string): Message[] => {
      const messages = get().messagesByConversation[conversationId] || [];
      console.log('[messageStore] getMessagesByConversation:', {
        conversationId,
        count: messages.length,
        messageIds: messages.map(m => m.id).slice(0, 5)
      });
      return messages;
    },
  }))
);

// 选择器
export const selectMessages = (conversationId: string) => (state: MessageState) =>
  state.messagesByConversation[conversationId] || [];
export const selectHasMore = (conversationId: string) => (state: MessageState) =>
  state.hasMore[conversationId] ?? true;
export const selectIsSending = (state: MessageState) => state.isSending;

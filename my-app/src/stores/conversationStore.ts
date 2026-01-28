import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import { wsManager } from '@/services/websocket';
import type { Conversation, Message, WsTypingStartPayload, WsTypingStopPayload } from '@/types';

interface ConversationState {
  // 状态
  conversations: Conversation[];
  currentConversation: Conversation | null;
  typingUsers: Map<string, string[]>; // conversationId -> userIds
  isLoading: boolean;
  error: string | null;

  // 计算属性
  totalUnread: number;

  // 操作
  fetchConversations: () => Promise<void>;
  fetchConversation: (conversationId: string) => Promise<Conversation | null>;
  createPrivateChat: (targetUserId: string) => Promise<Conversation | null>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearUnread: (conversationId: string) => Promise<void>;
  sendTyping: (conversationId: string, isTyping: boolean) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  
  // 内部更新
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  updateLastMessage: (conversationId: string, message: Message) => void;
  incrementUnread: (conversationId: string) => void;
  
  // WebSocket
  setupWsListeners: () => () => void;
  clearError: () => void;
}

const initialState = {
  conversations: [],
  currentConversation: null,
  typingUsers: new Map(),
  isLoading: false,
  error: null,
  totalUnread: 0,
};

export const useConversationStore = create<ConversationState>()(
  immer((set, get) => ({
    ...initialState,

    fetchConversations: async (): Promise<void> => {
      console.log('[conversationStore] fetchConversations start');
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<Conversation[]>('/api/im/conversations');
        const conversations = response as unknown as Conversation[];

        console.log('[conversationStore] fetchConversations response:', {
          count: conversations?.length,
          isArray: Array.isArray(conversations),
          firstItem: conversations?.[0] ? Object.keys(conversations[0]) : null
        });

        if (!Array.isArray(conversations)) {
          throw new Error(`Expected array of conversations, got: ${typeof conversations}`);
        }

        // 去重：私聊按 targetUserId 去重，群聊按 groupId 去重
        const seen = new Set<string>();
        const uniqueConversations = conversations.filter((conv) => {
          const key = conv.type === 'private' 
            ? `private:${conv.targetUserId}` 
            : `group:${conv.groupId}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });

        const totalUnread = uniqueConversations.reduce((sum, c) => sum + c.unreadCount, 0);

        set((state) => {
          state.conversations = uniqueConversations;
          state.totalUnread = totalUnread;
          state.isLoading = false;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取会话列表失败';
        console.error('[conversationStore] fetchConversations error:', {
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

    fetchConversation: async (conversationId: string): Promise<Conversation | null> => {
      try {
        const response = await api.get<Conversation>(`/api/im/conversations/${conversationId}`);
        const conversation = response as unknown as Conversation;

        set((state) => {
          const index = state.conversations.findIndex((c) => c.id === conversationId);
          if (index !== -1) {
            state.conversations[index] = conversation;
          } else {
            state.conversations.unshift(conversation);
          }
        });

        return conversation;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取会话详情失败';
        set((state) => {
          state.error = message;
        });
        return null;
      }
    },

    createPrivateChat: async (targetUserId: string): Promise<Conversation | null> => {
      try {
        const response = await api.post<Conversation>('/api/im/conversations/private', {
          targetUserId,
        });
        const conversation = response as unknown as Conversation;

        set((state) => {
          const exists = state.conversations.some((c) => c.id === conversation.id);
          if (!exists) {
            state.conversations.unshift(conversation);
          }
        });

        return conversation;
      } catch (err) {
        const message = err instanceof Error ? err.message : '创建会话失败';
        set((state) => {
          state.error = message;
        });
        return null;
      }
    },

    deleteConversation: async (conversationId: string): Promise<void> => {
      try {
        await api.delete(`/api/im/conversations/${conversationId}`);

        set((state) => {
          const conversation = state.conversations.find((c) => c.id === conversationId);
          if (conversation) {
            state.totalUnread -= conversation.unreadCount;
          }
          state.conversations = state.conversations.filter((c) => c.id !== conversationId);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除会话失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    clearUnread: async (conversationId: string): Promise<void> => {
      try {
        await api.post(`/api/im/conversations/${conversationId}/clear-unread`);

        set((state) => {
          const conversation = state.conversations.find((c) => c.id === conversationId);
          if (conversation) {
            state.totalUnread -= conversation.unreadCount;
            conversation.unreadCount = 0;
          }
        });
      } catch {
        // 静默处理
      }
    },

    sendTyping: async (conversationId: string, isTyping: boolean): Promise<void> => {
      try {
        await api.post(`/api/im/conversations/${conversationId}/typing`, { isTyping });
      } catch {
        // 静默处理
      }
    },

    setCurrentConversation: (conversation: Conversation | null): void => {
      set((state) => {
        state.currentConversation = conversation;
      });
    },

    updateConversation: (conversationId: string, updates: Partial<Conversation>): void => {
      set((state) => {
        const index = state.conversations.findIndex((c) => c.id === conversationId);
        if (index !== -1) {
          Object.assign(state.conversations[index], updates);
        }
      });
    },

    updateLastMessage: (conversationId: string, message: Message): void => {
      set((state) => {
        const index = state.conversations.findIndex((c) => c.id === conversationId);
        if (index !== -1) {
          state.conversations[index].lastMessage = message;
          state.conversations[index].lastMessageId = message.id;
          state.conversations[index].lastMessageAt = message.createdAt;
          
          // 移动到顶部
          const [conversation] = state.conversations.splice(index, 1);
          state.conversations.unshift(conversation);
        }
      });
    },

    incrementUnread: (conversationId: string): void => {
      set((state) => {
        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (conversation && state.currentConversation?.id !== conversationId) {
          conversation.unreadCount += 1;
          state.totalUnread += 1;
        }
      });
    },

    setupWsListeners: (): (() => void) => {
      console.log('[conversationStore] Setting up WebSocket listeners');

      const handleTypingStart = (payload: WsTypingStartPayload) => {
        console.log('[conversationStore] WS typing:start received:', payload);
        try {
          set((state) => {
            const users = state.typingUsers.get(payload.conversationId) || [];
            if (!users.includes(payload.userId)) {
              state.typingUsers.set(payload.conversationId, [...users, payload.userId]);
            }
          });

          // 5秒后自动移除
          setTimeout(() => {
            set((state) => {
              const users = state.typingUsers.get(payload.conversationId) || [];
              state.typingUsers.set(
                payload.conversationId,
                users.filter((id) => id !== payload.userId)
              );
            });
          }, 5000);
        } catch (err) {
          console.error('[conversationStore] handleTypingStart error:', err);
        }
      };

      const handleTypingStop = (payload: WsTypingStopPayload) => {
        console.log('[conversationStore] WS typing:stop received:', payload);
        try {
          set((state) => {
            const users = state.typingUsers.get(payload.conversationId) || [];
            state.typingUsers.set(
              payload.conversationId,
              users.filter((id) => id !== payload.userId)
            );
          });
        } catch (err) {
          console.error('[conversationStore] handleTypingStop error:', err);
        }
      };

      const unsubStart = wsManager.on<WsTypingStartPayload>('typing:start', handleTypingStart);
      const unsubStop = wsManager.on<WsTypingStopPayload>('typing:stop', handleTypingStop);

      return () => {
        console.log('[conversationStore] Cleaning up WebSocket listeners');
        unsubStart();
        unsubStop();
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
export const selectConversations = (state: ConversationState) => state.conversations;
export const selectCurrentConversation = (state: ConversationState) => state.currentConversation;
export const selectTotalUnread = (state: ConversationState) => state.totalUnread;
export const selectTypingUsers = (conversationId: string) => (state: ConversationState) => 
  state.typingUsers.get(conversationId) || [];

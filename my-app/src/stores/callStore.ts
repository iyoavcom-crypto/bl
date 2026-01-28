import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import { wsManager } from '@/services/websocket';
import type {
  Call,
  CallStatus,
  SignalType,
  SignalData,
  WsCallInvitePayload,
  WsCallRingPayload,
  WsCallAnswerPayload,
  WsCallRejectPayload,
  WsCallSignalPayload,
  WsCallEndPayload,
} from '@/types';

interface PaginatedCalls {
  items: Call[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CallState {
  // 状态
  callHistory: Call[];
  currentCall: Call | null;
  incomingCall: Call | null;
  isLoading: boolean;
  error: string | null;

  // 分页
  total: number;
  page: number;
  hasMore: boolean;

  // 通话记录
  fetchCallHistory: (page?: number, limit?: number) => Promise<void>;
  fetchCall: (callId: string) => Promise<Call | null>;

  // 通话操作
  initiateCall: (calleeId: string) => Promise<Call | null>;
  ring: (callId: string) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => Promise<void>;
  hangupCall: (callId: string) => Promise<void>;
  sendSignal: (callId: string, signalType: SignalType, signalData: SignalData) => Promise<void>;

  // 本地状态
  setCurrentCall: (call: Call | null) => void;
  clearIncomingCall: () => void;

  // 信令回调（供WebRTC使用）
  onSignalReceived: ((payload: WsCallSignalPayload) => void) | null;
  setSignalCallback: (callback: ((payload: WsCallSignalPayload) => void) | null) => void;

  // WebSocket
  setupWsListeners: () => () => void;
  clearError: () => void;
}

const initialState = {
  callHistory: [],
  currentCall: null,
  incomingCall: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  hasMore: true,
  onSignalReceived: null,
};

export const useCallStore = create<CallState>()(
  immer((set, get) => ({
    ...initialState,

    // ============================================================
    // 通话记录
    // ============================================================

    fetchCallHistory: async (page = 1, limit = 20): Promise<void> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<PaginatedCalls>('/api/im/calls', {
          params: { page, limit },
        });
        const data = response as unknown as PaginatedCalls;

        set((state) => {
          if (page === 1) {
            state.callHistory = data.items;
          } else {
            // 去重追加
            const existingIds = new Set(state.callHistory.map((c) => c.id));
            const newItems = data.items.filter((c) => !existingIds.has(c.id));
            state.callHistory.push(...newItems);
          }
          state.total = data.total;
          state.page = data.page;
          state.hasMore = data.page < data.totalPages;
          state.isLoading = false;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取通话记录失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
      }
    },

    fetchCall: async (callId: string): Promise<Call | null> => {
      try {
        const response = await api.get<Call>(`/api/im/calls/${callId}`);
        return response as unknown as Call;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取通话详情失败';
        set((state) => {
          state.error = message;
        });
        return null;
      }
    },

    // ============================================================
    // 通话操作
    // ============================================================

    initiateCall: async (calleeId: string): Promise<Call | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.post<Call>('/api/im/calls/initiate', { calleeId });
        const call = response as unknown as Call;

        set((state) => {
          state.currentCall = call;
          state.isLoading = false;
        });

        return call;
      } catch (err) {
        const message = err instanceof Error ? err.message : '发起通话失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    ring: async (callId: string): Promise<void> => {
      try {
        const response = await api.post<Call>(`/api/im/calls/${callId}/ring`);
        const call = response as unknown as Call;

        set((state) => {
          if (state.currentCall?.id === callId) {
            state.currentCall = call;
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '响铃失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    acceptCall: async (callId: string): Promise<void> => {
      try {
        const response = await api.post<Call>(`/api/im/calls/${callId}/accept`);
        const call = response as unknown as Call;

        set((state) => {
          state.currentCall = call;
          state.incomingCall = null;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '接听失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    rejectCall: async (callId: string): Promise<void> => {
      try {
        const response = await api.post<Call>(`/api/im/calls/${callId}/reject`);
        const call = response as unknown as Call;

        set((state) => {
          state.incomingCall = null;
          // 添加到通话记录
          state.callHistory.unshift(call);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '拒接失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    hangupCall: async (callId: string): Promise<void> => {
      try {
        const response = await api.post<Call>(`/api/im/calls/${callId}/hangup`);
        const call = response as unknown as Call;

        set((state) => {
          state.currentCall = null;
          // 更新通话记录
          const index = state.callHistory.findIndex((c) => c.id === callId);
          if (index !== -1) {
            state.callHistory[index] = call;
          } else {
            state.callHistory.unshift(call);
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '挂断失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    sendSignal: async (callId: string, signalType: SignalType, signalData: SignalData): Promise<void> => {
      try {
        await api.post(`/api/im/calls/${callId}/signal`, { signalType, signalData });
      } catch (err) {
        const message = err instanceof Error ? err.message : '发送信令失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    // ============================================================
    // 本地状态
    // ============================================================

    setCurrentCall: (call: Call | null): void => {
      set((state) => {
        state.currentCall = call;
      });
    },

    clearIncomingCall: (): void => {
      set((state) => {
        state.incomingCall = null;
      });
    },

    setSignalCallback: (callback): void => {
      set((state) => {
        state.onSignalReceived = callback;
      });
    },

    // ============================================================
    // WebSocket 监听
    // ============================================================

    setupWsListeners: (): (() => void) => {
      // 收到通话邀请
      const handleInvite = (payload: WsCallInvitePayload) => {
        const incomingCall: Call = {
          id: payload.callId,
          conversationId: payload.conversationId,
          callerId: payload.callerId,
          calleeId: payload.calleeId,
          status: 'initiated',
          startedAt: null,
          endedAt: null,
          duration: null,
          endReason: null,
          createdAt: new Date(payload.createdAt).toISOString(),
        };

        set((state) => {
          state.incomingCall = incomingCall;
        });

        // 自动响铃
        get().ring(payload.callId);
      };

      // 对方响铃
      const handleRing = (payload: WsCallRingPayload) => {
        set((state) => {
          if (state.currentCall?.id === payload.callId) {
            state.currentCall.status = 'ringing';
          }
        });
      };

      // 对方接听
      const handleAnswer = (payload: WsCallAnswerPayload) => {
        set((state) => {
          if (state.currentCall?.id === payload.callId) {
            state.currentCall.status = 'connected';
            state.currentCall.startedAt = new Date(payload.startedAt).toISOString();
          }
        });
      };

      // 对方拒接
      const handleReject = (payload: WsCallRejectPayload) => {
        set((state) => {
          if (state.currentCall?.id === payload.callId) {
            state.currentCall.status = 'rejected';
            state.currentCall.endedAt = new Date().toISOString();
            // 添加到通话记录
            state.callHistory.unshift({ ...state.currentCall });
            state.currentCall = null;
          }
        });
      };

      // 通话结束
      const handleEnd = (payload: WsCallEndPayload) => {
        set((state) => {
          const endedCall: Partial<Call> = {
            status: payload.status,
            endReason: payload.endReason,
            duration: payload.duration,
            endedAt: new Date(payload.endedAt).toISOString(),
          };

          if (state.currentCall?.id === payload.callId) {
            Object.assign(state.currentCall, endedCall);
            // 添加到通话记录
            state.callHistory.unshift({ ...state.currentCall });
            state.currentCall = null;
          }

          if (state.incomingCall?.id === payload.callId) {
            state.incomingCall = null;
          }

          // 更新通话记录中的状态
          const historyIndex = state.callHistory.findIndex((c) => c.id === payload.callId);
          if (historyIndex !== -1) {
            Object.assign(state.callHistory[historyIndex], endedCall);
          }
        });
      };

      // 收到信令
      const handleSignal = (payload: WsCallSignalPayload) => {
        const callback = get().onSignalReceived;
        if (callback) {
          callback(payload);
        }

        if (__DEV__) {
          console.log('[CallStore] 收到信令:', payload.signalType);
        }
      };

      // 注册监听器
      const unsubInvite = wsManager.on<WsCallInvitePayload>('call:invite', handleInvite);
      const unsubRing = wsManager.on<WsCallRingPayload>('call:ring', handleRing);
      const unsubAnswer = wsManager.on<WsCallAnswerPayload>('call:answer', handleAnswer);
      const unsubReject = wsManager.on<WsCallRejectPayload>('call:reject', handleReject);
      const unsubEnd = wsManager.on<WsCallEndPayload>('call:end', handleEnd);
      const unsubSignal = wsManager.on<WsCallSignalPayload>('call:signal', handleSignal);

      return () => {
        unsubInvite();
        unsubRing();
        unsubAnswer();
        unsubReject();
        unsubEnd();
        unsubSignal();
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
export const selectCallHistory = (state: CallState) => state.callHistory;
export const selectCurrentCall = (state: CallState) => state.currentCall;
export const selectIncomingCall = (state: CallState) => state.incomingCall;
export const selectHasIncomingCall = (state: CallState) => state.incomingCall !== null;
export const selectIsInCall = (state: CallState) => state.currentCall !== null;
export const selectCallStatus = (state: CallState) => state.currentCall?.status;

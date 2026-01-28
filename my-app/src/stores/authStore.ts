import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/config';
import { STORAGE_KEYS } from '@/config/constants';
import { wsManager } from '@/services/websocket';
import type { User, AuthResponse, AuthPayload, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  // 状态
  user: User | null;
  payload: AuthPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // 操作
  login: (params: LoginRequest) => Promise<boolean>;
  register: (params: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

const initialState = {
  user: null,
  payload: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    ...initialState,

    login: async (params: LoginRequest): Promise<boolean> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // 响应拦截器已解包data字段，直接获取AuthResponse
        const data = await api.post<AuthResponse>('/api/auth/login', params) as unknown as AuthResponse;
        
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('登录响应解析:', JSON.stringify(data, null, 2));
        }
        
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, String(data.access));
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, String(data.refresh));
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, String(data.user.id));
                
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('[Token存储] ACCESS_TOKEN 已保存:', String(data.access).substring(0, 20) + '...');
          // eslint-disable-next-line no-console
          console.log('[Token存储] REFRESH_TOKEN 已保存:', String(data.refresh).substring(0, 20) + '...');
          // eslint-disable-next-line no-console
          console.log('[Token存储] USER_ID 已保存:', String(data.user.id));
        }

        set((state) => {
          state.user = data.user;
          state.payload = data.payload;
          state.isAuthenticated = true;
          state.isLoading = false;
        });

        // 登录成功后连接 WebSocket
        wsManager.connect();

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '登录失败';
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error('登录错误:', err);
        }
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return false;
      }
    },

    register: async (params: RegisterRequest): Promise<boolean> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
    
      try {
        // 响应拦截器已解包data字段，直接获取AuthResponse
        const data = await api.post<AuthResponse>('/api/auth/register', params) as unknown as AuthResponse;
            
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('注册响应解析:', JSON.stringify(data, null, 2));
        }
    
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, String(data.access));
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, String(data.refresh));
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, String(data.user.id));
    
        set((state) => {
          state.user = data.user;
          state.payload = data.payload;
          state.isAuthenticated = true;
          state.isLoading = false;
        });
    
        // 注册成功后连接 WebSocket
        wsManager.connect();

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '注册失败';
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error('注册错误:', err);
        }
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return false;
      }
    },

    logout: async (): Promise<void> => {
      // 断开 WebSocket 连接
      wsManager.disconnect();

      try {
        await api.post('/api/auth/logout');
      } catch {
        // 忽略登出API错误
      }

      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);

      set((state) => {
        state.user = null;
        state.payload = null;
        state.isAuthenticated = false;
      });
    },

    fetchMe: async (): Promise<void> => {
      try {
        const response = await api.get<User>('/api/auth/me');
        const user = response as unknown as User;

        set((state) => {
          state.user = user;
        });
      } catch {
        // Token 无效，清除认证状态
        await get().logout();
      }
    },

    initialize: async (): Promise<void> => {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

      if (token) {
        try {
          await get().fetchMe();
          set((state) => {
            state.isAuthenticated = true;
          });
          // 初始化时如果已认证，连接 WebSocket
          wsManager.connect();
        } catch {
          // Token 无效，清除登录状态
          await get().logout();
        }
      }

      set((state) => {
        state.isInitialized = true;
      });
    },

    clearError: (): void => {
      set((state) => {
        state.error = null;
      });
    },

    setUser: (user: User): void => {
      set((state) => {
        state.user = user;
      });
    },
  }))
);

// 选择器
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;

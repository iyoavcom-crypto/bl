import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/config';
import type { User, UserPublic, UserSearchResult, UserLocation, Gender } from '@/types';

interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  gender?: Gender;
  location?: UserLocation;
  searchable?: boolean;
}

interface UserState {
  // 状态
  profile: User | null;
  searchResults: UserSearchResult[];
  isLoading: boolean;
  error: string | null;

  // 操作
  fetchProfile: () => Promise<User | null>;
  updateProfile: (updates: UpdateProfileRequest) => Promise<User | null>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  changePin: (password: string, newPin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  searchUsers: (params: { keyword: string; limit?: number }) => Promise<UserSearchResult[]>;
  getUserPublic: (userId: string) => Promise<UserPublic | null>;

  // 辅助
  clearSearchResults: () => void;
  clearError: () => void;
}

const initialState = {
  profile: null,
  searchResults: [],
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  immer((set) => ({
    ...initialState,

    fetchProfile: async (): Promise<User | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<User>('/api/im/users/profile');
        const profile = response as unknown as User;

        set((state) => {
          state.profile = profile;
          state.isLoading = false;
        });

        return profile;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取个人资料失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    updateProfile: async (updates: UpdateProfileRequest): Promise<User | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.put<User>('/api/im/users/profile', updates);
        const profile = response as unknown as User;

        set((state) => {
          state.profile = profile;
          state.isLoading = false;
        });

        return profile;
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新资料失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    changePassword: async (oldPassword: string, newPassword: string): Promise<boolean> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await api.post('/api/im/users/change-password', { oldPassword, newPassword });

        set((state) => {
          state.isLoading = false;
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '修改密码失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return false;
      }
    },

    changePin: async (password: string, newPin: string): Promise<boolean> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await api.post('/api/im/users/change-pin', { password, newPin });

        set((state) => {
          state.isLoading = false;
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '修改二级密码失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return false;
      }
    },

    verifyPin: async (pin: string): Promise<boolean> => {
      try {
        const response = await api.post<{ valid: boolean }>('/api/im/users/verify-pin', { pin });
        const data = response as unknown as { valid: boolean };
        return data.valid;
      } catch {
        return false;
      }
    },

    searchUsers: async (params: { keyword: string; limit?: number }): Promise<UserSearchResult[]> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<UserSearchResult[]>('/api/im/users/search', {
          params: { keyword: params.keyword, limit: params.limit || 20 },
        });
        const users = response as unknown as UserSearchResult[];

        set((state) => {
          state.searchResults = users;
          state.isLoading = false;
        });

        return users;
      } catch (err) {
        const message = err instanceof Error ? err.message : '搜索用户失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return [];
      }
    },

    getUserPublic: async (userId: string): Promise<UserPublic | null> => {
      try {
        const response = await api.get<UserPublic>(`/api/im/users/${userId}`);
        return response as unknown as UserPublic;
      } catch {
        return null;
      }
    },

    clearSearchResults: (): void => {
      set((state) => {
        state.searchResults = [];
      });
    },

    clearError: (): void => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);

// 选择器
export const selectProfile = (state: UserState) => state.profile;
export const selectSearchResults = (state: UserState) => state.searchResults;

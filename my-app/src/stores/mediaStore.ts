import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Platform } from 'react-native';
import { api } from '@/config';
import type { MediaUploadResult, MediaLimits, MediaFile, MediaType } from '@/types';

interface MediaState {
  // 状态
  limits: MediaLimits | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  // 操作
  fetchLimits: () => Promise<MediaLimits | null>;
  uploadFile: (file: MediaFile) => Promise<MediaUploadResult | null>;
  uploadMultiple: (files: MediaFile[]) => Promise<MediaUploadResult[]>;
  deleteFile: (type: MediaType, filename: string) => Promise<boolean>;

  // 辅助
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
}

const initialState = {
  limits: null,
  isUploading: false,
  uploadProgress: 0,
  error: null,
};

export const useMediaStore = create<MediaState>()(
  immer((set, get) => ({
    ...initialState,

    fetchLimits: async (): Promise<MediaLimits | null> => {
      try {
        const response = await api.get<MediaLimits>('/api/im/media/limits');
        const limits = response as unknown as MediaLimits;

        set((state) => {
          state.limits = limits;
        });

        return limits;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取上传限制失败';
        set((state) => {
          state.error = message;
        });
        return null;
      }
    },

    uploadFile: async (file: MediaFile): Promise<MediaUploadResult | null> => {
      set((state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      });

      try {
        const formData = new FormData();
        
        // 构建文件对象
        const fileBlob = {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name,
          type: file.type,
        } as unknown as Blob;

        formData.append('file', fileBlob);

        const response = await api.post<MediaUploadResult>(
          '/api/im/media/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const result = response as unknown as MediaUploadResult;

        set((state) => {
          state.isUploading = false;
          state.uploadProgress = 100;
        });

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : '上传文件失败';
        set((state) => {
          state.isUploading = false;
          state.uploadProgress = 0;
          state.error = message;
        });
        return null;
      }
    },

    uploadMultiple: async (files: MediaFile[]): Promise<MediaUploadResult[]> => {
      const { limits } = get();
      
      // 检查文件数量限制
      if (limits && files.length > limits.maxFiles) {
        set((state) => {
          state.error = `最多只能上传 ${limits.maxFiles} 个文件`;
        });
        return [];
      }

      set((state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      });

      try {
        const formData = new FormData();

        files.forEach((file) => {
          const fileBlob = {
            uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
            name: file.name,
            type: file.type,
          } as unknown as Blob;

          formData.append('files', fileBlob);
        });

        const response = await api.post<MediaUploadResult[]>(
          '/api/im/media/upload/multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const results = response as unknown as MediaUploadResult[];

        set((state) => {
          state.isUploading = false;
          state.uploadProgress = 100;
        });

        return results;
      } catch (err) {
        const message = err instanceof Error ? err.message : '批量上传失败';
        set((state) => {
          state.isUploading = false;
          state.uploadProgress = 0;
          state.error = message;
        });
        return [];
      }
    },

    deleteFile: async (type: MediaType, filename: string): Promise<boolean> => {
      try {
        await api.delete(`/api/im/media/${type}/${filename}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除文件失败';
        set((state) => {
          state.error = message;
        });
        return false;
      }
    },

    clearError: (): void => {
      set((state) => {
        state.error = null;
      });
    },

    setUploadProgress: (progress: number): void => {
      set((state) => {
        state.uploadProgress = progress;
      });
    },
  }))
);

// 选择器
export const selectMediaLimits = (state: MediaState) => state.limits;
export const selectIsUploading = (state: MediaState) => state.isUploading;
export const selectUploadProgress = (state: MediaState) => state.uploadProgress;

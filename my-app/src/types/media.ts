/**
 * 媒体类型定义
 * MCP协议依据:
 * - POST /api/im/media/upload
 * - POST /api/im/media/upload/multiple
 * - DELETE /api/im/media/:type/:filename
 * - GET /api/im/media/limits
 */

// 媒体类型
export type MediaType = 'image' | 'audio' | 'video' | 'file';

// 上传结果
export interface MediaUploadResult {
  type: MediaType;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

// 上传限制
export interface MediaLimits {
  allowedTypes: string[];
  sizeLimits: {
    image: number;
    audio: number;
    video: number;
    file: number;
  };
  maxFiles: number;
}

// 文件选择结果 (用于 ImagePicker 等组件)
export interface MediaFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number; // 音视频时长 (秒)
}

// 媒体预览数据
export interface MediaPreviewData {
  url: string;
  type: MediaType;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

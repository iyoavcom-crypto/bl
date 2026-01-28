/**
 * @packageDocumentation
 * @module services/im/media
 * @since 1.0.0
 * @author Z-kali
 * @description IM 媒体文件服务：文件上传、存储、删除等业务逻辑
 * @path src/services/im/media.ts
 */

import { randomUUID } from "node:crypto";
import { mkdir, unlink, stat, access, constants } from "node:fs/promises";
import { join, extname } from "node:path";
import { env } from "@/config/index.js";

/** 支持的图片类型 */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/** 支持的音频类型 */
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/m4a", "audio/aac"];

/** 支持的视频类型 */
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/** 支持的文件类型 */
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
];

/** 所有允许的 MIME 类型 */
const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_FILE_TYPES,
];

/** 文件大小限制（字节） */
const FILE_SIZE_LIMITS: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 20 * 1024 * 1024, // 20MB
  video: 100 * 1024 * 1024, // 100MB
  file: 50 * 1024 * 1024, // 50MB
};

/** 媒体类型枚举 */
export const MediaType = {
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  FILE: "file",
} as const;

export type MediaTypeValue = typeof MediaType[keyof typeof MediaType];

/**
 * @interface UploadedMedia
 * @description 上传文件结果
 */
export interface UploadedMedia {
  id: string;
  type: MediaTypeValue;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

/**
 * @interface MediaValidationResult
 * @description 媒体验证结果
 */
export interface MediaValidationResult {
  valid: boolean;
  error?: string;
  mediaType?: MediaTypeValue;
}

/**
 * @class IMMediaService
 * @description IM 媒体文件业务服务
 */
class IMMediaService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = join(process.cwd(), "uploads");
    this.baseUrl = `http://localhost:${env.PORT}/uploads`;
  }

  /**
   * 初始化上传目录
   */
  async init(): Promise<void> {
    const subDirs = ["images", "audios", "videos", "files"];
    for (const dir of subDirs) {
      await mkdir(join(this.uploadDir, dir), { recursive: true });
    }
  }

  /**
   * 验证文件
   * @param mimeType MIME 类型
   * @param size 文件大小
   */
  validateFile(mimeType: string, size: number): MediaValidationResult {
    // 检查 MIME 类型是否支持
    if (!ALL_ALLOWED_TYPES.includes(mimeType)) {
      return { valid: false, error: `不支持的文件类型: ${mimeType}` };
    }

    // 确定媒体类型
    let mediaType: MediaTypeValue;
    let sizeLimit: number;

    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      mediaType = MediaType.IMAGE;
      sizeLimit = FILE_SIZE_LIMITS.image;
    } else if (ALLOWED_AUDIO_TYPES.includes(mimeType)) {
      mediaType = MediaType.AUDIO;
      sizeLimit = FILE_SIZE_LIMITS.audio;
    } else if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      mediaType = MediaType.VIDEO;
      sizeLimit = FILE_SIZE_LIMITS.video;
    } else {
      mediaType = MediaType.FILE;
      sizeLimit = FILE_SIZE_LIMITS.file;
    }

    // 检查文件大小
    if (size > sizeLimit) {
      const limitMB = Math.round(sizeLimit / 1024 / 1024);
      return { valid: false, error: `文件大小超过限制 (最大 ${limitMB}MB)` };
    }

    return { valid: true, mediaType };
  }

  /**
   * 获取媒体类型对应的子目录
   */
  private getSubDir(mediaType: MediaTypeValue): string {
    switch (mediaType) {
      case MediaType.IMAGE:
        return "images";
      case MediaType.AUDIO:
        return "audios";
      case MediaType.VIDEO:
        return "videos";
      default:
        return "files";
    }
  }

  /**
   * 生成文件名
   * @param originalName 原始文件名
   */
  private generateFilename(originalName: string): string {
    const ext = extname(originalName).toLowerCase();
    const uuid = randomUUID();
    const timestamp = Date.now();
    return `${timestamp}-${uuid}${ext}`;
  }

  /**
   * 保存文件（由 multer 回调使用）
   * @param userId 用户 ID
   * @param file multer 文件对象
   */
  async saveFile(
    userId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
      filename: string;
    }
  ): Promise<UploadedMedia> {
    const validation = this.validateFile(file.mimetype, file.size);
    if (!validation.valid || !validation.mediaType) {
      // 删除临时文件
      try {
        await unlink(file.path);
      } catch {
        // 忽略删除失败
      }
      const error = new Error(validation.error || "文件验证失败") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const mediaType = validation.mediaType;
    const subDir = this.getSubDir(mediaType);
    const url = `${this.baseUrl}/${subDir}/${file.filename}`;

    return {
      id: randomUUID(),
      type: mediaType,
      url,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };
  }

  /**
   * 删除文件
   * @param mediaType 媒体类型
   * @param filename 文件名
   */
  async deleteFile(mediaType: MediaTypeValue, filename: string): Promise<boolean> {
    const subDir = this.getSubDir(mediaType);
    const filePath = join(this.uploadDir, subDir, filename);

    try {
      await access(filePath, constants.F_OK);
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查文件是否存在
   * @param mediaType 媒体类型
   * @param filename 文件名
   */
  async fileExists(mediaType: MediaTypeValue, filename: string): Promise<boolean> {
    const subDir = this.getSubDir(mediaType);
    const filePath = join(this.uploadDir, subDir, filename);

    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件信息
   * @param mediaType 媒体类型
   * @param filename 文件名
   */
  async getFileInfo(
    mediaType: MediaTypeValue,
    filename: string
  ): Promise<{ size: number; mtime: Date } | null> {
    const subDir = this.getSubDir(mediaType);
    const filePath = join(this.uploadDir, subDir, filename);

    try {
      const stats = await stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime,
      };
    } catch {
      return null;
    }
  }

  /**
   * 获取允许的 MIME 类型
   */
  getAllowedMimeTypes(): string[] {
    return ALL_ALLOWED_TYPES;
  }

  /**
   * 获取文件大小限制配置
   */
  getFileSizeLimits(): Record<string, number> {
    return { ...FILE_SIZE_LIMITS };
  }

  /**
   * 获取 multer 配置目标路径
   */
  getUploadDestination(mediaType: MediaTypeValue): string {
    return join(this.uploadDir, this.getSubDir(mediaType));
  }
}

export default new IMMediaService();

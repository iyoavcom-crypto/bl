/**
 * @packageDocumentation
 * @module routes/im/media
 * @since 1.0.0
 * @author Z-kali
 * @description IM 媒体文件路由：上传、删除等 API
 * @path src/routes/im/media.ts
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import multer, { type FileFilterCallback, type StorageEngine } from "multer";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { requireAuth } from "@/middleware/auth/index.js";
import IMMediaService, { MediaType, type MediaTypeValue } from "@/services/im/media.js";

const router = Router();

/** 上传目录基路径 */
const UPLOAD_BASE_DIR = join(process.cwd(), "uploads");

/**
 * 确保上传目录存在
 */
async function ensureUploadDirs(): Promise<void> {
  const dirs = ["images", "audios", "videos", "files"];
  for (const dir of dirs) {
    await mkdir(join(UPLOAD_BASE_DIR, dir), { recursive: true });
  }
}

// 初始化上传目录
ensureUploadDirs().catch(console.error);

/**
 * 根据 MIME 类型获取目标子目录
 */
function getSubDirByMime(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "images";
  if (mimeType.startsWith("audio/")) return "audios";
  if (mimeType.startsWith("video/")) return "videos";
  return "files";
}

/**
 * 根据 MIME 类型获取媒体类型
 */
function getMediaTypeByMime(mimeType: string): MediaTypeValue {
  if (mimeType.startsWith("image/")) return MediaType.IMAGE;
  if (mimeType.startsWith("audio/")) return MediaType.AUDIO;
  if (mimeType.startsWith("video/")) return MediaType.VIDEO;
  return MediaType.FILE;
}

/**
 * Multer 磁盘存储配置
 */
const storage: StorageEngine = multer.diskStorage({
  destination: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const subDir = getSubDirByMime(file.mimetype);
    const destPath = join(UPLOAD_BASE_DIR, subDir);
    cb(null, destPath);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = extname(file.originalname).toLowerCase();
    const uuid = randomUUID();
    const timestamp = Date.now();
    cb(null, `${timestamp}-${uuid}${ext}`);
  },
});

/**
 * 文件过滤器
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = IMMediaService.getAllowedMimeTypes();
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  }
};

/**
 * Multer 上传实例
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (最大限制，具体由 service 校验)
    files: 1,
  },
});

/**
 * @route POST /api/im/media/upload
 * @description 上传单个媒体文件
 * @access Private
 */
router.post(
  "/upload",
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "文件大小超过限制" });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "未提供文件" });
        return;
      }

      const userId = req.auth?.sub;
      if (!userId) {
        res.status(401).json({ error: "未授权" });
        return;
      }

      const result = await IMMediaService.saveFile(userId, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        filename: file.filename,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /api/im/media/upload/multiple
 * @description 上传多个媒体文件（最多 9 个）
 * @access Private
 */
router.post(
  "/upload/multiple",
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const multiUpload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 100 * 1024 * 1024,
        files: 9,
      },
    }).array("files", 9);

    multiUpload(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "文件大小超过限制" });
          return;
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          res.status(400).json({ error: "最多上传 9 个文件" });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ error: "未提供文件" });
        return;
      }

      const userId = req.auth?.sub;
      if (!userId) {
        res.status(401).json({ error: "未授权" });
        return;
      }

      const results = [];
      for (const file of files) {
        const result = await IMMediaService.saveFile(userId, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          filename: file.filename,
        });
        results.push(result);
      }

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route DELETE /api/im/media/:type/:filename
 * @description 删除媒体文件
 * @access Private
 */
router.delete(
  "/:type/:filename",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, filename } = req.params;

      // 验证媒体类型
      const validTypes = Object.values(MediaType);
      if (!validTypes.includes(type as MediaTypeValue)) {
        res.status(400).json({ error: "无效的媒体类型" });
        return;
      }

      // 验证文件名（防止路径遍历）
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        res.status(400).json({ error: "无效的文件名" });
        return;
      }

      const deleted = await IMMediaService.deleteFile(type as MediaTypeValue, filename);
      if (!deleted) {
        res.status(404).json({ error: "文件不存在" });
        return;
      }

      res.json({
        success: true,
        message: "文件已删除",
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /api/im/media/limits
 * @description 获取上传限制配置
 * @access Private
 */
router.get(
  "/limits",
  requireAuth,
  (_req: Request, res: Response): void => {
    res.json({
      success: true,
      data: {
        allowedTypes: IMMediaService.getAllowedMimeTypes(),
        sizeLimits: IMMediaService.getFileSizeLimits(),
        maxFiles: 9,
      },
    });
  }
);

export default router;

/**
 * @packageDocumentation
 * @module tools-logging-file-transport
 * @since 1.0.0 (2026-01-09)
 * @author Z-kali
 * @description 文件日志传输层，支持日志轮转、压缩和异步写入
 */

import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createReadStream } from "node:fs";
import type { FileTransportConfig } from "@/middleware/logging/config.js";
import { parseSize } from "@/middleware/logging/config.js";

/**
 * @interface FileTransportOptions
 * @description 文件传输选项
 */
export interface FileTransportOptions extends FileTransportConfig {
  /** 写入缓冲区大小 */
  bufferSize?: number;
  /** 刷新间隔（毫秒） */
  flushInterval?: number;
}

/**
 * @class FileTransport
 * @description 文件日志传输器，负责日志的文件写入、轮转和压缩
 */
export class FileTransport {
  private options: FileTransportOptions;
  private currentStream: ReturnType<typeof createWriteStream> | null = null;
  private currentFile: string | null = null;
  private currentSize = 0;
  private writeBuffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isClosed = false;

  constructor(options: FileTransportOptions) {
    this.options = {
      bufferSize: 100,
      flushInterval: 1000,
      ...options,
    };
    this.ensureDirectory();
  }

  /**
   * @method ensureDirectory
   * @description 确保日志目录存在
   */
  private ensureDirectory(): void {
    const dir = dirname(this.getCurrentFilePath());
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * @method getCurrentFilePath
   * @description 获取当前日志文件路径（支持日期模式）
   */
  private getCurrentFilePath(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return this.options.path.replace('%DATE%', dateStr);
  }

  /**
   * @method shouldRotate
   * @description 判断是否需要轮转日志文件
   */
  private shouldRotate(): boolean {
    const maxSize = parseSize(this.options.maxSize);
    const currentPath = this.getCurrentFilePath();
    
    // 日期变化，需要轮转
    if (this.currentFile && this.currentFile !== currentPath) {
      return true;
    }
    
    // 文件大小超限
    if (this.currentSize >= maxSize) {
      return true;
    }
    
    return false;
  }

  /**
   * @method rotate
   * @description 执行日志轮转
   */
  private async rotate(): Promise<void> {
    // 关闭当前流
    if (this.currentStream) {
      await new Promise<void>((resolve) => {
        this.currentStream!.end(() => resolve());
      });
      this.currentStream = null;
    }

    // 压缩旧文件
    if (this.currentFile && this.options.compress) {
      await this.compressFile(this.currentFile).catch(() => {
        // 压缩失败不影响继续写入
      });
    }

    // 清理过期文件
    await this.cleanupOldFiles();

    // 重置状态
    this.currentFile = null;
    this.currentSize = 0;
  }

  /**
   * @method compressFile
   * @description 压缩日志文件
   */
  private async compressFile(filePath: string): Promise<void> {
    if (!existsSync(filePath)) return;
    
    const gzPath = `${filePath}.gz`;
    const source = createReadStream(filePath);
    const destination = createWriteStream(gzPath);
    const gzip = createGzip();
    
    await pipeline(source, gzip, destination);
    unlinkSync(filePath); // 删除原文件
  }

  /**
   * @method cleanupOldFiles
   * @description 清理过期的日志文件
   */
  private async cleanupOldFiles(): Promise<void> {
    const dir = dirname(this.options.path);
    const prefix = basename(this.options.path).split('%DATE%')[0];
    
    if (!existsSync(dir)) return;
    
    const files = readdirSync(dir)
      .filter((f) => f.startsWith(prefix))
      .map((f) => ({
        name: f,
        path: join(dir, f),
        time: statSync(join(dir, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    // 保留最新的 maxFiles 个文件
    const toDelete = files.slice(this.options.maxFiles);
    for (const file of toDelete) {
      try {
        unlinkSync(file.path);
      } catch {
        // 删除失败忽略
      }
    }
  }

  /**
   * @method getOrCreateStream
   * @description 获取或创建写入流
   */
  private getOrCreateStream(): ReturnType<typeof createWriteStream> {
    const filePath = this.getCurrentFilePath();
    
    if (!this.currentStream || this.currentFile !== filePath) {
      if (this.currentStream) {
        this.currentStream.end();
      }
      
      this.ensureDirectory();
      this.currentStream = createWriteStream(filePath, { flags: 'a' });
      this.currentFile = filePath;
      
      // 获取当前文件大小
      if (existsSync(filePath)) {
        this.currentSize = statSync(filePath).size;
      } else {
        this.currentSize = 0;
      }
    }
    
    return this.currentStream;
  }

  /**
   * @method write
   * @description 写入日志行
   */
  public write(line: string): void {
    if (this.isClosed) return;

    this.writeBuffer.push(line);
    
    // 缓冲区满，立即刷新
    if (this.writeBuffer.length >= (this.options.bufferSize || 100)) {
      this.flush();
    } else if (!this.flushTimer) {
      // 设置定时刷新
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, this.options.flushInterval || 1000);
    }
  }

  /**
   * @method flush
   * @description 刷新缓冲区到文件
   */
  public async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.writeBuffer.length === 0) return;

    // 检查是否需要轮转
    if (this.shouldRotate()) {
      await this.rotate();
    }

    const stream = this.getOrCreateStream();
    const content = this.writeBuffer.join('\n') + '\n';
    
    stream.write(content);
    this.currentSize += Buffer.byteLength(content);
    this.writeBuffer = [];
  }

  /**
   * @method close
   * @description 关闭传输器
   */
  public async close(): Promise<void> {
    this.isClosed = true;
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flush();

    if (this.currentStream) {
      await new Promise<void>((resolve) => {
        this.currentStream!.end(() => resolve());
      });
      this.currentStream = null;
    }
  }
}

/**
 * @function createFileTransport
 * @description 创建文件传输器实例
 */
export function createFileTransport(options: FileTransportOptions): FileTransport {
  return new FileTransport(options);
}

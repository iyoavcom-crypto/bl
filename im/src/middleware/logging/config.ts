/**
 * @packageDocumentation
 * @module middleware/logging/config
 * @since 1.0.0 (2026-01-09)
 * @author Z-kali
 * @description 日志系统配置管理，支持多种输出、采样、脱敏等高级特性
 */

/**
 * @type LogLevel
 * @description 日志级别
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * @interface FileTransportConfig
 * @description 文件日志传输配置
 */
export interface FileTransportConfig {
  /** 是否启用文件日志 */
  enabled: boolean;
  /** 日志文件路径（支持日期变量） */
  path: string;
  /** 单个文件最大大小（如 '10m', '100k'） */
  maxSize: string;
  /** 保留的最大文件数 */
  maxFiles: number;
  /** 是否压缩旧日志文件 */
  compress: boolean;
  /** 是否按日期分割 */
  datePattern: string;
}

/**
 * @interface SamplingConfig
 * @description 日志采样配置（降低高频日志负载）
 */
export interface SamplingConfig {
  /** trace 级别采样率 (0-1) */
  trace: number;
  /** debug 级别采样率 (0-1) */
  debug: number;
  /** info 级别采样率 (0-1) */
  info: number;
}

/**
 * @interface SanitizeConfig
 * @description 敏感信息脱敏配置
 */
export interface SanitizeConfig {
  /** 是否启用脱敏 */
  enabled: boolean;
  /** 需要脱敏的字段名（支持嵌套路径） */
  fields: string[];
  /** 脱敏后的占位符 */
  placeholder: string;
  /** 是否保留前后字符（如保留前2位和后2位） */
  partial: {
    enabled: boolean;
    prefix: number;
    suffix: number;
  };
}

/**
 * @interface LoggingConfig
 * @description 日志系统完整配置
 */
export interface LoggingConfig {
  /** 全局日志级别 */
  level: LogLevel;
  /** 是否美化输出（开发模式推荐） */
  pretty: boolean;
  /** 文件传输配置 */
  file: FileTransportConfig;
  /** 采样配置 */
  sampling: SamplingConfig;
  /** 脱敏配置 */
  sanitize: SanitizeConfig;
  /** 是否启用控制台输出 */
  console: boolean;
}

/**
 * @function parseSize
 * @description 解析文件大小字符串为字节数
 * @param {string} size - 大小字符串（如 '10m', '100k', '1g'）
 * @returns {number} 字节数
 */
export function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    k: 1024,
    m: 1024 * 1024,
    g: 1024 * 1024 * 1024,
  };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([bkmg])?$/);
  if (!match) return 10 * 1024 * 1024; // 默认 10MB
  const [, num, unit = 'b'] = match;
  return Math.floor(Number(num) * (units[unit] || 1));
}

/**
 * @function getDefaultLoggingConfig
 * @description 获取默认日志配置（基于环境变量）
 * @returns {LoggingConfig} 日志配置
 */
export function getDefaultLoggingConfig(): LoggingConfig {
  const env = process.env.NODE_ENV || 'development';
  const isProd = env === 'production';

  return {
    level: (process.env.LOG_LEVEL as LogLevel) || (isProd ? 'info' : 'debug'),
    pretty: process.env.LOG_PRETTY === 'true' || !isProd,
    console: process.env.LOG_CONSOLE !== 'false',

    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true' || isProd,
      path: process.env.LOG_FILE_PATH || 'logs/app-%DATE%.log',
      maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
      maxFiles: Number(process.env.LOG_FILE_MAX_FILES) || 7,
      compress: process.env.LOG_FILE_COMPRESS !== 'false',
      datePattern: process.env.LOG_FILE_DATE_PATTERN || 'YYYY-MM-DD',
    },

    sampling: {
      trace: isProd ? 0.01 : 1.0, // 生产环境 1%
      debug: isProd ? 0.1 : 1.0,  // 生产环境 10%
      info: 1.0,                   // 始终记录
    },

    sanitize: {
      enabled: process.env.LOG_SANITIZE !== 'false',
      fields: [
        'password',
        'pin',
        'token',
        'accessToken',
        'refreshToken',
        'secret',
        'apiKey',
        'authorization',
        'cookie',
        'sessionId',
      ],
      placeholder: '***REDACTED***',
      partial: {
        enabled: false,
        prefix: 2,
        suffix: 2,
      },
    },
  };
}

/**
 * @description 全局日志配置实例
 */
export const loggingConfig: LoggingConfig = getDefaultLoggingConfig();

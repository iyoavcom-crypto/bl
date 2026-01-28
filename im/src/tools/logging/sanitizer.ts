/**
 * @packageDocumentation
 * @module tools-logging-sanitizer
 * @since 1.0.0 (2026-01-09)
 * @author Z-kali
 * @description 敏感信息脱敏工具，自动检测并隐藏敏感字段
 */

import type { SanitizeConfig } from "@/middleware/logging/config.js";

/**
 * @function shouldSanitizeKey
 * @description 判断字段名是否需要脱敏
 * @param {string} key - 字段名
 * @param {string[]} sensitiveFields - 敏感字段列表
 * @returns {boolean} 是否需要脱敏
 */
function shouldSanitizeKey(key: string, sensitiveFields: string[]): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveFields.some((field) => {
    const lowerField = field.toLowerCase();
    return lowerKey === lowerField || lowerKey.includes(lowerField);
  });
}

/**
 * @function sanitizeValue
 * @description 脱敏单个值
 * @param {unknown} value - 原始值
 * @param {SanitizeConfig} config - 脱敏配置
 * @returns {unknown} 脱敏后的值
 */
function sanitizeValue(value: unknown, config: SanitizeConfig): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  const str = String(value);
  
  // 如果启用部分保留
  if (config.partial.enabled && str.length > config.partial.prefix + config.partial.suffix) {
    const prefix = str.slice(0, config.partial.prefix);
    const suffix = str.slice(-config.partial.suffix);
    const middle = '*'.repeat(Math.max(3, str.length - config.partial.prefix - config.partial.suffix));
    return `${prefix}${middle}${suffix}`;
  }

  return config.placeholder;
}

/**
 * @function sanitizeObject
 * @description 递归脱敏对象
 * @param {Record<string, unknown>} obj - 原始对象
 * @param {SanitizeConfig} config - 脱敏配置
 * @param {number} depth - 当前递归深度
 * @param {number} maxDepth - 最大递归深度
 * @returns {Record<string, unknown>} 脱敏后的对象
 */
function sanitizeObject(
  obj: Record<string, unknown>,
  config: SanitizeConfig,
  depth: number = 0,
  maxDepth: number = 10
): Record<string, unknown> {
  if (depth >= maxDepth) {
    return obj;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // 检查是否需要脱敏
    if (shouldSanitizeKey(key, config.fields)) {
      result[key] = sanitizeValue(value, config);
      continue;
    }

    // 递归处理嵌套对象
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>, config, depth + 1, maxDepth);
      continue;
    }

    // 处理数组
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return sanitizeObject(item as Record<string, unknown>, config, depth + 1, maxDepth);
        }
        return item;
      });
      continue;
    }

    // 普通值直接保留
    result[key] = value;
  }

  return result;
}

/**
 * @function sanitizeError
 * @description 脱敏错误对象
 * @param {unknown} error - 错误对象
 * @param {SanitizeConfig} config - 脱敏配置
 * @returns {unknown} 脱敏后的错误
 */
function sanitizeError(error: unknown, config: SanitizeConfig): unknown {
  if (!error || typeof error !== 'object') {
    return error;
  }

  const err = error as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(err)) {
    if (shouldSanitizeKey(key, config.fields)) {
      sanitized[key] = sanitizeValue(value, config);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, config);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * @class Sanitizer
 * @description 敏感信息脱敏器
 */
export class Sanitizer {
  private config: SanitizeConfig;

  constructor(config: SanitizeConfig) {
    this.config = config;
  }

  /**
   * @method sanitize
   * @description 脱敏上下文数据
   * @param {Record<string, unknown>} ctx - 上下文对象
   * @returns {Record<string, unknown>} 脱敏后的上下文
   */
  public sanitize(ctx?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!this.config.enabled || !ctx) {
      return ctx;
    }

    return sanitizeObject(ctx, this.config);
  }

  /**
   * @method sanitizeError
   * @description 脱敏错误对象
   * @param {unknown} error - 错误对象
   * @returns {unknown} 脱敏后的错误
   */
  public sanitizeError(error?: unknown): unknown {
    if (!this.config.enabled || !error) {
      return error;
    }

    return sanitizeError(error, this.config);
  }

  /**
   * @method updateConfig
   * @description 更新脱敏配置
   * @param {Partial<SanitizeConfig>} config - 新配置
   */
  public updateConfig(config: Partial<SanitizeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * @method addSensitiveField
   * @description 添加敏感字段
   * @param {string} field - 字段名
   */
  public addSensitiveField(field: string): void {
    if (!this.config.fields.includes(field)) {
      this.config.fields.push(field);
    }
  }

  /**
   * @method removeSensitiveField
   * @description 移除敏感字段
   * @param {string} field - 字段名
   */
  public removeSensitiveField(field: string): void {
    const index = this.config.fields.indexOf(field);
    if (index > -1) {
      this.config.fields.splice(index, 1);
    }
  }
}

/**
 * @function createSanitizer
 * @description 创建脱敏器实例
 */
export function createSanitizer(config: SanitizeConfig): Sanitizer {
  return new Sanitizer(config);
}

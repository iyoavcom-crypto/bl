/**
 * @packageDocumentation
 * @module logger
 * @since 1.0.0 (2025-11-25)
 * @updated 2026-01-09
 * @author Z-kali
 * @description 企业级日志系统：支持多级别、结构化输出、文件持久化、脱敏、采样、TraceId 追踪
 */

import type { LoggingConfig, LogLevel } from "@/middleware/logging/config.js";
import { loggingConfig } from "@/middleware/logging/config.js";
import { FileTransport, createFileTransport } from "./file-transport.js";
import { Sanitizer, createSanitizer } from "./sanitizer.js";

export type { LogLevel };

/**
 * @interface SerializedError
 * @description 可序列化错误信息结构
 * @property {string} name - 错误名称
 * @property {string} message - 错误消息
 * @property {string} [stack] - 错误堆栈字符串
 * @property {unknown} [cause] - 错误根因（可嵌套其他错误或上下文）
 * @property {string | number} [code] - 错误代码
 */
interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  code?: string | number;
}

/**
 * @interface LogEvent
 * @description 日志事件数据结构
 * @property {string} ts - 日志时间戳（ISO 8601 字符串）
 * @property {LogLevel} level - 日志级别
 * @property {string} [name] - 日志记录器名称
 * @property {string} msg - 日志消息
 * @property {Record<string, unknown>} [ctx] - 结构化上下文字段
 * @property {SerializedError} [err] - 关联的错误信息
 */
interface LogEvent {
  ts: string;
  level: LogLevel;
  name?: string;
  msg: string;
  ctx?: Record<string, unknown> | undefined;
  err?: SerializedError | undefined;
  traceId?: string;
}

/**
 * @interface LoggerOptions
 * @description 日志记录器初始化配置
 * @property {string} [name] - 记录器名称，用于标识日志来源
 * @property {LogLevel} [level] - 日志输出的最小级别
 * @property {boolean} [pretty] - 是否使用人类可读格式输出
 * @property {Record<string, unknown>} [base] - 所有日志事件的基础上下文字段
 */
export interface LoggerOptions {
  name?: string;
  level?: LogLevel;
  pretty?: boolean;
  base?: Record<string, unknown>;
}

/**
 * @interface Logger
 * @description 日志记录器接口定义
 */
interface Logger {
  /**
   * @function getLevel
   * @description 获取当前日志级别
   * @returns {LogLevel} 当前日志级别
   */
  getLevel(): LogLevel;

  /**
   * @function setLevel
   * @description 设置当前日志级别
   * @param {LogLevel} level - 要设置的日志级别
   * @returns {void}
   */
  setLevel(level: LogLevel): void;

  /**
   * @function child
   * @description 创建子记录器，继承父记录器配置并可追加基础上下文
   * @param {string} name - 子记录器名称
   * @param {Record<string, unknown>} [base] - 额外的基础上下文字段
   * @returns {Logger} 子记录器实例
   */
  child(name: string, base?: Record<string, unknown>): Logger;

  /**
   * @function trace
   * @description 记录 trace 级别日志（最详细，仅调试用途）
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @returns {void}
   */
  trace(msg: string, ctx?: Record<string, unknown>): void;

  /**
   * @function debug
   * @description 记录 debug 级别日志（开发调试信息）
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @returns {void}
   */
  debug(msg: string, ctx?: Record<string, unknown>): void;

  /**
   * @function info
   * @description 记录 info 级别日志（常规业务信息）
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @returns {void}
   */
  info(msg: string, ctx?: Record<string, unknown>): void;

  /**
   * @function warn
   * @description 记录 warn 级别日志（潜在问题或异常情况）
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @returns {void}
   */
  warn(msg: string, ctx?: Record<string, unknown>): void;

  /**
   * @function error
   * @description 记录 error 级别日志（业务错误或可恢复异常）
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @returns {void}
   */
  error(msg: string, ctx?: Record<string, unknown>): void;

  /**
   * @function fatal
   * @description 记录 fatal 级别日志（严重错误，通常影响进程存活）
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @returns {void}
   */
  fatal(msg: string, ctx?: Record<string, unknown>): void;

  /**
   * @function log
   * @description 按指定级别记录日志（底层通用方法）
   * @param {LogLevel} level - 日志级别
   * @param {string} msg - 日志消息
   * @param {Record<string, unknown>} [ctx] - 结构化上下文
   * @param {unknown} [err] - 关联错误对象，将被序列化
   * @returns {void}
   */
  log(level: LogLevel, msg: string, ctx?: Record<string, unknown>, err?: unknown): void;
}

/**
 * @description 日志级别到数值的映射（用于过滤）
 */
const LEVEL_NUM: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/**
 * @description 日志级别到标签字符串的映射
 */
const LEVEL_LABEL: Record<LogLevel, string> = {
  trace: "TRACE",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  fatal: "FATAL",
};

/**
 * @description 日志级别到 ANSI 颜色码的映射（用于控制台彩色输出）
 */
const COLOR: Record<LogLevel, string> = {
  trace: "\x1b[90m",
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  fatal: "\x1b[35m",
};

/**
 * @description ANSI 重置颜色码
 */
const RESET = "\x1b[0m";

/**
 * @function nowIso
 * @description 获取当前时间的 ISO 8601 字符串
 * @returns {string} 当前时间戳字符串
 */
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * @function coerceLogLevel
 * @description 将原始字符串规范化为日志级别，不合法时按环境变量选择默认级别
 * @param {string | null} [raw] - 原始级别字符串
 * @returns {LogLevel} 规范化后的日志级别
 */
function coerceLogLevel(raw?: string | null): LogLevel {
  const v = (raw || "").toLowerCase();
  if (v === "trace" || v === "debug" || v === "info" || v === "warn" || v === "error" || v === "fatal") return v;
  const env = process.env.NODE_ENV || "development";
  return env === "production" ? "info" : "debug";
}

/**
 * @function serializeUnknownError
 * @description 将未知错误对象序列化为可记录的错误结构
 * @param {unknown} err - 任意错误对象
 * @returns {SerializedError | undefined} 序列化后的错误信息；无错误时返回 undefined
 */
function serializeUnknownError(err: unknown): SerializedError | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    const out: SerializedError = { name: err.name || "Error", message: String(err.message || "") };
    if (err.stack) out.stack = err.stack;
    const anyObj = err as unknown as { code?: string | number; cause?: unknown };
    if (anyObj.code !== undefined) out.code = anyObj.code;
    if (anyObj.cause !== undefined) out.cause = anyObj.cause;
    return out;
  }
  try {
    return { name: typeof err, message: JSON.stringify(err) };
  } catch {
    return { name: typeof err, message: String(err) };
  }
}

/**
 * @function toJsonLine
 * @description 将日志事件转换为单行 JSON 字符串
 * @param {LogEvent} event - 日志事件
 * @returns {string} JSON 行字符串
 */
function toJsonLine(event: LogEvent): string {
  const payload: Record<string, unknown> = {
    ts: event.ts,
    level: event.level,
    msg: event.msg,
  };
  if (event.name) payload.name = event.name;
  if (event.ctx) payload.ctx = event.ctx;
  if (event.err) payload.err = event.err;
  if (event.traceId) payload.traceId = event.traceId;
  return JSON.stringify(payload);
}

/**
 * @function toPrettyLine
 * @description 将日志事件转换为人类可读的彩色单行字符串
 * @param {LogEvent} event - 日志事件
 * @returns {string} 格式化后的日志字符串
 */
function toPrettyLine(event: LogEvent): string {
  const ts = event.ts;
  const lvl = LEVEL_LABEL[event.level];
  const color = COLOR[event.level];
  const name = event.name ? ` ${event.name}` : "";
  const msg = event.msg;
  const ctx = event.ctx ? ` ${JSON.stringify(event.ctx)}` : "";
  const err = event.err ? `\n${event.err.stack ?? JSON.stringify(event.err)}` : "";
  const tid = event.traceId ? ` traceId=${event.traceId}` : "";
  return `${ts} ${color}[${lvl}]${RESET}${name} ${msg}${tid}${ctx}${err}`;
}

/**
 * @class SimpleLogger
 * @description 简单的控制台日志记录器实现，支持基础级别过滤、结构化上下文与彩色输出
 */
class SimpleLogger implements Logger {
  private name: string | undefined;
  private level: LogLevel;
  private pretty: boolean;
  private base: Record<string, unknown> | undefined;
  private fileTransport: FileTransport | null = null;
  private sanitizer: Sanitizer;
  private samplingRates: Record<LogLevel, number>;

  /**
   * @constructor
   * @description 创建 SimpleLogger 实例
   * @param {LoggerOptions} [options] - 日志记录器配置
   */
  constructor(options?: LoggerOptions) {
    this.name = options?.name ?? undefined;
    this.level = options?.level ?? coerceLogLevel(process.env.LOG_LEVEL ?? null);
    this.pretty = options?.pretty ?? loggingConfig.pretty;
    this.base = options?.base ?? undefined;
    
    // 初始化脱敏器
    this.sanitizer = createSanitizer(loggingConfig.sanitize);
    
    // 初始化采样率
    this.samplingRates = {
      trace: loggingConfig.sampling.trace,
      debug: loggingConfig.sampling.debug,
      info: loggingConfig.sampling.info,
      warn: 1.0,
      error: 1.0,
      fatal: 1.0,
    };
    
    // 初始化文件传输（仅根 Logger 创建一次）
    if (loggingConfig.file.enabled && !options?.name) {
      this.fileTransport = createFileTransport(loggingConfig.file);
    }
  }

  getLevel(): LogLevel {
    return this.level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  child(name: string, base?: Record<string, unknown>): Logger {
    const mergedBaseObj = { ...(this.base ?? {}), ...(base ?? {}) };
    const nextBase = Object.keys(mergedBaseObj).length > 0 ? mergedBaseObj : undefined;
    const opts: LoggerOptions = { name, level: this.level, pretty: this.pretty };
    if (nextBase !== undefined) {
      opts.base = nextBase;
    }
    return new SimpleLogger(opts);
  }

  trace(msg: string, ctx?: Record<string, unknown>): void {
    this.log("trace", msg, ctx);
  }

  debug(msg: string, ctx?: Record<string, unknown>): void {
    this.log("debug", msg, ctx);
  }

  info(msg: string, ctx?: Record<string, unknown>): void {
    this.log("info", msg, ctx);
  }

  warn(msg: string, ctx?: Record<string, unknown>): void {
    this.log("warn", msg, ctx);
  }

  error(msg: string, ctx?: Record<string, unknown>): void {
    this.log("error", msg, ctx);
  }

  fatal(msg: string, ctx?: Record<string, unknown>): void {
    this.log("fatal", msg, ctx);
  }

  /**
   * @method flush
   * @description 刷新缓冲区（确保日志写入）
   */
  async flush(): Promise<void> {
    if (this.fileTransport) {
      await this.fileTransport.flush();
    }
  }

  /**
   * @method close
   * @description 关闭日志系统（应用退出时调用）
   */
  async close(): Promise<void> {
    if (this.fileTransport) {
      await this.fileTransport.close();
      this.fileTransport = null;
    }
  }

  log(level: LogLevel, msg: string, ctx?: Record<string, unknown>, err?: unknown): void {
    // 级别过滤
    if (LEVEL_NUM[level] < LEVEL_NUM[this.level]) return;
    
    // 采样过滤
    if (Math.random() > this.samplingRates[level]) return;
    
    // 脱敏处理
    const sanitizedCtx = this.sanitizer.sanitize(this.base || ctx ? { ...(this.base ?? {}), ...(ctx ?? {}) } : undefined);
    const sanitizedErr = this.sanitizer.sanitizeError(serializeUnknownError(err));
    
    const e: LogEvent = {
      ts: nowIso(),
      level,
      msg,
      ctx: sanitizedCtx,
      err: sanitizedErr as SerializedError | undefined,
    };
    
    if (this.name !== undefined) {
      (e as { name: string }).name = this.name;
    }
    
    const currentTraceId = getCurrentTraceId();
    if (currentTraceId) {
      (e as { traceId: string }).traceId = currentTraceId;
    }
    
    const line = this.pretty ? toPrettyLine(e) : toJsonLine(e);
    
    // 控制台输出
    if (loggingConfig.console) {
      const out = level === "error" || level === "fatal" ? console.error : level === "warn" ? console.warn : console.log;
      out(line);
    }
    
    // 文件输出
    if (this.fileTransport) {
      this.fileTransport.write(line);
    }
  }
}

/**
 * @description 全局根记录器，默认名称为 "app"
 */
const rootLogger: Logger = new SimpleLogger({ name: "app" });

/**
 * @function createLogger
 * @description 创建新的独立日志记录器实例
 * @param {LoggerOptions} [options] - 记录器配置
 * @returns {Logger} 新的日志记录器
 */
function createLogger(options?: LoggerOptions): Logger {
  return new SimpleLogger(options);
}

/**
 * @function getLogger
 * @description 获取全局根记录器或其子记录器
 * @param {string} [name] - 子记录器名称；省略时返回根记录器
 * @returns {Logger} 根记录器或子记录器实例
 */
function getLogger(name?: string): Logger {
  return name ? rootLogger.child(name) : rootLogger;
}

/**
 * @function setGlobalLogLevel
 * @description 设置全局根记录器的日志级别
 * @param {LogLevel} level - 要设置的日志级别
 * @returns {void}
 */
function setGlobalLogLevel(level: LogLevel): void {
  rootLogger.setLevel(level);
}

/**
 * @function getGlobalLogLevel
 * @description 获取全局根记录器当前日志级别
 * @returns {LogLevel} 当前全局日志级别
 */
function getGlobalLogLevel(): LogLevel {
  return rootLogger.getLevel();
}

/**
 * @function logError
 * @description 使用全局记录器记录错误日志，并自动序列化错误对象
 * @param {unknown} error - 错误对象
 * @param {string} [message] - 自定义错误消息，省略时优先使用 Error.message
 * @param {Record<string, unknown>} [ctx] - 结构化上下文
 * @returns {void}
 */
function logError(error: unknown, message?: string, ctx?: Record<string, unknown>): void {
  const logger = getLogger();
  const msg = message ?? (error instanceof Error ? error.message : "错误");
  logger.log("error", msg, ctx, error);
}

/**
 * @function flushLogs
 * @description 刷新所有缓冲的日志
 */
export async function flushLogs(): Promise<void> {
  if ('flush' in rootLogger) {
    await (rootLogger as any).flush();
  }
}

/**
 * @function closeLogs
 * @description 关闭日志系统（应用退出时调用）
 */
export async function closeLogs(): Promise<void> {
  if ('close' in rootLogger) {
    await (rootLogger as any).close();
  }
}

export type { Logger, LogEvent, SerializedError, LogContext, LoggingConfig };
export { createLogger, getLogger, setGlobalLogLevel, getGlobalLogLevel, logError, runWithTraceId, loggingConfig };
import { AsyncLocalStorage } from "node:async_hooks";
type LogContext = { traceId: string };
const logContextStorage = new AsyncLocalStorage<LogContext>();

function getCurrentTraceId(): string | undefined {
  return logContextStorage.getStore()?.traceId;
}

function runWithTraceId(traceId: string, fn: () => void): void {
  logContextStorage.enterWith({ traceId });
  fn();
}

/**
 * @packageDocumentation
 * @module middleware/rate-limit
 * @since 1.0.0
 * @author Z-Kali
 * @tags [rate-limit],[middleware],[security],[express]
 * @description 内存级限流中间件：按 IP 进行固定窗口计数
 * @path src/middleware/rate-limit/index.ts
 * @see src/config/env/index.ts
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { env } from "@/config/env/index.js";

/**
 * @type Bucket
 * @description 限流桶记录
 * @property {number} resetAt - 窗口重置时间戳（毫秒）
 * @property {number} count - 当前窗口计数
 */
type Bucket = { resetAt: number; count: number };

/**
 * @const buckets
 * @description 内存桶集合（key 为客户端标识）
 */
const buckets = new Map<string, Bucket>();

function getKey(req: Request): string {
  const h = req.headers ?? {};
  const xff = (h["x-forwarded-for"] as string | undefined) || "";
  const ip = xff.split(",")[0].trim() || (req.ip || (req.socket.remoteAddress || "unknown"));
  return ip;
}

/**
 * @function createRateLimiter
 * @description 创建限流中间件
 * @param {number} windowMs - 固定窗口时长（毫秒）
 * @param {number} max - 窗口内最大请求数
 * @returns {RequestHandler} Express 中间件
 */
export function createRateLimiter(windowMs: number, max: number): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = getKey(req);
    const b = buckets.get(key);
    if (!b || now >= b.resetAt) {
      buckets.set(key, { resetAt: now + windowMs, count: 1 });
      next();
      return;
    }
    if (b.count >= max) {
      res.status(429).json({ code: "TooManyRequests", message: "Too many requests", status: 429 });
      return;
    }
    b.count++;
    next();
  };
}

/**
 * @const rateLimit
 * @description 默认限流中间件实例（读取 env 配置）
 */
export const rateLimit: RequestHandler = createRateLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX_REQUESTS,
);

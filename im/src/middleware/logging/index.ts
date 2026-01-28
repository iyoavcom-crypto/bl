/**
 * @packageDocumentation
 * @module middleware/logging
 * @since 1.0.0
 * @author Z-Kali
 * @tags [logging],[middleware],[trace],[express],[http]
 * @description 请求日志中间件：基于 traceId 绑定上下文并记录请求耗时
 * @path src/middleware/logging/index.ts
 * @see src/tools/logging/index.ts
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getLogger, runWithTraceId } from "@/tools/logging";
import { TRACE_ID_HEADER } from "../request-id";
import { randomUUID } from "node:crypto";

/**
 * @function getTraceId
 * @description 从请求头提取 traceId（优先 x-trace-id，其次 x-request-id）
 * @param {Request} req - Express 请求对象
 * @returns {string} traceId 字符串
 */
function getTraceId(req: Request): string {
  const h = req.headers ?? {};
  return String((h["x-trace-id"] as string | undefined) ?? (h["x-request-id"] as string | undefined) ?? "unknown");
}

/**
 * @function createRequestLogger
 * @description 创建请求日志中间件，并把 traceId 写入响应头
 * @param {string} [name="http"] - logger 名称
 * @returns {RequestHandler} Express 中间件
 */
export function createRequestLogger(name: string = "http"): RequestHandler {
  const logger = getLogger(name);
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();
    const incomingTrace = getTraceId(req);
    const traceId = incomingTrace || randomUUID();
    res.setHeader(TRACE_ID_HEADER, traceId);
    runWithTraceId(traceId, () => {
      res.on("finish", () => {
        const durMs = Number((process.hrtime.bigint() - start) / BigInt(1_000_000));
        const lenHeader = res.getHeader("content-length");
        const length = typeof lenHeader === "string" ? Number(lenHeader) : Array.isArray(lenHeader) ? Number(lenHeader[0]) : undefined;
        logger.info("request", {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs: durMs,
          length,
        });
      });
      next();
    });
  };
}

/**
 * @const requestLogger
 * @description 默认请求日志中间件实例
 */
export const requestLogger: RequestHandler = createRequestLogger();

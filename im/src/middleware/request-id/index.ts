/**
 * @packageDocumentation
 * @module middleware/request-id
 * @since 1.0.0
 * @author Z-Kali
 * @tags [request-id],[middleware],[trace],[express]
 * @description 请求标识中间件：确保每个请求具备 x-request-id/x-trace-id 并回写响应头
 * @path src/middleware/request-id/index.ts
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomUUID } from "node:crypto";

/**
 * @const REQUEST_ID_HEADER
 * @description RequestId 请求头名称
 */
export const REQUEST_ID_HEADER = "x-request-id";

/**
 * @const TRACE_ID_HEADER
 * @description TraceId 请求头名称
 */
export const TRACE_ID_HEADER = "x-trace-id";

/**
 * @function getIncomingId
 * @description 从请求头中提取已有的请求标识（x-request-id 或 x-trace-id）
 * @param {Request} req - Express 请求对象
 * @returns {string | undefined} 返回去除空白的请求ID，如不存在则返回 undefined
 */
function getIncomingId(req: Request): string | undefined {
  const h = req.headers ?? {};
  const a = h["x-request-id"] as string | undefined;
  const b = h["x-trace-id"] as string | undefined;
  const v = (a ?? b)?.trim();
  return v ? v : undefined;
}

/**
 * @function ensureRequestId
 * @description 中间件：确保每个进入的请求拥有唯一 RequestId/TraceId  
 *              逻辑：读取 header → 若缺失则生成 UUID → 写入 req/res  
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - Express 中间件 next 回调
 * @returns {void} 无返回值（继续中间件链）
 */
export const ensureRequestId: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = getIncomingId(req);
  const id = incoming ?? randomUUID();

  req.headers[REQUEST_ID_HEADER] = id;
  req.headers[TRACE_ID_HEADER] = id;

  res.setHeader(REQUEST_ID_HEADER, id);
  res.setHeader(TRACE_ID_HEADER, id);

  next();
};

export default ensureRequestId;

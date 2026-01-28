/**
 * @packageDocumentation
 * @module middleware/error-handler
 * @since 1.0.0
 * @author Z-Kali
 * @tags [middleware], [error], [express]
 * @description 全局错误处理中间件：统一错误响应格式，防止敏感信息泄露
 * @path src/middleware/error-handler/index.ts
 */

import type { Request, Response, NextFunction } from "express";
import { ApiCode, HttpStatus, errorBody, json } from "../request/index.js";

/**
 * @interface AppError
 * @description 应用错误接口（带 status 属性）
 */
export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * @function isAppError
 * @description 类型守卫：判断是否为应用错误
 * @param {unknown} err - 待检查的错误对象
 * @returns {boolean} 是否为应用错误
 */
function isAppError(err: unknown): err is AppError {
  return err instanceof Error;
}

/**
 * @function getHttpStatus
 * @description 根据错误状态码获取 HTTP 状态
 * @param {number | undefined} status - 错误状态码
 * @returns {HttpStatus} HTTP 状态码
 */
function getHttpStatus(status: number | undefined): HttpStatus {
  switch (status) {
    case 400:
      return HttpStatus.BAD_REQUEST;
    case 401:
      return HttpStatus.UNAUTHORIZED;
    case 403:
      return HttpStatus.FORBIDDEN;
    case 404:
      return HttpStatus.NOT_FOUND;
    case 409:
      return HttpStatus.BAD_REQUEST; // 冲突映射到 400
    default:
      return status && status >= 400 && status < 500
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

/**
 * @function getApiCode
 * @description 根据 HTTP 状态码获取业务码
 * @param {HttpStatus} httpStatus - HTTP 状态码
 * @returns {ApiCode} 业务响应码
 */
function getApiCode(httpStatus: HttpStatus): ApiCode {
  switch (httpStatus) {
    case HttpStatus.BAD_REQUEST:
      return ApiCode.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return ApiCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ApiCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ApiCode.NOT_FOUND;
    default:
      return ApiCode.SERVER_ERROR;
  }
}

/**
 * @function globalErrorHandler
 * @description 全局错误处理中间件
 * @param {unknown} err - 错误对象
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} _next - Express next 函数
 * @returns {Response} Express 响应对象
 * @remarks
 * - 统一错误响应格式
 * - 生产环境隐藏堆栈信息
 * - 记录错误日志
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // 防止响应已发送时重复发送
  if (res.headersSent) {
    return res;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const requestId = req.headers["x-request-id"] as string | undefined;

  // 解析错误信息
  let message = "服务器内部错误";
  let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  let details: unknown = undefined;

  if (isAppError(err)) {
    message = err.message || message;
    httpStatus = getHttpStatus(err.status);
    
    // 非生产环境下返回详细信息
    if (!isProduction && err.stack) {
      details = {
        stack: err.stack.split("\n").slice(0, 5),
        ...(err.details ? { details: err.details } : {}),
      };
    }
  }

  // 记录错误日志
  console.error(`[Error] ${req.method} ${req.path}`, {
    requestId,
    status: httpStatus,
    message,
    stack: isAppError(err) ? err.stack : undefined,
  });

  // 构建错误响应
  const apiCode = getApiCode(httpStatus);
  const body = errorBody(apiCode, message, details);

  return json(res, httpStatus, body);
}

/**
 * @function notFoundHandler
 * @description 404 路由未匹配处理中间件
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @returns {Response} Express 响应对象
 */
export function notFoundHandler(req: Request, res: Response): Response {
  const body = errorBody(ApiCode.NOT_FOUND, `路由不存在: ${req.method} ${req.path}`);
  return json(res, HttpStatus.NOT_FOUND, body);
}

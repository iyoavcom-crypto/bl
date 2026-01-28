/**
 * @packageDocumentation
 * @module contracts/crud/fail
 * @since 1.0.0
 * @author Z-Kali
 * @tags [错误响应],[HTTP],[CRUD],[异常处理],[API]
 * @description 统一错误响应处理函数，基于 middleware/request 统一响应格式
 * @path src/contracts/crud/fail.ts
 * @see src/middleware/request/index.ts
 */

import type { Response } from "express";
import { isAuthError } from "@/tools/jwt/index.js";
import {
  badRequest as baseBadRequest,
  unauthorized as baseUnauthorized,
  forbidden as baseForbidden,
  notFound as baseNotFound,
  serverError as baseServerError,
  HttpStatus,
  ApiCode,
  errorBody,
  json,
} from "@/middleware/request";
import type { ApiErrorDetail } from "./types.js";

/**
 * @function fail
 * @description 统一错误响应处理，将异常转换为标准 API 错误格式
 * @param {Response} res - Express 响应对象
 * @param {unknown} err - 错误对象
 * @param {number} [defaultStatus=500] - 默认 HTTP 状态码
 * @returns {Response} Express 响应对象
 */
export function fail(
  res: Response,
  err: unknown,
  defaultStatus: number = 500
): Response {
  // AuthError 类型错误
  if (isAuthError(err)) {
    const status = err.status as HttpStatus;
    const code = statusToApiCode(status);
    const details =
      err.fields && Object.keys(err.fields).length > 0
        ? Object.entries(err.fields).flatMap(([field, messages]) =>
            messages.map((message) => ({ field, message }))
          )
        : undefined;
    const body = errorBody(code, err.message, details);
    return json(res, status, body);
  }

  // 标准 Error 类型
  if (err instanceof Error) {
    const status = defaultStatus as HttpStatus;
    const code = statusToApiCode(status);
    const body = errorBody(code, err.message || "Internal Server Error");
    return json(res, status, body);
  }

  // 未知类型错误
  const status = defaultStatus as HttpStatus;
  const code = statusToApiCode(status);
  const message = typeof err === "string" ? err : "Unknown error";
  const body = errorBody(code, message);
  return json(res, status, body);
}

/**
 * @function statusToApiCode
 * @description 将 HTTP 状态码转换为 ApiCode
 * @param {number} status - HTTP 状态码
 * @returns {ApiCode} 对应的业务码
 */
function statusToApiCode(status: number): ApiCode {
  switch (status) {
    case 400:
      return ApiCode.BAD_REQUEST;
    case 401:
      return ApiCode.UNAUTHORIZED;
    case 403:
      return ApiCode.FORBIDDEN;
    case 404:
      return ApiCode.NOT_FOUND;
    default:
      return ApiCode.SERVER_ERROR;
  }
}

/**
 * @function badRequest
 * @description 400 Bad Request 错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} message - 错误信息
 * @param {ApiErrorDetail[]} [errors] - 详细字段错误列表
 * @returns {Response} Express 响应对象
 */
export function badRequest(
  res: Response,
  message: string,
  errors?: ApiErrorDetail[]
): Response {
  return baseBadRequest(res, message, errors);
}

/**
 * @function unauthorized
 * @description 401 Unauthorized 错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} [message="未认证"] - 错误信息
 * @returns {Response} Express 响应对象
 */
export function unauthorized(
  res: Response,
  message: string = "未认证"
): Response {
  return baseUnauthorized(res, message);
}

/**
 * @function forbidden
 * @description 403 Forbidden 错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} [message="无权限执行该操作"] - 错误信息
 * @returns {Response} Express 响应对象
 */
export function forbidden(
  res: Response,
  message: string = "无权限执行该操作"
): Response {
  return baseForbidden(res, message);
}

/**
 * @function notFound
 * @description 404 Not Found 错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} [message="资源不存在"] - 错误信息
 * @returns {Response} Express 响应对象
 */
export function notFound(
  res: Response,
  message: string = "资源不存在"
): Response {
  return baseNotFound(res, message);
}

/**
 * @function conflict
 * @description 409 Conflict 错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} [message="资源冲突"] - 错误信息
 * @returns {Response} Express 响应对象
 */
export function conflict(
  res: Response,
  message: string = "资源冲突"
): Response {
  const body = errorBody(ApiCode.BAD_REQUEST, message);
  return json(res, 409 as HttpStatus, body);
}

/**
 * @function serverError
 * @description 500 Internal Server Error 错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} [message="服务器内部错误"] - 错误信息
 * @returns {Response} Express 响应对象
 */
export function serverError(
  res: Response,
  message: string = "服务器内部错误"
): Response {
  return baseServerError(res, undefined, message);
}

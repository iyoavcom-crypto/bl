/**
 * @packageDocumentation
 * @module middleware/request
 * @since 1.0.0
 * @author Z-Kali
 * @tags [response],[dto],[express],[pagination]
 * @description Express 响应 DTO 与封装函数：ok/created/pagedOk/empty 与错误响应
 * @path src/middleware/request/index.ts
 * @see src/middleware/request/pagination.ts
 */

import type { Response } from "express";
import { computePages } from "./pagination";

/**
 * @enum HttpStatus
 * @description HTTP 状态码枚举
 * @property {number} OK - 200
 * @property {number} CREATED - 201
 * @property {number} NO_CONTENT - 204
 * @property {number} BAD_REQUEST - 400
 * @property {number} UNAUTHORIZED - 401
 * @property {number} FORBIDDEN - 403
 * @property {number} NOT_FOUND - 404
 * @property {number} INTERNAL_SERVER_ERROR - 500
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * @enum ApiCode
 * @description 业务响应码枚举（与 HTTP 状态码解耦）
 * @property {string} OK - 通用成功
 * @property {string} CREATED - 创建成功
 * @property {string} BAD_REQUEST - 请求错误
 * @property {string} UNAUTHORIZED - 未认证
 * @property {string} FORBIDDEN - 无权限
 * @property {string} NOT_FOUND - 资源不存在
 * @property {string} SERVER_ERROR - 服务器内部错误
 */
export enum ApiCode {
  OK = "OK",
  CREATED = "Created",
  BAD_REQUEST = "BadRequest",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "NotFound",
  SERVER_ERROR = "ServerError",
}

/**
 * @interface ApiOk
 * @description 通用成功响应结构
 * @property {string} code - 业务响应码
 * @property {T} data - 响应数据
 * @property {string | undefined} message - 提示消息
 */
export interface ApiOk<T> {
  code: string;
  data: T;
  message?: string;
}

/**
 * @interface ApiError
 * @description 通用错误响应结构
 * @property {string} code - 业务错误码
 * @property {string} message - 错误信息
 * @property {TDetails | undefined} details - 错误详情（如校验错误、栈信息等）
 */
export interface ApiError<TDetails = unknown> {
  code: string;
  message: string;
  details?: TDetails;
}

/**
 * @interface Pagination
 * @description 分页元信息
 * @property {number} total - 总条数
 * @property {number} page - 当前页码
 * @property {number} pageSize - 每页条数
 * @property {number} pages - 总页数
 */
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/**
 * @type OkResponseDto
 * @description 通用成功响应 DTO（200），基于 ApiOk
 */
export type OkResponseDto<T = unknown> = ApiOk<T>;

/**
 * @type CreatedResponseDto
 * @description 创建成功响应 DTO（201），语义上等同 ApiOk
 */
export type CreatedResponseDto<T = unknown> = ApiOk<T>;

/**
 * @type PagedOkResponseDto
 * @description 分页成功响应 DTO（200 + meta）
 */
export type PagedOkResponseDto<T = unknown> = ApiOk<ReadonlyArray<T>> & {
  meta: Pagination;
};

/**
 * @type EmptyResponseDto
 * @description 无内容响应 DTO（204）
 */
export type EmptyResponseDto = ApiOk<null>;

/**
 * @type ErrorResponseDto
 * @description 通用错误响应 DTO（4xx/5xx）
 */
export type ErrorResponseDto<TDetails = unknown> = ApiError<TDetails>;

/**
 * @function buildPagination
 * @description 构建分页元信息
 * @param {number} total - 总条数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页条数
 * @returns {Pagination} 分页元信息
 */
export function buildPagination(total: number, page: number, pageSize: number): Pagination {
  return {
    total,
    page,
    pageSize,
    pages: computePages(total, pageSize),
  };
}

/**
 * @function okBody
 * @description 构建成功响应体
 * @param {ApiCode} code - 业务码
 * @param {T} data - 响应数据
 * @param {string} [message] - 可选提示消息
 * @returns {ApiOk<T>} 成功响应体
 */
export function okBody<T>(code: ApiCode, data: T, message?: string): ApiOk<T> {
  return message ? { code, data, message } : { code, data };
}

/**
 * @function errorBody
 * @description 构建错误响应体
 * @param {ApiCode} code - 业务错误码
 * @param {string} message - 错误信息
 * @param {TDetails} [details] - 错误详情
 * @returns {ApiError<TDetails>} 错误响应体
 */
export function errorBody<TDetails = unknown>(
  code: ApiCode,
  message: string,
  details?: TDetails,
): ApiError<TDetails> {
  return details ? { code, message, details } : { code, message };
}

/**
 * @function json
 * @description 通用 JSON 响应封装
 * @param {Response} res - Express 响应对象
 * @param {HttpStatus} status - HTTP 状态码
 * @param {unknown} body - 响应体
 * @returns {Response} Express 响应对象
 */
export function json(res: Response, status: HttpStatus, body: unknown): Response {
  return res.status(status).json(body);
}

/**
 * @function ok
 * @description 通用成功响应（200）
 * @param {Response} res - Express 响应对象
 * @param {T} data - 返回数据
 * @param {string} [message] - 可选提示消息
 * @returns {Response} Express 响应对象
 */
export function ok<T>(res: Response, data: T, message?: string): Response {
  const body = okBody(ApiCode.OK, data, message);
  return json(res, HttpStatus.OK, body);
}

/**
 * @function created
 * @description 创建成功响应（201）
 * @param {Response} res - Express 响应对象
 * @param {T} data - 新建的数据
 * @param {string} [message] - 可选提示消息
 * @returns {Response} Express 响应对象
 */
export function created<T>(res: Response, data: T, message?: string): Response {
  const body = okBody(ApiCode.CREATED, data, message);
  return json(res, HttpStatus.CREATED, body);
}

/**
 * @function pagedOk
 * @description 分页成功响应（200 + meta）
 * @param {Response} res - Express 响应对象
 * @param {T[]} items - 当前页数据
 * @param {number} total - 总条数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页条数
 * @param {string} [message] - 可选提示消息
 * @returns {Response} Express 响应对象
 */
export function pagedOk<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message?: string,
): Response {
  const meta = buildPagination(total, page, pageSize);
  const body: PagedOkResponseDto<T> = {
    ...okBody(ApiCode.OK, items, message),
    meta,
  };
  return json(res, HttpStatus.OK, body);
}

/**
 * @function empty
 * @description 无内容响应（204）
 * @param {Response} res - Express 响应对象
 * @returns {Response} Express 响应对象
 */
export function empty(res: Response): Response {
  return res.status(HttpStatus.NO_CONTENT).end();
}

/**
 * @function badRequest
 * @description 400 请求错误响应
 * @param {Response} res - Express 响应对象
 * @param {string} message - 错误提示信息
 * @param {TDetails} [details] - 可选错误详情（验证错误等）
 * @returns {Response} Express 响应对象
 */
export function badRequest<TDetails = unknown>(
  res: Response,
  message: string,
  details?: TDetails,
): Response {
  const body = errorBody(ApiCode.BAD_REQUEST, message, details);
  return json(res, HttpStatus.BAD_REQUEST, body);
}

/**
 * @function unauthorized
 * @description 401 未认证（通常用于未登录或凭证无效）
 * @param {Response} res - Express 响应对象
 * @param {string} [message="未认证"] - 错误提示信息
 * @param {TDetails} [details] - 可选错误详情（例如原因：Token 过期、签名错误等）
 * @returns {Response} Express 响应对象
 */
export function unauthorized<TDetails = unknown>(
  res: Response,
  message: string = "未认证",
  details?: TDetails,
): Response {
  const body = errorBody(ApiCode.UNAUTHORIZED, message, details);
  return json(res, HttpStatus.UNAUTHORIZED, body);
}

/**
 * @function forbidden
 * @description 403 无权限（通常用于已登录但权限不足）
 * @param {Response} res - Express 响应对象
 * @param {string} [message="无权限执行该操作"] - 错误提示信息
 * @param {TDetails} [details] - 可选错误详情（例如缺少的权限、角色等）
 * @returns {Response} Express 响应对象
 */
export function forbidden<TDetails = unknown>(
  res: Response,
  message: string = "无权限执行该操作",
  details?: TDetails,
): Response {
  const body = errorBody(ApiCode.FORBIDDEN, message, details);
  return json(res, HttpStatus.FORBIDDEN, body);
}

/**
 * @function notFound
 * @description 404 资源不存在响应
 * @param {Response} res - Express 响应对象
 * @param {string} [message="资源不存在"] - 错误提示信息
 * @returns {Response} Express 响应对象
 */
export function notFound(res: Response, message: string = "资源不存在"): Response {
  const body = errorBody(ApiCode.NOT_FOUND, message);
  return json(res, HttpStatus.NOT_FOUND, body);
}

/**
 * @function serverError
 * @description 500 服务器内部错误响应
 * @param {Response} res - Express 响应对象
 * @param {unknown} [error] - 可选错误对象（内部记录使用）
 * @param {string} [message="服务器内部错误"] - 错误提示信息
 * @returns {Response} Express 响应对象
 */
export function serverError(
  res: Response,
  error?: unknown,
  message: string = "服务器内部错误",
): Response {
  void error;
  const body = errorBody(ApiCode.SERVER_ERROR, message);
  return json(res, HttpStatus.INTERNAL_SERVER_ERROR, body);
}

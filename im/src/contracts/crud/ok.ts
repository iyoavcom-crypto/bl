/**
 * @packageDocumentation
 * @module contracts/crud/ok
 * @since 1.0.0
 * @author Z-Kali
 * @tags [响应],[CRUD],[HTTP],[成功],[分页]
 * @description CRUD 成功响应函数，基于 middleware/request 统一响应格式
 * @path src/contracts/crud/ok.ts
 * @see src/middleware/request/index.ts
 */

import type { Response } from "express";
import type { DetailResult, PaginatedResult } from "@/repo";
import {
  ok as baseOk,
  created as baseCreated,
  empty,
  pagedOk,
} from "@/middleware/request";

/**
 * @function ok
 * @description 通用成功响应（200）
 * @param {Response} res - Express 响应对象
 * @param {T} data - 返回数据
 * @param {string} [message] - 可选提示消息
 * @returns {Response} Express 响应对象
 */
export function ok<T>(res: Response, data: T, message?: string): Response {
  return baseOk(res, data, message);
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
  return baseCreated(res, data, message);
}

/**
 * @function accepted
 * @description 接受响应（202）- 请求已接受但尚未处理完成
 * @param {Response} res - Express 响应对象
 * @param {T} data - 返回数据
 * @param {string} [message] - 可选提示消息
 * @returns {Response} Express 响应对象
 */
export function accepted<T>(res: Response, data: T, message?: string): Response {
  return baseOk(res, data, message);
}

/**
 * @function noContent
 * @description 无内容响应（204）
 * @param {Response} res - Express 响应对象
 * @returns {Response} Express 响应对象
 */
export function noContent(res: Response): Response {
  return empty(res);
}

/**
 * @function okPaginated
 * @description 分页成功响应（200 + meta）
 * @param {Response} res - Express 响应对象
 * @param {PaginatedResult<T>} result - 分页结果对象
 * @param {string} [message] - 可选提示消息
 * @returns {Response} Express 响应对象
 */
export function okPaginated<T>(
  res: Response,
  result: PaginatedResult<T>,
  message?: string,
): Response {
  return pagedOk(res, result.data, result.total, result.page, result.limit, message);
}

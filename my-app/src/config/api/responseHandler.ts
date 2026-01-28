/**
 * MCP 统一响应处理工具
 */
import type { ApiOk, PagedResponse, ApiErrorResponse, PageMeta } from './types';

// 联合类型用于处理成功或失败响应
export type ApiResult<T> = ApiOk<T> | ApiErrorResponse;

/**
 * 检查响应是否成功 (MCP格式)
 */
export function isResponseSuccess<T>(response: ApiResult<T>): response is ApiOk<T> {
  return response.code === 'OK' || response.code === 'Created' || response.code === 'NoContent';
}

/**
 * 检查是否为错误响应
 */
export function isErrorResponse(response: ApiResult<unknown>): response is ApiErrorResponse {
  return ['BadRequest', 'Unauthorized', 'Forbidden', 'NotFound', 'ServerError'].includes(response.code);
}

/**
 * 提取响应数据
 */
export function extractResponseData<T>(response: ApiResult<T>): T {
  if (!isResponseSuccess(response)) {
    throw new Error(response.message || '请求失败');
  }
  return response.data;
}

/**
 * 处理分页响应 (MCP格式)
 */
export function handlePagedResponse<T>(
  response: PagedResponse<T>
): { items: T[]; meta: PageMeta } {
  return {
    items: response.data,
    meta: response.meta,
  };
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T, code: 'OK' | 'Created' | 'NoContent' = 'OK'): ApiOk<T> {
  return {
    code,
    data,
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(message: string, code: ApiErrorResponse['code'] = 'ServerError'): ApiErrorResponse {
  return {
    code,
    message,
  };
}

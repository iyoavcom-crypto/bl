/**
 * API 错误处理工具
 */
import { ApiError, ApiErrorCode, ApiErrorResponse, HTTP_STATUS_MAP } from './types';

// 错误码中文映射
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  BadRequest: '请求参数错误',
  Unauthorized: '未授权，请重新登录',
  Forbidden: '权限不足',
  NotFound: '请求的资源不存在',
  ServerError: '服务器内部错误',
};

// HTTP状态码到MCP错误码映射
const HTTP_TO_CODE: Record<number, ApiErrorCode> = {
  400: 'BadRequest',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'NotFound',
  500: 'ServerError',
};

/**
 * 处理 API 错误响应
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // 处理MCP格式错误响应
  const err = error as { code?: ApiErrorCode; message?: string; details?: unknown; status?: number };
  
  // 优先使用MCP code，其次根据HTTP状态码映射
  let code: ApiErrorCode = 'ServerError';
  
  if (err.code && isApiErrorCode(err.code)) {
    code = err.code;
  } else if (err.status && HTTP_TO_CODE[err.status]) {
    code = HTTP_TO_CODE[err.status];
  }
  
  const message = err.message || ERROR_MESSAGES[code] || '未知错误';
  
  return new ApiError(code, message, err.details);
}

/**
 * 类型守卫：检查是否为有效的ApiErrorCode
 */
function isApiErrorCode(code: string): code is ApiErrorCode {
  return ['BadRequest', 'Unauthorized', 'Forbidden', 'NotFound', 'ServerError'].includes(code);
}

/**
 * 检查是否为认证错误
 */
export function isAuthError(error: ApiError): boolean {
  return error.code === 'Unauthorized';
}

/**
 * 检查是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  const err = error as { code?: string };
  return !err.code;
}

/**
 * 格式化错误信息
 */
export function formatErrorMessage(error: ApiError): string {
  if (error.details && typeof error.details === 'object') {
    const detailMessages = Object.entries(error.details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `${error.message} (${detailMessages})`;
  }
  return error.message;
}
import { API_CONFIG } from './api/env';
import { STORAGE_KEYS, CONNECTION_CONFIG } from './constants';

import type { 
  ApiOk,
  ApiErrorResponse,
  PaginationParams,
  PagedResponse,
  PageMeta,
  ApiOkCode,
  ApiErrorCode,
  RequestConfig 
} from './api/types';

import { ApiError, HTTP_STATUS_MAP } from './api/types';

import { 
  handleApiError, 
  isAuthError, 
  isNetworkError, 
  formatErrorMessage 
} from './api/errorHandler';

import { 
  isResponseSuccess,
  isErrorResponse,
  extractResponseData, 
  handlePagedResponse,
  createSuccessResponse,
  createErrorResponse,
  type ApiResult
} from './api/responseHandler';

import { api } from './api/api';

// 显式导出
export {
  // 环境配置
  API_CONFIG,
  STORAGE_KEYS,
  CONNECTION_CONFIG,
  
  // 类型定义
  type ApiOk,
  type ApiErrorResponse,
  type ApiResult,
  type PaginationParams,
  type PagedResponse,
  type PageMeta,
  type ApiOkCode,
  type ApiErrorCode,
  type RequestConfig,
  ApiError,
  HTTP_STATUS_MAP,
  
  // 错误处理
  handleApiError,
  isAuthError,
  isNetworkError,
  formatErrorMessage,
  
  // 响应处理
  isResponseSuccess,
  isErrorResponse,
  extractResponseData,
  handlePagedResponse,
  createSuccessResponse,
  createErrorResponse,
  
  // Axios 实例
  api,
};

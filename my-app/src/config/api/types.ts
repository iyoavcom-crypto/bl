// MCP 响应码 (匹配后端实际返回)
export type ApiOkCode = 'OK' | 'Created' | 'NoContent';
export type ApiErrorCode = 'BadRequest' | 'Unauthorized' | 'Forbidden' | 'NotFound' | 'ServerError';

// 成功响应 ApiOk<T>
export interface ApiOk<T> {
  code: ApiOkCode;
  data: T;
  message?: string;
}

// 分页元数据
export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

// 分页响应 PagedResponse<T>
export interface PagedResponse<T> {
  code: 'OK';
  data: T[];
  meta: PageMeta;
}

// 错误响应 ApiError
export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// HTTP 状态码映射
export const HTTP_STATUS_MAP: Record<ApiErrorCode, number> = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  ServerError: 500,
};

// 自定义错误类
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get httpStatus(): number {
    return HTTP_STATUS_MAP[this.code];
  }
}

// 请求配置
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

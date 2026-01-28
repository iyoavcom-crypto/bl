/**
 * @packageDocumentation
 * @module middleware
 * @since 1.0.0
 * @author Z-Kali
 * @description 中间件模块聚合出口
 * @path src/middleware/index.ts
 *
 * @remarks
 * 模块职责划分：
 * - auth/: JWT 认证与权限守卫
 * - cors/: CORS 跨域配置
 * - logging/: 请求日志记录
 * - rate-limit/: 限流中间件
 * - request/: 请求处理与响应封装
 * - request-id/: 请求标识追踪
 */

/**
 * @description 认证中间件
 */
export {
  requireAuth,
  requireRole,
  requireScopes,
  requireVip,
  requireTeam,
  requireTokenKind,
  requireUserId,
  extractBearerToken,
} from "./auth/index.js";
export type { JwtUserPayload, ExtractResult } from "./auth/index.js";

/**
 * @description CORS 中间件
 */
export { useCorsMiddleware, createCorsOptions } from "./cors/index.js";

/**
 * @description 日志中间件
 */
export { requestLogger, createRequestLogger } from "./logging/index.js";

/**
 * @description 日志配置
 */
export {
  loggingConfig,
  getDefaultLoggingConfig,
  parseSize,
} from "./logging/config.js";
export type {
  LogLevel,
  LoggingConfig,
  FileTransportConfig,
  SamplingConfig,
  SanitizeConfig,
} from "./logging/config.js";

/**
 * @description 限流中间件
 */
export { rateLimit, createRateLimiter } from "./rate-limit/index.js";

/**
 * @description 请求标识中间件
 */
export {
  ensureRequestId,
  REQUEST_ID_HEADER,
  TRACE_ID_HEADER,
} from "./request-id/index.js";

/**
 * @description 请求处理与响应封装
 */
export {
  // 枚举
  HttpStatus,
  ApiCode,
  // 响应函数
  ok,
  created,
  pagedOk,
  empty,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  json,
  // 工具函数
  okBody,
  errorBody,
  buildPagination,
} from "./request/index.js";
export type {
  ApiOk,
  ApiError,
  Pagination,
  OkResponseDto,
  CreatedResponseDto,
  PagedOkResponseDto,
  EmptyResponseDto,
  ErrorResponseDto,
} from "./request/index.js";

/**
 * @description 分页工具
 */
export {
  normalizePagination,
  toLimitOffset,
  clampPagination,
  computePages,
} from "./request/pagination.js";
export type {
  PaginationQueryDto,
  PaginationResultDto,
  PaginationClampConfigDto,
  NormalizedPaginationQueryDto,
  LimitOffsetDto,
} from "./request/pagination.js";

/**
 * @description App ID 中间件
 */
export { extractAppId, requireAppId, APP_IDS } from "./request/app.js";
export type { AppId } from "./request/app.js";

/**
 * @description 全局错误处理中间件
 */
export { globalErrorHandler, notFoundHandler } from "./error-handler/index.js";
export type { AppError } from "./error-handler/index.js";

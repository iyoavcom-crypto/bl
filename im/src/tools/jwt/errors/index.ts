/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-errors
 * @since 1.0.0 (2025-09-14)
 * @author Z-kali
 * @description JWT鉴权错误：错误码、错误对象、类型守卫与工具函数
 * @remarks 无 I/O 副作用
 * @see 统一错误模型与工厂方法
 * @path packages/tools/src/jwt/errors/index.ts
 */

/**
 * @type AuthProblem
 * @description 对外统一错误响应结构
 * @property {AuthErrorCode} code - 错误码
 * @property {string} message - 错误信息
 * @property {number} status - HTTP状态码
 * @property {unknown} [details] - 错误详情
 * @property {Record<string, string[]>} [fields] - 字段错误信息
 */
export type AuthProblem = {
  code: AuthErrorCode;
  message: string;
  status: number;
  details?: unknown;
  fields?: Record<string, string[]>;
};

/**
 * @enum - AuthErrorCode
 * @description 统一错误码（包含鉴权、业务和验证错误）
 * @property {string} MissingToken - 缺少令牌
 * @property {string} Malformed - 格式错误
 * @property {string} Invalid - 无效令牌
 * @property {string} Expired - 令牌过期
 * @property {string} Forbidden - 禁止访问
 * @property {string} DeviceMismatch - 设备不匹配
 * @property {string} UserNotFound - 用户未找到
 * @property {string} PasswordMismatch - 密码不匹配
 * @property {string} Revoked - 令牌已撤销
 * @property {string} UnsupportedAlgorithm - 不支持的算法
 * @property {string} BusinessError - 业务错误
 * @property {string} ValidationError - 验证错误
 * @property {string} EMAIL_EXISTS - 邮箱已存在
 */
export enum AuthErrorCode {
  // 鉴权相关错误
  MissingToken = "MISSING_TOKEN",
  Malformed = "MALFORMED",
  Invalid = "INVALID",
  Expired = "EXPIRED",
  Forbidden = "FORBIDDEN",
  DeviceMismatch = "DEVICE_MISMATCH",
  UserNotFound = "USER_NOT_FOUND",
  PasswordMismatch = "PASSWORD_MISMATCH",
  Revoked = "REVOKED",
  UnsupportedAlgorithm = "UNSUPPORTED_ALG",
  // 业务错误
  BusinessError = "BUSINESS_ERROR",
  // 验证错误
  ValidationError = "VALIDATION_ERROR",
  EMAIL_EXISTS = "EMAIL_EXISTS",
}

/**
 * @class AuthError
 * @description HTTP 鉴权错误对象（可序列化、可日志化、带工厂方法）
 * @extends {Error}
 * @property {AuthErrorCode} code - 错误码
 * @property {number} status - HTTP 状态码
 * @property {string} message - 错误信息
 * @property {unknown} [details] - 额外上下文
 * @property {Record<string, string[]>} [fields] - 验证错误字段
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly fields?: Record<string, string[]>;

  /**
   * @constructor
   * @param {AuthErrorCode} code - 错误码
   * @param {string} message - 错误信息
   * @param {number} [status=401] - HTTP 状态码
   * @param {unknown} [details] - 上下文
   * @param {{cause?: unknown}} [options] - 原因链
   * @param {Record<string, string[]>} [fields] - 验证错误字段
   * @throws {never}
   */
  constructor(
    code: AuthErrorCode,
    message: string,
    status: number = 401,
    details?: unknown,
    options?: { cause?: unknown },
    fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.fields = fields ?? {};

    if (options?.cause) {
      (this as any).cause = options.cause;
    }

    if (Error.captureStackTrace) Error.captureStackTrace(this, AuthError);
  }

  /**
   * @function toJSON
   * @description 转为标准响应体
   * @returns {AuthProblem} 错误响应对象
   * @throws {never}
   */
  toJSON(): AuthProblem {
    return { code: this.code, message: this.message, status: this.status, details: this.details };
  }

  /**
   * @function toLogEntry
   * @description 转为日志对象
   * @returns {Record<string, unknown>} 日志条目对象
   * @throws {never}
   */
  toLogEntry(): Record<string, unknown> {
    return {
      level: "error",
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
      fields: this.fields,
      stack: this.stack,
      cause: (this as unknown as { cause?: unknown }).cause,
    };
  }

  /**
   * @function missingToken
   * @description 缺少授权令牌错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static missingToken(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.MissingToken, "Missing authorization token", 401, details);
  }

  /**
   * @function malformed
   * @description 格式错误错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static malformed(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.Malformed, "Malformed token", 400, details);
  }

  /**
   * @function invalid
   * @description 无效错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static invalid(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.Invalid, "Invalid token", 401, details);
  }

  /**
   * @function expired
   * @description 过期错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static expired(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.Expired, "Token expired", 401, details);
  }

  /**
   * @function forbidden
   * @description 禁止错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static forbidden(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.Forbidden, "Forbidden", 403, details);
  }

  /**
   * @function deviceMismatch
   * @description 设备不匹配错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static deviceMismatch(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.DeviceMismatch, "Device mismatch", 401, details);
  }

  /**
   * @function revoked
   * @description 令牌已被撤销错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static revoked(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.Revoked, "Token revoked", 401, details);
  }

  /**
   * @function unsupportedAlgorithm
   * @description 不支持的签名算法错误
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static unsupportedAlgorithm(details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.UnsupportedAlgorithm, "Unsupported signing algorithm", 400, details);
  }

  /**
   * @function businessError
   * @description 业务错误
   * @param {string} message - 错误信息
   * @param {number} [statusCode=400] - HTTP 状态码
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static businessError(message: string, statusCode: number = 400, details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.BusinessError, message, statusCode, details);
  }

  /**
   * @function validationError
   * @description 验证错误
   * @param {string} message - 错误信息
   * @param {Record<string, string[]>} [fields] - 验证字段错误详情
   * @param {unknown} [details] - 上下文
   * @returns {AuthError} 错误对象实例
   * @throws {never}
   */
  static validationError(message: string, fields?: Record<string, string[]>, details?: unknown): AuthError {
    return new AuthError(AuthErrorCode.ValidationError, message, 422, details, undefined, fields);
  }
}

/**
 * @function isAuthError
 * @description 类型守卫：判断是否为 AuthError
 * @param {unknown} err - 待判定对象
 * @returns {err is AuthError} 类型判定结果
 * @throws {never}
 */
export function isAuthError(err: unknown): err is AuthError {
  return typeof err === "object" && err !== null && (err as { name?: string }).name === "AuthError";
}

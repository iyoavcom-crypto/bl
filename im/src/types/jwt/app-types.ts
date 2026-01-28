/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-types
 * @since 1.0.0
 * @description JWT 应用级载荷类型定义
 * @path src/types/jwt/app-types.ts
 */

import type { TokenKind } from "./user-types.js";

/**
 * @interface JwtAppPayload
 * @description JWT 应用级载荷（用于应用间认证）
 * @property {string} sub - 主体ID（应用ID）
 * @property {string} appId - 应用唯一标识
 * @property {string[]} [scope] - 权限作用域
 * @property {TokenKind} tokenType - 令牌类型
 * @property {string} [jti] - JWT 唯一ID
 * @property {number} [iat] - 签发时间（秒）
 * @property {number} [exp] - 过期时间（秒）
 */
export interface JwtAppPayload {
  sub: string;
  appId: string;
  scope?: string[];
  tokenType: TokenKind;
  jti?: string;
  iat?: number;
  exp?: number;
}

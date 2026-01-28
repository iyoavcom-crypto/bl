/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-scopes
 * @since 1.0.0 (2025-09-21)
 * @description JWT 作用域守卫函数
 */

import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors";

/**
 * @function assertScopes
 * @description 断言作用域至少包含其一
 * @param {JwtUserPayload} p - 业务载荷
 * @param {string[]} required - 至少一个需要的 scope
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当 scope 缺失
 * @example
 * assertScopes(payload, ["admin", "writer"]);
 * @complexity O(n*m) n=required.length, m=scope.length
 * @idempotent true
 */
export function assertScopes(p: JwtUserPayload, required: string[]): JwtUserPayload {
  const scope = p.scope ?? [];
  if (!required.some(s => scope.includes(s))) {
    throw new AuthError(AuthErrorCode.Forbidden, "Scope denied", 403);
  }
  return p;
}

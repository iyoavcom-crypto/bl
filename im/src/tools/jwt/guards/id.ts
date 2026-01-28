/**
 * @file src/utils/jwt/guards/id.ts
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-id
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 守卫：校验用户主体ID (payload.sub)
 */

import { AuthError, AuthErrorCode } from "../errors";
import type { JwtUserPayload } from "@/types/jwt";

/**
 * @function assertUserId
 * @description 断言主体ID（sub）等于目标用户ID
 * @param {JwtUserPayload} p - 业务载荷
 * @param {string} userId - 目标用户ID
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当不匹配
 * @example
 * assertUserId(payload, "u_123");
 * @complexity O(1)
 * @idempotent true
 */
export function assertUserId(p: JwtUserPayload, userId: string): JwtUserPayload {
  if (p.sub !== userId) {
    throw new AuthError(AuthErrorCode.Forbidden, "UserId mismatch", 403);
  }
  return p;
}

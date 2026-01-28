/**
 * @file src/utils/jwt/guards/vip.ts
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-vip
 * @since 1.0.0 (2025-09-12)
 * @description 守卫：校验 VIP 用户资格（payload.vip === true）
 * @see JwtUserPayload
 */

import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors/index";

/**
 * @function assertVip
 * @description 校验用户是否为 VIP（vip === true）
 * @param {JwtUserPayload} p - JWT 业务载荷
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当用户不是 VIP
 * @example
 * assertVip(payload); // 若 payload.vip 为 false 会抛错
 * @complexity O(1)
 * @idempotent true
 */
export function assertVip(p: JwtUserPayload): JwtUserPayload {
  if (!p.vip) {
    throw new AuthError(AuthErrorCode.Forbidden, "VIP required", 403);
  }
  return p;
}

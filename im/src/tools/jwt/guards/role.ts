/**
 * @file src/utils/jwt/guards/role.ts
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-role
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 守卫：校验角色 (payload.roleId / payload.scope)
 */

import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors/index";

/**
 * @function assertRole
 * @description 断言角色满足其一
 * @param {JwtUserPayload} p - 业务载荷
 * @param {string[]} roles - 允许的角色ID集合
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当角色不在允许列表
 * @example
 * assertRole(payload, ["ADMIN", "OP"]);
 * @complexity O(1)
 * @idempotent true
 */
export function assertRole(p: JwtUserPayload, roles: string[]): JwtUserPayload {
  if (!roles.includes(p.roleId)) {
    throw new AuthError(AuthErrorCode.Forbidden, "Role denied", 403);
  }
  return p;
}

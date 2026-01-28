/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-team
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 守卫：校验团队ID (payload.teamId)，支持 null 严格匹配
 */

import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors";

/**
 * @function assertTeam
 * @description 断言团队满足其一（teamId 必须存在且在列表中）
 * @param {JwtUserPayload} p - 业务载荷
 * @param {string[]} teams - 允许的团队ID集合
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当 teamId 为空或不在允许列表
 * @example
 * assertTeam(payload, ["T1", "T2"]);
 * @complexity O(1)
 * @idempotent true
 */
export function assertTeam(p: JwtUserPayload, teams: string[]): JwtUserPayload {
  if (!p.teamId || !teams.includes(p.teamId)) {
    throw new AuthError(AuthErrorCode.Forbidden, "Team denied", 403);
  }
  return p;
}

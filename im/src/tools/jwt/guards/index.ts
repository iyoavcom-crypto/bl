import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors/index";

export { assertDevice } from "./device";
export { assertUserId } from "./id";
export { assertRole } from "./role";
export { assertScopes } from "./scopes";
export { assertTeam } from "./team";
export { assertVip } from "./vip";

/**
 * @function assertTokenKind
 * @description 断言令牌类型
 * @param {JwtUserPayload} payload - 业务载荷
 * @param {"access" | "refresh"} tokenKind - 期望的令牌类型
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} Forbidden 当令牌类型不匹配
 */
export function assertTokenKind(payload: JwtUserPayload, tokenKind: "access" | "refresh") {
  if (payload.tokenType !== tokenKind) {
    throw new AuthError(AuthErrorCode.Forbidden, "Token kind denied", 403);
  }
  return payload;
}

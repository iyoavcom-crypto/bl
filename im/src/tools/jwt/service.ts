
/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-service
 * @since 1.0.0 (2025-09-14)
 * @author Z-kali
 * @description JWT 服务类：签发、验证、刷新令牌
 * @remarks 含异步 I/O 副作用
 * @see 基于 jose 库的 JWT 实现，支持 HS256/RS256 算法
 * @path packages/tools/src/jwt/service.ts
 */


// 运行时与类型导入
import { SignJWT, jwtVerify } from "jose"; // 仅值导入
import type { JWTPayload } from "jose"; // 仅类型导入
import type { KeySecurityConfig as SecurityConfig, KeyProvider } from "@/types/jwt";
import type { JwtUserPayload, TokenKind } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "./errors";
import { nowSec, nanoid, ttlToSeconds } from "./utils";


/**
* @class JwtService
* @description 封装 JWT 签发、校验与刷新轮转逻辑
*/
export class JwtService {
  /** @property {KeyProvider} keys - 密钥提供器 */
  /** @property {SecurityConfig} cfg - 安全配置 */
  constructor(private keys: KeyProvider, private cfg: SecurityConfig) { }


  /**
   * @function signAsync
   * @description 签发 JWT（自动设置 iat/jti/exp/tokenType）
   * @param {TokenKind} kind - 令牌类型
   * @param {JwtUserPayload} payload - 业务载荷
   * @returns {Promise<string>} JWT 串
   */
  async signAsync(kind: TokenKind, payload: JwtUserPayload): Promise<string> {
    const now = nowSec();
    const jti = payload.jti ?? nanoid(16);
    const key = await this.keys.getActiveKeyAsync();
    const kid = await this.keys.getKeyIdAsync?.();
    const ttl = kind === "access"
      ? ttlToSeconds(this.cfg.accessTokenTTL)
      : ttlToSeconds(this.cfg.refreshTokenTTL);
    const merged: JwtUserPayload = { ...payload, tokenType: kind, iat: now, jti };

    const token = await new SignJWT(merged as unknown as JWTPayload)
      .setProtectedHeader({ alg: this.cfg.algorithm, ...(kid !== undefined && { kid }) })
      .setIssuedAt(now)
      .setExpirationTime(now + ttl)
      .setJti(jti)
      .setSubject(payload.sub)
      .sign(key as any);
    return token;
  }


  /**
  * @function verifyAsync
  * @description 验证 JWT 并返回业务载荷
  * @param {string} token - 待验证的 JWT 串
  * @returns {Promise<JwtUserPayload>} 解析后的业务载荷
  * @throws {AuthError} INVALID/EXPIRED
  */
  async verifyAsync(token: string): Promise<JwtUserPayload> {
    try {
      const key = await this.keys.getVerifyKeyAsync();
      const { payload } = await jwtVerify(token, key as any, {
        algorithms: [this.cfg.algorithm],
        clockTolerance: 60, // 允许前后 60 秒时钟偏差
      });
      return payload as unknown as JwtUserPayload;
    } catch (e: unknown) {
      const errorCode = (e as { code?: string })?.code;
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (errorCode === "ERR_JWT_EXPIRED") throw new AuthError(AuthErrorCode.Expired, "Token expired", 401);
      throw new AuthError(AuthErrorCode.Invalid, "Token invalid", 401, { cause: errorMessage });
    }
  }


  /**
  * @function rotateRefreshAsync
  * @description 刷新令牌轮转：校验 refresh，返回新 access 与新 refresh
  * @param {string} refreshToken - 旧的 refresh token
  * @param {(p: JwtUserPayload) => JwtUserPayload} [mutate] - 可选载荷变换
  * @returns {Promise<{ access: string; refresh: string; payload: JwtUserPayload }>} 新令牌与载荷
  * @throws {AuthError} FORBIDDEN 当 tokenType 非 refresh
  */
  async rotateRefreshAsync(
    refreshToken: string,
    mutate?: (p: JwtUserPayload) => JwtUserPayload,
  ): Promise<{ access: string; refresh: string; payload: JwtUserPayload }> {
    const payload = await this.verifyAsync(refreshToken);
    if (payload.tokenType !== "refresh") throw new AuthError(AuthErrorCode.Forbidden, "Require refresh token", 403);
    const nextPayload = mutate ? mutate(payload) : payload;
    const access = await this.signAsync("access", nextPayload);
    const refresh = await this.signAsync("refresh", { ...nextPayload, jti: nanoid(16) });
    return { access, refresh, payload: nextPayload };
  }
}

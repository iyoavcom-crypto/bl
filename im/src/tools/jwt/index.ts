/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt
 * @since 1.0.0 (2025-09-14)
 * @author Z-kali
 * @description JWT 相关功能的统一导出模块（路径：api/web/jwt）
 * @see 汇总导出：服务、密钥、守卫、错误、工具与类型
 * @path packages/tools/src/jwt/index.ts
 */

  /**
   * @description 密钥提供器和安全配置相关导出
   * @exports HSKeyProvider - HMAC-SHA密钥提供器
   * @exports RSKeyProvider - RSA密钥提供器
   * @exports SecurityConfig - 安全配置接口
   * @exports KeyProvider - 密钥提供器接口
   */
  export { createHSKeyProvider, createRSKeyProvider, createKeyProvider } from "./keys";
  export type { KeyProvider } from "@/types/jwt";
  export type { KeySecurityConfig as SecurityConfig } from "@/types/jwt";

  /**
   * @description JWT服务核心功能导出
   * @exports JwtService - JWT服务类
   */
  export { JwtService } from "./service";

  /**
   * @description 错误处理相关导出
   * @exports AuthError - 认证错误类
   * @exports AuthErrorCode - 错误码枚举
   * @exports AuthProblem - 错误问题描述接口
   */
  export { AuthError, AuthErrorCode, isAuthError, type AuthProblem } from "./errors";

  /**
   * @description 工具函数导出
   * @exports ttlToSeconds - TTL转换为秒数
   * @exports nowSec - 获取当前时间戳（秒）
   * @exports nanoid - 生成唯一ID
   * @exports shortId - 生成短ID
   */
  export { ttlToSeconds, nowSec, nanoid, shortId } from "./utils";

  /**
   * @description 类型定义导出
   * @exports JwtUserPayload - JWT 用户载荷接口
   * @exports UserStatus - 用户状态枚举
   * @exports TokenKind - 令牌类型枚举
   */
  export type { JwtUserPayload, JwtAppPayload, TokenKind, UserState } from "@/types/jwt";


  /**
   * @description 守卫函数命名空间导出
   * @namespace Guards
   * @description 守卫函数命名空间
   * @exports assertUserId - 用户ID断言
   * @exports assertRole - 角色断言
   * @exports assertTeam - 团队断言
   * @exports assertTokenKind - 令牌类型断言
   * @exports assertScopes - 作用域断言
   * @exports assertVip - VIP 用户断言
   * @exports assertDevice - 设备绑定断言
   */
  export * as Guards from "./guards";

  /**
   * @function createJwtServiceFromEnv
   * @description 根据环境变量构建 JwtService（支持 HS256/RS256）
   * @returns {JwtService} 服务实例
   */
  import { jwtEnv } from "./jwt-env";
  import { createKeyProvider } from "./keys";
  import { JwtService } from "./service";
  import type { KeyFactoryOptions } from "@/types/jwt/keys";
  import type { KeySecurityConfig as SecurityConfig } from "@/types/jwt";
  export function createJwtServiceFromEnv(): JwtService {
    const opts: KeyFactoryOptions = jwtEnv.JWT_ALGORITHM === "HS256"
        ? {
            algorithm: "HS256",
            hs: { secret: jwtEnv.JWT_SECRET ?? "" },
          }
        : {
            algorithm: "RS256",
            rs: {
              privateKeyPath: jwtEnv.JWT_PRIVATE_KEY_PATH ?? "",
              publicKeyPath: jwtEnv.JWT_PUBLIC_KEY_PATH ?? "",
            },
          };
  

    const provider = createKeyProvider(opts);

    const cfg: SecurityConfig = {
      algorithm: jwtEnv.JWT_ALGORITHM,
      accessTokenTTL: jwtEnv.JWT_ACCESS_TTL,
      refreshTokenTTL: jwtEnv.JWT_REFRESH_TTL,
      enableDeviceBinding: false,
      enableRedisBlacklist: false,
    };

    return new JwtService(provider, cfg);
  }

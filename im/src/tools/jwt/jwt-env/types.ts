/**
 * @packageDocumentation
 * @module @z-kali-config-jwt-env-types
 * @since 1.0.1 (2025-11-09)
 * @description JWT 环境变量类型定义（支持 HS/RS 两种算法）
 */

/**
 * @interface JwtEnv
 * @description JWT 环境变量配置接口
 * @property {"HS256"|"RS256"} JWT_ALGORITHM - 签名算法
 * @property {string} JWT_ACCESS_TTL - 访问令牌有效期，如 "15m"
 * @property {string} JWT_REFRESH_TTL - 刷新令牌有效期，如 "7d"
 * @property {string|undefined} JWT_SECRET - 对称加密密钥（HS256）
 * @property {string|undefined} JWT_PRIVATE_KEY_PATH - 私钥路径（RS256）
 * @property {string|undefined} JWT_PUBLIC_KEY_PATH - 公钥路径（RS256）
 */
export interface JwtEnv {
  JWT_ALGORITHM: "HS256" | "RS256";
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL: string;
  JWT_SECRET: string | undefined;
  JWT_PRIVATE_KEY_PATH: string | undefined;
  JWT_PUBLIC_KEY_PATH: string | undefined;
}

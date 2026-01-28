/**
 * @interface SecurityConfig
 * @description 安全配置
 * @property {string} accessTokenTTL - 访问令牌 TTL，如 "15m"
 * @property {string} refreshTokenTTL - 刷新令牌 TTL，如 "7d"
 * @property {string} refreshWindow - 刷新窗口范围，如 "30m"（提前）或 "-10m"（过期后）
 */
export interface SecurityConfig {
  accessTokenTTL: string;
  refreshTokenTTL: string;
  refreshWindow: string; // 允许提前多久或过期后多久
}

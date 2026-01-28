/**
 * @packageDocumentation
 * @module keys
 * @since 1.0.0 (2025-09-12)
 * @description 提供 HS/RS 密钥加载与 KeyProvider 构建方法（声明文件）
 */

/**
 * @type SupportedAlgorithm
 * @description 支持的 JWT 签名算法
 */
export type SupportedAlgorithm = "HS256" | "RS256";

/**
 * @interface KeySecurityConfig
 * @description 安全配置
 * @property {"HS256"|"RS256"} algorithm - 签名算法
 * @property {string} accessTokenTTL - 访问令牌 TTL，如 "15m"
 * @property {string} refreshTokenTTL - 刷新令牌 TTL，如 "7d"
 * @property {boolean} enableDeviceBinding - 是否启用设备绑定校验
 * @property {boolean} enableRedisBlacklist - 是否启用 Redis 黑名单
 */
export interface KeySecurityConfig {
  algorithm: SupportedAlgorithm;
  accessTokenTTL: string;
  refreshTokenTTL: string;
  enableDeviceBinding: boolean;
  enableRedisBlacklist: boolean;
}

/**
 * @type RuntimeKey
 * @description 运行时密钥类型（WebCrypto 标准）
 */
export type RuntimeKey = Uint8Array | import("node:crypto").webcrypto.CryptoKey;

/**
 * @interface KeyProvider
 * @description 密钥提供器统一接口（对上层屏蔽具体来源与算法）
 * @property {() => Promise<Uint8Array|CryptoKey>} getActiveKeyAsync - 获取活跃密钥（用于签名）
 * @property {() => Promise<Uint8Array|CryptoKey>} getVerifyKeyAsync - 获取验证密钥（用于验签）
 * @property {() => Promise<string|undefined>} [getKeyIdAsync] - 获取密钥 ID（可选）
 */
export interface KeyProvider {
  getActiveKeyAsync(): Promise<RuntimeKey>;
  getVerifyKeyAsync(): Promise<RuntimeKey>;
  getKeyIdAsync?(): Promise<string | undefined>;
}

/**
 * @interface HSKeyOptions
 * @description HS256 对称密钥加载配置
 * @property {string} [secret] - 密钥字符串（优先级最高）
 * @property {string} [secretEnv="JWT_HS_SECRET"] - 环境变量名
 * @property {string} [secretPath] - 文件路径（UTF-8 文本）
 * @property {string} [kid] - 密钥 ID
 */
export interface HSKeyOptions {
  secret?: string;
  secretEnv?: string;
  secretPath?: string;
  kid?: string;
}

/**
 * @interface RSKeyOptions
 * @description RS256 非对称密钥加载配置
 * @property {string} [privateKeyPath] - 私钥文件路径（PKCS#8 PEM）
 * @property {string} [publicKeyPath] - 公钥文件路径（SPKI PEM）
 * @property {string} [privateKeyEnv="JWT_RS_PRIVATE"] - 私钥环境变量名
 * @property {string} [publicKeyEnv="JWT_RS_PUBLIC"] - 公钥环境变量名
 * @property {string} [kid] - 密钥 ID
 */
export interface RSKeyOptions {
  privateKeyPath?: string;
  publicKeyPath?: string;
  privateKeyEnv?: string;
  publicKeyEnv?: string;
  kid?: string;
}

/**
 * @interface KeyFactoryOptions
 * @description 从配置构建 KeyProvider 的参数
 * @property {SupportedAlgorithm} algorithm - 签名算法
 * @property {HSKeyOptions} [hs] - HS 密钥配置
 * @property {RSKeyOptions} [rs] - RS 密钥配置
 */
export interface KeyFactoryOptions {
  algorithm: SupportedAlgorithm;
  hs?: HSKeyOptions;
  rs?: RSKeyOptions;
}

/**
 * @function createHSKeyProvider
 * @description 基于 HS256 构建 KeyProvider
 * @param {HSKeyOptions} options - HS 配置
 * @returns {KeyProvider} KeyProvider 实例
 */
export declare function createHSKeyProvider(options: HSKeyOptions): KeyProvider;

/**
 * @function createRSKeyProvider
 * @description 基于 RS256 构建 KeyProvider
 * @param {RSKeyOptions} options - RS 配置
 * @returns {KeyProvider} KeyProvider 实例
 */
export declare function createRSKeyProvider(options: RSKeyOptions): KeyProvider;

/**
 * @function createKeyProvider
 * @description 根据算法类型构建对应 KeyProvider
 * @param {KeyFactoryOptions} options - 工厂参数
 * @returns {KeyProvider} KeyProvider 实例
 */
export declare function createKeyProvider(options: KeyFactoryOptions): KeyProvider;

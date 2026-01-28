/**
 * @packageDocumentation
 * @module keys
 * @since 1.0.0 (2025-09-12)
 * @description 提供 HS/RS 密钥加载与 KeyProvider 构建方法（执行文件）
 */

import type {
  SupportedAlgorithm,
  HSKeyOptions,
  RSKeyOptions,
  KeyFactoryOptions,
  KeyProvider,
  RuntimeKey,
} from "@/types/jwt"; // ← 按你的实际目录修改

import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { Buffer } from "node:buffer";

const subtle = webcrypto.subtle;

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * @function ensureNonEmpty
 * @description 校验字符串非空，否则抛出错误
 * @param {string|null|undefined} value - 待校验字符串
 * @param {string} message - 错误消息
 * @returns {string} 非空字符串
 */
function ensureNonEmpty(value: string | null | undefined, message: string): string {
  if (!value || !value.trim()) {
    throw new Error(message);
  }
  return value;
}

/**
 * @function readText
 * @description 读取 UTF-8 文本文件
 * @param {string} path - 文件路径
 * @returns {Promise<string>} 文件内容
 */
async function readText(path: string): Promise<string> {
  return readFile(path, { encoding: "utf8" });
}

/**
 * @function utf8
 * @description 文本转 UTF-8 字节数组
 * @param {string} input - 文本
 * @returns {Uint8Array} 字节数组
 */
function utf8(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

/**
 * @function pemToArrayBuffer
 * @description 将 PEM 文本去除头尾后转为 ArrayBuffer
 * @param {string} pem - PEM 文本
 * @returns {ArrayBuffer} 原始二进制数据
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const clean = pem
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("-----BEGIN") && !l.startsWith("-----END"))
    .join("");

  const buf = Buffer.from(clean, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * @function importPrivateKey
 * @description 导入 PKCS#8 私钥 PEM 为 CryptoKey
 * @param {string} pem - 私钥 PEM 文本
 * @returns {Promise<CryptoKey>} 私钥 CryptoKey
 */
async function importPrivateKey(pem: string): Promise<import("node:crypto").webcrypto.CryptoKey> {
  const keyData = pemToArrayBuffer(pem);

  return subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

/**
 * @function importPublicKey
 * @description 导入 SPKI 公钥 PEM 为 CryptoKey
 * @param {string} pem - 公钥 PEM 文本
 * @returns {Promise<CryptoKey>} 公钥 CryptoKey
 */
async function importPublicKey(pem: string): Promise<import("node:crypto").webcrypto.CryptoKey> {
  const keyData = pemToArrayBuffer(pem);

  return subtle.importKey(
    "spki",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

// ---------------------------------------------------------------------------
// HS Provider 实现
// ---------------------------------------------------------------------------

/**
 * @function resolveHSSecret
 * @description 根据 HSKeyOptions 解析对称密钥（secret > env > file）
 * @param {HSKeyOptions} options - HS 配置
 * @returns {Promise<string>} 密钥字符串
 */
async function resolveHSSecret(options: HSKeyOptions): Promise<string> {
  if (options.secret) {
    return ensureNonEmpty(options.secret, "[HS] secret 不能为空");
  }

  const envName = options.secretEnv ?? "JWT_HS_SECRET";
  const fromEnv = process.env[envName];
  if (fromEnv && fromEnv.trim()) {
    return fromEnv;
  }

  if (options.secretPath) {
    const text = await readText(options.secretPath);
    return ensureNonEmpty(text, `[HS] 文件 ${options.secretPath} 内容为空`);
  }

  throw new Error("[HS] 未找到密钥（secret / env / path 均为空）");
}

/**
 * @function createHSKeyProvider
 * @description 基于 HS256 构建 KeyProvider
 * @param {HSKeyOptions} options - HS 配置
 * @returns {KeyProvider} KeyProvider 实例
 */
export function createHSKeyProvider(options: HSKeyOptions): KeyProvider {
  let cachedKey: Uint8Array | undefined;

  async function getKey(): Promise<Uint8Array> {
    if (!cachedKey) {
      const secret = await resolveHSSecret(options);
      cachedKey = utf8(secret);
    }
    return cachedKey;
  }

  const provider: KeyProvider = {
    async getActiveKeyAsync(): Promise<RuntimeKey> {
      return getKey();
    },
    async getVerifyKeyAsync(): Promise<RuntimeKey> {
      return getKey();
    },
    async getKeyIdAsync(): Promise<string | undefined> {
      return options.kid;
    },
  };

  return provider;
}

// ---------------------------------------------------------------------------
// RS Provider 实现
// ---------------------------------------------------------------------------

/**
 * @function resolveRSPrivatePem
 * @description 解析 RSA 私钥 PEM（env > file）
 * @param {RSKeyOptions} options - RS 配置
 * @returns {Promise<string>} 私钥 PEM 文本
 */
async function resolveRSPrivatePem(options: RSKeyOptions): Promise<string> {
  const envName = options.privateKeyEnv ?? "JWT_RS_PRIVATE";
  const fromEnv = process.env[envName];
  if (fromEnv && fromEnv.trim()) {
    return fromEnv;
  }

  if (options.privateKeyPath) {
    const text = await readText(options.privateKeyPath);
    return ensureNonEmpty(text, `[RS] 私钥文件为空: ${options.privateKeyPath}`);
  }

  throw new Error("[RS] 未找到私钥（env / path 均为空）");
}

/**
 * @function resolveRSPublicPem
 * @description 解析 RSA 公钥 PEM（env > file）
 * @param {RSKeyOptions} options - RS 配置
 * @returns {Promise<string>} 公钥 PEM 文本
 */
async function resolveRSPublicPem(options: RSKeyOptions): Promise<string> {
  const envName = options.publicKeyEnv ?? "JWT_RS_PUBLIC";
  const fromEnv = process.env[envName];
  if (fromEnv && fromEnv.trim()) {
    return fromEnv;
  }

  if (options.publicKeyPath) {
    const text = await readText(options.publicKeyPath);
    return ensureNonEmpty(text, `[RS] 公钥文件为空: ${options.publicKeyPath}`);
  }

  throw new Error("[RS] 未找到公钥（env / path 均为空）");
}

/**
 * @function createRSKeyProvider
 * @description 基于 RS256 构建 KeyProvider
 * @param {RSKeyOptions} options - RS 配置
 * @returns {KeyProvider} KeyProvider 实例
 */
export function createRSKeyProvider(options: RSKeyOptions): KeyProvider {
  let privateKey: import("node:crypto").webcrypto.CryptoKey | undefined;
  let publicKey: import("node:crypto").webcrypto.CryptoKey | undefined;

  const provider: KeyProvider = {
    async getActiveKeyAsync(): Promise<RuntimeKey> {
      if (!privateKey) {
        const pem = await resolveRSPrivatePem(options);
        privateKey = await importPrivateKey(pem);
      }
      return privateKey;
    },

    async getVerifyKeyAsync(): Promise<RuntimeKey> {
      if (!publicKey) {
        const pem = await resolveRSPublicPem(options);
        publicKey = await importPublicKey(pem);
      }
      return publicKey;
    },

    async getKeyIdAsync(): Promise<string | undefined> {
      return options.kid;
    },
  };

  return provider;
}

// ---------------------------------------------------------------------------
// 工厂：根据算法创建统一 KeyProvider
// ---------------------------------------------------------------------------

/**
 * @function createKeyProvider
 * @description 根据算法类型构建对应 KeyProvider
 * @param {KeyFactoryOptions} options - 工厂参数
 * @returns {KeyProvider} KeyProvider 实例
 */
export function createKeyProvider(options: KeyFactoryOptions): KeyProvider {
  const algorithm: SupportedAlgorithm = options.algorithm;

  if (algorithm === "HS256") {
    if (!options.hs) {
      throw new Error("HS256 需要提供 hs 配置（HSKeyOptions）");
    }
    return createHSKeyProvider(options.hs);
  }

  if (algorithm === "RS256") {
    if (!options.rs) {
      throw new Error("RS256 需要提供 rs 配置（RSKeyOptions）");
    }
    return createRSKeyProvider(options.rs);
  }

  throw new Error(`不支持的算法：${algorithm}`);
}

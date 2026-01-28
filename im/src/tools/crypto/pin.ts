/**
 * @packageDocumentation
 * @module crypto-pin
 * @since 1.3.3 (2025-11-09)
 * @author Z-kali
 * @description 提供基于 AES-256-GCM 的 PIN 加解密工具（使用 HKDF 派生密钥），PIN 固定为 6 位纯数字。
 * @see packages/src/tools/crypto/aesgcm.ts
 */

import { hkdf, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import type { AesGcmPayload, SymmetricKey } from "./aesgcm";
import { encrypt as aesGcmEncrypt, decrypt as aesGcmDecrypt } from "./aesgcm";

const hkdfAsync = promisify(hkdf);

/** @constant HKDF_INFO @description HKDF info 参数，用于密钥派生上下文隔离 */
const HKDF_INFO = "pin-encryption-v1";

/** @constant HKDF_SALT_LENGTH @description HKDF salt 长度（字节） */
const HKDF_SALT_LENGTH = 16;

/**
 * @function assertPin6
 * @description 断言 PIN 为 6 位纯数字（"000000" ~ "999999"）
 * @param {string} pin - 明文 PIN
 * @throws {Error} 当 PIN 非法
 */
export function assertPin6(pin: string): void {
  if (!/^\d{6}$/.test(pin)) throw new Error("二级密码必须是6位数的数字");
}

/**
 * @function deriveKeyFromSecret
 * @description 从字符串 secret 使用 HKDF 派生 32 字节对称密钥
 * @param {string} secret - 密钥字符串（长度需 ≥16）
 * @param {Buffer} salt - HKDF salt（16 字节）
 * @param {string} [kid="env:PIN_SECRET"] - 密钥ID（便于追踪来源）
 * @returns {Promise<SymmetricKey>} 对称密钥实体
 * @throws {Error} 当 secret 为空或长度不足
 */
export async function deriveKeyFromSecret(
  secret: string,
  salt: Buffer,
  kid: string = "env:PIN_SECRET"
): Promise<SymmetricKey> {
  const s = (secret ?? "").trim();
  if (s.length < 16) throw new Error("PIN secret 长度不足（≥16）");
  if (salt.length !== HKDF_SALT_LENGTH) throw new Error(`HKDF salt 必须为 ${HKDF_SALT_LENGTH} 字节`);
  const key = await hkdfAsync("sha256", s, salt, HKDF_INFO, 32);
  return { kid, key: Buffer.from(key) };
}

/**
 * @interface PinPayload
 * @description PIN 加密载荷（包含 HKDF salt）
 */
export interface PinPayload {
  v: 2; // 版本号，区分旧版
  salt: string; // base64url(HKDF salt)
  payload: AesGcmPayload;
}

/**
 * @function encryptPin
 * @description 使用 AES-256-GCM 加密 PIN，返回序列化载荷字符串（JSON）
 * @param {string} pin - 明文 PIN（必须为 6 位纯数字）
 * @param {string} secret - 密钥字符串（长度需 ≥16）
 * @returns {Promise<string>} 加密载荷字符串（JSON）
 * @throws {Error} 当 PIN 非法
 * @example
 * const s = await encryptPin("123456", process.env.PIN_SECRET!);
 */
export async function encryptPin(pin: string, secret: string): Promise<string> {
  assertPin6(pin);

  const salt = randomBytes(HKDF_SALT_LENGTH);
  const key = await deriveKeyFromSecret(secret, salt);
  const aesPayload = aesGcmEncrypt(Buffer.from(pin, "utf8"), key);

  const result: PinPayload = {
    v: 2,
    salt: salt.toString("base64url"),
    payload: aesPayload,
  };
  return JSON.stringify(result);
}

/**
 * @function decryptPin
 * @description 使用 AES-256-GCM 解密 PIN（从序列化载荷字符串还原明文），并校验为 6 位纯数字
 * @param {string} payloadJson - 加密载荷字符串（JSON）
 * @param {string} secret - 密钥字符串（长度需 ≥16）
 * @returns {Promise<string>} 明文 PIN（6 位纯数字）
 * @throws {Error} 当解密后 PIN 非法
 * @example
 * const plain = await decryptPin(cipherText, process.env.PIN_SECRET!);
 */
export async function decryptPin(payloadJson: string, secret: string): Promise<string> {
  const parsed = JSON.parse(payloadJson) as PinPayload | AesGcmPayload;

  let key: SymmetricKey;
  let aesPayload: AesGcmPayload;

  // 兼容 v2 和 v1 格式
  if ("v" in parsed && parsed.v === 2 && "salt" in parsed) {
    const v2 = parsed as PinPayload;
    const salt = Buffer.from(v2.salt, "base64url");
    key = await deriveKeyFromSecret(secret, salt);
    aesPayload = v2.payload;
  } else {
    // v1 兼容：使用固定 salt（仅用于迁移旧数据）
    throw new Error("不支持的 PIN 载荷版本，请重新加密");
  }

  const buf = aesGcmDecrypt(aesPayload, key);
  const pin = buf.toString("utf8");
  assertPin6(pin);
  return pin;
}

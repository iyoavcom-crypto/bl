// src/crypto/aesgcm.ts
/**
 * @packageDocumentation
 * @module crypto-aesgcm
 * @since 1.3.2 (2025-10-19)
 * @author Z-kali
 * @description 提供 AES-256-GCM 加解密（随机IV，附加认证数据AAD可选）
 * @see：src/crypto/kms.ts
 */

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";

/** 
 * @internal base64url 工具 
 * @description 提供 base64url 编码解码
 * @param {Buffer} b - 输入缓冲区
 * @returns {string} base64url 编码字符串
*/
const b64u = (b: Buffer): string => b.toString("base64url");
const ub64u = (s: string) => Buffer.from(s, "base64url");

/** 
 * @interface AesGcmPayload
 * @description AES-256-GCM 加密载荷
 * @property {number} v - 版本号，当前为1
 * @property {string} alg - 算法，固定为"AES-256-GCM"
 * @property {string} kid - 密钥ID
 * @property {string} iv - base64url(12B)
 * @property {string} tag - base64url(16B)
 * @property {string} ct - base64url(ciphertext)
 * @property {string} [aad] - base64url(AAD)
*/
export interface AesGcmPayload {
  v: 1;                // 版本
  alg: "AES-256-GCM";
  kid: string;         // key id
  iv: string;          // base64url(12B)
  tag: string;         // base64url(16B)
  ct: string;          // base64url(ciphertext)
  aad?: string;        // base64url(AAD)
}

/**
 * @interface SymmetricKey
 * @description 对称密钥实体
 * @property {string} kid - 密钥ID
 * @property {Buffer} key - 32字节key
 */
export interface SymmetricKey { kid: string; key: Buffer; }

/**
 * @function encrypt
 * @description AES-256-GCM 加密，返回可序列化载荷
 * @param {Buffer} plain - 明文
 * @param {SymmetricKey} key - 密钥实体
 * @param {Buffer} [aad] - 附加认证数据（可选）
 * @returns {AesGcmPayload} 加密载荷
 */
export function encrypt(plain: Buffer, key: SymmetricKey, aad?: Buffer): AesGcmPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key.key, iv, { authTagLength: 16 });
  if (aad) cipher.setAAD(aad);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  const result: AesGcmPayload = { v: 1, alg: "AES-256-GCM", kid: key.kid, iv: b64u(iv), tag: b64u(tag), ct: b64u(ct) };
  if (aad) result.aad = b64u(aad);
  return result;
}

/**
 * @function decrypt
 * @description AES-256-GCM 解密，若认证失败抛错
 * @param {AesGcmPayload} payload - 加密载荷
 * @param {SymmetricKey} key - 密钥实体
 * @returns {Buffer} 明文
 * @throws {Error} 若认证失败
 */
export function decrypt(payload: AesGcmPayload, key: SymmetricKey): Buffer {
  const iv = ub64u(payload.iv);
  const tag = ub64u(payload.tag);
  const ct = ub64u(payload.ct);
  const aad = payload.aad ? ub64u(payload.aad) : undefined;
  const decipher = createDecipheriv("aes-256-gcm", key.key, iv, { authTagLength: 16 });
  if (aad) decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/** 
 * @function safeKidEqual 
 * @description 常量时间比较 kid，避免侧信道 
 * @param {string} a - 密钥ID1
 * @param {string} b - 密钥ID2
 * @returns {boolean} 是否相等
 */
export function safeKidEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

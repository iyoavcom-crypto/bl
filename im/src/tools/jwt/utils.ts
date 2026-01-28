/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-utils
 * @since 1.0.0 (2025-09-14)
 * @author Z-kali
 * @description JWT 工具函数：TTL 解析、时间戳、随机 ID 生成
 * @remarks 无 I/O 副作用
 * @path packages/tools/src/jwt/utils.ts
 */

import { randomBytes } from "node:crypto";

/** 预编译正则与单位表，避免重复分配 */
const TTL_RE = /^(\d+)\s*([smhd])$/i;
const UNIT_SEC = { s: 1, m: 60, h: 3600, d: 86400 } as const;

/**
 * @function ttlToSeconds
 * @description 将 "15m"|"7d"|"3600s"|"1h" 或纯数字秒字符串转为秒；空白会被忽略
 * @param {string} ttl - TTL 字符串
 * @returns {number} 秒
 * @throws {Error} 无法解析时抛错
 */
export function ttlToSeconds(ttl: string): number {
  const t = ttl.trim();
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(TTL_RE);
  if (!m) throw new Error(`Invalid TTL format: ${ttl}`);
  const n = Number(m[1]);
  const u = m[2]?.toLowerCase() as keyof typeof UNIT_SEC;
  if (!u || !(u in UNIT_SEC)) throw new Error(`Invalid TTL unit: ${m[2]}`);
  return n * UNIT_SEC[u];
}

/**
 * @function nowSec
 * @description 当前秒级时间戳
 * @returns {number} 秒
 */
export const nowSec = (): number => Math.trunc(Date.now() / 1000);

/**
 * @function shortId
 * @description 简短 URL-safe ID（固定 16 字符，约 12 字节 ≈ 96 bit 熵）
 * @returns {string} id
 */
export function shortId(): string {
  // 12 字节 → Base64url 无填充后为 16 字符
  return randomBytes(12).toString("base64url");
}

/**
 * @function nanoid
 * @description 生成 URL-safe 随机串（固定长度，使用加密随机）
 * @param {number} size - 输出长度（1–1024）
 * @returns {string} 随机字符串
 * @throws {Error} size 非法时抛错
 */
export function nanoid(size: number): string {
  if (!Number.isInteger(size) || size < 1 || size > 1024) {
    throw new Error(`Invalid size: ${size}. expected 1–1024`);
  }
  // 反推需要的字节数：ceil(size * 3 / 4)，多取 2 字节做冗余，避免切片不足
  const need = Math.ceil((size * 3) / 4) + 2;
  return randomBytes(need).toString("base64url").slice(0, size);
}

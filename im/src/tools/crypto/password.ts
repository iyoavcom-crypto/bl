// src/crypto/password.ts
/**
 * @packageDocumentation
 * @module crypto-password
 * @since 1.3.2 (2025-10-19)
 * @author Z-kali
 * @description 提供口令的 scrypt 单向哈希与校验（仅导出 hashPassword/verifyPassword）
 */

import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cryptoEnv } from "./crypto-env";

/** @constant SCRYPT @description scrypt 参数（冻结） */
const SCRYPT = Object.freeze({ N: 32768, r: 8, p: 1, keylen: 32, maxmem: 64 * 1024 * 1024 });

/** @internal scrypt Promise 化 */
const scryptAsync = promisify(_scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  opt: Readonly<{ N: number; r: number; p: number; maxmem?: number }>
) => Promise<Buffer>;

/** @internal base64url 工具 */
const b64u = (buf: Buffer) => buf.toString("base64url");
const ub64u = (s: string) => Buffer.from(s, "base64url");
const constEq = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/** @internal 获取 pepper */
const getPepper = (): string => cryptoEnv.PASSWORD_PEPPER ?? "";

/** @constant HASH_VERSION @description 当前哈希版本 */
const HASH_VERSION = 2;

/**
 * @interface ParsedHash
 * @description 解析后的哈希结构
 */
interface ParsedHash {
  version: number;
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
  peppered: boolean;
}

/**
 * @function parseHash
 * @description 解析存储的哈希字符串
 * @param {string} stored - 存储的哈希串
 * @returns {ParsedHash | null} 解析结果或 null
 */
function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split("$");

  // v2 格式: scrypt$2$N$r$p$salt$dk$peppered
  if (parts.length === 8 && parts[0] === "scrypt" && parts[1] === "2") {
    const N = Number(parts[2]), r = Number(parts[3]), p = Number(parts[4]);
    if (![N, r, p].every(Number.isSafeInteger)) return null;
    const peppered = parts[7] === "1";
    return {
      version: 2,
      N, r, p,
      salt: ub64u(parts[5]!),
      hash: ub64u(parts[6]!),
      peppered,
    };
  }

  // v1 格式: scrypt$N$r$p$salt$dk (无 pepper 标记)
  if (parts.length === 6 && parts[0] === "scrypt") {
    const N = Number(parts[1]), r = Number(parts[2]), p = Number(parts[3]);
    if (![N, r, p].every(Number.isSafeInteger)) return null;
    return {
      version: 1,
      N, r, p,
      salt: ub64u(parts[4]!),
      hash: ub64u(parts[5]!),
      peppered: false, // v1 格式无法确定，需尝试两种方式
    };
  }

  return null;
}

/**
 * @function verifyHashInternal
 * @description 内部验证函数
 * @returns 验证结果
 */
async function verifyHashInternal(
  password: string,
  parsed: ParsedHash
): Promise<{ ok: boolean; usedPepper: boolean }> {
  const { N, r, p, salt, hash, version, peppered } = parsed;
  const pepper = getPepper();
  const hasPepper = pepper.length >= 16;

  // v2 格式：根据 peppered 标记决定验证方式
  if (version === 2) {
    if (peppered) {
      if (!hasPepper) {
        // 哈希需要 pepper，但当前环境无有效 pepper
        return { ok: false, usedPepper: false };
      }
      const dk = await scryptAsync(password + pepper, salt, hash.length, { N, r, p, maxmem: SCRYPT.maxmem });
      return { ok: constEq(dk, hash), usedPepper: true };
    } else {
      const dk = await scryptAsync(password, salt, hash.length, { N, r, p, maxmem: SCRYPT.maxmem });
      return { ok: constEq(dk, hash), usedPepper: false };
    }
  }

  // v1 格式：需要尝试两种方式（兼容迁移）
  if (hasPepper) {
    const dkPepper = await scryptAsync(password + pepper, salt, hash.length, { N, r, p, maxmem: SCRYPT.maxmem });
    if (constEq(dkPepper, hash)) {
      return { ok: true, usedPepper: true };
    }
  }

  const dkNoPepper = await scryptAsync(password, salt, hash.length, { N, r, p, maxmem: SCRYPT.maxmem });
  return { ok: constEq(dkNoPepper, hash), usedPepper: false };
}

/**
 * @function hashPassword
 * @description 生成 scrypt 哈希：`scrypt$2$N$r$p$salt$dk$peppered`
 * @param {string} password - 明文口令
 * @returns {Promise<string>} 哈希串
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error("密码不能为空");
  const pepper = getPepper();
  if (pepper.length < 16) throw new Error("缺少或过短的 PASSWORD_PEPPER（至少16位）");
  const salt = randomBytes(16);
  const dk = await scryptAsync(password + pepper, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${HASH_VERSION}$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${b64u(salt)}$${b64u(dk)}$1`;
}

/**
 * @function verifyPassword
 * @description 校验明文是否匹配 scrypt 哈希
 * @param {string} password - 明文
 * @param {string} stored - 哈希串
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parsed = parseHash(stored);
    if (!parsed) return false;
    const result = await verifyHashInternal(password, parsed);
    return result.ok;
  } catch {
    return false;
  }
}

/**
 * @function verifyPasswordUpgrade
 * @description 校验并判断是否需要升级（pepper 或成本参数），如需要则给出新哈希
 * @returns {Promise<{ ok: boolean; needsRehash: boolean; newHash?: string }>} 校验结果与升级建议
 */
export async function verifyPasswordUpgrade(
  password: string,
  stored: string
): Promise<{ ok: boolean; needsRehash: boolean; newHash?: string }> {
  try {
    const parsed = parseHash(stored);
    if (!parsed) return { ok: false, needsRehash: false };

    const result = await verifyHashInternal(password, parsed);
    if (!result.ok) return { ok: false, needsRehash: false };

    const pepper = getPepper();
    const hasPepper = pepper.length >= 16;

    // 检查是否需要升级
    const needsCostUpgrade =
      parsed.N < SCRYPT.N ||
      parsed.r < SCRYPT.r ||
      parsed.p < SCRYPT.p ||
      parsed.hash.length !== SCRYPT.keylen;
    const needsVersionUpgrade = parsed.version < HASH_VERSION;
    const needsPepperUpgrade = hasPepper && !result.usedPepper;

    const needsRehash = needsCostUpgrade || needsVersionUpgrade || needsPepperUpgrade;

    if (needsRehash) {
      const newHash = await hashPassword(password);
      return { ok: true, needsRehash: true, newHash };
    }
    return { ok: true, needsRehash: false };
  } catch {
    return { ok: false, needsRehash: false };
  }
}

// src/crypto/kms.ts
/**
 * @packageDocumentation
 * @module crypto-kms
 * @since 1.3.2 (2025-10-23)
 * @author Z-kali
 * @description KeyProvider 接口与默认 EnvKeyProvider；生产环境需自行实现密钥轮换
 */

import { randomUUID } from "node:crypto";
import process from "node:process";
import type { SymmetricKey } from "./aesgcm";

/**
 * @interface KeyProvider
 * @description 密钥提供器接口
 * @property {Function} getActiveKey - 获取当前激活密钥
 * @property {Function} getKeyById - 按 KID 获取历史密钥
 */
export interface KeyProvider {
  /**
   * @function getActiveKey
   * @description 获取当前激活密钥
   * @returns {Promise<SymmetricKey>} 当前激活密钥实体
   */
  getActiveKey(): Promise<SymmetricKey>;

  /**
   * @function getKeyById
   * @description 按 KID 获取历史密钥
   * @param {string} kid - 密钥ID
   * @returns {Promise<SymmetricKey|null>} 历史密钥实体或 null
   */
  getKeyById(kid: string): Promise<SymmetricKey | null>;
}

/**
 * @class EnvKeyProvider
 * @description 基于环境变量的密钥提供器（单密钥，不支持自动轮换）
 *
 * 生产环境建议：
 * 1. 实现自定义 KeyProvider，集成密钥管理服务（如 AWS KMS、HashiCorp Vault）
 * 2. 支持多密钥存储以便解密历史数据
 * 3. 实现基于时间或策略的密钥轮换
 */
export class EnvKeyProvider implements KeyProvider {
  private active: SymmetricKey;
  private readonly archive = new Map<string, SymmetricKey>();
  private readonly createdAt: Date;

  /**
   * @constructor
   * @description 初始化密钥提供器，加载主密钥
   * @throws {Error} 当 DATA_MASTER_KEY 缺失或长度不合法时抛出
   */
  constructor() {
    const { DATA_MASTER_KEY, DATA_MASTER_KEY_KID } = process.env as Record<string, string | undefined>;
    const raw = DATA_MASTER_KEY;
    if (!raw) throw new Error("缺少 DATA_MASTER_KEY");
    const key = Buffer.from(raw, "base64url");
    if (key.length !== 32) throw new Error("DATA_MASTER_KEY 必须为32字节 base64url");
    const kid = DATA_MASTER_KEY_KID || randomUUID();
    this.active = { kid, key };
    this.archive.set(kid, this.active);
    this.createdAt = new Date();
  }

  /**
   * @function getActiveKey
   * @description 返回当前激活密钥
   * @returns {Promise<SymmetricKey>} 当前密钥实体
   */
  async getActiveKey(): Promise<SymmetricKey> {
    return this.active;
  }

  /**
   * @function getKeyById
   * @description 按 KID 检索密钥
   * @param {string} kid - 密钥ID
   * @returns {Promise<SymmetricKey|null>} 匹配密钥或 null
   */
  async getKeyById(kid: string): Promise<SymmetricKey | null> {
    return this.archive.get(kid) ?? null;
  }

  /**
   * @function addArchivedKey
   * @description 添加历史密钥（用于解密旧数据）
   * @param {SymmetricKey} key - 历史密钥
   */
  addArchivedKey(key: SymmetricKey): void {
    if (key.key.length !== 32) throw new Error("密钥必须为32字节");
    this.archive.set(key.kid, key);
  }

  /**
   * @function getKeyAge
   * @description 获取当前密钥使用天数
   * @returns {number} 密钥使用天数
   */
  getKeyAge(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}

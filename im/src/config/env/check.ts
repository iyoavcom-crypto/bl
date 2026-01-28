/**
 * @packageDocumentation
 * @module env/check
 * @description 启动前环境变量检测模块
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import {
  generateJwtSecret,
  generatePinSecret,
  generatePasswordPepper,
} from "./generate-secrets.js";

/**
 * @constant INSECURE_VALUES
 * @description 不安全的默认值列表
 */
const INSECURE_VALUES = new Set([
  "your-secret-key-change-me",
  "your-pin-secret-key-must-be-16-chars",
  "your-password-pepper",
  "dev-secret",
  "dev-pin-secret",
  "dev-pepper",
  "secret",
  "password",
  "changeme",
  "change-me",
  "",
]);

/**
 * @interface SecretCheckResult
 * @description 单个密钥检测结果
 */
export interface SecretCheckResult {
  key: string;
  isValid: boolean;
  reason?: string;
}

/**
 * @interface EnvCheckResult
 * @description 环境检测结果
 */
export interface EnvCheckResult {
  allValid: boolean;
  results: SecretCheckResult[];
  generatedKeys?: string[];
}

/**
 * @function isValidSecret
 * @description 检测密钥是否有效
 * @param {string} key - 环境变量名
 * @param {string | undefined} value - 环境变量值
 * @param {number} minLength - 最小长度要求
 * @returns {SecretCheckResult} 检测结果
 */
function isValidSecret(
  key: string,
  value: string | undefined,
  minLength: number
): SecretCheckResult {
  if (!value || value.trim() === "") {
    return { key, isValid: false, reason: "未设置" };
  }

  const trimmed = value.trim().toLowerCase();
  if (INSECURE_VALUES.has(trimmed) || INSECURE_VALUES.has(value.trim())) {
    return { key, isValid: false, reason: "使用了不安全的默认值" };
  }

  if (value.length < minLength) {
    return { key, isValid: false, reason: `长度不足 ${minLength} 字符` };
  }

  return { key, isValid: true };
}

/**
 * @function checkSecrets
 * @description 检测所有安全密钥
 * @returns {SecretCheckResult[]} 检测结果数组
 */
export function checkSecrets(): SecretCheckResult[] {
  return [
    isValidSecret("JWT_SECRET", process.env.JWT_SECRET, 32),
    isValidSecret("PIN_SECRET", process.env.PIN_SECRET, 16),
    isValidSecret("PASSWORD_PEPPER", process.env.PASSWORD_PEPPER, 16),
  ];
}

/**
 * @function updateEnvFile
 * @description 更新 .env 文件中的密钥
 * @param {string} envPath - .env 文件路径
 * @param {Record<string, string>} updates - 需要更新的键值对
 */
function updateEnvFile(envPath: string, updates: Record<string, string>): void {
  let content = "";

  if (existsSync(envPath)) {
    content = readFileSync(envPath, "utf-8");
  }

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const newLine = `${key}=${value}`;

    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content = content.trimEnd() + `\n${newLine}\n`;
    }
  }

  writeFileSync(envPath, content, "utf-8");
}

/**
 * @function checkAndGenerateSecrets
 * @description 检测环境变量并自动生成缺失或不安全的密钥
 * @param {object} options - 配置选项
 * @param {boolean} options.autoGenerate - 是否自动生成缺失的密钥（默认 true）
 * @param {boolean} options.silent - 是否静默模式（默认 false）
 * @returns {EnvCheckResult} 检测结果
 */
export function checkAndGenerateSecrets(
  options: { autoGenerate?: boolean; silent?: boolean } = {}
): EnvCheckResult {
  const { autoGenerate = true, silent = false } = options;
  const envPath = resolve(process.cwd(), ".env");

  // 首先加载 .env 文件
  loadEnv({ path: envPath });

  const results = checkSecrets();
  const invalidResults = results.filter((r) => !r.isValid);

  if (invalidResults.length === 0) {
    if (!silent) {
      console.log("[ENV CHECK] ✓ 所有安全密钥已正确配置");
    }
    return { allValid: true, results };
  }

  if (!autoGenerate) {
    if (!silent) {
      console.warn("[ENV CHECK] ✗ 以下密钥未达标:");
      for (const r of invalidResults) {
        console.warn(`  - ${r.key}: ${r.reason}`);
      }
    }
    return { allValid: false, results };
  }

  // 自动生成缺失的密钥
  const updates: Record<string, string> = {};
  const generatedKeys: string[] = [];

  for (const r of invalidResults) {
    let newValue: string;
    switch (r.key) {
      case "JWT_SECRET":
        newValue = generateJwtSecret();
        break;
      case "PIN_SECRET":
        newValue = generatePinSecret();
        break;
      case "PASSWORD_PEPPER":
        newValue = generatePasswordPepper();
        break;
      default:
        continue;
    }
    updates[r.key] = newValue;
    generatedKeys.push(r.key);
    process.env[r.key] = newValue;
  }

  if (Object.keys(updates).length > 0) {
    updateEnvFile(envPath, updates);
    if (!silent) {
      console.log("[ENV CHECK] ⚡ 已自动生成以下密钥并写入 .env:");
      for (const key of generatedKeys) {
        console.log(`  - ${key}`);
      }
    }
  }

  // 重新检测
  const finalResults = checkSecrets();
  const allValid = finalResults.every((r) => r.isValid);

  if (!silent && allValid) {
    console.log("[ENV CHECK] ✓ 所有安全密钥现已正确配置");
  }

  return { allValid, results: finalResults, generatedKeys };
}

/**
 * @function ensureSecrets
 * @description 确保所有密钥有效，否则抛出错误（用于生产环境）
 * @param {boolean} allowGenerate - 是否允许自动生成（生产环境建议设为 false）
 */
export function ensureSecrets(allowGenerate = true): void {
  const result = checkAndGenerateSecrets({
    autoGenerate: allowGenerate,
    silent: false,
  });

  if (!result.allValid) {
    const invalidKeys = result.results
      .filter((r) => !r.isValid)
      .map((r) => r.key)
      .join(", ");
    throw new Error(
      `[ENV CHECK] 安全密钥配置无效: ${invalidKeys}。请在 .env 文件中设置有效的密钥。`
    );
  }
}

export default checkAndGenerateSecrets;

/**
 * @packageDocumentation
 * @module env/generate-secrets
 * @description 安全密钥生成工具
 */

import { randomBytes } from "node:crypto";

/**
 * @interface GeneratedSecrets
 * @description 生成的密钥对象
 */
export interface GeneratedSecrets {
  JWT_SECRET: string;
  PIN_SECRET: string;
  PASSWORD_PEPPER: string;
}

/**
 * @function generateSecureSecret
 * @description 生成指定长度的安全随机密钥（Base64编码）
 * @param {number} length - 字节长度
 * @returns {string} Base64编码的密钥
 */
export function generateSecureSecret(length: number): string {
  return randomBytes(length).toString("base64");
}

/**
 * @function generateJwtSecret
 * @description 生成 JWT 密钥（64字节 = 512位）
 * @returns {string} JWT 密钥
 */
export function generateJwtSecret(): string {
  return generateSecureSecret(64);
}

/**
 * @function generatePinSecret
 * @description 生成 PIN 加密密钥（32字节 = 256位，适用于 AES-256）
 * @returns {string} PIN 密钥
 */
export function generatePinSecret(): string {
  return generateSecureSecret(32);
}

/**
 * @function generatePasswordPepper
 * @description 生成密码胡椒（32字节 = 256位）
 * @returns {string} 密码胡椒
 */
export function generatePasswordPepper(): string {
  return generateSecureSecret(32);
}

/**
 * @function generateAllSecrets
 * @description 生成所有必需的安全密钥
 * @returns {GeneratedSecrets} 包含所有密钥的对象
 */
export function generateAllSecrets(): GeneratedSecrets {
  return {
    JWT_SECRET: generateJwtSecret(),
    PIN_SECRET: generatePinSecret(),
    PASSWORD_PEPPER: generatePasswordPepper(),
  };
}

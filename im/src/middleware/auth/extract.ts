/**
 * @packageDocumentation
 * @module middleware/auth/extract
 * @since 1.0.0
 * @author Z-Kali
 * @description Token 提取：从请求头提取 Bearer Token
 * @path src/middleware/auth/extract.ts
 */

import type { Request } from "express";
import { AuthError } from "@/tools/jwt/index.js";

/**
 * @interface ExtractResult
 * @description Token 提取结果（成功或失败）
 */
export type ExtractResult =
  | { success: true; token: string }
  | { success: false; error: AuthError };

/**
 * @function extractBearerToken
 * @description 从 Authorization 头提取 Bearer Token
 * @param {Request} req - Express 请求对象
 * @returns {ExtractResult} 提取结果
 */
export function extractBearerToken(req: Request): ExtractResult {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { success: false, error: AuthError.missingToken() };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: AuthError.malformed({ reason: "Authorization header must start with 'Bearer '" }),
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      success: false,
      error: AuthError.missingToken({ reason: "Empty token after 'Bearer '" }),
    };
  }

  return { success: true, token };
}

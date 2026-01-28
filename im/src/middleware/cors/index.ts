/**
 * @packageDocumentation
 * @module middleware/cors
 * @since 1.0.0
 * @author Z-Kali
 * @tags [cors],[middleware],[security],[express]
 * @description CORS 中间件：构建 CorsOptions 并返回可用的 Express 中间件
 * @path src/middleware/cors/index.ts
 * @see https://www.npmjs.com/package/cors
 */

import cors, { type CorsOptions } from "cors";
import type { RequestHandler } from "express";

/**
 * @function createCorsOptions
 * @description 动态允许 localhost、本机 IP、局域网访问
 * @returns {CorsOptions} cors 配置
 */
export function createCorsOptions(): CorsOptions {
  return {
    origin: true, // Mirror request origin
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id", "x-app-id", "x-request-id"],
    exposedHeaders: ["x-request-id"],
    credentials: true, // CRITICAL!
    optionsSuccessStatus: 204,
  };
}

/**
 * @function useCorsMiddleware
 * @description 返回带有自定义 origin 规则的 CORS 中间件
 * @returns {RequestHandler} Express 中间件
 */
export function useCorsMiddleware(): RequestHandler {
  return cors(createCorsOptions());
}

/**
 * @packageDocumentation
 * @module middleware/auth/verify
 * @since 1.0.0
 * @author Z-Kali
 * @description Token 验证中间件：验证 Bearer Token 并附加用户载荷到 req.user
 * @path src/middleware/auth/verify.ts
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createJwtServiceFromEnv, JwtService, isAuthError } from "@/tools/jwt/index.js";
import { extractBearerToken } from "./extract.js";
import "./types.js";

/**
 * @description JWT 服务单例（延迟初始化）
 */
let jwtService: JwtService | null = null;

/**
 * @function getJwtService
 * @description 获取 JWT 服务单例
 * @returns {JwtService} JWT 服务实例
 */
function getJwtService(): JwtService {
  if (!jwtService) {
    jwtService = createJwtServiceFromEnv();
  }
  return jwtService;
}

/**
 * @function requireAuth
 * @description JWT 认证中间件：验证 Bearer Token 并将解码载荷附加到 req.user
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 * @returns {Promise<void>}
 */
export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const extraction = extractBearerToken(req);

  if (!extraction.success) {
    res.status(extraction.error.status).json(extraction.error.toJSON());
    return;
  }

  try {
    const service = getJwtService();
    const payload = await service.verifyAsync(extraction.token);
    req.user = payload;
    req.auth = payload;
    next();
  } catch (err: unknown) {
    if (isAuthError(err)) {
      res.status(err.status).json(err.toJSON());
      return;
    }
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Authentication service error",
      status: 500,
    });
  }
};

/**
 * @packageDocumentation
 * @module websocket/connection/authenticator
 * @description WebSocket 连接 JWT 认证器
 */

import type { IncomingMessage } from "http";
import { createJwtServiceFromEnv, type JwtUserPayload, AuthError, AuthErrorCode } from "@/tools/jwt/index.js";

/**
 * @interface AuthResult
 * @description 认证结果
 */
export interface AuthResult {
  success: boolean;
  payload?: JwtUserPayload;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * @interface ConnectionInfo
 * @description 连接信息
 */
export interface ConnectionInfo {
  userId: string;
  deviceId: string;
  payload: JwtUserPayload;
}

// JWT 服务单例
let jwtService: ReturnType<typeof createJwtServiceFromEnv> | null = null;

/**
 * @function getJwtService
 * @description 获取 JWT 服务实例（单例）
 */
function getJwtService(): ReturnType<typeof createJwtServiceFromEnv> {
  if (!jwtService) {
    jwtService = createJwtServiceFromEnv();
  }
  return jwtService;
}

/**
 * @function extractTokenFromRequest
 * @description 从请求中提取 JWT Token
 * @param {IncomingMessage} request - HTTP 请求
 * @returns {string | null} Token 或 null
 */
export function extractTokenFromRequest(request: IncomingMessage): string | null {
  const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  
  // 优先从 query 参数获取
  const queryToken = url.searchParams.get("token");
  if (queryToken) {
    return queryToken;
  }

  // 从 Authorization header 获取
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * @function extractDeviceIdFromRequest
 * @description 从请求中提取设备 ID
 * @param {IncomingMessage} request - HTTP 请求
 * @returns {string | null} 设备 ID 或 null
 */
export function extractDeviceIdFromRequest(request: IncomingMessage): string | null {
  const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  
  // 从 query 参数获取
  const deviceId = url.searchParams.get("deviceId");
  if (deviceId) {
    return deviceId;
  }

  // 从 header 获取
  const deviceHeader = request.headers["x-device-id"];
  if (typeof deviceHeader === "string") {
    return deviceHeader;
  }

  return null;
}

/**
 * @function authenticateConnection
 * @description 认证 WebSocket 连接
 * @param {IncomingMessage} request - HTTP 升级请求
 * @returns {Promise<AuthResult>} 认证结果
 */
export async function authenticateConnection(request: IncomingMessage): Promise<AuthResult> {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return {
      success: false,
      error: { code: 401, message: "缺少认证令牌" },
    };
  }

  try {
    const service = getJwtService();
    const payload = await service.verifyAsync(token);

    // 验证用户 ID 存在
    if (!payload.sub) {
      return {
        success: false,
        error: { code: 401, message: "无效的令牌载荷" },
      };
    }

    return {
      success: true,
      payload,
    };
  } catch (err) {
    if (err instanceof AuthError) {
      const message = err.code === AuthErrorCode.Expired
        ? "令牌已过期"
        : err.code === AuthErrorCode.Invalid
        ? "无效的令牌"
        : "认证失败";
      
      return {
        success: false,
        error: { code: 401, message },
      };
    }

    return {
      success: false,
      error: { code: 401, message: "认证失败" },
    };
  }
}

/**
 * @function getConnectionInfo
 * @description 从请求中获取完整的连接信息
 * @param {IncomingMessage} request - HTTP 升级请求
 * @returns {Promise<ConnectionInfo | null>} 连接信息或 null
 */
export async function getConnectionInfo(request: IncomingMessage): Promise<ConnectionInfo | null> {
  const authResult = await authenticateConnection(request);
  
  if (!authResult.success || !authResult.payload) {
    return null;
  }

  const deviceId = extractDeviceIdFromRequest(request);
  
  // 设备 ID 可以从请求参数获取，如果没有则使用默认值
  const finalDeviceId = deviceId || `ws-${authResult.payload.sub}-${Date.now()}`;

  return {
    userId: authResult.payload.sub,
    deviceId: finalDeviceId,
    payload: authResult.payload,
  };
}

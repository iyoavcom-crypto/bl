/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-guards-device
 * @since 1.0.0 (2025-09-21)
 * @description JWT 设备绑定守卫函数
 */

import type { JwtUserPayload } from "@/types/jwt";
import { AuthError, AuthErrorCode } from "../errors";

/**
 * @function assertDevice
 * @description 设备绑定校验：当服务端开启绑定时，要求 payload.deviceId 存在且匹配
 * @param {JwtUserPayload} p - 业务载荷
 * @param {string} deviceId - 访问设备 ID
 * @param {boolean} enabled - 是否启用设备绑定
 * @returns {JwtUserPayload} 原始载荷
 * @throws {AuthError} DeviceMismatch 当启用绑定但设备不匹配
 * @example
 * assertDevice(payload, "dev-001", true);
 * @complexity O(1)
 * @idempotent true
 * @security 设备绑定增强安全性，防止令牌跨设备滥用
 */
export function assertDevice(
  p: JwtUserPayload,
  deviceId: string,
  enabled: boolean
): JwtUserPayload {
  if (!enabled) return p;
  if (!p.deviceId || p.deviceId !== deviceId) {
    throw new AuthError(AuthErrorCode.DeviceMismatch, "Device mismatch", 401);
  }
  return p;
}

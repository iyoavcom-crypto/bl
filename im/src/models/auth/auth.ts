/**
 * @packageDocumentation
 * @module api-types-admin-auth
 * @since 1.0.0 (2025-12-23)
 * @author Z-kali
 * @description 认证相关类型定义（注册/登录/忘记密码/用户更新），用于 API/服务层 DTO
 */

import type { JwtUserPayload } from "@/types/jwt/index.js";
import type { UserAttributes } from "../user/types/user.js";

/**
 * @type SafeUser
 * @description 安全用户信息（去除敏感字段 password/pin）
 */
export type SafeUser = Omit<UserAttributes, "password" | "pin">;

/**
 * @interface RegisterRequest
 * @description 注册请求体
 * @param {string} phone - 手机号（纯数字）
 * @param {string} password - 登录密码
 * @param {string} pin - 二级密码（6位纯数字）
 * @param {string} [name] - 昵称（可选）
 */
export interface RegisterRequest {
  phone: string;
  password: string;
  pin: string;
  name?: string;
}

/**
 * @interface LoginRequest
 * @description 登录请求体
 * @param {string} phone - 手机号
 * @param {string} password - 登录密码
 * @param {string} [deviceId] - 设备ID（可选，用于设备绑定/区分）
 */
export interface LoginRequest {
  phone: string;
  password: string;
  deviceId?: string;
}

/**
 * @interface ForgotPasswordRequest
 * @description 忘记密码请求体（二级密码校验）
 * @param {string} phone - 手机号
 * @param {string} pin - 二级密码
 * @param {string} newPassword - 新登录密码
 */
export interface ForgotPasswordRequest {
  phone: string;
  pin: string;
  newPassword: string;
}

/**
 * @interface MeUpdateRequest
 * @description 用户信息更新请求体（当前登录用户）
 * @param {string} [name] - 新昵称
 * @param {string} [avatar] - 新头像URL
 */
export interface MeUpdateRequest {
  name?: string;
  avatar?: string;
}

/**
 * @interface AuthTokens
 * @description 认证令牌集合
 * @returns {string} access - 访问令牌
 * @returns {string} refresh - 刷新令牌
 */
export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * @type AuthPayload
 * @description 令牌载荷（移除 tokenType 字段）
 */
export type AuthPayload = Omit<JwtUserPayload, "tokenType">;

/**
 * @interface AuthIssue
 * @description 认证签发结果（令牌与载荷）
 * @param {string} access - 访问令牌
 * @param {string} refresh - 刷新令牌
 * @param {AuthPayload} payload - 令牌载荷
 */
export interface AuthIssue extends AuthTokens {
  payload: AuthPayload;
}

/**
 * @interface AuthSuccessData
 * @description 认证成功返回数据（用户信息 + 令牌/载荷）
 * @param {SafeUser} user - 安全用户信息
 * @param {string} access - 访问令牌
 * @param {string} refresh - 刷新令牌
 * @param {AuthPayload} payload - 令牌载荷
 */
export interface AuthSuccessData extends AuthTokens {
  user: SafeUser;
  payload: AuthPayload;
}

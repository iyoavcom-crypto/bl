/**
 * @packageDocumentation
 * @module contracts/auth.controller
 * @since 1.0.0
 * @author Z-Kali
 * @tags [controller],[auth],[jwt],[认证],[登录],[注册]
 * @description 认证控制器：处理注册、登录、退出、获取当前用户等认证相关请求
 * @path src/contracts/auth.controller.ts
 * @see src/routes/auth.ts
 * @see src/services/auth.ts
 */

import type { Request, Response, NextFunction } from "express";
import AuthService from "@/services/auth.js";
import type { RegisterRequest, LoginRequest } from "@/models/auth/index.js";
import { wrap } from "./crud/wrap.js";
import { ok, created } from "./crud/ok.js";
import { badRequest, unauthorized } from "./crud/fail.js";

/**
 * @route POST /auth/register
 * @description 用户注册接口
 * @access Public
 */
export const register = wrap(
  async (req: Request, res: Response, _next: NextFunction) => {
    const body = req.body as RegisterRequest;

    // 验证必填字段
    if (!body.phone || !body.password || !body.pin) {
      badRequest(res, "手机号、密码和二级密码不能为空");
      return;
    }

    // 验证手机号格式（10-15位纯数字）
    if (!/^[0-9]{10,15}$/.test(body.phone)) {
      badRequest(res, "手机号格式不正确（需10-15位数字）");
      return;
    }

    // 验证密码长度
    if (body.password.length < 6 || body.password.length > 128) {
      badRequest(res, "密码长度需在6-128位之间");
      return;
    }

    // 验证 PIN 格式（6位纯数字）
    if (!/^\d{6}$/.test(body.pin)) {
      badRequest(res, "二级密码必须为6位纯数字");
      return;
    }

    // 调用服务层处理注册逻辑
    const authData = await AuthService.register(body);

    created(res, authData, "注册成功");
  }
);

/**
 * @route POST /auth/login
 * @description 用户登录接口
 * @access Public
 */
export const login = wrap(
  async (req: Request, res: Response, _next: NextFunction) => {
    const body = req.body as LoginRequest;

    // 验证必填字段
    if (!body.phone || !body.password) {
      badRequest(res, "手机号和密码不能为空");
      return;
    }

    // 验证手机号格式（10-15位纯数字）
    if (!/^[0-9]{10,15}$/.test(body.phone)) {
      badRequest(res, "手机号格式不正确（需10-15位数字）");
      return;
    }

    // 调用服务层处理登录逻辑
    const authData = await AuthService.login(body);

    ok(res, authData, "登录成功");
  }
);

/**
 * @route POST /auth/logout
 * @description 用户退出接口
 * @access Protected
 */
export const logout = wrap(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // 调用服务层处理退出逻辑
    await AuthService.logout();

    ok(res, null, "退出成功");
  }
);

/**
 * @route GET /auth/me
 * @description 获取当前登录用户信息
 * @access Protected
 */
export const me = wrap(
  async (req: Request, res: Response, _next: NextFunction) => {
    // requireAuth 中间件已经将用户信息注入到 req.user
    const userPayload = req.user;

    if (!userPayload) {
      unauthorized(res, "未认证");
      return;
    }

    // 调用服务层获取用户信息
    const safeUser = await AuthService.getCurrentUser(userPayload.sub);

    ok(res, safeUser, "获取用户信息成功");
  }
);

/**
 * @route POST /auth/refresh
 * @description 刷新令牌接口
 * @access Public
 */
export const refresh = wrap(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body as { refreshToken: string };

    // 验证必填字段
    if (!refreshToken) {
      badRequest(res, "refreshToken 不能为空");
      return;
    }

    // 调用服务层处理刷新逻辑
    const authData = await AuthService.refresh(refreshToken);

    ok(res, authData, "刷新成功");
  }
);

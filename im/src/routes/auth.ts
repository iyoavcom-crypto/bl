/**
 * @packageDocumentation
 * @module routes/api/auth
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[认证],[登录],[注册],[退出]
 * @description 认证路由：注册、登录、退出、获取当前用户
 * @path src/routes/api/auth.ts
 * @see src/controllers/auth.controller.ts
 */

import { Router } from "express";
import { requireAuth } from "@/middleware/auth/index.js";
import { register, login, logout, me, refresh } from "@/contracts/auth.controller";

const router = Router();

/**
 * @route POST /auth/register
 * @description 用户注册
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /auth/login
 * @description 用户登录
 * @access Public
 */
router.post("/login", login);

/**
 * @route POST /auth/logout
 * @description 用户退出
 * @access Protected
 */
router.post("/logout", requireAuth, logout);

/**
 * @route GET /auth/me
 * @description 获取当前用户信息
 * @access Protected
 */
router.get("/me", requireAuth, me);

/**
 * @route POST /auth/refresh
 * @description 刷新令牌
 * @access Public
 */
router.post("/refresh", refresh);

export default router;

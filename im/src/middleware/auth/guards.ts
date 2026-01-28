/**
 * @packageDocumentation
 * @module middleware/auth/guards
 * @since 1.0.0
 * @author Z-Kali
 * @description JWT 权限守卫：基于 req.user 进行角色/作用域/VIP/团队/TokenKind 校验
 * @path src/middleware/auth/guards.ts
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { Guards, isAuthError } from "@/tools/jwt/index.js";
import type { TokenKind, JwtUserPayload } from "@/types/jwt/index.js";
import "./types.js";

/**
 * @description 未认证响应体
 */
const UNAUTHORIZED_RESPONSE = {
  code: "UNAUTHORIZED",
  message: "Authentication required",
  status: 401,
} as const;

/**
 * @description 内部错误响应体
 */
const INTERNAL_ERROR_RESPONSE = {
  code: "INTERNAL_ERROR",
  message: "Guard check failed",
  status: 500,
} as const;

/**
 * @function createGuard
 * @description 守卫工厂函数：创建通用守卫中间件
 * @param {(payload: JwtUserPayload) => void} check - 守卫检查函数（抛出 AuthError 表示失败）
 * @returns {RequestHandler} Express 中间件
 */
function createGuard(check: (payload: JwtUserPayload) => void): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    try {
      check(req.user);
      next();
    } catch (err: unknown) {
      if (isAuthError(err)) {
        res.status(err.status).json(err.toJSON());
        return;
      }
      res.status(500).json(INTERNAL_ERROR_RESPONSE);
    }
  };
}

/**
 * @function requireRole
 * @description 角色守卫中间件工厂：检查用户角色是否在允许列表中
 * @param {string[]} roles - 允许的角色 ID 列表
 * @returns {RequestHandler} Express 中间件
 * @example
 * router.delete("/admin/users", requireAuth, requireRole(["ADMIN"]), handler);
 */
export function requireRole(roles: string[]): RequestHandler {
  return createGuard((payload) => Guards.assertRole(payload, roles));
}

/**
 * @function requireScopes
 * @description 作用域守卫中间件工厂：检查用户是否拥有所需作用域之一
 * @param {string[]} scopes - 至少需要其一的作用域列表
 * @returns {RequestHandler} Express 中间件
 * @example
 * router.post("/api/write", requireAuth, requireScopes(["admin", "writer"]), handler);
 */
export function requireScopes(scopes: string[]): RequestHandler {
  return createGuard((payload) => Guards.assertScopes(payload, scopes));
}

/**
 * @function requireVip
 * @description VIP 守卫中间件：检查用户是否为 VIP
 * @returns {RequestHandler} Express 中间件
 * @example
 * router.get("/premium", requireAuth, requireVip(), handler);
 */
export function requireVip(): RequestHandler {
  return createGuard((payload) => Guards.assertVip(payload));
}

/**
 * @function requireTeam
 * @description 团队守卫中间件工厂：检查用户是否属于指定团队之一
 * @param {string[]} teams - 允许的团队 ID 列表
 * @returns {RequestHandler} Express 中间件
 * @example
 * router.get("/team/resource", requireAuth, requireTeam(["team-a", "team-b"]), handler);
 */
export function requireTeam(teams: string[]): RequestHandler {
  return createGuard((payload) => Guards.assertTeam(payload, teams));
}

/**
 * @function requireTokenKind
 * @description Token 类型守卫中间件工厂：检查 Token 类型是否匹配
 * @param {TokenKind} kind - 要求的 Token 类型 ("access" | "refresh")
 * @returns {RequestHandler} Express 中间件
 * @example
 * router.post("/refresh", requireAuth, requireTokenKind("refresh"), handler);
 */
export function requireTokenKind(kind: TokenKind): RequestHandler {
  return createGuard((payload) => Guards.assertTokenKind(payload, kind));
}

/**
 * @function requireUserId
 * @description 用户 ID 守卫中间件工厂：检查用户 ID 是否匹配
 * @param {(req: Request) => string} getUserId - 从请求获取目标用户 ID 的函数
 * @returns {RequestHandler} Express 中间件
 * @example
 * router.get("/users/:id", requireAuth, requireUserId((req) => req.params.id), handler);
 */
export function requireUserId(getUserId: (req: Request) => string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    try {
      const targetId = getUserId(req);
      Guards.assertUserId(req.user, targetId);
      next();
    } catch (err: unknown) {
      if (isAuthError(err)) {
        res.status(err.status).json(err.toJSON());
        return;
      }
      res.status(500).json(INTERNAL_ERROR_RESPONSE);
    }
  };
}

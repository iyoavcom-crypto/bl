/**
 * @packageDocumentation
 * @module middleware/auth
 * @since 1.0.0
 * @author Z-Kali
 * @description JWT 认证中间件聚合出口
 * @path src/middleware/auth/index.ts
 *
 * @remarks
 * 模块职责划分：
 * - extract.ts: Token 提取（从请求头提取 Bearer Token）
 * - verify.ts: Token 验证（验证并解码 JWT，附加到 req.user）
 * - guards.ts: 权限守卫（角色/作用域/VIP/团队/TokenKind 检查）
 * - types.ts: Express Request 类型扩展
 */

/**
 * @description Token 提取工具
 * @exports extractBearerToken - 从请求头提取 Bearer Token
 * @exports ExtractResult - Token 提取结果类型
 */
export { extractBearerToken, type ExtractResult } from "./extract.js";

/**
 * @description 核心认证中间件
 * @exports requireAuth - JWT 认证验证中间件
 */
export { requireAuth } from "./verify.js";

/**
 * @description 权限守卫中间件
 * @exports requireRole - 角色守卫
 * @exports requireScopes - 作用域守卫
 * @exports requireVip - VIP 守卫
 * @exports requireTeam - 团队守卫
 * @exports requireTokenKind - Token 类型守卫
 * @exports requireUserId - 用户 ID 守卫
 */
export {
  requireRole,
  requireScopes,
  requireVip,
  requireTeam,
  requireTokenKind,
  requireUserId,
} from "./guards.js";

/**
 * @description 类型扩展副作用导入
 * @remarks 确保 Express.Request.user 类型在使用此模块时可用
 */
import "./types.js";

/**
 * @description 类型重导出
 * @exports JwtUserPayload - JWT 用户载荷类型
 */
export type { JwtUserPayload } from "./types.js";

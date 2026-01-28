/**
 * @packageDocumentation
 * @module middleware/auth/types
 * @since 1.0.0
 * @author Z-Kali
 * @tags [auth],[middleware],[types],[express],[jwt]
 * @description Express Request 类型扩展：为 req.user 注入 JWT 用户载荷
 * @path src/middleware/auth/types.ts
 * @see src/middleware/auth/require.ts
 */

import type { JwtUserPayload } from "@/types/jwt/index.js";

/**
 * @description 扩展 Express Request 接口，添加认证用户信息
 */
declare global {
  namespace Express {
    /**
     * @interface Request
     * @description Express Request 扩展：注入认证用户载荷
     * @property {JwtUserPayload | undefined} user - JWT 解码后的用户载荷（仅在通过 requireAuth 后存在）
     * @property {JwtUserPayload | undefined} auth - JWT 解码后的用户载荷（user 的别名）
     */
    interface Request {
      /**
       * @property {JwtUserPayload | undefined} user - JWT 解码后的用户载荷（仅在通过 requireAuth 后存在）
       */
      user?: JwtUserPayload;
      /**
       * @property {JwtUserPayload | undefined} auth - JWT 解码后的用户载荷（user 的别名）
       */
      auth?: JwtUserPayload;
    }
  }
}

export type { JwtUserPayload };

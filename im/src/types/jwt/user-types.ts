/**
 * @packageDocumentation
 * @module @z-kali-tools-jwt-types
 * @since 1.0.0 (2025-09-14)
 * @description JWT 类型定义（纯声明文件，无运行时代码）
 * @path packages/tools/src/jwt/types.d.ts
 */

/**
 * @type TokenKind
 * @description 令牌类型（访问/刷新）
 */
export type TokenKind = "access" | "refresh";

/**
 * @enum UserState
 * @description 用户状态枚举
 * @property {string} ACTIVE - 正常启用
 * @property {string} DELETED - 删除
 */
export enum UserState {
  ACTIVE = "active",
  DELETED = "deleted",
}


/**
 * @interface JwtUserPayload
 * @description JWT 业务载荷（遵循标准字段与团队规范）
 * @property {string} sub - 主体ID（用户主键）
 * @property {string} roleId - 角色ID
 * @property {boolean} vip - 是否为会员用户
 * @property {string|null} [teamId] - 团队ID
 * @property {string|null} [teamRoleId] - 团队角色ID
 * @property {string|null} [telegramId] - 电报ID
 * @property {UserStatus} [UserState] - 用户状态
 * @property {TokenKind} tokenType - 令牌类型
 * @property {string[]} [scope] - 作用域集合
 * @property {string} [deviceId] - 设备ID（启用绑定时存在）
 * @property {string} [jti] - JWT 唯一ID（refresh 建议必填）
 * @property {number} [iat] - 签发时间（秒）
 * @property {number} [exp] - 过期时间（秒）
 */
export interface JwtUserPayload {
  sub: string;
  vip: boolean;
  roleId: string;
  teamId?: string | null;
  teamRoleId?: string | null;
  telegramId?: string | null;
  status?: UserState;
  tokenType: TokenKind;
  scope?: string[];
  deviceId?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}
/**
 * @type JwtUserPayload
 * @description JwtUserPayload 的别名（兼容旧命名或业务风格） 
 */
export type UserJwtPayload = JwtUserPayload;

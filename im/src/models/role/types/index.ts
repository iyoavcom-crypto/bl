/**
 * @packageDocumentation
 * @module api-types-role
 * @category Models
 * @category DTO
 * @since 1.0.0 (2025-10-23)
 * @description Role 类型与字段声明
 * @path api/src/api/types/models/role.ts 
 */

/**
 * @enum RoleGroup
 * @description 角色分组枚举（标识角色所属系统模块）
 */
export enum RoleGroup {
  SYSTEM = "system",
  PROJECT = "project",
  USER = "user",
  ADMIN = "admin",
}

/**
 * @type RoleId
 * @description 角色 ID 类型（用于前端/DTO 强类型约束）
 */
export type RoleId = string;

/**
 * @type RoleName
 * @description 角色名称类型
 */
export type RoleName = string;

/**
 * @interface RoleAttributes
 * @description 角色表字段定义（与 Sequelize 模型一致）
 * @property {string} id - 主键 ID
 * @property {string} name - 角色名称
 * @property {RoleGroup} group - 所属分组
 */
export interface RoleAttributes {
  id: string;
  name: string;
  group: RoleGroup;
}

/**
 * @const ROLE_LIST
 * @description 列表查询字段
 */
export const ROLE_LIST = [
  "id",
  "name",
  "group",
] as const;

/**
 * @const ROLE_FILTERABLE
 * @description 列表查询可过滤字段
 */
export const ROLE_FILTERABLE = [
  "id",
  "name",
  "group",
] as const;

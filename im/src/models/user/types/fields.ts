/**
 * @packageDocumentation
 * @module models-user-types-fields
 * @since 1.0.0
 * @author Z-kali
 * @description 用户模型字段配置常量（CRUD 操作字段定义）
 * @path src/models/user/types/fields.ts
 */

/**
 * @const USER_LIST
 * @description 列表查询字段
 */
export const USER_LIST = [
  "id",
  "pid",
  "phone",
  "name",
  "avatar",
  "state",
  "vip",
  "roleId",
  "searchable",
  "privateMuted",
  "createdAt",
] as const;

/**
 * @const USER_DETAIL
 * @description 详情查询字段
 */
export const USER_DETAIL = [
  "id",
  "pid",
  "searchable",
  "code",
  "phone",
  "name",
  "avatar",
  "state",
  "vip",
  "roleId",
  "telegramId",
  "teamId",
  "gender",
  "location",
  "longSession",
  "lastOnlineAt",
  "privateMuted",
  "privateMuteUntil",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const USER_CREATABLE
 * @description 创建时允许写入字段
 */
export const USER_CREATABLE = [
  "phone",
  "password",
  "pin",
  "name",
  "avatar",
  "roleId",
] as const;

/**
 * @const USER_UPDATABLE
 * @description 更新时允许写入字段
 */
export const USER_UPDATABLE = [
  "pid",
  "name",
  "avatar",
  "state",
  "vip",
  "roleId",
  "gender",
  "location",
  "longSession",
  "searchable",
  "privateMuted",
  "privateMuteUntil",
] as const;

/**
 * @const USER_FILTERABLE
 * @description 可筛选字段
 */
export const USER_FILTERABLE = [
  "state",
  "vip",
  "roleId",
  "gender",
  "searchable",
  "pid",
  "privateMuted",
] as const;

/**
 * @const USER_SORTABLE
 * @description 可排序字段
 */
export const USER_SORTABLE = [
  "createdAt",
  "lastOnlineAt",
  "name",
] as const;

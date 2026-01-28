/**
 * @module types/models/group
 * @description 群组模型类型定义
 */

import type { GroupJoinMode } from "./const.js";

/**
 * @interface GroupAttributes
 * @description 群组模型完整属性接口
 */
export interface GroupAttributes {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  maxMembers: number;
  memberCount: number;
  joinMode: GroupJoinMode;
  muteAll: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const GROUP_LIST
 * @description 列表查询字段
 */
export const GROUP_LIST = [
  "id",
  "name",
  "avatar",
  "ownerId",
  "memberCount",
  "joinMode",
  "createdAt",
] as const;

/**
 * @const GROUP_DETAIL
 * @description 详情查询字段
 */
export const GROUP_DETAIL = [
  "id",
  "name",
  "avatar",
  "description",
  "ownerId",
  "maxMembers",
  "memberCount",
  "joinMode",
  "muteAll",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const GROUP_CREATABLE
 * @description 创建时允许写入字段
 */
export const GROUP_CREATABLE = [
  "name",
  "avatar",
  "description",
  "ownerId",
  "joinMode",
] as const;

/**
 * @const GROUP_UPDATABLE
 * @description 更新时允许写入字段
 */
export const GROUP_UPDATABLE = [
  "name",
  "avatar",
  "description",
  "joinMode",
  "muteAll",
] as const;

/**
 * @const GROUP_FILTERABLE
 * @description 可筛选字段
 */
export const GROUP_FILTERABLE = [
  "ownerId",
  "joinMode",
  "muteAll",
] as const;

/**
 * @const GROUP_SORTABLE
 * @description 可排序字段
 */
export const GROUP_SORTABLE = [
  "createdAt",
  "memberCount",
] as const;

/**
 * @module types/models/group-member
 * @description 群成员模型类型定义
 */

import type { GroupMemberRole } from "./const.js";

/**
 * @interface GroupMemberAttributes
 * @description 群成员模型完整属性接口
 */
export interface GroupMemberAttributes {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  groupNickname: string | null;
  isMuted: boolean;
  muteUntil: Date | null;
  doNotDisturb: boolean;
  joinedAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const GROUP_MEMBER_LIST
 * @description 列表查询字段
 */
export const GROUP_MEMBER_LIST = [
  "id",
  "groupId",
  "userId",
  "role",
  "groupNickname",
  "isMuted",
  "joinedAt",
] as const;

/**
 * @const GROUP_MEMBER_DETAIL
 * @description 详情查询字段
 */
export const GROUP_MEMBER_DETAIL = [
  "id",
  "groupId",
  "userId",
  "role",
  "groupNickname",
  "isMuted",
  "muteUntil",
  "doNotDisturb",
  "joinedAt",
  "updatedAt",
] as const;

/**
 * @const GROUP_MEMBER_CREATABLE
 * @description 创建时允许写入字段
 */
export const GROUP_MEMBER_CREATABLE = [
  "groupId",
  "userId",
  "role",
] as const;

/**
 * @const GROUP_MEMBER_UPDATABLE
 * @description 更新时允许写入字段
 */
export const GROUP_MEMBER_UPDATABLE = [
  "role",
  "groupNickname",
  "isMuted",
  "muteUntil",
  "doNotDisturb",
] as const;

/**
 * @const GROUP_MEMBER_FILTERABLE
 * @description 可筛选字段
 */
export const GROUP_MEMBER_FILTERABLE = [
  "groupId",
  "userId",
  "role",
  "isMuted",
] as const;

/**
 * @const GROUP_MEMBER_SORTABLE
 * @description 可排序字段
 */
export const GROUP_MEMBER_SORTABLE = [
  "joinedAt",
] as const;

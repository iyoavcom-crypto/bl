/**
 * @module types/models/friend
 * @description 好友模型类型定义
 */

import type { FriendSource } from "./const.js";

/**
 * @interface FriendAttributes
 * @description 好友模型完整属性接口
 */
export interface FriendAttributes {
  id: string;
  userId: string;
  friendId: string;
  alias: string | null;
  isBlocked: boolean;
  doNotDisturb: boolean;
  isPinned: boolean;
  source: FriendSource;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const FRIEND_LIST
 * @description 列表查询字段
 */
export const FRIEND_LIST = [
  "id",
  "userId",
  "friendId",
  "alias",
  "isBlocked",
  "doNotDisturb",
  "isPinned",
  "createdAt",
] as const;

/**
 * @const FRIEND_DETAIL
 * @description 详情查询字段
 */
export const FRIEND_DETAIL = [
  "id",
  "userId",
  "friendId",
  "alias",
  "isBlocked",
  "doNotDisturb",
  "isPinned",
  "source",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const FRIEND_CREATABLE
 * @description 创建时允许写入字段
 */
export const FRIEND_CREATABLE = [
  "userId",
  "friendId",
  "source",
] as const;

/**
 * @const FRIEND_UPDATABLE
 * @description 更新时允许写入字段
 */
export const FRIEND_UPDATABLE = [
  "alias",
  "isBlocked",
  "doNotDisturb",
  "isPinned",
] as const;

/**
 * @const FRIEND_FILTERABLE
 * @description 可筛选字段
 */
export const FRIEND_FILTERABLE = [
  "userId",
  "friendId",
  "isBlocked",
  "isPinned",
] as const;

/**
 * @const FRIEND_SORTABLE
 * @description 可排序字段
 */
export const FRIEND_SORTABLE = [
  "createdAt",
] as const;

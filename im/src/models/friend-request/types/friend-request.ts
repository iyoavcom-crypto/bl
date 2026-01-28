/**
 * @module types/models/friend-request
 * @description 好友请求模型类型定义
 */

import type { FriendRequestStatus } from "./const.js";
import type { FriendSource } from "../../friend/types/const.js";

/**
 * @interface FriendRequestAttributes
 * @description 好友请求模型完整属性接口
 */
export interface FriendRequestAttributes {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string | null;
  source: FriendSource;
  status: FriendRequestStatus;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const FRIEND_REQUEST_LIST
 * @description 列表查询字段
 */
export const FRIEND_REQUEST_LIST = [
  "id",
  "fromUserId",
  "toUserId",
  "message",
  "source",
  "status",
  "createdAt",
] as const;

/**
 * @const FRIEND_REQUEST_DETAIL
 * @description 详情查询字段
 */
export const FRIEND_REQUEST_DETAIL = [
  "id",
  "fromUserId",
  "toUserId",
  "message",
  "source",
  "status",
  "respondedAt",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const FRIEND_REQUEST_CREATABLE
 * @description 创建时允许写入字段
 */
export const FRIEND_REQUEST_CREATABLE = [
  "fromUserId",
  "toUserId",
  "message",
  "source",
] as const;

/**
 * @const FRIEND_REQUEST_UPDATABLE
 * @description 更新时允许写入字段
 */
export const FRIEND_REQUEST_UPDATABLE = [
  "status",
  "respondedAt",
] as const;

/**
 * @const FRIEND_REQUEST_FILTERABLE
 * @description 可筛选字段
 */
export const FRIEND_REQUEST_FILTERABLE = [
  "fromUserId",
  "toUserId",
  "status",
] as const;

/**
 * @const FRIEND_REQUEST_SORTABLE
 * @description 可排序字段
 */
export const FRIEND_REQUEST_SORTABLE = [
  "createdAt",
  "respondedAt",
] as const;

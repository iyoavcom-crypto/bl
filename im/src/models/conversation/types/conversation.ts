/**
 * @module types/models/conversation
 * @description 会话模型类型定义
 */

import type { ConversationType } from "./const.js";

/**
 * @interface ConversationAttributes
 * @description 会话模型完整属性接口
 */
export interface ConversationAttributes {
  id: string;
  type: ConversationType;
  userId: string | null;
  friendId: string | null;
  groupId: string | null;
  lastMessageId: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const CONVERSATION_LIST
 * @description 列表查询字段
 */
export const CONVERSATION_LIST = [
  "id",
  "type",
  "userId",
  "friendId",
  "groupId",
  "lastMessageId",
  "lastMessageAt",
  "createdAt",
] as const;

/**
 * @const CONVERSATION_DETAIL
 * @description 详情查询字段
 */
export const CONVERSATION_DETAIL = [
  "id",
  "type",
  "userId",
  "friendId",
  "groupId",
  "lastMessageId",
  "lastMessageAt",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const CONVERSATION_CREATABLE
 * @description 创建时允许写入字段
 */
export const CONVERSATION_CREATABLE = [
  "type",
  "userId",
  "friendId",
  "groupId",
] as const;

/**
 * @const CONVERSATION_UPDATABLE
 * @description 更新时允许写入字段
 */
export const CONVERSATION_UPDATABLE = [
  "lastMessageId",
  "lastMessageAt",
] as const;

/**
 * @const CONVERSATION_FILTERABLE
 * @description 可筛选字段
 */
export const CONVERSATION_FILTERABLE = [
  "userId",
  "friendId",
  "groupId",
  "type",
] as const;

/**
 * @const CONVERSATION_SORTABLE
 * @description 可排序字段
 */
export const CONVERSATION_SORTABLE = [
  "lastMessageAt",
  "createdAt",
] as const;

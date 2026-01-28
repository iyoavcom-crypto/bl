/**
 * @module types/models/message
 * @description 消息模型类型定义
 */

import type { MessageType } from "./const.js";

/**
 * @interface MessageAttributes
 * @description 消息模型完整属性接口
 */
export interface MessageAttributes {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  replyToId: string | null;
  isRecalled: boolean;
  recalledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const MESSAGE_LIST
 * @description 列表查询字段
 */
export const MESSAGE_LIST = [
  "id",
  "conversationId",
  "senderId",
  "type",
  "content",
  "mediaUrl",
  "mediaDuration",
  "replyToId",
  "isRecalled",
  "createdAt",
] as const;

/**
 * @const MESSAGE_DETAIL
 * @description 详情查询字段
 */
export const MESSAGE_DETAIL = [
  "id",
  "conversationId",
  "senderId",
  "type",
  "content",
  "mediaUrl",
  "mediaDuration",
  "replyToId",
  "isRecalled",
  "recalledAt",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const MESSAGE_CREATABLE
 * @description 创建时允许写入字段
 */
export const MESSAGE_CREATABLE = [
  "conversationId",
  "senderId",
  "type",
  "content",
  "mediaUrl",
  "mediaDuration",
  "replyToId",
] as const;

/**
 * @const MESSAGE_UPDATABLE
 * @description 更新时允许写入字段
 */
export const MESSAGE_UPDATABLE = [
  "isRecalled",
  "recalledAt",
] as const;

/**
 * @const MESSAGE_FILTERABLE
 * @description 可筛选字段
 */
export const MESSAGE_FILTERABLE = [
  "conversationId",
  "senderId",
  "type",
  "isRecalled",
] as const;

/**
 * @const MESSAGE_SORTABLE
 * @description 可排序字段
 */
export const MESSAGE_SORTABLE = [
  "createdAt",
] as const;

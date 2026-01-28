/**
 * @module types/models/message-read
 * @description 已读回执模型类型定义
 */

/**
 * @interface MessageReadAttributes
 * @description 已读回执模型完整属性接口
 */
export interface MessageReadAttributes {
  id: string;
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: Date;
  createdAt: Date;
}

/**
 * @const MESSAGE_READ_LIST
 * @description 列表查询字段
 */
export const MESSAGE_READ_LIST = [
  "id",
  "conversationId",
  "userId",
  "lastReadMessageId",
  "readAt",
  "createdAt",
] as const;

/**
 * @const MESSAGE_READ_DETAIL
 * @description 详情查询字段
 */
export const MESSAGE_READ_DETAIL = [
  "id",
  "conversationId",
  "userId",
  "lastReadMessageId",
  "readAt",
  "createdAt",
] as const;

/**
 * @const MESSAGE_READ_CREATABLE
 * @description 创建时允许写入字段
 */
export const MESSAGE_READ_CREATABLE = [
  "conversationId",
  "userId",
  "lastReadMessageId",
  "readAt",
] as const;

/**
 * @const MESSAGE_READ_UPDATABLE
 * @description 更新时允许写入字段
 */
export const MESSAGE_READ_UPDATABLE = [
  "lastReadMessageId",
  "readAt",
] as const;

/**
 * @const MESSAGE_READ_FILTERABLE
 * @description 可筛选字段
 */
export const MESSAGE_READ_FILTERABLE = [
  "conversationId",
  "userId",
] as const;

/**
 * @const MESSAGE_READ_SORTABLE
 * @description 可排序字段
 */
export const MESSAGE_READ_SORTABLE = [
  "readAt",
  "createdAt",
] as const;

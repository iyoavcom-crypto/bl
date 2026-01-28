/**
 * @module types/models/call
 * @description 通话模型类型定义
 */

import type { CallStatus, CallEndReason } from "./const.js";

/**
 * @interface CallAttributes
 * @description 通话模型完整属性接口
 */
export interface CallAttributes {
  id: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  status: CallStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  endReason: CallEndReason | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @const CALL_LIST
 * @description 列表查询字段
 */
export const CALL_LIST = [
  "id",
  "conversationId",
  "callerId",
  "calleeId",
  "status",
  "startedAt",
  "endedAt",
  "duration",
  "createdAt",
] as const;

/**
 * @const CALL_DETAIL
 * @description 详情查询字段
 */
export const CALL_DETAIL = [
  "id",
  "conversationId",
  "callerId",
  "calleeId",
  "status",
  "startedAt",
  "endedAt",
  "duration",
  "endReason",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const CALL_CREATABLE
 * @description 创建时允许写入字段
 */
export const CALL_CREATABLE = [
  "conversationId",
  "callerId",
  "calleeId",
] as const;

/**
 * @const CALL_UPDATABLE
 * @description 更新时允许写入字段
 */
export const CALL_UPDATABLE = [
  "status",
  "startedAt",
  "endedAt",
  "duration",
  "endReason",
] as const;

/**
 * @const CALL_FILTERABLE
 * @description 可筛选字段
 */
export const CALL_FILTERABLE = [
  "conversationId",
  "callerId",
  "calleeId",
  "status",
] as const;

/**
 * @const CALL_SORTABLE
 * @description 可排序字段
 */
export const CALL_SORTABLE = [
  "createdAt",
  "startedAt",
  "duration",
] as const;

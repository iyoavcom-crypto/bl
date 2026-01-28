/**
 * @module types/models/call
 * @description 通话模型类型统一导出
 */

// ==================== 常量枚举 ====================
export { CallStatus, CallEndReason } from "./const.js";

// ==================== 类型接口 ====================
export type { CallAttributes } from "./call.js";

// ==================== 字段配置常量 ====================
export {
  CALL_LIST,
  CALL_DETAIL,
  CALL_CREATABLE,
  CALL_UPDATABLE,
  CALL_FILTERABLE,
  CALL_SORTABLE,
} from "./call.js";

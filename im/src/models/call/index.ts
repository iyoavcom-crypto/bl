/**
 * @module models-call
 * @description Call 模型统一导出
 */

// ==================== 模型类 ====================
export { Call, initCall } from "./call.js";
export type { CallCreationAttributes } from "./call.js";

// ==================== 类型定义 ====================
export type { CallAttributes } from "./types/index.js";
export { CallStatus, CallEndReason } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  CALL_LIST,
  CALL_DETAIL,
  CALL_CREATABLE,
  CALL_UPDATABLE,
  CALL_FILTERABLE,
  CALL_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateCall } from "./association.js";

// ==================== 钩子函数 ====================
export { callBeforeCreateHook } from "./hook.js";

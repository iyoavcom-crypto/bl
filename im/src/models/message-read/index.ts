/**
 * @module models-message-read
 * @description MessageRead 模型统一导出
 */

// ==================== 模型类 ====================
export { MessageRead, initMessageRead } from "./message-read.js";
export type { MessageReadCreationAttributes } from "./message-read.js";

// ==================== 类型定义 ====================
export type { MessageReadAttributes } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  MESSAGE_READ_LIST,
  MESSAGE_READ_DETAIL,
  MESSAGE_READ_CREATABLE,
  MESSAGE_READ_UPDATABLE,
  MESSAGE_READ_FILTERABLE,
  MESSAGE_READ_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateMessageRead } from "./association.js";

// ==================== 钩子函数 ====================
export { messageReadBeforeCreateHook } from "./hook.js";

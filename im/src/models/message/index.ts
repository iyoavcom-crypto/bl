/**
 * @module models-message
 * @description Message 模型统一导出
 */

// ==================== 模型类 ====================
export { Message, initMessage } from "./message.js";
export type { MessageCreationAttributes } from "./message.js";

// ==================== 类型定义 ====================
export type { MessageAttributes } from "./types/index.js";
export { MessageType } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  MESSAGE_LIST,
  MESSAGE_DETAIL,
  MESSAGE_CREATABLE,
  MESSAGE_UPDATABLE,
  MESSAGE_FILTERABLE,
  MESSAGE_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateMessage } from "./association.js";

// ==================== 钩子函数 ====================
export { messageBeforeCreateHook } from "./hook.js";

/**
 * @module types/models/message
 * @description 消息模型类型统一导出
 */

// ==================== 常量枚举 ====================
export { MessageType } from "./const.js";

// ==================== 类型接口 ====================
export type { MessageAttributes } from "./message.js";

// ==================== 字段配置常量 ====================
export {
  MESSAGE_LIST,
  MESSAGE_DETAIL,
  MESSAGE_CREATABLE,
  MESSAGE_UPDATABLE,
  MESSAGE_FILTERABLE,
  MESSAGE_SORTABLE,
} from "./message.js";

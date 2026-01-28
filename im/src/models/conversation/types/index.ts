/**
 * @module types/models/conversation
 * @description 会话模型类型统一导出
 */

// ==================== 常量枚举 ====================
export { ConversationType } from "./const.js";

// ==================== 类型接口 ====================
export type { ConversationAttributes } from "./conversation.js";

// ==================== 字段配置常量 ====================
export {
  CONVERSATION_LIST,
  CONVERSATION_DETAIL,
  CONVERSATION_CREATABLE,
  CONVERSATION_UPDATABLE,
  CONVERSATION_FILTERABLE,
  CONVERSATION_SORTABLE,
} from "./conversation.js";

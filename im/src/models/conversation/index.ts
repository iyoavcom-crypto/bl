/**
 * @module models-conversation
 * @description Conversation 模型统一导出
 */

// ==================== 模型类 ====================
export { Conversation, initConversation } from "./conversation.js";
export type { ConversationCreationAttributes } from "./conversation.js";

// ==================== 类型定义 ====================
export type { ConversationAttributes } from "./types/index.js";
export { ConversationType } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  CONVERSATION_LIST,
  CONVERSATION_DETAIL,
  CONVERSATION_CREATABLE,
  CONVERSATION_UPDATABLE,
  CONVERSATION_FILTERABLE,
  CONVERSATION_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateConversation } from "./association.js";

// ==================== 钩子函数 ====================
export { conversationBeforeCreateHook } from "./hook.js";

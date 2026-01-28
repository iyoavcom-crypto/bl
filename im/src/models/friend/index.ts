/**
 * @module models-friend
 * @description Friend 模型统一导出
 */

// ==================== 模型类 ====================
export { Friend, initFriend } from "./friend.js";
export type { FriendCreationAttributes } from "./friend.js";

// ==================== 类型定义 ====================
export type { FriendAttributes } from "./types/index.js";
export { FriendSource } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  FRIEND_LIST,
  FRIEND_DETAIL,
  FRIEND_CREATABLE,
  FRIEND_UPDATABLE,
  FRIEND_FILTERABLE,
  FRIEND_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateFriend } from "./association.js";

// ==================== 钩子函数 ====================
export { friendBeforeCreateHook } from "./hook.js";

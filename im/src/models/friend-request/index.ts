/**
 * @module models-friend-request
 * @description FriendRequest 模型统一导出
 */

// ==================== 模型类 ====================
export { FriendRequest, initFriendRequest } from "./friend-request.js";
export type { FriendRequestCreationAttributes } from "./friend-request.js";

// ==================== 类型定义 ====================
export type { FriendRequestAttributes } from "./types/index.js";
export { FriendRequestStatus } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  FRIEND_REQUEST_LIST,
  FRIEND_REQUEST_DETAIL,
  FRIEND_REQUEST_CREATABLE,
  FRIEND_REQUEST_UPDATABLE,
  FRIEND_REQUEST_FILTERABLE,
  FRIEND_REQUEST_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateFriendRequest } from "./association.js";

// ==================== 钩子函数 ====================
export { friendRequestBeforeCreateHook } from "./hook.js";

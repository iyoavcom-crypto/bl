/**
 * @module types/models/friend-request
 * @description 好友请求模型类型统一导出
 */

// ==================== 常量枚举 ====================
export { FriendRequestStatus } from "./const.js";

// ==================== 类型接口 ====================
export type { FriendRequestAttributes } from "./friend-request.js";

// ==================== 字段配置常量 ====================
export {
  FRIEND_REQUEST_LIST,
  FRIEND_REQUEST_DETAIL,
  FRIEND_REQUEST_CREATABLE,
  FRIEND_REQUEST_UPDATABLE,
  FRIEND_REQUEST_FILTERABLE,
  FRIEND_REQUEST_SORTABLE,
} from "./friend-request.js";

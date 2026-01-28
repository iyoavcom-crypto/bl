/**
 * @packageDocumentation
 * @module models-user-types
 * @since 1.0.0
 * @author Z-kali
 * @description 用户模型相关类型定义统一导出
 */

// ==================== 常量定义 ====================
export {
  UserState,
  Gender,
} from "./const.js";

export type {
  UserState as UserStateType,
  Gender as GenderType,
} from "./const.js";

// ==================== 用户基础类型 ====================
export type {
  UserAttributes,
  UserLocation,
} from "./user.js";

// ==================== 字段配置常量 ====================
export {
  USER_LIST,
  USER_DETAIL,
  USER_CREATABLE,
  USER_UPDATABLE,
  USER_FILTERABLE,
  USER_SORTABLE,
} from "./fields.js";

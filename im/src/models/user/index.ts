/**
 * @packageDocumentation
 * @module models-user
 * @since 1.0.0
 * @author Z-kali
 * @description User 模型统一导出：模型类、类型定义、关联函数、钩子函数
 */

// ==================== 模型类 ====================
export { User, initUser } from "./user.js";
export type { UserCreationAttributes } from "./user.js";

// ==================== 类型定义 ====================
export type {
  UserAttributes,
  UserLocation,
  UserState as UserStateType,
} from "./types/index.js";

export {
  Gender,
  UserState,
} from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  USER_LIST,
  USER_DETAIL,
  USER_CREATABLE,
  USER_UPDATABLE,
  USER_FILTERABLE,
  USER_SORTABLE,
} from "./types/user.js";

// ==================== 关联函数 ====================
export { associateUser } from "./association.js";

// ==================== 钩子函数 ====================
export { userBeforeCreateHook, userBeforeSaveHook } from "./hook.js";

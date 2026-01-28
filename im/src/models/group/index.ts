/**
 * @module models-group
 * @description Group 模型统一导出
 */

// ==================== 模型类 ====================
export { Group, initGroup } from "./group.js";
export type { GroupCreationAttributes } from "./group.js";

// ==================== 类型定义 ====================
export type { GroupAttributes } from "./types/index.js";
export { GroupJoinMode } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  GROUP_LIST,
  GROUP_DETAIL,
  GROUP_CREATABLE,
  GROUP_UPDATABLE,
  GROUP_FILTERABLE,
  GROUP_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateGroup } from "./association.js";

// ==================== 钩子函数 ====================
export { groupBeforeCreateHook } from "./hook.js";

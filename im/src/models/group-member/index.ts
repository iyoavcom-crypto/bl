/**
 * @module models-group-member
 * @description GroupMember 模型统一导出
 */

// ==================== 模型类 ====================
export { GroupMember, initGroupMember } from "./group-member.js";
export type { GroupMemberCreationAttributes } from "./group-member.js";

// ==================== 类型定义 ====================
export type { GroupMemberAttributes } from "./types/index.js";
export { GroupMemberRole } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  GROUP_MEMBER_LIST,
  GROUP_MEMBER_DETAIL,
  GROUP_MEMBER_CREATABLE,
  GROUP_MEMBER_UPDATABLE,
  GROUP_MEMBER_FILTERABLE,
  GROUP_MEMBER_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateGroupMember } from "./association.js";

// ==================== 钩子函数 ====================
export { groupMemberBeforeCreateHook } from "./hook.js";

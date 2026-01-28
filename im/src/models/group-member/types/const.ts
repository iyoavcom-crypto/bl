/**
 * @const GroupMemberRole
 * @description 群成员角色枚举
 */
export const GroupMemberRole = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type GroupMemberRole = (typeof GroupMemberRole)[keyof typeof GroupMemberRole];

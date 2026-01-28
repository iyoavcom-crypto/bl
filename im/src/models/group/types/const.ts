/**
 * @const GroupJoinMode
 * @description 群组加入方式枚举
 */
export const GroupJoinMode = {
  INVITE: "invite",
  APPROVAL: "approval",
  OPEN: "open",
} as const;

export type GroupJoinMode = (typeof GroupJoinMode)[keyof typeof GroupJoinMode];

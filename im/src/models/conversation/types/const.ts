/**
 * @const ConversationType
 * @description 会话类型枚举
 */
export const ConversationType = {
  PRIVATE: "private",
  GROUP: "group",
} as const;

export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType];

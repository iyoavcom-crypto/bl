/**
 * @const MessageType
 * @description 消息类型枚举
 */
export const MessageType = {
  TEXT: "text",
  IMAGE: "image",
  VOICE: "voice",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

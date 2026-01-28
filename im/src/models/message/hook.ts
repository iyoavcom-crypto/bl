import type { Message } from "./message.js";
import { randomUUID } from "crypto";

/**
 * @function messageBeforeCreateHook
 * @description 消息模型创建前钩子
 * @param {Message} message - 消息实例
 */
export function messageBeforeCreateHook(message: Message): void {
  if (!message.get("id")) {
    message.set("id", randomUUID());
  }
  
  // 验证语音消息时长不超过 60 秒
  const type = message.get("type");
  const mediaDuration = message.get("mediaDuration");
  
  if (type === "voice" && mediaDuration !== null && mediaDuration > 60) {
    throw new Error("Voice message duration cannot exceed 60 seconds");
  }
}

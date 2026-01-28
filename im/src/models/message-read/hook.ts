import type { MessageRead } from "./message-read.js";
import { randomUUID } from "crypto";

/**
 * @function messageReadBeforeCreateHook
 * @description 已读回执模型创建前钩子
 * @param {MessageRead} messageRead - 已读回执实例
 */
export function messageReadBeforeCreateHook(messageRead: MessageRead): void {
  if (!messageRead.get("id")) {
    messageRead.set("id", randomUUID());
  }
  
  if (!messageRead.get("readAt")) {
    messageRead.set("readAt", new Date());
  }
}

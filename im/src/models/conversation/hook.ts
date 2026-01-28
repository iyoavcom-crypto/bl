import type { Conversation } from "./conversation.js";
import { randomUUID } from "crypto";

/**
 * @function conversationBeforeCreateHook
 * @description 会话模型创建前钩子
 * @param {Conversation} conversation - 会话实例
 */
export function conversationBeforeCreateHook(conversation: Conversation): void {
  if (!conversation.get("id")) {
    conversation.set("id", randomUUID());
  }
  
  // 验证 type 与对应外键一致性
  const type = conversation.get("type");
  const userId = conversation.get("userId");
  const friendId = conversation.get("friendId");
  const groupId = conversation.get("groupId");
  
  if (type === "private") {
    if (!userId || !friendId) {
      throw new Error("Private conversation requires userId and friendId");
    }
    if (groupId) {
      throw new Error("Private conversation should not have groupId");
    }
  } else if (type === "group") {
    if (!groupId) {
      throw new Error("Group conversation requires groupId");
    }
    if (userId || friendId) {
      throw new Error("Group conversation should not have userId or friendId");
    }
  }
}

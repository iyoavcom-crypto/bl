import type { Friend } from "./friend.js";
import { randomUUID } from "crypto";

/**
 * @function friendBeforeCreateHook
 * @description 好友模型创建前钩子
 * @param {Friend} friend - 好友实例
 */
export function friendBeforeCreateHook(friend: Friend): void {
  if (!friend.get("id")) {
    friend.set("id", randomUUID());
  }
  
  // 验证不能添加自己为好友
  const userId = friend.get("userId");
  const friendId = friend.get("friendId");
  if (userId === friendId) {
    throw new Error("Cannot add yourself as a friend");
  }
}

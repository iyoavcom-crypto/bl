import type { FriendRequest } from "./friend-request.js";
import { randomUUID } from "crypto";

/**
 * @function friendRequestBeforeCreateHook
 * @description 好友请求模型创建前钩子
 * @param {FriendRequest} request - 好友请求实例
 */
export function friendRequestBeforeCreateHook(request: FriendRequest): void {
  if (!request.get("id")) {
    request.set("id", randomUUID());
  }
  
  // 验证不能向自己发送好友请求
  const fromUserId = request.get("fromUserId");
  const toUserId = request.get("toUserId");
  if (fromUserId === toUserId) {
    throw new Error("Cannot send friend request to yourself");
  }
}

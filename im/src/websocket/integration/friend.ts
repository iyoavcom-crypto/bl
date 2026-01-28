/**
 * @packageDocumentation
 * @module websocket/integration/friend
 * @description 好友推送集成钩子
 */

import { messageRouter } from "../router/index.js";
import {
  createFriendRequestEvent,
  createFriendAcceptedEvent,
} from "../events/index.js";
import { connectionManager } from "../connection/index.js";
import ExpoPushService from "@/services/push/expo.js";
import type { FriendSource } from "@/models/friend/index.js";

/**
 * @interface FriendRequestData
 * @description 好友申请数据
 */
interface FriendRequestData {
  requestId: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  message: string | null;
  source: FriendSource;
}

/**
 * @interface FriendAcceptedData
 * @description 好友接受数据
 */
interface FriendAcceptedData {
  requestId: string;
  friendUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  conversationId: string;
}

/**
 * @class FriendPushHook
 * @description 好友推送钩子
 */
class FriendPushHook {
  /**
   * @method onFriendRequest
   * @description 好友申请通知推送
   */
  async onFriendRequest(
    targetUserId: string,
    data: FriendRequestData
  ): Promise<void> {
    const event = createFriendRequestEvent(
      data.requestId,
      data.fromUser,
      data.message,
      data.source
    );

    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);

    // 如果用户离线，发送离线推送
    if (!connectionManager.isUserOnline(targetUserId)) {
      await this.sendFriendRequestPush(targetUserId, data);
    }
  }

  /**
   * @method sendFriendRequestPush
   * @description 发送好友申请离线推送
   */
  private async sendFriendRequestPush(
    targetUserId: string,
    data: FriendRequestData
  ): Promise<void> {
    try {
      await ExpoPushService.sendFriendRequestPush(
        targetUserId,
        data.fromUser.name,
        data.requestId
      );
    } catch (err) {
      console.error("[FriendPushHook] 好友申请离线推送失败:", err);
    }
  }

  /**
   * @method onFriendAccepted
   * @description 好友申请被接受通知推送（推送给申请发起者）
   */
  async onFriendAccepted(
    targetUserId: string,
    data: FriendAcceptedData
  ): Promise<void> {
    const event = createFriendAcceptedEvent(
      data.requestId,
      data.friendUser,
      data.conversationId
    );

    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);

    // 如果用户离线，发送离线推送
    if (!connectionManager.isUserOnline(targetUserId)) {
      await this.sendFriendAcceptedPush(targetUserId, data);
    }
  }

  /**
   * @method sendFriendAcceptedPush
   * @description 发送好友接受离线推送
   */
  private async sendFriendAcceptedPush(
    targetUserId: string,
    data: FriendAcceptedData
  ): Promise<void> {
    try {
      await ExpoPushService.sendToUser(targetUserId, {
        title: "好友添加成功",
        body: `${data.friendUser.name} 已接受你的好友申请`,
        data: {
          type: "friend_accepted",
          requestId: data.requestId,
          conversationId: data.conversationId,
        },
        channelId: "social",
      });
    } catch (err) {
      console.error("[FriendPushHook] 好友接受离线推送失败:", err);
    }
  }
}

export const friendPushHook = new FriendPushHook();
export type { FriendPushHook, FriendRequestData, FriendAcceptedData };

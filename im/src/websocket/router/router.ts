/**
 * @packageDocumentation
 * @module websocket/router/router
 * @description WebSocket 消息路由器
 */

import { connectionManager } from "../connection/index.js";
import { redisAdapter, type RedisMessage } from "./redis-adapter.js";
import type { WsEvent } from "../events/index.js";
import { Conversation, GroupMember } from "@/models/index.js";
import { ConversationType } from "@/models/conversation/index.js";

/**
 * @class MessageRouter
 * @description WebSocket 消息路由器
 */
class MessageRouter {
  private isInitialized = false;

  /**
   * @method init
   * @description 初始化路由器
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 初始化 Redis 适配器
    await redisAdapter.init();

    this.isInitialized = true;
    console.log("[WS Router] 消息路由器已初始化");
  }

  /**
   * @method sendToDevice
   * @description 发送消息给指定设备
   */
  sendToDevice(deviceId: string, event: WsEvent): boolean {
    const data = JSON.stringify(event);
    return connectionManager.send(deviceId, data);
  }

  /**
   * @method sendToUser
   * @description 发送消息给用户的所有设备
   */
  async sendToUser(userId: string, event: WsEvent): Promise<number> {
    const data = JSON.stringify(event);
    
    // 本地推送
    const localSent = connectionManager.sendToUser(userId, data);
    
    // 跨实例推送
    if (redisAdapter.isEnabled) {
      await redisAdapter.publishToUser(userId, event);
    }

    return localSent;
  }

  /**
   * @method sendToUsers
   * @description 发送消息给多个用户
   */
  async sendToUsers(userIds: string[], event: WsEvent, excludeUserId?: string): Promise<number> {
    let totalSent = 0;

    for (const userId of userIds) {
      if (excludeUserId && userId === excludeUserId) {
        continue;
      }
      totalSent += await this.sendToUser(userId, event);
    }

    return totalSent;
  }

  /**
   * @method sendToConversation
   * @description 发送消息给会话的所有参与者
   */
  async sendToConversation(
    conversationId: string,
    event: WsEvent,
    excludeUserId?: string
  ): Promise<number> {
    // 查询会话参与者
    const participantIds = await this.getConversationParticipants(conversationId);
    
    // 本地推送
    let totalSent = 0;
    const data = JSON.stringify(event);

    for (const userId of participantIds) {
      if (excludeUserId && userId === excludeUserId) {
        continue;
      }
      totalSent += connectionManager.sendToUser(userId, data);
    }

    // 跨实例推送
    if (redisAdapter.isEnabled) {
      await redisAdapter.publishToConversation(
        conversationId,
        event,
        excludeUserId ? [excludeUserId] : undefined
      );
    }

    return totalSent;
  }

  /**
   * @method broadcast
   * @description 广播消息给所有连接
   */
  broadcast(event: WsEvent, excludeDeviceIds?: string[]): number {
    const data = JSON.stringify(event);
    return connectionManager.broadcast(data, excludeDeviceIds);
  }

  /**
   * @method getConversationParticipants
   * @description 获取会话参与者列表
   */
  private async getConversationParticipants(conversationId: string): Promise<string[]> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return [];
    }

    if (conversation.type === ConversationType.PRIVATE) {
      // 私聊：返回两个参与者
      const participants: string[] = [];
      if (conversation.userId) participants.push(conversation.userId);
      if (conversation.friendId) participants.push(conversation.friendId);
      return participants;
    }

    if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      // 群聊：查询群成员
      const members = await GroupMember.findAll({
        where: { groupId: conversation.groupId },
        attributes: ["userId"],
      });
      return members.map((m) => m.userId);
    }

    return [];
  }

  /**
   * @method handleRedisMessage
   * @description 处理来自 Redis 的消息（跨实例推送）
   */
  handleRedisMessage(message: RedisMessage): void {
    const { event, target } = message;
    const data = JSON.stringify(event);

    switch (target.type) {
      case "user":
        connectionManager.sendToUser(target.id, data);
        break;

      case "device":
        connectionManager.send(target.id, data);
        break;

      case "conversation":
        // 需要查询参与者并推送
        this.getConversationParticipants(target.id).then((participantIds) => {
          for (const userId of participantIds) {
            if (target.excludeUserIds?.includes(userId)) {
              continue;
            }
            connectionManager.sendToUser(userId, data);
          }
        }).catch((err) => {
          console.error(`[WS Router] 处理会话消息失败:`, err);
        });
        break;

      case "broadcast":
        connectionManager.broadcast(data);
        break;
    }
  }

  /**
   * @method subscribeToUserChannel
   * @description 订阅用户频道（用于接收跨实例推送）
   */
  async subscribeToUserChannel(userId: string): Promise<void> {
    if (redisAdapter.isEnabled) {
      await redisAdapter.subscribeToUser(userId, (message) => {
        this.handleRedisMessage(message);
      });
    }
  }

  /**
   * @method close
   * @description 关闭路由器
   */
  async close(): Promise<void> {
    await redisAdapter.close();
    this.isInitialized = false;
    console.log("[WS Router] 消息路由器已关闭");
  }
}

// 导出单例
export const messageRouter = new MessageRouter();
export type { MessageRouter };

/**
 * @packageDocumentation
 * @module websocket/integration/message
 * @description 消息推送集成钩子
 */

import { messageRouter } from "../router/index.js";
import {
  createNewMessageEvent,
  createMessageRecalledEvent,
  createMessageReadEvent,
  createMessageDeliveredEvent,
} from "../events/index.js";
import type { MessageAttributes } from "@/models/message/index.js";
import { Conversation, User, GroupMember } from "@/models/index.js";
import { ConversationType } from "@/models/conversation/index.js";
import ExpoPushService from "@/services/push/expo.js";
import { connectionManager } from "../connection/index.js";

/**
 * @interface MessagePushOptions
 * @description 消息推送选项
 */
interface MessagePushOptions {
  excludeSenderId?: boolean;
}

/**
 * @class MessagePushHook
 * @description 消息推送钩子
 */
class MessagePushHook {
  /**
   * @method onNewMessage
   * @description 新消息推送
   */
  async onNewMessage(
    conversationId: string,
    message: MessageAttributes,
    options: MessagePushOptions = {}
  ): Promise<void> {
    const event = createNewMessageEvent(conversationId, message);
    const excludeUserId = options.excludeSenderId ? message.senderId ?? undefined : undefined;

    // WebSocket 在线推送
    await messageRouter.sendToConversation(conversationId, event, excludeUserId);

    // 离线推送
    await this.sendOfflinePush(conversationId, message, excludeUserId);
  }

  /**
   * @method sendOfflinePush
   * @description 发送离线推送通知
   */
  private async sendOfflinePush(
    conversationId: string,
    message: MessageAttributes,
    excludeUserId?: string
  ): Promise<void> {
    try {
      // 获取会话信息
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) return;

      // 获取发送者信息
      const sender = message.senderId 
        ? await User.findByPk(message.senderId, { attributes: ["id", "name"] })
        : null;
      const senderName = sender?.name || "未知用户";

      // 获取消息预览
      const preview = this.getMessagePreview(message);

      // 获取需要推送的用户列表
      const offlineUserIds = await this.getOfflineParticipants(conversation, excludeUserId);

      if (offlineUserIds.length === 0) return;

      // 发送离线推送
      await ExpoPushService.sendToUsers(offlineUserIds, {
        title: senderName,
        body: preview,
        data: {
          type: "new_message",
          conversationId,
          messageId: message.id,
        },
        channelId: "messages",
      });
    } catch (err) {
      console.error("[MessagePushHook] 离线推送失败:", err);
    }
  }

  /**
   * @method getOfflineParticipants
   * @description 获取离线参与者列表
   */
  private async getOfflineParticipants(
    conversation: Conversation,
    excludeUserId?: string
  ): Promise<string[]> {
    const participantIds: string[] = [];

    if (conversation.type === ConversationType.PRIVATE) {
      if (conversation.userId) participantIds.push(conversation.userId);
      if (conversation.friendId) participantIds.push(conversation.friendId);
    } else if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      const members = await GroupMember.findAll({
        where: { groupId: conversation.groupId },
        attributes: ["userId"],
      });
      participantIds.push(...members.map((m) => m.userId));
    }

    // 过滤掉发送者和在线用户
    return participantIds.filter((userId) => {
      if (excludeUserId && userId === excludeUserId) return false;
      // 检查用户是否在线
      return !connectionManager.isUserOnline(userId);
    });
  }

  /**
   * @method getMessagePreview
   * @description 获取消息预览文本
   */
  private getMessagePreview(message: MessageAttributes): string {
    if (message.isRecalled) {
      return "[消息已撤回]";
    }

    switch (message.type) {
      case "text":
        return message.content?.substring(0, 100) || "";
      case "image":
        return "[图片]";
      case "voice":
        return "[语音消息]";
      default:
        return "[消息]";
    }
  }

  /**
   * @method onMessageRecalled
   * @description 消息撤回推送
   */
  async onMessageRecalled(
    conversationId: string,
    messageId: string,
    recalledBy: string,
    excludeSenderId?: boolean
  ): Promise<void> {
    const event = createMessageRecalledEvent(conversationId, messageId, recalledBy);
    const excludeUserId = excludeSenderId ? recalledBy : undefined;

    await messageRouter.sendToConversation(conversationId, event, excludeUserId);
  }

  /**
   * @method onMessageRead
   * @description 消息已读推送（推送给消息发送者）
   */
  async onMessageRead(
    senderId: string,
    conversationId: string,
    readByUserId: string,
    lastReadMessageId: string
  ): Promise<void> {
    const event = createMessageReadEvent(conversationId, readByUserId, lastReadMessageId);

    await messageRouter.sendToUser(senderId, event);
  }

  /**
   * @method onMessageDelivered
   * @description 消息送达推送（推送给消息发送者）
   */
  async onMessageDelivered(
    senderId: string,
    conversationId: string,
    messageId: string,
    deliveredTo: string
  ): Promise<void> {
    const event = createMessageDeliveredEvent(conversationId, messageId, deliveredTo);

    await messageRouter.sendToUser(senderId, event);
  }
}

export const messagePushHook = new MessagePushHook();
export type { MessagePushHook, MessagePushOptions };

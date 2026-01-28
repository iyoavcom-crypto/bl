/**
 * @packageDocumentation
 * @module websocket/integration/typing
 * @description 输入状态推送集成钩子
 */

import { messageRouter } from "../router/index.js";
import {
  createTypingStartEvent,
  createTypingStopEvent,
} from "../events/index.js";
import { Conversation, GroupMember } from "@/models/index.js";
import { ConversationType } from "@/models/conversation/index.js";

/**
 * @class TypingPushHook
 * @description 输入状态推送钩子
 */
class TypingPushHook {
  /**
   * @method onTypingStart
   * @description 开始输入通知推送
   */
  async onTypingStart(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const event = createTypingStartEvent(conversationId, userId);
    
    // 获取会话参与者并推送
    const targetUserIds = await this.getConversationParticipants(conversationId, userId);
    if (targetUserIds.length > 0) {
      await messageRouter.sendToUsers(targetUserIds, event);
    }
  }

  /**
   * @method onTypingStop
   * @description 停止输入通知推送
   */
  async onTypingStop(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const event = createTypingStopEvent(conversationId, userId);
    
    // 获取会话参与者并推送
    const targetUserIds = await this.getConversationParticipants(conversationId, userId);
    if (targetUserIds.length > 0) {
      await messageRouter.sendToUsers(targetUserIds, event);
    }
  }

  /**
   * @method getConversationParticipants
   * @description 获取会话参与者（排除自己）
   */
  private async getConversationParticipants(
    conversationId: string,
    excludeUserId: string
  ): Promise<string[]> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return [];

    const participantIds: string[] = [];

    if (conversation.type === ConversationType.PRIVATE) {
      if (conversation.userId && conversation.userId !== excludeUserId) {
        participantIds.push(conversation.userId);
      }
      if (conversation.friendId && conversation.friendId !== excludeUserId) {
        participantIds.push(conversation.friendId);
      }
    } else if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      const members = await GroupMember.findAll({
        where: { groupId: conversation.groupId },
        attributes: ["userId"],
      });
      for (const member of members) {
        if (member.userId !== excludeUserId) {
          participantIds.push(member.userId);
        }
      }
    }

    return participantIds;
  }
}

export const typingPushHook = new TypingPushHook();
export type { TypingPushHook };

/**
 * @packageDocumentation
 * @module services/im/message
 * @since 1.0.0
 * @author Z-kali
 * @description IM 消息服务：发送、撤回、转发、历史消息等业务逻辑
 * @path src/services/im/message.ts
 */

import { Op, Transaction } from "sequelize";
import { sequelize } from "@/config/index.js";
import { Message, Conversation, GroupMember, User, Group, Friend, MessageRead } from "@/models/index.js";
import { MessageType } from "@/models/message/index.js";
import { ConversationType } from "@/models/conversation/index.js";
import { messagePushHook } from "@/websocket/index.js";
import SensitiveWordFilter from "@/services/filter/sensitive.js";

/** 消息撤回时限（秒） */
const RECALL_TIME_LIMIT = 120;

/** 语音消息最大时长（秒） */
const MAX_VOICE_DURATION = 60;

/**
 * @interface SendMessageInput
 * @description 发送消息输入
 */
export interface SendMessageInput {
  conversationId: string;
  type: typeof MessageType[keyof typeof MessageType];
  content?: string;
  mediaUrl?: string;
  mediaDuration?: number;
  replyToId?: string;
}

/**
 * @interface MessageListQuery
 * @description 消息列表查询参数
 */
export interface MessageListQuery {
  page?: number;
  limit?: number;
}

/**
 * @interface MessageListResult
 * @description 消息列表查询结果
 */
export interface MessageListResult {
  rows: Message[];
  count: number;
  page: number;
  limit: number;
}

/**
 * @interface MessageSearchQuery
 * @description 消息搜索参数
 */
export interface MessageSearchQuery {
  keyword: string;
  conversationId?: string;
  senderId?: string;
  type?: typeof MessageType[keyof typeof MessageType];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * @interface MessageSearchResult
 * @description 消息搜索结果
 */
export interface MessageSearchResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

/**
 * @class IMMessageService
 * @description IM 消息业务服务
 */
class IMMessageService {
  /**
   * 发送消息
   * @param senderId 发送者用户 ID
   * @param input 消息参数
   */
  async sendMessage(senderId: string, input: SendMessageInput): Promise<Message> {
    const { conversationId, type, content, mediaUrl, mediaDuration, replyToId } = input;

    // 获取会话
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      const error = new Error("会话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查发送权限
    await this.checkSendPermission(senderId, conversation);

    // 验证消息内容
    this.validateMessage(type, content, mediaUrl, mediaDuration);

    // 检查禁言状态
    await this.checkMuteStatus(senderId, conversation);

    // 敏感词过滤（仅文本消息）
    let filteredContent = content;
    if (type === MessageType.TEXT && content) {
      const filterResult = SensitiveWordFilter.filter(content);
      filteredContent = filterResult.text;
    }

    // 创建消息并更新会话
    const message = await sequelize.transaction(async (t: Transaction) => {
      const msg = await Message.create(
        {
          conversationId,
          senderId,
          type,
          content: filteredContent || null,
          mediaUrl: mediaUrl || null,
          mediaDuration: mediaDuration || null,
          replyToId: replyToId || null,
        },
        { transaction: t }
      );

      // 更新会话最后消息
      await conversation.update(
        { lastMessageId: msg.id, lastMessageAt: new Date() },
        { transaction: t }
      );

      return msg;
    });

    // 推送新消息通知（异步，不阻塞返回）
    messagePushHook.onNewMessage(
      conversationId,
      message.toJSON(),
      { excludeSenderId: true }
    ).catch((err: unknown) => {
      console.error("[IMMessageService] 推送新消息失败:", err);
    });

    // 重新查询消息并 include sender 信息
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "avatar"],
        },
      ],
    });

    return messageWithSender || message;
  }

  /**
   * 撤回消息
   * @param userId 操作者用户 ID
   * @param messageId 消息 ID
   */
  async recallMessage(userId: string, messageId: string): Promise<Message> {
    const message = await Message.findByPk(messageId);
    if (!message) {
      const error = new Error("消息不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 只能撤回自己的消息
    if (message.senderId !== userId) {
      const error = new Error("只能撤回自己的消息") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 已撤回
    if (message.isRecalled) {
      const error = new Error("消息已撤回") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 检查撤回时限
    const elapsed = (Date.now() - message.createdAt.getTime()) / 1000;
    if (elapsed > RECALL_TIME_LIMIT) {
      const error = new Error(`消息发送超过 ${RECALL_TIME_LIMIT} 秒，无法撤回`) as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await message.update({ isRecalled: true, recalledAt: new Date() });

    // 推送消息撤回通知
    messagePushHook.onMessageRecalled(
      message.conversationId,
      messageId,
      userId,
      true
    ).catch((err: unknown) => {
      console.error("[IMMessageService] 推送消息撤回失败:", err);
    });

    return message;
  }

  /**
   * 转发消息
   * @param userId 操作者用户 ID
   * @param messageId 原消息 ID
   * @param targetConversationIds 目标会话 ID 列表
   * @returns 转发结果，包含成功和失败的详细信息
   */
  async forwardMessage(
    userId: string,
    messageId: string,
    targetConversationIds: string[]
  ): Promise<{
    succeeded: Message[];
    failed: Array<{ conversationId: string; reason: string }>;
  }> {
    const original = await Message.findByPk(messageId);
    if (!original) {
      const error = new Error("消息不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (original.isRecalled) {
      const error = new Error("已撤回的消息无法转发") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 验证目标会话权限
    const conversations = await Conversation.findAll({
      where: { id: { [Op.in]: targetConversationIds } },
    });

    // 找出不存在的会话
    const existingIds = new Set(conversations.map((c) => c.id));
    const notFoundIds = targetConversationIds.filter((id) => !existingIds.has(id));

    const succeeded: Message[] = [];
    const failed: Array<{ conversationId: string; reason: string }> = [];

    // 记录不存在的会话
    for (const id of notFoundIds) {
      failed.push({ conversationId: id, reason: "会话不存在" });
    }

    for (const conv of conversations) {
      try {
        await this.checkSendPermission(userId, conv);
        await this.checkMuteStatus(userId, conv);

        const msg = await this.sendMessage(userId, {
          conversationId: conv.id,
          type: original.type,
          content: original.content || undefined,
          mediaUrl: original.mediaUrl || undefined,
          mediaDuration: original.mediaDuration || undefined,
        });
        succeeded.push(msg);
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : "转发失败";
        failed.push({ conversationId: conv.id, reason });
        console.warn(`[IMMessageService] 转发消息到会话 ${conv.id} 失败:`, reason);
      }
    }

    return { succeeded, failed };
  }

  /**
   * 获取会话消息列表
   * @param userId 用户 ID
   * @param conversationId 会话 ID
   * @param query 查询参数
   */
  async getMessages(
    userId: string,
    conversationId: string,
    query: MessageListQuery
  ): Promise<MessageListResult> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      const error = new Error("会话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查访问权限
    await this.checkAccessPermission(userId, conversation);

    const { page = 1, limit = 50 } = query;
    const safeLimit = Math.min(limit, 100);
    const offset = (page - 1) * safeLimit;

    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId },
      limit: safeLimit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "avatar"],
        },
        {
          model: Message,
          as: "replyTo",
          attributes: ["id", "senderId", "type", "content"],
        },
      ],
    });

    return {
      rows,
      count,
      page,
      limit: safeLimit,
    };
  }

  /**
   * 标记消息已读
   * @param userId 用户 ID
   * @param conversationId 会话 ID
   * @param messageId 最后已读消息 ID
   */
  async markAsRead(userId: string, conversationId: string, messageId: string): Promise<void> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      const error = new Error("会话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await this.checkAccessPermission(userId, conversation);

    // 更新或创建已读记录
    await MessageRead.upsert({
      conversationId,
      userId,
      lastReadMessageId: messageId,
      readAt: new Date(),
    });

    // 推送已读回执给私聊对方
    if (conversation.type === ConversationType.PRIVATE) {
      const targetUserId = conversation.userId === userId ? conversation.friendId : conversation.userId;
      if (targetUserId) {
        await messagePushHook.onMessageRead(
          targetUserId,
          conversationId,
          userId,
          messageId
        ).catch((err: unknown) => {
          console.error("[IMMessageService] 推送已读回执失败:", err);
        });
      }
    }
  }

  /**
   * 获取消息详情
   * @param userId 用户 ID
   * @param messageId 消息 ID
   */
  async getMessageDetail(userId: string, messageId: string): Promise<Message> {
    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "avatar"],
        },
        {
          model: Message,
          as: "replyTo",
          attributes: ["id", "senderId", "type", "content"],
        },
      ],
    });

    if (!message) {
      const error = new Error("消息不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查访问权限
    const conversation = await Conversation.findByPk(message.conversationId);
    if (conversation) {
      await this.checkAccessPermission(userId, conversation);
    }

    return message;
  }

  /**
   * 搜索消息
   * @param userId 用户 ID
   * @param query 搜索参数
   */
  async searchMessages(userId: string, query: MessageSearchQuery): Promise<MessageSearchResult> {
    const { keyword, conversationId, senderId, type, startDate, endDate, limit = 20, offset = 0 } = query;

    if (!keyword || keyword.trim().length === 0) {
      const error = new Error("搜索关键词不能为空") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 构建查询条件
    const where: Record<string, unknown> = {
      isRecalled: false,
      content: { [Op.like]: `%${keyword}%` },
    };

    // 指定会话搜索
    if (conversationId) {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        const error = new Error("会话不存在") as Error & { status?: number };
        error.status = 404;
        throw error;
      }
      await this.checkAccessPermission(userId, conversation);
      where.conversationId = conversationId;
    } else {
      // 全局搜索：只搜索用户有权访问的会话
      const accessibleConversations = await this.getAccessibleConversationIds(userId);
      where.conversationId = { [Op.in]: accessibleConversations };
    }

    // 指定发送者
    if (senderId) {
      where.senderId = senderId;
    }

    // 指定消息类型（仅文本消息可被搜索）
    if (type) {
      where.type = type;
    } else {
      // 默认只搜索文本消息
      where.type = MessageType.TEXT;
    }

    // 时间范围
    if (startDate || endDate) {
      const dateCondition: Record<string, Date> = {};
      if (startDate) {
        dateCondition[Op.gte as unknown as string] = startDate;
      }
      if (endDate) {
        dateCondition[Op.lte as unknown as string] = endDate;
      }
      where.createdAt = dateCondition;
    }

    // 查询总数
    const total = await Message.count({ where });

    // 查询消息
    const messages = await Message.findAll({
      where,
      limit: Math.min(limit, 100),
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "avatar"],
        },
        {
          model: Conversation,
          as: "conversation",
          attributes: ["id", "type", "groupId"],
          include: [
            {
              model: Group,
              as: "group",
              attributes: ["id", "name", "avatar"],
              required: false,
            },
          ],
        },
      ],
    });

    return {
      messages,
      total,
      hasMore: offset + messages.length < total,
    };
  }

  /**
   * 获取用户可访问的会话 ID 列表
   */
  private async getAccessibleConversationIds(userId: string): Promise<string[]> {
    // 获取私聊会话
    const privateConversations = await Conversation.findAll({
      where: {
        type: ConversationType.PRIVATE,
        [Op.or]: [{ userId }, { friendId: userId }],
      },
      attributes: ["id"],
    });

    // 获取群聊会话
    const groupMembers = await GroupMember.findAll({
      where: { userId },
      attributes: ["groupId"],
    });
    const groupIds = groupMembers.map((m) => m.groupId);

    const groupConversations = await Conversation.findAll({
      where: {
        type: ConversationType.GROUP,
        groupId: { [Op.in]: groupIds },
      },
      attributes: ["id"],
    });

    return [
      ...privateConversations.map((c) => c.id),
      ...groupConversations.map((c) => c.id),
    ];
  }

  /**
   * 验证消息内容
   */
  private validateMessage(
    type: typeof MessageType[keyof typeof MessageType],
    content?: string,
    mediaUrl?: string,
    mediaDuration?: number
  ): void {
    if (type === MessageType.TEXT) {
      if (!content || content.trim().length === 0) {
        const error = new Error("文本消息内容不能为空") as Error & { status?: number };
        error.status = 400;
        throw error;
      }
    } else if (type === MessageType.IMAGE) {
      if (!mediaUrl) {
        const error = new Error("图片消息必须包含图片 URL") as Error & { status?: number };
        error.status = 400;
        throw error;
      }
    } else if (type === MessageType.VOICE) {
      if (!mediaUrl) {
        const error = new Error("语音消息必须包含音频 URL") as Error & { status?: number };
        error.status = 400;
        throw error;
      }
      if (mediaDuration && mediaDuration > MAX_VOICE_DURATION) {
        const error = new Error(`语音消息时长不能超过 ${MAX_VOICE_DURATION} 秒`) as Error & { status?: number };
        error.status = 400;
        throw error;
      }
    }
  }

  /**
   * 检查发送权限
   */
  private async checkSendPermission(userId: string, conversation: Conversation): Promise<void> {
    if (conversation.type === ConversationType.PRIVATE) {
      // 私聊：检查是否是会话参与者
      if (conversation.userId !== userId && conversation.friendId !== userId) {
        const error = new Error("无权在此会话发送消息") as Error & { status?: number };
        error.status = 403;
        throw error;
      }
      // 检查是否是好友
      const friendId = conversation.userId === userId ? conversation.friendId : conversation.userId;
      if (friendId) {
        const isFriend = await Friend.findOne({
          where: { userId, friendId },
        });
        if (!isFriend) {
          const error = new Error("只能给好友发送消息") as Error & { status?: number };
          error.status = 403;
          throw error;
        }
      }
    } else if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      // 群聊：检查是否是群成员
      const member = await GroupMember.findOne({
        where: { groupId: conversation.groupId, userId },
      });
      if (!member) {
        const error = new Error("你不是该群成员") as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    }
  }

  /**
   * 检查访问权限
   */
  private async checkAccessPermission(userId: string, conversation: Conversation): Promise<void> {
    if (conversation.type === ConversationType.PRIVATE) {
      if (conversation.userId !== userId && conversation.friendId !== userId) {
        const error = new Error("无权访问此会话") as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    } else if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      const member = await GroupMember.findOne({
        where: { groupId: conversation.groupId, userId },
      });
      if (!member) {
        const error = new Error("你不是该群成员") as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    }
  }

  /**
   * 标记消息已送达
   * @param userId 接收者用户 ID
   * @param messageId 消息 ID
   */
  async markAsDelivered(userId: string, messageId: string): Promise<void> {
    const message = await Message.findByPk(messageId);

    if (!message) {
      const error = new Error("消息不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 不能标记自己发送的消息为已送达
    if (message.senderId === userId) {
      return;
    }

    // 获取会话并检查访问权限
    const conversation = await Conversation.findByPk(message.conversationId);
    if (conversation) {
      await this.checkAccessPermission(userId, conversation);

      // 推送送达回执给发送者（仅私聊）
      if (conversation.type === ConversationType.PRIVATE && message.senderId) {
        await messagePushHook.onMessageDelivered(
          message.senderId,
          message.conversationId,
          messageId,
          userId
        ).catch((err: unknown) => {
          console.error("[IMMessageService] 推送送达回执失败:", err);
        });
      }
    }
  }

  /**
   * 批量标记消息已送达
   * @param userId 接收者用户 ID
   * @param messageIds 消息 ID 列表
   */
  async batchMarkAsDelivered(userId: string, messageIds: string[]): Promise<void> {
    for (const messageId of messageIds) {
      await this.markAsDelivered(userId, messageId).catch(() => {
        // 忽略单条失败
      });
    }
  }

  /**
   * 检查禁言状态
   */
  private async checkMuteStatus(userId: string, conversation: Conversation): Promise<void> {
    // 检查全局私聊禁言
    const user = await User.findByPk(userId);
    if (user?.privateMuted) {
      if (!user.privateMuteUntil || user.privateMuteUntil > new Date()) {
        const error = new Error("你已被全局禁言") as Error & { status?: number };
        error.status = 403;
        throw error;
      }
    }

    if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      // 检查群全员禁言
      const group = await Group.findByPk(conversation.groupId);
      if (group?.muteAll) {
        // 检查是否是群主或管理员
        const member = await GroupMember.findOne({
          where: { groupId: conversation.groupId, userId },
        });
        if (member?.role === "member") {
          const error = new Error("群组已开启全员禁言") as Error & { status?: number };
          error.status = 403;
          throw error;
        }
      }

      // 检查个人禁言
      const member = await GroupMember.findOne({
        where: { groupId: conversation.groupId, userId },
      });
      if (member?.isMuted) {
        if (!member.muteUntil || member.muteUntil > new Date()) {
          const error = new Error("你在该群已被禁言") as Error & { status?: number };
          error.status = 403;
          throw error;
        }
      }
    }
  }
}

export default new IMMessageService();

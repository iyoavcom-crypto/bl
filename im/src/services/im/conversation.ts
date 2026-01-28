/**
 * @packageDocumentation
 * @module services/im/conversation
 * @since 1.0.0
 * @author Z-kali
 * @description IM 会话服务：会话列表、发起私聊、删除会话等业务逻辑
 * @path src/services/im/conversation.ts
 */

import { Op } from "sequelize";
import { Conversation, Message, User, Group, Friend, GroupMember, MessageRead } from "@/models/index.js";
import { ConversationType } from "@/models/conversation/index.js";

/**
 * @interface FlatConversation
 * @description 扁平化的会话响应结构（与 Friend、Group 接口格式统一）
 */
export interface FlatConversation {
  // 基础字段（从 conversation 提取）
  id: string;
  type: "private" | "group";
  targetUserId: string | null;
  groupId: string | null;
  lastMessageId: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;

  // 附加字段
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;

  // 关联信息
  targetUser?: {
    id: string;
    code: string | null;
    name: string | null;
    avatar: string | null;
    gender: string;
  };
  group?: {
    id: string;
    name: string;
    avatar: string | null;
    description: string | null;
    ownerId: string;
    joinMode: string;
    muteAll: boolean;
    memberCount: number;
    createdAt: Date;
  };
  lastMessage?: {
    id: string;
    conversationId: string;
    senderId: string | null;
    type: string;
    content: string | null;
    mediaUrl: string | null;
    mediaDuration: number | null;
    replyToId: string | null;
    isRecalled: boolean;
    recalledAt: Date | null;
    createdAt: Date;
  };
}

/**
 * @class IMConversationService
 * @description IM 会话业务服务
 */
class IMConversationService {
  /**
   * 获取我的会话列表
   * @param userId 用户 ID
   * @remarks 已优化 N+1 查询问题，使用批量查询减少数据库访问
   */
  async getMyConversations(userId: string): Promise<FlatConversation[]> {
    // 获取私聊会话（包含 lastMessage）
    const privateConversations = await Conversation.findAll({
      where: {
        type: ConversationType.PRIVATE,
        [Op.or]: [{ userId }, { friendId: userId }],
      },
      order: [["lastMessageAt", "DESC"]],
      include: [
        {
          model: Message,
          as: "lastMessage",
          attributes: ["id", "type", "content", "senderId", "mediaUrl", "mediaDuration", "replyToId", "isRecalled", "recalledAt", "createdAt"],
          required: false,
        },
      ],
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
      order: [["lastMessageAt", "DESC"]],
      include: [
        {
          model: Message,
          as: "lastMessage",
          attributes: ["id", "type", "content", "senderId", "mediaUrl", "mediaDuration", "replyToId", "isRecalled", "recalledAt", "createdAt"],
          required: false,
        },
      ],
    });

    // 合并并按最后消息时间排序
    const allConversations = [...privateConversations, ...groupConversations].sort((a, b) => {
      const timeA = a.lastMessageAt?.getTime() || 0;
      const timeB = b.lastMessageAt?.getTime() || 0;
      return timeB - timeA;
    });

    // 去重：私聊按对方用户ID去重，群聊按群ID去重（保留最新的）
    const seen = new Set<string>();
    const uniqueConversations = allConversations.filter((conv) => {
      let key: string;
      if (conv.type === ConversationType.PRIVATE) {
        // 计算对方用户ID
        const targetUserId = conv.userId === userId ? conv.friendId : conv.userId;
        key = `private:${targetUserId}`;
      } else {
        key = `group:${conv.groupId}`;
      }
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    if (uniqueConversations.length === 0) {
      return [];
    }

    const conversationIds = uniqueConversations.map((c) => c.id);

    // 批量获取已读记录
    const readRecords = await MessageRead.findAll({
      where: {
        userId,
        conversationId: { [Op.in]: conversationIds },
      },
    });
    const readMap = new Map(readRecords.map((r) => [r.conversationId, r]));

    // 批量获取已读消息的创建时间（用于计算未读数）
    const lastReadMessageIds = readRecords
      .filter((r) => r.lastReadMessageId)
      .map((r) => r.lastReadMessageId);
    
    const lastReadMessages = lastReadMessageIds.length > 0
      ? await Message.findAll({
          where: { id: { [Op.in]: lastReadMessageIds } },
          attributes: ["id", "createdAt"],
        })
      : [];
    const lastReadMsgMap = new Map(lastReadMessages.map((m) => [m.id, m.createdAt]));

    // 收集需要查询的用户 ID 和群组 ID
    const targetUserIds = new Set<string>();
    const targetGroupIds = new Set<string>();

    for (const conv of uniqueConversations) {
      if (conv.type === ConversationType.PRIVATE) {
        const targetUserId = conv.userId === userId ? conv.friendId : conv.userId;
        if (targetUserId) targetUserIds.add(targetUserId);
      } else if (conv.type === ConversationType.GROUP && conv.groupId) {
        targetGroupIds.add(conv.groupId);
      }
    }

    // 批量获取用户信息
    const users = targetUserIds.size > 0
      ? await User.findAll({
          where: { id: { [Op.in]: [...targetUserIds] } },
          attributes: ["id", "code", "name", "avatar", "gender"],
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    // 批量获取群组信息
    const groups = targetGroupIds.size > 0
      ? await Group.findAll({
          where: { id: { [Op.in]: [...targetGroupIds] } },
          attributes: ["id", "name", "avatar", "description", "ownerId", "joinMode", "muteAll", "memberCount", "createdAt"],
        })
      : [];
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    // 批量计算未读数（使用聚合查询）
    const unreadCountsRaw = await Message.findAll({
      attributes: [
        "conversationId",
        [Message.sequelize!.fn("COUNT", Message.sequelize!.col("id")), "count"],
      ],
      where: {
        conversationId: { [Op.in]: conversationIds },
        senderId: { [Op.ne]: userId },
      },
      group: ["conversationId"],
      raw: true,
    }) as unknown as Array<{ conversationId: string; count: string }>;
    
    const totalMsgCountMap = new Map(
      unreadCountsRaw.map((r) => [r.conversationId, parseInt(r.count, 10)])
    );

    // 构建返回数据
    const result: FlatConversation[] = [];

    for (const conv of uniqueConversations) {
      // 计算 targetUserId（私聊时）
      const targetUserId =
        conv.type === ConversationType.PRIVATE
          ? conv.userId === userId
            ? conv.friendId
            : conv.userId
          : null;

      const item: FlatConversation = {
        // 基础字段（从 conversation 提取）
        id: conv.id,
        type: conv.type as "private" | "group",
        targetUserId,
        groupId: conv.groupId,
        lastMessageId: conv.lastMessageId,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        // 附加字段
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
      };

      // 计算未读数
      const readRecord = readMap.get(conv.id);
      const totalFromOthers = totalMsgCountMap.get(conv.id) || 0;
      
      if (readRecord?.lastReadMessageId) {
        const lastReadTime = lastReadMsgMap.get(readRecord.lastReadMessageId);
        if (lastReadTime) {
          // 计算已读消息之后的未读数（需要单独查询，但这比之前的 N+1 好）
          // 这里简化处理：如果有总数，则计算未读
          const readMsgCount = await Message.count({
            where: {
              conversationId: conv.id,
              senderId: { [Op.ne]: userId },
              createdAt: { [Op.lte]: lastReadTime },
            },
          });
          item.unreadCount = Math.max(0, totalFromOthers - readMsgCount);
        }
      } else {
        // 从未读过，全部为未读
        item.unreadCount = totalFromOthers;
      }

      // 处理最后一条消息（已通过 include 获取）
      const lastMsg = (conv as Conversation & { lastMessage?: Message }).lastMessage;
      if (lastMsg) {
        item.lastMessage = {
          id: lastMsg.id,
          conversationId: conv.id,
          senderId: lastMsg.senderId,
          type: lastMsg.type,
          content: lastMsg.isRecalled ? "[消息已撤回]" : lastMsg.content,
          mediaUrl: lastMsg.mediaUrl,
          mediaDuration: lastMsg.mediaDuration,
          replyToId: lastMsg.replyToId,
          isRecalled: lastMsg.isRecalled,
          recalledAt: lastMsg.recalledAt,
          createdAt: lastMsg.createdAt,
        };
      }

      // 获取对方用户或群组信息（从缓存的 Map 中获取）
      if (conv.type === ConversationType.PRIVATE && targetUserId) {
        const targetUser = userMap.get(targetUserId);
        if (targetUser) {
          item.targetUser = {
            id: targetUser.id,
            code: targetUser.code,
            name: targetUser.name,
            avatar: targetUser.avatar,
            gender: targetUser.gender,
          };
        }
      } else if (conv.type === ConversationType.GROUP && conv.groupId) {
        const group = groupMap.get(conv.groupId);
        if (group) {
          item.group = {
            id: group.id,
            name: group.name,
            avatar: group.avatar,
            description: group.description,
            ownerId: group.ownerId,
            joinMode: group.joinMode,
            muteAll: group.muteAll,
            memberCount: group.memberCount,
            createdAt: group.createdAt,
          };
        }
      }

      result.push(item);
    }

    return result;
  }

  /**
   * 发起私聊（获取或创建会话）
   * @param userId 当前用户 ID
   * @param targetUserId 目标用户 ID
   */
  async startPrivateChat(userId: string, targetUserId: string): Promise<Conversation> {
    if (userId === targetUserId) {
      const error = new Error("不能与自己发起会话") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 检查对方是否存在
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查是否是好友
    const isFriend = await Friend.findOne({
      where: { userId, friendId: targetUserId },
    });
    if (!isFriend) {
      const error = new Error("只能与好友发起会话") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 查找或创建会话（保证唯一性：userId 小的在前）
    const [user1, user2] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

    let conversation = await Conversation.findOne({
      where: {
        type: ConversationType.PRIVATE,
        userId: user1,
        friendId: user2,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: ConversationType.PRIVATE,
        userId: user1,
        friendId: user2,
      });
    }

    return conversation;
  }

  /**
   * 获取或创建群聊会话
   * @param groupId 群组 ID
   */
  async getOrCreateGroupConversation(groupId: string): Promise<Conversation> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    let conversation = await Conversation.findOne({
      where: {
        type: ConversationType.GROUP,
        groupId,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: ConversationType.GROUP,
        groupId,
      });
    }

    return conversation;
  }

  /**
   * 获取会话详情
   * @param userId 用户 ID
   * @param conversationId 会话 ID
   */
  async getConversationDetail(userId: string, conversationId: string): Promise<FlatConversation> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      const error = new Error("会话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查访问权限
    await this.checkAccessPermission(userId, conversation);

    // 计算 targetUserId（私聊时）
    const targetUserId =
      conversation.type === ConversationType.PRIVATE
        ? conversation.userId === userId
          ? conversation.friendId
          : conversation.userId
        : null;

    const item: FlatConversation = {
      // 基础字段
      id: conversation.id,
      type: conversation.type as "private" | "group",
      targetUserId,
      groupId: conversation.groupId,
      lastMessageId: conversation.lastMessageId,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      // 附加字段
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    };

    // 获取未读数
    const readRecord = await MessageRead.findOne({
      where: { userId, conversationId },
    });
    if (readRecord?.lastReadMessageId) {
      const lastReadMsg = await Message.findByPk(readRecord.lastReadMessageId);
      if (lastReadMsg) {
        item.unreadCount = await Message.count({
          where: {
            conversationId,
            createdAt: { [Op.gt]: lastReadMsg.createdAt },
            senderId: { [Op.ne]: userId },
          },
        });
      }
    }

    // 获取对方用户或群组信息
    if (conversation.type === ConversationType.PRIVATE && targetUserId) {
      const targetUser = await User.findByPk(targetUserId, {
        attributes: ["id", "code", "name", "avatar", "gender"],
      });
      if (targetUser) {
        item.targetUser = {
          id: targetUser.id,
          code: targetUser.code,
          name: targetUser.name,
          avatar: targetUser.avatar,
          gender: targetUser.gender,
        };
      }
    } else if (conversation.type === ConversationType.GROUP && conversation.groupId) {
      const group = await Group.findByPk(conversation.groupId);
      if (group) {
        item.group = {
          id: group.id,
          name: group.name,
          avatar: group.avatar,
          description: group.description,
          ownerId: group.ownerId,
          joinMode: group.joinMode,
          muteAll: group.muteAll,
          memberCount: group.memberCount,
          createdAt: group.createdAt,
        };
      }
    }

    return item;
  }

  /**
   * 删除会话（仅从自己的列表中删除）
   * @param userId 用户 ID
   * @param conversationId 会话 ID
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      const error = new Error("会话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await this.checkAccessPermission(userId, conversation);

    // 对于私聊，只是清除已读记录（相当于从列表中移除）
    // 实际会话数据保留，下次有消息时会重新出现
    await MessageRead.destroy({
      where: { userId, conversationId },
    });
  }

  /**
   * 清空未读
   * @param userId 用户 ID
   * @param conversationId 会话 ID
   */
  async clearUnread(userId: string, conversationId: string): Promise<void> {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      const error = new Error("会话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await this.checkAccessPermission(userId, conversation);

    // 获取最后一条消息
    const lastMessage = await Message.findOne({
      where: { conversationId },
      order: [["createdAt", "DESC"]],
    });

    if (lastMessage) {
      await MessageRead.upsert({
        conversationId,
        userId,
        lastReadMessageId: lastMessage.id,
        readAt: new Date(),
      });
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
}

export default new IMConversationService();

/**
 * @packageDocumentation
 * @module services/im/friend
 * @since 1.0.0
 * @author Z-kali
 * @description IM 好友服务：好友申请、接受、拒绝、删除、列表等业务逻辑
 * @path src/services/im/friend.ts
 */

import { Op, Transaction } from "sequelize";
import { sequelize } from "@/config/index.js";
import { Friend, FriendRequest, User, Conversation } from "@/models/index.js";
import { FriendRequestStatus } from "@/models/friend-request/index.js";
import type { FriendSource } from "@/models/friend/index.js";
import { ConversationType } from "@/models/conversation/index.js";
import { friendPushHook } from "@/websocket/integration/index.js";

/**
 * @interface SendRequestInput
 * @description 发送好友申请输入
 */
export interface SendRequestInput {
  toUserId: string;
  message?: string;
  source: FriendSource;
}

/**
 * @interface FriendListQuery
 * @description 好友列表查询参数
 */
export interface FriendListQuery {
  page?: number;
  limit?: number;
  isBlocked?: boolean;
  isPinned?: boolean;
}

/**
 * @interface UpdateFriendInput
 * @description 更新好友信息输入
 */
export interface UpdateFriendInput {
  alias?: string | null;
  isBlocked?: boolean;
  doNotDisturb?: boolean;
  isPinned?: boolean;
}

/**
 * @class IMFriendService
 * @description IM 好友业务服务
 */
class IMFriendService {
  /**
   * 发送好友申请
   * @param fromUserId 发起人 ID
   * @param input 申请参数
   * @returns 好友申请记录
   */
  async sendRequest(fromUserId: string, input: SendRequestInput): Promise<FriendRequest> {
    const { toUserId, message, source } = input;

    // 不能添加自己
    if (fromUserId === toUserId) {
      const error = new Error("不能添加自己为好友") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 检查目标用户是否存在
    const targetUser = await User.findByPk(toUserId);
    if (!targetUser) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查是否已经是好友
    const existingFriend = await Friend.findOne({
      where: { userId: fromUserId, friendId: toUserId },
    });
    if (existingFriend) {
      const error = new Error("已经是好友") as Error & { status?: number };
      error.status = 409;
      throw error;
    }

    // 检查是否已有待处理的申请
    const pendingRequest = await FriendRequest.findOne({
      where: {
        fromUserId,
        toUserId,
        status: FriendRequestStatus.PENDING,
      },
    });
    if (pendingRequest) {
      const error = new Error("已有待处理的申请") as Error & { status?: number };
      error.status = 409;
      throw error;
    }

    // 检查对方是否已向我发起申请（可直接互相添加）
    // 场景：A 向 B 发送申请，B 此时也向 A 发送申请
    // 此时 reverseRequest 是 B->A 的申请，fromUserId 是 A，toUserId 是 B
    // acceptRequest 需要接收方（即原申请的 toUserId = A = fromUserId）来调用
    const reverseRequest = await FriendRequest.findOne({
      where: {
        fromUserId: toUserId,     // 原申请的发起者是 B（当前的 toUserId）
        toUserId: fromUserId,     // 原申请的接收者是 A（当前的 fromUserId）
        status: FriendRequestStatus.PENDING,
      },
    });
    if (reverseRequest) {
      // 对方(toUserId=B)已向我(fromUserId=A)发起申请
      // 我(A)作为原申请的接收者(toUserId)，可以接受该申请
      await this.acceptRequest(fromUserId, reverseRequest.id);
      // 返回对方的申请记录（状态已更新为 ACCEPTED）
      return reverseRequest;
    }

    // 创建好友申请
    const request = await FriendRequest.create({
      fromUserId,
      toUserId,
      message: message || null,
      source,
      status: FriendRequestStatus.PENDING,
    });

    // 获取发起者信息用于推送
    const fromUser = await User.findByPk(fromUserId, {
      attributes: ["id", "name", "avatar"],
    });

    // 发送好友申请通知
    if (fromUser) {
      friendPushHook.onFriendRequest(toUserId, {
        requestId: request.id,
        fromUser: {
          id: fromUser.id,
          name: fromUser.name || "",
          avatar: fromUser.avatar,
        },
        message: message || null,
        source,
      }).catch((err) => {
        console.error("[IMFriendService] 发送好友申请通知失败:", err);
      });
    }

    return request;
  }

  /**
   * 接受好友申请
   * @param userId 当前用户 ID（接收方）
   * @param requestId 申请 ID
   * @returns 双向好友记录和会话
   */
  async acceptRequest(userId: string, requestId: string): Promise<{ friend: Friend; reverse: Friend; conversationId: string }> {
    const request = await FriendRequest.findByPk(requestId);
    if (!request) {
      const error = new Error("申请不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 只有接收方可以接受
    if (request.toUserId !== userId) {
      const error = new Error("无权操作此申请") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      const error = new Error("申请已处理") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 事务处理：更新申请状态 + 双向建立好友关系 + 创建私聊会话
    const result = await sequelize.transaction(async (t: Transaction) => {
      // 更新申请状态
      await request.update(
        { status: FriendRequestStatus.ACCEPTED, respondedAt: new Date() },
        { transaction: t }
      );

      // 双向建立好友关系
      const [friend, reverse] = await Promise.all([
        Friend.create(
          { userId: request.fromUserId, friendId: request.toUserId, source: request.source },
          { transaction: t }
        ),
        Friend.create(
          { userId: request.toUserId, friendId: request.fromUserId, source: request.source },
          { transaction: t }
        ),
      ]);

      // 检查是否已有私聊会话
      let conversation = await Conversation.findOne({
        where: {
          type: ConversationType.PRIVATE,
          [Op.or]: [
            { userId: request.fromUserId, friendId: request.toUserId },
            { userId: request.toUserId, friendId: request.fromUserId },
          ],
        },
        transaction: t,
      });

      // 如果没有则创建私聊会话
      if (!conversation) {
        conversation = await Conversation.create(
          {
            type: ConversationType.PRIVATE,
            userId: request.fromUserId,
            friendId: request.toUserId,
          },
          { transaction: t }
        );
      }

      return { friend, reverse, conversationId: conversation.id };
    });

    // 获取接受者信息用于推送给申请发起者
    const accepter = await User.findByPk(userId, {
      attributes: ["id", "name", "avatar"],
    });

    // 发送好友申请被接受通知（给申请发起者）
    if (accepter) {
      friendPushHook.onFriendAccepted(request.fromUserId, {
        requestId,
        friendUser: {
          id: accepter.id,
          name: accepter.name || "",
          avatar: accepter.avatar,
        },
        conversationId: result.conversationId,
      }).catch((err) => {
        console.error("[IMFriendService] 发送好友接受通知失败:", err);
      });
    }

    return result;
  }

  /**
   * 拒绝好友申请
   * @param userId 当前用户 ID（接收方）
   * @param requestId 申请 ID
   */
  async rejectRequest(userId: string, requestId: string): Promise<FriendRequest> {
    const request = await FriendRequest.findByPk(requestId);
    if (!request) {
      const error = new Error("申请不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (request.toUserId !== userId) {
      const error = new Error("无权操作此申请") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      const error = new Error("申请已处理") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await request.update({ status: FriendRequestStatus.REJECTED, respondedAt: new Date() });
    return request;
  }

  /**
   * 删除好友（双向删除）
   * @param userId 当前用户 ID
   * @param friendUserId 好友的用户 ID
   */
  async removeFriend(userId: string, friendUserId: string): Promise<void> {
    // 查找双向好友关系
    const [friend, reverse] = await Promise.all([
      Friend.findOne({ where: { userId, friendId: friendUserId } }),
      Friend.findOne({ where: { userId: friendUserId, friendId: userId } }),
    ]);

    if (!friend) {
      const error = new Error("好友关系不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 事务删除双向关系
    await sequelize.transaction(async (t: Transaction) => {
      await friend.destroy({ transaction: t });
      if (reverse) {
        await reverse.destroy({ transaction: t });
      }
    });
  }

  /**
   * 获取我的好友列表
   * @param userId 当前用户 ID
   * @param query 查询参数
   */
  async getMyFriends(userId: string, query: FriendListQuery): Promise<{
    rows: Friend[];
    count: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, isBlocked, isPinned } = query;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (typeof isBlocked === "boolean") where.isBlocked = isBlocked;
    if (typeof isPinned === "boolean") where.isPinned = isPinned;

    const { rows, count } = await Friend.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["isPinned", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: User,
          as: "friendUser",
          attributes: ["id", "code", "name", "avatar", "gender", "lastOnlineAt"],
        },
      ],
    });

    return { rows, count, page, limit };
  }

  /**
   * 获取好友详情
   * @param userId 当前用户 ID
   * @param friendUserId 好友的用户 ID
   */
  async getFriendDetail(userId: string, friendUserId: string): Promise<Friend> {
    const friend = await Friend.findOne({
      where: { userId, friendId: friendUserId },
      include: [
        {
          model: User,
          as: "friendUser",
          attributes: ["id", "code", "name", "avatar", "gender", "phone", "lastOnlineAt"],
        },
      ],
    });

    if (!friend) {
      const error = new Error("好友不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    return friend;
  }

  /**
   * 更新好友信息
   * @param userId 当前用户 ID
   * @param friendUserId 好友的用户 ID
   * @param input 更新数据
   */
  async updateFriend(userId: string, friendUserId: string, input: UpdateFriendInput): Promise<Friend> {
    const friend = await Friend.findOne({
      where: { userId, friendId: friendUserId },
    });

    if (!friend) {
      const error = new Error("好友不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await friend.update(input);
    return friend;
  }

  /**
   * 获取收到的好友申请列表
   * @param userId 当前用户 ID
   * @param status 申请状态筛选
   */
  async getReceivedRequests(userId: string, status?: FriendRequestStatus): Promise<FriendRequest[]> {
    const where: Record<string, unknown> = { toUserId: userId };
    if (status) where.status = status;

    return await FriendRequest.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "fromUser",
          attributes: ["id", "code", "name", "avatar", "gender"],
        },
      ],
    });
  }

  /**
   * 获取发出的好友申请列表
   * @param userId 当前用户 ID
   * @param status 申请状态筛选
   */
  async getSentRequests(userId: string, status?: FriendRequestStatus): Promise<FriendRequest[]> {
    const where: Record<string, unknown> = { fromUserId: userId };
    if (status) where.status = status;

    return await FriendRequest.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "toUser",
          attributes: ["id", "code", "name", "avatar", "gender"],
        },
      ],
    });
  }

  /**
   * 检查是否为好友
   * @param userId 用户 ID
   * @param targetUserId 目标用户 ID
   */
  async isFriend(userId: string, targetUserId: string): Promise<boolean> {
    const friend = await Friend.findOne({
      where: { userId, friendId: targetUserId },
    });
    return !!friend;
  }
}

export default new IMFriendService();

/**
 * @packageDocumentation
 * @module services/im/call
 * @since 1.0.0
 * @author Z-kali
 * @description IM 通话服务：发起、接听、拒接、挂断、通话记录等业务逻辑
 * @path src/services/im/call.ts
 */

import { Op, Transaction } from "sequelize";
import { Call, User, Friend, Conversation } from "@/models/index.js";
import { CallStatus, CallEndReason } from "@/models/call/index.js";
import { ConversationType } from "@/models/conversation/index.js";
import { callPushHook } from "@/websocket/index.js";
import { sequelize } from "@/config/index.js";

/** 通话响铃超时时间（秒） */
const RING_TIMEOUT = 60;

/**
 * @class IMCallService
 * @description IM 通话业务服务
 */
class IMCallService {
  /**
   * 发起通话
   * @param callerId 主叫用户 ID
   * @param calleeId 被叫用户 ID
   * @remarks 使用事务防止并发竞态条件
   */
  async initiateCall(callerId: string, calleeId: string): Promise<Call> {
    if (callerId === calleeId) {
      const error = new Error("不能呼叫自己") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 检查被叫是否存在
    const callee = await User.findByPk(calleeId);
    if (!callee) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查是否是好友
    const isFriend = await Friend.findOne({
      where: { userId: callerId, friendId: calleeId },
    });
    if (!isFriend) {
      const error = new Error("只能呼叫好友") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 使用事务确保原子性，防止竞态条件
    const call = await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
      async (t: Transaction): Promise<Call> => {
        // 在事务内检查是否有进行中的通话（主叫）
        const ongoingCall = await Call.findOne({
          where: {
            [Op.or]: [
              { callerId, status: { [Op.in]: [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.CONNECTED] } },
              { calleeId: callerId, status: { [Op.in]: [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.CONNECTED] } },
            ],
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (ongoingCall) {
          const error = new Error("你有进行中的通话") as Error & { status?: number };
          error.status = 409;
          throw error;
        }

        // 在事务内检查对方是否有进行中的通话
        const calleeOngoing = await Call.findOne({
          where: {
            [Op.or]: [
              { callerId: calleeId, status: { [Op.in]: [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.CONNECTED] } },
              { calleeId, status: { [Op.in]: [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.CONNECTED] } },
            ],
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (calleeOngoing) {
          const error = new Error("对方正在通话中") as Error & { status?: number };
          error.status = 409;
          throw error;
        }

        // 获取或创建私聊会话
        const [user1, user2] = callerId < calleeId ? [callerId, calleeId] : [calleeId, callerId];
        let conversation = await Conversation.findOne({
          where: {
            type: ConversationType.PRIVATE,
            userId: user1,
            friendId: user2,
          },
          transaction: t,
        });
        if (!conversation) {
          conversation = await Conversation.create(
            {
              type: ConversationType.PRIVATE,
              userId: user1,
              friendId: user2,
            },
            { transaction: t }
          );
        }

        // 创建通话记录
        return await Call.create(
          {
            conversationId: conversation.id,
            callerId,
            calleeId,
            status: CallStatus.INITIATED,
          },
          { transaction: t }
        );
      }
    );

    // 推送来电通知给被叫（在事务外执行，避免长事务）
    await callPushHook.onIncomingCall(calleeId, {
      callId: call.id,
      callerId,
      calleeId,
      conversationId: call.conversationId,
    }).catch((err: unknown) => {
      console.error("[IMCallService] 推送来电通知失败:", err);
    });

    return call;
  }

  /**
   * 响铃（被叫收到通话邀请）
   * @param calleeId 被叫用户 ID
   * @param callId 通话 ID
   */
  async ring(calleeId: string, callId: string): Promise<Call> {
    const call = await this.getCallWithPermissionCheck(callId, calleeId, "callee");

    if (call.status !== CallStatus.INITIATED) {
      const error = new Error("通话状态不正确") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await call.update({ status: CallStatus.RINGING });

    // 推送响铃通知给主叫
    await callPushHook.onCallRing(call.callerId, call.id, calleeId).catch((err: unknown) => {
      console.error("[IMCallService] 推送响铃通知失败:", err);
    });

    return call;
  }

  /**
   * 接听通话
   * @param calleeId 被叫用户 ID
   * @param callId 通话 ID
   */
  async acceptCall(calleeId: string, callId: string): Promise<Call> {
    const call = await this.getCallWithPermissionCheck(callId, calleeId, "callee");

    if (call.status !== CallStatus.INITIATED && call.status !== CallStatus.RINGING) {
      const error = new Error("通话状态不正确") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await call.update({
      status: CallStatus.CONNECTED,
      startedAt: new Date(),
    });

    // 推送通话接听通知给主叫
    await callPushHook.onCallAnswered(call.callerId, call.id, calleeId).catch((err: unknown) => {
      console.error("[IMCallService] 推送通话接听失败:", err);
    });

    return call;
  }

  /**
   * 拒接通话
   * @param calleeId 被叫用户 ID
   * @param callId 通话 ID
   */
  async rejectCall(calleeId: string, callId: string): Promise<Call> {
    const call = await this.getCallWithPermissionCheck(callId, calleeId, "callee");

    if (call.status !== CallStatus.INITIATED && call.status !== CallStatus.RINGING) {
      const error = new Error("通话状态不正确") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await call.update({
      status: CallStatus.REJECTED,
      endedAt: new Date(),
      endReason: CallEndReason.CALLEE_HANGUP,
    });

    // 推送通话拒绝通知给主叫
    await callPushHook.onCallRejected(call.callerId, call.id, calleeId).catch((err: unknown) => {
      console.error("[IMCallService] 推送通话拒绝失败:", err);
    });

    return call;
  }

  /**
   * 挂断通话
   * @param userId 操作者用户 ID
   * @param callId 通话 ID
   */
  async hangupCall(userId: string, callId: string): Promise<Call> {
    const call = await Call.findByPk(callId);
    if (!call) {
      const error = new Error("通话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (call.callerId !== userId && call.calleeId !== userId) {
      const error = new Error("无权操作此通话") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 已结束的通话不能再挂断
    const endedStatuses: CallStatus[] = [CallStatus.ENDED, CallStatus.MISSED, CallStatus.REJECTED, CallStatus.BUSY];
    if (endedStatuses.includes(call.status)) {
      const error = new Error("通话已结束") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const endedAt = new Date();
    const duration = call.startedAt ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000) : null;
    const endReason = userId === call.callerId ? CallEndReason.CALLER_HANGUP : CallEndReason.CALLEE_HANGUP;

    // 如果通话未接通，状态为 MISSED
    const status = call.status === CallStatus.CONNECTED ? CallStatus.ENDED : CallStatus.MISSED;

    await call.update({
      status,
      endedAt,
      duration,
      endReason,
    });

    // 推送通话结束/取消通知给对方
    const otherUserId = userId === call.callerId ? call.calleeId : call.callerId;
    if (status === CallStatus.ENDED) {
      // 已接通的通话结束
      await callPushHook.onCallEnded(
        [call.callerId, call.calleeId],
        call.id,
        userId,
        status,
        endReason,
        duration,
        userId
      ).catch((err: unknown) => {
        console.error("[IMCallService] 推送通话结束失败:", err);
      });
    } else {
      // 未接通时取消
      await callPushHook.onCallCancelled(otherUserId, call.id, userId).catch((err: unknown) => {
        console.error("[IMCallService] 推送通话取消失败:", err);
      });
    }

    return call;
  }

  /**
   * 标记通话超时（系统调用）
   * @param callId 通话 ID
   */
  async markTimeout(callId: string): Promise<Call> {
    const call = await Call.findByPk(callId);
    if (!call) {
      const error = new Error("通话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (call.status !== CallStatus.INITIATED && call.status !== CallStatus.RINGING) {
      const error = new Error("通话状态不正确") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await call.update({
      status: CallStatus.MISSED,
      endedAt: new Date(),
      endReason: CallEndReason.TIMEOUT,
    });

    // 推送未接来电通知给被叫
    callPushHook.onCallMissed(call.calleeId, call.id, CallEndReason.TIMEOUT).catch((err: unknown) => {
      console.error("[IMCallService] 推送未接来电失败:", err);
    });

    // 推送超时通知给主叫
    callPushHook.onCallCancelled(call.callerId, call.id, "system").catch((err: unknown) => {
      console.error("[IMCallService] 推送超时通知失败:", err);
    });

    return call;
  }

  /**
   * 获取我的通话记录列表
   * @param userId 用户 ID
   * @param page 页码
   * @param limit 每页数量
   */
  async getMyCallHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ rows: Call[]; count: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Call.findAndCountAll({
      where: {
        [Op.or]: [{ callerId: userId }, { calleeId: userId }],
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "caller",
          attributes: ["id", "name", "avatar"],
        },
        {
          model: User,
          as: "callee",
          attributes: ["id", "name", "avatar"],
        },
      ],
    });

    return { rows, count, page, limit };
  }

  /**
   * 获取通话详情
   * @param userId 用户 ID
   * @param callId 通话 ID
   */
  async getCallDetail(userId: string, callId: string): Promise<Call> {
    const call = await Call.findByPk(callId, {
      include: [
        {
          model: User,
          as: "caller",
          attributes: ["id", "name", "avatar"],
        },
        {
          model: User,
          as: "callee",
          attributes: ["id", "name", "avatar"],
        },
      ],
    });

    if (!call) {
      const error = new Error("通话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (call.callerId !== userId && call.calleeId !== userId) {
      const error = new Error("无权访问此通话记录") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    return call;
  }

  /**
   * 发送 WebRTC 信令
   * @param userId 发送者用户 ID
   * @param callId 通话 ID
   * @param signalType 信令类型
   * @param signalData 信令数据
   */
  async sendSignal(
    userId: string,
    callId: string,
    signalType: "offer" | "answer" | "ice-candidate",
    signalData: Record<string, unknown>
  ): Promise<void> {
    const call = await Call.findByPk(callId);
    if (!call) {
      const error = new Error("通话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 验证是通话参与者
    if (call.callerId !== userId && call.calleeId !== userId) {
      const error = new Error("无权操作此通话") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 只有在通话进行中才能发送信令
    const allowedStatuses: CallStatus[] = [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.CONNECTED];
    if (!allowedStatuses.includes(call.status)) {
      const error = new Error("通话状态不允许发送信令") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 确定接收者
    const targetUserId = userId === call.callerId ? call.calleeId : call.callerId;

    // 转发信令给对方
    await callPushHook.onSignal(targetUserId, callId, userId, signalType, signalData).catch((err: unknown) => {
      console.error("[IMCallService] 转发信令失败:", err);
    });
  }

  /**
   * 检查权限并获取通话
   */
  private async getCallWithPermissionCheck(
    callId: string,
    userId: string,
    role: "caller" | "callee"
  ): Promise<Call> {
    const call = await Call.findByPk(callId);
    if (!call) {
      const error = new Error("通话不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (role === "caller" && call.callerId !== userId) {
      const error = new Error("无权操作此通话") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    if (role === "callee" && call.calleeId !== userId) {
      const error = new Error("无权操作此通话") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    return call;
  }
}

export default new IMCallService();

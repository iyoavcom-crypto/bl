/**
 * @packageDocumentation
 * @module websocket/integration/call
 * @description 通话信令推送集成钩子
 */

import { messageRouter } from "../router/index.js";
import {
  createCallInviteEvent,
  createCallRingEvent,
  createCallAnswerEvent,
  createCallRejectEvent,
  createCallEndEvent,
  createCallSignalEvent,
  type CallSignalType,
} from "../events/index.js";
import { CallStatus, CallEndReason } from "@/models/call/index.js";
import { connectionManager } from "../connection/index.js";
import { User } from "@/models/index.js";
import ExpoPushService from "@/services/push/expo.js";

/**
 * @interface IncomingCallData
 * @description 来电数据
 */
interface IncomingCallData {
  callId: string;
  callerId: string;
  calleeId: string;
  conversationId: string;
  callType?: "voice" | "video";
}

/**
 * @class CallPushHook
 * @description 通话信令推送钩子
 */
class CallPushHook {
  /**
   * @method onIncomingCall
   * @description 来电通知推送
   */
  async onIncomingCall(
    targetUserId: string,
    data: IncomingCallData
  ): Promise<void> {
    const event = createCallInviteEvent(
      data.callId,
      data.callerId,
      data.calleeId,
      data.conversationId
    );
    
    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);

    // 如果用户离线，发送离线推送
    if (!connectionManager.isUserOnline(targetUserId)) {
      await this.sendIncomingCallPush(targetUserId, data);
    }
  }

  /**
   * @method sendIncomingCallPush
   * @description 发送来电离线推送
   */
  private async sendIncomingCallPush(
    targetUserId: string,
    data: IncomingCallData
  ): Promise<void> {
    try {
      const caller = await User.findByPk(data.callerId, {
        attributes: ["id", "name"],
      });
      const callerName = caller?.name || "未知用户";

      await ExpoPushService.sendIncomingCallPush(
        targetUserId,
        callerName,
        data.callId,
        data.callType || "voice"
      );
    } catch (err) {
      console.error("[CallPushHook] 来电离线推送失败:", err);
    }
  }

  /**
   * @method onCallAnswered
   * @description 通话接听推送
   */
  async onCallAnswered(
    callerUserId: string,
    callId: string,
    answeredBy: string
  ): Promise<void> {
    const event = createCallAnswerEvent(callId, answeredBy);
    await messageRouter.sendToUser(callerUserId, event);
  }

  /**
   * @method onCallRing
   * @description 响铃通知推送给主叫
   */
  async onCallRing(
    callerUserId: string,
    callId: string,
    calleeId: string
  ): Promise<void> {
    const event = createCallRingEvent(callId, calleeId);
    await messageRouter.sendToUser(callerUserId, event);
  }

  /**
   * @method onCallRejected
   * @description 通话拒绝推送
   */
  async onCallRejected(
    callerUserId: string,
    callId: string,
    rejectedBy: string
  ): Promise<void> {
    const event = createCallRejectEvent(callId, rejectedBy);
    await messageRouter.sendToUser(callerUserId, event);
  }

  /**
   * @method onCallEnded
   * @description 通话结束推送（推送给双方）
   */
  async onCallEnded(
    participantUserIds: string[],
    callId: string,
    endedBy: string,
    status: CallStatus,
    endReason: CallEndReason | null,
    duration: number | null,
    excludeUserId?: string
  ): Promise<void> {
    const event = createCallEndEvent(callId, endedBy, status, endReason, duration);
    await messageRouter.sendToUsers(participantUserIds, event, excludeUserId);
  }

  /**
   * @method onCallCancelled
   * @description 通话取消推送（未接通时挂断）
   */
  async onCallCancelled(
    targetUserId: string,
    callId: string,
    cancelledBy: string
  ): Promise<void> {
    const event = createCallEndEvent(
      callId,
      cancelledBy,
      CallStatus.MISSED,
      CallEndReason.CALLER_HANGUP,
      null
    );
    await messageRouter.sendToUser(targetUserId, event);
  }

  /**
   * @method onCallMissed
   * @description 未接来电推送
   */
  async onCallMissed(
    targetUserId: string,
    callId: string,
    endReason: CallEndReason
  ): Promise<void> {
    const event = createCallEndEvent(
      callId,
      "system",
      CallStatus.MISSED,
      endReason,
      null
    );
    await messageRouter.sendToUser(targetUserId, event);
  }

  /**
   * @method onSignal
   * @description WebRTC 信令转发
   */
  async onSignal(
    targetUserId: string,
    callId: string,
    fromUserId: string,
    signalType: CallSignalType,
    signalData: Record<string, unknown>
  ): Promise<void> {
    const event = createCallSignalEvent(callId, fromUserId, signalType, signalData);
    await messageRouter.sendToUser(targetUserId, event);
  }
}

export const callPushHook = new CallPushHook();
export type { CallPushHook, IncomingCallData };

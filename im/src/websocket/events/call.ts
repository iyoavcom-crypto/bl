/**
 * @packageDocumentation
 * @module websocket/events/call
 * @description 通话相关 WebSocket 事件
 */

import { WsEventType, createWsEvent, type WsEvent } from "./types.js";
import type { CallStatus, CallEndReason } from "@/models/call/index.js";

/**
 * @interface CallInvitePayload
 * @description 来电邀请事件载荷
 */
export interface CallInvitePayload {
  callId: string;
  callerId: string;
  calleeId: string;
  conversationId: string;
  createdAt: number;
}

/**
 * @interface CallRingPayload
 * @description 振铃事件载荷
 */
export interface CallRingPayload {
  callId: string;
  calleeId: string;
  ringAt: number;
}

/**
 * @interface CallAnswerPayload
 * @description 接听事件载荷
 */
export interface CallAnswerPayload {
  callId: string;
  answeredBy: string;
  startedAt: number;
}

/**
 * @interface CallRejectPayload
 * @description 拒绝事件载荷
 */
export interface CallRejectPayload {
  callId: string;
  rejectedBy: string;
}

/**
 * @interface CallEndPayload
 * @description 通话结束事件载荷
 */
export interface CallEndPayload {
  callId: string;
  endedBy: string;
  status: CallStatus;
  endReason: CallEndReason | null;
  duration: number | null;
  endedAt: number;
}

/**
 * @type CallSignalType
 * @description 信令类型
 */
export type CallSignalType = "offer" | "answer" | "ice-candidate";

/**
 * @interface SignalData
 * @description WebRTC 信令数据
 */
export interface SignalData {
  sdp?: string;
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

/**
 * @interface CallSignalPayload
 * @description 通话信令事件载荷
 */
export interface CallSignalPayload {
  callId: string;
  fromUserId: string;
  signalType: CallSignalType;
  signalData: SignalData;
  sentAt: number;
}

/**
 * @function createCallInviteEvent
 * @description 创建来电邀请事件
 */
export function createCallInviteEvent(
  callId: string,
  callerId: string,
  calleeId: string,
  conversationId: string
): WsEvent<CallInvitePayload> {
  return createWsEvent(WsEventType.CALL_INVITE, {
    callId,
    callerId,
    calleeId,
    conversationId,
    createdAt: Date.now(),
  });
}

/**
 * @function createCallRingEvent
 * @description 创建振铃事件
 */
export function createCallRingEvent(callId: string, calleeId: string): WsEvent<CallRingPayload> {
  return createWsEvent(WsEventType.CALL_RING, {
    callId,
    calleeId,
    ringAt: Date.now(),
  });
}

/**
 * @function createCallAnswerEvent
 * @description 创建接听事件
 */
export function createCallAnswerEvent(callId: string, answeredBy: string): WsEvent<CallAnswerPayload> {
  return createWsEvent(WsEventType.CALL_ANSWER, {
    callId,
    answeredBy,
    startedAt: Date.now(),
  });
}

/**
 * @function createCallRejectEvent
 * @description 创建拒绝事件
 */
export function createCallRejectEvent(callId: string, rejectedBy: string): WsEvent<CallRejectPayload> {
  return createWsEvent(WsEventType.CALL_REJECT, {
    callId,
    rejectedBy,
  });
}

/**
 * @function createCallEndEvent
 * @description 创建通话结束事件
 */
export function createCallEndEvent(
  callId: string,
  endedBy: string,
  status: CallStatus,
  endReason: CallEndReason | null,
  duration: number | null
): WsEvent<CallEndPayload> {
  return createWsEvent(WsEventType.CALL_END, {
    callId,
    endedBy,
    status,
    endReason,
    duration,
    endedAt: Date.now(),
  });
}

/**
 * @function createCallSignalEvent
 * @description 创建通话信令事件
 */
export function createCallSignalEvent(
  callId: string,
  fromUserId: string,
  signalType: CallSignalType,
  signalData: SignalData
): WsEvent<CallSignalPayload> {
  return createWsEvent(WsEventType.CALL_SIGNAL, {
    callId,
    fromUserId,
    signalType,
    signalData,
    sentAt: Date.now(),
  });
}

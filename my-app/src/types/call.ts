import type { UserPublic } from './user';

// 通话状态
export type CallStatus = 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'busy';

// 通话结束原因
export type CallEndReason = 'caller_hangup' | 'callee_hangup' | 'timeout' | 'network_error';

// WebRTC 信令类型
export type SignalType = 'offer' | 'answer' | 'ice-candidate';

// 信令数据
export interface SignalData {
  sdp?: string;
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

// 通话实体
export interface Call {
  id: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  endReason: CallEndReason | null;
  createdAt: string;
  caller?: UserPublic;
  callee?: UserPublic;
}

// 发送信令请求
export interface SendSignalRequest {
  signalType: SignalType;
  signalData: SignalData;
}

// WebSocket 事件 payload
export interface WsCallInvitePayload {
  callId: string;
  callerId: string;
  calleeId: string;
  conversationId: string;
  createdAt: number;
}

export interface WsCallRingPayload {
  callId: string;
  calleeId: string;
  ringAt: number;
}

export interface WsCallAnswerPayload {
  callId: string;
  answeredBy: string;
  startedAt: number;
}

export interface WsCallRejectPayload {
  callId: string;
  rejectedBy: string;
}

export interface WsCallSignalPayload {
  callId: string;
  fromUserId: string;
  signalType: SignalType;
  signalData: SignalData;
  sentAt: number;
}

export interface WsCallEndPayload {
  callId: string;
  endedBy: string;
  status: CallStatus;
  endReason: CallEndReason | null;
  duration: number | null;
  endedAt: number;
}

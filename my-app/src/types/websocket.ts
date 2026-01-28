import type { UserPublic } from './user';
import type { FriendSource } from './friend';
import type { SignalData, CallStatus, CallEndReason, SignalType } from './call';

// WebSocket 事件类型
export type WsEventType =
  // 消息
  | 'message:new' | 'message:recalled' | 'message:read' | 'message:delivered'
  // 输入状态
  | 'typing:start' | 'typing:stop'
  // 通话
  | 'call:invite' | 'call:ring' | 'call:answer' | 'call:reject' | 'call:end' | 'call:signal'
  // 在线状态
  | 'presence:online' | 'presence:offline'
  // 好友
  | 'friend:request' | 'friend:accepted'
  // 群组
  | 'group:invited' | 'group:kicked' | 'group:member_joined' | 'group:member_left'
  | 'group:updated' | 'group:muted' | 'group:unmuted' | 'group:dissolved'
  // 系统
  | 'connected' | 'error' | 'kick' | 'heartbeat:ack';

// WebSocket 关闭码
export enum WsCloseCode {
  NORMAL = 1000,
  GOING_AWAY = 1001,
  NO_TOKEN = 4001,
  AUTH_FAILED = 4002,
  USER_DEVICE_LIMIT = 4003,
  GLOBAL_CONN_LIMIT = 4004,
}

// 连接限制
export interface ConnectionLimits {
  maxDevicesPerUser: number;
  maxTotalConnections: number;
}

// 连接拒绝原因
export type ConnectionRejectReason = 'USER_DEVICE_LIMIT' | 'GLOBAL_CONNECTION_LIMIT';

// 事件回调类型
export type EventCallback<T = unknown> = (payload: T) => void;

// WebSocket 事件基础结构
export interface WsEvent<T = unknown> {
  type: WsEventType;
  timestamp: number;
  payload: T;
}

// 连接成功 payload
export interface WsConnectedPayload {
  userId: string;
  deviceId: string;
  serverTime: number;
}

// 输入状态 payload
export interface WsTypingStartPayload {
  conversationId: string;
  userId: string;
  startedAt: number;
}

export interface WsTypingStopPayload {
  conversationId: string;
  userId: string;
  stoppedAt: number;
}

// 在线状态 payload
export interface WsPresenceOnlinePayload {
  userId: string;
  deviceId: string;
  onlineAt: number;
}

export interface WsPresenceOfflinePayload {
  userId: string;
  deviceId: string;
  offlineAt: number;
}

// 踢出 payload
export interface WsKickPayload {
  reason: string;
  newDeviceId?: string;
}

// 错误 payload
export interface WsErrorPayload {
  code: number;
  message: string;
  details?: unknown;
}

// 心跳响应
export interface WsHeartbeatAckPayload {
  serverTime: number;
}

/**
 * @packageDocumentation
 * @module websocket/events/types
 * @description WebSocket 事件类型定义
 */

/**
 * @enum WsEventType
 * @description WebSocket 事件类型枚举
 */
export const WsEventType = {
  // 消息事件
  MESSAGE_NEW: "message:new",
  MESSAGE_RECALLED: "message:recalled",
  MESSAGE_READ: "message:read",
  MESSAGE_DELIVERED: "message:delivered",

  // 通话事件
  CALL_INVITE: "call:invite",
  CALL_RING: "call:ring",
  CALL_ANSWER: "call:answer",
  CALL_REJECT: "call:reject",
  CALL_END: "call:end",
  CALL_SIGNAL: "call:signal",

  // 输入状态事件
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // 在线状态事件
  PRESENCE_ONLINE: "presence:online",
  PRESENCE_OFFLINE: "presence:offline",

  // 好友事件
  FRIEND_REQUEST: "friend:request",
  FRIEND_ACCEPTED: "friend:accepted",

  // 群组事件
  GROUP_INVITED: "group:invited",
  GROUP_KICKED: "group:kicked",
  GROUP_MEMBER_JOINED: "group:member_joined",
  GROUP_MEMBER_LEFT: "group:member_left",
  GROUP_UPDATED: "group:updated",
  GROUP_MUTED: "group:muted",
  GROUP_UNMUTED: "group:unmuted",
  GROUP_DISSOLVED: "group:dissolved",

  // 系统事件
  CONNECTED: "connected",
  ERROR: "error",
  KICK: "kick",
  HEARTBEAT_ACK: "heartbeat:ack",
} as const;

export type WsEventTypeValue = (typeof WsEventType)[keyof typeof WsEventType];

/**
 * @interface WsEvent
 * @description WebSocket 事件基础结构
 */
export interface WsEvent<T = unknown> {
  type: WsEventTypeValue;
  timestamp: number;
  payload: T;
}

/**
 * @interface WsErrorPayload
 * @description 错误事件载荷
 */
export interface WsErrorPayload {
  code: number;
  message: string;
  details?: unknown;
}

/**
 * @interface WsConnectedPayload
 * @description 连接成功事件载荷
 */
export interface WsConnectedPayload {
  userId: string;
  deviceId: string;
  serverTime: number;
}

/**
 * @interface WsKickPayload
 * @description 被踢下线事件载荷
 */
export interface WsKickPayload {
  reason: string;
  newDeviceId?: string;
}

/**
 * @interface WsHeartbeatAckPayload
 * @description 心跳响应载荷
 */
export interface WsHeartbeatAckPayload {
  serverTime: number;
}

/**
 * @function createWsEvent
 * @description 创建 WebSocket 事件
 */
export function createWsEvent<T>(type: WsEventTypeValue, payload: T): WsEvent<T> {
  return {
    type,
    timestamp: Date.now(),
    payload,
  };
}

/**
 * @function createErrorEvent
 * @description 创建错误事件
 */
export function createErrorEvent(code: number, message: string, details?: unknown): WsEvent<WsErrorPayload> {
  return createWsEvent(WsEventType.ERROR, { code, message, details });
}

/**
 * @function createConnectedEvent
 * @description 创建连接成功事件
 */
export function createConnectedEvent(userId: string, deviceId: string): WsEvent<WsConnectedPayload> {
  return createWsEvent(WsEventType.CONNECTED, {
    userId,
    deviceId,
    serverTime: Date.now(),
  });
}

/**
 * @function createKickEvent
 * @description 创建被踢下线事件
 */
export function createKickEvent(reason: string, newDeviceId?: string): WsEvent<WsKickPayload> {
  return createWsEvent(WsEventType.KICK, { reason, newDeviceId });
}

/**
 * @function createHeartbeatAckEvent
 * @description 创建心跳响应事件
 */
export function createHeartbeatAckEvent(): WsEvent<WsHeartbeatAckPayload> {
  return createWsEvent(WsEventType.HEARTBEAT_ACK, { serverTime: Date.now() });
}

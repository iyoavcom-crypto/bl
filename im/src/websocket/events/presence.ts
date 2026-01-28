/**
 * @packageDocumentation
 * @module websocket/events/presence
 * @description 在线状态相关 WebSocket 事件
 */

import { WsEventType, createWsEvent, type WsEvent } from "./types.js";

/**
 * @interface PresenceOnlinePayload
 * @description 用户上线事件载荷
 */
export interface PresenceOnlinePayload {
  userId: string;
  deviceId: string;
  onlineAt: number;
}

/**
 * @interface PresenceOfflinePayload
 * @description 用户下线事件载荷
 */
export interface PresenceOfflinePayload {
  userId: string;
  deviceId: string;
  offlineAt: number;
}

/**
 * @function createPresenceOnlineEvent
 * @description 创建用户上线事件
 */
export function createPresenceOnlineEvent(
  userId: string,
  deviceId: string
): WsEvent<PresenceOnlinePayload> {
  return createWsEvent(WsEventType.PRESENCE_ONLINE, {
    userId,
    deviceId,
    onlineAt: Date.now(),
  });
}

/**
 * @function createPresenceOfflineEvent
 * @description 创建用户下线事件
 */
export function createPresenceOfflineEvent(
  userId: string,
  deviceId: string
): WsEvent<PresenceOfflinePayload> {
  return createWsEvent(WsEventType.PRESENCE_OFFLINE, {
    userId,
    deviceId,
    offlineAt: Date.now(),
  });
}

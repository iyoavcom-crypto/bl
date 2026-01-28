/**
 * @packageDocumentation
 * @module websocket/events/friend
 * @description 好友相关 WebSocket 事件
 */

import { WsEventType, createWsEvent, type WsEvent } from "./types.js";
import type { FriendSource } from "@/models/friend/index.js";

/**
 * @interface FriendRequestPayload
 * @description 好友申请事件载荷
 */
export interface FriendRequestPayload {
  requestId: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  message: string | null;
  source: FriendSource;
  createdAt: number;
}

/**
 * @interface FriendAcceptedPayload
 * @description 好友申请被接受事件载荷
 */
export interface FriendAcceptedPayload {
  requestId: string;
  friendUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  conversationId: string;
  acceptedAt: number;
}

/**
 * @function createFriendRequestEvent
 * @description 创建好友申请事件
 */
export function createFriendRequestEvent(
  requestId: string,
  fromUser: { id: string; name: string; avatar: string | null },
  message: string | null,
  source: FriendSource
): WsEvent<FriendRequestPayload> {
  return createWsEvent(WsEventType.FRIEND_REQUEST, {
    requestId,
    fromUser,
    message,
    source,
    createdAt: Date.now(),
  });
}

/**
 * @function createFriendAcceptedEvent
 * @description 创建好友申请被接受事件
 */
export function createFriendAcceptedEvent(
  requestId: string,
  friendUser: { id: string; name: string; avatar: string | null },
  conversationId: string
): WsEvent<FriendAcceptedPayload> {
  return createWsEvent(WsEventType.FRIEND_ACCEPTED, {
    requestId,
    friendUser,
    conversationId,
    acceptedAt: Date.now(),
  });
}

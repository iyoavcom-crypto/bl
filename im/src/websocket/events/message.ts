/**
 * @packageDocumentation
 * @module websocket/events/message
 * @description 消息相关 WebSocket 事件
 */

import { WsEventType, createWsEvent, type WsEvent } from "./types.js";
import type { MessageAttributes } from "@/models/message/index.js";

/**
 * @interface NewMessagePayload
 * @description 新消息事件载荷
 */
export interface NewMessagePayload {
  conversationId: string;
  message: MessageAttributes;
}

/**
 * @interface MessageRecalledPayload
 * @description 消息撤回事件载荷
 */
export interface MessageRecalledPayload {
  conversationId: string;
  messageId: string;
  recalledBy: string;
  recalledAt: number;
}

/**
 * @interface MessageReadPayload
 * @description 已读同步事件载荷
 */
export interface MessageReadPayload {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: number;
}

/**
 * @interface MessageDeliveredPayload
 * @description 消息送达事件载荷
 */
export interface MessageDeliveredPayload {
  conversationId: string;
  messageId: string;
  deliveredTo: string;
  deliveredAt: number;
}

/**
 * @function createNewMessageEvent
 * @description 创建新消息事件
 */
export function createNewMessageEvent(
  conversationId: string,
  message: MessageAttributes
): WsEvent<NewMessagePayload> {
  return createWsEvent(WsEventType.MESSAGE_NEW, {
    conversationId,
    message,
  });
}

/**
 * @function createMessageRecalledEvent
 * @description 创建消息撤回事件
 */
export function createMessageRecalledEvent(
  conversationId: string,
  messageId: string,
  recalledBy: string
): WsEvent<MessageRecalledPayload> {
  return createWsEvent(WsEventType.MESSAGE_RECALLED, {
    conversationId,
    messageId,
    recalledBy,
    recalledAt: Date.now(),
  });
}

/**
 * @function createMessageReadEvent
 * @description 创建已读同步事件
 */
export function createMessageReadEvent(
  conversationId: string,
  userId: string,
  lastReadMessageId: string
): WsEvent<MessageReadPayload> {
  return createWsEvent(WsEventType.MESSAGE_READ, {
    conversationId,
    userId,
    lastReadMessageId,
    readAt: Date.now(),
  });
}

/**
 * @function createMessageDeliveredEvent
 * @description 创建消息送达事件
 */
export function createMessageDeliveredEvent(
  conversationId: string,
  messageId: string,
  deliveredTo: string
): WsEvent<MessageDeliveredPayload> {
  return createWsEvent(WsEventType.MESSAGE_DELIVERED, {
    conversationId,
    messageId,
    deliveredTo,
    deliveredAt: Date.now(),
  });
}

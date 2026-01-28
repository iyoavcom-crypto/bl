/**
 * @packageDocumentation
 * @module websocket/events/typing
 * @description 输入状态相关 WebSocket 事件
 */

import { WsEventType, createWsEvent, type WsEvent } from "./types.js";

/**
 * @interface TypingStartPayload
 * @description 开始输入事件载荷
 */
export interface TypingStartPayload {
  conversationId: string;
  userId: string;
  startedAt: number;
}

/**
 * @interface TypingStopPayload
 * @description 停止输入事件载荷
 */
export interface TypingStopPayload {
  conversationId: string;
  userId: string;
  stoppedAt: number;
}

/**
 * @function createTypingStartEvent
 * @description 创建开始输入事件
 */
export function createTypingStartEvent(
  conversationId: string,
  userId: string
): WsEvent<TypingStartPayload> {
  return createWsEvent(WsEventType.TYPING_START, {
    conversationId,
    userId,
    startedAt: Date.now(),
  });
}

/**
 * @function createTypingStopEvent
 * @description 创建停止输入事件
 */
export function createTypingStopEvent(
  conversationId: string,
  userId: string
): WsEvent<TypingStopPayload> {
  return createWsEvent(WsEventType.TYPING_STOP, {
    conversationId,
    userId,
    stoppedAt: Date.now(),
  });
}

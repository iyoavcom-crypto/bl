import type { UserPublic } from './user';

// 消息发送状态 (前端专用)
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// 消息类型
export type MessageType = 'text' | 'image' | 'voice';

// 消息实体
export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  replyToId: string | null;
  isRecalled: boolean;
  recalledAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  sender?: UserPublic;
  replyTo?: Message;
  // 前端专用
  localId?: string;
  status?: MessageStatus;
}

// 发送消息请求
export interface SendMessageRequest {
  conversationId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaDuration?: number;
  replyToId?: string;
}

// WebSocket 事件 payload
export interface WsMessageNewPayload {
  conversationId: string;
  message: Message;
}

export interface WsMessageRecalledPayload {
  conversationId: string;
  messageId: string;
  recalledBy: string;
  recalledAt: number;
}

export interface WsMessageReadPayload {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: number;
}

export interface WsMessageDeliveredPayload {
  conversationId: string;
  messageId: string;
  deliveredTo: string;
  deliveredAt: number;
}

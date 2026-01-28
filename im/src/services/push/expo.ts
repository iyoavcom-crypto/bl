/**
 * @packageDocumentation
 * @module services/push/expo
 * @since 1.0.0
 * @author Z-kali
 * @description Expo Push Notification 推送服务
 * @path src/services/push/expo.ts
 */

import { Device } from "@/models/index.js";
import { Op } from "sequelize";

/** Expo Push API 端点 */
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/** 推送请求超时时间（毫秒） */
const REQUEST_TIMEOUT = 10000;

/** 单次批量推送最大数量 */
const MAX_BATCH_SIZE = 100;

/**
 * @interface ExpoPushMessage
 * @description Expo 推送消息格式
 */
export interface ExpoPushMessage {
  to: string;
  title?: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  priority?: "default" | "normal" | "high";
  channelId?: string;
  categoryId?: string;
  ttl?: number;
  expiration?: number;
}

/**
 * @interface ExpoPushTicket
 * @description Expo 推送响应票据
 */
export interface ExpoPushTicket {
  id?: string;
  status: "ok" | "error";
  message?: string;
  details?: {
    error?: "DeviceNotRegistered" | "MessageTooBig" | "MessageRateExceeded" | "InvalidCredentials";
  };
}

/**
 * @interface PushNotificationPayload
 * @description 推送通知内容
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: boolean;
  priority?: "default" | "normal" | "high";
  channelId?: string;
}

/**
 * @interface SendPushResult
 * @description 推送结果
 */
export interface SendPushResult {
  success: number;
  failed: number;
  errors: Array<{
    token: string;
    error: string;
  }>;
}

/**
 * @class ExpoPushService
 * @description Expo 推送服务
 */
class ExpoPushService {
  /**
   * 发送推送通知给单个用户的所有设备
   * @param userId 用户 ID
   * @param payload 推送内容
   */
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<SendPushResult> {
    const devices = await Device.findAll({
      where: {
        userId,
        pushToken: { [Op.not]: null },
        pushProvider: "expo",
        isOnline: false, // 只推送给离线设备
        doNotDisturb: false, // 排除勿扰模式
      },
    });

    if (devices.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    const tokens = devices.map((d) => d.pushToken!).filter((t) => this.isValidExpoPushToken(t));
    return this.sendToTokens(tokens, payload);
  }

  /**
   * 发送推送通知给多个用户
   * @param userIds 用户 ID 列表
   * @param payload 推送内容
   */
  async sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<SendPushResult> {
    const devices = await Device.findAll({
      where: {
        userId: { [Op.in]: userIds },
        pushToken: { [Op.not]: null },
        pushProvider: "expo",
        isOnline: false,
        doNotDisturb: false,
      },
    });

    if (devices.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    const tokens = devices.map((d) => d.pushToken!).filter((t) => this.isValidExpoPushToken(t));
    return this.sendToTokens(tokens, payload);
  }

  /**
   * 发送推送通知给指定的推送令牌
   * @param tokens 推送令牌列表
   * @param payload 推送内容
   */
  async sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<SendPushResult> {
    if (tokens.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    // 过滤有效的 Expo Push Token
    const validTokens = tokens.filter((t) => this.isValidExpoPushToken(t));
    if (validTokens.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    // 构建消息
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: payload.sound !== false ? "default" : null,
      badge: payload.badge,
      priority: payload.priority || "high",
      channelId: payload.channelId,
    }));

    // 分批发送
    const results: SendPushResult = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
      const batch = messages.slice(i, i + MAX_BATCH_SIZE);
      const batchResult = await this.sendBatch(batch);
      results.success += batchResult.success;
      results.failed += batchResult.failed;
      results.errors.push(...batchResult.errors);
    }

    return results;
  }

  /**
   * 批量发送推送
   * @param messages 消息列表
   */
  private async sendBatch(messages: ExpoPushMessage[]): Promise<SendPushResult> {
    const result: SendPushResult = { success: 0, failed: 0, errors: [] };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ExpoPush] API 请求失败:", response.status, errorText);
        result.failed = messages.length;
        for (const msg of messages) {
          result.errors.push({ token: msg.to, error: `HTTP ${response.status}` });
        }
        return result;
      }

      const responseData = (await response.json()) as { data: ExpoPushTicket[] };
      const tickets = responseData.data;

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const token = messages[i].to;

        if (ticket.status === "ok") {
          result.success++;
        } else {
          result.failed++;
          result.errors.push({
            token,
            error: ticket.details?.error || ticket.message || "Unknown error",
          });

          // 如果设备未注册，标记令牌失效
          if (ticket.details?.error === "DeviceNotRegistered") {
            await this.invalidatePushToken(token);
          }
        }
      }
    } catch (err) {
      console.error("[ExpoPush] 发送推送失败:", err);
      result.failed = messages.length;
      for (const msg of messages) {
        result.errors.push({ token: msg.to, error: String(err) });
      }
    }

    return result;
  }

  /**
   * 验证 Expo Push Token 格式
   * @param token 推送令牌
   */
  isValidExpoPushToken(token: string): boolean {
    return /^ExponentPushToken\[[\w-]+\]$/.test(token);
  }

  /**
   * 使推送令牌失效
   * @param token 推送令牌
   */
  private async invalidatePushToken(token: string): Promise<void> {
    try {
      await Device.update(
        { pushToken: null, pushProvider: null },
        { where: { pushToken: token } }
      );
      console.log("[ExpoPush] 已清除无效的推送令牌:", token.substring(0, 30) + "...");
    } catch (err) {
      console.error("[ExpoPush] 清除推送令牌失败:", err);
    }
  }

  /**
   * 发送新消息推送
   * @param userId 接收者用户 ID
   * @param senderName 发送者名称
   * @param messagePreview 消息预览
   * @param conversationId 会话 ID
   */
  async sendNewMessagePush(
    userId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ): Promise<SendPushResult> {
    return this.sendToUser(userId, {
      title: senderName,
      body: messagePreview.length > 100 ? messagePreview.substring(0, 100) + "..." : messagePreview,
      data: {
        type: "new_message",
        conversationId,
      },
      channelId: "messages",
    });
  }

  /**
   * 发送来电推送
   * @param userId 接收者用户 ID
   * @param callerName 来电者名称
   * @param callId 通话 ID
   * @param callType 通话类型
   */
  async sendIncomingCallPush(
    userId: string,
    callerName: string,
    callId: string,
    callType: "voice" | "video"
  ): Promise<SendPushResult> {
    return this.sendToUser(userId, {
      title: "来电",
      body: `${callerName} 发起${callType === "video" ? "视频" : "语音"}通话`,
      data: {
        type: "incoming_call",
        callId,
        callType,
      },
      priority: "high",
      channelId: "calls",
    });
  }

  /**
   * 发送好友请求推送
   * @param userId 接收者用户 ID
   * @param senderName 请求者名称
   * @param requestId 请求 ID
   */
  async sendFriendRequestPush(
    userId: string,
    senderName: string,
    requestId: string
  ): Promise<SendPushResult> {
    return this.sendToUser(userId, {
      title: "好友请求",
      body: `${senderName} 请求添加你为好友`,
      data: {
        type: "friend_request",
        requestId,
      },
      channelId: "social",
    });
  }

  /**
   * 发送群组邀请推送
   * @param userId 接收者用户 ID
   * @param groupName 群组名称
   * @param inviterName 邀请者名称
   * @param groupId 群组 ID
   */
  async sendGroupInvitePush(
    userId: string,
    groupName: string,
    inviterName: string,
    groupId: string
  ): Promise<SendPushResult> {
    return this.sendToUser(userId, {
      title: "群组邀请",
      body: `${inviterName} 邀请你加入群组「${groupName}」`,
      data: {
        type: "group_invite",
        groupId,
      },
      channelId: "social",
    });
  }
}

export default new ExpoPushService();

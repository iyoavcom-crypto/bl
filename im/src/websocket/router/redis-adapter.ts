/**
 * @packageDocumentation
 * @module websocket/router/redis-adapter
 * @description WebSocket Redis Pub/Sub 适配器，用于跨实例消息推送
 */

import Redis from "ioredis";
import { env } from "@/config/index.js";
import type { WsEvent } from "../events/index.js";

/**
 * @interface RedisMessage
 * @description Redis 消息格式
 */
export interface RedisMessage {
  event: WsEvent;
  target: {
    type: "user" | "device" | "conversation" | "broadcast";
    id: string;
    excludeUserIds?: string[];
  };
  sourceInstance: string;
}

/**
 * @type MessageHandler
 * @description 消息处理函数类型
 */
export type MessageHandler = (message: RedisMessage) => void;

/**
 * Redis 频道前缀
 */
const CHANNEL_PREFIX = "ws:";

/**
 * 实例 ID（用于去重）
 */
const INSTANCE_ID = `${process.pid}-${Date.now()}`;

/**
 * @class RedisAdapter
 * @description Redis Pub/Sub 适配器
 */
class RedisAdapter {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private isInitialized = false;

  /**
   * @method init
   * @description 初始化 Redis 连接
   */
  async init(): Promise<void> {
    if (this.isInitialized || !env.REDIS_ENABLED) {
      return;
    }

    const redisOptions = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    };

    // 创建发布者连接
    this.publisher = new Redis(redisOptions);
    
    // 创建订阅者连接（需要独立连接）
    this.subscriber = new Redis(redisOptions);

    // 设置订阅者消息处理
    this.subscriber.on("message", (channel: string, message: string) => {
      this.handleMessage(channel, message);
    });

    // 等待连接就绪
    await Promise.all([
      this.publisher.ping(),
      this.subscriber.ping(),
    ]);

    this.isInitialized = true;
    console.log("[WS Redis] 适配器已初始化");
  }

  /**
   * @method isEnabled
   * @description 检查 Redis 是否可用
   */
  get isEnabled(): boolean {
    return this.isInitialized && this.publisher !== null && this.subscriber !== null;
  }

  /**
   * @method publish
   * @description 发布消息到 Redis 频道
   */
  async publish(channel: string, event: WsEvent, target: RedisMessage["target"]): Promise<void> {
    if (!this.isEnabled || !this.publisher) {
      return;
    }

    const message: RedisMessage = {
      event,
      target,
      sourceInstance: INSTANCE_ID,
    };

    try {
      await this.publisher.publish(
        `${CHANNEL_PREFIX}${channel}`,
        JSON.stringify(message)
      );
    } catch (err) {
      console.error(`[WS Redis] 发布消息失败: channel=${channel}`, err);
    }
  }

  /**
   * @method subscribe
   * @description 订阅 Redis 频道
   */
  async subscribe(channel: string, handler: MessageHandler): Promise<void> {
    if (!this.isEnabled || !this.subscriber) {
      return;
    }

    const fullChannel = `${CHANNEL_PREFIX}${channel}`;

    // 存储处理器
    let handlers = this.handlers.get(fullChannel);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(fullChannel, handlers);
      
      // 订阅频道
      await this.subscriber.subscribe(fullChannel);
    }
    handlers.add(handler);
  }

  /**
   * @method unsubscribe
   * @description 取消订阅 Redis 频道
   */
  async unsubscribe(channel: string, handler?: MessageHandler): Promise<void> {
    if (!this.subscriber) {
      return;
    }

    const fullChannel = `${CHANNEL_PREFIX}${channel}`;
    const handlers = this.handlers.get(fullChannel);

    if (!handlers) {
      return;
    }

    if (handler) {
      handlers.delete(handler);
    } else {
      handlers.clear();
    }

    if (handlers.size === 0) {
      this.handlers.delete(fullChannel);
      await this.subscriber.unsubscribe(fullChannel);
    }
  }

  /**
   * @method handleMessage
   * @description 处理收到的 Redis 消息
   */
  private handleMessage(channel: string, messageStr: string): void {
    try {
      const message = JSON.parse(messageStr) as RedisMessage;

      // 忽略自己发送的消息（避免重复推送）
      if (message.sourceInstance === INSTANCE_ID) {
        return;
      }

      // 调用注册的处理器
      const handlers = this.handlers.get(channel);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(message);
          } catch (err) {
            console.error(`[WS Redis] 处理消息失败: channel=${channel}`, err);
          }
        }
      }
    } catch (err) {
      console.error(`[WS Redis] 解析消息失败: channel=${channel}`, err);
    }
  }

  /**
   * @method publishToUser
   * @description 发布消息给指定用户
   */
  async publishToUser(userId: string, event: WsEvent): Promise<void> {
    await this.publish(`user:${userId}`, event, {
      type: "user",
      id: userId,
    });
  }

  /**
   * @method publishToConversation
   * @description 发布消息给会话参与者
   */
  async publishToConversation(
    conversationId: string,
    event: WsEvent,
    excludeUserIds?: string[]
  ): Promise<void> {
    await this.publish(`conversation:${conversationId}`, event, {
      type: "conversation",
      id: conversationId,
      excludeUserIds,
    });
  }

  /**
   * @method subscribeToUser
   * @description 订阅用户频道
   */
  async subscribeToUser(userId: string, handler: MessageHandler): Promise<void> {
    await this.subscribe(`user:${userId}`, handler);
  }

  /**
   * @method subscribeToConversation
   * @description 订阅会话频道
   */
  async subscribeToConversation(conversationId: string, handler: MessageHandler): Promise<void> {
    await this.subscribe(`conversation:${conversationId}`, handler);
  }

  // ========== 在线状态 Redis 共享 ==========

  /**
   * @method addOnlineDevice
   * @description 添加在线设备到 Redis
   */
  async addOnlineDevice(userId: string, deviceId: string): Promise<void> {
    if (!this.isEnabled || !this.publisher) {
      return;
    }

    const key = `${CHANNEL_PREFIX}online:user:${userId}`;
    try {
      await this.publisher.sadd(key, deviceId);
      // 设置过期时间（60秒，需要心跳续期）
      await this.publisher.expire(key, 60);
    } catch (err) {
      console.error(`[WS Redis] 添加在线设备失败: userId=${userId}`, err);
    }
  }

  /**
   * @method removeOnlineDevice
   * @description 从 Redis 移除在线设备
   */
  async removeOnlineDevice(userId: string, deviceId: string): Promise<void> {
    if (!this.isEnabled || !this.publisher) {
      return;
    }

    const key = `${CHANNEL_PREFIX}online:user:${userId}`;
    try {
      await this.publisher.srem(key, deviceId);
    } catch (err) {
      console.error(`[WS Redis] 移除在线设备失败: userId=${userId}`, err);
    }
  }

  /**
   * @method getOnlineDevices
   * @description 获取用户的在线设备列表
   */
  async getOnlineDevices(userId: string): Promise<string[]> {
    if (!this.isEnabled || !this.publisher) {
      return [];
    }

    const key = `${CHANNEL_PREFIX}online:user:${userId}`;
    try {
      return await this.publisher.smembers(key);
    } catch (err) {
      console.error(`[WS Redis] 获取在线设备失败: userId=${userId}`, err);
      return [];
    }
  }

  /**
   * @method refreshOnlineStatus
   * @description 刷新在线状态（续期）
   */
  async refreshOnlineStatus(userId: string): Promise<void> {
    if (!this.isEnabled || !this.publisher) {
      return;
    }

    const key = `${CHANNEL_PREFIX}online:user:${userId}`;
    try {
      await this.publisher.expire(key, 60);
    } catch (err) {
      console.error(`[WS Redis] 刷新在线状态失败: userId=${userId}`, err);
    }
  }

  /**
   * @method close
   * @description 关闭 Redis 连接
   */
  async close(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }
    if (this.publisher) {
      await this.publisher.quit();
      this.publisher = null;
    }
    this.handlers.clear();
    this.isInitialized = false;
    console.log("[WS Redis] 适配器已关闭");
  }
}

// 导出单例
export const redisAdapter = new RedisAdapter();
export type { RedisAdapter };

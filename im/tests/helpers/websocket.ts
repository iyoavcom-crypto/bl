/**
 * WebSocket 测试客户端辅助工具
 */

import WebSocket from "ws";

/**
 * WebSocket 事件类型
 */
export interface WsEvent<T = unknown> {
  type: string;
  timestamp: number;
  payload: T;
}

/**
 * 连接成功事件载荷
 */
export interface WsConnectedPayload {
  userId: string;
  deviceId: string;
  timestamp?: number;
}

/**
 * WebSocket 客户端配置
 */
export interface WsClientOptions {
  token: string;
  deviceId?: string;
  timeout?: number;
}

/**
 * 接收到的消息记录
 */
export interface ReceivedMessage {
  type: string;
  payload: unknown;
  receivedAt: number;
}

/**
 * WebSocket 测试客户端
 */
export class WsTestClient {
  private ws: WebSocket | null = null;
  private baseUrl: string;
  private options: WsClientOptions;
  private connected = false;
  private receivedMessages: ReceivedMessage[] = [];
  private messageHandlers: Map<string, ((payload: unknown) => void)[]> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private connectionResolve: (() => void) | null = null;
  private connectionReject: ((error: Error) => void) | null = null;

  constructor(baseUrl: string, options: WsClientOptions) {
    // 将 http:// 转换为 ws://
    this.baseUrl = baseUrl.replace(/^http/, "ws");
    this.options = options;
  }

  /**
   * 连接到 WebSocket 服务器
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const url = new URL("/ws", this.baseUrl);
    url.searchParams.set("token", this.options.token);
    if (this.options.deviceId) {
      url.searchParams.set("deviceId", this.options.deviceId);
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionResolve = resolve;
      this.connectionReject = reject;
    });

    this.ws = new WebSocket(url.toString());

    this.ws.on("open", () => {
      // 等待 connected 事件而不是 open 事件
    });

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString()) as WsEvent;
        this.handleMessage(message);
      } catch (err) {
        console.error("[WsTestClient] 解析消息失败:", err);
      }
    });

    this.ws.on("error", (err) => {
      if (this.connectionReject) {
        this.connectionReject(err);
        this.connectionReject = null;
        this.connectionResolve = null;
      }
    });

    this.ws.on("close", () => {
      this.connected = false;
    });

    // 设置连接超时
    const timeout = this.options.timeout ?? 5000;
    const timeoutId = setTimeout(() => {
      if (this.connectionReject) {
        this.connectionReject(new Error("连接超时"));
        this.connectionReject = null;
        this.connectionResolve = null;
        this.ws?.close();
      }
    }, timeout);

    try {
      await this.connectionPromise;
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WsEvent): void {
    // 记录消息
    this.receivedMessages.push({
      type: message.type,
      payload: message.payload,
      receivedAt: Date.now(),
    });

    // 处理 connected 事件
    if (message.type === "connected") {
      this.connected = true;
      if (this.connectionResolve) {
        this.connectionResolve();
        this.connectionResolve = null;
        this.connectionReject = null;
      }
    }

    // 调用注册的处理器
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(message.payload);
      }
    }

    // 调用通配符处理器
    const wildcardHandlers = this.messageHandlers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler(message);
      }
    }
  }

  /**
   * 发送消息
   */
  send(type: string, payload?: unknown): void {
    if (!this.ws || !this.connected) {
      throw new Error("WebSocket 未连接");
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  /**
   * 发送心跳
   */
  sendHeartbeat(): void {
    this.send("heartbeat");
  }

  /**
   * 发送 ping
   */
  sendPing(): void {
    this.send("ping");
  }

  /**
   * 注册消息处理器
   */
  on(type: string, handler: (payload: unknown) => void): void {
    let handlers = this.messageHandlers.get(type);
    if (!handlers) {
      handlers = [];
      this.messageHandlers.set(type, handlers);
    }
    handlers.push(handler);
  }

  /**
   * 移除消息处理器
   */
  off(type: string, handler?: (payload: unknown) => void): void {
    if (!handler) {
      this.messageHandlers.delete(type);
      return;
    }
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 等待指定类型的消息
   * @param type 消息类型
   * @param timeout 超时时间（毫秒）
   * @param sinceTimestamp 可选，只返回该时间戳之后收到的消息
   */
  waitForMessage<T = unknown>(type: string, timeout = 5000, sinceTimestamp?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      // 先检查已收到的消息缓存
      const since = sinceTimestamp ?? 0;
      const existing = this.receivedMessages.find(
        (m) => m.type === type && m.receivedAt > since
      );
      if (existing) {
        resolve(existing.payload as T);
        return;
      }

      const timeoutId = setTimeout(() => {
        this.off(type, handler);
        reject(new Error(`等待消息 "${type}" 超时`));
      }, timeout);

      const handler = (payload: unknown): void => {
        clearTimeout(timeoutId);
        this.off(type, handler);
        resolve(payload as T);
      };

      this.on(type, handler);
    });
  }

  /**
   * 创建消息等待器（先注册监听，后执行操作）
   * 用于处理 API 响应前消息已到达的情况
   */
  createMessageWaiter<T = unknown>(type: string, timeout = 5000): {
    wait: () => Promise<T>;
    cancel: () => void;
  } {
    let resolved = false;
    let resolvePromise: ((value: T) => void) | null = null;
    let rejectPromise: ((error: Error) => void) | null = null;

    const promise = new Promise<T>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        this.off(type, handler);
        rejectPromise?.(new Error(`等待消息 "${type}" 超时`));
      }
    }, timeout);

    const handler = (payload: unknown): void => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        this.off(type, handler);
        resolvePromise?.(payload as T);
      }
    };

    // 立即注册监听器
    this.on(type, handler);

    return {
      wait: () => promise,
      cancel: () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          this.off(type, handler);
        }
      },
    };
  }

  /**
   * 获取所有接收到的消息
   */
  getReceivedMessages(): ReceivedMessage[] {
    return [...this.receivedMessages];
  }

  /**
   * 获取指定类型的消息
   */
  getMessagesByType(type: string): ReceivedMessage[] {
    return this.receivedMessages.filter((m) => m.type === type);
  }

  /**
   * 清空消息记录
   */
  clearMessages(): void {
    this.receivedMessages = [];
  }

  /**
   * 检查是否收到过指定类型的消息
   */
  hasReceivedMessage(type: string): boolean {
    return this.receivedMessages.some((m) => m.type === type);
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.receivedMessages = [];
    this.messageHandlers.clear();
  }
}

/**
 * 创建 WebSocket 测试客户端
 */
export function createWsClient(baseUrl: string, options: WsClientOptions): WsTestClient {
  return new WsTestClient(baseUrl, options);
}

export type { WsTestClient as WsClient };

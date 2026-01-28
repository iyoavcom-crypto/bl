/**
 * @packageDocumentation
 * @module websocket/server
 * @description WebSocket 服务器入口
 */

import { WebSocketServer, WebSocket, RawData } from "ws";
import type { Server as HttpServer, IncomingMessage } from "http";
import {
  connectionManager,
  getConnectionInfo,
  startHeartbeat,
  stopHeartbeat,
  handlePong,
  ConnectionRejectReason,
  type Connection,
} from "./connection/index.js";
import { messageRouter, redisAdapter } from "./router/index.js";
import IMDeviceService from "@/services/im/device.js";

/**
 * @interface ClientMessage
 * @description 客户端发送的消息格式
 */
interface ClientMessage {
  type: string;
  payload?: unknown;
}

/**
 * @interface WebSocketServerOptions
 * @description WebSocket 服务器配置
 */
export interface WebSocketServerOptions {
  path?: string;
}

/**
 * @class WsServer
 * @description WebSocket 服务器封装
 */
class WsServer {
  private wss: WebSocketServer | null = null;
  private isInitialized = false;

  /**
   * @method init
   * @description 初始化 WebSocket 服务器
   */
  async init(httpServer: HttpServer, options: WebSocketServerOptions = {}): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const { path = "/ws" } = options;

    // 初始化路由器（包含 Redis 适配器）
    await messageRouter.init();

    // 创建 WebSocket 服务器
    this.wss = new WebSocketServer({
      server: httpServer,
      path,
    });

    // 监听连接事件
    this.wss.on("connection", (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.wss.on("error", (err) => {
      console.error("[WS Server] 服务器错误:", err);
    });

    // 启动心跳检测
    startHeartbeat();

    this.isInitialized = true;
    console.log(`[WS Server] WebSocket 服务器已启动，路径: ${path}`);
  }

  /**
   * @method handleConnection
   * @description 处理新的 WebSocket 连接
   */
  private async handleConnection(ws: WebSocket, request: IncomingMessage): Promise<void> {
    // 验证连接
    const connectionInfo = await getConnectionInfo(request);

    if (!connectionInfo) {
      ws.close(4001, "认证失败");
      return;
    }

    const { userId, deviceId, payload } = connectionInfo;

    // 注册连接（包含连接数限制检查）
    const addResult = connectionManager.add(deviceId, ws, userId, payload);
    if (!addResult.success) {
      const errorCode = addResult.rejectReason === ConnectionRejectReason.USER_DEVICE_LIMIT ? 4003 : 4004;
      const errorMsg = addResult.rejectReason === ConnectionRejectReason.USER_DEVICE_LIMIT
        ? "设备数量超过限制"
        : "服务器连接数已满";
      ws.close(errorCode, errorMsg);
      return;
    }
    console.log(`[WS Server] 连接已建立: userId=${userId}, deviceId=${deviceId}`);

    // 更新设备在线状态（静默处理设备不存在的情况，设备可能通过其他接口注册）
    IMDeviceService.heartbeat(userId, deviceId).catch(() => {
      // 设备可能尚未注册，静默忽略
    });

    // 订阅用户频道（跨实例推送）
    if (redisAdapter.isEnabled) {
      await redisAdapter.addOnlineDevice(userId, deviceId);
      await messageRouter.subscribeToUserChannel(userId);
    }

    // 监听 pong（心跳响应）
    ws.on("pong", () => {
      handlePong(deviceId);
    });

    // 监听消息
    ws.on("message", (data) => {
      this.handleMessage(deviceId, data);
    });

    // 监听关闭
    ws.on("close", (code, reason) => {
      this.handleClose(deviceId, code, reason.toString());
    });

    // 监听错误
    ws.on("error", (err) => {
      console.error(`[WS Server] 连接错误: deviceId=${deviceId}`, err);
    });

    // 发送连接成功消息
    ws.send(JSON.stringify({
      type: "connected",
      payload: { userId, deviceId, timestamp: Date.now() },
    }));
  }

  /**
   * @method handleMessage
   * @description 处理客户端消息
   */
  private handleMessage(deviceId: string, data: RawData): void {
    const connection = connectionManager.get(deviceId);
    if (!connection) {
      return;
    }

    try {
      const message = JSON.parse(data.toString()) as ClientMessage;

      switch (message.type) {
        case "ping":
          // 心跳 pong
          connection.ws.send(JSON.stringify({ type: "pong", payload: { timestamp: Date.now() } }));
          handlePong(deviceId);
          break;

        case "heartbeat":
          // 刷新心跳
          handlePong(deviceId);
          // 同时刷新 Redis 在线状态
          if (redisAdapter.isEnabled) {
            redisAdapter.refreshOnlineStatus(connection.userId);
          }
          break;

        default:
          // 其他消息类型可扩展处理
          console.log(`[WS Server] 收到消息: type=${message.type}, deviceId=${deviceId}`);
      }
    } catch (err) {
      console.error(`[WS Server] 解析消息失败: deviceId=${deviceId}`, err);
    }
  }

  /**
   * @method handleClose
   * @description 处理连接关闭
   */
  private async handleClose(deviceId: string, code: number, reason: string): Promise<void> {
    const connection = connectionManager.get(deviceId);
    if (!connection) {
      return;
    }

    const { userId } = connection;

    // 移除连接
    connectionManager.remove(deviceId);

    // 标记设备离线（静默处理设备不存在的情况）
    IMDeviceService.goOffline(userId, deviceId).catch(() => {
      // 设备可能未注册或已删除，静默忽略
    });

    // 从 Redis 移除在线状态
    if (redisAdapter.isEnabled) {
      await redisAdapter.removeOnlineDevice(userId, deviceId);
    }

    console.log(`[WS Server] 连接已关闭: deviceId=${deviceId}, code=${code}, reason=${reason}`);
  }

  /**
   * @method getStats
   * @description 获取服务器统计信息
   */
  getStats(): { connections: number; users: number } {
    return {
      connections: connectionManager.size,
      users: connectionManager.onlineUserCount,
    };
  }

  /**
   * @method close
   * @description 关闭 WebSocket 服务器
   */
  async close(): Promise<void> {
    // 停止心跳检测
    stopHeartbeat();

    // 关闭所有连接
    connectionManager.closeAll(1001, "Server shutdown");

    // 关闭路由器（包括 Redis）
    await messageRouter.close();

    // 关闭 WebSocket 服务器
    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss!.close(() => resolve());
      });
      this.wss = null;
    }

    this.isInitialized = false;
    console.log("[WS Server] WebSocket 服务器已关闭");
  }
}

// 导出单例
export const wsServer = new WsServer();
export type { WsServer };

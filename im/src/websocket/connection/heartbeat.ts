/**
 * @packageDocumentation
 * @module websocket/connection/heartbeat
 * @description WebSocket 心跳检测
 */

import { connectionManager } from "./manager.js";
import { env } from "@/config/index.js";
import IMDeviceService from "@/services/im/device.js";

/** 心跳定时器 */
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * @function startHeartbeat
 * @description 启动心跳检测
 */
export function startHeartbeat(): void {
  if (heartbeatInterval) {
    return;
  }

  const pingIntervalMs = env.WS_PING_INTERVAL_MS;
  const idleTimeoutMs = env.WS_IDLE_TIMEOUT_MS;

  heartbeatInterval = setInterval(() => {
    const now = Date.now();
    const connections = connectionManager.getAll();

    for (const connection of connections) {
      // 检查是否超时
      const idleTime = now - connection.lastPongAt;
      if (idleTime > idleTimeoutMs) {
        console.log(`[WS] 连接超时: deviceId=${connection.deviceId}, idleTime=${idleTime}ms`);
        
        // 标记设备离线
        IMDeviceService.goOffline(connection.userId, connection.deviceId).catch((err) => {
          console.error(`[WS] 标记设备离线失败:`, err);
        });

        // 关闭连接
        connectionManager.close(connection.deviceId, 1001, "Connection timeout");
        continue;
      }

      // 发送 ping
      try {
        if (connection.ws.readyState === 1) {
          connection.ws.ping();
        }
      } catch (err) {
        console.error(`[WS] 发送 ping 失败: deviceId=${connection.deviceId}`, err);
      }
    }
  }, pingIntervalMs);

  console.log(`[WS] 心跳检测已启动: interval=${pingIntervalMs}ms, timeout=${idleTimeoutMs}ms`);
}

/**
 * @function stopHeartbeat
 * @description 停止心跳检测
 */
export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log("[WS] 心跳检测已停止");
  }
}

/**
 * @function handlePong
 * @description 处理 pong 响应
 */
export function handlePong(deviceId: string): void {
  connectionManager.updatePongTime(deviceId);
}

/**
 * @packageDocumentation
 * @module websocket/connection/manager
 * @description WebSocket 连接管理器
 */

import type { WebSocket } from "ws";
import type { JwtUserPayload } from "@/tools/jwt/index.js";

/**
 * @interface Connection
 * @description WebSocket 连接信息
 */
export interface Connection {
  ws: WebSocket;
  userId: string;
  deviceId: string;
  payload: JwtUserPayload;
  connectedAt: number;
  lastPongAt: number;
}

/**
 * @interface ConnectionLimits
 * @description 连接数限制配置
 */
export interface ConnectionLimits {
  /** 单用户最大设备连接数 */
  maxDevicesPerUser: number;
  /** 全局最大连接数 */
  maxTotalConnections: number;
}

/**
 * @enum ConnectionRejectReason
 * @description 连接拒绝原因
 */
export enum ConnectionRejectReason {
  USER_DEVICE_LIMIT = "USER_DEVICE_LIMIT",
  GLOBAL_CONNECTION_LIMIT = "GLOBAL_CONNECTION_LIMIT",
}

/**
 * @interface AddConnectionResult
 * @description 添加连接的结果
 */
export interface AddConnectionResult {
  success: boolean;
  rejectReason?: ConnectionRejectReason;
}

/**
 * @class ConnectionManager
 * @description WebSocket 连接管理器
 */
class ConnectionManager {
  /** 按设备 ID 索引的连接映射 */
  private connections: Map<string, Connection> = new Map();
  
  /** 按用户 ID 索引的设备列表 */
  private userDevices: Map<string, Set<string>> = new Map();

  /** 连接数限制配置 */
  private limits: ConnectionLimits = {
    maxDevicesPerUser: 5,      // 单用户最多 5 个设备
    maxTotalConnections: 10000, // 全局最多 10000 连接
  };

  /**
   * @method setLimits
   * @description 设置连接数限制
   */
  setLimits(limits: Partial<ConnectionLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  /**
   * @method getLimits
   * @description 获取当前连接数限制配置
   */
  getLimits(): Readonly<ConnectionLimits> {
    return { ...this.limits };
  }

  /**
   * @method canAddConnection
   * @description 检查是否可以添加新连接
   */
  canAddConnection(userId: string, deviceId: string): AddConnectionResult {
    // 如果是同一设备重连，允许（会替换旧连接）
    const existingConn = this.connections.get(deviceId);
    if (existingConn) {
      return { success: true };
    }

    // 检查全局连接数限制
    if (this.connections.size >= this.limits.maxTotalConnections) {
      console.warn(`[WS] 全局连接数已达上限: ${this.connections.size}/${this.limits.maxTotalConnections}`);
      return { success: false, rejectReason: ConnectionRejectReason.GLOBAL_CONNECTION_LIMIT };
    }

    // 检查用户设备数限制
    const userDevices = this.userDevices.get(userId);
    if (userDevices && userDevices.size >= this.limits.maxDevicesPerUser) {
      console.warn(`[WS] 用户 ${userId} 设备数已达上限: ${userDevices.size}/${this.limits.maxDevicesPerUser}`);
      return { success: false, rejectReason: ConnectionRejectReason.USER_DEVICE_LIMIT };
    }

    return { success: true };
  }

  /**
   * @method add
   * @description 添加新连接
   * @returns 添加结果，包含是否成功及失败原因
   */
  add(deviceId: string, ws: WebSocket, userId: string, payload: JwtUserPayload): AddConnectionResult {
    // 检查连接数限制
    const canAdd = this.canAddConnection(userId, deviceId);
    if (!canAdd.success) {
      return canAdd;
    }

    const now = Date.now();

    // 如果设备已存在，先移除旧连接
    const existingConn = this.connections.get(deviceId);
    if (existingConn) {
      try {
        existingConn.ws.close(1000, "Replaced by new connection");
      } catch {
        // 忽略关闭错误
      }
      // 不调用 remove，因为我们会立即替换
    }
    
    // 存储连接
    this.connections.set(deviceId, {
      ws,
      userId,
      deviceId,
      payload,
      connectedAt: now,
      lastPongAt: now,
    });

    // 更新用户设备索引
    let devices = this.userDevices.get(userId);
    if (!devices) {
      devices = new Set();
      this.userDevices.set(userId, devices);
    }
    devices.add(deviceId);

    console.log(`[WS] 连接已建立: userId=${userId}, deviceId=${deviceId}, 用户设备数=${devices.size}, 总连接数=${this.connections.size}`);
    return { success: true };
  }

  /**
   * @method remove
   * @description 移除连接
   */
  remove(deviceId: string): Connection | undefined {
    const connection = this.connections.get(deviceId);
    if (!connection) {
      return undefined;
    }

    // 从连接映射中移除
    this.connections.delete(deviceId);

    // 从用户设备索引中移除
    const devices = this.userDevices.get(connection.userId);
    if (devices) {
      devices.delete(deviceId);
      if (devices.size === 0) {
        this.userDevices.delete(connection.userId);
      }
    }

    console.log(`[WS] 连接已断开: userId=${connection.userId}, deviceId=${deviceId}`);
    return connection;
  }

  /**
   * @method get
   * @description 获取连接
   */
  get(deviceId: string): Connection | undefined {
    return this.connections.get(deviceId);
  }

  /**
   * @method getByUser
   * @description 获取用户的所有连接
   */
  getByUser(userId: string): Connection[] {
    const deviceIds = this.userDevices.get(userId);
    if (!deviceIds) {
      return [];
    }

    const connections: Connection[] = [];
    for (const deviceId of deviceIds) {
      const conn = this.connections.get(deviceId);
      if (conn) {
        connections.push(conn);
      }
    }
    return connections;
  }

  /**
   * @method getAll
   * @description 获取所有连接
   */
  getAll(): Connection[] {
    return Array.from(this.connections.values());
  }

  /**
   * @method isUserOnline
   * @description 检查用户是否在线
   */
  isUserOnline(userId: string): boolean {
    const devices = this.userDevices.get(userId);
    return !!devices && devices.size > 0;
  }

  /**
   * @method getUserDeviceIds
   * @description 获取用户的设备 ID 列表
   */
  getUserDeviceIds(userId: string): string[] {
    const devices = this.userDevices.get(userId);
    return devices ? Array.from(devices) : [];
  }

  /**
   * @method updatePongTime
   * @description 更新连接的最后 pong 时间
   */
  updatePongTime(deviceId: string): void {
    const connection = this.connections.get(deviceId);
    if (connection) {
      connection.lastPongAt = Date.now();
    }
  }

  /**
   * @method getSize
   * @description 获取当前连接数
   */
  get size(): number {
    return this.connections.size;
  }

  /**
   * @method getOnlineUserCount
   * @description 获取在线用户数
   */
  get onlineUserCount(): number {
    return this.userDevices.size;
  }

  /**
   * @method send
   * @description 向指定设备发送消息
   */
  send(deviceId: string, data: string): boolean {
    const connection = this.connections.get(deviceId);
    if (!connection || connection.ws.readyState !== 1) {
      return false;
    }

    try {
      connection.ws.send(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @method sendToUser
   * @description 向用户的所有设备发送消息
   */
  sendToUser(userId: string, data: string): number {
    const connections = this.getByUser(userId);
    let sentCount = 0;

    for (const conn of connections) {
      if (this.send(conn.deviceId, data)) {
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * @method broadcast
   * @description 广播消息给所有连接
   */
  broadcast(data: string, excludeDeviceIds?: string[]): number {
    const excludeSet = new Set(excludeDeviceIds || []);
    let sentCount = 0;

    for (const [deviceId] of this.connections) {
      if (!excludeSet.has(deviceId)) {
        if (this.send(deviceId, data)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  /**
   * @method close
   * @description 关闭指定连接
   */
  close(deviceId: string, code?: number, reason?: string): void {
    const connection = this.connections.get(deviceId);
    if (connection) {
      try {
        connection.ws.close(code || 1000, reason || "Connection closed");
      } catch {
        // 忽略关闭错误
      }
      this.remove(deviceId);
    }
  }

  /**
   * @method closeAll
   * @description 关闭所有连接
   */
  closeAll(code?: number, reason?: string): void {
    for (const [deviceId] of this.connections) {
      this.close(deviceId, code, reason);
    }
  }
}

// 导出单例
export const connectionManager = new ConnectionManager();
export type { ConnectionManager };

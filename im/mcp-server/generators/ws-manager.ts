/**
 * @packageDocumentation
 * @module mcp-server/generators/ws-manager
 * @description WebSocket 管理器完整代码常量
 */

/** WebSocket 管理器完整代码 */
export const WS_MANAGER_CODE = `import * as SecureStore from 'expo-secure-store';
import { AppState, AppStateStatus } from 'react-native';

// ============================================================
// 类型定义
// ============================================================

type WsEventType =
  | 'connected' | 'error' | 'kick'
  | 'message:new' | 'message:recalled' | 'message:read' | 'message:delivered'
  | 'typing:start' | 'typing:stop'
  | 'call:invite' | 'call:ring' | 'call:answer' | 'call:reject' | 'call:end' | 'call:signal'
  | 'presence:online' | 'presence:offline'
  | 'friend:request' | 'friend:accepted'
  | 'group:invited' | 'group:kicked' | 'group:member_joined' | 'group:member_left'
  | 'group:updated' | 'group:muted' | 'group:unmuted' | 'group:dissolved';

type EventCallback = (payload: unknown) => void;

interface WsMessage {
  type: string;
  payload?: unknown;
}

// ============================================================
// WebSocket 管理器
// ============================================================

class WebSocketManager {
  private ws: WebSocket | null = null;
  private deviceId: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Map<WsEventType, Set<EventCallback>> = new Map();
  private isConnecting: boolean = false;

  private readonly WS_URL = __DEV__
    ? 'ws://192.168.1.6:3009/ws'
    : 'wss://api.yourdomain.com/ws';

  constructor() {
    // 监听应用状态变化
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  /**
   * 连接 WebSocket
   */
  async connect(deviceId: string): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.deviceId = deviceId;
    this.isConnecting = true;

    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        throw new Error('未登录');
      }

      const url = \`\${this.WS_URL}?token=\${token}&deviceId=\${deviceId}\`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] 连接成功');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WsMessage = JSON.parse(event.data);
          this.emit(data.type as WsEventType, data.payload);
        } catch (e) {
          console.error('[WS] 消息解析失败:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] 连接错误:', error);
        this.emit('error', { error });
      };

      this.ws.onclose = (event) => {
        console.log('[WS] 连接关闭:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();

        // 被踢下线不重连
        if (event.code === 4002) {
          this.emit('kick', { reason: event.reason });
          return;
        }

        // 自动重连
        this.scheduleReconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts; // 阻止重连
    if (this.ws) {
      this.ws.close(1000, '用户主动断开');
      this.ws = null;
    }
  }

  /**
   * 发送消息
   */
  send(type: string, payload?: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] 连接未就绪，无法发送消息');
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  /**
   * 订阅事件
   */
  on(event: WsEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * 触发事件
   */
  private emit(event: WsEventType, payload: unknown): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(payload);
      } catch (e) {
        console.error('[WS] 事件处理错误:', e);
      }
    });
  }

  /**
   * 心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send('ping');
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] 达到最大重连次数');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    console.log(\`[WS] \${delay}ms 后重连 (第 \${this.reconnectAttempts} 次)\`);
    setTimeout(() => {
      if (this.deviceId) {
        this.connect(this.deviceId);
      }
    }, delay);
  }

  /**
   * 应用状态变化处理
   */
  private handleAppStateChange(state: AppStateStatus): void {
    if (state === 'active' && this.deviceId && !this.ws) {
      console.log('[WS] 应用激活，尝试重连');
      this.reconnectAttempts = 0;
      this.connect(this.deviceId);
    }
  }

  /**
   * 连接状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// 导出单例
export const wsManager = new WebSocketManager();

// ============================================================
// 使用示例
// ============================================================

/*
// 1. 连接
await wsManager.connect('device-uuid');

// 2. 监听事件
const unsubscribe = wsManager.on('message:new', (payload) => {
  console.log('新消息:', payload);
});

// 3. 发送消息（如果需要）
wsManager.send('typing:start', { conversationId: 'xxx' });

// 4. 断开连接
wsManager.disconnect();

// 5. 取消订阅
unsubscribe();
*/
`;

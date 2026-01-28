import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, CONNECTION_CONFIG } from '@/config/constants';
import { API_CONFIG } from '@/config/api/env';
import type { 
  WsEventType, 
  WsEvent,
  WsConnectedPayload,
  WsKickPayload,
  WsErrorPayload,
  EventCallback 
} from '@/types';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface WebSocketManagerConfig {
  url: string;
  heartbeatInterval: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketManagerConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private pendingMessages: string[] = [];

  constructor(config?: Partial<WebSocketManagerConfig>) {
    this.config = {
      url: API_CONFIG.WS_URL,
      heartbeatInterval: CONNECTION_CONFIG.HEARTBEAT_INTERVAL,
      maxReconnectAttempts: CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectDelay: CONNECTION_CONFIG.RECONNECT_DELAY,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }

    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[WS] No token, cannot connect');
      }
      return;
    }

    this.state = 'connecting';
    
    try {
      const url = `${this.config.url}?token=${token}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (err) {
      this.state = 'disconnected';
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.state = 'disconnected';
  }

  send<T>(type: string, payload?: T): void {
    const message = JSON.stringify({
      type,
      timestamp: Date.now(),
      payload,
    });

    if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.pendingMessages.push(message);
    }
  }

  on<T = unknown>(type: WsEventType | string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback as EventCallback);

    return () => {
      this.listeners.get(type)?.delete(callback as EventCallback);
    };
  }

  off(type: WsEventType | string, callback?: EventCallback): void {
    if (callback) {
      this.listeners.get(type)?.delete(callback);
    } else {
      this.listeners.delete(type);
    }
  }

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  private handleOpen(): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[WS] Connected');
    }
    
    this.state = 'connected';
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.flushPendingMessages();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: WsEvent = JSON.parse(event.data);
      
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[WS] Received:', data.type);
      }

      // 处理系统事件
      switch (data.type) {
        case 'connected':
          this.handleConnected(data.payload as WsConnectedPayload);
          break;
        case 'kick':
          this.handleKick(data.payload as WsKickPayload);
          break;
        case 'error':
          this.handleWsError(data.payload as WsErrorPayload);
          break;
        case 'heartbeat:ack':
          // 心跳响应，不需要处理
          break;
      }

      // 通知监听器
      this.emit(data.type, data.payload);
    } catch {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error('[WS] Failed to parse message');
      }
    }
  }

  private handleClose(event: CloseEvent): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[WS] Closed:', event.code, event.reason);
    }

    this.stopHeartbeat();
    this.state = 'disconnected';

    // 非正常关闭尝试重连
    if (event.code !== 1000 && event.code !== 4001 && event.code !== 4002) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[WS] Error:', event);
    }
  }

  private handleConnected(payload: WsConnectedPayload): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[WS] User connected:', payload.userId);
    }
  }

  private handleKick(payload: WsKickPayload): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[WS] Kicked:', payload.reason);
    }
    this.disconnect();
    this.emit('kick', payload);
  }

  private handleWsError(payload: WsErrorPayload): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[WS] Server error:', payload.code, payload.message);
    }
  }

  private emit(type: string, payload: unknown): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (err) {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.error('[WS] Listener error:', err);
          }
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send('heartbeat');
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[WS] Max reconnect attempts reached');
      }
      return;
    }

    this.state = 'reconnecting';
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[WS] Reconnecting... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      }
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushPendingMessages(): void {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      }
    }
  }
}

// 单例
export const wsManager = new WebSocketManager();

// Hook用于组件中订阅事件
export function useWebSocketEvent<T = unknown>(
  type: WsEventType | string,
  callback: EventCallback<T>
): void {
  // 注意：这不是React Hook，是工具函数
  // 在组件中使用时应该用useEffect包装
}

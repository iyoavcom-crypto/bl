# Expo/iOS 接入指南

## 1. 环境配置
```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.6:3009/api'  // 开发环境用局域网 IP
  : 'https://api.yourdomain.com/api';

const WS_URL = __DEV__
  ? 'ws://192.168.1.6:3009/ws'
  : 'wss://api.yourdomain.com/ws';
```

## 2. 获取 Expo Push Token
```typescript
import * as Notifications from 'expo-notifications';

const token = (await Notifications.getExpoPushTokenAsync()).data;
// ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

## 3. 注册设备
```typescript
await fetch(`${API_BASE_URL}/im/devices/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    platform: 'ios',
    deviceId: 'device-uuid',
    pushToken: token,
    pushProvider: 'expo',
  }),
});
```

## 4. WebSocket 连接
```typescript
const ws = new WebSocket(`${WS_URL}?token=${accessToken}&deviceId=${deviceId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'message:new':
      // 处理新消息
      break;
    case 'call:invite':
      // 处理来电
      break;
  }
};

// 心跳
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

## 5. 通知通道配置（Android）
```typescript
await Notifications.setNotificationChannelAsync('messages', {
  name: '消息通知',
  importance: Notifications.AndroidImportance.DEFAULT,
});

await Notifications.setNotificationChannelAsync('calls', {
  name: '来电通知',
  importance: Notifications.AndroidImportance.HIGH,
});
```

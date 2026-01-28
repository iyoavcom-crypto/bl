# iOS 前端项目搭建指南

> 版本：1.0.0 | 更新：2026-01-27

## 一、环境依赖

### 1.1 开发环境

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18+ | JavaScript 运行时 |
| npm | 9+ | 包管理器 |
| Xcode | 15+ | iOS 编译工具（App Store 安装） |
| CocoaPods | 1.14+ | iOS 依赖管理 |
| eas-cli | 最新版 | Expo 应用服务 CLI |

### 1.2 账号要求

| 账号 | 费用 | 用途 |
|------|------|------|
| Apple Developer | $99/年 | 真机调试、上架 App Store |
| Expo 账号 | 免费 | EAS 构建服务 |

### 1.3 环境安装

```bash
# 安装 Node.js (推荐使用 nvm)
nvm install 18
nvm use 18

# 安装 eas-cli
npm install -g eas-cli

# 安装 CocoaPods (macOS)
sudo gem install cocoapods

# 验证环境
node -v      # v18.x.x
eas --version
pod --version
```

---

## 二、项目初始化

### 2.1 创建 Expo 项目

```bash
# 创建项目
npx create-expo-app@latest im-app --template blank-typescript

# 进入项目目录
cd im-app
```

### 2.2 安装核心依赖

```bash
# HTTP 客户端
npm install axios

# 导航
npx expo install expo-router react-native-screens react-native-safe-area-context

# 状态管理
npm install zustand

# 存储
npx expo install expo-secure-store @react-native-async-storage/async-storage

# 推送通知
npx expo install expo-notifications expo-device expo-constants

# WebSocket
npm install

# WebRTC（语音通话）
npx expo install react-native-webrtc

# UI 组件
npx expo install expo-image expo-linear-gradient

# 权限
npx expo install expo-av expo-media-library expo-image-picker
```

### 2.3 项目结构

```
im-app/
├── app/                      # expo-router 页面
│   ├── (auth)/               # 认证相关页面
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/               # 主页面（底部导航）
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # 会话列表
│   │   ├── contacts.tsx      # 联系人
│   │   └── profile.tsx       # 个人中心
│   ├── chat/                 # 聊天页面
│   │   └── [conversationId].tsx
│   ├── call/                 # 通话页面
│   │   └── [callId].tsx
│   ├── _layout.tsx           # 根布局
│   └── index.tsx             # 入口重定向
├── src/
│   ├── api/                  # API 封装
│   │   ├── client.ts         # axios 实例
│   │   ├── auth.ts           # 认证 API
│   │   ├── user.ts           # 用户 API
│   │   ├── conversation.ts   # 会话 API
│   │   ├── message.ts        # 消息 API
│   │   ├── friend.ts         # 好友 API
│   │   ├── group.ts          # 群组 API
│   │   ├── call.ts           # 通话 API
│   │   └── index.ts
│   ├── stores/               # 状态管理
│   │   ├── auth.ts           # 认证状态
│   │   ├── conversation.ts   # 会话状态
│   │   ├── message.ts        # 消息状态
│   │   └── index.ts
│   ├── services/             # 业务服务
│   │   ├── ws.ts             # WebSocket 管理
│   │   ├── push.ts           # 推送服务
│   │   └── webrtc.ts         # WebRTC 服务
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   └── useWebSocket.ts
│   ├── components/           # 通用组件
│   │   ├── Avatar.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ...
│   ├── types/                # 类型定义
│   │   └── index.ts          # 从后端 MCP 获取
│   └── utils/                # 工具函数
│       ├── storage.ts
│       └── format.ts
├── assets/                   # 静态资源
├── app.json                  # Expo 配置
├── eas.json                  # EAS 构建配置
├── tsconfig.json
└── package.json
```

---

## 三、核心配置

### 3.1 app.json

```json
{
  "expo": {
    "name": "IM App",
    "slug": "im-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.imapp",
      "buildNumber": "1",
      "supportsTablet": false,
      "infoPlist": {
        "NSMicrophoneUsageDescription": "语音通话需要使用麦克风",
        "NSCameraUsageDescription": "视频通话需要使用摄像头",
        "NSPhotoLibraryUsageDescription": "发送图片需要访问相册",
        "UIBackgroundModes": ["audio", "voip", "remote-notification"]
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "允许 $(PRODUCT_NAME) 访问麦克风用于语音通话"
        }
      ]
    ],
    "scheme": "imapp",
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 3.2 eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "distribution": "store",
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### 3.3 tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@app/*": ["app/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### 3.4 环境变量

创建 `.env` 文件：

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
EXPO_PUBLIC_WS_URL=wss://your-api-domain.com/ws
```

---

## 四、API 客户端封装

### 4.1 axios 实例 (src/api/client.ts)

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 Token
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理 Token 过期
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          await SecureStore.setItemAsync('access_token', data.access);
          // 重试原请求
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return client.request(error.config);
        } catch {
          // 刷新失败，清除 Token，跳转登录
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
```

---

## 五、WebSocket 连接

### 5.1 WebSocket 管理器 (src/services/ws.ts)

```typescript
type EventHandler = (payload: unknown) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  connect(token: string): void {
    const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
    this.ws = new WebSocket(`${WS_URL}?token=${token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      this.emit(type, payload);
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.reconnect(token);
    };
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', {});
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  private reconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(token), 3000 * this.reconnectAttempts);
    }
  }

  send(type: string, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(type: string, handler: EventHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  private emit(type: string, payload: unknown): void {
    this.handlers.get(type)?.forEach((handler) => handler(payload));
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.ws?.close();
  }
}

export const wsManager = new WebSocketManager();
```

---

## 六、推送通知配置

### 6.1 注册推送 Token

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import client from '@/api/client';

export async function registerPushToken(deviceId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('推送通知仅在真机上可用');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('推送通知权限被拒绝');
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;

  // 上报 Token 到后端
  await client.post(`/im/devices/${deviceId}/push-token`, {
    pushToken: token,
    pushProvider: 'expo',
  });

  return token;
}
```

---

## 七、iOS 上架流程

### 7.1 准备工作

1. **Apple Developer 账号**
   - 访问 https://developer.apple.com
   - 注册开发者账号（$99/年）
   - 完成税务和银行信息

2. **App Store Connect**
   - 访问 https://appstoreconnect.apple.com
   - 创建新应用
   - 填写应用信息、截图、描述

3. **证书配置**
   - Xcode → Settings → Accounts → 添加 Apple ID
   - 或使用 EAS 自动管理证书

### 7.2 EAS 构建与提交

```bash
# 1. 登录 EAS
eas login

# 2. 配置项目
eas build:configure

# 3. 构建生产版本
eas build --platform ios --profile production

# 4. 提交到 App Store
eas submit --platform ios --profile production
```

### 7.3 App Store 审核清单

| 项目 | 要求 |
|------|------|
| **应用名称** | 唯一、无侵权 |
| **描述** | 准确描述功能 |
| **截图** | 6.7" 和 6.5" 尺寸各 3-10 张 |
| **隐私政策** | 必须提供 URL |
| **年龄分级** | 正确填写内容分级问卷 |
| **联系信息** | 有效的支持邮箱 |

### 7.4 常见审核拒绝原因

| 原因 | 解决方案 |
|------|----------|
| 崩溃或无法启动 | 充分测试真机 |
| 功能不完整 | 确保所有功能可用 |
| 隐私政策缺失 | 添加隐私政策链接 |
| 第三方登录问题 | 同时提供 Apple 登录 |
| 元数据不准确 | 截图与实际功能一致 |

---

## 八、开发命令

```bash
# 启动开发服务器
npx expo start

# iOS 模拟器运行
npx expo run:ios

# 构建开发版本
eas build --platform ios --profile development

# 构建预览版本（内部测试）
eas build --platform ios --profile preview

# 构建生产版本
eas build --platform ios --profile production

# 提交到 App Store
eas submit --platform ios

# 更新 OTA（无需重新审核）
eas update --branch production
```

---

## 九、调试与日志

### 9.1 开发调试

```bash
# 使用 Expo DevTools
npx expo start --dev-client

# React Native Debugger
# 安装：brew install --cask react-native-debugger
```

### 9.2 生产日志

使用 Expo 的 `expo-updates` 和 Sentry 收集崩溃日志。

---

## 十、注意事项

1. **bundleIdentifier 唯一**：必须是全球唯一的反向域名格式
2. **EAS projectId**：必须是有效的 UUID 格式
3. **iOS 15+ 支持**：建议最低支持版本设为 iOS 15
4. **隐私权限**：必须在 Info.plist 声明所有使用的权限
5. **后台模式**：语音通话需要 `voip` 和 `audio` 后台模式
6. **crypto polyfill**：React Native 中避免使用 Node.js 的 crypto 模块

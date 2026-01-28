# IM 应用完整实施方案

> 目标：iOS App Store 上架 + 前后端完全一致
> 时间：2026-01-28
> 项目：即时通讯应用（my-app + im）

---

## 第一部分：iOS App Store 上架标准

### 一、必须满足的技术要求

#### 1.1 应用信息完整性

**必需文件清单：**

- [ ] **App 图标** (Icon)
  - 1024x1024 px (App Store)
  - 180x180 px (iPhone)
  - 120x120 px (iPhone)
  - 87x87 px (iPhone)
  - 60x60 px (iPhone)
  - 40x40 px (iPad/iPhone)
  
- [ ] **启动画面** (Launch Screen)
  - 使用 `LaunchScreen.storyboard` 或图片
  - 支持所有设备尺寸
  
- [ ] **App 名称**
  - 主标题（30字符以内）
  - 副标题（30字符以内）
  
- [ ] **隐私政策 URL**（必需）
  - HTTPS 链接
  - 包含数据收集说明
  
- [ ] **用户协议 URL**
  - 服务条款
  - 使用条款

**当前状态检查：**
```bash
# 检查图标配置
ls my-app/assets/images/icon*
ls my-app/ios/myapp/Images.xcassets/AppIcon.appiconset/

# 检查启动屏幕
ls my-app/ios/myapp/LaunchScreen.storyboard
```

**操作步骤：**

1. **准备图标资源**
```bash
# 在 my-app/assets/images/ 目录下准备
- icon-1024.png    # App Store 图标
- icon-180.png     # iPhone Pro Max
- icon-120.png     # iPhone
- icon-87.png      # iPhone 设置
- icon-60.png      # 通知中心
- icon-40.png      # Spotlight
```

2. **生成所有尺寸（推荐使用工具）**
```bash
# 使用在线工具或命令行工具批量生成
# 推荐：https://appicon.co/
# 或使用 ImageMagick
convert icon-1024.png -resize 180x180 icon-180.png
```

3. **配置 app.json**
```json
{
  "expo": {
    "name": "即时通讯",
    "slug": "im-app",
    "version": "1.0.0",
    "icon": "./assets/images/icon-1024.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.imapp",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "用于发送图片和视频消息",
        "NSPhotoLibraryUsageDescription": "用于选择相册中的图片和视频",
        "NSMicrophoneUsageDescription": "用于语音通话和发送语音消息",
        "NSContactsUsageDescription": "用于查找通讯录好友"
      }
    }
  }
}
```

---

#### 1.2 隐私权限声明（关键）

**必需在 Info.plist 中声明的权限：**

| 权限 | Key | 用途说明 |
|------|-----|---------|
| 相机 | `NSCameraUsageDescription` | "用于拍摄照片和视频消息" |
| 相册 | `NSPhotoLibraryUsageDescription` | "用于选择图片和视频发送给好友" |
| 麦克风 | `NSMicrophoneUsageDescription` | "用于语音通话和语音消息" |
| 通讯录 | `NSContactsUsageDescription` | "用于查找手机联系人中的好友" |
| 通知 | `NSUserNotificationsUsageDescription` | "用于接收新消息提醒" |
| 网络 | `NSAppTransportSecurity` | 配置 HTTPS |

**检查现有配置：**
```bash
cat my-app/ios/myapp/Info.plist | grep "UsageDescription"
```

**完整配置示例：**
```xml
<!-- my-app/ios/myapp/Info.plist -->
<dict>
  <key>NSCameraUsageDescription</key>
  <string>我们需要访问您的相机以拍摄照片和视频</string>
  
  <key>NSPhotoLibraryUsageDescription</key>
  <string>我们需要访问您的相册以选择照片和视频</string>
  
  <key>NSMicrophoneUsageDescription</key>
  <string>我们需要访问您的麦克风进行语音通话</string>
  
  <key>NSContactsUsageDescription</key>
  <string>我们需要访问您的通讯录以查找好友</string>
  
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
      <key>your-api-domain.com</key>
      <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
        <false/>
      </dict>
    </dict>
  </dict>
</dict>
```

---

#### 1.3 网络安全配置

**App Transport Security (ATS) 要求：**

- ✅ **必须使用 HTTPS**（生产环境）
- ✅ **TLS 1.2 或更高版本**
- ✅ **证书有效且受信任**
- ⚠️ 开发环境可临时允许 HTTP

**检查后端 API 配置：**
```bash
# 检查 API 基础 URL
cat my-app/src/config/api.ts
```

**正确配置：**
```typescript
// my-app/src/config/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'           // 开发环境（需要 ATS 例外）
  : 'https://api.yourdomain.com';     // 生产环境（必须 HTTPS）

export const WS_BASE_URL = __DEV__
  ? 'ws://localhost:3000'              // 开发环境
  : 'wss://api.yourdomain.com';        // 生产环境（必须 WSS）
```

---

#### 1.4 推送通知配置

**Apple Push Notification Service (APNs) 设置：**

**步骤 1：Apple Developer Portal 配置**
1. 登录 [Apple Developer](https://developer.apple.com)
2. 进入 Certificates, Identifiers & Profiles
3. 创建 App ID，启用 Push Notifications
4. 创建 APNs 证书（开发和生产各一个）
5. 下载 `.p12` 证书文件

**步骤 2：前端配置**
```typescript
// my-app/src/services/push/index.ts
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPushNotifications() {
  // 1. 请求权限
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('推送通知权限被拒绝');
    return null;
  }

  // 2. 获取 Expo Push Token
  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  // 3. 上传到后端
  await uploadTokenToBackend(token);
  
  return token;
}

// 配置通知处理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

**步骤 3：后端配置（验证）**
```bash
# 检查后端推送服务配置
cat im/src/services/push/expo.ts
cat im/.env | grep EXPO
```

**需要的环境变量：**
```env
# im/.env
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

---

#### 1.5 内容审核准则

**Apple 审核重点（针对 IM 应用）：**

| 审核项 | 要求 | 实施状态 |
|--------|------|----------|
| **用户生成内容** | 必须有举报机制 | ⏳ 待实现 |
| **未成年人保护** | 限制或过滤成人内容 | ⏳ 待实现 |
| **垃圾信息防范** | 反垃圾消息机制 | ⏳ 待实现 |
| **用户隐私** | 明确数据使用说明 | ⏳ 待补充 |
| **账号注册** | 必须提供账号删除功能 | ⏳ 待实现 |

**立即要做的：**

1. **添加举报功能**
```typescript
// 在消息长按菜单中添加
const MessageActions = [
  { label: '复制', action: 'copy' },
  { label: '撤回', action: 'recall' },
  { label: '举报', action: 'report' },  // ✅ 新增
];
```

2. **添加账号删除功能**
```typescript
// my-app/src/screens/settings/AccountScreen.tsx
<TouchableOpacity 
  style={styles.dangerButton}
  onPress={handleDeleteAccount}
>
  <Text style={styles.dangerButtonText}>删除账号</Text>
</TouchableOpacity>
```

3. **添加用户协议和隐私政策页面**
```typescript
// my-app/src/screens/auth/TermsScreen.tsx
// my-app/src/screens/auth/PrivacyScreen.tsx
```

---

### 二、提交前检查清单

#### 2.1 编译测试

```bash
# 1. iOS 模拟器测试
cd my-app
npx expo run:ios

# 2. 真机测试（必需）
npx expo run:ios --device

# 3. 生产环境构建测试
eas build --platform ios --profile production

# 4. TestFlight 内测
eas submit --platform ios --latest
```

#### 2.2 功能完整性测试

**核心功能：**
- [ ] 用户注册和登录
- [ ] 发送接收文字消息
- [ ] 发送图片消息
- [ ] 推送通知可达
- [ ] 通讯录同步
- [ ] 群组功能
- [ ] 语音/视频通话（如果有）

**边缘场景：**
- [ ] 网络断线重连
- [ ] 后台切换
- [ ] 低电量模式
- [ ] 飞行模式切换
- [ ] 卸载重装数据恢复

#### 2.3 性能测试

```bash
# 内存占用检查
# 启动应用 -> Xcode -> Debug Navigator -> Memory
# 要求：< 200MB（空闲），< 500MB（活跃）

# 启动时间检查
# 要求：< 3秒（首次），< 1秒（后续）

# 崩溃率检查
# 要求：< 1%
```

---

## 第二部分：前后端一致性审核

### 三、接口一致性验证

#### 3.1 REST API 一致性检查

**验证方法：**

**步骤 1：生成后端 API 清单**
```bash
# 读取后端 API 路由文档
cat im/API-ROUTES.md
```

**步骤 2：生成前端 Store 方法清单**
```bash
# 查找所有 API 调用
cd my-app
grep -rh "api\.(get|post|put|delete)" src/stores/*.ts | sort | uniq
```

**步骤 3：逐一对比验证**

创建验证表格：

| API 端点 | 后端路由 | 前端方法 | 请求参数 | 响应数据 | 状态 |
|---------|---------|---------|---------|---------|------|
| 登录 | POST `/api/auth/login` | `authStore.login()` | ✅ 一致 | ✅ 一致 | ✅ |
| 获取消息列表 | GET `/api/im/messages` | `messageStore.fetchMessages()` | ⚠️ 待检查 | ⚠️ 待检查 | ⏳ |
| 发送消息 | POST `/api/im/messages` | `messageStore.sendMessage()` | ⚠️ 待检查 | ⚠️ 待检查 | ⏳ |
| ... | ... | ... | ... | ... | ... |

**自动化检查脚本：**

```typescript
// 创建文件：my-app/scripts/verify-api-consistency.ts
import { readFileSync } from 'fs';

// 1. 解析后端 API 文档
const apiDoc = readFileSync('../im/API-ROUTES.md', 'utf-8');
const backendApis = parseApiDoc(apiDoc);

// 2. 扫描前端 Store 文件
const frontendApis = scanStoreFiles('./src/stores');

// 3. 对比差异
const missingApis = backendApis.filter(api => 
  !frontendApis.some(f => f.endpoint === api.endpoint)
);

console.log('缺失的 API 实现：', missingApis);
```

---

#### 3.2 关键接口验证（手动测试）

**认证接口：**

```bash
# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456"
  }'

# 预期响应：
# {
#   "user": { "id": "...", "name": "...", ... },
#   "access": "eyJhbGc...",
#   "refresh": "eyJhbGc..."
# }
```

**消息接口：**

```bash
# 测试获取消息列表
curl -X GET "http://localhost:3000/api/im/messages?conversationId=xxx" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 预期响应：
# {
#   "messages": [...],
#   "total": 100,
#   "page": 1,
#   "limit": 20
# }
```

**对比前端请求：**

```typescript
// my-app/src/stores/messageStore.ts
fetchMessages: async (conversationId: string) => {
  const response = await api.get('/api/im/messages', {
    params: { conversationId },  // ✅ 确认参数名称一致
  });
  // ✅ 确认响应结构一致
  return response.data.messages;
}
```

---

### 四、WebSocket 通信一致性验证

#### 4.1 事件类型一致性

**检查方法：**

```bash
# 后端事件定义
cat im/src/websocket/events/types.ts | grep "export const"

# 前端事件定义
cat my-app/src/types/websocket.ts | grep "type WsEventType"
```

**创建对比脚本：**

```typescript
// my-app/scripts/verify-ws-events.ts
import backendEvents from '../../im/src/websocket/events/types';
import { WsEventType } from '../src/types/websocket';

// 后端事件列表
const backendEventList = Object.values(backendEvents.WsEventType);

// 前端事件列表
const frontendEventList = [
  'message:new',
  'message:recalled',
  'message:read',
  // ... 完整列表
];

// 对比
const missing = backendEventList.filter(e => !frontendEventList.includes(e));
console.log('前端缺失的事件：', missing);
```

---

#### 4.2 Payload 结构一致性

**验证步骤：**

**步骤 1：提取后端 Payload 定义**
```bash
cat im/src/websocket/events/message.ts | grep "interface.*Payload" -A 10
```

**步骤 2：提取前端 Payload 定义**
```bash
cat my-app/src/types/websocket.ts | grep "interface.*Payload" -A 10
```

**步骤 3：字段对比**

示例：`MESSAGE_NEW` 事件

后端：
```typescript
// im/src/websocket/events/message.ts
interface MessageNewPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: number;  // 时间戳（毫秒）
}
```

前端：
```typescript
// my-app/src/types/websocket.ts
interface WsMessageNewPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: number;  // ✅ 一致
}
```

**创建验证表：**

| 事件 | 后端字段 | 前端字段 | 类型一致 | 状态 |
|------|---------|---------|---------|------|
| message:new | messageId, conversationId, ... | messageId, conversationId, ... | ✅ | ✅ |
| call:invite | callId, callerId, ... | callId, callerId, ... | ⚠️ 检查 | ⏳ |
| ... | ... | ... | ... | ... |

---

#### 4.3 WebSocket 连接测试

**测试脚本：**

```typescript
// my-app/scripts/test-websocket.ts
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN',
  },
});

// 监听连接事件
socket.on('connected', (data) => {
  console.log('✅ 连接成功：', data);
});

// 监听消息事件
socket.on('message:new', (payload) => {
  console.log('✅ 收到新消息：', payload);
  // 验证 payload 结构
  validatePayload(payload, expectedSchema);
});

// 发送测试消息
socket.emit('message:send', {
  conversationId: 'test-conversation-id',
  content: '测试消息',
  type: 'text',
});
```

---

### 五、推送通知一致性验证

#### 5.1 推送类型对比

**后端推送场景：**

```bash
# 查看后端推送服务
cat im/src/services/push/index.ts | grep "sendPush"
```

**前端通知类型：**

```bash
# 查看前端通知类型定义
cat my-app/src/types/notification.ts
```

**创建对比表：**

| 推送场景 | 后端触发条件 | 前端 NotificationType | 导航目标 | 状态 |
|---------|-------------|---------------------|---------|------|
| 新消息 | 收到消息 | `new_message` | ChatRoom | ✅ |
| 好友申请 | 收到申请 | `friend_request` | FriendRequests | ✅ |
| 群组邀请 | 被邀入群 | `group_invite` | GroupInfo | ⚠️ 检查 |
| 通话邀请 | 收到通话 | `call_invite` | CallScreen | ⚠️ 检查 |

---

#### 5.2 推送内容验证

**后端推送内容格式：**

```typescript
// im/src/services/push/index.ts
await sendPush({
  to: deviceToken,
  title: '新消息',
  body: `${sender.name}: ${message.content}`,
  data: {
    type: 'new_message',          // ✅ 前端需匹配
    conversationId: 'xxx',
    messageId: 'yyy',
  },
});
```

**前端处理：**

```typescript
// my-app/src/services/push/handler.ts
Notifications.addNotificationResponseReceivedListener(response => {
  const { type, conversationId } = response.notification.request.content.data;
  
  // ✅ 确认 type 值一致
  if (type === 'new_message') {
    navigation.navigate('ChatRoom', { conversationId });
  }
});
```

---

### 六、数据模型一致性验证

#### 6.1 核心实体字段对比

**User 模型：**

```bash
# 后端模型
cat im/src/models/user/types/index.ts

# 前端类型
cat my-app/src/types/user.ts
```

**对比表格：**

| 字段 | 后端类型 | 前端类型 | 可选性 | 状态 |
|------|---------|---------|--------|------|
| id | string (UUID) | string | 必填 | ✅ |
| phone | string | string | 必填 | ✅ |
| name | string | string | 必填 | ✅ |
| avatar | string \| null | string \| null | 可选 | ✅ |
| gender | Gender enum | Gender type | 必填 | ✅ |
| vip | boolean | boolean | 必填 | ✅ |
| state | UserState enum | UserState type | 必填 | ✅ |
| createdAt | Date | string (ISO) | 必填 | ⚠️ 类型转换 |

**发现的问题：**
- 时间字段：后端 `Date` 对象，前端 `string` (需要序列化)
- 枚举类型：后端使用 enum，前端使用 type（需要确认值一致）

---

#### 6.2 嵌套对象验证

**Message 模型：**

后端：
```typescript
interface Message {
  id: string;
  sender: {              // ⚠️ 嵌套对象
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  // ...
}
```

前端：
```typescript
interface Message {
  id: string;
  senderId: string;      // ❌ 不一致！应该是嵌套对象
  senderName: string;    // ❌ 扁平化结构
  content: string;
  // ...
}
```

**修复方案：**
```typescript
// 统一为后端结构
interface Message {
  id: string;
  sender: UserPublic;    // ✅ 使用嵌套对象
  content: string;
  // ...
}
```

---

## 第三部分：具体实施步骤

### 阶段一：合规性准备（1-2天）

#### Day 1：基础配置

**上午任务（4小时）：**

1. **准备图标和启动屏幕**
   ```bash
   # 1. 设计或找到 1024x1024 图标
   # 2. 使用工具生成所有尺寸
   # 3. 替换 my-app/assets/images/
   ```

2. **配置 app.json**
   ```bash
   cd my-app
   # 编辑 app.json，填写所有必需字段
   ```

3. **配置 Info.plist 权限**
   ```bash
   # 编辑 my-app/ios/myapp/Info.plist
   # 添加所有隐私权限说明
   ```

**下午任务（4小时）：**

4. **准备用户协议和隐私政策**
   ```bash
   # 创建两个页面
   touch my-app/src/screens/legal/TermsScreen.tsx
   touch my-app/src/screens/legal/PrivacyScreen.tsx
   
   # 添加路由
   # 在登录注册页面添加链接
   ```

5. **添加账号删除功能**
   ```typescript
   // 在 AccountScreen 中添加删除按钮
   // 在 authStore 中添加 deleteAccount 方法
   // 调用后端 DELETE /api/im/users/account 接口
   ```

6. **添加举报功能**
   ```typescript
   // 在消息长按菜单添加"举报"选项
   // 创建举报弹窗组件
   // 调用后端举报接口（如果有）
   ```

---

#### Day 2：网络和推送配置

**上午任务（4小时）：**

1. **配置 HTTPS（生产环境）**
   ```typescript
   // my-app/src/config/api.ts
   export const API_BASE_URL = 'https://api.yourdomain.com';
   export const WS_BASE_URL = 'wss://api.yourdomain.com';
   ```

2. **配置推送通知**
   ```bash
   # 1. 在 Apple Developer Portal 创建 APNs 证书
   # 2. 配置 EAS credentials
   eas credentials
   
   # 3. 测试推送
   cd my-app
   npx expo run:ios
   # 触发推送测试
   ```

3. **检查后端推送配置**
   ```bash
   cd im
   # 确认 EXPO_ACCESS_TOKEN 已配置
   cat .env | grep EXPO
   
   # 测试发送推送
   npm run test:push
   ```

**下午任务（4小时）：**

4. **首次真机测试**
   ```bash
   cd my-app
   # 连接 iPhone
   npx expo run:ios --device
   
   # 测试所有核心功能
   - 登录注册
   - 发送消息
   - 推送通知
   - 权限申请
   ```

5. **修复发现的问题**
   ```bash
   # 根据测试结果修复
   ```

---

### 阶段二：前后端一致性审核（2-3天）

#### Day 3：接口一致性

**上午任务（4小时）：**

1. **生成接口清单**
   ```bash
   # 后端清单
   cat im/API-ROUTES.md > api-backend.txt
   
   # 前端清单
   grep -rh "api\.(get|post|put|delete)" my-app/src/stores/*.ts > api-frontend.txt
   
   # 对比
   diff api-backend.txt api-frontend.txt
   ```

2. **逐一验证核心接口**
   ```bash
   # 认证接口
   curl -X POST http://localhost:3000/api/auth/login -d '{...}'
   
   # 消息接口
   curl -X GET http://localhost:3000/api/im/messages?conversationId=xxx
   
   # 好友接口
   curl -X GET http://localhost:3000/api/im/friends
   ```

**下午任务（4小时）：**

3. **修复接口不一致**
   ```bash
   # 根据对比结果，修改前端代码
   # 确保参数名称、类型、结构完全一致
   ```

4. **创建接口测试用例**
   ```typescript
   // my-app/scripts/test-api.ts
   // 自动化测试所有接口
   ```

---

#### Day 4-5：WebSocket 和数据模型

**Day 4上午：WebSocket 事件验证**

1. **对比事件类型**
   ```bash
   # 生成后端事件列表
   grep "export const.*=" im/src/websocket/events/types.ts
   
   # 生成前端事件列表
   grep "type.*=" my-app/src/types/websocket.ts
   
   # 对比
   ```

2. **验证 Payload 结构**
   ```bash
   # 逐一对比每个事件的 Payload
   # 创建对比表格
   ```

**Day 4下午：修复 WebSocket 不一致**

3. **修改前端类型定义**
   ```typescript
   // my-app/src/types/websocket.ts
   // 确保与后端完全一致
   ```

4. **测试 WebSocket 连接**
   ```bash
   cd my-app
   npm run test:websocket
   ```

**Day 5：数据模型验证**

5. **对比所有实体类型**
   ```bash
   # User, Message, Conversation, Friend, Group, etc.
   # 创建完整的字段对比表
   ```

6. **修复类型不一致**
   ```typescript
   // 修改 my-app/src/types/*.ts
   // 确保与后端模型一致
   ```

---

### 阶段三：完整测试与提交（2-3天）

#### Day 6-7：全面测试

**功能测试（Day 6）：**

1. **核心流程测试**
   - [ ] 注册新账号
   - [ ] 登录
   - [ ] 添加好友
   - [ ] 发送消息
   - [ ] 创建群组
   - [ ] 语音/视频通话
   - [ ] 推送通知

2. **边缘场景测试**
   - [ ] 网络断线重连
   - [ ] 后台切换
   - [ ] 锁屏解锁
   - [ ] 低电量模式
   - [ ] 飞行模式

**性能测试（Day 7上午）：**

3. **性能指标**
   ```bash
   # 使用 Xcode Instruments
   - 内存占用 < 200MB
   - CPU 使用率 < 50%
   - 启动时间 < 3秒
   - 帧率 > 55 FPS
   ```

**兼容性测试（Day 7下午）：**

4. **多设备测试**
   - [ ] iPhone SE (小屏)
   - [ ] iPhone 14 Pro (标准)
   - [ ] iPhone 14 Pro Max (大屏)
   - [ ] iPad (可选)

---

#### Day 8：构建与提交

**上午：生产构建**

1. **配置 EAS Build**
   ```bash
   cd my-app
   
   # 安装 EAS CLI
   npm install -g eas-cli
   
   # 登录
   eas login
   
   # 配置项目
   eas build:configure
   
   # 生产构建
   eas build --platform ios --profile production
   ```

2. **下载并测试 IPA**
   ```bash
   # 下载构建产物
   eas build:download
   
   # 安装到真机测试
   ```

**下午：提交 App Store**

3. **准备应用元数据**
   - App 名称
   - 描述（简短 + 详细）
   - 关键词
   - 截图（多个尺寸）
   - 预览视频（可选）
   - 支持 URL
   - 隐私政策 URL

4. **提交审核**
   ```bash
   # 使用 EAS Submit
   eas submit --platform ios --latest
   
   # 或手动上传到 App Store Connect
   ```

5. **填写审核说明**
   ```
   测试账号：
   用户名：test@example.com
   密码：Test123456
   
   审核说明：
   本应用是一个即时通讯工具，提供文字、图片、语音消息功能。
   所有用户数据均加密传输，隐私政策见：https://...
   ```

---

## 第四部分：验收清单

### 最终检查表

#### iOS 上架标准

- [ ] **应用信息完整**
  - [ ] 所有尺寸图标已配置
  - [ ] 启动画面已配置
  - [ ] 应用名称和描述已填写
  
- [ ] **隐私合规**
  - [ ] 所有权限说明已添加
  - [ ] 隐私政策页面可访问
  - [ ] 用户协议页面可访问
  - [ ] 账号删除功能已实现
  
- [ ] **网络安全**
  - [ ] 生产环境使用 HTTPS/WSS
  - [ ] ATS 配置正确
  - [ ] SSL 证书有效
  
- [ ] **推送通知**
  - [ ] APNs 证书已配置
  - [ ] 推送权限请求正常
  - [ ] 推送消息可达
  
- [ ] **内容审核**
  - [ ] 举报功能已添加
  - [ ] 无敏感内容

---

#### 前后端一致性

- [ ] **REST API**
  - [ ] 所有接口路径一致
  - [ ] 请求参数结构一致
  - [ ] 响应数据结构一致
  - [ ] 错误码定义一致
  
- [ ] **WebSocket**
  - [ ] 事件类型名称一致
  - [ ] Payload 字段一致
  - [ ] 监听器已全部绑定
  - [ ] 连接认证正确
  
- [ ] **推送通知**
  - [ ] NotificationType 一致
  - [ ] 推送数据结构一致
  - [ ] 导航跳转正确
  
- [ ] **数据模型**
  - [ ] 所有实体字段一致
  - [ ] 类型定义一致
  - [ ] 可选性标记一致
  - [ ] 嵌套结构一致

---

#### 功能测试

- [ ] **基础功能**
  - [ ] 注册登录流程通畅
  - [ ] 消息发送接收正常
  - [ ] 推送通知可达
  - [ ] 好友管理正常
  - [ ] 群组功能正常
  
- [ ] **边缘场景**
  - [ ] 网络异常恢复
  - [ ] 后台运行正常
  - [ ] 内存管理良好
  - [ ] 无崩溃和卡顿

---

## 总结

### 关键时间节点

| 阶段 | 任务 | 时间 | 责任人 |
|------|------|------|--------|
| 阶段一 | iOS 合规准备 | 2天 | 前端 |
| 阶段二 | 前后端一致性审核 | 3天 | 前后端协作 |
| 阶段三 | 测试与提交 | 3天 | 前端+测试 |
| **总计** | | **8天** | |

### 风险提示

1. **审核被拒风险**
   - 缺少举报功能
   - 隐私政策不完整
   - 推送权限说明不清

2. **技术风险**
   - HTTPS 证书问题
   - 推送配置错误
   - 前后端接口不一致

3. **时间风险**
   - 审核周期不可控（1-7天）
   - 可能需要多次提交

---

**准备好开始了吗？** 🚀

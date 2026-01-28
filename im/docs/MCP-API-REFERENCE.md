# IM-API MCP Server API 参考文档

## 概述

MCP (Model Context Protocol) 服务器为前端 AI 助手提供了一系列工具和资源，以便快速获取API信息、WebSocket事件、错误码、类型定义等。这使得AI助手能够更好地理解和使用IM API服务。

## 功能特性

### 工具列表 (Tools)

MCP服务器提供以下11个核心工具：

#### 1. search_api
- **描述**: 搜索 IM API 接口
- **参数**: 
  - `keyword`: 搜索关键词（如 login, register, message, friend, group, call）
- **返回**: 匹配的API接口列表

#### 2. get_module_apis
- **描述**: 获取指定模块的所有 API
- **参数**: 
  - `module`: 模块名称（如：认证、用户、设备、好友、群组、会话、消息、通话、presence、media）
- **返回**: 指定模块的所有API接口

#### 3. search_ws_event
- **描述**: 搜索 WebSocket 事件类型
- **参数**: 
  - `keyword`: 搜索关键词（如 message, call, friend, group, typing）
- **返回**: 匹配的WebSocket事件定义

#### 4. get_all_ws_events
- **描述**: 获取所有 WebSocket 事件类型列表
- **参数**: 无
- **返回**: 所有WebSocket事件类型列表

#### 5. get_enums
- **描述**: 获取所有枚举常量定义
- **参数**: 无
- **返回**: 所有枚举类型定义（设备平台、消息类型、通话状态等）

#### 6. generate_api_code
- **描述**: 生成 API 调用的 TypeScript 代码示例
- **参数**: 
  - `apiPath`: API 路径（如 /api/auth/login 或 /api/im/messages）
- **返回**: API调用的TypeScript代码示例

#### 7. generate_ws_handler
- **描述**: 生成 WebSocket 事件处理的 TypeScript 代码示例
- **参数**: 
  - `eventType`: 事件类型（如 message:new, call:invite）
- **返回**: WebSocket事件处理的TypeScript代码示例

#### 8. get_flow
- **描述**: 获取常用业务流程说明
- **参数**: 
  - `flow`: 流程名称（auth, message, call, friend, group）
- **返回**: 指定业务流程的详细说明

#### 9. generate_api_client
- **描述**: 生成基于 axios 的完整 API 客户端代码
- **参数**: 
  - `module`: 模块名称（auth, user, device, friend, group, conversation, message, call, presence, media 或 all）
- **返回**: 完整的API客户端代码

#### 10. generate_ws_manager
- **描述**: 生成完整的 WebSocket 连接管理器代码
- **参数**: 无
- **返回**: WebSocket连接管理器代码（包含自动重连、心跳、事件订阅）

#### 11. get_error_codes
- **描述**: 获取错误码文档
- **参数**: 
  - `keyword`: 错误码或关键词（如 401, Unauthorized, token, 过期）
- **返回**: 错误码说明及解决方案

### 资源列表 (Resources)

#### 1. im://api/all
- **名称**: 所有 API 列表
- **描述**: 获取所有 IM API 接口的完整列表

#### 2. im://ws/events
- **名称**: WebSocket 事件列表
- **描述**: 获取所有 WebSocket 事件类型

#### 3. im://types
- **名称**: TypeScript 类型定义
- **描述**: 获取前端可用的 TypeScript 类型定义

#### 4. im://guide/expo
- **名称**: Expo 接入指南
- **描述**: Expo/iOS 应用接入 IM API 的指南

### 提示列表 (Prompts)

#### 1. implement_feature
- **描述**: 实现 IM 功能的完整指南
- **参数**: 
  - `feature`: 要实现的功能（login, register, send_message, make_call, add_friend, create_group）

#### 2. debug_api
- **描述**: 调试 API 问题
- **参数**: 
  - `api_path`: 出问题的 API 路径
  - `error`: 错误信息

## 枚举常量

以下是可用的枚举类型：

- **DevicePlatform**: ios | android | web | macos | windows
- **PushProvider**: apns | expo | fcm
- **FriendSource**: search | qr | phone | invite
- **FriendRequestStatus**: pending | accepted | rejected | ignored
- **MessageType**: text | image | voice
- **GroupJoinMode**: open | approval | invite
- **GroupMemberRole**: owner | admin | member
- **ConversationType**: private | group
- **CallStatus**: initiated | ringing | connected | ended | missed | rejected | busy
- **CallEndReason**: caller_hangup | callee_hangup | timeout | network_error
- **Gender**: male | female | unknown
- **UserState**: normal | disabled | deleted
- **SignalType**: offer | answer | ice-candidate

## WebSocket 事件类型

### 连接事件
- connected: 连接成功
- message:new: 新消息
- message:recalled: 消息撤回
- message:read: 消息已读
- message:delivered: 消息送达
- typing:start: 开始输入
- typing:stop: 停止输入
- call:invite: 来电邀请
- call:ring: 响铃
- call:answer: 接听
- call:reject: 拒绝
- call:end: 通话结束
- call:signal: WebRTC 信令
- presence:online: 用户上线
- presence:offline: 用户下线
- friend:request: 好友申请
- friend:accepted: 好友申请被接受
- group:invited: 被邀请入群
- group:kicked: 被踢出群
- group:member_joined: 成员入群
- group:member_left: 成员退群
- group:updated: 群信息更新
- group:muted: 被禁言
- group:unmuted: 被解禁
- group:dissolved: 群组解散
- heartbeat:ack: 心跳响应
- kick: 被踢下线
- error: 错误

## 错误码

以下是一些常见错误码及其解决方案：

- **400/BadRequest**: 请求参数错误 - 检查请求体JSON格式，确保所有必填字段存在且类型正确
- **401/Unauthorized**: 未认证 - 检查Authorization: Bearer <token>头是否正确，Token过期时使用refresh token刷新
- **403/Forbidden**: 无权限 - 确认当前用户是否有该操作的权限
- **404/NotFound**: 资源不存在 - 检查资源ID是否正确，资源可能已被删除
- **MISSING_TOKEN**: 缺少授权令牌 - 在请求头添加Authorization: Bearer <access_token>
- **EXPIRED**: 令牌已过期 - 使用refresh token调用/api/auth/refresh获取新access token
- **DEVICE_MISMATCH**: 设备不匹配 - 确保使用同一设备的Token，或重新登录
- **PHONE_EXISTS**: 手机号已注册 - 使用其他手机号注册，或找回已有账号
- **WRONG_PASSWORD**: 密码错误 - 检查密码是否正确，注意大小写
- **CALL_BUSY**: 用户忙线 - 稍后再试

## 使用示例

```typescript
// 搜索API接口
const result = await mcp.callTool('search_api', { keyword: 'login' });

// 获取用户模块的所有API
const userApis = await mcp.callTool('get_module_apis', { module: '用户' });

// 搜索WebSocket事件
const wsEvents = await mcp.callTool('search_ws_event', { keyword: 'message' });

// 生成API调用代码示例
const apiCode = await mcp.callTool('generate_api_code', { apiPath: '/api/auth/login' });

// 生成WebSocket事件处理代码
const wsHandler = await mcp.callTool('generate_ws_handler', { eventType: 'message:new' });

// 获取认证流程说明
const authFlow = await mcp.callTool('get_flow', { flow: 'auth' });

// 生成完整的用户模块API客户端
const userClient = await mcp.callTool('generate_api_client', { module: 'user' });

// 获取错误码信息
const errorInfo = await mcp.callTool('get_error_codes', { keyword: '401' });
```

## 架构说明

MCP Server 使用 @modelcontextprotocol/sdk 构建，提供标准化的接口用于AI助手获取上下文信息。整个系统设计为即插即用，可以轻松集成到任何AI开发环境中。

## 集成方式

MCP Server 通过标准的MCP协议提供服务，前端AI助手可以通过标准的MCP客户端与其交互。更多信息请参见 `mcp/expo-integration.md` 文档。
# IM 应用完整测试规则与标准

**版本**: 1.0.0  
**制定日期**: 2026-01-28  
**适用范围**: 前端 + 后端 + 集成测试

---

## 📋 目录

1. [测试分类与优先级](#1-测试分类与优先级)
2. [测试环境要求](#2-测试环境要求)
3. [测试数据准备](#3-测试数据准备)
4. [功能测试规则](#4-功能测试规则)
5. [性能测试标准](#5-性能测试标准)
6. [安全测试要求](#6-安全测试要求)
7. [兼容性测试](#7-兼容性测试)
8. [自动化测试规范](#8-自动化测试规范)
9. [测试报告规范](#9-测试报告规范)
10. [缺陷管理规则](#10-缺陷管理规则)

---

## 1. 测试分类与优先级

### 1.1 测试层级

```
┌─────────────────────────────────────┐
│     E2E 测试 (端到端测试)              │  优先级: P0
│  - 完整用户流程                        │
│  - 多设备同步                          │
├─────────────────────────────────────┤
│     集成测试 (Integration Test)       │  优先级: P0-P1
│  - API 测试                           │
│  - WebSocket 测试                     │
│  - 数据库测试                          │
├─────────────────────────────────────┤
│     单元测试 (Unit Test)              │  优先级: P1-P2
│  - 工具函数测试                        │
│  - 组件测试                            │
│  - Store 逻辑测试                      │
└─────────────────────────────────────┘
```

### 1.2 优先级定义

| 级别 | 名称 | 描述 | 必须通过 | 阻塞发版 |
|------|------|------|---------|---------|
| **P0** | 阻断性 | 核心功能，无法绕过 | ✅ 是 | ✅ 是 |
| **P1** | 严重 | 主要功能，影响体验 | ✅ 是 | ⚠️ 视情况 |
| **P2** | 一般 | 次要功能，可降级 | ⚠️ 建议 | ❌ 否 |
| **P3** | 轻微 | 边缘功能，优化项 | ❌ 否 | ❌ 否 |

### 1.3 功能优先级分类

#### P0 - 核心功能（必须100%通过）
- [ ] 用户注册和登录
- [ ] 发送和接收文本消息
- [ ] 创建和管理会话
- [ ] 添加和管理好友
- [ ] 创建群组和发送群消息

#### P1 - 重要功能（必须95%通过）
- [ ] 消息撤回
- [ ] 好友申请处理
- [ ] 群成员管理
- [ ] 消息已读回执
- [ ] 敏感词过滤

#### P2 - 一般功能（建议90%通过）
- [ ] 修改用户资料
- [ ] 设置备注
- [ ] 免打扰设置
- [ ] 消息搜索
- [ ] 会话置顶

#### P3 - 次要功能（建议80%通过）
- [ ] 主题切换
- [ ] 字体大小调整
- [ ] 聊天背景设置
- [ ] 消息转发
- [ ] 表情包

---

## 2. 测试环境要求

### 2.1 开发环境 (Dev)

```yaml
后端:
  - API: http://localhost:3009
  - WebSocket: ws://localhost:3009/ws
  - 数据库: SQLite (development.sqlite)
  - 日志级别: DEBUG
  - Mock数据: 启用

前端:
  - Metro Bundler: http://localhost:8002
  - API地址: http://localhost:3009
  - 环境变量: .env.development
  - 热重载: 启用
```

### 2.2 测试环境 (Test)

```yaml
后端:
  - API: http://test-api.example.com
  - WebSocket: ws://test-api.example.com/ws
  - 数据库: MySQL (独立测试库)
  - 日志级别: INFO
  - Mock数据: 禁用

前端:
  - 构建版本: TestFlight/Internal Track
  - API地址: http://test-api.example.com
  - 环境变量: .env.test
  - SourceMap: 启用
```

### 2.3 生产环境 (Production)

```yaml
后端:
  - API: https://api.yourdomain.com
  - WebSocket: wss://api.yourdomain.com/ws
  - 数据库: MySQL (主从复制)
  - 日志级别: WARN
  - 监控: 启用

前端:
  - 构建版本: Release
  - API地址: https://api.yourdomain.com
  - 环境变量: .env.production
  - SourceMap: 禁用
  - 混淆: 启用
```

### 2.4 测试设备要求

#### 移动设备
```
iOS:
  - iPhone 12/13/14/15 (iOS 15-17)
  - iPad Air/Pro (iPadOS 15-17)

Android:
  - Google Pixel 6/7/8
  - Samsung Galaxy S21/S22/S23
  - 小米 12/13
  - Android 10-14
```

#### 网络环境
```
必测:
  - WiFi (稳定网络)
  - 4G/5G (移动网络)
  - 弱网 (模拟慢速连接)

可选:
  - 网络切换 (WiFi ↔ 4G)
  - 断网重连
```

---

## 3. 测试数据准备

### 3.1 测试账号规范

#### 账号命名规则
```
格式: test_<角色>_<序号>@<场景>.com

示例:
- test_user_001@normal.com    (普通用户)
- test_admin_001@admin.com    (管理员)
- test_group_owner_001@group.com (群主)
- test_banned_001@banned.com  (被封禁用户)
```

#### 必备测试账号

| 账号 | 手机号 | 密码 | 角色 | 用途 |
|------|--------|------|------|------|
| test_user_001 | 13800138001 | Test123456 | 普通用户 | 主测试账号 |
| test_user_002 | 13800138002 | Test123456 | 普通用户 | 好友、群成员 |
| test_user_003 | 13800138003 | Test123456 | 普通用户 | 另一个好友 |
| test_group_owner | 13800138010 | Test123456 | 群主 | 群管理测试 |
| test_admin | 13800138020 | Test123456 | 群管理员 | 管理员权限测试 |
| test_banned | 13800138030 | Test123456 | 被封禁 | 异常状态测试 |
| test_vip | 13800138040 | Test123456 | VIP用户 | 特权功能测试 |

### 3.2 测试数据范围

#### 好友关系
```javascript
// 必须预置的好友关系
const friendRelations = [
  { from: 'test_user_001', to: 'test_user_002', status: 'accepted' },
  { from: 'test_user_001', to: 'test_user_003', status: 'accepted' },
  { from: 'test_user_002', to: 'test_user_003', status: 'pending' },
];
```

#### 群组数据
```javascript
// 必须预置的群组
const testGroups = [
  {
    id: 'test_group_001',
    name: '测试群组1',
    owner: 'test_group_owner',
    members: ['test_user_001', 'test_user_002', 'test_user_003'],
    memberCount: 3,
  },
  {
    id: 'test_group_002',
    name: '大型测试群',
    owner: 'test_group_owner',
    members: Array(50).fill(null).map((_, i) => `test_user_${i+1}`),
    memberCount: 50,
  },
];
```

#### 消息数据
```javascript
// 历史消息（用于分页测试）
const testMessages = [
  { count: 100, type: 'text', conversation: 'conv_001' },
  { count: 50, type: 'text', conversation: 'conv_002' },
  { count: 20, type: 'text', conversation: 'group_001', sensitive: 5 }, // 包含5条敏感词
];
```

### 3.3 边界数据

#### 长度边界
```javascript
const boundaryData = {
  // 昵称
  nickname: {
    min: '',                    // 空字符串
    normal: '测试用户',         // 正常长度
    max: 'A'.repeat(20),        // 最大长度
    overflow: 'A'.repeat(21),   // 超长
  },
  
  // 消息内容
  message: {
    min: '',                    // 空消息
    normal: '你好',             // 正常消息
    max: 'A'.repeat(5000),      // 最大长度
    overflow: 'A'.repeat(5001), // 超长
  },
  
  // 群组名称
  groupName: {
    min: '',
    normal: '测试群组',
    max: 'Group'.repeat(10),
    overflow: 'Group'.repeat(11),
  },
};
```

#### 特殊字符
```javascript
const specialChars = [
  '🔥😂❤️',                    // Emoji
  '<script>alert(1)</script>', // XSS攻击
  "'; DROP TABLE users; --",   // SQL注入
  '../../../etc/passwd',       // 路径穿越
  '\u0000\u0001\u0002',        // 控制字符
  '测试\n换行\t制表符',         // 特殊空白
];
```

---

## 4. 功能测试规则

### 4.1 用户认证测试

#### 4.1.1 注册功能
```yaml
测试场景:
  - 正常注册流程
  - 手机号格式验证
  - 密码强度检查
  - PIN码格式验证
  - 重复手机号注册
  - 网络异常处理

通过标准:
  - ✅ 正常流程成功率 100%
  - ✅ 错误提示准确率 100%
  - ✅ 表单验证实时响应 < 100ms
  - ✅ 注册成功自动登录
  - ✅ 敏感信息不明文存储

测试数据:
  valid_phones: ['13800138000', '13900139000']
  invalid_phones: ['12345', 'abc', '11111111111']
  valid_passwords: ['Test@123456', 'Pass123!@#']
  invalid_passwords: ['123', 'password', '']
  valid_pins: ['123456', '000000']
  invalid_pins: ['123', 'abcdef', '1234567']
```

#### 4.1.2 登录功能
```yaml
测试场景:
  - 正常登录
  - 错误密码（3次锁定）
  - 不存在的账号
  - Token过期自动刷新
  - 多设备登录互踢
  - 记住密码功能

通过标准:
  - ✅ 登录成功率 100%
  - ✅ 响应时间 < 2s
  - ✅ Token有效期正确（15分钟）
  - ✅ 错误提示清晰
  - ✅ 3次错误后锁定5分钟

测试步骤:
  1. 输入正确手机号和密码
  2. 点击登录按钮
  3. 验证跳转到主界面
  4. 检查Token存储
  5. 验证用户信息加载

预期结果:
  - HTTP 200 OK
  - 返回 access_token 和 refresh_token
  - 自动跳转到会话列表页
  - 底部Tab显示正确
```

### 4.2 消息功能测试

#### 4.2.1 发送消息测试规则
```yaml
测试场景:
  - 发送普通文本消息
  - 发送空消息（应拒绝）
  - 发送超长消息（5000字符）
  - 发送特殊字符和Emoji
  - 发送包含敏感词的消息
  - 快速连发消息（防抖测试）
  - 弱网环境发送
  - 离线发送（队列）

通过标准:
  - ✅ 发送成功率 > 99.9%
  - ✅ 消息延迟 < 500ms (正常网络)
  - ✅ 消息顺序正确
  - ✅ 敏感词过滤生效
  - ✅ 失败消息可重发
  - ✅ 乐观更新：消息立即显示

测试脚本:
  function testSendMessage() {
    const testCases = [
      { content: '你好', expected: 'success' },
      { content: '', expected: 'error' },
      { content: 'A'.repeat(5000), expected: 'success' },
      { content: 'A'.repeat(5001), expected: 'error' },
      { content: '🔥😂❤️', expected: 'success' },
      { content: '赌博色情', expected: 'filtered' },
    ];
    
    testCases.forEach(tc => {
      const result = sendMessage(conversationId, tc.content);
      assert.equal(result.status, tc.expected);
    });
  }

性能要求:
  - 单条消息发送耗时 < 500ms
  - 批量发送（10条）耗时 < 3s
  - 并发发送不丢失
  - 消息ID生成唯一性 100%
```

#### 4.2.2 接收消息测试规则
```yaml
测试场景:
  - WebSocket实时接收
  - 轮询降级接收（WebSocket断开）
  - 离线消息同步
  - 多设备同步
  - 消息去重（重复推送）
  - 乱序消息排序

通过标准:
  - ✅ 实时消息延迟 < 1s
  - ✅ 消息到达率 100%
  - ✅ 消息顺序正确
  - ✅ 去重率 100%
  - ✅ 离线消息同步完整

WebSocket测试:
  - 连接建立 < 2s
  - 心跳间隔 15s
  - 断线重连 < 5s
  - 消息推送延迟 < 500ms

验证方法:
  1. 用户A发送消息
  2. 记录发送时间戳 t1
  3. 用户B接收消息
  4. 记录接收时间戳 t2
  5. 计算延迟: t2 - t1 < 1000ms
```

#### 4.2.3 消息撤回测试规则
```yaml
测试场景:
  - 2分钟内撤回（成功）
  - 超过2分钟撤回（失败）
  - 撤回他人消息（失败）
  - 撤回系统消息（失败）
  - 已撤回消息再次撤回（失败）
  - 撤回后对方看到通知

通过标准:
  - ✅ 时限验证准确
  - ✅ 权限验证正确
  - ✅ 双方消息同步
  - ✅ 系统消息正确显示

测试步骤:
  1. 发送消息记录时间
  2. 立即撤回（应成功）
  3. 等待2分钟后发消息
  4. 尝试撤回（应失败）
  5. 验证错误提示

预期结果:
  - 2分钟内: HTTP 200, 消息变为"已撤回"
  - 2分钟后: HTTP 400, 提示"超时无法撤回"
  - 对方收到: WebSocket事件 message:recalled
```

### 4.3 好友功能测试

#### 4.3.1 添加好友测试规则
```yaml
测试场景:
  - 通过手机号搜索
  - 通过昵称搜索
  - 通过二维码添加
  - 发送好友申请（带验证消息）
  - 重复发送申请
  - 添加已拉黑用户
  - 达到好友上限

通过标准:
  - ✅ 搜索准确率 100%
  - ✅ 申请发送成功率 100%
  - ✅ 重复申请提示
  - ✅ 拉黑用户无法添加

搜索测试数据:
  valid_searches:
    - phone: '13800138002'
    - nickname: '测试用户'
    - partial: '测试'
  
  invalid_searches:
    - phone: '00000000000'
    - nickname: 'NonExistUser'
    - empty: ''

申请测试:
  message_length:
    - min: ''  (应允许空消息)
    - normal: '你好，我想加你为好友'
    - max: 'A'.repeat(200)
    - overflow: 'A'.repeat(201) (应拒绝)
```

#### 4.3.2 好友申请处理测试规则
```yaml
测试场景:
  - 接受好友申请
  - 拒绝好友申请
  - 忽略好友申请
  - 处理已过期申请
  - 同时接受多个申请
  - 申请通知实时推送

通过标准:
  - ✅ 接受后自动创建会话
  - ✅ 拒绝后不再显示
  - ✅ 双向好友关系建立
  - ✅ 通知实时到达

测试流程:
  用户A -> 用户B:
    1. A发送好友申请
    2. B收到申请通知 (WebSocket)
    3. B在列表中看到申请
    4. B点击"接受"
    5. A收到接受通知
    6. 双方好友列表更新
    7. 自动创建私聊会话

时序验证:
  - 步骤1→2: < 1s
  - 步骤4→5: < 1s
  - 步骤5→6: < 2s
```

### 4.4 群聊功能测试

#### 4.4.1 创建群组测试规则
```yaml
测试场景:
  - 创建2人群（最小）
  - 创建100人群（中等）
  - 创建500人群（大型）
  - 群名称边界测试
  - 邀请非好友入群
  - 重复邀请同一人

通过标准:
  - ✅ 创建成功率 100%
  - ✅ 成员数量正确
  - ✅ 群名称格式验证
  - ✅ 权限验证正确
  - ✅ 系统消息自动生成

性能要求:
  - 2人群创建 < 1s
  - 100人群创建 < 3s
  - 500人群创建 < 10s

测试数据:
  group_names:
    - valid: ['测试群', 'Test Group', '🔥测试']
    - invalid: ['', 'A'.repeat(51), '<script>']
  
  member_counts:
    - min: 2
    - normal: 10
    - large: 100
    - max: 500
    - overflow: 501 (应拒绝)
```

#### 4.4.2 群管理测试规则
```yaml
权限矩阵测试:
  
  操作 \ 角色    | 群主 | 管理员 | 普通成员
  --------------|------|--------|----------
  解散群        | ✅   | ❌     | ❌
  转让群主      | ✅   | ❌     | ❌
  设置管理员    | ✅   | ❌     | ❌
  踢出成员      | ✅   | ✅     | ❌
  禁言成员      | ✅   | ✅     | ❌
  修改群资料    | ✅   | ✅     | ❌
  邀请成员      | ✅   | ✅     | ⚠️(视设置)
  退出群组      | ⚠️   | ✅     | ✅

测试场景:
  1. 群主测试:
    - 设置管理员
    - 取消管理员
    - 转让群主
    - 解散群组
  
  2. 管理员测试:
    - 踢出普通成员
    - 禁言成员（1小时、1天、永久）
    - 解除禁言
    - 尝试踢出群主（应失败）
    - 尝试踢出其他管理员（应失败）
  
  3. 普通成员测试:
    - 尝试管理操作（应全部失败）
    - 发送消息（正常）
    - 被禁言后发送（应失败）
    - 退出群组

通过标准:
  - ✅ 权限验证准确率 100%
  - ✅ 操作成功后状态同步
  - ✅ 被踢成员收到通知
  - ✅ 系统消息正确生成
```

### 4.5 敏感词过滤测试

#### 4.5.1 过滤规则测试
```yaml
测试数据:
  - 政治敏感词: ['反动', '颠覆', '暴动']
  - 违法相关: ['赌博', '贩毒', '洗钱']
  - 欺诈相关: ['传销', '诈骗', '假币']
  - 色情相关: ['色情', '淫秽', '卖淫']
  - 暴力相关: ['杀人', '暗杀', '投毒']
  - 其他: ['自杀', '自残']

测试场景:
  1. 单个敏感词:
    输入: '我想去赌博'
    输出: '我想去**'
  
  2. 多个敏感词:
    输入: '赌博和色情都不好'
    输出: '**和**都不好'
  
  3. 敏感词变体:
    输入: '赌 博', '赌。博', '赌-博'
    输出: 应全部过滤
  
  4. 正常词汇:
    输入: '包子', '玩游戏', '看电影'
    输出: 不过滤

通过标准:
  - ✅ 敏感词召回率 > 95%
  - ✅ 误伤率 < 1%
  - ✅ 过滤延迟 < 100ms
  - ✅ 变体识别率 > 90%

性能测试:
  - 单条消息过滤 < 50ms
  - 批量过滤(100条) < 1s
  - 词库加载时间 < 500ms
```

---

## 5. 性能测试标准

### 5.1 响应时间要求

| 操作 | 目标 | 可接受 | 不可接受 |
|------|------|--------|---------|
| 登录 | < 1s | < 2s | > 3s |
| 消息发送 | < 300ms | < 500ms | > 1s |
| 消息接收 | < 500ms | < 1s | > 2s |
| 会话列表加载 | < 1s | < 2s | > 3s |
| 历史消息加载 | < 1s | < 2s | > 3s |
| 好友列表加载 | < 1s | < 2s | > 3s |
| 群成员列表 | < 1.5s | < 3s | > 5s |
| 图片上传 | < 3s | < 5s | > 10s |
| 搜索 | < 500ms | < 1s | > 2s |

### 5.2 并发性能测试

```yaml
场景1: 消息并发发送
  并发数: 100
  持续时间: 1分钟
  通过标准:
    - TPS > 1000
    - 错误率 < 0.1%
    - P95响应时间 < 500ms
    - P99响应时间 < 1s

场景2: WebSocket连接
  并发连接数: 10000
  通过标准:
    - 连接成功率 > 99%
    - 心跳保持率 > 99%
    - 消息推送延迟 P95 < 1s

场景3: 群聊消息
  群成员数: 500
  消息频率: 10条/秒
  通过标准:
    - 全员送达时间 < 3s
    - 送达率 > 99.9%
    - 无消息丢失
```

### 5.3 资源占用限制

```yaml
客户端:
  内存占用:
    - 空闲: < 100MB
    - 聊天中: < 200MB
    - 峰值: < 300MB
  
  CPU占用:
    - 空闲: < 5%
    - 聊天中: < 20%
    - 峰值: < 50%
  
  电池消耗:
    - 后台: < 1% / 小时
    - 活跃: < 10% / 小时
  
  流量消耗:
    - 文本消息: < 1KB / 条
    - 心跳: < 100B / 次
    - 图片消息: < 原始大小 50%

服务器:
  单机承载:
    - 在线用户: > 100,000
    - 并发连接: > 50,000
    - 消息吞吐: > 10,000 TPS
  
  数据库:
    - 查询响应: < 50ms (P95)
    - 连接池: 100-500
    - 慢查询: < 1%
```

---

## 6. 安全测试要求

### 6.1 认证与授权测试

```yaml
测试项目:
  1. Token安全:
    - [ ] Token过期时间正确(15分钟)
    - [ ] Refresh Token轮换
    - [ ] Token签名验证
    - [ ] Token无法伪造
    - [ ] 注销后Token立即失效
  
  2. 会话管理:
    - [ ] 同设备多次登录互踢
    - [ ] 登录IP记录
    - [ ] 异地登录提醒
    - [ ] 会话超时自动登出
  
  3. 权限验证:
    - [ ] 横向越权检查(访问他人消息)
    - [ ] 纵向越权检查(普通用户执行管理操作)
    - [ ] API权限矩阵验证
    - [ ] 群组权限隔离

测试方法:
  # 测试横向越权
  1. 用户A登录获取Token
  2. 尝试访问用户B的会话
     GET /api/im/conversations/:user_b_conv_id
  3. 预期: HTTP 403 Forbidden
  
  # 测试Token伪造
  1. 复制Token payload
  2. 修改userId
  3. 重新签名(使用错误密钥)
  4. 发送请求
  5. 预期: HTTP 401 Unauthorized
```

### 6.2 数据安全测试

```yaml
加密测试:
  - [ ] 密码BCrypt加密存储
  - [ ] PIN码加密存储
  - [ ] HTTPS传输加密
  - [ ] WebSocket TLS加密
  - [ ] 敏感日志脱敏

输入验证:
  - [ ] SQL注入防护
  - [ ] XSS攻击防护
  - [ ] CSRF防护
  - [ ] 路径穿越防护
  - [ ] 文件上传类型验证

测试案例:
  XSS测试:
    payload: '<script>alert(1)</script>'
    输入位置: [昵称, 消息, 群名称, 签名]
    预期: 转义或过滤
  
  SQL注入测试:
    payload: "' OR '1'='1"
    输入位置: [登录, 搜索, 查询]
    预期: 参数化查询,无法注入
  
  路径穿越测试:
    payload: '../../../etc/passwd'
    输入位置: [文件上传, 头像设置]
    预期: 路径规范化,拒绝访问
```

### 6.3 隐私保护测试

```yaml
个人信息保护:
  - [ ] 手机号脱敏显示(138****8001)
  - [ ] 非好友无法查看详细资料
  - [ ] 隐私设置生效
  - [ ] 黑名单功能正常
  - [ ] 用户注销数据清除

数据最小化:
  - [ ] 只请求必要权限
  - [ ] 不收集无关信息
  - [ ] 第三方SDK审查
  - [ ] 日志不包含敏感信息

合规性检查:
  - [ ] iOS合规: 账号注销功能
  - [ ] iOS合规: 内容举报功能
  - [ ] GDPR: 数据导出功能
  - [ ] GDPR: 被遗忘权
```

---

## 7. 兼容性测试

### 7.1 操作系统兼容性

```yaml
iOS:
  必测版本:
    - iOS 15.0 (最低支持)
    - iOS 16.0 (主流)
    - iOS 17.0 (最新)
  
  设备:
    - iPhone SE (小屏)
    - iPhone 14 Pro (主流)
    - iPad Air (平板)
  
  测试内容:
    - [ ] 系统主题适配(深色/浅色)
    - [ ] 系统字体大小
    - [ ] 横竖屏切换
    - [ ] 刘海/灵动岛适配
    - [ ] 手势操作

Android:
  必测版本:
    - Android 10 (API 29)
    - Android 11 (API 30)
    - Android 12 (API 31)
    - Android 13 (API 33)
    - Android 14 (API 34)
  
  设备:
    - Pixel 6 (原生)
    - Samsung S23 (三星定制)
    - 小米13 (MIUI)
    - 华为P50 (鸿蒙)
  
  测试内容:
    - [ ] ROM适配(MIUI/ColorOS/鸿蒙)
    - [ ] 分屏模式
    - [ ] 悬浮窗
    - [ ] 通知栏显示
    - [ ] 后台保活
```

### 7.2 网络兼容性

```yaml
网络类型:
  - WiFi (2.4GHz / 5GHz)
  - 4G LTE
  - 5G
  - 弱网 (2G模拟)
  - 网络切换

测试场景:
  1. WiFi → 4G切换:
    - [ ] WebSocket自动重连
    - [ ] 消息队列不丢失
    - [ ] 切换延迟 < 3s
  
  2. 弱网环境:
    - [ ] 降级策略生效
    - [ ] 超时重试机制
    - [ ] 错误提示友好
  
  3. 断网重连:
    - [ ] 离线消息缓存
    - [ ] 重连后同步
    - [ ] 消息去重
```

### 7.3 第三方服务兼容性

```yaml
推送服务:
  iOS:
    - APNs (Apple Push Notification)
  Android:
    - Google FCM
    - 华为HMS Push
    - 小米MiPush
    - OPPO Push
    - vivo Push

测试内容:
  - [ ] 推送通知到达率 > 95%
  - [ ] 通知点击正确跳转
  - [ ] 角标数字同步
  - [ ] 离线推送合并
```

---

## 8. 自动化测试规范

### 8.1 单元测试规范

```javascript
// 文件命名: *.test.ts / *.spec.ts
// 位置: 与源文件同目录或 __tests__ 文件夹

// 示例: messageStore.test.ts
describe('MessageStore', () => {
  describe('sendMessage', () => {
    it('应该成功发送文本消息', async () => {
      // Arrange (准备)
      const store = useMessageStore.getState();
      const conversationId = 'test_conv_001';
      const content = '测试消息';
      
      // Act (执行)
      const result = await store.sendMessage(conversationId, 'text', content);
      
      // Assert (断言)
      expect(result).toBeDefined();
      expect(result.content).toBe(content);
      expect(result.type).toBe('text');
    });
    
    it('应该拒绝空消息', async () => {
      const store = useMessageStore.getState();
      const conversationId = 'test_conv_001';
      
      await expect(
        store.sendMessage(conversationId, 'text', '')
      ).rejects.toThrow('消息内容不能为空');
    });
    
    it('应该过滤敏感词', async () => {
      const store = useMessageStore.getState();
      const conversationId = 'test_conv_001';
      const content = '我想去赌博';
      
      const result = await store.sendMessage(conversationId, 'text', content);
      
      expect(result.content).not.toContain('赌博');
      expect(result.content).toContain('***');
    });
  });
});

// 覆盖率要求:
// - 行覆盖率: > 80%
// - 分支覆盖率: > 70%
// - 函数覆盖率: > 90%
// - 关键路径: 100%
```

### 8.2 集成测试规范

```javascript
// API集成测试
// 位置: tests/integration/api/*.test.ts

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // 启动测试服务器
    await startTestServer();
    // 初始化测试数据
    await seedTestData();
  });
  
  afterAll(async () => {
    // 清理测试数据
    await cleanupTestData();
    // 停止服务器
    await stopTestServer();
  });
  
  describe('POST /api/im/messages', () => {
    it('完整的消息发送流程', async () => {
      // 1. 登录获取Token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800138001',
          password: 'Test123456'
        });
      
      const token = loginRes.body.data.access;
      
      // 2. 创建会话
      const convRes = await request(app)
        .post('/api/im/conversations/private')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: 'test_user_002' });
      
      const conversationId = convRes.body.data.id;
      
      // 3. 发送消息
      const msgRes = await request(app)
        .post('/api/im/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversationId,
          type: 'text',
          content: '集成测试消息'
        });
      
      // 4. 验证结果
      expect(msgRes.status).toBe(201);
      expect(msgRes.body.code).toBe('Created');
      expect(msgRes.body.data.content).toBe('集成测试消息');
      
      // 5. 验证数据库
      const message = await Message.findByPk(msgRes.body.data.id);
      expect(message).toBeDefined();
      expect(message.senderId).toBe('test_user_001');
    });
  });
});
```

### 8.3 E2E测试规范

```javascript
// E2E测试 (使用Detox或Appium)
// 位置: e2e/*.test.ts

describe('E2E: 完整聊天流程', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });
  
  it('应该完成登录到发送消息的完整流程', async () => {
    // 1. 登录
    await element(by.id('phone-input')).typeText('13800138001');
    await element(by.id('password-input')).typeText('Test123456');
    await element(by.id('login-button')).tap();
    
    // 2. 等待主界面加载
    await waitFor(element(by.id('conversation-list')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 3. 进入会话
    await element(by.id('conversation-item-0')).tap();
    
    // 4. 发送消息
    await element(by.id('message-input')).typeText('E2E测试消息');
    await element(by.id('send-button')).tap();
    
    // 5. 验证消息显示
    await waitFor(element(by.text('E2E测试消息')))
      .toBeVisible()
      .withTimeout(3000);
    
    // 6. 验证消息在右侧（自己发的）
    await expect(
      element(by.id('message-bubble').and(by.text('E2E测试消息')))
    ).toHaveToggleValue(true); // 自己的消息
  });
  
  it('应该能接收实时消息', async () => {
    // 使用第二个设备/模拟器发送消息
    // 然后验证第一个设备实时收到
    
    // 模拟WebSocket消息推送
    await device.sendUserNotification({
      trigger: {
        type: 'push',
      },
      title: '新消息',
      body: '你好',
    });
    
    // 验证消息显示
    await waitFor(element(by.text('你好')))
      .toBeVisible()
      .withTimeout(2000);
  });
});
```

### 8.4 性能测试脚本

```javascript
// 性能测试 (使用k6或Artillery)
// 位置: tests/performance/*.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // 1分钟升到100并发
    { duration: '3m', target: 100 },   // 保持100并发3分钟
    { duration: '1m', target: 0 },     // 1分钟降到0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%请求<500ms
    errors: ['rate<0.01'],             // 错误率<1%
  },
};

export default function () {
  // 登录
  const loginRes = http.post('http://test-api/api/auth/login', JSON.stringify({
    phone: '13800138001',
    password: 'Test123456',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  const token = loginRes.json('data.access');
  
  // 发送消息
  const msgRes = http.post('http://test-api/api/im/messages', JSON.stringify({
    conversationId: 'test_conv_001',
    type: 'text',
    content: `性能测试消息 ${Date.now()}`,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  check(msgRes, {
    'send message status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);
}
```

---

## 9. 测试报告规范

### 9.1 测试报告模板

```markdown
# IM应用测试报告

## 基本信息
- **测试版本**: v1.0.0
- **测试环境**: 测试环境
- **测试时间**: 2026-01-28 ~ 2026-01-30
- **测试人员**: 张三、李四
- **测试轮次**: 第1轮系统测试

## 测试概览

### 测试范围
- ✅ 用户认证模块
- ✅ 消息功能模块
- ✅ 好友管理模块
- ✅ 群聊功能模块
- ⏸️ 多媒体消息（未实现）

### 测试统计

| 测试类型 | 用例数 | 通过 | 失败 | 阻塞 | 通过率 |
|---------|-------|------|------|------|--------|
| 功能测试 | 150 | 142 | 5 | 3 | 94.7% |
| 性能测试 | 20 | 18 | 2 | 0 | 90.0% |
| 兼容性测试 | 30 | 28 | 2 | 0 | 93.3% |
| 安全测试 | 25 | 25 | 0 | 0 | 100% |
| **总计** | **225** | **213** | **9** | **3** | **94.7%** |

## 测试结果详情

### P0级别问题（阻断发版）
1. **[BUG-001] 消息发送失败率3%**
   - 优先级: P0
   - 状态: 已修复
   - 描述: 在弱网环境下消息发送失败率达到3%
   - 复现步骤: 1) 切换到2G网络 2) 发送消息
   - 修复方案: 增加重试机制

2. **[BUG-002] WebSocket断线无法重连**
   - 优先级: P0
   - 状态: 待修复
   - 描述: WebSocket断开后无法自动重连
   - 影响: 无法实时接收消息

### P1级别问题（影响体验）
1. **[BUG-003] 消息列表滚动卡顿**
   - 优先级: P1
   - 状态: 已修复
   - 描述: 历史消息超过100条时滚动卡顿
   - 修复方案: 使用虚拟列表优化

### P2级别问题（可接受）
1. **[BUG-004] 群成员列表加载慢**
   - 优先级: P2
   - 状态: 已记录
   - 描述: 超过200人的群加载时间>5s

## 性能测试结果

### 响应时间
| 操作 | 目标 | 实际 | 结果 |
|------|------|------|------|
| 登录 | <1s | 0.8s | ✅ |
| 发送消息 | <300ms | 250ms | ✅ |
| 接收消息 | <500ms | 400ms | ✅ |
| 加载会话列表 | <1s | 1.2s | ⚠️ |

### 并发测试
- 并发用户: 1000
- 测试时长: 10分钟
- TPS: 1200
- 错误率: 0.5%
- P95响应时间: 450ms
- 结论: ✅ 通过

## 兼容性测试结果

### iOS
- iOS 15.0: ✅ 通过
- iOS 16.0: ✅ 通过
- iOS 17.0: ⚠️ 深色模式适配问题

### Android
- Android 10: ✅ 通过
- Android 11: ✅ 通过
- Android 12: ✅ 通过
- Android 13: ✅ 通过
- Android 14: ⚠️ 通知权限问题

## 安全测试结果
- SQL注入防护: ✅ 通过
- XSS防护: ✅ 通过
- CSRF防护: ✅ 通过
- 权限验证: ✅ 通过
- 数据加密: ✅ 通过

## 结论与建议

### 结论
- 整体质量: 良好
- 核心功能: 稳定
- 发版建议: **可以发版**（修复P0问题后）

### 建议
1. 修复WebSocket重连问题（阻断）
2. 优化会话列表加载性能
3. 适配iOS 17深色模式
4. 处理Android 14通知权限

### 遗留问题
- 多媒体消息功能未实现
- 消息转发功能未测试
- 大文件传输性能待验证

---
**报告生成时间**: 2026-01-30 18:00
**下次测试计划**: 2026-02-05（第2轮回归测试）
```

---

## 10. 缺陷管理规则

### 10.1 缺陷等级定义

| 等级 | 名称 | 定义 | 响应时间 | 修复时间 |
|------|------|------|---------|---------|
| P0 | 致命 | 核心功能完全不可用，阻断发版 | 1小时 | 1天 |
| P1 | 严重 | 主要功能受影响，用户体验差 | 4小时 | 3天 |
| P2 | 一般 | 次要功能问题，有替代方案 | 1天 | 1周 |
| P3 | 轻微 | 界面美化、文案优化等 | 3天 | 2周 |

### 10.2 缺陷状态流转

```
新建(New) → 已确认(Confirmed) → 已分配(Assigned) → 
修复中(Fixing) → 待验证(Pending) → 已关闭(Closed)
                                  ↓
                            重新打开(Reopened)
```

### 10.3 缺陷报告模板

```markdown
### 缺陷ID: BUG-2026012801
**标题**: 消息发送后WebSocket推送未收到

**基本信息**
- 优先级: P0
- 严重程度: 致命
- 状态: 新建
- 发现人: 张三
- 发现时间: 2026-01-28 10:30
- 环境: 测试环境
- 版本: v1.0.0

**复现步骤**
1. 用户A登录应用（iPhone 14, iOS 17.0）
2. 用户B登录应用（Pixel 6, Android 13）
3. 用户A发送消息给用户B: "测试消息"
4. 观察用户B的消息列表

**预期结果**
- 用户B应该在1秒内收到消息
- 消息显示在聊天列表中
- 收到WebSocket推送通知

**实际结果**
- 用户B没有收到实时推送
- 需要手动刷新才能看到消息
- WebSocket连接显示正常

**复现概率**: 100%

**影响范围**
- 影响所有用户的实时通信
- 导致消息延迟

**日志/截图**
\`\`\`
[WebSocket] Connection established
[WebSocket] Heartbeat OK
[WebSocket] No message received for 30s
\`\`\`

**可能原因**
- WebSocket消息路由问题
- 事件监听器未正确绑定
- Redis Pub/Sub未配置

**修复建议**
1. 检查WebSocket事件分发逻辑
2. 验证Redis Pub/Sub配置
3. 添加消息推送日志

**关联缺陷**: 无
**附件**: screenshot.png, console.log
```

### 10.4 缺陷跟踪指标

```yaml
每日统计:
  - 新增缺陷数
  - 修复缺陷数
  - 遗留缺陷数
  - P0缺陷数（应为0）

每周统计:
  - 缺陷修复率 = 修复数 / (新增数 + 遗留数)
  - 缺陷重开率 = 重开数 / 修复数
  - 平均修复时间
  - 缺陷密度 = 缺陷数 / KLOC

质量门禁:
  - P0缺陷 = 0
  - P1缺陷 < 5
  - 缺陷修复率 > 95%
  - 缺陷重开率 < 5%
```

---

## 附录

### A. 测试工具清单

```yaml
前端测试:
  单元测试: Jest
  组件测试: React Testing Library
  E2E测试: Detox / Appium
  性能测试: React DevTools Profiler
  代码覆盖率: Istanbul

后端测试:
  API测试: Supertest / Postman
  性能测试: k6 / Artillery
  压力测试: JMeter
  WebSocket测试: wscat / ws库
  数据库测试: 数据库事务回滚

通用工具:
  Mock服务: json-server / MSW
  抓包工具: Charles / Wireshark
  性能监控: New Relic / DataDog
  错误追踪: Sentry
  日志分析: ELK Stack
```

### B. 测试环境配置

```bash
# 后端测试环境配置
cp .env.example .env.test
# 修改配置
DB_DIALECT=mysql
DB_HOST=test-db.internal
REDIS_HOST=test-redis.internal
LOG_LEVEL=debug

# 初始化测试数据
npm run db:migrate:test
npm run db:seed:test

# 启动测试服务器
npm run test:server

# 前端测试环境配置
cp .env.example .env.test
# 修改配置
EXPO_PUBLIC_API_BASE_URL=http://test-api.internal:3009
EXPO_PUBLIC_WS_URL=ws://test-api.internal:3009/ws

# 运行测试
npm run test                 # 单元测试
npm run test:integration     # 集成测试
npm run test:e2e            # E2E测试
npm run test:coverage       # 覆盖率报告
```

### C. 持续集成配置

```yaml
# .github/workflows/test.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd im && npm ci
        cd ../my-app && npm ci
    
    - name: Run linter
      run: |
        cd im && npm run lint
        cd ../my-app && npm run lint
    
    - name: Run unit tests
      run: |
        cd im && npm run test
        cd ../my-app && npm run test
    
    - name: Run integration tests
      run: cd im && npm run test:integration
    
    - name: Generate coverage report
      run: cd im && npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
    
    - name: Build
      run: |
        cd im && npm run build
        cd ../my-app && npm run build
    
    quality-gate:
      runs-on: ubuntu-latest
      needs: test
      
      steps:
      - name: Check test coverage
        run: |
          if [ "$COVERAGE" -lt "80" ]; then
            echo "Coverage below 80%"
            exit 1
          fi
      
      - name: Check for P0 bugs
        run: |
          # 查询Bug追踪系统
          # 如果有P0 bug则失败
```

---

## 总结

本测试规则涵盖了IM应用的全方位测试要求，包括：

- ✅ **完整的测试分类**: 单元、集成、E2E、性能、安全
- ✅ **明确的通过标准**: 每个功能都有量化指标
- ✅ **详细的测试场景**: 正常、边界、异常、并发
- ✅ **自动化测试规范**: 代码示例和覆盖率要求
- ✅ **缺陷管理流程**: 等级、状态、跟踪指标

**使用建议**:
1. 根据项目实际情况调整优先级和标准
2. 逐步建立自动化测试体系
3. 定期review和更新测试规则
4. 建立测试文化，全员参与质量保障

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-28  
**维护人**: 测试团队

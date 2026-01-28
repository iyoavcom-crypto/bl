---
trigger: always_on
---
# 前后端代码审核工作流

## 1. WebSocket 事件审核

### 1.1 事件类型一致性
- [ ] 对比前端 `types/websocket.ts` 与后端 `websocket/events/types.ts` 事件类型定义
- [ ] 确认所有后端触发的事件，前端都有对应类型声明
- [ ] 检查事件名称拼写是否完全一致（如 `group:muted` vs `group_muted`）

### 1.2 Payload 类型字段匹配
- [ ] 逐个对比前后端 Payload 接口定义
- [ ] 检查字段名是否一致（如后端 `operatorId` vs 前端 `kickedBy`）
- [ ] 检查字段类型是否一致（如 `number` vs `string`）
- [ ] 检查是否有遗漏字段（如后端有 `kickedAt`，前端缺失）
- [ ] 检查嵌套对象结构是否一致（如 `member: {id, name}` vs `member: GroupMember`）

### 1.3 事件监听器绑定
- [ ] 检查 Store 中定义的 `handle*` 方法是否都有对应的 `setupWsListeners`
- [ ] 检查 `App.tsx` 是否调用了所有 Store 的 `setupWsListeners`
- [ ] 确认监听器在 `isAuthenticated` 后正确初始化
- [ ] 确认返回的 cleanup 函数被正确调用

---

## 2. API 接口审核

### 2.1 请求参数
- [ ] 检查前端调用参数与后端路由期望参数是否匹配
- [ ] 检查必填字段是否都传递（如 `source` 字段）
- [ ] 检查参数类型是否正确（如对象 vs 分散参数）

### 2.2 响应数据
- [ ] 检查前端类型定义与后端实际返回是否一致
- [ ] 检查数据包装层级（如 `response.data` vs `response.data.data`）
- [ ] 检查数组/对象格式兼容性

### 2.3 API 路径
- [ ] 检查 `API_PATHS` 常量与后端路由是否匹配
- [ ] 检查 RESTful 动词是否正确（GET/POST/PUT/DELETE）

---

## 3. Store 逻辑审核

### 3.1 方法命名一致性
- [ ] 检查页面调用的方法名是否与 Store 导出的方法名一致
- [ ] 检查是否存在拼写错误或大小写不一致

### 3.2 状态更新逻辑
- [ ] 检查乐观更新是否有对应的回滚逻辑
- [ ] 检查状态流转是否完整（如 pending → sent → delivered → read）
- [ ] 检查重复数据防护（如 `exists` 检查）

### 3.3 数据转换
- [ ] 检查 API 响应到 Store 状态的转换是否正确
- [ ] 检查 WebSocket 事件 payload 到 Store 状态的转换是否正确

---

## 4. 通知系统审核

### 4.1 推送通知
- [ ] 检查所有后端推送场景，前端是否有对应 `NotificationType`
- [ ] 检查离线推送条件（isOnline, doNotDisturb, token有效性）
- [ ] 检查推送 data.type 与前端 NotificationType 是否匹配

### 4.2 通知导航
- [ ] 检查 `handleNotificationResponse` 覆盖所有 NotificationType
- [ ] 检查导航目标页面和参数是否正确
- [ ] 检查角标数量同步逻辑

---

## 5. UI 展示审核

### 5.1 数据绑定
- [ ] 检查页面使用的 selector 是否正确返回数据
- [ ] 检查字段访问是否与类型定义一致（如 `item.account` vs `item.id`）

### 5.2 状态展示
- [ ] 检查加载状态（loading）是否正确显示
- [ ] 检查空状态是否正确处理
- [ ] 检查错误状态是否正确提示

### 5.3 交互反馈
- [ ] 检查按钮禁用状态逻辑
- [ ] 检查 Toast/Alert 提示是否合适

---

## 6. 常见问题清单

| 问题类型 | 检查位置 | 典型错误 |
|---------|---------|---------|
| 方法名不存在 | 页面调用 Store | `sendFriendRequest` vs `sendRequest` |
| 字段名不匹配 | Payload 类型 | `kickedBy` vs `operatorId` |
| 事件未绑定 | App.tsx | 缺少 `setupGroupListeners()` 调用 |
| 类型不匹配 | 嵌套对象 | `member: GroupMember` vs `member: {id,name}` |
| 导航缺失 | notificationStore | 缺少 `group_kicked` case |
| 字段访问错误 | 页面渲染 | `item.account` (不存在) |

---

## 7. 审核执行步骤

1. **类型文件对比**: 先对比 `types/*.ts` 与后端类型定义
2. **Store 方法检查**: 检查所有 `handle*` 方法和 `setupWsListeners`
3. **页面调用审核**: 检查页面对 Store 方法的调用是否正确
4. **运行类型检查**: 执行 `npx tsc --noEmit` 验证
5. **功能测试**: 实际触发事件验证前端响应
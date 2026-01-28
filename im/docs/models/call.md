# call 模型文档
模块位置：[src/models/call](../../../src/models/call)

## 基本信息
- 表名: "call"
- 模型: "Call"
- 时间戳: true
- 软删除: false

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| conversationId | 会话ID | string | 否 | 无 | BTREE | 引用 conversation.id，仅 private 类型 |
| callerId | 发起者ID | string | 否 | 无 | BTREE | 引用 user.id |
| calleeId | 接听者ID | string | 否 | 无 | BTREE | 引用 user.id |
| status | 通话状态 | CallStatus | 否 | "initiated" | BTREE | initiated/ringing/connected/ended/missed/rejected/busy |
| startedAt | 接通时间 | Date \| null | 是 | 无 |  | status=connected 时设置 |
| endedAt | 结束时间 | Date \| null | 是 | 无 |  | status=ended 时设置 |
| duration | 通话时长 | number \| null | 是 | 无 |  | 秒，endedAt - startedAt |
| endReason | 结束原因 | CallEndReason \| null | 是 | 无 |  | caller_hangup/callee_hangup/timeout/network_error |
| createdAt | 创建时间 | Date | 否 | 无 | BTREE | 通话发起时间 |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | conversation | conversationId | Conversation | 级联 | 级联 | 所属会话 |
| belongsTo | caller | callerId | User | 级联 | 级联 | 发起者 |
| belongsTo | callee | calleeId | User | 级联 | 级联 | 接听者 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| CallStatus | INITIATED | "initiated" | 已发起 |
| CallStatus | RINGING | "ringing" | 响铃中 |
| CallStatus | CONNECTED | "connected" | 已接通 |
| CallStatus | ENDED | "ended" | 已结束 |
| CallStatus | MISSED | "missed" | 未接听 |
| CallStatus | REJECTED | "rejected" | 已拒绝 |
| CallStatus | BUSY | "busy" | 对方忙 |
| CallEndReason | CALLER_HANGUP | "caller_hangup" | 主叫挂断 |
| CallEndReason | CALLEE_HANGUP | "callee_hangup" | 被叫挂断 |
| CallEndReason | TIMEOUT | "timeout" | 超时未接 |
| CallEndReason | NETWORK_ERROR | "network_error" | 网络错误 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| CallAttributes | id | string |
| CallAttributes | conversationId | string |
| CallAttributes | callerId | string |
| CallAttributes | calleeId | string |
| CallAttributes | status | CallStatus |
| CallAttributes | startedAt | Date \| null |
| CallAttributes | endedAt | Date \| null |
| CallAttributes | duration | number \| null |
| CallAttributes | endReason | CallEndReason \| null |

## DTO/白名单
- 列表字段: id, conversationId, callerId, calleeId, status, startedAt, endedAt, duration, createdAt
- 详情字段: id, conversationId, callerId, calleeId, status, startedAt, endedAt, duration, endReason, createdAt, updatedAt
- 可创建字段: conversationId, callerId, calleeId
- 可更新字段: status, startedAt, endedAt, duration, endReason
- 可筛选字段: conversationId, callerId, calleeId, status
- 可排序字段: createdAt, startedAt, duration

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；验证 conversation.type='private'（仅支持私聊语音通话）
- beforeUpdate: 当 status 变为 'ended' 且 startedAt 存在时，自动计算 duration = endedAt - startedAt

## 索引
- `(conversationId, createdAt)` BTREE - 会话通话记录（时间排序）
- `(callerId)` BTREE - 查询某人发起的通话
- `(calleeId)` BTREE - 查询某人接收的通话
- `(status)` BTREE - 按状态筛选

## 通话流程
1. **发起通话**: Caller 发送 `call:initiate` → 创建 Call 记录 status='initiated' → 通过 WebSocket 推送给 Callee
2. **响铃**: Callee 收到推送 → App 显示来电界面 → 发送 `call:ring` → status='ringing'
3. **接听**: Callee 点击接听 → 发送 `call:accept` → status='connected', startedAt=now → 开始 WebRTC 协商
4. **拒绝**: Callee 点击拒绝 → 发送 `call:reject` → status='rejected'
5. **超时**: 60秒无响应 → status='missed', endReason='timeout'
6. **挂断**: 任一方发送 `call:hangup` → status='ended', endedAt=now, 计算 duration

## 信令协议
```typescript
type SignalType = 
  | 'call:initiate'    // 发起通话
  | 'call:ring'        // 响铃通知
  | 'call:accept'      // 接受通话
  | 'call:reject'      // 拒绝通话
  | 'call:hangup'      // 挂断通话
  | 'call:busy'        // 对方忙
  | 'call:timeout'     // 超时未接
  | 'rtc:offer'        // WebRTC Offer
  | 'rtc:answer'       // WebRTC Answer
  | 'rtc:candidate';   // ICE Candidate

interface SignalMessage {
  type: SignalType;
  callId: string;
  fromUserId: string;
  toUserId: string;
  payload?: {
    sdp?: RTCSessionDescription;
    candidate?: RTCIceCandidate;
  };
}
```

## 业务逻辑
- **仅私聊**: 语音通话仅支持 type='private' 的会话
- **单通话限制**: 同一用户同时只能有一个进行中的通话
- **超时处理**: 60秒无响应自动标记为 missed
- **忙线处理**: 若 callee 已在通话中，返回 busy 状态

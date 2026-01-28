# 语音通话流程

1. 发起通话 POST /api/im/calls/initiate
   请求: { calleeId }
   响应: { callId, status: "initiated" }

2. 被叫收到 WebSocket 事件
   事件: call:invite
   载荷: { callId, callerId, calleeId }

3. 被叫响铃 POST /api/im/calls/:callId/ring
   主叫收到事件: call:ring

4. 接听/拒绝
   接听: POST /api/im/calls/:callId/accept
   拒绝: POST /api/im/calls/:callId/reject

5. WebRTC 信令交换 POST /api/im/calls/:callId/signal
   主叫发送 offer -> 被叫收到 call:signal
   被叫发送 answer -> 主叫收到 call:signal
   双方交换 ice-candidate

6. 挂断 POST /api/im/calls/:callId/hangup
   双方收到 call:end 事件

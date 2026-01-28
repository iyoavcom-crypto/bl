# 好友添加流程

1. 搜索用户 GET /api/im/users/search?keyword=xxx
   响应: [{ id, name, avatar, ... }]

2. 发送好友申请 POST /api/im/friends/requests
   请求: { toUserId, message, source: "search" }

3. 对方收到 WebSocket 事件
   事件: friend:request
   载荷: { requestId, fromUser, message }

4. 接受/拒绝申请
   接受: POST /api/im/friends/requests/:requestId/accept
   拒绝: POST /api/im/friends/requests/:requestId/reject

5. 申请者收到 WebSocket 事件
   事件: friend:accepted
   载荷: { requestId, friendUser, conversationId }

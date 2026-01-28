# 消息发送流程

1. 获取/创建会话 POST /api/im/conversations/private
   请求: { targetUserId }
   响应: { id, type, targetUserId, ... }

2. 发送消息 POST /api/im/messages
   请求: { conversationId, type: "text", content: "消息内容" }
   响应: Message 对象

3. 对方收到 WebSocket 事件
   事件: message:new
   载荷: { conversationId, message }

4. 标记已读 POST /api/im/messages/conversation/:id/read
   请求: { messageId }

5. 标记送达 POST /api/im/messages/:messageId/delivered

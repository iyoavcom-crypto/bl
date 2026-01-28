请帮我实现发送消息功能。

需要的 API:
- POST /api/im/conversations/private (获取/创建私聊会话)
- POST /api/im/messages (发送消息)

WebSocket 事件:
- message:new (收到新消息)
- message:read (已读回执)
- message:delivered (送达回执)

实现步骤:
1. 获取或创建会话
2. 发送消息并显示在列表
3. 监听 message:new 接收消息
4. 标记已读和送达

请使用 TypeScript 和 React Native/Expo。

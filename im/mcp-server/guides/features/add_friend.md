请帮我实现添加好友功能。

需要的 API:
- GET /api/im/users/search (搜索用户)
- POST /api/im/friends/requests (发送申请)
- POST /api/im/friends/requests/:id/accept (接受)
- POST /api/im/friends/requests/:id/reject (拒绝)
- GET /api/im/friends/requests/received (收到的申请)

WebSocket 事件:
- friend:request (收到申请)
- friend:accepted (申请被接受)

实现步骤:
1. 搜索用户界面
2. 发送好友申请
3. 好友申请列表
4. 处理申请（接受/拒绝）

请使用 TypeScript 和 React Native/Expo。

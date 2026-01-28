请帮我实现创建群组功能。

需要的 API:
- POST /api/im/groups (创建群组)
- POST /api/im/groups/:groupId/invite (邀请成员)
- GET /api/im/groups/:groupId/members (获取成员)

WebSocket 事件:
- group:invited (被邀请入群)
- group:member_joined (成员入群)

实现步骤:
1. 选择好友界面
2. 设置群名称和头像
3. 创建群组
4. 群详情页面

请使用 TypeScript 和 React Native/Expo。

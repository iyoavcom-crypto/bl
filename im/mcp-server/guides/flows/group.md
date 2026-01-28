# 群组管理流程

1. 创建群组 POST /api/im/groups
   请求: { name, avatar, memberIds }
   响应: Group 对象

2. 被邀请者收到 WebSocket 事件
   事件: group:invited
   载荷: { groupId, groupName, inviter }

3. 群主操作
   邀请成员: POST /api/im/groups/:groupId/invite
   踢出成员: POST /api/im/groups/:groupId/kick/:userId
   设置管理员: POST /api/im/groups/:groupId/admin/:userId
   禁言成员: POST /api/im/groups/:groupId/mute/:userId
   转让群主: POST /api/im/groups/:groupId/transfer

4. 成员退出 POST /api/im/groups/:groupId/leave

5. 解散群组 DELETE /api/im/groups/:groupId

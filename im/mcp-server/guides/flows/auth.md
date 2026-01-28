# 用户认证流程

1. 注册 POST /api/auth/register
   请求: { phone, password, pin }
   响应: { user, access, refresh, payload }

2. 登录 POST /api/auth/login
   请求: { phone, password }
   响应: { user, access, refresh, payload }

3. 获取当前用户 GET /api/auth/me
   需要 Authorization: Bearer <access_token>

4. 注册设备 POST /api/im/devices/register
   请求: { platform, deviceId, pushToken, pushProvider }

5. 连接 WebSocket
   地址: ws://server/ws?token=<access_token>&deviceId=<device_id>

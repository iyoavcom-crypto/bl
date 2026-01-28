请帮我实现用户登录功能。

需要的 API:
- POST /api/auth/login
  请求: { phone: string, password: string }
  响应: { user: User, access: string, refresh: string, payload: AuthPayload }

实现步骤:
1. 创建登录表单（手机号、密码）
2. 调用登录 API
3. 保存 access token 到本地存储
4. 注册设备获取推送
5. 连接 WebSocket

请使用 TypeScript 和 React Native/Expo。

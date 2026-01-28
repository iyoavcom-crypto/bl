请帮我实现用户注册功能。

需要的 API:
- POST /api/auth/register
  请求: { phone: string, password: string, pin: string }
  响应: { user: User, access: string, refresh: string, payload: AuthPayload }

实现步骤:
1. 创建注册表单（手机号、密码、二级密码）
2. 验证输入格式
3. 调用注册 API
4. 保存 token 并跳转到主页

请使用 TypeScript 和 React Native/Expo。

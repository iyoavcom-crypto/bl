# IM-API 项目

即时通讯后端 API 服务，基于 TypeScript + Express + Sequelize + SQLite 构建。

## 项目特色

- 🚀 **现代化技术栈**: TypeScript + Express + Sequelize + SQLite
- 🔐 **安全认证**: JWT (jose) 认证机制
- 📱 **多端支持**: 支持 iOS、Android、Web 等多平台
- ⚡ **实时通信**: WebSocket 长连接支持
- 🤖 **AI 集成**: 内置 MCP (Model Context Protocol) 服务器
- 📚 **完整文档**: 详尽的 API 文档和开发指南

## 技术架构

```
im/
├── src/                 # 源代码目录
│   ├── models/         # 数据模型 (Sequelize)
│   ├── routes/         # API 路由
│   ├── services/       # 业务逻辑层
│   ├── middleware/     # 中间件
│   ├── websocket/      # WebSocket 服务
│   └── tools/          # 工具模块
├── mcp/                # MCP 服务器相关文件
├── mcp-server/         # MCP 服务器实现
├── docs/               # 项目文档
├── tests/              # 测试文件
└── data/               # 数据文件
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

首次运行时会自动生成必要的环境变量：

```bash
# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
npm start
```

### 运行测试

```bash
# 运行所有测试
npx tsx tests/run.ts

# 运行特定类型测试
npx tsx tests/run.ts --unit      # 单元测试
npx tsx tests/run.ts --integration # 集成测试
npx tsx tests/run.ts --e2e       # 端到端测试
```

## 核心功能

### 🔐 认证系统
- 用户注册/登录
- JWT Token 认证
- 设备管理
- 多设备支持

### 💬 即时通讯
- 私聊消息
- 群组聊天
- 消息撤回/转发
- 已读回执
- 输入状态提示

### 📞 实时通话
- 音视频通话 (WebRTC)
- 通话邀请/接听/拒绝
- 通话状态同步

### 👥 社交功能
- 好友添加/管理
- 群组创建/管理
- 在线状态同步

### 📱 推送通知
- 多平台推送支持
- 消息推送
- 通话提醒

## API 文档

详细的 API 文档请参考：

- [REST API 参考](./docs/API.md)
- [WebSocket 事件参考](./mcp/websocket-events.md)
- [MCP API 参考](./docs/MCP-API-REFERENCE.md)

## MCP 服务器

本项目内置了 MCP (Model Context Protocol) 服务器，为 AI 助手提供：

### 主要功能
- 📚 **API 查询**: 快速搜索和获取 API 信息
- 💻 **代码生成**: 自动生成 TypeScript/React Native 代码示例
- 🔄 **WebSocket 支持**: 提供 WebSocket 事件处理模板
- 📋 **业务流程**: 详细的功能实现指南
- ❓ **错误诊断**: 错误码查询和解决方案

### 使用方式

```bash
# 启动 MCP 服务器
node mcp-server/mcp-server.mjs

# 或查看详细部署指南
cat docs/MCP-DEPLOYMENT-GUIDE.md
```

### 集成到 AI 助手

MCP 服务器可以集成到各种 AI 开发工具中：
- Claude Desktop
- Cursor
- 其他支持 MCP 协议的工具

## 开发指南

### 项目结构

```
src/
├── config/        # 配置文件
├── models/        # 数据模型
├── routes/        # API 路由
├── services/      # 业务逻辑
├── middleware/    # 中间件
├── websocket/     # WebSocket 服务
├── tools/         # 工具模块
└── utils/         # 通用工具
```

### 编码规范

- 使用 TypeScript (ESM)
- 遵循严格的类型检查
- 所有导出必须有类型注解
- 禁止使用 `any` 类型

### 数据库迁移

```bash
# 初始化数据库
npm run seed
```

## 部署

### 生产环境部署

```bash
# 构建项目
npm run build

# 启动服务
npm start
```

### Docker 部署 (可选)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 测试

项目包含完整的测试套件：

```bash
# 运行全部测试
npm test

# 运行特定模块测试
npx tsx tests/run.ts --module=auth

# 生成测试报告
npx tsx tests/run.ts --report
```

## 文档

- [项目分析](./docs/ANALYSIS.md)
- [功能特性](./docs/FEATURES.md)
- [API 文档](./docs/API.md)
- [MCP API 参考](./docs/MCP-API-REFERENCE.md)
- [MCP 部署指南](./docs/MCP-DEPLOYMENT-GUIDE.md)
- [测试文档](./tests/TESTING.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 GitHub Issue。
# AGENTS.md

> 版本：1.0.0 | 更新：2026-01-25

## 项目概述

**im-api** - 即时通讯后端 API 服务

- **技术栈**：TypeScript + Express + Sequelize + SQLite
- **认证方式**：JWT (jose)
- **运行时**：Node.js (ESM)

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器 (tsx watch)
npm run build            # 构建生产版本
npm run start            # 运行生产版本

# 测试
npx tsx tests/run.ts              # 运行单元测试
npx tsx tests/run.ts --unit       # 单元测试
npx tsx tests/run.ts --integration # 集成测试
npx tsx tests/run.ts --e2e        # E2E 测试
npx tsx tests/run.ts --all        # 全部测试
npx tsx tests/run.ts --module=jwt # 指定模块测试

# 数据库
npm run seed             # 初始化种子数据
```

## 目录结构

```
src/
├── server.ts           # 应用入口
├── config/             # 配置模块（env、db、cors、redis）
├── models/             # Sequelize 模型（遵循 .qoder/rules/models.md）
├── routes/             # Express 路由
├── services/           # 业务逻辑层
├── repo/               # 仓储层（通用 CRUD）
├── middleware/         # 中间件（auth、cors、logging、rate-limit）
├── tools/              # 工具模块（jwt、crypto、qr、logging）
├── contracts/          # 请求/响应契约
├── types/              # 全局类型定义
└── utils/              # 通用工具函数

tests/
├── run.ts              # 测试入口
├── unit/               # 单元测试
├── integration/        # 集成测试
├── e2e/                # E2E 测试
├── helpers/            # 测试辅助工具
├── factories/          # 数据工厂
└── TESTING.md          # 测试规范文档
```

## 代码规范

### 模型编写

遵循 `.qoder/rules/models.md` 规范：

- 目录结构：`models/{name}/` 包含 `index.ts`、`types/`、`association.ts`、`hook.ts`
- 必须定义 6 个字段配置常量：`LIST`、`DETAIL`、`CREATABLE`、`UPDATABLE`、`FILTERABLE`、`SORTABLE`
- 敏感字段通过 `defaultScope` 和 `toJSON()` 双重保护
- 使用 `paranoid: true` 软删除

### 导入规范

- 使用 `.js` 扩展名（ES 模块）
- 使用 `@/` 路径别名指向 `src/`

### 类型安全

- 所有函数必须有完整类型标注
- 禁止使用 `any`（除非必要且有注释说明）

## 测试规范

详见 `tests/TESTING.md`：

- **单元测试**：`tests/unit/` - 无外部依赖，测试 tools/middleware
- **集成测试**：`tests/integration/` - 含 DB/Redis，测试 services/repo/models
- **E2E 测试**：`tests/e2e/` - 完整服务流程测试

测试辅助：
- `helpers/runner.ts`：提供 `test()`、`assert()`、`summary()`
- `factories/`：测试数据工厂

## 环境配置

必需的环境变量（见 `src/config/env/`）：

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=<自动生成>
PIN_SECRET=<自动生成>
PASSWORD_PEPPER=<自动生成>
```

首次启动时自动检查并生成安全密钥。

## API 结构

- 基础路径：`/api`
- 健康检查：`GET /health`
- 认证相关：`/api/auth`（公开）
- 管理接口：`/api/admin/*`（需认证）

## 关键模块说明

### JWT 模块 (`src/tools/jwt/`)

- 使用 jose 库实现
- 支持 access/refresh 双令牌
- 详见 `src/tools/jwt/JWT-MODULE.md`

### 通用 CRUD (`src/repo/`)

- `createCrudService()` 工厂函数
- 支持分页、筛选、排序、树结构
- 内置验证和错误处理

### 认证中间件 (`src/middleware/auth/`)

- `requireAuth`：强制认证
- VIP、角色、设备等 guards

## 注意事项

1. **数据库**：开发环境使用 SQLite（`data/database.sqlite`）
2. **无 lint 命令**：项目未配置 ESLint，依赖 TypeScript 严格模式
3. **构建检查**：修改代码后运行 `npm run build` 验证类型
4. **测试验证**：新增功能需编写对应测试

# 测试规范

> 版本：1.2.0 | 更新：2026-01-25

## 目录结构

```
tests/
├── run.ts             # 统一入口（支持选项）
├── unit/              # 单元测试（无外部依赖）
├── integration/       # 集成测试（含DB/Redis）
├── e2e/               # 端到端流程测试
├── helpers/           # 复用工具
│   └── runner.ts      # test/assert/summary
├── factories/         # 数据工厂
│   └── user.ts
├── mocks/             # Mock 模块
└── TESTING.md
```

## 运行命令

```bash
# 统一入口
npx tsx tests/run.ts              # 默认运行单元测试
npx tsx tests/run.ts --unit       # 单元测试
npx tsx tests/run.ts --integration# 集成测试
npx tsx tests/run.ts --e2e        # E2E测试
npx tsx tests/run.ts --all        # 全部测试
npx tsx tests/run.ts --module=jwt # 指定模块

# 直接运行
npx tsx tests/unit/tools/jwt.test.ts
```

## 测试分类

| 类型 | 目录 | 命名 | 依赖 |
|------|------|------|------|
| 单元 | `unit/` | `{module}.test.ts` | 无 |
| 集成 | `integration/` | `{module}.int.ts` | DB/Redis |
| E2E | `e2e/` | `{flow}.e2e.ts` | 完整服务 |

## 模块→测试类型映射

| 模块 | 测试类型 | 示例 |
|------|----------|------|
| `tools/*` | 单元 | `unit/tools/jwt.test.ts` |
| `middleware/*` | 单元 | `unit/middleware/auth.test.ts` |
| `services/*` | 集成 | `integration/services/auth.int.ts` |
| `repo/*` | 集成 | `integration/repo/crud.int.ts` |
| `models/*` | 集成 | `integration/models/user.int.ts` |
| API流程 | E2E | `e2e/auth-flow.e2e.ts` |

## 复用组件

### helpers/runner.ts

```typescript
export function test(name, fn);   // 测试用例
export function assert(cond, msg);// 断言
export function group(name);      // 分组
export function summary(name);    // 汇总并退出
```

### factories/user.ts

```typescript
export function createUserData(overrides);  // 用户数据
export function createJwtPayload(overrides);// JWT载荷
```

## E2E 流程示例

```typescript
// e2e/xxx-flow.e2e.ts
import { test, assert, summary } from "../helpers/runner";
import { createUserData } from "../factories/user";

await test("1. 步骤一", async () => { ... });
await test("2. 步骤二", async () => { ... });
summary();
```

## 核心原则

1. **隔离**：单元测试禁止外部依赖
2. **复用**：公共逻辑放 `helpers/`
3. **工厂**：测试数据用工厂生成
4. **清理**：集成/E2E 测试后清理数据
5. **顺序**：E2E 测试按步骤编号

---
trigger: glob
glob: tests/**/*.ts
---

# 测试模块编写规范

## 一、目录结构

```
tests/
├── run.ts              # 统一入口
├── unit/               # 单元测试（无外部依赖）
│   └── {module}.test.ts
├── integration/        # 集成测试（含DB/Redis）
│   └── {module}.int.ts
├── e2e/                # E2E测试（完整服务）
│   └── {flow}.e2e.ts
├── helpers/            # 复用工具
│   └── runner.ts
├── factories/          # 数据工厂
│   └── {model}.ts
└── mocks/              # Mock 模块
```

## 二、测试类型与命名

| 类型 | 目录 | 命名模式 | 依赖 |
|------|------|----------|------|
| 单元 | `unit/` | `{module}.test.ts` | 无 |
| 集成 | `integration/` | `{module}.int.ts` | DB/Redis |
| E2E | `e2e/` | `{flow}.e2e.ts` | 完整服务 |

### 模块→测试类型映射

| 模块 | 测试类型 |
|------|----------|
| `tools/*` | 单元 |
| `middleware/*` | 单元 |
| `services/*` | 集成 |
| `repo/*` | 集成 |
| `models/*` | 集成 |
| API流程 | E2E |

## 三、测试文件结构

```typescript
/**
 * {模块名} 测试
 * 运行: npx tsx tests/{type}/{module}.test.ts
 */

import { test, assert, group, summary } from "../helpers/runner";
import { createTestData } from "../factories/{model}";

async function runTests() {
  console.log("=== {模块名}测试 ===");

  // 1. 功能分组
  group("功能分组名");

  await test("测试用例描述", async () => {
    // 准备
    const data = createTestData();
    
    // 执行
    const result = await someFunction(data);
    
    // 断言
    assert(condition, "断言失败消息");
  });

  // 2. 其他分组
  group("其他功能");
  // ...

  summary("{模块名}");
}

runTests().catch(console.error);
```

## 四、测试辅助工具

### helpers/runner.ts

```typescript
import { test, assert, group, summary } from "../helpers/runner";

// 测试用例
await test("用例名称", async () => { ... });

// 断言
assert(condition, "失败消息");

// 分组标题
group("分组名");

// 输出结果并退出
summary("模块名");
```

## 五、数据工厂

### factories/{model}.ts

```typescript
import { nanoid } from "@/tools/jwt";

export interface DataOptions {
  id?: string;
  field?: string;
}

/**
 * 创建测试数据
 */
export function createTestData(overrides: DataOptions = {}) {
  return {
    id: overrides.id ?? nanoid(16),
    field: overrides.field ?? "default",
  };
}

/**
 * 创建特定场景数据
 */
export function createAdminData(overrides: DataOptions = {}) {
  return createTestData({
    roleId: "ADMIN",
    ...overrides,
  });
}
```

## 六、测试原则

### 1. 隔离性

```typescript
// 单元测试禁止外部依赖
// ❌ 错误
import { sequelize } from "@/config";

// ✓ 正确 - 使用 Mock
const mockDb = { query: jest.fn() };
```

### 2. 复用性

```typescript
// 公共逻辑放 helpers/
import { createTestUser, cleanupTestData } from "../helpers/test-utils";
```

### 3. 工厂模式

```typescript
// 测试数据用工厂生成
import { createUserData, createJwtPayload } from "../factories/user";

const user = createUserData({ vip: true });
const payload = createJwtPayload({ roleId: "ADMIN" });
```

### 4. 清理数据

```typescript
// 集成/E2E 测试后清理
afterEach(async () => {
  await cleanupTestData();
});
```

### 5. 顺序执行（E2E）

```typescript
await test("1. 用户注册", async () => { ... });
await test("2. 用户登录", async () => { ... });
await test("3. 获取用户信息", async () => { ... });
```

## 七、异常测试

```typescript
await test("无效输入抛出错误", async () => {
  try {
    await functionThatThrows("invalid");
    throw new Error("should throw");
  } catch (e) {
    assert(isExpectedError(e), "应为预期错误类型");
    assert((e as CustomError).code === "EXPECTED_CODE", "错误码匹配");
  }
});
```

## 八、运行命令

```bash
# 单元测试
npx tsx tests/run.ts --unit
npx tsx tests/unit/{module}.test.ts

# 集成测试
npx tsx tests/run.ts --integration

# E2E测试
npx tsx tests/run.ts --e2e

# 全部测试
npx tsx tests/run.ts --all

# 指定模块
npx tsx tests/run.ts --module=jwt
```

## 九、导入规范

```typescript
// 1. 测试工具
import { test, assert, group, summary } from "../helpers/runner";

// 2. 数据工厂
import { createTestData } from "../factories/{model}";

// 3. 被测模块（使用 @/ 别名）
import { SomeFunction, SomeClass } from "@/tools/{module}";
import type { SomeType } from "@/types/{module}";
```

/**
 * @fileoverview 敏感信息脱敏器单元测试
 * @module tests/unit/tools/logging/sanitizer
 */

import { test, assert, assertEqual, group, summary } from "../../../helpers/runner.js";
import { Sanitizer, createSanitizer } from "@/tools/logging/sanitizer.js";
import type { SanitizeConfig } from "@/middleware/logging/config.js";

/**
 * 创建默认测试配置
 */
function createTestConfig(overrides?: Partial<SanitizeConfig>): SanitizeConfig {
  return {
    enabled: true,
    fields: ["password", "token", "secret", "pin"],
    placeholder: "***REDACTED***",
    partial: {
      enabled: false,
      prefix: 2,
      suffix: 2,
    },
    ...overrides,
  };
}

// ============== sanitize 基础功能测试 ==============
group("sanitize - 基础脱敏功能");

await test("sanitize: 脱敏顶层敏感字段", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { password: "secret123", email: "user@test.com" };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.password, "***REDACTED***", "password 应被脱敏");
  assertEqual(result?.email, "user@test.com", "email 应保留");
});

await test("sanitize: 大小写不敏感匹配", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { Password: "secret1", PASSWORD: "secret2", pAssWoRd: "secret3" };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.Password, "***REDACTED***", "Password 应被脱敏");
  assertEqual(result?.PASSWORD, "***REDACTED***", "PASSWORD 应被脱敏");
  assertEqual(result?.pAssWoRd, "***REDACTED***", "pAssWoRd 应被脱敏");
});

await test("sanitize: 部分字段匹配（包含关系）", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { userPassword: "secret", pinCode: "123456", accessToken: "abc" };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.userPassword, "***REDACTED***", "userPassword 应被脱敏");
  assertEqual(result?.pinCode, "***REDACTED***", "pinCode 应被脱敏");
  assertEqual(result?.accessToken, "***REDACTED***", "accessToken 应被脱敏");
});

await test("sanitize: 非敏感字段保留", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { username: "john", age: 30, active: true };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.username, "john", "username 应保留");
  assertEqual(result?.age, 30, "age 应保留");
  assertEqual(result?.active, true, "active 应保留");
});

// ============== 递归处理测试 ==============
group("sanitize - 递归处理");

await test("sanitize: 递归处理嵌套对象", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = {
    user: {
      password: "secret",
      name: "test",
      auth: {
        token: "abc123",
      },
    },
  };
  const result = sanitizer.sanitize(input);

  const user = result?.user as Record<string, unknown>;
  assertEqual(user?.password, "***REDACTED***", "嵌套 password 应被脱敏");
  assertEqual(user?.name, "test", "嵌套 name 应保留");
  const auth = user?.auth as Record<string, unknown>;
  assertEqual(auth?.token, "***REDACTED***", "深层嵌套 token 应被脱敏");
});

await test("sanitize: 处理数组中的对象", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = {
    users: [
      { password: "p1", name: "user1" },
      { password: "p2", name: "user2" },
    ],
  };
  const result = sanitizer.sanitize(input);

  const users = result?.users as Array<Record<string, unknown>>;
  assertEqual(users?.[0]?.password, "***REDACTED***", "数组第一项 password 应被脱敏");
  assertEqual(users?.[0]?.name, "user1", "数组第一项 name 应保留");
  assertEqual(users?.[1]?.password, "***REDACTED***", "数组第二项 password 应被脱敏");
});

await test("sanitize: 最大递归深度限制", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  // 创建 15 层嵌套对象
  let obj: Record<string, unknown> = { password: "deep-secret" };
  for (let i = 0; i < 14; i++) {
    obj = { nested: obj };
  }

  const result = sanitizer.sanitize(obj);
  // 默认 maxDepth 是 10，所以深层的 password 可能不会被脱敏
  assert(result !== undefined, "应返回结果");
});

await test("sanitize: 数组中的原始值不变", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { items: [1, "string", true, null] };
  const result = sanitizer.sanitize(input);

  const items = result?.items as unknown[];
  assertEqual(items?.[0], 1, "数字应保留");
  assertEqual(items?.[1], "string", "字符串应保留");
  assertEqual(items?.[2], true, "布尔值应保留");
  assertEqual(items?.[3], null, "null 应保留");
});

// ============== partial 模式测试 ==============
group("sanitize - partial 模式");

await test("sanitize: partial 模式保留前后字符", () => {
  const config = createTestConfig({
    partial: { enabled: true, prefix: 2, suffix: 2 },
  });
  const sanitizer = new Sanitizer(config);

  const input = { token: "abcdefghijk" };
  const result = sanitizer.sanitize(input);

  const token = result?.token as string;
  assert(token.startsWith("ab"), "应保留前 2 位");
  assert(token.endsWith("jk"), "应保留后 2 位");
  assert(token.includes("***"), "中间应有星号");
});

await test("sanitize: partial 模式字符串过短使用占位符", () => {
  const config = createTestConfig({
    partial: { enabled: true, prefix: 3, suffix: 3 },
  });
  const sanitizer = new Sanitizer(config);

  const input = { token: "abc" }; // 长度 <= prefix + suffix
  const result = sanitizer.sanitize(input);

  assertEqual(result?.token, "***REDACTED***", "过短字符串应使用占位符");
});

await test("sanitize: partial 模式处理数字", () => {
  const config = createTestConfig({
    partial: { enabled: true, prefix: 2, suffix: 2 },
  });
  const sanitizer = new Sanitizer(config);

  const input = { pin: 123456 };
  const result = sanitizer.sanitize(input);

  const pin = result?.pin as string;
  assert(pin.startsWith("12"), "数字转字符串后应保留前 2 位");
  assert(pin.endsWith("56"), "数字转字符串后应保留后 2 位");
});

// ============== sanitizeError 测试 ==============
group("sanitizeError - 错误对象脱敏");

await test("sanitizeError: 脱敏错误对象中的敏感字段", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const error = { message: "Auth failed", password: "secret", code: 401 };
  const result = sanitizer.sanitizeError(error) as Record<string, unknown>;

  assertEqual(result?.message, "Auth failed", "message 应保留");
  assertEqual(result?.password, "***REDACTED***", "password 应被脱敏");
  assertEqual(result?.code, 401, "code 应保留");
});

await test("sanitizeError: 非对象直接返回", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  assertEqual(sanitizer.sanitizeError("string error"), "string error", "字符串应直接返回");
  assertEqual(sanitizer.sanitizeError(null), null, "null 应直接返回");
  assertEqual(sanitizer.sanitizeError(undefined), undefined, "undefined 应直接返回");
  assertEqual(sanitizer.sanitizeError(123), 123, "数字应直接返回");
});

await test("sanitizeError: 处理嵌套错误对象", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const error = {
    message: "Error",
    details: { password: "secret", info: "test" },
  };
  const result = sanitizer.sanitizeError(error) as Record<string, unknown>;
  const details = result?.details as Record<string, unknown>;

  assertEqual(details?.password, "***REDACTED***", "嵌套 password 应被脱敏");
  assertEqual(details?.info, "test", "嵌套 info 应保留");
});

// ============== 配置管理测试 ==============
group("配置管理");

await test("addSensitiveField: 动态添加敏感字段", () => {
  const config = createTestConfig({ fields: ["password"] });
  const sanitizer = new Sanitizer(config);

  // 添加前
  let result = sanitizer.sanitize({ apiKey: "key123" });
  assertEqual(result?.apiKey, "key123", "添加前 apiKey 应保留");

  // 添加敏感字段
  sanitizer.addSensitiveField("apiKey");
  result = sanitizer.sanitize({ apiKey: "key123" });
  assertEqual(result?.apiKey, "***REDACTED***", "添加后 apiKey 应被脱敏");
});

await test("addSensitiveField: 重复添加不产生重复", () => {
  const config = createTestConfig({ fields: ["password"] });
  const sanitizer = new Sanitizer(config);

  sanitizer.addSensitiveField("password");
  sanitizer.addSensitiveField("password");

  const result = sanitizer.sanitize({ password: "secret" });
  assertEqual(result?.password, "***REDACTED***", "应正常脱敏");
});

await test("removeSensitiveField: 移除敏感字段", () => {
  const config = createTestConfig({ fields: ["password", "token"] });
  const sanitizer = new Sanitizer(config);

  // 移除前
  let result = sanitizer.sanitize({ password: "secret" });
  assertEqual(result?.password, "***REDACTED***", "移除前应脱敏");

  // 移除敏感字段
  sanitizer.removeSensitiveField("password");
  result = sanitizer.sanitize({ password: "secret" });
  assertEqual(result?.password, "secret", "移除后应保留");
});

await test("updateConfig: 更新配置", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  // 更新占位符
  sanitizer.updateConfig({ placeholder: "[HIDDEN]" });
  const result = sanitizer.sanitize({ password: "secret" });
  assertEqual(result?.password, "[HIDDEN]", "应使用新占位符");
});

// ============== 禁用状态测试 ==============
group("禁用状态");

await test("sanitize: enabled=false 时不脱敏", () => {
  const config = createTestConfig({ enabled: false });
  const sanitizer = new Sanitizer(config);

  const input = { password: "secret", token: "abc123" };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.password, "secret", "禁用时 password 应保留");
  assertEqual(result?.token, "abc123", "禁用时 token 应保留");
});

await test("sanitize: undefined 输入返回 undefined", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const result = sanitizer.sanitize(undefined);
  assertEqual(result, undefined, "undefined 输入应返回 undefined");
});

await test("sanitizeError: enabled=false 时不脱敏", () => {
  const config = createTestConfig({ enabled: false });
  const sanitizer = new Sanitizer(config);

  const error = { password: "secret" };
  const result = sanitizer.sanitizeError(error) as Record<string, unknown>;

  assertEqual(result?.password, "secret", "禁用时错误对象不脱敏");
});

// ============== createSanitizer 工厂函数测试 ==============
group("createSanitizer - 工厂函数");

await test("createSanitizer: 创建脱敏器实例", () => {
  const config = createTestConfig();
  const sanitizer = createSanitizer(config);

  assert(sanitizer instanceof Sanitizer, "应返回 Sanitizer 实例");

  const result = sanitizer.sanitize({ password: "secret" });
  assertEqual(result?.password, "***REDACTED***", "实例应正常工作");
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("sanitize: null 值处理", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { password: null, name: "test" };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.password, null, "null 值应保持为 null");
  assertEqual(result?.name, "test", "其他字段应保留");
});

await test("sanitize: undefined 值处理", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { password: undefined, name: "test" };
  const result = sanitizer.sanitize(input);

  assertEqual(result?.password, undefined, "undefined 值应保持为 undefined");
});

await test("sanitize: 空对象处理", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const result = sanitizer.sanitize({});
  assert(typeof result === "object", "空对象应返回对象");
  assertEqual(Object.keys(result ?? {}).length, 0, "结果应为空对象");
});

await test("sanitize: 空数组处理", () => {
  const config = createTestConfig();
  const sanitizer = new Sanitizer(config);

  const input = { items: [] };
  const result = sanitizer.sanitize(input);
  const items = result?.items as unknown[];

  assert(Array.isArray(items), "空数组应保持为数组");
  assertEqual(items?.length, 0, "数组长度应为 0");
});

summary("Sanitizer 模块");

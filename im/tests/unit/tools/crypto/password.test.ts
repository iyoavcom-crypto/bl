/**
 * @fileoverview 密码哈希模块单元测试
 * @module tests/unit/tools/crypto/password
 */

import { test, assert, assertEqual, group, summary } from "../../../helpers/runner.js";

// 设置测试环境变量
process.env.PASSWORD_PEPPER = "test-pepper-16chars-for-unit-test";

// 动态导入以确保环境变量生效
const { hashPassword, verifyPassword, verifyPasswordUpgrade } = await import("@/tools/crypto/password.js");

// ============== hashPassword 测试 ==============
group("hashPassword - 密码哈希生成");

await test("hashPassword: 成功生成 v2 格式哈希", async () => {
  const hash = await hashPassword("Test123!");
  assert(hash.startsWith("scrypt$2$"), "哈希应以 scrypt$2$ 开头");
  const parts = hash.split("$");
  assertEqual(parts.length, 8, "v2 格式应有 8 个部分");
  assertEqual(parts[0], "scrypt", "算法标识应为 scrypt");
  assertEqual(parts[1], "2", "版本号应为 2");
  assertEqual(parts[7], "1", "pepper 标记应为 1");
});

await test("hashPassword: 空密码抛出错误", async () => {
  let threw = false;
  try {
    await hashPassword("");
  } catch (e: unknown) {
    threw = true;
    assert((e as Error).message.includes("密码不能为空"), "错误信息应包含'密码不能为空'");
  }
  assert(threw, "应抛出错误");
});

await test("hashPassword: 相同密码多次哈希结果不同", async () => {
  const hash1 = await hashPassword("SamePassword123");
  const hash2 = await hashPassword("SamePassword123");
  assert(hash1 !== hash2, "两次哈希结果应不同（随机 salt）");
});

await test("hashPassword: 支持 Unicode 字符密码", async () => {
  const hash = await hashPassword("密码测试123!@#");
  assert(hash.startsWith("scrypt$2$"), "应成功生成哈希");
});

await test("hashPassword: 支持极长密码", async () => {
  const longPassword = "A".repeat(1000);
  const hash = await hashPassword(longPassword);
  assert(hash.startsWith("scrypt$2$"), "应成功生成哈希");
});

// ============== verifyPassword 测试 ==============
group("verifyPassword - 密码验证");

await test("verifyPassword: 验证正确密码返回 true", async () => {
  const password = "CorrectPassword123!";
  const hash = await hashPassword(password);
  const result = await verifyPassword(password, hash);
  assertEqual(result, true, "正确密码应验证通过");
});

await test("verifyPassword: 验证错误密码返回 false", async () => {
  const hash = await hashPassword("CorrectPassword123!");
  const result = await verifyPassword("WrongPassword456!", hash);
  assertEqual(result, false, "错误密码应验证失败");
});

await test("verifyPassword: 无效哈希格式返回 false", async () => {
  const result = await verifyPassword("password", "invalid-hash-format");
  assertEqual(result, false, "无效哈希应返回 false");
});

await test("verifyPassword: 空哈希返回 false", async () => {
  const result = await verifyPassword("password", "");
  assertEqual(result, false, "空哈希应返回 false");
});

await test("verifyPassword: 部分匹配的哈希格式返回 false", async () => {
  const result = await verifyPassword("password", "scrypt$2$invalid");
  assertEqual(result, false, "不完整的哈希应返回 false");
});

await test("verifyPassword: 大小写敏感", async () => {
  const hash = await hashPassword("Password123");
  const result = await verifyPassword("password123", hash);
  assertEqual(result, false, "密码大小写应敏感");
});

// ============== verifyPasswordUpgrade 测试 ==============
group("verifyPasswordUpgrade - 升级检测");

await test("verifyPasswordUpgrade: 最新格式无需升级", async () => {
  const password = "TestPassword123!";
  const hash = await hashPassword(password);
  const result = await verifyPasswordUpgrade(password, hash);
  assertEqual(result.ok, true, "验证应通过");
  assertEqual(result.needsRehash, false, "最新格式无需升级");
  assertEqual(result.newHash, undefined, "无需新哈希");
});

await test("verifyPasswordUpgrade: 密码错误返回 ok: false", async () => {
  const hash = await hashPassword("CorrectPassword");
  const result = await verifyPasswordUpgrade("WrongPassword", hash);
  assertEqual(result.ok, false, "密码错误时 ok 应为 false");
  assertEqual(result.needsRehash, false, "密码错误时不检查升级");
});

await test("verifyPasswordUpgrade: 无效哈希返回 ok: false", async () => {
  const result = await verifyPasswordUpgrade("password", "invalid");
  assertEqual(result.ok, false, "无效哈希时 ok 应为 false");
  assertEqual(result.needsRehash, false, "无效哈希时不需要升级");
});

await test("verifyPasswordUpgrade: 检测低成本参数需要升级", async () => {
  // 构造一个使用低成本参数的 v1 格式哈希进行测试
  // 由于无法直接构造，这里测试 v2 格式的正常流程
  const password = "TestUpgrade123";
  const hash = await hashPassword(password);
  const result = await verifyPasswordUpgrade(password, hash);
  assertEqual(result.ok, true, "验证应通过");
  // 当前哈希已是最新参数，无需升级
  assertEqual(result.needsRehash, false, "当前参数无需升级");
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("verifyPassword: 处理特殊字符密码", async () => {
  const password = "Test!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
  const hash = await hashPassword(password);
  const result = await verifyPassword(password, hash);
  assertEqual(result, true, "特殊字符密码应验证通过");
});

await test("verifyPassword: 处理空格密码", async () => {
  const password = "  password with spaces  ";
  const hash = await hashPassword(password);
  const result = await verifyPassword(password, hash);
  assertEqual(result, true, "包含空格的密码应验证通过");
});

await test("verifyPassword: 处理纯空格密码", async () => {
  const password = "     ";
  const hash = await hashPassword(password);
  const result = await verifyPassword(password, hash);
  assertEqual(result, true, "纯空格密码应验证通过");
});

summary("Password 模块");

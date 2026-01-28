/**
 * @fileoverview PIN 加密模块单元测试
 * @module tests/unit/tools/crypto/pin
 */

import { test, assert, assertEqual, group, summary } from "../../../helpers/runner.js";
import { assertPin6, deriveKeyFromSecret, encryptPin, decryptPin } from "@/tools/crypto/pin.js";
import { randomBytes } from "node:crypto";

const TEST_SECRET = "test-secret-16chars-for-pin-test";

// ============== assertPin6 测试 ==============
group("assertPin6 - PIN 格式验证");

await test("assertPin6: 合法 6 位 PIN 通过验证", () => {
  // 不抛出错误即为通过
  assertPin6("123456");
  assertPin6("000000");
  assertPin6("999999");
  assert(true, "合法 PIN 应通过验证");
});

await test("assertPin6: 5 位数字抛出错误", () => {
  let threw = false;
  try {
    assertPin6("12345");
  } catch (e: unknown) {
    threw = true;
    assert((e as Error).message.includes("6位数"), "错误信息应包含'6位数'");
  }
  assert(threw, "应抛出错误");
});

await test("assertPin6: 7 位数字抛出错误", () => {
  let threw = false;
  try {
    assertPin6("1234567");
  } catch (e: unknown) {
    threw = true;
  }
  assert(threw, "应抛出错误");
});

await test("assertPin6: 包含字母抛出错误", () => {
  let threw = false;
  try {
    assertPin6("12345a");
  } catch (e: unknown) {
    threw = true;
  }
  assert(threw, "应抛出错误");
});

await test("assertPin6: 纯字母抛出错误", () => {
  let threw = false;
  try {
    assertPin6("abcdef");
  } catch (e: unknown) {
    threw = true;
  }
  assert(threw, "应抛出错误");
});

await test("assertPin6: 空字符串抛出错误", () => {
  let threw = false;
  try {
    assertPin6("");
  } catch (e: unknown) {
    threw = true;
  }
  assert(threw, "应抛出错误");
});

await test("assertPin6: 包含空格抛出错误", () => {
  let threw = false;
  try {
    assertPin6("123 56");
  } catch (e: unknown) {
    threw = true;
  }
  assert(threw, "应抛出错误");
});

// ============== deriveKeyFromSecret 测试 ==============
group("deriveKeyFromSecret - 密钥派生");

await test("deriveKeyFromSecret: 成功派生 32 字节密钥", async () => {
  const salt = randomBytes(16);
  const key = await deriveKeyFromSecret(TEST_SECRET, salt);
  assertEqual(key.key.length, 32, "密钥长度应为 32 字节");
  assertEqual(key.kid, "env:PIN_SECRET", "默认 kid 应为 env:PIN_SECRET");
});

await test("deriveKeyFromSecret: 自定义 kid", async () => {
  const salt = randomBytes(16);
  const key = await deriveKeyFromSecret(TEST_SECRET, salt, "custom-kid");
  assertEqual(key.kid, "custom-kid", "kid 应为自定义值");
});

await test("deriveKeyFromSecret: secret 过短抛出错误", async () => {
  let threw = false;
  const salt = randomBytes(16);
  try {
    await deriveKeyFromSecret("short", salt);
  } catch (e: unknown) {
    threw = true;
    assert((e as Error).message.includes("长度不足"), "错误信息应包含'长度不足'");
  }
  assert(threw, "应抛出错误");
});

await test("deriveKeyFromSecret: salt 长度不正确抛出错误", async () => {
  let threw = false;
  const wrongSalt = randomBytes(15); // 错误长度
  try {
    await deriveKeyFromSecret(TEST_SECRET, wrongSalt);
  } catch (e: unknown) {
    threw = true;
    assert((e as Error).message.includes("16 字节"), "错误信息应包含'16 字节'");
  }
  assert(threw, "应抛出错误");
});

await test("deriveKeyFromSecret: 相同输入产生相同密钥", async () => {
  const salt = randomBytes(16);
  const key1 = await deriveKeyFromSecret(TEST_SECRET, salt);
  const key2 = await deriveKeyFromSecret(TEST_SECRET, salt);
  assert(key1.key.equals(key2.key), "相同输入应产生相同密钥");
});

await test("deriveKeyFromSecret: 不同 salt 产生不同密钥", async () => {
  const salt1 = randomBytes(16);
  const salt2 = randomBytes(16);
  const key1 = await deriveKeyFromSecret(TEST_SECRET, salt1);
  const key2 = await deriveKeyFromSecret(TEST_SECRET, salt2);
  assert(!key1.key.equals(key2.key), "不同 salt 应产生不同密钥");
});

// ============== encryptPin 测试 ==============
group("encryptPin - PIN 加密");

await test("encryptPin: 成功加密返回 JSON 字符串", async () => {
  const encrypted = await encryptPin("123456", TEST_SECRET);
  const parsed = JSON.parse(encrypted);
  assertEqual(parsed.v, 2, "版本号应为 2");
  assert(typeof parsed.salt === "string", "应包含 salt");
  assert(typeof parsed.payload === "object", "应包含 payload");
  assert(typeof parsed.payload.iv === "string", "payload 应包含 iv");
  assert(typeof parsed.payload.ct === "string", "payload 应包含 ct");
  assert(typeof parsed.payload.tag === "string", "payload 应包含 tag");
});

await test("encryptPin: 非法 PIN 抛出错误", async () => {
  let threw = false;
  try {
    await encryptPin("12345", TEST_SECRET);
  } catch {
    threw = true;
  }
  assert(threw, "非法 PIN 应抛出错误");
});

await test("encryptPin: 相同 PIN 多次加密结果不同", async () => {
  const encrypted1 = await encryptPin("123456", TEST_SECRET);
  const encrypted2 = await encryptPin("123456", TEST_SECRET);
  assert(encrypted1 !== encrypted2, "两次加密结果应不同（随机 salt 和 iv）");
});

await test("encryptPin: secret 过短抛出错误", async () => {
  let threw = false;
  try {
    await encryptPin("123456", "short");
  } catch {
    threw = true;
  }
  assert(threw, "secret 过短应抛出错误");
});

// ============== decryptPin 测试 ==============
group("decryptPin - PIN 解密");

await test("decryptPin: 成功解密返回原始 PIN", async () => {
  const pin = "123456";
  const encrypted = await encryptPin(pin, TEST_SECRET);
  const decrypted = await decryptPin(encrypted, TEST_SECRET);
  assertEqual(decrypted, pin, "解密结果应与原始 PIN 相同");
});

await test("decryptPin: 解密各种合法 PIN", async () => {
  const pins = ["000000", "999999", "123456", "654321"];
  for (const pin of pins) {
    const encrypted = await encryptPin(pin, TEST_SECRET);
    const decrypted = await decryptPin(encrypted, TEST_SECRET);
    assertEqual(decrypted, pin, `PIN ${pin} 解密结果应正确`);
  }
});

await test("decryptPin: 错误密钥解密失败", async () => {
  const encrypted = await encryptPin("123456", TEST_SECRET);
  let threw = false;
  try {
    await decryptPin(encrypted, "wrong-secret-16chars-different!");
  } catch {
    threw = true;
  }
  assert(threw, "错误密钥应导致解密失败");
});

await test("decryptPin: 无效 JSON 抛出错误", async () => {
  let threw = false;
  try {
    await decryptPin("not-json", TEST_SECRET);
  } catch {
    threw = true;
  }
  assert(threw, "无效 JSON 应抛出错误");
});

await test("decryptPin: v1 格式不支持", async () => {
  const v1Payload = JSON.stringify({ v: 1, ct: "test" });
  let threw = false;
  try {
    await decryptPin(v1Payload, TEST_SECRET);
  } catch (e: unknown) {
    threw = true;
    assert((e as Error).message.includes("不支持"), "错误信息应包含'不支持'");
  }
  assert(threw, "v1 格式应抛出错误");
});

await test("decryptPin: 篡改密文解密失败", async () => {
  const encrypted = await encryptPin("123456", TEST_SECRET);
  const parsed = JSON.parse(encrypted);
  parsed.payload.ct = "tampered-ciphertext";
  const tampered = JSON.stringify(parsed);
  let threw = false;
  try {
    await decryptPin(tampered, TEST_SECRET);
  } catch {
    threw = true;
  }
  assert(threw, "篡改密文应导致解密失败");
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("encryptPin/decryptPin: 连续加密解密一致性", async () => {
  const pin = "567890";
  for (let i = 0; i < 5; i++) {
    const encrypted = await encryptPin(pin, TEST_SECRET);
    const decrypted = await decryptPin(encrypted, TEST_SECRET);
    assertEqual(decrypted, pin, `第 ${i + 1} 次加密解密应一致`);
  }
});

await test("deriveKeyFromSecret: 空字符串 secret 抛出错误", async () => {
  let threw = false;
  const salt = randomBytes(16);
  try {
    await deriveKeyFromSecret("", salt);
  } catch {
    threw = true;
  }
  assert(threw, "空 secret 应抛出错误");
});

await test("deriveKeyFromSecret: 纯空格 secret 抛出错误", async () => {
  let threw = false;
  const salt = randomBytes(16);
  try {
    await deriveKeyFromSecret("               ", salt);
  } catch {
    threw = true;
  }
  assert(threw, "纯空格 secret 应抛出错误");
});

summary("PIN 模块");

/**
 * @fileoverview AES-256-GCM 加密模块单元测试
 * @module tests/unit/tools/crypto/aesgcm
 */

import { test, assert, assertEqual, group, summary } from "../../../helpers/runner.js";
import { encrypt, decrypt, safeKidEqual, type SymmetricKey, type AesGcmPayload } from "@/tools/crypto/aesgcm.js";
import { randomBytes } from "node:crypto";

/**
 * 创建测试用对称密钥
 */
function createTestKey(kid: string = "test-key"): SymmetricKey {
  return {
    kid,
    key: randomBytes(32),
  };
}

// ============== encrypt 测试 ==============
group("encrypt - AES-256-GCM 加密");

await test("encrypt: 成功加密返回完整载荷", () => {
  const key = createTestKey();
  const plain = Buffer.from("Hello, World!");
  const payload = encrypt(plain, key);

  assertEqual(payload.v, 1, "版本号应为 1");
  assertEqual(payload.alg, "AES-256-GCM", "算法应为 AES-256-GCM");
  assertEqual(payload.kid, key.kid, "kid 应与密钥一致");
  assert(typeof payload.iv === "string", "应包含 iv");
  assert(typeof payload.tag === "string", "应包含 tag");
  assert(typeof payload.ct === "string", "应包含 ct");
});

await test("encrypt: iv 为 12 字节 base64url", () => {
  const key = createTestKey();
  const plain = Buffer.from("Test");
  const payload = encrypt(plain, key);

  const ivBuffer = Buffer.from(payload.iv, "base64url");
  assertEqual(ivBuffer.length, 12, "iv 应为 12 字节");
});

await test("encrypt: tag 为 16 字节 base64url", () => {
  const key = createTestKey();
  const plain = Buffer.from("Test");
  const payload = encrypt(plain, key);

  const tagBuffer = Buffer.from(payload.tag, "base64url");
  assertEqual(tagBuffer.length, 16, "tag 应为 16 字节");
});

await test("encrypt: 带 AAD 加密", () => {
  const key = createTestKey();
  const plain = Buffer.from("Sensitive data");
  const aad = Buffer.from("additional authenticated data");
  const payload = encrypt(plain, key, aad);

  assert(payload.aad !== undefined, "应包含 aad");
  assertEqual(payload.aad, aad.toString("base64url"), "aad 应正确编码");
});

await test("encrypt: 相同明文多次加密 IV 不同", () => {
  const key = createTestKey();
  const plain = Buffer.from("Same plaintext");

  const payload1 = encrypt(plain, key);
  const payload2 = encrypt(plain, key);
  const payload3 = encrypt(plain, key);

  assert(payload1.iv !== payload2.iv, "iv 1 和 2 应不同");
  assert(payload2.iv !== payload3.iv, "iv 2 和 3 应不同");
  assert(payload1.iv !== payload3.iv, "iv 1 和 3 应不同");
});

await test("encrypt: 空 Buffer 加密", () => {
  const key = createTestKey();
  const plain = Buffer.alloc(0);
  const payload = encrypt(plain, key);

  assertEqual(payload.v, 1, "版本号应为 1");
  assert(typeof payload.ct === "string", "应包含 ct");
});

await test("encrypt: 大数据加密", () => {
  const key = createTestKey();
  const plain = randomBytes(1024 * 100); // 100KB
  const payload = encrypt(plain, key);

  assertEqual(payload.v, 1, "版本号应为 1");
  assert(payload.ct.length > 0, "密文不应为空");
});

// ============== decrypt 测试 ==============
group("decrypt - AES-256-GCM 解密");

await test("decrypt: 成功解密返回原始明文", () => {
  const key = createTestKey();
  const plain = Buffer.from("Hello, World!");
  const payload = encrypt(plain, key);
  const decrypted = decrypt(payload, key);

  assert(decrypted.equals(plain), "解密结果应与原文相同");
});

await test("decrypt: 解密带 AAD 的密文", () => {
  const key = createTestKey();
  const plain = Buffer.from("Sensitive data");
  const aad = Buffer.from("additional authenticated data");
  const payload = encrypt(plain, key, aad);
  const decrypted = decrypt(payload, key);

  assert(decrypted.equals(plain), "解密结果应与原文相同");
});

await test("decrypt: AAD 不匹配解密失败", () => {
  const key = createTestKey();
  const plain = Buffer.from("Test data");
  const aad = Buffer.from("original aad");
  const payload = encrypt(plain, key, aad);

  // 修改 AAD
  payload.aad = Buffer.from("tampered aad").toString("base64url");

  let threw = false;
  try {
    decrypt(payload, key);
  } catch {
    threw = true;
  }
  assert(threw, "AAD 不匹配应导致解密失败");
});

await test("decrypt: tag 被篡改解密失败", () => {
  const key = createTestKey();
  const plain = Buffer.from("Test data");
  const payload = encrypt(plain, key);

  // 篡改 tag
  const tagBuffer = Buffer.from(payload.tag, "base64url");
  tagBuffer[0] ^= 0xFF;
  payload.tag = tagBuffer.toString("base64url");

  let threw = false;
  try {
    decrypt(payload, key);
  } catch {
    threw = true;
  }
  assert(threw, "tag 被篡改应导致解密失败");
});

await test("decrypt: 密文被篡改解密失败", () => {
  const key = createTestKey();
  const plain = Buffer.from("Test data");
  const payload = encrypt(plain, key);

  // 篡改密文
  const ctBuffer = Buffer.from(payload.ct, "base64url");
  if (ctBuffer.length > 0) {
    ctBuffer[0] ^= 0xFF;
    payload.ct = ctBuffer.toString("base64url");
  }

  let threw = false;
  try {
    decrypt(payload, key);
  } catch {
    threw = true;
  }
  assert(threw, "密文被篡改应导致解密失败");
});

await test("decrypt: 错误密钥解密失败", () => {
  const key1 = createTestKey("key1");
  const key2 = createTestKey("key2");
  const plain = Buffer.from("Test data");
  const payload = encrypt(plain, key1);

  let threw = false;
  try {
    decrypt(payload, key2);
  } catch {
    threw = true;
  }
  assert(threw, "错误密钥应导致解密失败");
});

await test("decrypt: 空 Buffer 解密", () => {
  const key = createTestKey();
  const plain = Buffer.alloc(0);
  const payload = encrypt(plain, key);
  const decrypted = decrypt(payload, key);

  assertEqual(decrypted.length, 0, "解密结果应为空 Buffer");
});

await test("decrypt: 大数据解密", () => {
  const key = createTestKey();
  const plain = randomBytes(1024 * 100); // 100KB
  const payload = encrypt(plain, key);
  const decrypted = decrypt(payload, key);

  assert(decrypted.equals(plain), "大数据解密结果应与原文相同");
});

// ============== safeKidEqual 测试 ==============
group("safeKidEqual - 常量时间比较");

await test("safeKidEqual: 相同 kid 返回 true", () => {
  const result = safeKidEqual("key123", "key123");
  assertEqual(result, true, "相同 kid 应返回 true");
});

await test("safeKidEqual: 不同 kid 返回 false", () => {
  const result = safeKidEqual("key123", "key456");
  assertEqual(result, false, "不同 kid 应返回 false");
});

await test("safeKidEqual: 不同长度返回 false", () => {
  const result = safeKidEqual("key", "key123");
  assertEqual(result, false, "不同长度应返回 false");
});

await test("safeKidEqual: 空字符串比较", () => {
  const result1 = safeKidEqual("", "");
  const result2 = safeKidEqual("", "a");
  const result3 = safeKidEqual("a", "");

  assertEqual(result1, true, "两个空字符串应相等");
  assertEqual(result2, false, "空与非空应不相等");
  assertEqual(result3, false, "非空与空应不相等");
});

await test("safeKidEqual: Unicode 字符比较", () => {
  const result1 = safeKidEqual("密钥123", "密钥123");
  const result2 = safeKidEqual("密钥123", "密钥456");

  assertEqual(result1, true, "相同 Unicode 应相等");
  assertEqual(result2, false, "不同 Unicode 应不相等");
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("encrypt/decrypt: 二进制数据完整性", () => {
  const key = createTestKey();
  const plain = Buffer.from([0x00, 0xFF, 0x7F, 0x80, 0x01, 0xFE]);
  const payload = encrypt(plain, key);
  const decrypted = decrypt(payload, key);

  assert(decrypted.equals(plain), "二进制数据应完整保留");
});

await test("encrypt/decrypt: 连续加密解密", () => {
  const key = createTestKey();

  for (let i = 0; i < 10; i++) {
    const plain = Buffer.from(`Message ${i}`);
    const payload = encrypt(plain, key);
    const decrypted = decrypt(payload, key);
    assert(decrypted.equals(plain), `第 ${i + 1} 次加密解密应正确`);
  }
});

await test("decrypt: iv 被篡改解密失败", () => {
  const key = createTestKey();
  const plain = Buffer.from("Test data");
  const payload = encrypt(plain, key);

  // 篡改 iv
  const ivBuffer = Buffer.from(payload.iv, "base64url");
  ivBuffer[0] ^= 0xFF;
  payload.iv = ivBuffer.toString("base64url");

  let threw = false;
  try {
    decrypt(payload, key);
  } catch {
    threw = true;
  }
  assert(threw, "iv 被篡改应导致解密失败");
});

summary("AES-GCM 模块");

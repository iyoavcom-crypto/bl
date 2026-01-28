/**
 * @fileoverview 二维码生成模块单元测试
 * @module tests/unit/tools/qr/qr
 */

import { test, assert, assertEqual, group, summary } from "../../../helpers/runner.js";
import { generateQRCodeBuffer } from "@/tools/qr/generateBuffer.js";
import { generateQRCodeBase64 } from "@/tools/qr/generateBase64.js";
import { generateQRCodeFile } from "@/tools/qr/generateFile.js";
import { existsSync, unlinkSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// PNG 文件签名: 89 50 4E 47 0D 0A 1A 0A
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

/**
 * 验证 Buffer 是否为 PNG 格式
 */
function isPngBuffer(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;
  return buffer.subarray(0, 8).equals(PNG_SIGNATURE);
}

/**
 * 清理测试文件
 */
function cleanupFile(filepath: string): void {
  try {
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  } catch {
    // 忽略清理错误
  }
}

// ============== generateQRCodeBuffer 测试 ==============
group("generateQRCodeBuffer - Buffer 生成");

await test("generateQRCodeBuffer: 数字生成 PNG Buffer", async () => {
  const buffer = await generateQRCodeBuffer(123456);

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(buffer.length > 0, "Buffer 长度应大于 0");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: 字符串生成 PNG Buffer", async () => {
  const buffer = await generateQRCodeBuffer("https://example.com");

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: 空字符串抛出错误", async () => {
  let threw = false;
  try {
    await generateQRCodeBuffer("");
  } catch {
    threw = true;
  }
  assert(threw, "空字符串应抛出错误");
});

await test("generateQRCodeBuffer: 数字 0 生成 Buffer", async () => {
  const buffer = await generateQRCodeBuffer(0);

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: 负数生成 Buffer", async () => {
  const buffer = await generateQRCodeBuffer(-12345);

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: Unicode 字符串生成 Buffer", async () => {
  const buffer = await generateQRCodeBuffer("测试二维码 123");

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: 特殊字符生成 Buffer", async () => {
  const buffer = await generateQRCodeBuffer("!@#$%^&*()_+-=[]{}|;':\",./<>?");

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: 长字符串生成 Buffer", async () => {
  const longString = "A".repeat(500);
  const buffer = await generateQRCodeBuffer(longString);

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

// ============== generateQRCodeBase64 测试 ==============
group("generateQRCodeBase64 - Base64 生成");

await test("generateQRCodeBase64: 生成 Base64 Data URL", async () => {
  const dataUrl = await generateQRCodeBase64("test-data");

  assert(typeof dataUrl === "string", "应返回字符串");
  assert(dataUrl.startsWith("data:image/png;base64,"), "应以 data:image/png;base64, 开头");
});

await test("generateQRCodeBase64: Base64 可解码为有效图片", async () => {
  const dataUrl = await generateQRCodeBase64("test-data");

  // 提取 base64 部分
  const base64 = dataUrl.replace("data:image/png;base64,", "");
  const buffer = Buffer.from(base64, "base64");

  assert(isPngBuffer(buffer), "解码后应为 PNG 格式");
});

await test("generateQRCodeBase64: 数字生成 Base64", async () => {
  const dataUrl = await generateQRCodeBase64(999999);

  assert(dataUrl.startsWith("data:image/png;base64,"), "应以 data:image/png;base64, 开头");
});

await test("generateQRCodeBase64: 空字符串抛出错误", async () => {
  let threw = false;
  try {
    await generateQRCodeBase64("");
  } catch {
    threw = true;
  }
  assert(threw, "空字符串应抛出错误");
});

await test("generateQRCodeBase64: Unicode 字符串生成 Base64", async () => {
  const dataUrl = await generateQRCodeBase64("中文测试 123");

  assert(dataUrl.startsWith("data:image/png;base64,"), "应以 data:image/png;base64, 开头");
});

await test("generateQRCodeBase64: URL 字符串生成 Base64", async () => {
  const dataUrl = await generateQRCodeBase64("https://example.com/path?query=value&foo=bar");

  assert(dataUrl.startsWith("data:image/png;base64,"), "应以 data:image/png;base64, 开头");
});

// ============== generateQRCodeFile 测试 ==============
group("generateQRCodeFile - 文件生成");

const TEST_FILE_PATH = resolve(process.cwd(), "test-qr-output.png");

await test("generateQRCodeFile: 成功生成文件", async () => {
  // 先清理可能存在的旧文件
  cleanupFile(TEST_FILE_PATH);

  await generateQRCodeFile("test-value", "test-qr-output.png");

  assert(existsSync(TEST_FILE_PATH), "文件应存在");

  // 验证文件是 PNG 格式
  const fileContent = readFileSync(TEST_FILE_PATH);
  assert(isPngBuffer(fileContent), "文件应为 PNG 格式");

  // 清理
  cleanupFile(TEST_FILE_PATH);
});

await test("generateQRCodeFile: 数字生成文件", async () => {
  const testPath = resolve(process.cwd(), "test-qr-number.png");
  cleanupFile(testPath);

  await generateQRCodeFile(123456, "test-qr-number.png");

  assert(existsSync(testPath), "文件应存在");

  const fileContent = readFileSync(testPath);
  assert(isPngBuffer(fileContent), "文件应为 PNG 格式");

  cleanupFile(testPath);
});

await test("generateQRCodeFile: 覆盖已存在的文件", async () => {
  const testPath = resolve(process.cwd(), "test-qr-overwrite.png");
  cleanupFile(testPath);

  // 第一次生成
  await generateQRCodeFile("first-content", "test-qr-overwrite.png");
  assert(existsSync(testPath), "第一次生成文件应存在");

  // 第二次生成（覆盖）
  await generateQRCodeFile("second-content", "test-qr-overwrite.png");
  assert(existsSync(testPath), "覆盖后文件应存在");

  const fileContent = readFileSync(testPath);
  assert(isPngBuffer(fileContent), "覆盖后文件应为 PNG 格式");

  cleanupFile(testPath);
});

await test("generateQRCodeFile: Unicode 内容生成文件", async () => {
  const testPath = resolve(process.cwd(), "test-qr-unicode.png");
  cleanupFile(testPath);

  await generateQRCodeFile("中文内容测试", "test-qr-unicode.png");

  assert(existsSync(testPath), "文件应存在");

  const fileContent = readFileSync(testPath);
  assert(isPngBuffer(fileContent), "文件应为 PNG 格式");

  cleanupFile(testPath);
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("generateQRCodeBuffer: 多次调用结果一致", async () => {
  const buffer1 = await generateQRCodeBuffer("same-content");
  const buffer2 = await generateQRCodeBuffer("same-content");

  // QR 码内容相同，生成的图片应该相同
  assert(buffer1.equals(buffer2), "相同内容多次生成应产生相同结果");
});

await test("generateQRCodeBase64: 多次调用结果一致", async () => {
  const dataUrl1 = await generateQRCodeBase64("same-content");
  const dataUrl2 = await generateQRCodeBase64("same-content");

  assertEqual(dataUrl1, dataUrl2, "相同内容多次生成应产生相同结果");
});

await test("generateQRCodeBuffer: 不同内容产生不同结果", async () => {
  const buffer1 = await generateQRCodeBuffer("content-1");
  const buffer2 = await generateQRCodeBuffer("content-2");

  assert(!buffer1.equals(buffer2), "不同内容应产生不同结果");
});

await test("generateQRCodeBuffer: JSON 字符串生成 Buffer", async () => {
  const json = JSON.stringify({ key: "value", number: 123 });
  const buffer = await generateQRCodeBuffer(json);

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

await test("generateQRCodeBuffer: 最大安全整数生成 Buffer", async () => {
  const buffer = await generateQRCodeBuffer(Number.MAX_SAFE_INTEGER);

  assert(Buffer.isBuffer(buffer), "应返回 Buffer");
  assert(isPngBuffer(buffer), "应为 PNG 格式");
});

summary("QR 模块");

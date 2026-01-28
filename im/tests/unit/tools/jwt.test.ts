/**
 * JWT 模块功能测试
 * 运行: npx tsx tests/unit/tools/jwt.test.ts
 */

import { test, assert, group, summary } from "../../helpers/runner";
import { createJwtPayload } from "../../factories/user";
import {
  JwtService,
  createHSKeyProvider,
  AuthError,
  AuthErrorCode,
  isAuthError,
  Guards,
  ttlToSeconds,
  nowSec,
  nanoid,
  shortId,
} from "@/tools/jwt";
import type { JwtUserPayload } from "@/types/jwt";

async function runTests() {
  console.log("=== JWT 模块测试 ===");

  // 1. 工具函数测试
  group("工具函数");

  await test("ttlToSeconds: 解析 15m", () => {
    assert(ttlToSeconds("15m") === 900, "15m should be 900s");
  });

  await test("ttlToSeconds: 解析 7d", () => {
    assert(ttlToSeconds("7d") === 604800, "7d should be 604800s");
  });

  await test("ttlToSeconds: 解析 1h", () => {
    assert(ttlToSeconds("1h") === 3600, "1h should be 3600s");
  });

  await test("ttlToSeconds: 解析纯数字", () => {
    assert(ttlToSeconds("3600") === 3600, "3600 should be 3600s");
  });

  await test("nowSec: 返回秒级时间戳", () => {
    const now = nowSec();
    assert(typeof now === "number", "should be number");
    assert(now > 1700000000, "should be valid timestamp");
  });

  await test("nanoid: 生成指定长度ID", () => {
    const id = nanoid(16);
    assert(id.length === 16, "should be 16 chars");
  });

  await test("shortId: 生成16字符ID", () => {
    const id = shortId();
    assert(id.length === 16, "should be 16 chars");
  });

  // 2. 密钥提供器测试
  group("密钥提供器");

  const testSecret = "test-secret-key-for-jwt-signing";
  const provider = createHSKeyProvider({ secret: testSecret });

  await test("HSKeyProvider: getActiveKeyAsync 返回密钥", async () => {
    const key = await provider.getActiveKeyAsync();
    assert(key instanceof Uint8Array, "should return Uint8Array");
  });

  await test("HSKeyProvider: getVerifyKeyAsync 返回密钥", async () => {
    const key = await provider.getVerifyKeyAsync();
    assert(key instanceof Uint8Array, "should return Uint8Array");
  });

  // 3. JwtService 测试
  group("JwtService");

  const jwtService = new JwtService(provider, {
    algorithm: "HS256",
    accessTokenTTL: "15m",
    refreshTokenTTL: "7d",
    enableDeviceBinding: false,
    enableRedisBlacklist: false,
  });

  // 使用工厂创建测试数据
  const testPayload: JwtUserPayload = createJwtPayload({
    sub: "user_123",
    vip: true,
    roleId: "ADMIN",
    teamId: "team_001",
    scope: ["read", "write"],
  });

  let accessToken: string;
  let refreshToken: string;

  await test("signAsync: 签发 access token", async () => {
    accessToken = await jwtService.signAsync("access", testPayload);
    assert(typeof accessToken === "string", "should return string");
    assert(accessToken.split(".").length === 3, "should be valid JWT format");
  });

  await test("signAsync: 签发 refresh token", async () => {
    refreshToken = await jwtService.signAsync("refresh", { ...testPayload, tokenType: "refresh" });
    assert(typeof refreshToken === "string", "should return string");
  });

  await test("verifyAsync: 验证有效 token", async () => {
    const payload = await jwtService.verifyAsync(accessToken);
    assert(payload.sub === "user_123", "sub should match");
    assert(payload.roleId === "ADMIN", "roleId should match");
    assert(payload.vip === true, "vip should match");
  });

  await test("verifyAsync: 无效 token 抛出 AuthError", async () => {
    try {
      await jwtService.verifyAsync("invalid.token.here");
      throw new Error("should throw");
    } catch (e) {
      assert(isAuthError(e), "should be AuthError");
      assert((e as AuthError).code === AuthErrorCode.Invalid, "should be Invalid error");
    }
  });

  await test("rotateRefreshAsync: 刷新令牌轮转", async () => {
    const result = await jwtService.rotateRefreshAsync(refreshToken);
    assert(typeof result.access === "string", "should return new access token");
    assert(typeof result.refresh === "string", "should return new refresh token");
    assert(result.payload.sub === "user_123", "payload should preserve sub");
  });

  // 4. 守卫函数测试
  group("守卫函数");

  // 使用工厂创建守卫测试数据
  const guardPayload: JwtUserPayload = createJwtPayload({
    sub: "user_456",
    vip: true,
    roleId: "EDITOR",
    teamId: "team_002",
    scope: ["read", "write"],
    deviceId: "device_001",
  });

  await test("assertUserId: 匹配成功", () => {
    const result = Guards.assertUserId(guardPayload, "user_456");
    assert(result === guardPayload, "should return payload");
  });

  await test("assertUserId: 匹配失败抛出 Forbidden", () => {
    try {
      Guards.assertUserId(guardPayload, "user_999");
      throw new Error("should throw");
    } catch (e) {
      assert(isAuthError(e), "should be AuthError");
      assert((e as AuthError).code === AuthErrorCode.Forbidden, "should be Forbidden");
    }
  });

  await test("assertRole: 角色匹配成功", () => {
    const result = Guards.assertRole(guardPayload, ["ADMIN", "EDITOR"]);
    assert(result === guardPayload, "should return payload");
  });

  await test("assertRole: 角色匹配失败", () => {
    try {
      Guards.assertRole(guardPayload, ["ADMIN", "SUPER"]);
      throw new Error("should throw");
    } catch (e) {
      assert(isAuthError(e), "should be AuthError");
    }
  });

  await test("assertScopes: 作用域匹配成功", () => {
    const result = Guards.assertScopes(guardPayload, ["read"]);
    assert(result === guardPayload, "should return payload");
  });

  await test("assertVip: VIP 验证成功", () => {
    const result = Guards.assertVip(guardPayload);
    assert(result === guardPayload, "should return payload");
  });

  await test("assertVip: 非 VIP 抛出错误", () => {
    try {
      Guards.assertVip({ ...guardPayload, vip: false });
      throw new Error("should throw");
    } catch (e) {
      assert(isAuthError(e), "should be AuthError");
    }
  });

  await test("assertDevice: 设备匹配成功", () => {
    const result = Guards.assertDevice(guardPayload, "device_001", true);
    assert(result === guardPayload, "should return payload");
  });

  await test("assertDevice: 设备不匹配抛出 DeviceMismatch", () => {
    try {
      Guards.assertDevice(guardPayload, "device_999", true);
      throw new Error("should throw");
    } catch (e) {
      assert(isAuthError(e), "should be AuthError");
      assert((e as AuthError).code === AuthErrorCode.DeviceMismatch, "should be DeviceMismatch");
    }
  });

  await test("assertDevice: 禁用时跳过检查", () => {
    const result = Guards.assertDevice(guardPayload, "wrong_device", false);
    assert(result === guardPayload, "should return payload when disabled");
  });

  await test("assertTokenKind: 令牌类型匹配", () => {
    const result = Guards.assertTokenKind(guardPayload, "access");
    assert(result === guardPayload, "should return payload");
  });

  await test("assertTeam: 团队匹配成功", () => {
    const result = Guards.assertTeam(guardPayload, ["team_001", "team_002"]);
    assert(result === guardPayload, "should return payload");
  });

  // 5. AuthError 测试
  group("AuthError");

  await test("AuthError.missingToken: 工厂方法", () => {
    const err = AuthError.missingToken();
    assert(err.code === AuthErrorCode.MissingToken, "should have correct code");
    assert(err.status === 401, "should have 401 status");
  });

  await test("AuthError.toJSON: 序列化", () => {
    const err = AuthError.forbidden({ reason: "test" });
    const json = err.toJSON();
    assert(json.code === AuthErrorCode.Forbidden, "should serialize code");
    assert(json.status === 403, "should serialize status");
  });

  await test("isAuthError: 类型守卫", () => {
    const err = new AuthError(AuthErrorCode.Invalid, "test", 401);
    assert(isAuthError(err) === true, "should return true for AuthError");
    assert(isAuthError(new Error("test")) === false, "should return false for Error");
  });

  summary("JWT 模块");
}

runTests().catch(console.error);

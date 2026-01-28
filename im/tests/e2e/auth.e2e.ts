/**
 * Auth 路由 E2E 测试
 * 运行: npx tsx tests/e2e/auth.e2e.ts
 *
 * 测试路由:
 * - POST /api/auth/register - 用户注册
 * - POST /api/auth/login - 用户登录
 * - POST /api/auth/logout - 用户退出（需认证）
 * - GET /api/auth/me - 获取当前用户（需认证）
 */

import { test, assert, group, summary, reset } from "../helpers/runner.js";
import { createHttpClient, type ApiResponse, type HttpClient } from "../helpers/http.js";
import { startTestServer, stopTestServer, type TestServerContext } from "../helpers/server.js";
import type { AuthSuccessData, SafeUser } from "@/models/auth/index.js";

/** API 业务码 */
const ApiCode = {
  OK: "OK",
  CREATED: "Created",
  BAD_REQUEST: "BadRequest",
  UNAUTHORIZED: "Unauthorized",
} as const;

interface TestContext {
  http: HttpClient;
  server: TestServerContext;
  registeredUser: {
    phone: string;
    password: string;
    pin: string;
  };
  authTokens: {
    access: string;
    refresh: string;
  } | null;
}

const ctx: TestContext = {
  http: null as unknown as HttpClient,
  server: null as unknown as TestServerContext,
  registeredUser: {
    phone: "",
    password: "",
    pin: "",
  },
  authTokens: null,
};

async function runTests(): Promise<void> {
  reset();
  console.log("=== Auth 路由 E2E 测试 ===\n");

  // 启动测试服务器
  console.log("正在启动测试服务器...");
  ctx.server = await startTestServer({ forceSync: true });
  ctx.http = createHttpClient(ctx.server.baseUrl);
  console.log(`测试服务器启动成功: ${ctx.server.baseUrl}\n`);

  // 生成测试用户数据
  const timestamp = Date.now();
  ctx.registeredUser = {
    phone: `138${timestamp.toString().slice(-8)}`,
    password: "Test@123456",
    pin: "123456",
  };

  try {
    // ==================== 注册接口测试 ====================
    group("POST /api/auth/register - 用户注册");

    await test("1.1 注册成功 - 返回用户信息和令牌", async () => {
      const res = await ctx.http.post<ApiResponse<AuthSuccessData>>("/api/auth/register", {
        phone: ctx.registeredUser.phone,
        password: ctx.registeredUser.password,
        pin: ctx.registeredUser.pin,
      });

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.code === ApiCode.CREATED, `期望业务码 ${ApiCode.CREATED}，实际 ${res.data.code}`);
      assert(res.data.data.user !== undefined, "响应应包含 user");
      assert(res.data.data.access !== undefined, "响应应包含 access token");
      assert(res.data.data.refresh !== undefined, "响应应包含 refresh token");
      assert(res.data.data.user.phone === ctx.registeredUser.phone, "用户手机号应匹配");

      // 保存令牌供后续测试使用
      ctx.authTokens = {
        access: res.data.data.access,
        refresh: res.data.data.refresh,
      };
    });

    await test("1.2 注册失败 - 手机号已存在", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        phone: ctx.registeredUser.phone,
        password: ctx.registeredUser.password,
        pin: ctx.registeredUser.pin,
      });

      assert(res.status === 500, `期望状态码 500，实际 ${res.status}`);
    });

    await test("1.3 注册失败 - 缺少必填字段（手机号）", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        password: "Test@123456",
        pin: "123456",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    await test("1.4 注册失败 - 缺少必填字段（密码）", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        phone: "13800000002",
        pin: "123456",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    await test("1.5 注册失败 - 缺少必填字段（二级密码）", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        phone: "13800000003",
        password: "Test@123456",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    await test("1.6 注册失败 - 手机号格式错误", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        phone: "abc123",
        password: "Test@123456",
        pin: "123456",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    await test("1.7 注册失败 - 二级密码格式错误（非6位）", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        phone: "13800000004",
        password: "Test@123456",
        pin: "12345",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    await test("1.8 注册失败 - 二级密码格式错误（含非数字）", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/register", {
        phone: "13800000005",
        password: "Test@123456",
        pin: "12345a",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    // ==================== 登录接口测试 ====================
    group("POST /api/auth/login - 用户登录");

    await test("2.1 登录成功 - 返回用户信息和令牌", async () => {
      const res = await ctx.http.post<ApiResponse<AuthSuccessData>>("/api/auth/login", {
        phone: ctx.registeredUser.phone,
        password: ctx.registeredUser.password,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.code === ApiCode.OK, `期望业务码 ${ApiCode.OK}，实际 ${res.data.code}`);
      assert(res.data.data.user !== undefined, "响应应包含 user");
      assert(res.data.data.access !== undefined, "响应应包含 access token");
      assert(res.data.data.refresh !== undefined, "响应应包含 refresh token");

      // 更新令牌
      ctx.authTokens = {
        access: res.data.data.access,
        refresh: res.data.data.refresh,
      };
    });

    await test("2.2 登录失败 - 用户不存在", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/login", {
        phone: "19999999999",
        password: "Test@123456",
      });

      assert(res.status === 500, `期望状态码 500，实际 ${res.status}`);
    });

    await test("2.3 登录失败 - 密码错误", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/login", {
        phone: ctx.registeredUser.phone,
        password: "WrongPassword",
      });

      assert(res.status === 500, `期望状态码 500，实际 ${res.status}`);
    });

    await test("2.4 登录失败 - 缺少手机号", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/login", {
        password: "Test@123456",
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    await test("2.5 登录失败 - 缺少密码", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/login", {
        phone: ctx.registeredUser.phone,
      });

      assert(res.status === 400, `期望状态码 400，实际 ${res.status}`);
    });

    // ==================== 获取当前用户测试 ====================
    group("GET /api/auth/me - 获取当前用户");

    await test("3.1 获取成功 - 返回当前用户信息", async () => {
      assert(ctx.authTokens !== null, "应先完成登录获取令牌");

      const res = await ctx.http.get<ApiResponse<SafeUser>>("/api/auth/me", {
        token: ctx.authTokens!.access,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.code === ApiCode.OK, `期望业务码 ${ApiCode.OK}，实际 ${res.data.code}`);
      assert(res.data.data.phone === ctx.registeredUser.phone, "用户手机号应匹配");
    });

    await test("3.2 获取失败 - 未提供令牌", async () => {
      const res = await ctx.http.get<ApiResponse<null>>("/api/auth/me");

      assert(res.status === 401, `期望状态码 401，实际 ${res.status}`);
    });

    await test("3.3 获取失败 - 无效令牌", async () => {
      const res = await ctx.http.get<ApiResponse<null>>("/api/auth/me", {
        token: "invalid.token.here",
      });

      assert(res.status === 401, `期望状态码 401，实际 ${res.status}`);
    });

    // ==================== 退出登录测试 ====================
    group("POST /api/auth/logout - 用户退出");

    await test("4.1 退出成功", async () => {
      assert(ctx.authTokens !== null, "应先完成登录获取令牌");

      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/logout", null, {
        token: ctx.authTokens!.access,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.code === ApiCode.OK, `期望业务码 ${ApiCode.OK}，实际 ${res.data.code}`);
    });

    await test("4.2 退出失败 - 未提供令牌", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/logout");

      assert(res.status === 401, `期望状态码 401，实际 ${res.status}`);
    });

    await test("4.3 退出失败 - 无效令牌", async () => {
      const res = await ctx.http.post<ApiResponse<null>>("/api/auth/logout", null, {
        token: "invalid.token.here",
      });

      assert(res.status === 401, `期望状态码 401，实际 ${res.status}`);
    });
  } finally {
    // 清理：停止测试服务器
    console.log("\n正在停止测试服务器...");
    await stopTestServer();
    console.log("测试服务器已停止");
  }

  summary("Auth 路由 E2E");
}

runTests().catch((err) => {
  console.error("测试运行失败:", err);
  process.exit(1);
});

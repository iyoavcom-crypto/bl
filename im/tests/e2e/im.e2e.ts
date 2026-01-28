/**
 * IM 模块 E2E 测试
 * 运行: npx tsx tests/e2e/im.e2e.ts
 *
 * 测试模块:
 * - /api/im/devices - 设备管理
 * - /api/im/friends - 好友管理
 * - /api/im/groups - 群组管理
 * - /api/im/conversations - 会话管理
 * - /api/im/messages - 消息管理
 * - /api/im/calls - 通话管理
 */

import { test, assert, group, summary, reset } from "../helpers/runner.js";
import { createHttpClient, type ApiResponse, type HttpClient } from "../helpers/http.js";
import { startTestServer, stopTestServer, type TestServerContext } from "../helpers/server.js";
import type { AuthSuccessData } from "@/models/auth/index.js";

/** API 业务码 */
const ApiCode = {
  OK: "OK",
  CREATED: "Created",
  NO_CONTENT: "NoContent",
} as const;

/** 测试上下文 */
interface TestContext {
  http: HttpClient;
  server: TestServerContext;
  users: {
    user1: { phone: string; password: string; pin: string; token: string; id: string };
    user2: { phone: string; password: string; pin: string; token: string; id: string };
    user3: { phone: string; password: string; pin: string; token: string; id: string };
  };
  data: {
    friendRequestId: string;
    groupId: string;
    conversationId: string;
    messageId: string;
    callId: string;
    deviceId: string;
  };
}

const ctx: TestContext = {
  http: null as unknown as HttpClient,
  server: null as unknown as TestServerContext,
  users: {
    user1: { phone: "", password: "", pin: "", token: "", id: "" },
    user2: { phone: "", password: "", pin: "", token: "", id: "" },
    user3: { phone: "", password: "", pin: "", token: "", id: "" },
  },
  data: {
    friendRequestId: "",
    groupId: "",
    conversationId: "",
    messageId: "",
    callId: "",
    deviceId: "",
  },
};

/**
 * 注册并登录用户，返回 token 和 userId
 */
async function registerAndLogin(
  http: HttpClient,
  phone: string,
  password: string,
  pin: string
): Promise<{ token: string; id: string }> {
  const res = await http.post<ApiResponse<AuthSuccessData>>("/api/auth/register", {
    phone,
    password,
    pin,
  });
  if (res.status !== 201) {
    throw new Error(`注册失败: ${res.status}`);
  }
  return {
    token: res.data.data.access,
    id: res.data.data.user.id,
  };
}

async function runTests(): Promise<void> {
  reset();
  console.log("=== IM 模块 E2E 测试 ===\n");

  // 启动测试服务器
  console.log("正在启动测试服务器...");
  ctx.server = await startTestServer({ forceSync: true });
  ctx.http = createHttpClient(ctx.server.baseUrl);
  console.log(`测试服务器启动成功: ${ctx.server.baseUrl}\n`);

  // 准备测试用户
  const timestamp = Date.now();
  ctx.users.user1 = {
    phone: `138${timestamp.toString().slice(-8)}`,
    password: "Test@123456",
    pin: "123456",
    token: "",
    id: "",
  };
  ctx.users.user2 = {
    phone: `139${timestamp.toString().slice(-8)}`,
    password: "Test@123456",
    pin: "123456",
    token: "",
    id: "",
  };
  ctx.users.user3 = {
    phone: `137${timestamp.toString().slice(-8)}`,
    password: "Test@123456",
    pin: "123456",
    token: "",
    id: "",
  };

  try {
    // ==================== 准备测试用户 ====================
    group("准备测试用户");

    await test("注册 3 个测试用户", async () => {
      const result1 = await registerAndLogin(
        ctx.http,
        ctx.users.user1.phone,
        ctx.users.user1.password,
        ctx.users.user1.pin
      );
      ctx.users.user1.token = result1.token;
      ctx.users.user1.id = result1.id;

      const result2 = await registerAndLogin(
        ctx.http,
        ctx.users.user2.phone,
        ctx.users.user2.password,
        ctx.users.user2.pin
      );
      ctx.users.user2.token = result2.token;
      ctx.users.user2.id = result2.id;

      const result3 = await registerAndLogin(
        ctx.http,
        ctx.users.user3.phone,
        ctx.users.user3.password,
        ctx.users.user3.pin
      );
      ctx.users.user3.token = result3.token;
      ctx.users.user3.id = result3.id;

      assert(ctx.users.user1.id !== "", "用户1应有ID");
      assert(ctx.users.user2.id !== "", "用户2应有ID");
      assert(ctx.users.user3.id !== "", "用户3应有ID");
    });

    // ==================== 用户管理测试 ====================
    group("用户管理 /api/im/users");

    await test("0.1 获取个人资料", async () => {
      const res = await ctx.http.get<ApiResponse<{ id: string; phone: string }>>(
        "/api/im/users/profile",
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.id === ctx.users.user1.id, "用户ID应匹配");
    });

    await test("0.2 更新个人资料", async () => {
      const res = await ctx.http.put<ApiResponse<{ name: string }>>(
        "/api/im/users/profile",
        { name: "测试用户1", gender: "male" },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("0.3 验证二级密码（正确）", async () => {
      const res = await ctx.http.post<ApiResponse<{ valid: boolean }>>(
        "/api/im/users/verify-pin",
        { pin: ctx.users.user1.pin },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.valid === true, "二级密码应验证通过");
    });

    await test("0.4 验证二级密码（错误）", async () => {
      const res = await ctx.http.post<ApiResponse<{ valid: boolean }>>(
        "/api/im/users/verify-pin",
        { pin: "000000" },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.valid === false, "错误的二级密码应验证失败");
    });

    await test("0.5 搜索用户", async () => {
      // 测试手机号搜索
      const resByPhone = await ctx.http.get<ApiResponse<unknown[]>>(
        `/api/im/users/search?keyword=${ctx.users.user2.phone}`,
        { token: ctx.users.user1.token }
      );
      assert(resByPhone.status === 200, `手机号搜索：期望状态码 200，实际 ${resByPhone.status}`);
      assert(Array.isArray(resByPhone.data.data), "手机号搜索：应返回数组");

      // 测试 ID 搜索
      const resById = await ctx.http.get<ApiResponse<Array<{ id: string }>>>(
        `/api/im/users/search?keyword=${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );
      assert(resById.status === 200, `ID搜索：期望状态码 200，实际 ${resById.status}`);
      assert(Array.isArray(resById.data.data), "ID搜索：应返回数组");
      assert(resById.data.data.length > 0, "ID搜索：应找到用户");
      assert(resById.data.data[0].id === ctx.users.user2.id, "ID搜索：返回的用户ID应匹配");
    });

    await test("0.6 获取用户公开信息", async () => {
      const res = await ctx.http.get<ApiResponse<{ id: string }>>(
        `/api/im/users/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.id === ctx.users.user2.id, "用户ID应匹配");
    });

    // ==================== 在线状态测试 ====================
    group("在线状态 /api/im/presence");

    await test("0.7 检查用户是否在线", async () => {
      const res = await ctx.http.get<ApiResponse<{ userId: string; isOnline: boolean }>>(
        `/api/im/presence/check/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.userId === ctx.users.user2.id, "用户ID应匹配");
    });

    await test("0.8 获取用户详细在线状态", async () => {
      const res = await ctx.http.get<ApiResponse<{ userId: string; isOnline: boolean }>>(
        `/api/im/presence/status/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("0.9 批量获取用户在线状态", async () => {
      const res = await ctx.http.post<ApiResponse<Record<string, boolean>>>(
        "/api/im/presence/batch",
        { userIds: [ctx.users.user2.id, ctx.users.user3.id] },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    // ==================== 媒体限制测试 ====================
    group("媒体文件 /api/im/media");

    await test("0.10 获取上传限制", async () => {
      const res = await ctx.http.get<ApiResponse<{ allowedTypes: string[]; sizeLimits: Record<string, number>; maxFiles: number }>>(
        "/api/im/media/limits",
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data.allowedTypes), "应返回允许的类型数组");
      assert(res.data.data.maxFiles === 9, "最大文件数应为9");
    });

    // ==================== 设备管理测试 ====================
    group("设备管理 /api/im/devices");

    await test("1.1 注册设备", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/devices/register",
        {
          platform: "ios",
          deviceId: "test-device-001",
          deviceName: "iPhone 15 Pro",
          appVersion: "1.0.0",
          osVersion: "17.0",
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.data.id !== undefined, "应返回设备ID");
      ctx.data.deviceId = res.data.data.id;
    });

    await test("1.2 获取设备列表", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>("/api/im/devices", {
        token: ctx.users.user1.token,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
      assert(res.data.data.length >= 1, "应至少有1个设备");
    });

    await test("1.3 设备心跳", async () => {
      const res = await ctx.http.post<ApiResponse<{ online: boolean }>>(
        `/api/im/devices/${ctx.data.deviceId}/heartbeat`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.online === true, "设备应在线");
    });

    await test("1.4 更新设备信息", async () => {
      const res = await ctx.http.put<ApiResponse<{ deviceName: string }>>(
        `/api/im/devices/${ctx.data.deviceId}`,
        { deviceName: "iPhone 15 Pro Max" },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    // ==================== 好友管理测试 ====================
    group("好友管理 /api/im/friends");

    await test("2.1 发送好友申请", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/friends/requests",
        {
          toUserId: ctx.users.user2.id,
          message: "你好，我是用户1",
          source: "search",
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.data.id !== undefined, "应返回申请ID");
      ctx.data.friendRequestId = res.data.data.id;
    });

    await test("2.2 不能重复发送申请", async () => {
      // 直接使用 fetch，因为 409 响应可能不是 JSON
      const response = await fetch(`${ctx.server.baseUrl}/api/im/friends/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.users.user1.token}`,
        },
        body: JSON.stringify({
          toUserId: ctx.users.user2.id,
          message: "重复申请",
          source: "search",
        }),
      });

      assert(response.status === 409, `期望状态码 409，实际 ${response.status}`);
    });

    await test("2.2.1 第三方用户搜索不应看到他人的好友申请", async () => {
      // user1 已向 user2 发送申请，user3 搜索 user2 时不应看到这个申请
      const res = await ctx.http.get<ApiResponse<Array<{ id: string; hasPendingRequest: boolean }>>>(
        `/api/im/users/search?keyword=${ctx.users.user2.id}`,
        { token: ctx.users.user3.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
      assert(res.data.data.length > 0, "应找到用户");
      assert(
        res.data.data[0].hasPendingRequest === false,
        `user3 搜索 user2 时 hasPendingRequest 应为 false，实际: ${res.data.data[0].hasPendingRequest}`
      );
    });

    await test("2.3 获取收到的好友申请（用户2）", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>(
        "/api/im/friends/requests/received",
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
      assert(res.data.data.length >= 1, "应至少有1个申请");
    });

    await test("2.4 获取发出的好友申请（用户1）", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>(
        "/api/im/friends/requests/sent",
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
    });

    await test("2.5 接受好友申请（用户2）", async () => {
      const res = await ctx.http.post<ApiResponse<unknown>>(
        `/api/im/friends/requests/${ctx.data.friendRequestId}/accept`,
        null,
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("2.6 检查是否为好友", async () => {
      const res = await ctx.http.get<ApiResponse<{ isFriend: boolean }>>(
        `/api/im/friends/check/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.isFriend === true, "应该是好友");
    });

    await test("2.7 获取好友列表", async () => {
      const res = await ctx.http.get<ApiResponse<{ list: unknown[] }>>(
        "/api/im/friends",
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.list.length >= 1, "应至少有1个好友");
    });

    await test("2.8 获取好友详情", async () => {
      const res = await ctx.http.get<ApiResponse<{ friendId: string }>>(
        `/api/im/friends/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("2.9 更新好友设置（备注/拉黑/置顶）", async () => {
      const res = await ctx.http.put<ApiResponse<unknown>>(
        `/api/im/friends/${ctx.users.user2.id}`,
        { alias: "我的好友2", isPinned: true },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    // 用户1 和 用户3 也建立好友关系（用于群组测试）
    await test("2.10 用户1与用户3建立好友关系", async () => {
      // 用户3 发送申请给 用户1
      const reqRes = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/friends/requests",
        {
          toUserId: ctx.users.user1.id,
          message: "我是用户3",
          source: "search",
        },
        { token: ctx.users.user3.token }
      );
      assert(reqRes.status === 201, `期望状态码 201，实际 ${reqRes.status}`);

      // 用户1 接受
      const acceptRes = await ctx.http.post<ApiResponse<unknown>>(
        `/api/im/friends/requests/${reqRes.data.data.id}/accept`,
        null,
        { token: ctx.users.user1.token }
      );
      assert(acceptRes.status === 200, `期望状态码 200，实际 ${acceptRes.status}`);
    });

    await test("2.11 拒绝好友申请", async () => {
      // 用户2 发送申请给 用户3
      const reqRes = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/friends/requests",
        {
          toUserId: ctx.users.user3.id,
          message: "你好，我是用户2",
          source: "search",
        },
        { token: ctx.users.user2.token }
      );
      assert(reqRes.status === 201, `期望状态码 201，实际 ${reqRes.status}`);

      // 用户3 拒绝
      const rejectRes = await ctx.http.post<ApiResponse<{ status: string }>>(
        `/api/im/friends/requests/${reqRes.data.data.id}/reject`,
        null,
        { token: ctx.users.user3.token }
      );
      assert(rejectRes.status === 200, `期望状态码 200，实际 ${rejectRes.status}`);
    });

    await test("2.12 获取好友在线状态", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>(
        "/api/im/presence/friends",
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
    });

    // ==================== 群组管理测试 ====================
    group("群组管理 /api/im/groups");

    await test("3.1 创建群组", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/groups",
        {
          name: "测试群组",
          description: "这是一个测试群组",
          memberIds: [ctx.users.user2.id],
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.data.id !== undefined, "应返回群组ID");
      ctx.data.groupId = res.data.data.id;
    });

    await test("3.2 获取我的群组列表", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>("/api/im/groups", {
        token: ctx.users.user1.token,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
      assert(res.data.data.length >= 1, "应至少有1个群组");
    });

    await test("3.3 获取群组详情", async () => {
      const res = await ctx.http.get<ApiResponse<{ id: string; name: string }>>(
        `/api/im/groups/${ctx.data.groupId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.name === "测试群组", "群组名称应匹配");
    });

    await test("3.4 更新群组信息", async () => {
      const res = await ctx.http.put<ApiResponse<unknown>>(
        `/api/im/groups/${ctx.data.groupId}`,
        { name: "测试群组-更新", description: "更新后的描述" },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("3.5 获取群成员列表", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>(
        `/api/im/groups/${ctx.data.groupId}/members`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
      assert(res.data.data.length >= 2, "应至少有2个成员（群主+被邀请成员）");
    });

    await test("3.6 邀请成员加入群组", async () => {
      const res = await ctx.http.post<ApiResponse<unknown>>(
        `/api/im/groups/${ctx.data.groupId}/invite`,
        { userIds: [ctx.users.user3.id] },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("3.7 设置管理员", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/groups/${ctx.data.groupId}/admin/${ctx.users.user2.id}`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("3.8 禁言成员", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/groups/${ctx.data.groupId}/mute/${ctx.users.user3.id}`,
        { duration: 3600 },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("3.9 解除禁言", async () => {
      const res = await ctx.http.delete<ApiResponse<{ message: string }>>(
        `/api/im/groups/${ctx.data.groupId}/mute/${ctx.users.user3.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("3.9a 踢出成员", async () => {
      const res = await ctx.http.post<ApiResponse<null>>(
        `/api/im/groups/${ctx.data.groupId}/kick/${ctx.users.user3.id}`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 204, `期望状态码 204，实际 ${res.status}`);
    });

    await test("3.10 取消管理员", async () => {
      const res = await ctx.http.delete<ApiResponse<{ message: string }>>(
        `/api/im/groups/${ctx.data.groupId}/admin/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("3.11 转让群主", async () => {
      // 转让给用户2
      const transferRes = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/groups/${ctx.data.groupId}/transfer`,
        { newOwnerId: ctx.users.user2.id },
        { token: ctx.users.user1.token }
      );

      assert(transferRes.status === 200, `期望状态码 200，实际 ${transferRes.status}`);

      // 再转回用户1（以便后续解散测试）
      const transferBackRes = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/groups/${ctx.data.groupId}/transfer`,
        { newOwnerId: ctx.users.user1.id },
        { token: ctx.users.user2.token }
      );

      assert(transferBackRes.status === 200, `期望状态码 200，实际 ${transferBackRes.status}`);
    });

    await test("3.12 成员退出群组", async () => {
      const res = await ctx.http.post<ApiResponse<unknown>>(
        `/api/im/groups/${ctx.data.groupId}/leave`,
        null,
        { token: ctx.users.user2.token }
      );

      assert(res.status === 204, `期望状态码 204，实际 ${res.status}`);
    });

    // ==================== 会话管理测试 ====================
    group("会话管理 /api/im/conversations");

    await test("4.1 发起私聊会话", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/conversations/private",
        { targetUserId: ctx.users.user2.id },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.data.id !== undefined, "应返回会话ID");
      ctx.data.conversationId = res.data.data.id;
    });

    await test("4.2 获取会话列表", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>("/api/im/conversations", {
        token: ctx.users.user1.token,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
    });

    await test("4.3 获取会话详情", async () => {
      const res = await ctx.http.get<ApiResponse<{ conversation: { id: string } }>>(
        `/api/im/conversations/${ctx.data.conversationId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    // ==================== 消息管理测试 ====================
    group("消息管理 /api/im/messages");

    await test("5.1 发送文本消息", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/messages",
        {
          conversationId: ctx.data.conversationId,
          type: "text",
          content: "你好，这是测试消息",
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.data.id !== undefined, "应返回消息ID");
      ctx.data.messageId = res.data.data.id;
    });

    await test("5.2 获取会话消息列表", async () => {
      const res = await ctx.http.get<ApiResponse<unknown[]>>(
        `/api/im/messages/conversation/${ctx.data.conversationId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回数组");
      assert(res.data.data.length >= 1, "应至少有1条消息");
    });

    await test("5.3 获取消息详情", async () => {
      const res = await ctx.http.get<ApiResponse<{ id: string; content: string }>>(
        `/api/im/messages/${ctx.data.messageId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.content === "你好，这是测试消息", "消息内容应匹配");
    });

    await test("5.4 标记消息已读", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/messages/conversation/${ctx.data.conversationId}/read`,
        { messageId: ctx.data.messageId },
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("5.5 撤回消息", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string; isRecalled: boolean }>>(
        `/api/im/messages/${ctx.data.messageId}/recall`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("5.6 发送图片消息", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/messages",
        {
          conversationId: ctx.data.conversationId,
          type: "image",
          mediaUrl: "https://example.com/image.jpg",
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
    });

    await test("5.7 标记消息已送达", async () => {
      // 先发送一条新消息用于测试送达回执
      const sendRes = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/messages",
        {
          conversationId: ctx.data.conversationId,
          type: "text",
          content: "测试送达回执的消息",
        },
        { token: ctx.users.user1.token }
      );
      assert(sendRes.status === 201, `发送消息失败: ${sendRes.status}`);

      // 用户2 标记消息已送达
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/messages/${sendRes.data.data.id}/delivered`,
        null,
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.message === "标记成功", "应返回标记成功消息");
    });

    await test("5.8 批量标记消息已送达", async () => {
      // 发送多条消息
      const msg1Res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/messages",
        {
          conversationId: ctx.data.conversationId,
          type: "text",
          content: "批量送达测试消息1",
        },
        { token: ctx.users.user1.token }
      );
      const msg2Res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/messages",
        {
          conversationId: ctx.data.conversationId,
          type: "text",
          content: "批量送达测试消息2",
        },
        { token: ctx.users.user1.token }
      );

      assert(msg1Res.status === 201, `发送消息1失败: ${msg1Res.status}`);
      assert(msg2Res.status === 201, `发送消息2失败: ${msg2Res.status}`);

      // 用户2 批量标记消息已送达
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        "/api/im/messages/batch-delivered",
        { messageIds: [msg1Res.data.data.id, msg2Res.data.data.id] },
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.message === "批量标记成功", "应返回批量标记成功消息");
    });

    await test("5.9 发送输入状态（开始输入）", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/conversations/${ctx.data.conversationId}/typing`,
        { isTyping: true },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("5.10 发送输入状态（停止输入）", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/conversations/${ctx.data.conversationId}/typing`,
        { isTyping: false },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("5.11 转发消息", async () => {
      // 先发送一条新消息用于转发
      const sendRes = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/messages",
        {
          conversationId: ctx.data.conversationId,
          type: "text",
          content: "这条消息将被转发",
        },
        { token: ctx.users.user1.token }
      );
      assert(sendRes.status === 201, `发送消息失败: ${sendRes.status}`);

      // 创建用户1与用户3的会话用于转发目标
      const conv3Res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/conversations/private",
        { targetUserId: ctx.users.user3.id },
        { token: ctx.users.user1.token }
      );
      assert(conv3Res.status === 201, `创建会话失败: ${conv3Res.status}`);

      // 转发消息
      const res = await ctx.http.post<ApiResponse<unknown[]>>(
        `/api/im/messages/${sendRes.data.data.id}/forward`,
        { conversationIds: [conv3Res.data.data.id] },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data), "应返回转发后的消息数组");
    });

    await test("5.12 搜索消息", async () => {
      const res = await ctx.http.post<ApiResponse<{ messages: unknown[]; total: number; hasMore: boolean }>>(
        "/api/im/messages/search",
        { keyword: "测试" },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(Array.isArray(res.data.data.messages), "应返回消息数组");
      assert(typeof res.data.data.total === "number", "应返回总数");
    });

    // ==================== 会话操作测试（续） ====================
    group("会话操作 /api/im/conversations（续）");

    await test("4.4 清空未读", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/conversations/${ctx.data.conversationId}/clear-unread`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("4.5 删除会话", async () => {
      // 用户1与用户3是好友，创建一个临时会话用于删除测试
      const tempConvRes = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/conversations/private",
        { targetUserId: ctx.users.user3.id },
        { token: ctx.users.user1.token }
      );
      assert(tempConvRes.status === 201, `创建临时会话失败: ${tempConvRes.status}`);

      // 删除该会话
      const res = await ctx.http.delete<ApiResponse<null>>(
        `/api/im/conversations/${tempConvRes.data.data.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 204, `期望状态码 204，实际 ${res.status}`);
    });

    // ==================== 通话管理测试 ====================
    group("通话管理 /api/im/calls");

    await test("6.1 发起通话", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/calls/initiate",
        { calleeId: ctx.users.user2.id },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 201, `期望状态码 201，实际 ${res.status}`);
      assert(res.data.data.id !== undefined, "应返回通话ID");
      ctx.data.callId = res.data.data.id;
    });

    await test("6.2 获取通话记录列表", async () => {
      const res = await ctx.http.get<ApiResponse<{ list: unknown[] }>>("/api/im/calls", {
        token: ctx.users.user1.token,
      });

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.list.length >= 1, "应至少有1条通话记录");
    });

    await test("6.3 获取通话详情", async () => {
      const res = await ctx.http.get<ApiResponse<{ id: string; status: string }>>(
        `/api/im/calls/${ctx.data.callId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.status === "initiated", `期望状态 initiated，实际 ${res.data.data.status}`);
    });

    await test("6.4 被叫响铃", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string; status: string }>>(
        `/api/im/calls/${ctx.data.callId}/ring`,
        null,
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.status === "ringing", `期望状态 ringing，实际 ${res.data.data.status}`);
    });

    await test("6.5 接听通话", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string; status: string }>>(
        `/api/im/calls/${ctx.data.callId}/accept`,
        null,
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.status === "connected", `期望状态 connected，实际 ${res.data.data.status}`);
    });

    await test("6.5a 发送 WebRTC Offer 信令", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/calls/${ctx.data.callId}/signal`,
        {
          signalType: "offer",
          signalData: {
            sdp: "v=0\r\no=- 4617831781326401234 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio\r\n",
          },
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("6.5b 发送 WebRTC Answer 信令", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/calls/${ctx.data.callId}/signal`,
        {
          signalType: "answer",
          signalData: {
            sdp: "v=0\r\no=- 1234567890123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio\r\n",
          },
        },
        { token: ctx.users.user2.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("6.5c 发送 ICE Candidate 信令", async () => {
      const res = await ctx.http.post<ApiResponse<{ message: string }>>(
        `/api/im/calls/${ctx.data.callId}/signal`,
        {
          signalType: "ice-candidate",
          signalData: {
            candidate: "candidate:1 1 UDP 2130706431 192.168.1.1 54321 typ host",
            sdpMid: "audio",
            sdpMLineIndex: 0,
          },
        },
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
    });

    await test("6.6 挂断通话", async () => {
      const res = await ctx.http.post<ApiResponse<{ id: string; status: string }>>(
        `/api/im/calls/${ctx.data.callId}/hangup`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.status === "ended", `期望状态 ended，实际 ${res.data.data.status}`);
    });

    // 测试拒接流程
    await test("6.7 发起新通话并拒接", async () => {
      // 发起新通话
      const initRes = await ctx.http.post<ApiResponse<{ id: string }>>(
        "/api/im/calls/initiate",
        { calleeId: ctx.users.user2.id },
        { token: ctx.users.user1.token }
      );
      assert(initRes.status === 201, `期望状态码 201，实际 ${initRes.status}`);

      // 拒接
      const rejectRes = await ctx.http.post<ApiResponse<{ id: string; status: string }>>(
        `/api/im/calls/${initRes.data.data.id}/reject`,
        null,
        { token: ctx.users.user2.token }
      );
      assert(rejectRes.status === 200, `期望状态码 200，实际 ${rejectRes.status}`);
      assert(rejectRes.data.data.status === "rejected", `期望状态 rejected，实际 ${rejectRes.data.data.status}`);
    });

    // ==================== 删除好友测试 ====================
    group("好友删除 /api/im/friends");

    await test("7.1 删除好友", async () => {
      const res = await ctx.http.delete<ApiResponse<null>>(
        `/api/im/friends/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 204, `期望状态码 204，实际 ${res.status}`);
    });

    await test("7.2 确认好友已删除", async () => {
      const res = await ctx.http.get<ApiResponse<{ isFriend: boolean }>>(
        `/api/im/friends/check/${ctx.users.user2.id}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.isFriend === false, "不应再是好友");
    });

    // ==================== 群组解散测试 ====================
    group("群组解散 /api/im/groups");

    await test("8.1 解散群组", async () => {
      const res = await ctx.http.delete<ApiResponse<null>>(
        `/api/im/groups/${ctx.data.groupId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 204, `期望状态码 204，实际 ${res.status}`);
    });

    // ==================== 设备删除测试 ====================
    group("设备删除 /api/im/devices");

    await test("9.1 设备下线", async () => {
      const res = await ctx.http.post<ApiResponse<{ online: boolean }>>(
        `/api/im/devices/${ctx.data.deviceId}/offline`,
        null,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 200, `期望状态码 200，实际 ${res.status}`);
      assert(res.data.data.online === false, "设备应离线");
    });

    await test("9.2 删除设备", async () => {
      const res = await ctx.http.delete<ApiResponse<null>>(
        `/api/im/devices/${ctx.data.deviceId}`,
        { token: ctx.users.user1.token }
      );

      assert(res.status === 204, `期望状态码 204，实际 ${res.status}`);
    });

  } finally {
    // 清理：停止测试服务器
    console.log("\n正在停止测试服务器...");
    await stopTestServer();
    console.log("测试服务器已停止");
  }

  summary("IM 模块 E2E");
}

runTests().catch((err) => {
  console.error("测试运行失败:", err);
  process.exit(1);
});

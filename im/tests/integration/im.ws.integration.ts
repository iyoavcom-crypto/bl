/**
 * IM 模块 WebSocket 与推送集成测试
 * 运行: npx tsx tests/integration/im.ws.integration.ts
 *
 * 测试覆盖:
 * - WebSocket 连接生命周期
 * - 实时消息推送
 * - 输入状态广播
 * - 通话信令推送
 * - 好友/群组事件推送
 * - 心跳保活机制
 */

import { test, assert, group, summary, reset } from "../helpers/runner.js";
import { createHttpClient, type ApiResponse, type HttpClient } from "../helpers/http.js";
import { startTestServer, stopTestServer, type TestServerContext } from "../helpers/server.js";
import { createWsClient, type WsTestClient, type WsConnectedPayload } from "../helpers/websocket.js";
import type { AuthSuccessData } from "@/models/auth/index.js";

/** 测试上下文 */
interface TestContext {
  http: HttpClient;
  server: TestServerContext;
  users: {
    user1: { phone: string; password: string; pin: string; token: string; id: string };
    user2: { phone: string; password: string; pin: string; token: string; id: string };
  };
  wsClients: {
    user1: WsTestClient | null;
    user2: WsTestClient | null;
  };
  data: {
    conversationId: string;
    messageId: string;
    groupId: string;
    callId: string;
    deviceId1: string;
    deviceId2: string;
  };
}

const ctx: TestContext = {
  http: null as unknown as HttpClient,
  server: null as unknown as TestServerContext,
  users: {
    user1: { phone: "", password: "", pin: "", token: "", id: "" },
    user2: { phone: "", password: "", pin: "", token: "", id: "" },
  },
  wsClients: {
    user1: null,
    user2: null,
  },
  data: {
    conversationId: "",
    messageId: "",
    groupId: "",
    callId: "",
    deviceId1: "",
    deviceId2: "",
  },
};

/**
 * 注册并登录用户
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

/**
 * 等待指定毫秒
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests(): Promise<void> {
  reset();
  console.log("=== IM WebSocket 与推送集成测试 ===\n");

  // 启动测试服务器（启用 WebSocket）
  console.log("正在启动测试服务器（含 WebSocket）...");
  ctx.server = await startTestServer({ forceSync: true, enableWebSocket: true });
  ctx.http = createHttpClient(ctx.server.baseUrl);
  console.log(`测试服务器启动成功: ${ctx.server.baseUrl}`);
  console.log(`WebSocket 地址: ${ctx.server.wsUrl}\n`);

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
    password: "Test@654321",
    pin: "654321",
    token: "",
    id: "",
  };

  ctx.data.deviceId1 = `test-device-1-${timestamp}`;
  ctx.data.deviceId2 = `test-device-2-${timestamp}`;

  group("准备测试用户");

  await test("注册 2 个测试用户", async () => {
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

    assert(ctx.users.user1.id !== "", "用户1应有ID");
    assert(ctx.users.user2.id !== "", "用户2应有ID");
  });

  await test("建立好友关系", async () => {
    // 用户1 发送好友申请
    const reqRes = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/friends/requests",
      { toUserId: ctx.users.user2.id, message: "测试好友", source: "search" },
      { token: ctx.users.user1.token }
    );
    assert(reqRes.status === 201, `发送申请失败: ${reqRes.status}`);

    // 用户2 接受
    const acceptRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/friends/requests/${reqRes.data.data.id}/accept`,
      null,
      { token: ctx.users.user2.token }
    );
    assert(acceptRes.status === 200, `接受申请失败: ${acceptRes.status}`);
  });

  await test("创建私聊会话", async () => {
    const res = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/conversations/private",
      { targetUserId: ctx.users.user2.id },
      { token: ctx.users.user1.token }
    );
    assert(res.status === 201, `创建会话失败: ${res.status}`);
    ctx.data.conversationId = res.data.data.id;
  });

  // ==================== WebSocket 连接测试 ====================
  group("WebSocket 连接");

  await test("1.1 用户1 建立 WebSocket 连接", async () => {
    ctx.wsClients.user1 = createWsClient(ctx.server.baseUrl, {
      token: ctx.users.user1.token,
      deviceId: ctx.data.deviceId1,
    });

    await ctx.wsClients.user1.connect();
    assert(ctx.wsClients.user1.isConnected(), "用户1应已连接");

    // 检查是否收到 connected 事件
    const connectedMsgs = ctx.wsClients.user1.getMessagesByType("connected");
    assert(connectedMsgs.length > 0, "应收到 connected 事件");

    const payload = connectedMsgs[0].payload as WsConnectedPayload;
    assert(payload.userId === ctx.users.user1.id, "connected 事件应包含正确的 userId");
  });

  await test("1.2 用户2 建立 WebSocket 连接", async () => {
    ctx.wsClients.user2 = createWsClient(ctx.server.baseUrl, {
      token: ctx.users.user2.token,
      deviceId: ctx.data.deviceId2,
    });

    await ctx.wsClients.user2.connect();
    assert(ctx.wsClients.user2.isConnected(), "用户2应已连接");
  });

  await test("1.3 无效 Token 连接被拒绝", async () => {
    const invalidClient = createWsClient(ctx.server.baseUrl, {
      token: "invalid-token",
      timeout: 2000,
    });

    let connectionFailed = false;
    try {
      await invalidClient.connect();
    } catch {
      connectionFailed = true;
    }
    invalidClient.disconnect();

    assert(connectionFailed, "无效 Token 应连接失败");
  });

  await test("1.4 心跳机制", async () => {
    ctx.wsClients.user1!.clearMessages();
    ctx.wsClients.user1!.sendPing();

    // 等待 pong 响应
    const pongPayload = await ctx.wsClients.user1!.waitForMessage("pong", 2000);
    assert(pongPayload !== undefined, "应收到 pong 响应");
  });

  // ==================== 消息推送测试 ====================
  group("消息实时推送");

  await test("2.1 发送消息后接收方收到实时推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 用户1 发送消息
    const sendRes = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/messages",
      {
        conversationId: ctx.data.conversationId,
        type: "text",
        content: "这是一条测试消息",
      },
      { token: ctx.users.user1.token }
    );
    assert(sendRes.status === 201, `发送消息失败: ${sendRes.status}`);
    ctx.data.messageId = sendRes.data.data.id;

    // 用户2 应该收到 message:new 事件
    const newMsgPayload = await ctx.wsClients.user2!.waitForMessage<{
      conversationId: string;
      message: { id: string; content: string };
    }>("message:new", 3000);

    assert(newMsgPayload.conversationId === ctx.data.conversationId, "消息推送应包含正确的 conversationId");
    assert(newMsgPayload.message.content === "这是一条测试消息", "消息推送应包含正确的内容");
  });

  await test("2.2 撤回消息后接收方收到撤回推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 用户1 撤回消息
    const recallRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/messages/${ctx.data.messageId}/recall`,
      null,
      { token: ctx.users.user1.token }
    );
    assert(recallRes.status === 200, `撤回消息失败: ${recallRes.status}`);

    // 用户2 应该收到 message:recalled 事件
    const recalledPayload = await ctx.wsClients.user2!.waitForMessage<{
      conversationId: string;
      messageId: string;
    }>("message:recalled", 3000);

    assert(recalledPayload.messageId === ctx.data.messageId, "撤回推送应包含正确的 messageId");
  });

  await test("2.3 已读回执推送", async () => {
    ctx.wsClients.user1!.clearMessages();

    // 用户1 发送新消息
    const sendRes = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/messages",
      {
        conversationId: ctx.data.conversationId,
        type: "text",
        content: "测试已读回执",
      },
      { token: ctx.users.user1.token }
    );
    assert(sendRes.status === 201, `发送消息失败: ${sendRes.status}`);

    // 先注册 message:read 监听器
    const waiter = ctx.wsClients.user1!.createMessageWaiter<{
      conversationId: string;
      userId: string;
    }>("message:read", 3000);

    // 用户2 标记已读
    const readRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/messages/conversation/${ctx.data.conversationId}/read`,
      { messageId: sendRes.data.data.id },
      { token: ctx.users.user2.token }
    );
    assert(readRes.status === 200, `标记已读失败: ${readRes.status}`);

    // 等待 message:read 事件
    const readPayload = await waiter.wait();

    assert(readPayload.conversationId === ctx.data.conversationId, "已读推送应包含正确的 conversationId");
    assert(readPayload.userId === ctx.users.user2.id, "已读推送应包含正确的 userId");
  });

  await test("2.4 送达回执推送", async () => {
    ctx.wsClients.user1!.clearMessages();

    // 用户1 发送新消息
    const sendRes = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/messages",
      {
        conversationId: ctx.data.conversationId,
        type: "text",
        content: "测试送达回执",
      },
      { token: ctx.users.user1.token }
    );
    assert(sendRes.status === 201, `发送消息失败: ${sendRes.status}`);

    // 先注册 message:delivered 监听器
    const waiter = ctx.wsClients.user1!.createMessageWaiter<{
      conversationId: string;
      messageId: string;
      deliveredTo: string;
    }>("message:delivered", 3000);

    // 用户2 标记送达
    const deliveredRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/messages/${sendRes.data.data.id}/delivered`,
      null,
      { token: ctx.users.user2.token }
    );
    assert(deliveredRes.status === 200, `标记送达失败: ${deliveredRes.status}`);

    // 等待 message:delivered 事件
    const deliveredPayload = await waiter.wait();

    assert(deliveredPayload.messageId === sendRes.data.data.id, "送达推送应包含正确的 messageId");
    assert(deliveredPayload.deliveredTo === ctx.users.user2.id, "送达推送应包含正确的 deliveredTo");
  });

  // ==================== 输入状态测试 ====================
  group("输入状态推送");

  await test("3.1 输入状态开始推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 用户1 开始输入
    const typingRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/conversations/${ctx.data.conversationId}/typing`,
      { isTyping: true },
      { token: ctx.users.user1.token }
    );
    assert(typingRes.status === 200, `发送输入状态失败: ${typingRes.status}`);

    // 用户2 应该收到 typing:start 事件
    const typingPayload = await ctx.wsClients.user2!.waitForMessage<{
      conversationId: string;
      userId: string;
    }>("typing:start", 3000);

    assert(typingPayload.conversationId === ctx.data.conversationId, "输入状态应包含正确的 conversationId");
    assert(typingPayload.userId === ctx.users.user1.id, "输入状态应包含正确的 userId");
  });

  await test("3.2 输入状态停止推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 用户1 停止输入
    const typingRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/conversations/${ctx.data.conversationId}/typing`,
      { isTyping: false },
      { token: ctx.users.user1.token }
    );
    assert(typingRes.status === 200, `发送停止输入状态失败: ${typingRes.status}`);

    // 用户2 应该收到 typing:stop 事件
    const typingPayload = await ctx.wsClients.user2!.waitForMessage<{
      conversationId: string;
      userId: string;
    }>("typing:stop", 3000);

    assert(typingPayload.conversationId === ctx.data.conversationId, "停止输入状态应包含正确的 conversationId");
  });

  // ==================== 通话信令测试 ====================
  group("通话信令推送");

  await test("4.1 发起通话后被叫收到邀请推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 call:invite 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      callId: string;
      callerId: string;
    }>("call:invite", 3000);

    // 用户1 发起通话
    const callRes = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/calls/initiate",
      { calleeId: ctx.users.user2.id },
      { token: ctx.users.user1.token }
    );
    assert(callRes.status === 201, `发起通话失败: ${callRes.status}`);
    ctx.data.callId = callRes.data.data.id;

    // 等待 call:invite 事件
    const invitePayload = await waiter.wait();

    assert(invitePayload.callId === ctx.data.callId, "通话邀请应包含正确的 callId");
    assert(invitePayload.callerId === ctx.users.user1.id, "通话邀请应包含正确的 callerId");
  });

  await test("4.2 响铃后主叫收到响铃推送", async () => {
    ctx.wsClients.user1!.clearMessages();

    // 先注册 call:ring 监听器
    const waiter = ctx.wsClients.user1!.createMessageWaiter<{
      callId: string;
      calleeId: string;
    }>("call:ring", 3000);

    // 用户2 响铃
    const ringRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/calls/${ctx.data.callId}/ring`,
      null,
      { token: ctx.users.user2.token }
    );
    assert(ringRes.status === 200, `响铃失败: ${ringRes.status}`);

    // 等待 call:ring 事件
    const ringPayload = await waiter.wait();

    assert(ringPayload.callId === ctx.data.callId, "响铃推送应包含正确的 callId");
  });

  await test("4.3 接听后双方收到接听推送", async () => {
    ctx.wsClients.user1!.clearMessages();

    // 先注册 call:answer 监听器
    const waiter = ctx.wsClients.user1!.createMessageWaiter<{
      callId: string;
    }>("call:answer", 3000);

    // 用户2 接听
    const acceptRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/calls/${ctx.data.callId}/accept`,
      null,
      { token: ctx.users.user2.token }
    );
    assert(acceptRes.status === 200, `接听失败: ${acceptRes.status}`);

    // 等待 call:answer 事件
    const answerPayload = await waiter.wait();

    assert(answerPayload.callId === ctx.data.callId, "接听推送应包含正确的 callId");
  });

  await test("4.4 WebRTC 信令转发", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 call:signal 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      callId: string;
      signalType: string;
      signalData: { sdp: string };
    }>("call:signal", 3000);

    // 用户1 发送 offer
    const signalRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/calls/${ctx.data.callId}/signal`,
      {
        signalType: "offer",
        signalData: { sdp: "v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\n" },
      },
      { token: ctx.users.user1.token }
    );
    assert(signalRes.status === 200, `发送信令失败: ${signalRes.status}`);

    // 等待 call:signal 事件
    const signalPayload = await waiter.wait();

    assert(signalPayload.callId === ctx.data.callId, "信令推送应包含正确的 callId");
    assert(signalPayload.signalType === "offer", "信令推送应包含正确的 signalType");
  });

  await test("4.5 挂断后双方收到结束推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 call:end 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      callId: string;
      endReason: string;
    }>("call:end", 3000);

    // 用户1 挂断
    const hangupRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/calls/${ctx.data.callId}/hangup`,
      null,
      { token: ctx.users.user1.token }
    );
    assert(hangupRes.status === 200, `挂断失败: ${hangupRes.status}`);

    // 等待 call:end 事件
    const endPayload = await waiter.wait();

    assert(endPayload.callId === ctx.data.callId, "结束推送应包含正确的 callId");
  });

  // ==================== 群组事件测试 ====================
  group("群组事件推送");

  await test("5.1 创建群组并邀请成员后收到邀请推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 group:invited 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      groupId: string;
      inviterId: string;
    }>("group:invited", 3000);

    // 用户1 创建群组并邀请用户2
    const groupRes = await ctx.http.post<ApiResponse<{ id: string }>>(
      "/api/im/groups",
      {
        name: "测试群组",
        memberIds: [ctx.users.user2.id],
      },
      { token: ctx.users.user1.token }
    );
    assert(groupRes.status === 201, `创建群组失败: ${groupRes.status}`);
    ctx.data.groupId = groupRes.data.data.id;

    // 等待 group:invited 事件
    const invitedPayload = await waiter.wait();

    assert(invitedPayload.groupId === ctx.data.groupId, "群邀请推送应包含正确的 groupId");
  });

  await test("5.2 禁言成员后收到禁言推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 group:muted 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      groupId: string;
      operatorId: string;
      duration: number;
    }>("group:muted", 3000);

    // 用户1 禁言用户2
    const muteRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/groups/${ctx.data.groupId}/mute/${ctx.users.user2.id}`,
      { duration: 3600 },
      { token: ctx.users.user1.token }
    );
    assert(muteRes.status === 200, `禁言失败: ${muteRes.status}`);

    // 等待 group:muted 事件
    const mutedPayload = await waiter.wait();

    assert(mutedPayload.groupId === ctx.data.groupId, "禁言推送应包含正确的 groupId");
    assert(mutedPayload.operatorId === ctx.users.user1.id, "禁言推送应包含正确的 operatorId");
  });

  await test("5.3 解除禁言后收到解禁推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 group:unmuted 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      groupId: string;
      userId: string;
    }>("group:unmuted", 3000);

    // 用户1 解除禁言
    const unmuteRes = await ctx.http.delete<ApiResponse<unknown>>(
      `/api/im/groups/${ctx.data.groupId}/mute/${ctx.users.user2.id}`,
      { token: ctx.users.user1.token }
    );
    assert(unmuteRes.status === 200, `解禁失败: ${unmuteRes.status}`);

    // 等待 group:unmuted 事件
    const unmutedPayload = await waiter.wait();

    assert(unmutedPayload.groupId === ctx.data.groupId, "解禁推送应包含正确的 groupId");
  });

  await test("5.4 踢出成员后收到踢出推送", async () => {
    ctx.wsClients.user2!.clearMessages();

    // 先注册 group:kicked 监听器
    const waiter = ctx.wsClients.user2!.createMessageWaiter<{
      groupId: string;
      kickedUserId: string;
    }>("group:kicked", 3000);

    // 用户1 踢出用户2
    const kickRes = await ctx.http.post<ApiResponse<unknown>>(
      `/api/im/groups/${ctx.data.groupId}/kick/${ctx.users.user2.id}`,
      null,
      { token: ctx.users.user1.token }
    );
    assert(kickRes.status === 204, `踢出失败: ${kickRes.status}`);

    // 等待 group:kicked 事件
    const kickedPayload = await waiter.wait();

    assert(kickedPayload.groupId === ctx.data.groupId, "踢出推送应包含正确的 groupId");
  });

  // ==================== 断开连接 ====================
  group("连接断开");

  await test("6.1 正常断开连接", async () => {
    ctx.wsClients.user1!.disconnect();
    ctx.wsClients.user2!.disconnect();

    await sleep(100);

    assert(!ctx.wsClients.user1!.isConnected(), "用户1应已断开");
    assert(!ctx.wsClients.user2!.isConnected(), "用户2应已断开");
  });

  // 停止服务器
  console.log("\n正在停止测试服务器...");
  await stopTestServer();
  console.log("测试服务器已停止");

  summary("IM WebSocket 与推送集成测试");
}

runTests().catch((err) => {
  console.error("测试运行失败:", err);
  process.exit(1);
});

/**
 * E2E 测试服务器启动辅助工具
 */

import express, { type Express } from "express";
import type { Server } from "node:http";
import { initDatabase, sequelize, checkAndGenerateSecrets } from "@/config/index.js";
import "@/models/index.js";
import { Role } from "@/models/role/index.js";
import { RoleGroup } from "@/models/role/types/index.js";
import {
  useCorsMiddleware,
  ensureRequestId,
  requestLogger,
} from "@/middleware/index.js";
import routes from "@/routes/index.js";
import { wsServer } from "@/websocket/index.js";

let testServer: Server | null = null;
let testApp: Express | null = null;
let wsEnabled = false;

/**
 * 创建测试用 Express 应用
 */
function createTestApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(useCorsMiddleware());
  app.use(ensureRequestId);
  app.use(requestLogger);
  app.use("/api", routes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}

export interface TestServerOptions {
  port?: number;
  forceSync?: boolean;
  enableWebSocket?: boolean;
}

export interface TestServerContext {
  app: Express;
  server: Server;
  baseUrl: string;
  wsUrl: string;
  port: number;
}

/**
 * 启动测试服务器
 */
export async function startTestServer(
  options: TestServerOptions = {}
): Promise<TestServerContext> {
  const port = options.port ?? 0;

  checkAndGenerateSecrets();

  await initDatabase({
    sync: true,
    force: options.forceSync ?? true,
  });

  // 初始化默认角色数据
  await seedDefaultRoles();

  testApp = createTestApp();

  return new Promise((resolve, reject) => {
    testServer = testApp!.listen(port, async () => {
      const address = testServer!.address();
      if (typeof address === "object" && address !== null) {
        const actualPort = address.port;
        const baseUrl = `http://localhost:${actualPort}`;
        const wsUrl = `ws://localhost:${actualPort}/ws`;

        // 初始化 WebSocket 服务器
        if (options.enableWebSocket) {
          await wsServer.init(testServer!, { path: "/ws" });
          wsEnabled = true;
        }

        resolve({
          app: testApp!,
          server: testServer!,
          baseUrl,
          wsUrl,
          port: actualPort,
        });
      } else {
        reject(new Error("Failed to get server address"));
      }
    });

    testServer.on("error", reject);
  });
}

/**
 * 停止测试服务器
 */
export async function stopTestServer(): Promise<void> {
  // 关闭 WebSocket 服务器
  if (wsEnabled) {
    await wsServer.close();
    wsEnabled = false;
  }

  if (testServer) {
    await new Promise<void>((resolve, reject) => {
      testServer!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    testServer = null;
    testApp = null;
  }

  await sequelize.close();
}

/**
 * 清理测试数据（重建所有表）
 */
export async function cleanupTestData(): Promise<void> {
  await sequelize.sync({ force: true });
  await seedDefaultRoles();
}

/**
 * 初始化默认角色数据
 */
async function seedDefaultRoles(): Promise<void> {
  const defaultRoles = [
    { id: "user", name: "普通用户", group: RoleGroup.USER },
    { id: "admin", name: "管理员", group: RoleGroup.ADMIN },
    { id: "system", name: "系统", group: RoleGroup.SYSTEM },
  ];

  for (const role of defaultRoles) {
    await Role.findOrCreate({
      where: { id: role.id },
      defaults: role,
    });
  }
}

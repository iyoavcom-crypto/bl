/**
 * @packageDocumentation
 * @module server
 * @since 1.0.0
 * @author Z-Kali
 * @tags [Express], [Server], [Startup], [HTTP], [API], [WebSocket]
 * @description 应用程序根启动入口：初始化数据库、中间件、路由并启动 HTTP/WebSocket 服务
 * @path src/server.ts
 * @see src/config/index.ts
 * @see src/routes/index.ts
 * @see src/models/index.ts
 */

import { createServer, type Server as HttpServer } from "http";
import { join } from "node:path";
import express, { type Express } from "express";
import "./utils/polyfills/crypto-polyfill.js";
import { env, initDatabase, checkAndGenerateSecrets } from "./config/index.js";
import "./models/index.js";
import {
  useCorsMiddleware,
  ensureRequestId,
  requestLogger,
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/index.js";
import routes from "./routes/index.js";
import { wsServer } from "./websocket/index.js";
import { startCallTimeoutTask, stopCallTimeoutTask } from "./tasks/index.js";
import SensitiveWordFilter from "./services/filter/sensitive.js";

/**
 * @function createApp
 * @description 创建并配置 Express 应用实例
 * @returns {Express} 配置完成的 Express 应用
 */
function createApp(): Express {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security & tracing middleware
  app.use(useCorsMiddleware());
  app.use(ensureRequestId);
  app.use(requestLogger);

  // Static file serving for uploads
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  // API routes
  app.use("/api", routes);

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

/**
 * @function bootstrap
 * @description 应用启动引导函数：初始化数据库、同步模型、启动 HTTP/WebSocket 服务
 * @returns {Promise<void>} 无返回值
 */
async function bootstrap(): Promise<void> {
  // Check and generate security secrets before startup
  checkAndGenerateSecrets();

  // Initialize database connection and sync models
  await initDatabase({ sync: true });

  // Initialize sensitive word filter
  await SensitiveWordFilter.init();

  // Create and start Express app
  const app = createApp();
  const { HOST: host, PORT: port } = env;

  // 创建 HTTP 服务器
  const httpServer: HttpServer = createServer(app);

  // 初始化 WebSocket 服务器
  await wsServer.init(httpServer, {
    path: "/ws",
  });

  httpServer.listen(port, host, () => {
    console.log(`[Server] Running on http://${host}:${port}`);
    console.log(`[Server] WebSocket available at ws://${host}:${port}/ws`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
  });

  // 启动定时任务
  startCallTimeoutTask();

  // 优雅关闭处理
  const shutdown = async (): Promise<void> => {
    console.log("[Server] 正在关闭服务器...");
    stopCallTimeoutTask();
    await wsServer.close();
    httpServer.close(() => {
      console.log("[Server] 服务器已关闭");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// Start application
bootstrap().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});

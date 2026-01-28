/**
 * @packageDocumentation
 * @module mcp-server/generators/ws-handler
 * @description WebSocket 事件处理代码生成器
 */

import type { WsEventDef } from "../data/index.js";

/**
 * 生成 WebSocket 事件处理代码示例
 * @param event - WebSocket 事件定义
 * @returns TypeScript 代码字符串
 */
export function generateWsHandler(event: WsEventDef): string {
  return `// 处理 ${event.description} 事件
// 事件类型: ${event.type}
// 载荷: ${event.payload}

wsManager.on("${event.type}", (payload) => {
  console.log("收到事件: ${event.type}", payload);

  // 处理事件
  // payload 类型: ${event.payload}
});`;
}

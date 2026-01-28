#!/usr/bin/env node
/**
 * @packageDocumentation
 * @module mcp-server
 * @description IM-API MCP Server - 为 AI 提供 IM API 上下文
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

/**
 * 启动 MCP 服务器
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IM-API MCP Server 已启动");
}

main().catch(console.error);

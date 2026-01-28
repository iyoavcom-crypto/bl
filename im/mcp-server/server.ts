/**
 * @packageDocumentation
 * @module mcp-server/server
 * @description MCP 服务器实例创建和配置
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOL_SCHEMAS, callTool } from "./tools/index.js";
import { RESOURCE_SCHEMAS, readResource } from "./resources/index.js";
import { PROMPT_SCHEMAS, getPrompt } from "./prompts/index.js";

/** 创建 MCP 服务器实例 */
export const server = new Server(
  {
    name: "im-api-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ============================================================
// Tools - 可调用的工具
// ============================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [...TOOL_SCHEMAS] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return callTool(name, args);
});

// ============================================================
// Resources - 可读取的资源
// ============================================================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: [...RESOURCE_SCHEMAS] };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  return readResource(uri);
});

// ============================================================
// Prompts - 预定义提示
// ============================================================

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts: [...PROMPT_SCHEMAS] };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return getPrompt(name, args ?? {});
});

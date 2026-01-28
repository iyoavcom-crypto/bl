/**
 * @packageDocumentation
 * @module mcp-server/prompts/schemas
 * @description 提示 Schema 定义
 */

/** 提示 Schema 定义 */
export const PROMPT_SCHEMAS = [
  {
    name: "implement_feature",
    description: "实现 IM 功能的完整指南",
    arguments: [
      {
        name: "feature",
        description: "要实现的功能：login, register, send_message, make_call, add_friend, create_group",
        required: true,
      },
    ],
  },
  {
    name: "debug_api",
    description: "调试 API 问题",
    arguments: [
      {
        name: "api_path",
        description: "出问题的 API 路径",
        required: true,
      },
      {
        name: "error",
        description: "错误信息",
        required: true,
      },
    ],
  },
] as const;

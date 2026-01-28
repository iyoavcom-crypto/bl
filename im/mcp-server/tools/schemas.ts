/**
 * @packageDocumentation
 * @module mcp-server/tools/schemas
 * @description 工具 Schema 定义
 */

/** 工具 Schema 定义 */
export const TOOL_SCHEMAS = [
  {
    name: "search_api",
    description: "搜索 IM API 接口。输入关键词（如 login、message、friend），返回匹配的 API 列表。",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "搜索关键词，如 login, register, message, friend, group, call",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_module_apis",
    description: "获取指定模块的所有 API。可用模块：认证、用户、设备、好友、群组、会话、消息、通话、在线状态、媒体",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description: "模块名称，如：认证、用户、设备、好友、群组、会话、消息、通话、presence、media",
        },
      },
      required: ["module"],
    },
  },
  {
    name: "search_ws_event",
    description: "搜索 WebSocket 事件类型。输入关键词返回匹配的事件定义。",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "搜索关键词，如 message, call, friend, group, typing",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_all_ws_events",
    description: "获取所有 WebSocket 事件类型列表",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_enums",
    description: "获取所有枚举常量定义，如设备平台、消息类型、通话状态等",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "generate_api_code",
    description: "生成 API 调用的 TypeScript 代码示例",
    inputSchema: {
      type: "object",
      properties: {
        apiPath: {
          type: "string",
          description: "API 路径，如 /api/auth/login 或 /api/im/messages",
        },
      },
      required: ["apiPath"],
    },
  },
  {
    name: "generate_ws_handler",
    description: "生成 WebSocket 事件处理的 TypeScript 代码示例",
    inputSchema: {
      type: "object",
      properties: {
        eventType: {
          type: "string",
          description: "事件类型，如 message:new, call:invite",
        },
      },
      required: ["eventType"],
    },
  },
  {
    name: "get_flow",
    description: "获取常用业务流程说明。可选流程：auth(认证)、message(消息)、call(通话)、friend(好友)、group(群组)",
    inputSchema: {
      type: "object",
      properties: {
        flow: {
          type: "string",
          description: "流程名称：auth, message, call, friend, group",
        },
      },
      required: ["flow"],
    },
  },
  {
    name: "generate_api_client",
    description: "生成基于 axios 的完整 API 客户端代码，适用于 Expo/React Native",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description: "模块名称：auth, user, device, friend, group, conversation, message, call, presence, media 或 all",
        },
      },
      required: ["module"],
    },
  },
  {
    name: "generate_ws_manager",
    description: "生成完整的 WebSocket 连接管理器代码，包含自动重连、心跳、事件订阅，适用于 Expo/React Native",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_error_codes",
    description: "获取错误码文档。输入错误码或关键词，返回错误原因和解决方案",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "错误码或关键词，如 401, Unauthorized, token, 过期",
        },
      },
      required: ["keyword"],
    },
  },
] as const;

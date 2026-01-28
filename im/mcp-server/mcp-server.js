#!/usr/bin/env node

// mcp-server/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// mcp-server/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// mcp-server/tools/schemas.ts
var TOOL_SCHEMAS = [
  {
    name: "search_api",
    description: "\u641C\u7D22 IM API \u63A5\u53E3\u3002\u8F93\u5165\u5173\u952E\u8BCD\uFF08\u5982 login\u3001message\u3001friend\uFF09\uFF0C\u8FD4\u56DE\u5339\u914D\u7684 API \u5217\u8868\u3002",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u5982 login, register, message, friend, group, call"
        }
      },
      required: ["keyword"]
    }
  },
  {
    name: "get_module_apis",
    description: "\u83B7\u53D6\u6307\u5B9A\u6A21\u5757\u7684\u6240\u6709 API\u3002\u53EF\u7528\u6A21\u5757\uFF1A\u8BA4\u8BC1\u3001\u7528\u6237\u3001\u8BBE\u5907\u3001\u597D\u53CB\u3001\u7FA4\u7EC4\u3001\u4F1A\u8BDD\u3001\u6D88\u606F\u3001\u901A\u8BDD\u3001\u5728\u7EBF\u72B6\u6001\u3001\u5A92\u4F53",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description: "\u6A21\u5757\u540D\u79F0\uFF0C\u5982\uFF1A\u8BA4\u8BC1\u3001\u7528\u6237\u3001\u8BBE\u5907\u3001\u597D\u53CB\u3001\u7FA4\u7EC4\u3001\u4F1A\u8BDD\u3001\u6D88\u606F\u3001\u901A\u8BDD\u3001presence\u3001media"
        }
      },
      required: ["module"]
    }
  },
  {
    name: "search_ws_event",
    description: "\u641C\u7D22 WebSocket \u4E8B\u4EF6\u7C7B\u578B\u3002\u8F93\u5165\u5173\u952E\u8BCD\u8FD4\u56DE\u5339\u914D\u7684\u4E8B\u4EF6\u5B9A\u4E49\u3002",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u5982 message, call, friend, group, typing"
        }
      },
      required: ["keyword"]
    }
  },
  {
    name: "get_all_ws_events",
    description: "\u83B7\u53D6\u6240\u6709 WebSocket \u4E8B\u4EF6\u7C7B\u578B\u5217\u8868",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_enums",
    description: "\u83B7\u53D6\u6240\u6709\u679A\u4E3E\u5E38\u91CF\u5B9A\u4E49\uFF0C\u5982\u8BBE\u5907\u5E73\u53F0\u3001\u6D88\u606F\u7C7B\u578B\u3001\u901A\u8BDD\u72B6\u6001\u7B49",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "generate_api_code",
    description: "\u751F\u6210 API \u8C03\u7528\u7684 TypeScript \u4EE3\u7801\u793A\u4F8B",
    inputSchema: {
      type: "object",
      properties: {
        apiPath: {
          type: "string",
          description: "API \u8DEF\u5F84\uFF0C\u5982 /api/auth/login \u6216 /api/im/messages"
        }
      },
      required: ["apiPath"]
    }
  },
  {
    name: "generate_ws_handler",
    description: "\u751F\u6210 WebSocket \u4E8B\u4EF6\u5904\u7406\u7684 TypeScript \u4EE3\u7801\u793A\u4F8B",
    inputSchema: {
      type: "object",
      properties: {
        eventType: {
          type: "string",
          description: "\u4E8B\u4EF6\u7C7B\u578B\uFF0C\u5982 message:new, call:invite"
        }
      },
      required: ["eventType"]
    }
  },
  {
    name: "get_flow",
    description: "\u83B7\u53D6\u5E38\u7528\u4E1A\u52A1\u6D41\u7A0B\u8BF4\u660E\u3002\u53EF\u9009\u6D41\u7A0B\uFF1Aauth(\u8BA4\u8BC1)\u3001message(\u6D88\u606F)\u3001call(\u901A\u8BDD)\u3001friend(\u597D\u53CB)\u3001group(\u7FA4\u7EC4)",
    inputSchema: {
      type: "object",
      properties: {
        flow: {
          type: "string",
          description: "\u6D41\u7A0B\u540D\u79F0\uFF1Aauth, message, call, friend, group"
        }
      },
      required: ["flow"]
    }
  },
  {
    name: "generate_api_client",
    description: "\u751F\u6210\u57FA\u4E8E axios \u7684\u5B8C\u6574 API \u5BA2\u6237\u7AEF\u4EE3\u7801\uFF0C\u9002\u7528\u4E8E Expo/React Native",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description: "\u6A21\u5757\u540D\u79F0\uFF1Aauth, user, device, friend, group, conversation, message, call, presence, media \u6216 all"
        }
      },
      required: ["module"]
    }
  },
  {
    name: "generate_ws_manager",
    description: "\u751F\u6210\u5B8C\u6574\u7684 WebSocket \u8FDE\u63A5\u7BA1\u7406\u5668\u4EE3\u7801\uFF0C\u5305\u542B\u81EA\u52A8\u91CD\u8FDE\u3001\u5FC3\u8DF3\u3001\u4E8B\u4EF6\u8BA2\u9605\uFF0C\u9002\u7528\u4E8E Expo/React Native",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_error_codes",
    description: "\u83B7\u53D6\u9519\u8BEF\u7801\u6587\u6863\u3002\u8F93\u5165\u9519\u8BEF\u7801\u6216\u5173\u952E\u8BCD\uFF0C\u8FD4\u56DE\u9519\u8BEF\u539F\u56E0\u548C\u89E3\u51B3\u65B9\u6848",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "\u9519\u8BEF\u7801\u6216\u5173\u952E\u8BCD\uFF0C\u5982 401, Unauthorized, token, \u8FC7\u671F"
        }
      },
      required: ["keyword"]
    }
  }
];

// mcp-server/data/api-modules.ts
var API_MODULES = [
  {
    name: "\u8BA4\u8BC1\u6A21\u5757",
    prefix: "/api/auth",
    description: "\u7528\u6237\u6CE8\u518C\u3001\u767B\u5F55\u3001\u767B\u51FA",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        description: "\u7528\u6237\u6CE8\u518C",
        auth: false,
        requestBody: "{ phone: string, password: string, pin: string }",
        responseBody: "{ user: User, access: string, refresh: string, payload: AuthPayload }"
      },
      {
        method: "POST",
        path: "/api/auth/login",
        description: "\u7528\u6237\u767B\u5F55",
        auth: false,
        requestBody: "{ phone: string, password: string }",
        responseBody: "{ user: User, access: string, refresh: string, payload: AuthPayload }"
      },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "\u83B7\u53D6\u5F53\u524D\u7528\u6237\u4FE1\u606F",
        auth: true,
        responseBody: "User"
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "\u9000\u51FA\u767B\u5F55",
        auth: true,
        responseBody: '{ message: "\u9000\u51FA\u6210\u529F" }'
      }
    ]
  },
  {
    name: "\u7528\u6237\u6A21\u5757",
    prefix: "/api/im/users",
    description: "\u7528\u6237\u8D44\u6599\u3001\u641C\u7D22\u3001\u5BC6\u7801\u7BA1\u7406",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/users/profile",
        description: "\u83B7\u53D6\u4E2A\u4EBA\u8D44\u6599",
        auth: true,
        responseBody: "User"
      },
      {
        method: "PUT",
        path: "/api/im/users/profile",
        description: "\u66F4\u65B0\u4E2A\u4EBA\u8D44\u6599",
        auth: true,
        requestBody: "{ name?: string, avatar?: string, gender?: string, location?: UserLocation, searchable?: boolean }",
        responseBody: "User"
      },
      {
        method: "POST",
        path: "/api/im/users/change-password",
        description: "\u4FEE\u6539\u5BC6\u7801",
        auth: true,
        requestBody: "{ oldPassword: string, newPassword: string }",
        responseBody: '{ message: "\u5BC6\u7801\u4FEE\u6539\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/users/change-pin",
        description: "\u4FEE\u6539\u4E8C\u7EA7\u5BC6\u7801",
        auth: true,
        requestBody: "{ password: string, newPin: string }",
        responseBody: '{ message: "\u4E8C\u7EA7\u5BC6\u7801\u4FEE\u6539\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/users/verify-pin",
        description: "\u9A8C\u8BC1\u4E8C\u7EA7\u5BC6\u7801",
        auth: true,
        requestBody: "{ pin: string }",
        responseBody: "{ valid: boolean }"
      },
      {
        method: "GET",
        path: "/api/im/users/search",
        description: "\u641C\u7D22\u7528\u6237",
        auth: true,
        params: "keyword: string, limit?: number",
        responseBody: "UserPublic[]"
      },
      {
        method: "GET",
        path: "/api/im/users/:userId",
        description: "\u83B7\u53D6\u7528\u6237\u516C\u5F00\u4FE1\u606F",
        auth: true,
        responseBody: "UserPublic"
      }
    ]
  },
  {
    name: "\u8BBE\u5907\u7BA1\u7406",
    prefix: "/api/im/devices",
    description: "\u8BBE\u5907\u6CE8\u518C\u3001\u63A8\u9001\u4EE4\u724C\u3001\u5FC3\u8DF3",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/devices",
        description: "\u83B7\u53D6\u8BBE\u5907\u5217\u8868",
        auth: true,
        responseBody: "Device[]"
      },
      {
        method: "POST",
        path: "/api/im/devices/register",
        description: "\u6CE8\u518C\u8BBE\u5907",
        auth: true,
        requestBody: '{ platform: "ios"|"android"|"web"|"macos"|"windows", deviceId: string, deviceName?: string, pushToken?: string, pushProvider?: "apns"|"expo"|"fcm", appVersion?: string, osVersion?: string }',
        responseBody: "Device"
      },
      {
        method: "GET",
        path: "/api/im/devices/:deviceId",
        description: "\u83B7\u53D6\u8BBE\u5907\u8BE6\u60C5",
        auth: true,
        responseBody: "Device"
      },
      {
        method: "PUT",
        path: "/api/im/devices/:deviceId",
        description: "\u66F4\u65B0\u8BBE\u5907\u4FE1\u606F",
        auth: true,
        requestBody: "{ deviceName?: string, pushToken?: string, pushProvider?: string, appVersion?: string, osVersion?: string, doNotDisturb?: boolean }",
        responseBody: "Device"
      },
      {
        method: "DELETE",
        path: "/api/im/devices/:deviceId",
        description: "\u5220\u9664\u8BBE\u5907",
        auth: true
      },
      {
        method: "POST",
        path: "/api/im/devices/:deviceId/push-token",
        description: "\u66F4\u65B0\u63A8\u9001\u4EE4\u724C",
        auth: true,
        requestBody: "{ pushToken: string, pushProvider: string }",
        responseBody: "Device"
      },
      {
        method: "POST",
        path: "/api/im/devices/:deviceId/heartbeat",
        description: "\u8BBE\u5907\u5FC3\u8DF3",
        auth: true,
        responseBody: "{ online: boolean, lastActiveAt: string }"
      },
      {
        method: "POST",
        path: "/api/im/devices/:deviceId/offline",
        description: "\u8BBE\u5907\u4E0B\u7EBF",
        auth: true,
        responseBody: "{ online: false }"
      }
    ]
  },
  {
    name: "\u597D\u53CB\u6A21\u5757",
    prefix: "/api/im/friends",
    description: "\u597D\u53CB\u5173\u7CFB\u3001\u597D\u53CB\u7533\u8BF7",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/friends",
        description: "\u83B7\u53D6\u597D\u53CB\u5217\u8868",
        auth: true,
        params: "page?: number, limit?: number, isBlocked?: boolean, isPinned?: boolean",
        responseBody: "{ list: Friend[], total: number, page: number, limit: number }"
      },
      {
        method: "GET",
        path: "/api/im/friends/:userId",
        description: "\u83B7\u53D6\u597D\u53CB\u8BE6\u60C5",
        auth: true,
        responseBody: "Friend"
      },
      {
        method: "PUT",
        path: "/api/im/friends/:userId",
        description: "\u66F4\u65B0\u597D\u53CB\u8BBE\u7F6E",
        auth: true,
        requestBody: "{ alias?: string, isBlocked?: boolean, doNotDisturb?: boolean, isPinned?: boolean }",
        responseBody: "Friend"
      },
      {
        method: "DELETE",
        path: "/api/im/friends/:userId",
        description: "\u5220\u9664\u597D\u53CB",
        auth: true
      },
      {
        method: "GET",
        path: "/api/im/friends/check/:userId",
        description: "\u68C0\u67E5\u662F\u5426\u4E3A\u597D\u53CB",
        auth: true,
        responseBody: "{ isFriend: boolean }"
      },
      {
        method: "POST",
        path: "/api/im/friends/requests",
        description: "\u53D1\u9001\u597D\u53CB\u7533\u8BF7",
        auth: true,
        requestBody: '{ toUserId: string, message?: string, source: "search"|"qr"|"phone"|"invite" }',
        responseBody: "FriendRequest"
      },
      {
        method: "GET",
        path: "/api/im/friends/requests/received",
        description: "\u83B7\u53D6\u6536\u5230\u7684\u597D\u53CB\u7533\u8BF7",
        auth: true,
        params: "status?: string",
        responseBody: "FriendRequest[]"
      },
      {
        method: "GET",
        path: "/api/im/friends/requests/sent",
        description: "\u83B7\u53D6\u53D1\u51FA\u7684\u597D\u53CB\u7533\u8BF7",
        auth: true,
        params: "status?: string",
        responseBody: "FriendRequest[]"
      },
      {
        method: "POST",
        path: "/api/im/friends/requests/:requestId/accept",
        description: "\u63A5\u53D7\u597D\u53CB\u7533\u8BF7",
        auth: true,
        responseBody: "{ friend: Friend, reverse: Friend, conversationId: string }"
      },
      {
        method: "POST",
        path: "/api/im/friends/requests/:requestId/reject",
        description: "\u62D2\u7EDD\u597D\u53CB\u7533\u8BF7",
        auth: true,
        responseBody: "FriendRequest"
      }
    ]
  },
  {
    name: "\u597D\u53CB\u7533\u8BF7 CRUD",
    prefix: "/api/im/friend-requests",
    description: "\u597D\u53CB\u7533\u8BF7\u7BA1\u7406 CRUD",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/friend-requests",
        description: "\u83B7\u53D6\u597D\u53CB\u7533\u8BF7\u5217\u8868",
        auth: true,
        params: "page?: number, limit?: number, status?: string",
        responseBody: "{ list: FriendRequest[], total: number, page: number, limit: number }"
      },
      {
        method: "POST",
        path: "/api/im/friend-requests",
        description: "\u53D1\u9001\u597D\u53CB\u7533\u8BF7",
        auth: true,
        requestBody: '{ toUserId: string, message?: string, source: "search"|"qr"|"phone"|"invite" }',
        responseBody: "FriendRequest"
      },
      {
        method: "GET",
        path: "/api/im/friend-requests/:id",
        description: "\u83B7\u53D6\u597D\u53CB\u7533\u8BF7\u8BE6\u60C5",
        auth: true,
        responseBody: "FriendRequest"
      },
      {
        method: "PUT",
        path: "/api/im/friend-requests/:id",
        description: "\u5904\u7406\u597D\u53CB\u7533\u8BF7\uFF08\u63A5\u53D7/\u62D2\u7EDD\uFF09",
        auth: true,
        requestBody: '{ status: "accepted"|"rejected" }',
        responseBody: "FriendRequest"
      },
      {
        method: "DELETE",
        path: "/api/im/friend-requests/:id",
        description: "\u5220\u9664\u597D\u53CB\u7533\u8BF7",
        auth: true
      }
    ]
  },
  {
    name: "\u7FA4\u7EC4\u6A21\u5757",
    prefix: "/api/im/groups",
    description: "\u7FA4\u7EC4\u521B\u5EFA\u3001\u6210\u5458\u7BA1\u7406",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/groups",
        description: "\u83B7\u53D6\u6211\u7684\u7FA4\u7EC4\u5217\u8868",
        auth: true,
        responseBody: "Group[]"
      },
      {
        method: "POST",
        path: "/api/im/groups",
        description: "\u521B\u5EFA\u7FA4\u7EC4",
        auth: true,
        requestBody: '{ name: string, avatar?: string, description?: string, joinMode?: "open"|"approval"|"invite", memberIds?: string[] }',
        responseBody: "Group"
      },
      {
        method: "GET",
        path: "/api/im/groups/:groupId",
        description: "\u83B7\u53D6\u7FA4\u7EC4\u8BE6\u60C5",
        auth: true,
        responseBody: "Group"
      },
      {
        method: "PUT",
        path: "/api/im/groups/:groupId",
        description: "\u66F4\u65B0\u7FA4\u7EC4\u4FE1\u606F",
        auth: true,
        requestBody: "{ name?: string, avatar?: string, description?: string, joinMode?: string, muteAll?: boolean }",
        responseBody: "Group"
      },
      {
        method: "DELETE",
        path: "/api/im/groups/:groupId",
        description: "\u89E3\u6563\u7FA4\u7EC4\uFF08\u4EC5\u7FA4\u4E3B\uFF09",
        auth: true
      },
      {
        method: "GET",
        path: "/api/im/groups/:groupId/members",
        description: "\u83B7\u53D6\u7FA4\u6210\u5458\u5217\u8868",
        auth: true,
        responseBody: "GroupMember[]"
      },
      {
        method: "POST",
        path: "/api/im/groups/:groupId/invite",
        description: "\u9080\u8BF7\u6210\u5458",
        auth: true,
        requestBody: "{ userIds: string[] }",
        responseBody: "GroupMember[]"
      },
      {
        method: "POST",
        path: "/api/im/groups/:groupId/kick/:userId",
        description: "\u8E22\u51FA\u6210\u5458",
        auth: true
      },
      {
        method: "POST",
        path: "/api/im/groups/:groupId/leave",
        description: "\u9000\u51FA\u7FA4\u7EC4",
        auth: true
      },
      {
        method: "POST",
        path: "/api/im/groups/:groupId/transfer",
        description: "\u8F6C\u8BA9\u7FA4\u4E3B",
        auth: true,
        requestBody: "{ newOwnerId: string }",
        responseBody: '{ message: "\u8F6C\u8BA9\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/groups/:groupId/admin/:userId",
        description: "\u8BBE\u7F6E\u7BA1\u7406\u5458",
        auth: true,
        responseBody: '{ message: "\u8BBE\u7F6E\u6210\u529F" }'
      },
      {
        method: "DELETE",
        path: "/api/im/groups/:groupId/admin/:userId",
        description: "\u53D6\u6D88\u7BA1\u7406\u5458",
        auth: true,
        responseBody: '{ message: "\u53D6\u6D88\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/groups/:groupId/mute/:userId",
        description: "\u7981\u8A00\u6210\u5458",
        auth: true,
        requestBody: "{ duration?: number }",
        responseBody: '{ message: "\u7981\u8A00\u6210\u529F" }'
      },
      {
        method: "DELETE",
        path: "/api/im/groups/:groupId/mute/:userId",
        description: "\u89E3\u9664\u7981\u8A00",
        auth: true,
        responseBody: '{ message: "\u89E3\u9664\u7981\u8A00\u6210\u529F" }'
      }
    ]
  },
  {
    name: "\u7FA4\u6210\u5458 CRUD",
    prefix: "/api/im/group-members",
    description: "\u7FA4\u6210\u5458\u7BA1\u7406 CRUD",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/group-members",
        description: "\u83B7\u53D6\u7FA4\u6210\u5458\u5217\u8868",
        auth: true,
        params: "groupId?: string, page?: number, limit?: number",
        responseBody: "{ list: GroupMember[], total: number, page: number, limit: number }"
      },
      {
        method: "POST",
        path: "/api/im/group-members",
        description: "\u6DFB\u52A0\u7FA4\u6210\u5458",
        auth: true,
        requestBody: '{ groupId: string, userId: string, role?: "admin"|"member" }',
        responseBody: "GroupMember"
      },
      {
        method: "GET",
        path: "/api/im/group-members/:id",
        description: "\u83B7\u53D6\u7FA4\u6210\u5458\u8BE6\u60C5",
        auth: true,
        responseBody: "GroupMember"
      },
      {
        method: "PUT",
        path: "/api/im/group-members/:id",
        description: "\u66F4\u65B0\u7FA4\u6210\u5458\u4FE1\u606F\uFF08\u6635\u79F0/\u89D2\u8272/\u7981\u8A00\u7B49\uFF09",
        auth: true,
        requestBody: '{ groupNickname?: string, role?: "admin"|"member", isMuted?: boolean, muteUntil?: string }',
        responseBody: "GroupMember"
      },
      {
        method: "DELETE",
        path: "/api/im/group-members/:id",
        description: "\u79FB\u9664\u7FA4\u6210\u5458",
        auth: true
      }
    ]
  },
  {
    name: "\u4F1A\u8BDD\u6A21\u5757",
    prefix: "/api/im/conversations",
    description: "\u4F1A\u8BDD\u5217\u8868\u3001\u79C1\u804A",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/conversations",
        description: "\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868",
        auth: true,
        responseBody: "Conversation[]"
      },
      {
        method: "POST",
        path: "/api/im/conversations/private",
        description: "\u53D1\u8D77\u79C1\u804A",
        auth: true,
        requestBody: "{ targetUserId: string }",
        responseBody: "Conversation"
      },
      {
        method: "GET",
        path: "/api/im/conversations/:conversationId",
        description: "\u83B7\u53D6\u4F1A\u8BDD\u8BE6\u60C5",
        auth: true,
        responseBody: "Conversation"
      },
      {
        method: "DELETE",
        path: "/api/im/conversations/:conversationId",
        description: "\u5220\u9664\u4F1A\u8BDD",
        auth: true
      },
      {
        method: "POST",
        path: "/api/im/conversations/:conversationId/clear-unread",
        description: "\u6E05\u7A7A\u672A\u8BFB",
        auth: true,
        responseBody: '{ message: "\u6E05\u7A7A\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/conversations/:conversationId/typing",
        description: "\u53D1\u9001\u8F93\u5165\u72B6\u6001",
        auth: true,
        requestBody: "{ isTyping: boolean }",
        responseBody: '{ message: "\u72B6\u6001\u5DF2\u53D1\u9001" }'
      }
    ]
  },
  {
    name: "\u6D88\u606F\u6A21\u5757",
    prefix: "/api/im/messages",
    description: "\u6D88\u606F\u53D1\u9001\u3001\u64A4\u56DE\u3001\u5DF2\u8BFB",
    endpoints: [
      {
        method: "POST",
        path: "/api/im/messages",
        description: "\u53D1\u9001\u6D88\u606F",
        auth: true,
        requestBody: '{ conversationId: string, type: "text"|"image"|"voice", content?: string, mediaUrl?: string, mediaDuration?: number, replyToId?: string }',
        responseBody: "Message"
      },
      {
        method: "GET",
        path: "/api/im/messages/conversation/:conversationId",
        description: "\u83B7\u53D6\u4F1A\u8BDD\u6D88\u606F\u5217\u8868",
        auth: true,
        params: "page?: number, limit?: number",
        responseBody: "{ list: Message[], total: number, page: number, limit: number }"
      },
      {
        method: "GET",
        path: "/api/im/messages/:messageId",
        description: "\u83B7\u53D6\u6D88\u606F\u8BE6\u60C5",
        auth: true,
        responseBody: "Message"
      },
      {
        method: "POST",
        path: "/api/im/messages/:messageId/recall",
        description: "\u64A4\u56DE\u6D88\u606F\uFF08120\u79D2\u5185\uFF09",
        auth: true,
        responseBody: "Message"
      },
      {
        method: "POST",
        path: "/api/im/messages/:messageId/forward",
        description: "\u8F6C\u53D1\u6D88\u606F",
        auth: true,
        requestBody: "{ conversationIds: string[] }",
        responseBody: "Message[]"
      },
      {
        method: "POST",
        path: "/api/im/messages/conversation/:conversationId/read",
        description: "\u6807\u8BB0\u5DF2\u8BFB",
        auth: true,
        requestBody: "{ messageId: string }",
        responseBody: '{ message: "\u6807\u8BB0\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/messages/:messageId/delivered",
        description: "\u6807\u8BB0\u9001\u8FBE",
        auth: true,
        responseBody: '{ message: "\u6807\u8BB0\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/messages/batch-delivered",
        description: "\u6279\u91CF\u6807\u8BB0\u9001\u8FBE",
        auth: true,
        requestBody: "{ messageIds: string[] }",
        responseBody: '{ message: "\u6279\u91CF\u6807\u8BB0\u6210\u529F" }'
      },
      {
        method: "POST",
        path: "/api/im/messages/search",
        description: "\u641C\u7D22\u6D88\u606F",
        auth: true,
        requestBody: "{ keyword: string, conversationId?: string, senderId?: string, type?: string, startDate?: string, endDate?: string, limit?: number, offset?: number }",
        responseBody: "{ messages: Message[], total: number, hasMore: boolean }"
      }
    ]
  },
  {
    name: "\u901A\u8BDD\u6A21\u5757",
    prefix: "/api/im/calls",
    description: "\u8BED\u97F3\u901A\u8BDD\u3001WebRTC \u4FE1\u4EE4",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/calls",
        description: "\u83B7\u53D6\u901A\u8BDD\u8BB0\u5F55",
        auth: true,
        params: "page?: number, limit?: number",
        responseBody: "{ list: Call[], total: number, page: number, limit: number }"
      },
      {
        method: "POST",
        path: "/api/im/calls/initiate",
        description: "\u53D1\u8D77\u901A\u8BDD",
        auth: true,
        requestBody: "{ calleeId: string }",
        responseBody: "Call"
      },
      {
        method: "GET",
        path: "/api/im/calls/:callId",
        description: "\u83B7\u53D6\u901A\u8BDD\u8BE6\u60C5",
        auth: true,
        responseBody: "Call"
      },
      {
        method: "POST",
        path: "/api/im/calls/:callId/ring",
        description: "\u54CD\u94C3\uFF08\u88AB\u53EB\u6536\u5230\u540E\u8C03\u7528\uFF09",
        auth: true,
        responseBody: "Call"
      },
      {
        method: "POST",
        path: "/api/im/calls/:callId/accept",
        description: "\u63A5\u542C\u901A\u8BDD",
        auth: true,
        responseBody: "Call"
      },
      {
        method: "POST",
        path: "/api/im/calls/:callId/reject",
        description: "\u62D2\u63A5\u901A\u8BDD",
        auth: true,
        responseBody: "Call"
      },
      {
        method: "POST",
        path: "/api/im/calls/:callId/hangup",
        description: "\u6302\u65AD\u901A\u8BDD",
        auth: true,
        responseBody: "Call"
      },
      {
        method: "POST",
        path: "/api/im/calls/:callId/signal",
        description: "\u53D1\u9001 WebRTC \u4FE1\u4EE4",
        auth: true,
        requestBody: '{ signalType: "offer"|"answer"|"ice-candidate", signalData: { sdp?: string, candidate?: string, sdpMid?: string, sdpMLineIndex?: number } }',
        responseBody: '{ message: "\u4FE1\u4EE4\u5DF2\u53D1\u9001" }'
      }
    ]
  },
  {
    name: "\u5728\u7EBF\u72B6\u6001",
    prefix: "/api/im/presence",
    description: "\u7528\u6237\u5728\u7EBF\u72B6\u6001\u67E5\u8BE2",
    endpoints: [
      {
        method: "GET",
        path: "/api/im/presence/check/:userId",
        description: "\u68C0\u67E5\u7528\u6237\u662F\u5426\u5728\u7EBF",
        auth: true,
        responseBody: "{ userId: string, isOnline: boolean }"
      },
      {
        method: "GET",
        path: "/api/im/presence/status/:userId",
        description: "\u83B7\u53D6\u7528\u6237\u8BE6\u7EC6\u5728\u7EBF\u72B6\u6001",
        auth: true,
        responseBody: "{ userId: string, isOnline: boolean, lastOnlineAt?: string, onlineDeviceCount?: number }"
      },
      {
        method: "POST",
        path: "/api/im/presence/batch",
        description: "\u6279\u91CF\u83B7\u53D6\u5728\u7EBF\u72B6\u6001",
        auth: true,
        requestBody: "{ userIds: string[] }",
        responseBody: "PresenceStatus[]"
      },
      {
        method: "GET",
        path: "/api/im/presence/friends",
        description: "\u83B7\u53D6\u597D\u53CB\u5728\u7EBF\u72B6\u6001",
        auth: true,
        responseBody: "PresenceStatus[]"
      }
    ]
  },
  {
    name: "\u5A92\u4F53\u6587\u4EF6",
    prefix: "/api/im/media",
    description: "\u6587\u4EF6\u4E0A\u4F20",
    endpoints: [
      {
        method: "POST",
        path: "/api/im/media/upload",
        description: "\u4E0A\u4F20\u5355\u4E2A\u6587\u4EF6",
        auth: true,
        requestBody: "multipart/form-data: file",
        responseBody: "{ type: string, url: string, filename: string, originalName: string, mimeType: string, size: number }"
      },
      {
        method: "POST",
        path: "/api/im/media/upload/multiple",
        description: "\u4E0A\u4F20\u591A\u4E2A\u6587\u4EF6\uFF08\u6700\u591A9\u4E2A\uFF09",
        auth: true,
        requestBody: "multipart/form-data: files[]",
        responseBody: "MediaUploadResult[]"
      },
      {
        method: "DELETE",
        path: "/api/im/media/:type/:filename",
        description: "\u5220\u9664\u6587\u4EF6",
        auth: true
      },
      {
        method: "GET",
        path: "/api/im/media/limits",
        description: "\u83B7\u53D6\u4E0A\u4F20\u9650\u5236",
        auth: true,
        responseBody: "{ allowedTypes: string[], sizeLimits: { image: number, audio: number, video: number, file: number }, maxFiles: number }"
      }
    ]
  }
];

// mcp-server/data/ws-events.ts
var WS_EVENTS = [
  // 连接事件
  { type: "connected", description: "\u8FDE\u63A5\u6210\u529F", payload: "{ userId: string, deviceId: string, serverTime: number }" },
  { type: "message:new", description: "\u65B0\u6D88\u606F", payload: "{ conversationId: string, message: Message }" },
  { type: "message:recalled", description: "\u6D88\u606F\u64A4\u56DE", payload: "{ conversationId: string, messageId: string, recalledBy: string, recalledAt: number }" },
  { type: "message:read", description: "\u6D88\u606F\u5DF2\u8BFB", payload: "{ conversationId: string, userId: string, lastReadMessageId: string, readAt: number }" },
  { type: "message:delivered", description: "\u6D88\u606F\u9001\u8FBE", payload: "{ conversationId: string, messageId: string, deliveredTo: string, deliveredAt: number }" },
  { type: "typing:start", description: "\u5F00\u59CB\u8F93\u5165", payload: "{ conversationId: string, userId: string, startedAt: number }" },
  { type: "typing:stop", description: "\u505C\u6B62\u8F93\u5165", payload: "{ conversationId: string, userId: string, stoppedAt: number }" },
  { type: "call:invite", description: "\u6765\u7535\u9080\u8BF7", payload: "{ callId: string, callerId: string, calleeId: string, conversationId: string, createdAt: number }" },
  { type: "call:ring", description: "\u54CD\u94C3", payload: "{ callId: string, calleeId: string, ringAt: number }" },
  { type: "call:answer", description: "\u63A5\u542C", payload: "{ callId: string, answeredBy: string, startedAt: number }" },
  { type: "call:reject", description: "\u62D2\u7EDD", payload: "{ callId: string, rejectedBy: string }" },
  { type: "call:end", description: "\u901A\u8BDD\u7ED3\u675F", payload: "{ callId: string, endedBy: string, status: CallStatus, endReason: CallEndReason | null, duration: number | null, endedAt: number }" },
  { type: "call:signal", description: "WebRTC \u4FE1\u4EE4", payload: "{ callId: string, fromUserId: string, signalType: SignalType, signalData: SignalData, sentAt: number }" },
  { type: "presence:online", description: "\u7528\u6237\u4E0A\u7EBF", payload: "{ userId: string, deviceId: string, onlineAt: number }" },
  { type: "presence:offline", description: "\u7528\u6237\u4E0B\u7EBF", payload: "{ userId: string, deviceId: string, offlineAt: number }" },
  { type: "friend:request", description: "\u597D\u53CB\u7533\u8BF7", payload: "{ requestId: string, fromUser: UserPublic, message: string | null, source: FriendSource, createdAt: number }" },
  { type: "friend:accepted", description: "\u597D\u53CB\u7533\u8BF7\u88AB\u63A5\u53D7", payload: "{ requestId: string, friendUser: UserPublic, conversationId: string, acceptedAt: number }" },
  { type: "group:invited", description: "\u88AB\u9080\u8BF7\u5165\u7FA4", payload: "{ groupId: string, groupName: string, groupAvatar: string | null, inviter: UserPublic, invitedAt: number }" },
  { type: "group:kicked", description: "\u88AB\u8E22\u51FA\u7FA4", payload: "{ groupId: string, groupName: string, operatorId: string, kickedAt: number }" },
  { type: "group:member_joined", description: "\u6210\u5458\u5165\u7FA4", payload: "{ groupId: string, member: UserPublic, inviterId: string | null, joinedAt: number }" },
  { type: "group:member_left", description: "\u6210\u5458\u9000\u7FA4", payload: "{ groupId: string, userId: string, leftAt: number }" },
  { type: "group:updated", description: "\u7FA4\u4FE1\u606F\u66F4\u65B0", payload: "{ groupId: string, changes: GroupChanges, operatorId: string, updatedAt: number }" },
  { type: "group:muted", description: "\u88AB\u7981\u8A00", payload: "{ groupId: string, groupName: string, operatorId: string, duration: number | null, muteEndAt: string | null, mutedAt: number }" },
  { type: "group:unmuted", description: "\u88AB\u89E3\u7981", payload: "{ groupId: string, groupName: string, operatorId: string, unmutedAt: number }" },
  { type: "group:dissolved", description: "\u7FA4\u7EC4\u89E3\u6563", payload: "{ groupId: string, groupName: string, dissolvedAt: number }" },
  { type: "heartbeat:ack", description: "\u5FC3\u8DF3\u54CD\u5E94", payload: "{ serverTime: number }" },
  { type: "kick", description: "\u88AB\u8E22\u4E0B\u7EBF", payload: "{ reason: string, newDeviceId?: string }" },
  { type: "error", description: "\u9519\u8BEF", payload: "{ code: number, message: string, details?: unknown }" }
];

// mcp-server/data/enums.ts
var ENUMS = {
  DevicePlatform: ["ios", "android", "web", "macos", "windows"],
  PushProvider: ["apns", "expo", "fcm"],
  FriendSource: ["search", "qr", "phone", "invite"],
  FriendRequestStatus: ["pending", "accepted", "rejected", "ignored"],
  MessageType: ["text", "image", "voice"],
  GroupJoinMode: ["open", "approval", "invite"],
  GroupMemberRole: ["owner", "admin", "member"],
  ConversationType: ["private", "group"],
  CallStatus: ["initiated", "ringing", "connected", "ended", "missed", "rejected", "busy"],
  CallEndReason: ["caller_hangup", "callee_hangup", "timeout", "network_error"],
  Gender: ["male", "female", "unknown"],
  SignalType: ["offer", "answer", "ice-candidate"],
  UserState: ["normal", "muted", "banned", "canceled", "risk_controlled"]
};

// mcp-server/data/error-codes.ts
var ERROR_CODES = [
  // HTTP 通用错误
  {
    code: "BadRequest",
    httpStatus: 400,
    description: "\u8BF7\u6C42\u53C2\u6570\u9519\u8BEF",
    cause: "\u8BF7\u6C42\u4F53\u683C\u5F0F\u9519\u8BEF\u3001\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5\u3001\u5B57\u6BB5\u7C7B\u578B\u4E0D\u5339\u914D",
    solution: "\u68C0\u67E5\u8BF7\u6C42\u4F53 JSON \u683C\u5F0F\uFF0C\u786E\u4FDD\u6240\u6709\u5FC5\u586B\u5B57\u6BB5\u5B58\u5728\u4E14\u7C7B\u578B\u6B63\u786E"
  },
  {
    code: "Unauthorized",
    httpStatus: 401,
    description: "\u672A\u8BA4\u8BC1",
    cause: "\u7F3A\u5C11 Authorization \u5934\u3001Token \u65E0\u6548\u6216\u5DF2\u8FC7\u671F",
    solution: "\u68C0\u67E5 Authorization: Bearer <token> \u5934\u662F\u5426\u6B63\u786E\uFF0CToken \u8FC7\u671F\u65F6\u4F7F\u7528 refresh token \u5237\u65B0"
  },
  {
    code: "Forbidden",
    httpStatus: 403,
    description: "\u65E0\u6743\u9650",
    cause: "\u5DF2\u8BA4\u8BC1\u4F46\u65E0\u6743\u8BBF\u95EE\u8BE5\u8D44\u6E90\uFF08\u975E\u597D\u53CB\u3001\u975E\u7FA4\u6210\u5458\u3001\u975E\u7BA1\u7406\u5458\u7B49\uFF09",
    solution: "\u786E\u8BA4\u5F53\u524D\u7528\u6237\u662F\u5426\u6709\u8BE5\u64CD\u4F5C\u7684\u6743\u9650\uFF0C\u5982\u64CD\u4F5C\u4ED6\u4EBA\u8D44\u6E90\u9700\u5148\u5EFA\u7ACB\u5173\u7CFB"
  },
  {
    code: "NotFound",
    httpStatus: 404,
    description: "\u8D44\u6E90\u4E0D\u5B58\u5728",
    cause: "\u8BF7\u6C42\u7684\u7528\u6237\u3001\u6D88\u606F\u3001\u7FA4\u7EC4\u3001\u4F1A\u8BDD\u7B49\u8D44\u6E90\u4E0D\u5B58\u5728\u6216\u5DF2\u5220\u9664",
    solution: "\u68C0\u67E5\u8D44\u6E90 ID \u662F\u5426\u6B63\u786E\uFF0C\u8D44\u6E90\u53EF\u80FD\u5DF2\u88AB\u5220\u9664"
  },
  {
    code: "ServerError",
    httpStatus: 500,
    description: "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF",
    cause: "\u670D\u52A1\u7AEF\u5F02\u5E38",
    solution: "\u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF0C\u5982\u6301\u7EED\u51FA\u73B0\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458"
  },
  // JWT 相关错误
  {
    code: "MISSING_TOKEN",
    httpStatus: 401,
    description: "\u7F3A\u5C11\u6388\u6743\u4EE4\u724C",
    cause: "\u8BF7\u6C42\u5934\u672A\u643A\u5E26 Authorization",
    solution: "\u5728\u8BF7\u6C42\u5934\u6DFB\u52A0 Authorization: Bearer <access_token>"
  },
  {
    code: "MALFORMED",
    httpStatus: 400,
    description: "\u4EE4\u724C\u683C\u5F0F\u9519\u8BEF",
    cause: "Token \u4E0D\u662F\u6709\u6548\u7684 JWT \u683C\u5F0F",
    solution: "\u68C0\u67E5 Token \u662F\u5426\u5B8C\u6574\uFF0C\u683C\u5F0F\u5E94\u4E3A xxxxx.yyyyy.zzzzz"
  },
  {
    code: "INVALID",
    httpStatus: 401,
    description: "\u65E0\u6548\u4EE4\u724C",
    cause: "Token \u7B7E\u540D\u9A8C\u8BC1\u5931\u8D25",
    solution: "Token \u53EF\u80FD\u88AB\u7BE1\u6539\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u83B7\u53D6\u65B0 Token"
  },
  {
    code: "EXPIRED",
    httpStatus: 401,
    description: "\u4EE4\u724C\u5DF2\u8FC7\u671F",
    cause: "Access Token \u8D85\u8FC7\u6709\u6548\u671F\uFF08\u9ED8\u8BA4 15 \u5206\u949F\uFF09",
    solution: "\u4F7F\u7528 refresh token \u8C03\u7528 /api/auth/refresh \u83B7\u53D6\u65B0 access token"
  },
  {
    code: "DEVICE_MISMATCH",
    httpStatus: 401,
    description: "\u8BBE\u5907\u4E0D\u5339\u914D",
    cause: "Token \u7ED1\u5B9A\u7684\u8BBE\u5907 ID \u4E0E\u8BF7\u6C42\u7684\u8BBE\u5907 ID \u4E0D\u4E00\u81F4",
    solution: "\u786E\u4FDD\u4F7F\u7528\u540C\u4E00\u8BBE\u5907\u7684 Token\uFF0C\u6216\u91CD\u65B0\u767B\u5F55"
  },
  {
    code: "REVOKED",
    httpStatus: 401,
    description: "\u4EE4\u724C\u5DF2\u64A4\u9500",
    cause: "Token \u88AB\u4E3B\u52A8\u64A4\u9500\uFF08\u7528\u6237\u767B\u51FA\u6216\u88AB\u8E22\u4E0B\u7EBF\uFF09",
    solution: "\u91CD\u65B0\u767B\u5F55\u83B7\u53D6\u65B0 Token"
  },
  // WebSocket 错误
  {
    code: "4001",
    httpStatus: 4001,
    description: "WebSocket \u8BA4\u8BC1\u5931\u8D25",
    cause: "\u8FDE\u63A5\u65F6\u63D0\u4F9B\u7684 token \u65E0\u6548",
    solution: "\u4F7F\u7528\u6709\u6548\u7684 access token \u91CD\u65B0\u8FDE\u63A5: ws://host/ws?token=xxx&deviceId=xxx"
  },
  {
    code: "4002",
    httpStatus: 4002,
    description: "WebSocket \u8BBE\u5907\u88AB\u8E22",
    cause: "\u540C\u8D26\u53F7\u5728\u5176\u4ED6\u8BBE\u5907\u767B\u5F55",
    solution: "\u5355\u8BBE\u5907\u767B\u5F55\u7B56\u7565\uFF0C\u9700\u8981\u5728\u65B0\u8BBE\u5907\u91CD\u65B0\u767B\u5F55"
  },
  // 业务错误
  {
    code: "PHONE_EXISTS",
    httpStatus: 400,
    description: "\u624B\u673A\u53F7\u5DF2\u6CE8\u518C",
    cause: "\u8BE5\u624B\u673A\u53F7\u5DF2\u88AB\u5176\u4ED6\u7528\u6237\u6CE8\u518C",
    solution: "\u4F7F\u7528\u5176\u4ED6\u624B\u673A\u53F7\u6CE8\u518C\uFF0C\u6216\u627E\u56DE\u5DF2\u6709\u8D26\u53F7"
  },
  {
    code: "WRONG_PASSWORD",
    httpStatus: 401,
    description: "\u5BC6\u7801\u9519\u8BEF",
    cause: "\u767B\u5F55\u65F6\u5BC6\u7801\u4E0E\u8BB0\u5F55\u4E0D\u5339\u914D",
    solution: "\u68C0\u67E5\u5BC6\u7801\u662F\u5426\u6B63\u786E\uFF0C\u6CE8\u610F\u5927\u5C0F\u5199"
  },
  {
    code: "ALREADY_FRIEND",
    httpStatus: 400,
    description: "\u5DF2\u662F\u597D\u53CB",
    cause: "\u5C1D\u8BD5\u6DFB\u52A0\u5DF2\u662F\u597D\u53CB\u7684\u7528\u6237",
    solution: "\u65E0\u9700\u91CD\u590D\u6DFB\u52A0\uFF0C\u53EF\u5728\u597D\u53CB\u5217\u8868\u4E2D\u67E5\u770B"
  },
  {
    code: "NOT_FRIEND",
    httpStatus: 403,
    description: "\u975E\u597D\u53CB\u5173\u7CFB",
    cause: "\u5C1D\u8BD5\u5BF9\u975E\u597D\u53CB\u6267\u884C\u9700\u8981\u597D\u53CB\u5173\u7CFB\u7684\u64CD\u4F5C",
    solution: "\u5148\u6DFB\u52A0\u597D\u53CB\u540E\u518D\u6267\u884C\u8BE5\u64CD\u4F5C"
  },
  {
    code: "GROUP_FULL",
    httpStatus: 400,
    description: "\u7FA4\u7EC4\u5DF2\u6EE1",
    cause: "\u7FA4\u6210\u5458\u6570\u91CF\u8FBE\u5230\u4E0A\u9650",
    solution: "\u65E0\u6CD5\u518D\u9080\u8BF7\u65B0\u6210\u5458\uFF0C\u9700\u5148\u79FB\u9664\u90E8\u5206\u6210\u5458"
  },
  {
    code: "NOT_GROUP_MEMBER",
    httpStatus: 403,
    description: "\u975E\u7FA4\u6210\u5458",
    cause: "\u5C1D\u8BD5\u64CD\u4F5C\u672A\u52A0\u5165\u7684\u7FA4\u7EC4",
    solution: "\u9700\u8981\u5148\u52A0\u5165\u7FA4\u7EC4"
  },
  {
    code: "NOT_GROUP_ADMIN",
    httpStatus: 403,
    description: "\u975E\u7BA1\u7406\u5458",
    cause: "\u8BE5\u64CD\u4F5C\u9700\u8981\u7FA4\u4E3B\u6216\u7BA1\u7406\u5458\u6743\u9650",
    solution: "\u8054\u7CFB\u7FA4\u4E3B\u6216\u7BA1\u7406\u5458\u6267\u884C\u8BE5\u64CD\u4F5C"
  },
  {
    code: "RECALL_TIMEOUT",
    httpStatus: 400,
    description: "\u64A4\u56DE\u8D85\u65F6",
    cause: "\u6D88\u606F\u53D1\u9001\u8D85\u8FC7 2 \u5206\u949F\u65E0\u6CD5\u64A4\u56DE",
    solution: "\u53EA\u80FD\u64A4\u56DE 2 \u5206\u949F\u5185\u7684\u6D88\u606F"
  },
  {
    code: "CALL_BUSY",
    httpStatus: 400,
    description: "\u7528\u6237\u5FD9\u7EBF",
    cause: "\u88AB\u53EB\u7528\u6237\u6B63\u5728\u901A\u8BDD\u4E2D",
    solution: "\u7A0D\u540E\u518D\u8BD5"
  }
];

// mcp-server/data/query.ts
function findApi(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const results = [];
  for (const module of API_MODULES) {
    for (const endpoint of module.endpoints) {
      if (endpoint.path.toLowerCase().includes(lowerKeyword) || endpoint.description.toLowerCase().includes(lowerKeyword)) {
        results.push(endpoint);
      }
    }
  }
  return results;
}
function getModuleApis(moduleName) {
  const lowerName = moduleName.toLowerCase();
  const module = API_MODULES.find(
    (m) => m.name.toLowerCase().includes(lowerName) || m.prefix.toLowerCase().includes(lowerName)
  );
  return module?.endpoints ?? [];
}
function findWsEvent(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return WS_EVENTS.filter(
    (e) => e.type.toLowerCase().includes(lowerKeyword) || e.description.toLowerCase().includes(lowerKeyword)
  );
}
function findErrorCode(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return ERROR_CODES.filter(
    (e) => e.code.toLowerCase().includes(lowerKeyword) || e.description.toLowerCase().includes(lowerKeyword) || e.cause.toLowerCase().includes(lowerKeyword)
  );
}

// mcp-server/generators/utils.ts
function toCamelCase(path) {
  return path.replace(/^\/api\//, "").replace(/\//g, "_").replace(/:(\w+)/g, "By$1").replace(/-(\w)/g, (_, c) => c.toUpperCase()).replace(/_(\w)/g, (_, c) => c.toUpperCase());
}

// mcp-server/generators/api-code.ts
function generateApiCode(api) {
  const hasBody = api.method === "POST" || api.method === "PUT";
  return `// ${api.description}
// ${api.method} ${api.path}
// \u9700\u8981\u8BA4\u8BC1: ${api.auth ? "\u662F" : "\u5426"}

async function ${toCamelCase(api.path)}(${hasBody ? "body: RequestBody" : ""}): Promise<Response> {
  const response = await fetch(\`\${API_BASE_URL}${api.path}\`, {
    method: "${api.method}",
    headers: {
      "Content-Type": "application/json",
      ${api.auth ? '"Authorization": `Bearer ${accessToken}`,' : ""}
    },
    ${hasBody ? "body: JSON.stringify(body)," : ""}
  });

  if (!response.ok) {
    throw new Error(\`API \u9519\u8BEF: \${response.status}\`);
  }

  return response.json();
}

${api.requestBody ? `// \u8BF7\u6C42\u4F53\u7C7B\u578B: ${api.requestBody}` : ""}
${api.responseBody ? `// \u54CD\u5E94\u7C7B\u578B: ${api.responseBody}` : ""}`;
}

// mcp-server/generators/ws-handler.ts
function generateWsHandler(event) {
  return `// \u5904\u7406 ${event.description} \u4E8B\u4EF6
// \u4E8B\u4EF6\u7C7B\u578B: ${event.type}
// \u8F7D\u8377: ${event.payload}

wsManager.on("${event.type}", (payload) => {
  console.log("\u6536\u5230\u4E8B\u4EF6: ${event.type}", payload);

  // \u5904\u7406\u4E8B\u4EF6
  // payload \u7C7B\u578B: ${event.payload}
});`;
}

// mcp-server/generators/api-client.ts
var MODULE_MAP = {
  auth: "\u8BA4\u8BC1",
  user: "\u7528\u6237",
  device: "\u8BBE\u5907",
  friend: "\u597D\u53CB",
  group: "\u7FA4\u7EC4",
  conversation: "\u4F1A\u8BDD",
  message: "\u6D88\u606F",
  call: "\u901A\u8BDD",
  presence: "\u5728\u7EBF",
  media: "\u5A92\u4F53"
};
function generateApiClient(moduleName) {
  const isAll = moduleName.toLowerCase() === "all";
  const targetModules = isAll ? API_MODULES : API_MODULES.filter((m) => {
    const lower = moduleName.toLowerCase();
    const mapped = MODULE_MAP[lower] ?? lower;
    return m.name.includes(mapped) || m.prefix.includes(lower);
  });
  if (targetModules.length === 0) {
    return `\u672A\u627E\u5230\u6A21\u5757: ${moduleName}
\u53EF\u7528\u6A21\u5757: auth, user, device, friend, group, conversation, message, call, presence, media, all`;
  }
  const imports = `import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================
// \u914D\u7F6E
// ============================================================

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:3000'
  : 'https://api.yourdomain.com';

// ============================================================
// Axios \u5B9E\u4F8B
// ============================================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// \u8BF7\u6C42\u62E6\u622A\u5668 - \u81EA\u52A8\u6DFB\u52A0 Token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// \u54CD\u5E94\u62E6\u622A\u5668 - \u7EDF\u4E00\u9519\u8BEF\u5904\u7406
api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<{ code: string; message: string }>) => {
    if (error.response?.status === 401) {
      // Token \u8FC7\u671F\uFF0C\u5C1D\u8BD5\u5237\u65B0
      const refreshed = await refreshToken();
      if (refreshed && error.config) {
        return api.request(error.config);
      }
    }
    return Promise.reject(error.response?.data ?? error);
  }
);

// Token \u5237\u65B0
async function refreshToken(): Promise<boolean> {
  try {
    const refresh = await SecureStore.getItemAsync('refresh_token');
    if (!refresh) return false;
    
    const res = await axios.post(\`\${API_BASE_URL}/api/auth/refresh\`, {
      refreshToken: refresh,
    });
    
    await SecureStore.setItemAsync('access_token', res.data.data.access);
    await SecureStore.setItemAsync('refresh_token', res.data.data.refresh);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// \u7C7B\u578B\u5B9A\u4E49
// ============================================================

interface ApiResponse<T> {
  code: string;
  data: T;
  message?: string;
}

interface PagedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

`;
  const functions = targetModules.map((m) => {
    const moduleComment = `// ============================================================
// ${m.name} - ${m.description}
// ============================================================
`;
    const funcs = m.endpoints.map((e) => {
      const funcName = toCamelCase(e.path);
      const hasBody = e.method === "POST" || e.method === "PUT";
      const paramMatch = e.path.match(/:(\w+)/g);
      const pathParams = paramMatch ? paramMatch.map((p) => p.slice(1)) : [];
      const paramsStr = pathParams.map((p) => `${p}: string`).join(", ");
      const bodyParam = hasBody ? paramsStr ? ", body: Record<string, unknown>" : "body: Record<string, unknown>" : "";
      const allParams = paramsStr + bodyParam;
      let urlPath = e.path;
      pathParams.forEach((p) => {
        urlPath = urlPath.replace(`:${p}`, `\${${p}}`);
      });
      return `/**
 * ${e.description}
 * ${e.method} ${e.path}
 */
export async function ${funcName}(${allParams}): Promise<ApiResponse<unknown>> {
  return api.${e.method.toLowerCase()}(\`${urlPath}\`${hasBody ? ", body" : ""});
}`;
    }).join("\n\n");
    return moduleComment + funcs;
  }).join("\n\n");
  return imports + functions;
}

// mcp-server/generators/ws-manager.ts
var WS_MANAGER_CODE = `import * as SecureStore from 'expo-secure-store';
import { AppState, AppStateStatus } from 'react-native';

// ============================================================
// \u7C7B\u578B\u5B9A\u4E49
// ============================================================

type WsEventType =
  | 'connected' | 'error' | 'kick'
  | 'message:new' | 'message:recalled' | 'message:read' | 'message:delivered'
  | 'typing:start' | 'typing:stop'
  | 'call:invite' | 'call:ring' | 'call:answer' | 'call:reject' | 'call:end' | 'call:signal'
  | 'presence:online' | 'presence:offline'
  | 'friend:request' | 'friend:accepted'
  | 'group:invited' | 'group:kicked' | 'group:member_joined' | 'group:member_left'
  | 'group:updated' | 'group:muted' | 'group:unmuted' | 'group:dissolved';

type EventCallback = (payload: unknown) => void;

interface WsMessage {
  type: string;
  payload?: unknown;
}

// ============================================================
// WebSocket \u7BA1\u7406\u5668
// ============================================================

class WebSocketManager {
  private ws: WebSocket | null = null;
  private deviceId: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Map<WsEventType, Set<EventCallback>> = new Map();
  private isConnecting: boolean = false;

  private readonly WS_URL = __DEV__
    ? 'ws://192.168.1.100:3000/ws'
    : 'wss://api.yourdomain.com/ws';

  constructor() {
    // \u76D1\u542C\u5E94\u7528\u72B6\u6001\u53D8\u5316
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  /**
   * \u8FDE\u63A5 WebSocket
   */
  async connect(deviceId: string): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.deviceId = deviceId;
    this.isConnecting = true;

    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        throw new Error('\u672A\u767B\u5F55');
      }

      const url = \`\${this.WS_URL}?token=\${token}&deviceId=\${deviceId}\`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] \u8FDE\u63A5\u6210\u529F');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WsMessage = JSON.parse(event.data);
          this.emit(data.type as WsEventType, data.payload);
        } catch (e) {
          console.error('[WS] \u6D88\u606F\u89E3\u6790\u5931\u8D25:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] \u8FDE\u63A5\u9519\u8BEF:', error);
        this.emit('error', { error });
      };

      this.ws.onclose = (event) => {
        console.log('[WS] \u8FDE\u63A5\u5173\u95ED:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();

        // \u88AB\u8E22\u4E0B\u7EBF\u4E0D\u91CD\u8FDE
        if (event.code === 4002) {
          this.emit('kick', { reason: event.reason });
          return;
        }

        // \u81EA\u52A8\u91CD\u8FDE
        this.scheduleReconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * \u65AD\u5F00\u8FDE\u63A5
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts; // \u963B\u6B62\u91CD\u8FDE
    if (this.ws) {
      this.ws.close(1000, '\u7528\u6237\u4E3B\u52A8\u65AD\u5F00');
      this.ws = null;
    }
  }

  /**
   * \u53D1\u9001\u6D88\u606F
   */
  send(type: string, payload?: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] \u8FDE\u63A5\u672A\u5C31\u7EEA\uFF0C\u65E0\u6CD5\u53D1\u9001\u6D88\u606F');
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  /**
   * \u8BA2\u9605\u4E8B\u4EF6
   */
  on(event: WsEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // \u8FD4\u56DE\u53D6\u6D88\u8BA2\u9605\u51FD\u6570
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * \u89E6\u53D1\u4E8B\u4EF6
   */
  private emit(event: WsEventType, payload: unknown): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(payload);
      } catch (e) {
        console.error('[WS] \u4E8B\u4EF6\u5904\u7406\u9519\u8BEF:', e);
      }
    });
  }

  /**
   * \u5FC3\u8DF3
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send('ping');
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * \u91CD\u8FDE
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] \u8FBE\u5230\u6700\u5927\u91CD\u8FDE\u6B21\u6570');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    console.log(\`[WS] \${delay}ms \u540E\u91CD\u8FDE (\u7B2C \${this.reconnectAttempts} \u6B21)\`);
    setTimeout(() => {
      if (this.deviceId) {
        this.connect(this.deviceId);
      }
    }, delay);
  }

  /**
   * \u5E94\u7528\u72B6\u6001\u53D8\u5316\u5904\u7406
   */
  private handleAppStateChange(state: AppStateStatus): void {
    if (state === 'active' && this.deviceId && !this.ws) {
      console.log('[WS] \u5E94\u7528\u6FC0\u6D3B\uFF0C\u5C1D\u8BD5\u91CD\u8FDE');
      this.reconnectAttempts = 0;
      this.connect(this.deviceId);
    }
  }

  /**
   * \u8FDE\u63A5\u72B6\u6001
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// \u5BFC\u51FA\u5355\u4F8B
export const wsManager = new WebSocketManager();

// ============================================================
// \u4F7F\u7528\u793A\u4F8B
// ============================================================

/*
// 1. \u8FDE\u63A5
await wsManager.connect('device-uuid');

// 2. \u76D1\u542C\u4E8B\u4EF6
const unsubscribe = wsManager.on('message:new', (payload) => {
  console.log('\u65B0\u6D88\u606F:', payload);
});

// 3. \u53D1\u9001\u6D88\u606F\uFF08\u5982\u679C\u9700\u8981\uFF09
wsManager.send('typing:start', { conversationId: 'xxx' });

// 4. \u65AD\u5F00\u8FDE\u63A5
wsManager.disconnect();

// 5. \u53D6\u6D88\u8BA2\u9605
unsubscribe();
*/
`;

// mcp-server/guides/flows.ts
var FLOWS = {
  auth: `# \u7528\u6237\u8BA4\u8BC1\u6D41\u7A0B

1. \u6CE8\u518C POST /api/auth/register
   \u8BF7\u6C42: { phone, password, pin }
   \u54CD\u5E94: { user, access, refresh, payload }

2. \u767B\u5F55 POST /api/auth/login
   \u8BF7\u6C42: { phone, password }
   \u54CD\u5E94: { user, access, refresh, payload }

3. \u83B7\u53D6\u5F53\u524D\u7528\u6237 GET /api/auth/me
   \u9700\u8981 Authorization: Bearer <access_token>

4. \u6CE8\u518C\u8BBE\u5907 POST /api/im/devices/register
   \u8BF7\u6C42: { platform, deviceId, pushToken, pushProvider }

5. \u8FDE\u63A5 WebSocket
   \u5730\u5740: ws://server/ws?token=<access_token>&deviceId=<device_id>`,
  message: `# \u6D88\u606F\u53D1\u9001\u6D41\u7A0B

1. \u83B7\u53D6/\u521B\u5EFA\u4F1A\u8BDD POST /api/im/conversations/private
   \u8BF7\u6C42: { targetUserId }
   \u54CD\u5E94: { id, type, targetUserId, ... }

2. \u53D1\u9001\u6D88\u606F POST /api/im/messages
   \u8BF7\u6C42: { conversationId, type: "text", content: "\u6D88\u606F\u5185\u5BB9" }
   \u54CD\u5E94: Message \u5BF9\u8C61

3. \u5BF9\u65B9\u6536\u5230 WebSocket \u4E8B\u4EF6
   \u4E8B\u4EF6: message:new
   \u8F7D\u8377: { conversationId, message }

4. \u6807\u8BB0\u5DF2\u8BFB POST /api/im/messages/conversation/:id/read
   \u8BF7\u6C42: { messageId }

5. \u6807\u8BB0\u9001\u8FBE POST /api/im/messages/:messageId/delivered`,
  call: `# \u8BED\u97F3\u901A\u8BDD\u6D41\u7A0B

1. \u53D1\u8D77\u901A\u8BDD POST /api/im/calls/initiate
   \u8BF7\u6C42: { calleeId }
   \u54CD\u5E94: { callId, status: "initiated" }

2. \u88AB\u53EB\u6536\u5230 WebSocket \u4E8B\u4EF6
   \u4E8B\u4EF6: call:invite
   \u8F7D\u8377: { callId, callerId, calleeId }

3. \u88AB\u53EB\u54CD\u94C3 POST /api/im/calls/:callId/ring
   \u4E3B\u53EB\u6536\u5230\u4E8B\u4EF6: call:ring

4. \u63A5\u542C/\u62D2\u7EDD
   \u63A5\u542C: POST /api/im/calls/:callId/accept
   \u62D2\u7EDD: POST /api/im/calls/:callId/reject

5. WebRTC \u4FE1\u4EE4\u4EA4\u6362 POST /api/im/calls/:callId/signal
   \u4E3B\u53EB\u53D1\u9001 offer -> \u88AB\u53EB\u6536\u5230 call:signal
   \u88AB\u53EB\u53D1\u9001 answer -> \u4E3B\u53EB\u6536\u5230 call:signal
   \u53CC\u65B9\u4EA4\u6362 ice-candidate

6. \u6302\u65AD POST /api/im/calls/:callId/hangup
   \u53CC\u65B9\u6536\u5230 call:end \u4E8B\u4EF6`,
  friend: `# \u597D\u53CB\u6DFB\u52A0\u6D41\u7A0B

1. \u641C\u7D22\u7528\u6237 GET /api/im/users/search?keyword=xxx
   \u54CD\u5E94: [{ id, name, avatar, ... }]

2. \u53D1\u9001\u597D\u53CB\u7533\u8BF7 POST /api/im/friends/requests
   \u8BF7\u6C42: { toUserId, message, source: "search" }

3. \u5BF9\u65B9\u6536\u5230 WebSocket \u4E8B\u4EF6
   \u4E8B\u4EF6: friend:request
   \u8F7D\u8377: { requestId, fromUser, message }

4. \u63A5\u53D7/\u62D2\u7EDD\u7533\u8BF7
   \u63A5\u53D7: POST /api/im/friends/requests/:requestId/accept
   \u62D2\u7EDD: POST /api/im/friends/requests/:requestId/reject

5. \u7533\u8BF7\u8005\u6536\u5230 WebSocket \u4E8B\u4EF6
   \u4E8B\u4EF6: friend:accepted
   \u8F7D\u8377: { requestId, friendUser, conversationId }`,
  group: `# \u7FA4\u7EC4\u7BA1\u7406\u6D41\u7A0B

1. \u521B\u5EFA\u7FA4\u7EC4 POST /api/im/groups
   \u8BF7\u6C42: { name, avatar, memberIds }
   \u54CD\u5E94: Group \u5BF9\u8C61

2. \u88AB\u9080\u8BF7\u8005\u6536\u5230 WebSocket \u4E8B\u4EF6
   \u4E8B\u4EF6: group:invited
   \u8F7D\u8377: { groupId, groupName, inviter }

3. \u7FA4\u4E3B\u64CD\u4F5C
   \u9080\u8BF7\u6210\u5458: POST /api/im/groups/:groupId/invite
   \u8E22\u51FA\u6210\u5458: POST /api/im/groups/:groupId/kick/:userId
   \u8BBE\u7F6E\u7BA1\u7406\u5458: POST /api/im/groups/:groupId/admin/:userId
   \u7981\u8A00\u6210\u5458: POST /api/im/groups/:groupId/mute/:userId
   \u8F6C\u8BA9\u7FA4\u4E3B: POST /api/im/groups/:groupId/transfer

4. \u6210\u5458\u9000\u51FA POST /api/im/groups/:groupId/leave

5. \u89E3\u6563\u7FA4\u7EC4 DELETE /api/im/groups/:groupId`
};

// mcp-server/tools/handlers.ts
function handleSearchApi(args) {
  const results = findApi(args.keyword);
  if (results.length === 0) {
    return { content: [{ type: "text", text: `\u672A\u627E\u5230\u5305\u542B "${args.keyword}" \u7684 API` }] };
  }
  const text = results.map((api) => `${api.method} ${api.path}
  \u63CF\u8FF0: ${api.description}
  \u8BA4\u8BC1: ${api.auth ? "\u662F" : "\u5426"}${api.requestBody ? `
  \u8BF7\u6C42: ${api.requestBody}` : ""}${api.responseBody ? `
  \u54CD\u5E94: ${api.responseBody}` : ""}`).join("\n\n");
  return { content: [{ type: "text", text }] };
}
function handleGetModuleApis(args) {
  const apis = getModuleApis(args.module);
  if (apis.length === 0) {
    return { content: [{ type: "text", text: `\u672A\u627E\u5230\u6A21\u5757 "${args.module}"` }] };
  }
  const text = apis.map((api) => `${api.method} ${api.path}
  \u63CF\u8FF0: ${api.description}${api.requestBody ? `
  \u8BF7\u6C42: ${api.requestBody}` : ""}${api.responseBody ? `
  \u54CD\u5E94: ${api.responseBody}` : ""}`).join("\n\n");
  return { content: [{ type: "text", text }] };
}
function handleSearchWsEvent(args) {
  const results = findWsEvent(args.keyword);
  if (results.length === 0) {
    return { content: [{ type: "text", text: `\u672A\u627E\u5230\u5305\u542B "${args.keyword}" \u7684 WebSocket \u4E8B\u4EF6` }] };
  }
  const text = results.map((e) => `${e.type}
  \u63CF\u8FF0: ${e.description}
  \u8F7D\u8377: ${e.payload}`).join("\n\n");
  return { content: [{ type: "text", text }] };
}
function handleGetAllWsEvents() {
  const text = WS_EVENTS.map((e) => `${e.type} - ${e.description}`).join("\n");
  return { content: [{ type: "text", text }] };
}
function handleGetEnums() {
  const text = Object.entries(ENUMS).map(([name, values]) => `${name}: ${values.join(" | ")}`).join("\n");
  return { content: [{ type: "text", text }] };
}
function handleGenerateApiCode(args) {
  const results = findApi(args.apiPath);
  if (results.length === 0) {
    return { content: [{ type: "text", text: `\u672A\u627E\u5230 API: ${args.apiPath}` }] };
  }
  const code = generateApiCode(results[0]);
  return { content: [{ type: "text", text: code }] };
}
function handleGenerateWsHandler(args) {
  const event = WS_EVENTS.find((e) => e.type === args.eventType);
  if (!event) {
    return { content: [{ type: "text", text: `\u672A\u627E\u5230\u4E8B\u4EF6: ${args.eventType}` }] };
  }
  const code = generateWsHandler(event);
  return { content: [{ type: "text", text: code }] };
}
function handleGetFlow(args) {
  const flow = FLOWS[args.flow];
  if (!flow) {
    return { content: [{ type: "text", text: `\u672A\u627E\u5230\u6D41\u7A0B: ${args.flow}\u3002\u53EF\u7528: auth, message, call, friend, group` }] };
  }
  return { content: [{ type: "text", text: flow }] };
}
function handleGenerateApiClient(args) {
  const code = generateApiClient(args.module);
  return { content: [{ type: "text", text: code }] };
}
function handleGenerateWsManager() {
  return { content: [{ type: "text", text: WS_MANAGER_CODE }] };
}
function handleGetErrorCodes(args) {
  const results = findErrorCode(args.keyword);
  if (results.length === 0) {
    const text2 = ERROR_CODES.map((e) => `${e.code} (HTTP ${e.httpStatus})
  ${e.description}
  \u539F\u56E0: ${e.cause}
  \u89E3\u51B3: ${e.solution}`).join("\n\n");
    return { content: [{ type: "text", text: `\u672A\u627E\u5230 "${args.keyword}"\uFF0C\u4EE5\u4E0B\u662F\u6240\u6709\u9519\u8BEF\u7801:

${text2}` }] };
  }
  const text = results.map((e) => `${e.code} (HTTP ${e.httpStatus})
  ${e.description}
  \u539F\u56E0: ${e.cause}
  \u89E3\u51B3: ${e.solution}`).join("\n\n");
  return { content: [{ type: "text", text }] };
}
function callTool(name, args) {
  switch (name) {
    case "search_api":
      return handleSearchApi(args);
    case "get_module_apis":
      return handleGetModuleApis(args);
    case "search_ws_event":
      return handleSearchWsEvent(args);
    case "get_all_ws_events":
      return handleGetAllWsEvents();
    case "get_enums":
      return handleGetEnums();
    case "generate_api_code":
      return handleGenerateApiCode(args);
    case "generate_ws_handler":
      return handleGenerateWsHandler(args);
    case "get_flow":
      return handleGetFlow(args);
    case "generate_api_client":
      return handleGenerateApiClient(args);
    case "generate_ws_manager":
      return handleGenerateWsManager();
    case "get_error_codes":
      return handleGetErrorCodes(args);
    default:
      throw new Error(`\u672A\u77E5\u5DE5\u5177: ${name}`);
  }
}

// mcp-server/resources/schemas.ts
var RESOURCE_SCHEMAS = [
  {
    uri: "im://api/all",
    name: "\u6240\u6709 API \u5217\u8868",
    description: "\u83B7\u53D6\u6240\u6709 IM API \u63A5\u53E3\u7684\u5B8C\u6574\u5217\u8868",
    mimeType: "text/plain"
  },
  {
    uri: "im://ws/events",
    name: "WebSocket \u4E8B\u4EF6\u5217\u8868",
    description: "\u83B7\u53D6\u6240\u6709 WebSocket \u4E8B\u4EF6\u7C7B\u578B",
    mimeType: "text/plain"
  },
  {
    uri: "im://types",
    name: "TypeScript \u7C7B\u578B\u5B9A\u4E49",
    description: "\u83B7\u53D6\u524D\u7AEF\u53EF\u7528\u7684 TypeScript \u7C7B\u578B\u5B9A\u4E49",
    mimeType: "text/plain"
  },
  {
    uri: "im://guide/expo",
    name: "Expo \u63A5\u5165\u6307\u5357",
    description: "Expo/iOS \u5E94\u7528\u63A5\u5165 IM API \u7684\u6307\u5357",
    mimeType: "text/plain"
  },
  {
    uri: "im://guide/push",
    name: "\u63A8\u9001\u670D\u52A1 API",
    description: "ExpoPushService \u63A8\u9001\u670D\u52A1\u5B8C\u6574\u65B9\u6CD5\u8BF4\u660E",
    mimeType: "text/plain"
  }
];

// mcp-server/guides/features.ts
var FEATURE_GUIDES = {
  login: `\u8BF7\u5E2E\u6211\u5B9E\u73B0\u7528\u6237\u767B\u5F55\u529F\u80FD\u3002

\u9700\u8981\u7684 API:
- POST /api/auth/login
  \u8BF7\u6C42: { phone: string, password: string }
  \u54CD\u5E94: { user: User, access: string, refresh: string, payload: AuthPayload }

\u5B9E\u73B0\u6B65\u9AA4:
1. \u521B\u5EFA\u767B\u5F55\u8868\u5355\uFF08\u624B\u673A\u53F7\u3001\u5BC6\u7801\uFF09
2. \u8C03\u7528\u767B\u5F55 API
3. \u4FDD\u5B58 access token \u5230\u672C\u5730\u5B58\u50A8
4. \u6CE8\u518C\u8BBE\u5907\u83B7\u53D6\u63A8\u9001
5. \u8FDE\u63A5 WebSocket

\u8BF7\u4F7F\u7528 TypeScript \u548C React Native/Expo\u3002`,
  register: `\u8BF7\u5E2E\u6211\u5B9E\u73B0\u7528\u6237\u6CE8\u518C\u529F\u80FD\u3002

\u9700\u8981\u7684 API:
- POST /api/auth/register
  \u8BF7\u6C42: { phone: string, password: string, pin: string }
  \u54CD\u5E94: { user: User, access: string, refresh: string, payload: AuthPayload }

\u5B9E\u73B0\u6B65\u9AA4:
1. \u521B\u5EFA\u6CE8\u518C\u8868\u5355\uFF08\u624B\u673A\u53F7\u3001\u5BC6\u7801\u3001\u4E8C\u7EA7\u5BC6\u7801\uFF09
2. \u9A8C\u8BC1\u8F93\u5165\u683C\u5F0F
3. \u8C03\u7528\u6CE8\u518C API
4. \u4FDD\u5B58 token \u5E76\u8DF3\u8F6C\u5230\u4E3B\u9875

\u8BF7\u4F7F\u7528 TypeScript \u548C React Native/Expo\u3002`,
  send_message: `\u8BF7\u5E2E\u6211\u5B9E\u73B0\u53D1\u9001\u6D88\u606F\u529F\u80FD\u3002

\u9700\u8981\u7684 API:
- POST /api/im/conversations/private (\u83B7\u53D6/\u521B\u5EFA\u79C1\u804A\u4F1A\u8BDD)
- POST /api/im/messages (\u53D1\u9001\u6D88\u606F)

WebSocket \u4E8B\u4EF6:
- message:new (\u6536\u5230\u65B0\u6D88\u606F)
- message:read (\u5DF2\u8BFB\u56DE\u6267)
- message:delivered (\u9001\u8FBE\u56DE\u6267)

\u5B9E\u73B0\u6B65\u9AA4:
1. \u83B7\u53D6\u6216\u521B\u5EFA\u4F1A\u8BDD
2. \u53D1\u9001\u6D88\u606F\u5E76\u663E\u793A\u5728\u5217\u8868
3. \u76D1\u542C message:new \u63A5\u6536\u6D88\u606F
4. \u6807\u8BB0\u5DF2\u8BFB\u548C\u9001\u8FBE

\u8BF7\u4F7F\u7528 TypeScript \u548C React Native/Expo\u3002`,
  make_call: `\u8BF7\u5E2E\u6211\u5B9E\u73B0\u8BED\u97F3\u901A\u8BDD\u529F\u80FD\u3002

\u9700\u8981\u7684 API:
- POST /api/im/calls/initiate (\u53D1\u8D77\u901A\u8BDD)
- POST /api/im/calls/:callId/ring (\u54CD\u94C3)
- POST /api/im/calls/:callId/accept (\u63A5\u542C)
- POST /api/im/calls/:callId/reject (\u62D2\u7EDD)
- POST /api/im/calls/:callId/hangup (\u6302\u65AD)
- POST /api/im/calls/:callId/signal (WebRTC \u4FE1\u4EE4)

WebSocket \u4E8B\u4EF6:
- call:invite (\u6765\u7535)
- call:ring (\u54CD\u94C3)
- call:answer (\u63A5\u542C)
- call:end (\u7ED3\u675F)
- call:signal (\u4FE1\u4EE4)

\u5B9E\u73B0\u6B65\u9AA4:
1. \u53D1\u8D77\u901A\u8BDD\u754C\u9762
2. \u6765\u7535\u63A5\u542C\u754C\u9762
3. WebRTC \u8FDE\u63A5\u5EFA\u7ACB
4. \u901A\u8BDD\u4E2D\u754C\u9762

\u8BF7\u4F7F\u7528 TypeScript\u3001React Native/Expo \u548C WebRTC\u3002`,
  add_friend: `\u8BF7\u5E2E\u6211\u5B9E\u73B0\u6DFB\u52A0\u597D\u53CB\u529F\u80FD\u3002

\u9700\u8981\u7684 API:
- GET /api/im/users/search (\u641C\u7D22\u7528\u6237)
- POST /api/im/friends/requests (\u53D1\u9001\u7533\u8BF7)
- POST /api/im/friends/requests/:id/accept (\u63A5\u53D7)
- POST /api/im/friends/requests/:id/reject (\u62D2\u7EDD)
- GET /api/im/friends/requests/received (\u6536\u5230\u7684\u7533\u8BF7)

WebSocket \u4E8B\u4EF6:
- friend:request (\u6536\u5230\u7533\u8BF7)
- friend:accepted (\u7533\u8BF7\u88AB\u63A5\u53D7)

\u5B9E\u73B0\u6B65\u9AA4:
1. \u641C\u7D22\u7528\u6237\u754C\u9762
2. \u53D1\u9001\u597D\u53CB\u7533\u8BF7
3. \u597D\u53CB\u7533\u8BF7\u5217\u8868
4. \u5904\u7406\u7533\u8BF7\uFF08\u63A5\u53D7/\u62D2\u7EDD\uFF09

\u8BF7\u4F7F\u7528 TypeScript \u548C React Native/Expo\u3002`,
  create_group: `\u8BF7\u5E2E\u6211\u5B9E\u73B0\u521B\u5EFA\u7FA4\u7EC4\u529F\u80FD\u3002

\u9700\u8981\u7684 API:
- POST /api/im/groups (\u521B\u5EFA\u7FA4\u7EC4)
- POST /api/im/groups/:groupId/invite (\u9080\u8BF7\u6210\u5458)
- GET /api/im/groups/:groupId/members (\u83B7\u53D6\u6210\u5458)

WebSocket \u4E8B\u4EF6:
- group:invited (\u88AB\u9080\u8BF7\u5165\u7FA4)
- group:member_joined (\u6210\u5458\u5165\u7FA4)

\u5B9E\u73B0\u6B65\u9AA4:
1. \u9009\u62E9\u597D\u53CB\u754C\u9762
2. \u8BBE\u7F6E\u7FA4\u540D\u79F0\u548C\u5934\u50CF
3. \u521B\u5EFA\u7FA4\u7EC4
4. \u7FA4\u8BE6\u60C5\u9875\u9762

\u8BF7\u4F7F\u7528 TypeScript \u548C React Native/Expo\u3002`
};

// mcp-server/guides/types.ts
var TYPESCRIPT_TYPES = `// IM-API TypeScript \u7C7B\u578B\u5B9A\u4E49

export type DevicePlatform = "ios" | "android" | "web" | "macos" | "windows";
export type PushProvider = "apns" | "expo" | "fcm";
export type FriendSource = "search" | "qr" | "phone" | "invite";
export type FriendRequestStatus = "pending" | "accepted" | "rejected" | "ignored";
export type MessageType = "text" | "image" | "voice";
export type GroupJoinMode = "open" | "approval" | "invite";
export type GroupMemberRole = "owner" | "admin" | "member";
export type ConversationType = "private" | "group";
export type CallStatus = "initiated" | "ringing" | "connected" | "ended" | "missed" | "rejected" | "busy";
export type CallEndReason = "caller_hangup" | "callee_hangup" | "timeout" | "network_error";
export type SignalType = "offer" | "answer" | "ice-candidate";
export type Gender = "male" | "female" | "unknown";
export type UserState = "normal" | "muted" | "banned" | "canceled" | "risk_controlled";

export interface UserLocation {
  country: string;
  province: string;
  city: string;
}

export interface User {
  id: string;
  pid: string | null;
  phone: string;
  code: string | null;
  name: string;
  avatar: string | null;
  gender: Gender;
  location: UserLocation | null;
  vip: boolean;
  roleId: string;
  state: UserState;
  searchable: boolean;
  privateMuted: boolean;
  privateMuteUntil: string | null;
  lastOnlineAt: string | null;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  platform: DevicePlatform;
  deviceId: string;
  deviceName: string | null;
  pushToken: string | null;
  pushProvider: PushProvider | null;
  isOnline: boolean;
  lastActiveAt: string | null;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  alias: string | null;
  isBlocked: boolean;
  doNotDisturb: boolean;
  isPinned: boolean;
  source: FriendSource;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string | null;
  source: FriendSource;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  maxMembers: number;
  memberCount: number;
  joinMode: GroupJoinMode;
  muteAll: boolean;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  groupNickname: string | null;
  isMuted: boolean;
  muteUntil: string | null;
  doNotDisturb: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  userId: string | null;
  friendId: string | null;
  groupId: string | null;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  replyToId: string | null;
  isRecalled: boolean;
  recalledAt: string | null;
  createdAt: string;
}

export interface Call {
  id: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  endReason: CallEndReason | null;
}

export interface ApiResponse<T> {
  code: string;
  data: T;
  message?: string;
}

export interface PagedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}`;

// mcp-server/guides/expo.ts
var EXPO_GUIDE = `# Expo/iOS \u63A5\u5165\u6307\u5357

## 1. \u73AF\u5883\u914D\u7F6E
\`\`\`typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:3000/api'  // \u5F00\u53D1\u73AF\u5883\u7528\u5C40\u57DF\u7F51 IP
  : 'https://api.yourdomain.com/api';

const WS_URL = __DEV__
  ? 'ws://192.168.1.100:3000/ws'
  : 'wss://api.yourdomain.com/ws';
\`\`\`

## 2. \u83B7\u53D6 Expo Push Token
\`\`\`typescript
import * as Notifications from 'expo-notifications';

const token = (await Notifications.getExpoPushTokenAsync()).data;
// ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
\`\`\`

## 3. \u6CE8\u518C\u8BBE\u5907
\`\`\`typescript
await fetch(\`\${API_BASE_URL}/im/devices/register\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${accessToken}\`,
  },
  body: JSON.stringify({
    platform: 'ios',
    deviceId: 'device-uuid',
    pushToken: token,
    pushProvider: 'expo',
  }),
});
\`\`\`

## 4. WebSocket \u8FDE\u63A5
\`\`\`typescript
const ws = new WebSocket(\`\${WS_URL}?token=\${accessToken}&deviceId=\${deviceId}\`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'message:new':
      // \u5904\u7406\u65B0\u6D88\u606F
      break;
    case 'call:invite':
      // \u5904\u7406\u6765\u7535
      break;
  }
};

// \u5FC3\u8DF3
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
\`\`\`

## 5. \u901A\u77E5\u901A\u9053\u914D\u7F6E\uFF08Android\uFF09
\`\`\`typescript
await Notifications.setNotificationChannelAsync('messages', {
  name: '\u6D88\u606F\u901A\u77E5',
  importance: Notifications.AndroidImportance.DEFAULT,
});

await Notifications.setNotificationChannelAsync('calls', {
  name: '\u6765\u7535\u901A\u77E5',
  importance: Notifications.AndroidImportance.HIGH,
});
\`\`\``;

// mcp-server/guides/push.ts
var PUSH_GUIDE = `# Expo \u63A8\u9001\u670D\u52A1 API \u6587\u6863

## \u6982\u8FF0

ExpoPushService \u662F\u57FA\u4E8E Expo Push Notification \u7684\u63A8\u9001\u670D\u52A1\uFF0C\u652F\u6301\u5411\u79BB\u7EBF\u8BBE\u5907\u53D1\u9001\u63A8\u9001\u901A\u77E5\u3002

**\u670D\u52A1\u4F4D\u7F6E**: \`src/services/push/expo.ts\`

## \u7C7B\u578B\u5B9A\u4E49

### PushNotificationPayload
\`\`\`typescript
interface PushNotificationPayload {
  title: string;           // \u63A8\u9001\u6807\u9898
  body: string;            // \u63A8\u9001\u5185\u5BB9
  data?: Record<string, unknown>; // \u81EA\u5B9A\u4E49\u6570\u636E
  badge?: number;          // \u89D2\u6807\u6570
  sound?: boolean;         // \u662F\u5426\u64AD\u653E\u58F0\u97F3\uFF08\u9ED8\u8BA4 true\uFF09
  priority?: "default" | "normal" | "high"; // \u4F18\u5148\u7EA7
  channelId?: string;      // Android \u901A\u77E5\u901A\u9053
}
\`\`\`

### SendPushResult
\`\`\`typescript
interface SendPushResult {
  success: number;         // \u6210\u529F\u6570\u91CF
  failed: number;          // \u5931\u8D25\u6570\u91CF
  errors: Array<{          // \u9519\u8BEF\u8BE6\u60C5
    token: string;         // \u5931\u8D25\u7684\u63A8\u9001\u4EE4\u724C
    error: string;         // \u9519\u8BEF\u4FE1\u606F
  }>;
}
\`\`\`

### ExpoPushMessage
\`\`\`typescript
interface ExpoPushMessage {
  to: string;              // Expo Push Token
  title?: string;          // \u63A8\u9001\u6807\u9898
  body: string;            // \u63A8\u9001\u5185\u5BB9
  data?: Record<string, unknown>; // \u81EA\u5B9A\u4E49\u6570\u636E
  sound?: "default" | null; // \u58F0\u97F3
  badge?: number;          // \u89D2\u6807
  priority?: "default" | "normal" | "high"; // \u4F18\u5148\u7EA7
  channelId?: string;      // Android \u901A\u9053 ID
  categoryId?: string;     // \u901A\u77E5\u5206\u7C7B
  ttl?: number;            // \u751F\u5B58\u65F6\u95F4\uFF08\u79D2\uFF09
  expiration?: number;     // \u8FC7\u671F\u65F6\u95F4\u6233
}
\`\`\`

## \u65B9\u6CD5\u5217\u8868

### sendToUser
\u5411\u5355\u4E2A\u7528\u6237\u7684\u6240\u6709\u79BB\u7EBF\u8BBE\u5907\u53D1\u9001\u63A8\u9001\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`userId\`: \u76EE\u6807\u7528\u6237 ID
- \`payload\`: \u63A8\u9001\u5185\u5BB9

**\u7279\u6027**:
- \u81EA\u52A8\u8FC7\u6EE4\u5728\u7EBF\u8BBE\u5907\uFF08\u53EA\u63A8\u9001\u7ED9\u79BB\u7EBF\u8BBE\u5907\uFF09
- \u81EA\u52A8\u8FC7\u6EE4\u52FF\u6270\u6A21\u5F0F\u8BBE\u5907
- \u4EC5\u63A8\u9001\u7ED9 pushProvider \u4E3A "expo" \u7684\u8BBE\u5907

**\u793A\u4F8B**:
\`\`\`typescript
import { ExpoPushService } from '@/services/push/index.js';

const result = await ExpoPushService.sendToUser('user-123', {
  title: '\u7CFB\u7EDF\u901A\u77E5',
  body: '\u60A8\u6709\u4E00\u6761\u65B0\u6D88\u606F',
  data: { type: 'system', action: 'open_app' },
});
\`\`\`

---

### sendToUsers
\u5411\u591A\u4E2A\u7528\u6237\u6279\u91CF\u53D1\u9001\u63A8\u9001\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`userIds\`: \u76EE\u6807\u7528\u6237 ID \u6570\u7EC4
- \`payload\`: \u63A8\u9001\u5185\u5BB9

**\u793A\u4F8B**:
\`\`\`typescript
const result = await ExpoPushService.sendToUsers(
  ['user-1', 'user-2', 'user-3'],
  {
    title: '\u7FA4\u516C\u544A',
    body: '\u7BA1\u7406\u5458\u53D1\u5E03\u4E86\u65B0\u516C\u544A',
    channelId: 'announcements',
  }
);
\`\`\`

---

### sendToTokens
\u5411\u6307\u5B9A\u7684\u63A8\u9001\u4EE4\u724C\u5217\u8868\u53D1\u9001\u901A\u77E5\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendToTokens(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`tokens\`: Expo Push Token \u6570\u7EC4
- \`payload\`: \u63A8\u9001\u5185\u5BB9

**\u7279\u6027**:
- \u81EA\u52A8\u8FC7\u6EE4\u65E0\u6548\u7684 Expo Push Token
- \u81EA\u52A8\u5206\u6279\u53D1\u9001\uFF08\u6BCF\u6279\u6700\u591A 100 \u6761\uFF09
- \u81EA\u52A8\u6E05\u7406\u5931\u6548\u7684\u63A8\u9001\u4EE4\u724C\uFF08DeviceNotRegistered\uFF09

---

### sendNewMessagePush
\u53D1\u9001\u65B0\u6D88\u606F\u63A8\u9001\uFF08\u4E1A\u52A1\u5C01\u88C5\u65B9\u6CD5\uFF09\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendNewMessagePush(
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`userId\`: \u63A5\u6536\u8005\u7528\u6237 ID
- \`senderName\`: \u53D1\u9001\u8005\u540D\u79F0\uFF08\u663E\u793A\u4E3A\u6807\u9898\uFF09
- \`messagePreview\`: \u6D88\u606F\u9884\u89C8\uFF08\u8D85\u8FC7 100 \u5B57\u7B26\u81EA\u52A8\u622A\u65AD\uFF09
- \`conversationId\`: \u4F1A\u8BDD ID

**\u63A8\u9001\u6570\u636E**:
\`\`\`json
{
  "title": "\u5F20\u4E09",
  "body": "\u4F60\u597D\uFF0C\u5728\u5417\uFF1F",
  "data": {
    "type": "new_message",
    "conversationId": "conv-123"
  },
  "channelId": "messages"
}
\`\`\`

---

### sendIncomingCallPush
\u53D1\u9001\u6765\u7535\u63A8\u9001\uFF08\u4E1A\u52A1\u5C01\u88C5\u65B9\u6CD5\uFF09\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendIncomingCallPush(
  userId: string,
  callerName: string,
  callId: string,
  callType: "voice" | "video"
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`userId\`: \u88AB\u547C\u53EB\u8005\u7528\u6237 ID
- \`callerName\`: \u6765\u7535\u8005\u540D\u79F0
- \`callId\`: \u901A\u8BDD ID
- \`callType\`: \u901A\u8BDD\u7C7B\u578B\uFF08\u8BED\u97F3/\u89C6\u9891\uFF09

**\u63A8\u9001\u6570\u636E**:
\`\`\`json
{
  "title": "\u6765\u7535",
  "body": "\u5F20\u4E09 \u53D1\u8D77\u89C6\u9891\u901A\u8BDD",
  "data": {
    "type": "incoming_call",
    "callId": "call-123",
    "callType": "video"
  },
  "priority": "high",
  "channelId": "calls"
}
\`\`\`

---

### sendFriendRequestPush
\u53D1\u9001\u597D\u53CB\u8BF7\u6C42\u63A8\u9001\uFF08\u4E1A\u52A1\u5C01\u88C5\u65B9\u6CD5\uFF09\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendFriendRequestPush(
  userId: string,
  senderName: string,
  requestId: string
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`userId\`: \u63A5\u6536\u8005\u7528\u6237 ID
- \`senderName\`: \u8BF7\u6C42\u8005\u540D\u79F0
- \`requestId\`: \u597D\u53CB\u8BF7\u6C42 ID

**\u63A8\u9001\u6570\u636E**:
\`\`\`json
{
  "title": "\u597D\u53CB\u8BF7\u6C42",
  "body": "\u5F20\u4E09 \u8BF7\u6C42\u6DFB\u52A0\u4F60\u4E3A\u597D\u53CB",
  "data": {
    "type": "friend_request",
    "requestId": "req-123"
  },
  "channelId": "social"
}
\`\`\`

---

### sendGroupInvitePush
\u53D1\u9001\u7FA4\u7EC4\u9080\u8BF7\u63A8\u9001\uFF08\u4E1A\u52A1\u5C01\u88C5\u65B9\u6CD5\uFF09\u3002

**\u7B7E\u540D**:
\`\`\`typescript
async sendGroupInvitePush(
  userId: string,
  groupName: string,
  inviterName: string,
  groupId: string
): Promise<SendPushResult>
\`\`\`

**\u53C2\u6570**:
- \`userId\`: \u63A5\u6536\u8005\u7528\u6237 ID
- \`groupName\`: \u7FA4\u7EC4\u540D\u79F0
- \`inviterName\`: \u9080\u8BF7\u8005\u540D\u79F0
- \`groupId\`: \u7FA4\u7EC4 ID

**\u63A8\u9001\u6570\u636E**:
\`\`\`json
{
  "title": "\u7FA4\u7EC4\u9080\u8BF7",
  "body": "\u5F20\u4E09 \u9080\u8BF7\u4F60\u52A0\u5165\u7FA4\u7EC4\u300C\u6280\u672F\u4EA4\u6D41\u7FA4\u300D",
  "data": {
    "type": "group_invite",
    "groupId": "group-123"
  },
  "channelId": "social"
}
\`\`\`

---

### isValidExpoPushToken
\u9A8C\u8BC1 Expo Push Token \u683C\u5F0F\u662F\u5426\u6709\u6548\u3002

**\u7B7E\u540D**:
\`\`\`typescript
isValidExpoPushToken(token: string): boolean
\`\`\`

**\u53C2\u6570**:
- \`token\`: \u5F85\u9A8C\u8BC1\u7684\u63A8\u9001\u4EE4\u724C

**\u8FD4\u56DE**: \u662F\u5426\u4E3A\u6709\u6548\u7684 Expo Push Token

**\u6709\u6548\u683C\u5F0F**: \`ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]\`

---

## \u63A8\u9001\u901A\u9053\u914D\u7F6E

### Android \u901A\u77E5\u901A\u9053
\`\`\`typescript
// messages - \u6D88\u606F\u901A\u77E5\uFF08\u9ED8\u8BA4\u4F18\u5148\u7EA7\uFF09
// calls - \u6765\u7535\u901A\u77E5\uFF08\u9AD8\u4F18\u5148\u7EA7\uFF09
// social - \u793E\u4EA4\u901A\u77E5\uFF08\u597D\u53CB\u8BF7\u6C42\u3001\u7FA4\u7EC4\u9080\u8BF7\uFF09
\`\`\`

### \u5BA2\u6237\u7AEF\u914D\u7F6E\u793A\u4F8B
\`\`\`typescript
import * as Notifications from 'expo-notifications';

// \u914D\u7F6E\u901A\u77E5\u901A\u9053
await Notifications.setNotificationChannelAsync('messages', {
  name: '\u6D88\u606F\u901A\u77E5',
  importance: Notifications.AndroidImportance.DEFAULT,
});

await Notifications.setNotificationChannelAsync('calls', {
  name: '\u6765\u7535\u901A\u77E5',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'ringtone.wav',
});

await Notifications.setNotificationChannelAsync('social', {
  name: '\u793E\u4EA4\u901A\u77E5',
  importance: Notifications.AndroidImportance.DEFAULT,
});
\`\`\`

---

## \u63A8\u9001\u6570\u636E\u7C7B\u578B (data.type)

| type | \u8BF4\u660E | \u5173\u8054\u901A\u9053 |
|------|------|---------|
| new_message | \u65B0\u6D88\u606F | messages |
| incoming_call | \u6765\u7535 | calls |
| friend_request | \u597D\u53CB\u8BF7\u6C42 | social |
| group_invite | \u7FA4\u7EC4\u9080\u8BF7 | social |

---

## \u670D\u52A1\u914D\u7F6E

| \u914D\u7F6E\u9879 | \u503C | \u8BF4\u660E |
|--------|-----|------|
| EXPO_PUSH_URL | https://exp.host/--/api/v2/push/send | Expo \u63A8\u9001 API |
| REQUEST_TIMEOUT | 10000ms | \u8BF7\u6C42\u8D85\u65F6\u65F6\u95F4 |
| MAX_BATCH_SIZE | 100 | \u5355\u6B21\u6279\u91CF\u63A8\u9001\u4E0A\u9650 |

---

## \u81EA\u52A8\u6E05\u7406\u673A\u5236

\u5F53 Expo \u8FD4\u56DE \`DeviceNotRegistered\` \u9519\u8BEF\u65F6\uFF0C\u670D\u52A1\u4F1A\u81EA\u52A8\u6E05\u9664\u8BE5\u8BBE\u5907\u7684\u63A8\u9001\u4EE4\u724C\uFF1A

\`\`\`typescript
// \u81EA\u52A8\u6267\u884C\uFF1A
await Device.update(
  { pushToken: null, pushProvider: null },
  { where: { pushToken: invalidToken } }
);
\`\`\`

---

## \u4F7F\u7528\u5EFA\u8BAE

1. **\u4F18\u5148\u4F7F\u7528\u4E1A\u52A1\u5C01\u88C5\u65B9\u6CD5**\uFF1A\`sendNewMessagePush\`\u3001\`sendIncomingCallPush\` \u7B49\u5DF2\u914D\u7F6E\u597D\u901A\u9053\u548C\u6570\u636E\u683C\u5F0F
2. **\u6279\u91CF\u63A8\u9001\u4F7F\u7528 sendToUsers**\uFF1A\u907F\u514D\u5FAA\u73AF\u8C03\u7528 sendToUser
3. **\u9AD8\u4F18\u5148\u7EA7\u63A8\u9001**\uFF1A\u6765\u7535\u7B49\u7D27\u6025\u901A\u77E5\u4F7F\u7528 \`priority: "high"\`
4. **\u5BA2\u6237\u7AEF\u914D\u7F6E\u901A\u9053**\uFF1A\u786E\u4FDD Android \u5BA2\u6237\u7AEF\u5DF2\u914D\u7F6E\u5BF9\u5E94\u7684\u901A\u77E5\u901A\u9053`;

// mcp-server/resources/handlers.ts
function readAllApis(uri) {
  const text = API_MODULES.map((m) => {
    const apis = m.endpoints.map((e) => `  ${e.method} ${e.path} - ${e.description}`).join("\n");
    return `## ${m.name} (${m.prefix})
${m.description}

${apis}`;
  }).join("\n\n");
  return { contents: [{ uri, mimeType: "text/plain", text }] };
}
function readWsEvents(uri) {
  const text = WS_EVENTS.map((e) => `${e.type}
  \u63CF\u8FF0: ${e.description}
  \u8F7D\u8377: ${e.payload}`).join("\n\n");
  return { contents: [{ uri, mimeType: "text/plain", text }] };
}
function readTypes(uri) {
  return { contents: [{ uri, mimeType: "text/plain", text: TYPESCRIPT_TYPES }] };
}
function readExpoGuide(uri) {
  return { contents: [{ uri, mimeType: "text/plain", text: EXPO_GUIDE }] };
}
function readPushGuide(uri) {
  return { contents: [{ uri, mimeType: "text/plain", text: PUSH_GUIDE }] };
}
function readResource(uri) {
  switch (uri) {
    case "im://api/all":
      return readAllApis(uri);
    case "im://ws/events":
      return readWsEvents(uri);
    case "im://types":
      return readTypes(uri);
    case "im://guide/expo":
      return readExpoGuide(uri);
    case "im://guide/push":
      return readPushGuide(uri);
    default:
      throw new Error(`\u672A\u77E5\u8D44\u6E90: ${uri}`);
  }
}

// mcp-server/prompts/schemas.ts
var PROMPT_SCHEMAS = [
  {
    name: "implement_feature",
    description: "\u5B9E\u73B0 IM \u529F\u80FD\u7684\u5B8C\u6574\u6307\u5357",
    arguments: [
      {
        name: "feature",
        description: "\u8981\u5B9E\u73B0\u7684\u529F\u80FD\uFF1Alogin, register, send_message, make_call, add_friend, create_group",
        required: true
      }
    ]
  },
  {
    name: "debug_api",
    description: "\u8C03\u8BD5 API \u95EE\u9898",
    arguments: [
      {
        name: "api_path",
        description: "\u51FA\u95EE\u9898\u7684 API \u8DEF\u5F84",
        required: true
      },
      {
        name: "error",
        description: "\u9519\u8BEF\u4FE1\u606F",
        required: true
      }
    ]
  }
];

// mcp-server/prompts/handlers.ts
function handleImplementFeature(args) {
  const feature = args.feature ?? "";
  const guide = FEATURE_GUIDES[feature];
  if (!guide) {
    return {
      messages: [
        {
          role: "user",
          content: { type: "text", text: `\u8BF7\u5E2E\u6211\u5B9E\u73B0 IM \u529F\u80FD: ${feature}` }
        }
      ]
    };
  }
  return {
    messages: [
      {
        role: "user",
        content: { type: "text", text: guide }
      }
    ]
  };
}
function handleDebugApi(args) {
  const apiPath = args.api_path ?? "";
  const error = args.error ?? "";
  const apis = findApi(apiPath);
  const apiInfo = apis.length > 0 ? `

API \u4FE1\u606F:
${apis.map((a) => `${a.method} ${a.path}
\u8BF7\u6C42: ${a.requestBody}
\u54CD\u5E94: ${a.responseBody}`).join("\n")}` : "";
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `\u8C03\u8BD5 API \u95EE\u9898:
API: ${apiPath}
\u9519\u8BEF: ${error}${apiInfo}

\u8BF7\u5206\u6790\u53EF\u80FD\u7684\u539F\u56E0\u548C\u89E3\u51B3\u65B9\u6848\u3002`
        }
      }
    ]
  };
}
function getPrompt(name, args) {
  switch (name) {
    case "implement_feature":
      return handleImplementFeature(args);
    case "debug_api":
      return handleDebugApi(args);
    default:
      throw new Error(`\u672A\u77E5\u63D0\u793A: ${name}`);
  }
}

// mcp-server/server.ts
var server = new Server(
  {
    name: "im-api-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [...TOOL_SCHEMAS] };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return callTool(name, args);
});
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: [...RESOURCE_SCHEMAS] };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  return readResource(uri);
});
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts: [...PROMPT_SCHEMAS] };
});
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return getPrompt(name, args ?? {});
});

// mcp-server/index.ts
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IM-API MCP Server \u5DF2\u542F\u52A8");
}
main().catch(console.error);

/**
 * @packageDocumentation
 * @module mcp-server/data/error-codes
 * @description 错误码数据定义
 */

import type { ErrorCodeDef } from "./types.js";

/** 错误码数据 */
export const ERROR_CODES: ErrorCodeDef[] = [
  // HTTP 通用错误
  {
    code: "BadRequest",
    httpStatus: 400,
    description: "请求参数错误",
    cause: "请求体格式错误、缺少必填字段、字段类型不匹配",
    solution: "检查请求体 JSON 格式，确保所有必填字段存在且类型正确",
  },
  {
    code: "Unauthorized",
    httpStatus: 401,
    description: "未认证",
    cause: "缺少 Authorization 头、Token 无效或已过期",
    solution: "检查 Authorization: Bearer <token> 头是否正确，Token 过期时使用 refresh token 刷新",
  },
  {
    code: "Forbidden",
    httpStatus: 403,
    description: "无权限",
    cause: "已认证但无权访问该资源（非好友、非群成员、非管理员等）",
    solution: "确认当前用户是否有该操作的权限，如操作他人资源需先建立关系",
  },
  {
    code: "NotFound",
    httpStatus: 404,
    description: "资源不存在",
    cause: "请求的用户、消息、群组、会话等资源不存在或已删除",
    solution: "检查资源 ID 是否正确，资源可能已被删除",
  },
  {
    code: "ServerError",
    httpStatus: 500,
    description: "服务器内部错误",
    cause: "服务端异常",
    solution: "请稍后重试，如持续出现请联系管理员",
  },
  // JWT 相关错误
  {
    code: "MISSING_TOKEN",
    httpStatus: 401,
    description: "缺少授权令牌",
    cause: "请求头未携带 Authorization",
    solution: "在请求头添加 Authorization: Bearer <access_token>",
  },
  {
    code: "MALFORMED",
    httpStatus: 400,
    description: "令牌格式错误",
    cause: "Token 不是有效的 JWT 格式",
    solution: "检查 Token 是否完整，格式应为 xxxxx.yyyyy.zzzzz",
  },
  {
    code: "INVALID",
    httpStatus: 401,
    description: "无效令牌",
    cause: "Token 签名验证失败",
    solution: "Token 可能被篡改，请重新登录获取新 Token",
  },
  {
    code: "EXPIRED",
    httpStatus: 401,
    description: "令牌已过期",
    cause: "Access Token 超过有效期（默认 15 分钟）",
    solution: "使用 refresh token 调用 /api/auth/refresh 获取新 access token",
  },
  {
    code: "DEVICE_MISMATCH",
    httpStatus: 401,
    description: "设备不匹配",
    cause: "Token 绑定的设备 ID 与请求的设备 ID 不一致",
    solution: "确保使用同一设备的 Token，或重新登录",
  },
  {
    code: "REVOKED",
    httpStatus: 401,
    description: "令牌已撤销",
    cause: "Token 被主动撤销（用户登出或被踢下线）",
    solution: "重新登录获取新 Token",
  },
  // WebSocket 错误
  {
    code: "4001",
    httpStatus: 4001,
    description: "WebSocket 认证失败",
    cause: "连接时提供的 token 无效",
    solution: "使用有效的 access token 重新连接: ws://host/ws?token=xxx&deviceId=xxx",
  },
  {
    code: "4002",
    httpStatus: 4002,
    description: "WebSocket 设备被踢",
    cause: "同账号在其他设备登录",
    solution: "单设备登录策略，需要在新设备重新登录",
  },
  // 业务错误
  {
    code: "PHONE_EXISTS",
    httpStatus: 400,
    description: "手机号已注册",
    cause: "该手机号已被其他用户注册",
    solution: "使用其他手机号注册，或找回已有账号",
  },
  {
    code: "WRONG_PASSWORD",
    httpStatus: 401,
    description: "密码错误",
    cause: "登录时密码与记录不匹配",
    solution: "检查密码是否正确，注意大小写",
  },
  {
    code: "ALREADY_FRIEND",
    httpStatus: 400,
    description: "已是好友",
    cause: "尝试添加已是好友的用户",
    solution: "无需重复添加，可在好友列表中查看",
  },
  {
    code: "NOT_FRIEND",
    httpStatus: 403,
    description: "非好友关系",
    cause: "尝试对非好友执行需要好友关系的操作",
    solution: "先添加好友后再执行该操作",
  },
  {
    code: "GROUP_FULL",
    httpStatus: 400,
    description: "群组已满",
    cause: "群成员数量达到上限",
    solution: "无法再邀请新成员，需先移除部分成员",
  },
  {
    code: "NOT_GROUP_MEMBER",
    httpStatus: 403,
    description: "非群成员",
    cause: "尝试操作未加入的群组",
    solution: "需要先加入群组",
  },
  {
    code: "NOT_GROUP_ADMIN",
    httpStatus: 403,
    description: "非管理员",
    cause: "该操作需要群主或管理员权限",
    solution: "联系群主或管理员执行该操作",
  },
  {
    code: "RECALL_TIMEOUT",
    httpStatus: 400,
    description: "撤回超时",
    cause: "消息发送超过 2 分钟无法撤回",
    solution: "只能撤回 2 分钟内的消息",
  },
  {
    code: "CALL_BUSY",
    httpStatus: 400,
    description: "用户忙线",
    cause: "被叫用户正在通话中",
    solution: "稍后再试",
  },
];

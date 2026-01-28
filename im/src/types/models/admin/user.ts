/**
 * @packageDocumentation
 * @module types/models/admin/user
 * @since 1.0.0
 * @author Z-Kali
 * @tags [User], [Types], [Model], [Admin], [DTO]
 * @description 用户模型类型定义：属性接口、状态枚举、字段配置常量
 * @path src/types/models/admin/user.ts
 * @see src/models/user/index.ts
 */

/**
 * @const UserState
 * @description 用户状态枚举
 * @property {string} NORMAL - 正常
 * @property {string} MUTED - 禁言
 * @property {string} BANNED - 封禁
 * @property {string} CANCELED - 注销
 * @property {string} RISK_CONTROLLED - 风控
 */
export const UserState = {
  NORMAL: "normal",
  MUTED: "muted",
  BANNED: "banned",
  CANCELED: "canceled",
  RISK_CONTROLLED: "risk_controlled",
} as const;

export type UserState = (typeof UserState)[keyof typeof UserState];

/**
 * @interface UserLocation
 * @description 用户位置信息
 * @property {string} country - 国家
 * @property {string} province - 省份
 * @property {string} city - 城市
 */
export interface UserLocation {
  country: string;
  province: string;
  city: string;
}

/**
 * @interface UserAttributes
 * @description 用户模型完整属性接口
 * @property {string} id - 用户 ID
 * @property {string | null} pid - 上级用户 ID
 * @property {boolean} searchable - 是否允许被搜索
 * @property {string | null} code - 邀请码
 * @property {string} phone - 手机号
 * @property {string} password - 密码哈希
 * @property {string} pin - 二级密码哈希
 * @property {string} roleId - 角色 ID
 * @property {string | null} telegramId - Telegram ID
 * @property {string | null} teamId - 团队 ID
 * @property {UserState} state - 用户状态
 * @property {boolean} vip - VIP 标识
 * @property {string} name - 昵称（自动生成）
 * @property {string | null} avatar - 头像
 * @property {"male" | "female" | "unknown"} gender - 性别
 * @property {UserLocation | null} location - 位置信息
 * @property {string | null} ip - IP 地址
 * @property {string | null} ua - User-Agent
 * @property {boolean} longSession - 长期登录标识
 * @property {Date | null} lastOnlineAt - 最后在线时间
 * @property {boolean} privateMuted - 私聊全局禁言开关
 * @property {Date | null} privateMuteUntil - 私聊禁言截止时间（null 表示永久）
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 * @property {Date | null} deletedAt - 删除时间
 */
export interface UserAttributes {
  id: string;
  pid: string | null;
  searchable: boolean;
  code: string | null;
  phone: string;
  password: string;
  pin: string;
  roleId: string;
  telegramId: string | null;
  teamId: string | null;
  state: UserState;
  vip: boolean;
  name: string;
  avatar: string | null;
  gender: "male" | "female" | "unknown";
  location: UserLocation | null;
  ip: string | null;
  ua: string | null;
  longSession: boolean;
  lastOnlineAt: Date | null;
  privateMuted: boolean;
  privateMuteUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const USER_LIST
 * @description 列表查询字段
 */
export const USER_LIST = [
  "id",
  "pid",
  "phone",
  "name",
  "avatar",
  "state",
  "vip",
  "roleId",
  "searchable",
  "privateMuted",
  "createdAt",
] as const;

/**
 * @const USER_DETAIL
 * @description 详情查询字段
 */
export const USER_DETAIL = [
  "id",
  "pid",
  "searchable",
  "code",
  "phone",
  "name",
  "avatar",
  "state",
  "vip",
  "roleId",
  "telegramId",
  "teamId",
  "gender",
  "location",
  "longSession",
  "lastOnlineAt",
  "privateMuted",
  "privateMuteUntil",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const USER_CREATABLE
 * @description 创建时允许写入字段
 */
export const USER_CREATABLE = [
  "phone",
  "password",
  "pin",
  "name",
  "avatar",
  "roleId",
] as const;

/**
 * @const USER_UPDATABLE
 * @description 更新时允许写入字段
 */
export const USER_UPDATABLE = [
  "pid",
  "name",
  "avatar",
  "state",
  "vip",
  "roleId",
  "gender",
  "location",
  "longSession",
  "searchable",
  "privateMuted",
  "privateMuteUntil",
] as const;

/**
 * @const USER_FILTERABLE
 * @description 可筛选字段
 */
export const USER_FILTERABLE = [
  "state",
  "vip",
  "roleId",
  "gender",
  "searchable",
  "pid",
  "privateMuted",
] as const;

/**
 * @const USER_SORTABLE
 * @description 可排序字段
 */
export const USER_SORTABLE = [
  "createdAt",
  "lastOnlineAt",
  "name",
] as const;

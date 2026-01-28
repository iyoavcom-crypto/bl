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
 * @const Gender
 * @description 用户性别枚举
 * @property {string} MALE - 男性
 * @property {string} FEMALE - 女性
 * @property {string} UNKNOWN - 未知
 */
export const Gender = {
  MALE: "male",
  FEMALE: "female",
  UNKNOWN: "unknown",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

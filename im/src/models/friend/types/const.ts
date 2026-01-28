/**
 * @const FriendSource
 * @description 好友添加来源枚举
 */
export const FriendSource = {
  SEARCH: "search",
  QR: "qr",
  PHONE: "phone",
  INVITE: "invite",
} as const;

export type FriendSource = (typeof FriendSource)[keyof typeof FriendSource];

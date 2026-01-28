/**
 * @const FriendRequestStatus
 * @description 好友请求状态枚举
 */
export const FriendRequestStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  IGNORED: "ignored",
} as const;

export type FriendRequestStatus = (typeof FriendRequestStatus)[keyof typeof FriendRequestStatus];

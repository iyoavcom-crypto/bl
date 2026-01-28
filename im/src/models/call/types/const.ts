/**
 * @const CallStatus
 * @description 通话状态枚举
 */
export const CallStatus = {
  INITIATED: "initiated",
  RINGING: "ringing",
  CONNECTED: "connected",
  ENDED: "ended",
  MISSED: "missed",
  REJECTED: "rejected",
  BUSY: "busy",
} as const;

export type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];

/**
 * @const CallEndReason
 * @description 通话结束原因枚举
 */
export const CallEndReason = {
  CALLER_HANGUP: "caller_hangup",
  CALLEE_HANGUP: "callee_hangup",
  TIMEOUT: "timeout",
  NETWORK_ERROR: "network_error",
} as const;

export type CallEndReason = (typeof CallEndReason)[keyof typeof CallEndReason];

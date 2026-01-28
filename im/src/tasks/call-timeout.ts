/**
 * @packageDocumentation
 * @module tasks/call-timeout
 * @description 通话超时定时任务
 * @path src/tasks/call-timeout.ts
 */

import { Op } from "sequelize";
import { Call } from "@/models/index.js";
import { CallStatus, CallEndReason } from "@/models/call/index.js";
import { callPushHook } from "@/websocket/index.js";

/** 通话响铃超时时间（毫秒） */
const RING_TIMEOUT_MS = 60 * 1000;

/** 检查间隔（毫秒） */
const CHECK_INTERVAL_MS = 10 * 1000;

/** 定时器引用 */
let timeoutInterval: NodeJS.Timeout | null = null;

/**
 * @function checkTimeoutCalls
 * @description 检查并处理超时通话
 */
async function checkTimeoutCalls(): Promise<void> {
  try {
    const timeoutThreshold = new Date(Date.now() - RING_TIMEOUT_MS);

    // 查找超时的通话（INITIATED 或 RINGING 状态，且创建时间超过阈值）
    const timeoutCalls = await Call.findAll({
      where: {
        status: { [Op.in]: [CallStatus.INITIATED, CallStatus.RINGING] },
        createdAt: { [Op.lt]: timeoutThreshold },
      },
    });

    for (const call of timeoutCalls) {
      try {
        // 更新通话状态为未接
        await call.update({
          status: CallStatus.MISSED,
          endedAt: new Date(),
          endReason: CallEndReason.TIMEOUT,
        });

        // 推送未接来电通知给被叫
        callPushHook.onCallMissed(call.calleeId, call.id, CallEndReason.TIMEOUT).catch((err: unknown) => {
          console.error("[CallTimeout] 推送未接来电失败:", err);
        });

        // 推送超时通知给主叫
        callPushHook.onCallCancelled(call.callerId, call.id, "system").catch((err: unknown) => {
          console.error("[CallTimeout] 推送超时通知失败:", err);
        });

        console.log(`[CallTimeout] 通话超时处理完成: callId=${call.id}`);
      } catch (err) {
        console.error(`[CallTimeout] 处理通话超时失败: callId=${call.id}`, err);
      }
    }
  } catch (err) {
    console.error("[CallTimeout] 检查超时通话失败:", err);
  }
}

/**
 * @function startCallTimeoutTask
 * @description 启动通话超时检查任务
 */
export function startCallTimeoutTask(): void {
  if (timeoutInterval) {
    return;
  }

  timeoutInterval = setInterval(checkTimeoutCalls, CHECK_INTERVAL_MS);
  console.log(`[CallTimeout] 通话超时检查任务已启动，间隔: ${CHECK_INTERVAL_MS}ms，超时: ${RING_TIMEOUT_MS}ms`);
}

/**
 * @function stopCallTimeoutTask
 * @description 停止通话超时检查任务
 */
export function stopCallTimeoutTask(): void {
  if (timeoutInterval) {
    clearInterval(timeoutInterval);
    timeoutInterval = null;
    console.log("[CallTimeout] 通话超时检查任务已停止");
  }
}

/**
 * @packageDocumentation
 * @module websocket/integration/presence
 * @description 在线状态推送集成钩子
 */

import { messageRouter } from "../router/index.js";
import {
  createPresenceOnlineEvent,
  createPresenceOfflineEvent,
} from "../events/index.js";

/**
 * @class PresencePushHook
 * @description 在线状态推送钩子
 */
class PresencePushHook {
  /**
   * @method onUserOnline
   * @description 用户上线通知
   */
  async onUserOnline(
    targetUserIds: string[],
    userId: string,
    deviceId: string
  ): Promise<void> {
    const event = createPresenceOnlineEvent(userId, deviceId);
    await messageRouter.sendToUsers(targetUserIds, event);
  }

  /**
   * @method onUserOffline
   * @description 用户离线通知
   */
  async onUserOffline(
    targetUserIds: string[],
    userId: string,
    deviceId: string
  ): Promise<void> {
    const event = createPresenceOfflineEvent(userId, deviceId);
    await messageRouter.sendToUsers(targetUserIds, event);
  }
}

export const presencePushHook = new PresencePushHook();
export type { PresencePushHook };

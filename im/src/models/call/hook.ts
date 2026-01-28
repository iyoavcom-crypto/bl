import type { Call } from "./call.js";
import { randomUUID } from "crypto";

/**
 * @function callBeforeCreateHook
 * @description 通话模型创建前钩子
 * @param {Call} call - 通话实例
 */
export function callBeforeCreateHook(call: Call): void {
  if (!call.get("id")) {
    call.set("id", randomUUID());
  }
}

import type { Group } from "./group.js";
import { randomUUID } from "crypto";

/**
 * @function groupBeforeCreateHook
 * @description 群组模型创建前钩子
 * @param {Group} group - 群组实例
 */
export function groupBeforeCreateHook(group: Group): void {
  if (!group.get("id")) {
    group.set("id", randomUUID());
  }
}

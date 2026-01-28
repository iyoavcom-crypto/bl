import type { GroupMember } from "./group-member.js";
import { randomUUID } from "crypto";

/**
 * @function groupMemberBeforeCreateHook
 * @description 群成员模型创建前钩子
 * @param {GroupMember} member - 群成员实例
 */
export function groupMemberBeforeCreateHook(member: GroupMember): void {
  if (!member.get("id")) {
    member.set("id", randomUUID());
  }
}

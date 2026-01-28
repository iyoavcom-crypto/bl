import { Conversation } from "./conversation.js";
import { User } from "../user/user.js";
import { Group } from "../group/group.js";

/**
 * @function associateConversation
 * @description 建立 Conversation 与 User、Group 的关联
 */
export function associateConversation(): void {
  Conversation.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: true },
    as: "user",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Conversation.belongsTo(User, {
    foreignKey: { name: "friendId", allowNull: true },
    as: "friend",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Conversation.belongsTo(Group, {
    foreignKey: { name: "groupId", allowNull: true },
    as: "group",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Group.hasOne(Conversation, {
    foreignKey: { name: "groupId", allowNull: true },
    as: "conversation",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

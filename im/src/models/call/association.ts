import { Call } from "./call.js";
import { Conversation } from "../conversation/conversation.js";
import { User } from "../user/user.js";

/**
 * @function associateCall
 * @description 建立 Call 与 Conversation、User 的关联
 */
export function associateCall(): void {
  Call.belongsTo(Conversation, {
    foreignKey: { name: "conversationId", allowNull: false },
    as: "conversation",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Call.belongsTo(User, {
    foreignKey: { name: "callerId", allowNull: false },
    as: "caller",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Call.belongsTo(User, {
    foreignKey: { name: "calleeId", allowNull: false },
    as: "callee",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Conversation.hasMany(Call, {
    foreignKey: { name: "conversationId", allowNull: false },
    as: "calls",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(Call, {
    foreignKey: { name: "callerId", allowNull: false },
    as: "initiatedCalls",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(Call, {
    foreignKey: { name: "calleeId", allowNull: false },
    as: "receivedCalls",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

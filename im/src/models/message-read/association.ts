import { MessageRead } from "./message-read.js";
import { Message } from "../message/message.js";
import { User } from "../user/user.js";
import { Conversation } from "../conversation/conversation.js";

/**
 * @function associateMessageRead
 * @description 建立 MessageRead 与 Conversation、Message、User 的关联
 */
export function associateMessageRead(): void {
  MessageRead.belongsTo(Conversation, {
    foreignKey: { name: "conversationId", allowNull: false },
    as: "conversation",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  MessageRead.belongsTo(Message, {
    foreignKey: { name: "lastReadMessageId", allowNull: false },
    as: "lastReadMessage",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  MessageRead.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    as: "user",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Conversation.hasMany(MessageRead, {
    foreignKey: { name: "conversationId", allowNull: false },
    as: "readRecords",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

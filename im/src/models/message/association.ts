import { Message } from "./message.js";
import { Conversation } from "../conversation/conversation.js";
import { User } from "../user/user.js";

/**
 * @function associateMessage
 * @description 建立 Message 与 Conversation、User 的关联
 */
export function associateMessage(): void {
  Message.belongsTo(Conversation, {
    foreignKey: { name: "conversationId", allowNull: false },
    as: "conversation",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Message.belongsTo(User, {
    foreignKey: { name: "senderId", allowNull: true },
    as: "sender",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  Message.belongsTo(Message, {
    foreignKey: { name: "replyToId", allowNull: true },
    as: "replyTo",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  Message.hasMany(Message, {
    foreignKey: { name: "replyToId", allowNull: true },
    as: "replies",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  Conversation.hasMany(Message, {
    foreignKey: { name: "conversationId", allowNull: false },
    as: "messages",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(Message, {
    foreignKey: { name: "senderId", allowNull: true },
    as: "sentMessages",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  // 关联 lastMessage
  Conversation.belongsTo(Message, {
    foreignKey: { name: "lastMessageId", allowNull: true },
    as: "lastMessage",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
}

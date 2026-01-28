import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { ConversationAttributes, ConversationType } from "./types/index.js";
import { conversationBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type ConversationCreationAttributes
 * @description 创建时可省略部分字段
 */
export type ConversationCreationAttributes = Optional<
  ConversationAttributes,
  | "id"
  | "userId"
  | "friendId"
  | "groupId"
  | "lastMessageId"
  | "lastMessageAt"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Conversation
 * @description 会话模型
 */
export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  declare id: string;
  declare type: ConversationType;
  declare userId: string | null;
  declare friendId: string | null;
  declare groupId: string | null;
  declare lastMessageId: string | null;
  declare lastMessageAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initConversation
 * @description 初始化 Conversation 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Conversation} 模型类
 */
export function initConversation(sequelize: Sequelize): typeof Conversation {
  Conversation.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      type: {
        type: DataTypes.ENUM("private", "group"),
        allowNull: false,
        comment: "会话类型",
      },
      userId: {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: "私聊用户 A ID",
        references: { model: "user", key: "id" },
      },
      friendId: {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: "私聊用户 B ID",
        references: { model: "user", key: "id" },
      },
      groupId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment: "群组 ID",
        references: { model: "group", key: "id" },
      },
      lastMessageId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment: "最后消息 ID",
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "最后消息时间",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "创建时间",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "更新时间",
      },
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "conversation",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "conversation_private_unique",
          unique: true,
          fields: ["userId", "friendId"],
          where: { type: "private" },
        },
        {
          name: "conversation_group_unique",
          unique: true,
          fields: ["groupId"],
          where: { type: "group" },
        },
        { fields: ["userId", "lastMessageAt"] },
        { fields: ["type"] },
      ],
      comment: "会话表",
    }
  );

  Conversation.beforeCreate(conversationBeforeCreateHook);

  return Conversation;
}

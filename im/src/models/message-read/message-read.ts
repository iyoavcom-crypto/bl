import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { MessageReadAttributes } from "./types/index.js";
import { messageReadBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type MessageReadCreationAttributes
 * @description 创建时可省略部分字段
 */
export type MessageReadCreationAttributes = Optional<
  MessageReadAttributes,
  | "id"
  | "readAt"
  | "createdAt"
>;

/**
 * @class MessageRead
 * @description 已读回执模型
 */
export class MessageRead extends Model<MessageReadAttributes, MessageReadCreationAttributes> implements MessageReadAttributes {
  declare id: string;
  declare conversationId: string;
  declare userId: string;
  declare lastReadMessageId: string;
  declare readAt: Date;
  declare createdAt: Date;
}

/**
 * @function initMessageRead
 * @description 初始化 MessageRead 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof MessageRead} 模型类
 */
export function initMessageRead(sequelize: Sequelize): typeof MessageRead {
  MessageRead.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      conversationId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        comment: "会话 ID",
        references: { model: "conversation", key: "id" },
      },
      userId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "用户 ID",
        references: { model: "user", key: "id" },
      },
      lastReadMessageId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        comment: "最后已读消息 ID",
        references: { model: "message", key: "id" },
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "已读时间",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "创建时间",
      },
    },
    {
      sequelize,
      modelName: "MessageRead",
      tableName: "message_read",
      timestamps: true,
      updatedAt: false,
      paranoid: false,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "message_read_conversationId_userId_unique",
          unique: true,
          fields: ["conversationId", "userId"],
        },
        { fields: ["userId", "readAt"] },
        { fields: ["conversationId"] },
      ],
      comment: "已读回执表",
    }
  );

  MessageRead.beforeCreate(messageReadBeforeCreateHook);

  return MessageRead;
}

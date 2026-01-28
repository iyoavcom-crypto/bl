import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { MessageAttributes, MessageType } from "./types/index.js";
import { messageBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type MessageCreationAttributes
 * @description 创建时可省略部分字段
 */
export type MessageCreationAttributes = Optional<
  MessageAttributes,
  | "id"
  | "senderId"
  | "content"
  | "mediaUrl"
  | "mediaDuration"
  | "replyToId"
  | "isRecalled"
  | "recalledAt"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Message
 * @description 消息模型
 */
export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  declare id: string;
  declare conversationId: string;
  declare senderId: string | null;
  declare type: MessageType;
  declare content: string | null;
  declare mediaUrl: string | null;
  declare mediaDuration: number | null;
  declare replyToId: string | null;
  declare isRecalled: boolean;
  declare recalledAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initMessage
 * @description 初始化 Message 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Message} 模型类
 */
export function initMessage(sequelize: Sequelize): typeof Message {
  Message.init(
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
      senderId: {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: "发送者 ID（用户删除后为 NULL）",
        references: { model: "user", key: "id" },
      },
      type: {
        type: DataTypes.ENUM("text", "image", "voice"),
        allowNull: false,
        comment: "消息类型",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "文本内容或 JSON 元数据",
      },
      mediaUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "媒体文件 URL",
      },
      mediaDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "媒体时长（秒）",
        validate: {
          max: 60,
        },
      },
      replyToId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment: "引用消息 ID",
        references: { model: "message", key: "id" },
      },
      isRecalled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否已撤回",
      },
      recalledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "撤回时间",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "发送时间",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "更新时间",
      },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "message",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { fields: ["conversationId", "createdAt"] },
        { fields: ["senderId"] },
        { fields: ["replyToId"] },
        { fields: ["isRecalled"] },
        { fields: ["type"] },
      ],
      comment: "消息表",
    }
  );

  Message.beforeCreate(messageBeforeCreateHook);

  return Message;
}

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { FriendAttributes, FriendSource } from "./types/index.js";
import { friendBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type FriendCreationAttributes
 * @description 创建时可省略部分字段
 */
export type FriendCreationAttributes = Optional<
  FriendAttributes,
  | "id"
  | "alias"
  | "isBlocked"
  | "doNotDisturb"
  | "isPinned"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Friend
 * @description 好友关系模型
 */
export class Friend extends Model<FriendAttributes, FriendCreationAttributes> implements FriendAttributes {
  declare id: string;
  declare userId: string;
  declare friendId: string;
  declare alias: string | null;
  declare isBlocked: boolean;
  declare doNotDisturb: boolean;
  declare isPinned: boolean;
  declare source: FriendSource;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initFriend
 * @description 初始化 Friend 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Friend} 模型类
 */
export function initFriend(sequelize: Sequelize): typeof Friend {
  Friend.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      userId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "用户 ID",
        references: { model: "user", key: "id" },
      },
      friendId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "好友 ID",
        references: { model: "user", key: "id" },
      },
      alias: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "备注名",
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否拉黑",
      },
      doNotDisturb: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "免打扰",
      },
      isPinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否置顶",
      },
      source: {
        type: DataTypes.ENUM("search", "qr", "phone", "invite"),
        allowNull: false,
        comment: "添加来源",
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
      modelName: "Friend",
      tableName: "friend",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "friend_userId_friendId_unique",
          unique: true,
          fields: ["userId", "friendId"],
        },
        { fields: ["userId", "isBlocked"] },
        { fields: ["userId", "isPinned"] },
        { fields: ["friendId"] },
        { fields: ["createdAt"] },
      ],
      comment: "好友关系表",
    }
  );

  Friend.beforeCreate(friendBeforeCreateHook);

  return Friend;
}

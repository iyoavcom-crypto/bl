import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { FriendRequestAttributes, FriendRequestStatus } from "./types/index.js";
import type { FriendSource } from "../friend/types/index.js";
import { friendRequestBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type FriendRequestCreationAttributes
 * @description 创建时可省略部分字段
 */
export type FriendRequestCreationAttributes = Optional<
  FriendRequestAttributes,
  | "id"
  | "message"
  | "status"
  | "respondedAt"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class FriendRequest
 * @description 好友请求模型
 */
export class FriendRequest extends Model<FriendRequestAttributes, FriendRequestCreationAttributes> implements FriendRequestAttributes {
  declare id: string;
  declare fromUserId: string;
  declare toUserId: string;
  declare message: string | null;
  declare source: FriendSource;
  declare status: FriendRequestStatus;
  declare respondedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initFriendRequest
 * @description 初始化 FriendRequest 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof FriendRequest} 模型类
 */
export function initFriendRequest(sequelize: Sequelize): typeof FriendRequest {
  FriendRequest.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      fromUserId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "发起人 ID",
        references: { model: "user", key: "id" },
      },
      toUserId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "接收人 ID",
        references: { model: "user", key: "id" },
      },
      message: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "验证消息",
      },
      source: {
        type: DataTypes.ENUM("search", "qr", "phone", "invite"),
        allowNull: false,
        comment: "请求来源",
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected", "ignored"),
        allowNull: false,
        defaultValue: "pending",
        comment: "请求状态",
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "响应时间",
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
      modelName: "FriendRequest",
      tableName: "friend_request",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { fields: ["toUserId", "status"] },
        { fields: ["fromUserId"] },
        { fields: ["createdAt"] },
      ],
      comment: "好友请求表",
    }
  );

  FriendRequest.beforeCreate(friendRequestBeforeCreateHook);

  return FriendRequest;
}

import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { GroupAttributes, GroupJoinMode } from "./types/index.js";
import { groupBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type GroupCreationAttributes
 * @description 创建时可省略部分字段
 */
export type GroupCreationAttributes = Optional<
  GroupAttributes,
  | "id"
  | "avatar"
  | "description"
  | "maxMembers"
  | "memberCount"
  | "joinMode"
  | "muteAll"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Group
 * @description 群组模型
 */
export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  declare id: string;
  declare name: string;
  declare avatar: string | null;
  declare description: string | null;
  declare ownerId: string;
  declare maxMembers: number;
  declare memberCount: number;
  declare joinMode: GroupJoinMode;
  declare muteAll: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initGroup
 * @description 初始化 Group 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Group} 模型类
 */
export function initGroup(sequelize: Sequelize): typeof Group {
  Group.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "群名称",
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "群头像",
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "群简介",
      },
      ownerId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "群主 ID",
        references: { model: "user", key: "id" },
      },
      maxMembers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 500,
        comment: "最大成员数",
      },
      memberCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "当前成员数",
      },
      joinMode: {
        type: DataTypes.ENUM("invite", "approval", "open"),
        allowNull: false,
        defaultValue: "invite",
        comment: "加群方式",
      },
      muteAll: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "全员禁言",
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
      modelName: "Group",
      tableName: "group",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { fields: ["ownerId"] },
        { fields: ["memberCount"] },
        { fields: ["createdAt"] },
      ],
      comment: "群组表",
    }
  );

  Group.beforeCreate(groupBeforeCreateHook);

  return Group;
}

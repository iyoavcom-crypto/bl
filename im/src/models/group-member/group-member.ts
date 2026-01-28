import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { GroupMemberAttributes, GroupMemberRole } from "./types/index.js";
import { groupMemberBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type GroupMemberCreationAttributes
 * @description 创建时可省略部分字段
 */
export type GroupMemberCreationAttributes = Optional<
  GroupMemberAttributes,
  | "id"
  | "role"
  | "groupNickname"
  | "isMuted"
  | "muteUntil"
  | "doNotDisturb"
  | "joinedAt"
  | "updatedAt"
>;

/**
 * @class GroupMember
 * @description 群成员模型
 */
export class GroupMember extends Model<GroupMemberAttributes, GroupMemberCreationAttributes> implements GroupMemberAttributes {
  declare id: string;
  declare groupId: string;
  declare userId: string;
  declare role: GroupMemberRole;
  declare groupNickname: string | null;
  declare isMuted: boolean;
  declare muteUntil: Date | null;
  declare doNotDisturb: boolean;
  declare joinedAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initGroupMember
 * @description 初始化 GroupMember 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof GroupMember} 模型类
 */
export function initGroupMember(sequelize: Sequelize): typeof GroupMember {
  GroupMember.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      groupId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        comment: "群组 ID",
        references: { model: "group", key: "id" },
      },
      userId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "用户 ID",
        references: { model: "user", key: "id" },
      },
      role: {
        type: DataTypes.ENUM("owner", "admin", "member"),
        allowNull: false,
        defaultValue: "member",
        comment: "成员角色",
      },
      groupNickname: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "群昵称",
      },
      isMuted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否被禁言",
      },
      muteUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "禁言截止时间",
      },
      doNotDisturb: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "免打扰",
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "加群时间",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "更新时间",
      },
    },
    {
      sequelize,
      modelName: "GroupMember",
      tableName: "group_member",
      timestamps: true,
      createdAt: "joinedAt",
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "group_member_groupId_userId_unique",
          unique: true,
          fields: ["groupId", "userId"],
        },
        { fields: ["userId"] },
        { fields: ["groupId", "role"] },
        { fields: ["groupId", "isMuted"] },
        { fields: ["joinedAt"] },
      ],
      comment: "群成员表",
    }
  );

  GroupMember.beforeCreate(groupMemberBeforeCreateHook);

  return GroupMember;
}

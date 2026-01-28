import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { UserAttributes, UserState, UserLocation } from "./types";
import { userBeforeCreateHook, userBeforeSaveHook } from "./hook.js";
import { genUserId } from "@/utils/index.js";

/**
 * @type UserCreationAttributes
 * @description 创建时可省略部分字段
 */
export type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "pid"
  | "searchable"
  | "name"
  | "avatar"
  | "vip"
  | "state"
  | "longSession"
  | "roleId"
  | "teamId"
  | "telegramId"
  | "gender"
  | "location"
  | "lastOnlineAt"
  | "privateMuted"
  | "privateMuteUntil"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class User
 * @description 用户模型
 */
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare pid: string | null;
  declare searchable: boolean;
  declare code: string | null;

  declare phone: string;
  declare password: string;
  declare pin: string;

  declare roleId: string;
  declare telegramId: string | null;
  declare teamId: string | null;

  declare state: UserState;
  declare vip: boolean;

  declare name: string;
  declare avatar: string | null;

  declare gender: "male" | "female" | "unknown";
  declare location: UserLocation | null;

  declare ip: string | null;
  declare ua: string | null;

  declare longSession: boolean;
  declare lastOnlineAt: Date | null;

  declare privateMuted: boolean;
  declare privateMuteUntil: Date | null;

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  /**
   * @function toJSON
   * @description 强类型安全序列化，剔除敏感字段
   * @returns {Omit<UserAttributes,"password"|"pin">} 安全对象
   */
  override toJSON(): Omit<UserAttributes, "password" | "pin"> {
    const plain = super.get({ plain: true }) as unknown as UserAttributes;
    const { password: _pw, pin: _pin, ...safe } = plain;
    return safe;
  }
}

/**
 * @function initUser
 * @description 初始化 User 模型定义并建立自关联（parent/children）
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof User} 模型类
 */
export function initUser(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: { type: DataTypes.STRING(7), allowNull: false, primaryKey: true, defaultValue: () => genUserId(), comment: "主键（7位随机数字）" },
      pid: { type: DataTypes.STRING(7), allowNull: true, comment: "上级用户 ID", references: { model: "user", key: "id" } },
      searchable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, comment: "是否允许被搜索" },
      code: { type: DataTypes.STRING(64), allowNull: true, unique: true, comment: "邀请码" },
      phone: { type: DataTypes.STRING(20), allowNull: false, unique: true, comment: "手机号", validate: { is: /^[0-9]+$/u } },
      password: { type: DataTypes.STRING(200), allowNull: false, comment: "密码哈希（scrypt）" },
      pin: { type: DataTypes.STRING(200), allowNull: false, comment: "二级密码哈希（scrypt）" },
      roleId: { type: DataTypes.STRING(36), allowNull: false, defaultValue: "user", comment: "角色 ID" },
      telegramId: { type: DataTypes.STRING(64), allowNull: true, comment: "Telegram ID" },
      teamId: { type: DataTypes.STRING(36), allowNull: true, comment: "团队 ID" },
      state: { type: DataTypes.ENUM("normal", "muted", "banned", "canceled", "risk_controlled"), allowNull: false, defaultValue: "normal", comment: "用户状态" },
      vip: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "是否 VIP" },
      name: { type: DataTypes.STRING(20), allowNull: true, comment: "昵称" },
      avatar: { type: DataTypes.STRING(255), allowNull: true, comment: "头像" },
      gender: { type: DataTypes.ENUM("male", "female", "unknown"), allowNull: false, defaultValue: "unknown", comment: "性别" },
      location: { type: DataTypes.JSON, allowNull: true, defaultValue: null, comment: "位置信息" },
      ip: { type: DataTypes.STRING(255), allowNull: true, comment: "IP 地址" },
      ua: { type: DataTypes.STRING(255), allowNull: true, comment: "User-Agent" },
      longSession: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "是否允许长期登录" },
      lastOnlineAt: { type: DataTypes.DATE, allowNull: true, comment: "最后在线时间" },
      privateMuted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "私聊全局禁言开关" },
      privateMuteUntil: { type: DataTypes.DATE, allowNull: true, defaultValue: null, comment: "私聊禁言截止时间（null 表示永久）" },
      createdAt: { type: DataTypes.DATE, allowNull: false, comment: "创建时间" },
      updatedAt: { type: DataTypes.DATE, allowNull: false, comment: "更新时间" },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "user",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      defaultScope: { attributes: { exclude: ["password", "pin"] } },
      scopes: { withSecret: { attributes: { include: ["password", "pin"] } } },
      indexes: [
        {
          name: "user_createdAt_id_desc_idx",
          using: "BTREE",
          fields: [
            { name: "createdAt", order: "DESC" },
            { name: "id", order: "DESC" },
          ],
        },
        { fields: ["roleId"] },
        { fields: ["state"] },
        { fields: ["lastOnlineAt"] },
        { fields: ["phone"] },
        { fields: ["pid"] },
        { fields: ["searchable"] },
        { fields: ["privateMuted"] },
      ],
      comment: "用户表",
    }
  );

  User.beforeCreate(userBeforeCreateHook);
  User.beforeSave(userBeforeSaveHook);

  return User;
}

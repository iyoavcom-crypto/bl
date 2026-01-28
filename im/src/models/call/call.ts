import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { CallAttributes, CallStatus, CallEndReason } from "./types/index.js";
import { callBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type CallCreationAttributes
 * @description 创建时可省略部分字段
 */
export type CallCreationAttributes = Optional<
  CallAttributes,
  | "id"
  | "status"
  | "startedAt"
  | "endedAt"
  | "duration"
  | "endReason"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Call
 * @description 通话模型
 */
export class Call extends Model<CallAttributes, CallCreationAttributes> implements CallAttributes {
  declare id: string;
  declare conversationId: string;
  declare callerId: string;
  declare calleeId: string;
  declare status: CallStatus;
  declare startedAt: Date | null;
  declare endedAt: Date | null;
  declare duration: number | null;
  declare endReason: CallEndReason | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * @function initCall
 * @description 初始化 Call 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Call} 模型类
 */
export function initCall(sequelize: Sequelize): typeof Call {
  Call.init(
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
      callerId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "发起者 ID",
        references: { model: "user", key: "id" },
      },
      calleeId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "接听者 ID",
        references: { model: "user", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("initiated", "ringing", "connected", "ended", "missed", "rejected", "busy"),
        allowNull: false,
        defaultValue: "initiated",
        comment: "通话状态",
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "接通时间",
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "结束时间",
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "通话时长（秒）",
      },
      endReason: {
        type: DataTypes.ENUM("caller_hangup", "callee_hangup", "timeout", "network_error"),
        allowNull: true,
        comment: "结束原因",
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
      modelName: "Call",
      tableName: "call",
      timestamps: true,
      paranoid: false,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        { fields: ["conversationId", "createdAt"] },
        { fields: ["callerId"] },
        { fields: ["calleeId"] },
        { fields: ["status"] },
      ],
      comment: "通话记录表",
    }
  );

  Call.beforeCreate(callBeforeCreateHook);

  return Call;
}

import { User } from "./user.js";
import { Role } from "../role/index.js";
 
/**
 * @function associateUser
 * @description 建立 User 与 Role 的关联，以及 User 自关联（parent/children）
 * @since 1.0.0 (2025-10-23)
 */
export function associateUser(): void {
  User.belongsTo(Role, {
    foreignKey: { name: "roleId", allowNull: false },
    as: "role",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  Role.hasMany(User, {
    foreignKey: { name: "roleId", allowNull: false },
    as: "users",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  User.belongsTo(User, {
    foreignKey: { name: "pid", allowNull: true },
    as: "parent",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  User.hasMany(User, {
    foreignKey: { name: "pid", allowNull: true },
    as: "children",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
}
 
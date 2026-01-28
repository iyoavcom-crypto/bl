import { Group } from "./group.js";
import { User } from "../user/user.js";

/**
 * @function associateGroup
 * @description 建立 Group 与 User 的关联
 */
export function associateGroup(): void {
  Group.belongsTo(User, {
    foreignKey: { name: "ownerId", allowNull: false },
    as: "owner",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  User.hasMany(Group, {
    foreignKey: { name: "ownerId", allowNull: false },
    as: "ownedGroups",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });
}

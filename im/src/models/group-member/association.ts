import { GroupMember } from "./group-member.js";
import { Group } from "../group/group.js";
import { User } from "../user/user.js";

/**
 * @function associateGroupMember
 * @description 建立 GroupMember 与 Group、User 的关联
 */
export function associateGroupMember(): void {
  GroupMember.belongsTo(Group, {
    foreignKey: { name: "groupId", allowNull: false },
    as: "group",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  GroupMember.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    as: "user",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Group.hasMany(GroupMember, {
    foreignKey: { name: "groupId", allowNull: false },
    as: "members",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(GroupMember, {
    foreignKey: { name: "userId", allowNull: false },
    as: "groupMemberships",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

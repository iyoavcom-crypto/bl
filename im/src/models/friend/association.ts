import { Friend } from "./friend.js";
import { User } from "../user/user.js";

/**
 * @function associateFriend
 * @description 建立 Friend 与 User 的关联
 */
export function associateFriend(): void {
  Friend.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    as: "user",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  Friend.belongsTo(User, {
    foreignKey: { name: "friendId", allowNull: false },
    as: "friendUser",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(Friend, {
    foreignKey: { name: "userId", allowNull: false },
    as: "friendships",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(Friend, {
    foreignKey: { name: "friendId", allowNull: false },
    as: "friendsOfMe",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

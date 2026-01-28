import { FriendRequest } from "./friend-request.js";
import { User } from "../user/user.js";

/**
 * @function associateFriendRequest
 * @description 建立 FriendRequest 与 User 的关联
 */
export function associateFriendRequest(): void {
  FriendRequest.belongsTo(User, {
    foreignKey: { name: "fromUserId", allowNull: false },
    as: "fromUser",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  FriendRequest.belongsTo(User, {
    foreignKey: { name: "toUserId", allowNull: false },
    as: "toUser",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(FriendRequest, {
    foreignKey: { name: "fromUserId", allowNull: false },
    as: "sentRequests",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(FriendRequest, {
    foreignKey: { name: "toUserId", allowNull: false },
    as: "receivedRequests",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

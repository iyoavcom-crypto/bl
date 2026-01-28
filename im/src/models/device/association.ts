import { Device } from "./device.js";
import { User } from "../user/user.js";

/**
 * @function associateDevice
 * @description 建立 Device 与 User 的关联
 */
export function associateDevice(): void {
  Device.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    as: "user",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  User.hasMany(Device, {
    foreignKey: { name: "userId", allowNull: false },
    as: "devices",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });
}

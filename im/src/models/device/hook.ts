import type { Device } from "./device.js";
import { randomUUID } from "crypto";

/**
 * @function deviceBeforeCreateHook
 * @description 设备模型创建前钩子，用于生成 UUID
 * @param {Device} device - 设备实例
 */
export function deviceBeforeCreateHook(device: Device): void {
  if (!device.get("id")) {
    device.set("id", randomUUID());
  }
}

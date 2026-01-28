/**
 * @packageDocumentation
 * @module routes/im/device
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[设备]
 * @description IM 前台设备路由：注册、更新、心跳、推送令牌等
 * @path src/routes/im/device.ts
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import IMDeviceService from "@/services/im/device.js";
import { ok, created, noContent } from "@/contracts/crud/ok.js";
import type { DevicePlatform, PushProvider } from "@/models/device/index.js";

const router = Router();

/**
 * @route GET /im/devices
 * @description 获取我的设备列表
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const devices = await IMDeviceService.getMyDevices(userId);
    return ok(res, devices);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/devices/register
 * @description 注册或更新设备
 */
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { platform, deviceId, deviceName, pushToken, pushProvider, appVersion, osVersion } = req.body as {
      platform: DevicePlatform;
      deviceId: string;
      deviceName?: string;
      pushToken?: string;
      pushProvider?: PushProvider;
      appVersion?: string;
      osVersion?: string;
    };

    if (!platform || !deviceId) {
      const error = new Error("缺少必填参数") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const ip = req.ip || req.socket.remoteAddress;
    const device = await IMDeviceService.registerDevice(userId, {
      platform,
      deviceId,
      deviceName,
      pushToken,
      pushProvider,
      appVersion,
      osVersion,
    }, ip);

    return created(res, device);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/devices/:deviceId
 * @description 获取设备详情
 */
router.get("/:deviceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { deviceId } = req.params;

    const device = await IMDeviceService.getDeviceDetail(userId, deviceId);
    return ok(res, device);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route PUT /im/devices/:deviceId
 * @description 更新设备信息
 */
router.put("/:deviceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { deviceId } = req.params;
    const { deviceName, pushToken, pushProvider, appVersion, osVersion, doNotDisturb } = req.body as {
      deviceName?: string;
      pushToken?: string;
      pushProvider?: PushProvider;
      appVersion?: string;
      osVersion?: string;
      doNotDisturb?: boolean;
    };

    const device = await IMDeviceService.updateDevice(userId, deviceId, {
      deviceName,
      pushToken,
      pushProvider,
      appVersion,
      osVersion,
      doNotDisturb,
    });

    return ok(res, device);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route DELETE /im/devices/:deviceId
 * @description 删除设备（退出登录）
 */
router.delete("/:deviceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { deviceId } = req.params;

    await IMDeviceService.removeDevice(userId, deviceId);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/devices/:deviceId/push-token
 * @description 更新推送令牌
 */
router.post("/:deviceId/push-token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { deviceId } = req.params;
    const { pushToken, pushProvider } = req.body as {
      pushToken: string;
      pushProvider: PushProvider;
    };

    if (!pushToken || !pushProvider) {
      const error = new Error("缺少必填参数") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const device = await IMDeviceService.updatePushToken(userId, deviceId, pushToken, pushProvider);
    return ok(res, device);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/devices/:deviceId/heartbeat
 * @description 设备心跳
 */
router.post("/:deviceId/heartbeat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { deviceId } = req.params;

    const ip = req.ip || req.socket.remoteAddress;
    const device = await IMDeviceService.heartbeat(userId, deviceId, ip);
    return ok(res, { online: true, lastActiveAt: device.lastActiveAt });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/devices/:deviceId/offline
 * @description 设备下线
 */
router.post("/:deviceId/offline", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { deviceId } = req.params;

    await IMDeviceService.goOffline(userId, deviceId);
    return ok(res, { online: false });
  } catch (err) {
    return next(err);
  }
});

export default router;

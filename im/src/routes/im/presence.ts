/**
 * @packageDocumentation
 * @module routes/im/presence
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[在线状态]
 * @description IM 在线状态路由
 * @path src/routes/im/presence.ts
 */

import { Router, type Request, type Response } from "express";
import { requireAuth } from "@/middleware/auth/index.js";
import PresenceService from "@/services/im/presence.js";

const router = Router();

// 所有路由需要认证
router.use(requireAuth);

/**
 * @route GET /im/presence/check/:userId
 * @description 检查单个用户是否在线
 */
router.get("/check/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const isOnline = await PresenceService.isUserOnline(userId);
    return res.json({ success: true, data: { userId, isOnline } });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route GET /im/presence/status/:userId
 * @description 获取单个用户详细在线状态
 */
router.get("/status/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const status = await PresenceService.getUserOnlineStatus(userId);
    return res.json({ success: true, data: status });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route POST /im/presence/batch
 * @description 批量获取用户在线状态
 */
router.post("/batch", async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body as { userIds: string[] };

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: "userIds 必须是数组" });
    }

    if (userIds.length > 100) {
      return res.status(400).json({ success: false, message: "一次最多查询 100 个用户" });
    }

    const statuses = await PresenceService.getUsersOnlineStatus(userIds);
    return res.json({ success: true, data: statuses });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route GET /im/presence/friends
 * @description 获取好友的在线状态
 */
router.get("/friends", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const statuses = await PresenceService.getFriendsOnlineStatus(userId);
    return res.json({ success: true, data: statuses });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export default router;

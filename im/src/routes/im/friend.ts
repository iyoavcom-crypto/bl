/**
 * @packageDocumentation
 * @module routes/im/friend
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[好友]
 * @description IM 前台好友路由：好友申请、接受、拒绝、删除、列表等
 * @path src/routes/im/friend.ts
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import IMFriendService from "@/services/im/friend.js";
import { ok, created, noContent } from "@/contracts/crud/ok.js";
import { pagedOk } from "@/middleware/request/index.js";
import type { FriendSource } from "@/models/friend/index.js";
import type { FriendRequestStatus } from "@/models/friend-request/index.js";

const router = Router();

/**
 * @route GET /im/friends
 * @description 获取我的好友列表
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { page, limit, isBlocked, isPinned } = req.query;

    const result = await IMFriendService.getMyFriends(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      isBlocked: isBlocked === "true" ? true : isBlocked === "false" ? false : undefined,
      isPinned: isPinned === "true" ? true : isPinned === "false" ? false : undefined,
    });

    return pagedOk(res, result.rows, result.count, result.page, result.limit);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/friends/:userId
 * @description 获取好友详情
 */
router.get("/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.auth!.sub;
    const { userId } = req.params;

    const friend = await IMFriendService.getFriendDetail(currentUserId, userId);
    return ok(res, friend);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route PUT /im/friends/:userId
 * @description 更新好友信息（备注、拉黑、免打扰、置顶）
 */
router.put("/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.auth!.sub;
    const { userId } = req.params;
    const { alias, isBlocked, doNotDisturb, isPinned } = req.body as {
      alias?: string | null;
      isBlocked?: boolean;
      doNotDisturb?: boolean;
      isPinned?: boolean;
    };

    const friend = await IMFriendService.updateFriend(currentUserId, userId, {
      alias,
      isBlocked,
      doNotDisturb,
      isPinned,
    });

    return ok(res, friend);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route DELETE /im/friends/:userId
 * @description 删除好友（双向删除）
 */
router.delete("/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.auth!.sub;
    const { userId } = req.params;

    await IMFriendService.removeFriend(currentUserId, userId);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/friends/requests
 * @description 发送好友申请
 */
router.post("/requests", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fromUserId = req.auth!.sub;
    const { toUserId, message, source } = req.body as {
      toUserId: string;
      message?: string;
      source: FriendSource;
    };

    if (!toUserId || !source) {
      const error = new Error("缺少必填参数") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const request = await IMFriendService.sendRequest(fromUserId, { toUserId, message, source });
    return created(res, request);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/friends/requests/received
 * @description 获取收到的好友申请
 */
router.get("/requests/received", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { status } = req.query;

    const requests = await IMFriendService.getReceivedRequests(
      userId,
      status as FriendRequestStatus | undefined
    );
    return ok(res, requests);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/friends/requests/sent
 * @description 获取发出的好友申请
 */
router.get("/requests/sent", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { status } = req.query;

    const requests = await IMFriendService.getSentRequests(
      userId,
      status as FriendRequestStatus | undefined
    );
    return ok(res, requests);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/friends/requests/:requestId/accept
 * @description 接受好友申请
 */
router.post("/requests/:requestId/accept", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { requestId } = req.params;

    const result = await IMFriendService.acceptRequest(userId, requestId);
    return ok(res, result);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/friends/requests/:requestId/reject
 * @description 拒绝好友申请
 */
router.post("/requests/:requestId/reject", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { requestId } = req.params;

    const request = await IMFriendService.rejectRequest(userId, requestId);
    return ok(res, request);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/friends/check/:userId
 * @description 检查是否为好友
 */
router.get("/check/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.auth!.sub;
    const { userId } = req.params;

    const isFriend = await IMFriendService.isFriend(currentUserId, userId);
    return ok(res, { isFriend });
  } catch (err) {
    return next(err);
  }
});

export default router;

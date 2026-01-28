/**
 * @packageDocumentation
 * @module routes/im/message
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[消息]
 * @description IM 前台消息路由：发送、撤回、转发、历史消息等
 * @path src/routes/im/message.ts
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import IMMessageService from "@/services/im/message.js";
import { ok, created } from "@/contracts/crud/ok.js";
import { pagedOk } from "@/middleware/request/index.js";
import type { MessageType } from "@/models/message/index.js";

const router = Router();

/**
 * @route POST /im/messages
 * @description 发送消息
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.auth!.sub;
    const { conversationId, type, content, mediaUrl, mediaDuration, replyToId } = req.body as {
      conversationId: string;
      type: typeof MessageType[keyof typeof MessageType];
      content?: string;
      mediaUrl?: string;
      mediaDuration?: number;
      replyToId?: string;
    };

    if (!conversationId || !type) {
      const error = new Error("缺少必填参数") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const message = await IMMessageService.sendMessage(senderId, {
      conversationId,
      type,
      content,
      mediaUrl,
      mediaDuration,
      replyToId,
    });

    return created(res, message);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/messages/conversation/:conversationId
 * @description 获取会话消息列表
 */
router.get("/conversation/:conversationId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { conversationId } = req.params;
    const { page, limit } = req.query;

    const result = await IMMessageService.getMessages(userId, conversationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return pagedOk(res, result.rows, result.count, result.page, result.limit);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/messages/:messageId
 * @description 获取消息详情
 */
router.get("/:messageId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { messageId } = req.params;

    const message = await IMMessageService.getMessageDetail(userId, messageId);
    return ok(res, message);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/messages/:messageId/recall
 * @description 撤回消息
 */
router.post("/:messageId/recall", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { messageId } = req.params;

    const message = await IMMessageService.recallMessage(userId, messageId);
    return ok(res, message);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/messages/:messageId/forward
 * @description 转发消息
 */
router.post("/:messageId/forward", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { messageId } = req.params;
    const { conversationIds } = req.body as { conversationIds: string[] };

    if (!conversationIds || conversationIds.length === 0) {
      const error = new Error("请选择转发目标") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const messages = await IMMessageService.forwardMessage(userId, messageId, conversationIds);
    return ok(res, messages);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/messages/conversation/:conversationId/read
 * @description 标记消息已读
 */
router.post("/conversation/:conversationId/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { conversationId } = req.params;
    const { messageId } = req.body as { messageId: string };

    if (!messageId) {
      const error = new Error("请指定最后已读消息 ID") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await IMMessageService.markAsRead(userId, conversationId, messageId);
    return ok(res, { message: "标记成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/messages/search
 * @description 搜索消息
 */
router.post("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { keyword, conversationId, senderId, type, startDate, endDate, limit, offset } = req.body as {
      keyword: string;
      conversationId?: string;
      senderId?: string;
      type?: typeof MessageType[keyof typeof MessageType];
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    };

    if (!keyword) {
      const error = new Error("搜索关键词不能为空") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const result = await IMMessageService.searchMessages(userId, {
      keyword,
      conversationId,
      senderId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return ok(res, result);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/messages/:messageId/delivered
 * @description 标记消息已送达
 */
router.post("/:messageId/delivered", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { messageId } = req.params;

    await IMMessageService.markAsDelivered(userId, messageId);
    return ok(res, { message: "标记成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/messages/batch-delivered
 * @description 批量标记消息已送达
 */
router.post("/batch-delivered", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { messageIds } = req.body as { messageIds: string[] };

    if (!messageIds || messageIds.length === 0) {
      const error = new Error("消息 ID 列表不能为空") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await IMMessageService.batchMarkAsDelivered(userId, messageIds);
    return ok(res, { message: "批量标记成功" });
  } catch (err) {
    return next(err);
  }
});

export default router;

/**
 * @packageDocumentation
 * @module routes/im/conversation
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[会话]
 * @description IM 前台会话路由：会话列表、发起私聊、删除会话等
 * @path src/routes/im/conversation.ts
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import IMConversationService from "@/services/im/conversation.js";
import { ok, created, noContent } from "@/contracts/crud/ok.js";
import { typingPushHook } from "@/websocket/integration/index.js";

const router = Router();

/**
 * @route GET /im/conversations
 * @description 获取我的会话列表
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const conversations = await IMConversationService.getMyConversations(userId);
    return ok(res, conversations);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/conversations/private
 * @description 发起私聊（获取或创建会话）
 */
router.post("/private", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { targetUserId } = req.body as { targetUserId: string };

    if (!targetUserId) {
      const error = new Error("请指定目标用户") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const conversation = await IMConversationService.startPrivateChat(userId, targetUserId);
    return created(res, conversation);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/conversations/:conversationId
 * @description 获取会话详情
 */
router.get("/:conversationId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { conversationId } = req.params;

    const detail = await IMConversationService.getConversationDetail(userId, conversationId);
    return ok(res, detail);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route DELETE /im/conversations/:conversationId
 * @description 删除会话
 */
router.delete("/:conversationId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { conversationId } = req.params;

    await IMConversationService.deleteConversation(userId, conversationId);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/conversations/:conversationId/clear-unread
 * @description 清空未读
 */
router.post("/:conversationId/clear-unread", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { conversationId } = req.params;

    await IMConversationService.clearUnread(userId, conversationId);
    return ok(res, { message: "清空成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/conversations/:conversationId/typing
 * @description 发送输入状态
 */
router.post("/:conversationId/typing", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { conversationId } = req.params;
    const { isTyping } = req.body as { isTyping: boolean };

    // 验证用户是会话参与者
    await IMConversationService.getConversationDetail(userId, conversationId);

    // 推送输入状态
    if (isTyping) {
      typingPushHook.onTypingStart(conversationId, userId).catch((err: unknown) => {
        console.error("[ConversationRoute] 推送输入状态失败:", err);
      });
    } else {
      typingPushHook.onTypingStop(conversationId, userId).catch((err: unknown) => {
        console.error("[ConversationRoute] 推送停止输入状态失败:", err);
      });
    }

    return ok(res, { message: "状态已发送" });
  } catch (err) {
    return next(err);
  }
});

export default router;

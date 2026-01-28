/**
 * @packageDocumentation
 * @module routes/im/call
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[通话]
 * @description IM 前台通话路由：发起、接听、拒接、挂断、通话记录等
 * @path src/routes/im/call.ts
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import IMCallService from "@/services/im/call.js";
import { ok, created } from "@/contracts/crud/ok.js";
import { pagedOk } from "@/middleware/request/index.js";

const router = Router();

/**
 * @route GET /im/calls
 * @description 获取我的通话记录列表
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { page, limit } = req.query;

    const result = await IMCallService.getMyCallHistory(
      userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined
    );

    return pagedOk(res, result.rows, result.count, result.page, result.limit);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/calls/initiate
 * @description 发起通话
 */
router.post("/initiate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerId = req.auth!.sub;
    const { calleeId } = req.body as { calleeId: string };

    if (!calleeId) {
      const error = new Error("请指定被叫用户") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const call = await IMCallService.initiateCall(callerId, calleeId);
    return created(res, call);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/calls/:callId
 * @description 获取通话详情
 */
router.get("/:callId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { callId } = req.params;

    const call = await IMCallService.getCallDetail(userId, callId);
    return ok(res, call);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/calls/:callId/ring
 * @description 响铃（被叫收到通话邀请）
 */
router.post("/:callId/ring", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const calleeId = req.auth!.sub;
    const { callId } = req.params;

    const call = await IMCallService.ring(calleeId, callId);
    return ok(res, call);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/calls/:callId/accept
 * @description 接听通话
 */
router.post("/:callId/accept", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const calleeId = req.auth!.sub;
    const { callId } = req.params;

    const call = await IMCallService.acceptCall(calleeId, callId);
    return ok(res, call);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/calls/:callId/reject
 * @description 拒接通话
 */
router.post("/:callId/reject", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const calleeId = req.auth!.sub;
    const { callId } = req.params;

    const call = await IMCallService.rejectCall(calleeId, callId);
    return ok(res, call);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/calls/:callId/hangup
 * @description 挂断通话
 */
router.post("/:callId/hangup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { callId } = req.params;

    const call = await IMCallService.hangupCall(userId, callId);
    return ok(res, call);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/calls/:callId/signal
 * @description 发送 WebRTC 信令
 */
router.post("/:callId/signal", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { callId } = req.params;
    const { signalType, signalData } = req.body as {
      signalType: "offer" | "answer" | "ice-candidate";
      signalData: Record<string, unknown>;
    };

    if (!signalType || !signalData) {
      const error = new Error("缺少必要参数") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const validTypes = ["offer", "answer", "ice-candidate"];
    if (!validTypes.includes(signalType)) {
      const error = new Error("无效的信令类型") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await IMCallService.sendSignal(userId, callId, signalType, signalData);
    return ok(res, { message: "信令已发送" });
  } catch (err) {
    return next(err);
  }
});

export default router;

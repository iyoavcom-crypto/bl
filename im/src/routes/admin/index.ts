/**
 * @packageDocumentation
 * @module routes/admin
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[后台]
 * @description Admin 后台路由统一入口
 * @path src/routes/admin/index.ts
 */

import { Router } from "express";
import userRouter from "./user.js";
import deviceRouter from "./device.js";
import friendRouter from "./friend.js";
import friendRequestRouter from "./friend-request.js";
import groupRouter from "./group.js";
import groupMemberRouter from "./group-member.js";
import conversationRouter from "./conversation.js";
import messageRouter from "./message.js";
import messageReadRouter from "./message-read.js";
import callRouter from "./call.js";

const router = Router();

// 用户管理（已有）
router.use("/users", userRouter);

// 设备管理
router.use("/devices", deviceRouter);

// 好友相关
router.use("/friends", friendRouter);
router.use("/friend-requests", friendRequestRouter);

// 群组相关
router.use("/groups", groupRouter);
router.use("/group-members", groupMemberRouter);

// 会话与消息
router.use("/conversations", conversationRouter);
router.use("/messages", messageRouter);
router.use("/message-reads", messageReadRouter);

// 通话
router.use("/calls", callRouter);

export default router;

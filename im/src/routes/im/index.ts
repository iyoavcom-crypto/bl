/**
 * @packageDocumentation
 * @module routes/im
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[前台]
 * @description IM 前台路由统一入口
 * @path src/routes/im/index.ts
 */

import { Router } from "express";
import deviceRouter from "./device.js";
import friendRouter from "./friend.js";
import groupRouter from "./group.js";
import conversationRouter from "./conversation.js";
import messageRouter from "./message.js";
import callRouter from "./call.js";
import userRouter from "./user.js";
import presenceRouter from "./presence.js";
import mediaRouter from "./media.js";

const router = Router();

// 媒体文件
router.use("/media", mediaRouter);

// 用户管理
router.use("/users", userRouter);

// 在线状态
router.use("/presence", presenceRouter);

// 设备管理
router.use("/devices", deviceRouter);

// 好友相关（包含好友申请）
router.use("/friends", friendRouter);

// 群组相关（包含群成员管理）
router.use("/groups", groupRouter);

// 会话与消息
router.use("/conversations", conversationRouter);
router.use("/messages", messageRouter);

// 通话
router.use("/calls", callRouter);

export default router;

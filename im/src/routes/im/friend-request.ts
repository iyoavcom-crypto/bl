/**
 * @packageDocumentation
 * @module routes/im/friend-request
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[好友申请]
 * @description IM 前台好友申请路由：好友申请管理 CRUD
 * @path src/routes/im/friend-request.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import FriendRequestService from "@/services/friend-request.js";

const router = Router();
const Ctrl = createCrudController(FriendRequestService);

/**
 * @route GET /im/friend-requests
 * @description 获取好友申请列表
 * @access Protected
 */
router.get("/", Ctrl.getList);

/**
 * @route POST /im/friend-requests
 * @description 发送好友申请
 * @access Protected
 */
router.post("/", Ctrl.create);

/**
 * @route GET /im/friend-requests/:id
 * @description 获取好友申请详情
 * @access Protected
 */
router.get("/:id", Ctrl.getDetail);

/**
 * @route PUT /im/friend-requests/:id
 * @description 处理好友申请（接受/拒绝）
 * @access Protected
 */
router.put("/:id", Ctrl.update);

/**
 * @route DELETE /im/friend-requests/:id
 * @description 删除好友申请
 * @access Protected
 */
router.delete("/:id", Ctrl.delete);

export default router;

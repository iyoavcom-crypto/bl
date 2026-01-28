/**
 * @packageDocumentation
 * @module routes/admin/friend-request
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[好友申请管理]
 * @description Admin 后台好友申请管理路由
 * @path src/routes/admin/friend-request.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import FriendRequestService from "@/services/friend-request.js";

const router = Router();
const Ctrl = createCrudController(FriendRequestService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

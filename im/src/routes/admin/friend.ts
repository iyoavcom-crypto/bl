/**
 * @packageDocumentation
 * @module routes/admin/friend
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[好友管理]
 * @description Admin 后台好友管理路由
 * @path src/routes/admin/friend.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import FriendService from "@/services/friend.js";

const router = Router();
const Ctrl = createCrudController(FriendService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

/**
 * @packageDocumentation
 * @module routes/admin/message-read
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[已读管理]
 * @description Admin 后台已读回执管理路由
 * @path src/routes/admin/message-read.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import MessageReadService from "@/services/message-read.js";

const router = Router();
const Ctrl = createCrudController(MessageReadService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

/**
 * @packageDocumentation
 * @module routes/admin/message
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[消息管理]
 * @description Admin 后台消息管理路由
 * @path src/routes/admin/message.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import MessageService from "@/services/message.js";

const router = Router();
const Ctrl = createCrudController(MessageService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

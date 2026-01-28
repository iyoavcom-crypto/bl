/**
 * @packageDocumentation
 * @module routes/admin/conversation
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[会话管理]
 * @description Admin 后台会话管理路由
 * @path src/routes/admin/conversation.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import ConversationService from "@/services/conversation.js";

const router = Router();
const Ctrl = createCrudController(ConversationService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

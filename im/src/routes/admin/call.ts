/**
 * @packageDocumentation
 * @module routes/admin/call
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[通话管理]
 * @description Admin 后台通话记录管理路由
 * @path src/routes/admin/call.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import CallService from "@/services/call.js";

const router = Router();
const Ctrl = createCrudController(CallService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

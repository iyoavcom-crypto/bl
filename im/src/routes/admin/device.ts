/**
 * @packageDocumentation
 * @module routes/admin/device
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[设备管理]
 * @description Admin 后台设备管理路由
 * @path src/routes/admin/device.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import DeviceService from "@/services/device.js";

const router = Router();
const Ctrl = createCrudController(DeviceService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

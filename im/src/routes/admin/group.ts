/**
 * @packageDocumentation
 * @module routes/admin/group
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[群组管理]
 * @description Admin 后台群组管理路由
 * @path src/routes/admin/group.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import GroupService from "@/services/group.js";

const router = Router();
const Ctrl = createCrudController(GroupService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

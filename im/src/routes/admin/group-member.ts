/**
 * @packageDocumentation
 * @module routes/admin/group-member
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[Admin],[群成员管理]
 * @description Admin 后台群成员管理路由
 * @path src/routes/admin/group-member.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import GroupMemberService from "@/services/group-member.js";

const router = Router();
const Ctrl = createCrudController(GroupMemberService);

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);

export default router;

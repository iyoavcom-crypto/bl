/**
 * @packageDocumentation
 * @module routes/im/group-member
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[群成员]
 * @description IM 前台群成员路由：群成员管理 CRUD
 * @path src/routes/im/group-member.ts
 */

import { Router } from "express";
import { createCrudController } from "@/contracts/index.js";
import GroupMemberService from "@/services/group-member.js";

const router = Router();
const Ctrl = createCrudController(GroupMemberService);

/**
 * @route GET /im/group-members
 * @description 获取群成员列表
 * @access Protected
 */
router.get("/", Ctrl.getList);

/**
 * @route POST /im/group-members
 * @description 添加群成员
 * @access Protected
 */
router.post("/", Ctrl.create);

/**
 * @route GET /im/group-members/:id
 * @description 获取群成员详情
 * @access Protected
 */
router.get("/:id", Ctrl.getDetail);

/**
 * @route PUT /im/group-members/:id
 * @description 更新群成员信息（昵称/角色/禁言等）
 * @access Protected
 */
router.put("/:id", Ctrl.update);

/**
 * @route DELETE /im/group-members/:id
 * @description 移除群成员
 * @access Protected
 */
router.delete("/:id", Ctrl.delete);

export default router;

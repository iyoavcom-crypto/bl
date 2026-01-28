/**
 * @packageDocumentation
 * @module Routes/user
 * @tag [用户路由] [用户管理] [用户操作]
 * @since 1.0.0 (2025-01-01)
 * @author Z-kali
 * @description 用户路由：提供用户列表、详情、上传、删除等操作
 * @path api/src/routes/user.ts
 * @see api/src/controllers/user.ts 
 */

import express from "express";
import { createCrudController } from "@/contracts";
import UserService from "@/services/user";

/**
 * @const router
 * @description 标签路由实例
 */
const router = express.Router();
const Ctrl = createCrudController(UserService);     

// Heartbeat endpoint - 必须在动态路由 /:id 之前定义
router.post("/heartbeat", async (_req, res) => {
  try {
    // 简单返回成功，用于客户端检测连接
    res.json({ code: 0, message: 'ok', data: { timestamp: Date.now() } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ code: 500, message });
  }
});        

router.get("/", Ctrl.getList);
router.post("/", Ctrl.create);
router.get("/:id", Ctrl.getDetail);
router.put("/:id", Ctrl.update);
router.delete("/:id", Ctrl.delete);


export default router;
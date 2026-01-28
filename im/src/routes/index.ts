/**
 * @packageDocumentation
 * @module routes/api
 * @description API Routes entry point
 */

import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin/index.js";
import imRouter from "./im/index.js";
import { requireAuth } from "../middleware/auth/index.js";

const router = Router();

// =======================
// Public routes (no auth required)
// =======================
router.use("/auth", authRouter);

// =======================
// Protected routes (auth required)
// =======================

// Admin 后台管理接口
router.use("/admin", requireAuth, adminRouter);

// IM 前台接口
router.use("/im", requireAuth, imRouter);


export default router;

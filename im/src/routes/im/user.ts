/**
 * @packageDocumentation
 * @module routes/im/user
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[用户]
 * @description IM 用户路由：资料管理、搜索、密码修改
 * @path src/routes/im/user.ts
 */

import { Router, type Request, type Response } from "express";
import { requireAuth } from "@/middleware/auth/index.js";
import IMUserService from "@/services/im/user.js";
import type { UpdateProfileInput, ChangePasswordInput, ChangePinInput, SearchUserQuery } from "@/services/im/user.js";

const router = Router();

// 所有路由需要认证
router.use(requireAuth);

/**
 * @route GET /im/users/profile
 * @description 获取当前用户资料
 */
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const profile = await IMUserService.getProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route PUT /im/users/profile
 * @description 更新当前用户资料
 */
router.put("/profile", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const input: UpdateProfileInput = req.body;
    const profile = await IMUserService.updateProfile(userId, input);
    return res.json({ success: true, data: profile });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route POST /im/users/change-password
 * @description 修改密码
 */
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const input: ChangePasswordInput = req.body;

    if (!input.oldPassword || !input.newPassword) {
      return res.status(400).json({ success: false, message: "缺少必要参数" });
    }

    await IMUserService.changePassword(userId, input);
    return res.json({ success: true, message: "密码修改成功" });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route POST /im/users/change-pin
 * @description 修改二级密码
 */
router.post("/change-pin", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const input: ChangePinInput = req.body;

    if (!input.password || !input.newPin) {
      return res.status(400).json({ success: false, message: "缺少必要参数" });
    }

    await IMUserService.changePin(userId, input);
    return res.json({ success: true, message: "二级密码修改成功" });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route POST /im/users/verify-pin
 * @description 验证二级密码
 */
router.post("/verify-pin", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { pin } = req.body as { pin: string };

    if (!pin) {
      return res.status(400).json({ success: false, message: "缺少二级密码" });
    }

    const isValid = await IMUserService.verifyUserPin(userId, pin);
    return res.json({ success: true, data: { valid: isValid } });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route GET /im/users/search
 * @description 搜索用户
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const query: SearchUserQuery = {
      keyword: req.query.keyword as string || "",
      limit: parseInt(req.query.limit as string) || 20,
    };

    const users = await IMUserService.searchUsers(userId, query);
    return res.json({ success: true, data: users });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route GET /im/users/:userId
 * @description 获取指定用户公开信息
 */
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await IMUserService.getPublicProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    const error = err as Error & { status?: number };
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export default router;

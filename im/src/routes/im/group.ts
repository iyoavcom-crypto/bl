/**
 * @packageDocumentation
 * @module routes/im/group
 * @since 1.0.0
 * @author Z-Kali
 * @tags [路由],[IM],[群组]
 * @description IM 前台群组路由：创建、邀请、踢人、禁言、转让、解散等
 * @path src/routes/im/group.ts
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import IMGroupService from "@/services/im/group.js";
import { ok, created, noContent } from "@/contracts/crud/ok.js";
import type { GroupJoinMode } from "@/models/group/index.js";

const router = Router();

/**
 * @route GET /im/groups
 * @description 获取我加入的群组列表
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const groups = await IMGroupService.getMyGroups(userId);
    return ok(res, groups);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups
 * @description 创建群组
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.auth!.sub;
    const { name, avatar, description, joinMode, memberIds } = req.body as {
      name: unknown;
      avatar?: unknown;
      description?: unknown;
      joinMode?: unknown;
      memberIds?: unknown;
    };

    // 输入校验
    if (typeof name !== "string" || name.trim().length === 0) {
      const error = new Error("群名称不能为空") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    if (name.trim().length > 50) {
      const error = new Error("群名称不能超过50个字符") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    if (avatar !== undefined && typeof avatar !== "string") {
      const error = new Error("头像参数格式错误") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    if (description !== undefined && typeof description !== "string") {
      const error = new Error("描述参数格式错误") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    if (joinMode !== undefined && !["open", "approval", "invite"].includes(joinMode as string)) {
      const error = new Error("加入模式参数无效") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    if (memberIds !== undefined && !Array.isArray(memberIds)) {
      const error = new Error("成员列表参数格式错误") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const group = await IMGroupService.createGroup(ownerId, {
      name: name.trim(),
      avatar: avatar as string | undefined,
      description: description as string | undefined,
      joinMode: joinMode as GroupJoinMode | undefined,
      memberIds: memberIds as string[] | undefined,
    });

    return created(res, group);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/groups/:groupId
 * @description 获取群组详情
 */
router.get("/:groupId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { groupId } = req.params;

    const group = await IMGroupService.getGroupDetail(userId, groupId);
    return ok(res, group);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route PUT /im/groups/:groupId
 * @description 更新群组信息
 */
router.put("/:groupId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operatorId = req.auth!.sub;
    const { groupId } = req.params;
    const { name, avatar, description, joinMode, muteAll } = req.body as {
      name?: string;
      avatar?: string;
      description?: string;
      joinMode?: GroupJoinMode;
      muteAll?: boolean;
    };

    const group = await IMGroupService.updateGroup(operatorId, groupId, {
      name,
      avatar,
      description,
      joinMode,
      muteAll,
    });

    return ok(res, group);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route DELETE /im/groups/:groupId
 * @description 解散群组（仅群主）
 */
router.delete("/:groupId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.auth!.sub;
    const { groupId } = req.params;

    await IMGroupService.dissolveGroup(ownerId, groupId);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route GET /im/groups/:groupId/members
 * @description 获取群成员列表
 */
router.get("/:groupId/members", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { groupId } = req.params;

    const members = await IMGroupService.getGroupMembers(userId, groupId);
    return ok(res, members);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups/:groupId/invite
 * @description 邀请成员加入群组
 */
router.post("/:groupId/invite", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operatorId = req.auth!.sub;
    const { groupId } = req.params;
    const { userIds } = req.body as { userIds: string[] };

    if (!userIds || userIds.length === 0) {
      const error = new Error("请选择要邀请的用户") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const members = await IMGroupService.inviteMembers(operatorId, groupId, userIds);
    return ok(res, members);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups/:groupId/kick/:userId
 * @description 踢出成员
 */
router.post("/:groupId/kick/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operatorId = req.auth!.sub;
    const { groupId, userId } = req.params;

    await IMGroupService.kickMember(operatorId, groupId, userId);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups/:groupId/leave
 * @description 退出群组
 */
router.post("/:groupId/leave", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.sub;
    const { groupId } = req.params;

    await IMGroupService.leaveGroup(userId, groupId);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups/:groupId/transfer
 * @description 转让群主
 */
router.post("/:groupId/transfer", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.auth!.sub;
    const { groupId } = req.params;
    const { newOwnerId } = req.body as { newOwnerId: string };

    if (!newOwnerId) {
      const error = new Error("请选择新群主") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await IMGroupService.transferOwnership(ownerId, groupId, newOwnerId);
    return ok(res, { message: "转让成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups/:groupId/admin/:userId
 * @description 设置管理员
 */
router.post("/:groupId/admin/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.auth!.sub;
    const { groupId, userId } = req.params;

    await IMGroupService.setAdmin(ownerId, groupId, userId, true);
    return ok(res, { message: "设置成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route DELETE /im/groups/:groupId/admin/:userId
 * @description 取消管理员
 */
router.delete("/:groupId/admin/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.auth!.sub;
    const { groupId, userId } = req.params;

    await IMGroupService.setAdmin(ownerId, groupId, userId, false);
    return ok(res, { message: "取消成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route POST /im/groups/:groupId/mute/:userId
 * @description 禁言成员
 */
router.post("/:groupId/mute/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operatorId = req.auth!.sub;
    const { groupId, userId } = req.params;
    const { duration } = req.body as { duration?: number };

    await IMGroupService.muteMember(operatorId, groupId, userId, { duration });
    return ok(res, { message: "禁言成功" });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route DELETE /im/groups/:groupId/mute/:userId
 * @description 解除禁言
 */
router.delete("/:groupId/mute/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operatorId = req.auth!.sub;
    const { groupId, userId } = req.params;

    await IMGroupService.unmuteMember(operatorId, groupId, userId);
    return ok(res, { message: "解除禁言成功" });
  } catch (err) {
    return next(err);
  }
});

export default router;

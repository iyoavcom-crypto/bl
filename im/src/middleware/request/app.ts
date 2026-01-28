/**
 * @packageDocumentation
 * @module middleware/request/app
 * @since 1.0.0
 * @author Z-Kali
 * @tags [request],[middleware],[app-id],[express]
 * @description AppId 中间件：提取并验证 x-app-id，写入 req.appId
 * @path src/middleware/request/app.ts
 * @see src/middleware/request/app.ts
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * @const APP_IDS
 * @description 应用 ID 枚举
 * @property {string} WEB - Web
 * @property {string} IOS - iOS
 * @property {string} ANDROID - Android
 * @property {string} WECHAT - WeChat
 * @property {string} ALIPAY - Alipay
 */
export const APP_IDS = {
  WEB: "web",
  IOS: "ios",
  ANDROID: "android",
  WECHAT: "wechat",
  ALIPAY: "alipay",
} as const;

/**
 * @type AppId
 * @description APP_IDS 的值联合类型
 */
export type AppId = (typeof APP_IDS)[keyof typeof APP_IDS];

declare module "express" {
  /**
   * @interface Request
   * @description Express Request 扩展：注入 appId
   * @property {AppId | undefined} appId - 当前请求应用 ID
   */
  interface Request {
    appId?: AppId;
  }
}

/**
 * @function extractAppId
 * @description 从请求头提取 App ID，并写入 req.appId
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象（未使用）
 * @param {NextFunction} next - Express 中间件 next 回调
 * @returns {void}
 */
export function extractAppId(req: Request, _res: Response, next: NextFunction): void {
  const headerValue = req.headers["x-app-id"];
  const candidate = typeof headerValue === "string" ? headerValue : APP_IDS.WEB;
  const valid = (Object.values(APP_IDS) as ReadonlyArray<string>).includes(candidate);
  req.appId = valid ? (candidate as AppId) : APP_IDS.WEB;
  next();
}

/**
 * @function requireAppId
 * @description 要求必须提供 App ID
 * @param {readonly AppId[]} [allowedApps] - 允许的 AppId 列表（不传则允许全部）
 * @returns {RequestHandler} Express 中间件
 */
export function requireAppId(allowedApps?: readonly AppId[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const headerValue = req.headers["x-app-id"];
    const candidate = req.appId ?? (typeof headerValue === "string" ? (headerValue as AppId) : undefined);
    const valid = candidate ? (Object.values(APP_IDS) as ReadonlyArray<string>).includes(candidate) : false;
    const appId = valid ? (candidate as AppId) : undefined;

    if (!appId) {
      res.status(400).json({
        code: 400,
        message: "Missing x-app-id header",
      });
      return;
    }

    if (allowedApps && !allowedApps.includes(appId)) {
      res.status(403).json({
        code: 403,
        message: `App ${appId} is not allowed for this endpoint`,
      });
      return;
    }

    req.appId = appId;
    next();
  };
}



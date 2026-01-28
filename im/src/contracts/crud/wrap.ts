import type { AsyncHandler } from "./types";
import { fail } from "@/contracts/crud/fail";

/**
 * @function wrap
 * @description 包裹异步控制器，集中处理异常并调用 fail 输出
 * @param {AsyncHandler} handler - 具体控制器实现
 * @returns {AsyncHandler} 包裹后的控制器函数
 */
export const wrap =
  (handler: AsyncHandler): AsyncHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      fail(res, err);
    }
  };

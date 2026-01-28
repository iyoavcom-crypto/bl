import type { Request } from "express";
import type { ListQueryOptions } from "@/repo";

/**
 * @function parseListQueryOptions
 * @description 从 HTTP 查询参数中解析非分页列表查询参数
 * @param {Request} req - Express 请求对象
 * @returns {ListQueryOptions} 列表查询选项
 */
export function parseListQueryOptions(req: Request): ListQueryOptions {
  const query = req.query as {
    search?: string;
    filters?: string;
    order?: string | string[];
  };

  const q: ListQueryOptions = {};

  if (typeof query.search === "string" && query.search.trim() !== "") {
    q.search = query.search.trim();
  }

  if (typeof query.filters === "string") {
    try {
      const parsed = JSON.parse(query.filters) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        delete (parsed as any).__proto__;
      }
      q.filters = parsed;
    } catch {}
  }

  if (typeof query.order === "string" || Array.isArray(query.order)) {
    q.order = query.order;
  }

  return q;
}

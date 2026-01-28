import type { Request } from "express";
import type { QueryOptions } from "@/repo";

/**
 * @function parseQueryOptions
 * @description 从 HTTP 查询参数中解析分页 / 搜索 / 过滤 / 排序选项
 * @param {Request} req - Express 请求对象
 * @returns {QueryOptions} 标准化查询选项
 */
export function parseQueryOptions(req: Request): QueryOptions {
  const query = req.query as {
    page?: string;
    limit?: string;
    search?: string;
    filters?: string;
    order?: string | string[];
  };

  const pageNum = query.page ? Number(query.page) : 1;
  const limitNum = query.limit ? Number(query.limit) : 20;

  const q: QueryOptions = {
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 20,
  };

  if (typeof query.search === "string" && query.search.trim() !== "") {
    q.search = query.search.trim();
  }

  if (typeof query.filters === "string") {
    try {
      const parsed = JSON.parse(query.filters) as Record<string, unknown>;

      if (parsed && typeof parsed === "object") {
        // 防御性处理，避免原型污染
        delete (parsed as Record<string, unknown>).__proto__;
      }

      q.filters = parsed;
    } catch {
      // 非法 JSON，直接忽略 filters
    }
  }

  if (typeof query.order === "string" || Array.isArray(query.order)) {
    q.order = query.order;
  }

  return q;
}

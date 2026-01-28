/**
 * @packageDocumentation
 * @module base-crud-search
 * @since 1.0.0 (2025-11-20)
 * @author Z-Kali
 * @description 关键词搜索（内部委托 listAsync 实现）
 */
import type { Model, ModelStatic } from "sequelize";
import type { CrudConfig } from "@/repo";
import { listAsync } from "./list";

/**
 * @function searchAsync
 * @description 关键词搜索（分页）
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置对象
 * @param {string} keyword - 搜索关键词
 * @param {number} [page=1] - 页码
 * @param {number} [limit=20] - 每页条数
 * @returns {Promise<{ data: A[]; page: number; limit: number; total: number }>} 分页结果
 */
export async function searchAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  keyword: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: A[]; page: number; limit: number; total: number }> {
  return listAsync(ModelClass, config, { page, limit, search: keyword });
}

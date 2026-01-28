/**
 * @packageDocumentation
 * @module base-crud-list
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[list],[pagination],[scope],[include]
 * @description 分页列表查询（返回 `config.listFields` 字段），支持关联查询和 Scope
 * @path src/repo/base/crud/list.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import { buildWhere, buildPagination, buildOrder } from "@/utils/query";
import type { CrudConfig, QueryOptions, ListResult } from "@/repo";
import { QueryOptionsBuilder } from "./helpers";

/**
 * @function listAsync
 * @description 分页列表查询（返回 listFields 字段），支持关联查询和 Scope
 * @template M Sequelize 模型类型
 * @template A 实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置对象
 * @param {QueryOptions} [q] - 查询选项：分页/搜索/过滤/排序/关联/scope
 * @returns {Promise<ListResult<A> & { total: number; page: number; limit: number }>} 分页结果
 */
export async function listAsync<
  M extends Model,
  A extends object
>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  q: QueryOptions = {}
): Promise<ListResult<A> & { total: number; page: number; limit: number }> {
  const { listFields, defaultOrder = [["createdAt" as keyof A & string, "DESC"]], searchFields = [] } = config;
  const { page = 1, limit = 20, search, filters, order } = q;

  // 使用 QueryOptionsBuilder 统一处理 Scope、Include、Transaction
  const builder = new QueryOptionsBuilder(ModelClass, config, q);

  const where = buildWhere({
    filters: filters ?? {},
    search: search ?? "",
    searchFields,
  });

  const { offset, limit: l, page: p } = buildPagination({ page, limit });
  const orderBy = buildOrder(order, defaultOrder);

  const { scopedModel, options } = builder.buildFindOptions({
    attributes: listFields as string[],
    where,
    order: orderBy,
    pagination: { offset, limit: l },
  });

  const { count, rows } = await scopedModel.findAndCountAll(options);
  const data = rows.length > 0 ? (rows.map((r) => r.get({ plain: true })) as A[]) : [];
  return { data, page: p, limit: l, total: count };
}

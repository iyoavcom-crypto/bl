/**
 * @packageDocumentation
 * @module base-crud-all
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[list],[all],[scope],[include]
 * @description 基于 Sequelize 的通用非分页列表查询工具函数，支持字段选择、过滤、关键字搜索、排序、关联查询和 Scope
 * @path src/repo/base/crud/all.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import { buildWhere, buildOrder } from "@/utils/query";
import type { CrudConfig, ListQueryOptions, ListResult } from "@/repo";
import { QueryOptionsBuilder } from "./helpers";

/**
 * @function allAsync
 * @description 通用非分页列表查询函数，支持关联查询和 Scope
 * @template M Sequelize 模型实例类型
 * @template A 映射后的业务实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置（字段映射、默认排序、搜索/过滤字段等）
 * @param {ListQueryOptions} [q={}] - 列表查询参数（search/filters/order/include/scope）
 * @returns {Promise<ListResult<A>>} 列表查询结果（仅 data，不含分页信息）
 */
export async function allAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  q: ListQueryOptions = {}
): Promise<ListResult<A>> {
  const {
    listFields,
    defaultOrder = [["createdAt" as keyof A & string, "DESC"]],
    searchFields = []
  } = config;

  const { search, filters, order } = q;

  // 使用 QueryOptionsBuilder 统一处理 Scope、Include、Transaction
  const builder = new QueryOptionsBuilder(ModelClass, config, q);

  // 统一构建 WHERE 条件
  const where = buildWhere({
    filters: filters ?? {},
    search: search ?? "",
    searchFields,
  });

  // 构建 ORDER BY
  const orderBy = buildOrder(order, defaultOrder);

  const { scopedModel, options } = builder.buildFindOptions({
    attributes: listFields as string[],
    where,
    order: orderBy,
  });

  const rows = await scopedModel.findAll(options);
  const data =
    rows.length > 0
      ? (rows.map((r) => r.get({ plain: true })) as A[])
      : [];

  return { data };
}

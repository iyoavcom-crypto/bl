/**
 * @packageDocumentation
 * @module base-crud-tree
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[tree],[hierarchy],[scope],[include]
 * @description 生成树形结构（基于 id/pid/sort），支持关联查询和 Scope
 * @path src/repo/base/crud/tree.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import type { CrudConfig, ListQueryOptions, TreeConfig, TreeResult } from "@/repo";
import { buildWhere, buildOrder } from "@/utils/query";
import { buildTree } from "../tree";
import { QueryOptionsBuilder } from "./helpers";

/**
 * @function treeAsync
 * @description 构建树形结构，支持关联查询和 Scope
 * @template M Sequelize 模型类型
 * @template A 实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置（包含 treeConfig）
 * @param {ListQueryOptions} [q] - 列表查询选项：filters/order/include/scope
 * @returns {Promise<TreeResult<A>>} 树形结果
 */
export async function treeAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  q: ListQueryOptions = {}
): Promise<TreeResult<A>> {
  const { defaultOrder = [["createdAt" as keyof A & string, "DESC"]], searchFields = [], treeConfig } = config;
  const { filters, order } = q;

  // 使用 QueryOptionsBuilder 统一处理 Scope、Include、Transaction
  const builder = new QueryOptionsBuilder(ModelClass, config, q);

  const where = buildWhere({ filters: filters ?? {}, search: '', searchFields });
  const orderBy = buildOrder(order, defaultOrder);

  const { scopedModel, options } = builder.buildFindOptions({
    attributes: [],  // 树形查询不限制字段，返回全部
    where,
    order: orderBy,
  });

  // 移除 attributes 限制，树形查询需要全部字段
  delete options.attributes;

  const rows = await scopedModel.findAll(options);
  const dataRows = rows.map((r) => r.get({ plain: true })) as A[];
  return buildTree<A>(dataRows, treeConfig as TreeConfig | undefined);
}

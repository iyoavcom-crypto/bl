/**
 * @packageDocumentation
 * @module base-crud-getById
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[detail],[getById],[scope],[include]
 * @description 基于主键 ID 的通用详情查询工具函数，支持关联查询和 Scope
 * @path src/repo/base/crud/getbyid.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import { assertValidId, QueryOptionsBuilder } from "./helpers";
import type { CrudConfig, DetailResult, QueryOptions } from "@/repo";

/**
 * @function getByIdAsync
 * @description 通用详情查询函数：根据主键 ID 查询单条记录并返回 DTO 形式的数据，支持关联查询和 Scope
 * @template M Sequelize 模型实例类型
 * @template A 业务实体类型（DTO）
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置，包含 detailFields 等字段映射信息
 * @param {string} id - 主键 ID 字符串
 * @param {QueryOptions} [options] - 查询选项：关联/scope/事务
 * @returns {Promise<DetailResult<A>>} 详情结果；未找到记录时 data 为 null
 */
export async function getByIdAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  id: string,
  options: QueryOptions = {}
): Promise<DetailResult<A>> {
  const { detailFields } = config;

  // 校验 ID 基本合法性（非空、格式等）
  assertValidId(id);

  // 使用 QueryOptionsBuilder 统一处理 Scope、Include、Transaction
  const builder = new QueryOptionsBuilder(ModelClass, config, options);

  const { scopedModel, options: findOptions } = builder.buildFindOptions({
    attributes: detailFields as string[],
  });

  const row = await scopedModel.findByPk(id, findOptions);

  return { userId: "", data: row ? (row.get({ plain: true }) as A) : null };
}

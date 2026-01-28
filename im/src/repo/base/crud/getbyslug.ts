/**
 * @packageDocumentation
 * @module base-crud-getBySlug
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[detail],[getBySlug],[scope],[include]
 * @description 基于 slug 的通用详情查询工具函数，支持关联查询和 Scope
 * @path src/repo/base/crud/getbyslug.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic, WhereOptions } from "sequelize";
import type { CrudConfig, DetailResult, QueryOptions } from "@/repo";
import { CrudValidationError } from "../validation";
import { QueryOptionsBuilder } from "./helpers";

/**
 * @function getBySlugAsync
 * @description 根据 slug 查询详情（返回 detailFields 字段），支持关联查询和 Scope
 * @template M Sequelize 模型类型
 * @template A 实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置（包含 detailFields、slugField）
 * @param {string} slug - slug 字符串
 * @param {QueryOptions} [options] - 查询选项：关联/scope/事务
 * @returns {Promise<DetailResult<A>>} 详情结果；未找到记录时 data 为 null
 * @throws {CrudValidationError} 当 slug 非法时抛出
 */
export async function getBySlugAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  slug: string,
  options: QueryOptions = {}
): Promise<DetailResult<A>> {
  const { detailFields, slugField = "slug" as keyof A & string } = config;

  if (typeof slug !== "string" || slug.trim() === "") {
    throw new CrudValidationError([{ field: "slug", message: "slug必须是非空字符串", value: slug }]);
  }

  // 使用 QueryOptionsBuilder 统一处理 Scope、Include、Transaction
  const builder = new QueryOptionsBuilder(ModelClass, config, options);

  const { scopedModel, options: findOptions } = builder.buildFindOptions({
    attributes: detailFields as string[],
    where: { [slugField]: slug } as WhereOptions<M["_attributes"]>,
  });

  const row = await scopedModel.findOne(findOptions);
  return { userId: "", data: row ? (row.get({ plain: true }) as A) : null };
}

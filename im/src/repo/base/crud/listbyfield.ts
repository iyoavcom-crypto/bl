/**
 * @packageDocumentation
 * @module base-crud-listbyfield
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[list],[pagination],[field-filter]
 * @description 按指定字段值进行分页查询，内部委托 listAsync 实现
 * @path src/repo/base/crud/listbyfield.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import type { CrudConfig, QueryOptions, ListResult } from "@/repo";
import { listAsync } from "./list";

/**
 * @function listByFieldAsync
 * @description 按指定字段值进行分页查询
 * @template M Sequelize 模型类型
 * @template A 实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置对象
 * @param {keyof A & string} field - 要过滤的字段名
 * @param {unknown} value - 字段过滤值
 * @param {QueryOptions} [q] - 查询选项：分页/搜索/过滤/排序/关联/scope
 * @returns {Promise<ListResult<A> & { total: number; page: number; limit: number }>} 分页结果
 */
export async function listByFieldAsync<
  M extends Model,
  A extends object
>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  field: keyof A & string,
  value: unknown,
  q: QueryOptions = {}
): Promise<ListResult<A> & { total: number; page: number; limit: number }> {
  // 合并字段过滤条件到 filters
  const mergedFilters = {
    ...(q.filters ?? {}),
    [field]: value,
  };

  return listAsync(ModelClass, config, {
    ...q,
    filters: mergedFilters,
  });
}

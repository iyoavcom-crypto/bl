/**
 * @packageDocumentation
 * @module base-crud-remove
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[remove],[delete],[transaction]
 * @description 通用删除工具函数（按主键 ID 删除），支持事务
 * @path src/repo/base/crud/remove.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import type { CrudConfig, DetailResult, CrudOperationOptions } from "@/repo";
import { assertValidId } from "./helpers";

/**
 * @function removeAsync
 * @description 根据主键 ID 删除记录，支持事务
 * @template M Sequelize 模型类型
 * @template A 实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} _config - CRUD 配置（保留参数形状）
 * @param {string} id - 主键 ID
 * @param {CrudOperationOptions} [options] - 操作选项（事务等）
 * @returns {Promise<DetailResult<null>>} 删除结果；成功返回 { data: null }
 */
export async function removeAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  _config: CrudConfig<A>,
  id: string,
  options?: CrudOperationOptions
): Promise<DetailResult<null>> {
  assertValidId(id);

  const row = await ModelClass.findByPk(id, {
    benchmark: false,
    ...(options?.transaction ? { transaction: options.transaction } : {})
  });

  if (!row) {
    const error = new Error("资源不存在") as Error & { status: number };
    error.status = 404;
    throw error;
  }

  await row.destroy({
    benchmark: false,
    ...(options?.transaction ? { transaction: options.transaction } : {})
  });

  return { userId: String(row.get("userId") ?? ""), data: null };
}

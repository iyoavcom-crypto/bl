/**
 * @packageDocumentation
 * @module base-crud-update
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[update],[transaction],[validation]
 * @description 通用更新工具函数（按主键 ID 更新），支持事务
 * @path src/repo/base/crud/update.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import type { CrudConfig, DetailResult, CrudOperationOptions } from "@/repo";
import { validatePayload } from "../validation";
import { assertValidId, pickDTO } from "./helpers";

/**
 * @function updateAsync
 * @description 根据主键 ID 更新记录，支持事务
 * @template M Sequelize 模型类型
 * @template A 实体类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置（包含 updatableFields/钩子）
 * @param {string} id - 主键 ID
 * @param {Partial<A>} patch - 更新补丁
 * @param {CrudOperationOptions} [options] - 操作选项（事务等）
 * @returns {Promise<DetailResult<A>>} 更新后的详情；不存在时 data 为 null
 */
export async function updateAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  id: string,
  patch: Partial<A>,
  options?: CrudOperationOptions
): Promise<DetailResult<A>> {
  const { validateUpdate, beforeUpdate, updatableFields } = config;

  assertValidId(id);
  validatePayload(patch);

  if (validateUpdate) await validateUpdate(patch, id);

  const row = await ModelClass.findByPk(id, {
    benchmark: false,
    ...(options?.transaction ? { transaction: options.transaction } : {})
  });

  if (!row) return { userId: "", data: null };

  const basePatch = beforeUpdate ? await beforeUpdate(patch, id) : patch;

  const body = Array.isArray(updatableFields) && updatableFields.length
    ? (pickDTO(basePatch as A, updatableFields as (keyof A & string)[]) as Record<string, unknown>)
    : (basePatch as Record<string, unknown>);

  await row.update(body as Record<string, unknown>, {
    benchmark: false,
    ...(options?.transaction ? { transaction: options.transaction } : {})
  });

  return { userId: String(row.get("userId") ?? ""), data: row.get({ plain: true }) as A };
}

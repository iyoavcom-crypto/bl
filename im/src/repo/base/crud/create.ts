/**
 * @packageDocumentation
 * @module base-crud-create
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[create],[transaction],[validation]
 * @description 基于 Sequelize 的通用创建工具函数，支持事务、字段白名单、钩子扩展
 * @path src/repo/base/crud/create.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import { validatePayload } from "../validation";
import { pickDTO } from "./helpers";
import type { CrudConfig, DetailResult, CrudOperationOptions } from "@/repo";

/**
 * @function createAsync
 * @description 通用创建函数：执行基础载荷校验 → 业务校验钩子 → 前置处理钩子 → 字段过滤 → 持久化，支持事务
 * @template M Sequelize 模型实例类型
 * @template A 业务实体类型（DTO）
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<A>} config - CRUD 配置（creatableFields / 钩子等）
 * @param {Partial<A>} payload - 原始创建载荷
 * @param {CrudOperationOptions} [options] - 操作选项（事务等）
 * @returns {Promise<DetailResult<A>>} 创建后的详情
 */
export async function createAsync<
  M extends Model,
  A extends object
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<A>,
  payload: Partial<A>,
  options?: CrudOperationOptions
): Promise<DetailResult<A>> {
  const {
    creatableFields = [],
    beforeCreate,
    validateCreate
  } = config;

  // 基础数据结构校验
  validatePayload(payload);

  // 执行业务级校验钩子
  if (validateCreate) await validateCreate(payload);

  // 执行前置处理钩子（可补全默认值、写入系统字段等）
  const prepared = beforeCreate
    ? await beforeCreate(payload)
    : payload;

  // 白名单过滤（仅保留 creatableFields）
  const effectiveFields = new Set([
    ...creatableFields,
  ]);

  const body =
    effectiveFields.size > 0
      ? (pickDTO(
          prepared as A,
          Array.from(effectiveFields) as (keyof A & string)[]
        ) as Record<string, unknown>)
      : (prepared as Record<string, unknown>);

  // 持久化写入（支持事务）
  const saved = await ModelClass.create(
    body as M["_creationAttributes"],
    {
      benchmark: false,
      ...(options?.transaction ? { transaction: options.transaction } : {})
    }
  );

  return {
    userId: String(saved.get("userId") ?? ""),
    data: saved.get({ plain: true }) as A
  };
}

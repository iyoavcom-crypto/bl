/**
 * @packageDocumentation
 * @module services/crud/helpers
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[helpers],[scope],[include],[dto]
 * @description CRUD 内部辅助纯函数集合（字段归并、分页参数构建、DTO 选取、ID 断言、关联查询、Scope）
 * @path src/repo/base/crud/helpers.ts
 * @see src/repo/base/crud/list.ts
 */

import type { Model, ModelStatic, Includeable, FindOptions, WhereOptions, Order, Transaction } from "sequelize";
import { isValidId, CrudValidationError } from "../validation";
import type { CrudConfig, QueryOptions, ListQueryOptions } from "@/repo";
import { DEFAULT_QUERY_OPTIONS } from "./constants";

/**
 * @function allFields
 * @description 合并 `listFields` 与 `detailFields` 并去重，返回全部字段键名
 * @template A 实体类型
 * @param {CrudConfig<A>} cfg - CRUD 配置对象
 * @returns {(keyof A & string)[]} 去重后的字段列表
 */
export const allFields = <A extends object>(cfg: CrudConfig<A>): (keyof A & string)[] => {
  const set = new Set<string>([...cfg.listFields, ...cfg.detailFields].map(String));
  return Array.from(set) as (keyof A & string)[];
};

/**
 * @function toFindOptions
 * @description 将页面与页大小转换为 Sequelize `limit/offset` 选项
 * @param {{ page: number; pageSize: number }} param0 - 分页参数
 * @returns {{ limit?: number; offset?: number }} 可选的 limit/offset
 */
export const toFindOptions = (
  { page, pageSize }: { page: number; pageSize: number }
): { limit?: number; offset?: number } => {
  const out: { limit?: number; offset?: number } = {};
  out.limit = pageSize;
  const computed = page > 0 && pageSize ? (page - 1) * pageSize : undefined;
  if (computed !== undefined) out.offset = computed;
  return out;
};

/**
 * @function pickDTO
 * @description 从对象中挑选指定键组成 DTO（忽略值为 `undefined` 的键）
 * @template A 实体类型
 * @param {A} obj - 原始对象
 * @param {(keyof A & string)[]} keys - 需要挑选的字段列表
 * @returns {Partial<A>} 仅包含指定字段的对象
 */
export const pickDTO = <A extends object>(obj: A, keys: (keyof A & string)[]): Partial<A> => {
  const out: Partial<A> = {} as Partial<A>;
  for (const k of keys) {
    const v = (obj as unknown as Record<string, unknown>)[k as unknown as string];
    if (v !== undefined) (out as unknown as Record<string, unknown>)[k as unknown as string] = v as unknown;
  }
  return out;
};

/**
 * @function assertValidId
 * @description 断言 ID 为非空字符串，失败时抛出 `CrudValidationError`
 * @param {string} id - 主键 ID
 * @throws {CrudValidationError} 当 ID 非法时抛出
 */
export const assertValidId = (id: string): void => {
  if (!isValidId(id)) {
    throw new CrudValidationError([
      {
        field: "id",
        message: "ID必须是非空字符串",
        value: id,
      },
    ]);
  }
};

/**
 * @function buildIncludeOptions
 * @description 构建关联查询配置，支持默认关联、命名关联和运行时关联
 * @template A 实体类型
 * @param {CrudConfig<A>} config - CRUD 配置对象
 * @param {QueryOptions} queryOptions - 查询选项
 * @returns {Includeable[] | undefined} 关联查询配置数组或 undefined
 */
export function buildIncludeOptions<A extends object>(
  config: CrudConfig<A>,
  queryOptions: QueryOptions
): Includeable[] | undefined {
  const { associations } = config;
  const { include: runtimeInclude } = queryOptions;

  // 优先使用运行时指定的 include
  if (runtimeInclude && runtimeInclude.length > 0) {
    // 检查是否为字符串数组（命名关联引用）
    const resolvedIncludes: Includeable[] = [];
    for (const item of runtimeInclude) {
      if (typeof item === "string" && associations?.namedIncludes?.[item]) {
        // 字符串引用命名关联
        resolvedIncludes.push(associations.namedIncludes[item]);
      } else {
        // 直接使用 Includeable 对象
        resolvedIncludes.push(item);
      }
    }
    return resolvedIncludes.length > 0 ? resolvedIncludes : undefined;
  }

  // 使用配置中的默认关联
  if (associations?.autoInclude && associations?.defaultIncludes && associations.defaultIncludes.length > 0) {
    return associations.defaultIncludes;
  }

  return undefined;
}

/**
 * @function applyScope
 * @description 应用模型 Scope，支持单个或多个 scope 名称
 * @template M Sequelize 模型类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {string | string[] | undefined} scopeNames - Scope 名称（单个或数组）
 * @param {string[] | undefined} availableScopes - 可用的 scope 白名单
 * @returns {ModelStatic<M>} 应用 scope 后的模型类
 */
export function applyScope<M extends Model>(
  ModelClass: ModelStatic<M>,
  scopeNames: string | string[] | undefined,
  availableScopes?: string[]
): ModelStatic<M> {
  if (!scopeNames) {
    return ModelClass;
  }

  // 规范化为数组
  const scopes = Array.isArray(scopeNames) ? scopeNames : [scopeNames];

  // 如果配置了白名单，过滤非法 scope
  const validScopes = availableScopes
    ? scopes.filter((s) => availableScopes.includes(s))
    : scopes;

  if (validScopes.length === 0) {
    return ModelClass;
  }

  // 应用 scope
  return ModelClass.scope(validScopes) as ModelStatic<M>;
}

/**
 * @interface QueryBuildResult
 * @description 查询构建结果，包含应用 Scope 后的模型和 FindOptions
 * @template M Sequelize 模型类型
 */
export interface QueryBuildResult<M extends Model> {
  scopedModel: ModelStatic<M>;
  options: FindOptions;
}

/**
 * @interface BuildFindOptionsParams
 * @description 构建 FindOptions 的参数
 */
export interface BuildFindOptionsParams {
  attributes: string[];
  where?: WhereOptions;
  order?: Order;
  pagination?: { offset?: number; limit?: number };
}

/**
 * @class QueryOptionsBuilder
 * @description 查询选项构建器，统一管理 Scope、Include、Transaction 等查询准备逻辑
 * @template M Sequelize 模型类型
 * @template A 实体类型
 */
export class QueryOptionsBuilder<M extends Model, A extends object> {
  private scopedModel: ModelStatic<M>;
  private includeOptions: Includeable[] | undefined;
  private transaction: Transaction | undefined;

  /**
   * @constructor
   * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
   * @param {CrudConfig<A>} config - CRUD 配置对象
   * @param {QueryOptions | ListQueryOptions} [queryOptions={}] - 查询选项
   */
  constructor(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private ModelClass: ModelStatic<M>,
    private config: CrudConfig<A>,
    private queryOptions: QueryOptions | ListQueryOptions = {}
  ) {
    // 初始化时立即应用 Scope 和构建 Include
    this.scopedModel = applyScope(
      ModelClass,
      queryOptions.scope ?? config.scopes?.defaultScope,
      config.scopes?.availableScopes
    );
    this.includeOptions = buildIncludeOptions(config, queryOptions);
    this.transaction = (queryOptions as QueryOptions).transaction;
  }

  /**
   * @method getScopedModel
   * @description 获取应用 Scope 后的模型类
   * @returns {ModelStatic<M>} 应用 scope 后的模型类
   */
  getScopedModel(): ModelStatic<M> {
    return this.scopedModel;
  }

  /**
   * @method buildFindOptions
   * @description 构建 Sequelize FindOptions
   * @param {BuildFindOptionsParams} params - 构建参数
   * @returns {QueryBuildResult<M>} 包含 scopedModel 和 options 的结果对象
   */
  buildFindOptions(params: BuildFindOptionsParams): QueryBuildResult<M> {
    const { attributes, where, order, pagination } = params;

    const options: FindOptions = {
      attributes,
      ...(where ? { where } : {}),
      ...(order ? { order } : {}),
      ...(pagination?.offset !== undefined ? { offset: pagination.offset } : {}),
      ...(pagination?.limit !== undefined ? { limit: pagination.limit } : {}),
      ...(this.includeOptions ? { include: this.includeOptions } : {}),
      ...(this.transaction ? { transaction: this.transaction } : {}),
      ...DEFAULT_QUERY_OPTIONS,
    };

    return { scopedModel: this.scopedModel, options };
  }
}
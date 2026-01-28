/**
 * @packageDocumentation
 * @module crud:query
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[query],[pagination],[filter],[scope]
 * @description 定义 CRUD 查询参数结构
 * @path src/repo/base/types/query.ts
 * @see src/repo/base/crud/list.ts
 */

import type { Includeable, Transaction } from "sequelize";

/**
 * @interface QueryOptions
 * @description 基础查询参数接口（分页、搜索、过滤、排序、关联、scope）
 * @property {number} [page=1] - 当前页码（从 1 开始）
 * @property {number} [limit=10] - 每页项目数（最大 100）
 * @property {string} [search] - 全局搜索关键词
 * @property {Record<string, unknown>} [filters] - 字段过滤条件（键值对）
 * @property {string | string[]} [order] - 排序字段（支持多字段排序）
 * @property {Includeable[]} [include] - 关联查询配置（运行时指定）
 * @property {string | string[]} [scope] - Scope 名称（运行时指定）
 * @property {Transaction} [transaction] - Sequelize 事务对象（可选）
 */
export interface QueryOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  filters?: Record<string, unknown> | undefined;
  order?: string | string[] | undefined;
  include?: Includeable[] | undefined;
  scope?: string | string[] | undefined;
  transaction?: Transaction | undefined;
}

/**
 * @interface ListQueryOptions
 * @description 列表查询参数接口（不含分页，用于非分页场景）
 * @property {string} [search] - 全局搜索关键词
 * @property {Record<string, unknown>} [filters] - 字段过滤条件（键值对）
 * @property {string | string[]} [order] - 排序字段（支持多字段排序）
 * @property {Includeable[]} [include] - 关联查询配置（运行时指定）
 * @property {string | string[]} [scope] - Scope 名称（运行时指定）
 * @property {Transaction} [transaction] - Sequelize 事务对象（可选）
 */
export interface ListQueryOptions {
  search?: string;
  filters?: Record<string, unknown>;
  order?: string | string[];
  include?: Includeable[];
  scope?: string | string[];
  transaction?: Transaction;
}

/**
 * @interface CrudOperationOptions
 * @description CRUD 写入操作选项（用于 create/update/remove）
 * @property {Transaction} [transaction] - Sequelize 事务对象（可选）
 */
export interface CrudOperationOptions {
  transaction?: Transaction;
}

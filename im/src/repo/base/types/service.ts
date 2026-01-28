/**
 * @packageDocumentation
 * @module crud:service
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[service],[factory],[interface]
 * @description 定义通用 CRUD 服务接口及其工厂方法
 * @path src/repo/base/types/service.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Model, ModelStatic } from "sequelize";
import type { QueryOptions, ListQueryOptions, CrudOperationOptions } from "./query.js";
import type {
  PaginatedResult,
  ListResult,
  DetailResult,
  TreeResult,
} from "./results.js";
import type { CrudConfig } from "./config.js";

/**
 * @interface CrudService
 * @description 通用 CRUD 服务接口，基于 Sequelize Model 封装标准数据访问操作
 * @template T 泛型实体类型
 */
export interface CrudService<T = Record<string, unknown>> {
  /**
   * @function list
   * @description 分页查询（默认字段集），支持条件、排序、关联查询、Scope
   * @param {QueryOptions} [q] - 查询选项（分页、过滤、排序、关联、scope）
   * @returns {Promise<PaginatedResult<T>>} 分页结果
   */
  list(q?: QueryOptions): Promise<PaginatedResult<T>>;

  /**
   * @function listAllFields
   * @description 分页查询（返回模型全部字段），适用于管理端或导出场景
   * @param {QueryOptions} [q] - 查询选项（分页、过滤、排序）
   * @returns {Promise<PaginatedResult<T>>} 分页结果（包含全部字段）
   */
  listAllFields(q?: QueryOptions): Promise<PaginatedResult<T>>;

  /**
   * @function all
   * @description 非分页列表查询，通常用于下拉选项、全量列表等
   * @param {ListQueryOptions} [q] - 列表查询选项（过滤、排序、关联、scope）
   * @returns {Promise<ListResult<T>>} 列表结果
   */
  all(q?: ListQueryOptions): Promise<ListResult<T>>;

  /**
   * @function allPaginated
   * @description 全量数据的分页浏览查询
   * @param {number} [page] - 页码（从 1 开始）
   * @param {number} [limit] - 每页条数
   * @returns {Promise<PaginatedResult<T>>} 分页结果
   */
  allPaginated(page?: number, limit?: number): Promise<PaginatedResult<T>>;

  /**
   * @function getById
   * @description 按主键 ID 获取单条详情，支持关联查询和 Scope
   * @param {string} id - 主键 ID
   * @param {QueryOptions} [options] - 查询选项（关联、scope、事务）
   * @returns {Promise<DetailResult<T>>} 详情结果，不存在时 data 为 null
   */
  getById(id: string, options?: QueryOptions): Promise<DetailResult<T>>;

  /**
   * @function getBySlug
   * @description 按业务 slug 字段获取单条详情，支持关联查询和 Scope
   * @param {string} slug - 业务唯一标识 slug
   * @param {QueryOptions} [options] - 查询选项（关联、scope、事务）
   * @returns {Promise<DetailResult<T>>} 详情结果，不存在时 data 为 null
   */
  getBySlug(slug: string, options?: QueryOptions): Promise<DetailResult<T>>;

  /**
   * @function search
   * @description 按关键字进行搜索
   * @param {string} keyword - 搜索关键字
   * @param {number} [page] - 页码（从 1 开始）
   * @param {number} [limit] - 每页条数
   * @returns {Promise<PaginatedResult<T>>} 搜索结果分页列表
   */
  search(
    keyword: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<T>>;

  /**
   * @function tree
   * @description 查询树形结构数据，支持关联查询和 Scope
   * @param {ListQueryOptions} [q] - 列表查询选项（过滤、排序、关联、scope）
   * @returns {Promise<TreeResult<T>>} 树形结果集
   */
  tree(q?: ListQueryOptions): Promise<TreeResult<T>>;

  /**
   * @function create
   * @description 创建新记录，支持事务
   * @param {Partial<T>} payload - 创建载荷（部分实体字段）
   * @param {CrudOperationOptions} [options] - 操作选项（事务）
   * @returns {Promise<DetailResult<T>>} 创建后的详情结果
   */
  create(payload: Partial<T>, options?: CrudOperationOptions): Promise<DetailResult<T>>;

  /**
   * @function update
   * @description 按主键 ID 更新记录，支持事务
   * @param {string} id - 主键 ID
   * @param {Partial<T>} patch - 更新补丁数据
   * @param {CrudOperationOptions} [options] - 操作选项（事务）
   * @returns {Promise<DetailResult<T>>} 更新后的详情结果
   */
  update(id: string, patch: Partial<T>, options?: CrudOperationOptions): Promise<DetailResult<T>>;

  /**
   * @function remove
   * @description 按主键 ID 删除记录，支持事务
   * @param {string} id - 主键 ID
   * @param {CrudOperationOptions} [options] - 操作选项（事务）
   * @returns {Promise<DetailResult<null>>} 删除结果，通常 data 为 null
   */
  remove(id: string, options?: CrudOperationOptions): Promise<DetailResult<null>>;
}

/**
 * @type CrudServiceFactory
 * @description CRUD 服务工厂方法；基于 Sequelize Model 与配置创建对应的 CrudService 实例
 * @template T 泛型实体类型
 * @param {ModelStatic<Model>} Model - Sequelize 模型类
 * @param {CrudConfig<T>} [config] - CRUD 行为与字段映射配置
 * @returns {CrudService<T>} 对应模型的 CRUD 服务实例
 */
export type CrudServiceFactory = <T extends object = Record<string, unknown>>(
  Model: ModelStatic<Model>,
  config?: CrudConfig<T>
) => CrudService<T>;

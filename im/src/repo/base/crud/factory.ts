/**
 * @packageDocumentation
 * @module base-crud-factory
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[factory],[service],[sequelize]
 * @description CRUD 服务工厂：聚合各方法并返回统一的服务接口，支持关联查询、Scope 和事务
 * @path src/repo/base/crud/factory.ts
 * @see src/repo/base/types/service.ts
 */

import type { Model, ModelStatic } from "sequelize";
import type { CrudConfig, CrudService, PaginatedResult, QueryOptions, ListQueryOptions, CrudOperationOptions } from "@/repo";
import { listAsync } from "./list";
import { listAllFieldsAsync } from "./listallfields";
import { allAsync } from "./all";
import { getByIdAsync } from "./getbyid";
import { getBySlugAsync } from "./getbyslug";
import { createAsync } from "./create";
import { updateAsync } from "./update";
import { removeAsync } from "./remove";
import { searchAsync } from "./search";
import { treeAsync } from "./tree";

/**
 * @function createCrudService
 * @description 创建 CRUD 服务实例，聚合所有 CRUD 方法
 * @template M Sequelize 模型类型
 * @template TAttributes 实体属性类型
 * @param {ModelStatic<M>} ModelClass - Sequelize 模型类
 * @param {CrudConfig<TAttributes>} [config] - CRUD 配置对象
 * @returns {CrudService<TAttributes>} CRUD 服务实例
 */
export const createCrudService = <
  M extends Model = Model,
  TAttributes extends object = Record<string, unknown>
>(
  ModelClass: ModelStatic<M>,
  config: CrudConfig<TAttributes> = {} as CrudConfig<TAttributes>
): CrudService<TAttributes> => {
  type Entity = TAttributes;

  const service: CrudService<Entity> = {
    // 查询操作
    list: (q?: QueryOptions) => listAsync(ModelClass, config, q),
    listAllFields: (q?: QueryOptions) => listAllFieldsAsync(ModelClass, config, q),
    all: (q?: ListQueryOptions) => allAsync(ModelClass, config, q),
    getById: (id: string, options?: QueryOptions) => getByIdAsync(ModelClass, config, id, options),
    getBySlug: (slug: string, options?: QueryOptions) => getBySlugAsync(ModelClass, config, slug, options),
    search: (keyword: string, page?: number, limit?: number) => searchAsync(ModelClass, config, keyword, page, limit),
    tree: (q?: ListQueryOptions) => treeAsync(ModelClass, config, q),

    // 写入操作（支持事务）
    create: (payload: Partial<Entity>, options?: CrudOperationOptions) => createAsync(ModelClass, config, payload, options),
    update: (id: string, patch: Partial<Entity>, options?: CrudOperationOptions) => updateAsync(ModelClass, config, id, patch, options),
    remove: (id: string, options?: CrudOperationOptions) => removeAsync(ModelClass, config, id, options),

    // allPaginated 使用 list 实现
    allPaginated: (page?: number, limit?: number): Promise<PaginatedResult<Entity>> => {
      return listAsync(ModelClass, config, { page, limit });
    },
  };

  return service;
};

/**
 * @packageDocumentation
 * @module crud:controller
 * @since 1.0.0 (2025-11-23)
 * @description
 * 基于通用 CRUD 服务构建标准 REST HTTP 控制器集合。
 * 约定式 REST 命名：list、all、getById、getBySlug、create、update、remove 等。
 * 自动包装异步错误，返回统一响应结构。
 */

import type { CrudService, DetailResult, ListResult } from "@/repo";
import { ok, okPaginated, created } from "@/contracts/crud/ok";
import { wrap } from "./wrap";
import { parseQueryOptions } from "./page";
import { parseListQueryOptions } from "./parseList";
import type { AsyncHandler, CrudHttpController } from "./types";

/**
 * @function createCrudController
 * @description
 * 创建基于指定 `CrudService` 的 CRUD 控制器集合。  
 * 每个控制器均采用 REST 风格命名，且自动使用 `wrap` 捕获异常。  
 *
 * @typeParam Entity - 服务实体类型
 * @param {CrudService<Entity>} service - 具体实体的 CRUD 服务实例
 * @returns {CrudHttpController} 返回包含所有 REST 方法的控制器集合
 */
export function createCrudController<Entity>(
  service: CrudService<Entity>
): CrudHttpController {

  /**
   * @function list
   * @description 分页列表查询（page/limit/order 等）
   */
  const list: AsyncHandler = wrap(async (req, res) => {
    const q = parseQueryOptions(req);
    const result = await service.list(q);
    okPaginated(res, result, "列表查询成功");
  });

  /**
   * @function all
   * @description 全量列表查询（不分页）
   */
  const all: AsyncHandler = wrap(async (req, res) => {
    const q = parseListQueryOptions(req);
    const result: ListResult<Entity> = await service.all(q);
    ok(res, result, "全量列表查询成功");
  });

  /**
   * @function getById
   * @description 根据 ID 获取实体详情
   */
  const getById: AsyncHandler = wrap(async (req, res) => {
    const { id } = req.params;
    const result: DetailResult<Entity> = await service.getById(String(id));
    ok(res, result, "详情查询成功");
  });

  /**
   * @function getBySlug
   * @description 根据 slug 获取实体详情
   */
  const getBySlug: AsyncHandler = wrap(async (req, res) => {
    const { slug } = req.params;
    const result: DetailResult<Entity> = await service.getBySlug(String(slug));
    ok(res, result, "详情查询成功");
  });

  /**
   * @function create
   * @description 创建实体
   */
  const create: AsyncHandler = wrap(async (req, res) => {
    const payload = req.body as Partial<Entity>;
    const result: DetailResult<Entity> = await service.create(payload);
    created(res, result, "创建成功");
  });

  /**
   * @function update
   * @description 根据 ID 更新实体
   */
  const update: AsyncHandler = wrap(async (req, res) => {
    const { id } = req.params;
    const patch = req.body as Partial<Entity>;
    const result = await service.update(String(id), patch);
    ok(res, result, "更新成功");
  });

 
  /**
   * @function remove
   * @description 根据 ID 删除实体
   */
  const remove: AsyncHandler = wrap(async (req, res) => {
    const { id } = req.params;
    const result = await service.remove(String(id));
    ok(res, result, "删除成功");
  });



  /**
   * @function search
   * @description 关键字搜索 + 分页
   */
  const search: AsyncHandler = wrap(async (req, res) => {
    const { keyword = "", page = "1", limit = "20" } = req.query as {
      keyword?: string;
      page?: string;
      limit?: string;
    };

    const result = await service.search(
      String(keyword),
      Number(page) > 0 ? Number(page) : 1,
      Number(limit) > 0 ? Number(limit) : 20
    );

    ok(res, result, "搜索成功");
  });

  /**
   * @function tree
   * @description 树形结构查询（父子层级结构）
   */
  const tree: AsyncHandler = wrap(async (req, res) => {
    const q = parseListQueryOptions(req);
    const result = await service.tree(q);
    ok(res, result, "树形数据查询成功");
  });

  /**
   * @function listAllFields
   * @description 列表查询（返回实体所有字段）
   */
  const listAllFields: AsyncHandler = wrap(async (req, res) => {
    const q = parseQueryOptions(req);
    const result = await service.listAllFields(q);
    okPaginated(res, result, "列表查询成功");
  });

  /**
   * @description
   * 构建最终控制器对象。  
   * 包含标准 REST 命名方法，以及兼容旧命名（自动别名）。
   */
  const controller: CrudHttpController = {
    list,
    all,
    getById,
    getBySlug,
    create,
    update,
    remove,
    search,
    tree,
    listAllFields,

    getList: list,
    getDetail: getById,
    delete: remove,
    getDetailBySlug: getBySlug,
  };

  return controller;
}

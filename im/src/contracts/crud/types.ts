import type { Request, Response, NextFunction } from "express";

/**
 * @interface ApiSuccessResponse
 * @description HTTP 成功响应结构
 * @property {number} code - 业务状态码，约定 0 为成功
 * @property {string} message - 文本提示信息
 * @property {T} data - 业务数据载荷
 */
export interface ApiSuccessResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * @interface ApiErrorDetail
 * @description 字段级错误明细
 * @property {string} [field] - 字段名
 * @property {string} message - 错误描述
 * @property {unknown} [value] - 触发错误的值
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  value?: unknown;
}

/**
 * @interface ApiErrorResponse
 * @description HTTP 错误响应结构
 * @property {number} code - 业务错误码，非 0
 * @property {string} message - 错误描述
 * @property {ApiErrorDetail[]} [errors] - 详细字段错误列表
 */
export interface ApiErrorResponse {
  code: number;
  message: string;
  errors?: ApiErrorDetail[];
}

/**
 * @type AsyncHandler
 * @description 异步控制器处理函数类型定义
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>} 异步执行结果
 */
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * @interface CrudHttpController
 * @description 通用 CRUD HTTP 控制器接口定义（同时提供 REST 命名与兼容别名）
 */
export interface CrudHttpController {
  /**
   * @description 分页列表接口别名：GET /resource，语义同 list
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  getList(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 ID 查询详情别名：GET /resource/:id，语义同 getById
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  getDetail(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 ID 删除记录别名：DELETE /resource/:id，语义同 remove
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 slug 查询详情别名：GET /resource/slug/:slug，语义同 getBySlug
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  getDetailBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;



  /**
   * @description 分页列表接口：GET /resource
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   * @example
   * GET /menus?page=1&limit=20&search=系统
   */
  list(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 全量列表接口（不分页）：GET /resource/all
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  all(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 ID 查询详情：GET /resource/:id
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 slug 查询详情：GET /resource/slug/:slug
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  getBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 创建记录：POST /resource
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  create(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 ID 更新记录：PUT /resource/:id
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  update(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 根据 ID 删除记录：DELETE /resource/:id
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  remove(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 关键词搜索接口：GET /resource/search
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   * @example
   * GET /menus/search/search?search=系统&page=1&limit=10
   */
  search(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 树形数据查询接口：GET /resource/tree
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  tree(req: Request, res: Response, next: NextFunction): Promise<void>;

  /**
   * @description 列表查询接口（返回所有字段）：GET /resource/listAllFields
   * @param {Request} req - Express 请求对象
   * @param {Response} res - Express 响应对象
   * @param {NextFunction} next - 下一个中间件函数
   * @returns {Promise<void>} 异步执行结果
   */
  listAllFields(req: Request, res: Response, next: NextFunction): Promise<void>;
}

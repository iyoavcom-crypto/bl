/**
 * @packageDocumentation
 * @module crud:results
 * @since 1.0.0 (2025-09-12)
 * @description 定义 CRUD 查询的标准化结果结构（src/crud/results.ts）
 * @see CRUD 查询层输出结构统一化
 */

/**
 * @interface PaginatedResult
 * @description 分页查询结果
 * @template T 泛型实体类型
 * @property {T[]} data - 当前页数据列表
 * @property {number} page - 当前页码（从 1 开始）
 * @property {number} limit - 每页条数
 * @property {number} total - 数据总量
 */
export interface PaginatedResult<T = Record<string, unknown>> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

/**
 * @interface ListResult
 * @description 列表查询结果，不包含分页信息
 * @template T 泛型实体类型
 * @property {T[]} data - 数据列表
 */
export interface ListResult<T = Record<string, unknown>> {
  data: T[];
}

/**
 * @interface DetailResult
 * @description 单条详情查询结果
 * @template T 泛型实体类型
 * @property {T | null} data - 实体详情；不存在时为 null
 */
export interface DetailResult<T = Record<string, unknown>> {
  userId: string;
  data: T | null;
}

/**
 * @type TreeNode
 * @description 树形结构节点；自动递归 children
 * @template T 泛型实体类型
 * @property {TreeNode<T>[]} [children] - 子节点
 */
export type TreeNode<T = Record<string, unknown>> = T & {
  children?: TreeNode<T>[];
};

/**
 * @interface TreeResult
 * @description 树形结构查询结果
 * @template T 泛型实体类型
 * @property {TreeNode<T>[]} data - 树形节点列表
 */
export interface TreeResult<T = Record<string, unknown>> {
  data: TreeNode<T>[];
}

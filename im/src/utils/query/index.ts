/**
 * @packageDocumentation
 * @module utils-query
 * @since 1.0.0
 * @author Z-Kali
 * @tags [query],[builder],[sequelize],[where],[order],[pagination]
 * @description 查询构建工具函数集合
 * @path src/utils/query/index.ts
 * @see src/repo/base/crud/list.ts
 */

import type { WhereOptions, Order } from "sequelize";

/**
 * @interface BuildWhereOptions
 * @description 构建 WHERE 条件的选项
 * @property {Record<string, unknown>} filters - 过滤条件
 * @property {string} search - 搜索关键词
 * @property {string[]} searchFields - 可搜索字段列表
 */
interface BuildWhereOptions {
  filters: Record<string, unknown>;
  search: string;
  searchFields: string[];
}

/**
 * @function buildWhere
 * @description 构建 Sequelize WHERE 条件对象
 * @param {BuildWhereOptions} options - 构建选项
 * @returns {WhereOptions} Sequelize WHERE 条件对象
 */
export function buildWhere(options: BuildWhereOptions): WhereOptions {
  const { filters, search, searchFields } = options;
  const where: WhereOptions = {};
  
  // 添加过滤条件
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  });
  
  // 添加搜索条件（简化版本）
  if (search && searchFields.length > 0) {
    // 这里只是占位实现，实际项目中需要根据 Sequelize 版本调整
    console.warn('搜索功能需要根据实际的 Sequelize Op 实现');
  }
  
  return where;
}

/**
 * @interface PaginationOptions
 * @description 分页选项
 * @property {number} page - 页码
 * @property {number} limit - 每页条数
 */
interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * @interface PaginationResult
 * @description 分页结果
 * @property {number} offset - 偏移量
 * @property {number} limit - 限制条数
 * @property {number} page - 当前页码
 */
interface PaginationResult {
  offset: number;
  limit: number;
  page: number;
}

/**
 * @function buildPagination
 * @description 构建分页参数
 * @param {PaginationOptions} options - 分页选项
 * @returns {PaginationResult} 分页结果
 */
export function buildPagination(options: PaginationOptions): PaginationResult {
  const { page = 1, limit = 20 } = options;
  const sanitizedPage = Math.max(1, page);
  const sanitizedLimit = Math.min(Math.max(1, limit), 100);
  const offset = (sanitizedPage - 1) * sanitizedLimit;
  
  return {
    offset,
    limit: sanitizedLimit,
    page: sanitizedPage
  };
}

/**
 * @function buildOrder
 * @description 构建排序参数
 * @param {string | string[] | undefined} order - 排序字段
 * @param {Order} defaultOrder - 默认排序
 * @returns {Order} Sequelize 排序对象
 */
export function buildOrder(
  order: string | string[] | undefined,
  defaultOrder: Order
): Order {
  if (!order) {
    return defaultOrder;
  }
  
  if (Array.isArray(order)) {
    // 处理数组形式的排序 ['field', 'ASC']
    if (order.length === 2 && typeof order[0] === 'string') {
      return [[order[0], (order[1] || 'ASC') as 'ASC' | 'DESC']];
    }
    // 处理多个排序字段 [['field1', 'ASC'], ['field2', 'DESC']]
    return order.map(item => 
      Array.isArray(item) ? item : [item, 'ASC']
    ) as Order;
  }
  
  // 处理字符串形式的排序 'field ASC'
  const parts = order.split(' ');
  if (parts.length >= 2) {
    return [[parts[0], parts[1].toUpperCase() as 'ASC' | 'DESC']];
  }
  
  return [[order, 'ASC']];
}

// 简化的查询构建实现
// 注意：这只是一个基础版本，实际项目中可能需要根据 Sequelize 版本调整
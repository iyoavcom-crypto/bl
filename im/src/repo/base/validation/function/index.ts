/**
 * @packageDocumentation
 * @module validators/query
 * @since 1.0.0 (2025-11-23)  // 可根据实际版本调整
 * @author Z-kali
 * @description 针对分页、搜索、过滤、排序等查询参数的业务校验函数
 */

import { isNonEmptyString } from "./string";
import { isPositiveInteger, isIntegerInRange } from "./number";
import { isNonEmptyPlainObject } from "./object";
import { normalizeOrder, type OrderTuple } from "./order";
import { isValidOrder } from "./predicates";

/**
 * @function isValidId
 * @description 验证 ID 是否为非空字符串
 * @param {unknown} id 待验证的 ID
 * @returns {id is string} 如果 ID 是非空字符串，则返回 true，否则返回 false
 */
export function isValidId(id: unknown): id is string {
  return isNonEmptyString(id);
}

/**
 * @function isValidPage
 * @description 验证页码是否为大于 0 的整数
 * @param {unknown} page 待验证的页码
 * @returns {page is number} 如果页码是大于 0 的整数，则返回 true，否则返回 false
 */
export function isValidPage(page: unknown): page is number {
  return isPositiveInteger(page);
}

/**
 * @function isValidLimit
 * @description 验证每页记录数是否为大于 0 且小于等于 200 的整数
 * @param {unknown} limit 待验证的每页记录数
 * @returns {limit is number} 如果每页记录数是大于 0 且小于等于 200 的整数，则返回 true，否则返回 false
 */
export function isValidLimit(limit: unknown): limit is number {
  return isIntegerInRange(limit, 1, 200);
}

/**
 * @function isValidSearch
 * @description 验证搜索字符串是否为非空字符串
 * @param {unknown} search 待验证的搜索字符串
 * @returns {search is string} 如果搜索字符串是非空字符串，则返回 true，否则返回 false
 */
export function isValidSearch(search: unknown): search is string {
  return isNonEmptyString(search);
}

/**
 * @function isValidFilters
 * @description 验证查询过滤器是否为非空对象
 * @param {unknown} filters 待验证的查询过滤器
 * @returns {filters is Record<string, unknown>} 如果查询过滤器是非空对象，则返回 true，否则返回 false
 */
export function isValidFilters(
  filters: unknown
): filters is Record<string, unknown> {
  return isNonEmptyPlainObject(filters);
}

/**
 * @function isValidQueryOrder
 * @description 针对查询参数的排序字段进行校验（对 isValidOrder 的语义封装）
 * @param {unknown} order 待验证的排序字段
 * @returns {order is string | OrderTuple[]} 如果合法则返回 true，否则返回 false
 */
export function isValidQueryOrder(
  order: unknown
): order is string | OrderTuple[] {
  return isValidOrder(order);
}

/**
 * @function normalizeQueryOrder
 * @description 规范化查询参数中的排序字段为排序元组数组
 * @param {string | OrderTuple[]} order 排序字段
 * @returns {OrderTuple[]} 排序元组数组
 */
export function normalizeQueryOrder(order: string | OrderTuple[]): OrderTuple[] {
  return normalizeOrder(order);
}

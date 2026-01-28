import { isNonEmptyString } from "./string";
import { isPositiveInteger, isIntegerInRange } from "./number";
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
 * @description 验证每页记录数是否为大于 0 小于等于 200 的整数
 * @param {unknown} limit 待验证的每页记录数
 * @returns {limit is number} 如果每页记录数是大于 0 小于等于 200 的整数，则返回 true，否则返回 false
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
  return typeof search === 'string';
}
 /**
 * @function isValidFilters
 * @description 验证查询过滤器是否为非空对象
 * @param {unknown} filters 待验证的查询过滤器
 * @returns {filters is Record<string, unknown>} 如果查询过滤器是非空对象，则返回 true，否则返回 false
 */
export function isValidFilters(filters: unknown): filters is Record<string, unknown> {
  return typeof filters === 'object' && filters !== null && !Array.isArray(filters);
}
 /**
 * @function isValidOrder
 * @description 验证排序字段是否为非空字符串或二维字符串数组
 * @param {unknown} order 待验证的排序字段
 * @returns {order is string | string[][]} 如果排序字段是非空字符串或二维字符串数组，则返回 true，否则返回 false
 */
export function isValidOrder(order: unknown): order is string | string[][] {
  if (typeof order === 'string') {
    return order.trim().length > 0;
  }
  if (Array.isArray(order)) {
    if (order.length === 0) return false;
    if (Array.isArray(order[0])) {
      for (const item of order as unknown as unknown[]) {
        if (!Array.isArray(item) || item.length < 2) return false;
        const [field, direction] = item as unknown[];
        if (typeof field !== 'string' || field.trim() === '') return false;
        if (typeof direction !== 'string') return false;
        const dir = String(direction).toUpperCase();
        if (dir !== 'ASC' && dir !== 'DESC') return false;
      }
      return true;
    }
    return (order as unknown[]).every((item) => typeof item === 'string' && (item as string).trim().length > 0);
  }
  return true;
}
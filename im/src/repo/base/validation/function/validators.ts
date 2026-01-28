import type { ValidationError } from "./types";
import { CrudValidationError } from "./errors";
import { isValidPage, isValidLimit, isValidSearch, isValidFilters, isValidOrder } from "./predicates";

/**
 * @function validateQueryOptions
 * @description 验证查询选项是否符合要求
 * @param {unknown} options 待验证的查询选项
 * @returns {void} 如果查询选项符合要求，则不返回任何值，否则抛出 CrudValidationError 异常
 */
export function validateQueryOptions(options: unknown): void {
  if (typeof options !== 'object' || options === null) {
    throw new CrudValidationError([
      {
        field: 'options',
        message: '查询选项必须是对象',
        value: options,
      },
    ]);
  }

  const errors: ValidationError[] = [];
  const opts = options as Record<string, unknown>;

  if ('page' in opts && opts.page !== undefined && !isValidPage(opts.page)) {
    errors.push({ field: 'page', message: '页码必须是大于0的整数', value: opts.page });
  }

  if ('limit' in opts && opts.limit !== undefined && !isValidLimit(opts.limit)) {
    errors.push({ field: 'limit', message: '每页数量必须是1-200之间的整数', value: opts.limit });
  }

  if (opts.search !== undefined && !isValidSearch(opts.search)) {
    errors.push({ field: 'search', message: '搜索关键词必须是字符串', value: opts.search });
  }

  if (opts.filters !== undefined && !isValidFilters(opts.filters)) {
    errors.push({ field: 'filters', message: '过滤条件必须是对象', value: opts.filters });
  }

  if (opts.order !== undefined && !isValidOrder(opts.order)) {
    errors.push({ field: 'order', message: '排序条件必须是字符串或字符串数组', value: opts.order });
  }

  if (errors.length > 0) {
    throw new CrudValidationError(errors);
  }
}

/**
 * @function validatePayload
 * @description 验证载荷是否符合要求
 * @param {unknown} payload 待验证的载荷
 * @param {string[]} requiredFields 必需的字段名数组
 * @returns {void} 如果载荷符合要求，则不返回任何值，否则抛出 CrudValidationError 异常
 */
export function validatePayload(payload: unknown, requiredFields: string[] = []): void {
  if (typeof payload !== 'object' || payload === null) {
    throw new CrudValidationError([
      { field: 'payload', message: '载荷必须是对象', value: payload },
    ]);
  }

  const errors: ValidationError[] = [];
  const data = payload as Record<string, unknown>;

  for (const field of requiredFields) {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      errors.push({ field, message: `字段 ${field} 是必需的`, value: data[field] });
    }
  }

  if (errors.length > 0) {
    throw new CrudValidationError(errors);
  }
}
import type { ValidationError } from "./types";
/**
 * @class CrudValidationError
 * @description 验证失败错误类
 * @property {ValidationError[]} errors - 验证错误数组
 * @property {number} status - 错误状态码，默认值为 400
 * @example
 * throw new CrudValidationError([{ field: 'name', message: '名称不能为空' }]);
 */
export class CrudValidationError extends Error {
  public readonly errors: ValidationError[];
  public readonly status: number = 400;

  constructor(errors: ValidationError[]) {
    const message = `验证失败: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`;
    super(message);
    this.name = 'CrudValidationError';
    this.errors = errors;
  }
}


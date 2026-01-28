/**
 * @interface ValidationError
 * @description 验证错误接口
 * @property {string} field - 错误字段名
 * @property {string} message - 错误信息
 * @property {unknown} value - 错误值
 */

export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
}
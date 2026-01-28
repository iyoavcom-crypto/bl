/**
 * @packageDocumentation
 * @module validators/string
 * @since 1.0.0 (2025-11-23)
 * @author Z-kali
 * @description 字符串相关的通用校验函数
 */

/**
 * @function isNonEmptyString
 * @description 判断值是否为去除首尾空白后长度大于 0 的字符串
 * @param {unknown} value 待判断的值
 * @returns {value is string} 如果是非空字符串则返回 true，否则返回 false
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * @packageDocumentation
 * @module validators/number
 * @since 1.0.0 (2025-11-23)  // 可根据实际版本调整
 * @author Z-kali
 * @description 数值与整数范围相关的通用校验函数
 */

/**
 * @function isInteger
 * @description 判断值是否为整数（number 类型且为有限整数）
 * @param {unknown} value 待判断的值
 * @returns {value is number} 如果是整数则返回 true，否则返回 false
 */
export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/**
 * @function isPositiveInteger
 * @description 判断值是否为大于 0 的整数
 * @param {unknown} value 待判断的值
 * @returns {value is number} 如果是大于 0 的整数则返回 true，否则返回 false
 */
export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

/**
 * @function isIntegerInRange
 * @description 判断值是否为指定闭区间范围内的整数
 * @param {unknown} value 待判断的值
 * @param {number} min 最小值（含）
 * @param {number} max 最大值（含）
 * @returns {value is number} 如果是 [min, max] 区间内的整数则返回 true，否则返回 false
 */
export function isIntegerInRange(
  value: unknown,
  min: number,
  max: number
): value is number {
  return isInteger(value) && value >= min && value <= max;
}

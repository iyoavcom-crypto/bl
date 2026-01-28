/**
 * @packageDocumentation
 * @module services-base-field
 * @since 1.0.0
 * @author Z-Kali
 * @tags [field],[transform],[mapping],[dto],[response]
 * @description 字段选择与转换工具函数
 * @path src/repo/base/field/index.ts
 * @see src/repo/base/field/types.ts
 */

import type { FieldsConfig, FieldMapping } from "./types";

/**
 * @function applyFields
 * @description 根据 FieldsConfig 与字段查询参数筛选返回字段（支持对象与数组），同时支持字段映射转换
 * @template T 泛型实体类型
 * @param {T | T[]} data - 原始数据（对象或对象数组）
 * @param {string | undefined} fieldsQuery - 查询字段串（如 "id,name"）
 * @param {FieldsConfig<T>} config - 字段选择配置
 * @returns {T | T[]} 筛选后的数据
 */
export function applyFields<T extends Record<string, unknown>>(
  data: T | T[],
  fieldsQuery: string | undefined,
  config: FieldsConfig<T>
): T | T[] {
  if (!config.enabled) return data;
  if (!fieldsQuery) return data;

  const requested = fieldsQuery
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const validFields = requested.filter((f) => config.allowed.includes(f));
  if (validFields.length === 0) return data;

  const pick = (item: T): T => {
    const result: Record<string, unknown> = {};

    for (const field of validFields) {
      // 检查是否有映射配置
      if (config.mappings && field in config.mappings) {
        const mapping = config.mappings[field];
        if (typeof mapping === "string") {
          // 简单重命名：{ apiField: 'dbField' }
          if (Object.prototype.hasOwnProperty.call(item, mapping)) {
            result[field] = item[mapping];
          }
        } else {
          // 复杂映射配置
          const fieldMapping = mapping as FieldMapping<T>;
          if (fieldMapping.transform) {
            // 使用转换函数
            result[field] = fieldMapping.transform(item);
          } else if (fieldMapping.source) {
            // 使用源字段重命名
            if (Object.prototype.hasOwnProperty.call(item, fieldMapping.source)) {
              result[field] = item[fieldMapping.source];
            }
          }
        }
      } else {
        // 无映射配置，直接取值
        if (Object.prototype.hasOwnProperty.call(item, field)) {
          result[field] = item[field];
        }
      }
    }

    return result as T;
  };

  return Array.isArray(data) ? data.map(pick) : pick(data);
}

/**
 * @function applyFieldMappings
 * @description 应用字段映射转换（独立于 fieldsQuery，直接应用 mappings 配置）
 * @template T 泛型实体类型
 * @param {T | T[]} data - 原始数据（对象或对象数组）
 * @param {Record<string, string | FieldMapping<T>>} mappings - 字段映射配置
 * @returns {T | T[]} 转换后的数据
 */
export function applyFieldMappings<T extends Record<string, unknown>>(
  data: T | T[],
  mappings: Record<string, string | FieldMapping<T>>
): T | T[] {
  if (!mappings || Object.keys(mappings).length === 0) return data;

  const transform = (item: T): T => {
    const result: Record<string, unknown> = { ...item };

    for (const [targetField, mapping] of Object.entries(mappings)) {
      if (typeof mapping === "string") {
        // 简单重命名
        if (Object.prototype.hasOwnProperty.call(item, mapping)) {
          result[targetField] = item[mapping];
        }
      } else {
        const fieldMapping = mapping as FieldMapping<T>;
        if (fieldMapping.transform) {
          result[targetField] = fieldMapping.transform(item);
        } else if (fieldMapping.source) {
          if (Object.prototype.hasOwnProperty.call(item, fieldMapping.source)) {
            result[targetField] = item[fieldMapping.source];
          }
        }
      }
    }

    return result as T;
  };

  return Array.isArray(data) ? data.map(transform) : transform(data);
}

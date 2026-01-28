/**
 * @packageDocumentation
 * @module services-base-field
 * @since 1.0.0
 * @author Z-Kali
 * @tags [field],[transform],[mapping],[dto],[response]
 * @description 提供 API 字段选择（?fields=...）与字段映射转换相关配置类型定义
 * @path src/repo/base/field/types.ts
 * @see src/repo/base/field/index.ts
 */

/**
 * @type FieldTransformer
 * @description 字段转换函数类型，用于将实体数据转换为自定义输出值
 * @template T 泛型实体类型
 * @param {T} entity - 原始实体对象
 * @returns {unknown} 转换后的字段值
 */
export type FieldTransformer<T = Record<string, unknown>> = (entity: T) => unknown;

/**
 * @interface FieldMapping
 * @description 字段映射配置（支持重命名、计算字段）
 * @template T 泛型实体类型
 * @property {string} [source] - 源字段名（可选，未指定时使用 key 本身）
 * @property {FieldTransformer<T>} [transform] - 字段转换函数（可选）
 * @property {boolean} [required] - 是否为必需字段（可选，默认 false）
 */
export interface FieldMapping<T = Record<string, unknown>> {
  source?: string;
  transform?: FieldTransformer<T>;
  required?: boolean;
}

/**
 * @interface FieldsConfig
 * @description 字段选择配置（如 ?fields=id,name）
 * @template T 泛型实体类型
 * @property {boolean} enabled - 是否启用字段选择
 * @property {string} paramName - 字段参数名，如 "fields"
 * @property {string[]} allowed - 允许选择的字段列表
 * @property {Record<string, string | FieldMapping<T>>} [mappings] - 字段映射配置（可选）
 */
export interface FieldsConfig<T = Record<string, unknown>> {
  enabled: boolean;
  paramName: string;
  allowed: string[];
  mappings?: Record<string, string | FieldMapping<T>>;
}

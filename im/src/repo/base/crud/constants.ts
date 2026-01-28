/**
 * @packageDocumentation
 * @module base-crud-constants
 * @since 1.0.0 (2025-09-12)
 * @author Z-Kali
 * @description Sequelize 查询通用常量与排序方向定义
 */

/**
 * @constant DEFAULT_QUERY_OPTIONS
 * @description Sequelize 查询默认选项：关闭 raw/nest/benchmark，保持实例能力.{ raw: false, nest: false, benchmark: false }
 */
export const DEFAULT_QUERY_OPTIONS = {
  raw: false,
  nest: false,
  benchmark: false,
} as const;

/**
 * @type SortDir
 * @description 排序方向
 */
export type SortDir = "ASC" | "DESC";

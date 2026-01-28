/**
 * @packageDocumentation
 * @module services/base/crud/templates
 * @since 1.0.0 (2025-11-23)
 * @author Z-kali
 * @description CRUD 配置模板：为常见的服务配置提供模板
 * @path src/services/base/crud/templates.ts
 */

import type { CrudConfig } from "../types/config";

/**
 * @function createTreeCrudConfig
 * @description 创建带树结构的 CRUD 配置模板
 * @param {Partial<CrudConfig<T>>} config - 自定义配置，会覆盖模板默认值
 * @returns {CrudConfig<T>} 完整的 CRUD 配置
 * @example
 * const navConfig = createTreeCrudConfig<Nav>({
 *   listFields: ["slug", "title", "icon", "color"],
 *   detailFields: ["title", "description", "keywords"],
 *   // ... 其他字段
 * });
 */
export function createTreeCrudConfig<T>(
  config: Partial<CrudConfig<T>>
): CrudConfig<T> {
  return {
    treeConfig: {
      pidField: "pid",
      idField: "id",
    },
    defaultOrder: [["sort", "ASC"]],
    slugField: "slug",
    ...config,
  } as CrudConfig<T>;
}

/**
 * @function createBasicCrudConfig
 * @description 创建基础 CRUD 配置模板（无特殊功能）
 * @param {Partial<CrudConfig<T>>} config - 自定义配置
 * @returns {CrudConfig<T>} 完整的 CRUD 配置
 */
export function createBasicCrudConfig<T>(
  config: Partial<CrudConfig<T>>
): CrudConfig<T> {
  return {
    slugField: "slug",
    ...config,
  } as CrudConfig<T>;
}

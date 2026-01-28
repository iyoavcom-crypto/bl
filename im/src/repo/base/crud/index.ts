/**
 * @packageDocumentation
 * @module base-crud-index
 * @since 1.0.0
 * @author Z-Kali
 * @tags [CRUD], [Service], [Factory], [Helper], [Async]
 * @description CRUD 按需导出入口，包含常量、辅助函数、工厂与各异步方法
 * @path src/repo/base/crud/index.ts
 * @see src/services/base/types/index.ts
 * @see src/services/base/validation/index.ts
 * @see src/services/base/tree/index.ts
 * @see src/services/base/filters.ts
 * @see src/services/base/validators.ts
 */

export { DEFAULT_QUERY_OPTIONS } from "./constants";
export { allFields, toFindOptions, pickDTO, assertValidId, buildIncludeOptions, applyScope, QueryOptionsBuilder } from "./helpers";
export type { QueryBuildResult, BuildFindOptionsParams } from "./helpers";
export { createCrudService } from "./factory";
export { listAsync } from "./list";
export { allAsync } from "./all";
export { getByIdAsync } from "./getbyid";
export { getBySlugAsync } from "./getbyslug";
export { createAsync } from "./create";
export { updateAsync } from "./update";
export { removeAsync } from "./remove";
export { searchAsync } from "./search";
export { treeAsync } from "./tree";
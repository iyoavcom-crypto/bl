/**
 * @packageDocumentation
 * @module repo-index
 * @since 1.0.0
 * @author Z-Kali
 * @tags [CRUD], [Repository], [Validation], [Tree], [Field]
 * @description 仓储层统一导出入口，聚合 CRUD 操作、字段处理、树结构构建、类型定义及验证函数
 * @path src/repo/index.ts
 * @see src/repo/base/crud/index.ts
 * @see src/repo/base/field/index.ts
 * @see src/repo/base/tree/index.ts
 * @see src/repo/base/types/index.ts
 * @see src/repo/base/validation/index.ts
 */

export { createCrudService } from "./base/crud/factory";
export { DEFAULT_QUERY_OPTIONS } from "./base/crud/constants";
export { allFields, toFindOptions, pickDTO, assertValidId, buildIncludeOptions, applyScope, QueryOptionsBuilder } from "./base/crud/helpers";
export type { QueryBuildResult, BuildFindOptionsParams } from "./base/crud/helpers";
export { listAsync } from "./base/crud/list";
export { allAsync } from "./base/crud/all";
export { getByIdAsync } from "./base/crud/getbyid";
export { getBySlugAsync } from "./base/crud/getbyslug";
export { createAsync } from "./base/crud/create";
export { updateAsync } from "./base/crud/update";
export { removeAsync } from "./base/crud/remove";
export { searchAsync } from "./base/crud/search";
export { treeAsync } from "./base/crud/tree";
export { createTreeCrudConfig, createBasicCrudConfig } from "./base/crud/templates";

export type { FieldsConfig, FieldTransformer, FieldMapping } from "./base/field/types";
export { applyFields, applyFieldMappings } from "./base/field";

export { buildTree } from "./base/tree";
export type { TreeConfig, TreeNode, TreeResult } from "./base/tree";

export type { CrudConfig, AssociationConfig, ScopeConfig } from "./base/types/config";
export type { QueryOptions, ListQueryOptions, CrudOperationOptions } from "./base/types/query";
export type { PaginatedResult, ListResult, DetailResult, TreeNode as CrudTreeNode, TreeResult as CrudTreeResult } from "./base/types/results";
export type { BeforeCreateHook, BeforeUpdateHook, ValidateCreateHook, ValidateUpdateHook, BeforeTransactionHook, AfterTransactionHook, OnTransactionErrorHook } from "./base/types/hooks";
export type { CrudService, CrudServiceFactory } from "./base/types/service";

export type { ValidationError } from "./base/validation/function/types";
export { CrudValidationError } from "./base/validation/function/errors";
export { normalizeAndValidateEmail } from "./base/validation/function/email";
export { isValidId, isValidPage, isValidLimit, isValidSearch, isValidFilters, isValidOrder } from "./base/validation/function/predicates";
export { buildFiltersFromString } from "./base/validation/function/filters";
export { validateQueryOptions, validatePayload } from "./base/validation/function/validators";

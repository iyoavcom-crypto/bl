# services/base 模块说明

- 运行时：Node 22（ESM，TypeScript）
- 作用：为 Sequelize 模型提供统一的 CRUD 服务与工具，包括分页/详情/创建/更新/删除/搜索/树形、字段选择、查询参数校验等。

## 快速上手
- 创建服务：`createCrudService(ModelClass, config)`
- 控制器集成：在控制器中调用 `service.list(q)`、`service.getById(id)` 等。
- 配置模板：`createBasicCrudConfig(config)` 或 `createTreeCrudConfig(config)`。

示例
- 组装服务
  - `const service = createCrudService(User, createBasicCrudConfig({ listFields: ['id','email'], detailFields: ['id','email','createdAt'], searchFields: ['email'] }))`
- 控制器调用
  - `const result = await service.list({ page: 1, limit: 20, search: 'kali' })`

## 导出总览（入口）
- 函数
  - `createCrudService`
  - `allFields`、`toFindOptions`、`pickDTO`、`assertValidId`
  - `listByFieldAsync`、`listAsync`、`listAllFieldsAsync`、`allAsync`
  - `getByIdAsync`、`getBySlugAsync`
  - `createAsync`、`updateAsync`、`updateBySlugAsync`
  - `removeAsync`、`removeBySlugAsync`
  - `searchAsync`、`treeAsync`
  - `createTreeCrudConfig`、`createBasicCrudConfig`
  - `applyFields`
  - `buildTree`
  - `normalizeAndValidateEmail`、`buildFiltersFromString`、`validateQueryOptions`、`validatePayload`
- 常量与类型
  - `DEFAULT_QUERY_OPTIONS`
  - `FieldsConfig`
  - `TreeConfig`、`TreeNode`、`TreeResult`
  - `CrudConfig`
  - `QueryOptions`、`ListQueryOptions`
  - `PaginatedResult`、`ListResult`、`DetailResult`
  - `BeforeCreateHook`、`BeforeUpdateHook`、`ValidateCreateHook`、`ValidateUpdateHook`
  - `CrudService`、`CrudServiceFactory`
  - `ValidationError`、`CrudValidationError`

---

## CRUD 服务工厂
- `createCrudService(ModelClass, config): CrudService<T>`
  - 聚合并返回一个符合 `CrudService<T>` 接口的服务对象。
  - 方法映射：
    - `list(q)` → `listAsync`
    - `listAllFields(q)` → `listAllFieldsAsync`
    - `all(q)` → `allAsync`
    - `getById(id)` → `getByIdAsync`
    - `getBySlug(slug)` → `getBySlugAsync`
    - `create(payload)` → `createAsync`
    - `update(id, patch)` → `updateAsync`
    - `updateBySlug(slug, patch)` → `updateBySlugAsync`
    - `remove(id)` → `removeAsync`
    - `removeBySlug(slug)` → `removeBySlugAsync`
    - `search(keyword, page?, limit?)` → `searchAsync`
    - `tree(q)` → `treeAsync`

签名与文件
- `createCrudService` 在 `src/services/base/crud/factory.ts:23`
- 返回类型 `CrudService<T>` 在 `src/services/base/types/service.ts:25`

## CRUD 配置模板
- `createBasicCrudConfig<T>(config): CrudConfig<T>`
  - 生成基础配置，默认包含 `slugField: "slug"`。
- `createTreeCrudConfig<T>(config): CrudConfig<T>`
  - 生成包含树形结构支持的配置：`treeConfig.pidField/idField`，默认排序 `[['sort','ASC']]`。
文件位置
- `createBasicCrudConfig` 在 `src/services/base/crud/templates.ts:44`
- `createTreeCrudConfig` 在 `src/services/base/crud/templates.ts:24`

---

## CRUD 方法说明（Async）
- `listAsync(ModelClass, config, q?): Promise<PaginatedResult<T>>`
  - 分页列表，返回 `config.listFields` 字段。
  - 支持 `q.page`、`q.limit`、`q.search`、`q.filters`、`q.order`。
  - 文件：`src/services/base/crud/list.ts:21`
- `listAllFieldsAsync(ModelClass, config, q?): Promise<PaginatedResult<T>>`
  - 分页列表，返回 `listFields ∪ detailFields` 去重后的全部字段。
  - 文件：`src/services/base/crud/listallfields.ts:22`
- `allAsync(ModelClass, config, q?): Promise<ListResult<T>>`
  - 非分页列表，用于下拉框或全量列表。
  - 文件：`src/services/base/crud/all.ts:38`
- `getByIdAsync(ModelClass, config, id): Promise<DetailResult<T>>`
  - 主键详情查询；非法 ID 将抛 `CrudValidationError`（通过 `assertValidId`）。
  - 文件：`src/services/base/crud/getbyid.ts:25`
- `getBySlugAsync(ModelClass, config, slug): Promise<DetailResult<T>>`
  - 按 `config.slugField` 查询详情；空 slug 将抛 `CrudValidationError`。
  - 文件：`src/services/base/crud/getbyslug.ts:22`
- `createAsync(ModelClass, config, payload): Promise<DetailResult<T>>`
  - 处理流程：`validatePayload` → `validateCreate` → `beforeCreate` → 白名单过滤（`creatableFields`）→ `Model.create`。
  - 文件：`src/services/base/crud/create.ts:37`
- `updateAsync(ModelClass, config, id, patch): Promise<DetailResult<T>>`
  - 处理流程：`assertValidId` → `validatePayload` → `validateUpdate` → `beforeUpdate` → 白名单过滤（`updatableFields`）→ `instance.update`。
  - 文件：`src/services/base/crud/update.ts:22`
- `updateBySlugAsync(ModelClass, config, slug, patch): Promise<DetailResult<T>>`
  - 与 `updateAsync` 类似，但以 `slug` 查询目标记录。
  - 文件：`src/services/base/crud/updatebyslug.ts:23`
- `removeAsync(ModelClass, config, id): Promise<DetailResult<null>>`
  - 基于主键删除；未找到会抛 `Error & { status: 404 }`。
  - 文件：`src/services/base/crud/remove.ts:20`
- `removeBySlugAsync(ModelClass, config, slug): Promise<DetailResult<null>>`
  - 基于 `slug` 删除；未找到会抛 `Error & { status: 404 }`。
  - 文件：`src/services/base/crud/removebyslug.ts:21`
- `searchAsync(ModelClass, config, keyword, page=1, limit=20): Promise<PaginatedResult<T>>`
  - 关键词搜索，内部委托 `listAsync`。
  - 文件：`src/services/base/crud/search.ts:22`
- `treeAsync(ModelClass, config, q?): Promise<TreeResult<T>>`
  - 查询后以 `treeConfig` 构建树形数据。
  - 文件：`src/services/base/crud/tree.ts:22`
- `listByFieldAsync(model, cfg, field, value, q): Promise<{ items, page, limit, total, message? }>`
  - 按指定业务字段分页查询；支持选择全部（`selectAll`）或列表字段集。
  - 文件：`src/services/base/crud/listbyfield.ts:23`

---

## 辅助与常量
- `DEFAULT_QUERY_OPTIONS`
  - `{ raw: false, nest: false, benchmark: false }`。
  - 文件：`src/services/base/crud/constants.ts:13`
- `allFields(cfg): string[]`
  - 合并 `listFields` 与 `detailFields` 并去重。
  - 文件：`src/services/base/crud/helpers.ts:17`
- `toFindOptions({ page, pageSize }): { limit?, offset? }`
  - 将页码与页大小转换为 `limit/offset`。
  - 文件：`src/services/base/crud/helpers.ts:28`
- `pickDTO(obj, keys): Partial<T>`
  - 从对象挑选指定键，忽略 `undefined`。
  - 文件：`src/services/base/crud/helpers.ts:45`
- `assertValidId(id): void`
  - 非法时抛出 `CrudValidationError([{ field: 'id', ... }])`。
  - 文件：`src/services/base/crud/helpers.ts:60`

---

## 字段选择（Fields）
- 类型：`FieldsConfig`
  - `enabled: boolean` 是否启用
  - `paramName: string` 查询参数名（如 `fields`）
  - `allowed: string[]` 允许选择的字段白名单
- 函数：`applyFields(data, fieldsQuery, config): T | T[]`
  - 根据 `fieldsQuery` 与白名单过滤返回字段，支持数组与对象。
  - 文件：`src/services/base/field/index.ts:11`

---

## 树形工具（Tree）
- 类型：`TreeConfig`
  - `idField?: string` 默认 `id`
  - `pidField?: string` 默认 `pid`
  - `sortField?: string` 同级排序字段
  - `rootPidValue?: string | number | null` 根 pid 值
- 类型：`TreeNode<Entity>`
  - `id: string`
  - `pid: string | null`
  - `sort?: number`
  - `children?: TreeNode<Entity>[]`
- 类型：`TreeResult<Entity>`
  - `data: TreeNode<Entity>[]`
- 函数：`buildTree(rows, config?): TreeResult<Entity>`
  - 基于 `id/pid/sort` 构建树形结构并递归排序。
  - 文件：`src/services/base/tree/index.ts:101`

---

## 查询与结果类型
- `QueryOptions`
  - `page?: number`、`limit?: number`、`search?: string`、`filters?: Record<string, unknown>`、`order?: string | string[]`
  - 文件：`src/services/base/types/query.ts:17`
- `ListQueryOptions`
  - `search?: string`、`filters?: Record<string, unknown>`、`order?: string | string[]`
  - 文件：`src/services/base/types/query.ts:31`
- `PaginatedResult<T>`
  - `data: T[]`、`page: number`、`limit: number`、`total: number`
  - 文件：`src/services/base/types/results.ts:18`
- `ListResult<T>`
  - `data: T[]`
  - 文件：`src/services/base/types/results.ts:31`
- `DetailResult<T>`
  - `data: T | null`
  - 文件：`src/services/base/types/results.ts:41`
- `TreeNode<T>` / `TreeResult<T>`
  - 树形节点与结果包装。
  - 文件：`src/services/base/types/results.ts:51`、`src/services/base/types/results.ts:61`

---

## 钩子类型（Hooks）
- `BeforeCreateHook<T>(payload): Partial<T> | Promise<Partial<T>>`
  - 文件：`src/services/base/types/hooks.ts:16`
- `BeforeUpdateHook<T>(patch, id): Partial<T> | Promise<Partial<T>>`
  - 文件：`src/services/base/types/hooks.ts:28`
- `ValidateCreateHook<T>(payload): void | Promise<void>`
  - 文件：`src/services/base/types/hooks.ts:40`
- `ValidateUpdateHook<T>(patch, id): void | Promise<void>`
  - 文件：`src/services/base/types/hooks.ts:52`

---

## 校验与错误（Validation）
- `ValidationError`
  - `field: string`、`message: string`、`value: unknown`
  - 文件：`src/services/base/validation/function/types.ts:9`
- `CrudValidationError extends Error`
  - `errors: ValidationError[]`、`status: 400`
  - 文件：`src/services/base/validation/function/errors.ts:10`
- `normalizeAndValidateEmail(email): string | null`
  - 规范化邮箱并进行格式校验（长度/字符/域名/TLD）。
  - 文件：`src/services/base/validation/function/email.ts:11`
- `buildFiltersFromString(filter, source): Record<string, unknown>`
  - 从查询参数构造 `filters`，支持 `key[op]=value` 或 `key.op=value` 语法，处理 `in/notIn` 列表。
  - 文件：`src/services/base/validation/function/filters.ts:8`
- 断言/谓词（predicates）
  - `isValidId(id): id is string`
    - 文件：`src/services/base/validation/function/predicates.ts:9`
  - `isValidPage(page): page is number`
    - 文件：`src/services/base/validation/function/predicates.ts:18`
  - `isValidLimit(limit): limit is number`
    - 文件：`src/services/base/validation/function/predicates.ts:27`
  - `isValidSearch(search): search is string`
    - 文件：`src/services/base/validation/function/predicates.ts:36`
  - `isValidFilters(filters): filters is Record<string, unknown>`
    - 文件：`src/services/base/validation/function/predicates.ts:45`
  - `isValidOrder(order): order is string | string[][]`
    - 文件：`src/services/base/validation/function/predicates.ts:54`
- 验证器（validators）
  - `validateQueryOptions(options): void`
    - 文件：`src/services/base/validation/function/validators.ts:11`
  - `validatePayload(payload, requiredFields?: string[]): void`
    - 文件：`src/services/base/validation/function/validators.ts:57`

---

## 配置类型（CrudConfig）
- 字段映射与行为控制：
  - `listFields: string[]`
  - `detailFields: string[]`
  - `searchFields?: string[]`
  - `creatableFields?: string[]`
  - `updatableFields?: string[]`
  - `defaultOrder?: Array<[string, 'ASC' | 'DESC']>`
  - `slugField?: string`
  - `treeConfig?: TreeConfig`
  - `filterableFields?: string[]`
  - `beforeCreate?: BeforeCreateHook<T>`
  - `beforeUpdate?: BeforeUpdateHook<T>`
  - `validateCreate?: ValidateCreateHook<T>`
  - `validateUpdate?: ValidateUpdateHook<T>`

---

## 服务接口（CrudService<T>）
- `list(q?): Promise<PaginatedResult<T>>`
- `listAllFields(q?): Promise<PaginatedResult<T>>`
- `all(q?): Promise<ListResult<T>>`
- `allPaginated(page?, limit?): Promise<PaginatedResult<T>>`（占位，未实现）
- `getById(id): Promise<DetailResult<T>>`
- `getBySlug(slug): Promise<DetailResult<T>>`
- `updateBySlug(slug, patch): Promise<DetailResult<T>>`
- `removeBySlug(slug): Promise<DetailResult<null>>`
- `search(keyword, page?, limit?): Promise<PaginatedResult<T>>`
- `tree(q?): Promise<TreeResult<T>>`
- `create(payload): Promise<DetailResult<T>>`
- `update(id, patch): Promise<DetailResult<T>>`
- `remove(id): Promise<DetailResult<null>>`

---

## 设计约束
- 查询构建依赖 `utils/query` 的 `buildWhere/buildOrder/buildPagination`。
- 所有 Sequelize 查询使用 `DEFAULT_QUERY_OPTIONS` 保持实例能力与性能日志关闭。
- 校验失败统一抛 `CrudValidationError`，由控制器层封装为标准错误响应。

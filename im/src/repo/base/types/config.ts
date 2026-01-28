/**
 * @packageDocumentation
 * @module models-config-crud
 * @since 1.0.0
 * @author Z-Kali
 * @tags [crud],[config],[tree],[association],[scope]
 * @description 通用 CRUD / 树结构服务配置类型定义（TreeConfig / CrudConfig / AssociationConfig / ScopeConfig）
 * @path src/repo/base/types/config.ts
 * @see src/repo/base/crud/factory.ts
 */

import type { Includeable } from "sequelize";
import type {
  BeforeCreateHook,
  BeforeUpdateHook,
  ValidateCreateHook,
  ValidateUpdateHook
} from "./hooks.js";
import type { FieldMapping } from "../field/types.js";

/**
 * @interface TreeConfig
 * @description
 * 树结构配置接口（用于递归查询、构建树形数据与父子索引）。
 *
 * 基于 id / pid 字段的父子关系：
 * - idField 表示当前节点的唯一标识；
 * - pidField 指向父节点的 idField；
 * - rootPidValue 一般为 null，表示根节点；
 *
 * Service 层可据此自动构建：
 * - parent → children 映射索引；
 * - 树形结构（如 menus tree、categories tree）；
 * - 同级节点排序（基于 sortField）。
 *
 * @property {string} idField - 节点 ID 字段名（如 "id"）
 * @property {string} pidField - 父节点 ID 字段名（如 "pid"）
 * @property {string} [sortField] - 排序字段名（可选，如 "sort"）
 * @property {unknown} [rootPidValue] - 根节点父 ID 值（默认 null，表示顶级节点）
 * @property {string} [childrenField] - 子节点数组字段名（默认 "children"）
 */
export interface TreeConfig {
  idField: string;
  pidField: string;
  sortField?: string;
  rootPidValue?: unknown;
  childrenField?: string;
}

/**
 * @interface AssociationConfig
 * @description 关联查询配置接口（用于 Sequelize include）
 * @property {Includeable[]} [defaultIncludes] - 默认关联加载配置
 * @property {Record<string, Includeable>} [namedIncludes] - 命名关联配置（可通过 key 引用）
 * @property {boolean} [autoInclude] - 是否自动加载默认关联（默认 false）
 */
export interface AssociationConfig {
  defaultIncludes?: Includeable[];
  namedIncludes?: Record<string, Includeable>;
  autoInclude?: boolean;
}

/**
 * @interface ScopeConfig
 * @description Scope 配置接口（用于模型 scope 切换）
 * @property {string | string[]} [defaultScope] - 默认 scope（可选，未指定时使用模型默认）
 * @property {string[]} [availableScopes] - 可用的 scope 列表（白名单）
 */
export interface ScopeConfig {
  defaultScope?: string | string[];
  availableScopes?: string[];
}

/**
 * @interface CrudConfig
 * @description
 * CRUD 服务配置接口，用于描述通用 CRUD Service 的行为与字段映射。
 *
 * 主要用途：
 * - 列表 / 详情返回字段控制（listFields / detailFields）；
 * - 全局搜索字段配置（searchFields）；
 * - 创建 / 更新字段白名单（creatableFields / updatableFields）；
 * - 默认排序规则（defaultOrder）；
 * - 唯一标识字段（slugField），用于 getBySlug / updateBySlug 等；
 * - 树结构配置（treeConfig），基于 id / pid 构建上下级索引；
 * - 关联查询配置（associations），用于 Sequelize include；
 * - Scope 配置（scopes），用于模型 scope 切换；
 * - 钩子扩展（beforeCreate / beforeUpdate / validateCreate / validateUpdate）；
 * - 过滤字段白名单（filterableFields），用于安全构建 WHERE 条件；
 * - 字段映射配置（fieldMappings），用于响应 DTO 转换。
 *
 * @template T - 模型类型（通常为模型属性类型，如 ModelAttributes）
 *
 * @property {string[]} listFields - 列表查询返回字段（SELECT 字段集合，用于 list/all）
 * @property {string[]} detailFields - 详情查询返回字段（SELECT 字段集合，用于 getById/getBySlug）
 * @property {string[]} [searchFields] - 全局搜索字段（可选，用于关键字模糊搜索）
 * @property {string[]} [creatableFields] - 允许创建的字段列表（可选，未列出字段将被忽略）
 * @property {string[]} [updatableFields] - 允许更新的字段列表（可选，未列出字段将被忽略）
 * @property {Array<[string, "ASC" | "DESC"]>} [defaultOrder] - 默认排序规则（可选，如 [["createdAt","DESC"]]）
 * @property {string} [slugField] - 唯一标识字段名（可选，如 "slug"，用于基于 slug 的查询与更新）
 * @property {TreeConfig} [treeConfig] - 树结构配置（可选，配置后可在 service 中自动构建树与上下级索引）
 * @property {AssociationConfig} [associations] - 关联查询配置（可选，用于 Sequelize include）
 * @property {ScopeConfig} [scopes] - Scope 配置（可选，用于模型 scope 切换）
 * @property {string[]} [filterableFields] - 允许筛选过滤的字段白名单
 * @property {Record<string, string | FieldMapping<T>>} [fieldMappings] - 字段映射配置（可选，用于响应 DTO 转换）
 * @property {BeforeCreateHook<T>} [beforeCreate] - 创建前钩子（可选，用于二次处理 payload）
 * @property {BeforeUpdateHook<T>} [beforeUpdate] - 更新前钩子（可选，用于二次处理 patch）
 * @property {ValidateCreateHook<T>} [validateCreate] - 创建前验证钩子（可选，用于业务级校验）
 * @property {ValidateUpdateHook<T>} [validateUpdate] - 更新前验证钩子（可选，用于业务级校验）
 */
export interface CrudConfig<T = Record<string, unknown>> {

  listFields: string[];
  detailFields: string[];
  searchFields?: string[];
  creatableFields?: string[];
  updatableFields?: string[];
  defaultOrder?: Array<[string, "ASC" | "DESC"]>;
  slugField?: string;
  treeConfig?: TreeConfig;

  /**
   * @description 关联查询配置（用于 Sequelize include）
   */
  associations?: AssociationConfig;

  /**
   * @description Scope 配置（用于模型 scope 切换）
   */
  scopes?: ScopeConfig;

  /**
   * @description 允许筛选过滤的字段白名单
   */
  filterableFields?: string[];

  /**
   * @description 字段映射配置（用于响应 DTO 转换）
   */
  fieldMappings?: Record<string, string | FieldMapping<T>>;

  beforeCreate?: BeforeCreateHook<T>;
  beforeUpdate?: BeforeUpdateHook<T>;
  validateCreate?: ValidateCreateHook<T>;
  validateUpdate?: ValidateUpdateHook<T>;
}

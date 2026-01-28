/**
 * @packageDocumentation
 * @module services/role
 * @tag [角色服务] [CRUD服务] [角色管理]    
 * @since 1.0.0 (2025-01-14)
 * @author Z-kali
 * @description 角色服务：使用 CRUD 服务处理角色相关业务逻辑
 * @path src/services/role/index.ts
 * @see src/services/crud/index.ts
 * @see src/models/role.ts
 */

import { Role } from '@/models';
import { createCrudService } from '@/repo';
import type { CrudConfig } from '@/repo';
import { ROLE_LIST, ROLE_FILTERABLE } from "@/models/role/types/index";

/**
 * @constant roleCrudConfig
 * @description 角色 CRUD 配置（映射为通用 CrudConfig）
 */
const roleCrudConfig: CrudConfig<Role> = {
  listFields: [...ROLE_LIST],
  detailFields: [...ROLE_LIST],
  creatableFields: ["id", "name", "group"],
  updatableFields: ["id", "name", "group"],
  searchFields: ["name"],
  filterableFields: [...ROLE_FILTERABLE],
  defaultOrder: [["id", "ASC"]],
};

const RoleService = createCrudService(Role, roleCrudConfig);

export default RoleService; 

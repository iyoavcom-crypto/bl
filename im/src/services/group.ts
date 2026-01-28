/**
 * @packageDocumentation
 * @module services/Group
 * @tag [群组服务] [CRUD服务] [群组管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 群组服务：使用 CRUD 服务处理群组相关业务逻辑
 * @path src/services/group.ts
 * @see src/models/group/index.ts
 */

import { Group } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  GROUP_LIST,
  GROUP_DETAIL,
  GROUP_CREATABLE,
  GROUP_UPDATABLE,
  GROUP_FILTERABLE,
  GROUP_SORTABLE,
} from "@/models/group/index.js";

/**
 * @constant groupCrudConfig
 * @description 群组 CRUD 配置
 */
const groupCrudConfig: CrudConfig<Group> = {
  listFields: [...GROUP_LIST],
  detailFields: [...GROUP_DETAIL],
  creatableFields: [...GROUP_CREATABLE],
  updatableFields: [...GROUP_UPDATABLE],
  searchFields: ["id", "name", "description"],
  filterableFields: [...GROUP_FILTERABLE],
  defaultOrder: [[GROUP_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(Group, groupCrudConfig);

const GroupService = {
  ...BaseService,
};

export default GroupService;

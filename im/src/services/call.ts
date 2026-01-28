/**
 * @packageDocumentation
 * @module services/Call
 * @tag [通话服务] [CRUD服务] [通话管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 通话服务：使用 CRUD 服务处理通话记录相关业务逻辑
 * @path src/services/call.ts
 * @see src/models/call/index.ts
 */

import { Call } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  CALL_LIST,
  CALL_DETAIL,
  CALL_CREATABLE,
  CALL_UPDATABLE,
  CALL_FILTERABLE,
  CALL_SORTABLE,
} from "@/models/call/index.js";

/**
 * @constant callCrudConfig
 * @description 通话 CRUD 配置
 */
const callCrudConfig: CrudConfig<Call> = {
  listFields: [...CALL_LIST],
  detailFields: [...CALL_DETAIL],
  creatableFields: [...CALL_CREATABLE],
  updatableFields: [...CALL_UPDATABLE],
  searchFields: ["id"],
  filterableFields: [...CALL_FILTERABLE],
  defaultOrder: [[CALL_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(Call, callCrudConfig);

const CallService = {
  ...BaseService,
};

export default CallService;

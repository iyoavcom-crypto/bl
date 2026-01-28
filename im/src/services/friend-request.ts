/**
 * @packageDocumentation
 * @module services/FriendRequest
 * @tag [好友请求服务] [CRUD服务] [好友申请管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 好友请求服务：使用 CRUD 服务处理好友申请相关业务逻辑
 * @path src/services/friend-request.ts
 * @see src/models/friend-request/index.ts
 */

import { FriendRequest } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  FRIEND_REQUEST_LIST,
  FRIEND_REQUEST_DETAIL,
  FRIEND_REQUEST_CREATABLE,
  FRIEND_REQUEST_UPDATABLE,
  FRIEND_REQUEST_FILTERABLE,
  FRIEND_REQUEST_SORTABLE,
} from "@/models/friend-request/index.js";

/**
 * @constant friendRequestCrudConfig
 * @description 好友请求 CRUD 配置
 */
const friendRequestCrudConfig: CrudConfig<FriendRequest> = {
  listFields: [...FRIEND_REQUEST_LIST],
  detailFields: [...FRIEND_REQUEST_DETAIL],
  creatableFields: [...FRIEND_REQUEST_CREATABLE],
  updatableFields: [...FRIEND_REQUEST_UPDATABLE],
  searchFields: ["id", "message"],
  filterableFields: [...FRIEND_REQUEST_FILTERABLE],
  defaultOrder: [[FRIEND_REQUEST_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(FriendRequest, friendRequestCrudConfig);

const FriendRequestService = {
  ...BaseService,
};

export default FriendRequestService;

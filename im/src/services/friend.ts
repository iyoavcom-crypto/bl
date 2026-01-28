/**
 * @packageDocumentation
 * @module services/Friend
 * @tag [好友服务] [CRUD服务] [好友管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 好友服务：使用 CRUD 服务处理好友相关业务逻辑
 * @path src/services/friend.ts
 * @see src/models/friend/index.ts
 */

import { Friend } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  FRIEND_LIST,
  FRIEND_DETAIL,
  FRIEND_CREATABLE,
  FRIEND_UPDATABLE,
  FRIEND_FILTERABLE,
  FRIEND_SORTABLE,
} from "@/models/friend/index.js";

/**
 * @constant friendCrudConfig
 * @description 好友 CRUD 配置
 */
const friendCrudConfig: CrudConfig<Friend> = {
  listFields: [...FRIEND_LIST],
  detailFields: [...FRIEND_DETAIL],
  creatableFields: [...FRIEND_CREATABLE],
  updatableFields: [...FRIEND_UPDATABLE],
  searchFields: ["id", "remark"],
  filterableFields: [...FRIEND_FILTERABLE],
  defaultOrder: [[FRIEND_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(Friend, friendCrudConfig);

const FriendService = {
  ...BaseService,
};

export default FriendService;

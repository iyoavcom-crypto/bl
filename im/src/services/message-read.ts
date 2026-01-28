/**
 * @packageDocumentation
 * @module services/MessageRead
 * @tag [已读回执服务] [CRUD服务] [已读管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 已读回执服务：使用 CRUD 服务处理已读回执相关业务逻辑
 * @path src/services/message-read.ts
 * @see src/models/message-read/index.ts
 */

import { MessageRead } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  MESSAGE_READ_LIST,
  MESSAGE_READ_DETAIL,
  MESSAGE_READ_CREATABLE,
  MESSAGE_READ_UPDATABLE,
  MESSAGE_READ_FILTERABLE,
  MESSAGE_READ_SORTABLE,
} from "@/models/message-read/index.js";

/**
 * @constant messageReadCrudConfig
 * @description 已读回执 CRUD 配置
 */
const messageReadCrudConfig: CrudConfig<MessageRead> = {
  listFields: [...MESSAGE_READ_LIST],
  detailFields: [...MESSAGE_READ_DETAIL],
  creatableFields: [...MESSAGE_READ_CREATABLE],
  updatableFields: [...MESSAGE_READ_UPDATABLE],
  searchFields: ["id"],
  filterableFields: [...MESSAGE_READ_FILTERABLE],
  defaultOrder: [[MESSAGE_READ_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(MessageRead, messageReadCrudConfig);

const MessageReadService = {
  ...BaseService,
};

export default MessageReadService;

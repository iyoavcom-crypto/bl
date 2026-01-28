/**
 * @packageDocumentation
 * @module services/Message
 * @tag [消息服务] [CRUD服务] [消息管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 消息服务：使用 CRUD 服务处理消息相关业务逻辑
 * @path src/services/message.ts
 * @see src/models/message/index.ts
 */

import { Message } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  MESSAGE_LIST,
  MESSAGE_DETAIL,
  MESSAGE_CREATABLE,
  MESSAGE_UPDATABLE,
  MESSAGE_FILTERABLE,
  MESSAGE_SORTABLE,
} from "@/models/message/index.js";

/**
 * @constant messageCrudConfig
 * @description 消息 CRUD 配置
 */
const messageCrudConfig: CrudConfig<Message> = {
  listFields: [...MESSAGE_LIST],
  detailFields: [...MESSAGE_DETAIL],
  creatableFields: [...MESSAGE_CREATABLE],
  updatableFields: [...MESSAGE_UPDATABLE],
  searchFields: ["id", "content"],
  filterableFields: [...MESSAGE_FILTERABLE],
  defaultOrder: [[MESSAGE_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(Message, messageCrudConfig);

const MessageService = {
  ...BaseService,
};

export default MessageService;

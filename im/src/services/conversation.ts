/**
 * @packageDocumentation
 * @module services/Conversation
 * @tag [会话服务] [CRUD服务] [会话管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 会话服务：使用 CRUD 服务处理会话相关业务逻辑
 * @path src/services/conversation.ts
 * @see src/models/conversation/index.ts
 */

import { Conversation } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  CONVERSATION_LIST,
  CONVERSATION_DETAIL,
  CONVERSATION_CREATABLE,
  CONVERSATION_UPDATABLE,
  CONVERSATION_FILTERABLE,
  CONVERSATION_SORTABLE,
} from "@/models/conversation/index.js";

/**
 * @constant conversationCrudConfig
 * @description 会话 CRUD 配置
 */
const conversationCrudConfig: CrudConfig<Conversation> = {
  listFields: [...CONVERSATION_LIST],
  detailFields: [...CONVERSATION_DETAIL],
  creatableFields: [...CONVERSATION_CREATABLE],
  updatableFields: [...CONVERSATION_UPDATABLE],
  searchFields: ["id"],
  filterableFields: [...CONVERSATION_FILTERABLE],
  defaultOrder: [[CONVERSATION_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(Conversation, conversationCrudConfig);

const ConversationService = {
  ...BaseService,
};

export default ConversationService;

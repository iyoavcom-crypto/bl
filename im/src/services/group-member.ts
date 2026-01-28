/**
 * @packageDocumentation
 * @module services/GroupMember
 * @tag [群成员服务] [CRUD服务] [群成员管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 群成员服务：使用 CRUD 服务处理群成员相关业务逻辑
 * @path src/services/group-member.ts
 * @see src/models/group-member/index.ts
 */

import { GroupMember } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  GROUP_MEMBER_LIST,
  GROUP_MEMBER_DETAIL,
  GROUP_MEMBER_CREATABLE,
  GROUP_MEMBER_UPDATABLE,
  GROUP_MEMBER_FILTERABLE,
  GROUP_MEMBER_SORTABLE,
} from "@/models/group-member/index.js";

/**
 * @constant groupMemberCrudConfig
 * @description 群成员 CRUD 配置
 */
const groupMemberCrudConfig: CrudConfig<GroupMember> = {
  listFields: [...GROUP_MEMBER_LIST],
  detailFields: [...GROUP_MEMBER_DETAIL],
  creatableFields: [...GROUP_MEMBER_CREATABLE],
  updatableFields: [...GROUP_MEMBER_UPDATABLE],
  searchFields: ["id", "nickname"],
  filterableFields: [...GROUP_MEMBER_FILTERABLE],
  defaultOrder: [[GROUP_MEMBER_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(GroupMember, groupMemberCrudConfig);

const GroupMemberService = {
  ...BaseService,
};

export default GroupMemberService;

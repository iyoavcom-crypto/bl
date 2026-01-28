/**
 * @packageDocumentation
 * @module services/User
 * @tag [用户服务] [CRUD服务] [用户管理]    
 * @since 1.0.0 (2025-01-14)
 * @author Z-kali
 * @description 用户服务：使用 CRUD 服务处理用户相关业务逻辑
 * @path src/services/user/index.ts
 * @see src/services/crud/index.ts
 * @see src/models/user.ts   
 */

import { Op } from "sequelize";
import { User } from '@/models/';
import { createCrudService } from '@/repo';
import type { CrudConfig } from '@/repo';
import {
  USER_LIST,
  USER_DETAIL,
  USER_CREATABLE,
  USER_UPDATABLE,
  USER_FILTERABLE,
  USER_SORTABLE,
} from "@/models/user/types/index.js";

/**
 * @constant userCrudConfig
 * @description 用户 CRUD 配置（映射为通用 CrudConfig）
 */ 
const userCrudConfig: CrudConfig<User> = {
  listFields: [...USER_LIST],
  detailFields: [...USER_DETAIL],
  creatableFields: [...USER_CREATABLE],
  updatableFields: [...USER_UPDATABLE],
  searchFields: ["id", "name", "phone"],
  filterableFields: [...USER_FILTERABLE],
  defaultOrder: [[USER_SORTABLE[0], "ASC"]],
};

const BaseService = createCrudService(User, userCrudConfig);

const UserService = {
  ...BaseService,
  /**
   * @function findByPhoneOrId
   * @description 根据 ID 或手机号精确查找用户
   * @param {string} identifier - ID 或手机号
   * @returns {Promise<User | null>} 用户对象
   */
  findByPhoneOrId: async (identifier: string): Promise<User | null> => {
    return User.findOne({
      where: {
        [Op.or]: [{ id: identifier }, { phone: identifier }],
      },
    });
  },
};

export default UserService;

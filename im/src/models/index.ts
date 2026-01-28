/**
 * @packageDocumentation
 * @module models
 * @since 1.0.0
 * @author Z-kali
 * @description
 * Sequelize 模型统一初始化与注册入口。
 *
 * - 负责集中初始化所有 SQL Model
 * - 定义模型关联关系
 * - 提供通用 Model / ModelStatic 类型
 * - 提供 modelRegistry 用于通用 CRUD、动态路由、权限配置等场景
 * - 封装数据库同步流程（支持 schema patch）
 *
 * 文件位置：src/models/index.ts
 */

import { sequelize } from "../config/index.js";
import type { Model, ModelStatic } from "sequelize";

// ==================== 基础模型 ====================
import { initRoleModel, Role } from "./role/index.js";
import { initUser, User } from "./user/user.js";
import { associateUser } from "./user/association.js";

// ==================== IM 模型 ====================
import { initDevice, Device, associateDevice } from "./device/index.js";
import { initFriend, Friend, associateFriend } from "./friend/index.js";
import { initFriendRequest, FriendRequest, associateFriendRequest } from "./friend-request/index.js";
import { initGroup, Group, associateGroup } from "./group/index.js";
import { initGroupMember, GroupMember, associateGroupMember } from "./group-member/index.js";
import { initConversation, Conversation, associateConversation } from "./conversation/index.js";
import { initMessage, Message, associateMessage } from "./message/index.js";
import { initMessageRead, MessageRead, associateMessageRead } from "./message-read/index.js";
import { initCall, Call, associateCall } from "./call/index.js";


// =======================
// Model Initialization
// =======================

/**
 * @description
 * 初始化所有 Sequelize Model（仅定义字段与表结构，不涉及关联）
 * ⚠️ 顺序需保证所有 Model 在建立关联前已注册到 sequelize
 */

// 基础模型（无外键依赖）
initRoleModel(sequelize);
initUser(sequelize);

// IM 模型（按依赖顺序初始化）
initDevice(sequelize);
initFriend(sequelize);
initFriendRequest(sequelize);
initGroup(sequelize);
initGroupMember(sequelize);
initConversation(sequelize);
initMessage(sequelize);
initMessageRead(sequelize);
initCall(sequelize);


// =======================
// Model Associations
// =======================

/**
 * @description
 * 定义模型之间的关联关系
 * - hasMany / belongsTo / belongsToMany 等
 * - 必须在所有 Model init 之后执行
 */

// 基础模型关联
associateUser();

// IM 模型关联
associateDevice();
associateFriend();
associateFriendRequest();
associateGroup();
associateGroupMember();
associateConversation();
associateMessage();
associateMessageRead();
associateCall();


// =======================
// Common Types
// =======================

/**
 * @type AnyModel
 * @description
 * 通用 Sequelize Model 实例类型（instance）
 * 用于泛型 CRUD、Hook、权限拦截等场景
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModel = Model<any, any>;

/**
 * @type AnyModelStatic
 * @description
 * 通用 Sequelize Model 静态类型（class）
 * 用于动态获取模型、通用 Service、Registry 映射
 */
export type AnyModelStatic = ModelStatic<AnyModel>;

// =======================
// Model Registry
// =======================
export const modelRegistry: Record<string, AnyModelStatic> = {
  Role,
  User,
  Device,
  Friend,
  FriendRequest,
  Group,
  GroupMember,
  Conversation,
  Message,
  MessageRead,
  Call,
};

// =======================
// Named Exports
// =======================

/**
 * @description
 * 显式导出各 Model，供业务层直接使用
 */
export {
  // 基础模型
  Role,
  User,
  // IM 模型
  Device,
  Friend,
  FriendRequest,
  Group,
  GroupMember,
  Conversation,
  Message,
  MessageRead,
  Call,
};

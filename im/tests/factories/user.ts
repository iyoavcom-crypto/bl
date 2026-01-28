/**
 * 测试数据工厂 - 用户
 */

import { nanoid } from "@/tools/jwt";

export interface UserDataOptions {
  id?: string;
  email?: string;
  password?: string;
  roleId?: string;
  vip?: boolean;
  teamId?: string | null;
}

/**
 * 创建用户测试数据
 */
export function createUserData(overrides: UserDataOptions = {}) {
  const timestamp = Date.now();
  return {
    id: overrides.id ?? nanoid(16),
    email: overrides.email ?? `test_${timestamp}@test.com`,
    password: overrides.password ?? "Test123!",
    roleId: overrides.roleId ?? "USER",
    vip: overrides.vip ?? false,
    teamId: overrides.teamId ?? null,
  };
}

/**
 * 创建管理员测试数据
 */
export function createAdminData(overrides: UserDataOptions = {}) {
  return createUserData({
    roleId: "ADMIN",
    vip: true,
    ...overrides,
  });
}

/**
 * 创建 JWT Payload 测试数据
 */
export function createJwtPayload(overrides: Partial<{
  sub: string;
  vip: boolean;
  roleId: string;
  teamId: string | null;
  tokenType: "access" | "refresh";
  scope: string[];
  deviceId: string;
}> = {}) {
  return {
    sub: overrides.sub ?? nanoid(16),
    vip: overrides.vip ?? false,
    roleId: overrides.roleId ?? "USER",
    teamId: overrides.teamId ?? null,
    tokenType: overrides.tokenType ?? "access" as const,
    scope: overrides.scope ?? ["read"],
    deviceId: overrides.deviceId,
  };
}

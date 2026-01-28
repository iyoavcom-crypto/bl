/**
 * @packageDocumentation
 * @module services/auth
 * @since 1.0.0
 * @author Z-Kali
 * @tags [服务],[认证],[JWT],[登录],[注册]
 * @description 认证服务：处理用户注册、登录、令牌签发等认证业务逻辑
 * @path src/services/auth.ts
 * @see src/models/user/index.ts
 * @see src/tools/jwt/index.ts
 */

import { User } from "@/models/user/user.js";
import { createJwtServiceFromEnv } from "@/tools/jwt/index.js";
import { verifyPassword } from "@/tools/crypto/password";
import type {
  RegisterRequest,
  LoginRequest,
  AuthSuccessData,
  SafeUser,
  AuthPayload,
} from "@/models/auth/index.js";
import type { JwtUserPayload } from "@/types/jwt/index.js";

// JWT 服务实例（单例）
let jwtService: ReturnType<typeof createJwtServiceFromEnv> | null = null;

/**
 * @function getJwtService
 * @description 获取 JWT 服务实例（单例模式）
 * @returns {JwtService} JWT 服务实例
 */
function getJwtService() {
  if (!jwtService) {
    jwtService = createJwtServiceFromEnv();
  }
  return jwtService;
}

/**
 * @function issueTokens
 * @description 为用户签发访问令牌和刷新令牌
 * @param {User} user - 用户实例
 * @returns {Promise<AuthSuccessData>} 认证成功数据（用户信息 + 令牌）
 */
async function issueTokens(user: User): Promise<AuthSuccessData> {
  const jwt = getJwtService();

  // 构建 JWT 载荷
  const payload: JwtUserPayload = {
    sub: user.id,
    vip: user.vip,
    roleId: user.roleId,
    teamId: user.teamId || null,
    teamRoleId: null,
    tokenType: "access", // 临时值，签发时会被覆盖
  };

  // 签发 access 和 refresh 令牌
  const access = await jwt.signAsync("access", payload);
  const refresh = await jwt.signAsync("refresh", payload);

  // 构建 AuthPayload（移除 tokenType）
  const authPayload: AuthPayload = {
    sub: payload.sub,
    vip: payload.vip,
    roleId: payload.roleId,
    teamId: payload.teamId,
    teamRoleId: payload.teamRoleId,
  };

  // 构建安全用户信息
  const safeUser: SafeUser = user.toJSON() as SafeUser;

  return {
    user: safeUser,
    access,
    refresh,
    payload: authPayload,
  };
}

/**
 * @class AuthService
 * @description 认证服务类，提供注册、登录、获取用户信息等方法
 */
class AuthService {
  /**
   * @function register
   * @description 用户注册
   * @param {RegisterRequest} data - 注册数据
   * @returns {Promise<AuthSuccessData>} 认证成功数据
   * @throws {Error} 手机号已存在等错误
   */
  async register(data: RegisterRequest): Promise<AuthSuccessData> {
    const { phone, password, pin, name } = data;

    // 检查手机号是否已存在
    const existingUser = await User.findOne({
      where: { phone },
    });

    if (existingUser) {
      const error = new Error("该手机号已被注册") as Error & { status?: number };
      error.status = 409;
      throw error;
    }

    // 创建用户
    const user = await User.create({
      phone,
      password, // beforeSave hook 会自动加密
      pin,
      name,
    });

    // 签发令牌
    return await issueTokens(user);
  }

  /**
   * @function login
   * @description 用户登录
   * @param {LoginRequest} data - 登录数据
   * @returns {Promise<AuthSuccessData>} 认证成功数据
   * @throws {Error} 用户不存在或密码错误
   */
  async login(data: LoginRequest): Promise<AuthSuccessData> {
    const { phone, password } = data;

    // 查询用户（包含密码字段）
    const user = await User.scope("withSecret").findOne({
      where: { phone },
    });

    if (!user) {
      const error = new Error("用户不存在或密码错误") as Error & { status?: number };
      error.status = 401;
      throw error;
    }

    // 验证密码
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      const error = new Error("用户不存在或密码错误") as Error & { status?: number };
      error.status = 401;
      throw error;
    }

    // 重新获取安全用户（排除密码）
    const safeUser = await User.findByPk(user.id);
    if (!safeUser) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 签发令牌
    return await issueTokens(safeUser);
  }

  /**
   * @function getCurrentUser
   * @description 根据用户 ID 获取当前用户信息
   * @param {string} userId - 用户 ID
   * @returns {Promise<SafeUser>} 安全用户信息
   * @throws {Error} 用户不存在
   */
  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await User.findByPk(userId);

    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    return user.toJSON() as SafeUser;
  }

  /**
   * @function logout
   * @description 用户退出（当前为无状态实现）
   * @returns {Promise<void>}
   * @remarks 当前实现为无状态 JWT，无需服务端注销操作。
   * 如果后续启用 Redis 黑名单，可在此处添加令牌注销逻辑。
   */
  async logout(): Promise<void> {
    // 无状态 JWT 实现，客户端删除令牌即可
    // 如需黑名单功能，在此添加 Redis 操作
    return;
  }

  /**
   * @function refresh
   * @description 刷新令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<AuthSuccessData>} 新的认证数据
   * @throws {Error} 令牌无效或用户不存在
   */
  async refresh(refreshToken: string): Promise<AuthSuccessData> {
    const jwt = getJwtService();

    // 使用 JWT 服务轮转刷新令牌
    const { access, refresh, payload } = await jwt.rotateRefreshAsync(refreshToken);

    // 获取用户信息
    const user = await User.findByPk(payload.sub);
    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 构建 AuthPayload
    const authPayload: AuthPayload = {
      sub: payload.sub,
      vip: payload.vip,
      roleId: payload.roleId,
      teamId: payload.teamId,
      teamRoleId: payload.teamRoleId,
    };

    // 构建安全用户信息
    const safeUser: SafeUser = user.toJSON() as SafeUser;

    return {
      user: safeUser,
      access,
      refresh,
      payload: authPayload,
    };
  }
}

export default new AuthService();

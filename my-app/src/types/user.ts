// 性别
export type Gender = 'male' | 'female' | 'unknown';

// 用户状态
export type UserState = 'normal' | 'muted' | 'banned' | 'canceled' | 'risk_controlled';

// 用户位置信息
export interface UserLocation {
  country: string | null;
  province: string | null;
  city: string | null;
}

// 用户完整信息
export interface User {
  id: string;
  phone: string;
  code?: string;
  name: string;
  avatar: string | null;
  gender: Gender;
  vip: boolean;
  state: UserState;
  searchable: boolean;
  location: UserLocation | null;
  lastOnlineAt: string | null;
  createdAt: string;
}

// 用户公开信息
export interface UserPublic {
  id: string;
  code?: string;
  name: string;
  avatar: string | null;
  gender: Gender;
}

// 用户搜索结果
export interface UserSearchResult {
  id: string;
  code?: string;
  name: string;
  avatar: string | null;
  gender: Gender;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

// 认证载荷
export interface AuthPayload {
  sub: string;
  vip: boolean;
  roleId: string;
  teamId: string | null;
  teamRoleId: string | null;
}

// 登录响应
export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  payload: AuthPayload;
}

// 注册请求
export interface RegisterRequest {
  phone: string;
  password: string;
  pin: string;
  name?: string;
}

// 登录请求
export interface LoginRequest {
  phone: string;
  password: string;
}

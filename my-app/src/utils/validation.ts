/**
 * 手机号验证
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 密码验证 (6-20位)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 20;
}

/**
 * 昵称验证 (2-20位)
 */
export function isValidNickname(nickname: string): boolean {
  const trimmed = nickname.trim();
  return trimmed.length >= 2 && trimmed.length <= 20;
}

/**
 * PIN 码验证 (6位数字)
 */
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * 登录表单验证
 */
export function validateLoginForm(phone: string, password: string): ValidationResult {
  if (!phone) {
    return { valid: false, message: '请输入手机号' };
  }
  if (!isValidPhone(phone)) {
    return { valid: false, message: '请输入正确的手机号' };
  }
  if (!password) {
    return { valid: false, message: '请输入密码' };
  }
  if (!isValidPassword(password)) {
    return { valid: false, message: '密码长度为6-20位' };
  }
  return { valid: true };
}

/**
 * 注册表单验证
 */
export function validateRegisterForm(
  phone: string,
  password: string,
  pin: string
): ValidationResult {
  if (!phone) {
    return { valid: false, message: '请输入手机号' };
  }
  if (!isValidPhone(phone)) {
    return { valid: false, message: '请输入正确的手机号' };
  }
  if (!password) {
    return { valid: false, message: '请输入密码' };
  }
  if (!isValidPassword(password)) {
    return { valid: false, message: '密码长度为6-20位' };
  }
  if (!pin) {
    return { valid: false, message: '请输入二级密码' };
  }
  if (!isValidPin(pin)) {
    return { valid: false, message: '二级密码必须为6位数字' };
  }
  return { valid: true };
}

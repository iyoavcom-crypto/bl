/**
 * @function maskPhone
 * @description 手机号脱敏处理（保留前三位和后四位）
 * @param {string} phone - 原始手机号
 * @returns {string} 脱敏后的手机号
 */
export function maskPhone(phone: string): string {
  if (!phone) return phone;

  const s = String(phone);
  if (s.length < 7) return s;

  return `${s.slice(0, 3)}****${s.slice(-4)}`;
}

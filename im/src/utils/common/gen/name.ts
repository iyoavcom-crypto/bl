/**
 * @function genUserName
 * @description 随机生成“包聊用户:{10位纯数字}”格式的用户名（仅保证长度与字符集）
 * @returns {string} 包聊用户:XXXXXXXXXX
 * @example
 * const name = genUserName();
 * // 包聊用户:3265496780
 */
export function genUserName(): string {
  // 使用加密级随机数
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);

  let digits = "";
  for (let i = 0; i < bytes.length; i++) {
    digits += (bytes[i] % 10).toString();
  }

  return `包聊用户:${digits}`;
}

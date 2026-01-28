const MAX_EMAIL_LENGTH = 254; // RFC 常用限制
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 253;

/**
 * @function normalizeAndValidateEmail
 * @description 规范化邮箱并进行扩展格式验证（长度、局部部分与域名规则）
 * @param {string} email - 输入邮箱字符串
 * @returns {string | null} 返回规范化邮箱；无效时返回 null
 */
export function normalizeAndValidateEmail(email: string): string | null {
  if (typeof email !== "string") return null;

  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > MAX_EMAIL_LENGTH) {
    return null;
  }

  const atIndex = normalized.indexOf("@");
  // 必须且只能有一个 @，且不能在首尾
  if (
    atIndex <= 0 ||
    atIndex === normalized.length - 1 ||
    normalized.indexOf("@", atIndex + 1) !== -1
  ) {
    return null;
  }

  const localPart = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (!isValidLocalPart(localPart)) return null;
  if (!isValidDomain(domain)) return null;

  return normalized;
}

/**
 * @function isValidLocalPart
 * @description 校验邮箱本地部分（@ 之前）
 * @param {string} localPart - 本地部分
 * @returns {boolean} 是否有效
 */
export function isValidLocalPart(localPart: string): boolean {
  if (
    localPart.length === 0 ||
    localPart.length > MAX_LOCAL_PART_LENGTH
  ) {
    return false;
  }

  // 允许字符集：字母、数字以及常见符号（不包含空格）
  const localRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;

  if (!localRegex.test(localPart)) return false;

  // 不允许首尾为 .
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return false;
  }

  // 不允许连续 ..
  if (localPart.includes("..")) {
    return false;
  }

  return true;
}

/**
 * @function isValidDomain
 * @description 校验邮箱域名部分（@ 之后），仅支持 ASCII 域名
 * @param {string} domain - 域名部分
 * @returns {boolean} 是否有效
 */
export function isValidDomain(domain: string): boolean {
  if (
    domain.length === 0 ||
    domain.length > MAX_DOMAIN_LENGTH
  ) {
    return false;
  }

  // 必须包含至少一个点，形成多级域名，如 example.com
  const labels = domain.split(".");
  if (labels.length < 2) return false;

  for (const label of labels) {
    // label 长度限制
    if (label.length === 0 || label.length > 63) {
      return false;
    }

    // 允许字符：字母、数字、连字符
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return false;
    }

    // 不允许首尾为连字符 -
    if (label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
  }

  // 顶级域名规则：至少 2 位字母
  const tld = labels[labels.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return false;
  }

  return true;
}

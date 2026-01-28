/**
 * @packageDocumentation
 * @module utils/common/ip
 * @description Origin/Host 判定：是否本机或局域网
 */

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  return false;
}

/**
 * @function isLocalNetwork
 * @description 判断给定 Origin 是否为本机或局域网来源
 * @param {string} origin - 请求 Origin，形如 http(s)://host[:port]
 * @returns {boolean} 是否允许
 */
export function isLocalNetwork(origin: string): boolean {
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
    if (isPrivateIPv4(host)) return true;
    return false;
  } catch {
    return false;
  }
}

export default isLocalNetwork;


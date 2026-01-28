/**
 * @function buildFiltersFromString
 * @description 从字符串构建查询过滤器
 * @param {string} filter 过滤器字符串，格式为 "key[op]=value,key[op]=value"
 * @param {Record<string, unknown>} source 原始查询参数对象
 * @returns {Record<string, unknown>} 返回构建的查询过滤器对象
 */
export function buildFiltersFromString(filter: string, source: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const bracketRe = /^([^\[]+)\[([a-zA-Z]+)\]$/;
  const dotRe = /^([^\.]+)\.([a-zA-Z]+)$/;

  const parseList = (s: string): string[] => s.split(',').map((x) => x.trim()).filter(Boolean);

  const normalizeValue = (op: string, v: unknown): unknown => {
    if (v == null) return undefined;
    if (op === 'in' || op === 'notIn') {
      if (typeof v === 'string') return parseList(v);
      if (Array.isArray(v)) return v.filter((x) => x != null);
      return [v];
    }
    return v;
  };

  const deriveKeysFromSource = (): string[] => {
    const set = new Set<string>();
    for (const k of Object.keys(source)) {
      const m1 = k.match(bracketRe);
      const m2 = k.match(dotRe);
      if (m1) set.add(m1[1]);
      else if (m2) set.add(m2[1]);
      else set.add(k);
    }
    return Array.from(set);
  };

  const keys = typeof filter === 'string' && filter.trim()
    ? filter.split(',').map((k) => k.trim()).filter(Boolean)
    : deriveKeysFromSource();

  for (const key of keys) {
    const direct = source[key as keyof typeof source];
    if (direct !== undefined && direct !== null) {
      if (typeof direct === 'string') {
        const parts = parseList(direct);
        out[key] = parts.length > 1 ? parts : parts[0];
      } else if (Array.isArray(direct)) {
        out[key] = direct.filter((x) => x != null);
      } else if (typeof direct === 'object') {
        out[key] = direct as unknown;
      } else {
        out[key] = direct as unknown;
      }
    }

    const nestedOps: Record<string, unknown> = {};
    for (const [sk, sv] of Object.entries(source)) {
      const m1 = sk.match(bracketRe);
      const m2 = sk.match(dotRe);
      if (m1 && m1[1] === key) {
        const op = m1[2];
        const nv = normalizeValue(op, sv);
        if (nv !== undefined) nestedOps[op] = nv;
      } else if (m2 && m2[1] === key) {
        const op = m2[2];
        const nv = normalizeValue(op, sv);
        if (nv !== undefined) nestedOps[op] = nv;
      }
    }
    if (Object.keys(nestedOps).length) {
      out[key] = { ...(out[key] as Record<string, unknown> | undefined), ...nestedOps } as unknown;
    }
  }

  return out;
}
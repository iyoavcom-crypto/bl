export type OrderTuple = readonly [string, "ASC" | "DESC"];

function normalizeDirection(input: unknown): "ASC" | "DESC" {
  const s = String(input).toUpperCase();
  return s === "DESC" ? "DESC" : "ASC";
}

export function normalizeOrder(order: string | OrderTuple[]): OrderTuple[] {
  if (typeof order === "string") {
    const tokens = order.split(",").map((t) => t.trim()).filter(Boolean);
    const out: OrderTuple[] = [];
    for (const token of tokens) {
      let field = token;
      let dir: "ASC" | "DESC" = "ASC";

      if (token.includes(":")) {
        const [f, d] = token.split(":").map((x) => x.trim());
        field = f;
        dir = normalizeDirection(d);
      } else if (token.includes(" ")) {
        const [f, d] = token.split(/\s+/).map((x) => x.trim());
        field = f;
        dir = d ? normalizeDirection(d) : "ASC";
      } else if (token.startsWith("-")) {
        field = token.slice(1);
        dir = "DESC";
      } else if (token.startsWith("+")) {
        field = token.slice(1);
        dir = "ASC";
      }

      if (field) out.push([field, dir]);
    }
    return out;
  }

  if (Array.isArray(order)) {
    const out: OrderTuple[] = [];
    for (const item of order as unknown as unknown[]) {
      if (Array.isArray(item)) {
        const [field, direction] = item as unknown[];
        if (typeof field === "string") {
          out.push([field, normalizeDirection(direction)]);
        }
      } else if (typeof item === "string") {
        out.push([item, "ASC"]);
      }
    }
    return out;
  }

  return [];
}
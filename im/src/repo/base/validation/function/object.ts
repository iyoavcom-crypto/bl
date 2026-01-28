export function isNonEmptyPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length > 0;
}
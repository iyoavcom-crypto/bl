import { randomInt } from "node:crypto";

export function genUserId(): string {
  return String(randomInt(1_000_000, 10_000_000));
}

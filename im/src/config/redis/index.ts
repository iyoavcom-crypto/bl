// src/im/redis.ts
import Redis from "ioredis";
import { env } from "../env";

export const redis: Redis | null = env.REDIS_ENABLED
  ? new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    })
  : null;

if (redis) {
  redis.on("connect", () => {});

  redis.on("error", (e: unknown) => {
    const msg = (e as any)?.message ?? String(e);
    console.log("❌ [Redis] 连接错误:", msg);
  });
}

/**
 * @function initRedisAsync
 * @description 初始化 Redis 连接并检查连通性
 * @returns {Promise<void>}
 */
export async function initRedisAsync(): Promise<void> {
  if (!redis) return;
  try {
    await redis.ping();
  } catch (error) {
    throw new Error(`Redis connection failed: ${(error as Error).message}`);
  }
}


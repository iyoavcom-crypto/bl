/**
 * @packageDocumentation
 * @module config
 * @description 配置模块统一出口
 */

export { env } from "./env/index.js";
export type { EnvConfig } from "./env/index.js";

export {
  checkAndGenerateSecrets,
  checkSecrets,
  ensureSecrets,
} from "./env/check.js";
export type { EnvCheckResult, SecretCheckResult } from "./env/check.js";

export {
  generateAllSecrets,
  generateJwtSecret,
  generatePinSecret,
  generatePasswordPepper,
  generateSecureSecret,
} from "./env/generate-secrets.js";
export type { GeneratedSecrets } from "./env/generate-secrets.js";

export {
  sequelizeConfig,
  sequelize,
  getSQLiteRuntimeStats,
  inspectSQLiteRuntime,
  logSQLiteFileUsage,
  initDatabase,
} from "./db/sqlite/index.js";
export type {
  InitDatabaseOptions,
  SQLitePoolConfig,
  SQLiteSequelizeConfig,
  SQLiteRuntimeStats,
  SQLiteFileUsage,
  SQLiteWalUsageSummary,
} from "./db/sqlite/index.js";

export { redis, initRedisAsync } from "./redis/index.js";

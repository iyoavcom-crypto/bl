/**
 * @packageDocumentation
 * @module config/database
 * @since 1.2.4 (2025-11-22)
 * @author Z-kali
 * @description
 * Sequelize + SQLite 优化配置
 * - WAL 模式 + mmap + cache + 连接池约束
 * - 运行时状态与文件占用检查
 * - PRAGMA 输出字段中文化日志
 */

import { Sequelize } from 'sequelize';
import { stat } from 'node:fs/promises';

/**
 * @interface InitDatabaseOptions
 * @description 数据库初始化选项
 * @property {boolean} sync - 是否执行 schema 同步（sequelize.sync）
 * @property {boolean} [force] - 是否强制重建表（危险操作，仅开发/测试使用）
 * @property {boolean} [alter] - 是否尝试非破坏性变更表结构
 */
export interface InitDatabaseOptions {
  sync: boolean;
  force?: boolean;
  alter?: boolean;
}

/**
 * @interface SQLitePoolConfig
 * @description SQLite 连接池配置
 * @property {number} max - 最大连接数
 * @property {number} min - 最小连接数
 * @property {number} idle - 空闲连接最大存活时间（毫秒）
 * @property {number} acquire - 获取连接最大等待时间（毫秒）
 */
export interface SQLitePoolConfig {
  max: number;
  min: number;
  idle: number;
  acquire: number;
}

/**
 * @interface SQLiteSequelizeConfig
 * @description SQLite Sequelize 配置快照（只保留需要对外使用的字段）
 * @property {string} storage - SQLite 数据文件路径
 * @property {SQLitePoolConfig} pool - 连接池配置
 */
export interface SQLiteSequelizeConfig {
  storage: string;
  pool: SQLitePoolConfig;
}

/**
 * @interface SQLiteRuntimeStats
 * @description SQLite 运行时统计信息快照（通过 PRAGMA 查询）
 * @property {Record<string, unknown>} cacheSize - PRAGMA cache_size 返回值
 * @property {Record<string, unknown>} pageSize - PRAGMA page_size 返回值
 * @property {Record<string, unknown>} pageCount - PRAGMA page_count 返回值
 * @property {Record<string, unknown>} freelistCount - PRAGMA freelist_count 返回值
 * @property {Record<string, unknown>} mmapSize - PRAGMA mmap_size 返回值
 * @property {Record<string, unknown>} walCheckpoint - PRAGMA wal_checkpoint(PASSIVE) 返回值
 * @property {Record<string, unknown>} busyTimeout - PRAGMA busy_timeout 返回值
 * @property {Record<string, unknown>} memoryUsed - PRAGMA memory_used 返回值（部分环境可能为空对象）
 * @property {Record<string, unknown>[]} stats - PRAGMA stats 返回的详细统计（如不支持则为空数组）
 */
export interface SQLiteRuntimeStats {
  cacheSize: Record<string, unknown>;
  pageSize: Record<string, unknown>;
  pageCount: Record<string, unknown>;
  freelistCount: Record<string, unknown>;
  mmapSize: Record<string, unknown>;
  walCheckpoint: Record<string, unknown>;
  busyTimeout: Record<string, unknown>;
  memoryUsed: Record<string, unknown>;
  stats: Record<string, unknown>[];
}

/**
 * @interface SQLiteFileUsage
 * @description SQLite 文件占用情况（物理大小快照）
 * @property {number} dbBytes - 主库文件大小（字节）
 * @property {number} walBytes - WAL 文件大小（字节，如不存在则为 0）
 */
export interface SQLiteFileUsage {
  dbBytes: number;
  walBytes: number;
}

/**
 * @interface SQLiteWalUsageSummary
 * @description WAL 未 checkpoint 数据量估算
 * @property {number} pendingFrames - WAL 中未 checkpoint 的页数
 * @property {number} pendingBytes - WAL 中未 checkpoint 的估算字节数（pendingFrames * page_size）
 */
export interface SQLiteWalUsageSummary {
  pendingFrames: number;
  pendingBytes: number;
}

/**
 * @constant sequelizeConfig
 * @description SQLite 连接配置快照（避免访问 sequelize.options，便于在日志中复用）
 */
export const sequelizeConfig: SQLiteSequelizeConfig = {
  storage: './data/database.sqlite',
  pool: {
    max: 5,
    min: 1,
    idle: 10_000,
    acquire: 30_000,
  },
};

/**
 * @constant sequelize
 * @description 全局 Sequelize 实例（SQLite 单文件数据库）
 */
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sequelizeConfig.storage,
  logging: false,
  pool: sequelizeConfig.pool,
  retry: {
    max: 3,
  },
});

/**
 * @function applySQLitePragmas
 * @description 为当前 SQLite 连接应用性能相关 PRAGMA 设置
 * @param {Sequelize} db - Sequelize 实例
 * @returns {Promise<void>} 空 Promise
 */
async function applySQLitePragmas(db: Sequelize): Promise<void> {
  const pragmas: string[] = [
    'PRAGMA journal_mode = WAL;', // 写前日志（支持高并发读 + 崩溃恢复较好）
    'PRAGMA synchronous = NORMAL;', // 减少 fsync 次数，在安全性与性能之间取平衡
    'PRAGMA temp_store = MEMORY;', // 临时表走内存，减少磁盘 I/O
    'PRAGMA foreign_keys = ON;', // 启用外键约束
    'PRAGMA cache_size = -64000;', // 约 64MB page cache（负数表示 KB 单位）
    'PRAGMA mmap_size = 134217728;', // 128MB mmap，提高文件读取性能
    'PRAGMA wal_autocheckpoint = 1000;', // 每 1000 页自动 checkpoint，控制 WAL 大小
    'PRAGMA busy_timeout = 4000;', // 锁冲突时最多等待 4 秒
    'PRAGMA journal_size_limit = 67108864;', // WAL 文件限制约 64MB，避免无限膨胀
  ];

  for (const sql of pragmas) {
    // 顺序执行，保证模式与参数按设定顺序生效
    // eslint-disable-next-line no-await-in-loop
    await db.query(sql);
  }
}

/**
 * @function getSQLiteRuntimeStats
 * @description 查询 SQLite 运行时状态（缓存、WAL、内存等）并返回结构化数据
 * @param {Sequelize} db - Sequelize 实例
 * @returns {Promise<SQLiteRuntimeStats>} 运行时统计信息快照
 */
export async function getSQLiteRuntimeStats(db: Sequelize): Promise<SQLiteRuntimeStats> {
  const execOne = async (sql: string): Promise<Record<string, unknown>> => {
    const [rows] = await db.query(sql);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as Record<string, unknown>;
    }
    return {} as Record<string, unknown>;
  };

  const execAll = async (sql: string): Promise<Record<string, unknown>[]> => {
    const [rows] = await db.query(sql);
    if (Array.isArray(rows)) {
      return rows as Record<string, unknown>[];
    }
    return [];
  };

  const cacheSize = await execOne('PRAGMA cache_size;');
  const pageSize = await execOne('PRAGMA page_size;');
  const pageCount = await execOne('PRAGMA page_count;');
  const freelistCount = await execOne('PRAGMA freelist_count;');

  const mmapSize = await execOne('PRAGMA mmap_size;');
  const walCheckpoint = await execOne('PRAGMA wal_checkpoint(PASSIVE);');
  const busyTimeout = await execOne('PRAGMA busy_timeout;');
  const memoryUsed = await execOne('PRAGMA memory_used;');

  let stats: Record<string, unknown>[] = [];
  try {
    stats = await execAll('PRAGMA stats;');
  } catch {
    stats = [];
  }

  return {
    cacheSize,
    pageSize,
    pageCount,
    freelistCount,
    mmapSize,
    walCheckpoint,
    busyTimeout,
    memoryUsed,
    stats,
  };
}

/**
 * @function translatePragmaRowToChinese
 * @description 将 PRAGMA 返回的英文字段映射为中文字段名，方便日志阅读
 * @param {Record<string, unknown>} row - 单行 PRAGMA 返回对象
 * @returns {Record<string, unknown>} 字段中文化后的对象
 */
function translatePragmaRowToChinese(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(row)) {
    switch (key) {
      case 'cache_size':
        result['缓存页配置（cache_size）'] = val;
        break;
      case 'page_size':
        result['页面大小（page_size）'] = val;
        break;
      case 'page_count':
        result['数据库页面总数（page_count）'] = val;
        break;
      case 'freelist_count':
        result['空闲页数量（freelist_count）'] = val;
        break;
      case 'mmap_size':
        result['内存映射上限（mmap_size）'] = val;
        break;
      case 'busy_timeout':
      case 'timeout':
        result['锁等待超时（busy_timeout）'] = val;
        break;
      case 'log':
      case 'log_frames':
        result['WAL 日志总页数（log_frames）'] = val;
        break;
      case 'checkpointed':
      case 'checkpointed_frames':
        result['WAL 已合并页数（checkpointed）'] = val;
        break;
      case 'busy':
        result['WAL 锁状态（busy）'] = val;
        break;
      default:
        result[`其它字段（${key}）`] = val;
        break;
    }
  }

  return result;
}

/**
 * @function inspectSQLiteRuntime
 * @description 打印 SQLite 当前运行时统计信息（字段名中文化，仅建议在开发/调试环境使用）
 * @param {Sequelize} db - Sequelize 实例
 * @returns {Promise<void>} 空 Promise
 */
export async function inspectSQLiteRuntime(db: Sequelize): Promise<void> {
  const stats = await getSQLiteRuntimeStats(db);

  console.log('=== [数据库] SQLite 运行时状态 ===');

  console.log('缓存配置:', translatePragmaRowToChinese(stats.cacheSize));
  console.log('页面大小:', translatePragmaRowToChinese(stats.pageSize));
  console.log('数据库页数:', translatePragmaRowToChinese(stats.pageCount));
  console.log('空闲页数量:', translatePragmaRowToChinese(stats.freelistCount));
  console.log('内存映射大小:', translatePragmaRowToChinese(stats.mmapSize));
  console.log('WAL 检查点状态:', translatePragmaRowToChinese(stats.walCheckpoint));
  console.log('锁等待超时:', translatePragmaRowToChinese(stats.busyTimeout));
  console.log('SQLite 内部内存占用:', translatePragmaRowToChinese(stats.memoryUsed));

  if (stats.stats.length > 0) {
    const translatedStats = stats.stats.map((row) => translatePragmaRowToChinese(row));
    console.log('详细运行统计（PRAGMA stats）:', translatedStats);
  }

  console.log('=================================');
}

/**
 * @function getSQLiteFileUsage
 * @description 读取 SQLite 主库文件和 WAL 文件的实际大小（字节）
 * @returns {Promise<SQLiteFileUsage>} 文件大小信息快照
 */
export async function getSQLiteFileUsage(): Promise<SQLiteFileUsage> {
  const dbPath = sequelizeConfig.storage;
  const walPath = `${sequelizeConfig.storage}-wal`;

  const [dbStatResult, walStatResult] = await Promise.allSettled([
    stat(dbPath),
    stat(walPath),
  ]);

  const dbBytes =
    dbStatResult.status === 'fulfilled'
      ? dbStatResult.value.size
      : 0;

  const walBytes =
    walStatResult.status === 'fulfilled'
      ? walStatResult.value.size
      : 0;

  return { dbBytes, walBytes };
}

/**
 * @function logSQLiteFileUsage
 * @description 打印 SQLite 主数据库文件与 WAL 文件大小（中文日志）
 * @returns {Promise<void>} 空 Promise
 */
export async function logSQLiteFileUsage(): Promise<void> {
  const { dbBytes, walBytes } = await getSQLiteFileUsage();

  const toMiB = (bytes: number): string =>
    (bytes / (1024 * 1024)).toFixed(2);

  console.log(
    '[数据库文件占用]',
    `主库：${dbBytes} 字节（${toMiB(dbBytes)} MiB）`,
    `WAL：${walBytes} 字节（${toMiB(walBytes)} MiB）`,
  );
}

/**
 * @function summarizeWalUsage
 * @description 结合 PRAGMA wal_checkpoint 与 page_size，估算 WAL 中未 checkpoint 数据量
 * @param {SQLiteRuntimeStats} stats - 运行时统计信息
 * @returns {SQLiteWalUsageSummary} WAL 未 checkpoint 页数与字节数估算
 */
export function summarizeWalUsage(stats: SQLiteRuntimeStats): SQLiteWalUsageSummary {
  const wal = stats.walCheckpoint;
  const pageSizeObj = stats.pageSize;

  const log = Number(
    (wal.log as number | undefined) ??
    (wal.log_frames as number | undefined) ??
    0,
  );
  const checkpointed = Number(
    (wal.checkpointed as number | undefined) ??
    (wal.checkpointed_frames as number | undefined) ??
    0,
  );
  const pageSize = Number(
    (pageSizeObj.page_size as number | undefined) ?? 0,
  );

  const pendingFrames = Math.max(log - checkpointed, 0);
  const pendingBytes = pendingFrames * pageSize;

  return { pendingFrames, pendingBytes };
}

/**
 * @function initDatabase
 * @description 初始化数据库连接并应用 SQLite 性能优化配置，可选执行 schema 同步，并在开发环境打印运行时状态与文件占用（中文日志）
 * @param {InitDatabaseOptions} options - 初始化配置
 * @returns {Promise<void>} 空 Promise
 */
export async function initDatabase(options: InitDatabaseOptions): Promise<void> {
  try {
    // 1. 建立连接
    await sequelize.authenticate();

    // 2. 应用 SQLite PRAGMA 性能调优
    await applySQLitePragmas(sequelize);

    // 3. 可选：执行模型同步（生产环境建议使用迁移而非 sync）
    if (options.sync) {
      await sequelize.sync({
        force: options.force ?? false,
        alter: options.alter ?? false,
        logging: false,
      });
    }

    // 4. 输出初始化完成日志（中文描述，使用本地配置快照而非 sequelize.options）
    console.log(
      [
        '[数据库初始化完成]',
        '日志模式=WAL',
        '同步模式=NORMAL',
        '内存映射=128MB',
        '缓存上限≈64MB',
        '自动检查点=1000页',
        '锁等待=4000毫秒',
        'WAL 文件上限≈64MB',
        `连接池最大连接数=${sequelizeConfig.pool.max}`,
      ].join(' '),
    );

    // 5. 开发环境下打印运行时状态与文件占用，生产环境默认关闭
    if (process.env.NODE_ENV !== 'production') {
      await inspectSQLiteRuntime(sequelize);
      await logSQLiteFileUsage();
    }
  } catch (err) {
    console.error('[数据库] 初始化失败:', err);
    process.exit(1);
  }
}

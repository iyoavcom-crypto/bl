/**
 * @packageDocumentation
 * @module base-hooks
 * @since 1.0.0
 * @author Z-Kali
 * @tags [hooks],[crud],[transaction],[validation]
 * @description 定义 CRUD 钩子函数类型（创建/更新/事务）
 * @path src/repo/base/types/hooks.ts
 * @see src/repo/base/crud/create.ts
 */

import type { Transaction } from "sequelize";

/**
 * @type BeforeCreateHook
 * @description 创建前置处理钩子；用于对创建载荷进行转换、补全或预处理
 * @template T 泛型实体类型
 * @param {Partial<T>} payload - 创建时的部分实体数据
 * @returns {Partial<T> | Promise<Partial<T>>} 处理后的载荷
 */
export type BeforeCreateHook<T = Record<string, unknown>> = (
  payload: Partial<T>
) => Partial<T> | Promise<Partial<T>>;

/**
 * @type BeforeUpdateHook
 * @description 更新前置处理钩子；用于对更新补丁数据进行转换、校正或预处理
 * @template T 泛型实体类型
 * @param {Partial<T>} patch - 更新补丁数据
 * @param {string} id - 待更新实体ID
 * @returns {Partial<T> | Promise<Partial<T>>} 处理后的补丁
 */
export type BeforeUpdateHook<T = Record<string, unknown>> = (
  patch: Partial<T>,
  id: string
) => Partial<T> | Promise<Partial<T>>;

/**
 * @type ValidateCreateHook
 * @description 创建校验钩子；用于对创建载荷进行业务校验，抛出异常表示校验失败
 * @template T 泛型实体类型
 * @param {Partial<T>} payload - 创建载荷
 * @returns {void | Promise<void>} 校验无返回值，仅用于抛错
 */
export type ValidateCreateHook<T = Record<string, unknown>> = (
  payload: Partial<T>
) => void | Promise<void>;

/**
 * @type ValidateUpdateHook
 * @description 更新校验钩子；用于对更新补丁进行业务校验，抛出异常表示校验失败
 * @template T 泛型实体类型
 * @param {Partial<T>} patch - 更新补丁数据
 * @param {string} id - 待更新实体ID
 * @returns {void | Promise<void>} 校验无返回值，仅用于抛错
 */
export type ValidateUpdateHook<T = Record<string, unknown>> = (
  patch: Partial<T>,
  id: string
) => void | Promise<void>;

/**
 * @type BeforeTransactionHook
 * @description 事务开始前钩子
 * @template T 泛型实体类型
 * @param {Transaction} transaction - Sequelize 事务对象
 * @returns {void | Promise<void>} 无返回值
 */
export type BeforeTransactionHook<T = Record<string, unknown>> = (
  transaction: Transaction
) => void | Promise<void>;

/**
 * @type AfterTransactionHook
 * @description 事务提交后钩子
 * @template T 泛型实体类型
 * @param {T} result - 操作结果
 * @param {Transaction} transaction - Sequelize 事务对象
 * @returns {void | Promise<void>} 无返回值
 */
export type AfterTransactionHook<T = Record<string, unknown>> = (
  result: T,
  transaction: Transaction
) => void | Promise<void>;

/**
 * @type OnTransactionErrorHook
 * @description 事务错误钩子
 * @template T 泛型实体类型
 * @param {Error} error - 错误对象
 * @param {Transaction} transaction - Sequelize 事务对象
 * @returns {void | Promise<void>} 无返回值
 */
export type OnTransactionErrorHook<T = Record<string, unknown>> = (
  error: Error,
  transaction: Transaction
) => void | Promise<void>;

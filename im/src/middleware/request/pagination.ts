/**
 * @packageDocumentation
 * @module middleware/request/pagination
 * @since 1.0.0
 * @author Z-Kali
 * @tags [pagination],[dto],[utils],[typescript]
 * @description 通用分页 DTO 与工具函数：标准化参数、转换 limit/offset、计算页数
 * @path src/middleware/request/pagination.ts
 * @see src/middleware/request/index.ts
 */

/**
 * @interface PaginationQueryDto
 * @description 分页查询参数
 * @property {number | undefined} page - 当前页码，从 1 开始，默认 1
 * @property {number | undefined} pageSize - 每页数量，默认 20
 */
export interface PaginationQueryDto {
  page?: number;
  pageSize?: number;
}

/**
 * @interface PaginationResultDto
 * @description 分页结果结构
 * @property {T[]} items - 当前页数据列表
 * @property {number} total - 总条数
 * @property {number} page - 当前页码
 * @property {number} pageSize - 每页数量
 */
export interface PaginationResultDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * @interface PaginationClampConfigDto
 * @description 分页 clamp 配置
 * @property {number | undefined} minPage - 最小页码（默认 1）
 * @property {number | undefined} maxPageSize - 最大 pageSize（默认 200）
 * @property {number | undefined} defaultPageSize - 默认 pageSize（默认 20）
 */
export interface PaginationClampConfigDto {
  minPage?: number;
  maxPageSize?: number;
  defaultPageSize?: number;
}

/**
 * @interface NormalizedPaginationQueryDto
 * @description 标准化后的分页参数
 * @property {number} page - 当前页码（>= 1）
 * @property {number} pageSize - 每页数量（>= 1）
 */
export interface NormalizedPaginationQueryDto {
  page: number;
  pageSize: number;
}

/**
 * @interface LimitOffsetDto
 * @description LIMIT/OFFSET 格式分页参数
 * @property {number} limit - 每页数量
 * @property {number} offset - 偏移量
 */
export interface LimitOffsetDto {
  limit: number;
  offset: number;
}
/**
 * @function normalizePagination
 * @description 标准化分页参数，确保页码和每页数量在有效范围内
 * @param {PaginationQueryDto} q - 原始分页查询参数
 * @returns {NormalizedPaginationQueryDto} 标准化后的分页参数
 */
export function normalizePagination(q: PaginationQueryDto): NormalizedPaginationQueryDto {
  const page = Math.max(1, ((q.page ?? 1) | 0));
  const rawSize = ((q.pageSize ?? 20) | 0);
  const pageSize = Math.max(1, Math.min(200, rawSize));
  return { page, pageSize };
}
/**
 * @function toLimitOffset
 * @description 将分页参数转换为 LIMIT/OFFSET 格式
 * @param {PaginationQueryDto} q - 分页查询参数
 * @returns {LimitOffsetDto} LIMIT/OFFSET 格式参数
 */
export function toLimitOffset(q: PaginationQueryDto): LimitOffsetDto {
  const { page, pageSize } = normalizePagination(q);
  return { limit: pageSize, offset: (page - 1) * pageSize };
}
/**
 * @function clampPagination
 * @description 对分页参数进行 clamp 处理，确保页码和每页数量在有效范围内
 * @param {PaginationQueryDto} q - 原始分页查询参数
 * @param {PaginationClampConfigDto | undefined} cfg - 分页 clamp 配置
 * @returns {NormalizedPaginationQueryDto} clamp 后的分页参数
 */
export function clampPagination(
  q: PaginationQueryDto,
  cfg?: PaginationClampConfigDto
): NormalizedPaginationQueryDto {
  const minPage = cfg?.minPage ?? 1;
  const maxPageSize = cfg?.maxPageSize ?? 200;
  const defaultPageSize = cfg?.defaultPageSize ?? 20;
  const page = Math.max(minPage, ((q.page ?? 1) | 0));
  const rawSize = ((q.pageSize ?? defaultPageSize) | 0);
  const pageSize = Math.max(1, Math.min(maxPageSize, rawSize));
  return { page, pageSize };
}
/**
 * @function computePages
 * @description 计算总页数
 * @param {number} total - 总条数
 * @param {number} pageSize - 每页数量
 * @returns {number} 总页数
 */
export function computePages(total: number, pageSize: number): number {
  const size = Math.max(1, pageSize | 0);
  const t = Math.max(0, total | 0);
  return Math.ceil(t / size);
}

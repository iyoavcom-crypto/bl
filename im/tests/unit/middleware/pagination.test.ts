/**
 * @fileoverview 分页工具函数单元测试
 * @module tests/unit/middleware/pagination
 */

import { test, assert, assertEqual, group, summary } from "../../helpers/runner.js";
import {
  normalizePagination,
  toLimitOffset,
  clampPagination,
  computePages,
} from "@/middleware/request/pagination.js";

// ============== normalizePagination 测试 ==============
group("normalizePagination - 分页参数标准化");

await test("normalizePagination: 默认值处理", () => {
  const result = normalizePagination({});
  assertEqual(result.page, 1, "默认页码应为 1");
  assertEqual(result.pageSize, 20, "默认 pageSize 应为 20");
});

await test("normalizePagination: 正常值保持不变", () => {
  const result = normalizePagination({ page: 5, pageSize: 50 });
  assertEqual(result.page, 5, "页码应保持不变");
  assertEqual(result.pageSize, 50, "pageSize 应保持不变");
});

await test("normalizePagination: 负数页码修正为 1", () => {
  const result = normalizePagination({ page: -5 });
  assertEqual(result.page, 1, "负数页码应修正为 1");
});

await test("normalizePagination: 0 页码修正为 1", () => {
  const result = normalizePagination({ page: 0 });
  assertEqual(result.page, 1, "0 页码应修正为 1");
});

await test("normalizePagination: 超大 pageSize 限制为 200", () => {
  const result = normalizePagination({ pageSize: 500 });
  assertEqual(result.pageSize, 200, "超大 pageSize 应限制为 200");
});

await test("normalizePagination: 负数 pageSize 修正为 1", () => {
  const result = normalizePagination({ pageSize: -10 });
  assertEqual(result.pageSize, 1, "负数 pageSize 应修正为 1");
});

await test("normalizePagination: 0 pageSize 修正为 1", () => {
  const result = normalizePagination({ pageSize: 0 });
  assertEqual(result.pageSize, 1, "0 pageSize 应修正为 1");
});

await test("normalizePagination: 小数转整数", () => {
  const result = normalizePagination({ page: 2.7, pageSize: 15.3 });
  assertEqual(result.page, 2, "页码小数应截断为整数");
  assertEqual(result.pageSize, 15, "pageSize 小数应截断为整数");
});

await test("normalizePagination: undefined 值使用默认值", () => {
  const result = normalizePagination({ page: undefined, pageSize: undefined });
  assertEqual(result.page, 1, "undefined 页码应使用默认值");
  assertEqual(result.pageSize, 20, "undefined pageSize 应使用默认值");
});

// ============== toLimitOffset 测试 ==============
group("toLimitOffset - 转换 LIMIT/OFFSET");

await test("toLimitOffset: 第1页偏移为0", () => {
  const result = toLimitOffset({ page: 1, pageSize: 10 });
  assertEqual(result.limit, 10, "limit 应为 10");
  assertEqual(result.offset, 0, "第1页偏移应为 0");
});

await test("toLimitOffset: 第2页偏移计算正确", () => {
  const result = toLimitOffset({ page: 2, pageSize: 10 });
  assertEqual(result.limit, 10, "limit 应为 10");
  assertEqual(result.offset, 10, "第2页偏移应为 10");
});

await test("toLimitOffset: 第5页 pageSize=25", () => {
  const result = toLimitOffset({ page: 5, pageSize: 25 });
  assertEqual(result.limit, 25, "limit 应为 25");
  assertEqual(result.offset, 100, "第5页偏移应为 100");
});

await test("toLimitOffset: 默认参数", () => {
  const result = toLimitOffset({});
  assertEqual(result.limit, 20, "默认 limit 应为 20");
  assertEqual(result.offset, 0, "默认偏移应为 0");
});

await test("toLimitOffset: 大页码计算", () => {
  const result = toLimitOffset({ page: 100, pageSize: 20 });
  assertEqual(result.limit, 20, "limit 应为 20");
  assertEqual(result.offset, 1980, "第100页偏移应为 1980");
});

await test("toLimitOffset: 自动修正无效参数", () => {
  const result = toLimitOffset({ page: -1, pageSize: 500 });
  assertEqual(result.limit, 200, "超大 pageSize 应限制为 200");
  assertEqual(result.offset, 0, "负数页码修正后偏移为 0");
});

// ============== clampPagination 测试 ==============
group("clampPagination - 自定义范围限制");

await test("clampPagination: 默认配置", () => {
  const result = clampPagination({});
  assertEqual(result.page, 1, "默认页码应为 1");
  assertEqual(result.pageSize, 20, "默认 pageSize 应为 20");
});

await test("clampPagination: 自定义 minPage", () => {
  const result = clampPagination({ page: 0 }, { minPage: 1 });
  assertEqual(result.page, 1, "页码应修正为 minPage");
});

await test("clampPagination: 自定义 maxPageSize", () => {
  const result = clampPagination({ pageSize: 500 }, { maxPageSize: 100 });
  assertEqual(result.pageSize, 100, "pageSize 应限制为 maxPageSize");
});

await test("clampPagination: 自定义 defaultPageSize", () => {
  const result = clampPagination({}, { defaultPageSize: 50 });
  assertEqual(result.pageSize, 50, "应使用自定义默认 pageSize");
});

await test("clampPagination: 所有自定义配置", () => {
  const result = clampPagination(
    { page: 0, pageSize: 1000 },
    { minPage: 2, maxPageSize: 50, defaultPageSize: 30 }
  );
  assertEqual(result.page, 2, "页码应修正为 minPage");
  assertEqual(result.pageSize, 50, "pageSize 应限制为 maxPageSize");
});

await test("clampPagination: 正常值不变", () => {
  const result = clampPagination({ page: 5, pageSize: 30 }, { minPage: 1, maxPageSize: 100 });
  assertEqual(result.page, 5, "正常页码应保持不变");
  assertEqual(result.pageSize, 30, "正常 pageSize 应保持不变");
});

// ============== computePages 测试 ==============
group("computePages - 总页数计算");

await test("computePages: 整除情况", () => {
  const result = computePages(100, 10);
  assertEqual(result, 10, "100/10 应为 10 页");
});

await test("computePages: 有余数向上取整", () => {
  const result = computePages(105, 10);
  assertEqual(result, 11, "105/10 应向上取整为 11 页");
});

await test("computePages: 总数为0", () => {
  const result = computePages(0, 10);
  assertEqual(result, 0, "0条记录应为 0 页");
});

await test("computePages: 负数总数修正为0", () => {
  const result = computePages(-10, 10);
  assertEqual(result, 0, "负数总数应修正为 0 页");
});

await test("computePages: 总数小于 pageSize", () => {
  const result = computePages(5, 10);
  assertEqual(result, 1, "5/10 应为 1 页");
});

await test("computePages: 总数等于 pageSize", () => {
  const result = computePages(10, 10);
  assertEqual(result, 1, "10/10 应为 1 页");
});

await test("computePages: pageSize 为 0 或负数修正为 1", () => {
  const result1 = computePages(100, 0);
  const result2 = computePages(100, -5);
  assertEqual(result1, 100, "pageSize=0 应修正为 1，结果为 100 页");
  assertEqual(result2, 100, "pageSize=-5 应修正为 1，结果为 100 页");
});

await test("computePages: 大数据量", () => {
  const result = computePages(1000000, 20);
  assertEqual(result, 50000, "1000000/20 应为 50000 页");
});

await test("computePages: 单条记录", () => {
  const result = computePages(1, 20);
  assertEqual(result, 1, "1/20 应为 1 页");
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("normalizePagination: NaN 值处理", () => {
  const result = normalizePagination({ page: NaN, pageSize: NaN });
  // NaN | 0 = 0, 然后被修正
  assertEqual(result.page, 1, "NaN 页码应修正为 1");
  assertEqual(result.pageSize, 1, "NaN pageSize 应修正为 1");
});

await test("normalizePagination: 边界值 pageSize=200", () => {
  const result = normalizePagination({ pageSize: 200 });
  assertEqual(result.pageSize, 200, "pageSize=200 应保持不变");
});

await test("normalizePagination: 边界值 pageSize=201", () => {
  const result = normalizePagination({ pageSize: 201 });
  assertEqual(result.pageSize, 200, "pageSize=201 应限制为 200");
});

await test("toLimitOffset: 第1页 pageSize=1", () => {
  const result = toLimitOffset({ page: 1, pageSize: 1 });
  assertEqual(result.limit, 1, "limit 应为 1");
  assertEqual(result.offset, 0, "偏移应为 0");
});

await test("computePages: 小数 pageSize 截断", () => {
  const result = computePages(100, 15.7);
  assertEqual(result, 7, "100/15.7 截断后 100/15 向上取整为 7");
});

await test("computePages: 小数 total 截断", () => {
  const result = computePages(99.9, 10);
  assertEqual(result, 10, "99.9 截断为 99，99/10 向上取整为 10");
});

summary("Pagination 模块");

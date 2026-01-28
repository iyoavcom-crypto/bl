/**
 * @fileoverview 验证函数单元测试
 * @module tests/unit/repo/validation
 */

import { test, assert, assertEqual, group, summary } from "../../helpers/runner.js";
import { isNonEmptyString } from "@/repo/base/validation/function/string.js";
import { isInteger, isPositiveInteger, isIntegerInRange } from "@/repo/base/validation/function/number.js";
import { isNonEmptyPlainObject } from "@/repo/base/validation/function/object.js";
import { isValidId, isValidPage, isValidLimit, isValidSearch, isValidFilters, isValidOrder } from "@/repo/base/validation/function/predicates.js";
import { normalizeOrder, type OrderTuple } from "@/repo/base/validation/function/order.js";

// ============== isNonEmptyString 测试 ==============
group("isNonEmptyString - 字符串验证");

await test("isNonEmptyString: 合法字符串返回 true", () => {
  assertEqual(isNonEmptyString("test"), true, "普通字符串应返回 true");
  assertEqual(isNonEmptyString("  valid  "), true, "两端有空格但中间非空应返回 true");
  assertEqual(isNonEmptyString("a"), true, "单字符应返回 true");
});

await test("isNonEmptyString: 空字符串返回 false", () => {
  assertEqual(isNonEmptyString(""), false, "空字符串应返回 false");
});

await test("isNonEmptyString: 纯空格返回 false", () => {
  assertEqual(isNonEmptyString("   "), false, "纯空格应返回 false");
  assertEqual(isNonEmptyString("\t\n"), false, "制表符和换行符应返回 false");
});

await test("isNonEmptyString: 非字符串返回 false", () => {
  assertEqual(isNonEmptyString(123), false, "数字应返回 false");
  assertEqual(isNonEmptyString(null), false, "null 应返回 false");
  assertEqual(isNonEmptyString(undefined), false, "undefined 应返回 false");
  assertEqual(isNonEmptyString([]), false, "数组应返回 false");
  assertEqual(isNonEmptyString({}), false, "对象应返回 false");
});

// ============== isInteger 测试 ==============
group("isInteger - 整数验证");

await test("isInteger: 整数返回 true", () => {
  assertEqual(isInteger(0), true, "0 应返回 true");
  assertEqual(isInteger(1), true, "正整数应返回 true");
  assertEqual(isInteger(-1), true, "负整数应返回 true");
  assertEqual(isInteger(999999), true, "大整数应返回 true");
});

await test("isInteger: 小数返回 false", () => {
  assertEqual(isInteger(1.5), false, "小数应返回 false");
  assertEqual(isInteger(0.1), false, "0.1 应返回 false");
  assertEqual(isInteger(-3.14), false, "负小数应返回 false");
});

await test("isInteger: 非数字返回 false", () => {
  assertEqual(isInteger("1"), false, "字符串数字应返回 false");
  assertEqual(isInteger(NaN), false, "NaN 应返回 false");
  assertEqual(isInteger(Infinity), false, "Infinity 应返回 false");
  assertEqual(isInteger(null), false, "null 应返回 false");
});

// ============== isPositiveInteger 测试 ==============
group("isPositiveInteger - 正整数验证");

await test("isPositiveInteger: 正整数返回 true", () => {
  assertEqual(isPositiveInteger(1), true, "1 应返回 true");
  assertEqual(isPositiveInteger(100), true, "100 应返回 true");
  assertEqual(isPositiveInteger(999999), true, "大正整数应返回 true");
});

await test("isPositiveInteger: 0 和负数返回 false", () => {
  assertEqual(isPositiveInteger(0), false, "0 应返回 false");
  assertEqual(isPositiveInteger(-1), false, "负数应返回 false");
  assertEqual(isPositiveInteger(-100), false, "大负数应返回 false");
});

await test("isPositiveInteger: 小数返回 false", () => {
  assertEqual(isPositiveInteger(1.5), false, "正小数应返回 false");
  assertEqual(isPositiveInteger(0.9), false, "0.9 应返回 false");
});

// ============== isIntegerInRange 测试 ==============
group("isIntegerInRange - 范围整数验证");

await test("isIntegerInRange: 范围内返回 true", () => {
  assertEqual(isIntegerInRange(10, 1, 100), true, "中间值应返回 true");
  assertEqual(isIntegerInRange(1, 1, 100), true, "最小边界应返回 true");
  assertEqual(isIntegerInRange(100, 1, 100), true, "最大边界应返回 true");
});

await test("isIntegerInRange: 超出范围返回 false", () => {
  assertEqual(isIntegerInRange(0, 1, 100), false, "小于最小值应返回 false");
  assertEqual(isIntegerInRange(101, 1, 100), false, "大于最大值应返回 false");
});

await test("isIntegerInRange: 非整数返回 false", () => {
  assertEqual(isIntegerInRange(1.5, 1, 100), false, "小数应返回 false");
  assertEqual(isIntegerInRange("50", 1, 100), false, "字符串应返回 false");
});

// ============== isNonEmptyPlainObject 测试 ==============
group("isNonEmptyPlainObject - 非空对象验证");

await test("isNonEmptyPlainObject: 非空对象返回 true", () => {
  assertEqual(isNonEmptyPlainObject({ key: "value" }), true, "有属性的对象应返回 true");
  assertEqual(isNonEmptyPlainObject({ a: 1, b: 2 }), true, "多属性对象应返回 true");
});

await test("isNonEmptyPlainObject: 空对象返回 false", () => {
  assertEqual(isNonEmptyPlainObject({}), false, "空对象应返回 false");
});

await test("isNonEmptyPlainObject: 数组返回 false", () => {
  assertEqual(isNonEmptyPlainObject([]), false, "空数组应返回 false");
  assertEqual(isNonEmptyPlainObject([1, 2, 3]), false, "非空数组应返回 false");
});

await test("isNonEmptyPlainObject: null 返回 false", () => {
  assertEqual(isNonEmptyPlainObject(null), false, "null 应返回 false");
});

// ============== isValidId 测试 ==============
group("isValidId - ID 验证");

await test("isValidId: 合法 ID 返回 true", () => {
  assertEqual(isValidId("abc123"), true, "字母数字组合应返回 true");
  assertEqual(isValidId("uuid-like-string"), true, "UUID 格式应返回 true");
});

await test("isValidId: 空或非字符串返回 false", () => {
  assertEqual(isValidId(""), false, "空字符串应返回 false");
  assertEqual(isValidId("   "), false, "纯空格应返回 false");
  assertEqual(isValidId(123), false, "数字应返回 false");
});

// ============== isValidPage 测试 ==============
group("isValidPage - 页码验证");

await test("isValidPage: 合法页码返回 true", () => {
  assertEqual(isValidPage(1), true, "1 应返回 true");
  assertEqual(isValidPage(10), true, "10 应返回 true");
  assertEqual(isValidPage(999), true, "大页码应返回 true");
});

await test("isValidPage: 非法页码返回 false", () => {
  assertEqual(isValidPage(0), false, "0 应返回 false");
  assertEqual(isValidPage(-1), false, "负数应返回 false");
  assertEqual(isValidPage(1.5), false, "小数应返回 false");
  assertEqual(isValidPage("1"), false, "字符串应返回 false");
});

// ============== isValidLimit 测试 ==============
group("isValidLimit - 分页大小验证");

await test("isValidLimit: 1-200 范围内返回 true", () => {
  assertEqual(isValidLimit(1), true, "1 应返回 true");
  assertEqual(isValidLimit(20), true, "20 应返回 true");
  assertEqual(isValidLimit(200), true, "200 应返回 true");
});

await test("isValidLimit: 超出 1-200 返回 false", () => {
  assertEqual(isValidLimit(0), false, "0 应返回 false");
  assertEqual(isValidLimit(201), false, "201 应返回 false");
  assertEqual(isValidLimit(-1), false, "负数应返回 false");
});

// ============== isValidSearch 测试 ==============
group("isValidSearch - 搜索字符串验证");

await test("isValidSearch: 字符串返回 true", () => {
  assertEqual(isValidSearch("test"), true, "普通字符串应返回 true");
  assertEqual(isValidSearch(""), true, "空字符串应返回 true");
  assertEqual(isValidSearch("   "), true, "空格字符串应返回 true");
});

await test("isValidSearch: 非字符串返回 false", () => {
  assertEqual(isValidSearch(123), false, "数字应返回 false");
  assertEqual(isValidSearch(null), false, "null 应返回 false");
  assertEqual(isValidSearch(undefined), false, "undefined 应返回 false");
});

// ============== isValidFilters 测试 ==============
group("isValidFilters - 过滤器验证");

await test("isValidFilters: 对象返回 true", () => {
  assertEqual(isValidFilters({ key: "value" }), true, "非空对象应返回 true");
  assertEqual(isValidFilters({}), true, "空对象应返回 true");
});

await test("isValidFilters: 非对象返回 false", () => {
  assertEqual(isValidFilters([]), false, "数组应返回 false");
  assertEqual(isValidFilters(null), false, "null 应返回 false");
  assertEqual(isValidFilters("string"), false, "字符串应返回 false");
});

// ============== isValidOrder 测试 ==============
group("isValidOrder - 排序验证");

await test("isValidOrder: 字符串格式返回 true", () => {
  assertEqual(isValidOrder("createdAt"), true, "单字段应返回 true");
  assertEqual(isValidOrder("name"), true, "普通字段名应返回 true");
});

await test("isValidOrder: 二维数组格式返回 true", () => {
  assertEqual(isValidOrder([["id", "ASC"]]), true, "单元素数组应返回 true");
  assertEqual(isValidOrder([["id", "ASC"], ["createdAt", "DESC"]]), true, "多元素数组应返回 true");
});

await test("isValidOrder: 无效方向返回 false", () => {
  assertEqual(isValidOrder([["id", "INVALID"]]), false, "无效方向应返回 false");
});

await test("isValidOrder: 空字符串返回 false", () => {
  assertEqual(isValidOrder(""), false, "空字符串应返回 false");
  assertEqual(isValidOrder("   "), false, "纯空格应返回 false");
});

await test("isValidOrder: 空数组返回 false", () => {
  assertEqual(isValidOrder([]), false, "空数组应返回 false");
});

// ============== normalizeOrder 测试 ==============
group("normalizeOrder - 排序规范化");

await test("normalizeOrder: 简单字符串转数组", () => {
  const result = normalizeOrder("createdAt");
  assertEqual(result.length, 1, "应返回单元素数组");
  assertEqual(result[0]?.[0], "createdAt", "字段名应正确");
  assertEqual(result[0]?.[1], "ASC", "默认方向应为 ASC");
});

await test("normalizeOrder: 逗号分隔多字段", () => {
  const result = normalizeOrder("name,createdAt");
  assertEqual(result.length, 2, "应返回两元素数组");
  assertEqual(result[0]?.[0], "name", "第一个字段应正确");
  assertEqual(result[1]?.[0], "createdAt", "第二个字段应正确");
});

await test("normalizeOrder: 冒号格式解析方向", () => {
  const result = normalizeOrder("name:desc,id:asc");
  assertEqual(result[0]?.[1], "DESC", "desc 应解析为 DESC");
  assertEqual(result[1]?.[1], "ASC", "asc 应解析为 ASC");
});

await test("normalizeOrder: 空格格式解析方向", () => {
  const result = normalizeOrder("name DESC");
  assertEqual(result[0]?.[0], "name", "字段名应正确");
  assertEqual(result[0]?.[1], "DESC", "方向应为 DESC");
});

await test("normalizeOrder: 减号前缀表示 DESC", () => {
  const result = normalizeOrder("-createdAt");
  assertEqual(result[0]?.[0], "createdAt", "字段名应去除前缀");
  assertEqual(result[0]?.[1], "DESC", "方向应为 DESC");
});

await test("normalizeOrder: 加号前缀表示 ASC", () => {
  const result = normalizeOrder("+createdAt");
  assertEqual(result[0]?.[0], "createdAt", "字段名应去除前缀");
  assertEqual(result[0]?.[1], "ASC", "方向应为 ASC");
});

await test("normalizeOrder: 数组格式保持不变", () => {
  const input: OrderTuple[] = [["name", "DESC"], ["id", "ASC"]];
  const result = normalizeOrder(input);
  assertEqual(result.length, 2, "应返回两元素数组");
  assertEqual(result[0]?.[0], "name", "第一个字段应正确");
  assertEqual(result[0]?.[1], "DESC", "第一个方向应正确");
});

await test("normalizeOrder: 空字符串返回空数组", () => {
  const result = normalizeOrder("");
  assertEqual(result.length, 0, "应返回空数组");
});

await test("normalizeOrder: 混合格式解析", () => {
  const result = normalizeOrder("-name, +id, createdAt:desc");
  assertEqual(result.length, 3, "应返回三元素数组");
  assertEqual(result[0]?.[1], "DESC", "第一个应为 DESC");
  assertEqual(result[1]?.[1], "ASC", "第二个应为 ASC");
  assertEqual(result[2]?.[1], "DESC", "第三个应为 DESC");
});

// ============== 边界情况测试 ==============
group("边界情况");

await test("isIntegerInRange: 边界值测试", () => {
  assertEqual(isIntegerInRange(Number.MAX_SAFE_INTEGER, 1, Number.MAX_SAFE_INTEGER), true, "最大安全整数应在范围内");
  assertEqual(isIntegerInRange(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0), true, "最小安全整数应在范围内");
});

await test("isNonEmptyString: Unicode 字符串", () => {
  assertEqual(isNonEmptyString("中文"), true, "中文字符串应返回 true");
  assertEqual(isNonEmptyString("日本語"), true, "日文字符串应返回 true");
});

await test("normalizeOrder: 忽略空白项", () => {
  const result = normalizeOrder("name,  , createdAt");
  assertEqual(result.length, 2, "空白项应被忽略");
});

summary("Validation 模块");

/**
 * 测试运行器 - 复用工具函数
 */

export let passed = 0;
export let failed = 0;

/**
 * 重置计数器
 */
export function reset() {
  passed = 0;
  failed = 0;
}

/**
 * 测试函数
 */
export function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (e: any) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${e.message}`);
      failed++;
    }
  })();
}

/**
 * 断言函数
 */
export function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

/**
 * 相等断言
 */
export function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(msg ?? `Expected ${expected}, got ${actual}`);
  }
}

/**
 * 类型断言
 */
export function assertType(value: unknown, type: string, msg?: string) {
  if (typeof value !== type) {
    throw new Error(msg ?? `Expected type ${type}, got ${typeof value}`);
  }
}

/**
 * 输出测试结果摘要
 */
export function summary(moduleName?: string) {
  console.log(`\n=== ${moduleName ?? "测试"}结果 ===`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`总计: ${passed + failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

/**
 * 分组标题
 */
export function group(name: string) {
  console.log(`\n--- ${name} ---`);
}

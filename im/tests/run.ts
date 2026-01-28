/**
 * 测试入口 - 统一运行器
 * 运行: npx tsx tests/run.ts [选项]
 * 
 * 选项:
 *   --unit          运行单元测试
 *   --integration   运行集成测试
 *   --e2e           运行端到端测试
 *   --all           运行全部测试
 *   --module=jwt    运行指定模块测试
 */

import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const testsDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");

interface TestConfig {
  unit: string[];
  integration: string[];
  e2e: string[];
}

/** 递归查找匹配的文件 */
function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, pattern));
      } else if (pattern.test(entry)) {
        results.push(fullPath);
      }
    }
  } catch {
    // 目录不存在，忽略
  }
  return results;
}

async function findTests(): Promise<TestConfig> {
  return {
    unit: findFiles(path.join(testsDir, "unit"), /\.test\.ts$/),
    integration: findFiles(path.join(testsDir, "integration"), /\.int\.ts$/),
    e2e: findFiles(path.join(testsDir, "e2e"), /\.e2e\.ts$/),
  };
}

function runTest(file: string): Promise<{ file: string; success: boolean }> {
  return new Promise((resolve) => {
    const proc = spawn("npx", ["tsx", file], {
      stdio: "inherit",
      shell: true,
    });
    proc.on("close", (code) => {
      resolve({ file, success: code === 0 });
    });
  });
}

async function run() {
  const config = await findTests();
  const results: { file: string; success: boolean }[] = [];
  
  // 解析参数
  const runUnit = args.includes("--unit") || args.includes("--all") || args.length === 0;
  const runInt = args.includes("--integration") || args.includes("--all");
  const runE2e = args.includes("--e2e") || args.includes("--all");
  const moduleArg = args.find((a) => a.startsWith("--module="));
  const moduleFilter = moduleArg?.split("=")[1];

  console.log("╔════════════════════════════════════╗");
  console.log("║         测试运行器 v1.0            ║");
  console.log("╚════════════════════════════════════╝\n");

  // 运行单元测试
  if (runUnit && config.unit.length > 0) {
    console.log("▶ 单元测试");
    console.log("─".repeat(40));
    for (const file of config.unit) {
      if (moduleFilter && !file.includes(moduleFilter)) continue;
      const result = await runTest(file);
      results.push(result);
    }
    console.log();
  }

  // 运行集成测试
  if (runInt && config.integration.length > 0) {
    console.log("▶ 集成测试");
    console.log("─".repeat(40));
    for (const file of config.integration) {
      if (moduleFilter && !file.includes(moduleFilter)) continue;
      const result = await runTest(file);
      results.push(result);
    }
    console.log();
  }

  // 运行 E2E 测试
  if (runE2e && config.e2e.length > 0) {
    console.log("▶ E2E 测试");
    console.log("─".repeat(40));
    for (const file of config.e2e) {
      if (moduleFilter && !file.includes(moduleFilter)) continue;
      const result = await runTest(file);
      results.push(result);
    }
    console.log();
  }

  // 汇总结果
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log("╔════════════════════════════════════╗");
  console.log("║           测试汇总                 ║");
  console.log("╠════════════════════════════════════╣");
  console.log(`║  通过: ${passed.toString().padEnd(5)} 失败: ${failed.toString().padEnd(5)}        ║`);
  console.log("╚════════════════════════════════════╝");

  if (failed > 0) {
    console.log("\n失败文件:");
    results.filter((r) => !r.success).forEach((r) => console.log(`  ✗ ${r.file}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(console.error);

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 开始验证MCP文档一致性...\n');

try {
  // 读取文件
  const dataPath = path.join(process.cwd(), 'mcp-server/data.ts');
  const docPath = path.join(process.cwd(), 'docs/MCP-API-REFERENCE.md');
  
  const dataContent = fs.readFileSync(dataPath, 'utf-8');
  const docContent = fs.readFileSync(docPath, 'utf-8');

  // 简单验证 - 检查关键内容是否存在
  const hasApiModules = dataContent.includes('API_MODULES');
  const hasWsEvents = dataContent.includes('WS_EVENTS');
  const hasEnums = dataContent.includes('ENUMS');
  const hasErrorCodes = dataContent.includes('ERROR_CODES');

  const docHasApi = docContent.includes('工具列表') || docContent.includes('API接口');
  const docHasWs = docContent.includes('WebSocket事件');
  const docHasEnums = docContent.includes('枚举常量');
  const docHasErrors = docContent.includes('错误码');

  console.log('📊 验证结果:');
  console.log(`   API模块: ${hasApiModules && docHasApi ? '✅' : '❌'}`);
  console.log(`   WebSocket事件: ${hasWsEvents && docHasWs ? '✅' : '❌'}`);
  console.log(`   枚举常量: ${hasEnums && docHasEnums ? '✅' : '❌'}`);
  console.log(`   错误码: ${hasErrorCodes && docHasErrors ? '✅' : '❌'}`);

  if (hasApiModules && hasWsEvents && hasEnums && hasErrorCodes &&
      docHasApi && docHasWs && docHasEnums && docHasErrors) {
    console.log('\n🎉 所有关键内容都存在，文档基本一致！');
    process.exit(0);
  } else {
    console.log('\n⚠️  发现缺失内容，请检查文档完整性');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ 验证失败:', error.message);
  process.exit(1);
}
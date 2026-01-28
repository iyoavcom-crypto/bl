#!/usr/bin/env node
/**
 * @fileoverview Markdown锚链接检查和修复脚本
 * @description 检查并修复docs目录下所有Markdown文件中的锚链接问题
 */

import fs from 'fs';
import path from 'path';

// 获取docs目录下的所有markdown文件
function getMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      files.push(...getMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 将中文标题转换为GitHub风格的锚点
function convertToAnchor(title) {
  // 移除##等标记
  let cleanTitle = title.replace(/^#+\s*/, '');
  // URL编码中文字符
  return encodeURIComponent(cleanTitle);
}

// 检查并修复单个文件的锚链接
function fixAnchorsInFile(filePath) {
  console.log(`\n🔍 检查文件: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // 提取所有标题
  const titles = [];
  const titleRegex = /^(#{1,6})\s+(.+)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(titleRegex);
    if (match) {
      titles.push({
        level: match[1].length,
        text: match[2],
        line: i + 1
      });
    }
  }
  
  console.log(`   发现 ${titles.length} 个标题`);
  
  // 检查目录中的锚链接
  let fixedContent = content;
  let changes = [];
  
  // 查找目录部分（通常在文件开头）
  const tocStart = lines.findIndex(line => line.trim() === '## 目录' || line.trim() === '# 目录');
  if (tocStart !== -1) {
    let tocEnd = tocStart;
    // 找到目录结束位置
    for (let i = tocStart + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ') || lines[i].startsWith('# ') || lines[i].trim() === '---') {
        tocEnd = i - 1;
        break;
      }
    }
    
    // 检查目录中的锚链接
    for (let i = tocStart; i <= tocEnd; i++) {
      const line = lines[i];
      const linkMatch = line.match(/\[([^\]]+)\]\((#[^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const currentAnchor = linkMatch[2];
        
        // 查找对应的标题
        const matchingTitle = titles.find(title => title.text === linkText);
        if (matchingTitle) {
          const correctAnchor = '#' + convertToAnchor(matchingTitle.text);
          if (currentAnchor !== correctAnchor) {
            const oldLine = lines[i];
            lines[i] = line.replace(currentAnchor, correctAnchor);
            changes.push({
              line: i + 1,
              old: oldLine,
              new: lines[i],
              reason: `锚链接修正: ${currentAnchor} -> ${correctAnchor}`
            });
          }
        }
      }
    }
  }
  
  // 如果有修改，写入文件
  if (changes.length > 0) {
    console.log(`   🔧 发现并修复 ${changes.length} 个锚链接问题:`);
    changes.forEach(change => {
      console.log(`     行 ${change.line}: ${change.reason}`);
    });
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`   ✅ 已保存修改到 ${filePath}`);
  } else {
    console.log(`   ✅ 未发现锚链接问题`);
  }
  
  return changes.length;
}

// 主函数
function main() {
  console.log('🚀 开始检查Markdown锚链接...\n');
  
  const docsDir = path.join(process.cwd(), 'docs');
  const markdownFiles = getMarkdownFiles(docsDir);
  
  console.log(`📁 找到 ${markdownFiles.length} 个Markdown文件:`);
  markdownFiles.forEach(file => console.log(`   - ${path.relative(process.cwd(), file)}`));
  
  let totalFixes = 0;
  
  // 处理每个文件
  for (const file of markdownFiles) {
    const fixes = fixAnchorsInFile(file);
    totalFixes += fixes;
  }
  
  console.log(`\n📊 总结:`);
  console.log(`   处理文件数: ${markdownFiles.length}`);
  console.log(`   修复链接数: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log(`\n🎉 锚链接修复完成！`);
  } else {
    console.log(`\n✅ 所有锚链接都正确！`);
  }
}

// 执行主函数
main();
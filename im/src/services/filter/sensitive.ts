/**
 * @packageDocumentation
 * @module services/filter/sensitive
 * @since 1.0.0
 * @author Z-kali
 * @description 敏感词过滤服务 - 基于 DFA (确定有限自动机) 算法
 * @path src/services/filter/sensitive.ts
 */

import { readFile, writeFile, access, constants } from "node:fs/promises";
import { join } from "node:path";

/** DFA 节点类型 */
interface DFANode {
  children: Map<string, DFANode>;
  isEnd: boolean;
}

/**
 * @interface FilterResult
 * @description 过滤结果
 */
export interface FilterResult {
  text: string;
  filtered: boolean;
  replacedCount: number;
  matchedWords: string[];
}

/**
 * @interface SensitiveWordStats
 * @description 敏感词统计
 */
export interface SensitiveWordStats {
  totalWords: number;
  lastUpdated: Date | null;
}

/**
 * @class SensitiveWordFilter
 * @description 敏感词过滤器 - DFA 算法实现
 */
class SensitiveWordFilter {
  /** DFA 根节点 */
  private root: DFANode;
  
  /** 敏感词列表 */
  private words: Set<string>;
  
  /** 敏感词文件路径 */
  private readonly wordsFilePath: string;
  
  /** 最后更新时间 */
  private lastUpdated: Date | null = null;
  
  /** 替换字符 */
  private readonly replaceChar: string = "*";
  
  /** 是否已初始化 */
  private initialized = false;

  constructor() {
    this.root = this.createNode();
    this.words = new Set();
    this.wordsFilePath = join(process.cwd(), "data", "sensitive-words.txt");
  }

  /**
   * 创建 DFA 节点
   */
  private createNode(): DFANode {
    return {
      children: new Map(),
      isEnd: false,
    };
  }

  /**
   * 初始化过滤器
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadFromFile();
      this.initialized = true;
      console.log(`[SensitiveFilter] 已加载 ${this.words.size} 个敏感词`);
    } catch (err) {
      // 文件不存在时创建默认敏感词库
      await this.initDefaultWords();
      this.initialized = true;
      console.log(`[SensitiveFilter] 使用默认敏感词库，共 ${this.words.size} 个词`);
    }
  }

  /**
   * 初始化默认敏感词库
   */
  private async initDefaultWords(): Promise<void> {
    // 默认敏感词（示例，可根据需要扩展）
    const defaultWords = [
      // 政治敏感词
      "反动", "颠覆", "暴动",
      // 违法相关
      "赌博", "贩毒", "洗钱",
      // 欺诈相关
      "传销", "诈骗", "假币",
      // 色情相关
      "色情", "淫秽", "卖淫",
      // 暴力相关
      "杀人", "暗杀", "投毒",
      // 其他
      "自杀", "自残",
    ];

    for (const word of defaultWords) {
      this.addWord(word);
    }

    // 保存到文件
    await this.saveToFile();
  }

  /**
   * 从文件加载敏感词
   */
  private async loadFromFile(): Promise<void> {
    await access(this.wordsFilePath, constants.R_OK);
    const content = await readFile(this.wordsFilePath, "utf-8");
    
    // 清空现有词库
    this.root = this.createNode();
    this.words.clear();

    // 按行解析
    const lines = content.split("\n");
    for (const line of lines) {
      const word = line.trim();
      if (word && !word.startsWith("#")) {
        this.addWord(word);
      }
    }

    this.lastUpdated = new Date();
  }

  /**
   * 保存敏感词到文件
   */
  private async saveToFile(): Promise<void> {
    const { mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    
    // 确保目录存在
    await mkdir(dirname(this.wordsFilePath), { recursive: true });

    const content = [
      "# 敏感词库",
      "# 每行一个敏感词，# 开头的行为注释",
      `# 更新时间: ${new Date().toISOString()}`,
      "",
      ...Array.from(this.words).sort(),
    ].join("\n");

    await writeFile(this.wordsFilePath, content, "utf-8");
    this.lastUpdated = new Date();
  }

  /**
   * 添加敏感词到 DFA
   */
  addWord(word: string): void {
    if (!word || word.length === 0) return;

    const normalizedWord = this.normalize(word);
    if (this.words.has(normalizedWord)) return;

    this.words.add(normalizedWord);

    let current = this.root;
    for (const char of normalizedWord) {
      let child = current.children.get(char);
      if (!child) {
        child = this.createNode();
        current.children.set(char, child);
      }
      current = child;
    }
    current.isEnd = true;
  }

  /**
   * 移除敏感词
   */
  removeWord(word: string): boolean {
    const normalizedWord = this.normalize(word);
    if (!this.words.has(normalizedWord)) return false;

    this.words.delete(normalizedWord);
    
    // 重建 DFA（简单实现）
    this.rebuildDFA();
    return true;
  }

  /**
   * 重建 DFA
   */
  private rebuildDFA(): void {
    this.root = this.createNode();
    for (const word of this.words) {
      let current = this.root;
      for (const char of word) {
        let child = current.children.get(char);
        if (!child) {
          child = this.createNode();
          current.children.set(char, child);
        }
        current = child;
      }
      current.isEnd = true;
    }
  }

  /**
   * 标准化文本（转小写、全角转半角）
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      // 全角转半角
      .replace(/[\uff01-\uff5e]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0xfee0)
      )
      // 移除特殊字符（但保留中文）
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, "");
  }

  /**
   * 检查文本是否包含敏感词
   */
  contains(text: string): boolean {
    const normalizedText = this.normalize(text);
    const length = normalizedText.length;

    for (let i = 0; i < length; i++) {
      let current = this.root;
      for (let j = i; j < length; j++) {
        const char = normalizedText[j];
        const child = current.children.get(char);
        
        if (!child) break;
        
        current = child;
        if (current.isEnd) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 查找所有敏感词
   */
  findAll(text: string): string[] {
    const normalizedText = this.normalize(text);
    const length = normalizedText.length;
    const matches: string[] = [];

    for (let i = 0; i < length; i++) {
      let current = this.root;
      let matchedWord = "";
      
      for (let j = i; j < length; j++) {
        const char = normalizedText[j];
        const child = current.children.get(char);
        
        if (!child) break;
        
        matchedWord += char;
        current = child;
        
        if (current.isEnd) {
          matches.push(matchedWord);
        }
      }
    }

    return [...new Set(matches)];
  }

  /**
   * 过滤文本（替换敏感词为 ***）
   */
  filter(text: string): FilterResult {
    if (!text || text.length === 0) {
      return {
        text,
        filtered: false,
        replacedCount: 0,
        matchedWords: [],
      };
    }

    const normalizedText = this.normalize(text);
    const length = normalizedText.length;
    const matchedWords: string[] = [];
    
    // 记录需要替换的位置
    const replaceRanges: Array<[number, number]> = [];
    
    // 创建原文到标准化文本的位置映射
    const positionMap = this.createPositionMap(text, normalizedText);

    for (let i = 0; i < length; i++) {
      let current = this.root;
      let matchEnd = -1;
      let matchedWord = "";
      
      for (let j = i; j < length; j++) {
        const char = normalizedText[j];
        const child = current.children.get(char);
        
        if (!child) break;
        
        matchedWord += char;
        current = child;
        
        if (current.isEnd) {
          matchEnd = j;
          if (!matchedWords.includes(matchedWord)) {
            matchedWords.push(matchedWord);
          }
        }
      }
      
      if (matchEnd >= 0) {
        replaceRanges.push([i, matchEnd]);
        i = matchEnd; // 跳过已匹配的部分
      }
    }

    if (replaceRanges.length === 0) {
      return {
        text,
        filtered: false,
        replacedCount: 0,
        matchedWords: [],
      };
    }

    // 在原文中进行替换
    let result = text;
    let offset = 0;

    for (const [start, end] of replaceRanges) {
      const originalStart = positionMap.get(start);
      const originalEnd = positionMap.get(end);
      
      if (originalStart !== undefined && originalEnd !== undefined) {
        const wordLength = originalEnd - originalStart + 1;
        const replacement = this.replaceChar.repeat(Math.min(wordLength, 10));
        
        result =
          result.substring(0, originalStart + offset) +
          replacement +
          result.substring(originalEnd + 1 + offset);
        
        offset += replacement.length - wordLength;
      }
    }

    return {
      text: result,
      filtered: true,
      replacedCount: replaceRanges.length,
      matchedWords,
    };
  }

  /**
   * 创建原文到标准化文本的位置映射
   */
  private createPositionMap(original: string, normalized: string): Map<number, number> {
    const map = new Map<number, number>();
    let normalizedIndex = 0;

    for (let i = 0; i < original.length && normalizedIndex < normalized.length; i++) {
      const normalizedChar = this.normalize(original[i]);
      if (normalizedChar === normalized[normalizedIndex]) {
        map.set(normalizedIndex, i);
        normalizedIndex++;
      }
    }

    return map;
  }

  /**
   * 批量添加敏感词
   */
  async addWords(words: string[]): Promise<number> {
    let added = 0;
    for (const word of words) {
      if (word && !this.words.has(this.normalize(word))) {
        this.addWord(word);
        added++;
      }
    }
    if (added > 0) {
      await this.saveToFile();
    }
    return added;
  }

  /**
   * 批量移除敏感词
   */
  async removeWords(words: string[]): Promise<number> {
    let removed = 0;
    for (const word of words) {
      if (this.removeWord(word)) {
        removed++;
      }
    }
    if (removed > 0) {
      await this.saveToFile();
    }
    return removed;
  }

  /**
   * 获取所有敏感词
   */
  getAllWords(): string[] {
    return Array.from(this.words).sort();
  }

  /**
   * 获取统计信息
   */
  getStats(): SensitiveWordStats {
    return {
      totalWords: this.words.size,
      lastUpdated: this.lastUpdated,
    };
  }

  /**
   * 重新加载敏感词库
   */
  async reload(): Promise<void> {
    this.initialized = false;
    await this.init();
  }
}

// 导出单例
export default new SensitiveWordFilter();

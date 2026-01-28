# IM 敏感词库结构化重构计划

## 目标
将现有的扁平化 `违禁词.txt` 重构为结构化的 `sensitive_words.json`，通过引入**分级机制**和**匹配模式**来彻底解决误伤问题，使其适配 IM 通讯程序的实际开发需求。

## 执行步骤

### 1. 备份数据
- 将当前的 `c:\Users\a1575\Desktop\222\违禁词.txt` 复制一份为 `违禁词_backup.txt`，防止数据丢失。

### 2. 创建结构化词库 (`sensitive_words.json`)
- **数据结构定义**：
  ```typescript
  interface SensitiveWord {
    word: string;       // 敏感词内容
    category: string;   // 分类（赌博/色情/涉政等）
    level: 'block' | 'replace' | 'review'; // 处置等级：拦截 | 替换(***) | 仅审核
    matchType: 'fuzzy' | 'exact'; // 匹配模式：模糊匹配 | 精确匹配(防止短词误伤)
  }
  ```
- **迁移与清洗策略**：
  - **高危词（Block）**：毒品、枪支、严重暴恐、严重涉政词汇 -> 设为 `block` + `fuzzy`。
  - **中危词（Replace）**：脏话、一般色情、广告 -> 设为 `replace` + `fuzzy`。
  - **高误伤词（Review/Exact）**：
    - 单字/双字短词（如：约、AV、SM、兼职、包子、大米）-> 设为 `review` 或 `matchType: exact`。
    - 生活通用词（如：做爱、刷单）-> 设为 `review`，建议程序端做组合判断。

### 3. 生成精简版高危词表
- 更新 `违禁词.txt`，仅保留 **Level 3 (Block)** 级别的核心词汇，去除所有容易造成误伤的“低危/高误伤”词汇，作为一个快速拦截的黑名单供简单场景使用。

## 交付产物
1.  `sensitive_words.json`：包含完整元数据的 JSON 词库，直接可用于生产环境代码。
2.  `违禁词.txt`：清洗后的纯净版高危词列表（无误伤风险）。

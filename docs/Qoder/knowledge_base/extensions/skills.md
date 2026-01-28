# Skills

Skills 是 Qoder 中将专业知识打包成可复用功能的机制。每个 Skill 包含一个 `SKILL.md` 文件，定义技能的描述、指令和可选的辅助文件。无论是在 Qoder IDE 还是 CLI 中，Skills 的使用方式完全一致。

**核心特点**：
*   **智能调用**：模型根据用户请求和 Skill 描述自主决定何时使用
*   **模块化设计**：每个 Skill 专注解决特定类型的任务
*   **灵活扩展**：支持用户级和项目级的自定义 Skill

## 如何使用

将目标 Skill 文件拷贝到下述路径后，需要重启 Qoder IDE，即可在对话框内通过 `/` 查看已加载的 Skills 列表。

| 位置 | 路径 | 作用域 |
| :--- | :--- | :--- |
| **用户级** | `~/.qoder/skills/{skill-name}/SKILL.md` | 当前用户的所有项目 |
| **项目级** | `.qoder/skills/{skill-name}/SKILL.md` | 仅当前项目 |

> 同名时，项目级 Skill 覆盖用户级 Skill。

可以有以下两种触发方式：

1.  **自动触发**：直接描述需求，模型会自动判断是否使用合适的 Skill：
    > 分析这个日志文件中的错误
    模型将自动识别并调用 `log-analyzer` Skill。

2.  **手动触发**：输入 `/skill-name` 手动触发：
    > /log-analyzer

## 使用场景

**适合使用 Skill 的场景**：

*   **复杂专业任务**：需要领域知识的工作流（代码审查、PDF 处理、API 设计）
*   **标准化流程**：按固定步骤执行的任务（提交规范、部署流程）
*   **团队知识共享**：打包最佳实践供团队使用
*   **重复性工作**：频繁执行且需要专业指导的任务

## 场景示例

### 日志分析
创建一个 `log-analyzer` Skill，当你说”分析这个日志”时自动激活，帮助识别错误、性能问题和异常模式。

### API 文档生成
创建一个 `api-doc-generator` Skill，自动识别 API 端点并生成标准文档和 OpenAPI 规范。

### 代码审查
创建一个 `code-reviewer` Skill，按照团队规范自动审查代码，检查潜在问题和最佳实践。

## 详细文档

关于 Skills 的完整指南，包括如何创建、编写 `SKILL.md`、最佳实践和故障排查，请参阅 [Skills 完整文档](file:///absolute/path/to/docs/Qoder/knowledge_base/cli/skills.md)。

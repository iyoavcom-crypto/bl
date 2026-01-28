# 命令

通过斜杠命令（又称 Command）控制 Qoder CLI 的行为，快速唤起特定任务。

命令是 Qoder CLI 中唤起特定任务的快捷方式，通过斜杠符号（`/`）前缀触发。在 TUI 模式下输入 `/` 可查看可用命令清单并选择执行。

## 快速开始

### 在 TUI 模式下使用命令

1.  启动 Qoder CLI 进入 TUI 模式：
    ```bash
    qodercli
    ```
2.  在输入框中输入 `/` 字符，查看可用命令清单
3.  选择目标命令后按 Enter 键执行，例如 `/config` 查看或修改 Qoder CLI 配置项：
    ```bash
    /config
    ```

### 在无头模式下使用命令

无头模式（又称 Headless 模式）支持执行部分 Prompt 类型命令（`/init`、`/review`、`/quest`）：

```bash
# 执行命令（不包含额外指令）
qodercli -p '/review'

# 执行命令（包含额外指令）
qodercli -p '/review 重点检查注释覆盖情况'
```

## 命令类型

Qoder CLI 中的命令分为两种类型：

| 类型 | 说明 | 适用模式 | 扩展性 |
| :--- | :--- | :--- | :--- |
| **TUI 类型** | 提供交互式界面（如弹出对话框、列表选择） | TUI | 系统内置，不支持自定义 |
| **Prompt 类型** | 向对话中提交预设提示词，指导 CLI 完成特定任务 | TUI + Headless | 支持用户自定义扩展 |

## 内置命令

| 命令 | 类型 | 用途 |
| :--- | :--- | :--- |
| `/agents` | TUI | 查看和管理 Subagent 清单，支持创建、编辑 Subagent 配置 |
| `/bashes` | TUI | 查看和管理后台任务 |
| `/clear` | TUI | 清除当前对话内容，开始新的对话 |
| `/commands` | TUI | 查看和管理自定义命令，支持创建、编辑命令配置 |
| `/compact` | Prompt | 压缩对话历史，可指定关注重点 |
| `/config` | TUI | 配置管理，查看或修改 Qoder CLI 配置项 |
| `/export [filename]` | TUI | 导出当前会话到文件 |
| `/feedback` | TUI | 提交反馈或报告问题 |
| `/help` | TUI | 显示帮助信息 |
| `/init` | Prompt | 初始化项目，分析项目结构并生成 `AGENTS.md` 记忆文件 |
| `/login` | TUI | 登录 Qoder CLI 账号 |
| `/logout` | TUI | 登出 Qoder CLI 账号 |
| `/mcp` | TUI | MCP 服务管理 |
| `/memory` | TUI | 管理记忆文件（AGENTS.md） |
| `/model` | TUI | 查看和管理模型级别设置 |
| `/quest` | Prompt | 智能工作流编排器，多个智能体协同工作，协助用户完成功能开发 |
| `/quit` | TUI | 退出 Qoder CLI |
| `/release-notes` | TUI | 查看版本更新说明 |
| `/resume` | TUI | 恢复之前的会话或对话历史，支持 Tab 键分页切换会话 |
| `/review` | Prompt | 执行代码审查，检查代码质量和规范性 |
| `/setup-github` | TUI | GitHub 集成配置，设置 GitHub 相关功能 |
| `/skills` | TUI | 管理当前工作区的 Skill 命令 |
| `/status` | TUI | 查看当前会话状态和系统信息 |
| `/upgrade` | TUI | 升级订阅计划 |
| `/usage` | TUI | 查看使用情况统计，包括 Token 消耗等信息 |
| `/vim` | TUI | 启用或配置 Vim 模式，提供 Vim 风格编辑体验 |

## 创建自定义命令

Qoder CLI 支持创建 Prompt 类型的自定义命令，通过配置文件定义命令的名称、描述和系统提示词。

### 方式一：AI 辅助生成（推荐）

使用 TUI 内置的 AI 辅助功能快速生成命令配置：

1.  在 TUI 中执行 `/commands` 进入命令配置面板
2.  通过 Tab 键切换到目标标签页（User 或 Project）
3.  使用上下键选择 “Create new command…” 并按 Enter
    ```
    ------------------------------------------------------------------------------------------
    Extend Commands:  [User]  Project
    → Create new command...
    Command list:
    No project commands found.
    Press Enter to select · Esc to exit · Tab to cycle tabs · ↑↓ to navigate
    ```
4.  在输入框中描述期望创建的命令功能，例如：
    > View all git changes and make a good commit
5.  Qoder CLI 会自动生成命令配置文件并保存到对应目录，生成完成后，可以找到配置文件进行
    ```bash
    # 项目级别（Project 标签页）
    .qoder/commands/

    # 用户级别（User 标签页）
    ~/.qoder/commands/
    ```

### 方式二：手动编写配置（进阶）

直接编写 Markdown 格式的命令配置文件，完全控制命令的提示词内容。

#### 配置文件格式

命令配置文件为 Markdown 格式，包含 frontmatter 元数据和系统提示词：

```markdown
---
name: command-name
description: 命令的作用描述，将在 TUI 命令清单中显示
---

这里是命令的系统提示词内容。
当用户执行该命令时，这段提示词会被提交到对话中，指导 CLI 完成特定任务。
可以使用多行文本，支持 Markdown 格式。
```

**字段说明**:

| 字段 | 必填 | 说明 |
| :--- | :--- | :--- |
| **name** | 是 | 命令的唯一名称，用于 `/command-name` 调用 |
| **description** | 是 | 命令的功能描述，支持多行文本（使用 YAML 语法） |

**命名规范**:
*   使用小写字母和连字符（例如 `git-commit`）
*   避免使用空格或特殊字符
*   建议文件名与 `name` 字段保持一致

#### 配置示例

以下是一个用于生成 Git 提交信息的命令配置示例：

```markdown
---
name: git-commit
description: Use this command when you need to review all git changes in the current repository and generate a well-structured commit message. This is particularly useful before committing code changes, especially after completing a feature or fixing a bug.
---

You are an expert Git commit message generator. Your role is to analyze all git changes in the repository and create clear, concise, and meaningful commit messages that follow conventional commit standards.

When analyzing changes, you will:
1. Examine all staged and unstaged changes using `git diff` and related commands
2. Identify the type of changes (feat, fix, chore, docs, style, refactor, test, etc.)
3. Determine the scope of changes (which component/module was affected)
4. Summarize the primary change in a clear subject line (50 characters or less)
5. Provide a detailed body explanation if the changes are complex
6. Follow conventional commit format: `<type>(<scope>): <subject>`

Your commit message structure should be:
- Subject line: Brief summary starting with change type
- Blank line
- Body (if needed): Detailed explanation of what changed and why
- Wrap lines at 72 characters

Best practices you follow:
- Use imperative mood ("add" not "added")
- Be specific about what was changed
- Reference issue numbers when relevant
- Keep subject line under 50 characters
- Explain the 'why' behind significant changes
- Group related changes logically

If you encounter unclear changes or need more context, ask clarifying questions. If there are no changes, inform the user accordingly. Always verify your analysis covers all modifications before generating the final commit message.
```

### 存储位置与优先级

命令配置文件可以存储在项目级或用户级目录中：

| 级别 | 路径 | 生效范围 | 提交到代码仓库 |
| :--- | :--- | :--- | :--- |
| **项目级** | `.qoder/commands/<command_name>.md` | 仅当前项目 | 建议提交（团队共享） |
| **用户级** | `~/.qoder/commands/<command_name>.md` | 所有项目 | 不提交（个人配置） |

*   **优先级**: 如果项目级和用户级存在同名命令，项目级命令优先生效。
*   **重启要求**: 在 Qoder CLI 已启动的情况下，新增或修改命令配置文件后，需要使用 `/quit` 命令退出 TUI，然后重新运行 `qodercli` 以加载新配置。

## 查看和使用自定义命令

### 查看命令详情

1.  在 TUI 中执行 `/commands` 进入命令配置面板
2.  通过 Tab 键切换到目标标签页（User 或 Project）
3.  使用上下键选择目标命令并按 Enter，进入命令详情页面：
    ```
    ------------------------------------------------------------------------------------------
    Extend Commands:  [User]  Project
    Name: git-commit
    Description
    [project] Use this command when you need to review all git changes in the current
    repository and generate a well-structured commit message. This is particularly useful
    before committing code changes, especially after completing a feature or fixing a bug.
    System Prompt
    You are an expert Git commit message generator. Your role is to analyze all git
    changes in the repository and create clear, concise, and meaningful commit messages
    that follow conventional commit standards.
    When analyzing changes, you will:
    ...
    ```
4.  使用 Esc 键退出详情页面

### 执行命令

1.  在 TUI 输入框中输入命令名称（以 `/` 开头），CLI 会自动显示匹配的命令列表：
    ```
    ╭───────────────────────────────────────────────────────╮
    │ > /git-commit                                         │
    ╰───────────────────────────────────────────────────────╯
    /git-commit        [user] Use this command when you need to review all git changes ...
    ```
2.  按 Enter 键发送命令，CLI 会按照命令配置中的系统提示词开始执行任务：
    ```
    > /git-commit
    ● I'll help you create a commit message by analyzing the git changes in your repository.
    Let me first check the current status.
    ● Bash (git status)
    ...
    ```

## 常见问题

### 自定义命令无法识别
*   **问题**: 创建的自定义命令在 TUI 中无法显示或执行
*   **解决方案**:
    *   检查配置文件路径是否正确（`~/.qoder/commands/` 或 `.qoder/commands/`）
    *   检查 frontmatter 格式是否正确（以 `---` 开头和结尾）
    *   重启 CLI（使用 `/quit` 退出后重新运行 `qodercli`）

### Frontmatter 解析失败
*   **问题**: 命令配置的 YAML 格式不正确
*   **解决方案**:
    *   确保 frontmatter 以 `---` 开头和结尾
    *   使用 `|` 语法定义多行 `description` 字段
    *   检查缩进是否正确（YAML 对缩进敏感）

    ```yaml
    ---
    name: my-command
    description: |
      这是第一行描述
      这是第二行描述
    ---
    ```

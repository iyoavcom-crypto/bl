# 使用 CLI

## TUI 模式

在任意项目根目录运行 `qodercli` 即可进入默认的 TUI（交互式）模式。你可以通过文本与 CLI 对话，或使用斜杠命令执行特定功能。

### 输入模式

TUI 提供多种输入模式：

| 命令 | 描述 |
| :--- | :--- |
| `>` | 对话模式（默认）。输入任意文本即可与 CLI 对话 |
| `!` | Bash 模式。在对话模式下输入 `!` 可直接运行 shell 命令 |
| `/` | 斜杠模式。在对话模式下输入 `/` 可打开并运行内置命令 |
| `#` | 记忆模式。在对话模式下输入 `#` 可将内容追加到 `AGENTS.md` 记忆文件 |
| `\` `⏎` | 输入回车，输入多行文本内容 |

### 内置工具

Qoder CLI 内置了 Grep、Read、Write 和 Bash 等工具，可用于文件/目录操作与执行 shell 命令。

### 斜杠命令

使用以下内置斜杠命令可快速访问功能和设置：

| 命令 | 描述 |
| :--- | :--- |
| `/login` | 登录你的 Qoder 账号 |
| `/help` | 显示 TUI 的使用帮助信息 |
| `/init` | 在项目中初始化或更新 `AGENTS.md` 记忆文件 |
| `/memory` | 编辑 `AGENTS.md` 记忆文件 |
| `/quest` | 基于 Spec 的任务委派 |
| `/review` | 对本地代码改动进行评审 |
| `/resume` | 查看会话、恢复指定会话 |
| `/clear` | 清除当前会话的历史上下文 |
| `/compact` | 总结当前会话的历史上下文 |
| `/usage` | 显示当前账户状态、Credits 消耗等信息 |
| `/status` | 查看 Qoder CLI 状态，包括版本、模型、账户、API 连通性、工具状态等 |
| `/config` | 显示 Qoder CLI 的系统配置 |
| `/agents` | 子 Agent 命令：查看、创建、管理子 Agent |
| `/bashes` | 查看当前正在运行的后台 Bash 任务（由 Bash 工具启动） |
| `/release-notes` | 显示 Qoder CLI 的更新日志 |
| `/vim` | 打开外部编辑器以编辑输入 |
| `/feedback` | 反馈 Qoder CLI 相关问题 |
| `/quit` | 退出 TUI |
| `/logout` | 退出你的 Qoder 账号 |

### 高级启动选项

启动 CLI 时，可使用以下选项来控制其行为：

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `-w` | 指定工作区目录 | `qodercli -w /Users/demo/projects/nacos` |
| `-c` | 继续上次会话 | `qodercli -c` |
| `-r` | 恢复指定会话 | `qodercli -r *******-c09a-40a9-82a7-a565413fa39` |
| `--allowed-tools` | 允许使用的工具 | `qodercli --allowed-tools=READ,WRITE` |
| `--disallowed-tools` | 禁止使用的工具 | `qodercli --disallowed-tools=READ,WRITE` |
| `--max-turns` | 最大对话轮数 | `qodercli --max-turns=10` |
| `--yolo` | 跳过权限检查 | `qodercli --yolo` |

## Print 模式

Print 模式为非交互式模式。运行 `qodercli --print` 进入该模式，输出将按 `--output-format` 参数指定格式打印输出，中间过程无需人工干预。

## 参数

Qoder CLI 安装完成后即可在系统中使用 `qodercli` 命令，命令参数及功能介绍如下：

| 参数 | 说明 | 示例 |
| :--- | :--- | :--- |
| `-p` | 以非交互方式运行 Agent | `qodercli -q -p hi` |
| `--output-format` | 输出格式：text、json、stream-json | `qodercli --output-format=json` |
| `-w` | 指定工作区目录 | `qodercli -w /Users/qoder_user/projects/qoder_demo` |
| `-c` | 继续上次会话 | `qodercli -c` |
| `-r` | 恢复指定会话 | `qodercli -r ********-c09a-40a9-82a7-a565413fa393` |
| `--allowed-tools` | 仅允许指定工具 | `qodercli --allowed-tools=READ,WRITE` |
| `--disallowed-tools` | 禁止指定工具 | `qodercli --disallowed-tools=READ,WRITE` |
| `--max-turns` | 最大对话轮数 | `qodercli --max-turns=10` |
| `--yolo` | 跳过权限检查 | `qodercli --yolo` |

## MCP 服务

Qoder CLI 可与标准 MCP 工具集成，只需添加该工具的 MCP 服务即可开始使用。例如，要通过 Playwright 启用浏览器控制，请运行以下命令：

```bash
qodercli mcp add playwright -- npx -y @playwright/mcp@latest
```

### 管理 MCP

*   使用 `-t` 设置 MCP 服务类型：stdio、sse、streamable-http，Stdio 类型 Server 在 TUI 启动时会被自动拉起。
*   使用 `-s` 设置范围：用户级或项目级，必要时可按项目配置 MCP 服务。

使用以下命令管理已添加的 MCP 服务：

```bash
# 列出 MCP 服务
qodercli mcp list

# 移除 MCP 服务
qodercli mcp remove playwright
```

### MCP 服务文件

已添加的 MCP 服务会保存在项目中的以下文件中。

```bash
# 为当前用户或特定项目添加，不会被提交。
~/.qoder.json

# 为当前项目添加，通常会被提交。
${project}/.mcp.json
```

### 推荐工具

```bash
qodercli mcp add context7 -- npx -y @upstash/context7-mcp@latest
qodercli mcp add deepwiki -- npx -y mcp-deepwiki@latest
qodercli mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

## Permission

Qoder CLI 对工具的执行具有细粒度权限控制，具体可以在如下配置文件中进行配置，配置文件的优先级依次递增：

```
~/.qoder/settings.json
${project}/.qoder/settings.json
${project}/.qoder/settings.local.json（通常添加到 .gitignore）
```

### 配置

Qoder CLI 通过三种核心策略进行权限控制：Allow、Deny 和 Ask。它们可与特定工具的规则组合，用于针对项目或用户进行更精细的访问管理。默认情况下，CLI 对于所选项目目录之外的文件访问采用更安全的“Ask”策略，同时在启动时会在项目目录内自动创建标准的读/写规则。所有策略均可完全自定义，以适配你的工作流程。

```json
{
  "permissions": {
    "ask": [
      "Read(!/Users/qoder_user/Documents/codes/go-micro/**)",
      "Edit(!/Users/qoder_user/Documents/codes/go-micro/**)"
    ],
    "allow": [
      "Read(/Users/qoder_user/Documents/codes/go-micro/**)",
      "Edit(/Users/qoder_user/Documents/codes/go-micro/**)"
    ],
    "deny": []
  }
}
```

### 不同类型的配置规则

**读取与编辑（Read & Edit）**
读取规则适用于所有读文件的工具，如 Grep、Glob 和 LS。模式遵循 gitignore 风格的匹配。支持的模式形式包括：

| 模式 | 描述 | 示例 | 匹配 |
| :--- | :--- | :--- | :--- |
| `/path` | 从系统根目录起的绝对路径 | `Read(/Users/qoder_user/demo/**)` | `/Users/qoder_user/demo/xx` |
| `~/path` | 从 Home 目录起的路径 | `Read(~/Documents/xx.png)` | `/Users/qoder_user/Documents/xx.png` |
| `path` 或 `./path` | 相对于当前目录的路径 | `Read(xx.java)` | `./xx.java` |

**WebFetch**
限制网络抓取工具可访问的域名。
`WebFetch(domain:example.com)`：将抓取限制为 `example.com`

**Bash**
限制 shell 执行工具可运行的命令。
*   `Bash(npm run build)`：匹配与 npm run build 完全相同的命令
*   `Bash(npm run test:*)`：匹配以 npm run test 开头的命令
*   `Bash(curl http://site.com/:*)`：匹配以 curl `http://site.com/` 开头的 curl 命令

## Worktree

Worktree 任务是一种并行任务（Concurrent Jobs），通过 CLI 内置的 `--worktree` 参数启动。你可以为单个 Git 仓库创建多个 Worktree 并行执行任务，避免多个 CLI 进程产生读写文件冲突。

**要求**：确保本地已安装并可使用 Git。

| 命令 | 描述 |
| :--- | :--- |
| `qodercli --worktree "job description"` | 创建并启动新的 worktree 任务 |
| `qodercli jobs --worktree` | 查看当前所有已创建的任务 |
| `qodercli rm` | 删除指定任务（删除容器） |

### 创建任务

切换到目标代码仓库根路径，执行如下命令启动任务，启动成功后默认进入容器内 CLI 的 TUI。

```bash
qodercli --worktree "Your job description"
```

*   添加 `-p` 参数任务以非交互模式在容器中运行，任务结束后停止容器。
*   添加 `--branch` 参数指定任务工作的代码分支。
*   其他 Agent 相关参数（如 `--max-turns`），将会透传给容器内启动的 CLI 命令。

你可以打开多个终端启动多个任务，多个任务之间通过 Worktree 隔离。

### 查看任务

可以通过 Jobs 子命令查看当前代码仓库已经创建的并行任务，如下所示：

```bash
$ qodercli jobs --worktree
Qoder jobs for workspace: /Users/linus/qoder/qodercli

Worktree Jobs:
ID               INIT PROMPT    PATH                              STATUS      CREATED
11758283139787   [I] 你好       ~/.qoder/worktrees/11758283139787   running     5 minutes ago
11758283382928   [N] 你好       ~/.qoder/worktrees/11758283382928   exited      1 minute ago
11758283399820   [N] 你好       ~/.qoder/worktrees/11758283399820   exited      1 minute ago

Total: 3 worktree job(s)
```

**字段说明**：
*   **ID**：任务唯一标识（非容器 ID）
*   **INIT PROMPT**：初始的任务描述（未来会改成 AI 自动总结的标题）
*   **PATH**：git worktree 目录
*   **STATUS**：与容器状态一致
*   **CREATED**：任务创建时间

### 删除任务

使用 rm 子命令删除任务（本质上是删除任务所运行的 worktree）：

```bash
qodercli rm <jobId>
```

> **注意**：删除操作不可恢复，请谨慎进行。

## Memory

Qoder CLI 使用 `AGENTS.md` 作为记忆文件，记忆文件中定义的记忆文件会自动被加载到 CLI 中，并作为 CLI 的上下文内容来指导开发过程。典型内容包括：
*   开发规范与说明
*   整体系统架构
*   ...

### 存储位置

记忆文件支持存储在如下两个位置，具有不同的生效范围，Qoder CLI 在启动时会自动加载到上下文中。

```bash
# 用户级别，适用于所有项目
~/.qoder/AGENTS.md

# 项目级别，适用于当前项目
${project}/AGENTS.md
```

### 自动生成记忆
CLI 提供了自动生成记忆文件的功能，在目标项目中启动 TUI 并输入 `/init` 命令，CLI 会自动生成一个记忆文件，并保存在项目目录下，默认名称为 `AGENTS.md`。

### 手动编辑记忆
*   在项目中创建 `AGENTS.md` 并编辑其内容。
*   在 TUI 中输入 `#` 进入记忆编辑模式，使用类似 Vim 的方式编辑项目记忆文件。
*   在 TUI 中输入 `/memory` 以选择并编辑用户级或项目级的记忆文件。

## Subagent

Subagent 是 Qoder CLI 中专门用于处理特定任务的 AI Agent，每个 Subagent 有自己独立的上下文窗口和工具权限，可以配置自定义系统提示来指导其行为，通过合理使用可以显著改善复杂任务的处理能力。

### 手动创建

首先，在以下位置创建一个 Markdown 文件：
*   `~/.qoder/agents/<agentName>.md`：用户级，适用于所有项目
*   `${project}/agents/<agentName>.md`：项目级，适用于当前项目

接着定义你的 Subagent，Subagent 的 Markdown 文件必须包含一个 frontmatter 区块，其中定义 name、description 和 tools 字段，以及主系统提示词（system prompt）。例如：

```markdown
---
name: code-review
description: 代码审查专家，检查代码质量和安全性
tools: Read, Grep, Glob, Bash
---

你是一位资深代码审查员，负责确保代码质量。

审查清单:
1. 代码可读性
2. 命名规范
3. 错误处理
4. 安全性检查
5. 测试覆盖
...
```

### 自动创建

在 TUI 中输入 `/agents`。按 Tab 选择 `User` 或 `Project`，然后选择 `Create new agent`，并输入你希望自动创建的 Subagent 的描述。

### 使用 Subagent

在 TUI 模式下，使用命令 `/agent` 查看 Subagent。你可以显式或隐式地调用 Subagent 来完成任务。例如：

```bash
> 使用 code-review subagent 检查代码问题 # 显示调用
> 分析这段代码有没有潜在性能问题 # 隐式调用
> 审查这个接口的相关实现 # 隐式调用
> 先使用 design subagent 完成系统设计，再使用 code-review subagent 继续完成代码review # 串联调用
```

## 命令

命令通过 `.md` 文件扩展斜杠指令功能。可将常用提示定义为命令，以在 TUI 中触发任务。

### 创建命令

将命令定义存放在：
*   `~/.qoder/commands/.md`：用户级，适用于所有项目
*   `${project}/commands/.md`：项目级，仅适用于当前项目

### 示例

按以下方式定义一个命令，并将其保存到 `~/.qoder/commands/quest.md` 中。

```markdown
---
description: "Intelligent workflow orchestrator that guides users through feature development using specialized subagents"
---
先使用 design subagent 完成系统设计，再使用 code-review subagent 继续完成代码review
```

### 使用命令

在 TUI 模式下，输入 `/quest` 触发指令，命令执行过程中会按照提示词先后调用两个 Subagent 完成任务。

## Hooks

Qoder CLI 提供了任务执行关键阶段的 Hook 能力，可以方便地与外部进行集成，如发送通知、调用外部工具等。

### 配置

Qoder CLI 的 Hooks 通过配置文件定义，配置文件可以存放在如下位置：
*   `~/.qoder/settings.json`：用户级，适用于所有项目
*   `${project}/.qoder/settings.json`：项目级，适用于当前项目
*   `${project}/.qoder/settings.local.json`：项目级，优先级最高（通常加入 .gitignore）

### 示例

安装脚本在 `.qoder/settings.json` 文件中添加如下 hooks 字段配置：

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/notification.sh"
          }
        ]
      }
    ]
  }
}
```

创建 `~/notification.sh` 脚本文件，并填入如下内容，在脚本中可以通过标准输入获取 CLI 写入的配置信息，从而指导相关的操作。

```bash
#!/bin/bash
input=$(cat)
sessionId=$(echo $input | jq -r '.session_id')
messageInfo=$(echo $input | jq -r '.message')
workspacePath=$(echo $input | jq -r '.cwd')

if [[ "$messageInfo" =~ ^Agent ]]; then
  osascript -e 'display notification "✅ 你提交的任务执行完成啦～" with title "QoderCLI"'
else
  osascript -e 'display notification "⌛️ 你提交的任务需要授权呀…" with title "QoderCLI"'
fi

exit 0
```

目前，Qoder CLI 仅支持通知类 Hooks。不同的 hook 阶段可介入 Agent 的主执行流，同时与 CLI 保持解耦。后续将提供更多 Hook 类型（例如：工具调用、会话干预），以拓展集成场景。

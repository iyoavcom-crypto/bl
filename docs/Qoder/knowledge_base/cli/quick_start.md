# 快速上手

## 安装

*   **支持的操作系统**：macOS、Linux、Windows（Windows Terminal）
*   **支持的 CPU 架构**：arm64、amd64
    *   *Windows (arm64) 暂时不支持。*

你可以通过以下方式安装：

**cURL**
```bash
curl -fsSL https://qoder.com/install | bash
```

**Homebrew**（macOS、Linux）
```bash
brew install qoderai/qoder/qodercli --cask
```

**NPM**
```bash
npm install -g @qoder-ai/qodercli
```

安装完成后，运行下列命令。如果打印出 CLI 版本号，则表示安装成功。
```bash
qodercli --version
```

## 登录

在使用 Qoder 之前需要完成身份验证。首次执行命令时，CLI 会自动提示你登录。

有两种主要的身份验证方式：
1.  交互式登录（推荐）
2.  环境变量（用于自动化脚本）

### 方法一：通过 TUI 登录

此方法支持你直接在终端的文本用户界面（TUI）中登录。

```bash
# 在终端中启动 Qoder CLI
qodercli

# 在交互式提示符中,输入 /login
/login
```

选择需要的登录方式：
*   **login with browser**: 这会在你的默认浏览器中打开登录页面以完成身份验证。
*   **login with qoder personal access token**: 系统会提示你将 Qoder Personal Access Token 直接粘贴到终端。

在你做出选择后，应用会引导你完成最后的步骤。

> 你可以在此页面获取 Personal Access Token：https://qoder.com/account/integrations

### 方法二：通过环境变量登录

对于非交互式会话或自动化环境（例如 CI/CD 流水线），你可以通过设置环境变量进行身份验证。

```bash
# Linux/macOS 示例
export QODER_PERSONAL_ACCESS_TOKEN="your_personal_access_token_here"
```

```bash
# Windows 示例(命令提示符)
set QODER_PERSONAL_ACCESS_TOKEN="your_personal_access_token_here"
```

> 如果同时通过 `/login` 命令和该环境变量设置了有效令牌，则以 `/login` 提供的令牌为准。

## 使用

现在你已登录，可参考 [使用 CLI](file:///absolute/path/to/docs/Qoder/knowledge_base/cli/using_cli.md) 了解如何使用 Qoder CLI。

## 升级

默认启用自动升级。你也可以使用以下方法手动升级：

**cURL**
```bash
curl -fsSL https://qoder.com/install | bash -s -- --force
```

**Homebrew**（macOS、Linux）
```bash
brew update && brew upgrade
```

**NPM**
```bash
npm install -g @qoder-ai/qodercli
```

**使用内置的更新功能**
```bash
qodercli update
```

要禁用自动更新，请在 `~/.qoder.json` 中将 `autoUpdates` 设置为 `false`。

```json
{
  "autoUpdates": false,
  "...": "..."
}
```

## 退出登录

当你需要登出 Qoder 时，可使用 `/logout` 命令退出登录。

```bash
# 在交互式提示符中,输入 /logout
/logout
```

> 如果你是通过 `QODER_PERSONAL_ACCESS_TOKEN` 环境变量完成认证的，在运行 `/logout` 之前必须先清除该环境变量。

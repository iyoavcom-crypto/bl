# 终端执行异常

## 简介

在使用 Qoder 智能体模式时，终端执行高度依赖于你的本地环境和 shell 配置。你可能会遇到以下问题：

*   无法启动终端
*   命令无法执行
*   没有任何输出

本文档提供系统化的排查方法，帮助你快速定位并解决这些问题。

## 常见故障排查方法

### 方法 1：配置受支持的 shell

Qoder 支持多种 shell。请确保你使用的是兼容的 shell。

1.  打开 Qoder。
2.  按下 `Cmd + Shift + P`（macOS）或 `Ctrl + Shift + P`（Windows/Linux）打开命令面板（Command Palette）。
3.  输入 `Terminal: Select Default Profile` 并选择该项。
4.  选择一个受支持的 shell：
    *   **Linux/macOS**：`bash`、`fish`、`pwsh`、`zsh`
    *   **Windows**：`Git Bash`、`pwsh`
5.  完全关闭并重新打开 Qoder 以使更改生效。

### 方法 2：手动安装 shell 集成

如果终端集成仍然失败，请在 shell 的配置文件中添加相应语句来手动安装 shell 集成。

*   **zsh** (`~/.zshrc`)：
    ```bash
    [[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"
    ```

*   **Bash** (`~/.bashrc`)：
    ```bash
    [[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"
    ```

*   **PowerShell** (`$Profile`)：
    ```powershell
    if ($env:TERM_PROGRAM -eq "vscode") { . "$(code --locate-shell-integration-path pwsh)" }
    ```

*   **Fish** (`~/.config/fish/config.fish`)：
    ```fish
    string match -q "$TERM_PROGRAM" "vscode"; and . (code --locate-shell-integration-path fish)
    ```

编辑配置文件后：
1.  保存更改。
2.  完全重启 Qoder。
3.  如需其他 shell 的配置方法，请参阅 [VS Code 官方文档](https://code.visualstudio.com/docs/terminal/shell-integration)。

### 如果问题仍然存在

如果你仍然看不到终端输出：

1.  点击 **Terminate Terminal** 按钮以关闭当前终端会话。
2.  重新运行该命令。这会刷新终端连接，通常能解决临时性问题。

## Windows 专属故障排除

### Git Bash

1.  从 https://git-scm.com/downloads/win 下载并安装 Windows 版 Git。
2.  退出并重新打开 Qoder。
3.  将 Git Bash 设为默认终端：
    a. 打开命令面板（Command Palette）。
    b. 运行：`Terminal: Select Default Profile`。
    c. 选择 **Git Bash**。

### PowerShell

**1. 确保使用 PowerShell 7 或更高版本**
查看当前版本：
```powershell
$PSVersionTable.PSVersion
```
如果版本低于 7，请从 [Microsoft PowerShell 文档](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell) 下载并安装。

**2. 调整执行策略**
默认情况下，PowerShell 会限制脚本执行。你可能需要调整执行策略：

a. 以管理员身份打开 PowerShell：按下 `Win + X` 选择 **Windows PowerShell（管理员）** 或 **Windows Terminal（管理员）**
b. 检查当前策略：
```powershell
Get-ExecutionPolicy
# 如果输出是 RemoteSigned、Unrestricted 或 Bypass，您可能不需要更改执行策略。这些设置应该允许 shell 集成正常工作。
# 如果输出是 Restricted 或 AllSigned，您可能需要更改策略以启用 shell 集成。
```
c. 如需修改，为当前用户设置策略：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# 这将仅为当前用户设置 RemoteSigned 策略，比系统级更改更安全。
```
d. 在出现提示时按 `Y` 确认，然后验证：
```powershell
Get-ExecutionPolicy
```
e. 重启 Qoder 后重试。

### WSL

如果使用 Windows Subsystem for Linux（WSL）：

1.  在你的 `~/.bashrc` 中添加以下一行：
    ```bash
    . "$(code --locate-shell-integration-path bash)"
    ```
2.  重新加载你的 shell，或运行 `source ~/.bashrc`。
3.  在 Qoder 中再次尝试该终端命令。

## 异常终端输出

**症状**：
*   乱码、方块符号
*   转义序列（例如：`^[[1m`、`^[[32m`）
*   命令输出被截断或格式混乱

**可能原因**：
第三方 shell 个性化配置，例如 Powerlevel10k、Oh My Zsh、自定义的 fish 主题。

### 方案一：为 Agent 执行终端禁用复杂提示或主题（长期使用）

通过检查 `QODER_AGENT` 这个环境变量来判断 Agent 是否正在运行。如果是，在启动 Shell 时不加载复杂的主题或提示符配置，从而避免问题。

```bash
# ~/.zshrc — 当 Qoder Agent 终端执行时禁用 Powerlevel10k
if [[ -n "$QODER_AGENT" ]]; then
    # 跳过主题初始化以获得更好的兼容性
else
    [[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh
fi
```

```bash
# ~/.bashrc — 在 Qoder Agent 终端执行中回退到简单提示符
if [[ -n "$QODER_AGENT" ]]; then
    PS1='\u@\h \W \$ '
fi
```

### 方案二：暂时禁用

在 shell 配置文件中注释掉主题相关配置，重启 Qoder 测试。如果问题解决，逐项重新启用以定位冲突组件。

例如，在 `~/.zshrc` 中注释 Powerlevel10k：
```bash
# source /path/to/powerlevel10k/powerlevel10k.zsh-theme
```

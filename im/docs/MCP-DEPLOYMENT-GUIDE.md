# MCP服务器部署和使用指南

## 概述

本文档详细介绍如何部署和使用IM-API的MCP (Model Context Protocol) 服务器。

## 部署方式

### 1. 直接运行编译后的文件

```bash
# 在项目根目录下运行
node mcp-server/mcp-server.mjs
```

### 2. 使用TypeScript源文件运行

```bash
# 需要安装tsx
npm install -g tsx

# 运行TypeScript源文件
npx tsx mcp-server/index.ts
```

### 3. 作为npm脚本运行

在`package.json`中添加：

```json
{
  "scripts": {
    "mcp-server": "node mcp-server/mcp-server.mjs",
    "mcp-server:dev": "tsx mcp-server/index.ts"
  }
}
```

然后运行：
```bash
npm run mcp-server
# 或开发模式
npm run mcp-server:dev
```

## 配置AI助手集成

### Claude Desktop配置

在Claude Desktop的配置文件中添加MCP服务器配置：

**Windows**: `%APPDATA%\Claude\claude-desktop-config.json`
**macOS**: `~/Library/Application Support/Claude/claude-desktop-config.json`

```json
{
  "mcpServers": {
    "im-api": {
      "command": "node",
      "args": ["C:\\Users\\your-username\\Desktop\\333333\\im\\mcp-server\\mcp-server.mjs"],
      "env": {}
    }
  }
}
```

### Cursor配置

在Cursor的设置中配置MCP服务器：

1. 打开设置 (Ctrl/Cmd + ,)
2. 搜索 "MCP"
3. 添加新的MCP服务器配置

### 其他AI助手

大多数支持MCP协议的AI助手都可以通过类似的方式配置。

## 使用示例

### 基本使用

一旦MCP服务器启动并集成到AI助手中，就可以使用以下功能：

```typescript
// 搜索API接口
// 在AI助手中提问："搜索登录相关的API"

// 获取模块API列表
// 在AI助手中提问："获取用户模块的所有API"

// 生成代码示例
// 在AI助手中提问："为/api/auth/login生成TypeScript代码示例"

// 获取错误码信息
// 在AI助手中提问："401错误是什么意思"
```

### 常用查询示例

1. **API查询**
   - "搜索消息相关的API"
   - "获取设备管理模块的所有接口"
   - "查找用户注册API"

2. **代码生成**
   - "为发送消息API生成React Native代码"
   - "生成WebSocket连接管理器"
   - "创建用户认证客户端"

3. **错误诊断**
   - "401错误怎么解决"
   - "设备不存在错误的原因"
   - "WebSocket连接失败怎么办"

4. **业务流程**
   - "用户登录的完整流程"
   - "发送消息的步骤"
   - "创建群组的过程"

## 服务器功能详解

### 工具 (Tools)

MCP服务器提供11个核心工具：

1. **search_api** - 搜索API接口
2. **get_module_apis** - 获取模块API列表
3. **search_ws_event** - 搜索WebSocket事件
4. **get_all_ws_events** - 获取所有WebSocket事件
5. **get_enums** - 获取枚举常量
6. **generate_api_code** - 生成API代码示例
7. **generate_ws_handler** - 生成WebSocket处理代码
8. **get_flow** - 获取业务流程说明
9. **generate_api_client** - 生成API客户端
10. **generate_ws_manager** - 生成WebSocket管理器
11. **get_error_codes** - 获取错误码信息

### 资源 (Resources)

4个可读取的资源：

1. **im://api/all** - 所有API列表
2. **im://ws/events** - WebSocket事件列表
3. **im://types** - TypeScript类型定义
4. **im://guide/expo** - Expo接入指南

### 提示 (Prompts)

2个预定义提示：

1. **implement_feature** - 实现功能指南
2. **debug_api** - 调试API问题

## 故障排除

### 常见问题

1. **服务器启动失败**
   - 检查Node.js版本（需要18+）
   - 确认依赖包已安装
   - 检查端口是否被占用

2. **AI助手无法连接**
   - 验证配置文件路径正确
   - 检查命令路径是否正确
   - 确认服务器正在运行

3. **功能不可用**
   - 重启AI助手
   - 重新加载MCP配置
   - 检查服务器日志

### 日志查看

```bash
# 查看服务器输出
node mcp-server/mcp-server.mjs

# 或者重定向到文件
node mcp-server/mcp-server.mjs > mcp-server.log 2>&1
```

## 性能优化

### 启动优化

```bash
# 使用编译后的JavaScript文件（更快启动）
node mcp-server/mcp-server.mjs

# 而不是TypeScript源文件
# npx tsx mcp-server/index.ts
```

### 内存管理

MCP服务器设计为轻量级，通常占用内存很少。如果遇到内存问题：

1. 重启服务器
2. 检查是否有内存泄漏
3. 考虑增加系统内存

## 安全考虑

### 访问控制

- MCP服务器本身不处理认证
- 通过AI助手的配置控制访问
- 建议在受信任的环境中运行

### 数据安全

- 服务器只提供文档和代码生成功能
- 不直接访问用户数据
- 所有敏感信息通过AI助手处理

## 更新和维护

### 版本更新

```bash
# 拉取最新代码
git pull origin main

# 重启服务器
# Ctrl+C 停止当前服务器
node mcp-server/mcp-server.mjs
```

### 自定义扩展

可以根据需要扩展MCP服务器功能：

1. 在`mcp-server/data.ts`中添加新的API定义
2. 在`mcp-server/index.ts`中实现新的工具
3. 重新编译并重启服务器

## 支持和反馈

如有问题或建议，请：
1. 检查本文档和FAQ
2. 查看服务器日志
3. 在项目GitHub提交issue
4. 联系项目维护者
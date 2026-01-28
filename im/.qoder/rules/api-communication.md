---
trigger: model_decision
description: 更新API时，修改API逻辑时
---
# API/通讯更新规范

## MCP文档同步机制

当API接口或通讯协议发生变更时，必须同步更新以下文档：

### 必须更新的文件

1. **MCP服务器数据定义** (`mcp-server/data.ts`)
   - 更新 `API_MODULES` 数组中的接口定义
   - 更新 `WS_EVENTS` 数组中的事件定义
   - 保持与实际后端API严格一致

2. **MCP API参考文档** (`docs/MCP-API-REFERENCE.md`)
   - 更新工具列表
   - 更新资源列表
   - 更新WebSocket事件类型
   - 更新枚举常量

3. **MCP部署指南** (`docs/MCP-DEPLOYMENT-GUIDE.md`)
   - 如有部署方式变更需更新

### 更新流程

```
1. 修改后端API代码
2. 同步更新 mcp-server/data.ts
3. 生成新的MCP API参考文档
4. 验证MCP服务器功能
5. 提交所有变更
```

## API变更检查清单

每次API变更必须检查：

- [ ] 接口路径是否正确
- [ ] HTTP方法是否匹配
- [ ] 请求参数定义是否完整
- [ ] 响应格式是否准确
- [ ] 认证要求是否明确
- [ ] 错误码是否更新

## WebSocket事件变更检查清单

每次WebSocket事件变更必须检查：

- [ ] 事件类型名称是否规范
- [ ] 事件载荷格式是否正确
- [ ] 事件触发条件是否明确
- [ ] 事件处理示例是否提供

## 文档一致性验证

### 自动验证脚本

```bash
# 验证MCP数据与文档一致性
npm run verify-mcp-consistency

# 生成MCP API文档
npm run generate-mcp-docs
```

### 手动验证步骤

1. 对比 `mcp-server/data.ts` 与 `docs/MCP-API-REFERENCE.md`
2. 确认所有API端点都有对应文档
3. 确认所有WebSocket事件都有对应文档
4. 确认枚举常量与实际代码一致

## 版本控制要求

- API变更必须通过Git提交
- 每次变更需包含变更说明
- 重大变更需更新版本号
- 保持向后兼容性

## 强制同步机制

违反此规范将导致：
- 构建失败
- MCP服务器功能异常
- 文档与实际功能不符
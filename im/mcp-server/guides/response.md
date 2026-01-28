# 统一响应结构

## 响应类型定义

```typescript
/** 业务响应码 */
type ApiCode = "OK" | "Created" | "BadRequest" | "Unauthorized" | "Forbidden" | "NotFound" | "ServerError";

/** 成功响应结构 */
interface ApiOk<T> {
  code: ApiCode;
  data: T;
  message?: string;
}

/** 错误响应结构 */
interface ApiError<TDetails = unknown> {
  code: ApiCode;
  message: string;
  details?: TDetails;
}

/** 分页元信息 */
interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/** 分页响应结构 */
interface PagedResponse<T> {
  code: ApiCode;
  data: T[];
  meta: Pagination;
  message?: string;
}
```

## 成功响应示例

### 单条数据响应 (200 OK)
```json
{
  "code": "OK",
  "data": {
    "id": "user_123",
    "name": "张三",
    "phone": "13800138000"
  },
  "message": "获取成功"
}
```

### 创建成功响应 (201 Created)
```json
{
  "code": "Created",
  "data": {
    "id": "msg_456",
    "content": "Hello",
    "createdAt": "2026-01-27T10:00:00Z"
  },
  "message": "创建成功"
}
```

### 分页响应 (200 OK)
```json
{
  "code": "OK",
  "data": [
    { "id": "1", "name": "Alice" },
    { "id": "2", "name": "Bob" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "pages": 5
  }
}
```

## 错误响应示例

### 400 Bad Request
```json
{
  "code": "BadRequest",
  "message": "参数校验失败",
  "details": [
    { "field": "phone", "message": "手机号格式不正确" },
    { "field": "password", "message": "密码长度不能少于6位" }
  ]
}
```

### 401 Unauthorized
```json
{
  "code": "Unauthorized",
  "message": "未认证或令牌已过期"
}
```

### 403 Forbidden
```json
{
  "code": "Forbidden",
  "message": "无权限执行该操作"
}
```

### 404 Not Found
```json
{
  "code": "NotFound",
  "message": "资源不存在"
}
```

### 500 Server Error
```json
{
  "code": "ServerError",
  "message": "服务器内部错误"
}
```

## 分页参数

请求分页列表时，使用以下查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码（从1开始） |
| pageSize | number | 20 | 每页条数（1-200） |

示例：`GET /api/im/friends?page=1&pageSize=20`

## 前端处理建议

```typescript
// 类型定义
interface ApiOk<T> {
  code: string;
  data: T;
  message?: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// 响应处理
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const json = await response.json();
  
  if (!response.ok) {
    const error = json as ApiError;
    throw new Error(error.message);
  }
  
  return (json as ApiOk<T>).data;
}
```

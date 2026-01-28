# 数据库

## 概述

Qoder 支持将 JetBrains IDE 中的数据库连接作为 AI 上下文。通过 `@database` 功能，AI 可以基于真实的数据库表结构生成 SQL、进行架构分析或生成相关代码。

## 前置条件

在使用数据库功能前，需要先在 JetBrains IDE 中配置数据库连接：

1.  打开数据库工具窗口
2.  创建数据库连接
3.  测试连接是否正常

详细配置说明：[JetBrains 帮助文档](https://www.jetbrains.com/help/idea/database-tool-window.html)

## 使用方式

### 在 Ask/Agent 模式中引用数据库

1.  **添加数据库到上下文**：
    *   在 Qoder 输入框中点击「Add Context」
    *   选择 `@database`
    *   选择目标数据库 Schema

    > **注意**：
    > *   添加到上下文中的 SQL 文件是基于数据库的 schema 生成的
    > *   如果一个数据库有多个 schema，会生成多个对应的 schema SQL 文件

2.  **添加后，可以直接向 AI 提问数据库相关问题**，例如：
    *   生成查询某表的 SQL
    *   分析表结构设计
    *   基于表结构生成代码

3.  **执行生成的 SQL**：
    *   Ask 模式返回的 SQL 代码块会带有执行按钮。点击可直接执行。

    > **注意**：Qoder 会在当前活跃的数据库 Query Console 中执行 SQL，因此需要提前打开对应数据库的 Query Console。

### 在 Query Console 中生成 SQL

1.  打开数据库的 Query Console
2.  按 `Ctrl + Shift + I`
3.  输入自然语言描述
4.  回车生成 SQL

Qoder 会自动使用当前数据库的 schema 作为上下文。

### 使用斜杠指令

可以创建自定义指令快速完成常见操作。

**创建指令**：
1.  点击 Qoder 窗口的个人头像
2.  选择「个人设置」→「指令」
3.  创建新指令

**调用指令**：
在 Qoder 对话框中输入 `/` 加指令名称即可调用，例如输入 `/sql` 调用 SQL 生成指令。

**常用指令示例**：

*   **生成 SQL（/sql）**：
    > 基于当前数据库 schema 生成 SQL 语句
*   **数据库审查（/db-review）**：
    > 审查数据库 schema，检查：命名规范、索引设计、数据类型、表关系
*   **生成测试数据（/mock-data）**：
    > 基于表结构生成 INSERT 测试数据

> **提示**：如果指令只涉及数据库操作（如 NL2SQL），可在开头添加「Don’t scan project files!」，这样不会扫描项目文件，可以节省 token 并避免歧义。注意 `AGENTS.md` 和 Rules 文件仍会被包含。

### 在 DataGrip 中使用

**添加 Qoder 到工具栏**：
1.  点击顶部「…」图标
2.  选择「Qoder」
3.  点击大头针固定

**使用方法**：
在 Query Console 中点击 Qoder 按钮或按快捷键 `Ctrl + Shift + I`，Qoder 会自动选择对应的数据库 schema。

> **建议**：在项目目录下添加 `AGENTS.md` 文件，用于说明表命名规范、SQL Guideline 或特定的数据标注等项目约定。

## 实用场景

### 数据库设计

#### Agent 模式（适用于复杂场景）

**适用于**：
*   需要参考设计文档
*   需要生成符合特定规范的 SQL
*   需要生成特定格式的迁移脚本（如 Flyway）

**操作步骤**：
1.  在 Agent 模式添加相关文档到上下文
2.  以自然语言描述需求
3.  生成 SQL 文件
4.  打开 SQL 文件并执行

#### Query Console 模式（适用于简单场景）

**适用于**：
*   简单的数据库结构设计
*   表结构调整
*   微小改动

**操作步骤**：
1.  打开数据库 Schema 的 Query Console
2.  输入需求
3.  调整并执行生成的 SQL

### 数据库设计最佳实践

**提供表结构示例**：
如果有标准的表结构样例，可以提供给 Qoder 作为参考：

```sql
-- 表级别注释示例
CREATE TABLE user_info (
id INT COMMENT '用户ID (标准字段名: user_id, 主键)',
name VARCHAR(50) COMMENT '用户姓名 (标准字段名: name, 用户真实姓名)',
created_at DATETIME COMMENT '注册时间 (标准字段名: created_at, 账号创建时间)',
status TINYINT COMMENT '状态 (标准字段名: status, 枚举值: 0-禁用 1-正常 2-冻结)',
PRIMARY KEY (id)
) COMMENT='用户基本信息表 | 标准表名: user_information | 业务域: 用户域 | 更新方式: 实时';
```

**设计规范建议**：

*   **命名规范**：
    *   使用清晰描述性的名称，表名和字段名能直接表达含义（如 `user`、`order_item`），建议采用单数形式
    *   保持命名一致性，统一使用下划线命名法（snake_case）或驼峰命名法
    *   避免缩写，用 `customer_address` 而非 `cust_addr`
    *   布尔字段加前缀，如 `is_active`、`has_paid`
*   **结构设计**：
    *   主键明确，每个表都有清晰的主键，命名为 `id` 或 `table_name_id`
    *   外键关系清晰，外键命名如 `user_id`、`order_id`，明确指向关联表
    *   添加时间戳，包含 `created_at`、`updated_at` 字段
*   **文档和注释**：
    *   添加表注释，说明表的用途
    *   添加字段注释，解释字段含义、取值范围、单位等
    *   枚举值说明，如状态字段，注释说明每个值的含义
*   **类型选择**：
    *   使用合适的数据类型，避免全用 VARCHAR
    *   设置合理的长度限制
    *   NULL 值策略明确，哪些字段允许 NULL，哪些必填
    *   默认值明确，如果有明确的默认值，需要指出

### 标注遗留数据库

对于命名不规范的遗留数据库，可以使用 JSON 文件进行标注，让 AI 更好地理解数据库结构。

**示例场景**：
假设有以下遗留数据库表：

```sql
CREATE TABLE tbl_yonghu (
id        BIGINT AUTO_INCREMENT PRIMARY KEY,
xin_bie   CHAR(2)     NOT NULL,
nian_ling INT         NOT NULL,
gonghao   VARCHAR(32) NOT NULL UNIQUE,
jiru_date VARCHAR(32)
);
```

如果无法调整现有数据库结构，可以创建 `db-metadata.json` 文件进行标注：

```json
{
  "type": "database",
  "description": "数据库表结构标注，以这里的定义为准",
  "tables": {
    "tbl_yonghu": {
      "label": "用户表",
      "description": "存储系统用户信息",
      "required": [
        "id",
        "xin_bie",
        "nian_ling",
        "gonghao"
      ],
      "columns": {
        "id": {
          "label": "用户ID",
          "type": "int",
          "description": "唯一标识"
        },
        "xin_bie": {
          "label": "性别",
          "type": "char(2)",
          "description": "用户性别",
          "enum": ["男", "女"]
        },
        "nian_ling": {
          "label": "年龄",
          "type": "int",
          "description": "用户年龄"
        },
        "gonghao": {
          "label": "工号",
          "type": "varchar(16)",
          "description": "用户的工号",
          "unique": true
        },
        "jiru_date": {
          "label": "加入时间",
          "type": "varchar(16)",
          "description": "用户加入的时间",
          "format": "date",
          "nullable": true
        }
      }
    }
  }
}
```

**使用方法**：
在添加数据库 schema 到上下文时，同时添加该 JSON 标注文件。Qoder 在理解数据库结构时会参考该 JSON，从而更准确地生成代码和 SQL。

## 注意事项

### 数据库表非常多

如果数据库 schema 非常大（表非常多，如 ERP、CRM 等场景），可能导致超出 Agent 的上下文限制。

**解决方案**：
*   将数据库的 schema 导出为多个 SQL 文件
*   通过添加文件的方式分批添加到上下文中
*   只添加与当前任务相关的表

### 数据库方言（Dialect）

Qoder 会自动将数据库 dialect 以注释的方式添加到数据库 schema 中，无需手动声明数据库类型。

如果需要手动添加 SQL 文件到上下文：
1.  可以在 SQL 文件中添加注释标明数据库类型，例如：`-- dialect: mysql`
2.  也可以在全局 `AGENTS.md` 中进行数据库类型声明

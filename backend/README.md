# Memo 后端服务

这是一个基于 Golang 的 RESTful API 后端服务，用于管理 Markdown 格式的备忘录。每个备忘录都存储为一个 Markdown 文件，文件头使用 YAML 格式存储元数据。

## 功能特性

- RESTful API 设计
- 基于文件的数据存储（无需数据库）
- 支持 Markdown 格式的备忘录
- 支持标签管理
- 简单高效的 YAML 元数据
- 内置静态文件托管（支持 Next.js 生成的静态文件）
- 支持单页应用路由（SPA 路由）

## 系统要求

- Go 1.16 或更高版本

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/ramblog-app.git
cd ramblog-app/backend
```

2. 安装依赖：

```bash
go mod tidy
```

## 运行

```bash
go run main.go
```

默认情况下，服务器将在 `:8080` 端口启动。

## API 端点

### memo API

- `GET /api/memos`: 获取所有记录
- `POST /api/memos`: 创建新记录
- `GET /api/memos/:id`: 获取特定记录
- `PUT /api/memos/:id`: 更新记录
- `DELETE /api/memos/:id`: 删除记录

### 标签 API

- `GET /api/tags`: 获取所有唯一标签

## 数据格式

### Markdown 格式

每个 memo 都存储为一个 Markdown 文件，带有 YAML 前置元数据：

```markdown
---
id: 2023-11-23-1
title: 示例备忘录
tags:
  - 示例
  - 测试
created_at: 2023-04-01T12:00:00Z
updated_at: 2023-04-01T12:30:00Z
---

这是备忘录的内容。

可以包含 **Markdown** 格式。
```

### API 请求/响应格式

创建备忘录 (POST /api/memos):

```json
{
  "title": "新备忘录",
  "tags": ["重要", "工作"],
  "content": "这是一个新的备忘录内容。"
}
```

响应：

```json
{
  "id": "2023-11-23-1",
  "title": "新备忘录",
  "tags": ["重要", "工作"],
  "createdAt": "2023-04-01T12:00:00Z",
  "updatedAt": "2023-04-01T12:00:00Z",
  "content": "这是一个新的备忘录内容。"
}
```

## 构建

构建可执行文件：

```bash
go build -o memo-server
```

## 许可证

MIT

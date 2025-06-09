# Memo 后端服务

这是一个基于 Golang 的 RESTful API 后端服务，用于管理 Markdown 格式的备忘录。每个备忘录都存储为一个 Markdown 文件，文件头使用 YAML 格式存储元数据。

## 功能特性

- RESTful API 设计
- 基于文件的数据存储（无需数据库）
- 支持 Markdown 格式的备忘录
- 支持标签管理
- 简单高效的 YAML 元数据
- 内置静态文件托管（支持Next.js生成的静态文件）
- 支持单页应用路由（SPA路由）

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

## 环境变量

可以通过以下环境变量自定义服务器配置：

- `MEMO_DATA_DIR`: 数据存储目录（默认: `./data`）
- `MEMO_SERVER_ADDR`: 服务器地址和端口（默认: `:8080`）
- `MEMO_STATIC_DIR`: 静态文件目录（默认: `../out`）

例如：

```bash
MEMO_DATA_DIR=/path/to/data MEMO_SERVER_ADDR=:3000 MEMO_STATIC_DIR=/path/to/static go run main.go
```

## API 端点

### 备忘录 API

- `GET /api/memos`: 获取所有备忘录
- `POST /api/memos`: 创建新备忘录
- `GET /api/memos/:id`: 获取特定备忘录
- `PUT /api/memos/:id`: 更新备忘录
- `DELETE /api/memos/:id`: 删除备忘录

### 标签 API

- `GET /api/tags`: 获取所有唯一标签

## 静态文件托管

后端服务器会自动托管指定目录中的静态文件。默认情况下，它会查找项目根目录下的 `out` 文件夹，这是 Next.js 默认的静态导出目录。

如果您使用的是 Next.js，可以通过以下步骤生成静态文件：

1. 在 Next.js 项目中运行：

```bash
npm run build && npm run export
```

2. 这将在 `out` 目录中生成静态文件

3. 确保后端服务器的 `MEMO_STATIC_DIR` 环境变量指向这个目录，或者保持默认值

服务器还支持单页应用（SPA）路由，这意味着除了 API 请求和静态文件请求外，所有的请求都会返回 `index.html`，以便客户端路由器可以正确工作。

## 数据格式

### 备忘录格式

每个备忘录都存储为一个 Markdown 文件，带有 YAML 前置元数据：

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

响应:

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
# Ramblog - 简洁高效的备忘录应用

Ramblog是一个基于Next.js构建的现代化备忘录应用，帮助用户轻松记录和管理日常想法、灵感和任务。应用采用了响应式设计，提供了流畅的用户体验和优雅的动画效果。

## 功能特点

- **备忘录管理**：创建、编辑、删除和归档备忘录
- **标签系统**：使用彩色标签对备忘录进行分类和筛选
- **置顶功能**：将重要的备忘录置顶显示
- **归档系统**：归档不常用的备忘录，保持界面整洁
- **日期筛选**：通过月历界面按日期筛选备忘录
- **热力图**：直观展示您的备忘录活动历史
- **本地存储**：所有数据保存在浏览器的本地存储中，保护您的隐私
- **响应式设计**：完美适配桌面和移动设备
- **单文件导出**：可导出为单个HTML文件，便于分享和部署
- **Markdown支持**：备忘录内容支持Markdown语法，让文本更加丰富

## 技术栈

- **框架**：Next.js 14 (React)
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **图标**：React Icons
- **存储**：localStorage API
- **日期处理**：date-fns
- **类型检查**：TypeScript
- **Markdown渲染**：react-markdown 和 remark-gfm

## TODO
- [ ] 收集自己在各种地方的评论(需要一个插件？)

## 快速开始

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/ramblog-app.git
cd ramblog-app
```

2. 安装依赖：

```bash
npm install
# 或
yarn install
```

3. 启动开发服务器：

```bash
npm run dev
# 或
yarn dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 使用指南

### 创建备忘录
在页面顶部的编辑器中输入内容，选择相关标签，然后点击"保存"按钮。

### 使用Markdown
备忘录支持Markdown语法，可以使用以下格式：
- `# 标题` - 创建一级标题
- `**粗体**` - 创建粗体文本
- `*斜体*` - 创建斜体文本
- `- 项目` - 创建无序列表
- `1. 项目` - 创建有序列表
- `[链接文本](URL)` - 创建链接
- `![替代文本](图片URL)` - 插入图片
- `` `代码` `` - 行内代码
- 以及更多Markdown标准语法

点击编辑器旁的"Markdown"按钮可以查看完整的语法参考。

### 管理备忘录
- **编辑**：点击备忘录右上角的编辑图标
- **置顶**：点击备忘录右上角的星形图标
- **归档**：点击备忘录右上角的归档图标
- **删除**：点击备忘录右上角的关闭图标

### 筛选备忘录
- **按标签筛选**：在左侧边栏中选择一个或多个标签
- **按日期筛选**：在月历中点击特定日期
- **查看归档**：点击"显示归档"按钮查看已归档的备忘录

## 部署

### 常规部署
您可以使用Vercel轻松部署此应用：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Framblog-app)

### 导出为单HTML文件

Ramblog支持导出为单个HTML文件，便于分享或在任何网络服务器上部署：

1. 构建并导出应用：

```bash
npm run bundle
# 或
yarn bundle
```

2. 导出的单HTML文件将位于 `dist/ramblog.html`

3. 您可以直接在浏览器中打开此文件，或将其部署到任何静态网站托管服务

## 许可证

MIT

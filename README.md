# AI Output Clipper

一个用于快速将 AI 生成的内容保存到 GitHub 博客的 Chrome 扩展程序。

## 功能特性

- 从 ChatGPT、Claude 和其他 AI 工具快速捕获内容
- 直接发布到 GitHub 仓库
- 自动格式化 markdown 文件并添加 frontmatter
- 支持中文字符（UTF-8 编码）
- 可配置的目标路径和文件命名
- 支持深色模式

## 安装

### 从源代码安装

1. 克隆或下载此仓库
2. 打开 Chrome 并导航到 `chrome://extensions/`
3. 启用"开发者模式"（右上角切换开关）
4. 点击"加载已解压的扩展程序"
5. 选择 `extension` 目录

### Chrome 应用商店（即将推出）

即将推出！

## 设置

### 1. 创建 GitHub 个人访问令牌

1. 前往 GitHub 设置 → 开发者设置 → 个人访问令牌 → 令牌（经典版）
2. 点击"生成新令牌（经典版）"
3. 授予权限：
   - `repo`（用于私有仓库）
   - 或 `public_repo`（仅用于公开仓库）
4. 生成并复制令牌（以 `ghp_` 开头）

### 2. 配置扩展程序

1. 点击 Chrome 工具栏中的扩展程序图标
2. 展开"GitHub 配置"部分
3. 填写：
   - **Token**：粘贴您的 GitHub PAT
   - **仓库地址**：您的博客仓库 URL（例如 `https://github.com/hyppx01/ai_output_retention`）
4. 点击"保存配置"
5. 可选：点击"测试连接"进行验证

## 使用方法

1. 从 ChatGPT 或任何 AI 工具复制内容
2. 点击扩展程序图标
3. 输入标题（这将作为文件名）
4. 粘贴您的 markdown 内容
5. 点击"发布到博客"
6. 等待成功消息
7. 您的博客将通过 Cloudflare Pages 自动更新

## 高级配置

### 日期前缀

默认情况下，文件名包含日期前缀（例如 `2024-12-30-my-post.md`）。
如需禁用：取消勾选"文件名添加日期前缀"

文章始终保存到仓库的 `posts/` 目录中。

## 文件格式

创建的文件遵循以下格式：

```markdown
---
title: "您的标题"
date: "2024-12-30"
---

您的内容在这里...
```

此格式与 [AI Output Retention](https://github.com/jclio-my/ai_output_retention) 博客系统兼容。

## 故障排除

### "Token 无效或已过期"
- 重新生成您的 GitHub 个人访问令牌
- 确保令牌具有 `repo` 或 `public_repo` 权限范围

### "仓库不存在或无权访问"
- 验证您的用户名和仓库名称
- 检查令牌是否具有正确的权限
- 对于私有仓库，确保令牌具有 `repo` 权限范围

### "文件已存在"
- 稍微更改标题
- 扩展程序不会覆盖现有文件

### 中文字符显示为乱码
- 当前版本不应出现此问题
- 如果出现，请提交 issue

## 开发

### 项目结构

```
extension/
├── manifest.json       # 扩展程序配置
├── popup.html         # 用户界面
├── popup.css          # 样式
├── popup.js           # 主要逻辑
├── lib/
│   ├── github-api.js  # GitHub API 客户端
│   ├── encoding.js    # UTF-8 工具
│   └── slug.js        # 文件名生成
└── icons/             # 扩展程序图标
```

### 本地测试

1. 修改文件
2. 前往 `chrome://extensions/`
3. 点击扩展程序上的重新加载图标
4. 测试更改

## 安全性

- 您的 GitHub 令牌使用 Chrome 的 `storage.sync` API 本地存储
- 令牌由 Chrome 加密并在您的设备间同步
- 令牌永远不会发送到除 GitHub API 以外的任何地方
- 扩展程序只能访问 `api.github.com`

## 兼容性

- Chrome 88+
- Edge 88+（基于 Chromium）
- 任何基于 Chromium 的浏览器

## 许可证

MIT

## 作者

hyppx

## 相关项目

- [AI Output Retention](https://github.com/hyppx01/ai_output_retention) - 此扩展程序发布的博客系统

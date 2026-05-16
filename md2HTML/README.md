# md2HTML

把 Markdown 章节文件转换成精美静态文档站点的工具。黑白极简设计，开箱即用。

## 功能

- **Markdown → HTML**：基于 `marked` 的转换
- **Frontmatter 解析**：用 `gray-matter` 读取章节元数据
- **扩展语法**：提示框（callout）、标签页（tabs）、折叠面板（collapsible）
- **自动生成**：导航栏、侧边栏目录、章节翻页器（上一章/下一章）
- **暗色/亮色主题**：一键切换，自动持久化
- **阅读进度**：顶部进度条 + 章节完成追踪
- **全站搜索**：Ctrl+K / ⌘K 打开，客户端索引
- **语法高亮**：highlight.js 自动识别语言
- **响应式**：移动端自动切换为抽屉式目录
- **零构建工具**：只需 `node build.js`

## 快速开始

```bash
# 安装依赖
npm install

# 构建站点
node build.js

# 打开看效果
open dist/index.html
```

## 目录结构

```
md2HTML/
├── build.js          # 构建脚本
├── package.json      # 依赖声明
├── content/          # 你的内容放这里
│   ├── book.yaml     # 书的元信息（标题、作者等）
│   └── *.md          # 章节文件
├── templates/        # HTML 模板
│   ├── index.html    # 首页模板
│   └── chapter.html  # 章节页模板
├── assets/           # 静态资源（构建时复制到 dist/）
│   ├── style.css     # 设计系统
│   └── script.js     # 交互逻辑
└── dist/             # 构建输出（自动生成）
```

## 写内容

### 配置书的元信息

编辑 `content/book.yaml`：

```yaml
title: "我的文档"
author: "作者名"
description: "一句话描述这本书。"
language: "ZH-CN"
```

### 写章节

在 `content/` 目录下创建 `.md` 文件，头部加 YAML frontmatter：

```markdown
---
title: 章节标题
chapter: 1
readTime: 20
description: 在首页卡片上显示的简介。
---

## 第一节

正文内容...
```

章节按 `chapter` 字段排序。文件名随意，但建议用 `01-xxx.md` 格式方便管理。

### 扩展语法

#### 提示框

```markdown
:::callout 标题
普通提示框内容。
:::

:::callout-tip 小技巧
提示类型的内容。
:::

:::callout-warn 注意
警告类型的内容。
:::
```

#### 标签页

```markdown
:::tabs 选项一 | 选项二 | 选项三
::tab 选项一
第一个标签页的内容。
::tab 选项二
第二个标签页的内容。
::tab 选项三
第三个标签页的内容。
:::
```

#### 折叠面板

```markdown
:::collapsible 点击展开
被折叠的内容，点击标题展开。
:::
```

#### 自定义标题 ID

```markdown
## 我的章节 {#custom-id}
```

不写 `{#id}` 的话，脚本会自动从标题文字生成 ID。

## 自定义

- **模板**：改 `templates/index.html` 和 `templates/chapter.html`
- **样式**：改 `assets/style.css`（全部用 CSS 变量，改颜色只需改 `:root` 里的值）
- **交互**：改 `assets/script.js`

## 输出

`dist/` 目录是一个完整的静态站点：

- 直接双击 `index.html` 就能看（`file://` 协议可用）
- 可以用任何静态服务器托管
- 可以部署到 GitHub Pages、Netlify、Vercel 等

## 依赖

| 包 | 用途 |
|---|---|
| `marked` | Markdown → HTML |
| `gray-matter` | 解析 YAML frontmatter |
| `js-yaml` | 读取 book.yaml |

## 工作流

```
content/*.md  →  build.js  →  dist/
                    ↑
            templates/ + assets/
```

你只需要关心 `content/` 里的 Markdown 文件。模板和样式是一次性设置好的壳子。

## License

MIT

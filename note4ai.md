# note4ai.md

> 最后更新：2026.07.14

本文件面向接手本项目的 AI agent，不是给人类线性阅读的文档。目标是让你读完之后对项目结构、构建系统、约束规则了如指掌。

---

## 项目概述

个人知识库网站 + 博客。纯静态，无框架。域名 `mav-ustc.dev`，Nginx 部署，GitHub 同步， 服务器端有 webhook 同步拉取更新。

面向读者：中国科大大一大二学生，科普向。

---

## 目录结构

```
mav-homepage/
├── Mav/                         ← Nginx root，线上站点
│   ├── index.html               ← 主页
│   ├── about/index.html         ← 关于我
│   ├── blog/                    ← 博客系统
│   │   ├── posts/*.md           ← 博客源文件（Markdown + front-matter）
│   │   ├── html/*.html          ← 博客输出 HTML
│   │   ├── blog-build.js        ← 博客构建脚本
│   │   └── index.html           ← 博客列表页
│   ├── knowledge/               ← 知识库输出（每本书一个子目录）
│   │   ├── index.html           ← 知识库入口页（双模式：Projects / 全部书籍）
│   │   ├── projects/            ← Project 详情页输出
│   │   │   ├── manifest.json    ← 所有 project 的元数据
│   │   │   ├── how-computer-works/index.html
│   │   │   ├── deep-learning-path/index.html
│   │   │   └── digital-formats/index.html
│   │   ├── browser-war/         ← 示例书
│   │   ├── euv-lithography/     ← 示例书（有前端定制）
│   │   ├── claude-code/         ← ⚠️ 纯手写 HTML，无 Markdown 源码
│   │   └── ...
│   └── assets/                  ← 全站共享 CSS/JS
│       ├── style.css            ← 主样式（首页 / about / 知识库入口）
│       ├── projects.css         ← Project 功能专用样式
│       └── about.css            ← About 页轻量覆盖
├── markdown-backups/            ← 知识库 Markdown 源文件
│   ├── Browser-War/             ← 每本书一个文件夹
│   │   ├── book.yaml            ← 元数据（title/author/description/language/status）
│   │   ├── 01-chapter.md        ← 章节文件（带 front-matter）
│   │   └── ...
│   ├── projects/                ← Project 数据源（YAML）
│   │   ├── how-computer-works.yaml
│   │   ├── deep-learning-path.yaml
│   │   └── digital-formats.yaml
│   └── EUV-Lithography/
├── md2HTML/                     ← 静态站点生成器
│   ├── build.js                 ← 主构建入口（书籍）
│   ├── build-projects.js        ← Project 构建脚本
│   ├── build-all.sh             ← shell 包装（⚠️ 内含危险的 `--all` 选项）
│   ├── build-lock.yaml          ← 白名单/锁定列表
│   ├── assets/                  ← 模板 CSS/JS（新书的默认样式）
│   ├── templates/               ← HTML 模板（chapter.html, index.html）
│   └── lib/                     ← 核心模块
│       ├── reader.js            ← 读取 book.yaml + .md 文件
│       ├── renderer.js          ← Markdown → HTML（基于 marked）
│       ├── templates.js         ← 生成完整 HTML 页面 + copyAssets
│       └── lock.js              ← 白名单管理
├── server/                      ← 后端（评论/点赞 API，SQLite）
├── 前端风格探索/                ← 阅读主题 JSON 草稿（未接入构建/样式系统）
├── 参考资料/                    ← 外部参考素材
└── .kiro/steering/              ← AI 工作规则（gitignored）
    └── command-timeout.md      ← macOS PTY 超时处理规则
```

---

## md2HTML 构建系统

### 核心命令

```bash
cd md2HTML

node build.js <Book-Name>              # 构建整本书
node build.js <Book-Name>/chapter.md   # 只构建一章
node build.js <Book-Name>/book.yaml    # 只构建封面
node build.js --lock <path>            # 锁定文件
node build.js --unlock <path>          # 解锁文件
node build.js --list-lock              # 查看锁定列表
node build.js --force <Book-Name>      # 忽略锁定强制构建
```

### 构建流程

1. 读取 `markdown-backups/<Book-Name>/book.yaml` → 元信息
2. 扫描同目录下所有 `.md` 文件 → 按文件名排序
3. 对每个 `.md`：检查 `build-lock.yaml`，锁了就跳过；否则渲染 HTML 写入 `Mav/knowledge/<slug>/chapters/`
4. 生成 `index.html`（封面页）
5. `copyAssets()`：复制 `md2HTML/assets/` 到输出 `assets/`，**会检查 lock**——锁了的 asset 文件跳过不覆盖
6. 生成 `search-index.json`

### build-lock.yaml 白名单机制

两种路径格式，保护不同的东西：

| 格式 | 示例 | 效果 |
|------|------|------|
| `BookName/chapter.md` | `EUV-Lithography/01-overview.md` | 跳过该 .md 的 HTML 重新生成 |
| `slug/assets/filename` | `euv-lithography/assets/style.css` | `copyAssets` 跳过该文件 |

**重要**：每一次build之前，需要考虑是否会对之前的前端进行覆盖，如果有覆盖风险，应该停止并给出提醒，通常采用build最小化，即优先build一个章节，之后是一本书，几乎不考虑重新build all。

p.s `copyAssets` 的 lock 检查是后来加的（在 `lib/templates.js` 中）。原始设计只锁 .md 文件。

### Markdown 章节格式

```markdown
---
title: "章节标题"
chapter: 2          # 章节编号（用于排序和显示）
readTime: 18        # 预计阅读时间（分钟）
description: "..."  # 章节描述（用于封面卡片和搜索）
---

## 小节标题

正文内容...
```

### book.yaml 字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✓ | 书名 |
| `author` | | 作者 |
| `description` | | 一句话描述 |
| `language` | | 语言，默认 `ZH-CN` |
| `version` | | 版本号 |
| `status` | | `draft` 表示草稿；仅元数据，不自动影响首页分类 |
| `catalog` | | `false` 表示 suppress "无首页入口" 警告（旧字段，建议用 `status` 替代） |
| `features` | | 数组，控制章节页额外加载的资源。当前 **仅 `quiz` 会真正注入** |

`features` 示例：

```yaml
features:
  - quiz
```

- `quiz`：在章节页 head 注入 `../assets/quiz.css`，body 末尾注入 `../assets/quiz.js`。新书优先用此方式；遗留的 `inject-quiz.js` 仅作兼容，不要再依赖它注入 mermaid。
- **Mermaid 不走 features**：章节模板默认加载 Mermaid CDN + `initialize`；`renderer.js` 把 ` ```mermaid ` 渲染为 `<div class="mermaid">`；`assets/script.js` 额外处理可能残留的 `<pre><code class="language-mermaid">`。book.yaml 里写 `features: [mermaid]` 目前无额外效果，可省略。

### 输出结构（每本书）

```
Mav/knowledge/<slug>/
├── index.html              ← 封面/目录页
├── chapters/
│   ├── 00-preface.html
│   ├── 01-overview.html
│   └── ...
└── assets/
    ├── style.css
    ├── script.js
    ├── search-index.json
    └── images/             ← 可选，手动放置
```

---

## 博客系统

位置：`Mav/blog/`

```bash
cd Mav/blog
node blog-build.js
```

- 源文件：`posts/*.md`（带 front-matter: title + date）
- 输出：`html/*.html` + 更新 `blog/index.html` + 更新主页最近动态
- 以 `BUILD-` 开头的 .md 文件会被跳过（不出现在博客列表中）

---

## 前端定制约定

每本书 build 完之后会拿到一套默认的 CSS/JS。然后逐步做前端定制：

1. 直接编辑 `Mav/knowledge/<slug>/assets/style.css` 或 `script.js`
2. 直接编辑 `Mav/knowledge/<slug>/chapters/*.html`（加 tips、改结构等）
3. 锁定已定制的文件（`--lock`），以后 rebuild 不覆盖

### Tips/补充信息

有两种方式加入正文外的补充信息：

1. **Markdown 层：`:::callout` 扩展语法**（推荐在源文件中使用）  
   支持 `:::callout` / `:::callout-tip` / `:::callout-warn`，由 `md2HTML/lib/renderer.js` 渲染为 `.callout` 提示块。这是当前主要使用的提示机制，`Math-Analysis`、`server-frontend-backend` 等书都有大量使用。

2. **HTML 层：`sidenote-mark` 内联标记**（build 后手写定制）  
   在已经生成的 HTML 中插入 `<span class="sidenote-mark" data-note="<HTML内容>">tips</span>`，点击后在右侧 Side Panel 显示补充内容。参考 `browser-war` 的实现。  
   **注意**：Markdown 源文件不会自动生成 `sidenote-mark`；若手写插入，请记得 lock 对应章节 HTML，否则 rebuild 会被覆盖。

### 图片渲染（EUV 定制）⚠️ 当前未生效

`note4ai.md` 旧版本曾描述：`euv-lithography` 的 `script.js` 会扫描 `<blockquote>` 中以 `[图片` 开头的内容，尝试从 `assets/images/` 加载对应图片。

实际情况：当前 `Mav/knowledge/euv-lithography/assets/script.js` 是模板副本，**没有图片加载逻辑**；生成的 HTML 中 `[图片 02-03：描述]` 只是普通 blockquote 文本，不会变成 `<img>`。该功能需要修复或从文档中移除，目前先保留为已知问题。

---

## 绝对禁止的操作

1. **不要 build 全部书籍**（`--all`）——会覆盖所有前端定制。  
   `md2HTML/build-all.sh` 仍保留 `--all` 参数，与本文档冲突，属于历史遗留，**不要执行**。
2. **不要动 `Mav/knowledge/claude-code/`**——纯手写 HTML，无 Markdown 源码。
3. **不要未经确认就 commit/push**。
4. **不要修改 `md2HTML/assets/` 里的模板 CSS/JS 除非明确要改所有书的默认样式**。
5. **不要运行 `Mav/knowledge/sync-assets.sh`**（除非已确认它不会影响被锁定的文件）。  
   该脚本会把 `ai-deep-learning-core/assets/style.css` 和 `script.js` **强制覆盖**到所有其他书的 `assets/` 目录，且不会读取 `build-lock.yaml`。跑一次可能抹掉 `euv-lithography`、`browser-war`、AI 系列等书的全部前端定制。

---

## 技术栈

- 前端：纯 HTML/CSS/JS，Inter + JetBrains Mono
- 构建：Node.js（marked + gray-matter + js-yaml）
- 搜索：基于 `search-index.json` 的客户端子串过滤（`assets/script.js` 中实现）
- 代码高亮：highlight.js（CDN）
- 数学公式：KaTeX（CDN，模板统一加载，不限于某几本书）
- 图表：Mermaid.js（CDN，客户端渲染；`md2HTML/lib/renderer.js` 把 ` ```mermaid ` 代码块渲染为 `<div class="mermaid">`，`assets/script.js` 额外处理可能的 `<pre><code class="language-mermaid">` fallback）
- 后端：Express + SQLite（server/ 目录，评论和点赞）
- 部署：Ubuntu + Nginx，通过 GitHub 同步

---

## 执行环境

- OS：macOS (darwin)
- Shell：zsh
- 项目路径：`/Users/mav/Projects/mav-homepage`
- 服务器端：Ubuntu + Nginx，GitHub webhook 自动同步

---

## 知识库列表

| slug | 标题 | 特殊说明 |
|------|------|----------|
| ai-math-principles | 人工智能与数学原理 | 7 章；`status: draft`，进入折叠书稿区 |
| ai-math-foundations | AI 数学基础 | 8 章；`status: draft`；assets 锁定（含 quiz/mermaid） |
| ai-deep-learning-core | AI 深度学习核心 | 13 章；`status: draft`；assets 锁定 |
| ai-computer-vision | AI 计算机视觉 | 5 章；`status: draft`；assets 锁定 |
| ai-nlp-foundations | AI 自然语言处理基础 | 7 章；`status: draft`；assets 锁定 |
| ai-transformers | AI Transformer 深度剖析 | 7 章；`status: draft`；assets 锁定 |
| d2l-toolbox | 深度学习前置工具箱 | 7 章；`status: draft` |
| d2l-cnn | CNN实战篇 | 6 章；`status: draft` |
| d2l-rnn | RNN实战篇 | 8 章；`status: draft` |
| claude-d2l-to-rnn | 深度学习讲义 | 旧版合订内容；`catalog: false`、`status: draft`；折叠书稿区保留直达入口 |
| math-analysis | 数学分析讲义 | 6 章（第 8-13 章，下册内容）；进入“大一下学期课程讲义”折叠区；script.js 锁定 |
| data-structures | 数据结构：从指针到算法 | 9 章；源于 data-s 讲义，原始 md/c 备份在 `markdown-backups/Data-Structures/_source/`，装配脚本 `_source/assemble.py` |
| thermodynamics | 热学速通 | 6 章；进入“大一下学期课程讲义”折叠区；有 `_figures/*.py` 生成图片（PNG），含 2024 真题实战，KaTeX 数学公式；script.js 锁定 |
| money-bank | 银行体系与货币系统 | 8 章 |
| bite-to-byte-硬件篇 | 电脑怎么工作的 | 8 章 |
| blockchain-crypto | 区块链与加密货币 | 8 章；`status: published`；v3.0（信任/比特币设计与网络/以太坊/共识/生态/Web3/安全实战） |
| rust-book | Rust | 7 章 |
| git-guide | Git 概念与实操 | 5 章 |
| server-frontend-backend | 服务器与前后端 | 5 章；多章锁定 |
| video-screen | 视频与屏幕技术 | 5 章 |
| browser-war | 浏览器：从战争到垄断 | 8 章；多章锁定，有前端定制 |
| euv-lithography | EUV 光刻机 | 7 章；全章锁定，assets 锁定，有图片系统和 KaTeX |
| pdf-explained | PDF：最熟悉的陌生人 | 9 章；部分章节锁定 |
| claude-code | Claude Code 入门指南 | ⚠️ 纯手写 HTML，无 Markdown 源码 |

---

## Project 系统

### 概念

Project 是知识库中**书之上的聚合层**——把相关的书按阅读顺序串成一条学习路径。一本书可以属于多个 project（多对多），也可以不属于任何 project（作为"独立阅读"展示）。

### 数据源

位置：`markdown-backups/projects/*.yaml`

```yaml
title: "计算机是怎么工作的"
slug: how-computer-works
description: "从晶体管到浏览器，一路向上"
books:
  - slug: bite-to-byte-硬件篇
    role: "起点：硬件和操作系统是怎么协作的"
  - slug: server-frontend-backend
    role: "网络：请求怎么跑通的"
  - slug: browser-war
    role: "终点：浏览器的 30 年战争"
transitions:
  - "理解了硬件之后，下一步是看数据怎么通过网络流动..."
  - "知道了请求怎么跑通之后，来看浏览器本身..."
sidebar:
  prerequisites:
    - "会用电脑上网"
  concepts:
    - "CPU 与指令周期"
    - "HTTP 请求/响应"
    - "渲染引擎"
  outcomes:
    - "能解释从按下回车到页面显示经历了什么"
```

### 字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✓ | Project 标题 |
| `slug` | ✓ | URL slug，用于输出路径 |
| `description` | ✓ | 一句话描述 |
| `status` | 可选 | `draft` 表示待整理路线，不进入首页主 Project 列表 |
| `statusNote` | 可选 | 草稿路线在详情页显示的状态说明 |
| `books` | ✓ | 书的数组，按顺序排列 |
| `books[].slug` | ✓ | 对应 `markdown-backups/<Dir>` 的 lowercase slug |
| `books[].role` | ✓ | 该书在路径中的角色/定位 |
| `transitions` | 可选 | 书与书之间的过渡文案（数组，长度 = books.length - 1） |
| `sidebar.prerequisites` | 可选 | 前置知识列表 |
| `sidebar.concepts` | 可选 | 涉及的核心概念 |
| `sidebar.outcomes` | 可选 | 读完之后你能做到什么 |

### 构建命令

```bash
cd md2HTML
node build-projects.js              # 构建全部 project
node build-projects.js <slug>       # 构建单个 project
```

### 输出

```
Mav/knowledge/projects/
├── manifest.json                          ← 所有 project 的元数据（当前未被首页动态消费，仅作为备用数据）
├── from-zero-to-transformer/index.html    ← 详情页
├── how-computer-works/index.html          ← 详情页
├── deep-learning-path/index.html
└── digital-formats/index.html
```

### 当前 Project 列表

| slug | 标题 | 状态 | 包含书籍 |
|------|------|------|----------|
| from-zero-to-transformer | 从零开始学 Transformer | draft | 数学基础 → DL核心 → CV → NLP → Transformers |
| how-computer-works | 计算机是怎么工作的 | published | 硬件篇 → 服务器 → 浏览器 |
| deep-learning-path | 深度学习从零到能读论文 | draft | 工具箱 → CNN → RNN |
| digital-formats | 数字世界的底层格式 | published | PDF → 视频 → 浏览器 |

### 知识库首页 (index.html)

路径 `Mav/knowledge/index.html`。现在有两个 tab：

1. **Projects** — 展示 published project 卡片（带路径圆点动画）+ 独立阅读区
2. **全部书籍** — 平铺 12 本 published 主书的卡片视图（不含课程讲义与 draft 书稿）

两个视图下方共用两个原生 `<details>` 折叠区：
- **大一下学期课程讲义**：收纳 `thermodynamics` 与 `math-analysis`。
- **深度学习相关书稿**：收纳 10 本 `status: draft` 的书稿和 2 条 draft 旧路线。

两个区域均默认收起。

新增 project 后需要：
1. 在 `markdown-backups/projects/` 创建 YAML
2. 运行 `node build-projects.js`

Project 卡片由构建脚本根据 YAML 自动回填到 `Mav/knowledge/index.html` 的以下标记之间：

```html
<!-- AUTO:PROJECTS:START -->
<!-- AUTO:PROJECTS:END -->
```

`order` 控制顺序，book 项的 `label` 控制路径短标签，`status: draft` 的 Project 会从主列表过滤。

**注意**：`book.yaml` 和 `project.yaml` 中的 `status: draft` 目前只是元数据，不会自动驱动首页分类。独立阅读、全部书籍和两个折叠区的卡片仍需在 `Mav/knowledge/index.html` 中手动维护，新增/移动书籍时务必同步更新。

### Project 详情页布局

双栏布局（桌面端）：
- **左侧**：header（PROJECT标签 + 标题 + 描述 + 统计）+ 时间线（书卡片 + 过渡文案）
- **右侧 sticky sidebar**：前置知识 / 涉及概念 / 读完之后你能
- **底部**：路径完成提示 + 返回知识库入口

移动端（< 900px）自动堆叠为单栏。

---

## 常见操作速查

| 需求 | 命令/位置 |
|------|-----------|
| 新建知识库书 | `markdown-backups/` 下建文件夹 + `book.yaml` + `.md` |
| 构建单本书 | `cd md2HTML && node build.js <Book-Name>` |
| 构建单章 | `cd md2HTML && node build.js <Book-Name>/chapter.md` |
| 增加独立书籍入口卡片 | 编辑 `Mav/knowledge/index.html` 的独立阅读和全部书籍区域（目前仍需手动） |
| 新建 Project | `markdown-backups/projects/` 下建 `.yaml`，然后 `node build-projects.js` |
| 构建 Project | `cd md2HTML && node build-projects.js` |
| 发博客 | `Mav/blog/posts/` 下写 `.md`，然后 `cd Mav/blog && node blog-build.js` |
| 锁定文件 | `cd md2HTML && node build.js --lock <path>` |
| 解锁文件 | `cd md2HTML && node build.js --unlock <path>` |
| 查看所有锁 | `cd md2HTML && node build.js --list-lock` |
| 修改前端样式（特定书） | 直接改 `Mav/knowledge/<slug>/assets/style.css`，然后 `--lock <slug>/assets/style.css` |
| 加 Markdown 提示块 | 在 `.md` 中使用 `:::callout` / `:::callout-tip` / `:::callout-warn` |
| 加 HTML sidenote tips | 在已生成 HTML 中插入 `<span class="sidenote-mark" data-note="...">tips</span>`，并 lock 该章节 |
| **危险：不要执行** | `md2HTML/build-all.sh --all` / `Mav/knowledge/sync-assets.sh` |

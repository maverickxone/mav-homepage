# note4ai.md

> 最后更新：2026.05.27 01:00

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
│   │   ├── graph/               ← 知识图谱页面
│   │   │   ├── index.html       ← 力导向图谱前端
│   │   │   └── graph-data.json  ← 节点+边数据（构建生成）
│   │   ├── browser-war/         ← 示例书
│   │   ├── euv-lithography/     ← 示例书（有前端定制）
│   │   ├── claude-code/         ← ⚠️ 纯手写 HTML，无 Markdown 源码
│   │   └── ...
│   └── assets/                  ← 全站共享 CSS/JS
│       ├── style.css            ← 主样式
│       └── projects.css         ← Project 功能专用样式
├── markdown-backups/            ← 知识库 Markdown 源文件
│   ├── Browser-War/             ← 每本书一个文件夹
│   │   ├── book.yaml            ← 元数据（title/author/description/language）
│   │   ├── 01-chapter.md        ← 章节文件（带 front-matter）
│   │   └── ...
│   ├── projects/                ← Project 数据源（YAML）
│   │   ├── how-computer-works.yaml
│   │   ├── deep-learning-path.yaml
│   │   ├── digital-formats.yaml
│   │   └── graph-edges.yaml     ← 知识图谱跨章关联数据
│   └── EUV-Lithography/
├── md2HTML/                     ← 静态站点生成器
│   ├── build.js                 ← 主构建入口（书籍）
│   ├── build-projects.js        ← Project 构建脚本
│   ├── build-graph.js           ← 知识图谱数据构建脚本
│   ├── build-all.sh             ← shell 包装
│   ├── build-lock.yaml          ← 白名单/锁定列表
│   ├── assets/                  ← 模板 CSS/JS（新书的默认样式）
│   ├── templates/               ← HTML 模板（chapter.html, index.html）
│   └── lib/                     ← 核心模块
│       ├── reader.js            ← 读取 book.yaml + .md 文件
│       ├── renderer.js          ← Markdown → HTML（基于 marked）
│       ├── templates.js         ← 生成完整 HTML 页面 + copyAssets
│       └── lock.js              ← 白名单管理
├── server/                      ← 后端（评论/点赞 API，SQLite）
├── Others/                      ← 杂项草稿
└── .kiro/steering/rules.md      ← AI 工作规则（gitignored）
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

使用 `<span class="sidenote-mark" data-note="<HTML内容>">tips</span>` 内联在正文中。点击后在右侧 Side Panel 显示补充内容。参考 `browser-war` 的实现。

**不要用 `.callout` div 块**——那个样式在 CSS 中定义了但实际使用的是 sidenote-mark 机制。

### 图片渲染（EUV 定制）

`euv-lithography` 的 `script.js` 中有一段自定义代码：扫描所有 `<blockquote>` 中以 `[图片` 开头的内容，尝试从 `assets/images/` 加载对应图片。

命名规则：`[图片 02-03：描述]` → 尝试加载 `assets/images/02-03.webp`、`.png`、`.jpg`...

如果无显式 ID（`[图片：描述]`），则按页面出现顺序自动编号 `{章节号}-{序号}`。

---

## 绝对禁止的操作

1. **不要 build 全部书籍**（`--all`）——会覆盖所有前端定制
2. **不要动 `Mav/knowledge/claude-code/`**——纯手写 HTML，无源码
3. **不要未经确认就 commit/push**
4. **不要修改 `md2HTML/assets/` 里的模板 CSS/JS 除非明确要改所有书的默认样式**

---

## 技术栈

- 前端：纯 HTML/CSS/JS，Inter + JetBrains Mono
- 构建：Node.js（marked + gray-matter + js-yaml）
- 搜索：MiniSearch（客户端全文搜索，search-index.json）
- 代码高亮：highlight.js（CDN）
- 数学公式：KaTeX（CDN，仅 euv-lithography 启用，在 script.js 动态加载）
- 后端：Express + SQLite（server/ 目录，评论和点赞）
- 部署：Ubuntu + Nginx，通过 GitHub 同步

---

## 执行环境

- OS：Windows + WSL (Ubuntu)
- Git/Shell 命令通过 WSL 执行（Windows 端有 ownership 问题）
- 项目路径：`/home/mav/mav-homepage`（WSL 内）
- 服务器端自行确定

---

## 知识库列表

| slug | 标题 | 特殊说明 |
|------|------|----------|
| claude-code | Claude Code 入门指南 | ⚠️ 纯手写 HTML，白名单 |
| data-structures | 数据结构：从指针到算法 | 8 章（含 C 代码附录）；源于 data-s 讲义，原始 md/c 备份在 `markdown-backups/Data-Structures/_source/`，装配脚本 `_source/assemble.py` |
| claude-d2l-to-rnn | 深度学习讲义 | 旧版合订内容，`catalog: false`，不在知识库首页展示 |
| d2l-toolbox | 深度学习前置工具箱 | — |
| d2l-cnn | CNN实战篇 | — |
| d2l-rnn | RNN实战篇 | — |
| money-bank | 银行体系与货币系统 | — |
| bite-to-byte-硬件篇 | 电脑怎么工作的 | — |
| blockchain-crypto | 区块链与加密货币 | — |
| rust-book | Rust | — |
| git-guide | Git 概念与实操 | — |
| server-frontend-backend | 服务器与前后端 | 多章锁定 |
| video-screen | 视频与屏幕技术 | — |
| browser-war | 浏览器：从战争到垄断 | 多章锁定，有前端定制 |
| euv-lithography | EUV 光刻机 | 全章锁定，assets 锁定，有图片系统和 KaTeX |
| pdf-explained | PDF：最熟悉的陌生人 | — |
| thermodynamics | 热力学 | — |

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
├── manifest.json                   ← 所有 project 的元数据（首页消费）
├── how-computer-works/index.html   ← 详情页
├── deep-learning-path/index.html
└── digital-formats/index.html
```

### 当前 Project 列表

| slug | 标题 | 包含书籍 |
|------|------|----------|
| how-computer-works | 计算机是怎么工作的 | 硬件篇 → 服务器 → 浏览器 |
| deep-learning-path | 深度学习从零到能读论文 | 工具箱 → CNN → RNN |
| digital-formats | 数字世界的底层格式 | PDF → 视频 → 浏览器 |

### 知识库首页 (index.html)

路径 `Mav/knowledge/index.html`。现在有两个 tab：

1. **Projects** — 展示 project 卡片（带路径圆点动画）+ 独立阅读区
2. **全部书籍** — 原始的平铺三列卡片视图

新增 project 后需要：
1. 在 `markdown-backups/projects/` 创建 YAML
2. 运行 `node build-projects.js`

Project 卡片由构建脚本根据 YAML 自动回填；`order` 控制顺序，book 项的 `label` 控制路径短标签。独立阅读和全部书籍卡片仍在首页手动维护。

### Project 详情页布局

双栏布局（桌面端）：
- **左侧**：header（PROJECT标签 + 标题 + 描述 + 统计）+ 时间线（书卡片 + 过渡文案）
- **右侧 sticky sidebar**：前置知识 / 涉及概念 / 读完之后你能
- **底部**：路径完成提示 + 返回知识库 / 查看知识图谱入口

移动端（< 900px）自动堆叠为单栏。

---

## 知识图谱系统

### 概念

把所有书和章节作为节点，跨章关联作为边，可视化整个知识库的网络结构。基于 force-graph 库（Canvas + d3-force），力导向布局持续运行，所以拖拽节点时整个图会"活"地响应。

### 数据源

位置：`markdown-backups/projects/graph-edges.yaml`

```yaml
edges:
  - from: "bite-to-byte-硬件篇/03-cpu-gpu"
    to: "server-frontend-backend/03-server-hardware"
    label: "CPU/内存选型"
  - from: "browser-war/03-how-browser-works"
    to: "pdf-explained/05-readers"
    label: "渲染引擎"
```

格式：
- `from` / `to`：`book-slug/chapter-slug`（不带 `.md` 后缀）
- `label`：一两个词描述这条关联是什么
- 节点信息（书 / 章节）由构建脚本自动从 `markdown-backups/<Book>/book.yaml` 和章节 front-matter 中提取，**不需要在每个 md 里手动加字段**

### 构建命令

```bash
cd md2HTML
node build-graph.js
```

输出：`Mav/knowledge/graph/graph-data.json`（构建脚本自动收集所有书 + 章节 + 边数据）

### 输出页面

`Mav/knowledge/graph/index.html` — 全屏图谱页面（独立页，从知识库首页"图谱"tab 跳入）

### 前端架构（重点）

- **库**：force-graph（CDN：`cdn.jsdelivr.net/npm/force-graph`）
- **渲染**：Canvas（不是 SVG，性能关键）
- **物理引擎**：内置 d3-force，配置：
  - `cooldownTicks(Infinity)` — 永不停止
  - `d3AlphaMin(0)` + `d3AlphaDecay(0.01)` — 模拟持续活跃
  - `d3VelocityDecay(0.2)` — 低阻尼，节点惯性强
- **Obsidian 式行为**：拖拽节点松手后清除 `fx/fy`，节点弹回自然位置（不固定）
- **节点**：书节点 (3px) + 章节点 (2px)，统一小圆点 + 文字标签
- **连线**：
  - 内部连线（章↔书）默认可见（淡）
  - 跨书连线默认淡灰，hover 时加深加粗
- **缩放/平移**：滚轮缩放、拖拽空白平移，全部由 force-graph 内置交互处理

### Hover 高亮逻辑

| 操作 | 效果 |
|------|------|
| Hover 书节点 | 该书 + 子章节高亮，其余淡出 |
| Hover 章节点 | 父书集群 + 该章的跨书连接节点高亮 |
| Hover 任何节点 | 相关连线加深，跨书连线显示 |
| 点击节点 | 弹窗显示标题/描述/开始阅读按钮 |

### 添加新关联

1. 编辑 `markdown-backups/projects/graph-edges.yaml`，在 `edges:` 下加一条
2. `cd md2HTML && node build-graph.js` 重新生成数据
3. 刷新图谱页面即可看到

无效边（节点 ID 不存在）会被构建脚本自动过滤并提示。

### 当前状态

- 15 本书（节点）
- 98 章（节点）
- 36 条手动标注的跨章关联（边）

### 已尝试但放弃的方案

- 手写物理引擎（卡顿）
- Sigma.js + Graphology（API 复杂、布局静态、没拖拽响应）
- Spectrum 彩色模式（颜色装饰性大于信息量，砍掉）

最终选定 force-graph + Mono 黑白设计，是最匹配整体设计语言又保持丝滑交互的方案。

---

## 常见操作速查

| 需求 | 命令/位置 |
|------|-----------|
| 新建知识库书 | `markdown-backups/` 下建文件夹 + `book.yaml` + `.md` |
| 构建单本书 | `cd md2HTML && node build.js <Book-Name>` |
| 增加独立书籍入口卡片 | 编辑 `Mav/knowledge/index.html` 的独立阅读和全部书籍区域 |
| 新建 Project | `markdown-backups/projects/` 下建 `.yaml`，然后 `node build-projects.js` |
| 构建 Project | `cd md2HTML && node build-projects.js` |
| 添加图谱关联 | 编辑 `markdown-backups/projects/graph-edges.yaml`，然后 `node build-graph.js` |
| 重建图谱数据 | `cd md2HTML && node build-graph.js` |
| 发博客 | `Mav/blog/posts/` 下写 `.md`，然后 `cd Mav/blog && node blog-build.js` |
| 锁定文件 | `node build.js --lock <path>` |
| 查看所有锁 | `node build.js --list-lock` |
| 修改前端样式（特定书） | 直接改 `Mav/knowledge/<slug>/assets/style.css`，然后锁定 |
| 加 tips | 在 HTML 中插入 `<span class="sidenote-mark" data-note="...">tips</span>` |

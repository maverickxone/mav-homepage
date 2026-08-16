# note4ai.md

> 最后更新：2026.08.16

本文件面向接手本项目的 AI agent，不是给人类线性阅读的文档。目标是让你读完之后对项目结构、构建系统、约束规则了如指掌。

---

## 项目概述

个人知识库网站 + 博客。站点主体为纯静态 HTML/CSS/JS（无前端框架）。域名 `mav-ustc.dev`，Nginx 部署，GitHub 同步，服务器端有 webhook 同步拉取更新。另有可选后端 `server/`（评论/点赞 API）。

面向读者：中国科大大一大二学生，科普向。

---

## 目录结构

```
mav-homepage/
├── Mav/                         ← Nginx root，线上站点
│   ├── index.html               ← 主页
│   ├── about/index.html         ← 关于我
│   ├── timeline/index.html      ← 时间线板块（手写维护，无构建脚本）
│   ├── blog/                    ← 长文详情页（列表已并入时间线）
│   │   ├── posts/*.md           ← 长文源文件（Markdown + front-matter）
│   │   ├── html/*.html          ← 长文输出 HTML
│   │   ├── blog-build.js        ← 只生成详情页（不再改 index/主页）
│   │   └── index.html           ← 手写的「已并入时间线」提示页
│   ├── knowledge/               ← 知识库输出（每本书或 Series 一个子目录）
│   │   ├── index.html           ← 知识库入口页（三 tab：独立书籍 / 系列讲义 / 手记）
│   │   ├── notes/               ← Notes（手记）输出：列表页 + 平铺的 note 页
│   │   │   ├── index.html       ← 手记列表（标签筛选 + 搜索）
│   │   │   ├── <slug>.html      ← 单篇手记（平铺，不在 chapters/ 下）
│   │   │   └── assets/          ← style.css / script.js / notes.css / search-index.json
│   │   ├── deep-learning/       ← 深度学习 Series 输出（3 篇、21 章）
│   │   ├── large-language-models/ ← LLM Series 输出（6 篇、34 章；v1.0.0）
│   │   ├── browser-war/         ← 示例书（有前端定制）
│   │   ├── euv-lithography/     ← 示例书（有前端定制）
│   │   ├── robogame2026/        ← RoboGame 2026 讲义
│   │   ├── rag/                 ← RAG 书（7 章）
│   │   ├── claude-code/         ← ⚠️ 纯手写 HTML，无 Markdown 源码
│   │   ├── bluetooth-airpods/   ← ⚠️ 图文单页科普书，纯手写，无 Markdown 源码（见下方专节）
│   │   ├── guns-terrorism/      ← ⚠️ 图文单页科普书，纯手写，无 Markdown 源码
│   │   ├── exchange-rate-purchasing-power/ ← ⚠️ 图文单页科普书，纯手写，无 Markdown 源码
│   │   └── ...
│   └── assets/                  ← 全站共享 CSS/JS
│       ├── style.css            ← 主样式（首页 / about / 知识库入口）
│       ├── knowledge-index.css  ← 知识库入口页专用样式（tab、书籍网格、分组）
│       ├── about.css            ← About 页轻量覆盖
│       └── script.js            ← 全站脚本（含知识库入口 tab 等）
├── markdown-backups/            ← 知识库 Markdown 源文件
│   ├── Browser-War/             ← 每本书一个文件夹
│   │   ├── book.yaml            ← 元数据（title/author/description/language/status）
│   │   ├── 01-chapter.md        ← 章节文件（带 front-matter）
│   │   └── ...
│   ├── notes/                   ← Notes（手记）源目录
│   │   ├── notes.yaml           ← 集合元数据（title/slug/description/author）
│   │   └── <slug>.md            ← 每篇手记一个 .md（带 front-matter：title/date/readTime/description/tags）
│   ├── RoboGame2026/            ← 工程实践讲义
│   ├── Deep-Learning/           ← Series 源目录
│   │   ├── series.yaml          ← Series 元数据与 Part 顺序
│   │   ├── 01-toolbox/*.md      ← PART I 章节
│   │   ├── 02-cnn/*.md          ← PART II 章节
│   │   └── 03-rnn/*.md          ← PART III 章节
│   ├── Large-Language-Models/   ← LLM Series 源目录（6 卷完结）
│   │   ├── series.yaml
│   │   ├── 01-architecture/ … 06-industry-map/
│   │   └── _research/           ← 写作调研素材（未进 series parts；计划作附录）
│   ├── RAG/                     ← RAG 书源
│   └── EUV-Lithography/
├── md2HTML/                     ← 静态站点生成器
│   ├── build.js                 ← 主构建入口（Book + Series）
│   ├── build-notes.js           ← Notes（手记）构建脚本
│   ├── build-all.sh             ← shell 包装（⚠️ `--all` 已禁用，传入会 exit 1）
│   ├── build-lock.yaml          ← 白名单/锁定列表
│   ├── inject-quiz.js           ← 遗留 quiz 注入脚本（兼容用，新书勿依赖）
│   ├── convert-ai-lessons.js    ← AI 讲义转换辅助（非日常构建路径）
│   ├── assets/                  ← 模板 CSS/JS（新书默认 style.css + script.js）
│   ├── series-assets/           ← Series 专用 CSS（series.css）
│   ├── notes-assets/            ← Notes 专用 CSS（notes.css）
│   ├── templates/               ← Book、Series 与 Note 的封面/章节模板
│   └── lib/                     ← 核心模块
│       ├── reader.js            ← 读取 book.yaml / series.yaml + .md 文件
│       ├── renderer.js          ← Markdown → HTML（基于 marked）
│       ├── templates.js         ← 生成完整 HTML 页面 + copyAssets
│       └── lock.js              ← 白名单管理
├── server/                      ← 后端（评论/点赞 API，SQLite）
├── archive/                     ← 历史备份（如 Blockchain 旧稿），不参与构建
├── 前端风格探索/                ← 阅读主题 JSON 草稿；运行时主题已写在模板 CSS/JS 内，此目录未接入构建
├── 参考资料/                    ← 外部参考素材
└── .kiro/                       ← AI 工作规则与 specs（gitignored）
    ├── steering/                ← 如 command-timeout.md
    └── specs/                   ← 设计草稿（如 knowledge-theme-system）
```

说明：`markdown-backups/` 下可能出现 `*.backup.*` 时间戳备份目录；`.gitignore` 已忽略 `markdown-backups/*.backup.*/`，勿当正式书处理。

---

## md2HTML 构建系统

### 核心命令

```bash
cd md2HTML

node build.js --book <Book-Name>                     # 构建整本书
node build.js --book <Book-Name>/chapter.md          # 只构建一章
node build.js --book <Book-Name>/book.yaml           # 只构建书籍封面
node build.js --series <Series-Name>                 # 构建完整 Series
node build.js --series <Series-Name>/part/chapter.md # 只构建 Series 的一章
node build.js --series <Series-Name>/series.yaml     # 只构建 Series 封面
node build.js --lock <path>            # 锁定文件
node build.js --unlock <path>          # 解锁文件
node build.js --list-lock              # 查看锁定列表
node build.js --force --book <Book-Name>             # 忽略锁定强制构建
```

旧命令 `node build.js <Book-Name>` 继续按 Book 构建，等价于显式传入 `--book`。

`./build-all.sh` 只是对 `node build.js "$@"` 的薄包装；**传入 `--all` 会被脚本拒绝并 exit 1**（故意移除批量全量构建）。

### 构建流程

Book 构建读取 `book.yaml`，扫描同目录顶层 `.md`，按 front-matter 的 `chapter` 排序。Series 构建读取 `series.yaml`，按 `parts` 的顺序进入各 Part 的 `source` 子目录，再按每篇内部的 `chapter` 排序；输出时自动生成跨全系列连续的章节编号和 slug。

两类构建都会检查章节 lock、渲染 Markdown、生成封面与 `search-index.json`。Book 复制 `md2HTML/assets/`；Series 额外复制 `md2HTML/series-assets/series.css`，使用独立的 Series 封面和章节模板。整本或整套构建会重写封面与搜索索引。

### build-lock.yaml 白名单机制

三种路径格式，保护不同的东西：

| 格式 | 示例 | 效果 |
|------|------|------|
| `BookName/chapter.md` | `EUV-Lithography/01-overview.md` | 跳过该 .md 的 HTML 重新生成 |
| `SeriesName/part/chapter.md` | `Deep-Learning/02-cnn/01-convolution-basics.md` | 跳过该 Series 章节的 HTML 重新生成 |
| `slug/assets/filename` | `euv-lithography/assets/style.css` | `copyAssets` 跳过该文件 |

**重要**：每一次 build 之前，需要考虑是否会对之前的前端进行覆盖，如果有覆盖风险，应该停止并给出提醒，通常采用 build 最小化，即优先 build 一个章节，之后是一本书，几乎不考虑重新 build all。

p.s. `copyAssets` 的 lock 检查是后来加的（在 `lib/templates.js` 中）。原始设计只锁 .md 文件。  
p.s.2 当前 lock 里存在 `server-frontend-backend/book.yaml` 这类条目，但 `build.js` **不会**读取 `book.yaml` 锁；真正生效的是章节路径与 `slug/assets/*`。

### Markdown 章节格式

```markdown
---
title: "章节标题"
chapter: 2          # 章节编号（用于排序和显示）
readTime: 18        # 预计阅读时间（分钟）
description: "..."  # 章节描述（用于封面卡片和搜索）
infoCutoff: "..."   # 可选；章节页头部显示信息截止说明
---

## 小节标题

正文内容...
```

### 扩展 Markdown 语法（`renderer.js`）

| 语法 | 说明 |
|------|------|
| `:::callout 标题` / `:::callout-tip 标题` / `:::callout-warn 标题` | 提示块；**开行必须带标题**（`:::callout\n` 无标题不会匹配） |
| `:::tabs ...` | 选项卡块 |
| `:::collapsible 标题` | 可折叠块 |
| `:::quiz` | 交互选择题块（常配合 `features: [quiz]` 与 quiz.css/js） |
| `> [要点]` 起头的引用块 | 渲染为要点卡片 `<div class="keypoints">`（2026-07 加入 renderer.js + 共享 style.css；旧书重建后同样生效，此前渲染为普通 blockquote） |
| `![标题](路径)` 标准图片 | 渲染为 `<figure class="fig">` + 居中 `<figcaption>`（2026-07 加入；alt 文本即题注，支持行内公式） |

闭合行均为单独的 `:::`。

### book.yaml 字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✓ | 书名 |
| `author` | | 作者 |
| `description` | | 一句话描述 |
| `language` | | 语言，默认 `ZH-CN` |
| `version` | | 版本号 |
| `status` | | `draft` / `published` 等；**书级 status 不自动驱动首页卡片分区**（首页书籍区仍手动维护） |
| `catalog` | | `false` 时 suppress build 的「无首页入口」警告（`warnIfBookHasNoEntry` **只认 `catalog === false`**，`status` **不能**替代） |
| `features` | | 数组，控制章节页额外加载的资源。当前 **仅 `quiz` 会真正注入** |
| `infoCutoff` | | 部分书写了书级字段；**构建只消费章节 front-matter 的 `infoCutoff`**，书级目前无效 |
| `statusNote` | | 元数据；书籍构建不用（原为 Project 草稿详情页使用，该功能已于 2026-08 移除） |

`features` 示例：

```yaml
features:
  - quiz
```

- `quiz`：在章节页 head 注入 `../assets/quiz.css`，body 末尾注入 `../assets/quiz.js`。  
  **注意**：`copyAssets()` **不会**从模板目录复制 quiz 文件（`md2HTML/assets/` 只有 `style.css` / `script.js`）。quiz 资源需事先放在该书 `Mav/knowledge/<slug>/assets/` 下，并建议 lock。新书优先用 `features: [quiz]`；遗留的 `inject-quiz.js` 仅作兼容，不要再依赖它注入 mermaid。
- **Mermaid 不走 features**：章节模板默认加载 Mermaid CDN + `initialize`；`renderer.js` 把 ` ```mermaid ` 渲染为 `<div class="mermaid">`；`assets/script.js` 额外处理可能残留的 `<pre><code class="language-mermaid">`。book.yaml 里写 `features: [mermaid]` 目前无额外效果，可省略。

### series.yaml 字段

Series 继续使用相同的 Markdown front-matter。每个 Part 的章节编号从 1 开始，构建器根据 Part 顺序生成全系列连续编号和输出 slug。

```yaml
title: "深度学习系列讲义"
slug: deep-learning
eyebrow: "Series · Deep Learning"   # 可选；封面小标题，缺省为 "Series"
author: "Mav"
description: "..."
language: "ZH-CN"
estimatedTime: "约 22 小时"
parts:
  - id: toolbox
    label: "PART I"
    title: "数学与 PyTorch 工具"
    description: "..."
    source: "01-toolbox"
```

`eyebrow` 显示在 Series 封面主标题上方。`parts[].id` 必须唯一并使用小写字母、数字和连字符；`source` 指向 Series 目录内的 Part 子目录。每个 Part 必须至少包含一章，内部 `chapter` 必须从 1 连续编号。

### 输出结构（Book 与 Series）

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
    ├── series.css            ← 仅 Series 输出
    ├── search-index.json
    ├── quiz.css / quiz.js  ← 可选；有 quiz 功能的书
    └── images/             ← 可选，手动放置
```

---

## 时间线板块（2026-07 起，取代博客列表）

位置：`Mav/timeline/index.html`。**手写维护，没有构建脚本**——一个自包含 HTML（挂全站 `assets/style.css` + 页内内联时间线专属 CSS）。

结构：NOW 块（现在进行时，每学期改一次）→ 未来学期「待续」→ 按学期/假期分区的条目（新的在上）→ 起点（2025.09 入学）。

条目分三个重量级（模板在页面 HTML 注释里，直接复制改字段）：

| 级别 | class | 用途 |
|------|-------|------|
| L | `tl-entry tl-entry--card` | 重点条目（卡片 + 长描述 + meta 行），每学期至多一两个 |
| M | `tl-entry` | 标准条目（标题 + 一句话） |
| S | `tl-entry tl-entry--mini` | 速记条目（一行） |

- **条目以「事件」为单位，不以书为单位**：书是事件的产物，合并列在 note 里（可加链接），不要一书一条
- 左轨 mono 前缀 `07 · 书`（月份 + 类型），类型：书 / 文 / 事
- 任何条目可附 `.tl-aside` 旁白（第一人称一句话）
- 学期方块实心、假期空心；条目粒度控制在每学期 ≤15 条
- 垂直对齐是固定像素校准的（首行 25.6px 等），改字号需同步调 `::before` 的 top 值
- 主页「最近动态」(`Mav/index.html` 的 `recent-list`) 现在**手写维护**，与时间线同步更新

## 博客（残留：只出详情页）

`Mav/blog/` 的列表页已并入时间线；`blog/index.html` 是手写的迁移提示页，**不要用脚本重新生成**。

```bash
cd Mav/blog
node blog-build.js   # 只生成 html/*.html 详情页（导航指向时间线）
```

- 源文件：`posts/*.md`（带 front-matter: title + date）
- `blog-build.js` **不再**改写 `blog/index.html` 和主页最近动态（相关函数已删除）
- 以 `BUILD-` 开头的 .md 不会生成普通详情页
- 特例：`BUILD-JOURNEY-0516.md` 仍会被单独构建为 `html/build-journey.html`
- 发新长文流程：写 `posts/*.md` → `node blog-build.js` → 在时间线里**手动加一条**指向它

---

## 前端定制约定

每本书 build 完之后会拿到一套默认的 CSS/JS。然后逐步做前端定制：

1. 直接编辑 `Mav/knowledge/<slug>/assets/style.css` 或 `script.js`
2. 直接编辑 `Mav/knowledge/<slug>/chapters/*.html`（加 tips、改结构等）
3. 锁定已定制的文件（`--lock`），以后 rebuild 不覆盖

### Tips/补充信息

1. **Markdown 层：扩展语法**（推荐在源文件中使用）  
   - `:::callout 标题` / `:::callout-tip 标题` / `:::callout-warn 标题` → `.callout` 提示块（**标题必填**）  
   - 另有 `:::tabs`、`:::collapsible`、`:::quiz`（见上文）  
   - 热学、数分、服务器与前后端、AI 系列等书大量使用

2. **HTML 层：`sidenote-mark` 内联标记**（build 后手写定制）  
   在已经生成的 HTML 中插入 `<span class="sidenote-mark" data-note="<HTML内容>">tips</span>`，点击后在右侧 Side Panel 显示补充内容。参考 `browser-war` 的实现。  
   **注意**：Markdown 源文件不会自动生成 `sidenote-mark`；若手写插入，请记得 lock 对应章节 HTML，否则 rebuild 会被覆盖。

### 图片渲染（EUV）⚠️ 已知未生效

历史上曾设想：`euv-lithography` 的 `script.js` 扫描 `<blockquote>` 中以 `[图片` 开头的文本，从 `assets/images/` 加载对应图片。

实际情况：当前 `Mav/knowledge/euv-lithography/assets/script.js` 是模板副本，**没有图片加载逻辑**；生成的 HTML 中 `[图片 02-03：描述]` 只是普通 blockquote 文本。`assets/images/` 里可能有图，但不会自动挂上。该功能待修或废弃。

### 阅读主题

模板 `style.css` / `script.js` 已内置多套阅读主题（如 azure / cobalt / graphite / sepia / warm，`data-style` UI）。`前端风格探索/*.json` 是早期草稿，**未接入构建**，不要当成运行时配置源。

---

## 绝对禁止的操作

1. **不要批量 build 全部知识库**。`md2HTML/build-all.sh --all` **已被脚本禁用**（传入会报错退出）；即便将来有人绕过，也会覆盖未锁定的前端定制。日常只 build 单章、单书或一个明确的 Series。
2. **不要动 `Mav/knowledge/claude-code/`**——纯手写 HTML，无 Markdown 源码。
3. **不要未经确认就 commit/push**。
4. **不要修改 `md2HTML/assets/` 里的模板 CSS/JS 除非明确要改所有书的默认样式**。
5. **谨慎运行 `Mav/knowledge/sync-assets.sh`**。  
   行为（2026-07 起）：默认 **dry-run**；需 `--force` 才真正复制；会读取 `md2HTML/build-lock.yaml`，跳过已锁定的 `slug/assets/style.css|script.js`。  
   源固定为 `ai-deep-learning-core/assets/`（⚠️ 2026-07 该书已移除，脚本现在指向已不存在的源目录；跑会损坏目标书）；源待替换或脚本待清理。跑 `--force` 会覆盖**未锁定**书籍的 `style.css` / `script.js`（例如 `browser-war` 的 assets **目前没有 lock**）。非明确需求不要执行。

---

## 技术栈

- 前端：纯 HTML/CSS/JS，Inter + JetBrains Mono
- 构建：Node.js（marked + gray-matter + js-yaml）
- 搜索：基于 `search-index.json` 的客户端子串过滤（`assets/script.js` 中实现）
- 代码高亮：highlight.js（CDN）
- 数学公式：KaTeX（CDN，模板统一加载，不限于某几本书）
- 图表：Mermaid.js（CDN，客户端渲染；`md2HTML/lib/renderer.js` 把 ` ```mermaid ` 代码块渲染为 `<div class="mermaid">`，`assets/script.js` 额外处理可能的 `<pre><code class="language-mermaid">` fallback）
- 后端：Express + SQLite（`server/` 目录，评论和点赞）
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
| ai-math-principles | 人工智能与数学原理 | 7 章；`status: draft`；USTC 课程速通讲义，进入大一下学期课程讲义折叠区 |
| ~~ai-math-foundations~~ | ~~AI 数学基础~~ | ~~8 章~~ —— 2026-07 移除（外部搬运、手册式、不适配） |
| ~~ai-deep-learning-core~~ | ~~AI 深度学习核心~~ | ~~13 章；亦是 `sync-assets.sh` 的样式源~~ —— 2026-07 移除 |
| ~~ai-computer-vision~~ | ~~AI 计算机视觉~~ | ~~5 章~~ —— 2026-07 移除 |
| ~~ai-nlp-foundations~~ | ~~AI 自然语言处理基础~~ | ~~7 章~~ —— 2026-07 移除 |
| ~~ai-transformers~~ | ~~AI Transformer 深度剖析~~ | ~~7 章~~ —— 2026-07 移除 |
| deep-learning | 深度学习系列讲义 | **Series**；3 篇、21 章；源为 `markdown-backups/Deep-Learning/series.yaml`；`status: published` |
| large-language-models | Large Language Models | **Series**；6 篇、34 章；v1.0.0；`status: published`；源为 `markdown-backups/Large-Language-Models/series.yaml`。卷序：架构演化 → 预训练 → 强化学习速成 → 后训练 → 算力与推理 → 2026 产业地图。写作调研素材在同目录 `_research/`（14 份 research-*.md + 过程笔记；**当前未挂入 series parts**，计划整理为附录卷） |
| rag | 检索增强生成（RAG） | 7 章；`status: published`；v1.0.0；AI 工程实践；从幻觉/检索/切块/重排/评估到 2026 年 agentic 检索之争，末章两百行 Python 手搓知识库问答 |
| ~~d2l-toolbox / d2l-cnn / d2l-rnn~~ | ~~三套独立 D2L 书稿~~ | 2026-07 合并进 `deep-learning` Series，旧源与旧产物移入废纸篓 |
| ~~claude-d2l-to-rnn~~ | ~~深度学习讲义~~ | ~~4 章；旧版合订；`catalog: false`、`status: draft`~~ —— 2026-07 移除（内容已由深度学习 Series 承接） |
| math-analysis | 数学分析讲义 | 6 章（第 8–13 章，下册）；“大一下学期课程讲义”折叠区；`script.js` 锁定 + `12-fourier-analysis.md` 锁定 |
| probability | 概率论精讲 | 6 章；2026-07 新增；何书元《概率论》（北大版）**伴读讲义**，章节号与原书 § 一一对应；课程讲义折叠区（该折叠区同期由“大一下学期课程讲义”更名“本科课程讲义”）；源 md 由 Claude 撰写，底本电子版在用户 `~/Desktop/概率论-何书元.md`（不在仓库内）；15 张 matplotlib 配图由 `_figures/`（common.py 视觉规范 + chN.py）生成，直接输出到产物 `assets/images/`（构建的 copyAssets 不清理该目录）；无锁定条目 |
| data-structures | 数据结构：从指针到算法 | 9 章；原始 md/c 在 `markdown-backups/Data-Structures/_source/`，装配脚本 `_source/assemble.py` |
| thermodynamics | 热学速通 | 6 章；课程讲义折叠区；`_figures/*.py` 生成 PNG；`script.js` 锁定 |
| money-bank | 银行体系与货币系统 | 8 章 |
| investing-101 | 投资入门：从一股股票到一套认知 | 9 章；2026-07 新增；面向刚满 18 岁大学生的投资科普（股票/上市/交易所/涨跌/债券/黄金/基金/风险骗局/实操路线），主线"收益从哪里来"；以 SpaceX 2026-06 IPO、OpenAI/Anthropic/DeepSeek 融资、苹果 1980 IPO 等真实案例贯穿；行情与价格数据核实时点 2026-07（三个调研 agent 交叉核实）；与 money-bank、blockchain-crypto 构成金融三部曲 |
| bite-to-byte-硬件篇 | 电脑怎么工作的 | 8 章 |
| blockchain-crypto | 区块链与加密货币 | 8 章；`status: published`；v3.0（信任/比特币设计与网络/以太坊/共识/生态/Web3/安全实战） |
| rust-book | Rust | 7 章 |
| git-guide | Git 概念与实操 | 5 章 |
| server-frontend-backend | 服务器与前后端 | 5 章；**全部 5 章 .md 均锁定**（另有无效的 `book.yaml` 锁条目） |
| video-screen | 视频与屏幕技术 | 5 章 |
| browser-war | 浏览器：从战争到垄断 | 8 章；第 01/02/04/05 章锁定；有 HTML 定制；**assets 未锁定** |
| euv-lithography | EUV 光刻机 | 7 章；**01–06 锁定，`00-preface` 未锁**；`assets/style.css` + `script.js` 锁定；图片自动加载 **未生效**；KaTeX 为全局模板能力 |
| pdf-explained | PDF：最熟悉的陌生人 | 9 章；01–03 锁定 |
| robogame2026 | RoboGame 2026：从一条命令到四个车轮 | 8 章；`status: published`；v1.0.0；工程实践/嵌入式；已进入首页「独立书籍」tab 的「独立阅读」分组 |
| claude-code | Claude Code 入门指南 | ⚠️ 纯手写 HTML，无 Markdown 源码（约 6 章 + `reference.html`） |
| bluetooth-airpods | 从 AirPods 讲蓝牙耳机 | ⚠️ 纯手写 HTML，无 Markdown 源码；2026-08 新增，**图文单页科普书**首个样例；五章全本（协议与起源 / AirPods 与苹果生态 / 工程难点 / 竞品全景 / 入耳式 vs 头戴式），个人体验（FreeBuds→AirPods 4 降噪落差）作全书主线；~9700 中文字（2026-08 第二次扩写后，用户反馈初版"太单薄"尤其第四章敷衍，加了蓝牙版本史/H1H2芯片细节/空间音频机制/AirPods市场文化争议/传感器防水工程等题外话，第四章竞品从3家扩到5家含新增 Google Pixel Buds）；内容与配图调研由并行 subagent 完成，图片来自 Wikimedia Commons；详见下方「图文单页科普书」专节 |
| exchange-rate-purchasing-power | 从一瓶矿泉水讲汇率、物价与工资 | ⚠️ 纯手写 HTML，无 Markdown 源码；2026-08 新增，**图文单页科普书**；九章 + 尾声，约 2.2 万中文字（目前该格式里最长的一本）；从旅行中"对不上账"的价格出发，讲汇率制度与面值幻觉 / 一价定律与巨无霸指数 / 可贸易品与不可贸易品（巴拉萨-萨缪尔森效应，全书主轴）/ 新加坡可乐与星巴克的比价之谜 / 日元贬值与"安いニッポン" / 中美日新四国工资数据横评 / **时间价格**（本书自创的收尾工具）/ 中美隐形账单对照 / 逐条回访开篇收据。数据时点 2026-08（汇率 6.79、巨无霸指数 8/10、IMF WEO 2026-04、BLS 2025、统计局 2025、国税厅 2024、新加坡人力部 2025），来源清单写在文末 `.mz-further` 里。新增 CSS 组件：`.mz-receipts/.mz-receipt`（开篇收据卡）、`.mz-calc`（换算式）、`.mz-rulers/.mz-ruler`（三把尺子）、`.mz-credits`（图片署名，注意需写成 `.magazine-body p.mz-credits` 才压得过 `.magazine-body p` 的字号）、`td.n`（等宽数字列）|
| guns-terrorism | 从格洛克讲枪械与恐怖袭击 | ⚠️ 纯手写 HTML，无 Markdown 源码；2026-08 新增，**图文单页科普书**；六章全本（靶场体验 / 枪械分类 / 掩体与战术 / 人质围攻 / 全球枪支制度 / 电影与现实判断），从美国靶场第一次打格洛克和左轮出发，串起手枪、步枪、冲锋枪、狙击枪、警察战术、慕尼黑/莫斯科/别斯兰/巴塔克兰等案例，以及中美和其他国家枪支管控差异；图片来自 Wikimedia Commons；已进入首页「独立书籍」tab 的「独立阅读」分组 |

---

## 知识库首页 (index.html)

路径 `Mav/knowledge/index.html`。三个 tab（`.view-toggle`），默认打开第一个：

1. **独立书籍**（`data-view="single"`，默认 active；按钮文案是"独立书籍"，`data-view` 属性值仍是历史遗留的 `single`，改文案时没必要同步改属性名）——独立成册的书，分两组网格，中间隔一条灰色分割线（`.standalone-section--divided`）：
   - **独立阅读**（上）：exchange-rate-purchasing-power、bluetooth-airpods、guns-terrorism、rag、data-structures、robogame2026、claude-code、money-bank、investing-101、bite-to-byte-硬件篇、blockchain-crypto、rust-book、git-guide、server-frontend-backend、video-screen、browser-war、euv-lithography、pdf-explained。这组标题下方有一行 `.section-note`："标了「图文单页」的书是单页图文阅读，其余是侧栏目录的分章节书"——新增图文单页书时不用改这行，只要卡片 `tag` 里带「图文单页」四个字即可
   - **课程教材**（下）：thermodynamics、math-analysis、probability、ai-math-principles
2. **系列讲义**（`data-view="series"`）——`deep-learning`、`large-language-models` 两张 `dl-series-card`，展示 PART 分卷。
3. **手记**（`data-view="notes"`）——最新 2 篇 note 预览卡片（`AUTO:NOTES` 自动回填）+「查看全部手记」链接。

**维护边界**：三个 tab 的卡片内容全部**手动**维护，直接改 `Mav/knowledge/index.html`；只有手记预览区（`AUTO:NOTES` 标记之间）由 `build-notes.js` 自动回填最新 6 篇。新增/移动书籍时务必同步改首页 HTML。

**（2026-08 移除）Project 系统**：曾经存在一个"书之上的聚合层"，把相关书按学习路径串起来（`markdown-backups/projects/*.yaml` → `build-projects.js` → `Mav/knowledge/projects/`，首页第一个 tab 展示带路径圆点动画的卡片）。经确认实际使用中从未通过这个入口浏览过——真实使用路径永远是直接点开某一本书——已连同数据源、构建脚本、输出目录和专用样式（`Mav/assets/projects.css`）一起删除。**系列讲义**（`series.yaml`）是不同的东西，保留：它是同一大领域下多本书的真实结构化编排（Part 顺序、全系列连续编号），不是策展层。

---

## 图文单页科普书（Magazine 格式）

### 概念

2026-08 起，知识库有**两种平行的书籍形态**，对应两种阅读模式，不是谁取代谁：

| | 教材查阅型（原有） | 图文单页科普型（新增） |
|---|---|---|
| 用途 | 考试复习/公式速查，反复跳转定位 | 叙事型科普，从头读到尾一次性读完 |
| 构建方式 | md2HTML 流水线：`markdown-backups/*.md` → `build.js` → HTML | **手写 HTML/CSS，无 Markdown 源，无 build 脚本** |
| 导航 | 左侧栏常驻 TOC | 顶部窄 nav + 页内锚点跳转，不占内容宽度 |
| 正文 | 大段文字为主，图极少（多为公式/matplotlib 图表） | 图文交替，`.mz-*` 组件（hero/hook/split/figure/stats/myth） |
| 例子 | thermodynamics、probability、browser-war 等现有全部书籍 | `bluetooth-airpods`、`guns-terrorism`、`exchange-rate-purchasing-power` |

选题判断标准：这本书是"被查"还是"被读"？前者留在 md2HTML 流水线，后者才用这个新格式。**不要把现有书迁移过来**——这个格式只用于新选题，已完成的书不动。

### ⚠️ 没有 Markdown 源，不进锁定机制

这类书**不在** `markdown-backups/` 下建文件夹，**不写** `book.yaml`，**不跑** `node build.js`。`build-lock.yaml` 的锁定机制是为"md 会覆盖手动定制的 HTML"这个风险设计的——这类书从第一天起就是纯手写 HTML，没有这个风险，所以**不需要、也不应该**往 `build-lock.yaml` 里加锁定条目。以后遇到这类书，直接改 `Mav/knowledge/<slug>/` 下的文件即可，不必找对应的 md 源（找不到，也不该去找）。

### 目录结构范式

```
Mav/knowledge/<slug>/
├── index.html          ← 单页正文（多节可用页内锚点分隔，不拆多个 HTML 文件）
└── assets/
    ├── style.css        ← 从 md2HTML/assets/style.css 原样复制，不改
    ├── magazine.css     ← 本书专属的图文布局组件
    └── images/          ← 下载好的图片（已裁剪压缩到网页可用体积）
```

### 设计铁律：共享 token 层，布局层自由

这是这个格式能跟极简教材类书"衔接不突兀"的核心机制，**新书必须遵守，不允许自创**：

- **色板**：`--ink` / `--ink-soft` / `--muted` / `--line` / `--bg` / `--bg-soft` 等变量原样沿用 `style.css`，**不引入新颜色、不用彩色 accent**
- **字体**：Inter（正文/标题）+ JetBrains Mono（标签/数据），不引入衬线字体等新字体
- **边角**：直角或最多 4px 圆角，1px 细边框（`var(--line)`），**不用大圆角卡片**
- **顶部 nav**：直接复用 `style.css` 里的 `.topnav` / `.topnav-inner` / `.brand` / `.nav-links` / `.nav-btn`，样式不改；因为这类页面通常没有 `script.js`（见下），`.topnav` 默认的"滚动后才显示分隔线"效果不会触发，需要在 `magazine.css` 里加一行 `.topnav { border-bottom-color: var(--line); }` 让分隔线常驻显示
- **开场封面**（2026-08 更新，取代早期"纯排版气闸"约定）：正文顶部用 `.mz-cover`——`<main>` 的直接子元素（`.magazine-body` 的兄弟，不嵌在其内部，这样天然铺满视口宽度，不需要 vw 破格 hack）。左栏大标题 + mono 小标签 + 一句话简介，右栏一张大图（`aspect-ratio` 裁切），窄屏自动堆叠（图在上）；底部一行 `.mz-cover-scroll-cue` 提示继续下滑。往下滑之后才进入 `.magazine-body` 正文（第一段个人化开场白 + 后续章节）。背景用 `--bg-soft` 与正文区分，不引入新色板——"有颜色"这件事完全靠照片本身，不是靠 UI accent。旧版"气闸"（`.chapter-head`，纯排版不放图）仍是 `style.css` 自带组件，其他书如果不需要封面式开篇可以继续用它，但 2026-08 后新的图文单页书默认用 `.mz-cover`
- **正文宽度**：`.magazine-body { max-width: 1040px }`（2026-08 从 920px 调宽，早期版本偏窄）
- **锚点跳转不被 sticky nav 遮住标题**：全局 `style.css` 已有 `html { scroll-padding-top: 72px }`，图文单页书应在 `magazine.css` 里针对被跳转的 `h2[id]` 额外加 `scroll-margin-top: 88px`（两者会取较大值生效），比只依赖全局 72px 更保险
- 布局层完全自由：要不要 hero、要不要 split、图片摆多少，这些由内容决定，不受上面几条约束

### `magazine.css` 组件小抄

| 类名 | 解决什么问题 |
|---|---|
| `.mz-cover` / `.mz-cover-inner` / `.mz-cover-text` / `.mz-cover-figure` / `.mz-cover-scroll-cue` | 开场封面：大标题+简介（左）+ 大图（右），窄屏堆叠；`.mz-cover` 需放在 `.magazine-body` 外层（`<main>` 的兄弟节点） |
| `.mz-hero` | 封面之后、正文内的整页宽度大图 + caption（不与 `.mz-cover` 重复用同一张图） |
| `.mz-hook` | 每节开头的问题式引子（斜体，左边一条粗线） |
| `.mz-split` / `.mz-split.reverse` | 文字+图片左右对照，reverse 换边；窄屏自动堆叠为单栏 |
| `.mz-figure` | 单独一张带 caption 的配图 |
| `.mz-inline-icon` | 小尺寸图标 + 一段说明文字并排（如 logo 讲解） |
| `.mz-stats` | 数据速览网格（几个数字/短词 + 标签，也可当协议名/编解码器速查表用） |
| `.mz-myth` / `.mz-myth-row.false` / `.mz-myth-row.true` | 「传说 vs 实际」两行对照卡，纠正常见误解 |
| `.mz-chapter-marker`（内含 `.mz-chapter-num` + `.mz-chapter-label`） | 章节序号大标签（如"01" + "第一章"），放在每章 `h2` 正上方、独占一行；`h2[id]` 自身的顶部分隔线职责已转移给这个组件，不要重复加线 |
| `.mz-further` | 「延伸阅读」虚线框，内容讲深了收住时指向外部资源 |
| `.mz-timeline` | 产品世代时间线（左侧竖线+圆点，年份+标题+描述，可选配小图） |
| `.mz-device-compare` | 两栏对照（如"设备 A 已覆盖" vs "设备 B 才有"），跟 `.mz-myth` 的二元叙事不同，这个是并列清单 |
| `.mz-compare-grid` / `.mz-compare-card` | 多个同类事物的卡片网格（图+标题+一句 tag+描述），`auto-fit minmax` 布局，3 张或 4 张都能摆好看 |
| `.mz-receipts` / `.mz-receipt`（含 `.where`/`.what`/`.price`/`.puzzle`） | 开篇并列摆几个"待解释的具体案例"卡片（地点 + 事物 + 数字 + 一句悬念）；`exchange-rate-purchasing-power` 新增 |
| `.mz-calc`（内含多行 `.line`，可选 `.note`） | 一步步摆出来的换算式/推导链，等宽字体、`white-space: nowrap` + 自身横向滚动，窄屏不会撑破页面；`<em>` 在里面渲染成灰色的运算符/旁注；同上书新增 |
| `.mz-rulers` / `.mz-ruler`（含 `.idx`/`h4`/`.use`） | 三到四个并列的"方法/工具"卡片，末行 `.use` 用虚线分隔写适用场景；同上书新增 |
| `.magazine-body p.mz-credits` | 文末图片来源署名。**注意必须写成 `.magazine-body p.mz-credits`**，否则被 `.magazine-body p` 的 `font-size` 压过去（早期几本书是用行内 style 解决的，这个类是它的复用版） |
| `.magazine-body td.n` / `th.n` / `td.hi` | 表格里的等宽数字列（`.n`，带 `nowrap`）和强调的首列（`.hi`）；数据密集的书很需要 |

这些类名是 `bluetooth-airpods/assets/magazine.css` 里已经写好的实现（后四个在 `exchange-rate-purchasing-power/assets/magazine.css`），新书可以直接复制这个文件当起点，按需增删组件，但改动要遵守上面的设计铁律。

### 叙事结构范式（观察到的模式，不是强制规则）

对比 `bluetooth-airpods` 和 `guns-terrorism` 两本内容完全不相关的书，谋篇布局上独立收敛出了同一套习惯，值得记录下来供新书参考，但**不是必须照做的模板**——布局层自由这条铁律同样适用于叙事结构：

- **个人化开场白**：`.mz-cover` 之后，正文第一段不是背景介绍，而是作者第一人称的具体经历（"我自己用了很久的是华为 FreeBuds…"／"美国大多数持牌枪店都附带室内靶场…"），用一个真实细节制造反差或困惑，全书要回答的核心问题从这个反差里自然引出，结尾章节再回扣它
- **每章开局用 `.mz-hook` 提问**：不是每章都用，但重要转折章节习惯用一句设问开场（"给一项无线技术起名字，为什么会想到一个死了一千年的国王？"），把读者的好奇心先勾出来再展开解释
- **`.mz-myth` 安插在读者最可能被电影/流言带偏的地方**：不是固定位置，而是content-driven——出现在某个常见误解最集中的段落之后，及时纠偏
- **章节内部有"回扣"习惯**：新知识点常主动挂回前一章或本章前文提到过的细节（"这也是第一章那张辟谣卡片的答案来源"），让读者感觉框架在持续累积而不是章节割裂
- **收尾章节回访全书引用过的具体例子**：不是单纯总结知识点，而是把开场和正文里提到的电影/产品/事件逐一"回访"一遍，用学到的框架重新解释它们，形成首尾闭环
- **图片说明区分两种密度**：`.mz-figure`/`.mz-split` 里的 `figcaption` 一两句话点出图里的关键信息；文末统一放一段小字（`var(--mono)`, 11px）逐张署名图片来源和协议，不分散在正文里

这套结构不是靠 CSS 强制的，纯粹是内容组织习惯，新书作者（人类或 AI）想突破也完全可以，但按这个骨架写通常更省心、也更容易维持"从头读到尾"的阅读节奏。

### 取图规范

图片一律从 **Wikimedia Commons** 下载，不要用 Apple/品牌方官方宣传图这类版权图：

1. 用 Commons API 搜索候选（`action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata`），检查 `LicenseShortName`（CC0 / CC BY / CC BY-SA 都可用；带 SA 的要署名）
2. `curl` 下载原图（带 UA header，标明身份和联系方式）
3. `sips -Z <width>` 缩小尺寸 + `sips -s formatOptions <quality>` 压缩体积，网页用图没必要保留几千像素原图
4. 在页面底部加一行 mono 小字，署上作者名和协议（CC BY-SA 系列**必须**署名；CC0 可省略但建议保留来源）

### portal 接入规则

新书卡片放进「独立书籍」tab 的「独立阅读」分组（`Mav/knowledge/index.html`），`tag` 里**必须**包含「图文单页」四个字，例如 `课外 · 图文单页 · 试读`——这是目前唯一区分"这本书阅读体验不一样"的信号，纯靠人工写进 tag，没有自动化检测。分组标题下方已经有一行 `.section-note` 做统一说明，新增书籍不需要再改这行。

---

## Notes 系统（手记）

### 概念

Notes 是知识库中**短小内容的收容所**——生活中遇到的小疑问、值得记录但不够一本书的知识点（1-2 节）。每篇 note 是一个独立的 `.md` 文件，不需要 book.yaml、不需要章节编号，按日期倒序展示。

与 Book 的关系：note 是「不成书的碎片」；某篇 note 如果越写越长（4-5 节以上），应该升级为独立的 Book。

### 数据源

位置：`markdown-backups/notes/`

```
markdown-backups/notes/
├── notes.yaml              ← 集合元数据（title/slug/description/author/language）
├── example-note-format.md  ← 每篇手记一个 .md
└── placeholder-dns-udp.md
```

单篇 note 的 front-matter：

```markdown
---
title: "为什么 DNS 默认用 UDP"     # 必需
date: 2026-07-28                  # 必需；YYYY-MM-DD，用于排序（新在前）
readTime: 3                       # 可选；预计阅读分钟数
description: "一句话描述"          # 必需；列表页展示 + 搜索用
tags: [网络, 协议]                # 可选；列表页标签筛选用
---

正文（支持所有扩展语法：callout/tabs/collapsible/KaTeX/Mermaid…）
```

### 构建命令

```bash
cd md2HTML
node build-notes.js                  # 构建全部 note + 列表页 + assets + 搜索索引 + 首页预览
node build-notes.js <file.md>        # 只构建一篇（自动刷新列表页/搜索/首页预览）
node build-notes.js --index          # 只重建列表页
node build-notes.js --force [...]    # 忽略锁定
```

Lock 路径格式（与 Book 共用 `build-lock.yaml`）：

| 格式 | 效果 |
|------|------|
| `notes/<file.md>` | 跳过该 note 的 HTML 重新生成 |
| `notes/index.html` | 跳过列表页重新生成 |
| `notes/assets/<filename>` | copyAssets 跳过该文件 |

### 输出

```
Mav/knowledge/notes/
├── index.html              ← 列表页（日期倒序 + 标签筛选 + ⌘K 搜索）
├── <slug>.html             ← 单篇 note（平铺，无 chapters/ 子目录）
└── assets/
    ├── style.css / script.js   ← 从 md2HTML/assets/ 复制（阅读主题/搜索/sidenote 全支持）
    ├── notes.css               ← 从 md2HTML/notes-assets/ 复制
    └── search-index.json
```

note 页面是简化版的章节页：无侧边栏、无上下章翻页（note 之间独立），保留进度条、阅读设置、⌘K 搜索、sidenote side panel。底部是「返回手记 / 知识库」导航。

### 首页集成

`build-notes.js` 自动把最新 6 篇 note 回填到 `Mav/knowledge/index.html` 的「手记」tab：

```html
<!-- AUTO:NOTES:START -->
<!-- AUTO:NOTES:END -->
```

日常流程：写 `.md` → `node build-notes.js <file.md>` → 完成（首页预览自动更新，无需手改 HTML）。

---

## 常见操作速查

| 需求 | 命令/位置 |
|------|-----------|
| 新建知识库书 | `markdown-backups/` 下建文件夹 + `book.yaml` + `.md` |
| 构建单本书 | `cd md2HTML && node build.js --book <Book-Name>` |
| 构建单章 | `cd md2HTML && node build.js --book <Book-Name>/chapter.md` |
| 新建 Series | `markdown-backups/` 下建文件夹 + `series.yaml` + Part 子目录中的 `.md` |
| 构建 Series | `cd md2HTML && node build.js --series <Series-Name>` |
| 构建 Series 单章 | `cd md2HTML && node build.js --series <Series-Name>/part/chapter.md` |
| 增加独立书籍入口卡片 | 编辑 `Mav/knowledge/index.html`「独立书籍」tab 的独立阅读/课程教材分组，或「系列讲义」tab（目前仍需手动） |
| 新建图文单页科普书 | 不建 md 源；直接在 `Mav/knowledge/<slug>/` 手写 `index.html` + `assets/`，规范见「图文单页科普书」专节 |
| 新建手记 | `markdown-backups/notes/` 下写 `.md`（front-matter: title/date/description/tags） |
| 构建手记 | `cd md2HTML && node build-notes.js <file.md>`（或无参数构建全部） |
| 发长文 | `Mav/blog/posts/` 下写 `.md`，`cd Mav/blog && node blog-build.js`，再手动在时间线加条目 |
| 更新时间线 | 手改 `Mav/timeline/index.html`（条目模板在页内注释里），同步主页 `recent-list` |
| 锁定文件 | `cd md2HTML && node build.js --lock <path>` |
| 解锁文件 | `cd md2HTML && node build.js --unlock <path>` |
| 查看所有锁 | `cd md2HTML && node build.js --list-lock` |
| 修改前端样式（特定书） | 直接改 `Mav/knowledge/<slug>/assets/style.css`，然后 `--lock <slug>/assets/style.css` |
| 加 Markdown 提示块 | 在 `.md` 中使用 `:::callout 标题` / `:::callout-tip 标题` / `:::callout-warn 标题`（标题必填） |
| 加 HTML sidenote tips | 在已生成 HTML 中插入 `<span class="sidenote-mark" data-note="...">tips</span>`，并 lock 该章节 |
| **危险：不要执行** | `build-all.sh --all`（已禁用）；`sync-assets.sh --force`（会覆盖未锁 assets） |

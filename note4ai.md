# note4ai.md

> 最后更新：2026.07.16

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
│   │   ├── index.html           ← 知识库入口页（双模式：Projects / 全部书籍）
│   │   ├── projects/            ← Project 详情页输出
│   │   │   ├── manifest.json    ← 所有 project 的元数据（备用；首页不 fetch）
│   │   │   ├── how-computer-works/index.html
│   │   │   └── digital-formats/index.html
│   │   ├── deep-learning/       ← 深度学习 Series 输出（3 篇、21 章）
│   │   ├── browser-war/         ← 示例书（有前端定制）
│   │   ├── euv-lithography/     ← 示例书（有前端定制）
│   │   ├── robogame2026/        ← RoboGame 2026 讲义
│   │   ├── claude-code/         ← ⚠️ 纯手写 HTML，无 Markdown 源码
│   │   └── ...
│   └── assets/                  ← 全站共享 CSS/JS
│       ├── style.css            ← 主样式（首页 / about / 知识库入口）
│       ├── projects.css         ← Project 功能专用样式
│       ├── about.css            ← About 页轻量覆盖
│       └── script.js            ← 全站脚本（含知识库入口 tab 等）
├── markdown-backups/            ← 知识库 Markdown 源文件
│   ├── Browser-War/             ← 每本书一个文件夹
│   │   ├── book.yaml            ← 元数据（title/author/description/language/status）
│   │   ├── 01-chapter.md        ← 章节文件（带 front-matter）
│   │   └── ...
│   ├── RoboGame2026/            ← 工程实践讲义
│   ├── Deep-Learning/           ← Series 源目录
│   │   ├── series.yaml          ← Series 元数据与 Part 顺序
│   │   ├── 01-toolbox/*.md      ← PART I 章节
│   │   ├── 02-cnn/*.md          ← PART II 章节
│   │   └── 03-rnn/*.md          ← PART III 章节
│   ├── projects/                ← Project 数据源（YAML）
│   │   ├── how-computer-works.yaml
│   │   └── digital-formats.yaml
│   └── EUV-Lithography/
├── md2HTML/                     ← 静态站点生成器
│   ├── build.js                 ← 主构建入口（Book + Series）
│   ├── build-projects.js        ← Project 构建脚本
│   ├── build-all.sh             ← shell 包装（⚠️ `--all` 已禁用，传入会 exit 1）
│   ├── build-lock.yaml          ← 白名单/锁定列表
│   ├── inject-quiz.js           ← 遗留 quiz 注入脚本（兼容用，新书勿依赖）
│   ├── convert-ai-lessons.js    ← AI 讲义转换辅助（非日常构建路径）
│   ├── assets/                  ← 模板 CSS/JS（新书默认 style.css + script.js）
│   ├── series-assets/           ← Series 专用 CSS（series.css）
│   ├── templates/               ← Book 与 Series 的封面/章节模板
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
| `statusNote` | | 元数据；书籍构建不用。Project 草稿详情页会用 |

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
| ~~d2l-toolbox / d2l-cnn / d2l-rnn~~ | ~~三套独立 D2L 书稿~~ | 2026-07 合并进 `deep-learning` Series，旧源与旧产物移入废纸篓 |
| ~~claude-d2l-to-rnn~~ | ~~深度学习讲义~~ | ~~4 章；旧版合订；`catalog: false`、`status: draft`~~ —— 2026-07 移除（内容已由深度学习 Series 承接） |
| math-analysis | 数学分析讲义 | 6 章（第 8–13 章，下册）；“大一下学期课程讲义”折叠区；`script.js` 锁定 + `12-fourier-analysis.md` 锁定 |
| data-structures | 数据结构：从指针到算法 | 9 章；原始 md/c 在 `markdown-backups/Data-Structures/_source/`，装配脚本 `_source/assemble.py` |
| thermodynamics | 热学速通 | 6 章；课程讲义折叠区；`_figures/*.py` 生成 PNG；`script.js` 锁定 |
| money-bank | 银行体系与货币系统 | 8 章 |
| bite-to-byte-硬件篇 | 电脑怎么工作的 | 8 章 |
| blockchain-crypto | 区块链与加密货币 | 8 章；`status: published`；v3.0（信任/比特币设计与网络/以太坊/共识/生态/Web3/安全实战） |
| rust-book | Rust | 7 章 |
| git-guide | Git 概念与实操 | 5 章 |
| server-frontend-backend | 服务器与前后端 | 5 章；**全部 5 章 .md 均锁定**（另有无效的 `book.yaml` 锁条目） |
| video-screen | 视频与屏幕技术 | 5 章 |
| browser-war | 浏览器：从战争到垄断 | 8 章；第 01/02/04/05 章锁定；有 HTML 定制；**assets 未锁定** |
| euv-lithography | EUV 光刻机 | 7 章；**01–06 锁定，`00-preface` 未锁**；`assets/style.css` + `script.js` 锁定；图片自动加载 **未生效**；KaTeX 为全局模板能力 |
| pdf-explained | PDF：最熟悉的陌生人 | 9 章；01–03 锁定 |
| robogame2026 | RoboGame 2026：从一条命令到四个车轮 | 8 章；`status: published`；v1.0.0；工程实践/嵌入式；已进入首页「独立阅读」与「全部书籍」 |
| claude-code | Claude Code 入门指南 | ⚠️ 纯手写 HTML，无 Markdown 源码（约 6 章 + `reference.html`） |

---

## Project 系统

### 概念

Project 是知识库中**书之上的聚合层**——把相关的书按阅读顺序串成一条学习路径。一本书可以属于多个 project（多对多），也可以不属于任何 project（作为「独立阅读」展示）。

### 数据源

位置：`markdown-backups/projects/*.yaml`

```yaml
title: "计算机是怎么工作的"
slug: how-computer-works
description: "从晶体管到浏览器，一路向上"
order: 2
books:
  - slug: bite-to-byte-硬件篇
    role: "起点：硬件和操作系统是怎么协作的"
    label: "硬件篇"
  - slug: server-frontend-backend
    role: "网络：请求怎么跑通的"
    label: "服务器"
  - slug: browser-war
    role: "终点：浏览器的 30 年战争"
    label: "浏览器"
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
| `order` | 推荐 | 首页 Project 卡片排序（数字越小越靠前） |
| `status` | 可选 | `draft` 表示待整理路线；**构建会自动过滤**，不进入 `AUTO:PROJECTS` 主列表。缺省视为 published |
| `statusNote` | 可选 | 草稿路线在详情页显示的状态说明 |
| `books` | ✓ | 书的数组，按顺序排列 |
| `books[].slug` | ✓ | 对应 `markdown-backups/<Dir>` 的 lowercase slug |
| `books[].role` | ✓ | 该书在路径中的角色/定位 |
| `books[].label` | 推荐 | 首页路径圆点/短标签文案 |
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
├── manifest.json                          ← 所有 project 的元数据（首页不动态 fetch，仅备用）
├── how-computer-works/index.html
└── digital-formats/index.html
```

### 当前 Project 列表

| slug | 标题 | 状态 | 包含书籍 |
|------|------|------|----------|
| how-computer-works | 计算机是怎么工作的 | published | 硬件篇 → 服务器 → 浏览器 |
| digital-formats | 数字世界的底层格式 | published | PDF → 视频 → 浏览器 |

旧的 `from-zero-to-transformer` 与 `deep-learning-path` 已由 `deep-learning` Series 取代，配置和输出页面移入废纸篓。

### 知识库首页 (index.html)

路径 `Mav/knowledge/index.html`。两个 tab：

1. **Projects** — 展示 published project 卡片（带路径圆点动画）+ Series + 独立阅读区
2. **全部书籍** — 顶部展示 `deep-learning` Series，之后平铺 **13** 本主书卡片（不含课程讲义）：
   data-structures、robogame2026、claude-code、money-bank、bite-to-byte-硬件篇、blockchain-crypto、rust-book、git-guide、server-frontend-backend、video-screen、browser-war、euv-lithography、pdf-explained

两个视图下方共用一个原生 `<details>` 折叠区：**大一下学期课程讲义**，包含 `thermodynamics`、`math-analysis`、`ai-math-principles`。旧的“深度学习相关书稿”折叠区已移除。

新增 project 后需要：

1. 在 `markdown-backups/projects/` 创建 YAML  
2. 运行 `node build-projects.js`

Project 卡片由构建脚本根据 YAML 自动回填到：

```html
<!-- AUTO:PROJECTS:START -->
<!-- AUTO:PROJECTS:END -->
```

`order` 控制顺序，`books[].label` 控制路径短标签，`status: draft` 的 Project **会在 build 时**从主列表过滤（`isCatalogProject`）。

**维护边界（重要）**：

| 内容 | 是否自动 |
|------|----------|
| Project 主列表（`AUTO:PROJECTS`） | **自动**（`build-projects.js`；draft 过滤） |
| Series、独立阅读、全部书籍、课程折叠区的卡片 | **手动**改 `Mav/knowledge/index.html` |
| 书级 `book.yaml` 的 `status: draft` | **不**自动挪卡片；只作元数据 + 人工约定 |

新增/移动书籍时务必同步改首页 HTML。

### Project 详情页布局

双栏布局（桌面端）：

- **左侧**：header（PROJECT 标签 + 标题 + 描述 + 统计）+ 时间线（书卡片 + 过渡文案）
- **右侧 sticky sidebar**：前置知识 / 涉及概念 / 读完之后你能
- **底部**：路径完成提示 + 返回知识库入口

移动端（< 900px）自动堆叠为单栏。样式在 `Mav/assets/projects.css`。

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
| 增加独立书籍入口卡片 | 编辑 `Mav/knowledge/index.html` 的独立阅读和全部书籍区域（目前仍需手动） |
| 新建 Project | `markdown-backups/projects/` 下建 `.yaml`，然后 `node build-projects.js` |
| 构建 Project | `cd md2HTML && node build-projects.js` |
| 发长文 | `Mav/blog/posts/` 下写 `.md`，`cd Mav/blog && node blog-build.js`，再手动在时间线加条目 |
| 更新时间线 | 手改 `Mav/timeline/index.html`（条目模板在页内注释里），同步主页 `recent-list` |
| 锁定文件 | `cd md2HTML && node build.js --lock <path>` |
| 解锁文件 | `cd md2HTML && node build.js --unlock <path>` |
| 查看所有锁 | `cd md2HTML && node build.js --list-lock` |
| 修改前端样式（特定书） | 直接改 `Mav/knowledge/<slug>/assets/style.css`，然后 `--lock <slug>/assets/style.css` |
| 加 Markdown 提示块 | 在 `.md` 中使用 `:::callout 标题` / `:::callout-tip 标题` / `:::callout-warn 标题`（标题必填） |
| 加 HTML sidenote tips | 在已生成 HTML 中插入 `<span class="sidenote-mark" data-note="...">tips</span>`，并 lock 该章节 |
| **危险：不要执行** | `build-all.sh --all`（已禁用）；`sync-assets.sh --force`（会覆盖未锁 assets） |

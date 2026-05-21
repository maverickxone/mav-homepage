# note4ai.md

> 最后更新：2026.05.21 22:50

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
│   │   ├── index.html           ← 知识库入口页（手动维护卡片列表）
│   │   ├── browser-war/         ← 示例书
│   │   ├── euv-lithography/     ← 示例书（有前端定制）
│   │   ├── claude-code/         ← ⚠️ 纯手写 HTML，无 Markdown 源码
│   │   └── ...
│   └── assets/                  ← 全站共享 CSS/JS
├── markdown-backups/            ← 知识库 Markdown 源文件
│   ├── Browser-War/             ← 每本书一个文件夹
│   │   ├── book.yaml            ← 元数据（title/author/description/language）
│   │   ├── 01-chapter.md        ← 章节文件（带 front-matter）
│   │   └── ...
│   └── EUV-Lithography/
├── md2HTML/                     ← 静态站点生成器
│   ├── build.js                 ← 主构建入口
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
| claude-d2l-to-rnn | 深度学习讲义 | — |
| money-bank | 银行体系与货币系统 | — |
| bite-to-byte-硬件篇 | 电脑怎么工作的 | — |
| blockchain-crypto | 区块链与加密货币 | — |
| rust-book | Rust | — |
| git-guide | Git 概念与实操 | — |
| server-frontend-backend | 服务器与前后端 | 多章锁定 |
| video-screen | 视频与屏幕技术 | — |
| browser-war | 浏览器：从战争到垄断 | 多章锁定，有前端定制 |
| euv-lithography | EUV 光刻机 | 全章锁定，assets 锁定，有图片系统和 KaTeX |

---

## 常见操作速查

| 需求 | 命令/位置 |
|------|-----------|
| 新建知识库书 | `markdown-backups/` 下建文件夹 + `book.yaml` + `.md` |
| 构建单本书 | `cd md2HTML && node build.js <Book-Name>` |
| 增加知识库入口卡片 | 编辑 `Mav/knowledge/index.html`（手动） |
| 发博客 | `Mav/blog/posts/` 下写 `.md`，然后 `cd Mav/blog && node blog-build.js` |
| 锁定文件 | `node build.js --lock <path>` |
| 查看所有锁 | `node build.js --list-lock` |
| 修改前端样式（特定书） | 直接改 `Mav/knowledge/<slug>/assets/style.css`，然后锁定 |
| 加 tips | 在 HTML 中插入 `<span class="sidenote-mark" data-note="...">tips</span>` |

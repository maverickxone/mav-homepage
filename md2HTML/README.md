# md2HTML

把 Markdown 章节转换成静态文档网站的工具。黑白极简设计，模块化架构，支持精细粒度构建和白名单保护。

---

## 核心概念

这个工具做一件事：读取 `markdown-backups/` 里的 Markdown 源文件，转换成 HTML，输出到 `Mav/knowledge/` 下对应的子目录。

```
markdown-backups/Browser-War/    →    Mav/knowledge/browser-war/
├── book.yaml                         ├── index.html（封面）
├── 01-browser-history.md             ├── chapters/01-browser-history.html
├── 02-engine-war.md                  ├── chapters/02-engine-war.html
└── ...                               ├── assets/style.css, script.js
                                      └── assets/search-index.json
```

系列讲义使用同一条渲染链路，入口配置改为 `series.yaml`，章节按 Part 分目录：

```
markdown-backups/Deep-Learning/  →    Mav/knowledge/deep-learning/
├── series.yaml                       ├── index.html（Series 封面）
├── 01-toolbox/*.md                   ├── chapters/01-*.html ... 07-*.html
├── 02-cnn/*.md                       ├── chapters/08-*.html ... 13-*.html
└── 03-rnn/*.md                       ├── chapters/14-*.html ... 21-*.html
                                      └── assets/style.css, series.css, script.js
```

**重要**：md2HTML 只是初始构建工具。构建完成后，你可能会对输出的 HTML 做手动前端优化（改布局、加自定义组件等）。一旦做了手动优化，就把对应的 md 源文件加入白名单，防止下次 build 覆盖你的修改。

---

## 目录结构

```
md2HTML/
├── build.js              # 入口脚本：解析参数，调度构建流程
├── build-all.sh          # Shell 薄包装（方便终端少打字）
├── build-lock.yaml       # 白名单（锁定的源文件列表）
├── lib/                  # 模块化逻辑
│   ├── reader.js         # 读取：book.yaml / series.yaml、md、frontmatter
│   ├── renderer.js       # 转换：Markdown → HTML（含扩展语法处理）
│   ├── templates.js      # 模板：读取 HTML 模板、填充组件、生成页面
│   └── lock.js           # 白名单：读取、检查、增删锁定条目
├── templates/            # Book 与 Series 的 HTML 骨架
│   ├── chapter.html      # 章节页模板（含 {{content}} 等占位符）
│   ├── index.html        # Book 封面页模板
│   ├── series-chapter.html
│   └── series-index.html
├── assets/               # 静态资源（构建时原样复制到输出目录）
│   ├── style.css         # 通用设计系统（所有书共享）
│   └── script.js         # 交互逻辑（主题切换、搜索、进度条等）
├── series-assets/        # Series 专用样式（series.css）
├── content/              # [遗留] 旧版构建的临时目录，现已不使用
├── dist/                 # [遗留] 旧版构建的输出目录，现已不使用
├── node_modules/         # Node.js 依赖
├── package.json          # 项目配置和依赖声明
└── package-lock.json     # 依赖版本锁定
```

---

## 使用方法

### 构建整本书

```bash
node build.js --book Browser-War
```

读取 `markdown-backups/Browser-War/` 下所有 md 和 yaml，生成完整网站到 `Mav/knowledge/browser-war/`。白名单中的 md 会被跳过。

### 构建单个章节

```bash
node build.js --book Browser-War/02-engine-war.md
```

只重新生成第二章的 HTML。适用于：修改了某章 md 内容后，只更新那一章。

注意：虽然只生成一个 HTML 文件，但会读取同目录下所有 md 的 frontmatter（用于生成导航栏和翻页器）。

### 构建封面

```bash
node build.js --book Browser-War/book.yaml
```

只重新生成 `index.html`（封面页）。适用于：修改了 book.yaml 的标题或描述后更新封面。

### 构建 Series

```bash
node build.js --series Deep-Learning
node build.js --series Deep-Learning/02-cnn/01-convolution-basics.md
node build.js --series Deep-Learning/series.yaml
```

三个命令分别构建完整 Series、Series 中的一章、Series 封面。Part 内的章节号从 1 开始，输出时会按 Part 顺序转换为全系列连续编号。

### 强制构建（忽略白名单）

```bash
node build.js --force --book Browser-War
node build.js --force --series Deep-Learning
```

无视白名单，强制从 md 重新生成 HTML。**会覆盖你的手动优化**，谨慎使用。

### Shell 包装

```bash
./build-all.sh --book Browser-War
./build-all.sh --series Deep-Learning
```

`--all` 已禁用，脚本收到该参数会直接退出。

---

## 白名单机制

### 为什么需要白名单

build 是单向管道：md → HTML。一旦你对输出的 HTML 做了手动前端优化（比如把代码块改成自定义时间线组件），下次 build 会从 md 重新生成，覆盖你的修改。

白名单的作用：告诉 build "这个 md 对应的 HTML 我已经手动改过了，不要再从 md 重新生成"。

### 白名单格式

`build-lock.yaml` 里存的是**源文件路径**（相对于 `markdown-backups/`）：

```yaml
locked:
  - Browser-War/01-browser-history.md
  - Browser-War/03-how-browser-works.md
```

### 操作命令

```bash
# 锁定（加入白名单）
node build.js --lock Browser-War/01-browser-history.md

# 解锁（从白名单移除）
node build.js --unlock Browser-War/01-browser-history.md

# 查看当前白名单
node build.js --list-lock
```

### 典型工作流

1. 写完一本书的 md → `node build.js --book Browser-War` 生成全部 HTML
2. 在浏览器里阅读第一章 → 发现想优化时间线的前端展示
3. 直接修改 `Mav/knowledge/browser-war/chapters/01-browser-history.html`
4. 锁定：`node build.js --lock Browser-War/01-browser-history.md`
5. 之后阅读第二章 → 发现内容有错 → 修改 md
6. 重新构建：`node build.js --book Browser-War`（第一章被跳过，第二章正常重建）

---

## 写内容

### book.yaml（必需）

```yaml
title: "浏览器：从战争到垄断"
author: "Mav"
description: "从 1990 年第一个浏览器到 2026 年 Chromium 一统天下。"
language: "ZH-CN"
```

### series.yaml（Series 必需）

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

`parts` 顺序就是阅读顺序。`source` 指向 Series 目录内的 Part 子目录；每个 Part 至少包含一章，内部 frontmatter 的 `chapter` 必须从 1 连续编号。`eyebrow` 为封面主标题上方的小标签，可省略。

### 章节 Markdown（必需）

每章一个 `.md` 文件，头部加 YAML frontmatter：

```markdown
---
title: "浏览器简史——三十年战争"
chapter: 1
readTime: 25
description: "从 Mosaic 到 Chrome，三十年里发生了什么。"
---

## 1.1 万维网的诞生

正文内容...
```

- 章节按 `chapter` 字段排序
- 文件名建议 `01-xxx.md` 格式，方便文件管理器排序
- `readTime` 显示在页面顶部（≈ XX MIN READ）
- `description` 显示在封面的章节卡片上

### 扩展语法

除了标准 Markdown，还支持：

```markdown
:::callout 标题
普通提示框。
:::

:::callout-tip 小技巧
提示类型。
:::

:::callout-warn 注意
警告类型。
:::

:::tabs 选项一 | 选项二
::tab 选项一
第一个标签页内容。
::tab 选项二
第二个标签页内容。
:::

:::collapsible 点击展开
折叠内容。
:::

## 自定义锚点 {#my-custom-id}
```

---

## 模块说明

| 文件 | 职责 |
|------|------|
| `build.js` | 入口。通过 `--book` / `--series` 选择构建类型，再处理完整内容、单章或封面 |
| `lib/reader.js` | 读取 book.yaml / series.yaml、读取 md 文件列表、解析 frontmatter |
| `lib/renderer.js` | Markdown → HTML 转换。配置 marked 渲染器、处理扩展语法（callout/tabs/collapsible）、提取标题 |
| `lib/templates.js` | 读取 HTML 模板、生成页面组件（nav、sidebar、pager、footer、搜索框）、填充模板、复制 assets |
| `lib/lock.js` | 白名单的 CRUD：读取 build-lock.yaml、检查某文件是否锁定、添加/移除条目 |

---

## 依赖

| 包 | 用途 |
|---|---|
| `marked` | Markdown → HTML 转换 |
| `gray-matter` | 解析 md 文件头部的 YAML frontmatter |
| `js-yaml` | 读取 book.yaml 配置文件 |

安装：`npm install`（首次使用时执行一次）

---

## 注意事项

- `content/` 和 `dist/` 是旧版遗留目录，新版 build 不再使用它们，可以忽略
- `assets/style.css` 是 Book 与 Series 共用的设计系统；`series-assets/series.css` 只进入 Series 输出
- build 整本书时会覆盖输出目录的 `assets/`（style.css 和 script.js），所以特殊样式不要放在输出端的 style.css 里——要么内联到 HTML 的 `<style>` 标签，要么放在单独的 CSS 文件里

---

## License

MIT

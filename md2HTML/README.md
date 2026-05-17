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

**重要**：md2HTML 只是初始构建工具。构建完成后，你可能会对输出的 HTML 做手动前端优化（改布局、加自定义组件等）。一旦做了手动优化，就把对应的 md 源文件加入白名单，防止下次 build 覆盖你的修改。

---

## 目录结构

```
md2HTML/
├── build.js              # 入口脚本：解析参数，调度构建流程
├── build-all.sh          # Shell 薄包装（方便终端少打字）
├── build-lock.yaml       # 白名单（锁定的源文件列表）
├── lib/                  # 模块化逻辑
│   ├── reader.js         # 读取：book.yaml、md 文件、frontmatter 解析
│   ├── renderer.js       # 转换：Markdown → HTML（含扩展语法处理）
│   ├── templates.js      # 模板：读取 HTML 模板、填充组件、生成页面
│   └── lock.js           # 白名单：读取、检查、增删锁定条目
├── templates/            # HTML 骨架（构建时消费，不出现在输出中）
│   ├── chapter.html      # 章节页模板（含 {{content}} 等占位符）
│   └── index.html        # 封面页模板
├── assets/               # 静态资源（构建时原样复制到输出目录）
│   ├── style.css         # 通用设计系统（所有书共享）
│   └── script.js         # 交互逻辑（主题切换、搜索、进度条等）
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
node build.js Browser-War
```

读取 `markdown-backups/Browser-War/` 下所有 md 和 yaml，生成完整网站到 `Mav/knowledge/browser-war/`。白名单中的 md 会被跳过。

### 构建单个章节

```bash
node build.js Browser-War/02-engine-war.md
```

只重新生成第二章的 HTML。适用于：修改了某章 md 内容后，只更新那一章。

注意：虽然只生成一个 HTML 文件，但会读取同目录下所有 md 的 frontmatter（用于生成导航栏和翻页器）。

### 构建封面

```bash
node build.js Browser-War/book.yaml
```

只重新生成 `index.html`（封面页）。适用于：修改了 book.yaml 的标题或描述后更新封面。

### 强制构建（忽略白名单）

```bash
node build.js --force Browser-War
node build.js --force Browser-War/01-browser-history.md
```

无视白名单，强制从 md 重新生成 HTML。**会覆盖你的手动优化**，谨慎使用。

### Shell 包装

```bash
./build-all.sh Browser-War              # 等价于 node build.js Browser-War
./build-all.sh --all                    # 构建所有书（白名单仍然生效）
```

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

1. 写完一本书的 md → `node build.js Browser-War` 生成全部 HTML
2. 在浏览器里阅读第一章 → 发现想优化时间线的前端展示
3. 直接修改 `Mav/knowledge/browser-war/chapters/01-browser-history.html`
4. 锁定：`node build.js --lock Browser-War/01-browser-history.md`
5. 之后阅读第二章 → 发现内容有错 → 修改 md
6. 重新构建：`node build.js Browser-War`（第一章被跳过，第二章正常重建）

---

## 写内容

### book.yaml（必需）

```yaml
title: "浏览器：从战争到垄断"
author: "Mav"
description: "从 1990 年第一个浏览器到 2026 年 Chromium 一统天下。"
language: "ZH-CN"
```

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
| `build.js` | 入口。解析命令行参数，判断构建模式（整书/单章/封面），调用其他模块 |
| `lib/reader.js` | 读取 book.yaml、读取 md 文件列表、解析 frontmatter |
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
- `assets/style.css` 是**通用设计系统**，所有书共享。如果某本书需要特殊样式（如时间线组件），应该直接写在那本书输出端的 HTML 或 CSS 里，而不是改模板端
- build 整本书时会覆盖输出目录的 `assets/`（style.css 和 script.js），所以特殊样式不要放在输出端的 style.css 里——要么内联到 HTML 的 `<style>` 标签，要么放在单独的 CSS 文件里

---

## License

MIT

# 个人主页的搭建历程

**Mav × Opus · 2026 年 5 月 15 日 至 5 月 16 日**

一次从零开始的对话，从一本 Claude Code 讲义出发，最终搭建出一个完整的个人知识库网站。以下是完整的交互记录和搭建过程。

---

## 第一阶段：Claude Code 讲义的优化

### 起点

> **Mav**: 我打算创建一个文件，用来写我觉得这个前端项目可以改进的地方。你有什么建议吗？

**Opus**: 读完了整个项目的 HTML/CSS/JS，列出了十几条改进建议——响应式问题、可访问性、性能、功能缺失。建议用 Markdown 记录，创建了 `docs/IMPROVEMENTS.md`。

这是一切的起点。当时的项目是一本关于 Claude Code 的中文指南网站，6 章 + 速查表，设计风格极简（Inter + JetBrains Mono，黑白为主）。

---

### 终端动画触发时机

> **Mav**: 终端设计是划到那里就加载，但很多时候我们还没有划过去呢。能不能改成整个终端都露出来才开始加载？

**Opus**: 把 IntersectionObserver 的 `threshold` 从 `0.3` 改成 `0.9`。一行代码的事，但体验差别很大。

---

### Copy 按钮逻辑反了

> **Mav**: 鼠标放上去的时候右侧的 copy 就亮起来了，鼠标靠近反而变淡了。是不是逻辑反了？

**Opus**: 改成三级渐进：隐藏 → 半透明出现（opacity 0.6）→ hover 时完全高亮（opacity 1 + 背景色）。

---

### 代码块在亮色模式下半黑半白

> **Mav**: 整本书都有这个 bug，就是在明亮模式下代码框非常奇怪，外圈黑色没有调整。

**Opus**: 根因是 highlight.js 的 light 主题给 `.hljs` 加了白色背景，和外层深色 `<pre>` 冲突。修了两处：JS 里永远用 dark hljs 主题 + CSS 里 `pre code.hljs { background: transparent }`。

---

### 文字选中看不见

> **Mav**: 现在我在终端里面划一段话的时候，也是黑色的，导致根本看不清。

**Opus**: 统一改成淡蓝色半透明选中 `rgba(100, 180, 255, 0.35)`，深色浅色背景上都能看清。

---

### 弹窗滚动位置不重置

> **Mav**: 我在第一个弹窗阅读，往下滑到底部，退出，再打开第二个弹窗，就直接在最底部了。

**Opus**: 花了三次才修好。
- 第一次：重置了错误的元素（`modalBody` 而不是 `.modal`）
- 第二次：重置了正确的元素，但时机不对（`display: none` 时设 scrollTop 无效）
- 第三次：先 `classList.add('open')`，再用 `requestAnimationFrame` 等布局完成后设 scrollTop

教训：操作 DOM 滚动属性时，元素必须处于可见且已布局的状态。

---

## 第二阶段：新增缓存章节

### 决定单开一章

> **Mav**: 现在的 ClaudeCode 没有讲"缓存 Cache"的事情，这其实是很重要的概念。

**Opus**: 最初建议插入第四章作为一节，但 Mav 指出篇幅太长，决定单开一章。

这意味着：
- 原第五章（彩蛋）变成第六章
- 所有导航、页脚、章节计数都要更新
- 7 个 HTML 文件 + index.html 的批量修改

---

### 缓存章节的内容

新的第五章《缓存》包含 10 节：
1. 先打个比方（外卖 App 类比）
2. 计算机里到处都是缓存（CPU/浏览器/CDN 表格）
3. 为什么 LLM 也要缓存
4. Prompt Cache 是什么
5. 命中和不命中
6. 怎么看缓存有没有命中
7. 怎么提高命中率
8. 算一笔账（Sonnet 单价对比表）
9. KV Cache 是另一回事
10. 最后一段话

---

### 搜索算法讲解

> **Mav**: 针对这个搜索算法，给我超级详细，超级入门讲一讲👀

**Opus**: 写了一篇从零开始的 TF-IDF + 倒排索引教程，覆盖：
- 为什么不能暴力遍历
- 倒排索引怎么做到 O(1) 查找
- TF-IDF 怎么排序
- BM25 是什么
- MiniSearch 的 prefix/fuzzy/boost 加分项
- 和 PageRank 的对比

Mav 的评价："感觉很智能"。

---

## 第三阶段：搜索功能修复

### 搜索索引是空的

> **Mav**: 搜索功能我刚刚使用失败了。

**Opus**: 发现 `search-index.json` 里 `documentCount: 0`——索引从未被构建过。

---

### 构建工具报错

> **Mav**: 点击按钮没有反应。

**Opus**: 重写了 `tools/build-search-index.html`，加了错误日志、进度显示、Download 按钮。

---

### MiniSearch v6 的 toJSON() 变了

> **Mav**: 建索引失败: "[object Object]" is not valid JSON

**Opus**: MiniSearch v6 的 `toJSON()` 已经返回对象而不是字符串，不需要再 `JSON.parse`。一行代码的 bug，但没有错误提示就很难发现。

---

## 第四阶段：事实核查与内容更新

### /buddy 已被移除

> **Mav**: 这里内容是不是有误？好像在某个版本已经被移除了。

**Opus**: 联网搜索确认：`/buddy` 只存活了约一周（v2.1.89 → v2.1.97），社区有"Bring Back Buddy"请求但官方未恢复。修改了第六章和 commands.js 的相关描述。

---

### /dream 已正式上线

**Opus**: 搜索发现 `/dream` 在 2026 年 5 月 6 日的"Code with Claude"开发者活动上正式发布，不再是泄漏里的未发布功能。更新了第六章的描述。

---

## 第五阶段：个人主页搭建

### 架构设计

> **Mav**: 我打算建立一个个人主页。可能的架构是：关于我、知识库、博客。

**Opus**: 创建了 `Mav/` 文件夹，包含：
- `index.html` — 主页（三张卡片 + 最近动态）
- `about/` — 个人介绍 + 项目
- `knowledge/` — 知识库首页（卡片网格）
- `blog/` — 博客列表 + 示例文章
- `assets/` — 统一的 CSS/JS

风格完全继承 Claude Code 讲义的设计系统。

---

### 知识库批量构建

> **Mav**: 所有的 md 书籍都在 markdown 那个文件夹里面了，有七本书。

**Opus**: 写了 `build-all.sh` 脚本，一次性构建 7 本书并部署到 `Mav/knowledge/`：
- 电脑怎么工作的（8 章）
- 区块链与加密货币（5 章）
- 深度学习讲义（4 章）
- Git 概念讲解与实操（4 章）
- 银行体系与货币系统（8 章）
- Rust（7 章）
- 视频与屏幕技术（5 章）

---

### 串台文件 bug

> **Mav**: 为什么每一个子文件夹里面都有一整套 html？

**Opus**: `build-all.sh` 的两个 bug：
1. build 前没清空 `dist/`，上一本书的章节残留
2. 复制到目标时用 `cp -r`，不会删除目标里已有的多余文件

修复：每次 build 前 `rm -rf dist`，复制前 `rm -rf` 目标文件夹再 `mkdir -p`。

---

### 区块链从 1 章拆成 5 章

> **Mav**: 区块链的，进去发现只有一个按钮，有点抽象。

**Opus**: 按原文的五个"部分"自然分割，写脚本 `sed` 切割 + 加 frontmatter + 重新 build。

---

### 银行体系从 1 章拆成 8 章

同样的操作，额外修了：
- 重复标题（frontmatter title 和正文 `## 第X章` 重复）
- 侧边栏为空（`###` 需要提升为 `##` 才能被侧边栏抓到）

---

### Git 指南重构

从 11 个小章节合并为 4 个大章节，过程中遇到：
- md 切割时代码块被从中间截断（第二章末尾的 ``` 跑到了第三章开头）
- 标题里的 `1.1`、`2.3` 编号前缀需要去掉
- 原文的手写目录（`3. [安装与初始配置](#3-安装与初始配置)`）需要删除

---

### CSS counter 自动编号

> **Mav**: 侧边栏是有 03、04 这种的，但是正文里面只有"分支操作"，应该改成"04 分支操作"。

**Opus**: 用 CSS counter 实现，不改任何 HTML：
```css
.chapter-body { counter-reset: section; }
h2 { counter-increment: section; }
.chapter-body h2::before {
  content: counter(section, decimal-leading-zero) "  ";
}
```

所有用 md2HTML 构建的书自动生效。

---

## 第六阶段：导航与用户体验

### "返回知识库"按钮

> **Mav**: 知识库的子页面"回去"怎么办？

**Opus**: 在 `build.js` 的 `nav-controls` 里加了 `← 知识库` 按钮，改一次模板所有书都生效。Claude Code 那本手动加（用 sed 脚本）。

---

### 子页面的 `← Mav` 返回

所有子页面的 brand 从 `Mav` 改为 `← Mav`，箭头暗示可返回主页。

---

### 博客"返回列表"样式

> **Mav**: 返回博客列表这个应该放下面一点，和正文要分开。

**Opus**: 加了 `border-top` 分割线 + mono 小号灰色字体，视觉上明确是导航而非正文。

---

## 第七阶段：部署上线

### GitHub 仓库

> **Mav**: 我打算把网站全部部署到服务器上，同时做一个 GitHub 端云同步。

创建了 [maverickxone/mav-homepage](https://github.com/maverickxone/mav-homepage) 仓库，包含：
- `Mav/` — 静态站点（Nginx root）
- `markdown-backups/` — 知识库 md 源文件
- `md2HTML/` — 构建工具

添加了 `.gitignore`（排除 node_modules、dist、Zone.Identifier）和 MIT LICENSE。

---

### 服务器配置

- **Nginx** 托管 `Mav/` 目录作为静态站点
- **GitHub Webhook** 自动同步：push 到 GitHub 后服务器几秒内自动 pull
- **HTTPS** 通过 Let's Encrypt 配置
- 2 核 2G 阿里云服务器，绑绑有余

工作流：本地改文件 → `git push` → webhook 触发 → 服务器 `git pull` → 几秒后上线。

---

### WSL 文件权限的坑

推送过程中反复出现"幽灵改动"——git 把 WSL 和 Windows 之间的文件权限变更（644 → 755）当作改动。最终用 `git config core.fileMode false` 解决。

---

## 第八阶段：博客系统

### blog-build.js

> **Mav**: 有没有什么简单优雅的办法写博客？我想像管理 md 一样管理博客。

**Opus**: 写了 `blog-build.js`（约 150 行），实现：
- 读取 `Mav/blog/posts/*.md`
- 每篇转成独立的 HTML 博客页面
- 自动生成 `blog/index.html`（文章列表）
- 自动更新主页"最近在做的事"（取最新 3 篇）

写博客的流程变成：
1. 在 `posts/` 里写一个 `.md` 文件（带 frontmatter）
2. 跑 `node blog-build.js`
3. `git push`

不需要手动改任何 HTML，不需要 AI，不需要记模板格式。

---

## 技术栈总结（最终版）

| 层级 | 技术 |
|------|------|
| 前端 | 纯 HTML/CSS/JS，无框架 |
| 字体 | Inter + JetBrains Mono |
| 知识库构建 | md2HTML（自研，Node.js） |
| 博客构建 | blog-build.js（自研，Node.js） |
| 搜索 | MiniSearch（客户端全文搜索） |
| 代码高亮 | highlight.js |
| 部署 | Nginx + GitHub Webhook 自动同步 |
| 版本控制 | Git + GitHub |
| 证书 | Let's Encrypt（HTTPS） |

---

## 数字（最终）

- 对话轮次：150+
- 修改的文件：300+
- 新建的文件：80+
- 知识库书籍：9 本
- 总章节数：~50 章
- Bug 修复：25+
- 联网搜索：5 次
- 重新 build 次数：20+
- GitHub commits：6

---

## 感想

这次搭建过程本身就是 AI 辅助开发能力的一次完整展示：

- 从前端 bug 修复到内容创作
- 从 CSS 动画到搜索算法讲解
- 从 shell 脚本到服务器架构设计
- 从事实核查到用户体验优化
- 从 GitHub 仓库管理到自动化部署

一个人 + 一个 AI，两天之内，从一本讲义变成了一个完整的、自动化部署的个人网站。

不是 AI 替你做了什么，是你和 AI 一起做了什么。

---

*Built with Claude and curiosity.*

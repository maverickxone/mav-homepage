# Mav's Homepage

我自己的知识库——收录各类我感兴趣的知识，
基于 md2HTML 构建，部署在我自己的服务器上。

在线访问：https://mav-ustc.dev/

## 知识库

按领域分组，每个主题是一个独立的小站。

**AI / 深度学习**

| 主题 | 章节 | 状态 |
|------|:----:|:----:|
| 深度学习系列讲义（3 篇） | 21 | published |
| 人工智能与数学原理（USTC 课程讲义） | 7 | draft |

**计算机系统 / Web**

| 主题 | 章节 |
|------|:----:|
| 电脑怎么工作的 | 8 |
| 服务器，前端与后端 | 5 |
| 浏览器：从战争到垄断 | 8 |

**金融 / 经济**

| 主题 | 章节 |
|------|:----:|
| 银行体系与货币系统 | 8 |
| 区块链与加密货币 | 8 |
| 投资入门：从一股股票到一套认知 | 9 |

**文档 / 媒体**

| 主题 | 章节 |
|------|:----:|
| PDF：最熟悉的陌生人 | 9 |
| 视频与屏幕技术 | 5 |

**工具 / 语言**

| 主题 | 章节 |
|------|:----:|
| Claude Code 入门指南 | 6 |
| Git：概念讲解与实操 | 5 |
| Rust | 7 |

**基础科学 / 硬件**

| 主题 | 章节 |
|------|:----:|
| 数学分析讲义（下册） | 6 |
| 概率论精讲（何书元《概率论》伴读） | 6 |
| 热学速通 | 6 |
| EUV 光刻机 | 7 |

**数据结构 / 算法**

| 主题 | 章节 |
|------|:----:|
| 数据结构：从指针到算法 | 9 |

## Projects（学习路径）

把多本书串成一条有顺序的阅读路线。

**已发布**

- **计算机是怎么工作的** — 硬件篇 → 服务器 → 浏览器
- **数字世界的底层格式** — PDF → 视频 → 浏览器

## 手记（Notes）

不成书的疑问与知识点——短则一段，长则几节，先记下来再说。
每篇手记是 `markdown-backups/notes/` 下的一个独立 `.md`，按日期倒序展示，支持标签筛选与全文搜索。

## 项目结构

```
Mav/                    ← Nginx root（线上站点）
markdown-backups/       ← Markdown 源文件（Book 或 Series 各一个文件夹）
md2HTML/                ← 构建工具（marked + gray-matter → HTML）
server/                 ← 后端 API（评论/点赞，Express + SQLite）
```

## md2HTML — 自研静态站点生成器

`md2HTML/` 是这个网站的核心构建工具，把 Markdown 源文件转换为完整的 HTML 阅读页面。
这样节省不少 token，同时 HTML 也比 md 文档更具观赏性。

- 读取 `book.yaml` 或 `series.yaml`（元数据）+ `.md`（章节内容，带 front-matter）
- 渲染为带目录、搜索、代码高亮、Mermaid 图表的 HTML 页面
- 自动生成封面目录页 + 全文搜索索引
- Series 支持 Part 分组、全局连续章节编号和跨 Part 翻页
- 支持 build-lock 白名单机制（锁定已定制的文件，防止重新构建覆盖）
- 支持扩展语法：`:::callout`、`:::callout-tip`、`:::callout-warn`、`:::tabs`、`:::collapsible`、`:::quiz`

```bash
cd md2HTML
node build.js --book <Book-Name>             # 构建单本书
node build.js --book <Book-Name>/ch.md       # 只构建书籍的一章
node build.js --series <Series-Name>         # 构建完整系列讲义
node build.js --series <Series-Name>/part/ch.md # 只构建系列的一章
node build-projects.js            # 构建 Project 页面
node build-notes.js               # 构建手记（全部）
node build-notes.js <file.md>     # 构建单篇手记
```

## 技术栈

- **前端**：纯 HTML/CSS/JS，Inter + JetBrains Mono
- **构建**：Node.js（marked + gray-matter + js-yaml）
- **代码高亮**：highlight.js（CDN）
- **图表**：Mermaid.js（CDN，客户端渲染）
- **搜索**：基于 `search-index.json` 的客户端子串过滤
- **数学公式**：KaTeX（CDN）
- **后端**：Express + SQLite
- **部署**：Ubuntu + Nginx + GitHub webhook 自动同步

## 使用内容

欢迎 fork。使用本仓库的知识库内容请标注来源：

> 内容来自 [maverickxone/mav-homepage](https://github.com/maverickxone/mav-homepage)

## License

MIT

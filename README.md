# Mav's Homepage

个人主页 + 知识库 + 博客。纯静态，无框架，手写 HTML/CSS/JS。

## 在线访问

访问 https://mav-ustc.dev/
（name.com，域名创建于2026.05.16，一年有效）

## 结构

```
mav-homepage/
├── Mav/                    ← 静态站点（Nginx root 指向这里）
│   ├── index.html          ← 主页
│   ├── about/              ← 关于我
│   ├── blog/               ← 博客
│   ├── knowledge/          ← 知识库（20 本）
│   │   ├── projects/       ← Project 学习路径页面
│   │   └── graph/          ← 知识图谱（力导向可视化）
│   └── assets/             ← 全站 CSS/JS
├── markdown-backups/       ← 知识库的 Markdown 源文件
│   └── projects/           ← Project YAML + 图谱边数据
└── md2HTML/                ← Markdown → HTML 构建工具
    ├── build.js            ← 书籍构建
    ├── build-projects.js   ← Project 页面构建
    └── build-graph.js      ← 知识图谱数据构建
```

## 知识库

| 主题 | 章节数 | 标签 |
|------|:------:|------|
| Claude Code 入门指南 | 6 + Ref | 工具 |
| AI 数学基础 | 8 | AI |
| AI 深度学习核心 | 13 | AI |
| AI 计算机视觉 | 5 | AI |
| AI 自然语言处理基础 | 7 | AI |
| AI Transformer 深度剖析 | 7 | AI |
| 深度学习前置工具箱 | 7 | AI |
| CNN实战篇 | 6 | AI |
| RNN实战篇 | 8 | AI |
| 银行体系与货币系统 | 8 | 金融 |
| 电脑怎么工作的 | 8 | 计算机 |
| 区块链与加密货币 | 5 | 金融科技 |
| Rust | 7 | 编程语言 |
| Git：概念讲解与实操 | 5 | 工具 |
| 视频与屏幕技术 | 5 | 数字媒体 |
| 服务器与前后端 | 5 | Web |
| 浏览器：从战争到垄断 | 8 | Web |
| EUV 光刻机 | 7 | 半导体 |
| PDF：最熟悉的陌生人 | 9 | 文档技术 |
| 热力学 | 6 | 物理 |

## Projects（学习路径）

知识库支持将多本书串联为有序学习路径：

| Project | 包含 |
|---------|------|
| 计算机是怎么工作的 | 硬件篇 → 服务器 → 浏览器 |
| 深度学习从零到能读论文 | 工具箱 → CNN → RNN |
| 数字世界的底层格式 | PDF → 视频 → 浏览器 |

首页通过 Projects / 全部书籍 / 图谱 三个 tab 切换浏览。

## 知识图谱

基于 [force-graph](https://github.com/vasturiano/force-graph) 的交互式力导向图谱，展示书与书、章与章之间的知识关联。

- 20 本书 + 章节作为节点
- 36 条手动标注的跨章关联
- 滚轮缩放 / 拖拽平移 / 拖拽节点（松手弹回）
- Hover 高亮 / 点击弹窗

## 构建命令

```bash
cd md2HTML

# 构建单本书
node build.js <Book-Name>

# 构建 Project 页面
node build-projects.js

# 构建知识图谱数据
node build-graph.js
```

## 使用知识库内容

欢迎 fork、下载、修改。如果你使用了本仓库的知识库内容（Markdown 源文件或 HTML 页面），请标注来源：

> 内容来自 [maverickxone/mav-homepage](https://github.com/maverickxone/mav-homepage)

## 技术栈

- 前端：纯 HTML/CSS/JS，Inter + JetBrains Mono
- 构建：md2HTML（自研，基于 marked + gray-matter）
- 图表：Mermaid.js（CDN，客户端渲染）
- 知识图谱：force-graph（Canvas + d3-force）
- 搜索：MiniSearch（客户端全文搜索）
- 代码高亮：highlight.js
- 部署：Nginx + GitHub 同步

## License

MIT — 详见 [LICENSE](./LICENSE)

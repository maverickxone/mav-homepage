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
│   ├── knowledge/          ← 知识库（9 本）
│   └── assets/             ← 全站 CSS/JS
├── markdown-backups/       ← 知识库的 Markdown 源文件
└── md2HTML/                ← Markdown → HTML 构建工具
```

## 知识库

| 主题 | 章节数 | 标签 |
|------|:------:|------|
| Claude Code 入门指南 | 6 + Ref | 工具 |
| 深度学习讲义（PyTorch → RNN） | 4 | AI |
| 银行体系与货币系统 | 8 | 金融 |
| 电脑怎么工作的 | 8 | 计算机 |
| 区块链与加密货币 | 5 | 金融科技 |
| Rust | 7 | 编程语言 |
| Git：概念讲解与实操 | 4 | 工具 |
| 视频与屏幕技术 | 5 | 数字媒体 |
| 服务器与前后端 | 5 | 计算机 |

## 使用 md2HTML 构建知识库

```bash
cd md2HTML
npm install
# 把 markdown 源文件放到 content/ 目录
cp ../markdown-backups/Git-Guide/*.md content/
cp ../markdown-backups/Git-Guide/book.yaml content/
# 构建
node build.js
# 输出在 dist/
```

## 使用知识库内容

欢迎 fork、下载、修改。如果你使用了本仓库的知识库内容（Markdown 源文件或 HTML 页面），请标注来源：

> 内容来自 [maverickxone/mav-homepage](https://github.com/maverickxone/mav-homepage)

## 技术栈

- 前端：纯 HTML/CSS/JS，Inter + JetBrains Mono
- 构建：md2HTML（自研，基于 marked + gray-matter）
- 搜索：MiniSearch（客户端全文搜索）
- 代码高亮：highlight.js
- 部署：Nginx + GitHub 同步

## License

MIT — 详见 [LICENSE](./LICENSE)

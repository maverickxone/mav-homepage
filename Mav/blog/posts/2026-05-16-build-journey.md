---
title: "个人主页搭建历程"
date: 2026-05-16
---

从一本 Claude Code 讲义出发，一天之内搭建了完整的个人网站。记录一下过程。

## 做了什么

- 优化了 Claude Code 讲义的前端（终端动画、代码块样式、搜索功能）
- 新增了一章"缓存"，讲 Prompt Cache 的原理
- 搭建了个人主页框架（关于我 / 知识库 / 博客）
- 用 md2HTML 批量构建了 8 本知识库
- 拆分了区块链、银行、Rust、Git、视频技术的 md 源文件
- 部署到DO服务器，Nginx + GitHub webhook 自动同步

## 技术栈

纯静态 HTML/CSS/JS，不依赖任何框架。字体用 Inter + JetBrains Mono，黑白极简风格，这些也是Opus设计的。构建工具是自研的 md2HTML（基于 marked + gray-matter）。

## 想法

HTML确实比单纯的markdown更有观赏性，阅读体验也更好，目前的md2HTML已经可以做到70分的水平，让AI稍微打磨一下就可以变成知识库里面的一环。

详细的搭建记录见 [BUILD-JOURNEY-0516.md](https://github.com/maverickxone/mav-homepage/blob/main/BUILD-JOURNEY-0516.md)。

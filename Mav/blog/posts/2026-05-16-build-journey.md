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
- 部署到阿里云服务器，Nginx + GitHub webhook 自动同步

## 技术栈

纯静态 HTML/CSS/JS，不依赖任何框架。字体用 Inter + JetBrains Mono，黑白极简风格。构建工具是自研的 md2HTML（基于 marked + gray-matter）。

## 感想

一个人 + 一个 AI，一天之内，从一本讲义变成了一个完整的个人网站。不是 AI 替你做了什么，是你和 AI 一起做了什么。

详细的搭建记录见 [BUILD-JOURNEY-0516.md](https://github.com/maverickxone/mav-homepage/blob/main/BUILD-JOURNEY-0516.md)。

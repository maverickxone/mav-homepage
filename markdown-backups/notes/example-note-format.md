---
title: "示例：一篇手记长什么样"
date: 2026-07-30
readTime: 2
description: "手记系统的格式演示——front-matter 字段、正文结构、扩展语法，写完删掉即可。"
tags: [示例, 系统]
---

## 这是什么

这是一篇**占位手记**，用来演示手记系统的格式与构建流程。正式写作时可以删除本文件。

## 格式说明

每篇手记是 `markdown-backups/notes/` 下的一个 `.md` 文件，头部 front-matter 包含：

| 字段 | 必需 | 说明 |
|------|:----:|------|
| `title` | ✓ | 标题 |
| `date` | ✓ | 写作日期（YYYY-MM-DD），用于排序 |
| `readTime` | | 预计阅读分钟数 |
| `description` | ✓ | 一句话描述（列表页展示 + 搜索用） |
| `tags` | | 标签数组，用于列表页筛选 |

## 扩展语法同样可用

:::callout-tip 提示
书籍里能用的 `:::callout`、`:::tabs`、`:::collapsible` 等扩展语法，手记里一样能用。
:::

行内公式 $e^{i\pi} + 1 = 0$ 和代码块也正常渲染：

```python
print("hello, notes")
```

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build 09-review.md (考前复盘笔记 appendix) from 复盘-知识点总结与模拟题.md.

This appendix is kept OUT of assemble.py on purpose: 复盘 is the user's freeform
exam-night notes with an irregular heading hierarchy (模拟练习题 nests ##→###→####
while sibling ## sections don't), so the generic renumber() in assemble.py would
double-number and collide levels. We instead do exact heading-line remaps here and
keep every line of body text verbatim. Re-run after editing the 复盘 source:
    python3 build_review.py
"""
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(HERE)  # markdown-backups/Data-Structures
SRC = os.path.join(HERE, "复盘-知识点总结与模拟题.md")
OUT = os.path.join(OUT_DIR, "09-review.md")

# exact heading-line remaps (old stripped line -> new line). Each old line is unique.
REMAP = {
    "# 知识点回顾": "## 9.1 知识点回顾（按章速过）",
    "## 第1章：数据结构基础知识": "### 9.1.1 数据结构基础知识",
    "## 第2章：线性表": "### 9.1.2 线性表",
    "## 第3章：栈与队列": "### 9.1.3 栈与队列",
    "## 第4章：串和数组": "### 9.1.4 串和数组",
    "## 第5章：树与二叉树": "### 9.1.5 树与二叉树",
    "## 第6章：图": "### 9.1.6 图",
    "## 第7章：查找表": "### 9.1.7 查找表",
    "## 第8章：排序": "### 9.1.8 排序",
    "# 刷题小结": "## 9.2 刷题小结（易错点速记）",
    "## 考前突击补充（算法实现题，不能调STL时手写）": "## 9.3 考前突击：手写算法模板（不能调 STL 时手写）",
    "## 栈（数组实现）": "### 9.3.1 栈（数组实现）",
    "## 循环队列（数组实现，牺牲一个单元判满）": "### 9.3.2 循环队列（数组实现，牺牲一个单元判满）",
    "## 快速排序（partition + 递归）": "### 9.3.3 快速排序（partition + 递归）",
    "## 归并排序（merge 两个有序段）": "### 9.3.4 归并排序（merge 两个有序段）",
    "## Dijkstra（伪代码，单源最短路，不能有负权边）": "### 9.3.5 Dijkstra（伪代码，单源最短路，不能有负权边）",
    "## 哈希表要点（ASL 计算）": "### 9.3.6 哈希表要点（ASL 计算）",
    "## 模拟练习题（含答案）": "## 9.4 模拟练习题（含答案）",
    "### 一、选择/填空（复杂度 + 概念）": "### 9.4.1 选择 / 填空（复杂度 + 概念）",
    "### 二、简答": "### 9.4.2 简答",
    "### 三、写中间结果": "### 9.4.3 写中间结果",
    "### 四、算法实现（写代码）": "### 9.4.4 算法实现（写代码）",
    "### 五、算法设计（思路型，写不出代码就写文字得步骤分）": "### 9.4.5 算法设计（思路型，写不出代码就写文字得步骤分）",
}

lines = open(SRC, encoding="utf-8").read().replace("\r\n", "\n").split("\n")

fenced, out, unseen = False, [], set(REMAP)
for ln in lines:
    if ln.strip().startswith("```"):
        fenced = not fenced
        out.append(ln); continue
    key = ln.strip()
    if not fenced and key in REMAP:
        out.append(REMAP[key]); unseen.discard(key)
    else:
        out.append(ln)

if unseen:
    raise SystemExit("ERROR: expected headings not found (source changed?):\n  "
                     + "\n  ".join(sorted(unseen)))

body = "\n".join(out).strip("\n") + "\n"
for ln in body.split("\n"):
    if re.match(r"^# (?!#)", ln):
        raise SystemExit(f"ERROR: leftover H1 heading: {ln!r}")

chars = len(re.sub(r"\s", "", body))
read_time = max(5, round(chars / 420))

fm = (f'---\ntitle: "附录：考前复盘笔记"\nchapter: 9\n'
      f'readTime: {read_time}\n'
      f'description: "考前一晚的手写复盘：八章知识点速过、刷题易错点、可手写的算法模板，外加一套带答案的模拟题。"\n---\n\n')

lead = ("这一章是我**考前最后一晚自己手写的复盘笔记**，口吻随意、密度很高——"
        "先把八章知识点按章快速过一遍，再记下刷题时反复踩的易错点，"
        "然后是几段「不能调库时得默写出来」的算法模板，最后一套带答案的模拟题自测。"
        "和前面正文的系统讲解相比，这里更像「考前临门一脚」的速记。\n\n")

open(OUT, "w", encoding="utf-8").write(fm + lead + body)
print(f"wrote {OUT}")
print(f"  chapter=9  readTime={read_time}min  chars={chars}  headings remapped={len(REMAP)}")

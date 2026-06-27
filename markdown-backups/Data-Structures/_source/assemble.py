#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble data-structures notes into md2HTML chapter files (8-card plan)."""
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)  # markdown-backups/Data-Structures

def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return f.read()

def split_h1_blocks(text):
    """Split a file into blocks at top-level '# ' headings (skipping fenced code)."""
    lines = text.replace("\r\n", "\n").split("\n")
    blocks = []          # list of (h1_title, body_str)
    cur_title, cur_body = None, []
    fenced = False
    pre = []             # content before first h1 (ignored)
    for ln in lines:
        if ln.strip().startswith("```"):
            fenced = not fenced
        if not fenced and re.match(r"^# (?!#)", ln):
            if cur_title is not None:
                blocks.append((cur_title, "\n".join(cur_body).strip("\n")))
            else:
                pre = cur_body
            cur_title = ln[2:].strip()
            cur_body = []
        else:
            cur_body.append(ln)
    if cur_title is not None:
        blocks.append((cur_title, "\n".join(cur_body).strip("\n")))
    return blocks

def strip_num(t):
    t = t.strip()
    t = re.sub(r"^第[一二三四五六七八九十]+类\s*[·:：]?\s*", "", t)
    t = re.sub(r"^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]\s*", "", t)
    t = re.sub(r"^\d+(?:\.\d+)*\s+", "", t)
    t = re.sub(r"^\d+(?:\.\d+)*[、.]\s*", "", t)
    return t.strip()

# distinct self-test labels by topic (replaces vague "本章自测"/"第N章自测"); keeps the
# sidebar from showing several identical "自测" entries inside a merged chapter.
SELFTEST_MAP = [
    ("C 语言回顾", "C 基础自测"), ("数据结构导论", "导论与复杂度自测"),
    ("线性表", "线性表自测"), ("栈与队列", "栈与队列自测"), ("串和数组", "串与数组自测"),
    ("树和二叉树", "树与二叉树自测"), ("图", "图自测"),
    ("查找表", "查找自测"), ("排序", "排序自测"), ("算法设计策略", "算法策略自测"),
]
def selftest_label(title):
    for k, v in SELFTEST_MAP:
        if k in title:
            return v
    return "本节自测"

def renumber(body, card):
    """Renumber ## -> card.M and ### -> card.M.m, skipping fenced code."""
    out = []
    fenced = False
    major, minor = 0, 0
    for ln in body.split("\n"):
        if ln.strip().startswith("```"):
            fenced = not fenced
            out.append(ln); continue
        if not fenced and re.match(r"^### (?!#)", ln):
            if major == 0:
                major = 1
            minor += 1
            out.append(f"### {card}.{major}.{minor} {strip_num(ln[4:])}")
        elif not fenced and re.match(r"^## (?!#)", ln):
            major += 1
            minor = 0
            out.append(f"## {card}.{major} {strip_num(ln[3:])}")
        else:
            out.append(ln)
    return "\n".join(out)

# old chapter (0-9) -> new merged chapter (1-8)
CHREMAP = {1: 1, 2: 2, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 5, 9: 6}

# sentence-level rewrites for segment / tutor-narrative artifacts (run AFTER 第N章 remap)
SEG_FIXES = [
    ("**第一段到此结束。** 这一段把「地基",
     "**前两章到此告一段落。** 这两章把「地基"),
    ("读完、自测过关后告诉我，我就开写**第二段：树和二叉树 + 图**（全课最大重头，会写得更厚）。读的过程中任何卡壳，随时问。",
     "读完、自测过关后，下面进入**第三、四章：树与二叉树 + 图**（全课最大的重头）。读的过程中任何卡壳，随时回头复习。"),
    ("回顾第一段的灵魂矛盾", "回顾前面线性结构的灵魂矛盾"),
    ("「第一段栈的表达式求值」", "「第2章栈的表达式求值」"),
    ("规则和第一段「中缀转后缀」", "规则和第2章「中缀转后缀」"),
    ("这正是第一段说的", "这正是前面说的"),
    ("（归纳，详见第二段）", "（归纳，详见第3章）"),
    ("这部分在第二段已详细讲过，这里从「查找视角」归纳，需要复习就回看第二段 5.8~5.11：",
     "这部分在第3章（树）已详细讲过，这里从「查找视角」归纳，需要复习就回看第3章树表相关小节："),
    ("第二段 5.12 讲过堆", "第3章讲过堆"),
    ("**第二段到此结束。** 这是全课最重的一段",
     "**树与图两章到此结束。** 这是全课最重的部分"),
    ("读完、自测过关后告诉我，我开写**第三段：查找表 + 排序 + 算法设计策略**（收尾，含哈希、各排序算法对比与模拟、分治/贪心/DP/回溯）。任何卡壳随时问。",
     "读完、自测过关后，下面进入**第五、六章：查找表 + 排序 + 算法设计策略**（收尾，含哈希、各排序算法对比与模拟、分治/贪心/DP/回溯）。读的过程中任何卡壳，随时回头复习。"),
]

# CommonMark emphasis fails when a **bold** run touches CJK full-width punctuation
# at an edge (e.g. **「x」**, **松弛（更新）**) — it leaks literal '**'. Pre-convert
# exactly those edge cases to explicit <strong> (always renders), protecting code.
_CJK_PUNCT = "（）「」【】《》〈〉“”‘’：；，。！？、…—·"

def fix_cjk_bold(text):
    stash = []
    def keep(m):
        stash.append(m.group(0)); return f"\x00{len(stash)-1}\x00"
    text = re.sub(r"```.*?```", keep, text, flags=re.S)   # fenced code
    text = re.sub(r"`[^`]*`", keep, text)                  # inline code
    def repl(m):
        inner = m.group(1)
        if inner and (inner[0] in _CJK_PUNCT or inner[-1] in _CJK_PUNCT):
            return f"<strong>{inner}</strong>"
        return m.group(0)
    text = re.sub(r"\*\*([^*\n]+?)\*\*", repl, text)
    for i, p in enumerate(stash):
        text = text.replace(f"\x00{i}\x00", p)
    return text

def fix_crossrefs(text):
    # 1) remap 第N章 (old chapter number) -> 第M章 (new merged chapter), single pass
    text = re.sub(r"第([0-9])章", lambda m: f"第{CHREMAP.get(int(m.group(1)), int(m.group(1)))}章", text)
    # 2) rewrite segment / narrative phrases (these inject already-correct new numbers)
    for old, new in SEG_FIXES:
        text = text.replace(old, new)
    return text

def block_to_content(title, body):
    """Drop the h1; convert a 总自测 block into an h2 TOC entry."""
    if "总自测" in title:
        return "## 本段总自测清单\n\n" + body
    if "全书完结" in title or "总图" in title:
        return "## 全课总览：九章一张图\n\n" + body
    # give this chapter's self-test a distinct topic label
    label = selftest_label(title)
    body = re.sub(r"(?m)^(#{2,3} )(?![^\n]*总自测)([^\n]*自测[^\n]*)$",
                  lambda m: m.group(1) + label, body)
    return body

def read_time(content):
    chars = len(re.sub(r"\s", "", content))
    return max(5, round(chars / 420))

def fm(title, chapter, content, desc):
    rt = read_time(content)
    return (f'---\ntitle: "{title}"\nchapter: {chapter}\n'
            f'readTime: {rt}\ndescription: "{desc}"\n---\n\n')

def write_card(slug, chapter, title, desc, parts):
    body = "\n\n".join(parts).strip("\n") + "\n"
    body = renumber(body, chapter)
    body = fix_crossrefs(body)
    body = fix_cjk_bold(body)
    with open(os.path.join(OUT, slug + ".md"), "w", encoding="utf-8") as f:
        f.write(fm(title, chapter, body, desc) + body)
    print(f"  {slug}.md  chapter={chapter}  readTime={read_time(body)}min")

# ---- parse sources ----
seg1 = split_h1_blocks(read("第一段-基础与线性结构.md"))  # [0]seg [1]Ch0 [2]Ch1 [3]Ch2 [4]Ch3 [5]Ch4 [6]总自测
seg2 = split_h1_blocks(read("第二段-树与图.md"))            # [0]seg [1]Ch5 [2]Ch6 [3]总自测
seg3 = split_h1_blocks(read("第三段-查找排序与算法策略.md")) # [0]seg [1]Ch7 [2]Ch8 [3]Ch9 [4]总自测
prac = split_h1_blocks(read("练习册-手算题专项.md"))         # [0]doc
cheat = split_h1_blocks(read("速查表-考前必背.md"))           # [0]doc

print("seg1 blocks:", [t for t, _ in seg1])
print("seg2 blocks:", [t for t, _ in seg2])
print("seg3 blocks:", [t for t, _ in seg3])

def parts_from(blocks, idxs):
    return [block_to_content(blocks[i][0], blocks[i][1]) for i in idxs]

print("writing cards:")
write_card("01-intro-and-c", 1, "引论与 C 语言基础",
           "数据结构的地基：先夯实 C 的指针、结构体与动态内存，再讲清逻辑结构/存储结构、ADT 与时间空间复杂度分析。",
           parts_from(seg1, [1, 2]))

write_card("02-linear", 2, "线性表、栈、队列与串数组",
           "全部线性结构一网打尽：顺序表与链表、栈与队列（含循环队列）、串与 KMP、数组与压缩存储。",
           parts_from(seg1, [3, 4, 5, 6]))

write_card("03-tree", 3, "树与二叉树",
           "全课最大重头之一：二叉树性质与遍历、线索二叉树、树与森林、哈夫曼树与并查集。",
           parts_from(seg2, [1]))

write_card("04-graph", 4, "图",
           "图的存储与遍历（DFS/BFS）、最小生成树、最短路径、拓扑排序与关键路径。",
           parts_from(seg2, [2, 3]))

write_card("05-search-sort", 5, "查找与排序",
           "查找表（顺序/折半/分块、BST/AVL/B 树、哈希）与七大内部排序的思想、复杂度与稳定性。",
           parts_from(seg3, [1, 2]))

write_card("06-algorithm-design", 6, "算法设计策略",
           "分治、贪心、动态规划、回溯等通用算法设计思想，以及典型题型套路。",
           parts_from(seg3, [3, 4, 5]))

write_card("07-practice-cheatsheet", 7, "手算专项与考前速查",
           "考前冲刺：十二类高频手算题带详细解答，外加一页式考前必背速查表。",
           parts_from(prac, [0])
           + ["---\n\n> **以下是一页式「考前必背速查表」**——把上面练熟之后，考前最后一遍快速扫过即可。"]
           + parts_from(cheat, [0]))

print("done (08 appendix authored separately)")

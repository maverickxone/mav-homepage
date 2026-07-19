---
title: "实战：从零构建知识库问答系统"
chapter: 6
readTime: 55
description: "不用任何框架，用约两百行 Python 把前五章全部落地：读取并切块自己的 Markdown 资料库，调用 embedding API 建立向量索引，实现混合检索与带引用的生成，最后跑一遍自动化评估。"
---

## 6.1 目标与技术栈

这一章只做一件事：**给你自己的资料库，从零写一个能跑的问答机器人**。输入一个问题，它检索你的文档、给出带出处引用的回答。前五章的每个概念——切块、embedding、余弦相似度、BM25、RRF 融合、忠实度约束、反向造题评估——都会在代码里再出现一次，这次是以可执行的形式。

技术栈刻意选到最轻：

- **Python + numpy**，不用 LangChain 或 LlamaIndex 这类框架。不是框架不好，而是框架会把本书讲的每个环节都包装成一行不透明的调用——学习阶段，亲手写那两百行比调用框架收获大一个数量级。框架的定位见附录。
- **Embedding 用 Voyage AI 的 API**（生成模型那家 Anthropic 官方推荐的 embedding 服务，对中文支持好）。这里有个值得知道的行业细节：Anthropic 自己不提供 embedding 端点，所以一条 RAG 流水线里 embedding 模型和生成模型来自两家是常态——**这两个组件本来就是独立解耦的**，正好印证第 2 章的架构图。
- **生成用 Claude API**。
- **不用向量数据库**——第 2 章说过，万级块的规模，numpy 点积就是完全体。我们用行动验证。

语料就用我自己的 Markdown 书稿库（也就是你正在读的这个知识库的源文件，十几本书、几百个章节文件）。你换成任何一个装满 Markdown/纯文本的目录都一样能跑。

## 6.2 环境准备

```bash
pip install anthropic voyageai numpy rank_bm25 jieba
```

`rank_bm25` 是一个几百行的纯 Python BM25 实现；`jieba` 负责中文分词——BM25 按"词"统计，中文不分词就没有"词"可言。

两个 API key 写进环境变量（两家官网注册即得，Voyage 有免费额度）：

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export VOYAGE_API_KEY="pa-..."
```

项目就两个文件：`build_index.py`（离线建索引，语料变了才重跑）和 `chat.py`（在线问答，日常使用）。对应第 1 章流水线图的离线/在线两段。

## 6.3 第一步：读取与切块

第 3 章的结论直接落地：**语料是 Markdown，就沿着标题结构切**。每个 `##` 小节天然是一个主题聚焦、语义完整的块；个别超长小节再按段落二次切分，并给每个块拼上"书名 > 章节"的元数据前缀（第 3 章的最便宜一招）。

```python
# build_index.py（第一部分）
import json, re
from pathlib import Path

CORPUS_DIR = Path("/Users/mav/Projects/mav-homepage/markdown-backups")  # 换成你的目录
MAX_CHARS = 1800          # 单块字符上限，超了按段落二切

def strip_frontmatter(text: str) -> str:
    return re.sub(r"^---\n.*?\n---\n", "", text, flags=re.S)

def split_long(text: str, limit: int) -> list[str]:
    """超长小节按空行二次切分，尽量在段落边界下刀。"""
    parts, buf = [], ""
    for para in text.split("\n\n"):
        if len(buf) + len(para) > limit and buf:
            parts.append(buf.strip()); buf = ""
        buf += para + "\n\n"
    if buf.strip():
        parts.append(buf.strip())
    return parts

def chunk_file(md_path: Path) -> list[dict]:
    book = md_path.parent.name
    text = strip_frontmatter(md_path.read_text(encoding="utf-8"))
    m = re.search(r'title:\s*"?([^"\n]+)"?', md_path.read_text(encoding="utf-8"))
    chapter = m.group(1) if m else md_path.stem
    chunks = []
    # 按 ## 小节切分；sections[0] 是首个小节标题前的引言
    sections = re.split(r"\n(?=## )", text)
    for sec in sections:
        sec = sec.strip()
        if len(sec) < 80:                      # 跳过空小节
            continue
        title_line = sec.splitlines()[0].lstrip("# ").strip()
        for piece in split_long(sec, MAX_CHARS):
            chunks.append({
                "book": book, "chapter": chapter, "section": title_line,
                # 元数据前缀：让块向量带上出处信息（第 3 章 3.3 节）
                "text": f"《{book}》 > {chapter} > {title_line}\n{piece}",
            })
    return chunks

all_chunks = []
for md in sorted(CORPUS_DIR.rglob("*.md")):
    if md.name.startswith("_") or ".backup." in str(md):
        continue
    all_chunks.extend(chunk_file(md))
print(f"共 {len(all_chunks)} 个块")
```

在我的书库上跑出来大约两千个块——记住这个数量级，后面算成本和检索延迟都用得上。

## 6.4 第二步：向量化与索引

把每个块送进 embedding API。两个第 2 章埋过伏笔的细节：Voyage 的接口区分 `input_type="document"`（建库时）和 `"query"`（查询时），模型对文档和查询用了不对称的编码，实测对检索质量有可感知的提升；拿到向量后**立刻归一化**，此后余弦相似度 = 点积。

```python
# build_index.py（第二部分）
import numpy as np
import voyageai

vo = voyageai.Client()   # 自动读 VOYAGE_API_KEY

texts = [c["text"] for c in all_chunks]
vectors = []
for i in range(0, len(texts), 64):            # 分批，单次请求别太大
    batch = texts[i : i + 64]
    result = vo.embed(batch, model="voyage-3.5", input_type="document")
    vectors.extend(result.embeddings)
    print(f"  embedded {i + len(batch)}/{len(texts)}")

emb = np.array(vectors, dtype=np.float32)
emb /= np.linalg.norm(emb, axis=1, keepdims=True)   # 归一化：余弦 → 点积

np.save("index_emb.npy", emb)
Path("index_chunks.json").write_text(
    json.dumps(all_chunks, ensure_ascii=False), encoding="utf-8")
print(f"索引完成：{emb.shape[0]} 个向量，维度 {emb.shape[1]}")
```

运行 `python build_index.py`，几分钟后目录下多出两个文件——一个 numpy 矩阵、一个 JSON 元数据。**这就是全部的"向量数据库"**：两千个 1024 维向量共约 8 MB，整个索引连一张照片都没有大。

## 6.5 第三步：混合检索

在线侧开工。第 2 章的架构原样搬进代码：一路向量检索（懂语义），一路 BM25（抓精确词），RRF 融合。

```python
# chat.py（第一部分）
import json
import jieba
import numpy as np
import voyageai
from pathlib import Path
from rank_bm25 import BM25Okapi

vo = voyageai.Client()
emb = np.load("index_emb.npy")
chunks = json.loads(Path("index_chunks.json").read_text(encoding="utf-8"))

# BM25 索引：中文先分词（在内存中现建，两千个块秒级完成）
bm25 = BM25Okapi([list(jieba.cut(c["text"])) for c in chunks])

def search(query: str, k: int = 6) -> list[int]:
    # 一路：向量检索 —— 一次矩阵点积扫全库（第 2 章的"窗户纸"）
    q = np.array(vo.embed([query], model="voyage-3.5",
                          input_type="query").embeddings[0])
    q /= np.linalg.norm(q)
    vec_rank = np.argsort(emb @ q)[::-1][:50]

    # 二路：BM25
    bm_scores = bm25.get_scores(list(jieba.cut(query)))
    bm_rank = np.argsort(bm_scores)[::-1][:50]

    # RRF 融合（第 2 章 2.5 节公式，K=60）
    K, fused = 60, {}
    for rank_list in (vec_rank, bm_rank):
        for r, idx in enumerate(rank_list):
            fused[int(idx)] = fused.get(int(idx), 0) + 1 / (K + r + 1)
    return sorted(fused, key=fused.get, reverse=True)[:k]
```

`emb @ q` 那一行值得多看一眼：它对两千个块做了完整的暴力检索，耗时以毫秒计。个人知识库规模下，检索延迟的大头其实是查询那一次 embedding API 调用的网络往返，本地计算可以忽略不计。

## 6.6 第四步：生成与引用

把检索结果组装进 prompt，交给 Claude。System prompt 里写死两条纪律，都是第 1、4 章反复强调的原则：**只依据资料回答**（忠实度），**标注引用编号**（可溯源）：

```python
# chat.py（第二部分）
import anthropic

client = anthropic.Anthropic()   # 自动读 ANTHROPIC_API_KEY

SYSTEM = """你是一个基于资料库回答问题的助手。规则：
1. 只依据【资料】中的内容回答。资料里没有的信息，明确说"资料中没有提到"，不要用你自己的知识补充。
2. 回答中的每个要点都用 [编号] 标注它依据哪条资料。
3. 回答结束后另起一行，列出所引用资料的出处（书名和章节）。"""

def answer(question: str) -> str:
    idxs = search(question)
    context = "\n\n".join(
        f"[{i + 1}] 出处：《{chunks[j]['book']}》{chunks[j]['chapter']} · {chunks[j]['section']}\n"
        + chunks[j]["text"]
        for i, j in enumerate(idxs)
    )
    resp = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=8192,
        system=SYSTEM,
        messages=[{"role": "user",
                   "content": f"【资料】\n{context}\n\n【问题】{question}"}],
    )
    return "".join(b.text for b in resp.content if b.type == "text")
```

## 6.7 第五步：跑起来

收尾一个最简单的交互循环：

```python
# chat.py（第三部分）
if __name__ == "__main__":
    print("知识库问答（输入 q 退出）")
    while True:
        question = input("\n> ").strip()
        if question in ("q", "quit", ""):
            break
        print(answer(question))
```

`python chat.py`，问它一个你确定在自己资料里的问题：

> **> 卡诺热机的效率公式是什么？**
>
> 卡诺热机（可逆热机）的效率为 η = 1 − T₂/T₁，其中 T₁、T₂ 分别是高温与低温热源的温度 [1]。这一效率是在相同两热源之间工作的一切热机的上限，且与工质种类无关 [1][3]。……
>
> 引用出处：[1]《Thermodynamics》热力学第二定律与熵 · 3.6 卡诺定理……

一个属于你自己的、带引用、可溯源的问答系统，跑起来了。总代码量：不到两百行。

## 6.8 第六步：评估——别跳过这一步

第 4 章苦口婆心的部分，五十行代码就能兑现。用"从语料反向造题"构造测试集——妙处在于**每道题的正确出处块是免费已知的**，Recall@k 可以全自动计算：

```python
# evaluate.py
import json, random
import anthropic
from pathlib import Path
from chat import search, chunks   # 复用在线侧的检索

client = anthropic.Anthropic()
random.seed(42)

def make_question(chunk_text: str) -> str:
    resp = client.messages.create(
        model="claude-opus-4-8", max_tokens=1024,
        messages=[{"role": "user", "content":
            "根据下面这段资料出一道问答题，要求：答案就在资料中；"
            "提问措辞不要照抄原文用词，模拟一个没读过原文的读者的问法。"
            "只输出问题本身。\n\n" + chunk_text}],
    )
    return "".join(b.text for b in resp.content if b.type == "text").strip()

# 随机抽 20 个块造题，golden 标注（题目 ↔ 来源块）免费自带
test_set = []
for j in random.sample(range(len(chunks)), 20):
    test_set.append({"question": make_question(chunks[j]["text"]), "gold": j})
Path("test_set.json").write_text(json.dumps(test_set, ensure_ascii=False))

# Recall@k：来源块是否被检索进了 top-k
for k in (3, 6, 10):
    hits = sum(t["gold"] in search(t["question"], k) for t in test_set)
    print(f"Recall@{k}: {hits / len(test_set):.0%}")
```

我这套语料首次跑出来的典型结果是 Recall@6 在八九成上下——**剩下那一两成没召回的题，就是你最该盯着看的东西**。逐个打印 badcase，你大概率会看到第 3 章预言过的经典病灶：跨小节的问题、被二次切分拆散的长节、以及造题模型换了说法之后向量没跟上的词汇失配。此后的一切改动——换块大小、调 top-k、给检索加重排——都先跑一遍这个脚本再下结论。二十道题的测试集当然粗糙，但**它已经比"随手问两个问题看看顺不顺眼"科学一个量级**，而且会随着你补充 badcase 越来越锋利。

## 6.9 成本账与下一步

最后算笔账（按 2026 年主流价位的量级，避免虚指）：**建索引**——两千个块约一百多万 token，embedding 单价约每百万 token 零点零几美元，一次性成本**不到一杯瑞幸**；**每次提问**——6 个块加问题约四五千 token 输入、几百 token 输出，按 Claude 的价目折算约几美分。个人知识库的 RAG，成本完全不构成门槛。

这套两百行的系统是一个诚实的骨架，每一处简化都对应一个第 3、5 章讲过的升级方向，不妨按性价比排个序留作练习：给检索结果接一个 rerank API（第 3 章说过的性价比之王，改动最小）；把"检索小块、喂大块"的 small-to-big 加进 `answer()`（命中块后把整个小节送进 prompt）；对话历史 + 查询浓缩，把单轮问答升级成多轮；最后，把 `search()` 包装成 tool 交给模型自主调用——你就亲手把它推进到了第 5 章的 agentic 形态。

:::callout-tip 本章要点
- 两个文件、约两百行、零框架：`build_index.py`（切块 → embedding → numpy 索引）+ `chat.py`（混合检索 → RRF → 带引用生成）。
- 沿 Markdown 标题结构切块 + 元数据前缀；向量归一化后余弦即点积，万级块的"向量数据库"就是一个 8 MB 的 .npy 文件。
- System prompt 两条纪律：只依据资料回答、逐点标注引用——忠实度与可溯源性从第一天就内建。
- 反向造题让 Recall@k 全自动可测；badcase 清单比指标本身更有信息量。
- 成本量级：建库不到一杯咖啡，单次问答几美分；升级路线：重排 → small-to-big → 多轮浓缩 → agentic。
:::

---
title: "GloVe、FastText 与子词嵌入"
chapter: 3
readTime: 45
description: "Word2Vec 给每个词训练一个向量。GloVe 分解了共现矩阵。FastText 嵌入了词的碎片。BPE 架起了通往 Transformer 的桥。"
---
> Word2Vec 给每个词训练一个向量。GloVe 分解了共现矩阵。FastText 嵌入了词的碎片。BPE 架起了通往 Transformer 的桥。






## 为什么要学这个

Word2Vec 留下了两个未解之题。

第一，当时有一条平行的研究路线直接分解共现矩阵（LSA、HAL），而不是像 skip-gram 那样做在线更新。Word2Vec 的迭代式方法真的本质上更优吗，还是两种方法在处理计数方式上的差异造成了假象？**GloVe（Global Vectors）** 给出了答案：只要损失函数设计得当，矩阵分解可以匹敌甚至超过 Word2Vec，而且训练成本更低。

第二，这两种方法都没法处理从未见过的词。`Zoomer-approved`、`dogecoin`、上周刚发明的任何专有名词、稀有词根的各种屈折形式——统统搞不定。**FastText** 通过嵌入字符 n-gram 解决了这个问题：一个词就是它各部分的总和（包括词素），所以即使是词表外的词也能得到合理的向量。

第三，Transformer 出现后，问题再次转变。词级别的词表上限大约一百万个条目；真实语言比这开放得多。**字节对编码（Byte-Pair Encoding, BPE）** 及其变体通过学习一组高频子词单元来覆盖一切，解决了这个问题。现在每个主流 LLM 的每个分词器都是子词分词器。

这节课把三者都走一遍，然后告诉你什么场景该用哪个。

## 核心概念

**GloVe（Global Vectors，全局向量）。** 构建词-词共现矩阵（co-occurrence matrix） `X`，其中 `X[i][j]` 是词 `j` 出现在词 `i` 上下文中的次数。训练向量使得 `v_i · v_j + b_i + b_j ≈ log(X[i][j])`。对损失加权，让高频词对不会主导训练。搞定。

**FastText。** 一个词是它的字符 n-gram 加上词本身的总和。`where` 变成 `<wh, whe, her, ere, re>, <where>`。词向量就是这些组件向量的总和。训练方式和 Word2Vec 一样。好处：没见过的词（`whereupon`）可以从已知的 n-gram 组合出来。

**BPE（Byte-Pair Encoding，字节对编码）。** 从一个由单个字节（或字符）组成的词表开始。统计语料中所有相邻对的频率。把最高频的那对合并成一个新 token。重复 `k` 次。结果：一个 `k + 256` 大小的词表，其中高频序列（`ing`、`tion`、`the`）是单个 token，而稀有词被拆成熟悉的碎片。任何句子都能被分词。

## 从零实现

### GloVe：分解共现矩阵

```python
import numpy as np
from collections import Counter


def build_cooccurrence(docs, window=5):
    pair_counts = Counter()
    vocab = {}
    for doc in docs:
        for token in doc:
            if token not in vocab:
                vocab[token] = len(vocab)
    for doc in docs:
        indexed = [vocab[t] for t in doc]
        for i, center in enumerate(indexed):
            for j in range(max(0, i - window), min(len(indexed), i + window + 1)):
                if i != j:
                    distance = abs(i - j)
                    pair_counts[(center, indexed[j])] += 1.0 / distance
    return vocab, pair_counts


def glove_train(vocab, pair_counts, dim=16, epochs=100, lr=0.05, x_max=100, alpha=0.75, seed=0):
    n = len(vocab)
    rng = np.random.default_rng(seed)
    W = rng.normal(0, 0.1, size=(n, dim))
    W_tilde = rng.normal(0, 0.1, size=(n, dim))
    b = np.zeros(n)
    b_tilde = np.zeros(n)

    for epoch in range(epochs):
        for (i, j), x_ij in pair_counts.items():
            weight = (x_ij / x_max) ** alpha if x_ij < x_max else 1.0
            diff = W[i] @ W_tilde[j] + b[i] + b_tilde[j] - np.log(x_ij)
            coef = weight * diff

            grad_W_i = coef * W_tilde[j]
            grad_W_tilde_j = coef * W[i]
            W[i] -= lr * grad_W_i
            W_tilde[j] -= lr * grad_W_tilde_j
            b[i] -= lr * coef
            b_tilde[j] -= lr * coef

    return W + W_tilde
```

有两个值得注意的设计。加权函数 `f(x) = (x/x_max)^alpha` 会降低极高频词对（比如 `(the, and)`）的权重，防止它们主导损失。最终嵌入是 `W`（中心词表）和 `W_tilde`（上下文词表）的求和。两个表相加是论文里的一个技巧，效果通常比只用其中一个好。

### FastText：带子词感知的嵌入

```python
def char_ngrams(word, n_min=3, n_max=6):
    wrapped = f"<{word}>"
    grams = {wrapped}
    for n in range(n_min, n_max + 1):
        for i in range(len(wrapped) - n + 1):
            grams.add(wrapped[i:i + n])
    return grams
```

```python
>>> char_ngrams("where")
{'<where>', '<wh', 'whe', 'her', 'ere', 're>', '<whe', 'wher', 'here', 'ere>', '<wher', 'where', 'here>'}
```

每个词用它的 n-gram 集合表示（通常取 3 到 6 个字符）。词嵌入就是其所有 n-gram 嵌入的加和。在 skip-gram 训练中，把这个替代 Word2Vec 使用的单一向量即可。

```python
def fasttext_vector(word, ngram_table):
    grams = char_ngrams(word)
    vecs = [ngram_table[g] for g in grams if g in ngram_table]
    if not vecs:
        return None
    return np.sum(vecs, axis=0)
```

对于没见过的词，只要它的部分 n-gram 是已知的，你就能拿到向量。`whereupon` 和 `where` 共享 `<wh`、`her`、`ere`、`<where`，所以两者会落在向量空间中相近的位置。

### BPE：学习出来的子词词表

```python
def learn_bpe(corpus, k_merges):
    vocab = Counter()
    for word, freq in corpus.items():
        tokens = tuple(word) + ("</w>",)
        vocab[tokens] = freq

    merges = []
    for _ in range(k_merges):
        pair_freq = Counter()
        for tokens, freq in vocab.items():
            for a, b in zip(tokens, tokens[1:]):
                pair_freq[(a, b)] += freq
        if not pair_freq:
            break
        best = pair_freq.most_common(1)[0][0]
        merges.append(best)

        new_vocab = Counter()
        for tokens, freq in vocab.items():
            new_tokens = []
            i = 0
            while i < len(tokens):
                if i + 1 < len(tokens) and (tokens[i], tokens[i + 1]) == best:
                    new_tokens.append(tokens[i] + tokens[i + 1])
                    i += 2
                else:
                    new_tokens.append(tokens[i])
                    i += 1
            new_vocab[tuple(new_tokens)] = freq
        vocab = new_vocab
    return merges


def apply_bpe(word, merges):
    tokens = list(word) + ["</w>"]
    for a, b in merges:
        new_tokens = []
        i = 0
        while i < len(tokens):
            if i + 1 < len(tokens) and tokens[i] == a and tokens[i + 1] == b:
                new_tokens.append(a + b)
                i += 2
            else:
                new_tokens.append(tokens[i])
                i += 1
        tokens = new_tokens
    return tokens
```

```python
>>> corpus = Counter({"low": 5, "lower": 2, "newest": 6, "widest": 3})
>>> merges = learn_bpe(corpus, k_merges=10)
>>> apply_bpe("lowest", merges)
['low', 'est</w>']
```

第一次迭代合并最常见的相邻对。经过足够多的迭代，常见子串（`low`、`est`、`tion`）变成单个 token，稀有词则被干净地拆开。

真正的 GPT / BERT / T5 分词器会学习 30k-100k 次合并。结果：任何文本都能被分词成有界长度的已知 ID 序列，永远不会 OOV。

## 实战用法

实际工作中你很少自己从头训练这些模型，一般都是加载预训练的 checkpoint。

```python
import fasttext.util
fasttext.util.download_model("en", if_exists="ignore")
ft = fasttext.load_model("cc.en.300.bin")
print(ft.get_word_vector("whereupon").shape)
print(ft.get_word_vector("zoomerapproved").shape)
```

对于 Transformer 时代的 BPE 子词分词：

```python
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")
print(tok.tokenize("unbelievably tokenized"))
```

```
['un', 'bel', 'iev', 'ably', 'Ġtoken', 'ized']
```

`Ġ` 前缀标记词边界（GPT-2 的约定）。现代的每一个分词器要么是 BPE 变体、WordPiece（BERT），要么是 SentencePiece（T5、LLaMA）。

### 什么时候选哪个

| 场景 | 选择 |
|------|------|
| 需要预训练的通用词向量，不需要处理 OOV | GloVe 300d |
| 需要预训练的通用词向量，必须处理拼写错误 / 新造词 / 形态丰富的语言 | FastText |
| 任何进入 Transformer 的东西（训练或推理） | 模型自带的分词器。永远不要换。 |
| 从头训练自己的语言模型 | 先在你的语料上训练一个 BPE 或 SentencePiece 分词器 |
| 用线性模型做生产级文本分类 | 还是 TF-IDF。第 02 课讲过。 |

## Ship It

保存为 `outputs/skill-embeddings-picker.md`：

```markdown
---
name: tokenizer-picker
description: Pick a tokenization approach for a new language model or text pipeline.
version: 1.0.0
phase: 5
lesson: 04
tags: [nlp, tokenization, embeddings]
---

Given a task and dataset description, you output:

1. Tokenization strategy (word-level, BPE, WordPiece, SentencePiece, byte-level). One-sentence reason.
2. Vocabulary size target (e.g., 32k for an English-only LM, 64k-100k for multilingual).
3. Library call with the exact training command. Name the library. Quote the arguments.
4. One reproducibility pitfall. Tokenizer-model mismatch is the single most common silent production bug; call out which pair must be used together.

Refuse to recommend training a custom tokenizer when the user is fine-tuning a pretrained LLM. Refuse to recommend word-level tokenization for any model targeting production inference. Flag non-English / multi-script corpora as needing SentencePiece with byte fallback.
```

## 练习

1. **简单。** 运行 `char_ngrams("playing")` 和 `char_ngrams("played")`。计算两个 n-gram 集合的 Jaccard 重叠度。你应该能看到大量共享的片段（`pla`、`lay`、`play`），这就是为什么 FastText 能跨形态变体迁移。
2. **中等。** 扩展 `learn_bpe` 来追踪词表增长。画出"每个语料字符对应的 token 数"随合并次数变化的曲线。你会看到一开始压缩很快，然后渐近到约 2-3 字符/token。
3. **困难。** 在莎士比亚全集上训练一个 1000 次合并的 BPE。比较常见词和罕见专有名词的分词结果。测量合并前后每个词的平均 token 数。写下让你意外的发现。

## 术语表

| 术语 | 通俗说法 | 实际含义 |
|------|----------|----------|
| 共现矩阵（Co-occurrence matrix） | 词-词频率表 | `X[i][j]` = 词 `j` 出现在词 `i` 窗口内的次数。 |
| 子词（Subword） | 词的碎片 | 字符 n-gram（FastText）或学习出来的 token（BPE/WordPiece/SentencePiece）。 |
| BPE（Byte-Pair Encoding） | 字节对编码 | 迭代合并最高频的相邻对，直到词表达到目标大小。 |
| OOV（Out of vocabulary） | 词表外词 | 模型从未见过的词。Word2Vec/GloVe 搞不定。FastText 和 BPE 能处理。 |
| 字节级 BPE（Byte-level BPE） | 基于原始字节的 BPE | GPT-2 的方案。词表从 256 个字节开始，所以什么东西都不会 OOV。 |

## 延伸阅读

- [Pennington, Socher, Manning (2014). GloVe: Global Vectors for Word Representation](https://nlp.stanford.edu/pubs/glove.pdf) — GloVe 论文，七页纸，至今仍是对损失函数最好的推导。
- [Bojanowski et al. (2017). Enriching Word Vectors with Subword Information](https://arxiv.org/abs/1607.04606) — FastText。
- [Sennrich, Haddow, Birch (2016). Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909) — 把 BPE 引入现代 NLP 的论文。
- [Hugging Face tokenizer summary](https://huggingface.co/docs/transformers/tokenizer_summary) — BPE、WordPiece 和 SentencePiece 在实践中到底有什么区别。

---

## 自测题

:::quiz
question: GloVe 相比 Word2Vec 贡献了什么？
options:
  - 用加权损失直接分解词-词共现矩阵
  - 字节级分词
  - 更深的神经网络
  - 子词 n-gram 嵌入
correct: 0
explanation: GloVe 用精心设计的加权对数损失分解全局共现矩阵。
:::

:::quiz
question: FastText 解决了 Word2Vec 和 GloVe 无法解决的什么问题？
options:
  - 降低训练成本
  - 多语言迁移
  - 通过组合字符 n-gram 为未见过的词生成向量
  - 多义词消歧
correct: 2
explanation: FastText 从子词 n-gram 组合出词向量，所以 OOV 词也能获得合理的向量。
:::

:::quiz
question: 在 GloVe 中，加权函数 f(x) = (x/x_max)^alpha 起什么作用？
options:
  - 降低极高频词对的权重，防止它们主导损失
  - 选择负样本
  - 随机初始化权重
  - 把向量归一化到单位长度
correct: 0
explanation: 加权函数防止像 (the, and) 这样无处不在的共现对主导训练。
:::

:::quiz
question: BPE 的合并步骤是怎么选择要合并哪一对的？
options:
  - 随机选一对
  - 字典序最靠前的一对
  - 语料中出现频率最高的相邻 token 对
  - IDF 最高的一对
correct: 2
explanation: BPE 每次迭代合并最高频的相邻对。
:::

:::quiz
question: GPT-2 为什么使用字节级 BPE？
options:
  - 字节级 BPE 不需要训练合并规则
  - 以 256 个字节为基础词表可以覆盖任何输入，彻底消除 OOV
  - 字节比字符训练更快
  - 字节能隐式保留大小写
correct: 1
explanation: 从 256 个字节起步意味着任何 UTF-8 字符串都能被分词；没有什么是 OOV。
:::

:::quiz
question: 微调预训练 Transformer 时应该用哪个分词器？
options:
  - 一律用 SentencePiece
  - 模型自带的那个分词器；不匹配会破坏嵌入
  - 词表最大的那个
  - 一律用字节级 BPE
correct: 1
explanation: 分词器和模型不匹配会无声地破坏输入；永远用模型配套的分词器。
:::

:::quiz
question: 什么时候该选 FastText 而不是 GloVe 的预训练词向量？
options:
  - 需要 50 维模型的时候
  - 形态丰富的语言，或频繁出现新造词和拼写错误的领域
  - 延迟要求最严格的时候
  - 语料非常小的时候
correct: 1
explanation: FastText 的子词组合能处理屈折变化、新造词和拼写错误，GloVe 做不到。
:::

:::quiz
question: WordPiece、BPE 和 SentencePiece 词表的基本单位是什么？
options:
  - 句子
  - 完整的词
  - 段落
  - 词以下级别的子词片段（字符、n-gram 或学到的合并单元）
correct: 3
explanation: 三者都是子词分词器；它们的区别在于合并/片段的学习方式，而不在于子词这一点。
:::

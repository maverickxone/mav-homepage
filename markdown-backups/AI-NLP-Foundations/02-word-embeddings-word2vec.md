---
title: "词嵌入 — 从零实现 Word2Vec"
chapter: 2
readTime: 75
description: "一个词的含义取决于它的邻居。用这个想法训练一个浅层网络，几何结构就自然涌现了。"
---
> 一个词的含义取决于它的邻居。用这个想法训练一个浅层网络，几何结构就自然涌现了。






## 为什么要学这个

TF-IDF 知道 `dog` 和 `puppy` 是不同的词，但不知道它们的意思几乎一样。一个在 `dog` 上训练的分类器遇到 `puppy` 就抓瞎了。你可以靠手动列同义词表来缓解，但这种方法在罕见词、领域术语和你没预料到的语言上全部失效。

你想要一种表示方式，让 `dog` 和 `puppy` 在空间中靠在一起；让 `king - man + woman` 落在 `queen` 附近；让在 `dog` 上训练过的模型自动把一些信号迁移到 `puppy` 上——不需要额外工作。

Word2Vec 给了我们这个空间。两层神经网络，万亿 token 的训练规模，2013 年发表。架构简单到有点尴尬，结果却重塑了 NLP 整整十年。

## 核心概念

**分布假说（Distributional Hypothesis）**（Firth, 1957）："你可以通过一个词的邻居来了解它。" 如果两个词出现在相似的上下文中，它们大概率意思相近。

Word2Vec 有两个变体，都利用了这个想法：

- **Skip-gram。** 给定中心词，预测周围的词。窗口大小为 2 时：`cat -> (the, sat, on)`。
- **CBOW（连续词袋，Continuous Bag of Words）。** 给定周围的词，预测中心词。`(the, sat, on) -> cat`。

Skip-gram 训练更慢但对低频词效果更好，成了默认选择。

网络只有一个隐藏层，没有非线性激活。输入是词表上的 one-hot 向量，输出是词表上的 softmax。训练结束后你把输出层扔掉，隐藏层的权重就是词嵌入（Word Embedding）。

```
one-hot(center) ── W ──▶ hidden (d-dim) ── W' ──▶ softmax(vocab)
                          ^
                          this is the embedding
```

关键技巧：对 10 万个词做 softmax 的计算量大到不现实。Word2Vec 用**负采样（Negative Sampling）**把问题变成二分类任务——预测"这个上下文词是不是出现在这个中心词附近，是或否"。每个训练对只采样一小撮负样本（没有共现的词），不用对整个词表算 softmax。

## 从零实现

### 第一步：从语料中生成训练对

```python
def skipgram_pairs(docs, window=2):
    pairs = []
    for doc in docs:
        for i, center in enumerate(doc):
            for j in range(max(0, i - window), min(len(doc), i + window + 1)):
                if i == j:
                    continue
                pairs.append((center, doc[j]))
    return pairs
```

```python
>>> skipgram_pairs([["the", "cat", "sat", "on", "mat"]], window=2)
[('the', 'cat'), ('the', 'sat'),
 ('cat', 'the'), ('cat', 'sat'), ('cat', 'on'),
 ('sat', 'the'), ('sat', 'cat'), ('sat', 'on'), ('sat', 'mat'),
 ...]
```

窗口内的每一对 (中心词, 上下文词) 就是一个正样本。

### 第二步：嵌入表

两个矩阵。`W` 是中心词嵌入表（最终你保留的那个）。`W'` 是上下文词表（通常丢弃，有时会和 `W` 取平均）。

```python
import numpy as np


def init_embeddings(vocab_size, dim, seed=0):
    rng = np.random.default_rng(seed)
    W = rng.normal(0, 0.1, size=(vocab_size, dim))
    W_prime = rng.normal(0, 0.1, size=(vocab_size, dim))
    return W, W_prime
```

小随机初始化。词表 10k、维度 100 是现实规模；教学用的话，50 词 × 16 维就够看到几何结构了。

### 第三步：负采样目标函数

对每个正样本对 `(center, context)`，从词表里随机采 `k` 个词作为负样本。训练目标：让正样本的点积 `W[center] · W'[context]` 尽可能大，负样本的尽可能小。

```python
def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -20, 20)))


def train_pair(W, W_prime, center_idx, context_idx, negative_indices, lr):
    v_c = W[center_idx]
    u_pos = W_prime[context_idx]
    u_negs = W_prime[negative_indices]

    pos_score = sigmoid(v_c @ u_pos)
    neg_scores = sigmoid(u_negs @ v_c)

    grad_center = (pos_score - 1) * u_pos
    for i, u in enumerate(u_negs):
        grad_center += neg_scores[i] * u

    W[context_idx] = W[context_idx]
    W_prime[context_idx] -= lr * (pos_score - 1) * v_c
    for i, neg_idx in enumerate(negative_indices):
        W_prime[neg_idx] -= lr * neg_scores[i] * v_c
    W[center_idx] -= lr * grad_center
```

核心公式：正样本对的 logistic loss（希望 sigmoid 接近 1）加上负样本的 logistic loss（希望 sigmoid 接近 0）。梯度同时流向两个表。完整推导在原始论文里；如果想真正理解，建议拿纸笔推一遍。

### 第四步：在玩具语料上训练

```python
def train(docs, dim=16, window=2, k_neg=5, epochs=100, lr=0.05, seed=0):
    vocab = build_vocab(docs)
    vocab_size = len(vocab)
    rng = np.random.default_rng(seed)
    W, W_prime = init_embeddings(vocab_size, dim, seed=seed)
    pairs = skipgram_pairs(docs, window=window)

    for epoch in range(epochs):
        rng.shuffle(pairs)
        for center, context in pairs:
            c_idx = vocab[center]
            ctx_idx = vocab[context]
            negs = rng.integers(0, vocab_size, size=k_neg)
            negs = [n for n in negs if n != ctx_idx and n != c_idx]
            train_pair(W, W_prime, c_idx, ctx_idx, negs, lr)
    return vocab, W
```

在大语料上跑足够多 epoch 后，共享上下文的词就会有相似的中心嵌入。在玩具语料上效果微弱，在数十亿 token 上效果惊人。

### 第五步：类比魔法

```python
def nearest(vocab, W, target_vec, topk=5, exclude=None):
    exclude = exclude or set()
    inv_vocab = {i: w for w, i in vocab.items()}
    norms = np.linalg.norm(W, axis=1, keepdims=True) + 1e-9
    W_norm = W / norms
    target = target_vec / (np.linalg.norm(target_vec) + 1e-9)
    sims = W_norm @ target
    order = np.argsort(-sims)
    out = []
    for i in order:
        if i in exclude:
            continue
        out.append((inv_vocab[i], float(sims[i])))
        if len(out) == topk:
            break
    return out


def analogy(vocab, W, a, b, c, topk=5):
    v = W[vocab[b]] - W[vocab[a]] + W[vocab[c]]
    return nearest(vocab, W, v, topk=topk, exclude={vocab[a], vocab[b], vocab[c]})
```

用预训练的 300 维 Google News 向量试试：

```python
>>> analogy(vocab, W, "man", "king", "woman")
[('queen', 0.71), ('monarch', 0.62), ('princess', 0.59), ...]
```

`king - man + woman = queen`。不是因为模型"知道"什么是皇室，而是因为向量 `(king - man)` 捕捉了类似"皇家"的方向，把它加到 `woman` 上就落到了"皇家-女性"区域。

## 实战用法

从零写 Word2Vec 是为了学习。生产环境下的 NLP 用 `gensim`。

```python
from gensim.models import Word2Vec

sentences = [
    ["the", "cat", "sat", "on", "the", "mat"],
    ["the", "dog", "ran", "across", "the", "room"],
]

model = Word2Vec(
    sentences,
    vector_size=100,
    window=5,
    min_count=1,
    sg=1,
    negative=5,
    workers=4,
    epochs=30,
)

print(model.wv["cat"])
print(model.wv.most_similar("cat", topn=3))
```

实际工作中你几乎不需要自己训练 Word2Vec，直接下载预训练向量就行。

- **GloVe** — 斯坦福的共现矩阵分解方法。提供 50d、100d、200d、300d 检查点，覆盖面广。第 04 课专门讲 GloVe。
- **fastText** — Facebook 的 Word2Vec 扩展，嵌入字符 n-gram。通过组合子词处理未登录词（OOV）。第 04 课。
- **预训练 Word2Vec（Google News）** — 300 维，300 万词表，2013 年发布。今天每天还有人在下载。

### 2026 年 Word2Vec 仍然好用的场景

- 轻量级领域检索。在笔记本上花一小时对医学摘要训练，就能得到通用模型捕捉不到的专业向量。
- 类比式特征工程。`gender_vector = mean(man - woman pairs)`，从其他词中减去它得到性别中性轴。公平性研究至今在用。
- 可解释性。100 维足够小，用 PCA 或 t-SNE 画出来就能肉眼看到聚类。
- 任何需要在设备端无 GPU 推理的场景。Word2Vec 查表就是取一行矩阵，极快。

### Word2Vec 的局限

**多义词（Polysemy）墙。** `bank` 只有一个向量。`river bank`（河岸）和 `financial bank`（银行）共享同一个向量。`table`（表格 vs. 桌子）也是。下游分类器没法从向量里区分不同词义。

上下文嵌入（Contextual Embedding）（ELMo、BERT 以及之后的所有 Transformer）解决了这个问题：为每次出现的词根据上下文生成不同的向量。从 Word2Vec 到 BERT 的跨越就是从静态到上下文的跳跃。Phase 7 会讲 Transformer 部分。

另一个失败点是**未登录词（OOV，Out of Vocabulary）问题**。Word2Vec 从没见过 `Zoomer-approved` 就没法生成向量，毫无回退机制。fastText 用子词组合解决了这个问题（第 04 课）。

## Ship It

保存为 `outputs/skill-embedding-probe.md`：

```markdown
---
name: embedding-probe
description: Inspect a word2vec model. Run analogies, find neighbors, diagnose quality.
version: 1.0.0
phase: 5
lesson: 03
tags: [nlp, embeddings, debugging]
---

You probe trained word embeddings to verify they are working. Given a `gensim.models.KeyedVectors` object and a vocabulary, you run:

1. Three canonical analogy tests. `king : man :: queen : woman`. `paris : france :: tokyo : japan`. `walking : walked :: swimming : ?`. Report the top-1 result and its cosine.
2. Five nearest-neighbor tests on domain-specific words the user supplies. Print top-5 neighbors with cosines.
3. One symmetry check. `similarity(a, b) == similarity(b, a)` to within float precision.
4. One degenerate check. If any embedding has a norm below 0.01 or above 100, the model has a training bug. Flag it.

Refuse to declare a model good on analogy accuracy alone. Analogy benchmarks are gameable and do not transfer to downstream tasks. Recommend intrinsic + downstream evaluation together.
```

## 练习

1. **简单。** 在一个小语料上跑训练循环（20 句关于猫和狗的句子）。200 epoch 后验证 `nearest(vocab, W, W[vocab["cat"]])` 的 top 3 里有 `dog`。如果没有，增加 epoch 或词表大小。
2. **中等。** 加入高频词降采样（subsampling）。频率超过 `10^-5` 的词以与其频率成正比的概率从训练对中丢弃。测量这对低频词相似度的影响。
3. **困难。** 在 20 Newsgroups 语料上训练模型。计算两个偏见轴：`he - she` 和 `doctor - nurse`。把职业词投影到两个轴上，报告哪些职业的偏见差距最大。这就是公平性研究者使用的探针方法。

## 术语表

| 术语 | 通俗说法 | 准确含义 |
|------|----------|----------|
| 词嵌入（Word Embedding） | 把词变成向量 | 从上下文学习到的稠密、低维（通常 100-300 维）表示。 |
| Skip-gram | Word2Vec 的核心技巧 | 从中心词预测上下文词。比 CBOW 慢，但对低频词更好。 |
| 负采样（Negative Sampling） | 训练捷径 | 用对 `k` 个随机词的二分类替代对整个词表的 softmax。 |
| 静态嵌入（Static Embedding） | 一个词一个向量 | 不管上下文如何都是同一个向量。多义词上失效。 |
| 上下文嵌入（Contextual Embedding） | 上下文敏感向量 | 每次出现根据周围词生成不同向量。Transformer 的产物。 |
| OOV（Out of Vocabulary） | 未登录词 | 训练时没见过的词。Word2Vec 无法为其生成向量。 |

## 延伸阅读

- [Mikolov et al. (2013). Distributed Representations of Words and Phrases and their Compositionality](https://arxiv.org/abs/1310.4546) — 负采样论文。篇幅短，可读性强。
- [Rong, X. (2014). word2vec Parameter Learning Explained](https://arxiv.org/abs/1411.2738) — 梯度推导最清晰的版本，如果原论文的数学让你头疼就看这篇。
- [gensim Word2Vec 教程](https://radimrehurek.com/gensim/models/word2vec.html) — 生产环境下真正好用的训练配置。

---

## 自测题

:::quiz
question: 分布假说是什么意思？
options:
  - 你可以通过一个词的邻居来了解它
  - 词在文档中均匀分布
  - 所有词都能嵌入到 300 维空间
  - 高频词携带最多含义
correct: 0
explanation: Firth (1957) 的分布假说：相似的上下文意味着相似的含义。
:::

:::quiz
question: 为什么对整个词表做 softmax 在 Word2Vec 中不现实？
options:
  - 对 10 万+ 词表计算 softmax 每步训练代价过高
  - Softmax 无法建模概率
  - Softmax 没有梯度
  - 它会导致梯度消失
correct: 0
explanation: 全词表 softmax 计算量太大；负采样把它转化为二分类问题。
:::

:::quiz
question: Skip-gram 和 CBOW 的区别是什么？
options:
  - Skip-gram 用 bigram；CBOW 用 unigram
  - Skip-gram 从中心词预测上下文；CBOW 从上下文预测中心词
  - Skip-gram 从上下文预测中心词；CBOW 反过来
  - Skip-gram 训练深度网络；CBOW 是浅层的
correct: 1
explanation: Skip-gram：中心词 -> 上下文。CBOW：上下文 -> 中心词。
:::

:::quiz
question: 在负采样中，正样本对 (center, context) 的训练目标是什么？
options:
  - 最大化 sigmoid(W[center] · W'[context]) 使其接近 1
  - 让它们正交
  - 最小化它们的点积
  - 让向量去相关
correct: 0
explanation: 正样本对训练 sigmoid 接近 1；采样的负样本训练 sigmoid 接近 0。
:::

:::quiz
question: 训练完 Word2Vec 后，哪个权重矩阵成为词嵌入？
options:
  - 训练后的单独投影层
  - 输入到隐藏层的 W 矩阵（中心词表）
  - 两个矩阵相乘
  - 隐藏层到输出的 W' 矩阵
correct: 1
explanation: 中心词表 W 是标准的嵌入输出；W' 通常被丢弃或与 W 取平均。
:::

:::quiz
question: 为什么 Word2Vec 在多义词（如 'bank'）上失败？
options:
  - 窗口大小太小
  - 它忽略低频词
  - 负采样丢弃了罕见含义
  - 它给每个词只分配一个静态向量，所以 'river bank' 和 'financial bank' 共享同一个向量
correct: 3
explanation: 静态嵌入无法区分词义；上下文嵌入（ELMo/BERT）解决了这个问题。
:::

:::quiz
question: 2026 年你什么时候还会选 Word2Vec 而不是 Transformer？
options:
  - 轻量级、设备端、领域特定检索——延迟预算只够一次行查表
  - 需要上下文消歧时
  - 输入特别长时
  - 对话质量很重要时
correct: 0
explanation: Word2Vec 在极低延迟预算、设备端推理或快速领域训练场景下胜出。
:::

:::quiz
question: 经典类比 'king - man + woman ≈ queen' 靠什么实现？
options:
  - 模型把皇室编码为一个标志位
  - Skip-gram 在皇室词表上训练
  - 向量算术捕捉了"皇家"这样的线性方向，可以跨性别迁移
  - 余弦相似度对性别不变
correct: 2
explanation: 嵌入空间中的方向编码了关系特征，所以加减向量能系统性地移动位置。
:::



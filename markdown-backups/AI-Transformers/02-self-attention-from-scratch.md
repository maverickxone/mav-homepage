---
title: "从零实现自注意力"
chapter: 2
readTime: 90
description: "注意力就是一张查找表——每个词都在问「谁对我重要？」，然后自己学出答案。"
---

> 注意力就是一张查找表——每个词都在问「谁对我重要？」，然后自己学出答案。

## 学习目标

- 仅用 NumPy 从零实现缩放点积自注意力（Scaled Dot-Product Self-Attention），包括 Q/K/V 投影和 softmax 加权求和
- 搭建一个多头注意力（Multi-Head Attention）层：拆分多个头、并行计算注意力、拼接结果
- 追踪注意力矩阵如何捕捉 token 间的关系，解释为什么要除以 sqrt(d_k) 来防止 softmax 饱和
- 用因果掩码（Causal Mask）把双向注意力变成自回归（解码器风格）注意力

## 为什么要学这个

RNN 逐 token 处理序列。等你走到第 50 个 token 的时候，第 1 个 token 的信息已经经过了 50 次压缩。长距离依赖被挤进一个定长的隐状态里——这个瓶颈，再多的 LSTM 门控也治不好。

2014 年 Bahdanau 的注意力论文给出了修复方案：让解码器回头看编码器的每个位置，自己决定哪些重要。但它本质上还是绑在 RNN 上的。2017 年「Attention Is All You Need」问了个更尖锐的问题：如果注意力是**唯一**机制呢？没有循环，没有卷积，只有注意力。

自注意力（Self-Attention）让序列中的每个位置在一个并行步骤里关注所有其他位置。这就是 Transformer 快、可扩展、统治一切的原因。

## 核心概念

### 数据库查询类比

把注意力想象成一次"软查询"：

```
传统数据库：
  查询: "法国的首都"  -->  精确匹配  -->  "巴黎"

注意力：
  查询: "法国的首都"  -->  和所有 key 算相似度  -->  对所有 value 做加权混合
```

每个 token 生成三个向量：
- **查询（Query, Q）**："我在找什么？"
- **键（Key, K）**："我包含什么？"
- **值（Value, V）**："如果被选中，我提供什么信息？"

query 和所有 key 的点积产生注意力分数。分数越高，说明"这个 key 和我的 query 越匹配"。然后用分数对 value 加权，输出就是 value 的加权和。

### Q、K、V 的计算

每个 token 的嵌入向量通过三个学到的权重矩阵做投影：

```
输入嵌入（n 个 token，每个 d 维）：

  X = [x1, x2, x3, ..., xn]       shape: (n, d)

三个权重矩阵：

  Wq  shape: (d, dk)
  Wk  shape: (d, dk)
  Wv  shape: (d, dv)

投影：

  Q = X @ Wq    shape: (n, dk)      每个 token 的查询
  K = X @ Wk    shape: (n, dk)      每个 token 的键
  V = X @ Wv    shape: (n, dv)      每个 token 的值
```

对单个 token 来说：

```
             Wq
  x_i ------[*]------> q_i    "我在找什么？"
       |
       |     Wk
       +----[*]------> k_i    "我包含什么？"
       |
       |     Wv
       +----[*]------> v_i    "我能提供什么？"
```

### 注意力矩阵

有了所有 token 的 Q、K、V 之后，注意力分数形成一个矩阵：

```
Scores = Q @ K^T    shape: (n, n)

              k1    k2    k3    k4    k5
        +-----+-----+-----+-----+-----+
   q1   | 2.1 | 0.3 | 0.1 | 0.8 | 0.2 |   <- q1 对每个 key 的关注程度
        +-----+-----+-----+-----+-----+
   q2   | 0.4 | 1.9 | 0.7 | 0.1 | 0.3 |
        +-----+-----+-----+-----+-----+
   q3   | 0.2 | 0.6 | 2.3 | 0.5 | 0.1 |
        +-----+-----+-----+-----+-----+
   q4   | 0.9 | 0.1 | 0.4 | 1.7 | 0.6 |
        +-----+-----+-----+-----+-----+
   q5   | 0.1 | 0.3 | 0.2 | 0.5 | 2.0 |
        +-----+-----+-----+-----+-----+

每一行：一个 token 对整个序列的注意力分布
```

### 为什么要缩放？

点积的量级随维度 dk 增长。如果 dk = 64，点积可能到几十这个量级，把 softmax 推进梯度消失区域。解决办法：除以 sqrt(dk)。

```
缩放后的分数 = (Q @ K^T) / sqrt(dk)
```

这让数值保持在 softmax 能产生有效梯度的范围内。

### Softmax 把分数变成权重

Softmax 把每一行的原始分数转换成概率分布：

```
q1 的原始分数：   [2.1, 0.3, 0.1, 0.8, 0.2]
                            |
                         softmax
                            |
注意力权重：      [0.52, 0.09, 0.07, 0.14, 0.08]   （加起来 ≈ 1.0）
```

现在每个 token 都有一组权重，表示它对其他每个 token 的关注度。

### 对 Value 做加权求和

每个 token 的最终输出是所有 value 向量的加权和：

```
output_i = sum( attention_weight[i][j] * v_j  对所有 j )

对 token 1：
  output_1 = 0.52 * v1 + 0.09 * v2 + 0.07 * v3 + 0.14 * v4 + 0.08 * v5
```

### 完整流水线

```
                    +-------+
  X（输入） ----->|  @ Wq  |-----> Q
                    +-------+
                    +-------+
  X（输入） ----->|  @ Wk  |-----> K
                    +-------+                     +----------+
                    +-------+                     |          |
  X（输入） ----->|  @ Wv  |-----> V ---------->| 加权求和  |----> 输出
                    +-------+          ^          |          |
                                       |          +----------+
                              +--------+--------+
                              |    softmax      |
                              +---------+-------+
                                        ^
                              +---------+-------+
                              | Q @ K^T / sqrt  |
                              +-----------------+
```

一行公式：

```
Attention(Q, K, V) = softmax( Q @ K^T / sqrt(dk) ) @ V
```

## 从零实现

### 第 1 步：手写 Softmax

Softmax 把原始 logits 转换成概率。先减去最大值保证数值稳定。

```python
import numpy as np

def softmax(x):
    # 减去最大值防止 exp 溢出
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exp_x = np.exp(shifted)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

logits = np.array([2.0, 1.0, 0.1])
print(f"logits:  {logits}")
print(f"softmax: {softmax(logits)}")
print(f"sum:     {softmax(logits).sum():.4f}")
```

### 第 2 步：缩放点积注意力

核心函数。接收 Q、K、V 矩阵，返回注意力输出和权重矩阵。

```python
def scaled_dot_product_attention(Q, K, V):
    dk = Q.shape[-1]
    # 计算注意力分数并缩放
    scores = Q @ K.T / np.sqrt(dk)
    weights = softmax(scores)
    output = weights @ V
    return output, weights
```

### 第 3 步：带可学习投影的自注意力类

一个完整的自注意力模块，用 Xavier 风格缩放初始化 Wq、Wk、Wv 权重矩阵。

```python
class SelfAttention:
    def __init__(self, d_model, dk, dv, seed=42):
        rng = np.random.default_rng(seed)
        scale = np.sqrt(2.0 / (d_model + dk))
        self.Wq = rng.normal(0, scale, (d_model, dk))
        self.Wk = rng.normal(0, scale, (d_model, dk))
        scale_v = np.sqrt(2.0 / (d_model + dv))
        self.Wv = rng.normal(0, scale_v, (d_model, dv))
        self.dk = dk

    def forward(self, X):
        Q = X @ self.Wq
        K = X @ self.Wk
        V = X @ self.Wv
        output, weights = scaled_dot_product_attention(Q, K, V)
        return output, weights
```

### 第 4 步：跑一个句子试试

给一个句子造假嵌入，然后观察注意力权重。

```python
sentence = ["The", "cat", "sat", "on", "the", "mat"]
n_tokens = len(sentence)
d_model = 8
dk = 4
dv = 4

rng = np.random.default_rng(42)
X = rng.normal(0, 1, (n_tokens, d_model))

attn = SelfAttention(d_model, dk, dv, seed=42)
output, weights = attn.forward(X)

print("注意力权重（每行：该 token 看向哪里）：\n")
print(f"{'':>6}", end="")
for token in sentence:
    print(f"{token:>6}", end="")
print()

for i, token in enumerate(sentence):
    print(f"{token:>6}", end="")
    for j in range(n_tokens):
        w = weights[i][j]
        print(f"{w:6.3f}", end="")
    print()
```

### 第 5 步：用 ASCII 热力图可视化注意力

把注意力权重映射到字符上，快速直观查看。

```python
def ascii_heatmap(weights, tokens, chars=" ░▒▓█"):
    n = len(tokens)
    print(f"\n{'':>6}", end="")
    for t in tokens:
        print(f"{t:>6}", end="")
    print()

    for i in range(n):
        print(f"{tokens[i]:>6}", end="")
        for j in range(n):
            level = int(weights[i][j] * (len(chars) - 1) / weights.max())
            level = min(level, len(chars) - 1)
            print(f"{'  ' + chars[level] + '   '}", end="")
        print()

ascii_heatmap(weights, sentence)
```

## 实战用法

PyTorch 的 `nn.MultiheadAttention` 做的事和我们刚才一模一样，外加多头拆分和输出投影：

```python
import torch
import torch.nn as nn

d_model = 8
n_heads = 2
seq_len = 6

mha = nn.MultiheadAttention(embed_dim=d_model, num_heads=n_heads, batch_first=True)

X_torch = torch.randn(1, seq_len, d_model)

output, attn_weights = mha(X_torch, X_torch, X_torch)

print(f"Input shape:            {X_torch.shape}")
print(f"Output shape:           {output.shape}")
print(f"Attention weight shape: {attn_weights.shape}")
print(f"\nAttn weights (averaged over heads):")
print(attn_weights[0].detach().numpy().round(3))
```

关键区别：多头注意力（Multi-Head Attention）并行运行多个注意力函数，每个头有自己的 Q、K、V 投影（维度 dk = d_model / n_heads），然后拼接结果。这让模型能同时关注不同类型的关系。

## Ship It

这节课产出：
- `outputs/prompt-attention-explainer.md` —— 一个用数据库查询类比来解释注意力的 prompt

## 练习

1. 修改 `scaled_dot_product_attention`，让它接受一个可选的 mask 矩阵，在 softmax 之前把特定位置设为负无穷（这就是因果/解码器掩码的工作原理）
2. 从零实现多头注意力：把 Q、K、V 拆成 `n_heads` 份，对每份分别跑注意力，拼接起来，再通过最终权重矩阵 Wo 投影
3. 取两个长度相同的不同句子，用同一个 SelfAttention 实例处理，比较它们的注意力模式。什么变了？什么没变？

## 术语表

| 术语 | 通俗说法 | 实际含义 |
|------|---------|---------|
| 查询（Query, Q） | "问题向量" | 输入的一个学习到的投影，代表该 token 在寻找什么信息 |
| 键（Key, K） | "标签向量" | 代表该 token 包含什么信息的投影，用来和 query 匹配 |
| 值（Value, V） | "内容向量" | 携带实际信息的投影，根据注意力分数被聚合 |
| 缩放点积注意力（Scaled Dot-Product Attention） | "注意力公式" | softmax(QK^T / sqrt(dk)) @ V —— 缩放防止高维下 softmax 饱和 |
| 自注意力（Self-Attention） | "token 看自己和别人" | Q、K、V 来自同一个序列的注意力，让每个位置都能关注其他所有位置 |
| 注意力权重（Attention Weights） | "关注程度" | 对各位置的概率分布，由缩放点积经 softmax 产生 |
| 多头注意力（Multi-Head Attention） | "并行注意力" | 用不同投影并行运行多个注意力函数，拼接结果以获得更丰富的表征 |

## 延伸阅读

- [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762) —— 原始 Transformer 论文
- [The Illustrated Transformer (Jay Alammar)](https://jalammar.github.io/illustrated-transformer/) —— 最好的全架构可视化讲解
- [The Annotated Transformer (Harvard NLP)](https://nlp.seas.harvard.edu/annotated-transformer/) —— 逐行 PyTorch 实现加解释

---

## 自测题

:::quiz
question: 为什么原始自注意力要把点积除以 1/sqrt(d_k)？
options:
  - 为了让输出值在 0 到 1 之间
  - 为了防止高维下点积过大，把 softmax 推入梯度极小的区域
  - 为了把 query 和 key 向量归一化到单位长度
  - 为了降低矩阵乘法的计算成本
correct: 1
explanation: 当 d_k 很大时，随机向量的点积大小与 sqrt(d_k) 成正比。不缩放的话，softmax 收到很大的输入，输出接近 one-hot，梯度消失。
:::

:::quiz
question: 自注意力中的三个投影是什么？
options:
  - 输入、隐藏、输出
  - 查询、键、值——每个都是同一输入的学习线性投影
  - 编码器、解码器、交叉注意力
  - 嵌入、位置、段落
correct: 1
explanation: 自注意力把输入通过三个不同的权重矩阵投影，产生 query（我在找什么？）、key（我包含什么？）、value（匹配上了我输出什么？）。
:::

:::quiz
question: 8 个头、d_model=512 的多头注意力中，每个头的维度是多少？
options:
  - 512——每个头看到完整维度
  - 64——d_model 在各头间均分（512/8=64）
  - 8——每个头一个维度
  - 4096——每个头扩展表征
correct: 1
explanation: 多头注意力把 d_model 拆成 h 个头，每个头在 d_k = d_model/h 维上操作。512/8 = 64 维/头，总计算量等于在全维度上做单头注意力。
:::

:::quiz
question: 自回归注意力中的因果掩码（Causal Mask）阻止了什么？
options:
  - 阻止模型关注填充（padding）token
  - 阻止每个位置关注未来位置，确保模型预测下一个 token 时只能用过去的上下文
  - 阻止注意力权重变得过大
  - 阻止模型关注自身位置
correct: 1
explanation: 在自回归生成中，token t 不能看到 t+1、t+2 等后续 token。因果掩码在 softmax 之前把未来位置设为 -∞，使它们的注意力权重为零。
:::

:::quiz
question: 为什么自注意力在序列长度 n 上的复杂度是 O(n²)？
options:
  - 因为模型有 n 层堆叠
  - 因为每个 token 都要和其他所有 token 计算注意力分数，产生一个 n × n 的注意力矩阵
  - 因为注意力后面的前馈层是二次的
  - 因为注意力的反向传播需要 n² 次梯度计算
correct: 1
explanation: QK^T 矩阵乘法产生一个 n × n 的注意力矩阵，其中第 (i,j) 个元素是 token i 对 token j 的注意力。计算和内存都是 O(n²)，这就是为什么长上下文模型需要 FlashAttention 这样的技术。
:::

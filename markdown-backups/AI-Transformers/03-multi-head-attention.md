---
title: "多头注意力"
chapter: 3
readTime: 75
description: "一个注意力头一次只能学一种关系。八个头学八种。头几乎不花额外开销，多来几个。"
---
> 一个注意力头一次只能学一种关系。八个头学八种。头几乎不花额外开销，多来几个。






## 问题在哪

单个自注意力（Self-Attention）头只算出一张注意力矩阵。这张矩阵捕捉的是一种关系——通常是训练信号里损失最低的那种。如果你的数据同时缠绕着主谓一致、共指消解、长距离语篇和句法分块，一个头只能把它们糊进同一个 softmax 分布里，丢掉一半信息。

2017 年 Vaswani 论文的解法：并行跑多个注意力函数，每个有自己的 Q、K、V 投影，输出拼起来。每个头在一个更小的子空间里操作，维度是 `d_model / n_heads`。总参数量不变，表达能力上升。

多头注意力（Multi-Head Attention）是 2026 年每个 Transformer（变换器）出厂标配。唯一的争论在于*用多少个头*，以及 Key 和 Value 是否共享投影（分组查询注意力 GQA、多查询注意力 MQA、多头潜在注意力 MLA）。

## 核心概念

![多头注意力：拆分、注意、拼接](../assets/multi-head-attention.svg)

**拆分。** 输入 `X` 形状为 `(N, d_model)`。投影得到 Q、K、V，各自形状 `(N, d_model)`。Reshape 成 `(N, n_heads, d_head)`，其中 `d_head = d_model / n_heads`。转置成 `(n_heads, N, d_head)`。

**并行注意力。** 在每个头内部跑缩放点积注意力（Scaled Dot-Product Attention）。每个头输出 `(N, d_head)`。各头在不同子空间上操作，注意力计算期间彼此不通信。

**拼接并投影。** 把所有头堆回 `(N, d_model)`，乘以一个学习到的输出矩阵 `W_o`，形状 `(d_model, d_model)`。`W_o` 是头之间混合信息的地方。

**为什么有效。** 每个头可以专门化，不用跟其他头抢表示预算。2019–2024 年的探针（Probing）研究揭示了不同头的角色：位置头、关注前一个 token 的头、拷贝头、命名实体头、归纳头（Induction Head，支撑上下文学习的核心电路）。

**2026 年的变体谱系：**

| 变体 | Q 头数 | K/V 头数 | 使用者 |
|------|--------|----------|--------|
| 多头注意力（MHA） | N | N | GPT-2, BERT, T5 |
| 多查询注意力（MQA） | N | 1 | PaLM, Falcon |
| 分组查询注意力（GQA） | N | G（如 N/8） | Llama 2 70B, Llama 3+, Qwen 2+, Mistral |
| 多头潜在注意力（MLA） | N | 压缩到低秩 | DeepSeek-V2, V3 |

GQA 是现代默认选项，因为它把 KV 缓存（KV-Cache）内存砍掉 `N/G` 倍，质量几乎不掉。MLA 更进一步，把 K/V 压缩到潜在空间（Latent Space），计算时再投影回来——多花算力，省更多内存。

## 动手搭建

### 第一步：从单头注意力拆出多头

拿第 02 课的 `SelfAttention`，用一对拆分/拼接操作包起来。完整的 numpy 实现见 `code/main.py`，核心逻辑：

```python
def split_heads(X, n_heads):
    n, d = X.shape
    d_head = d // n_heads
    return X.reshape(n, n_heads, d_head).transpose(1, 0, 2)  # (heads, n, d_head)

def combine_heads(H):
    h, n, d_head = H.shape
    return H.transpose(1, 0, 2).reshape(n, h * d_head)
```

一次 reshape 加一次转置，没有循环。这正是 PyTorch 的 `nn.MultiheadAttention` 内部做的事。

### 第二步：逐头跑缩放点积注意力

每个头拿到自己那份 Q、K、V 切片。注意力变成一次批量矩阵乘法（Batched MatMul）：

```python
def mha_forward(X, W_q, W_k, W_v, W_o, n_heads):
    Q = X @ W_q
    K = X @ W_k
    V = X @ W_v
    Qh = split_heads(Q, n_heads)         # (heads, n, d_head)
    Kh = split_heads(K, n_heads)
    Vh = split_heads(V, n_heads)
    scores = Qh @ Kh.transpose(0, 2, 1) / np.sqrt(Qh.shape[-1])
    weights = softmax(scores, axis=-1)
    out = weights @ Vh                    # (heads, n, d_head)
    concat = combine_heads(out)
    return concat @ W_o, weights
```

在真实硬件上 `Qh @ Kh.transpose(...)` 就是一次 `bmm`。GPU 看到的是一个形状为 `(heads, N, d_head) × (heads, d_head, N) -> (heads, N, N)` 的批量矩阵乘。加头不花钱。

### 第三步：分组查询注意力（GQA）变体

只有 Key 和 Value 的投影变了。Q 有 `n_heads` 组；K 和 V 有 `n_kv_heads < n_heads` 组，重复扩展后与 Q 对齐：

```python
def gqa_project(X, W, n_kv_heads, n_heads):
    kv = split_heads(X @ W, n_kv_heads)       # (kv_heads, n, d_head)
    repeat = n_heads // n_kv_heads
    return np.repeat(kv, repeat, axis=0)      # (n_heads, n, d_head)
```

推理时这省了内存，因为 KV 缓存里只存 `n_kv_heads` 份，而不是 `n_heads` 份。Llama 3 70B 用 64 个查询头配 8 个 KV 头——缓存缩小 8 倍。

### 第四步：探查每个头学到了什么

对一个短句跑 4 头 MHA。对每个头打印 `(N, N)` 注意力矩阵。你会看到不同头即使在随机初始化下也会挑出不同结构——部分是信号，部分是子空间里的旋转对称性。

## 实际使用

在 PyTorch 里，一行搞定：

```python
import torch.nn as nn

mha = nn.MultiheadAttention(embed_dim=512, num_heads=8, batch_first=True)
```

PyTorch 2.5+ 的 GQA 用法：

```python
from torch.nn.functional import scaled_dot_product_attention

# scaled_dot_product_attention 在 CUDA 上自动调度 Flash Attention。
# GQA 时，传入 Q 形状 (B, n_heads, N, d_head)，K/V 形状
# (B, n_kv_heads, N, d_head)。PyTorch 自己处理重复扩展。
out = scaled_dot_product_attention(q, k, v, is_causal=True, enable_gqa=True)
```

**用多少头？** 2026 年生产模型的经验法则：

| 模型规模 | d_model | n_heads | d_head |
|----------|---------|---------|--------|
| 小型（~125M） | 768 | 12 | 64 |
| 基础（~350M） | 1024 | 16 | 64 |
| 大型（~1B） | 2048 | 16 | 128 |
| 前沿（~70B） | 8192 | 64 | 128 |

`d_head` 几乎总是落在 64 或 128。它是单个头能"看到"多少信息的基本单位。低于 32，头会跟缩放因子 `sqrt(d_head)` 打架；高于 256，就失去了"多个小专家"的好处。

## 交付产物

参见 `outputs/skill-mha-configurator.md`。该 skill 根据参数预算、序列长度和部署目标，为新 Transformer 推荐头数、KV 头数和投影策略。

## 练习

1. **简单。** 用 `code/main.py` 中的 MHA，把 `n_heads` 从 1 改到 16，`d_model=64` 不变。在一个合成拷贝任务上画出单层模型的损失曲线。更多头是帮忙了、到了平台期、还是反而变差了？
2. **中等。** 实现 MQA（所有查询头共享一个 KV 头）。测量跟完整 MHA 相比参数量减少了多少。计算 N=2048 时推理阶段 KV 缓存缩小了多少。
3. **困难。** 实现一个迷你版多头潜在注意力（MLA）：把 K、V 压缩到秩为 `r` 的潜在表示，KV 缓存里只存潜在表示，注意力计算时再解压。`r` 取多少时缓存内存能降到完整 MHA 的 1/8 以下，同时验证集困惑度（Perplexity）差距不超过 1 bit？

## 关键术语

| 术语 | 通俗说法 | 精确含义 |
|------|----------|----------|
| 头（Head） | "一条注意力电路" | 维度为 `d_head = d_model / n_heads` 的一组 Q/K/V 投影，拥有自己的注意力矩阵。 |
| d_head | "头维度" | 每个头的隐藏宽度；生产中几乎总是 64 或 128。 |
| 拆分/拼接（Split / Combine） | "reshape 技巧" | `(N, d_model) ↔ (n_heads, N, d_head)` 的 reshape + 转置，包裹在注意力前后。 |
| W_o | "输出投影" | 拼接头后应用的 `(d_model, d_model)` 矩阵；头之间混合信息的地方。 |
| MQA | "一个 KV 头" | 多查询注意力（Multi-Query Attention）：共享单个 K/V 投影。KV 缓存最小，有一定质量损失。 |
| GQA | "Llama 2 以来的默认" | 分组查询注意力（Grouped-Query Attention），`n_kv_heads < n_heads`；重复扩展后与 Q 对齐。 |
| MLA | "DeepSeek 的招" | 多头潜在注意力（Multi-head Latent Attention）：K、V 压缩到低秩潜在表示，计算时再解压。 |
| 归纳头（Induction Head） | "上下文学习背后的电路" | 一对头，检测之前出现过的模式，并拷贝紧跟其后的内容。 |

## 延伸阅读

- [Vaswani et al. (2017). Attention Is All You Need §3.2.2](https://arxiv.org/abs/1706.03762) — 多头注意力的原始规范。
- [Shazeer (2019). Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150) — MQA 论文。
- [Ainslie et al. (2023). GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245) — 如何在训练后把 MHA 转成 GQA。
- [DeepSeek-AI (2024). DeepSeek-V2 Technical Report](https://arxiv.org/abs/2405.04434) — MLA 以及为什么它在缓存内存上胜过 MHA/GQA。
- [Olsson et al. (2022). In-context Learning and Induction Heads](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html) — 从机制层面看头到底在做什么。

---
title: "注意力机制——突破瓶颈的那一刻"
chapter: 6
readTime: 45
description: "解码器不再盯着一个压缩过的摘要苦苦辨认，而是可以回头看整个源序列。从这以后，一切都是注意力加工程。"
---
> 解码器不再盯着一个压缩过的摘要苦苦辨认，而是可以回头看整个源序列。从这以后，一切都是注意力加工程。






## 为什么要学这个

第 09 课以一个"有意义的失败"收尾。一个 GRU 编码器-解码器在 toy copy 任务上，长度 5 时有 89% 的准确率，长度 80 时接近瞎猜。原因是结构性的，不是训练 bug：编码器学到的所有信息必须塞进一个定长隐藏状态，而解码器永远只能看到这一个向量。

Bahdanau、Cho 和 Bengio 在 2014 年发了一个三行修复。与其只把编码器最后的状态给解码器，不如把每一步的编码器状态都留着。在每个解码器步骤中，计算编码器状态的加权平均——权重表示"解码器此刻需要多关注编码器位置 `i`？"这个加权平均就是上下文（context），而且它每步都在变。

整个想法就是这么回事。Transformer 扩展了它。自注意力（Self-attention）把它用在单个序列上。多头注意力（Multi-head attention）并行跑。但 2014 版已经打破了瓶颈，之后走向 Transformer 的过程是工程，不是概念突破。

## 核心概念

![Bahdanau 注意力：解码器查询所有编码器状态](../assets/attention.svg)

在每个解码器步骤 `t`：

1. 用前一步的解码器隐藏状态 `s_{t-1}` 作为**查询（Query）**。
2. 把它和每个编码器隐藏状态 `h_1, ..., h_T` 做打分。每个编码器位置一个标量。
3. 对分数做 softmax，得到注意力权重（Attention Weights） `α_{t,1}, ..., α_{t,T}`，加起来等于 1。
4. 上下文向量 `c_t = Σ α_{t,i} * h_i`。编码器状态的加权平均。
5. 解码器拿 `c_t` 加上前一个输出 token，生成下一个 token。

加权平均是关键。当解码器需要把"Je"翻译成"I"时，它把编码器中"Je"对应的状态权重拉高，其他拉低。需要翻译"not"时，把"pas"的权重拉高。上下文向量每步都在重塑。

## 形状（每个人第一次写注意力都在这翻车）

每个注意力实现第一次出 bug 都是因为形状对不上。慢慢看。

| 东西 | 形状 | 说明 |
|------|------|------|
| 编码器隐藏状态 `H` | `(T_enc, d_h)` | 如果是 BiLSTM，`d_h = 2 * d_hidden` |
| 解码器隐藏状态 `s_{t-1}` | `(d_s,)` | 一个向量 |
| 注意力分数 `e_{t,i}` | 标量 | 每个编码器位置一个 |
| 注意力权重 `α_{t,i}` | 标量 | 对所有 `i` 做 softmax 之后 |
| 上下文向量 `c_t` | `(d_h,)` | 和一个编码器状态形状一样 |

**Bahdanau（加性）打分。** `e_{t,i} = v_α^T * tanh(W_a * s_{t-1} + U_a * h_i)`。

- `s_{t-1}` 形状 `(d_s,)`，`h_i` 形状 `(d_h,)`。
- `W_a` 形状 `(d_attn, d_s)`。`U_a` 形状 `(d_attn, d_h)`。
- tanh 里面求和的结果形状 `(d_attn,)`。
- `v_α` 形状 `(d_attn,)`。和 `v_α` 做内积坍缩成一个标量。**这就是 `v_α` 干的事。** 不是什么魔法，就是一个把注意力维度的向量变成标量分数的投影。

**Luong（乘性）打分。** 三种变体：

- `dot`：`e_{t,i} = s_t^T * h_i`。要求 `d_s == d_h`。硬约束。如果编码器是双向的，别用这个。
- `general`：`e_{t,i} = s_t^T * W * h_i`，`W` 形状 `(d_s, d_h)`。去掉了等维约束。
- `concat`：本质上就是 Bahdanau 形式。很少用，因为前两种更便宜。

**一个 Bahdanau / Luong 的坑值得点名。** Bahdanau 用的是 `s_{t-1}`（生成当前词*之前*的解码器状态）。Luong 用的是 `s_t`（生成当前词*之后*的状态）。搞混了会产生微妙的梯度错误，极难调试。选一篇论文的约定，然后坚持用它。

## 从零实现

### 第 1 步：加性（Bahdanau）注意力

```python
import numpy as np


def additive_attention(decoder_state, encoder_states, W_a, U_a, v_a):
    projected_dec = W_a @ decoder_state
    projected_enc = encoder_states @ U_a.T
    combined = np.tanh(projected_enc + projected_dec)
    scores = combined @ v_a
    weights = softmax(scores)
    context = weights @ encoder_states
    return context, weights


def softmax(x):
    x = x - np.max(x)
    e = np.exp(x)
    return e / e.sum()
```

对着上面的表检查你的形状。`encoder_states` 形状 `(T_enc, d_h)`。`projected_enc` 形状 `(T_enc, d_attn)`。`projected_dec` 形状 `(d_attn,)`，广播。`combined` 形状 `(T_enc, d_attn)`。`scores` 形状 `(T_enc,)`。`weights` 形状 `(T_enc,)`。`context` 形状 `(d_h,)`。搞定。

### 第 2 步：Luong dot 和 general

```python
def dot_attention(decoder_state, encoder_states):
    scores = encoder_states @ decoder_state
    weights = softmax(scores)
    return weights @ encoder_states, weights


def general_attention(decoder_state, encoder_states, W):
    projected = W.T @ decoder_state
    scores = encoder_states @ projected
    weights = softmax(scores)
    return weights @ encoder_states, weights
```

各三行。这就是 Luong 那篇论文影响力大的原因。大多数任务精度一样，代码少很多。

### 第 3 步：一个带数字的例子

给三个编码器状态（大致对应"cat"、"sat"、"mat"）和一个跟第一个最对齐的解码器状态，注意力分布会集中在位置 0。如果解码器状态转向跟最后一个对齐，注意力就跑到位置 2。上下文向量跟着走。

```python
H = np.array([
    [1.0, 0.0, 0.2],
    [0.5, 0.5, 0.1],
    [0.1, 0.9, 0.3],
])

s_close_to_cat = np.array([0.9, 0.1, 0.2])
ctx, w = dot_attention(s_close_to_cat, H)
print("weights:", w.round(3))
```

```
weights: [0.464 0.305 0.231]
```

第一行赢了。然后把解码器状态挪到接近第三个编码器状态，观察权重转移。就这样。注意力就是显式对齐。

### 第 4 步：为什么这是通往 Transformer 的桥梁

把上面的语言翻译成 Q/K/V：

- **查询（Query）** = 解码器状态 `s_{t-1}`
- **键（Key）** = 编码器状态（我们拿来打分的东西）
- **值（Value）** = 编码器状态（我们加权求和的东西）

在经典注意力里，键和值是同一个东西。自注意力（Self-attention）把它们分开：你可以让一个序列查询自身，K 和 V 用不同的学习投影。多头注意力（Multi-head attention）用不同的学习投影并行跑。Transformer 把整个阶段堆很多层，然后扔掉 RNN。

数学是一样的。形状是一样的。从 Bahdanau 注意力到缩放点积注意力（Scaled Dot-Product Attention）的教学跨度，主要是符号变了。

## 实战用法

PyTorch 和 TensorFlow 都直接提供了注意力模块。

```python
import torch
import torch.nn as nn

mha = nn.MultiheadAttention(embed_dim=128, num_heads=8, batch_first=True)
query = torch.randn(2, 5, 128)
key = torch.randn(2, 10, 128)
value = torch.randn(2, 10, 128)

output, weights = mha(query, key, value)
print(output.shape, weights.shape)
```

```
torch.Size([2, 5, 128]) torch.Size([2, 5, 10])
```

这就是一个 Transformer 注意力层。Query 批次 5 个位置，Key/Value 批次 10 个位置，128 维，8 头。`output` 是经过上下文增强的新查询。`weights` 是 5×10 的对齐矩阵，可以可视化。

### 经典注意力仍然重要的场景

- 教学。单头、单层、基于 RNN 的版本让每个概念都清晰可见。
- 设备端序列任务，Transformer 放不下的时候。
- 任何 2014-2017 年的论文。不懂 Bahdanau 的约定就会看错。
- 机器翻译中的细粒度对齐分析。原始注意力权重即使在 Transformer 模型上也是可解释性工具，读懂它需要知道它到底是什么。

### 注意力权重当"解释"用的陷阱

注意力权重看起来很好解释。它们是跨位置求和为 1 的权重；你可以画出来；高意味着"看了这里"。审稿人很喜欢。

但它们没有看起来那么可解释。Jain 和 Wallace（2019）证明了在某些任务上，注意力分布可以被打乱、替换成任意分布，而模型预测不变。永远不要把注意力权重当作推理证据报告，除非你做了消融或反事实检验。

## Ship It

保存为 `outputs/prompt-attention-shapes.md`：

```markdown
---
name: attention-shapes
description: Debug shape bugs in attention implementations.
phase: 5
lesson: 10
---

Given a broken attention implementation, you identify the shape mismatch. Output:

1. Which matrix has the wrong shape. Name the tensor.
2. What its shape should be, derived from (d_s, d_h, d_attn, T_enc, T_dec, batch_size).
3. One-line fix. Transpose, reshape, or project.
4. A test to catch regressions. Typically: assert `output.shape == (batch, T_dec, d_h)` and `weights.shape == (batch, T_dec, T_enc)` and `weights.sum(dim=-1) close to 1`.

Refuse to recommend fixes that silently broadcast. Broadcast-hiding bugs surface later as silent accuracy degradation, the worst kind of attention bug.

For Bahdanau confusion, insist the decoder input is `s_{t-1}` (pre-step state). For Luong, `s_t` (post-step state). For dot-product, flag dimension mismatch between query and key as the most common first-time error.
```

## 练习

1. **简单。** 实现 `softmax` 掩码（masking），让编码器中的 padding token 注意力权重为零。在一个变长序列的 batch 上测试。
2. **中等。** 给 Luong `general` 形式加上多头注意力（Multi-head Attention）。把 `d_h` 拆成 `n_heads` 组，每头单独跑注意力，拼接。验证单头情况和你之前的实现一致。
3. **困难。** 在第 09 课的 toy copy 任务上训练一个带 Bahdanau 注意力的 GRU 编码器-解码器。画出准确率 vs 序列长度的曲线。和无注意力基线对比。你应该看到随着长度增加差距越来越大，证明注意力确实打破了瓶颈。

## 术语表

| 术语 | 口语说法 | 实际意思 |
|------|----------|----------|
| 注意力（Attention） | 看东西 | 值序列的加权平均，权重由查询-键相似度算出。 |
| 查询、键、值（Query, Key, Value） | QKV | 三个投影：Q 提问，K 用来匹配，V 是返回的内容。 |
| 加性注意力（Additive Attention） | Bahdanau | 前馈网络打分：`v^T tanh(W q + U k)`。 |
| 乘性注意力（Multiplicative Attention） | Luong dot / general | 分数是 `q^T k` 或 `q^T W k`。更便宜，大多数任务精度一样。 |
| 对齐矩阵（Alignment Matrix） | 那张好看的图 | 注意力权重作为 `(T_dec, T_enc)` 网格。看它就能知道模型关注了什么。 |

## 延伸阅读

- [Bahdanau, Cho, Bengio (2014). Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473) — 开山论文。
- [Luong, Pham, Manning (2015). Effective Approaches to Attention-based Neural Machine Translation](https://arxiv.org/abs/1508.04025) — 三种打分变体及对比。
- [Jain and Wallace (2019). Attention is not Explanation](https://arxiv.org/abs/1902.10186) — 可解释性警告。
- [Dive into Deep Learning — Bahdanau Attention](https://d2l.ai/chapter_attention-mechanisms-and-transformers/bahdanau-attention.html) — 可运行的 PyTorch 教程。

---

## 自测题

:::quiz
question: Bahdanau 注意力解决了 seq2seq 中的什么问题？
options:
  - 分词不匹配
  - 定长上下文向量瓶颈——解码器只能看到编码器的最终状态
  - 编码器中的梯度消失
  - 束搜索延迟
correct: 1
explanation: 注意力让解码器能查阅编码器的每个状态，而不仅仅是最后一个。
:::

:::quiz
question: 解码器步骤 t 时的注意力上下文向量是什么？
options:
  - 解码器的输入嵌入
  - 编码器隐藏状态的加权平均，权重来自查询-键打分
  - 编码器的最终隐藏状态
  - 随机投影
correct: 1
explanation: 上下文 = alpha_i * h_i 的求和，是编码器状态的逐步加权平均。
:::

:::quiz
question: 在 Bahdanau（加性）注意力中，向量 v_a 起什么作用？
options:
  - 控制 dropout
  - 把注意力维度的隐藏组合投影成每个编码器位置的标量分数
  - 编码位置信息
  - 给 softmax 加偏置
correct: 1
explanation: v_a 和 tanh(W_a s + U_a h) 做点积，把一个 d_attn 维向量压缩成标量分数。
:::

:::quiz
question: Luong 的 'dot' 注意力变体有什么硬性约束？
options:
  - 解码器状态和编码器状态必须维度相同（d_s == d_h）
  - 编码器必须是双向的
  - softmax 必须用对数空间
  - 需要束搜索
correct: 0
explanation: dot 用 s^T h 不带投影矩阵，所以维度必须完全匹配。
:::

:::quiz
question: 哪种 Q/K/V 映射描述的是经典（Bahdanau/Luong）注意力？
options:
  - Q、K、V 是源序列的三个独立学习投影
  - Q 随机，K 和 V 是学习得到的
  - Q 来自编码器，K 和 V 来自解码器
  - Q = 解码器状态；K 和 V = 编码器状态（同一个张量）
correct: 3
explanation: 在经典注意力中，键和值都是编码器状态；Transformer 通过学习投影把 K 和 V 分开。
:::

:::quiz
question: 为什么把原始注意力权重当"解释"报告被认为是脆弱的？
options:
  - 注意力权重泄漏标签
  - 它们太小画不出来
  - 研究（如 Jain and Wallace, 2019）表明在某些任务上注意力分布可以被打乱替换而不影响预测
  - 注意力权重不可微
correct: 2
explanation: 注意力权重和预测相关，但如果没有消融/反事实检查，不能作为推理的忠实解释。
:::

:::quiz
question: 哪一步把 Bahdanau 注意力桥接到了 Transformer 的自注意力？
options:
  - 去掉束搜索
  - 加更多 RNN 层
  - 用 sigmoid 替换 softmax
  - 让序列查询自身，用单独学习的 Q、K、V 投影，并行多头运行
correct: 3
explanation: 自注意力让同一个序列查询自身，K 和 V 用不同投影，跨多头并行。
:::

:::quiz
question: 注意力中掩码（masking）的一个实际用途是什么？
options:
  - 替代 dropout
  - 把 padding token 的注意力权重设为零，使其不贡献到上下文向量
  - 编码位置
  - 减小模型大小
correct: 1
explanation: 对 padding（或解码器中的未来 token）做掩码，防止 softmax 把权重分到无效位置上。
:::



---
title: "位置编码（Positional Encoding）——正弦、RoPE、ALiBi"
chapter: 4
readTime: 45
description: "注意力机制对顺序完全不敏感。\"The cat sat on the mat\" 和 \"mat the on sat cat the\" 在没有位置信号的情况下产生完全相同的输出。3 种算法修复了这个问题——每种对\"位置\"的定义下了不同的赌注。"
---
> 注意力机制对顺序完全不敏感。"The cat sat on the mat" 和 "mat the on sat cat the" 在没有位置信号的情况下产生完全相同的输出。3 种算法修复了这个问题——每种对"位置"的定义下了不同的赌注。






## 问题在哪

缩放点积注意力（Scaled dot-product attention）对顺序视而不见。注意力矩阵 `softmax(Q K^T / √d) V` 靠的是两两之间的相似度。把 `X` 的行打乱，输出的行也只是跟着打乱。注意力机制内部根本不关心位置。

对词袋模型来说这不算 bug。但对语言、代码、音频、视频——任何顺序承载意义的东西——这是致命的。

修复方法是想办法把位置注入到嵌入（Embedding）里。3 个时代的答案：

1. **绝对正弦编码（Absolute sinusoidal）**（Vaswani 2017）。把 `sin/cos` 的位置信号加到嵌入向量上。简单、无需学习参数，但外推到训练长度之外效果很差。
2. **RoPE——旋转位置嵌入（Rotary Position Embeddings）**（Su 2021）。按照与位置成比例的角度旋转 Q 和 K 向量。直接在点积中编码*相对*位置。2026 年的主流。
3. **ALiBi——线性偏置注意力（Attention with Linear Biases）**（Press 2022）。完全跳过嵌入；根据距离给注意力分数加一个逐头的线性惩罚。长度外推效果优秀。

截至 2026 年，几乎所有前沿开源模型都用 RoPE：Llama 2/3/4、Qwen 2/3、Mistral、Mixtral、DeepSeek-V3、Kimi。少数长上下文模型用 ALiBi 或其现代变体。绝对正弦编码已经成为历史。

## 核心概念

![正弦绝对编码 vs RoPE 旋转 vs ALiBi 距离偏置](../assets/positional-encoding.svg)

### 绝对正弦编码（Absolute sinusoidal）

预计算一个固定矩阵 `PE`，形状为 `(max_len, d_model)`：

```
PE[pos, 2i]   = sin(pos / 10000^(2i / d_model))
PE[pos, 2i+1] = cos(pos / 10000^(2i / d_model))
```

然后在注意力之前 `X' = X + PE[:N]`。每个维度是一个不同频率的正弦波。模型学会从相位模式中读取位置信息。超过 `max_len` 就完蛋：没有人告诉模型位置 2048 该是什么样子，而它只见过位置 0–2047。

### RoPE

旋转 Q 和 K 向量（不是嵌入向量）。对于每对维度 `(2i, 2i+1)`：

```
[q'_2i    ]   [ cos(pos·θ_i)  -sin(pos·θ_i) ] [q_2i   ]
[q'_2i+1  ] = [ sin(pos·θ_i)   cos(pos·θ_i) ] [q_2i+1 ]

θ_i = base^(-2i / d_head),  base = 10000 by default
```

对 K 也施加同样的旋转，用位置 `pos_k`。点积 `q'_m · k'_n` 变成只和 `(m - n)` 有关的函数。也就是说：**注意力分数只取决于相对距离**，尽管旋转是用绝对位置算的。漂亮的把戏。

扩展 RoPE：可以缩放 `base`（NTK-aware、YaRN、LongRoPE）来外推到更长的上下文，无需重新训练。Llama 3 就是这样从 8K 扩展到 128K 上下文的。

### ALiBi

跳过嵌入那一套。直接偏置注意力分数：

```
attn_score[i, j] = (q_i · k_j) / √d  -  m_h · |i - j|
```

其中 `m_h` 是每个头特有的斜率（例如 `1 / 2^(8·h/H)`）。距离近的 token 得到加成；远的被惩罚。没有训练开销。论文表明长度外推效果超过正弦编码，在原始训练长度上与 RoPE 持平。

### 2026 年该选哪个

| 变体 | 外推能力 | 训练开销 | 使用者 |
|------|---------|---------|--------|
| 绝对正弦编码（Absolute sinusoidal） | 差 | 无 | 原始 Transformer、早期 BERT |
| 可学习绝对编码（Learned absolute） | 无 | 极小 | GPT-2、GPT-3 |
| RoPE | 好（需缩放） | 无 | Llama 2/3/4、Qwen 2/3、Mistral、DeepSeek-V3、Kimi |
| RoPE + YaRN | 优秀 | 微调阶段 | Qwen2-1M、Llama 3.1 128K |
| ALiBi | 优秀 | 无 | BLOOM、MPT、Baichuan |

RoPE 胜出的原因：它直接嵌入注意力而不改变架构，编码相对位置，而且它的 `base` 超参数为长上下文微调提供了一个干净的调节旋钮。

## 动手搭

### 第 1 步：正弦编码

参见 `code/main.py`。4 行搞定：

```python
def sinusoidal(N, d):
    pe = [[0.0] * d for _ in range(N)]
    for pos in range(N):
        for i in range(d // 2):
            theta = pos / (10000 ** (2 * i / d))
            pe[pos][2 * i]     = math.sin(theta)
            pe[pos][2 * i + 1] = math.cos(theta)
    return pe
```

在第一个注意力层之前把它加到嵌入矩阵上。

### 第 2 步：RoPE 作用于 Q、K

RoPE 对 Q 和 K 就地操作。对每对维度：

```python
def apply_rope(x, pos, base=10000):
    d = len(x)
    out = list(x)
    for i in range(d // 2):
        theta = pos / (base ** (2 * i / d))
        c, s = math.cos(theta), math.sin(theta)
        a, b = x[2 * i], x[2 * i + 1]
        out[2 * i]     = a * c - b * s
        out[2 * i + 1] = a * s + b * c
    return out
```

关键：对位置 `m` 的 Q 和位置 `n` 的 K 施加同样的函数。它们的点积会在每对坐标上产生一个 `cos((m-n)·θ_i)` 因子。注意力免费学到了相对位置。

### 第 3 步：ALiBi 斜率和偏置

```python
def alibi_bias(n_heads, seq_len):
    # slope_h = 2 ** (-8 * h / n_heads) for h = 1..n_heads
    slopes = [2 ** (-8 * (h + 1) / n_heads) for h in range(n_heads)]
    bias = []
    for m in slopes:
        row = [[-m * abs(i - j) for j in range(seq_len)] for i in range(seq_len)]
        bias.append(row)
    return bias  # add to attention scores before softmax
```

把 `bias[h]` 加到第 `h` 个头的 `(seq_len, seq_len)` 注意力分数矩阵上，然后再 softmax。

### 第 4 步：验证 RoPE 的相对距离性质

随机取两个向量 `a, b`。按 `(pos_a, pos_b)` 旋转。再按 `(pos_a + k, pos_b + k)` 旋转。两次点积在浮点误差内必须相等。这个性质就是 RoPE 的全部精髓——它对绝对偏移不变，只有相对间距才重要。

## 怎么用

PyTorch 2.5+ 在 `torch.nn.functional` 中提供了 RoPE 工具函数。大多数生产代码用 `flash_attn` 或 `xformers`，RoPE 在注意力 kernel 内部完成。

```python
from transformers import AutoModel
model = AutoModel.from_pretrained("meta-llama/Llama-3.2-3B")
# model.config.rope_scaling → {"type": "yarn", "factor": 32.0, "original_max_position_embeddings": 8192}
```

**2026 年的长上下文技巧：**

- **NTK-aware 插值（NTK-aware interpolation）。** 从 4K 扩展到 16K+ 时，把 `base` 缩放为 `base * (scale_factor)^(d/(d-2))`。
- **YaRN。** 更聪明的插值方式，在长上下文上保持注意力熵（Attention entropy）。Llama 3.1 128K 用的就是它。
- **LongRoPE。** 微软 2024 年的方法，用进化搜索（Evolutionary search）为每个维度挑选缩放因子。Phi-3-Long 用的就是它。
- **位置插值（Position interpolation）+ 微调。** 把位置除以扩展因子然后微调 1–5B token。出人意料地好使。

## 交付件

参见 `outputs/skill-positional-encoding-picker.md`。这个 skill 根据目标上下文长度、外推需求和训练预算，为新模型选择编码策略。

## 练习

1. **简单。** 把正弦 `PE` 矩阵画成热力图，`max_len=512, d=128`。确认"随着维度索引增大，条纹越来越宽"的模式。
2. **中等。** 实现 NTK-aware RoPE 缩放。用长度 256 的序列训练一个小型语言模型，然后在长度 1024 上测试（有缩放 vs 无缩放）。对比困惑度（Perplexity）。
3. **困难。** 在同一个注意力模块里同时实现 ALiBi 和 RoPE。用长度 512 的复制任务训练一个 4 层 Transformer。测试时外推到 2048。对比退化程度。

## 关键术语

| 术语 | 通俗说法 | 实际含义 |
|------|---------|---------|
| 位置编码（Positional encoding） | "告诉注意力顺序信息" | 加到嵌入或注意力上的任何编码位置的信号。 |
| 正弦编码（Sinusoidal） | "最初那个" | 几何频率的 `sin/cos` 加到嵌入上；不能外推。 |
| RoPE | "旋转嵌入（Rotary embeddings）" | 按位置相关的角度旋转 Q、K；点积编码相对距离。 |
| ALiBi | "线性偏置（Linear bias）技巧" | 给注意力分数加 `-m·|i-j|`；不需要嵌入，外推极佳。 |
| base | "RoPE 的旋钮" | RoPE 中的频率缩放器；增大它可以在推理时扩展上下文。 |
| NTK-aware | "一种 RoPE 缩放技巧" | 缩放 `base` 使得上下文扩展时高频维度不被挤压。 |
| YaRN | "高级那个" | 逐维度的插值+外推，保持注意力熵不变。 |
| 外推（Extrapolation） | "超出训练长度还能用" | 位置编码方案能否在超过训练时 `max_len` 后仍给出正确输出？ |

## 延伸阅读

- [Vaswani et al. (2017). Attention Is All You Need §3.5](https://arxiv.org/abs/1706.03762) —— 原始正弦编码。
- [Su et al. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864) —— RoPE 论文。
- [Press, Smith, Lewis (2021). Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation](https://arxiv.org/abs/2108.12409) —— ALiBi。
- [Peng et al. (2023). YaRN: Efficient Context Window Extension of Large Language Models](https://arxiv.org/abs/2309.00071) —— 当前最先进的 RoPE 缩放。
- [Chen et al. (2023). Extending Context Window of Large Language Models via Positional Interpolation](https://arxiv.org/abs/2306.15595) —— Meta 的 Llama 2 长上下文论文。
- [Ding et al. (2024). LongRoPE: Extending LLM Context Window Beyond 2 Million Tokens](https://arxiv.org/abs/2402.13753) —— 微软的方法，Phi-3-Long 用的就是它。
- [HuggingFace Transformers — `modeling_rope_utils.py`](https://github.com/huggingface/transformers/blob/main/src/transformers/modeling_rope_utils.py) —— 所有 RoPE 缩放方案的生产级实现（default、linear、dynamic、YaRN、LongRoPE、Llama-3）。

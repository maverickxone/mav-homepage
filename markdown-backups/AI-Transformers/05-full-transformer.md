---
title: "完整的 Transformer — 编码器 + 解码器"
chapter: 5
readTime: 75
description: "注意力（Attention）是主角。其他一切——残差、归一化、前馈、交叉注意力——都是脚手架，让你能把它叠得很深。"
---
> 注意力（Attention）是主角。其他一切——残差、归一化、前馈、交叉注意力——都是脚手架，让你能把它叠得很深。






## 要解决的问题

单独一层注意力（Attention）是特征提取器，不是模型。每层只做一次矩阵乘法，容量远远不够处理语言。你需要深度——而深度如果没有正确的"管道"就会崩掉。

2017 年 Vaswani 的论文把六个设计决策打包在一起，把一层注意力变成了可堆叠的模块（Block）。此后所有的 Transformer——纯编码器（Encoder-only，BERT）、纯解码器（Decoder-only，GPT）、编码器-解码器（Encoder-Decoder，T5）——都继承了同一副骨架。到 2026 年模块已经被打磨过（RMSNorm、SwiGLU、Pre-norm、RoPE），但骨架一模一样。

这节课讲的就是骨架。后面的课把它特化——06 讲编码器，07 讲解码器，08 讲编码器-解码器。

## 核心概念

![编码器和解码器模块内部接线图](../assets/full-transformer.svg)

### 六大组件

1. **嵌入（Embedding）+ 位置信号（Positional Signal）。** 词元（Token）→ 向量。位置信息通过 RoPE（现代做法）或正弦函数（经典做法）注入。
2. **自注意力（Self-Attention）。** 每个位置关注其他所有位置。解码器中加掩码（Mask）。
3. **前馈网络（FFN）。** 逐位置的两层 MLP：`W_2 · activation(W_1 · x)`。默认扩展倍数 4×。
4. **残差连接（Residual Connection）。** `x + sublayer(x)`。没有它，梯度过约 6 层就消失了。
5. **层归一化（Layer Normalization）。** `LayerNorm` 或 `RMSNorm`（现代做法）。稳定残差流。
6. **交叉注意力（Cross-Attention，仅解码器）。** Query 来自解码器，Key 和 Value 来自编码器输出。

### 编码器模块（Encoder Block）（用于 BERT、T5 编码器）

```
x → LN → MHA(self) → + → LN → FFN → + → out
                     ^              ^
                     |              |
                     └── residual ──┘
```

编码器是双向的。没有掩码。所有位置都能看到所有位置。

### 解码器模块（Decoder Block）（用于 GPT、T5 解码器）

```
x → LN → MHA(masked self) → + → LN → MHA(cross to encoder) → + → LN → FFN → + → out
```

解码器每个模块有三个子层。中间那个——交叉注意力——是信息从编码器流向解码器的唯一通道。在纯解码器架构（GPT）中，交叉注意力被省略，只剩下带掩码的自注意力 + FFN。

### 前归一化（Pre-norm）vs 后归一化（Post-norm）

原始论文：`x + sublayer(LN(x))` vs `LN(x + sublayer(x))`。后归一化在 2019 年左右失宠——它在深层训练时没有精心的 warmup 很难收敛。前归一化（`LN` 放在子层*之前*）是 2026 年的默认选项：Llama、Qwen、GPT-3+、Mistral 都用它。

### 2026 年的现代化模块

Vaswani 2017 用的是 LayerNorm + ReLU。现代堆栈把两者都换了。生产环境的模块实际长这样：

| 组件 | 2017 | 2026 |
|------|------|------|
| 归一化（Normalization） | LayerNorm | RMSNorm |
| FFN 激活函数 | ReLU | SwiGLU |
| FFN 扩展倍数 | 4× | 2.6×（SwiGLU 用三个矩阵，总参数量不变） |
| 位置编码（Position） | 正弦绝对位置 | RoPE |
| 注意力（Attention） | 完整 MHA | GQA（或 MLA） |
| 偏置项（Bias） | 有 | 无 |

RMSNorm 去掉了 LayerNorm 中的去均值步骤（少一次减法），省计算量，实验表明稳定性至少一样好。SwiGLU（`Swish(W1 x) ⊙ W3 x`）在 Llama、PaLM 和 Qwen 的论文中稳定比 ReLU/GELU FFN 好约 0.5 个困惑度点（ppl）。

### 参数量计算

对于一个模块，`d_model = d`，FFN 扩展倍数 `r`：

- MHA：`4 · d²`（Q、K、V、O 投影）
- FFN（SwiGLU）：`3 · d · (r · d)` ≈ `3rd²`
- 归一化层：可忽略

当 `d = 4096, r = 2.6, layers = 32`（大致是 Llama 3 8B）时，总计：`32 · (4·4096² + 3·2.6·4096²) ≈ 32 · (16 + 32) M = ~1.5B 参数/层 × 32 ≈ 7B`（加上嵌入层和输出头）。和公开数据吻合。

## 动手搭建

### 第 1 步：基础组件

使用第 03 课的小型 `Matrix` 类（为了独立性已复制到本文件）：

- `layer_norm(x, eps=1e-5)` — 减均值，除以标准差。
- `rms_norm(x, eps=1e-6)` — 除以 RMS。不减均值。
- `gelu(x)` 和 `silu(x) * W3 x`（SwiGLU）。
- `ffn_swiglu(x, W1, W2, W3)`。
- `encoder_block(x, params)` 和 `decoder_block(x, enc_out, params)`。

完整接线见 `code/main.py`。

### 第 2 步：搭一个 2 层编码器 + 2 层解码器

把它们堆起来。编码器的输出传入每一层解码器的交叉注意力。在输出投影之前加一个最终 LN。

```python
def encode(tokens, params):
    x = embed(tokens, params.emb) + sinusoidal(len(tokens), params.d)
    for block in params.encoder_blocks:
        x = encoder_block(x, block)
    return x

def decode(target_tokens, encoder_out, params):
    x = embed(target_tokens, params.emb) + sinusoidal(len(target_tokens), params.d)
    for block in params.decoder_blocks:
        x = decoder_block(x, encoder_out, block)
    return x
```

### 第 3 步：跑一个玩具示例的前向传播

输入 6 个词元的源序列和 5 个词元的目标序列。验证输出形状是 `(5, vocab)`。不做训练——这节课讲的是架构，不是损失函数。

### 第 4 步：换上 RMSNorm + SwiGLU

把 LayerNorm 和 ReLU-FFN 替换成 RMSNorm 和 SwiGLU。确认形状仍然匹配。这就是 2026 年的现代化——只需替换一个函数。

## 实际应用

PyTorch/TF 的参考实现：`nn.TransformerEncoderLayer`、`nn.TransformerDecoderLayer`。但 2026 年大多数生产代码都是自己写模块，因为：

- Flash Attention 在注意力内部调用，不走 `nn.MultiheadAttention`。
- GQA / MLA 不在标准库参考实现里。
- RoPE、RMSNorm、SwiGLU 不是 PyTorch 的默认选项。

HuggingFace `transformers` 有干净的参考模块值得读：`modeling_llama.py` 是 2026 年标杆级的纯解码器模块。大约 500 行，值得完整走一遍。

**编码器 vs 解码器 vs 编码器-解码器——怎么选：**

| 需求 | 选择 | 例子 |
|------|------|------|
| 分类、嵌入、文本问答 | 纯编码器（Encoder-only） | BERT、DeBERTa、ModernBERT |
| 文本生成、聊天、代码、推理 | 纯解码器（Decoder-only） | GPT、Llama、Claude、Qwen |
| 结构化输入 → 结构化输出（翻译、摘要） | 编码器-解码器（Encoder-Decoder） | T5、BART、Whisper |

纯解码器赢了语言赛道，因为它扩展性最干净，同时能处理理解和生成。编码器-解码器在输入有明确"源序列"身份时仍然最优（翻译、语音识别、结构化任务）。

## 交付产物

见 `outputs/skill-transformer-block-reviewer.md`。这个技能（Skill）会审查一个新的 Transformer 模块实现是否符合 2026 年的默认配置，并标出缺失的部分（Pre-norm、RoPE、RMSNorm、GQA、FFN 扩展倍数）。

## 练习

1. **简单。** 计算你的 encoder_block 在 `d_model=512, n_heads=8, ffn_expansion=4, swiglu=True` 时的参数量。实现该模块并用 `sum(p.numel() for p in block.parameters())` 验证。
2. **中等。** 从后归一化切换到前归一化。初始化两者，在随机输入上堆叠 12 层后测量激活值的范数。后归一化的激活应该爆炸；前归一化的应该保持有界。
3. **困难。** 在一个玩具"反转复制"任务（把 `x` 反转后输出）上实现 4 层编码器-解码器。训练 100 步，记录损失。换上 RMSNorm + SwiGLU + RoPE——损失是否下降？

## 关键术语

| 术语 | 口语化说法 | 真正的含义 |
|------|-----------|-----------|
| 模块（Block） | "一个 Transformer 层" | 归一化 + 注意力 + 归一化 + FFN 的堆叠，外面包着残差连接。 |
| 残差（Residual） | "跳跃连接" | `x + f(x)` 的输出；让梯度能流过深层堆叠。 |
| 前归一化（Pre-norm） | "归一化放前面，不是后面" | 现代做法：`x + sublayer(LN(x))`。不需要 warmup 体操就能训得很深。 |
| RMSNorm | "不减均值的 LayerNorm" | 除以 RMS；少一步运算，实验稳定性一样。 |
| SwiGLU | "大家都换过去的 FFN" | `Swish(W1 x) ⊙ W3 x → W2`。在语言模型困惑度上稳赢 ReLU/GELU。 |
| 交叉注意力（Cross-Attention） | "解码器怎么看到编码器" | Q 来自解码器、K/V 来自编码器输出的 MHA。 |
| FFN 扩展倍数（FFN Expansion） | "中间 MLP 有多宽" | 隐藏层大小与 d_model 的比值，通常 4（LayerNorm）或 2.6（SwiGLU）。 |
| 无偏置（Bias-free） | "去掉 +b 项" | 现代堆栈在线性层中省略偏置；困惑度略有改善，模型更小。 |

## 延伸阅读

- [Vaswani et al. (2017). Attention Is All You Need](https://arxiv.org/abs/1706.03762) — 原始模块规范。
- [Xiong et al. (2020). On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745) — 为什么前归一化在深层时优于后归一化。
- [Zhang, Sennrich (2019). Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467) — RMSNorm。
- [Shazeer (2020). GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202) — SwiGLU 论文。
- [HuggingFace `modeling_llama.py`](https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama/modeling_llama.py) — 标杆级 2026 纯解码器模块。

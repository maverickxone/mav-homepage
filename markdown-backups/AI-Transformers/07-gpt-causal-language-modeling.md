---
title: "GPT — 因果语言建模（Causal Language Modeling）"
chapter: 7
readTime: 75
description: "BERT 能看到两边，GPT 只能看到过去。那个三角形掩码（triangle mask）是现代 AI 里影响最深远的一行代码。"
---
> BERT 能看到两边，GPT 只能看到过去。那个三角形掩码（triangle mask）是现代 AI 里影响最深远的一行代码。






## 问题是什么

语言模型（Language Model）回答一个问题：给定前 `t-1` 个词元（token），第 `t` 个词元的概率分布是什么？用这个信号——下一词元预测（next-token prediction）——来训练，你就能得到一个可以逐词元生成任意文本的模型。

要在一整个序列上端到端并行训练，你需要让每个位置的预测只依赖于更早的位置。否则模型会作弊——直接看到答案。

因果掩码（causal mask）就是干这个的。它是一个上三角矩阵，里面填满 `-inf`，在 softmax 之前加到注意力分数上。softmax 之后那些位置就变成 0 了。每个位置只能关注自己和之前的位置。而且因为你对整个序列只做一次，你就能在一次前向传播中得到 N 个并行的下一词元预测。

GPT-1（2018）、GPT-2（2019）、GPT-3（2020）、GPT-4（2023）、GPT-5（2024）、Claude、Llama、Qwen、Mistral、DeepSeek、Kimi——它们全都是仅解码器因果 Transformer（decoder-only causal transformer），核心循环一模一样。只是更大、数据更好、RLHF 更好。

## 核心概念

![因果掩码生成三角形注意力矩阵](../assets/causal-attention.svg)

### 掩码（Mask）

给定长度为 `N` 的序列，构建一个 `N × N` 矩阵：

```
M[i, j] = 0       if j <= i
M[i, j] = -inf    if j > i
```

在 softmax 之前把 `M` 加到原始注意力分数上。`exp(-inf) = 0`，所以被掩盖的位置贡献零权重。注意力矩阵的每一行都是一个只覆盖之前位置的概率分布。

实现成本：一个 `torch.tril()` 调用。计算时间：纳秒级。对这个领域的影响：一切。

### 并行训练，串行推理

训练：把整个 `(N, d_model)` 序列做一次前向传播，计算 N 个交叉熵损失（每个位置一个），求和，反向传播。沿序列维度并行。这就是 GPT 训练能扩展的原因——你可以在一次 GPU pass 中处理一个 batch 里的 100 万个词元。

推理：你逐词元生成。输入 `[t1, t2, t3]`，得到 `t4`。输入 `[t1, t2, t3, t4]`，得到 `t5`。输入 `[t1, t2, t3, t4, t5]`，得到 `t6`。KV 缓存（KV cache，第 12 课）保存了 `t1…tn` 的隐藏状态，这样你就不用每步都重新计算它们。但推理的串行深度 = 输出长度。这就是自回归税（autoregressive tax），也是每个大语言模型（LLM）的延迟瓶颈所在。

### 损失函数——错位一位（Shift-by-One）

给定词元 `[t1, t2, t3, t4]`：

- 输入：`[t1, t2, t3]`
- 目标：`[t2, t3, t4]`

对每个位置 `i`，计算 `-log P(target_i | inputs[:i+1])`。求和。这就是整个序列的交叉熵（cross-entropy）。

你听过的每个 Transformer 语言模型都在这个损失上训练。预训练（pre-training）、微调（fine-tuning）、有监督微调（SFT）——同一个损失，不同的数据。

### 解码策略（Decoding Strategies）

训练完之后，采样策略的选择比很多人以为的更重要。

| 方法 | 做了什么 | 什么时候用 |
|------|----------|-----------|
| 贪心（Greedy） | 每步取 argmax | 确定性任务、代码补全 |
| 温度（Temperature） | logits 除以 T，然后采样 | 创意任务，T 越高多样性越强 |
| Top-k | 只从概率最高的 k 个词元中采样 | 砍掉低概率长尾 |
| Top-p（核采样，Nucleus） | 从累积概率 ≥ p 的最小集合中采样 | 2020 年后的默认选择；能适应分布形状 |
| Min-p | 保留满足 `p > min_p * max_p` 的词元 | 2024 年后；比 top-p 更擅长拒绝长尾 |
| 推测解码（Speculative Decoding） | 小模型草拟 N 个词元，大模型并行验证 | 延迟降低 2-3 倍，质量不变 |

到 2026 年，min-p + temperature 0.7 对开源模型来说是一个合理的默认配置。推测解码（speculative decoding）是任何生产级推理栈的标配。

### 为什么"GPT 配方"奏效了

1. **仅解码器（Decoder-only）。** 没有编码器开销。每一层就是一次注意力 + FFN。
2. **规模扩展（Scaling）。** 124M → 1.5B → 175B → 万亿参数。Chinchilla 缩放定律（第 13 课）告诉你怎么花计算量。
3. **上下文学习（In-context Learning）。** 在 6B-13B 左右涌现。模型不需要微调就能跟着少样本示例做事。
4. **RLHF。** 基于人类偏好的后训练，把原始预训练文本转变成了聊天助手。
5. **Pre-norm + RoPE + SwiGLU。** 大规模训练的稳定性保障。

核心架构从 GPT-2 以来没怎么变过。所有有意思的进展都发生在数据、规模和后训练上。

## 动手搭建

### 第 1 步：因果掩码

见 `code/main.py`。一行搞定：

```python
def causal_mask(n):
    return [[0.0 if j <= i else float("-inf") for j in range(n)] for i in range(n)]
```

在 softmax 之前把它加到注意力分数上。整个机制就这些。

### 第 2 步：一个 2 层 GPT 风格模型

堆叠两个解码器块（decoder block）：掩码自注意力（masked self-attention）+ FFN，没有交叉注意力（cross-attention）。加上词元嵌入（token embedding）、位置编码（positional encoding），以及一个反嵌入层（unembedding，和词元嵌入矩阵共享权重——这是 GPT-2 以来的标准技巧）。

### 第 3 步：端到端的下一词元预测

在一个 20 词元的玩具词表上，产出每个位置的 logits。用错位一位的目标计算交叉熵损失。不做梯度——这只是一个前向传播的健全性检查。

### 第 4 步：采样

实现贪心（greedy）、温度（temperature）、top-k、top-p、min-p。在一个固定提示上运行每种策略，比较输出。一个采样函数就 10 行。

## 实际使用

PyTorch，2026 年写法：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B-Instruct")
tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-3B-Instruct")

prompt = "Attention is all you need because"
inputs = tok(prompt, return_tensors="pt")
out = model.generate(
    **inputs,
    max_new_tokens=64,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
)
print(tok.decode(out[0]))
```

底层，`generate()` 执行前向传播，取最后位置的 logits，采样下一个词元，追加，然后重复。每个生产级 LLM 推理栈（vLLM、TensorRT-LLM、llama.cpp、Ollama、MLX）都实现了同样的循环，加上大量优化——批量预填充（batched prefill）、连续批处理（continuous batching）、KV 缓存分页（KV cache paging）、推测解码（speculative decoding）。

**GPT vs BERT，各一句话：** GPT 预测 `P(x_t | x_{<t})`。BERT 预测 `P(x_masked | x_unmasked)`。损失函数决定了模型能不能生成。

## 落地应用

见 `outputs/skill-sampling-tuner.md`。这个技能为新的生成任务选择采样参数，并在需要确定性解码时发出提示。

## 练习

1. **简单。** 运行 `code/main.py`，验证因果注意力矩阵在 softmax 之后是下三角的。抽查：第 3 行应该只在第 0-3 列有权重。
2. **中等。** 实现宽度为 4 的束搜索（beam search）。在 10 个短提示上比较 beam-4 和贪心的困惑度（perplexity）。束搜索总是赢吗？（提示：翻译任务通常是的，但开放式对话不一定。）
3. **困难。** 实现推测解码（speculative decoding）：用一个 2 层小模型当草稿模型，一个 6 层模型当验证者。在 100 个长度为 64 的补全上测量墙钟加速比。确认输出与验证者的贪心解码一致。

## 关键术语

| 术语 | 大家怎么说 | 实际意思 |
|------|-----------|---------|
| 因果掩码（Causal Mask） | "那个三角形" | 上三角 `-inf` 矩阵，加到注意力分数上，让位置 `i` 只能看到位置 `≤ i`。 |
| 下一词元预测（Next-token Prediction） | "那个损失" | 模型对每个位置的分布与真实下一个词元之间的交叉熵。 |
| 自回归（Autoregressive） | "一个一个生成" | 把输出反馈为输入；只有训练时并行，生成时不行。 |
| Logits | "softmax 之前的分数" | LM head 在 softmax 之前的原始输出；采样作用在这上面。 |
| 温度（Temperature） | "创意旋钮" | logits 除以 T；T→0 = 贪心，T→∞ = 均匀分布。 |
| Top-p | "核采样（Nucleus Sampling）" | 截断分布到累积和 ≥p 的最小集合；从剩余部分采样。 |
| Min-p | "比 top-p 更好" | 保留 `p ≥ min_p × max_p` 的词元；截断阈值能适应分布的尖锐程度。 |
| 推测解码（Speculative Decoding） | "草稿 + 验证" | 小模型提议 N 个词元；大模型并行验证。 |
| 教师强制（Teacher Forcing） | "训练技巧" | 训练时输入真实的前一个词元，而不是模型自己的预测。所有 seq2seq 语言模型的标准做法。 |

## 延伸阅读

- [Radford et al. (2018). Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf) — GPT-1。
- [Radford et al. (2019). Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) — GPT-2。
- [Brown et al. (2020). Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165) — GPT-3 与上下文学习（in-context learning）。
- [Leviathan, Kalman, Matias (2023). Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192) — 推测解码论文。
- [HuggingFace `modeling_llama.py`](https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama/modeling_llama.py) — 因果语言模型的标准参考代码。

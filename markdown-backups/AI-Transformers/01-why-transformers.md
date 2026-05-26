---
title: "为什么是 Transformer——RNN 的三大致命伤"
chapter: 1
readTime: 45
description: "RNN 一次处理一个 token，Transformer 一次处理所有 token。这个架构赌注改变了 2017 年之后深度学习的全部 scaling 曲线。"
---

> RNN 一次处理一个 token，Transformer 一次处理所有 token。这个架构赌注改变了 2017 年之后深度学习（Deep Learning）的全部 scaling 曲线。






## 为什么要学这个

2017 年之前，地球上所有顶级序列模型——语言、翻译、语音——全是循环神经网络（Recurrent Neural Network, RNN）。LSTM 和 GRU 在翻译 benchmark 上统治了整整五年，是当时唯一能用的工具。

但它们有三个致命弱点。

**串行计算**意味着你没法在时间轴上并行：token `t+1` 需要 token `t` 的隐藏状态。一段 1024 token 的序列意味着 1024 次串行步骤——跑在一块每周期能做 1,000,000 次浮点运算的 GPU 上。训练时间随序列长度线性增长，而硬件天生就是为并行设计的。

**梯度消失**意味着 50 个 token 之前的信息已经被压过了 50 层非线性变换。门控循环单元（LSTM、GRU）缓解了压缩但从没消除过。长距离依赖——"我去年夏天在飞京都的飞机上读的那本书是……"——经常搞砸。

**定宽隐藏状态**意味着编码器在解码器看到任何东西之前，把整段源序列挤进一个固定维度的向量。不管源序列是 5 个 token 还是 500 个，瓶颈形状一模一样。

2017 年的论文 "Attention Is All You Need" 提出了一个激进方案：彻底丢弃循环。让每个位置同时关注所有其他位置。用一个大矩阵乘法训练，而不是 1024 次串行运算。

结果到 2026 年统治了所有模态。语言（GPT-5、Claude 4、Llama 4）、视觉（ViT、DINOv2、SAM 3）、音频（Whisper）、生物（AlphaFold 3）、机器人（RT-2）。同一种 block，不同输入。

## 核心概念

![RNN 串行计算 vs Transformer 并行注意力](../assets/rnn-vs-transformer.svg)

**循环作为瓶颈。** RNN 计算 `h_t = f(h_{t-1}, x_t)`。每一步依赖上一步。你没法在算完 `h_4` 之前算 `h_5`。在拥有 10,000+ 并行核心的现代 GPU 上，对长序列来说 99% 的算力都在空转。

**注意力作为广播。** 自注意力（Self-Attention）对每一对 `(i, j)` 同时计算 `output_i = sum_j(a_ij * v_j)`。整个 N×N 注意力矩阵在一次批量矩阵乘法中填满。没有步骤依赖另一个步骤。GPU 最喜欢这种活。

**加速不是常数倍。** 这是 `O(N)` 串行深度和 `O(1)` 串行深度之间的差距。实际上，在 N=512、相同硬件条件下，Transformer 每个 epoch 训练快 5–10 倍，而且差距随序列长度扩大——直到你撞上注意力的 `O(N²)` 显存墙（Flash Attention 后来修复了这个问题——见第 12 课）。

**Transformer 的代价。** 注意力显存按 `O(N²)` 增长。2K 上下文没问题。128K 上下文就需要滑动窗口、RoPE 外推、Flash Attention 分块、或线性注意力变体。循环在时间和显存上都是 `O(N)`；Transformer 拿时间换显存，再通过并行把时间赢回来。

**归纳偏置的转变。** RNN 假设局部性和时效性。Transformer 什么都不假设——每一对位置都是注意力的候选者。这就是为什么 Transformer 需要更多数据才能训好，但一旦数据够了就能 scale 得更远。Chinchilla（2022）把这点形式化了：给定足够多的 token，相同参数量下 Transformer 永远打得过 RNN。

## 从零实现

这里不做神经网络——我们用数值模拟核心瓶颈，让你在自己笔记本上感受差距。

### 第一步：测量串行深度

见 `code/main.py`。我们写两个函数。一个把序列编码成一条加法链（串行，像 RNN）。一个把它编码成并行归约（广播，像注意力）。同样的数学，不同的依赖图。

```python
def rnn_style(xs):
    h = 0.0
    for x in xs:
        h = 0.9 * h + x   # 没法并行：h 依赖上一个 h
    return h

def attention_style(xs):
    return sum(xs) / len(xs)  # 每个 x 彼此独立
```

我们对长度到 100,000 的序列计时。RNN 版本是 O(N) 且跑在单条 CPU 流水线上。即使在纯 Python 里，注意力风格的归约在长度 ≥ 1,000 时也赢了，因为 Python 的 `sum()` 是 C 实现的，迭代时没有逐步的解释器开销。

### 第二步：数理论操作数

两种算法都做 N 次加法。差别在*依赖深度*：在下一步能开始之前，必须顺序执行的操作有多少。RNN 深度 = N。注意力深度 = 用树形归约是 log(N)，用并行扫描是 1。决定 GPU 时间的是深度，不是操作总数。

### 第三步：长序列经验 scaling

我们打印一张计时表让 O(N) 差距可视化。在 2026 年的 Mac 笔记本上，1000 以下元素的序列快到没法测。100,000 元素就能看到干净的线性扫描。把这个 scale 到 16,384-token 的 Transformer 对比 12 层 LSTM，你就明白为什么 2016 年训练时间是卡脖子的。

## 实战用法

2026 年什么时候还该选 RNN：

| 场景 | 选谁 |
|------|------|
| 流式推理，一次一个 token，显存恒定 | RNN 或状态空间模型（Mamba、RWKV） |
| 超长序列（>1M token），注意力显存爆炸 | 线性注意力、Mamba 2、Hyena |
| 边缘设备，没有矩阵乘法加速器 | 深度可分离 RNN 在 FLOPs/瓦特上仍然赢 |
| 其他所有情况（训练、批量推理、上下文 ≤128K） | Transformer |

状态空间模型（State-Space Model, SSM）如 Mamba 本质上是带结构化参数的 RNN，兼顾了两者的优点：`O(N)` 扫描显存、通过选择性扫描并行训练。它们恢复了 Transformer 90% 的质量，同时长上下文 scaling 更好。2026 年多数前沿实验室训练的是混合 SSM+Transformer 模型（如 Jamba、Samba）——循环没有死，它是一个组件。

## 练习

1. **简单。** 把 `code/main.py` 里的 `rnn_style` 的标量隐藏状态换成长度 64 的向量。重新计时。隐藏状态维度增加后串行开销涨了多少？
2. **中等。** 用纯 Python 实现并行前缀和（Hillis-Steele 扫描）。验证长度 1024 时它和串行扫描产生相同的数值输出。数一下深度。
3. **困难。** 把注意力风格的归约移植到 PyTorch GPU 上。对序列长度从 64 到 65,536 进行扫描计时。画图并解释曲线形状。

## 术语表

| 术语 | 大白话 | 实际含义 |
|------|--------|----------|
| 循环（Recurrence） | "RNN 是串行的" | 第 `t` 步依赖第 `t-1` 步的计算，强制沿时间轴串行执行。 |
| 串行深度（Serial Depth） | "图有多深" | 最长的依赖操作链；即使硬件无限也决定了时钟时间的下界。 |
| 注意力（Attention） | "让 token 互相看" | 加权求和 `sum_j a_ij v_j`，其中 `a_ij` 来自位置 i 和 j 之间的相似度分数。 |
| 上下文窗口（Context Window） | "模型能看多远" | 注意力层能接收的位置数量；二次方显存开销在这里增长。 |
| 归纳偏置（Inductive Bias） | "架构里烤进去的假设" | 对数据长什么样的先验；CNN 假设平移不变性，RNN 假设时效性。 |
| 状态空间模型（State-Space Model） | "有代数撑腰的 RNN" | 通过结构化状态空间矩阵参数化的循环，支持并行训练。 |
| 二次方瓶颈（Quadratic Bottleneck） | "上下文为什么这么贵" | 注意力显存 = `O(N²)` 于序列长度；Flash Attention 隐藏了常数，没改变 scaling。 |

## 延伸阅读

- [Vaswani et al. (2017). Attention Is All You Need](https://arxiv.org/abs/1706.03762) —— 在主流 NLP 中杀死循环的论文。
- [Bahdanau, Cho, Bengio (2014). Neural MT by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473) —— 注意力的诞生地，当时是嫁接在 RNN 上的。
- [Hochreiter, Schmidhuber (1997). Long Short-Term Memory](https://www.bioinf.jku.at/publications/older/2604.pdf) —— LSTM 原始论文，留个档。
- [Gu, Dao (2023). Mamba: Linear-Time Sequence Modeling with Selective State Spaces](https://arxiv.org/abs/2312.00752) —— 现代循环对 Transformer 的回答。

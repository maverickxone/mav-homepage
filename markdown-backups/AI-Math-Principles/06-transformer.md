---
title: "Transformer"
chapter: 6
readTime: 55
description: "从 RNN 的局限到注意力机制，自注意力 QKV 的完整数学推导，多头注意力参数量计算，Transformer 编解码器架构"
---

## 本章导读

Transformer 是当代深度学习最核心的架构——GPT、BERT、Vision Transformer、扩散模型的骨架都是它。它用**注意力机制**完全替代了 RNN 的循环结构，实现了并行计算和对长距离依赖的直接建模。

本章从"为什么需要注意力"开始，完整推导自注意力的数学，手算一个完整的自注意力示例，详解多头注意力的参数量计算，最后拆解整个 Transformer 的编码器-解码器架构。

---

## RNN 的困境

### RNN 基本结构回顾

RNN 按时间步顺序处理序列，每步的隐状态依赖上一步：

$$\boldsymbol{h}_t = f(\boldsymbol{W}_h \boldsymbol{h}_{t-1} + \boldsymbol{W}_x \boldsymbol{x}_t + \boldsymbol{b})$$

输入 $\boldsymbol{x}_1, \boldsymbol{x}_2, \ldots, \boldsymbol{x}_T$ 被逐步"压缩"到最终的隐状态 $\boldsymbol{h}_T$。

### RNN 的三大问题

**1. 长距离依赖困难**

信息只能通过隐状态逐步传递。位置 1 的信息要到达位置 100，必须经过 99 步传递——每步都会衰减（梯度消失）。

数学上：$\frac{\partial \boldsymbol{h}_T}{\partial \boldsymbol{h}_1} = \prod_{t=1}^{T-1} \frac{\partial \boldsymbol{h}_{t+1}}{\partial \boldsymbol{h}_t}$

这个连乘项在 $T$ 很大时要么消失要么爆炸。

**2. 无法并行计算**

$\boldsymbol{h}_t$ 必须等 $\boldsymbol{h}_{t-1}$ 算完才能算——天然的顺序依赖。在 GPU 上无法并行，序列越长训练越慢。

**3. 信息瓶颈**

整个输入序列被压缩到一个固定维度的向量 $\boldsymbol{h}_T$。对于长序列，这个向量不可能携带所有信息——必然有信息损失。

### LSTM 的部分缓解

LSTM 通过**记忆单元** $\boldsymbol{c}_t$ 和**门控机制**缓解梯度消失：

- **遗忘门** $\boldsymbol{f}_t = \sigma(\boldsymbol{W}_f[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t])$：决定丢弃多少旧记忆
- **输入门** $\boldsymbol{i}_t = \sigma(\boldsymbol{W}_i[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t])$：决定写入多少新信息
- **记忆更新** $\boldsymbol{c}_t = \boldsymbol{f}_t \odot \boldsymbol{c}_{t-1} + \boldsymbol{i}_t \odot \tilde{\boldsymbol{c}}_t$
- **输出门** $\boldsymbol{o}_t = \sigma(\boldsymbol{W}_o[\boldsymbol{h}_{t-1}, \boldsymbol{x}_t])$：决定输出多少记忆
- **隐状态** $\boldsymbol{h}_t = \boldsymbol{o}_t \odot \tanh(\boldsymbol{c}_t)$

关键：记忆单元 $\boldsymbol{c}_t$ 有一条"高速公路"——乘以接近 1 的遗忘门可以让信息无损传递很远。

但 LSTM **仍然无法并行**，只是"不那么容易忘"而已。

### 注意力的动机

**能不能让每个位置直接"看到"序列中任意其他位置？** 不需要逐步传递，直接建立任意两点之间的连接——这就是注意力机制。

---

## 注意力机制（Attention）

### 基本框架

注意力可以理解为一种**可微的查字典**操作：

- **Query（查询）**：我在找什么
- **Key（键）**：每个候选有什么"标签"
- **Value（值）**：每个候选的实际内容

给定 query $\boldsymbol{q}$，和 $n$ 个键值对 $\{(\boldsymbol{k}_i, \boldsymbol{v}_i)\}_{i=1}^n$：

1. 计算 query 和每个 key 的**匹配度**（打分）
2. 将打分归一化为**权重**（概率分布）
3. 用权重对 value 做**加权求和**

$$\text{Output} = \sum_{i=1}^n \alpha_i \boldsymbol{v}_i, \quad \text{其中 } \alpha_i = \frac{\text{score}(\boldsymbol{q}, \boldsymbol{k}_i)}{\sum_j \text{score}(\boldsymbol{q}, \boldsymbol{k}_j)}$$

### 前馈注意力（Additive / Bahdanau Attention）

打分函数：
$$e_i = \boldsymbol{w}^T \tanh(\boldsymbol{W}_q \boldsymbol{q} + \boldsymbol{W}_k \boldsymbol{k}_i)$$

归一化：
$$\alpha_i = \text{softmax}(e_i) = \frac{\exp(e_i)}{\sum_{j=1}^n \exp(e_j)}$$

输出：
$$\text{Attention}(\boldsymbol{q}) = \sum_{i=1}^n \alpha_i \boldsymbol{v}_i$$

**缺点**：打分函数包含可学习参数和 tanh，计算量较大。

### 点积注意力（Dot-Product Attention）

$$e_i = \boldsymbol{q}^T \boldsymbol{k}_i$$

直接用内积衡量相似度——计算简单、可用矩阵乘法批量计算。

---

## 自注意力（Self-Attention）

### 核心思想

在前馈注意力中，query 来自一个地方，key/value 来自另一个地方。

在**自注意力**中，query、key、value **全部来自同一个输入序列**——让序列中每个位置都能"看到"其他所有位置。

### QKV 投影

给定输入序列 $\boldsymbol{X} \in \mathbb{R}^{n \times d}$（$n$ 个 token，每个 $d$ 维）：

通过三个独立的线性投影，从同一个输入中生成 Q、K、V：

$$\boldsymbol{Q} = \boldsymbol{X}\boldsymbol{W}_Q \in \mathbb{R}^{n \times d_k}$$
$$\boldsymbol{K} = \boldsymbol{X}\boldsymbol{W}_K \in \mathbb{R}^{n \times d_k}$$
$$\boldsymbol{V} = \boldsymbol{X}\boldsymbol{W}_V \in \mathbb{R}^{n \times d_v}$$

其中 $\boldsymbol{W}_Q, \boldsymbol{W}_K \in \mathbb{R}^{d \times d_k}$，$\boldsymbol{W}_V \in \mathbb{R}^{d \times d_v}$。

**为什么要分别投影？** 直接用 $\boldsymbol{X}$ 同时当 Q/K/V 表达力不够。投影让网络学会"用什么视角去查询"（Q）、"怎么被查询"（K）、"查到后返回什么信息"（V）——三个不同的角色。

### 缩放点积注意力（Scaled Dot-Product Attention）

$$\text{Attention}(\boldsymbol{Q}, \boldsymbol{K}, \boldsymbol{V}) = \text{softmax}\left(\frac{\boldsymbol{Q}\boldsymbol{K}^T}{\sqrt{d_k}}\right)\boldsymbol{V}$$

**分步拆解**：

**Step 1：计算打分矩阵**

$$\boldsymbol{S} = \boldsymbol{Q}\boldsymbol{K}^T \in \mathbb{R}^{n \times n}$$

$S_{ij} = \boldsymbol{q}_i^T \boldsymbol{k}_j$：位置 $i$ 对位置 $j$ 的"关注度"。

**Step 2：缩放**

$$\boldsymbol{S}' = \frac{\boldsymbol{S}}{\sqrt{d_k}}$$

**Step 3：Softmax 归一化（按行）**

$$A_{ij} = \frac{\exp(S'_{ij})}{\sum_{k=1}^n \exp(S'_{ik})}$$

$\boldsymbol{A} \in \mathbb{R}^{n \times n}$ 的每一行是一个概率分布，表示该位置对各位置的注意力权重。

**Step 4：加权聚合 Value**

$$\boldsymbol{Z} = \boldsymbol{A}\boldsymbol{V} \in \mathbb{R}^{n \times d_v}$$

$\boldsymbol{z}_i = \sum_j A_{ij} \boldsymbol{v}_j$：位置 $i$ 的输出是所有 value 的加权组合。

### 为什么除以 $\sqrt{d_k}$

**问题**：当 $d_k$ 很大时，点积 $\boldsymbol{q}^T\boldsymbol{k}$ 的方差也很大。

**分析**：假设 $q_i, k_i$ 独立、均值 0、方差 1：
$$\text{Var}(\boldsymbol{q}^T\boldsymbol{k}) = \text{Var}\left(\sum_{i=1}^{d_k} q_i k_i\right) = \sum_{i=1}^{d_k} \text{Var}(q_i k_i) = d_k$$

当 $d_k = 64$ 时，方差为 64，标准差为 8。这意味着点积值可能很大或很小。

大的点积值输入 softmax 后：
- softmax 接近 one-hot（几乎所有注意力集中在一个位置）
- softmax 梯度趋近于 0（饱和区）→ **训练困难**

除以 $\sqrt{d_k}$ 后方差变为 1，softmax 输入在合理范围内。

---

## 手算自注意力完整示例

### 输入

4 个 token，每个 2 维（$n=4$，$d=2$）：

$$\boldsymbol{X} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \\ 0 & 0 \end{pmatrix}$$

投影矩阵设为单位阵 $\boldsymbol{W}_Q = \boldsymbol{W}_K = \boldsymbol{W}_V = \boldsymbol{I}_{2\times2}$（简化），所以 $d_k = d_v = 2$。

### Step 1：计算 Q, K, V

$$\boldsymbol{Q} = \boldsymbol{K} = \boldsymbol{V} = \boldsymbol{X} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \\ 0 & 0 \end{pmatrix}$$

### Step 2：打分矩阵

$$\boldsymbol{S} = \boldsymbol{Q}\boldsymbol{K}^T = \begin{pmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \\ 0 & 0 \end{pmatrix}\begin{pmatrix} 1 & 0 & 1 & 0 \\ 0 & 1 & 1 & 0 \end{pmatrix} = \begin{pmatrix} 1 & 0 & 1 & 0 \\ 0 & 1 & 1 & 0 \\ 1 & 1 & 2 & 0 \\ 0 & 0 & 0 & 0 \end{pmatrix}$$

解读：
- 位置 1（向量 $[1,0]$）和位置 3（$[1,1]$）的点积为 1——因为方向部分对齐
- 位置 3 和自己的点积为 2——最大（自己最像自己）
- 位置 4（零向量）和所有人点积都是 0

### Step 3：缩放

$$\boldsymbol{S}' = \frac{\boldsymbol{S}}{\sqrt{d_k}} = \frac{\boldsymbol{S}}{\sqrt{2}} = \begin{pmatrix} 0.707 & 0 & 0.707 & 0 \\ 0 & 0.707 & 0.707 & 0 \\ 0.707 & 0.707 & 1.414 & 0 \\ 0 & 0 & 0 & 0 \end{pmatrix}$$

### Step 4：Softmax（按行）

**第 1 行**：$[0.707, 0, 0.707, 0]$

分母 $D = e^{0.707} + e^0 + e^{0.707} + e^0 = 2.028 + 1 + 2.028 + 1 = 6.056$

$$\alpha = [2.028/6.056,\; 1/6.056,\; 2.028/6.056,\; 1/6.056] \approx [0.335, 0.165, 0.335, 0.165]$$

**第 4 行**：$[0, 0, 0, 0]$

所有相同 → 均匀分布：$[0.25, 0.25, 0.25, 0.25]$

**第 3 行**：$[0.707, 0.707, 1.414, 0]$

$e^{0.707} \approx 2.028$，$e^{1.414} \approx 4.113$，$e^0 = 1$

分母 $= 2.028 + 2.028 + 4.113 + 1 = 9.169$

$$\alpha_3 \approx [0.221, 0.221, 0.449, 0.109]$$

### Step 5：加权聚合

$$\boldsymbol{z}_4 = 0.25 \cdot [1,0] + 0.25 \cdot [0,1] + 0.25 \cdot [1,1] + 0.25 \cdot [0,0] = [0.5, 0.5]$$

位置 4（原本是零向量）通过注意力获得了其他位置信息的平均！

$$\boldsymbol{z}_3 \approx 0.221[1,0] + 0.221[0,1] + 0.449[1,1] + 0.109[0,0] = [0.670, 0.670]$$

位置 3 主要关注自己（权重 0.449），因为自己的 Q 和 K 最匹配。

---

## 多头注意力（Multi-Head Attention）

### 动机

单个注意力头只能学习一种注意力模式。但语言中的关系是多样的——一个词可能同时需要：
- 关注语法上的主语（一种模式）
- 关注语义上的同义词（另一种模式）
- 关注位置上的邻近词（又一种模式）

多头注意力让模型在**不同子空间**中并行学习多种注意力模式。

### 公式

$$\text{MultiHead}(\boldsymbol{Q}, \boldsymbol{K}, \boldsymbol{V}) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)\boldsymbol{W}_O$$

每个头独立做自注意力：
$$\text{head}_i = \text{Attention}(\boldsymbol{X}\boldsymbol{W}_Q^{(i)}, \boldsymbol{X}\boldsymbol{W}_K^{(i)}, \boldsymbol{X}\boldsymbol{W}_V^{(i)})$$

每个头的投影矩阵维度较小：$\boldsymbol{W}_Q^{(i)}, \boldsymbol{W}_K^{(i)} \in \mathbb{R}^{d \times d_k}$，$\boldsymbol{W}_V^{(i)} \in \mathbb{R}^{d \times d_v}$。

通常设 $d_k = d_v = d/h$（总维度均分给各头），这样拼接后维度回到 $hd_v = d$。

最后通过输出投影 $\boldsymbol{W}_O \in \mathbb{R}^{d \times d}$ 做线性变换。

### 参数量计算

**标准配置**：$d = 512$，$h = 8$，$d_k = d_v = 512/8 = 64$

**每个头**：
- $\boldsymbol{W}_Q^{(i)} \in \mathbb{R}^{512 \times 64}$：$512 \times 64 = 32{,}768$ 参数
- $\boldsymbol{W}_K^{(i)} \in \mathbb{R}^{512 \times 64}$：$32{,}768$ 参数
- $\boldsymbol{W}_V^{(i)} \in \mathbb{R}^{512 \times 64}$：$32{,}768$ 参数
- 每头 QKV 小计：$3 \times 32{,}768 = 98{,}304$

**8 个头的 QKV 总参数**：$8 \times 98{,}304 = 786{,}432$

**输出投影** $\boldsymbol{W}_O \in \mathbb{R}^{512 \times 512}$：$262{,}144$

**多头注意力层总参数**：$786{,}432 + 262{,}144 = 1{,}048{,}576 = 4d^2 = 4 \times 512^2$

### 关键结论：头数不影响总参数量

总参数 = $h \times 3 \times d \times (d/h) + d \times d = 3d^2 + d^2 = 4d^2$

与 $h$ 无关！增加头数只是重新分配了每个头的维度：
- $h=8$，每头 $d_k=64$
- $h=16$，每头 $d_k=32$

**改变的是**：子空间数量 vs 每个子空间的维度（表达力 vs 多样性的权衡）

**增加头数的利弊**：
- 更多头 → 学到更多种注意力模式 → 可能捕获更丰富的依赖关系
- 每头维度更小 → 单个头的表达力下降 → 可能出现冗余头
- 极端情况（$h=d$，每头 1 维）：每个头只能做标量注意力，表达力很弱

---

## Transformer 完整架构

### 整体结构

原始 Transformer（Vaswani et al., 2017）是 **Encoder-Decoder** 结构：

```
输入序列 → [Encoder × N 层] → 编码表示
                                    ↓
目标序列 → [Decoder × N 层] → 输出概率 → 生成下一个 token
```

原始论文 $N = 6$。

### 编码器（Encoder）

每一层编码器包含**两个子层**：

```
输入
 ↓
[Multi-Head Self-Attention]
 ↓
[Add & LayerNorm]  ← 残差连接 + 层归一化
 ↓
[Feed-Forward Network (FFN)]
 ↓
[Add & LayerNorm]  ← 残差连接 + 层归一化
 ↓
输出
```

数学形式：
$$\boldsymbol{H}' = \text{LayerNorm}(\boldsymbol{H} + \text{MultiHead}(\boldsymbol{H}, \boldsymbol{H}, \boldsymbol{H}))$$
$$\boldsymbol{H}^{\text{out}} = \text{LayerNorm}(\boldsymbol{H}' + \text{FFN}(\boldsymbol{H}'))$$

编码器的自注意力是**全连接的**——每个位置可以看到所有其他位置。

### 解码器（Decoder）

每一层解码器包含**三个子层**：

```
输入（已生成的 token）
 ↓
[Masked Multi-Head Self-Attention]  ← 只能看到当前及之前
 ↓
[Add & LayerNorm]
 ↓
[Cross-Attention]  ← Q 来自解码器，K/V 来自编码器
 ↓
[Add & LayerNorm]
 ↓
[FFN]
 ↓
[Add & LayerNorm]
 ↓
输出
```

**掩码自注意力**：防止"偷看"未来的 token

**交叉注意力（Cross-Attention）**：
- Query 来自解码器（当前正在生成的表示）
- Key 和 Value 来自编码器输出（源序列的完整表示）
- 让解码器在生成时能"查阅"源序列的所有信息

### 嵌入层

#### Token Embedding

将离散的 token ID 映射为 $d$ 维连续向量：

$$\text{Embed}(t) = \boldsymbol{E}[t] \in \mathbb{R}^d, \quad \boldsymbol{E} \in \mathbb{R}^{|V| \times d}$$

$|V|$ 是词汇表大小。这是一个查表操作（one-hot × 嵌入矩阵）。

#### 位置编码（Positional Encoding）

自注意力对输入的位置**完全不敏感**——打乱 token 顺序，输出不变（置换等变性）。但语言是有顺序的！

解决：给输入加上位置信息。原始 Transformer 使用正弦余弦位置编码：

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d}}\right)$$
$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d}}\right)$$

其中 $pos$ 是位置索引（0, 1, 2, ...），$i$ 是维度索引（0, 1, ..., $d/2-1$）。

**为什么用正弦/余弦？**

1. 有界：值在 $[-1, 1]$ 之间
2. 不同位置的编码不同
3. 可以表示相对位置：$PE_{pos+k}$ 可以写成 $PE_{pos}$ 的线性变换（旋转矩阵）
4. 可泛化到训练时未见过的更长序列

最终输入 = Token Embedding + Positional Encoding。

### 前馈网络（FFN）

$$\text{FFN}(\boldsymbol{x}) = \text{ReLU}(\boldsymbol{x}\boldsymbol{W}_1 + \boldsymbol{b}_1)\boldsymbol{W}_2 + \boldsymbol{b}_2$$

结构：线性升维 → ReLU → 线性降维

维度：$d \to d_f \to d$，通常 $d_f = 4d$。

**参数量**（$d=512$，$d_f=2048$）：
- $\boldsymbol{W}_1 \in \mathbb{R}^{512 \times 2048}$：$1{,}048{,}576$
- $\boldsymbol{b}_1 \in \mathbb{R}^{2048}$：$2{,}048$
- $\boldsymbol{W}_2 \in \mathbb{R}^{2048 \times 512}$：$1{,}048{,}576$
- $\boldsymbol{b}_2 \in \mathbb{R}^{512}$：$512$
- **总计**：$2{,}099{,}712 \approx 2.1M$

### FFN 的作用

| 组件 | 功能 | 比喻 |
|------|------|------|
| Multi-Head Attention | **Token mixing**：不同位置交换信息 | "开会讨论" |
| FFN | **Channel mixing**：每个位置独立做特征变换 | "独立思考" |

**为什么需要 FFN？**

注意力只做了位置间的线性混合。如果没有 FFN，模型对每个位置的表示只是其他位置表示的加权平均——缺乏逐位置的非线性特征变换能力。

FFN 先升维到 $4d$（增加特征空间），经过 ReLU（引入非线性），再降维回 $d$（压缩回原始维度）。每个位置独立做这个操作。

**去掉 FFN 的后果**：
1. 模型表达力不足
2. 只有线性混合能力，无法学习复杂特征
3. 深层表示更新能力变弱
4. 实际任务性能显著下降

### Add & LayerNorm

**残差连接（Add）**：
$$\boldsymbol{y} = \text{SubLayer}(\boldsymbol{x}) + \boldsymbol{x}$$

作用：梯度直通（上一章已详细讲过）。

**层归一化（LayerNorm）**：
对每个 token 的 $d$ 维特征向量归一化（均值 0、方差 1），然后用可学习的 $\gamma, \beta$ 缩放和偏移。

为什么用 LN 而不是 BN：
- 序列长度可变（不同 batch 中同一位置没有统计意义）
- Batch size 可能很小
- 推理时行为和训练一致

---

## 掩码机制（Masking）

### Padding Mask

不同序列长度不同，短的需要 padding。Padding 位置不应该参与注意力计算。

做法：将 padding 位置的打分设为 $-\infty$，softmax 后变为 0——这些位置不贡献任何信息。

### Causal Mask（因果掩码，解码器用）

在自回归生成中，位置 $t$ 不能看到 $t+1, t+2, \ldots$（未来的 token 还没生成）。

掩码矩阵（上三角为 $-\infty$）：

$$\text{Mask}_{ij} = \begin{cases} 0, & j \le i \text{（可以看）} \\ -\infty, & j > i \text{（不能看）} \end{cases}$$

加在打分矩阵上：$\boldsymbol{S}' = \boldsymbol{S} + \text{Mask}$

softmax 后，每行只有前 $i$ 个位置有非零权重——自然实现了"只看过去"。

---

## Transformer 应用架构

### 三种变体

| 架构 | 使用部分 | 注意力类型 | 代表模型 | 适用任务 |
|------|----------|-----------|----------|----------|
| Encoder-only | 只用编码器 | 双向 | BERT | 理解（分类、NER） |
| Decoder-only | 只用解码器 | 因果（单向） | GPT | 生成（续写、对话） |
| Encoder-Decoder | 完整结构 | 双向 + 因果 + 交叉 | T5, BART | 序列到序列（翻译、摘要） |

### Token 与 BPE

**Token**：模型处理文本的最小单位。不一定是"词"。

**BPE（Byte Pair Encoding）**——数据驱动的分词：

1. 初始化：词汇表 = 所有单字符
2. 统计所有相邻 token 对的频率
3. 合并频率最高的 pair 为新 token
4. 重复直到达到目标词汇量

**示例**：`"lowest"` → `["l", "o", "w", "e", "s", "t"]` → 合并高频 pair `"es"` → `["l", "o", "w", "es", "t"]` → ...

**优势**：
- 常见词保持完整（"the" → 一个 token）
- 罕见词拆成子词（"unhappiness" → "un" + "happiness"）
- 完全消除了未登录词（OOV）问题

---

## 本章计算要点速查

| 量 | 公式/值 |
|----|---------|
| 注意力输出 | $\text{softmax}(\boldsymbol{QK}^T/\sqrt{d_k})\boldsymbol{V}$ |
| 缩放因子 | $\sqrt{d_k}$（使方差归一） |
| 多头注意力参数量 | $4d^2$（与头数无关） |
| FFN 参数量 | $\approx 2 \times d \times d_f + d_f + d \approx 8d^2 + 3d$（当 $d_f = 4d$） |
| 单层编码器参数 | $\approx 4d^2 + 8d^2 = 12d^2$（注意力 + FFN） |
| 6 层编码器总参数 | $\approx 72d^2 \approx 72 \times 512^2 \approx 19M$ |


---

## 注意力的计算复杂度

### 时间复杂度

缩放点积注意力对序列长度 $n$、维度 $d$：

1. $\boldsymbol{Q}\boldsymbol{K}^T$：两个 $n \times d$ 矩阵相乘 → $O(n^2 d)$
2. Softmax：每行 $n$ 个元素，共 $n$ 行 → $O(n^2)$
3. $\boldsymbol{A}\boldsymbol{V}$：$n \times n$ 乘 $n \times d$ → $O(n^2 d)$

**总时间复杂度**：$O(n^2 d)$

**对比 RNN**：$O(nd^2)$

当 $n < d$ 时（短序列，如几百个 token），Transformer 更快。
当 $n > d$ 时（超长序列），$n^2$ 项主导，注意力计算成为瓶颈。

### 空间复杂度

需要存储 $n \times n$ 的注意力权重矩阵：$O(n^2)$

这是 Transformer 处理长序列的主要限制。

---

## Transformer 与 CNN、RNN 的对比

| 特性 | RNN | CNN | Transformer |
|------|-----|-----|-------------|
| 长距离依赖 | 困难（梯度消失） | 需要很多层 | **直接连接**（一步） |
| 并行计算 | ✗（顺序） | ✓ | **✓** |
| 每层计算量 | $O(nd^2)$ | $O(nkd^2)$ | $O(n^2d)$ |
| 最长路径 | $O(n)$ | $O(n/k)$ | **$O(1)$** |
| 归纳偏置 | 时间局部性 | 空间局部性 | **无**（完全靠数据学） |

"最长路径"指信息从序列一端到另一端需要经过的最少层数。Transformer 中任意两个位置通过一层注意力就直接连接——这是它处理长距离依赖的根本优势。

代价是缺乏归纳偏置——需要更多数据才能学好，但在大数据时代这不再是瓶颈。

---

## 完整的单层编码器前向传播

设输入 $\boldsymbol{X} \in \mathbb{R}^{n \times d}$，走完一层编码器的完整流程：

```
1. Q = XW_Q,  K = XW_K,  V = XW_V         (线性投影)
2. S = QK^T / sqrt(d_k)                     (打分+缩放)
3. A = softmax(S, dim=-1)                    (归一化)
4. Z = AV                                    (聚合)
   对 h 个头各做一次，拼接后乘 W_O
5. X' = LayerNorm(X + Z)                     (残差+归一化)
6. F = ReLU(X'W_1 + b_1)W_2 + b_2           (FFN)
7. X_out = LayerNorm(X' + F)                 (残差+归一化)
```

输出 $\boldsymbol{X}_{\text{out}} \in \mathbb{R}^{n \times d}$，形状和输入完全相同——可以直接堆叠多层。

---

## 为什么 Transformer 能统一 NLP 和 CV

1. **通用性**：注意力机制不假设输入的拓扑结构（不像 CNN 假设网格、RNN 假设序列）
2. **可扩展性**：参数和计算量随层数/宽度线性增长，适合大规模训练
3. **表达力**：万能近似+大规模参数+大数据 = 强大的建模能力
4. **适配性**：图像切成 patch = "视觉 token"，直接用同一套架构

这让 Transformer 成为了当代 AI 的"通用计算引擎"。

---
title: "用 CNN 和 RNN 处理文本"
chapter: 4
readTime: 75
description: "卷积学 n-gram，循环记上下文。两者都被注意力取代了，但在受限硬件上依然有用武之地。"
---
> 卷积学 n-gram，循环记上下文。两者都被注意力取代了，但在受限硬件上依然有用武之地。






## 为什么要学这个

TF-IDF 和 Word2Vec 产出的是扁平向量，完全忽略词序。用它们做分类器，分不出「狗咬人」和「人咬狗」的区别。而词序有时候恰恰是关键信号。

在 Transformer 出现之前，有两类架构填补了这个空白。

**文本卷积网络（TextCNN）。** 在词嵌入序列上做一维卷积。宽度为 3 的卷积核就是一个可学习的三元组（trigram）检测器：它横跨三个词，输出一个得分。堆叠不同宽度（2、3、4、5）就能捕捉多尺度模式。最大池化（Max-pool）压成定长表示。并行、扁平、快。

**循环网络（RNN、LSTM、GRU）。** 逐 token 处理，维护一个隐状态（hidden state），把信息一直向前传。顺序处理、带记忆、能接受任意长度输入。从 2014 到 2017 主导序列建模，然后注意力机制来了。

这一课我们两个都造，然后点出它们的失败——正是那个失败催生了注意力。

## 核心概念

**TextCNN**（Kim, 2014）。Token 先做嵌入。宽度为 `k` 的一维卷积核在连续的 `k`-gram 嵌入上滑动，产出一个特征图（feature map）。对该特征图做全局最大池化（global max-pooling），取最强激活值。把多个宽度的池化输出拼接起来，送入分类头。

为什么有效？一个卷积核就是一个可学习的 n-gram。最大池化是位置无关的，所以 "not good" 出现在评论开头还是中间，激活的特征一样。三种宽度各 100 个卷积核，就是 300 个学出来的 n-gram 检测器。训练可以并行，没有顺序依赖。

**RNN。** 在每个时间步 `t`，隐状态更新为 `h_t = f(W * x_t + U * h_{t-1} + b)`。`W`、`U`、`b` 在所有时间步共享。时间步 `T` 的隐状态就是整个前缀的摘要。做分类时，对 `h_1 ... h_T` 做池化（max、mean 或取最后一个）。

普通 RNN 有梯度消失（vanishing gradient）问题。**LSTM** 加入了门控机制——决定遗忘什么、存储什么、输出什么——让梯度在长序列中保持稳定。**GRU** 把 LSTM 简化成两个门；效果差不多，参数更少。

**双向 RNN（Bidirectional RNN）** 跑一个正向 RNN 和一个反向 RNN，把隐状态拼起来。每个 token 的表示同时看到左右两侧的上下文。对标注任务来说不可或缺。

## 从零实现

### 第一步：用 PyTorch 搭 TextCNN

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class TextCNN(nn.Module):
    def __init__(self, vocab_size, embed_dim, n_classes, filter_widths=(2, 3, 4), n_filters=64, dropout=0.3):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.convs = nn.ModuleList([
            nn.Conv1d(embed_dim, n_filters, kernel_size=k)
            for k in filter_widths
        ])
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(n_filters * len(filter_widths), n_classes)

    def forward(self, token_ids):
        x = self.embed(token_ids).transpose(1, 2)
        pooled = []
        for conv in self.convs:
            c = F.relu(conv(x))
            p = F.max_pool1d(c, c.size(2)).squeeze(2)
            pooled.append(p)
        h = torch.cat(pooled, dim=1)
        return self.fc(self.dropout(h))
```

`transpose(1, 2)` 把形状从 `[batch, seq_len, embed_dim]` 变成 `[batch, embed_dim, seq_len]`，因为 `nn.Conv1d` 把中间那个轴当通道（channels）。池化后输出是定长的，跟输入长度无关。

### 第二步：LSTM 分类器

```python
class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_classes, bidirectional=True, dropout=0.3):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=bidirectional)
        factor = 2 if bidirectional else 1
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * factor, n_classes)

    def forward(self, token_ids):
        x = self.embed(token_ids)
        out, _ = self.lstm(x)
        pooled = out.max(dim=1).values
        return self.fc(self.dropout(pooled))
```

对序列做 max-pool，而不是取最后一个隐状态。做分类时，max-pooling 通常比取最后隐状态效果好，因为长序列末尾的信息往往会主导最后的隐状态，掩盖了前面的证据。

### 第三步：梯度消失直觉演示

没有门控的普通 RNN 学不了长距离依赖。想象一个玩具任务：预测 token `A` 是否在序列中出现过。如果 `A` 在位置 1，序列长 100 个 token，那梯度要从 loss 反向流过 99 次循环权重的连乘。如果权重小于 1，梯度消失；大于 1，梯度爆炸。

```python
def vanishing_gradient_sim(seq_len, recurrent_weight=0.9):
    import math
    return math.pow(recurrent_weight, seq_len)


# 权重=0.9，经过 100 步：
#   0.9 ^ 100 ≈ 2.7e-5
# 从第 100 步到第 1 步的梯度基本是零。
```

LSTM 用一条**细胞状态（cell state）** 解决这个问题——它在网络中只做加法交互（遗忘门会乘以缩放系数，但梯度依然能沿着这条"高速公路"流通）。GRU 用更少的参数做了类似的事。两者都能让训练在 100 步以上的序列里保持稳定。

### 第四步：为什么这还不够

即使用了 LSTM，三个问题依然存在。

1. **顺序瓶颈。** 训练一个长度为 1000 的序列需要 1000 次串行前向/反向步骤。时间维度没法并行。
2. **编码器-解码器中的定长上下文向量。** 解码器只看到编码器最后一个隐状态——整个输入被压缩进一个向量。输入越长，细节丢越多。第 09 课会直接讲这个。
3. **远距离依赖准确率天花板。** LSTM 比普通 RNN 好，但要把特定信息传过 200 步以上，还是很吃力。

注意力机制（Attention）解决了以上三个问题。Transformer 直接丢掉了循环结构。第 10 课是转折点。

## 实战用法

PyTorch 的 `nn.LSTM`、`nn.GRU`、`nn.Conv1d` 都是生产级的，训练代码写法标准。

Hugging Face 提供了预训练嵌入，可以直接当输入层插进来：

```python
from transformers import AutoModel

encoder = AutoModel.from_pretrained("bert-base-uncased")
for param in encoder.parameters():
    param.requires_grad = False


class BertCNN(nn.Module):
    def __init__(self, n_classes, filter_widths=(2, 3, 4), n_filters=64):
        super().__init__()
        self.encoder = encoder
        self.convs = nn.ModuleList([nn.Conv1d(768, n_filters, kernel_size=k) for k in filter_widths])
        self.fc = nn.Linear(n_filters * len(filter_widths), n_classes)

    def forward(self, input_ids, attention_mask):
        with torch.no_grad():
            out = self.encoder(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state
        x = out.transpose(1, 2)
        pooled = [F.max_pool1d(F.relu(conv(x)), kernel_size=conv(x).size(2)).squeeze(2) for conv in self.convs]
        return self.fc(torch.cat(pooled, dim=1))
```

什么时候该用这些架构？对照清单：

- **端侧 / 设备上推理。** TextCNN 搭配 GloVe 嵌入，比 Transformer 小 10-100 倍。如果部署目标是手机，这就是你的方案。
- **流式 / 在线分类。** RNN 逐 token 处理；Transformer 需要完整序列。对实时输入文本来说，LSTM 仍然赢。
- **小模型做基线。** 新任务快速迭代。用 CPU 5 分钟就能训完一个 TextCNN。
- **少量数据的序列标注。** BiLSTM-CRF（第 06 课）在 1k-10k 标注句子上仍是生产级 NER 架构。

其余场景都交给 Transformer。

## 练习

1. **简单。** 在一个 3 类玩具数据集上训 TextCNN（数据自己造）。验证多宽度卷积核（2, 3, 4）在平均 F1 上优于单宽度（3）。
2. **中等。** 为 LSTM 分类器实现 max-pool、mean-pool 和 last-state 三种池化。在小数据集上对比，记录哪种赢了并分析原因。
3. **困难。** 搭一个 BiLSTM-CRF NER 标注器（结合第 06 课和本课）。在 CoNLL-2003 上训练。与第 06 课的纯 CRF 基线和 BERT 微调对比。报告训练时间、内存和 F1。

## 术语表

| 术语 | 口语说法 | 实际含义 |
|------|----------|----------|
| TextCNN | 文本 CNN | 在词嵌入上做一维卷积 + 全局最大池化。Kim (2014)。 |
| RNN | 循环网络 | 每个时间步更新隐状态：`h_t = f(W x_t + U h_{t-1})`。 |
| LSTM | 门控 RNN | 加了输入门/遗忘门/输出门 + 细胞状态。长序列训练稳定。 |
| GRU | 简化版 LSTM | 两个门而不是三个。精度相近，参数更少。 |
| 双向（Bidirectional） | 两个方向都跑 | 正向 + 反向 RNN 拼接。每个 token 同时看到左右上下文。 |
| 梯度消失（Vanishing gradient） | 训练信号消失 | 普通 RNN 中小于 1 的权重反复相乘，让早期时间步梯度趋近于零。 |

## 延伸阅读

- [Kim, Y. (2014). Convolutional Neural Networks for Sentence Classification](https://arxiv.org/abs/1408.5882) — TextCNN 论文。8 页，可读性很强。
- [Hochreiter, S. and Schmidhuber, J. (1997). Long Short-Term Memory](https://www.bioinf.jku.at/publications/older/2604.pdf) — LSTM 论文。意外地清晰。
- [Olah, C. (2015). Understanding LSTM Networks](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) — 让 LSTM 变得人人能懂的那些图。

---

## 自测题

:::quiz
question: 宽度为 3 的一维卷积核作用在词嵌入上，本质上学的是什么？
options:
  - 一个可学习的 bigram 检测器
  - 一种位置编码
  - 一个可学习的 trigram（n-gram）检测器
  - 一种 unigram 计数
correct: 2
explanation: 宽度为 3 的卷积核横跨三个连续 token，本质上就是一个可学习的 trigram 检测器。
:::

:::quiz
question: LSTM 为什么要用以加法交互为主的细胞状态？
options:
  - 加法通道让梯度在长序列中传播时不会消失或爆炸
  - 加速 softmax
  - 省内存
  - 避免矩阵求逆
correct: 0
explanation: 细胞状态"高速公路"让梯度在数百步中保持稳定，解决了梯度消失问题。
:::

:::quiz
question: TextCNN 在卷积层之后为什么用全局最大池化？
options:
  - 为了让反向传播生效
  - 为了去掉嵌入
  - 为了缩减词表
  - 最大池化给出定长且位置无关的表示——取每个卷积核的最强激活
correct: 3
explanation: 全局最大池化产出定长特征向量，不受输入长度影响，且具有位置不变性。
:::

:::quiz
question: 双向 RNN 相比单向 RNN，在序列标注上的主要优势是什么？
options:
  - 训练更快
  - 每个 token 的表示同时看到左右上下文，这对标注任务至关重要
  - 不需要嵌入
  - 内存更省
correct: 1
explanation: 双向网络拼接正向和反向隐状态，标注时可以利用完整上下文。
:::

:::quiz
question: 做分类时，对 LSTM 输出序列做 max-pooling 为什么通常比只取最后一个隐状态好？
options:
  - max-pool 可微分，last-state 不可微
  - 长序列末尾的信息往往主导最后隐状态，掩盖了前面的证据
  - max-pool 去除了大写
  - last-state 池化会忽略 padding
correct: 1
explanation: max-pool 在所有位置取最强信号；last-state 容易丢失前面的证据。
:::

:::quiz
question: LSTM/RNN 编码器-解码器的哪个局限催生了注意力机制？
options:
  - 它们需要子词分词器
  - 它们不能用嵌入
  - 解码器只看到定长编码器状态，长输入丢失细节；循环结构还让训练必须串行
  - 它们不能嵌入 token
correct: 2
explanation: 定长压缩和串行训练是注意力机制所解决的两大失败。
:::

:::quiz
question: 2026 年，TextCNN 或 BiLSTM 在什么场景下仍然能打败 Transformer？
options:
  - 处理图像输入时
  - 端侧/设备上推理、逐 token 流式输入、或小数据快速基线
  - 多语言数据集
  - 延迟要求极度宽松时
correct: 1
explanation: 小架构在端侧推理、流式输入和快速基线场景仍然有优势。
:::

:::quiz
question: 普通 RNN 中的梯度消失问题是怎么回事？
options:
  - 小于 1 的循环权重反复相乘，导致早期时间步的梯度趋近于零
  - 嵌入矩阵变得奇异
  - 输入变为零
  - loss 变成负数
correct: 0
explanation: 长链连乘让梯度消失（或爆炸），这就是 LSTM 和 GRU 存在的原因。
:::

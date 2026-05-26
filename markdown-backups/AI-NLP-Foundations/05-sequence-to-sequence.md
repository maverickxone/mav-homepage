---
title: "序列到序列模型"
chapter: 5
readTime: 75
description: "两个 RNN 假装自己是翻译官。它们遇到的瓶颈，正是注意力机制存在的理由。"
---
> 两个 RNN 假装自己是翻译官。它们遇到的瓶颈，正是注意力机制存在的理由。






## 为什么要学这个

分类任务把一个变长序列映射到一个标签。翻译任务把一个变长序列映射到另一个变长序列。输入和输出属于不同词表、可能是不同语言，而且长度没有对应关系。

序列到序列（Sequence-to-Sequence）架构（Sutskever, Vinyals, Le, 2014）用一个极其简洁的方案解决了这个问题：两个 RNN。一个读入源句子，产出一个固定大小的上下文向量（context vector）；另一个读这个向量，逐 token 生成目标句子。本质上就是你在第 08 课写过的代码，换了种拼法。

学这个有两个原因。第一，上下文向量瓶颈（context-vector bottleneck）是 NLP 领域最有教学价值的失败案例——它直接催生了注意力（Attention）和 Transformer 的一切优势。第二，训练配方（教师强制、计划采样、推理时用束搜索）至今适用于所有现代生成系统，包括大语言模型（LLM）。

## 核心概念

**编码器（Encoder）。** 一个 RNN，逐 token 读入源句子。它的最终隐藏状态就是**上下文向量**——对整段输入的定长摘要。理论上不会丢信息，实际上丢得厉害。

**解码器（Decoder）。** 另一个 RNN，用上下文向量做初始状态。每一步接收上一个生成的 token 作为输入，输出目标词表上的概率分布。用采样或 argmax 选下一个 token，喂回去，重复，直到生成 `<EOS>` 或达到最大长度。

**训练方式：** 在解码器每一步算交叉熵损失（Cross-Entropy Loss），对整个序列求和。标准的反向传播沿时间展开（BPTT），贯穿两个网络。

**教师强制（Teacher Forcing）。** 训练时解码器在第 `t` 步的输入是**真实标签**在 `t-1` 位置的 token，而不是解码器自己上一步的预测。这能稳定训练过程；不用它的话，早期错误会雪崩式放大，模型根本学不会。推理时你只能用模型自己的预测，所以训练和推理之间总存在分布偏差。这个偏差叫**曝光偏差（Exposure Bias）**。

**瓶颈。** 编码器关于源句子学到的所有信息，必须全部塞进那一个上下文向量里。长句子丢细节，低频词被模糊，语序重排（法语 chat noir ↔ 英语 black cat）只能靠死记，无法计算。

注意力机制（第 10 课）通过让解码器查看编码器**每一步**的隐藏状态来修复这个问题，而不是只看最后一步。就这么简单。

## 从零实现

### 第一步：编码器

```python
import torch
import torch.nn as nn


class Encoder(nn.Module):
    def __init__(self, src_vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embed = nn.Embedding(src_vocab_size, embed_dim, padding_idx=0)
        self.gru = nn.GRU(embed_dim, hidden_dim, batch_first=True)

    def forward(self, src):
        e = self.embed(src)
        outputs, hidden = self.gru(e)
        return outputs, hidden
```

`outputs` 的形状是 `[batch, seq_len, hidden_dim]`——每个输入位置对应一个隐藏状态。`hidden` 的形状是 `[1, batch, hidden_dim]`——最后一步的状态。第 08 课说过"对 outputs 做池化用于分类"。这里我们保留最后的隐藏状态作为上下文向量，忽略逐步输出。

### 第二步：解码器

```python
class Decoder(nn.Module):
    def __init__(self, tgt_vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embed = nn.Embedding(tgt_vocab_size, embed_dim, padding_idx=0)
        self.gru = nn.GRU(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, tgt_vocab_size)

    def forward(self, token, hidden):
        e = self.embed(token)
        out, hidden = self.gru(e, hidden)
        logits = self.fc(out)
        return logits, hidden
```

解码器每次只处理一步。输入：一批单 token 加上当前隐藏状态。输出：下一个 token 的词表 logits 加上更新后的隐藏状态。

### 第三步：带教师强制的训练循环

```python
def train_batch(encoder, decoder, src, tgt, bos_id, optimizer, teacher_forcing_ratio=0.9):
    optimizer.zero_grad()
    _, hidden = encoder(src)
    batch_size, tgt_len = tgt.shape
    input_token = torch.full((batch_size, 1), bos_id, dtype=torch.long)
    loss = 0.0
    loss_fn = nn.CrossEntropyLoss(ignore_index=0)

    for t in range(tgt_len):
        logits, hidden = decoder(input_token, hidden)
        step_loss = loss_fn(logits.squeeze(1), tgt[:, t])
        loss += step_loss
        use_teacher = torch.rand(1).item() < teacher_forcing_ratio
        if use_teacher:
            input_token = tgt[:, t].unsqueeze(1)
        else:
            input_token = logits.argmax(dim=-1)

    loss.backward()
    optimizer.step()
    return loss.item() / tgt_len
```

两个关键参数。`ignore_index=0` 让 loss 跳过 padding token。`teacher_forcing_ratio` 是每步使用真实 token 而非模型预测的概率。一开始设成 1.0（完全教师强制），训练过程中逐渐退火到 ~0.5，以缩小曝光偏差。

### 第四步：推理循环（贪心解码）

```python
@torch.no_grad()
def greedy_decode(encoder, decoder, src, bos_id, eos_id, max_len=50):
    _, hidden = encoder(src)
    batch_size = src.shape[0]
    input_token = torch.full((batch_size, 1), bos_id, dtype=torch.long)
    output_ids = []
    for _ in range(max_len):
        logits, hidden = decoder(input_token, hidden)
        next_token = logits.argmax(dim=-1)
        output_ids.append(next_token)
        input_token = next_token
        if (next_token == eos_id).all():
            break
    return torch.cat(output_ids, dim=1)
```

贪心解码（Greedy Decoding）每步都选概率最高的 token。缺点是一旦选错就无法回头。**束搜索（Beam Search）** 同时保留概率最高的前 `k` 条候选序列，最终挑得分最高的完整序列。束宽（beam width）通常取 3-5。

### 第五步：瓶颈的实证演示

在一个"复读"玩具任务上训练：源序列 `[a, b, c, d, e]`，目标也是 `[a, b, c, d, e]`。不断增加序列长度，观察准确率变化。

```
seq_len=5   复读准确率: 98%
seq_len=10  复读准确率: 91%
seq_len=20  复读准确率: 62%
seq_len=40  复读准确率: 23%
```

一个 GRU 隐藏状态无法无损记住 40 个 token 的输入。信息在编码器的每一步都存在，但解码器只能看到最后一步的状态。注意力机制直接解决了这个问题。

## 实战用法

PyTorch 自带 `nn.Transformer` 和基于 `nn.LSTM` 的 seq2seq 模板。Hugging Face 的 `transformers` 库提供了预训练好的编码器-解码器模型（BART、T5、mBART、NLLB），在数十亿 token 上训练过。

```python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

tok = AutoTokenizer.from_pretrained("facebook/bart-base")
model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-base")

src = tok("Translate this to French: Hello, how are you?", return_tensors="pt")
out = model.generate(**src, max_new_tokens=50, num_beams=4)
print(tok.decode(out[0], skip_special_tokens=True))
```

现代编码器-解码器模型把 RNN 换成了 Transformer。高层形态（编码器→解码器→逐 token 生成）和 2014 年的 seq2seq 论文一模一样，变的是每个模块内部的机制。

### 什么时候还需要 RNN seq2seq

几乎从不，对新项目来说。少数例外：

- 流式翻译：逐 token 消费输入，需要有界内存。
- 端侧文本生成：Transformer 内存开销太大时。
- 教学目的。理解编码器-解码器瓶颈是理解 Transformer 为何胜出的最快路径。

### 曝光偏差及其缓解方法

- **计划采样（Scheduled Sampling）。** 训练中逐渐降低教师强制比例，让模型学会从自己的错误中恢复。
- **最小风险训练（Minimum Risk Training）。** 用句子级 BLEU 分数而非 token 级交叉熵来训练。更接近你真正想优化的目标。
- **强化学习微调（RL Fine-tuning）。** 用某个指标作为奖励来训练序列生成器。现代 LLM 的 RLHF 就是这个思路。

这三种方法对基于 Transformer 的生成同样适用。

## 练习

1. **简单。** 实现复读玩具任务。训练一个 GRU seq2seq，输入输出相同。测量序列长度 5、10、20 时的准确率，复现瓶颈现象。
2. **中等。** 加入束搜索解码，束宽为 3。在小型平行语料上对比 BLEU 与贪心解码的差异。记录束搜索在哪里胜出（通常是末尾 token）以及在哪里无差别。
3. **困难。** 在一个 1 万对的复述数据集上微调 `facebook/bart-base`。比较微调后模型（beam=4）与基础模型在留出集上的输出。报告 BLEU 分数，并挑选 10 个有代表性的定性案例。

## 术语表

| 术语 | 通俗说法 | 实际含义 |
|------|---------|---------|
| 编码器（Encoder） | 输入 RNN | 读入源序列，产出逐步隐藏状态和一个最终上下文向量。 |
| 解码器（Decoder） | 输出 RNN | 用上下文向量初始化，逐 token 生成目标序列。 |
| 上下文向量（Context Vector） | 那个摘要 | 编码器的最终隐藏状态。固定大小。就是注意力要解决的瓶颈。 |
| 教师强制（Teacher Forcing） | 喂真实标签 | 训练时用真实的前一个 token 作为解码器输入。稳定学习过程。 |
| 曝光偏差（Exposure Bias） | 训练/推理的落差 | 模型训练时见到的都是真实 token，从没练过从自己的错误中恢复。 |
| 束搜索（Beam Search） | 更好的解码 | 每步保留 top-k 条候选序列，而不是贪心地只选一条。 |

## 自测题

:::quiz
question: 在 2014 年的经典 seq2seq 模型中，编码器的作用是什么？
options:
  - 计算注意力权重
  - 执行束搜索
  - 读入源序列并产出一个固定大小的上下文向量来概括它
  - 生成目标 token
correct: 2
explanation: 编码器 RNN 把源序列压缩成最终隐藏状态，供解码器使用。
:::

:::quiz
question: seq2seq 训练中的教师强制是什么？
options:
  - 推理时添加一个教师网络
  - 把 batch size 加倍
  - 把真实的前一个 token（而非模型的预测）作为解码器输入
  - 人工标注解码器的每一步
correct: 2
explanation: 教师强制通过使用真实的前置 token 来稳定训练；没有它的话早期错误会雪崩。
:::

:::quiz
question: 为什么固定上下文向量的 seq2seq 在输入变长时准确率会下降？
options:
  - padding token 积累了
  - 交叉熵发散了
  - 源序列的全部信息必须塞进编码器的单个固定大小隐藏状态中，长输入会丢失细节
  - 词表变得太大了
correct: 2
explanation: 固定上下文向量瓶颈意味着长输入无法被无损概括。
:::

:::quiz
question: 什么是曝光偏差？
options:
  - 类别不平衡造成的偏差
  - 编码器嵌入中的偏差
  - 标注者的分歧
  - 训练时用真实 token、推理时却只能用模型自己预测所带来的训练/推理分布差异
correct: 3
explanation: 模型在训练中从未练过从自己的错误中恢复，所以推理时错误会连锁放大。
:::

:::quiz
question: 为什么束搜索通常比贪心解码效果更好？
options:
  - 束搜索在每步保留 top-k 条候选序列，不会不可逆地只绑定一个 token
  - 束搜索能消除曝光偏差
  - 束搜索更快
  - 束搜索能降低 loss
correct: 0
explanation: 贪心解码每步只选一个，束搜索同时探索多条假设，最后挑最优的完整序列。
:::

:::quiz
question: 哪个架构家族取代了 RNN seq2seq 成为通用生成任务的首选？
options:
  - Transformer 编码器-解码器模型（BART、T5、mBART、NLLB）
  - 图神经网络
  - 朴素贝叶斯
  - 一维 CNN
correct: 0
explanation: Transformer 编码器-解码器去掉了循环结构，现已主导生成任务。
:::

:::quiz
question: 计划采样（Scheduled Sampling）做了什么？
options:
  - 训练过程中逐渐降低教师强制比例，让模型学会从自己的预测中恢复
  - 调度学习率衰减
  - 重排训练集
  - 给嵌入加随机噪声
correct: 0
explanation: 计划采样逐步混入模型自身的预测，以缩小训练/推理之间的分布差异。
:::

:::quiz
question: 为什么单独使用贪心解码在面向用户的生成中常常失败？
options:
  - 它用不了嵌入
  - 它总是先选 <EOS>
  - 贪心解码会重复或死循环，无法回溯一个局部最优但全局最差的 token 选择
  - 它需要更多内存
correct: 2
explanation: 贪心解码每步不可逆的选择导致重复和循环，只有束搜索或采样才能缓解。
:::
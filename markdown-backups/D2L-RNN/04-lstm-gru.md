---
title: "LSTM 与 GRU"
chapter: 4
readTime: 25
description: "LSTM 门控机制与梯度高速公路、GRU 简化设计、手动实现与 PyTorch 对比。"
---

## LSTM的诞生背景——从问题出发

标准RNN在长序列上存在严重的梯度消失问题。1997年，Sepp Hochreiter和Jürgen Schmidhuber提出LSTM，其设计动机来自一个核心问题：

**如何让信息在时间序列中"无损"传播？**

**关键洞察**：梯度消失的根本原因是信息在每个时间步都经过乘法变换（矩阵乘法 + 非线性函数），导致梯度连乘后消失。

**LSTM的解决方案**：引入一条"高速公路"——细胞状态（Cell State），信息可以通过这条通道直接流动，只经过加法操作，梯度几乎不衰减。

> 💡 **直觉：LSTM像什么？**
>
> 想象你在读一本书，同时在用便签纸记录重要信息：
>
> - **细胞状态 C_t**：便签纸本身，可以长期保存信息
> - **遗忘门**：你决定擦掉便签上哪些不再相关的内容
> - **输入门**：你决定把当前页的什么内容写到便签上
> - **输出门**：你根据便签内容，决定当前怎么理解这页内容
> - **隐藏状态 h_t**：你当前的"工作记忆"，用于即时推理
>
> 标准RNN只有h_t（工作记忆），没有便签纸，所以很容易忘事。

## LSTM门的数学原理

LSTM有两种"记忆"：
- **细胞状态 C_t**：长期记忆（"便签纸"）
- **隐藏状态 h_t**：短期记忆（"当前工作状态"）

**遗忘门（Forget Gate）**：

决定从细胞状态中丢弃多少信息。

```
f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
```

- σ 是 sigmoid 函数，输出 (0, 1)
- f_t 接近1：保留大部分信息
- f_t 接近0：丢弃大部分信息

> 🔍 **为什么门用 sigmoid，值用 tanh？**
>
> - **门**（遗忘门、输入门、输出门）输出 (0, 1) 范围的值，用于控制信息的"比例"——0%到100%通过。这是 sigmoid 的用途，因为它的输出天然在 (0, 1)。
>
> - **值**（候选细胞状态、最终输出）输出 (-1, 1) 范围的值，表示"方向"和"强度"。tanh 能输出正负值，使模型能增加或减少记忆。如果用 sigmoid，细胞状态只能单调增加。
>
> 这是一种精妙的设计：sigmoid 是"阀门"，tanh 是"水流方向和大小"。

**输入门（Input Gate）**：

决定将什么新信息写入细胞状态。

```
i_t  = σ(W_i · [h_{t-1}, x_t] + b_i)   ← 决定"更新哪些位置"
C̃_t = tanh(W_C · [h_{t-1}, x_t] + b_C)  ← 候选新内容（-1到1）
```

**细胞状态更新**：

```
C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t
       ↑                 ↑
  保留旧记忆          写入新信息
```

这是LSTM最关键的一步！这个加法操作使梯度可以"直接"流过，不经过非线性函数的压缩。

**输出门（Output Gate）**：

决定从细胞状态中"读出"什么。

```
o_t = σ(W_o · [h_{t-1}, x_t] + b_o)
h_t = o_t ⊙ tanh(C_t)
```

## LSTM前向传播：完整手动实现

```python
import torch
import torch.nn as nn

def lstm_cell_manual(x_t, h_prev, c_prev, weight_ih, weight_hh, bias_ih, bias_hh):
    """
    手动实现单个LSTM时间步（与nn.LSTMCell等价）

    参数：
    x_t:       (batch, input_size)
    h_prev:    (batch, hidden_size)
    c_prev:    (batch, hidden_size)
    weight_ih: (4 * hidden_size, input_size)  ← PyTorch将4个门的权重合并
    weight_hh: (4 * hidden_size, hidden_size)
    bias_ih:   (4 * hidden_size,)
    bias_hh:   (4 * hidden_size,)

    返回：
    h_next: (batch, hidden_size)
    c_next: (batch, hidden_size)
    """
    hidden_size = h_prev.shape[1]

    # PyTorch内部将4个门的权重按 [i, f, g, o] 顺序打包
    # i = input gate (输入门)
    # f = forget gate (遗忘门)
    # g = cell gate (候选细胞状态)
    # o = output gate (输出门)
    gates = x_t @ weight_ih.T + h_prev @ weight_hh.T + bias_ih + bias_hh
    # gates: (batch, 4 * hidden_size)

    # 分割4个门
    i_gate = torch.sigmoid(gates[:, :hidden_size])              # 输入门
    f_gate = torch.sigmoid(gates[:, hidden_size:2*hidden_size]) # 遗忘门
    g_gate = torch.tanh(gates[:, 2*hidden_size:3*hidden_size])  # 候选值
    o_gate = torch.sigmoid(gates[:, 3*hidden_size:])            # 输出门

    # 细胞状态更新
    c_next = f_gate * c_prev + i_gate * g_gate

    # 隐藏状态
    h_next = o_gate * torch.tanh(c_next)

    return h_next, c_next


def lstm_forward_manual(x, h_0, c_0, lstm_layer):
    """手动实现完整的LSTM前向传播"""
    batch_size, seq_len, input_size = x.shape

    weight_ih = lstm_layer.weight_ih_l0
    weight_hh = lstm_layer.weight_hh_l0
    bias_ih = lstm_layer.bias_ih_l0
    bias_hh = lstm_layer.bias_hh_l0

    h_t = h_0.squeeze(0)  # (batch, hidden_size)
    c_t = c_0.squeeze(0)

    outputs = []
    for t in range(seq_len):
        h_t, c_t = lstm_cell_manual(x[:, t, :], h_t, c_t,
                                     weight_ih, weight_hh, bias_ih, bias_hh)
        outputs.append(h_t)

    outputs = torch.stack(outputs, dim=1)  # (batch, seq_len, hidden_size)
    return outputs, (h_t.unsqueeze(0), c_t.unsqueeze(0))


# 验证手动实现与nn.LSTM的等价性
torch.manual_seed(42)
lstm = nn.LSTM(input_size=10, hidden_size=20, batch_first=True)

x = torch.randn(3, 5, 10)
h_0 = torch.zeros(1, 3, 20)
c_0 = torch.zeros(1, 3, 20)

# 官方实现
output_official, (h_n_official, c_n_official) = lstm(x, (h_0, c_0))

# 手动实现
output_manual, (h_n_manual, c_n_manual) = lstm_forward_manual(x, h_0, c_0, lstm)

# 对比误差（应该非常接近0）
print("输出误差:", (output_official - output_manual).abs().max().item())  # ~1e-7
print("隐藏状态误差:", (h_n_official - h_n_manual).abs().max().item())
```

## LSTM反向传播：梯度高速公路

LSTM解决梯度消失的核心在于细胞状态的梯度传播：

```
∂C_t/∂C_{t-1} = f_t
```

这意味着细胞状态的梯度只乘以遗忘门的值，**不经过 tanh 或 sigmoid 的导数压缩**！

如果遗忘门 f_t ≈ 1（即模型决定"记住"），梯度几乎完整地传回去；只有当模型决定"忘记"时（f_t ≈ 0），梯度才会消失。

```
时间步: T → T-1 → T-2 → ... → 1
梯度流: δ_T → δ_T × f_T → δ_T × f_T × f_{T-1} → ...

只要 f_t 接近 1（模型不忘记），梯度就不会消失！
```

> 🔍 **深层思考：LSTM为什么真正解决了梯度消失**
>
> 标准RNN中，梯度经过：tanh'(a_t) × W_hh，而 tanh' 的最大值才1，加上W_hh的谱范数，梯度很容易消失。
>
> LSTM中，细胞状态的梯度只乘以 f_t（一个数量，0到1之间）。看似更容易消失，但关键是：**f_t 是模型自己学到的**，而不是固定的矩阵乘法。模型可以通过训练让 f_t ≈ 1，从而保持梯度通畅。这就是门控机制的精髓：将"梯度要不要消失"的控制权交给了模型本身。

## PyTorch中的LSTM实现

```python
import torch
import torch.nn as nn

# 创建LSTM
lstm = nn.LSTM(
    input_size=10,       # 输入维度
    hidden_size=20,      # 隐藏状态维度
    num_layers=2,        # 层数
    batch_first=True,    # batch优先
    dropout=0.3,         # 层间dropout（仅在num_layers>1时有效）
    bidirectional=True   # 双向
)

x = torch.randn(3, 5, 10)
output, (h_n, c_n) = lstm(x)

# 双向2层LSTM的输出：
print("Output:", output.shape)  # (3, 5, 40)  → 40 = 20*2（双向）
print("h_n:", h_n.shape)        # (4, 3, 20)  → 4 = 2层 × 2方向
print("c_n:", c_n.shape)        # (4, 3, 20)

# 如何取最后一层双向拼接的隐藏状态：
# h_n的排列：[前向层1, 前向层2, 后向层1, 后向层2]（PyTorch 1.x）
# 实际是：[层1前向, 层1后向, 层2前向, 层2后向]
h_last_forward = h_n[-2]   # 最后一层的前向
h_last_backward = h_n[-1]  # 最后一层的后向
h_concat = torch.cat([h_last_forward, h_last_backward], dim=1)  # (3, 40)
```

## 实践技巧：遗忘门偏置初始化

一个重要的工程技巧：**将遗忘门的偏置初始化为1（甚至更大）**。

**为什么**：训练初期，模型还没有学会什么该记什么该忘，默认行为应该是"先记住所有信息"，然后慢慢学会遗忘。如果遗忘门默认≈0.5（随机初始化），模型从一开始就大量遗忘，学习变得更困难。

```python
def init_lstm_forget_bias(lstm, value=1.0):
    """将LSTM的遗忘门偏置初始化为指定值"""
    for name, param in lstm.named_parameters():
        if 'bias' in name:
            # PyTorch中偏置的排列：[input, forget, cell, output]
            # 每段长度为hidden_size
            n = param.size(0)
            hidden_size = n // 4
            # 遗忘门对应的索引范围：[hidden_size, 2*hidden_size]
            param.data[hidden_size:2*hidden_size].fill_(value)

lstm = nn.LSTM(10, 20, batch_first=True)
init_lstm_forget_bias(lstm, value=1.0)
print("遗忘门偏置初始化为1.0，有利于训练初期保留记忆")
```

## LSTM变体：Peephole连接

标准LSTM中，门的计算只用到 h_{t-1} 和 x_t，而没有直接看细胞状态 C_{t-1}。Peephole LSTM让门能直接"窥视"细胞状态：

```
f_t = σ(W_f · [C_{t-1}, h_{t-1}, x_t] + b_f)  ← 加入了C_{t-1}
i_t = σ(W_i · [C_{t-1}, h_{t-1}, x_t] + b_i)  ← 加入了C_{t-1}
o_t = σ(W_o · [C_t,   h_{t-1}, x_t] + b_o)   ← 加入了C_t（当前）
```

Peephole在某些时序精度要求高的任务（如时序预测）上有帮助，因为门可以直接感知当前记忆的状态。PyTorch没有内置Peephole，需要自定义实现。

---


## GRU的设计哲学

GRU（Gated Recurrent Unit）是2014年Cho等人提出的LSTM简化版。GRU的出发点是：

**LSTM有两个独立的记忆（h和C），真的都需要吗？**

GRU的答案是：不一定。GRU合并了LSTM的细胞状态和隐藏状态，用两个门（而非三个）完成同样的功能。

```
LSTM: 3个门（输入、遗忘、输出）+ 细胞状态 + 隐藏状态
GRU:  2个门（更新、重置）+ 只有隐藏状态
```

## GRU数学公式

**重置门（Reset Gate）**：

```
r_t = σ(W_r · [h_{t-1}, x_t])
```

控制"过去的隐藏状态有多少参与计算新的候选状态"。r_t ≈ 0 时，候选状态几乎只看当前输入，完全"重置"之前的记忆。

**更新门（Update Gate）**：

```
z_t = σ(W_z · [h_{t-1}, x_t])
```

控制"保留多少旧状态 vs 接受多少新候选状态"。

**候选隐藏状态**：

```
h̃_t = tanh(W · [r_t ⊙ h_{t-1}, x_t])
```

注意 `r_t ⊙ h_{t-1}`：重置门决定了多少"旧记忆"参与候选计算。

**最终隐藏状态**：

```
h_t = (1 - z_t) ⊙ h_{t-1} + z_t ⊙ h̃_t
       ↑                        ↑
   保留旧状态的比例           接受新信息的比例
```

> 💡 **GRU中的更新门是LSTM遗忘门+输入门的合并**
>
> LSTM: C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t  （f和i是独立的）
>
> GRU:  h_t = (1-z_t) ⊙ h_{t-1} + z_t ⊙ h̃_t  （(1-z)和z互补，参数减半）
>
> GRU通过让遗忘门和输入门"互补"，用更少的参数达到类似效果。代价是略微降低了模型的灵活性。

## GRU vs LSTM 全面对比

| 对比维度 | LSTM | GRU |
|---------|------|-----|
| 参数量 | 4 × (hidden × (input+hidden) + hidden) | 3 × (hidden × (input+hidden) + hidden) |
| 门数量 | 3（输入、遗忘、输出） | 2（重置、更新） |
| 记忆单元 | h_t 和 C_t（分离） | 只有 h_t |
| 梯度流 | 通过细胞状态的"高速公路" | 通过 h_t 的直接传递 |
| 训练速度 | 较慢 | 较快（参数少约25%） |
| 长序列 | 更擅长（显式记忆分离） | 差距不大 |
| 小数据集 | 容易过拟合 | 较好（参数少） |
| 理论上限 | 更大的模型容量 | 较小 |

**实用选择建议**：
- **默认从GRU开始**：参数更少，训练更快，效果往往差不多
- **数据量大、任务复杂**：试试LSTM，可能有收益
- **超长序列（500+时间步）**：LSTM可能更稳定
- **需要快速验证想法**：GRU，节省时间

```python
# GRU API与LSTM几乎相同，只是没有细胞状态
gru = nn.GRU(input_size=10, hidden_size=20, num_layers=2,
             batch_first=True, bidirectional=True, dropout=0.3)

x = torch.randn(3, 5, 10)
output, h_n = gru(x)  # 注意：GRU只返回一个隐藏状态，不像LSTM返回(h_n, c_n)

print("GRU Output:", output.shape)  # (3, 5, 40)
print("GRU h_n:", h_n.shape)        # (4, 3, 20)
```

## PyTorch实现对比

```python
class GRUClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.gru = nn.GRU(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        embedded = self.dropout(self.embedding(x))  # (batch, seq, embed_dim)
        output, h_n = self.gru(embedded)

        # 拼接双向最后时刻的隐藏状态
        h_forward = h_n[0]  # (batch, hidden_dim)
        h_backward = h_n[1]
        h_concat = self.dropout(torch.cat([h_forward, h_backward], dim=1))

        return self.fc(h_concat)  # (batch, num_classes)
```

---


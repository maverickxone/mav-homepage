---
title: "PyTorch 中的 RNN 实现"
chapter: 3
readTime: 20
description: "nn.RNN 参数详解、输入输出格式、多层与双向 RNN、隐藏状态管理。"
---

## nn.RNN：基础循环层

### 从公式到代码：先建立映射关系

你已经知道RNN在每个时间步做的事情可以用一个公式描述：
$$
h_t = \tanh(W_{ih} x_t + b_{ih} + W_{hh} h_{t-1} + b_{hh})
$$
其中：

- $x_t $ 是当前时间步的输入
- $h_{t-1} $ 是上一时间步传来的隐藏状态
- $W_{ih} $、$W_{hh} $ 是两个权重矩阵
- $b_{ih} $、$b_{hh} $ 是偏置
- $h_t $ 是当前时间步输出的隐藏状态

**PyTorch的 `nn.RNN` 就是把这个公式封装好了。** 你不需要手写矩阵乘法，不需要手动循环时间步——`nn.RNN` 帮你全部搞定。你只需要告诉它几个关键的"尺寸信息"，它就能自动构建好所有参数，并在前向传播时跑完整个序列。

------

### 第一步：创建一个 RNN 层

python

```python
import torch.nn as nn

rnn = nn.RNN(input_size=10, hidden_size=20)
```

就这一行，一个完整的RNN层就建好了。但这里有两个参数需要你理解清楚，因为它们直接对应公式里的维度：

**`input_size=10`** — 每个时间步，你喂给RNN的向量有多长。

比如你在处理文字，每个词被表示成一个10维的向量，那 `input_size=10`。这对应公式里 $x_t $ 的维度。

**`hidden_size=20`** — 隐藏状态向量的长度。

这是RNN"记忆"的容量，也是每个时间步输出的向量长度。它决定了 $h_t $ 的维度，同时也决定了 $W_{hh} $ 是一个 $20 \times 20 $ 的方阵（因为 $h_{t-1} $ 也是20维的）。

> 💡 **直觉类比**：`input_size` 是"耳朵能听多少信息"，`hidden_size` 是"大脑有多大的工作记忆"。

------

### 第二步：理解数据的形状（Shape）

在把数据喂给RNN之前，你必须先搞清楚PyTorch期望的数据格式。

RNN处理的是**序列数据**，所以输入天然有三个维度：

| 维度       | 含义                     | 示例                 |
| ---------- | ------------------------ | -------------------- |
| batch_size | 一次处理多少条序列       | 5句话同时处理        |
| seq_len    | 每条序列有多少个时间步   | 每句话10个词         |
| input_size | 每个时间步输入向量的维度 | 每个词用10维向量表示 |

当你设置 `batch_first=True` 时（**推荐初学者始终开启**），输入张量的形状就是：

```
(batch_size, seq_len, input_size)
      5    ,   10   ,    10
```

如果不开启（默认），形状是 `(seq_len, batch_size, input_size)`，顺序不同，容易搞混，所以我们先统一用 `batch_first=True`。

------

### 第三步：构造输入数据

python

```python
import torch

batch_size = 5
seq_len = 10
input_size = 10  # 与创建RNN时一致

x = torch.randn(batch_size, seq_len, input_size)
```

`torch.randn(...)` 生成服从标准正态分布的随机张量，这里我们用随机数来模拟"真实数据"。实际项目里这里会是词嵌入、传感器读数等。

现在 `x` 的形状是 `(5, 10, 10)`，含义是：5条序列，每条序列10个时间步，每个时间步一个10维向量。

------

### 第四步：前向传播，拿到输出

python

```python
output, hidden = rnn(x)
```

注意这里返回了**两个东西**，这是初学者经常感到困惑的地方。让我们仔细拆解。

**`output`** — 每一个时间步的隐藏状态，全部打包在一起。

RNN从 $t=1 $ 跑到 $t=10 $，每步都产生一个 $h_t $， `output` 把这10个 $h_t $ 全部存下来了。形状是：

```
(batch_size, seq_len, hidden_size)
      5    ,   10   ,    20
```

**`hidden`** — 只保留**最后一个时间步**的隐藏状态 $h_{T} $。

你可以把它理解成"读完整个序列之后，RNN脑子里的最终记忆"。形状是：

```
(num_layers * num_directions, batch_size, hidden_size)
              1              ,      5    ,    20
```

`num_layers=1`（单层）、`num_directions=1`（单向），所以第一个维度是1。

> 💡 **关键关系**：对于单向、单层RNN，`hidden[0]` 和 `output[:, -1, :]` 是**完全相同的**，都是最后一个时间步的隐藏状态。`hidden` 只是PyTorch单独把它拿出来方便你用。

------

### 第五步：理解参数数量

创建好RNN后，你可以查看它到底有多少个可训练参数：

python

```python
total_params = sum(p.numel() for p in rnn.parameters())
print(f"RNN参数总数: {total_params}")  # 640
```

为什么是640？对照公式算一下：

- $W_{ih} $ 的形状： `hidden_size × input_size` = $20 \times 10 = 200 $
- $W_{hh} $ 的形状： `hidden_size × hidden_size` = $20 \times 20 = 400 $
- $b_{ih} $ 的形状： `hidden_size` = $20 $
- $b_{hh} $ 的形状： `hidden_size` = $20 $

合计：$200 + 400 + 20 + 20 = \mathbf{640} $

这个计算帮助你验证：你对网络结构的理解是否和PyTorch的实现一致。

------

### 第六步：认识其余参数

除了 `input_size` 和 `hidden_size`，`nn.RNN` 还有几个常用参数，我们逐一说明：

**`num_layers`** — 堆叠多少层RNN。

```
输入 x ──→ RNN层1 ──→ RNN层2 ──→ ... ──→ 输出
```

每一层的输出作为下一层的输入。层数越多，网络表达能力越强，但也更难训练。初学阶段用默认值 `1` 即可。

**`nonlinearity`** — 激活函数，可选 `'tanh'`（默认）或 `'relu'`。

对应公式里的 $\tanh $。改成 `'relu'` 有时训练更快，但梯度爆炸的风险更大。

**`dropout`** — 多层RNN时，层与层之间随机"丢弃"一部分神经元的概率。

这是一种正则化手段，防止过拟合。`num_layers=1` 时设置 `dropout` 无效（只有一层，没有"层间"可以dropout）。

**`bidirectional`** — 是否双向。

普通RNN只从左往右看序列；双向RNN同时从左往右和从右往左各跑一遍，然后把两个方向的隐藏状态拼接起来。`num_directions` 变成2，所以 `hidden` 的第一个维度变成 `num_layers * 2`。

------

### 完整实践代码

理解了以上每一步之后，再来看完整的代码就会清晰很多：

```python
import torch
import torch.nn as nn

# 创建RNN
rnn = nn.RNN(
    input_size=10,      # 每个时间步输入向量的维度
    hidden_size=20,     # 隐藏状态的维度（也是输出维度）
    num_layers=1,       # 堆叠RNN层数
    batch_first=True,   # True：输入形状 (batch, seq, feature)
                        # False：输入形状 (seq, batch, feature)
    nonlinearity='tanh',# 激活函数：'tanh' 或 'relu'
    dropout=0.0,        # 多层RNN时，层间的dropout概率
    bidirectional=False # 是否双向
)

# 查看参数数量
total_params = sum(p.numel() for p in rnn.parameters())
print(f"RNN参数总数: {total_params}")
# = hidden_size * (input_size + hidden_size) + hidden_size * 2（偏置）
# = 20 * (10 + 20) + 40 = 640

# 输入
batch_size = 5
seq_len = 10
x = torch.randn(batch_size, seq_len, input_size)

# 前向传播
output, hidden = rnn(x)

# output: 所有时间步的隐藏状态
# 形状: (batch, seq_len, hidden_size)
print("Output shape:", output.shape)  # torch.Size([5, 10, 20])

# hidden: 最后一个时间步的隐藏状态
# 形状: (num_layers * num_directions, batch, hidden_size)
print("Hidden shape:", hidden.shape)  # torch.Size([1, 5, 20])
```

**output vs hidden 的选择**：

```python
# 场景1：文本分类（只需要最终表示）
# 使用 hidden，因为只需要最后时刻的记忆
final_repr = hidden[-1]  # (batch, hidden_size)

# 场景2：命名实体识别（每个词都需要标注）
# 使用 output，因为需要每个时刻的输出
per_token_repr = output  # (batch, seq_len, hidden_size)

# 场景3：只取最后时刻的output（等价于hidden[-1]，对于单向）
last_output = output[:, -1, :]  # (batch, hidden_size)
```

总结成一句话：**分类任务用 `hidden`，序列标注任务用 `output`**。场景3则验证了前面说的等价关系：`hidden[-1]` 和 `output[:, -1, :]` 结果一样，PyTorch只是把最终状态单独抽出来放进 `hidden` 方便你取用。

> ⚠️ **注意**：`hidden[-1]` 中的 `-1` 是Python的负索引，表示取最后一层（当 `num_layers=1` 时，就是第0层，也就是唯一一层）。如果你使用多层RNN，`hidden` 的第一个维度会有多个元素，分别对应每一层的最终隐藏状态。

## nn.RNNCell：单个时间步的精细控制

有时候我们需要更细粒度的控制，比如根据前一步的输出决定下一步的输入。

```python
rnn_cell = nn.RNNCell(
    input_size=10,
    hidden_size=20,
    nonlinearity='tanh'
)

# 手动循环
batch_size, seq_len = 3, 8
x = torch.randn(batch_size, seq_len, 10)
h_t = torch.zeros(batch_size, 20)  # 初始隐藏状态

outputs = []
for t in range(seq_len):
    h_t = rnn_cell(x[:, t, :], h_t)  # 输入当前词，输出新隐藏状态
    outputs.append(h_t)

output = torch.stack(outputs, dim=1)  # (batch, seq_len, hidden_size)
print("手动RNN输出形状:", output.shape)
```

**什么时候用 RNNCell 而不是 RNN**：

- 需要在时间步之间插入自定义逻辑（如：条件判断）
- 实现beam search时，需要逐步生成
- 学习/调试时，想看清楚每个时间步发生了什么

## 多层RNN与双向RNN

**多层RNN（Stacked RNN）**：

```python
# 2层RNN：第1层的output作为第2层的input
rnn_2layer = nn.RNN(input_size=10, hidden_size=20, num_layers=2, batch_first=True)

x = torch.randn(3, 5, 10)
output, hidden = rnn_2layer(x)

# output: 最顶层（第2层）的所有时刻输出
print("Output shape:", output.shape)   # (3, 5, 20)

# hidden: 所有层最后时刻的隐藏状态
print("Hidden shape:", hidden.shape)   # (2, 3, 20)
# hidden[0] = 第1层最后时刻的隐藏状态
# hidden[1] = 第2层最后时刻的隐藏状态
```

**双向RNN（Bidirectional RNN）**：

```
前向RNN: x_1 → x_2 → x_3 → x_4
                              ↓ 捕捉"已看到的信息"
后向RNN: x_1 ← x_2 ← x_3 ← x_4
         ↑ 捕捉"之后会看到的信息"

在每个时刻，将前向和后向的隐藏状态拼接，得到双向隐藏状态。
```

```python
birnn = nn.RNN(input_size=10, hidden_size=20, num_layers=1,
               batch_first=True, bidirectional=True)

x = torch.randn(3, 5, 10)
output, hidden = birnn(x)

# output: (batch, seq_len, hidden_size * 2)
# 前hidden_size个维度是前向，后hidden_size个维度是后向
print("BiRNN Output:", output.shape)   # (3, 5, 40)

# hidden: (num_layers * 2, batch, hidden_size)
print("BiRNN Hidden:", hidden.shape)   # (2, 3, 20)
# hidden[0] = 前向最后时刻
# hidden[1] = 后向最后时刻（即x_1时刻，因为后向是从末尾开始的）
```

> 🔍 **深层思考：双向RNN的代价**
>
> 双向RNN的优势很明显：每个位置的表示同时包含"已看到"和"将要看到"的信息，这对于NER（命名实体识别）、词性标注等任务非常有帮助。
>
> 但它有一个重要限制：**无法用于实时/流式场景**。因为后向RNN需要看到整个序列才能开始计算。如果你在做语音识别，需要实时转文字，就不能用双向RNN（用户还没说完，你无法知道"后面会说什么"）。
>
> Transformer的双向注意力机制也有同样的限制，这是为什么GPT用单向（因果）注意力，而BERT用双向注意力的原因。

## 隐藏状态的初始化与管理

```python
# 方式1：零初始化（最常用，通常效果足够好）
h_0 = torch.zeros(num_layers, batch_size, hidden_size)

# 方式2：可学习的初始状态（有时能提升性能）
class RNNWithLearnedInit(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True)
        # 可学习的初始隐藏状态（注意：与batch无关）
        self.h0 = nn.Parameter(torch.zeros(1, 1, hidden_size))

    def forward(self, x):
        batch_size = x.size(0)
        # 扩展到整个batch
        h0 = self.h0.expand(-1, batch_size, -1).contiguous()
        output, hidden = self.rnn(x, h0)
        return output, hidden

# 方式3：处理连续序列时，传递上一步的隐藏状态（如语言模型）
# 注意：需要 .detach() 截断梯度，否则梯度会无限追溯到训练开始
hidden = None
for batch in data_loader:
    output, hidden = model(batch, hidden)
    hidden = hidden.detach()  # 截断梯度，防止内存泄漏
    loss = criterion(output, target)
    # ...
```

---


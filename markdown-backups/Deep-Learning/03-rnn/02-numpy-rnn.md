---
title: "用 NumPy 手写 RNN"
chapter: 2
readTime: 20
description: "从公式到代码，用 NumPy 实现 RNN 前向传播，与 PyTorch nn.RNN 对比验证。"
---

> **本章定位**：你刚刚学完 RNN 的数学原理和 BPTT，脑子里有公式，但公式还是"符号"，不是"代码"。本章的目标只有一个：**用 NumPy 把第一章的公式原原本本地写成可以运行的代码**，不借助任何深度学习框架。完成之后，你再去看 `nn.RNN`，会发现它只是帮你把这些步骤打了个包——而不是什么魔法。

------

## 为什么要在 PyTorch 之前手写一遍

如果你学过 Michael Nielsen 的《神经网络与深度学习》，你应该有印象：他用 NumPy 手写了 MLP 的前向传播和反向传播，每一步矩阵怎么乘、梯度怎么传，都清清楚楚。你看完之后，再去用 PyTorch 的 `nn.Linear`，就知道它在帮你做什么。

`nn.RNN` 也是一样。它把循环、矩阵乘法、激活函数、多时间步全部封装进去，你只需要喂数据，它吐输出。这对工程很好，但对学习来说，**如果你不知道里面发生了什么，`nn.RNN` 就只是一个黑盒**。

所以本章我们先不用 PyTorch。只用 NumPy，只实现**前向传播**，把第一章的这个公式彻底变成代码：

$$h_t = \tanh!\left(W_{ih}, x_t + b_{ih} + W_{hh}, h_{t-1} + b_{hh}\right)$$

反向传播（BPTT）的代码实现我们暂时跳过——因为 PyTorch 的 autograd 会帮我们处理，而且手写 BPTT 的代码复杂度远高于前向传播，容易喧宾夺主。本章的核心目标是：**让公式和代码之间不再有距离感**。

------

## 动手实现

### 准备工作

```python
import numpy as np

# 固定随机种子，保证每次运行结果一致，方便调试
np.random.seed(42)
```

然后定义好我们要用的所有维度。这几个数字对应的就是第一章讲过的概念，先把它们写下来：

```python
input_size  = 4   # x_t 的维度：每个时间步输入向量有多长
hidden_size = 3   # h_t 的维度：隐藏状态向量有多长
seq_len     = 5   # 序列长度：一共有多少个时间步
batch_size  = 1   # 先处理单条序列，batch=1，之后再推广
```

> 这里故意把维度取得很小（4、3、5），是为了让你之后打印出来能一眼看清楚每个矩阵的内容，而不是被一大堆数字淹没。

------

### 第一步：初始化权重和偏置

回忆公式里有四个可学习的参数：$W_{ih}$、$W_{hh}$、$b_{ih}$、$b_{hh}$。

用公式推一下每个参数的形状：

- $W_{ih}$ 负责把输入 $x_t$（`input_size` 维）变换到隐藏空间（`hidden_size` 维），所以形状是 $(\text{hidden_size},\ \text{input_size})$
- $W_{hh}$ 负责把上一步的隐藏状态 $h_{t-1}$（`hidden_size` 维）映射回隐藏空间（`hidden_size` 维），所以形状是 $(\text{hidden_size},\ \text{hidden_size})$
- $b_{ih}$ 和 $b_{hh}$ 都是偏置，形状都是 $(\text{hidden_size},)$

```python
# W_ih：输入到隐藏层的权重矩阵，形状 (hidden_size, input_size)
W_ih = np.random.randn(hidden_size, input_size) * 0.1

# W_hh：隐藏层到隐藏层的权重矩阵，形状 (hidden_size, hidden_size)
W_hh = np.random.randn(hidden_size, hidden_size) * 0.1

# b_ih：输入分支的偏置，形状 (hidden_size,)
b_ih = np.zeros(hidden_size)

# b_hh：隐藏分支的偏置，形状 (hidden_size,)
b_hh = np.zeros(hidden_size)

print("W_ih shape:", W_ih.shape)   # (3, 4)
print("W_hh shape:", W_hh.shape)   # (3, 3)
print("b_ih shape:", b_ih.shape)   # (3,)
print("b_hh shape:", b_hh.shape)   # (3,)
```

`* 0.1` 是为了让初始权重偏小，避免 tanh 一开始就饱和。真实训练中 PyTorch 有更精细的初始化策略（如 Kaiming 初始化），这里不展开。

------

### 第二步：准备输入序列和初始隐藏状态

```python
# 构造一条随机输入序列
# 形状：(seq_len, input_size)，即 (5, 4)
# 注意这里不考虑 batch 维度，先处理单条序列
x_seq = np.random.randn(seq_len, input_size)

print("输入序列形状:", x_seq.shape)   # (5, 4)
print("第0个时间步输入 x_0:", x_seq[0])
```

初始隐藏状态 $h_0$，通常初始化为全零向量——这是 PyTorch `nn.RNN` 的默认行为，也是最常见的做法：

```python
# h_0：初始隐藏状态，形状 (hidden_size,)
h = np.zeros(hidden_size)

print("初始隐藏状态 h_0:", h)   # [0. 0. 0.]
```

------

### 第三步：手写单个时间步的计算

这是最核心的一步。把公式翻译成代码，**一行对应一行**：

$$h_t = \tanh!\left(\underbrace{W_{ih}, x_t + b_{ih}}*{\text{输入分支}} + \underbrace{W*{hh}, h_{t-1} + b_{hh}}_{\text{记忆分支}}\right)$$

```python
# 取出第 0 个时间步的输入
x_t = x_seq[0]   # 形状 (4,)

# 输入分支：W_ih @ x_t + b_ih
# W_ih 形状 (3, 4)，x_t 形状 (4,)，矩阵乘法结果形状 (3,)
input_branch = W_ih @ x_t + b_ih

# 记忆分支：W_hh @ h + b_hh
# W_hh 形状 (3, 3)，h 形状 (3,)，矩阵乘法结果形状 (3,)
hidden_branch = W_hh @ h + b_hh

# 两个分支相加，过 tanh 激活
h_new = np.tanh(input_branch + hidden_branch)

print("输入分支 W_ih @ x_t + b_ih :", input_branch)
print("记忆分支 W_hh @ h  + b_hh  :", hidden_branch)
print("新的隐藏状态 h_1             :", h_new)
print("h_1 形状                    :", h_new.shape)  # (3,)
```

就这几行代码，就是整个 RNN 的核心计算单元。`nn.RNN` 里面做的，和这里完全一样，只是它还额外处理了 batch、多层、双向等情况。

> **停下来想一想**：`input_branch` 提取了当前时刻的信息，`hidden_branch` 携带了过去时刻积累的记忆，两者相加再过 tanh，就得到了融合了历史和当下的新记忆 $h_t$。这就是 RNN "循环"的全部秘密。

------

### 第四步：把单步计算展开成完整序列

单步计算弄清楚之后，把它包进一个 for 循环，就能处理完整序列了：

```python
# 重置隐藏状态
h = np.zeros(hidden_size)

# 用来收集每个时间步输出的 h_t，对应 nn.RNN 返回的 output
outputs = []

for t in range(seq_len):
    x_t = x_seq[t]                          # 取出第 t 步的输入，形状 (4,)

    input_branch  = W_ih @ x_t + b_ih       # 输入分支
    hidden_branch = W_hh @ h  + b_hh        # 记忆分支

    h = np.tanh(input_branch + hidden_branch)  # 更新隐藏状态

    outputs.append(h.copy())                 # 保存这一步的输出
    
    print(f"  t={t}  h_{t+1} = {h}")

# 把 outputs 列表转成数组，形状 (seq_len, hidden_size)
outputs = np.array(outputs)

print("\n所有时间步输出 (output):")
print("形状:", outputs.shape)    # (5, 3)
print(outputs)

print("\n最后一个时间步的隐藏状态 (hidden):")
print("形状:", h.shape)          # (3,)
print(h)
```

运行之后，你会看到 5 个时间步逐步打印出来，每一步的 $h_t$ 都在变化，因为它在不断吸收新的输入信息，同时保留之前积累的记忆。

------

## 与 PyTorch 对比验证

### 第五步：和 PyTorch 的 nn.RNN 对比验证

手写版本写完了，现在做一件非常重要的事：**用 PyTorch 创建一个参数完全相同的 RNN，对比两者的输出是否一致**。如果一致，说明我们的手写版本是正确的。

```python
import torch
import torch.nn as nn

# 创建 nn.RNN，参数和手写版本完全相同
rnn_torch = nn.RNN(
    input_size=input_size,
    hidden_size=hidden_size,
    num_layers=1,
    batch_first=False,   # 这里用 False，输入形状 (seq_len, batch, input_size)
    nonlinearity='tanh'
)

# ── 关键步骤：把我们手写的 NumPy 权重塞进 PyTorch 的 RNN ──
# nn.RNN 内部把 W_ih 和 b_ih 存为 weight_ih_l0 和 bias_ih_l0
# 我们需要用 no_grad() 手动赋值，绕过 autograd 的追踪
with torch.no_grad():
    rnn_torch.weight_ih_l0.copy_(torch.tensor(W_ih, dtype=torch.float32))
    rnn_torch.weight_hh_l0.copy_(torch.tensor(W_hh, dtype=torch.float32))
    rnn_torch.bias_ih_l0.copy_(torch.tensor(b_ih, dtype=torch.float32))
    rnn_torch.bias_hh_l0.copy_(torch.tensor(b_hh, dtype=torch.float32))

# 把输入序列转成 PyTorch 张量
# nn.RNN 期望的形状：(seq_len, batch_size, input_size)
# 我们的序列是单条，batch_size=1，所以用 unsqueeze(1) 加上 batch 维度
x_torch = torch.tensor(x_seq, dtype=torch.float32).unsqueeze(1)  # (5, 1, 4)

# 初始隐藏状态也要加上 batch 维度：(num_layers, batch_size, hidden_size)
h0_torch = torch.zeros(1, 1, hidden_size)

# 前向传播
output_torch, hidden_torch = rnn_torch(x_torch, h0_torch)

print("PyTorch output 形状:", output_torch.shape)   # (5, 1, 3)
print("PyTorch hidden 形状:", hidden_torch.shape)   # (1, 1, 3)

# 把 PyTorch 的结果转回 NumPy，去掉 batch 维度，方便比较
output_torch_np = output_torch.detach().numpy().squeeze(1)  # (5, 3)
hidden_torch_np = hidden_torch.detach().numpy().squeeze()   # (3,)

print("\n── 对比结果 ──")
print("NumPy手写 output:\n", outputs)
print("PyTorch  output:\n", output_torch_np)

# 检查两者是否足够接近（允许浮点误差，设置容差 1e-6）
all_close = np.allclose(outputs, output_torch_np, atol=1e-6)
print("\n两者是否一致:", all_close)   # 应该输出 True
```

如果输出 `True`，恭喜你——你刚刚用 30 行 NumPy 代码，复现了 PyTorch `nn.RNN` 的核心计算逻辑。

> ⚠️ **关于 `rnn_torch.weight_ih_l0`**：你可能好奇 PyTorch 为什么用这个名字。`l0` 代表第 0 层（layer 0），如果你有 `num_layers=2`，就会有 `weight_ih_l0` 和 `weight_ih_l1`。这个命名规则在第二章介绍 `nn.RNN` 的参数时还会再提到。

------

### 把手写代码整理成一个函数

最后，把上面散落的代码整理成一个干净的函数，方便你之后查阅：

```python
def numpy_rnn_forward(x_seq, W_ih, W_hh, b_ih, b_hh, h0=None):
    """
    手写 RNN 前向传播。
    
    参数：
        x_seq : ndarray, 形状 (seq_len, input_size)
        W_ih  : ndarray, 形状 (hidden_size, input_size)
        W_hh  : ndarray, 形状 (hidden_size, hidden_size)
        b_ih  : ndarray, 形状 (hidden_size,)
        b_hh  : ndarray, 形状 (hidden_size,)
        h0    : ndarray, 形状 (hidden_size,)，默认全零
    
    返回：
        outputs : ndarray, 形状 (seq_len, hidden_size)，所有时间步的 h_t
        h       : ndarray, 形状 (hidden_size,)，最后一个时间步的 h_t
    """
    seq_len, input_size = x_seq.shape
    hidden_size = W_hh.shape[0]
    
    h = np.zeros(hidden_size) if h0 is None else h0.copy()
    outputs = []

    for t in range(seq_len):
        x_t = x_seq[t]
        h = np.tanh(W_ih @ x_t + b_ih + W_hh @ h + b_hh)
        outputs.append(h.copy())

    return np.array(outputs), h


# 验证函数
outputs_fn, h_final_fn = numpy_rnn_forward(x_seq, W_ih, W_hh, b_ih, b_hh)
print("函数输出是否和之前一致:", np.allclose(outputs_fn, outputs))  # True
```

整个函数的核心只有三行：取输入、算公式、存结果。剩下全是准备工作。

------

## 小结

| 公式符号                  | 对应代码            | 形状（本章示例） |
| ------------------------- | ------------------- | ---------------- |
| $x_t$                     | `x_seq[t]`          | `(4,)`           |
| $h_{t-1}$                 | `h`（循环变量）     | `(3,)`           |
| $W_{ih}$                  | `W_ih`              | `(3, 4)`         |
| $W_{hh}$                  | `W_hh`              | `(3, 3)`         |
| $W_{ih} x_t + b_{ih}$     | `W_ih @ x_t + b_ih` | `(3,)`           |
| $W_{hh} h_{t-1} + b_{hh}$ | `W_hh @ h + b_hh`   | `(3,)`           |
| $h_t$                     | `h`（更新后）       | `(3,)`           |
| 所有时间步的输出          | `outputs`           | `(5, 3)`         |

**你在本章完成了什么：**

1. 把数学公式翻译成了逐行可运行的 NumPy 代码
2. 理解了 RNN "循环"的本质：就是一个 for 循环，每步用同一套权重处理当前输入和上一步记忆
3. 用 PyTorch 验证了手写结果的正确性，并且看到了 `nn.RNN` 内部权重的命名方式

**你还没有做的（留给 PyTorch 去处理）：**

- Batch 维度的并行处理
- 多层 RNN 的堆叠
- 双向 RNN
- 反向传播和参数更新（autograd 负责）

带着这些认知，现在可以翻到**第二章**了。你会发现 `nn.RNN` 的每一个参数，都有你在这里动手做过的某件事与之对应。

---


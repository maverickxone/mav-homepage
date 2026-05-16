# RNN实战篇：循环神经网络与序列数据处理

> 作者：USTC学生 | 适用人群：**零基础 / 深度学习初学者**
> 特别说明：本笔记面向中科大大一大二同学，即使你之前没有接触过循环神经网络，也能完全理解本笔记的所有内容。
> 更新时间：2026年3月（增强版）

---

### 前置知识说明

在开始本章学习之前，你需要了解：
- **Python基础**：会写循环、函数、类等
- **PyTorch基础**：第一章的PyTorch基础（张量创建、基本操作、自动求导等）
- **神经网络基础**：了解什么是全连接层、激活函数等（见第一章）
- **高中数学**：知道什么是矩阵、向量、导数。

---

## 目录

- [前言：什么是序列数据](#前言什么是序列数据)
- [第一章：RNN基础概念与数学原理](#第一章rnn基础概念与数学原理)
- [第二章：PyTorch中的RNN实现](#第二章pytorch中的rnn实现)
- [第三章：长短期记忆网络LSTM](#第三章长短期记忆网络lstm)
- [第四章：GRU门控循环单元](#第四章gru门控循环单元)
- [第五章：字符级语言模型（RNN的灵魂应用）](#第五章字符级语言模型rnn的灵魂应用)
- [第六章：文本数据处理与词嵌入](#第六章文本数据处理与词嵌入)
- [第七章：实战：文本分类与情感分析](#第七章实战文本分类与情感分析)
- [第八章：序列到序列（Seq2Seq）与注意力](#第八章序列到序列seq2seq与注意力)
- [第九章：高级主题与最佳实践](#第九章高级主题与最佳实践)
- [第十章：时间序列预测](#第十章时间序列预测)
- [第十一章：从RNN到Transformer——历史的终结](#第十一章从rnn到transformer历史的终结)
- [常见错误与解决方案](#常见错误与解决方案)
- [RNN快速查阅表](#rnn快速查阅表)
- [总结与下一步](#总结与下一步)

---

## 前言：什么是序列数据

### 日常生活中的序列数据

序列数据在我们的生活中无处不在：

**文本数据**是最常见的序列。一句话中每个单词都不是独立的，"我今天去图书馆看书"，顺序决定语义。把顺序打乱变成"图书馆看我去书"，所有词都在，但完全无法理解——**顺序是序列数据的本质特征**。

**时间序列数据**同样无处不在。股票价格、气温变化、心电图信号，都是随时间变化的序列。某个时间点的值与之前的值有关联。

**音频数据**是时间轴上连续变化的信号。语音识别需要理解音频片段之间的时序关系。

**视频数据**是帧的序列，每一帧与前后帧紧密相关，动作识别依赖这种时序信息。

### 序列任务的5种类型

常规任务可以分成以下几种：

```
一对一 (one-to-one)：普通分类
输入：[x] → 输出：[y]
例子：图片分类（不是序列任务，CNN或MLP做）

一对多 (one-to-many)：从一个输入生成序列
输入：[x] → 输出：[y1, y2, y3, ...]
例子：图片描述（给一张图片，生成一段话）

多对一 (many-to-one)：从序列得到一个输出
输入：[x1, x2, x3] → 输出：[y]
例子：情感分析（一段话 → 正面/负面）

多对多（同步）：每个时刻都有输出
输入：[x1, x2, x3] → 输出：[y1, y2, y3]
例子：词性标注（每个词 → 名词/动词/形容词...）

多对多（异步）：输入完毕后才开始输出
输入：[x1, x2, ..., xn] → 输出：[y1, y2, ..., ym]
例子：机器翻译（读完英文句子，输出中文）
```

后4种类型对应了RNN的大部分实际应用场景。

### 序列数据 vs 图像数据

| 特征 | 图像数据 | 序列数据 |
|------|---------|---------|
| 数据结构 | 网格（像素） | 链式（时间步） |
| 关键假设 | 空间局部性 | 时序依赖性 |
| 关键挑战 | 平移不变性 | 变长、长程依赖 |
| 主要模型 | CNN | RNN/Transformer |
| 顺序重要吗 | 否（可以小幅度旋转图片） | 是（不能打乱句子） |

### 传统方法的局限

在RNN出现之前，处理序列数据主要靠手工提取特征（词频、TF-IDF、n-gram），然后输入传统机器学习模型。核心问题有两个：

首先，**特征工程耗时耗力**，不同任务需要完全不同的特征设计。

其次，**无法捕捉长距离依赖**。"虽然他昨天很晚才睡，但是今天他还是很早**起床**"——要预测"起床"，需要记住很久之前的"很晚才睡"。n-gram只能捕捉局部信息，无法处理这类长距离关联。

### RNN的核心思想

RNN的核心思想是引入**循环机制**——网络有一个"记忆"（隐藏状态），每处理一个新输入，就将当前输入与之前的记忆结合，生成新的记忆和输出。

---

## 第一章：RNN基础概念与数学原理

### 1.1 为什么需要RNN

要理解RNN的必要性，我们先看看用全连接网络（FCN）处理序列会遇到什么问题。

**问题1：输入长度固定**。FCN要求固定大小的输入。但句子长度不固定——有的3个词，有的50个词。如果用最大长度padding，短句子会有大量无效信息。

**问题2：无法利用顺序信息**。FCN把所有输入一起处理，"我爱你"和"你爱我"会产生完全不同的语义，但如果我们只是把词向量加起来，这两者的结果是一样的。

**问题3：参数数量随长度爆炸**。如果序列长100，每个词100维，输入就是10000维，第一层全连接的参数量极大。

RNN通过**共享参数**解决了这些问题。

> 🔍 **深层思考：参数共享的深意**
>
> RNN在所有时间步使用同样的权重矩阵（W_ih, W_hh）。这不只是节省参数的技巧，背后有深刻的含义：
>
> **它是一种归纳偏置（Inductive Bias）**。参数共享隐含地假设"处理第t个词的规则与处理第t+5个词的规则相同"。这就像我们阅读时，理解"爱"这个字的方法，不会因为它是句子的第2个字还是第8个字而不同。
>
> **它使RNN能泛化到任意长度序列**。训练时序列长度可以是50，推理时可以是100，因为网络的"规则"是与位置无关的。
>
> 类比：这就像用同一个for循环处理不同长度的数组，而不是把每次迭代写成不同的代码块。RNN就是序列处理的"for循环"。

**Mav's Tips：**

### 1.2 RNN的工作原理与结构

**基本结构**：

```
                     输出 y_1    输出 y_2    输出 y_3
                       ↑           ↑           ↑
隐藏状态: h_0 ——→ [ RNN ] ——→ [ RNN ] ——→ [ RNN ] ——→ h_3
                       ↑           ↑           ↑
                    输入 x_1    输入 x_2    输入 x_3

每个 [ RNN ] 单元内部做同样的事情：
输入: x_t（当前词）+ h_{t-1}（之前的记忆）
输出: h_t（新记忆）+ y_t（当前时刻的输出，可选）
```

注意：所有时间步的 `[ RNN ]` 用的是**完全相同的权重**，只是输入不同。

**循环与展开**：

RNN通常画成一个有自环的单元，这个"自环"就是隐藏状态传递给自己。当我们把它在时间维度上"展开"时，就变成了上面那个线性结构，看起来像一个很深的前馈网络——只不过每层用相同的权重。

### 1.3 前向传播数学推导

**符号定义**：

| 符号 | 含义 | 形状 |
|------|------|------|
| x_t | 第t步输入向量 | (input_size,) |
| h_t | 第t步隐藏状态 | (hidden_size,) |
| y_t | 第t步输出 | (output_size,) |
| W_ih | 输入→隐藏权重 | (hidden_size, input_size) |
| W_hh | 隐藏→隐藏权重 | (hidden_size, hidden_size) |
| W_hy | 隐藏→输出权重 | (output_size, hidden_size) |
| b_h | 隐藏层偏置 | (hidden_size,) |

**前向传播公式**：

```
h_t = tanh(W_ih @ x_t + W_hh @ h_{t-1} + b_h)   ← 隐藏状态更新
y_t = W_hy @ h_t + b_y                             ← 输出计算（可选）
```

其中 `@` 表示矩阵乘法，`tanh` 是双曲正切激活函数。

**维度验证（以批量处理为例）**：

设 batch_size=B, hidden_size=H, input_size=D：

```
X_t @ W_ih.T:  (B, D)  @  (D, H)  = (B, H)  ✓
h_{t-1} @ W_hh.T: (B, H) @ (H, H) = (B, H)  ✓
相加后 tanh: (B, H) → (B, H)         ✓
```

**手动实现形状的验证**：

```python
import torch
import torch.nn as nn

# 参数设置
input_size = 10
hidden_size = 20
batch_size = 3

# 手动创建权重（模拟nn.RNN的内部实现）
W_ih = torch.randn(hidden_size, input_size)
W_hh = torch.randn(hidden_size, hidden_size)
b_h = torch.zeros(hidden_size)

# 单个时间步的手动前向传播
x_t = torch.randn(batch_size, input_size)
h_prev = torch.zeros(batch_size, hidden_size)

# 公式：h_t = tanh(x_t @ W_ih.T + h_{t-1} @ W_hh.T + b_h)
h_next = torch.tanh(x_t @ W_ih.T + h_prev @ W_hh.T + b_h)
print("手动计算的隐藏状态形状:", h_next.shape)  # (3, 20)

```

### 1.4 反向传播（BPTT）数学推导

RNN的反向传播称为"通过时间反向传播"（Backpropagation Through Time, BPTT）。

**核心思想**：将RNN展开成一个普通的深度网络，然后从最后一个时间步开始反向传播梯度。

**步骤分解**：

1. 展开：把T步的RNN展开成一个T层的前馈网络
2. 计算每步损失：L = Σ_{t=1}^{T} L_t （这步比较关键）
3. 从t=T开始，向t=1反向传播
4. 累加所有时间步对参数的梯度

**关键梯度推导**：

设 δ_t = ∂L/∂a_t（t时刻隐藏状态的梯度）

对于最后一步T：
```
δ_T = (∂L_T/∂y_T) @ W_hy.T ⊙ tanh'(a_T)
```
其中 a_T = W_ih @ x_T + W_hh @ h_{T-1} + b_h，tanh'(x) = 1 - tanh²(x)

对于中间步骤 t（从T-1到1往回算）：
```
δ_t = (δ_{t+1} @ W_hh.T + ∂L_t/∂y_t @ W_hy.T) ⊙ tanh'(a_t)
       ↑                    ↑
    来自下一时刻的梯度    来自当前时刻输出损失的梯度
```

**参数梯度**（对权重求梯度，需要对所有时间步求和）：

```
∂L/∂W_hh = Σ_{t=1}^{T} δ_t @ h_{t-1}.T   ← 关键：所有时间步梯度累加
∂L/∂W_ih = Σ_{t=1}^{T} δ_t @ x_t.T
∂L/∂b_h  = Σ_{t=1}^{T} δ_t
```

> 💡 **直觉理解BPTT**
>
> 想象你在看一篇侦探小说，发现结尾写错了。现在你要找出是哪里的伏笔埋错了（从结尾往前找）。BPTT就是这个过程：从最终的"写错了"（损失函数）出发，一步步往前追溯"责任"（梯度），找到每个时间步、每个权重"应该负多少责任"（参数梯度）。
>
> 关键点：由于RNN所有时间步共享权重，每个权重的最终梯度是它在所有时间步贡献的梯度之**和**。

**Mav's Tips：**沉下心来自己推导，15分钟基本上就明了了——关键在于Loss函数定义是L_1+L_2+...+L_n，而L_i有相应参数关联，直接计算即可。

### 1.5 梯度消失与梯度爆炸——RNN的阿喀琉斯之踵

这是RNN面临的核心问题，也是LSTM和GRU被发明的直接原因。

**为什么会发生**：

梯度从时间步T传播到时间步k，需要经过T-k次矩阵乘法：
```
δ_k ≈ δ_T × (W_hh)^(T-k)
```

设 W_hh 的最大特征值（谱范数）为 λ_max：
- 若 λ_max < 1：梯度随距离指数衰减 → **梯度消失**
- 若 λ_max > 1：梯度随距离指数爆炸 → **梯度爆炸**

```python
import numpy as np

# 演示梯度消失
W = np.random.randn(5, 5) * 0.5  # 谱范数 < 1
grad = np.ones(5)

print("梯度随时间步传播的变化（梯度消失示例）：")
for step in range(10):
    grad = W.T @ grad
    print(f"  步骤 {step+1}: 梯度范数 = {np.linalg.norm(grad):.6f}")
# 你会看到梯度迅速趋近于0

print("\n梯度随时间步传播的变化（梯度爆炸示例）：")
W2 = np.random.randn(5, 5) * 2  # 谱范数 > 1
grad2 = np.ones(5)
for step in range(10):
    grad2 = W2.T @ grad2
    print(f"  步骤 {step+1}: 梯度范数 = {np.linalg.norm(grad2):.2f}")
# 你会看到梯度迅速爆炸
```

**梯度消失的实际影响**：

网络"记不住"很久之前的信息。在"虽然这部电影剧情不太好，但演员表演非常出色，导演的镜头语言也很精彩，所以我还是**喜欢**这部电影"这句话中，"喜欢"要依赖很久之前的"演员表演非常出色"，梯度消失的RNN很难学到这种关联。

**梯度爆炸的实际影响**：

权重更新幅度极大，Loss突然变成NaN，训练完全失控。

**Mav's Tips：**之前学MLP的时候就有过梯度消失/爆炸，这里本质是一样的。
当时是采用了crossEntropy代替sigmoid。

### 1.6 深层思考：为什么用tanh而不是ReLU？

这是个很好的问题，很多初学者会问。

**tanh的优势**：

1. **有界**：tanh输出范围在(-1, 1)。如果隐藏状态无界增长，经过多次时间步后数值会爆炸。tanh天然防止这种"激活值爆炸"。

2. **零中心化**：tanh(0)=0，输出均值接近0。相比之下sigmoid输出均值约0.5，会引起梯度更新的"锯齿效应"。

3. **梯度合适**：tanh'(0)=1，在0附近梯度较大，有利于训练。

**ReLU在RNN中为什么不好用**：

```python
# 设想用ReLU的RNN
# h_t = ReLU(W_hh @ h_{t-1} + W_ih @ x_t)
# 若W_hh的某个特征值 > 1，则激活值会随时间步指数爆炸
# tanh的饱和特性虽然会导致梯度消失，但至少激活值不会爆炸
```

**但也有ReLU RNN的研究**：

2015年，Le等人提出了IRNN（Identity RNN），将W_hh初始化为单位矩阵、使用ReLU激活，在某些任务上效果不错。核心思想是：单位矩阵初始化使W_hh的特征值都为1，梯度既不消失也不爆炸。

> 🔍 **深层思考：激活函数选择的本质权衡**
>
> 在RNN中，我们面临一个两难困境：
> - **非线性太弱**（如恒等激活）：RNN退化成线性系统，表达能力有限
> - **非线性太强**（如激活函数饱和区）：梯度消失，难以学习长距离依赖
>
> tanh是个折中：在0附近近似线性（利于梯度传播），远离0时饱和（防止爆炸）。
>

---

## 第 1.1 章：用 NumPy 手写 RNN——在封装之前先摸清底层

> **本章定位**：你刚刚学完 RNN 的数学原理和 BPTT，脑子里有公式，但公式还是"符号"，不是"代码"。本章的目标只有一个：**用 NumPy 把第一章的公式原原本本地写成可以运行的代码**，不借助任何深度学习框架。完成之后，你再去看 `nn.RNN`，会发现它只是帮你把这些步骤打了个包——而不是什么魔法。

------

### 为什么要在 PyTorch 之前手写一遍

如果你学过 Michael Nielsen 的《神经网络与深度学习》，你应该有印象：他用 NumPy 手写了 MLP 的前向传播和反向传播，每一步矩阵怎么乘、梯度怎么传，都清清楚楚。你看完之后，再去用 PyTorch 的 `nn.Linear`，就知道它在帮你做什么。

`nn.RNN` 也是一样。它把循环、矩阵乘法、激活函数、多时间步全部封装进去，你只需要喂数据，它吐输出。这对工程很好，但对学习来说，**如果你不知道里面发生了什么，`nn.RNN` 就只是一个黑盒**。

所以本章我们先不用 PyTorch。只用 NumPy，只实现**前向传播**，把第一章的这个公式彻底变成代码：

$$h_t = \tanh!\left(W_{ih}, x_t + b_{ih} + W_{hh}, h_{t-1} + b_{hh}\right)$$

反向传播（BPTT）的代码实现我们暂时跳过——因为 PyTorch 的 autograd 会帮我们处理，而且手写 BPTT 的代码复杂度远高于前向传播，容易喧宾夺主。本章的核心目标是：**让公式和代码之间不再有距离感**。

------

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

### 本章小结

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

## 第二章：PyTorch中的RNN实现

### 2.1 nn.RNN：基础循环层

#### 从公式到代码：先建立映射关系

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

#### 第一步：创建一个 RNN 层

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

#### 第二步：理解数据的形状（Shape）

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

#### 第三步：构造输入数据

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

#### 第四步：前向传播，拿到输出

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

#### 第五步：理解参数数量

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

#### 第六步：认识其余参数

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

#### 完整实践代码

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

### 2.2 nn.RNNCell：单个时间步的精细控制

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

### 2.3 多层RNN与双向RNN

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

### 2.4 隐藏状态的初始化与管理

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

## 第三章：长短期记忆网络LSTM

### 3.1 LSTM的诞生背景——从问题出发

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

### 3.2 LSTM门的数学原理

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

### 3.3 LSTM前向传播：完整手动实现

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

### 3.4 LSTM反向传播：梯度高速公路

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

### 3.5 PyTorch中的LSTM实现

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

### 3.6 实践技巧：遗忘门偏置初始化

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

### 3.7 LSTM变体：Peephole连接

标准LSTM中，门的计算只用到 h_{t-1} 和 x_t，而没有直接看细胞状态 C_{t-1}。Peephole LSTM让门能直接"窥视"细胞状态：

```
f_t = σ(W_f · [C_{t-1}, h_{t-1}, x_t] + b_f)  ← 加入了C_{t-1}
i_t = σ(W_i · [C_{t-1}, h_{t-1}, x_t] + b_i)  ← 加入了C_{t-1}
o_t = σ(W_o · [C_t,   h_{t-1}, x_t] + b_o)   ← 加入了C_t（当前）
```

Peephole在某些时序精度要求高的任务（如时序预测）上有帮助，因为门可以直接感知当前记忆的状态。PyTorch没有内置Peephole，需要自定义实现。

---

## 第四章：GRU门控循环单元

### 4.1 GRU的设计哲学

GRU（Gated Recurrent Unit）是2014年Cho等人提出的LSTM简化版。GRU的出发点是：

**LSTM有两个独立的记忆（h和C），真的都需要吗？**

GRU的答案是：不一定。GRU合并了LSTM的细胞状态和隐藏状态，用两个门（而非三个）完成同样的功能。

```
LSTM: 3个门（输入、遗忘、输出）+ 细胞状态 + 隐藏状态
GRU:  2个门（更新、重置）+ 只有隐藏状态
```

### 4.2 GRU数学公式

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

### 4.3 GRU vs LSTM 全面对比

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

### 4.4 PyTorch实现对比

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

## 第五章：字符级语言模型——RNN的灵魂应用

这一章介绍RNN最经典、最能体现其本质的应用：**字符级语言模型**。它能让RNN学会写诗、生成代码、甚至模仿莎士比亚。

### 5.1 什么是语言模型

**语言模型（Language Model）**：给定一段文本的前缀，预测下一个字符（或词）是什么。

```
输入：  "今 天 天 气 真"
预测下一个字符：P(好) = 0.3, P(不) = 0.25, P(很) = 0.2, ...

依次往后：
输入：  "今 天 天 气 真 好"
预测：  P(，) = 0.4, P(啊) = 0.2, ...
```

语言模型既是一个独立的任务，也是生成文本的基础工具。

**为什么叫字符级（Character-level）**？

- 词级语言模型：以词为单位，词汇表大（几万到几十万），每步预测下一个词
- 字符级语言模型：以字符（字母/汉字）为单位，词汇表小（几百个），每步预测下一个字符

字符级模型的优势：词汇表极小（英文只有95个可打印ASCII字符），天然处理未知词（OOV），能学到拼写规律。

### 5.2 困惑度（Perplexity）：衡量语言模型的标准

**困惑度**是衡量语言模型好坏的标准指标。

直觉理解：如果模型在每个位置需要在 k 个字符中"猜"，困惑度就约等于 k。困惑度越低，模型越确定，预测越准。

数学定义：
```
Perplexity = exp(平均每字符的交叉熵损失)
           = exp(L)
```

- 随机猜测（均匀分布）：困惑度 = 词汇表大小（英文字符 ≈ 95）
- 好的字符级模型：困惑度 < 10
- 完美模型：困惑度 = 1

```python
import math

def compute_perplexity(model, data_loader, criterion, device):
    model.eval()
    total_loss = 0
    total_tokens = 0

    with torch.no_grad():
        for x, y in data_loader:
            x, y = x.to(device), y.to(device)
            output, _ = model(x)
            loss = criterion(output.view(-1, output.size(-1)), y.view(-1))
            total_loss += loss.item() * y.numel()
            total_tokens += y.numel()

    avg_loss = total_loss / total_tokens
    perplexity = math.exp(avg_loss)
    return perplexity
```

### 5.3 字符级RNN实现

```python
import torch
import torch.nn as nn
import numpy as np

# ===== 数据准备 =====
# 读取文本（这里用一个简单例子，实际可以是任何文本）
text = """
人之初，性本善。性相近，习相远。
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。子不学，断机杼。
窦燕山，有义方。教五子，名俱扬。
养不教，父之过。教不严，师之惰。
"""

# 建立字符词汇表
chars = sorted(set(text))
vocab_size = len(chars)
char2idx = {ch: i for i, ch in enumerate(chars)}
idx2char = {i: ch for ch, i in char2idx.items()}

print(f"词汇表大小: {vocab_size}")
print(f"文本长度: {len(text)}")

# 将文本转换为索引序列
encoded = [char2idx[ch] for ch in text]


# ===== 数据集 =====
class CharDataset(torch.utils.data.Dataset):
    def __init__(self, encoded, seq_len):
        self.data = encoded
        self.seq_len = seq_len

    def __len__(self):
        return len(self.data) - self.seq_len

    def __getitem__(self, idx):
        # 输入：一段字符序列
        x = torch.tensor(self.data[idx:idx+self.seq_len], dtype=torch.long)
        # 标签：向右移动一位（预测每个位置的下一个字符）
        y = torch.tensor(self.data[idx+1:idx+self.seq_len+1], dtype=torch.long)
        return x, y


dataset = CharDataset(encoded, seq_len=30)
loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)


# ===== 字符级语言模型 =====
class CharLM(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, vocab_size)
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

    def forward(self, x, hidden=None):
        # x: (batch, seq_len)
        embedded = self.dropout(self.embedding(x))  # (batch, seq_len, embed_dim)
        output, hidden = self.lstm(embedded, hidden)
        output = self.dropout(output)
        logits = self.fc(output)  # (batch, seq_len, vocab_size)
        return logits, hidden

    def init_hidden(self, batch_size, device):
        h = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        c = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        return h, c


# ===== 训练 =====
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = CharLM(vocab_size=vocab_size, embed_dim=32, hidden_dim=128,
               num_layers=2, dropout=0.3).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.002)

for epoch in range(50):
    model.train()
    total_loss = 0

    for x, y in loader:
        x, y = x.to(device), y.to(device)
        batch_size = x.size(0)

        hidden = model.init_hidden(batch_size, device)
        logits, hidden = model(x, hidden)
        hidden = tuple(h.detach() for h in hidden)  # 截断梯度

        loss = criterion(logits.view(-1, vocab_size), y.view(-1))

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item()

    if (epoch + 1) % 10 == 0:
        avg_loss = total_loss / len(loader)
        ppl = math.exp(avg_loss)
        print(f"Epoch {epoch+1}: Loss={avg_loss:.4f}, Perplexity={ppl:.2f}")
```

### 5.4 文本生成：温度采样

训练完成后，可以让模型"续写"文本：

```python
def generate_text(model, start_text, length=200, temperature=1.0, device='cpu'):
    """
    生成文本

    temperature 参数控制"创造性"：
    - temperature 很小（如0.2）：保守，总是选概率最高的字，输出重复
    - temperature = 1.0：正常采样
    - temperature 很大（如2.0）：随机，输出多样但可能不通顺
    """
    model.eval()
    chars = [char2idx[ch] for ch in start_text if ch in char2idx]
    input_tensor = torch.tensor([chars], dtype=torch.long).to(device)

    hidden = model.init_hidden(1, device)
    generated = start_text

    with torch.no_grad():
        # 先"预热"——让模型处理起始文本
        for i in range(len(chars) - 1):
            _, hidden = model(input_tensor[:, i:i+1], hidden)

        # 开始生成
        current_char = input_tensor[:, -1:]
        for _ in range(length):
            logits, hidden = model(current_char, hidden)

            # 温度缩放
            logits = logits[0, -1, :] / temperature
            probs = torch.softmax(logits, dim=-1)

            # 按概率采样（而不是总是选最大值）
            next_char_idx = torch.multinomial(probs, 1).item()
            next_char = idx2char[next_char_idx]

            generated += next_char
            current_char = torch.tensor([[next_char_idx]], dtype=torch.long).to(device)

    return generated

# 生成示例
print("=== temperature=0.5（保守）===")
print(generate_text(model, "人之初", temperature=0.5, device=device))

print("\n=== temperature=1.0（正常）===")
print(generate_text(model, "人之初", temperature=1.0, device=device))
```

> 🔍 **深层思考：语言模型是什么的本质**
>
> 字符级语言模型看起来只是在"猜下一个字"，但实际上它在做更深刻的事情：它**学习了文本的统计规律、语法结构、甚至某种意义上的语义**。
>
> Andrej Karpathy在2015年的经典博文"The Unreasonable Effectiveness of Recurrent Neural Networks"中展示了用字符级RNN训练莎士比亚著作后，模型能生成貌似合理的莎士比亚风格文本；训练C代码后，能生成语法大致正确的C代码（甚至会写注释）。
>
> 这暗示了一个深刻的观点：**理解语言，在某种程度上等价于能够预测下一个词**。这正是GPT系列模型的核心思想——在海量文本上训练语言模型，涌现出强大的语言理解和生成能力。

---

## 第六章：文本数据处理与词嵌入

### 6.1 文本预处理完整流程

在实际项目中，文本预处理往往占据大量工作。

**步骤1：分词（Tokenization）**

```python
import re

# 英文分词（按空格和标点分割）
def tokenize_en(text):
    text = text.lower()
    tokens = re.findall(r"\b[\w']+\b", text)
    return tokens

# 中文分词（需要jieba或类似工具）
import jieba
def tokenize_zh(text):
    return list(jieba.cut(text))

# 测试
en_text = "I love natural language processing! It's amazing."
print("英文分词:", tokenize_en(en_text))
# ['i', 'love', 'natural', 'language', 'processing', "it's", 'amazing']

zh_text = "我爱自然语言处理，它真的很神奇！"
print("中文分词:", tokenize_zh(zh_text))
```

**步骤2：建立词汇表**

```python
from collections import Counter

class Vocabulary:
    """词汇表：管理词到索引的映射"""
    SPECIAL_TOKENS = ['<pad>', '<unk>', '<sos>', '<eos>']
    PAD_IDX = 0
    UNK_IDX = 1
    SOS_IDX = 2
    EOS_IDX = 3

    def __init__(self, min_freq=1, max_size=None):
        self.min_freq = min_freq
        self.max_size = max_size
        self.word2idx = {}
        self.idx2word = {}
        self.word_count = Counter()

    def build(self, sentences):
        """从句子列表构建词汇表"""
        for sentence in sentences:
            self.word_count.update(sentence)

        # 添加特殊token
        for i, tok in enumerate(self.SPECIAL_TOKENS):
            self.word2idx[tok] = i
            self.idx2word[i] = tok

        # 按频率排序，过滤低频词
        sorted_words = sorted(self.word_count.items(),
                              key=lambda x: -x[1])
        idx = len(self.SPECIAL_TOKENS)
        for word, count in sorted_words:
            if count < self.min_freq:
                break
            if self.max_size and idx >= self.max_size:
                break
            self.word2idx[word] = idx
            self.idx2word[idx] = word
            idx += 1

        print(f"词汇表构建完成：{len(self.word2idx)} 个词")
        return self

    def encode(self, word):
        return self.word2idx.get(word, self.UNK_IDX)

    def decode(self, idx):
        return self.idx2word.get(idx, '<unk>')

    def sentence_to_indices(self, sentence, add_sos=False, add_eos=False):
        indices = [self.encode(w) for w in sentence]
        if add_sos:
            indices = [self.SOS_IDX] + indices
        if add_eos:
            indices = indices + [self.EOS_IDX]
        return indices

    def __len__(self):
        return len(self.word2idx)
```

**步骤3：Padding与批处理**

```python
def collate_batch(batch, vocab, max_len=None):
    """
    DataLoader的collate_fn：将不等长的句子padding到同一长度

    这个函数在DataLoader内部被调用，每次处理一个batch
    """
    texts, labels = zip(*batch)

    # 将每个句子转换为索引序列
    sequences = [torch.tensor(vocab.sentence_to_indices(text), dtype=torch.long)
                 for text in texts]

    # 计算padding长度
    if max_len:
        lengths = [min(len(seq), max_len) for seq in sequences]
    else:
        lengths = [len(seq) for seq in sequences]

    # Padding（用PAD_IDX补齐到最长序列）
    padded = torch.zeros(len(sequences), max(lengths), dtype=torch.long)
    for i, (seq, length) in enumerate(zip(sequences, lengths)):
        padded[i, :length] = seq[:length]

    labels = torch.tensor(labels, dtype=torch.long)
    lengths = torch.tensor(lengths, dtype=torch.long)

    return padded, labels, lengths
```

### 6.2 One-Hot编码的问题与词嵌入的优势

**One-Hot编码**：词汇表大小10000，每个词是一个10000维向量，只有对应位置为1。

问题：
1. **维度爆炸**：10000维向量，稀疏，计算浪费
2. **无法表达词义**："猫"和"狗"的One-Hot向量余弦相似度=0，但它们语义上很接近
3. **词义关系**：One-Hot无法表达 king - man + woman ≈ queen 这类关系

**词嵌入**：将每个词映射到一个低维稠密向量（通常100-300维）。

```python
embedding = nn.Embedding(num_embeddings=10000, embedding_dim=300, padding_idx=0)

# 输入：词的整数索引
# 输出：对应的嵌入向量
x = torch.LongTensor([[1, 2, 3, 0, 0],   # 句子1，最后两个是padding
                       [4, 5, 6, 7, 8]])  # 句子2

embedded = embedding(x)  # (2, 5, 300)
print("嵌入后形状:", embedded.shape)

# 注意：padding_idx=0 表示idx=0的词（<pad>）的嵌入向量保持为0，不参与训练
```

### 6.3 Word2Vec：词嵌入的训练方法

**词嵌入是怎么学到的？**

最经典的方法是Word2Vec（2013年，Mikolov等人）。核心思想是"一个词的语义，由它的上下文决定"（Distributional Hypothesis）。

**两种训练方式**：

```
CBOW（Continuous Bag of Words）：
用上下文词预测中心词

["今天", ___, "天气"] → 预测 "的"
（用周围的词预测中间的词）

Skip-gram：
用中心词预测上下文词

"的" → 预测 "今天", "天气"
（用中间的词预测周围的词）
```

**Word2Vec的神奇性质**：

```python
# 词嵌入空间中可以做词语类比
# 国王 - 男人 + 女人 ≈ 女王

def word_analogy(embeddings, word_a, word_b, word_c, vocab):
    """计算 word_a - word_b + word_c 最接近的词"""
    vec_a = embeddings[vocab.encode(word_a)]
    vec_b = embeddings[vocab.encode(word_b)]
    vec_c = embeddings[vocab.encode(word_c)]

    target = vec_a - vec_b + vec_c
    target = target / target.norm()  # 归一化

    # 找最近邻
    all_vecs = embeddings / embeddings.norm(dim=1, keepdim=True)
    similarities = all_vecs @ target
    best_idx = similarities.argmax().item()

    return vocab.decode(best_idx)

# 理想情况下：
# word_analogy(E, "国王", "男人", "女人") → "女王"
# word_analogy(E, "北京", "中国", "法国") → "巴黎"
```

### 6.4 使用预训练词向量

实际项目中，从头训练词嵌入需要大量数据。通常使用预训练好的词向量：

```python
import numpy as np

def load_glove_embeddings(glove_path, vocab, embed_dim=300):
    """
    加载GloVe预训练词向量

    GloVe文件格式：每行 "词 数值1 数值2 ... 数值300"
    """
    pretrained = np.random.randn(len(vocab), embed_dim) * 0.01
    found = 0

    with open(glove_path, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            word = parts[0]
            if word in vocab.word2idx:
                vec = np.array(parts[1:], dtype=float)
                idx = vocab.word2idx[word]
                pretrained[idx] = vec
                found += 1

    print(f"找到 {found}/{len(vocab)} 个词的预训练向量")
    return torch.FloatTensor(pretrained)

# 加载到模型中
def load_pretrained_embedding(model_embedding, pretrained_tensor, freeze=False):
    """将预训练词向量加载到Embedding层"""
    model_embedding.weight.data.copy_(pretrained_tensor)

    if freeze:
        model_embedding.weight.requires_grad = False
        print("词嵌入已冻结（不参与训练）")
    else:
        print("词嵌入将在训练中微调")
```

> 🔍 **深层思考：是否冻结预训练词向量**
>
> 这是个常见的工程决策问题：
>
> **冻结**（freeze=True）：词嵌入不更新。优点：防止过拟合（尤其数据量少时），训练更快（少一批梯度计算）。缺点：无法根据具体任务调整词义。
>
> **微调**（freeze=False）：词嵌入随任务一起更新。优点：可以针对任务调整词义（比如"苹果"在科技文本中更偏向"Apple公司"，在食品文本中更偏向"水果"）。缺点：数据量小时容易过拟合。
>
> **实践建议**：数据量 < 10万时倾向冻结；数据量 > 100万时倾向微调。也可以两阶段训练：先冻结训练若干epoch，再解冻微调。

---

## 第七章：实战：文本分类与情感分析

### 7.1 完整数据流水线

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from collections import Counter
import re

# 数据准备
train_texts = [
    "I love this movie, it's absolutely amazing!",
    "Terrible film, complete waste of time.",
    "Great acting, beautiful cinematography, highly recommended!",
    "Boring plot, terrible dialogue, would not watch again.",
    "One of the best movies I've seen this year.",
    "Awful direction, makes no sense, avoid at all costs.",
    "Surprisingly good, exceeded my expectations!",
    "Disappointing sequel, fails to capture the original's charm.",
]
train_labels = [1, 0, 1, 0, 1, 0, 1, 0]  # 1=正面, 0=负面

val_texts = [
    "Wonderful experience, touching story.",
    "Not worth watching, very bad.",
]
val_labels = [1, 0]

# 分词和构建词汇表
def tokenize(text):
    return re.findall(r"\b[\w']+\b", text.lower())

all_tokens = [tok for text in train_texts for tok in tokenize(text)]
word_count = Counter(all_tokens)

# 词汇表（只用训练集构建！）
vocab = Vocabulary(min_freq=1)
vocab.build([tokenize(t) for t in train_texts])

# 数据集
class SentimentDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_len=50):
        self.max_len = max_len
        self.data = []
        for text, label in zip(texts, labels):
            tokens = tokenize(text)
            indices = [vocab.encode(t) for t in tokens]
            # 截断或padding
            if len(indices) >= max_len:
                indices = indices[:max_len]
            else:
                indices = indices + [Vocabulary.PAD_IDX] * (max_len - len(indices))
            self.data.append((torch.tensor(indices, dtype=torch.long),
                              torch.tensor(label, dtype=torch.long)))

    def __len__(self): return len(self.data)
    def __getitem__(self, idx): return self.data[idx]

train_dataset = SentimentDataset(train_texts, train_labels, vocab)
val_dataset = SentimentDataset(val_texts, val_labels, vocab)

train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=4)
```

### 7.2 基于BiLSTM+注意力的文本分类模型

```python
class SelfAttention(nn.Module):
    """简单的Self-Attention层，用于在LSTM输出上加权求和"""
    def __init__(self, hidden_dim):
        super().__init__()
        self.attention = nn.Linear(hidden_dim, 1)

    def forward(self, lstm_output, mask=None):
        """
        lstm_output: (batch, seq_len, hidden_dim)
        mask: (batch, seq_len)，True表示该位置是padding
        """
        # 计算注意力权重
        scores = self.attention(lstm_output).squeeze(-1)  # (batch, seq_len)

        # 对padding位置赋极小值，softmax后接近0
        if mask is not None:
            scores = scores.masked_fill(mask, float('-inf'))

        weights = torch.softmax(scores, dim=1)  # (batch, seq_len)

        # 加权求和
        context = (weights.unsqueeze(-1) * lstm_output).sum(dim=1)  # (batch, hidden_dim)
        return context, weights


class BiLSTMAttentionClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes,
                 num_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=num_layers,
                            batch_first=True, bidirectional=True,
                            dropout=dropout if num_layers > 1 else 0)
        self.attention = SelfAttention(hidden_dim * 2)  # 双向
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.layer_norm = nn.LayerNorm(hidden_dim * 2)

    def forward(self, x):
        # x: (batch, seq_len)
        padding_mask = (x == 0)  # True表示padding位置

        embedded = self.dropout(self.embedding(x))  # (batch, seq, embed_dim)

        lstm_out, _ = self.lstm(embedded)  # (batch, seq, hidden*2)
        lstm_out = self.dropout(lstm_out)

        # 注意力加权求和
        context, attn_weights = self.attention(lstm_out, padding_mask)

        context = self.layer_norm(context)

        logits = self.fc(self.dropout(context))  # (batch, num_classes)
        return logits, attn_weights
```

### 7.3 训练与评估

```python
from sklearn.metrics import classification_report, f1_score
import matplotlib.pyplot as plt

def train_epoch(model, loader, criterion, optimizer, device, clip_grad=1.0):
    model.train()
    total_loss = 0
    all_preds, all_labels = [], []

    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits, _ = model(x)
        loss = criterion(logits, y)

        optimizer.zero_grad()
        loss.backward()
        # 梯度裁剪：防止梯度爆炸
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=clip_grad)
        optimizer.step()

        total_loss += loss.item()
        preds = logits.argmax(dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(y.cpu().numpy())

    avg_loss = total_loss / len(loader)
    f1 = f1_score(all_labels, all_preds, average='weighted')
    return avg_loss, f1


def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            logits, _ = model(x)
            loss = criterion(logits, y)

            total_loss += loss.item()
            preds = logits.argmax(dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y.cpu().numpy())

    avg_loss = total_loss / len(loader)
    # 全面的评估指标：精确率、召回率、F1
    report = classification_report(all_labels, all_preds,
                                   target_names=['负面', '正面'],
                                   zero_division=0)
    return avg_loss, report


# 训练配置
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = BiLSTMAttentionClassifier(
    vocab_size=len(vocab), embed_dim=64, hidden_dim=64,
    num_classes=2, num_layers=2, dropout=0.3
).to(device)

# 处理类别不平衡（如果正负样本不均匀）
# class_weights = torch.tensor([1.0, 2.0]).to(device)  # 负面权重1，正面权重2
criterion = nn.CrossEntropyLoss()  # 可改为 weight=class_weights
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)

# 记录训练历史
history = {'train_loss': [], 'val_loss': [], 'train_f1': []}

for epoch in range(50):
    train_loss, train_f1 = train_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, val_report = evaluate(model, val_loader, criterion, device)
    scheduler.step()

    history['train_loss'].append(train_loss)
    history['val_loss'].append(val_loss)
    history['train_f1'].append(train_f1)

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}:")
        print(f"  Train Loss: {train_loss:.4f}, F1: {train_f1:.4f}")
        print(f"  Val Loss: {val_loss:.4f}")
        print(val_report)
```

### 7.4 推理：对新文本进行预测

```python
def predict(model, text, vocab, device, max_len=50):
    """对单条文本进行预测"""
    model.eval()
    tokens = tokenize(text)
    indices = [vocab.encode(t) for t in tokens]

    # 截断或padding
    if len(indices) >= max_len:
        indices = indices[:max_len]
    else:
        indices = indices + [Vocabulary.PAD_IDX] * (max_len - len(indices))

    x = torch.tensor([indices], dtype=torch.long).to(device)

    with torch.no_grad():
        logits, attn_weights = model(x)
        probs = torch.softmax(logits, dim=1)
        pred = probs.argmax(dim=1).item()
        confidence = probs[0, pred].item()

    label = "正面 😊" if pred == 1 else "负面 😞"
    print(f"文本: {text}")
    print(f"预测: {label}（置信度: {confidence:.2%}）")

    # 可视化注意力权重（哪些词最重要）
    weights = attn_weights[0, :len(tokens)].cpu().numpy()
    print("注意力权重（词→权重）：")
    for token, weight in zip(tokens, weights):
        bar = "█" * int(weight * 50)
        print(f"  {token:15s} {bar} {weight:.4f}")

    return pred, confidence

# 测试
predict(model, "This movie was absolutely wonderful!", vocab, device)
predict(model, "Terrible waste of time, very boring.", vocab, device)
```

> 🔍 **深层思考：Accuracy vs F1**
>
> 情感分析任务中，为什么要用F1而不只是准确率（Accuracy）？
>
> 假设数据集里90%是正面评论，10%是负面评论。如果模型把所有样本都预测为"正面"，准确率高达90%——但这个模型完全没用！
>
> F1综合了精确率（Precision，预测为正面的样本中真的是正面的比例）和召回率（Recall，真正的正面样本中有多少被找出来）。F1在类别不平衡时更能反映模型的真实表现。

---

## 第八章：序列到序列（Seq2Seq）与注意力

### 8.1 Seq2Seq架构

Seq2Seq用于将一个序列映射到另一个（可能不同长度的）序列，是机器翻译、文本摘要、对话系统的基础。

```
编码阶段：
"I love you" → Encoder → [上下文向量 c]

解码阶段（自回归）：
[c] → Decoder → "我"
["我", c] → Decoder → "爱"
["我", "爱", c] → Decoder → "你"
["我", "爱", "你", c] → Decoder → "<eos>"（结束）
```

**信息瓶颈问题**：

标准Seq2Seq的致命缺陷：编码器必须将整个输入序列的信息**压缩**到一个固定长度的向量中（LSTM的最后一个隐藏状态）。对于长句子，这个向量根本装不下所有信息。

这就是**注意力机制**被发明的原因。

### 8.2 Bahdanau注意力（Additive Attention）

Bahdanau等人在2015年提出：解码器在每一步不只依赖固定的上下文向量，而是动态地"关注"编码器序列的不同位置。

```
解码"我"时：主要看 "I"
解码"爱"时：主要看 "love"
解码"你"时：主要看 "you"
```

**数学公式**：

设编码器所有隐藏状态为 h_1, ..., h_T，解码器当前隐藏状态为 s_{t-1}。

```
步骤1：计算注意力分数（能量）
    e_{t,i} = v^T · tanh(W_s · s_{t-1} + W_h · h_i + b)
                 ↑  s_{t-1}和h_i的"兼容性"

步骤2：Softmax得到注意力权重
    α_{t,i} = softmax(e_{t,1}, ..., e_{t,T})_i

步骤3：加权求和，得到上下文向量
    c_t = Σ_i α_{t,i} · h_i
```

**完整实现**：

```python
class BahdanauAttention(nn.Module):
    """Bahdanau注意力（加性注意力）"""
    def __init__(self, encoder_hidden_dim, decoder_hidden_dim, attention_dim):
        super().__init__()
        self.W_encoder = nn.Linear(encoder_hidden_dim, attention_dim, bias=False)
        self.W_decoder = nn.Linear(decoder_hidden_dim, attention_dim, bias=False)
        self.v = nn.Linear(attention_dim, 1, bias=False)

    def forward(self, decoder_hidden, encoder_outputs, encoder_mask=None):
        """
        decoder_hidden: (batch, decoder_hidden_dim)
        encoder_outputs: (batch, src_len, encoder_hidden_dim)
        encoder_mask: (batch, src_len)，True表示padding位置

        返回：
        context: (batch, encoder_hidden_dim) - 上下文向量
        weights: (batch, src_len) - 注意力权重（可用于可视化）
        """
        src_len = encoder_outputs.size(1)

        # 将decoder隐藏状态扩展为 (batch, src_len, decoder_hidden_dim)
        decoder_hidden = decoder_hidden.unsqueeze(1).repeat(1, src_len, 1)

        # 计算能量
        energy = self.v(
            torch.tanh(self.W_encoder(encoder_outputs) +
                       self.W_decoder(decoder_hidden))
        ).squeeze(-1)  # (batch, src_len)

        # Mask掉padding位置
        if encoder_mask is not None:
            energy = energy.masked_fill(encoder_mask, float('-inf'))

        # Softmax
        weights = torch.softmax(energy, dim=1)  # (batch, src_len)

        # 加权求和
        context = torch.bmm(weights.unsqueeze(1), encoder_outputs).squeeze(1)
        # (batch, encoder_hidden_dim)

        return context, weights


class Encoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers, dropout):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers, batch_first=True,
                            dropout=dropout if n_layers > 1 else 0,
                            bidirectional=True)
        self.fc_h = nn.Linear(hidden_dim * 2, hidden_dim)  # 双向→单向
        self.fc_c = nn.Linear(hidden_dim * 2, hidden_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, src):
        # src: (batch, src_len)
        embedded = self.dropout(self.embedding(src))
        outputs, (hidden, cell) = self.lstm(embedded)
        # outputs: (batch, src_len, hidden*2) - 用于注意力计算
        # hidden: (n_layers*2, batch, hidden)

        # 合并双向隐藏状态（取最后一层）
        hidden = torch.tanh(self.fc_h(
            torch.cat([hidden[-2], hidden[-1]], dim=1)
        )).unsqueeze(0)  # (1, batch, hidden)

        cell = torch.tanh(self.fc_c(
            torch.cat([cell[-2], cell[-1]], dim=1)
        )).unsqueeze(0)

        return outputs, hidden, cell


class AttentionDecoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, encoder_hidden_dim,
                 decoder_hidden_dim, n_layers, dropout):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.attention = BahdanauAttention(encoder_hidden_dim * 2,
                                           decoder_hidden_dim, decoder_hidden_dim)
        self.lstm = nn.LSTM(embed_dim + encoder_hidden_dim * 2,
                            decoder_hidden_dim, n_layers, batch_first=True,
                            dropout=dropout if n_layers > 1 else 0)
        self.fc_out = nn.Linear(decoder_hidden_dim + encoder_hidden_dim * 2 + embed_dim,
                                vocab_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, tgt_token, hidden, cell, encoder_outputs, encoder_mask=None):
        """
        tgt_token: (batch,) - 当前解码器输入token
        hidden:    (1, batch, decoder_hidden_dim)
        encoder_outputs: (batch, src_len, encoder_hidden_dim*2)
        """
        tgt_token = tgt_token.unsqueeze(1)          # (batch, 1)
        embedded = self.dropout(self.embedding(tgt_token))  # (batch, 1, embed_dim)

        # 注意力
        context, attn_weights = self.attention(
            hidden[-1], encoder_outputs, encoder_mask
        )  # context: (batch, encoder_hidden_dim*2)

        # 拼接词嵌入和上下文向量，一起输入LSTM
        lstm_input = torch.cat([embedded, context.unsqueeze(1)], dim=2)
        # (batch, 1, embed_dim + encoder_hidden_dim*2)

        output, (hidden, cell) = self.lstm(lstm_input, (hidden, cell))

        # 三路拼接做最终预测
        prediction = self.fc_out(
            torch.cat([output.squeeze(1), context, embedded.squeeze(1)], dim=1)
        )  # (batch, vocab_size)

        return prediction, hidden, cell, attn_weights
```

### 8.3 Seq2Seq训练：Teacher Forcing与Exposure Bias

**Teacher Forcing**：训练时，解码器每一步的输入用真实标签（而不是模型的预测）。

```python
class Seq2Seq(nn.Module):
    def __init__(self, encoder, decoder, src_pad_idx):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.src_pad_idx = src_pad_idx

    def make_src_mask(self, src):
        """标记padding位置"""
        return (src == self.src_pad_idx)  # (batch, src_len)

    def forward(self, src, tgt, teacher_forcing_ratio=0.5):
        batch_size = src.size(0)
        tgt_len = tgt.size(1)

        encoder_outputs, hidden, cell = self.encoder(src)
        src_mask = self.make_src_mask(src)

        # 存储输出
        outputs = torch.zeros(batch_size, tgt_len, self.decoder.fc_out.out_features)
        outputs = outputs.to(src.device)

        # 解码器的第一个输入：<sos>
        dec_input = tgt[:, 0]

        for t in range(1, tgt_len):
            output, hidden, cell, _ = self.decoder(
                dec_input, hidden, cell, encoder_outputs, src_mask
            )
            outputs[:, t] = output

            # Teacher Forcing：随机决定用真实标签还是模型预测
            use_teacher_forcing = torch.rand(1).item() < teacher_forcing_ratio
            dec_input = tgt[:, t] if use_teacher_forcing else output.argmax(1)

        return outputs
```

> 🔍 **深层思考：Teacher Forcing的Exposure Bias问题**
>
> Teacher Forcing的设计很聪明：训练时给模型看真实标签，错误不会"雪球"滚大，训练更稳定。
>
> 但它有一个严重缺陷——**Exposure Bias（曝光偏差）**：
>
> - 训练时：解码器输入都是正确的词（真实标签）
> - 推理时：解码器输入是自己的预测（可能有错误）
>
> 这个训练-推理分布不一致，导致推理时错误会累积放大（第一步错了→第二步输入就不对→...）。
>
> **解决方案1：Scheduled Sampling**（Bengio et al. 2015）
> 训练时随机用真实标签或模型预测，随着训练进行，逐渐增大使用模型预测的概率。
>
> **解决方案2：直接优化序列级别的损失**（如BLEU分数），而不是逐词交叉熵。但序列级别的损失不可微，需要强化学习技巧。
>
> **Transformer的解法**：并行计算所有位置，用Mask Attention避免看到未来词，从根本上绕开了这个问题。

### 8.4 Beam Search解码

贪心解码（每步选概率最大的词）往往不是最优的。Beam Search是一种更好的解码策略。

```
贪心解码：
时刻1: I(0.5) love(0.3) ... → 选 I
时刻2: I+love(0.8) I+hate(0.1) ... → 选 love
最终: "I love"，概率 = 0.5 × 0.8 = 0.4

Beam Search（beam_size=2）：
时刻1: 保留前2个候选
    候选1: I (log_prob=-0.69)
    候选2: She (log_prob=-1.39)

时刻2: 对每个候选扩展，保留前2个
    I+love (log_prob=-0.69-0.22=-0.91)
    I+hate (log_prob=-0.69-2.30=-2.99)
    She+is (log_prob=-1.39-0.51=-1.90)
    She+was (log_prob=-1.39-0.92=-2.31)
    → 保留: "I love", "She is"

最终选择联合概率最高的序列
```

```python
def beam_search_decode(model, src, src_vocab, tgt_vocab,
                       beam_size=5, max_len=50, device='cpu'):
    """
    Beam Search解码

    beam_size: 每步保留的候选数
    """
    model.eval()

    with torch.no_grad():
        src = src.to(device)
        encoder_outputs, hidden, cell = model.encoder(src)
        src_mask = model.make_src_mask(src)

        # 初始beam：[(log_prob, token序列, hidden, cell)]
        sos_token = tgt_vocab.SOS_IDX
        eos_token = tgt_vocab.EOS_IDX

        beams = [(0.0, [sos_token], hidden, cell)]
        completed = []

        for step in range(max_len):
            all_candidates = []

            for log_prob, tokens, h, c in beams:
                if tokens[-1] == eos_token:
                    completed.append((log_prob, tokens))
                    continue

                dec_input = torch.tensor([tokens[-1]], dtype=torch.long).to(device)
                output, new_h, new_c, _ = model.decoder(
                    dec_input, h, c, encoder_outputs, src_mask
                )

                log_probs = torch.log_softmax(output, dim=1)[0]  # (vocab_size,)

                # 扩展到top-beam_size个候选
                top_log_probs, top_indices = log_probs.topk(beam_size)

                for new_log_prob, new_idx in zip(top_log_probs, top_indices):
                    candidate = (
                        log_prob + new_log_prob.item(),
                        tokens + [new_idx.item()],
                        new_h, new_c
                    )
                    all_candidates.append(candidate)

            if not all_candidates:
                break

            # 保留概率最高的beam_size个候选（用长度归一化）
            all_candidates.sort(
                key=lambda x: x[0] / len(x[1]),  # 按平均每词log概率排序
                reverse=True
            )
            beams = all_candidates[:beam_size]

        # 返回最佳结果
        if completed:
            best = max(completed, key=lambda x: x[0] / len(x[1]))
        else:
            best = max(beams, key=lambda x: x[0] / len(x[1]))

        # 将索引转换为词
        tokens = [tgt_vocab.decode(i) for i in best[1]
                  if i not in [tgt_vocab.SOS_IDX, tgt_vocab.PAD_IDX]]
        # 去掉EOS之后的部分
        if tgt_vocab.decode(tgt_vocab.EOS_IDX) in tokens:
            eos_pos = tokens.index(tgt_vocab.decode(tgt_vocab.EOS_IDX))
            tokens = tokens[:eos_pos]

        return ' '.join(tokens)
```

> 💡 **长度归一化的必要性**
>
> 不加归一化时，Beam Search总是偏向短序列（因为每个词都会让log概率更负）。
> 用 `log_prob / length` 归一化后，模型不会"为了避免出错而提前结束"。
> 实践中常用 `log_prob / length^α`，其中 α=0.6~0.7 是经验值。

---

## 第九章：高级主题与最佳实践

### 9.1 变长序列处理：Pack和Pad

实际中，同一个batch里的序列长度不同，需要padding。但让LSTM处理padding位置是浪费，而且会影响最终隐藏状态。

```python
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

class EfficientLSTM(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)

    def forward(self, x, lengths):
        """
        x: (batch, max_len, input_size) - 已padding的序列
        lengths: (batch,) - 每个序列的真实长度
        """
        # 按长度降序排序（pack_padded_sequence的要求）
        lengths_sorted, sort_idx = lengths.sort(descending=True)
        x_sorted = x[sort_idx]

        # 打包：告诉LSTM每个序列实际多长，不处理padding
        packed = pack_padded_sequence(
            x_sorted, lengths_sorted.cpu(), batch_first=True
        )

        # LSTM只处理有效token
        packed_output, (h_n, c_n) = self.lstm(packed)

        # 解包：还原padding格式
        output, _ = pad_packed_sequence(packed_output, batch_first=True)

        # 还原排序
        _, unsort_idx = sort_idx.sort()
        output = output[unsort_idx]
        h_n = h_n[:, unsort_idx, :]
        c_n = c_n[:, unsort_idx, :]

        return output, (h_n, c_n)
```

### 9.2 梯度裁剪的正确方式

```python
# ❌ 错误：按元素裁剪（改变梯度方向）
for param in model.parameters():
    if param.grad is not None:
        param.grad.data.clamp_(-1, 1)

# ✅ 正确：按全局范数裁剪（只改变幅度，不改变方向）
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

> 🔍 **为什么全局范数裁剪更好**
>
> 按元素裁剪时，大梯度被截断，小梯度不变，这会改变梯度的方向（各个维度之间的比例变了）。梯度方向决定了参数更新的"走向"，改变方向可能导致模型往错误的方向更新。
>
> 全局范数裁剪计算所有参数梯度的L2范数，如果超过阈值，等比例缩放所有梯度。这样梯度方向不变，只是走的步子小一点，是更合理的选择。

### 9.3 深层RNN与残差连接

```python
class DeepBiLSTM(nn.Module):
    """多层BiLSTM，层间有残差连接"""
    def __init__(self, input_size, hidden_size, num_layers, dropout=0.3):
        super().__init__()
        self.layers = nn.ModuleList()
        self.layer_norms = nn.ModuleList()
        self.projs = nn.ModuleList()

        for i in range(num_layers):
            in_size = input_size if i == 0 else hidden_size * 2
            self.layers.append(
                nn.LSTM(in_size, hidden_size, batch_first=True, bidirectional=True)
            )
            self.layer_norms.append(nn.LayerNorm(hidden_size * 2))
            # 如果维度不匹配，需要投影
            if in_size != hidden_size * 2:
                self.projs.append(nn.Linear(in_size, hidden_size * 2, bias=False))
            else:
                self.projs.append(None)

        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        for i, (layer, norm, proj) in enumerate(
            zip(self.layers, self.layer_norms, self.projs)
        ):
            residual = x
            output, _ = layer(x)
            output = self.dropout(output)

            # 残差连接（如果维度匹配）
            if proj is not None:
                residual = proj(residual)
            output = norm(output + residual)

            x = output

        return x
```

### 9.4 Layer Normalization in RNN

标准BN在RNN中效果差（batch统计在短序列上不稳定），LayerNorm是更好的选择：

```python
class LayerNormLSTMCell(nn.Module):
    """带LayerNorm的LSTM单元"""
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.lstm_cell = nn.LSTMCell(input_size, hidden_size)
        self.ln_h = nn.LayerNorm(hidden_size)  # 对隐藏状态归一化
        self.ln_c = nn.LayerNorm(hidden_size)  # 对细胞状态归一化

    def forward(self, x, hidden):
        h, c = hidden
        h_next, c_next = self.lstm_cell(x, (h, c))
        h_next = self.ln_h(h_next)
        c_next = self.ln_c(c_next)
        return h_next, c_next
```

### 9.5 学习率调度策略

```python
# 策略1：Warm-up + Cosine Decay（Transformer推荐）
from torch.optim.lr_scheduler import LambdaLR

def get_cosine_schedule_with_warmup(optimizer, num_warmup_steps, num_training_steps):
    def lr_lambda(current_step):
        if current_step < num_warmup_steps:
            return float(current_step) / float(max(1, num_warmup_steps))
        progress = float(current_step - num_warmup_steps) / float(
            max(1, num_training_steps - num_warmup_steps)
        )
        return max(0.0, 0.5 * (1.0 + math.cos(math.pi * progress)))
    return LambdaLR(optimizer, lr_lambda)

# 策略2：ReduceLROnPlateau（验证集不再改善时降低学习率）
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=3, verbose=True
)
scheduler.step(val_loss)  # 每个epoch结束时调用

# 策略3：CyclicLR（循环学习率）
scheduler = torch.optim.lr_scheduler.CyclicLR(
    optimizer, base_lr=1e-4, max_lr=1e-2, step_size_up=500
)
```

### 9.6 Dropout策略

```python
class RNNWithDropout(nn.Module):
    """
    RNN中常见的3种Dropout位置
    """
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        # Dropout 1：嵌入层后（防止模型记住特定词的绝对位置）
        self.embed_dropout = nn.Dropout(0.2)

        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)

        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=2,
                            batch_first=True,
                            # Dropout 2：层间（PyTorch内置，不作用于最后一层输出）
                            dropout=0.3)

        # Dropout 3：全连接层前（防止过拟合）
        self.fc_dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        embedded = self.embed_dropout(self.embedding(x))
        output, (hidden, _) = self.lstm(embedded)
        return self.fc(self.fc_dropout(hidden[-1]))
```

---

## 第十章：时间序列预测

RNN不只用于NLP，时间序列预测是它的另一大应用领域：股票价格、天气预报、传感器数据。

### 10.1 时间序列的特点

```python
import numpy as np
import torch
import torch.nn as nn

# 生成一个含噪声的正弦波时间序列（模拟周期性数据）
def generate_sine_wave(length=1000, period=50, noise_level=0.1):
    t = np.linspace(0, length / period * 2 * np.pi, length)
    signal = np.sin(t) + noise_level * np.random.randn(length)
    return signal.astype(np.float32)

data = generate_sine_wave()

# 可视化（如果在Jupyter中）
# import matplotlib.pyplot as plt
# plt.plot(data[:200])
# plt.title("正弦波（含噪声）")
# plt.show()
```

### 10.2 滑动窗口构建数据集

```python
class TimeSeriesDataset(torch.utils.data.Dataset):
    """
    滑动窗口法：
    - 输入：过去 seq_len 个时间步的值
    - 标签：未来 pred_len 个时间步的值
    """
    def __init__(self, data, seq_len=50, pred_len=10):
        self.seq_len = seq_len
        self.pred_len = pred_len

        # 归一化
        self.mean = data.mean()
        self.std = data.std()
        data_norm = (data - self.mean) / self.std

        # 构建样本
        self.X, self.y = [], []
        for i in range(len(data_norm) - seq_len - pred_len + 1):
            self.X.append(data_norm[i:i+seq_len])
            self.y.append(data_norm[i+seq_len:i+seq_len+pred_len])

        self.X = torch.tensor(np.array(self.X)).unsqueeze(-1)  # (N, seq_len, 1)
        self.y = torch.tensor(np.array(self.y))               # (N, pred_len)

    def __len__(self): return len(self.X)
    def __getitem__(self, idx): return self.X[idx], self.y[idx]

    def inverse_transform(self, y):
        """还原归一化"""
        return y * self.std + self.mean
```

### 10.3 LSTM时间序列预测模型

```python
class LSTMForecaster(nn.Module):
    """LSTM时间序列预测"""
    def __init__(self, input_size=1, hidden_size=64, num_layers=2,
                 pred_len=10, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, dropout=dropout)
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, pred_len)

    def forward(self, x):
        # x: (batch, seq_len, input_size)
        output, (h_n, _) = self.lstm(x)
        # 取最后时刻的隐藏状态做预测
        last_hidden = self.dropout(h_n[-1])  # (batch, hidden_size)
        pred = self.fc(last_hidden)          # (batch, pred_len)
        return pred


# 训练
dataset = TimeSeriesDataset(data, seq_len=50, pred_len=10)
train_size = int(0.8 * len(dataset))
train_dataset, val_dataset = torch.utils.data.random_split(
    dataset, [train_size, len(dataset) - train_size]
)

train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=32)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = LSTMForecaster(pred_len=10).to(device)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(100):
    model.train()
    total_loss = 0
    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        pred = model(x)
        loss = criterion(pred, y)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 20 == 0:
        avg_loss = total_loss / len(train_loader)
        rmse = (avg_loss ** 0.5) * dataset.std  # 还原到原始尺度
        print(f"Epoch {epoch+1}: RMSE={rmse:.4f}")
```

> 🔍 **时间序列预测的陷阱：数据泄露**
>
> 处理时间序列时，必须严格保证测试集在时间上在训练集**之后**，不能随机划分！
>
> 如果随机划分，训练集里可能包含未来的数据点，模型可以"作弊"学到未来信息，导致测试准确率虚高。这在实际部署时会失效。
>
> 正确做法：按时间顺序划分，比如前80%作为训练集，中间10%作为验证集，后10%作为测试集。

---

## 第十一章：从RNN到Transformer——历史的终结

### 11.1 RNN的根本局限

尽管LSTM和GRU很强大，但RNN有一个根本性的架构缺陷：**串行计算**。

处理长度为T的序列，RNN必须执行T步串行计算（第t步必须等第t-1步完成）。这在GPU时代是个大问题——GPU的优势是并行，但RNN无法并行化。

```
RNN（串行）：        x1 → h1 → x2 → h2 → x3 → h3 → ...（必须等待）
Transformer（并行）：[x1, x2, x3, ...] → 同时处理所有位置
```

**计算效率对比**：
- RNN训练长度1000的序列：串行1000步
- Transformer训练长度1000的序列：1步（全并行）

### 11.2 注意力机制取代循环

Transformer（Vaswani et al., 2017, "Attention is All You Need"）完全放弃了RNN，改用Self-Attention：

```
Self-Attention的核心：
"在处理词i时，直接从所有其他位置j加权取信息，权重由i和j的相关性决定"

RNN的信息传递：x1 → h1 → h2 → h3 → ... → hT（间接，要经过多步）
Attention的信息传递：x1 → 直接连接到 xT（O(1)距离）
```

**长距离依赖的处理能力**：

| 特性 | RNN/LSTM | Transformer |
|------|---------|------------|
| 任意两点间最短路径 | O(T) | O(1) |
| 并行计算 | 不支持 | 支持 |
| 计算复杂度 | O(T) | O(T²)（注意力矩阵） |
| 长距离依赖 | 困难（梯度消失） | 容易 |
| 序列长度 | 可扩展 | 受内存限制（O(T²)） |

### 11.3 RNN仍然有价值吗？

**答案：是的，但适用场景在变化。**

RNN/LSTM仍然适合的场景：
1. **实时/流式处理**：不需要看到完整序列，逐步产生输出（如实时语音识别）
2. **资源受限**：RNN的参数量比Transformer少很多，适合嵌入式设备
3. **超长序列**：Transformer的注意力矩阵是O(T²)，T=100K时内存不够；RNN是O(T)
4. **物理系统建模**：RNN的状态传递结构天然适合物理系统的时序动力学

**近期进展**：

2024年，Mamba（Gu & Dao）和RWKV等架构重新引发了对RNN式架构的兴趣。这些"现代RNN"保留了RNN线性计算复杂度的优势，同时尝试弥补长程依赖的缺陷，被视为Transformer的潜在替代方案。

> 🔍 **深层思考：学RNN有没有价值**
>
> 有人问："既然Transformer这么强，为什么还要学RNN？"
>
> 原因有几个：
>
> **理解历史，才能理解现在**。Transformer的注意力机制，很大程度上是对RNN局限性的回应。不理解RNN的问题，就很难真正理解为什么Transformer要这样设计。
>
> **RNN是序列建模的基础语言**。LSTM中的门控机制、细胞状态、梯度高速公路等概念，在很多现代架构中以不同形式出现（Mamba的选择性状态空间、GRU式门控）。
>
> **工程实践中仍然有用**。许多生产系统仍在使用LSTM（轻量、推理快、适合流式）。理解它才能维护、优化这些系统。
>
> **深度学习的思维方式**。RNN教会你如何思考信息的"流动"、梯度的"传播"、架构设计如何影响模型能力。这些思维方式适用于所有深度学习架构。

---

## 常见错误与解决方案

### 错误1：维度混乱

```python
# ❌ 常见错误：输入维度顺序搞错
# batch_first=True时，应该是 (batch, seq, feature)
x = torch.randn(10, 32, 100)  # 错！这是 (seq, batch, feature)
x = torch.randn(32, 10, 100)  # ✓ batch=32, seq=10, feature=100

# ❌ Embedding输入类型错误
x = torch.randn(32, 10)        # 错！Embedding需要Long类型
x = torch.randint(0, 1000, (32, 10))  # ✓ Long类型整数索引

# ❌ 忘记LSTM返回两个值
output = lstm(x)        # 错！lstm返回 (output, (h_n, c_n))
output, (h, c) = lstm(x)  # ✓
```

### 错误2：隐藏状态管理不当

```python
# ❌ 跨batch不重置隐藏状态
model.hidden = None
for batch in loader:
    output, hidden = model(batch, model.hidden)
    model.hidden = hidden  # 错！梯度会一直追溯到训练开始，内存泄漏

# ✓ 正确：截断梯度
for batch in loader:
    output, hidden = model(batch, hidden)
    hidden = hidden.detach()  # 截断梯度图，只保留数值
```

### 错误3：测试集时忘记`torch.no_grad()`

```python
# ❌ 评估时没用no_grad，浪费内存，速度慢
for x, y in val_loader:
    output = model(x)  # 仍然在构建计算图

# ✓ 正确
model.eval()
with torch.no_grad():
    for x, y in val_loader:
        output = model(x)
```

### 错误4：损失函数包含Padding位置

```python
# ❌ 直接计算损失，padding位置的损失也被计入
loss = nn.CrossEntropyLoss()(logits.view(-1, vocab_size), y.view(-1))

# ✓ 忽略padding位置的损失
loss = nn.CrossEntropyLoss(ignore_index=0)(logits.view(-1, vocab_size), y.view(-1))
# ignore_index=0 表示idx=0（即<pad>）的位置不计入损失
```

### 错误5：双向LSTM隐藏状态拼接错误

```python
bilstm = nn.LSTM(10, 20, bidirectional=True, batch_first=True)
output, (h_n, c_n) = bilstm(x)

# ❌ 错误：直接取h_n[-1]（只有后向最后层）
last_hidden = h_n[-1]  # 只有后向

# ✓ 正确：拼接前向和后向
h_forward = h_n[-2]   # 最后一层前向
h_backward = h_n[-1]  # 最后一层后向
last_hidden = torch.cat([h_forward, h_backward], dim=1)  # (batch, 40)
```

### 错误6：梯度爆炸导致Loss变NaN

```python
# 症状：loss突然变成nan，参数包含inf

# ✓ 解决：在optimizer.step()之前加梯度裁剪
loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # ← 加在这里
optimizer.step()

# 调试：检查梯度是否有问题
for name, param in model.named_parameters():
    if param.grad is not None:
        print(f"{name}: grad_norm={param.grad.norm():.4f}")
```

---

## RNN快速查阅表

```python
# ============ 核心组件 ============
import torch
import torch.nn as nn

# RNN（基础，很少直接用）
rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
output, h_n = rnn(x)
# output: (batch, seq, hidden)  |  h_n: (num_layers, batch, hidden)

# LSTM（最常用）
lstm = nn.LSTM(input_size, hidden_size, num_layers,
               batch_first=True, dropout=0.3, bidirectional=True)
output, (h_n, c_n) = lstm(x)
# output: (batch, seq, hidden*2)  |  h_n,c_n: (num_layers*2, batch, hidden)

# GRU（LSTM的简化版）
gru = nn.GRU(input_size, hidden_size, num_layers, batch_first=True)
output, h_n = gru(x)

# Embedding
embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
embedded = embedding(x_long)  # x_long: LongTensor → embedded: FloatTensor


# ============ 文本分类模板 ============
class TextClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, x):
        embedded = self.dropout(self.embedding(x))
        _, (h_n, _) = self.lstm(embedded)
        # 拼接双向最后隐藏状态
        h = torch.cat([h_n[-2], h_n[-1]], dim=1)
        return self.fc(self.dropout(h))


# ============ 训练模板 ============
def train(model, loader, criterion, optimizer, clip=1.0):
    model.train()
    for x, y in loader:
        logits = model(x)
        loss = criterion(logits, y)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), clip)  # 别忘梯度裁剪！
        optimizer.step()


# ============ 变长序列处理 ============
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence
packed = pack_padded_sequence(x, lengths.cpu(), batch_first=True)
output, (h, c) = lstm(packed)
output, _ = pad_packed_sequence(output, batch_first=True)


# ============ 梯度裁剪 ============
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# ============ 损失函数忽略padding ============
criterion = nn.CrossEntropyLoss(ignore_index=0)
```

---

## 总结与下一步

### 本章知识树

```
RNN体系
├── 基础RNN
│   ├── 前向传播：h_t = tanh(W_ih·x_t + W_hh·h_{t-1})
│   ├── 反向传播：BPTT
│   ├── 梯度消失/爆炸（核心缺陷）
│   └── 参数共享的归纳偏置
│
├── 改进：门控机制
│   ├── LSTM（3门 + 细胞状态）
│   │   ├── 遗忘门：决定丢弃什么
│   │   ├── 输入门：决定记住什么
│   │   ├── 输出门：决定输出什么
│   │   └── 细胞状态：梯度高速公路
│   └── GRU（2门，LSTM简化版）
│       ├── 更新门（遗忘+输入合一）
│       └── 重置门
│
├── 经典应用
│   ├── 字符级语言模型（文本生成）
│   ├── 文本分类/情感分析（多对一）
│   ├── Seq2Seq翻译（多对多异步）
│   └── 时间序列预测
│
├── 关键技术
│   ├── 词嵌入（Embedding层）
│   ├── 注意力机制（Bahdanau）
│   ├── Beam Search解码
│   ├── Teacher Forcing & Exposure Bias
│   └── 梯度裁剪
│
└── 历史位置
    └── RNN → 注意力机制 → Transformer → 现代LLM
```

### 下一步学习路线

**直接后续（推荐接下来学）**：
- **Transformer与Self-Attention**：RNN的继承者，理解了RNN的局限后，Transformer的设计动机会非常清晰
- **BERT与GPT**：基于Transformer的预训练语言模型，是现代NLP的基础

**扩展应用**：
- **语音识别（CTC Loss）**：RNN在语音任务中的经典应用
- **时间序列预测（时序Transformer）**：RNN与Transformer在时序任务上的对比
- **强化学习中的RNN**：在部分可观测环境（POMDP）中，用LSTM记忆历史状态

**深入研究**：
- **Mamba/SSM**（2024+）：新型状态空间模型，试图结合RNN的线性复杂度和Transformer的并行训练优势

---

*本笔记是USTC学生深度学习笔记系列第三篇（增强版）*
*RNN不只是历史，它是理解序列建模的必经之路。*

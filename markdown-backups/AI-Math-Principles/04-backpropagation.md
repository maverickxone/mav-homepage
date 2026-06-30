---
title: "反向传播与训练优化"
chapter: 4
readTime: 50
description: "链式法则、反向传播算法的完整推导与手算、梯度消失与爆炸、残差连接、归一化、参数初始化"
---

## 本章导读

前一章我们搭建了神经网络的"骨架"——知道网络长什么样、前向传播怎么算。但还有一个核心问题没解决：**怎么找到那些好的权重？**

答案是**反向传播（Backpropagation, BP）算法**。它是训练神经网络的基石——通过链式法则系统地计算损失对每个参数的梯度，然后用梯度下降更新参数。

本章首先从数学上严格推导链式法则，然后一步步推导 BP 公式，用具体数值做一次完整手算，最后讨论深层网络训练中遇到的问题（梯度消失/爆炸）和对应的解决方案（激活函数、残差连接、归一化、参数初始化）。

---

## 链式法则——反向传播的数学基础

### 为什么需要链式法则

一个深度神经网络本质上是**复合函数**：

$$L = L(f_L(f_{L-1}(\cdots f_2(f_1(\boldsymbol{x}; \boldsymbol{W}^{(1)}); \boldsymbol{W}^{(2)}) \cdots); \boldsymbol{W}^{(L)}))$$

我们想求 $\frac{\partial L}{\partial \boldsymbol{W}^{(l)}}$——损失对第 $l$ 层参数的梯度。这些参数深埋在层层嵌套的函数里，直接求导不现实。链式法则让我们能把这个复杂求导**拆成一连串简单的局部导数的乘积**。

### 一元链式法则

若 $y = f(u)$，$u = g(x)$，则：

$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$$

**直觉**：$x$ 的微小变化 $\Delta x$ 先影响 $u$（变化了 $\frac{du}{dx}\Delta x$），然后 $u$ 的变化再影响 $y$（变化了 $\frac{dy}{du} \cdot \frac{du}{dx}\Delta x$）。

**三层嵌套**：若 $y = f(g(h(x)))$：

$$\frac{dy}{dx} = f'(g(h(x))) \cdot g'(h(x)) \cdot h'(x)$$

### 多元链式法则

若 $z = f(x, y)$，而 $x = x(t)$，$y = y(t)$，则：

$$\frac{dz}{dt} = \frac{\partial f}{\partial x}\frac{dx}{dt} + \frac{\partial f}{\partial y}\frac{dy}{dt}$$

**推广**：若 $z = f(u_1, u_2, \ldots, u_n)$，而每个 $u_i = u_i(t)$：

$$\frac{dz}{dt} = \sum_{i=1}^n \frac{\partial f}{\partial u_i}\frac{du_i}{dt}$$

**核心原则**：当一个变量通过**多条路径**影响最终结果时，各路径上的偏导数相加。

### 向量-标量链式法则

若损失 $L$ 是标量，中间变量 $\boldsymbol{z} = [z_1, \ldots, z_n]^T$ 是向量，$\boldsymbol{z} = g(\boldsymbol{w})$，则：

$$\frac{\partial L}{\partial w_i} = \sum_{j=1}^n \frac{\partial L}{\partial z_j} \frac{\partial z_j}{\partial w_i}$$

写成向量形式：$\frac{\partial L}{\partial \boldsymbol{w}} = \left(\frac{\partial \boldsymbol{z}}{\partial \boldsymbol{w}}\right)^T \frac{\partial L}{\partial \boldsymbol{z}}$

### 实例：两层网络的链式法则

设网络：$\boldsymbol{z}^{(1)} = \boldsymbol{W}^{(1)}\boldsymbol{x}$，$\boldsymbol{h} = \sigma(\boldsymbol{z}^{(1)})$，$z^{(2)} = \boldsymbol{w}^{(2)T}\boldsymbol{h}$，$L = \frac{1}{2}(y - z^{(2)})^2$

求 $\frac{\partial L}{\partial \boldsymbol{W}^{(1)}}$：

$$\frac{\partial L}{\partial \boldsymbol{W}^{(1)}} = \frac{\partial L}{\partial z^{(2)}} \cdot \frac{\partial z^{(2)}}{\partial \boldsymbol{h}} \cdot \frac{\partial \boldsymbol{h}}{\partial \boldsymbol{z}^{(1)}} \cdot \frac{\partial \boldsymbol{z}^{(1)}}{\partial \boldsymbol{W}^{(1)}}$$

每一项都是容易计算的局部导数。这就是 BP 的核心思想。

---

## 反向传播算法

### 符号约定

对于一个 $L$ 层前馈网络：

| 符号 | 含义 |
|------|------|
| $\boldsymbol{h}^{(0)} = \boldsymbol{x}$ | 网络输入 |
| $\boldsymbol{z}^{(l)} = \boldsymbol{W}^{(l)}\boldsymbol{h}^{(l-1)} + \boldsymbol{b}^{(l)}$ | 第 $l$ 层的加权输入（线性变换结果） |
| $\boldsymbol{h}^{(l)} = f(\boldsymbol{z}^{(l)})$ | 第 $l$ 层的激活输出 |
| $\boldsymbol{W}^{(l)} \in \mathbb{R}^{n_l \times n_{l-1}}$ | 第 $l$ 层权重矩阵 |
| $L$ | 损失函数（标量） |

### 误差项（Delta）的定义

**核心概念**：定义第 $l$ 层的误差项为损失对该层**加权输入**的偏导：

$$\boldsymbol{\delta}^{(l)} \triangleq \frac{\partial L}{\partial \boldsymbol{z}^{(l)}} \in \mathbb{R}^{n_l}$$

**为什么用 $\boldsymbol{z}^{(l)}$ 而不用 $\boldsymbol{h}^{(l)}$？** 因为 $\boldsymbol{z}^{(l)}$ 直接连接了权重（$\boldsymbol{z}^{(l)} = \boldsymbol{W}^{(l)}\boldsymbol{h}^{(l-1)} + \boldsymbol{b}^{(l)}$），有了 $\boldsymbol{\delta}^{(l)}$ 就能立刻算出权重梯度。

### 第一步：输出层的误差

对于最后一层（第 $L$ 层），直接用损失函数对 $\boldsymbol{z}^{(L)}$ 求导。

**均方误差 + 恒等激活**（输出层无激活函数）：

$$L = \frac{1}{2}(y - h^{(L)})^2 = \frac{1}{2}(y - z^{(L)})^2$$

$$\delta^{(L)} = \frac{\partial L}{\partial z^{(L)}} = -(y - z^{(L)}) = \hat{y} - y$$

**均方误差 + Sigmoid 激活**：

$$h^{(L)} = \sigma(z^{(L)})$$

$$\delta^{(L)} = \frac{\partial L}{\partial z^{(L)}} = \frac{\partial L}{\partial h^{(L)}} \cdot \frac{\partial h^{(L)}}{\partial z^{(L)}} = -(y - h^{(L)}) \cdot \sigma'(z^{(L)})$$

由于 $\sigma'(z) = \sigma(z)(1-\sigma(z)) = h^{(L)}(1-h^{(L)})$：

$$\delta^{(L)} = (h^{(L)} - y) \cdot h^{(L)}(1 - h^{(L)})$$

### 第二步：误差逐层回传

**从第 $l+1$ 层到第 $l$ 层**：

$$\boldsymbol{\delta}^{(l)} = \left[(\boldsymbol{W}^{(l+1)})^T \boldsymbol{\delta}^{(l+1)}\right] \odot f'(\boldsymbol{z}^{(l)})$$

**逐步推导**：

$z_j^{(l)}$ 通过 $h_j^{(l)} = f(z_j^{(l)})$ 影响下一层所有的 $z_k^{(l+1)} = \sum_j W_{kj}^{(l+1)} h_j^{(l)} + b_k^{(l+1)}$。

由多元链式法则：
$$\delta_j^{(l)} = \frac{\partial L}{\partial z_j^{(l)}} = \sum_k \frac{\partial L}{\partial z_k^{(l+1)}} \cdot \frac{\partial z_k^{(l+1)}}{\partial h_j^{(l)}} \cdot \frac{\partial h_j^{(l)}}{\partial z_j^{(l)}}$$

$$= \sum_k \delta_k^{(l+1)} \cdot W_{kj}^{(l+1)} \cdot f'(z_j^{(l)})$$

$$= \left[\sum_k W_{kj}^{(l+1)} \delta_k^{(l+1)}\right] \cdot f'(z_j^{(l)})$$

向量化：$\boldsymbol{\delta}^{(l)} = [(\boldsymbol{W}^{(l+1)})^T \boldsymbol{\delta}^{(l+1)}] \odot f'(\boldsymbol{z}^{(l)})$

$\odot$ 是**逐元素乘法**（Hadamard product）。

**直觉**：第 $l$ 层的误差 = 下一层的误差通过权重矩阵"反向投影"回来，再乘上本层激活函数的导数。

### 第三步：计算梯度

有了误差项，权重和偏置的梯度可以直接写出：

$$\frac{\partial L}{\partial \boldsymbol{W}^{(l)}} = \boldsymbol{\delta}^{(l)} (\boldsymbol{h}^{(l-1)})^T$$

$$\frac{\partial L}{\partial \boldsymbol{b}^{(l)}} = \boldsymbol{\delta}^{(l)}$$

**直觉**：权重梯度 = 本层的误差 × 上一层输出的转置。这很合理——如果上一层输出大而且本层误差大，那连接这两者的权重就需要大幅调整。

### 第四步：参数更新

$$\boldsymbol{W}^{(l)} \leftarrow \boldsymbol{W}^{(l)} - \eta \frac{\partial L}{\partial \boldsymbol{W}^{(l)}}$$

$$\boldsymbol{b}^{(l)} \leftarrow \boldsymbol{b}^{(l)} - \eta \frac{\partial L}{\partial \boldsymbol{b}^{(l)}}$$

### BP 算法完整流程

```
输入：训练样本 (x, y)，当前参数 W, b
输出：各层梯度

1. 前向传播：逐层计算 z^(l), h^(l)，直到输出 h^(L) 和损失 L
2. 计算输出层误差：δ^(L) = ∂L/∂z^(L)
3. 反向传播误差：for l = L-1, L-2, ..., 1:
       δ^(l) = [(W^(l+1))^T δ^(l+1)] ⊙ f'(z^(l))
4. 计算梯度：∂L/∂W^(l) = δ^(l) (h^(l-1))^T
5. 更新参数：W^(l) -= η · ∂L/∂W^(l)
```

---

## BP 完整手算示例

### 网络设定

一个极简网络：2 个输入 → 2 个隐藏节点（ReLU）→ 1 个输出（ReLU）

- 输入：$x_1 = 1$，$x_2 = 1.5$
- 目标：$y = 0.5$
- 学习率：$\eta = 1$
- 损失函数：$L = \frac{1}{2}(y - \hat{y})^2$
- 激活函数：ReLU，即 $f(z) = \max(0, z)$，$f'(z) = \begin{cases} 1, & z > 0 \\ 0, & z \le 0\end{cases}$

权重：
- 输入→隐藏：$w_{11}=0.6, w_{12}=0.2$（连接到隐藏节点1），$w_{21}=0.1, w_{22}=0.7$（连接到隐藏节点2）
- 隐藏→输出：$w_{13}=0.5, w_{23}=0.8$

### 前向传播

**隐藏层**：
$$z_1 = w_{11} x_1 + w_{12} x_2 = 0.6 \times 1 + 0.2 \times 1.5 = 0.9$$
$$z_2 = w_{21} x_1 + w_{22} x_2 = 0.1 \times 1 + 0.7 \times 1.5 = 1.15$$
$$h_1 = \text{ReLU}(0.9) = 0.9$$
$$h_2 = \text{ReLU}(1.15) = 1.15$$

**输出层**：
$$z_3 = w_{13} h_1 + w_{23} h_2 = 0.5 \times 0.9 + 0.8 \times 1.15 = 0.45 + 0.92 = 1.37$$
$$\hat{y} = \text{ReLU}(1.37) = 1.37$$

**损失**：
$$L = \frac{1}{2}(0.5 - 1.37)^2 = \frac{1}{2}(0.87)^2 = 0.3785$$

### 反向传播

**输出层误差**（MSE + ReLU）：
$$\delta_3 = -(y - \hat{y}) \cdot \text{ReLU}'(z_3) = -(0.5 - 1.37) \times 1 = 0.87$$

（因为 $z_3 = 1.37 > 0$，所以 $\text{ReLU}'(z_3) = 1$）

**输出层权重梯度**：
$$\frac{\partial L}{\partial w_{13}} = \delta_3 \cdot h_1 = 0.87 \times 0.9 = 0.783$$
$$\frac{\partial L}{\partial w_{23}} = \delta_3 \cdot h_2 = 0.87 \times 1.15 = 1.0005$$

**隐藏层误差**（反向传播公式）：
$$\delta_1 = w_{13} \cdot \delta_3 \cdot \text{ReLU}'(z_1) = 0.5 \times 0.87 \times 1 = 0.435$$
$$\delta_2 = w_{23} \cdot \delta_3 \cdot \text{ReLU}'(z_2) = 0.8 \times 0.87 \times 1 = 0.696$$

**隐藏层权重梯度**：
$$\frac{\partial L}{\partial w_{11}} = \delta_1 \cdot x_1 = 0.435 \times 1 = 0.435$$
$$\frac{\partial L}{\partial w_{12}} = \delta_1 \cdot x_2 = 0.435 \times 1.5 = 0.6525$$
$$\frac{\partial L}{\partial w_{21}} = \delta_2 \cdot x_1 = 0.696 \times 1 = 0.696$$
$$\frac{\partial L}{\partial w_{22}} = \delta_2 \cdot x_2 = 0.696 \times 1.5 = 1.044$$

### 参数更新

$$w_{13}' = 0.5 - 1 \times 0.783 = -0.283$$
$$w_{23}' = 0.8 - 1 \times 1.0005 = -0.2005$$
$$w_{11}' = 0.6 - 1 \times 0.435 = 0.165$$
$$w_{12}' = 0.2 - 1 \times 0.6525 = -0.4525$$
$$w_{21}' = 0.1 - 1 \times 0.696 = -0.596$$
$$w_{22}' = 0.7 - 1 \times 1.044 = -0.344$$

### 验证：更新后的损失是否下降

用新权重重新前向传播：

$$z_1' = 0.165 \times 1 + (-0.4525) \times 1.5 = 0.165 - 0.679 = -0.514$$
$$h_1' = \text{ReLU}(-0.514) = 0$$

$$z_2' = -0.596 \times 1 + (-0.344) \times 1.5 = -0.596 - 0.516 = -1.112$$
$$h_2' = \text{ReLU}(-1.112) = 0$$

$$z_3' = -0.283 \times 0 + (-0.2005) \times 0 = 0$$
$$\hat{y}' = \text{ReLU}(0) = 0$$

$$L' = \frac{1}{2}(0.5 - 0)^2 = 0.125$$

$0.125 < 0.3785$：损失确实下降了。（但学习率太大导致矫枉过正——所有隐藏节点都"死"了。实际中需要更小的学习率。）

---

## 卷积层与池化层的反向传播

### 池化层的反向传播

池化层没有可学习参数，但仍然需要将梯度传递给前面的层。

**Max Pooling**：

前向传播时，记录了哪个位置是最大值。反向传播时，梯度**只传给那个最大值的位置**，其余位置梯度为 0。

例如 $2\times2$ 窗口 $\begin{pmatrix} 1 & 3 \\ 2 & 4\end{pmatrix}$，最大值在右下角。若该输出位置的梯度为 $\delta$，则传回的梯度为 $\begin{pmatrix} 0 & 0 \\ 0 & \delta\end{pmatrix}$。

**Average Pooling**：

梯度**平均分配**给窗口内所有位置。

同样的 $2\times2$ 窗口，传回的梯度为 $\begin{pmatrix} \delta/4 & \delta/4 \\ \delta/4 & \delta/4\end{pmatrix}$。

### 卷积层的反向传播

设第 $l$ 层是卷积层，核大小 $k\times k$，输入特征图 $\boldsymbol{X}$，输出特征图 $\boldsymbol{Y}$：

前向：$Y_{i,j} = \sum_{m=0}^{k-1}\sum_{n=0}^{k-1} W_{m,n} \cdot X_{i+m, j+n}$

**对权重的梯度**：

$$\frac{\partial L}{\partial W_{m,n}} = \sum_{i,j} \delta_{i,j}^{(l+1)} \cdot X_{i+m, j+n}$$

即用下一层的误差图对输入做**互相关**。

**对输入的梯度（误差回传）**：

$$\delta_{i,j}^{(l)} = \sum_{m,n} W_{m,n} \cdot \delta_{i-m, j-n}^{(l+1)} \cdot f'(z_{i,j}^{(l)})$$

这等价于用**旋转 180° 的卷积核**对误差图做卷积——本质是转置卷积（反卷积）。

---

## 运算量分析

对于 $L$ 层、每层 $n$ 个神经元的全连接网络：

### 前向传播

- 每层：计算 $\boldsymbol{z}^{(l)} = \boldsymbol{W}^{(l)}\boldsymbol{h}^{(l-1)}$ 需要 $n^2$ 次乘法（矩阵×向量）
- 每层加法：$n^2 + n$ 次（矩阵乘法的加法 + 偏置）
- 激活函数：$n$ 次评估
- 整个网络前向传播：$Ln^2$ 次乘法

### 反向传播

每层需要：
1. 误差回传：$(\boldsymbol{W}^{(l+1)})^T \boldsymbol{\delta}^{(l+1)}$ — $n^2$ 次乘法
2. 逐元素乘激活导数 $f'(\boldsymbol{z}^{(l)})$ — $n$ 次乘法（Sigmoid：$n$ 次；ReLU：0 次或 $n$ 次比较）
3. 计算权重梯度 $\boldsymbol{\delta}^{(l)}(\boldsymbol{h}^{(l-1)})^T$ — $n^2$ 次乘法
4. 更新权重：$n^2$ 次乘法（$\eta \cdot$ 梯度）

合计每层：约 $2n^2 + 3n$ 次乘法

整个网络：$L(2n^2 + 3n) \approx 2Ln^2$ 次乘法

**结论**：反向传播的计算量约为前向传播的 **2 倍**（忽略低阶项）。

---

## 梯度消失与梯度爆炸

### 问题根源

从 BP 公式看，第 1 层的误差需要经过所有中间层传回：

$$\boldsymbol{\delta}^{(1)} = \left[\prod_{l=1}^{L-1} (\boldsymbol{W}^{(l+1)})^T \text{diag}(f'(\boldsymbol{z}^{(l)}))\right] \boldsymbol{\delta}^{(L)}$$

这个连乘项决定了梯度的行为：

### 梯度消失

如果 $|f'(z)| < 1$（Sigmoid 最大 0.25）且权重不够大：

$$\prod_{l=1}^{L-1} |f'(z^{(l)})| \approx 0.25^{L-1}$$

当 $L = 10$ 时：$0.25^9 \approx 3.8 \times 10^{-6}$

前面层几乎收不到有效的梯度信号，参数无法更新。

**后果**：浅层参数几乎不动，只有靠近输出的几层在学习——深层网络退化为浅层网络。

### 梯度爆炸

如果 $\|(\boldsymbol{W}^{(l)})^T\| > 1$ 且 $|f'| \ge 1$：

连乘后梯度指数级增长，参数更新巨大，模型发散。

**后果**：损失突然跳到 NaN，训练崩溃。

### 退化问题（Degradation）

即使没有明显的梯度消失，深层网络也可能比浅层网络**训练误差更高**（注意不是过拟合——连训练都做不好）。

理论上深层网络至少可以学到"恒等映射 + 前几层的解"，不应该比浅层差。但实际优化困难导致找不到这个解。

→ 残差连接正是为解决此问题而提出。

---

## 激活函数详解

### Sigmoid

$$\sigma(z) = \frac{1}{1+e^{-z}}$$

$$\sigma'(z) = \sigma(z)(1-\sigma(z))$$

- 值域：$(0, 1)$
- 最大导数：$\sigma'(0) = 0.25$
- **致命缺陷**：导数恒 $\le 0.25$，深层网络梯度消失；输出非零中心，梯度更新效率低。
- **现代用途**：仅用于输出层（二分类概率），中间层几乎不用。

### Tanh

$$\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}} = 2\sigma(2z) - 1$$

$$\tanh'(z) = 1 - \tanh^2(z)$$

- 值域：$(-1, 1)$，零中心
- 最大导数：$\tanh'(0) = 1$
- 比 Sigmoid 好（零中心 + 更大的导数），但仍有饱和区（$|z|$ 大时导数→0）

### ReLU（Rectified Linear Unit）

$$\text{ReLU}(z) = \max(0, z) = \begin{cases} z, & z > 0 \\ 0, & z \le 0 \end{cases}$$

$$\text{ReLU}'(z) = \begin{cases} 1, & z > 0 \\ 0, & z \le 0 \end{cases}$$

优势：
- 正区间梯度恒为 1——**不会梯度消失**
- 计算极简（一次比较）
- 稀疏激活（部分节点输出 0）

问题：
- **Dead ReLU**：如果某节点的输入在训练过程中永远为负（可能因为大的负偏置或不好的初始化），它永远输出 0，梯度也永远为 0——这个神经元"死了"，再也学不到东西。

### Leaky ReLU

$$\text{LReLU}(z) = \begin{cases} z, & z > 0 \\ \alpha z, & z \le 0 \end{cases}$$

$\alpha$ 是一个小常数（通常 0.01）。负区间有小梯度 $\alpha$，避免 Dead ReLU。

### PReLU（Parametric ReLU）

和 Leaky ReLU 形式相同，但 $\alpha$ 是**可学习参数**：

$$\text{PReLU}(z) = \begin{cases} z, & z > 0 \\ \alpha z, & z \le 0 \end{cases}, \quad \alpha \in (0, 1) \text{ 可学习}$$

### ELU（Exponential Linear Unit）

$$\text{ELU}(z) = \begin{cases} z, & z > 0 \\ \alpha(e^z - 1), & z \le 0 \end{cases}$$

- 负区间平滑且有负值输出（推动均值接近 0）
- 饱和到 $-\alpha$（对噪声鲁棒）
- 计算量比 ReLU 大（需要 exp）

### 对比总结

| 激活函数 | 正区间导数 | 负区间导数 | 梯度消失？ | Dead Neuron？ |
|----------|-----------|-----------|-----------|--------------|
| Sigmoid | $\le 0.25$ | $\le 0.25$ | 严重 | 否 |
| Tanh | $\le 1$ | $\le 1$ | 中等 | 否 |
| ReLU | 1 | 0 | 无 | 是 |
| Leaky ReLU | 1 | $\alpha$ | 无 | 否 |
| PReLU | 1 | 学习的 $\alpha$ | 无 | 否 |
| ELU | 1 | $\alpha e^z$ | 无 | 否 |

---

## 残差连接（Residual Connection）

### 核心公式

$$\boldsymbol{y} = F(\boldsymbol{x}; \boldsymbol{W}) + \boldsymbol{x}$$

网络不直接学习目标映射 $H(\boldsymbol{x})$，而是学**残差** $F(\boldsymbol{x}) = H(\boldsymbol{x}) - \boldsymbol{x}$。

### 为什么解决退化

如果某一层最优的行为是"什么都不做"（恒等映射），则 $F(\boldsymbol{x}) = 0$ 即可——让网络学"零函数"远比学"恒等函数"容易（将权重推向零就行）。

### 梯度流分析

$$\frac{\partial \boldsymbol{y}}{\partial \boldsymbol{x}} = \frac{\partial F}{\partial \boldsymbol{x}} + \boldsymbol{I}$$

$$\frac{\partial L}{\partial \boldsymbol{x}} = \frac{\partial L}{\partial \boldsymbol{y}} \cdot \left(\frac{\partial F}{\partial \boldsymbol{x}} + \boldsymbol{I}\right) = \frac{\partial L}{\partial \boldsymbol{y}} \cdot \frac{\partial F}{\partial \boldsymbol{x}} + \frac{\partial L}{\partial \boldsymbol{y}}$$

右边第二项 $\frac{\partial L}{\partial \boldsymbol{y}}$ 是一条**直通的梯度通路**（gradient highway）：无论 $F$ 的梯度多小，梯度都能通过跳跃连接直接流向前面的层。

这就是为什么 ResNet 可以训练 100+ 层而不退化。

### 维度匹配

当 $F(\boldsymbol{x})$ 和 $\boldsymbol{x}$ 的维度不同时（比如通道数改变了），需要用一个线性投影对齐：

$$\boldsymbol{y} = F(\boldsymbol{x}) + \boldsymbol{W}_s \boldsymbol{x}$$

---

## 归一化方法

### 为什么需要归一化

深层网络中，每层输入的分布会随着前面层参数的更新而不断变化——**内部协变量偏移（Internal Covariate Shift）**。后面的层需要不断适应新的输入分布，训练困难。

归一化的作用：稳定每层的输入分布，使训练更稳定、允许更大学习率。

### Batch Normalization (BN)

**统计维度**：对一个 mini-batch 中**同一特征/通道**的所有样本统计均值和方差。

设 mini-batch 中第 $k$ 个特征的值为 $\{z_1^{(k)}, z_2^{(k)}, \ldots, z_B^{(k)}\}$：

$$\mu_B^{(k)} = \frac{1}{B}\sum_{i=1}^B z_i^{(k)}$$

$$(\sigma_B^{(k)})^2 = \frac{1}{B}\sum_{i=1}^B (z_i^{(k)} - \mu_B^{(k)})^2$$

$$\hat{z}_i^{(k)} = \frac{z_i^{(k)} - \mu_B^{(k)}}{\sqrt{(\sigma_B^{(k)})^2 + \epsilon}}$$

$$y_i^{(k)} = \gamma^{(k)} \hat{z}_i^{(k)} + \beta^{(k)}$$

- $\gamma, \beta$ 是**可学习参数**（让网络在需要时恢复原始分布）
- $\epsilon$ 防止除零（通常 $10^{-5}$）

**推理时**：不再有 mini-batch，使用训练过程中累积的移动平均（running mean/variance）。

**BN 的位置**：通常放在线性变换之后、激活函数之前：$z \to \text{BN}(z) \to f(\cdot)$

### Layer Normalization (LN)

**统计维度**：对**单个样本的所有特征**统计均值和方差（不跨 batch）。

设某个样本的特征向量 $\boldsymbol{z} = [z_1, z_2, \ldots, z_d]$：

$$\mu = \frac{1}{d}\sum_{j=1}^d z_j, \quad \sigma^2 = \frac{1}{d}\sum_{j=1}^d (z_j - \mu)^2$$

$$\hat{z}_j = \frac{z_j - \mu}{\sqrt{\sigma^2 + \epsilon}}, \quad y_j = \gamma_j \hat{z}_j + \beta_j$$

### BN vs LN 对比

| | Batch Norm | Layer Norm |
|---|---|---|
| 归一化维度 | 跨样本（batch 维度） | 跨特征（feature 维度） |
| 依赖 batch size | ✓（batch 太小统计不准） | ✗ |
| 适用结构 | CNN（固定大小输入） | RNN、Transformer（变长序列） |
| 推理行为 | 用训练的移动平均 | 当场计算（和训练一致） |
| 在 Transformer 中 | 不用 | **标配** |

**为什么 Transformer 用 LN 不用 BN？**
1. 序列长度不固定，不同 batch 内同一位置没有统计意义
2. 训练时 batch size 可能很小（LLM），BN 统计不准
3. 推理时需要确定行为，LN 不依赖训练统计量

### Instance Normalization (IN)

对**单个样本的单个通道**归一化。每个通道独立做均值-方差归一化。

主要用于风格迁移（去除图像的特定风格信息）。

### Group Normalization (GN)

将通道分为 $G$ 组，每组内做 LN。是 BN 和 IN 的折中：
- $G=1$：退化为 LN
- $G=$ 通道数：退化为 IN

适用于 batch size 很小的场景（如检测/分割中大图只能放 1-2 张）。

### DyT（Dynamic Tanh）

$$\text{DyT}(\boldsymbol{x}) = \gamma \cdot \tanh(\alpha \boldsymbol{x}) + \beta$$

其中 $\alpha, \gamma, \beta$ 可学习。一种无需统计量的轻量归一化替代方案。

---

## 参数初始化

### 为什么初始化很重要

网络训练的起点由初始化决定。不好的初始化可能导致：
1. 梯度消失/爆炸（从第一步就开始）
2. 对称性无法打破

### 全零初始化的问题

如果所有权重初始化为 0（或相同的值）：
- 同一层所有神经元的输出相同
- 反向传播时所有神经元的梯度相同
- 参数更新相同
- **对称性永远无法打破**——等价于只有一个神经元

结论：必须用**随机初始化**打破对称性。

### 随机初始化的方差选择

太大：激活值饱和 → 梯度消失（Sigmoid/Tanh）或爆炸
太小：信号逐层衰减 → 前面几层无法有效传递信息

**目标**：让每层输出的方差保持稳定——既不爆炸也不消失。

### Xavier 初始化（Glorot, 2010）

**适用激活函数**：Sigmoid、Tanh（近似线性区间 $f(z) \approx z$）

**推导思路**：

设第 $l$ 层有 $n_{in}$ 个输入，$n_{out}$ 个输出。前向传播中：

$$z_j = \sum_{i=1}^{n_{in}} w_{ji} h_i$$

假设 $w$ 和 $h$ 独立、零均值：
$$\text{Var}(z_j) = n_{in} \cdot \text{Var}(w) \cdot \text{Var}(h)$$

要保持 $\text{Var}(z) = \text{Var}(h)$（前向方差不变），需要：
$$\text{Var}(w) = \frac{1}{n_{in}}$$

类似地，考虑反向传播中梯度的方差不变，需要 $\text{Var}(w) = \frac{1}{n_{out}}$。

折中取两者的调和：

$$\text{Var}(w) = \frac{2}{n_{in} + n_{out}}$$

**高斯形式**：$W \sim \mathcal{N}\left(0, \frac{2}{n_{in} + n_{out}}\right)$

**均匀形式**：$W \sim U\left[-\sqrt{\frac{6}{n_{in}+n_{out}}}, \sqrt{\frac{6}{n_{in}+n_{out}}}\right]$

（均匀分布 $U[-a, a]$ 的方差为 $a^2/3$，令 $a^2/3 = \frac{2}{n_{in}+n_{out}}$ 得 $a = \sqrt{\frac{6}{n_{in}+n_{out}}}$）

### He 初始化（Kaiming, 2015）

**适用激活函数**：ReLU 及其变体

**为什么 Xavier 不够？** ReLU 将约一半的值置零，输出方差减半：

$$\text{Var}(h) = \text{Var}(\text{ReLU}(z)) \approx \frac{1}{2}\text{Var}(z)$$

（因为 $P(z > 0) \approx 1/2$，负半部分输出为 0）

所以需要把方差乘 2 来补偿：

$$\text{Var}(w) = \frac{2}{n_{in}}$$

**高斯形式**：$W \sim \mathcal{N}\left(0, \frac{2}{n_{in}}\right)$

### PReLU 情形下的 He 初始化

对于 PReLU，负半轴输出为 $\alpha z$（$\alpha \in (0,1)$），不是完全为零：

$$\text{Var}(h) = \text{Var}(\text{PReLU}(z)) = \frac{1+\alpha^2}{2}\text{Var}(z)$$

所以：

$$\text{Var}(w) = \frac{2}{(1+\alpha^2) \cdot n_{in}}$$

- 当 $\alpha = 0$（标准 ReLU）：$\text{Var}(w) = 2/n_{in}$（标准 He）
- 当 $\alpha = 1$（恒等）：$\text{Var}(w) = 1/n_{in}$（Xavier 的前向形式）

---

## 训练优化技巧

### Mini-batch SGD

实际训练几乎都用 mini-batch SGD——每次用 $B$ 个样本估计梯度：

$$\boldsymbol{w}_{t+1} = \boldsymbol{w}_t - \frac{\eta}{B}\sum_{i \in \mathcal{B}_t} \nabla_{\boldsymbol{w}} L_i$$

**Batch size 的影响**：
- 太小（如 1）：梯度噪声大，训练震荡，但泛化可能更好
- 太大（如 10000）：梯度估计准确，但每步计算慢，且容易陷入尖锐极小值（泛化差）
- 常用：32 ~ 512

### 学习率调度

| 策略 | 描述 |
|------|------|
| 固定学习率 | 简单但可能不收敛或收敛慢 |
| Step Decay | 每过若干 epoch 乘以 0.1 |
| Cosine Annealing | 按余弦曲线从大到小 |
| Warmup | 开始几个 epoch 从小学习率线性增大，再衰减 |

### Dropout

训练时，随机将一部分神经元的输出**置零**（丢弃概率 $p$，如 0.5）。

**效果**：
- 防止神经元"共适应"（co-adaptation）——每个神经元必须独立有用
- 等价于训练大量子网络的集成（ensemble）
- 推理时不 dropout，但将权重乘以 $(1-p)$（或训练时用 inverted dropout 除以 $(1-p)$）

### 提前终止（Early Stopping）

监控验证集损失。当验证损失不再下降（甚至开始上升）时停止训练。

**为什么有效**：训练初期模型学到通用模式（泛化好），后期开始记忆训练集细节（过拟合）。在两者之间找到平衡点。

### 数据增强（Data Augmentation）

通过对训练数据做变换（旋转、翻转、裁剪、颜色抖动等）增加有效训练样本量，减少过拟合。

### 权重衰减（Weight Decay）

等价于 L2 正则化——在梯度更新时额外减去权重本身的一个比例：

$$\boldsymbol{w} \leftarrow (1 - \eta\lambda)\boldsymbol{w} - \eta \nabla L$$

让权重倾向于小值，模型更平滑。

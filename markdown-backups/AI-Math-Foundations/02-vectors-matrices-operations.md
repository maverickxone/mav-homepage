---
title: "向量、矩阵与运算"
chapter: 2
readTime: 60
description: "每个神经网络都只是矩阵乘法加了点花活。"
---

> 每个神经网络都只是矩阵乘法加了点花活。

## 学习目标

- 从零写一个 Matrix 类，包含逐元素运算、矩阵乘法、转置、行列式和逆
- 分清逐元素乘法和矩阵乘法，知道各自什么时候用
- 用自己写的 Matrix 类实现一个神经网络层：`relu(W @ x + b)`
- 理解 broadcasting 规则以及 bias 加法在框架中是怎么工作的

## 为什么要学这个

你想搭一个神经网络，看到代码写的是：

```python
output = activation(weights @ input + bias)
```

那个 `@` 是矩阵乘法。`weights` 是一个矩阵。`input` 是一个向量。如果你不知道这些运算在做什么，这行代码就是黑魔法。如果你知道，它就是一层网络的完整前向传播——三步搞定。

你模型处理的每张图片是一个像素值矩阵。每个词嵌入是一个向量。每层网络都是一个矩阵变换。不熟悉矩阵运算就做不了 AI，就像不懂变量就写不了代码。

这节课从零建立这个流利度。

## 核心概念

### 向量：一串有序的数

向量就是一列数字，有方向有大小。在 AI 里，向量用来表示数据点、特征或参数。

```
v = [3, 4]        -- 二维向量
w = [1, 0, -2]    -- 三维向量
```

二维向量 `[3, 4]` 指向坐标 (3, 4)，长度是 5（3-4-5 三角形）。

### 矩阵：数字的网格

矩阵是一个二维网格，有行有列。一个 m×n 矩阵有 m 行 n 列。

```
A = | 1  2  3 |     -- 2×3 矩阵（2 行 3 列）
    | 4  5  6 |
```

在神经网络里，权重矩阵把输入向量变成输出向量。一层有 784 个输入、128 个输出的网络，用的是 128×784 的权重矩阵。

### 形状（shape）为什么重要

矩阵乘法有严格规则：`(m × n) @ (n × p) = (m × p)`。内维度必须匹配。

```
(128 × 784) @ (784 × 1) = (128 × 1)
   权重          输入         输出

内维度：784 = 784 ✓
```

PyTorch 里 shape mismatch 报错就是因为这个。

### 运算速查表

| 运算 | 做了什么 | 在神经网络中的用途 |
|------|---------|-------------------|
| 加法 | 对应位置相加 | 加 bias |
| 标量乘法 | 每个元素乘同一个数 | 学习率 × 梯度 |
| 矩阵乘法 | 变换向量 | 一层的前向传播 |
| 转置 | 行列互换 | 反向传播 |
| 行列式 | 一个数字摘要 | 检查是否可逆 |
| 逆矩阵 | 撤销变换 | 解线性方程组 |
| 单位矩阵 | 什么都不做的矩阵 | 初始化、残差连接 |

### 逐元素乘法 vs 矩阵乘法

初学者最容易搞混的地方。

**逐元素乘法**：对应位置相乘。两个矩阵形状必须一样。

```
| 1  2 |   | 5  6 |   | 5  12 |
| 3  4 | * | 7  8 | = | 21 32 |
```

**矩阵乘法**：第一个矩阵的行和第二个矩阵的列做点积。内维度必须匹配。

```
| 1  2 |   | 5  6 |   | 1×5+2×7  1×6+2×8 |   | 19  22 |
| 3  4 | @ | 7  8 | = | 3×5+4×7  3×6+4×8 | = | 43  50 |
```

不同的运算，不同的结果，不同的规则。

### Broadcasting

当你把一个 bias 向量加到一个输出矩阵上时，形状不匹配。Broadcasting 会把小的那个"拉伸"到跟大的一样。

```
| 1  2  3 |   +   [10, 20, 30]
| 4  5  6 |

Broadcasting 把向量沿行方向复制：

| 1  2  3 |   | 10  20  30 |   | 11  22  33 |
| 4  5  6 | + | 10  20  30 | = | 14  25  36 |
```

所有现代框架都自动做这件事。理解它能防止你在"形状明明不对但代码居然跑通了"的时候一脸困惑。

## 从零实现

### 第一步：向量类

```python
class Vector:
    def __init__(self, data):
        self.data = list(data)
        self.size = len(self.data)

    def __repr__(self):
        return f"Vector({self.data})"

    def __add__(self, other):
        return Vector([a + b for a, b in zip(self.data, other.data)])

    def __sub__(self, other):
        return Vector([a - b for a, b in zip(self.data, other.data)])

    def __mul__(self, scalar):
        return Vector([x * scalar for x in self.data])

    def dot(self, other):
        return sum(a * b for a, b in zip(self.data, other.data))

    def magnitude(self):
        return sum(x ** 2 for x in self.data) ** 0.5
```

### 第二步：矩阵类——核心运算

```python
class Matrix:
    def __init__(self, data):
        self.data = [list(row) for row in data]
        self.rows = len(self.data)
        self.cols = len(self.data[0])
        self.shape = (self.rows, self.cols)

    def __repr__(self):
        rows_str = "\n  ".join(str(row) for row in self.data)
        return f"Matrix({self.shape}):\n  {rows_str}"

    def __add__(self, other):
        return Matrix([
            [self.data[i][j] + other.data[i][j] for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def __sub__(self, other):
        return Matrix([
            [self.data[i][j] - other.data[i][j] for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def scalar_multiply(self, scalar):
        return Matrix([
            [self.data[i][j] * scalar for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def element_wise_multiply(self, other):
        """逐元素乘法（Hadamard 积）"""
        return Matrix([
            [self.data[i][j] * other.data[i][j] for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def matmul(self, other):
        """矩阵乘法"""
        return Matrix([
            [
                sum(self.data[i][k] * other.data[k][j] for k in range(self.cols))
                for j in range(other.cols)
            ]
            for i in range(self.rows)
        ])

    def transpose(self):
        """转置：行变列，列变行"""
        return Matrix([
            [self.data[j][i] for j in range(self.rows)]
            for i in range(self.cols)
        ])

    def determinant(self):
        """行列式（递归展开）"""
        if self.shape == (1, 1):
            return self.data[0][0]
        if self.shape == (2, 2):
            return self.data[0][0] * self.data[1][1] - self.data[0][1] * self.data[1][0]
        det = 0
        for j in range(self.cols):
            minor = Matrix([
                [self.data[i][k] for k in range(self.cols) if k != j]
                for i in range(1, self.rows)
            ])
            det += ((-1) ** j) * self.data[0][j] * minor.determinant()
        return det

    def inverse_2x2(self):
        """2×2 矩阵的逆"""
        det = self.determinant()
        if det == 0:
            raise ValueError("矩阵奇异，不存在逆")
        return Matrix([
            [self.data[1][1] / det, -self.data[0][1] / det],
            [-self.data[1][0] / det, self.data[0][0] / det]
        ])

    @staticmethod
    def identity(n):
        """n 阶单位矩阵"""
        return Matrix([
            [1 if i == j else 0 for j in range(n)]
            for i in range(n)
        ])
```

### 第三步：验证

```python
A = Matrix([[1, 2], [3, 4]])
B = Matrix([[5, 6], [7, 8]])

print("A + B =", (A + B).data)
print("A @ B =", A.matmul(B).data)
print("A^T =", A.transpose().data)
print("det(A) =", A.determinant())
print("A^-1 =", A.inverse_2x2().data)

# 验证：A 乘以 A 的逆应该等于单位矩阵
I = Matrix.identity(2)
print("A @ A^-1 =", A.matmul(A.inverse_2x2()).data)
```

### 第四步：跟神经网络联系起来

```python
import random

# 输入：3 维向量（列向量形式）
inputs = Matrix([[0.5], [0.8], [0.2]])
# 权重：2×3 矩阵（把 3 维映射到 2 维）
weights = Matrix([
    [random.uniform(-1, 1) for _ in range(3)]
    for _ in range(2)
])
# 偏置
bias = Matrix([[0.1], [0.1]])

def relu_matrix(m):
    """ReLU：负值变零，正值不变"""
    return Matrix([[max(0, val) for val in row] for row in m.data])

# 前向传播：output = relu(W @ x + b)
pre_activation = weights.matmul(inputs) + bias
output = relu_matrix(pre_activation)

print(f"输入 shape: {inputs.shape}")
print(f"权重 shape: {weights.shape}")
print(f"输出 shape: {output.shape}")
print(f"输出: {output.data}")
```

这就是一个 dense 层：`output = relu(W @ x + b)`。每个神经网络的每一层，做的都是这件事。

## 用库做同样的事

NumPy 用更少的代码和快几个数量级的速度做完上面所有事。

```python
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print("A + B =\n", A + B)
print("A * B（逐元素）=\n", A * B)
print("A @ B（矩阵乘法）=\n", A @ B)
print("A^T =\n", A.T)
print("det(A) =", np.linalg.det(A))
print("A^-1 =\n", np.linalg.inv(A))
print("I =\n", np.eye(2))

# 一层神经网络
inputs = np.random.randn(3, 1)
weights = np.random.randn(2, 3)
bias = np.array([[0.1], [0.1]])
output = np.maximum(0, weights @ inputs + bias)  # relu(W @ x + b)

print(f"\n神经网络层: {weights.shape} @ {inputs.shape} = {output.shape}")
print(f"输出:\n{output}")
```

Python 的 `@` 运算符调用的是 `__matmul__`。NumPy 底层是用 C 和 Fortran 写的优化 BLAS 程序。同样的数学，快 100 倍。

Broadcasting 在 NumPy 中：

```python
matrix = np.array([[1, 2, 3], [4, 5, 6]])
bias = np.array([10, 20, 30])
print(matrix + bias)  # bias 自动沿行方向广播
```

NumPy 自动把一维的 bias 广播到两行。所有神经网络框架的 bias 加法都是这么工作的。

## 练习

1. **验证逆矩阵。** 计算 `A @ A.inverse_2x2()`，确认结果是单位矩阵。用三个不同的 2×2 矩阵试试。行列式为零时会发生什么？

2. **实现 3×3 逆矩阵。** 扩展 Matrix 类，用伴随矩阵法计算 3×3 的逆。跟 NumPy 的 `np.linalg.inv` 对比验证。

3. **搭一个两层网络。** 只用你自己的 Matrix 类（不用 NumPy），创建一个两层神经网络：输入(3) → 隐藏层(4) → 输出(2)。随机初始化权重，跑一次前向传播，验证所有形状正确。

## 术语表

| 术语 | 通俗说法 | 真正含义 |
|------|---------|---------|
| Vector（向量） | "一个箭头" | 一串有序数字。在 AI 里：高维空间中的一个点。 |
| Matrix（矩阵） | "一张数字表" | 一个线性变换，把向量从一个空间映射到另一个。 |
| Matrix multiply（矩阵乘法） | "把数字乘一下" | 第一个矩阵的每一行和第二个矩阵的每一列做点积。顺序有关系。 |
| Transpose（转置） | "翻过来" | 行列互换。m×n 变成 n×m。反向传播必备。 |
| Determinant（行列式） | "矩阵算出来的一个数" | 衡量矩阵把面积（2D）或体积（3D）缩放了多少倍。零意味着降维了。 |
| Inverse（逆矩阵） | "反向操作" | 撤销变换的矩阵。只有行列式不为零时才存在。 |
| Identity（单位矩阵） | "无聊的矩阵" | 矩阵版的"乘以 1"。ResNet 的残差连接用到它。 |
| Broadcasting | "形状魔法修复" | 把小数组沿缺失的维度重复拉伸，匹配大数组。 |
| Element-wise（逐元素） | "普通乘法" | 对应位置相乘。两个数组形状必须一样（或可广播）。 |

---

## 自测题

:::quiz
question: 矩阵乘法 (m × n) @ (n × p) 对维度有什么要求？
options:
  - m 必须等于 p
  - 内维度 n 必须匹配
  - 所有维度必须相等
  - m 必须大于 p
correct: 1
explanation: 矩阵乘法要求第一个矩阵的列数（n）等于第二个矩阵的行数（n）。结果的形状是 (m × p)。
:::

:::quiz
question: 单位矩阵是什么？
options:
  - 全是 1 的矩阵
  - 对角线上是 1、其他位置是 0 的方阵，起到乘法恒等元的作用
  - 每个元素都不同的矩阵
  - 任何矩阵的转置
correct: 1
explanation: 单位矩阵 I 的对角线是 1，其他位置是 0。任何矩阵乘以 I 都得到它本身，就像数字乘以 1 一样。
:::

:::quiz
question: 逐元素乘法和矩阵乘法的核心区别是什么？
options:
  - 逐元素更快，矩阵乘法更精确
  - 逐元素是对应位置相乘（要求形状相同），矩阵乘法是行和列做点积（要求内维度匹配）
  - 它们结果一样，只是符号不同
  - 逐元素只能用于向量，矩阵乘法只能用于矩阵
correct: 1
explanation: 逐元素乘法（Hadamard 积）把对应位置的数相乘，要求形状完全一样。矩阵乘法是行和列的点积，规则是 (m,n)@(n,p)=(m,p)。
:::

:::quiz
question: 在 'output = relu(W @ x + b)' 中，broadcasting 起了什么作用？
options:
  - 把计算广播到多块 GPU 上
  - 自动把 bias 向量 b 拉伸到跟 W @ x 一样的形状，这样才能相加
  - 把 W 和 x 的数据类型转换成一致的
  - 把 relu 激活函数重复应用到每个元素
correct: 1
explanation: W @ x 产生一个列向量，b 也是一个向量。Broadcasting 在需要时把 b 沿 batch 维度拉伸，让逐元素加法不需要手动调形状。
:::

:::quiz
question: 一个矩阵的行列式为零说明什么？
options:
  - 矩阵所有元素都是零
  - 矩阵奇异：它压缩了至少一个维度，不可逆，方程组没有唯一解
  - 矩阵是单位矩阵
  - 矩阵执行的是旋转
correct: 1
explanation: 行列式为零意味着变换把空间至少压缩了一个维度（比如把二维压成一条线）。这个矩阵没有逆，用它解线性方程组要么无解要么有无穷多解。
:::

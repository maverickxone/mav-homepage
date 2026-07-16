---
title: "张量的创建与基本操作"
chapter: 2
readTime: 15
description: "torch.tensor、randn、zeros、ones、arange、linspace，理解标量/向量/矩阵/高维张量。"
---

**本章目标**：掌握PyTorch中最基本的张量创建方法，理解张量这一核心数据结构

## 什么是张量(Tensor)？

在开始学习PyTorch之前，我们首先要理解一个核心概念：**张量（Tensor）**。

### 从熟悉的概念出发

回想一下你学过的数据结构：

- **标量（Scalar）**：一个单独的数，比如 `5`、`3.14`、`1958`
  
  - 在Python中就是一个普通的变量
  - 维度：0维
  
- **向量（Vector）**：一串有序的数，比如 `[1, 2, 3, 4, 5]`
  - 可以理解为一行数字，或者一列数字
  - 维度：1维

- **矩阵（Matrix）**：由行和列组成的数表，比如：
  ```
  [[1, 2, 3],
   [4, 5, 6]]
  ```
  - 维度：2维

- **张量（Tensor）**：矩阵的推广，可以是任意维度
  
  - 3维张量：可以想象成一叠卡片，每张卡片是一个矩阵（或者之前提及的RGB图片）
  - 4维张量：可以想象成一本相册（每本相册有多页，每页有矩阵）
  - ...

### 张量的维度

PyTorch中，张量的维度（dimension）也称为**轴（axis**）。让我们用具体例子来理解：

```python
import torch

# 0维张量：标量
scalar = torch.tensor(5)
print(f"标量: {scalar}, 维度: {scalar.ndim}, 形状: {scalar.shape}")
# 输出：标量: tensor(5), 维度: 0, 形状: torch.Size([])

# 1维张量：向量
vector = torch.tensor([1, 2, 3, 4, 5])
print(f"向量: {vector}, 维度: {vector.ndim}, 形状: {vector.shape}")
# 输出：向量: tensor([1, 2, 3, 4, 5]), 维度: 1, 形状: torch.Size([5])

# 2维张量：矩阵
matrix = torch.tensor([[1, 2, 3],
                       [4, 5, 6]])
print(f"矩阵维度: {matrix.ndim}, 形状: {matrix.shape}")
# 输出：矩阵维度: 2, 形状: torch.Size([2, 3])
# 解释：有2行3列

# 3维张量
tensor_3d = torch.tensor([[[1, 2], [3, 4]],
                          [[5, 6], [7, 8]]])
print(f"3维张量维度: {tensor_3d.ndim}, 形状: {tensor_3d.shape}")
# 输出：3维张量维度: 3, 形状: torch.Size([2, 2, 2])
# 解释：2个2x2的矩阵

# Mav’s tips：快速判断高维张量是几维，只需看开头有几个'['嵌套即可。
```

### 为什么要用张量？

你可能会问：Python已经有列表（list）和NumPy数组了，为什么还需要张量？

**关键区别**：

| 特性 | Python列表 | NumPy数组 | PyTorch张量 |
|------|-----------|----------|------------|
| 执行速度 | 慢 | 快 | 快 |
| GPU加速 | ❌ | ❌ | ✅ |
| 自动求导 | ❌ | ❌ | ✅ |
| 深度学习 | 不适用 | 可用 | **专为深度学习设计** |

**简单来说**：PyTorch张量 = NumPy数组 + GPU加速 + 自动求导，它就是为深度学习“定制”的。

这就是为什么深度学习需要专门的张量数据结构！

---

## torch.tensor：创建张量的核心函数

现在我们正式学习如何创建张量。`torch.tensor`是PyTorch中创建张量最直接的方式。

```python
import torch

# 创建一维张量（向量）
vec = torch.tensor([1, 2, 3, 4, 5])
print(vec)  # tensor([1, 2, 3, 4, 5])

# 创建二维张量（矩阵）
matrix = torch.tensor([[1, 2, 3],
                       [4, 5, 6]])
print(matrix)
# tensor([[1, 2, 3],
#         [4, 5, 6]])

# 创建三维张量
tensor_3d = torch.tensor([[[1, 2], [3, 4]],
                          [[5, 6], [7, 8]]])
print(tensor_3d.shape)  # torch.Size([2, 2, 2])
```

**关键参数说明**：

| 参数 | 作用 | 示例 |
|------|------|------|
| `data` | 张量的数据，可以是列表 | `[1, 2, 3]` |
| `dtype` | 数据类型 | `torch.float32`, `torch.int64` |
| `device` | 存储设备 | `'cpu'`, `'cuda'` |
| `requires_grad` | 是否追踪梯度 | `True`, `False` |

**Mav’s tips：**函数传入参数的顺序无所谓，因为实际写代码时，除了data是直接传数据的，其他参数通常都会明确指定名字（比如requires_grad=True）

```python
# 指定数据类型
float_tensor = torch.tensor([1, 2, 3], dtype=torch.float32)
print(float_tensor.dtype)  # torch.float32

# 开启梯度追踪（后续神经网络训练需要）
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
print(x.requires_grad)  # True

# 创建在GPU上的张量（需要GPU环境）
# device_tensor = torch.tensor([1, 2, 3], device='cuda')
```

**注意事项**：

- 默认情况下，整数创建为`int64`类型，浮点数创建为`float32`类型
- `requires_grad=True`时，PyTorch会自动跟踪所有对该张量的操作，以便后续计算梯度
- 注意：`torch.tensor`会**复制**数据。如果你想复用现有张量的数据，使用`torch.as_tensor()`或`torch.from_numpy()`

**小贴士**：创建张量的另一种方式
如果你已经有了一个NumPy数组，可以直接把它转换成PyTorch张量：

```python
import numpy as np

# NumPy数组
np_array = np.array([1, 2, 3, 4, 5])

# 转换成PyTorch张量
tensor_from_numpy = torch.from_numpy(np_array)
print(tensor_from_numpy)  # tensor([1, 2, 3, 4, 5], dtype=torch.int64)
```

> **重要**：这种转换是**共享内存**的！修改NumPy数组会影响PyTorch张量，反之亦然。如果你想创建独立副本，使用`.clone()`方法。

---

## torch.randn、torch.zeros、torch.ones：创建特殊张量

除了使用torch.tensor从列表创建张量外，PyTorch还提供了多个**便捷函数**来创建具有特定值的张量。

### torch.randn：随机正态分布

torch.randn用于创建服从**标准正态分布**（均值0，方差1）的随机张量。"randn"中的"n"代表"normal"，即高斯分布。

```python
# 创建形状为(3, 4)的随机正态分布张量
random_tensor = torch.randn(3, 4)
print(random_tensor)
# tensor([[ 0.3412, -0.1234,  0.5678, -0.9012],
#         [ 1.2345, -0.5678,  0.9012, -0.3456],
#         [-0.7890,  0.1234, -0.4567,  0.7890]])

# 多维随机张量
random_3d = torch.randn(2, 3, 4)  # 2个3x4的矩阵
print(random_3d.shape)  # torch.Size([2, 3, 4])
```

> **应用场景**：初始化神经网络权重时经常用到，好的权重初始化对模型训练至关重要。

Mav’s tips：`torch.randn`只能用来生成标准正态分布，`torch.normal`可以自定义均值和标准差，其余格式一致。

### torch.zeros 和 torch.ones

torch.zeros创建**全零张量**，torch.ones创建**全一张量**。

```python
# 创建全零张量
zeros = torch.zeros(2, 3)
print(zeros)
# tensor([[0., 0., 0.],
#         [0., 0., 0.]])

# 创建全一张量
ones = torch.ones(3, 2)
print(ones)
# tensor([[1., 1.],
#         [1., 1.],
#         [1., 1.]])

# 创建与已有张量形状相同的全零张量
existing = torch.randn(4, 5)
zeros_like = torch.zeros_like(existing)
print(zeros_like.shape)  # torch.Size([4, 5])
```

> **应用场景**：创建占位符、初始化偏置项、创建掩码等。

### torch.full 和 torch.eye

```python
# 创建全为7的张量
full = torch.full((2, 3), 7)
print(full)
# tensor([[7., 7., 7.],
#         [7., 7., 7.]])

# 创建3x3单位矩阵
identity = torch.eye(3)
print(identity)
# tensor([[1., 0., 0.],
#         [0., 1., 0.],
#         [0., 0., 1.]])
```

---

## torch.arange和torch.linspace：创建序列张量

在深度学习中，经常需要创建**等差数列**或**等比数列**的张量，例如学习率衰减、图像坐标网格等场景。

### torch.arange：不含结束值的等差数列

```python
# 创建0到9的张量（不含10）
arange_1d = torch.arange(10)
print(arange_1d)  # tensor([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

# 指定起始和结束值
arange_custom = torch.arange(5, 15)
print(arange_custom)  # tensor([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])

# 指定步长
arange_step = torch.arange(0, 10, 2)
print(arange_step)  # tensor([0, 2, 4, 6, 8])
```

> **注意**：与Python的`range`不同，arange返回的是张量而非列表。

### torch.linspace：含结束值的等差数列

```python
# 创建包含5个元素的等差数列，从0到1
linspace_1d = torch.linspace(0, 1, 5)
print(linspace_1d)  # tensor([0.0000, 0.2500, 0.5000, 0.7500, 1.0000])

# 创建用于学习率调度的序列
learning_rates = torch.linspace(0.1, 0.001, 100)
print(learning_rates[-1])  # tensor(0.0010)
```

> **应用场景**：linspace保证包含起始和结束值，适合需要精确控制点数量的场景。

---


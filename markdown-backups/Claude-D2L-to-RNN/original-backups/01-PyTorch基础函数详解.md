# PyTorch基础函数详解

> 作者：USTC学生 | 适用人群：**零基础 / 深度学习初学者**
> 特别说明：本笔记面向中科大大一大二同学，即使你之前没有接触过PyTorch或深度学习框架，只要具备Python基础，就能完全理解本笔记的所有内容。
> 更新时间：2026年3月15日

## 目录

- [前言：为什么学习PyTorch](#前言为什么学习pytorch)
- [第一章：张量的创建与基本操作](#第一章张量的创建与基本操作)
  - [1.1 什么是张量(Tensor)？](#11-什么是张量tensor)
  - [1.2 torch.tensor：创建张量的核心函数](#12-torchtensor创建张量的核心函数)
  - [1.3 torch.randn、torch.zeros、torch.ones：创建特殊张量](#13-torchrandntorchzerostorchones创建特殊张量)
  - [1.4 torch.full、torch.eye、torch.randint：更多创建方式](#14-torchfulltorcheyetorchrandint更多创建方式)
  - [1.5 torch.arange和torch.linspace：创建序列张量](#15-torcharangen和torchlinspace创建序列张量)
- [第二章：理解张量的属性](#第二章理解张量的属性)
  - [2.1 shape：查看张量的形状](#21-shape查看张量的形状)
  - [2.2 dtype：查看张量的数据类型](#22-dtype查看张量的数据类型)
  - [2.3 device：查看张量存储的设备](#23-device查看张量存储的设备)
- [第三章：张量的操作与变换](#第三章张量的操作与变换)
  - [3.1 索引与切片：访问张量的特定元素](#31-索引与切片访问张量的特定元素)
  - [3.2 torch.matmul：矩阵乘法的核心函数](#32-torchmatmul矩阵乘法的核心函数)
  - [3.3 @ 运算符：矩阵乘法的便捷写法](#33--运算符矩阵乘法的便捷写法)
  - [3.4 逐元素运算：加法、减法、乘法、除法](#34-逐元素运算加法减法乘法除法)
  - [3.5 reshape和view：改变张量形状](#35-reshape和view改变张量形状)
  - [3.6 squeeze和unsqueeze：添加或移除维度](#36-squeeze和unsqueeze添加或移除维度)
  - [3.7 cat和stack：合并张量](#37-cat和stack合并张量)
  - [3.8 item和numpy：提取张量中的数值](#38-item和numpy提取张量中的数值)
- [第四章：自动求导机制](#第四章自动求导机制)
  - [4.1 梯度是什么？为什么重要？](#41-梯度是什么为什么重要)
  - [4.2 requires_grad：开启梯度追踪](#42-requires_grad开启梯度追踪)
  - [4.3 backward：自动计算梯度](#43-backward自动计算梯度)
  - [4.4 grad：查看计算出的梯度](#44-grad查看计算出的梯度)
  - [4.5 zero_grad：清零梯度](#45-zero_grad清零梯度)
  - [4.6 no_grad：临时关闭梯度计算](#46-no_grad临时关闭梯度计算)
  - [4.7 计算图：理解自动求导的底层原理](#47-计算图理解自动求导的底层原理)
- [第五章：神经网络基础模块](#第五章神经网络基础模块)
  - [5.1 神经网络是什么？一个直观的解释](#51-神经网络是什么一个直观的解释)
  - [5.2 nn.Linear：线性变换层](#52-nnlinear线性变换层)
  - [5.3 激活函数：让网络学会非线性变换](#53-激活函数让网络学会非线性变换)
  - [5.4 nn.Module：神经网络基类](#54-nnmodule神经网络基类)
  - [5.5 nn.Sequential：快速搭建网络](#55-nnsequential快速搭建网络)
  - [5.6 nn.CrossEntropyLoss：交叉熵损失](#56-nncrossentropyloss交叉熵损失)
  - [5.7 torch.optim：优化器](#57-torchoptim优化器)
- [常见错误与解决方案](#常见错误与解决方案)
- [总结与下一步](#总结与下一步)
- [习题](#习题)
- [习题参考解答](#习题参考解答)

---

## 前言：为什么学习PyTorch

### 0.1 深度学习框架的重要性

在正式学习PyTorch之前，让我们先理解一个根本性的问题：**为什么要学习深度学习框架？**

想象一下，如果让你从零开始写一个程序来识别图片中的猫，你需要做什么？

首先，你需要理解猫的特征：耳朵的形状、眼睛的大小、毛发的纹理...然后你需要用数学公式来描述这些特征。当你想要优化这个系统时，你需要计算梯度来调整参数。这整个过程极其复杂且耗时。

而**深度学习框架**正是为了解决这个问题而诞生的。它帮我们封装好了：
- **高效的数值计算**（矩阵运算、梯度计算等）
- **自动求导机制**（自动计算复杂函数的梯度）
- **GPU加速**（利用显卡并行计算，大幅提升速度）
- **现成的神经网络组件**（卷积层、循环层、注意力机制等）

有了框架，我们就可以像搭积木一样构建自己的神经网络，把精力集中在**模型设计**和**数据处理**上，而不是底层实现。

### 0.2 为什么选择PyTorch？

PyTorch是由Facebook（现Meta）的AI研究团队开发的深度学习框架。在2017年推出后，它迅速成为学术研究领域的**首选框架**。

**PyTorch的核心特点**：

1. **动态计算图（Dynamic Computation Graph）**
   - 什么是计算图？简单来说，它是用来记录我们执行了哪些操作的"账本"
   - 动态图的特点是：**每次运行代码时，计算图都会重新构建**
   - 这让调试变得非常直观——你可以像调试普通Python代码一样调试PyTorch代码
   - 想象一下：你在写一段代码，中途想print一个变量的值看看对不对，这在PyTorch中完全没问题！

2. **Python优先的设计理念**
   - PyTorch的API设计非常Pythonic（符合Python的风格）
   - 如果你熟悉Python，学PyTorch会感觉非常自然
   - 不需要学习额外的"框架特定语言"

3. **GPU加速**
   - 深度学习涉及大量的矩阵运算
   - GPU（显卡）特别擅长并行处理这类运算
   - 使用GPU可以让训练速度提升**10倍甚至100倍**
   - 举例：CPU训练一个模型需要几天，GPU可能只需要几小时

4. **自动微分（Automatic Differentiation）**
   - 这是深度学习框架最核心的功能
   - 想象一下：你写了一个很复杂的神经网络（可能几百层）
   - 如果让你手动计算梯度...这简直是不可能的任务
   - 自动微分让我们只需要定义前向传播，框架会自动处理反向传播和梯度计算

### 0.3 张量：PyTorch的核心数据结构

PyTorch的核心数据结构是**张量（Tensor）**。听起来很高大上，其实它就是我们熟悉的**多维数组**的学术说法：

- **0维张量**：一个标量（数字），比如 `5`
- **1维张量**：一个向量，比如 `[1, 2, 3, 4, 5]`
- **2维张量**：一个矩阵，比如 `[[1,2,3], [4,5,6]]`
- **3维张量**：可以想象成一叠照片（比如RGB图像）
- **更高维**：可以想象成视频（3D+时间维度）

张量类似于NumPy的`ndarray`，但它额外支持：
- **GPU加速**：可以在GPU上存储和计算
- **自动求导**：可以追踪梯度

### 0.4 本笔记的学习路线

本笔记是整个深度学习笔记系列的**基础篇**，目标是：

**第一章**：掌握PyTorch的核心数据结构——张量（Tensor）的创建与基本操作

- 学会用 `torch.tensor`、`torch.randn`、`torch.zeros` 等函数创建张量
- 理解标量、向量、矩阵与高维张量的关系
- 掌握 `torch.arange`、`torch.linspace` 等序列创建函数

**第二章**：理解张量的属性

- 掌握 `shape`、`dtype`、`device` 三大核心属性
- 学会在不同设备（CPU/GPU）之间迁移张量

**第三章**：掌握张量的操作与变换

- 矩阵乘法（`@`、`torch.matmul`）
- 形状变换（`reshape`、`view`、`squeeze`、`unsqueeze`）
- 张量合并（`cat`、`stack`）与数值提取（`item`、`numpy`）

**第四章**：理解自动求导机制

- 这是 PyTorch 最强大的特性
- 掌握 `requires_grad`、`backward`、`zero_grad`、`no_grad`
- 理解计算图与梯度下降的联系

**第五章**：掌握神经网络的基础模块

- 线性层（`nn.Linear`）、激活函数、损失函数、优化器
- 学会用 `nn.Module` 和 `nn.Sequential` 构建完整的神经网络

> **前置知识**：本笔记假设你已经有Python基础，会写循环、条件语句、函数等。如果你还不太熟悉Python，建议先学习Python基础课程。另外，了解一点线性代数（知道什么是矩阵、向量）会有帮助，但不是必须的——我们会在需要时解释相关概念。

---

## 第一章：张量的创建与基本操作

**本章目标**：掌握PyTorch中最基本的张量创建方法，理解张量这一核心数据结构

### 1.1 什么是张量(Tensor)？

在开始学习PyTorch之前，我们首先要理解一个核心概念：**张量（Tensor）**。

#### 1.1.1 从熟悉的概念出发

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

#### 1.1.2 张量的维度

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

#### 1.1.3 为什么要用张量？

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

### 1.2 torch.tensor：创建张量的核心函数

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

### 1.3 torch.randn、torch.zeros、torch.ones：创建特殊张量

除了使用torch.tensor从列表创建张量外，PyTorch还提供了多个**便捷函数**来创建具有特定值的张量。

#### torch.randn：随机正态分布

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

#### torch.zeros 和 torch.ones

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

#### torch.full 和 torch.eye

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

### 1.4 torch.arange和torch.linspace：创建序列张量

在深度学习中，经常需要创建**等差数列**或**等比数列**的张量，例如学习率衰减、图像坐标网格等场景。

#### torch.arange：不含结束值的等差数列

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

#### torch.linspace：含结束值的等差数列

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

## 第二章：理解张量的属性

**本章目标**：掌握查看和理解张量属性的方法

### 2.1 shape：查看张量的形状

shape是张量**最重要**的属性之一，表示张量在各个维度上的大小。

```python
# 创建不同形状的张量
vec = torch.tensor([1, 2, 3])
matrix = torch.randn(3, 4)
tensor_3d = torch.randn(2, 3, 4)
tensor_4d = torch.randn(5, 2, 3, 4)

print(vec.shape)       # torch.Size([3])
print(matrix.shape)    # torch.Size([3, 4])
print(tensor_3d.shape) # torch.Size([2, 3, 4])
print(tensor_4d.shape) # torch.Size([5, 2, 3, 4])
```

**深度学习中张量形状的约定**：

| 数据类型 | 形状 | 含义 |
|----------|------|------|
| 图像数据 | `(N, C, H, W)` | 批量大小N，通道C，高H，宽W |
| 文本数据 | `(N, L)` | 批量N，序列长度L |
| 文本embedding | `(N, L, D)` | 批量N，长度L，维度D |
| 批量矩阵 | `(N, M)` | 批量N，特征M |

**示例**：
```python
# 32张RGB图像，每张224x224
images = torch.randn(32, 3, 224, 224)
print(images.shape)  # torch.Size([32, 3, 224, 224])
# N=32（32张图）, C=3（RGB三通道）, H=224, W=224
```

> **调试技巧**：当形状不匹配时，PyTorch会抛出错误。理解每个张量在各维度的含义是调试神经网络的基础。

---

### 2.2 dtype：查看张量的数据类型

dtype表示张量中元素的**数据类型**。不同的数据类型占用不同的内存，也影响计算的精度和速度。

```python
# 查看张量的数据类型
int_tensor = torch.tensor([1, 2, 3])
float_tensor = torch.tensor([1.0, 2.0, 3.0])
bool_tensor = torch.tensor([True, False, True])

print(int_tensor.dtype)   # torch.int64
print(float_tensor.dtype) # torch.float32
print(bool_tensor.dtype)  # torch.bool
```

**常用数据类型速查表**：

| dtype | 名称 | 用途 |
|-------|------|------|
| `torch.float32` / `torch.float` | 32位浮点 | 默认类型，训练常用 |
| `torch.float64` / `torch.double` | 64位浮点 | 高精度计算 |
| `torch.float16` / `torch.half` | 16位浮点 | GPU加速、混合精度训练 |
| `torch.int32` | 32位整数 | 通用整数 |
| `torch.int64` / `torch.long` | 64位整数 | 索引、大整数 |
| `torch.int8` | 8位整数 | 量化 |
| `torch.uint8` | 无符号8位整数 | 图像像素（0-255） |
| `torch.bool` | 布尔 | 条件判断 |

> **实践建议**：训练时通常使用float32，推理时可用float16加速，处理图像时用uint8。

---

### 2.3 device：查看张量存储的设备

device表示张量存储的设备，可以是**CPU**或**GPU**。

```python
# 查看张量所在的设备
cpu_tensor = torch.randn(3, 4)
print(cpu_tensor.device)  # cpu

# 尝试移动到GPU（如果有GPU的话）
if torch.cuda.is_available():
    gpu_tensor = cpu_tensor.cuda()  # 或 cpu_tensor.to('cuda')
    print(gpu_tensor.device)  # cuda:0
```

**设备处理最佳实践**：

```python
# 推荐的设备处理方式
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

x = torch.randn(3, 4, device=device)
model = MyModel().to(device)

# 数据也需要移到相同设备
data = data.to(device)
```

---

## 第三章：张量的操作与变换

**本章目标**：掌握张量的核心操作，为后续神经网络打下基础

### 3.1 torch.matmul：矩阵乘法的核心函数

torch.matmul是PyTorch中进行**矩阵乘法**的核心函数。这是深度学习中最基本的运算，无论是神经网络的线性层、全连接层，还是注意力机制，都离不开矩阵乘法。

**维度规则**：如果矩阵A的形状是(m, n)，矩阵B的形状是(n, k)，则结果矩阵的形状是(m, k)。

```python
# 基本的矩阵乘法
A = torch.randn(2, 3)  # 2行3列
B = torch.randn(3, 4)  # 3行4列
C = torch.matmul(A, B)  # 结果是2行4列
print(C.shape)  # torch.Size([2, 4])

# 向量与矩阵相乘
vector = torch.randn(3)      # 形状 (3,)
matrix = torch.randn(3, 4)  # 形状 (3, 4)
result = torch.matmul(vector, matrix)  # 结果形状 (4,)
print(result.shape)  # torch.Size([4])

# 批量矩阵乘法（用于CNN、RNN等）
A_batch = torch.randn(10, 3, 4)  # 10个3x4的矩阵
B_batch = torch.randn(10, 4, 5)  # 10个4x5的矩阵
C_batch = torch.matmul(A_batch, B_batch)  # 10个3x5的矩阵
print(C_batch.shape)  # torch.Size([10, 3, 5])
```

**相关函数对比**：

| 函数 | 作用 | 示例 |
|------|------|------|
| `torch.matmul` | 通用矩阵乘法（推荐） | 支持批量、广播 |
| `torch.mm` | 二维矩阵乘法 | 只支持2D |
| `torch.mul` | 元素-wise乘法（逐元素） | `[1,2] * [3,4] = [3,8]` |
| `torch.dot` | 向量点积 | `1*4 + 2*5 + 3*6 = 32` |

```python
a = torch.tensor([1, 2, 3])
b = torch.tensor([4, 5, 6])

# 点积：对应元素相乘后求和
print(torch.dot(a, b))      # tensor(32)

# 元素-wise乘法：逐元素相乘
print(torch.mul(a, b))       # tensor([4, 10, 18])

# 矩阵乘法（二维）
A = torch.tensor([[1, 2], [3, 4]])
B = torch.tensor([[5, 6], [7, 8]])
print(torch.mm(A, B))
# tensor([[19, 22],
#         [43, 50]])
```

---

### 3.2 @ 运算符：矩阵乘法的便捷写法

在Python中，**@运算符**是矩阵乘法的简写形式（PEP 465）。它就是`torch.matmul`的运算符重载版本。

```python
A = torch.randn(3, 4)
B = torch.randn(4, 5)

# 两种写法完全等价
C1 = torch.matmul(A, B)
C2 = A @ B

print(torch.allclose(C1, C2))  # True
```

**实际应用**：

```python
# 示例：手动实现一个简单的线性层
class LinearLayer:
    def __init__(self, input_dim, output_dim):
        self.weights = torch.randn(input_dim, output_dim) * 0.01
        self.bias = torch.zeros(output_dim)

    def forward(self, x):
        return x @ self.weights + self.bias

# 使用
linear = LinearLayer(784, 256)
x = torch.randn(32, 784)  # batch_size=32, input_dim=784
output = linear.forward(x)
print(output.shape)  # torch.Size([32, 256])
```

---

### 3.3 reshape和view：改变张量形状

reshape和view都用于**改变张量的形状**，但不改变底层的数据。

```python
# 创建原始张量
original = torch.randn(2, 3, 4)
print(original.shape)  # torch.Size([2, 3, 4])

# 使用reshape改变形状
reshaped = original.reshape(2, 12)
print(reshaped.shape)  # torch.Size([2, 12])

# 用-1让PyTorch自动推断维度
auto_shape = original.reshape(2, -1)
print(auto_shape.shape)  # torch.Size([2, 12])

# 展平为一维
flat = original.reshape(-1)
print(flat.shape)  # torch.Size([24])

# view的用法类似（但需要内存连续）
viewed = original.view(2, 12)
print(viewed.shape)  # torch.Size([2, 12])
```

**重要区别**：
- `view()` 要求张量在内存中是**连续存储**的
- `reshape()` 在必要时会**自动复制数据**以确保连续性
- **推荐使用 `reshape()`**，更安全

**实际应用 - 图像展平**：

```python
# 32张RGB图像，每张224x224
images = torch.randn(32, 3, 224, 224)

# 展平为(batch_size, 784)以便输入全连接层
images_flattened = images.reshape(32, -1)
print(images_flattened.shape)  # torch.Size([32, 150528])

# 重新reshape回原来的形状
images_restored = images_flattened.reshape(32, 3, 224, 224)
print(images_restored.shape)  # torch.Size([32, 3, 224, 224])
```

---

### 3.4 item和numpy：提取张量中的数值

#### item()：张量转Python标量

```python
# 单元素张量转Python标量
scalar_tensor = torch.tensor(42)
print(scalar_tensor)        # tensor(42)
print(scalar_tensor.item()) # 42 (Python int)

# 在训练循环中获取损失值
loss = torch.tensor(0.5)
loss_value = loss.item()
print(f"Loss: {loss_value}")  # Loss: 0.5

# 注意：如果张量有多个元素，item()会报错
multi_tensor = torch.tensor([1, 2, 3])
# multi_tensor.item()  # RuntimeError: a Tensor with 1 element
```

#### numpy()：张量转NumPy数组

```python
# 张量转NumPy数组
tensor = torch.randn(3, 4)
numpy_array = tensor.numpy()

print(type(tensor))      # <class 'torch.Tensor'>
print(type(numpy_array)) # <class 'numpy.ndarray'>)

# ⚠️ 重要：转换是共享内存的！
numpy_array[0, 0] = 999
print(tensor[0, 0])  # tensor(999.) - 同步修改

# NumPy数组转PyTorch张量
import numpy as np
np_array = np.array([1, 2, 3, 4, 5])
torch_tensor = torch.from_numpy(np_array)
print(torch_tensor)  # tensor([1, 2, 3, 4, 5], dtype=torch.int64)
```

**创建不共享内存的副本**：

```python
# 分离梯度追踪并转为NumPy
tensor = torch.randn(3, 4)
numpy_copy = tensor.detach().numpy()  # detach()切断梯度追踪
```

---

## 第四章：自动求导机制

**本章目标**：理解PyTorch的核心优势——自动微分

> 这是PyTorch最强大的特性！有了它，你无需手动计算复杂梯度，只需要定义前向传播，PyTorch会自动处理反向传播。

### 4.0 梯度是什么？为什么重要？

在深入学习PyTorch的自动求导机制之前，我们先来理解一个核心概念：**梯度（Gradient）**。

#### 4.0.1 直观理解梯度

想象一下你在一座山上，想找到山顶（或者最低点——山谷）。梯度就像是告诉你**应该往哪个方向走**才能最快到达目的地。

**数学定义**：梯度是**函数在某一点上变化最快的方向**

- 对于函数 $f(x)$，梯度 $\nabla f$ 指向函数值**增加最快**的方向
- 如果你想**最小化**一个函数（比如损失函数），你需要往梯度的**反方向**走

#### 4.0.2 梯度在深度学习中的作用

在深度学习中，我们的目标是**最小化损失函数**（Loss Function）。

**训练过程**：
1. **前向传播（Forward Pass）**：输入数据通过网络，计算输出
2. **计算损失（Compute Loss）**：比较网络输出和真实标签，得到一个"错误程度"
3. **反向传播（Backward Pass）**：计算损失对每个参数的梯度
4. **更新参数**：根据梯度调整参数，让损失变小
5. 重复以上步骤...

**这就是梯度下降（Gradient Descent）的核心思想**！

$$w_{new} = w_{old} - \alpha \cdot \nabla L$$

其中 $\alpha$ 是学习率（learning rate），控制每一步走多远。

#### 4.0.3 手动计算梯度的痛苦

假设你有一个两层神经网络：

```
输入 -> 第一层(权重W1) -> 激活函数 -> 第二层(权重W2) -> 输出
```

要手动计算损失对W1的梯度，你需要：
1. 写出完整的数学公式
2. 应用链式法则（Chain Rule）
3. 一步步求导...

对于一个现代神经网络，可能有**几亿个参数**！手动计算完全不现实。

**这就是为什么需要自动求导！**

---

### 4.1 requires_grad：开启梯度追踪

`requires_grad`决定PyTorch是否自动跟踪对该张量的操作。

```python
# 默认创建的张量不追踪梯度
x = torch.tensor([1.0, 2.0, 3.0])
print(x.requires_grad)  # False

# 创建时开启梯度追踪
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
print(x.requires_grad)  # True

# 后续修改
x = torch.tensor([1.0, 2.0, 3.0])
x.requires_grad = True
print(x.requires_grad)  # True
```

**实际使用**：通常不需要手动设置，而是通过神经网络的参数自动获得。

```python
# 神经网络层会自动追踪梯度
linear = nn.Linear(3, 1)
print(linear.weight.requires_grad)  # True
print(linear.bias.requires_grad)    # True
```

---

### 4.2 backward：自动计算梯度

backward()根据计算图**自动计算**所有requires_grad=True的张量的梯度。

**Mav's Tips：**一个注意点，`backward()`只能作用于标量，常见的办法是像下文中对张量y进行`sum()`操作，得到标量z，最后对z进行反向传播。

```python
# 简单的梯度计算示例
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
y = x ** 2       # y = x^2
z = y.sum()      # z = 1^2 + 2^2 + 3^2 = 14

# 反向传播
z.backward()

# 查看梯度：dz/dx = 2x
print(x.grad)  # tensor([2., 4., 6.])
# d(z)/d(x[0]) = 2 * 1 = 2
# d(z)/d(x[1]) = 2 * 2 = 4
# d(z)/d(x[2]) = 2 * 3 = 6
```

**模拟神经网络梯度计算**：

```python
# 模拟一个简单的神经网络前向传播
x = torch.randn(1, 3, requires_grad=True)  # 输入
w = torch.randn(3, 1, requires_grad=True)  # 权重
b = torch.randn(1, requires_grad=True)      # 偏置

# 前向传播
y = x @ w + b  # 矩阵乘法 + 偏置
loss = y.sum()  # 损失

# 反向传播
loss.backward()

# 查看梯度
print("x的梯度:", x.grad)
print("w的梯度:", w.grad)
print("b的梯度:", b.grad)
```

---

### 4.3 grad：查看计算出的梯度

grad属性存储通过backward()计算出的梯度值。

```python
# 创建需要梯度的张量
x = torch.tensor([2.0, 3.0], requires_grad=True)

# 进行一些计算
y = x[0] ** 2 + 2 * x[1]
y.backward()

# 查看梯度
print(x.grad)  # tensor([4., 2.])
# dy/dx[0] = 2*x[0] = 4
# dy/dx[1] = 2 = 2
```

---

**⚠️ 重要：梯度累积特性**

在PyTorch中，梯度会**累积**而不是被替换。每次调用backward()时，新计算的梯度会加到现有的grad值上。

```python
# 梯度累积示例
x = torch.tensor([1.0], requires_grad=True)

for i in range(3):
    y = x ** 2
    y.backward()
    print(f"第{i+1}次反向传播后, grad = {x.grad}")

# 输出：
# 第1次反向传播后, grad = tensor([2.])
# 第2次反向传播后, grad = tensor([4.])  # 2 + 2
# 第3次反向传播后, grad = tensor([6.])  # 4 + 2
```

---

### 4.4 zero_grad：清零梯度

由于PyTorch默认累积梯度，训练循环中每次参数更新前**必须清零梯度**。

```python
# 标准的训练循环
optimizer = torch.optim.SGD(net.parameters(), lr=0.01)

for data, target in dataloader:
    # 1. 前向传播
    output = net(data)
    loss = criterion(output, target)

    # 2. 清零梯度（重要！！！）
    optimizer.zero_grad()

    # 3. 反向传播
    loss.backward()

    # 4. 更新参数
    optimizer.step()
```

**三种清零梯度的方式**：

```python
# 方法1：使用优化器（推荐）
optimizer.zero_grad()

# 方法2：直接对参数操作
for param in net.parameters():
    param.grad.zero_()

# 方法3：将grad设为None（更高效）
for param in net.parameters():
    param.grad = None
```

---

### 4.5 no_grad：临时关闭梯度计算

torch.no_grad()是上下文管理器，用于**临时关闭梯度计算**。这在评估阶段特别重要，可以节省内存和计算资源。

```python
net = nn.Linear(3, 1)
x = torch.randn(2, 3)

# 训练模式：需要计算梯度
output = net(x)
print(output.requires_grad)  # True

# 推理模式：不需要计算梯度
with torch.no_grad():
    output = net(x)
    print(output.requires_grad)  # False
```

**典型应用场景**：

```python
# 评估模式
net.eval()  # 设置为评估模式
with torch.no_grad():
    for data, target in test_loader:
        output = net(data)
        # ... 计算准确率等指标
```

> **补充**：`torch.inference_mode()`是`no_grad()`的更严格版本，在PyTorch 1.9+中推荐使用，性能更好。

---

## 第五章：神经网络基础模块

**本章目标**：掌握PyTorch中构建神经网络的核心组件

### 5.0 神经网络是什么？

在开始学习PyTorch的神经网络模块之前，我们先来理解一个根本性的问题：**神经网络到底是什么？**

#### 5.0.1 神经网络的直观理解

想象一下你有一堆**乐高积木**。每个积木块只能做很简单的事情（比如把输入乘以某个数然后加起来）。但是当你把这些积木块**堆叠**在一起时，它们就能完成非常复杂的事情！

神经网络就是这样一个"积木系统"：

- **神经元（Neuron）**：最基本单元，类似乐高积木块
- **层（Layer）**：由多个神经元组成
- **网络（Network）**：由多层组成

#### 5.0.2 神经元的工作原理

一个最简单的神经元（也称为**感知机**或**线性单元**）是这样工作的：

```
输入 x -> 乘以权重 w -> 加上偏置 b -> 输出 y
```

数学公式：
$$y = w \cdot x + b$$

或者用向量形式：
$$y = \mathbf{w}^T \mathbf{x} + b$$

其中：
- $\mathbf{x}$ 是输入向量（比如一张图片的所有像素值）
- $\mathbf{w}$ 是权重向量（决定每个输入有多重要）
- $b$ 是偏置（调整输出的基准）
- $y$ 是输出

#### 5.0.3 为什么要多层？

单层神经元只能做**线性变换**——也就是说，它只能学会画一条直线（或者一个平面）。

但现实世界的问题往往**不是线性的**！比如：
- 识别猫和狗：不能简单地用一条直线分开
- 下棋：需要复杂的策略

**解决方法**：堆叠多层！每加一层，网络就能学习更复杂的模式。

这就是为什么我们需要**深度学习**——"深度"指的就是层数多！

#### 5.0.4 PyTorch中的神经网络

PyTorch为神经网络提供了完整的工具箱：

| 组件 | 作用 |
|------|------|
| `nn.Linear` | 线性变换（全连接层） |
| `nn.Conv2d` | 卷积层（处理图像） |
| `nn.RNN` / `nn.LSTM` | 循环层（处理序列） |
| `nn.ReLU` / `nn.Sigmoid` | 激活函数 |
| `nn.CrossEntropyLoss` | 损失函数 |
| `torch.optim` | 优化器 |

接下来，让我们逐一学习这些组件！

---

### 5.1 nn.Linear：线性变换层

`nn.Linear`是PyTorch中最基本的神经网络层，也称为**全连接层（Fully Connected Layer）**或**密集层（Dense Layer）**。

**数学公式**：
$$\mathbf{y} = \mathbf{x} \mathbf{W}^T + \mathbf{b}$$

或者更详细地：
$$y_i = \sum_{j=1}^{n} x_j \cdot W_{ij} + b_i$$

其中：
- $\mathbf{x}$：输入向量，形状为 `(batch_size, input_dim)`
- $\mathbf{W}$：权重矩阵，形状为 `(output_dim, input_dim)`
- $\mathbf{b}$：偏置向量，形状为 `(output_dim,)`
- $\mathbf{y}$：输出向量，形状为 `(batch_size, output_dim)`

```python
import torch.nn as nn

# 创建一个线性层
# 输入维度3，输出维度2
linear = nn.Linear(3, 2)

# 查看线性层的参数
print("权重形状:", linear.weight.shape)  # torch.Size([2, 3])
print("偏置形状:", linear.bias.shape)    # torch.Size([2])

# 前向传播
x = torch.randn(4, 3)  # 批量大小4，输入维度3
output = linear(x)      # 输出维度2
print("输出形状:", output.shape)  # torch.Size([4, 2])
```

**手动验证**：

```python
# 验证nn.Linear的计算
linear = nn.Linear(3, 2)
x = torch.randn(4, 3)

# PyTorch的实现
output_pytorch = linear(x)

# 手动计算：y = xW^T + b
xWt = x @ linear.weight.t()
output_manual = xWt + linear.bias

print(torch.allclose(output_pytorch, output_manual))  # True
```

**实际应用**：

```python
# 示例：简单的多层神经网络
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(784, 256)
        self.layer2 = nn.Linear(256, 10)

    def forward(self, x):
        x = x.reshape(x.size(0), -1)  # 展平
        x = torch.relu(self.layer1(x))  # 激活函数
        x = self.layer2(x)
        return x

net = SimpleNet()
print(net)
# SimpleNet(
#   (layer1): Linear(in_features=784, out_features=256, bias=True)
#   (layer2): Linear(in_features=256, out_features=10, bias=True)
# )
```

**Mav's Tips：**

**Python 类与继承基础（结合 PyTorch）**

##### **1. 第三方库**

Python 的第三方库类似 C 的 `#include`，是别人封装好的功能，直接调用即可。区别在于 Python 的第三方库需要先用 `pip install` 安装，自带的标准库（`os`、`math` 等）不需要。`import as` 是简写用途，比如 `import torch.nn as nn`，之后用 `nn` 代替 `torch.nn`。`torch` 和 `torch.nn` 是包含关系，`torch.nn` 是 `torch` 里专门负责神经网络的子模块，可以单独引入。

##### 2. 类的继承

```
class Dog(Animal):
    pass
```

括号内写父类名，表示继承——子类自动拥有父类的所有方法和结构，不需要重写。如果子类只写 `pass`，直接可以调用父类的方法。

##### **3.`super()` 的作用**

如果子类自己定义了 `__init__`，会覆盖父类的 `__init__`，父类的初始化逻辑就被跳过了。`super().__init__()` 的作用是手动把父类的初始化补回来。

所以"继承 + 自己还要新增内容"的标准写法是：

```
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()   # 先跑父类的初始化
        self.layer1 = nn.Linear(784, 256)  # 再加自己的东西
```

##### **4. 为什么 PyTorch 要用继承而不是直接调用**

`import` 只是让你在文件里能使用某个库的名字。新建一个类时，类本身是空壳，不会自动拥有 `nn.Module` 的内部结构。

- 直接用：调现成的零件，如 `nn.Linear(784, 256)`
- 继承：基于框架造自己的新东西，如自定义网络 `SimpleNet`

`()` 里写 `nn.Module` 是声明继承关系，`super().__init__()` 是让那套结构真正在对象里初始化起来，两步缺一不可。

---

### 5.2 nn.Module：神经网络基类

nn.Module是所有神经网络模块的**基类**。当你定义自己的神经网络时，需要继承nn.Module并实现forward方法。

```python
class MyNetwork(nn.Module):
    def __init__(self):
        super().__init__()  # 调用父类初始化

        # 定义网络层（会自动注册为子模块）
        self.linear1 = nn.Linear(10, 20)
        self.linear2 = nn.Linear(20, 5)
        self.relu = nn.ReLU()

    def forward(self, x):
        # 定义前向传播
        x = self.linear1(x)
        x = self.relu(x)
        x = self.linear2(x)
        return x

# 创建网络实例
net = MyNetwork()

# 查看网络结构
print(net)

# 查看所有可学习参数
for name, param in net.named_parameters():
    print(f"{name}: {param.shape}")
```

**nn.Module的常用方法**：

| 方法 | 作用 |
|------|------|
| `net.parameters()` | 返回所有参数迭代器 |
| `net.named_parameters()` | 返回参数名称和迭代器 |
| `net.state_dict()` | 返回参数字典（用于保存模型） |
| `net.load_state_dict()` | 加载参数字典 |
| `net.train()` | 切换到训练模式 |
| `net.eval()` | 切换到评估模式 |
| `net.to(device)` | 移动到指定设备 |

**模型保存与加载**：

```python
import torch
from torch import nn

# 定义模型
model = nn.Linear(3, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# 保存模型和优化器状态
torch.save({
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'epoch': 10
}, 'checkpoint.pth')
print("模型已保存！")

# 加载检查点
checkpoint = torch.load('checkpoint.pth')
model.load_state_dict(checkpoint['model_state_dict'])
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
epoch = checkpoint['epoch']

print(f"模型已加载，恢复到第 {epoch} 轮训练！")
```

**Mav's Tips:** 
`parameters()` 简单说就是返回所有 `requires_grad=True` 的参数。
`name_parameters()` 是返回参数和结构
`state_dict()` 以字典形式返回所有参数
`load_state_dict()` 加载所有参数到新模型中
`torch.save()` 把数据保存到文件中，搭配 `state_dict()` 使用
`torch.load()` 是把文件数据加载出来

---

### 5.3 nn.Sequential：快速搭建网络

nn.Sequential是一个简单的**容器**，用于快速搭建顺序执行的神经网络。

```python
# 方法1：直接传入层
net = nn.Sequential(
    nn.Linear(10, 20),
    nn.ReLU(),
    nn.Linear(20, 5)
)

print(net)
# Sequential(
#   (0): Linear(in_features=10, out_features=20, bias=True)
#   (1): ReLU()
#   (2): Linear(in_features=20, out_features=5, bias=True)
# )

x = torch.randn(3, 10)
output = net(x)
print(output.shape)  # torch.Size([3, 5])
```

**结合OrderedDict可以给每一层命名**：

```python
from collections import OrderedDict

net = nn.Sequential(OrderedDict([
    ('fc1', nn.Linear(10, 20)),
    ('relu', nn.ReLU()),
    ('fc2', nn.Linear(20, 5))
]))

print(net.fc1.weight.shape)  # 可以用名字访问
```

> **适用场景**：适合构建简单的线性网络。复杂网络（跳跃连接、多分支等）需要使用nn.Module手动定义。

---

### 5.4 nn.CrossEntropyLoss：交叉熵损失

nn.CrossEntropyLoss是分类问题中最常用的**损失函数**。它结合了LogSoftmax和NLLLoss。

```python
import torch.nn as nn

# 创建损失函数
criterion = nn.CrossEntropyLoss()

# 模拟预测输出（未归一化的分数，也叫logits）
predictions = torch.randn(4, 10)  # 4个样本，10个类别

# 真实标签
labels = torch.tensor([3, 0, 5, 7])

# 计算损失
loss = criterion(predictions, labels)
print("损失值:", loss.item())
```

> **注意**：使用CrossEntropyLoss时**不需要**显式地应用softmax，因为损失函数内部已经处理了这一点。

**手动验证交叉熵**：

```python
def manual_cross_entropy(pred, label):
    # 1. softmax归一化
    exp_pred = torch.exp(pred)
    probs = exp_pred / exp_pred.sum(dim=1, keepdim=True)

    # 2. 取正确类别的概率
    label_prob = probs[range(len(label)), label]

    # 3. 计算负对数似然
    loss = -torch.log(label_prob).mean()
    return loss

predictions = torch.randn(4, 10)
labels = torch.tensor([3, 0, 5, 7])

loss_pytorch = nn.CrossEntropyLoss()(predictions, labels)
loss_manual = manual_cross_entropy(predictions, labels)

print("PyTorch损失:", loss_pytorch.item())
print("手动计算:", loss_manual.item())
print("相近:", torch.allclose(loss_pytorch, loss_manual))
```

**Mav's Tips：**如果你已经对数据使用了 Softmax，那就应该使用 `nn.NLLLoss`。

---

### 5.5 torch.optim：优化器

torch.optim提供了各种**优化算法**，用于更新神经网络的参数。

```python
import torch.optim as optim

# 创建网络
net = nn.Linear(10, 2)

# 创建SGD优化器
optimizer = optim.SGD(net.parameters(), lr=0.01)

# 或者创建Adam优化器（通常收敛更快）
optimizer = optim.Adam(net.parameters(), lr=0.001)
```

**标准训练循环**：

```python
for epoch in range(100):
    for data, target in dataloader:
        # 1. 前向传播
        output = net(data)
        loss = criterion(output, target)

        # 2. 清零梯度
        optimizer.zero_grad()

        # 3. 反向传播
        loss.backward()

        # 4. 更新参数
        optimizer.step()
```

**常用优化器对比**：

| 优化器 | 优点 | 缺点 | 适用场景 |
|--------|------|------|----------|
| SGD | 简单、理论基础好 | 收敛慢、需要调参 | 研究基线 |
| Adam | 自适应学习率、易调参 | 可能泛化稍差 | 实际应用首选 |
| AdamW | 正则化效果好 | - | 推荐使用 |
| RMSprop | 自适应学习率 | - | RNN等 |

**学习率调度器**：

```python
# 每10个epoch降低学习率
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)

for epoch in range(100):
    # 训练...
    scheduler.step()
    print(f"Epoch {epoch}, 学习率: {scheduler.get_last_lr()[0]}")
```

---

## 常见错误与解决方案

### 1. 形状不匹配错误

```python
# 错误：矩阵乘法维度不匹配
A = torch.randn(2, 3)
B = torch.randn(5, 4)
C = A @ B  # RuntimeError: mat1 and mat2 shapes cannot be multiplied

# 解决：确保维度匹配
B = torch.randn(3, 4)
C = A @ B  # 正确：(2,3) @ (3,4) -> (2,4)
```

### 2. 设备不匹配错误

```python
# 错误：模型在GPU，数据在CPU
model = nn.Linear(10, 2).cuda()
data = torch.randn(2, 10)  # 默认在CPU
output = model(data)  # RuntimeError: Expected all tensors to be on the same device

# 解决：将数据移到GPU
data = data.cuda()
# 或
data = data.to('cuda')
```

### 3. 梯度未清零

```python
# 错误：梯度累积导致训练异常
for epoch in range(10):
    loss = net(x)
    loss.backward()
    optimizer.step()  # 忘记清零！

# 解决：每次迭代前清零
for epoch in range(10):
    optimizer.zero_grad()
    loss = net(x)
    loss.backward()
    optimizer.step()
```

### 4. 类型不匹配

```python
# 错误：类型不匹配
x = torch.randn(3, 4, dtype=torch.float32)
weight = torch.randn(4, 2, dtype=torch.float64)
output = x @ weight  # RuntimeError

# 解决：确保类型一致
weight = weight.float()  # 或 dtype=torch.float32
```

---

## 总结与下一步

### 本篇笔记核心要点

1. **张量创建**：torch.tensor, torch.randn, torch.zeros, torch.ones
2. **张量属性**：shape, dtype, device
3. **张量操作**：矩阵乘法(@, matmul)、形状变换(reshape)、类型转换(item, numpy)
4. **自动求导**：requires_grad, backward, grad, zero_grad, no_grad
5. **神经网络模块**：nn.Linear, nn.Module, nn.Sequential, CrossEntropyLoss, optim

### 下一步学习建议

- **数据加载**：学习torch.utils.data.DataLoader和Dataset
- **图像处理**：学习torchvision.transforms
- **CNN搭建**：学习nn.Conv2d, nn.MaxPool2d
- **实战项目**：尝试Fashion-MNIST分类

### 快速查阅表

```python
# 创建张量
torch.tensor([1,2,3])           # 从列表创建
torch.randn(3, 4)                # 随机正态
torch.zeros(3, 4)                # 全零
torch.ones(3, 4)                 # 全一

# 属性
tensor.shape                     # 形状
tensor.dtype                     # 类型
tensor.device                    # 设备

# 操作
x @ w                           # 矩阵乘法
x.reshape(-1)                   # 形状变换
x.item()                        # 转标量
x.numpy()                       # 转numpy

# 自动求导
x.requires_grad = True          # 开启追踪
loss.backward()                 # 反向传播
optimizer.zero_grad()           # 清零梯度
with torch.no_grad():           # 推理模式

# 神经网络
nn.Linear(784, 256)             # 全连接层
nn.Sequential(...)               # 顺序容器
nn.CrossEntropyLoss()           # 损失函数
optim.SGD(params, lr=0.01)      # 优化器
```

---

*本笔记是USTC学生深度学习笔记系列第一篇*

---

## 习题

> 以下习题覆盖本笔记的核心知识点，建议先独立思考，再对照解答。题目难度由易到难排列。

**习题 1（基础）**：下列代码的输出结果是什么？请说明理由。  &nbsp; [ [查看解答](#ans1) ]
<a id="ex1"></a>

```python
import torch
a = torch.tensor([[1, 2, 3], [4, 5, 6]])
print(a.ndim, a.shape, a.dtype)
```

**习题 2（基础）**：`torch.arange` 和 `torch.linspace` 有什么关键区别？分别给出一个适合使用各自函数的场景。 &nbsp; [ [查看解答](#ans2) ]
<a id="ex2"></a>

**习题 3（理解）**：以下代码的输出是什么？为什么？如何避免这种"惊喜"？ &nbsp; [ [查看解答](#ans3) ]
<a id="ex3"></a>

```python
import numpy as np, torch
np_arr = np.array([1.0, 2.0, 3.0])
t = torch.from_numpy(np_arr)
np_arr[0] = 999
print(t[0])
```

**习题 4（计算）**：给定形状为 `(3, 4)` 的张量 A 和形状为 `(4, 2)` 的张量 B，`A @ B` 的结果形状是多少？ &nbsp; [ [查看解答](#ans4) ]
<a id="ex4"></a>
若将 B 改为 `(3, 4)`，`torch.mul(A, B)` 的结果形状又是多少？两者有何本质区别？

**习题 5（实践）**：用 `reshape` 将形状为 `(8, 3, 4)` 的张量依次变换为以下形状，写出对应代码，哪些是无法转换的？ &nbsp; [ [查看解答](#ans5) ]
<a id="ex5"></a>

1. `(8, 12)`
2. `(2, -1)`
3. `(8, 3, 5)`

**习题 6（推导）**：阅读下面的代码，手动推导 `x.grad` 的值，然后运行代码验证。 &nbsp; [ [查看解答](#ans6) ]
<a id="ex6"></a>

```python
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = 3 * x[0] ** 2 + x[1] ** 3
y.backward()
print(x.grad)
```

**习题 7（陷阱）**：下面的训练循环存在一个经典错误，请找出并修正，并解释为什么会出问题。 &nbsp; [ [查看解答](#ans7) ]
<a id="ex7"></a>

```python
x = torch.tensor([1.0], requires_grad=True)
optimizer = torch.optim.SGD([x], lr=0.1)
for i in range(5):
    loss = x ** 2
    loss.backward()
    optimizer.step()  
    print(f"step {i}: x={x.item():.4f}, grad={x.grad.item():.4f}")
```

**习题 8（计算）**：`nn.Linear(in_features=4, out_features=3)` 内部有多少个可学习参数？请结合线性变换的数学公式说明。 &nbsp; [ [查看解答](#ans8) ]
<a id="ex8"></a>

**习题 9（综合）**：用 `nn.Sequential` 搭建一个用于 MNIST 分类的三层全连接网络，并写出损失函数和优化器。 &nbsp; [ [查看解答](#ans9) ]
<a id="ex9"></a>

**习题 10（综合·思考）**：在推理阶段，我们通常会同时使用 `net.eval()` 和 `with torch.no_grad():`。请解释这两者的各自目的与区别。 &nbsp; [ [查看解答](#ans10) ]
<a id="ex10"></a>

---

## 习题参考解答

<a id="习题参考解答"></a>

<a id="ans1"></a>
**解答 1**：  
输出：`2  torch.Size([2, 3])  torch.int64`  
理由：`a` 是 2x3 矩阵，维度为 2；整数输入默认为 `int64`。  &nbsp; [ [返回习题](#ex1) ]

<a id="ans2"></a>
**解答 2**：  
- `arange` 指定**步长**（不含末位），适合循环计数。
- `linspace` 指定**点数**（含末位），适合采样。  &nbsp; [ [返回习题](#ex2) ]

<a id="ans3"></a>
**解答 3**：  
输出：`tensor(999.)`  
原因：`from_numpy` 共享内存。修正：使用 `torch.tensor(np_arr)` 复制数据。  &nbsp; [ [返回习题](#ex3) ]

<a id="ans4"></a>
**解答 4**：  

- `A @ B` 形状为 `(3, 2)`。
- `torch.mul(A, B)` 形状为 `(3, 4)`。区别：矩阵乘法（聚合运算） vs 逐元素乘法（无聚合）。  &nbsp; [ [返回习题](#ex4) ]

<a id="ans5"></a>
**解答 5**：  
1. `t.reshape(8, 12)` (OK)
2. `t.reshape(2, -1)` (OK)
3. `t.reshape(8, 3, 5)` (无法转换：元素总数不符)。  &nbsp; [ [返回习题](#ex5) ]

<a id="ans6"></a>
**解答 6**：  
导数：$6x_0 = 12$，$3x_1^2 = 27$。结果：`tensor([12., 27.])`。  &nbsp; [ [返回习题](#ex6) ]

<a id="ans7"></a>
**解答 7**：  
错误：缺少 `optimizer.zero_grad()`。PyTorch 梯度默认累积，不清零会导致训练爆炸。  &nbsp; [ [返回习题](#ex7) ]

<a id="ans8"></a>
**解答 8**：  
$4 \times 3$ (权重矩阵) + $3$ (偏置) = **15个参数**。  &nbsp; [ [返回习题](#ex8) ]

<a id="ans9"></a>
**解答 9**：  

```python
net = nn.Sequential(
    nn.Linear(784, 256), 
    nn.ReLU(), 	
    nn.Linear(256, 128), 
    nn.ReLU(), 
    nn.Linear(128, 10)
)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(net.parameters(), lr=1e-3)
```

&nbsp; [ [返回习题](#ex9) ]

<a id="ans10"></a>

**解答 10**：  

- `no_grad()`：关闭计算图，节省内存。
- `eval()`：切换特定层（如 Dropout）到评估模式。两者互补，推理时应同时使用。  &nbsp; [ [返回习题](#ex10) ]
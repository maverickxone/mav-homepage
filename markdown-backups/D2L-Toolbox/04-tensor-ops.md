---
title: "张量的操作与变换"
chapter: 4
readTime: 12
description: "矩阵乘法、reshape/view/squeeze、张量拼接（cat/stack）与数值提取。"
---

**本章目标**：掌握张量的核心操作，为后续神经网络打下基础

## torch.matmul：矩阵乘法的核心函数

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

## @ 运算符：矩阵乘法的便捷写法

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

## reshape和view：改变张量形状

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

## item和numpy：提取张量中的数值

### item()：张量转Python标量

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

### numpy()：张量转NumPy数组

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


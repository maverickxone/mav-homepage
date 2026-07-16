---
title: "张量的属性"
chapter: 3
readTime: 8
description: "shape、dtype、device 三大核心属性，CPU/GPU 设备迁移与类型转换。"
---

**本章目标**：掌握查看和理解张量属性的方法

## shape：查看张量的形状

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

## dtype：查看张量的数据类型

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

## device：查看张量存储的设备

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


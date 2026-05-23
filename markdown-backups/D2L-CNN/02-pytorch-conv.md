---
title: "PyTorch 中的卷积操作"
chapter: 2
readTime: 15
description: "nn.Conv2d 详解、卷积参数（stride/padding/dilation/groups）、输出尺寸计算。"
---

> **本章学习目标**：
> 1. 掌握 `nn.Conv2d` 的用法
> 2. 理解 `kernel_size`、`stride`、`padding`、`groups`、`dilation` 等参数
> 3. 掌握卷积输出尺寸的计算公式

在第一章中，我们理解了卷积的原理。现在我们学习如何在PyTorch中实现卷积操作。

## nn.Conv2d：二维卷积层

`nn.Conv2d` 是PyTorch中实现二维卷积的核心类。

```python
import torch.nn as nn

# 基础用法
conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, padding=1)

# 参数说明：
# in_channels: 输入通道数（RGB图像为3，灰度图为1）
# out_channels: 输出通道数（卷积核的数量，也等于输出特征图的数量）
# kernel_size: 卷积核大小（3表示3x3，也可以是5, 7等奇数）
# padding: 填充层数（用于保持图像尺寸）
```

**Mav's Tips：**Padding是指在最外层填充一些像素，通常是空白的。

**前向传播**：

```python
# 输入形状：(batch_size, channels, height, width)
x = torch.randn(8, 3, 224, 224)  # 8张RGB图像，224x224

# 通过卷积层
output = conv(x)
print(output.shape)  # torch.Size([8, 64, 224, 224])
# 输出：batch_size=8, 通道数=64, 高度=224, 宽度=224
```

**卷积层的内部结构**：

```python
# 查看卷积层的参数
conv = nn.Conv2d(3, 64, kernel_size=3, padding=1)
print("权重形状:", conv.weight.shape)   # torch.Size([64, 3, 3, 3])
print("偏置形状:", conv.bias.shape)     # torch.Size([64])

# 权重形状解释：
# 64个卷积核，每个卷积核3个通道（对应RGB），每个卷积核3x3大小
```

## 卷积层的参数详解

`nn.Conv2d` 有多个重要参数，理解它们对于设计网络结构非常重要。

### kernel_size：卷积核大小

卷积核决定了卷积操作提取特征的"视野范围"。常见的卷积核大小有1×1、3×3、5×5、7×7等。

```python
# 1x1卷积：用于改变通道数，类似全连接
conv_1x1 = nn.Conv2d(256, 64, kernel_size=1)

# 3x3卷积：最常用的卷积核大小
conv_3x3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)

# 5x5卷积：更大的感受野
conv_5x5 = nn.Conv2d(64, 128, kernel_size=5, padding=2)

# 可以使用元组指定不同的高宽核
conv_rect = nn.Conv2d(64, 128, kernel_size=(3, 5), padding=(1, 2))
```

> **感受野（Receptive Field）**：指的是卷积神经网络中，一个输出像素点"看"到的输入区域的大小。3×3的卷积核，感受野就是3×3；5×5的卷积核，感受野就是5×5。

### stride：步长

`stride` 控制卷积核在图像上滑动的步长。stride=1时逐像素移动，stride=2时每次移动2个像素（输出尺寸减半）。

```python
# stride=1（默认）：保持尺寸
conv_s1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1)
x = torch.randn(1, 3, 224, 224)
print(conv_s1(x).shape)  # torch.Size([1, 64, 224, 224])

# stride=2：尺寸减半
conv_s2 = nn.Conv2d(3, 64, kernel_size=3, stride=2, padding=1)
print(conv_s2(x).shape)  # torch.Size([1, 64, 112, 112])

# stride=3：尺寸变为原来的1/3
conv_s3 = nn.Conv2d(3, 64, kernel_size=3, stride=3, padding=1)
print(conv_s3(x).shape)  # torch.Size([1, 64, 75, 75])  # ceil(224/3)
```

### padding：填充

`padding` 在输入图像边缘添加像素，以控制输出尺寸。

```python
# padding=0（无填充）：尺寸减小
conv_no_pad = nn.Conv2d(3, 64, kernel_size=3)
x = torch.randn(1, 3, 224, 224)
print(conv_no_pad(x).shape)  # torch.Size([1, 64, 222, 222])

# padding=1：保持尺寸（最常用）
conv_pad1 = nn.Conv2d(3, 64, kernel_size=3, padding=1)
print(conv_pad1(x).shape)  # torch.Size([1, 64, 224, 224])

# padding=2：尺寸增加
conv_pad2 = nn.Conv2d(3, 64, kernel_size=3, padding=2)
print(conv_pad2(x).shape)  # torch.Size([1, 64, 226, 226])

# padding=kernel_size//2：保持尺寸的通用公式
kernel_size = 5
padding = kernel_size // 2  # 2
conv_pad = nn.Conv2d(3, 64, kernel_size=kernel_size, padding=padding)
print(conv_pad(x).shape)  # torch.Size([1, 64, 224, 224])
```

### groups：分组卷积

`groups` 参数允许将输入和输出分成多个组，实现分组卷积。这减少了计算量，也是Depthwise Separable Convolution的基础。

```python
# groups=1（默认）：普通卷积
conv_normal = nn.Conv2d(12, 12, kernel_size=3, padding=1, groups=1)

# groups=in_channels=out_channels：Depthwise卷积
# 输入12通道，输出12通道，分12组
conv_depthwise = nn.Conv2d(12, 12, kernel_size=3, padding=1, groups=12)
# 权重形状：torch.Size([12, 1, 3, 3]) - 每组独立

# groups=in_channels：逐通道卷积，每个通道独立处理
# groups=out_channels：逐点卷积，1x1卷积
```

**Mav's Tips：**group减少了通道之间的关联，牺牲了表达能力换取效率的提升，在某些情况有用，但有些情况会降低精度。

### dilation：空洞卷积

`dilation` 参数控制卷积核中间的空隙大小，用于增大感受野而不增加参数量。

```python
# dilation=1（默认）：普通卷积
conv_d1 = nn.Conv2d(3, 64, kernel_size=3, padding=1, dilation=1)

# dilation=2：空洞卷积，感受野扩大
conv_d2 = nn.Conv2d(3, 64, kernel_size=3, padding=2, dilation=2)
# 实际感受野：1 + (3-1)*2 = 5x5

# dilation=4：更大的感受野
conv_d4 = nn.Conv2d(3, 64, kernel_size=3, padding=4, dilation=4)
# 实际感受野：1 + (3-1)*4 = 9x9
```

**Mav's Tips：** **感受野**是指把当前像素反推会原始图片占的面积，比如在kernel_size=3的情况，第一层感受野是3×3，第二层就是5×5了，以此类推。dilation则可以有效扩大感受野，让网络学习更多的细节。
但同时也要注意避免“Gridding Artifact（网格效应）”，即空隙太大，忽略了中间的内容。

## 卷积输出尺寸计算

理解卷积输出尺寸的计算公式对于设计网络结构至关重要。

**通用公式**：

$$H_{out} = \left\lfloor\frac{H_{in} + 2 \times padding - dilation \times (kernel\_size - 1) - 1}{stride} + 1\right\rfloor$$

简化版（当dilation=1时）：

$$H_{out} = \left\lfloor\frac{H_{in} + 2 \times padding - kernel\_size}{stride} + 1\right\rfloor$$

**常用快速计算**：

```python
def calc_conv_output_size(H, W, kernel_size=3, stride=1, padding=0, dilation=1):
    """计算卷积输出尺寸"""
    H_out = ((H + 2*padding - dilation*(kernel_size-1) - 1) // stride) + 1
    W_out = ((W + 2*padding - dilation*(kernel_size-1) - 1) // stride) + 1
    return H_out, W_out

# 示例：224x224输入，3x3卷积，stride=2，padding=1
H, W = 224, 224
H_out, W_out = calc_conv_output_size(H, W, kernel_size=3, stride=2, padding=1)
print(f"输出尺寸: {H_out}x{W_out}")  # 112x112
```

**实际应用示例**：

```python
import torch
import torch.nn as nn

# 构建一个典型的CNN特征提取器
class FeatureExtractor(nn.Module):
    def __init__(self):
        super().__init__()
        # Block 1: 224 -> 112 -> 56
        self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3)
        self.pool1 = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)

        # Block 2: 56 -> 28
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1)

        # Block 3: 28 -> 14
        self.conv3 = nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1)

        # Block 4: 14 -> 7
        self.conv4 = nn.Conv2d(256, 512, kernel_size=3, stride=2, padding=1)

    def forward(self, x):
        x = self.pool1(torch.relu(self.conv1(x))) 
        x = torch.relu(self.conv2(x))               
        x = torch.relu(self.conv3(x))             
        x = torch.relu(self.conv4(x))               
        return x

# 测试
extractor = FeatureExtractor()
x = torch.randn(1, 3, 224, 224)
output = extractor(x)
print("输出形状:", output.shape)  # torch.Size([1, 512, 7, 7])
```

**Mav's Tips：**这里有一个小细节，我们直接调用了`extractor(x)`，为什么不是`extractor.forward(x)`？这是因为这个类继承了`nn.Module`，`nn.Module`里面有一个`__call__`方法，是专门调用`forward()`函数的，也就是说，`extractor(x)`其实是`extractor.forward(x)`的缩写，更加便捷。

---


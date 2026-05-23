---
title: "池化层与归一化"
chapter: 3
readTime: 25
description: "MaxPool2d、AvgPool2d、自适应池化、BatchNorm、Dropout、LayerNorm。"
---

池化层（Pooling Layer）用于降低特征图的空间尺寸，同时保留重要信息。池化操作可以增强网络的平移不变性，减少计算量，并帮助控制过拟合。

## nn.MaxPool2d：最大池化

最大池化选取每个池化窗口中的最大值，是最常用的池化方式。

```python
import torch.nn as nn

# 基础用法
maxpool = nn.MaxPool2d(kernel_size=2, stride=2)

# 参数说明：
# kernel_size: 池化窗口大小（2表示2x2）
# stride: 步长（默认等于kernel_size，即不重叠）
# padding: 填充
# dilation: 空洞率
# return_indices: 是否返回最大值的索引（用于MaxUnpool）
```

```python
# 输入
x = torch.randn(1, 1, 4, 4)
print("输入:\n", x)
# tensor([[[[ 0.2341,  0.2341, -0.0116, -1.0414],
#          [-0.7376, -0.5123,  0.2134,  0.3894],
#          [-1.5151,  0.0160,  0.4503, -0.0131],
#          [-0.4530,  0.0339, -0.3623,  0.1413]]]])

# 最大池化
output = maxpool(x)
print("输出:\n", output)
# tensor([[[[ 0.2341,  0.3894],
#          [ 0.0160,  0.4503]]]])
```

**池化后尺寸计算**：

```python
# 池化尺寸计算公式
def calc_pool_output_size(H, W, kernel_size=2, stride=2, padding=0, dilation=1):
    H_out = ((H + 2*padding - dilation*(kernel_size-1) - 1) // stride) + 1
    W_out = ((W + 2*padding - dilation*(kernel_size-1) - 1) // stride) + 1
    return H_out, W_out

# 常见配置
H, W = 224, 224

# 2x2池化，stride=2
H_out, W_out = calc_pool_output_size(H, W, kernel_size=2, stride=2)
print(f"2x2池化，stride=2: {H_out}x{W_out}")  # 112x112

# 3x3池化，stride=2
H_out, W_out = calc_pool_output_size(H, W, kernel_size=3, stride=2, padding=1)
print(f"3x3池化，stride=2，padding=1: {H_out}x{W_out}")  # 112x112
```

**实际应用**：

```python
class CNNWithPooling(nn.Module):
    def __init__(self):
        super().__init__()
        # 卷积层
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)

        # 池化层
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # 全连接层
        self.fc1 = nn.Linear(64 * 28 * 28, 256)
        self.fc2 = nn.Linear(256, 10)

    def forward(self, x):
        # 224x224 -> 112x112
        x = self.pool(torch.relu(self.conv1(x)))

        # 112x112 -> 56x56
        x = self.pool(torch.relu(self.conv2(x)))

        # 展平
        x = x.view(x.size(0), -1)

        # 全连接
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x
```

---

## nn.AvgPool2d：平均池化

平均池化计算池化窗口内所有值的平均值。在某些任务中比最大池化效果更好。

```python
# 平均池化
avgpool = nn.AvgPool2d(kernel_size=2, stride=2)

# 输入
x = torch.randn(1, 1, 4, 4)
print("输入:\n", x)
# tensor([[[[ 0.2341,  0.2341, -0.0116, -1.0414],
#          [-0.7376, -0.5123,  0.2134,  0.3894],
#          [-1.5151,  0.0160,  0.4503, -0.0131],
#          [-0.4530,  0.0339, -0.3623,  0.1413]]]])

# 平均池化
output = avgpool(x)
print("输出:\n", output)
# tensor([[[[-0.1944, -0.1123],
#          [-0.4781,  0.0587]]]])
```

**平均池化 vs 最大池化**：

| 特性 | MaxPool2d | AvgPool2d |
|------|-----------|-----------|
| 计算方式 | 取最大值 | 取平均值 |
| 特点 | 保留显著特征 | 平滑特征 |
| 常用场景 | 分类任务 | 特征平滑、注意力机制 |
| 感受野 | 更关注最强响应 | 关注整体统计 |

**Global Average Pooling（GAP）**：

GAP是一种特殊的平均池化，将每个通道的整个特征图压缩为一个值。

```python
# 全局平均池化
gap = nn.AdaptiveAvgPool2d(1)  # 输出1x1

x = torch.randn(1, 512, 7, 7)
gap_output = gap(x)
print(gap_output.shape)  # torch.Size([1, 512, 1, 1])

# 展平后用于分类
gap_output = gap_output.view(gap_output.size(0), -1)
print(gap_output.shape)  # torch.Size([1, 512])
```

---

## nn.AdaptiveAvgPool2d：自适应池化

自适应池化可以指定输出的目标尺寸，PyTorch会自动计算所需的padding和stride。

```python
# 输出固定尺寸
adaptive_pool = nn.AdaptiveAvgPool2d(output_size=(7, 7))

x = torch.randn(1, 512, 28, 28)
output = adaptive_pool(x)
print(output.shape)  # torch.Size([1, 512, 7, 7])

# 输出1x1（GAP）
adaptive_pool_gap = nn.AdaptiveAvgPool2d(output_size=1)
x = torch.randn(1, 512, 28, 28)
output = adaptive_pool_gap(x)
print(output.shape)  # torch.Size([1, 512, 1, 1])

# 输出特定高度，宽度自适应
adaptive_pool_h = nn.AdaptiveAvgPool2d(output_size=(1, None))
x = torch.randn(1, 512, 28, 28)
output = adaptive_pool_h(x)
print(output.shape)  # torch.Size([1, 512, 1, 28])
```

**自适应最大池化**：

```python
adaptive_maxpool = nn.AdaptiveMaxPool2d(output_size=(3, 3))
x = torch.randn(1, 64, 10, 10)
output = adaptive_maxpool(x)
print(output.shape)  # torch.Size([1, 64, 3, 3])
```

**自适应池化的应用场景**：

```python
# 典型的分类网络骨架
class ClassifierBackbone(nn.Module):
    def __init__(self, in_channels=3, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            # Conv Block 1
            nn.Conv2d(in_channels, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),  # 112x112

            # Conv Block 2
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),  # 56x56

            # Conv Block 3
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),  # 28x28

            # 全局平均池化（无论输入尺寸如何，输出都是1x1）
            nn.AdaptiveAvgPool2d(output_size=1)
        )

        self.classifier = nn.Linear(256, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)  # 展平
        x = self.classifier(x)
        return x

# 测试：不同输入尺寸
model = ClassifierBackbone()

x1 = torch.randn(1, 3, 224, 224)
print(model(x1).shape)  # torch.Size([1, 10])

x2 = torch.randn(1, 3, 112, 112)
print(model(x2).shape)  # torch.Size([1, 10])

x3 = torch.randn(1, 3, 96, 96)
print(model(x3).shape)  # torch.Size([1, 10])
```

---


## nn.BatchNorm2d：批归一化

BatchNorm是深度学习中最重要的技巧之一，它通过规范化层的输入来加速训练、提高稳定性。

**数学原理**：

```
y = gamma * (x - mean) / sqrt(var + epsilon) + beta
```

其中gamma（缩放）和beta（偏移）是可学习参数，mean和var是当前batch的统计量。

```python
import torch.nn as nn

# BatchNorm2d用于2D特征图（图像）
bn = nn.BatchNorm2d(num_features=64, eps=1e-5, momentum=0.1)

# 参数说明：
# num_features: 通道数（C）
# eps: 防止除零的小常数（默认1e-5）
# momentum: 移动平均的动量（用于训练时累积均值和方差）
# affine: 是否学习gamma和beta（默认True）
```

```python
# 前向传播
x = torch.randn(8, 64, 32, 32)  # batch=8, channels=64, 32x32
output = bn(x)

print("输入形状:", x.shape)
print("输出形状:", output.shape)
print("训练模式均值:", bn.running_mean[:5])  # 累积的均值
print("训练模式方差:", bn.running_var[:5])   # 累积的方差
```

**BatchNorm的关键特性**：

```python
# 训练模式 vs 评估模式
bn_train = nn.BatchNorm2d(64)

# 训练模式：使用batch统计量，并更新running统计量
bn_train.train()
output = bn_train(x)
print("训练中:", bn_train.training)  # True

# 评估模式：使用running统计量
bn_train.eval()
output = bn_train(x)
print("评估中:", bn_train.training)  # False
```

**在CNN中使用BatchNorm**：

```python
# 典型的Conv-BatchNorm-ReLU组合
class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.block(x)

# 使用
conv_block = ConvBlock(3, 64)
x = torch.randn(4, 3, 32, 32)
output = conv_block(x)
print(output.shape)  # torch.Size([4, 64, 32, 32])
```

**BatchNorm的优势**：

1. **加速收敛**：减少内部协变量偏移
2. **允许更高学习率**：梯度更稳定
3. **正则化效果**：每个batch的均值方差有噪声，提供正则化
4. **减少对初始化的依赖**

---

## nn.Dropout：正则化

Dropout通过随机"关闭"部分神经元来防止过拟合，是深度学习中最常用的正则化技术之一。

```python
import torch.nn as nn

# Dropout
dropout = nn.Dropout(p=0.5)  # p: 丢弃概率

x = torch.randn(4, 10)
output = dropout(x)

print("原始:\n", x)
print("Dropout后:\n", output)
# 大约50%的元素变为0
```

**在CNN中使用Dropout**：

```python
# nn.Dropout2d：随机丢弃整个通道
dropout_2d = nn.Dropout2d(p=0.5)

x = torch.randn(4, 64, 32, 32)
output = dropout_2d(x)
# 随机将整个通道置零
print("输出:", output.shape)
```

**Dropout vs Dropout2d**：

| 类型 | 作用 | 适用场景 |
|------|------|----------|
| nn.Dropout | 随机丢弃单个元素 | 全连接层、特征图较小时 |
| nn.Dropout2d | 随机丢弃整个通道 | CNN的特征图 |

```python
# 典型的带Dropout的分类网络
class CNNWithDropout(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )

        # 全连接层之间使用Dropout
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 4 * 4, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x
```

**Dropout2d的实际应用**：

```python
# Spatial Dropout（Dropout2d）
# 丢弃整个通道而不是单个元素，更适合CNN
class CNNWithSpatialDropout(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 64, 3, padding=1)
        # Spatial Dropout：丢弃整个通道
        self.dropout = nn.Dropout2d(p=0.2)
        self.conv2 = nn.Conv2d(64, 64, 3, padding=1)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = self.dropout(x)  # 随机丢弃通道
        x = torch.relu(self.conv2(x))
        return x
```

---

## nn.LayerNorm：层归一化

LayerNorm与BatchNorm类似，但归一化的维度不同。LayerNorm在单个样本的特征维度上进行归一化，不依赖于batch大小。

```python
import torch.nn as nn

# LayerNorm
ln = nn.LayerNorm(normalized_shape=[64, 32, 32])

# 参数：
# normalized_shape: 要归一化的形状
# eps: 防止除零
# elementwise_affine: 是否学习gamma和beta
```

```python
# 输入
x = torch.randn(8, 64, 32, 32)  # batch=8

# LayerNorm：在通道和空间维度上归一化
output = ln(x)
print("输入形状:", x.shape)
print("输出形状:", output.shape)
```

**BatchNorm vs LayerNorm vs InstanceNorm vs GroupNorm**：

```python
# 各种归一化方法的对比
import torch

# 输入形状
x = torch.randn(8, 64, 32, 32)

# BatchNorm2d：在batch和空间维度上归一化 (N, C, H, W) -> (N, C, 1, 1)
bn = nn.BatchNorm2d(64)
print("BatchNorm:", bn(x).shape)

# LayerNorm：在通道和空间维度上归一化 (N, C, H, W) -> (N, 1, 1, 1)
ln = nn.LayerNorm([64, 32, 32])
print("LayerNorm:", ln(x).shape)

# InstanceNorm2d：在空间维度上归一化 (N, C, H, W) -> (N, C, 1, 1)
inn = nn.InstanceNorm2d(64)
print("InstanceNorm:", inn(x).shape)

# GroupNorm：将通道分组后在组内归一化 (N, C, H, W) -> (N, C, 1, 1)
gn = nn.GroupNorm(num_groups=8, num_channels=64)
print("GroupNorm:", gn(x).shape)
```

**各种归一化的可视化**：

```
输入形状: (N, C, H, W) = (8, 64, 32, 32)

BatchNorm:    对每个特征，在(N, H, W)上求均值/方差
              依赖batch大小，训练快，但batch小时不稳定

LayerNorm:    对每个样本，在(C, H, W)上求均值/方差
              不依赖batch，常用于RNN、Transformer

InstanceNorm: 对每个样本、每个通道，在(H, W)上求均值/方差
              风格迁移效果好

GroupNorm:    对每个样本，将通道分成G组，在每组的(C/G, H, W)上求均值/方差
              .batch大小无关，效果稳定，推荐使用
```

**实际应用建议**：

```python
# Transformer中常用LayerNorm
class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_head):
        super().__init__()
        self.attention = nn.MultiheadAttention(d_model, n_head)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ff = nn.Linear(d_model, d_model * 4)
        self.ff_out = nn.Linear(d_model * 4, d_model)

    def forward(self, x):
        # Self-attention with residual
        attn_out, _ = self.attention(x, x, x)
        x = self.norm1(x + attn_out)

        # FFN with residual
        ff_out = torch.relu(self.ff(x))
        ff_out = self.ff_out(ff_out)
        x = self.norm2(x + ff_out)
        return x

# CNN中常用GroupNorm（替代BatchNorm）
class CNNWithGN(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, 3, padding=1)
        # GroupNorm: 8 groups
        self.norm = nn.GroupNorm(num_groups=8, num_channels=out_channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.conv(x)
        x = self.norm(x)
        x = self.relu(x)
        return x
```

---


---
title: "神经网络基础模块"
chapter: 6
readTime: 25
description: "nn.Linear、激活函数、损失函数、优化器，用 nn.Module 和 nn.Sequential 搭建网络。"
---

**本章目标**：掌握PyTorch中构建神经网络的核心组件

## 神经网络是什么？

在开始学习PyTorch的神经网络模块之前，我们先来理解一个根本性的问题：**神经网络到底是什么？**

### 神经网络的直观理解

想象一下你有一堆**乐高积木**。每个积木块只能做很简单的事情（比如把输入乘以某个数然后加起来）。但是当你把这些积木块**堆叠**在一起时，它们就能完成非常复杂的事情！

神经网络就是这样一个"积木系统"：

- **神经元（Neuron）**：最基本单元，类似乐高积木块
- **层（Layer）**：由多个神经元组成
- **网络（Network）**：由多层组成

### 神经元的工作原理

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

### 为什么要多层？

单层神经元只能做**线性变换**——也就是说，它只能学会画一条直线（或者一个平面）。

但现实世界的问题往往**不是线性的**！比如：
- 识别猫和狗：不能简单地用一条直线分开
- 下棋：需要复杂的策略

**解决方法**：堆叠多层！每加一层，网络就能学习更复杂的模式。

这就是为什么我们需要**深度学习**——"深度"指的就是层数多！

### PyTorch中的神经网络

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

## nn.Linear：线性变换层

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

### **1. 第三方库**

Python 的第三方库类似 C 的 `#include`，是别人封装好的功能，直接调用即可。区别在于 Python 的第三方库需要先用 `pip install` 安装，自带的标准库（`os`、`math` 等）不需要。`import as` 是简写用途，比如 `import torch.nn as nn`，之后用 `nn` 代替 `torch.nn`。`torch` 和 `torch.nn` 是包含关系，`torch.nn` 是 `torch` 里专门负责神经网络的子模块，可以单独引入。

### 类的继承

```
class Dog(Animal):
    pass
```

括号内写父类名，表示继承——子类自动拥有父类的所有方法和结构，不需要重写。如果子类只写 `pass`，直接可以调用父类的方法。

### **3.`super()` 的作用**

如果子类自己定义了 `__init__`，会覆盖父类的 `__init__`，父类的初始化逻辑就被跳过了。`super().__init__()` 的作用是手动把父类的初始化补回来。

所以"继承 + 自己还要新增内容"的标准写法是：

```
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()   # 先跑父类的初始化
        self.layer1 = nn.Linear(784, 256)  # 再加自己的东西
```

### **4. 为什么 PyTorch 要用继承而不是直接调用**

`import` 只是让你在文件里能使用某个库的名字。新建一个类时，类本身是空壳，不会自动拥有 `nn.Module` 的内部结构。

- 直接用：调现成的零件，如 `nn.Linear(784, 256)`
- 继承：基于框架造自己的新东西，如自定义网络 `SimpleNet`

`()` 里写 `nn.Module` 是声明继承关系，`super().__init__()` 是让那套结构真正在对象里初始化起来，两步缺一不可。

---

## nn.Module：神经网络基类

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

## nn.Sequential：快速搭建网络

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

## nn.CrossEntropyLoss：交叉熵损失

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

## torch.optim：优化器

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


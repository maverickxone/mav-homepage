---
title: "自动求导机制"
chapter: 5
readTime: 18
description: "requires_grad、backward、计算图、梯度累积、no_grad、detach 与梯度下降实战。"
---

**本章目标**：理解PyTorch的核心优势——自动微分

> 这是PyTorch最强大的特性！有了它，你无需手动计算复杂梯度，只需要定义前向传播，PyTorch会自动处理反向传播。

## 梯度是什么？为什么重要？

在深入学习PyTorch的自动求导机制之前，我们先来理解一个核心概念：**梯度（Gradient）**。

### 直观理解梯度

想象一下你在一座山上，想找到山顶（或者最低点——山谷）。梯度就像是告诉你**应该往哪个方向走**才能最快到达目的地。

**数学定义**：梯度是**函数在某一点上变化最快的方向**

- 对于函数 $f(x)$，梯度 $\nabla f$ 指向函数值**增加最快**的方向
- 如果你想**最小化**一个函数（比如损失函数），你需要往梯度的**反方向**走

### 梯度在深度学习中的作用

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

### 手动计算梯度的痛苦

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

## requires_grad：开启梯度追踪

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

## backward：自动计算梯度

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

## grad：查看计算出的梯度

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

## zero_grad：清零梯度

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

## no_grad：临时关闭梯度计算

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


---
title: "常见错误与习题"
chapter: 7
readTime: 10
description: "PyTorch 典型报错解决、总结回顾与自测习题。"
---
## 常见错误与解决方案

### 形状不匹配错误

```python
# 错误：矩阵乘法维度不匹配
A = torch.randn(2, 3)
B = torch.randn(5, 4)
C = A @ B  # RuntimeError: mat1 and mat2 shapes cannot be multiplied

# 解决：确保维度匹配
B = torch.randn(3, 4)
C = A @ B  # 正确：(2,3) @ (3,4) -> (2,4)
```

### 设备不匹配错误

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

### 梯度未清零

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

### 类型不匹配

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

```python
import torch
a = torch.tensor([[1, 2, 3], [4, 5, 6]])
print(a.ndim, a.shape, a.dtype)
```

**习题 2（基础）**：`torch.arange` 和 `torch.linspace` 有什么关键区别？分别给出一个适合使用各自函数的场景。 &nbsp; [ [查看解答](#ans2) ]

**习题 3（理解）**：以下代码的输出是什么？为什么？如何避免这种"惊喜"？ &nbsp; [ [查看解答](#ans3) ]

```python
import numpy as np, torch
np_arr = np.array([1.0, 2.0, 3.0])
t = torch.from_numpy(np_arr)
np_arr[0] = 999
print(t[0])
```

**习题 4（计算）**：给定形状为 `(3, 4)` 的张量 A 和形状为 `(4, 2)` 的张量 B，`A @ B` 的结果形状是多少？ &nbsp; [ [查看解答](#ans4) ]
若将 B 改为 `(3, 4)`，`torch.mul(A, B)` 的结果形状又是多少？两者有何本质区别？

**习题 5（实践）**：用 `reshape` 将形状为 `(8, 3, 4)` 的张量依次变换为以下形状，写出对应代码，哪些是无法转换的？ &nbsp; [ [查看解答](#ans5) ]

1. `(8, 12)`
2. `(2, -1)`
3. `(8, 3, 5)`

**习题 6（推导）**：阅读下面的代码，手动推导 `x.grad` 的值，然后运行代码验证。 &nbsp; [ [查看解答](#ans6) ]

```python
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = 3 * x[0] ** 2 + x[1] ** 3
y.backward()
print(x.grad)
```

**习题 7（陷阱）**：下面的训练循环存在一个经典错误，请找出并修正，并解释为什么会出问题。 &nbsp; [ [查看解答](#ans7) ]

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

**习题 9（综合）**：用 `nn.Sequential` 搭建一个用于 MNIST 分类的三层全连接网络，并写出损失函数和优化器。 &nbsp; [ [查看解答](#ans9) ]

**习题 10（综合·思考）**：在推理阶段，我们通常会同时使用 `net.eval()` 和 `with torch.no_grad():`。请解释这两者的各自目的与区别。 &nbsp; [ [查看解答](#ans10) ]

---

## 习题参考解答


**解答 1**：  
输出：`2  torch.Size([2, 3])  torch.int64`  
理由：`a` 是 2x3 矩阵，维度为 2；整数输入默认为 `int64`。  &nbsp; [ [返回习题](#ex1) ]

**解答 2**：  
- `arange` 指定**步长**（不含末位），适合循环计数。
- `linspace` 指定**点数**（含末位），适合采样。  &nbsp; [ [返回习题](#ex2) ]

**解答 3**：  
输出：`tensor(999.)`  
原因：`from_numpy` 共享内存。修正：使用 `torch.tensor(np_arr)` 复制数据。  &nbsp; [ [返回习题](#ex3) ]

**解答 4**：  

- `A @ B` 形状为 `(3, 2)`。
- `torch.mul(A, B)` 形状为 `(3, 4)`。区别：矩阵乘法（聚合运算） vs 逐元素乘法（无聚合）。  &nbsp; [ [返回习题](#ex4) ]

**解答 5**：  
1. `t.reshape(8, 12)` (OK)
2. `t.reshape(2, -1)` (OK)
3. `t.reshape(8, 3, 5)` (无法转换：元素总数不符)。  &nbsp; [ [返回习题](#ex5) ]

**解答 6**：  
导数：$6x_0 = 12$，$3x_1^2 = 27$。结果：`tensor([12., 27.])`。  &nbsp; [ [返回习题](#ex6) ]

**解答 7**：  
错误：缺少 `optimizer.zero_grad()`。PyTorch 梯度默认累积，不清零会导致训练爆炸。  &nbsp; [ [返回习题](#ex7) ]

**解答 8**：  
$4 \times 3$ (权重矩阵) + $3$ (偏置) = **15个参数**。  &nbsp; [ [返回习题](#ex8) ]

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


**解答 10**：  

- `no_grad()`：关闭计算图，节省内存。

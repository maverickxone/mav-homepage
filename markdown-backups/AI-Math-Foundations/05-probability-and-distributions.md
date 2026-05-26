---
title: "概率与分布"
chapter: 5
readTime: 75
description: "概率是 AI 表达不确定性的语言。"
---

> 概率是 AI 表达不确定性的语言。

## 学习目标

- 从零实现 Bernoulli、Categorical、Poisson、均匀、正态分布的 PMF 和 PDF
- 计算期望和方差，用中心极限定理解释为什么高斯分布无处不在
- 实现带数值稳定性 trick 的 softmax 和 log-softmax
- 从 logits 计算交叉熵 loss，并理解它跟负对数似然的关系

## 为什么要学这个

分类器输出 `[0.03, 0.91, 0.06]`。语言模型从 50000 个候选词中挑下一个。扩散模型从学到的分布中采样来生成图片。这些全是概率在起作用。

模型的每个预测都是一个概率分布。每个损失函数都在衡量预测分布和真实分布差多远。每步训练都在调参数让一个分布更像另一个。不懂概率，你读不了 ML 论文，调不了模型，也搞不明白为什么训练 loss 变成了 NaN。

## 核心概念

### 事件、样本空间和概率

样本空间 S 是所有可能结果的集合。事件是样本空间的子集。概率把事件映射到 0 到 1 之间的数。

```
抛硬币：
  S = {正, 反}
  P(正) = 0.5,  P(反) = 0.5

掷骰子：
  S = {1, 2, 3, 4, 5, 6}
  P(偶数) = P({2, 4, 6}) = 3/6 = 0.5
```

三条公理定义了整个概率论：
1. P(A) ≥ 0
2. P(S) = 1（总有事情发生）
3. 互斥事件：P(A 或 B) = P(A) + P(B)

其他一切（贝叶斯定理、期望、分布）都从这三条推出。

### 条件概率和独立性

P(A|B) 是已知 B 发生时 A 发生的概率。

```
P(A|B) = P(A 且 B) / P(B)

例：一副牌
  P(K | 人头牌) = P(K 且 人头牌) / P(人头牌)
               = (4/52) / (12/52) = 1/3
```

两个事件**独立** = 知道一个对另一个毫无影响：

```
独立：  P(A|B) = P(A)
等价于：P(A 且 B) = P(A) × P(B)
```

### PMF vs PDF

**离散**随机变量有概率质量函数（PMF），直接给每个结果的概率。

```
PMF：P(X = k)

公平骰子：P(X = 1) = P(X = 2) = ... = P(X = 6) = 1/6
所有概率之和 = 1
```

**连续**随机变量有概率密度函数（PDF）。单点的密度不是概率，要在区间上积分才得到概率。

```
PDF：f(x)
P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx

f(x) 可以大于 1（是密度不是概率）
从 -∞ 到 +∞ 积分 = 1
```

在 ML 中：分类输出是 PMF（离散选择），VAE 的隐空间用 PDF（连续）。

### 常见分布

**Bernoulli**：一次试验，两种结果。模型化二分类。

```
P(X = 1) = p,  P(X = 0) = 1 - p
期望 = p,  方差 = p(1-p)
```

**Categorical**：一次试验，k 种结果。模型化多分类（softmax 输出）。

```
P(X = i) = pᵢ,  所有 pᵢ 之和 = 1
例：P(猫) = 0.7, P(狗) = 0.2, P(鸟) = 0.1
```

**均匀分布**：所有结果等可能。用于随机初始化。

```
离散：P(X = k) = 1/n
连续：f(x) = 1/(b-a)，x ∈ [a, b]
```

**正态分布（高斯）**：钟形曲线。由均值 μ 和方差 σ² 参数化。

```
f(x) = (1 / √(2πσ²)) × exp(-(x - μ)² / (2σ²))

标准正态：μ = 0, σ = 1
  68% 数据在 1σ 内
  95% 在 2σ 内
  99.7% 在 3σ 内
```

**Poisson**：固定时间内稀有事件的计数。模型化事件发生率。

```
P(X = k) = (λᵏ × e⁻λ) / k!
期望 = λ,  方差 = λ
```

### 期望和方差

期望是加权平均结果：

```
离散：E[X] = Σ xᵢ × P(X = xᵢ)
连续：E[X] = ∫ x × f(x) dx
```

方差衡量围绕均值的分散程度：

```
Var(X) = E[(X - E[X])²] = E[X²] - (E[X])²
标准差 = √Var(X)
```

在 ML 里，期望出现在 loss 函数中（数据分布上的平均 loss）。方差告诉你模型稳定性——梯度方差高意味着训练很吵。

### 为什么正态分布到处都是

**中心极限定理（CLT）**：很多独立随机变量的和（或平均）趋向正态分布，不管原始分布是什么。

```
掷 1 个骰子：均匀分布（平的）
2 个骰子取平均：三角分布（有峰）
30 个骰子取平均：几乎完美的钟形曲线

对任何起始分布都成立。
```

这解释了为什么：
- 测量误差近似正态（很多独立的小误差源）
- 神经网络权重初始化用正态分布
- SGD 中的梯度噪声近似正态（很多样本梯度的和）
- 正态分布是给定均值和方差下熵最大的分布

### 对数概率

原始概率有数值问题——很多小概率相乘会很快下溢到零。

```
P(句子) = P(词1) × P(词2) × ... × P(词n)
        = 0.01 × 0.003 × 0.02 × ...
        → 0.0（约 30 项后下溢）
```

对数概率解决这个问题。乘法变加法。

```
log P(句子) = log P(词1) + log P(词2) + ... + log P(词n)
            = -4.6 + -5.8 + -3.9 + ...
            → 有限数（不下溢）
```

规则：
- log(a × b) = log(a) + log(b)
- 对数概率 ≤ 0（因为 0 < P ≤ 1）
- 越负 = 越不可能
- 交叉熵 loss = 正确类别的负对数概率

### Softmax：把分数变成概率分布

神经网络输出原始分数（logits）。Softmax 把它们变成合法的概率分布。

```
softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)

性质：
  - 所有输出在 (0, 1) 范围内
  - 所有输出之和 = 1
  - 保持输入的相对顺序
  - exp() 放大 logits 之间的差异
```

**Softmax trick**：指数化之前先减去最大的 logit，防止溢出。

```
z = [100, 101, 102]
exp(102) = 溢出！

z_shifted = z - max(z) = [-2, -1, 0]
exp(0) = 1（安全）

结果一样，不溢出。
```

Log-softmax 把 softmax 和 log 合在一起保证数值稳定性。PyTorch 的交叉熵 loss 内部就是用这个。

### 采样

采样 = 从分布中随机抽值。在 ML 中：
- Dropout 随机采样哪些神经元置零
- 数据增强采样随机变换
- 语言模型从预测分布中采样下一个 token
- 扩散模型采样噪声然后逐步去噪

## 从零实现

### 第一步：基础概率计算

```python
import math
import random

def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def conditional_probability(p_a_and_b, p_b):
    """条件概率 P(A|B) = P(A∩B) / P(B)"""
    return p_a_and_b / p_b

p_king_given_face = conditional_probability(4/52, 12/52)
print(f"P(K | 人头牌) = {p_king_given_face:.4f}")  # 0.3333
```

### 第二步：PMF 和 PDF

```python
def bernoulli_pmf(k, p):
    return p if k == 1 else (1 - p)

def categorical_pmf(k, probs):
    return probs[k]

def poisson_pmf(k, lam):
    return (lam ** k) * math.exp(-lam) / factorial(k)

def uniform_pdf(x, a, b):
    if a <= x <= b:
        return 1.0 / (b - a)
    return 0.0

def normal_pdf(x, mu, sigma):
    coeff = 1.0 / (sigma * math.sqrt(2 * math.pi))
    exponent = -0.5 * ((x - mu) / sigma) ** 2
    return coeff * math.exp(exponent)
```

### 第三步：期望和方差

```python
def expected_value(values, probabilities):
    return sum(v * p for v, p in zip(values, probabilities))

def variance(values, probabilities):
    mu = expected_value(values, probabilities)
    return sum(p * (v - mu) ** 2 for v, p in zip(values, probabilities))

die_values = [1, 2, 3, 4, 5, 6]
die_probs = [1/6] * 6
mu = expected_value(die_values, die_probs)
var = variance(die_values, die_probs)
print(f"骰子: E[X] = {mu:.4f}, Var(X) = {var:.4f}, σ = {var**0.5:.4f}")
```

### 第四步：采样

```python
def sample_bernoulli(p, n=1):
    return [1 if random.random() < p else 0 for _ in range(n)]

def sample_categorical(probs, n=1):
    """从离散分布采样（累积分布法）"""
    cumulative = []
    total = 0
    for p in probs:
        total += p
        cumulative.append(total)
    samples = []
    for _ in range(n):
        r = random.random()
        for i, c in enumerate(cumulative):
            if r <= c:
                samples.append(i)
                break
    return samples

def sample_normal_box_muller(mu, sigma, n=1):
    """Box-Muller 方法：从均匀分布生成正态分布"""
    samples = []
    for _ in range(n):
        u1 = random.random()
        u2 = random.random()
        z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        samples.append(mu + sigma * z)
    return samples
```

### 第五步：Softmax 和交叉熵

```python
def softmax(logits):
    """带数值稳定性的 softmax"""
    max_logit = max(logits)
    shifted = [z - max_logit for z in logits]  # 减去最大值防溢出
    exps = [math.exp(z) for z in shifted]
    total = sum(exps)
    return [e / total for e in exps]

def log_softmax(logits):
    """log-softmax：更稳定的计算方式"""
    max_logit = max(logits)
    shifted = [z - max_logit for z in logits]
    log_sum_exp = max_logit + math.log(sum(math.exp(z) for z in shifted))
    return [z - log_sum_exp for z in logits]

def cross_entropy_loss(logits, target_index):
    """交叉熵 loss = 正确类别的负对数概率"""
    log_probs = log_softmax(logits)
    return -log_probs[target_index]

# 测试
logits = [2.0, 1.0, 0.1]
probs = softmax(logits)
print(f"Logits: {logits}")
print(f"Softmax: {[f'{p:.4f}' for p in probs]}")
print(f"Sum: {sum(probs):.6f}")  # 应该是 1.0
print(f"Cross-entropy (target=0): {cross_entropy_loss(logits, 0):.4f}")
```

### 第六步：中心极限定理演示

```python
def demonstrate_clt(dist_fn, n_samples, n_averages):
    """展示任何分布取平均后趋向正态"""
    averages = []
    for _ in range(n_averages):
        samples = [dist_fn() for _ in range(n_samples)]
        averages.append(sum(samples) / len(samples))
    mu = sum(averages) / len(averages)
    var = sum((x - mu)**2 for x in averages) / len(averages)
    print(f"  样本数={n_samples}: 均值={mu:.4f}, 标准差={var**0.5:.4f}")
    return averages

print("均匀分布 [0,1] 取平均：")
for n in [1, 2, 5, 30]:
    demonstrate_clt(random.random, n, 10000)
```

## 用库做同样的事

```python
import numpy as np
from scipy import stats

# 正态分布
normal = stats.norm(loc=0, scale=1)
samples = normal.rvs(size=10000)
print(f"均值: {np.mean(samples):.4f}, 标准差: {np.std(samples):.4f}")
print(f"P(X < 1.96) = {normal.cdf(1.96):.4f}")  # ≈ 0.975

# Softmax
logits = np.array([2.0, 1.0, 0.1])
from scipy.special import softmax, log_softmax
probs = softmax(logits)
log_probs = log_softmax(logits)
print(f"Softmax: {probs}")
print(f"Log-softmax: {log_probs}")
```

## 练习

1. 用逆变换采样实现指数分布的采样。采 10000 个值，对比直方图和真实 PDF
2. 构造两个有偏骰子的联合分布表，计算边缘分布，检查它们是否独立
3. 5 类分类器输出 logits `[2.0, 0.5, -1.0, 3.0, 0.1]`，正确类别是 index 3。计算交叉熵 loss，跟 PyTorch 的 `nn.CrossEntropyLoss` 验证
4. 写一个函数接收一串对数概率，返回最可能的序列、总对数概率和等价的原始概率。用 50 个词（每个词概率 0.01）测试

## 术语表

| 术语 | 通俗说法 | 真正含义 |
|------|---------|---------|
| Sample space（样本空间） | "所有可能性" | 实验所有可能结果的集合 S |
| PMF（概率质量函数） | "概率函数" | 给出每个离散结果的精确概率，总和为 1 |
| PDF（概率密度函数） | "概率曲线" | 连续变量的密度函数，在区间上积分才得到概率 |
| Conditional probability（条件概率） | "在某条件下的概率" | P(A\|B) = P(A∩B) / P(B)。贝叶斯思维和贝叶斯定理的基础 |
| Independence（独立性） | "互不影响" | P(A∩B) = P(A)×P(B)。知道一个事件对另一个毫无信息 |
| Expected value（期望） | "平均值" | 所有结果的概率加权和。Loss 函数就是一个期望 |
| Variance（方差） | "有多分散" | 偏离均值的平方的期望。方差高 = 噪声大、估计不稳定 |
| Normal distribution（正态分布） | "钟形曲线" | 由 CLT 解释其普遍性，参数是 μ 和 σ² |
| CLT（中心极限定理） | "取平均就变正态" | 很多独立样本的均值趋向正态，不管原始分布是什么 |
| Log probability（对数概率） | "概率取 log" | 把乘法变加法，防止长序列中的数值下溢 |
| Softmax | "分数变概率" | softmax(zᵢ) = exp(zᵢ) / Σ exp(zⱼ)，把 logits 映射成合法概率分布 |
| Cross-entropy（交叉熵） | "那个 loss 函数" | -Σ p_true × log(p_pred)，衡量两个分布的差异，越小越好 |
| Logits | "模型原始输出" | softmax 之前的未归一化分数 |

---

## 自测题

:::quiz
question: PMF 和 PDF 的区别是什么？
options:
  - PMF 用于连续变量，PDF 用于离散变量
  - PMF 直接给出离散结果的精确概率，PDF 给出连续变量的密度，需要在区间上积分才得到概率
  - 没有区别，只是同一概念的不同叫法
  - PMF 总和为 0.5，PDF 积分为 1
correct: 1
explanation: 离散变量的 PMF 直接给出 P(X=k)。连续变量的 PDF f(x) 是密度——P(a≤X≤b) 需要对 f(x) 从 a 到 b 积分。单点的密度不是概率。
:::

:::quiz
question: 中心极限定理说的是什么？
options:
  - 所有数据都服从正态分布
  - 很多独立随机样本的均值趋向正态分布，不管原始分布是什么
  - 大数据集方差总是很低
  - 稀有事件的概率随样本量增大而减小
correct: 1
explanation: CLT 说很多独立随机变量的平均趋近高斯分布，不管原始分布长什么样。这解释了为什么正态分布到处出现。
:::

:::quiz
question: Softmax 为什么要在指数化之前减去最大的 logit（"softmax trick"）？
options:
  - 为了让所有概率相等
  - 为了防止大数指数化时数值溢出，同时给出数学上完全相同的结果
  - 为了让 logits 均值为零
  - 为了减少指数运算次数加速计算
correct: 1
explanation: exp(100) 溢出到无穷大。减去 max(logits) 让最大值变成 0，exp(0)=1 是安全的。减去的常数在归一化时抵消，概率结果完全一样。
:::

:::quiz
question: 分类的交叉熵 loss 简化为 -log(q(正确类别))。这直觉上什么意思？
options:
  - 把预测概率乘以真实标签
  - 根据模型对正确类别预测的概率有多低来惩罚——预测越低，loss 越高
  - 对所有类别的对数概率取平均
  - 计算真实分布的熵
correct: 1
explanation: 模型对正确类别预测 0.9，loss = -log(0.9) = 0.105（低）。预测 0.01，loss = -log(0.01) = 4.6（高）。Loss 惩罚的是对正确答案的低信心。
:::

:::quiz
question: 为什么语言模型用对数概率而不是原始概率？
options:
  - 对数概率更容易可视化
  - 很多小概率相乘会数值下溢到零；对数概率把乘法变加法，避免了这个问题
  - Transformer 架构要求用对数概率
  - 原始概率不能表示小于 0.01 的值
correct: 1
explanation: P(句子) = P(词1) × P(词2) × ... 用 float64 大约 30 项后就下溢到 0.0。log P(句子) = log P(词1) + log P(词2) + ... 保持在有限范围内。乘法变加法。
:::

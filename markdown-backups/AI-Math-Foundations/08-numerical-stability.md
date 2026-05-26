---
title: "数值稳定性"
chapter: 8
readTime: 120
description: "浮点数是一个有漏洞的抽象。它会在训练时咬你一口，而且你看不到它来。"
---

> 浮点数是一个有漏洞的抽象。它会在训练时咬你一口，而且你看不到它来。

## 学习目标

- 用 max-subtraction trick 实现数值稳定的 softmax 和 log-sum-exp
- 识别浮点运算中的溢出、下溢和灾难性抵消
- 用中心差分法做梯度检查验证解析梯度
- 解释为什么训练时 bfloat16 优于 float16，以及 loss scaling 如何防止梯度下溢

## 为什么要学这个

你的模型训练了三小时，然后 loss 变成 NaN。你加了 print——第 9000 步 logits 正常，第 9001 步变成 `inf`，第 9002 步每个梯度都是 `nan`，训练死了。

或者：模型训练完了但精度比论文低 2%。你检查了一切——架构对、超参对、数据对。问题是论文用 float32，你用了 float16 没有做正确的缩放。

或者：你从零实现交叉熵 loss，小 logits 时没问题。logits 超过 100 就返回 `inf`——softmax 溢出了，因为 `exp(100)` 超出了 float32 能表示的范围。每个 ML 框架都用一个两行的 trick 处理它，你不知道这个 trick 的存在。

数值稳定性不是理论问题。它决定了训练跑成功还是悄悄失败。

## 核心概念

### IEEE 754：计算机怎么存实数

计算机按 IEEE 754 标准存浮点数。一个 float 有三部分：符号位、指数和尾数。

```
Float32 布局（共 32 位）：
[1 符号] [8 指数] [23 尾数]

值 = (-1)^符号 × 2^(指数 - 127) × 1.尾数
```

尾数决定**精度**（多少有效数字），指数决定**范围**（能表示多大或多小的数）。

| 格式 | 位数 | 指数位 | 尾数位 | 十进制有效位 | 范围 |
|------|------|--------|--------|------------|------|
| float64 | 64 | 11 | 52 | ~15-16 | ±1.8e308 |
| float32 | 32 | 8 | 23 | ~7-8 | ±3.4e38 |
| float16 | 16 | 5 | 10 | ~3-4 | ±65,504 |
| bfloat16 | 16 | 8 | 7 | ~2-3 | ±3.4e38 |

float32 有约 7 位十进制精度——能分清 1.0000001 和 1.0000002，但分不清 1.00000001 和 1.00000002。7 位之后都是舍入噪声。

float16 能表示的最大数是 65,504。对 ML 来说这小得吓人——logits、梯度、激活值经常超过这个值。

**bfloat16** 是 Google 对 float16 范围问题的回答：跟 float32 一样的 8 位指数（一样的范围），但只有 7 位尾数（精度比 float16 还低）。训练神经网络时，范围比精度重要，所以 bfloat16 通常更好。

### 为什么 0.1 + 0.2 ≠ 0.3

0.1 在二进制浮点中无法精确表示——它是一个无限循环小数：

```python
>>> 0.1 + 0.2
0.30000000000000004

>>> 0.1 + 0.2 == 0.3
False
```

对 ML 的影响：
- `if loss < threshold` 可能给出错误答案
- 几千步的梯度累加会偏离真实和
- **永远不要用 `==` 比较浮点数**，用 `abs(a - b) < epsilon`

### 灾难性抵消

两个接近的浮点数相减时，有效数字互相抵消，留下的是被提升为前导位的舍入噪声。

```
a = 1.0000001（float32 存的是 1.00000011920929）
b = 1.0000000

真实差值：0.0000001
计算结果：0.00000011920929
相对误差：19.2%
```

一次减法就产生 19% 的相对误差。在 ML 中，以下情况会触发：
- 计算大均值数据的方差：`E[x²] - E[x]²` 当 E[x] 很大时
- 减去接近的对数概率
- 用太小的 epsilon 做数值梯度

**修复**：重排公式避免大数相减。方差用 Welford 算法或先中心化。对数概率全程在 log 空间操作。

### 溢出和下溢

溢出 = 结果太大放不下。下溢 = 结果太小（比最小正数还接近零）。

```
Float32 边界：
  最大值：  3.4028235e+38
  溢出：   > 3.4e38 → inf
  下溢：   < 1.4e-45 → 0.0

exp() 是 ML 中溢出的主要来源：
  exp(88.7)  = 3.40e+38  （刚好在 float32 极限内）
  exp(89.0)  = inf       （溢出）
  exp(-104)  = 0.0       （下溢到零）

log() 则相反：
  log(0.0)   = -inf
  log(-1.0)  = nan
```

在 ML 中，`exp()` 出现在 softmax、sigmoid、概率计算中。`log()` 出现在交叉熵、对数似然、KL 散度中。`log(exp(x))` 的组合没有正确 trick 就是一片雷区。

### Log-Sum-Exp Trick

直接计算 `log(Σ exp(xᵢ))` 数值上很危险。任何 `xᵢ` 太大，`exp(xᵢ)` 就溢出。全部 `xᵢ` 很负，每个 `exp(xᵢ)` 下溢到零，`log(0)` 是 `-inf`。

**Trick：指数化之前减去最大值。**

```
log(Σ exp(xᵢ)) = max(x) + log(Σ exp(xᵢ - max(x)))
```

为什么有效：减去 max(x) 后最大的指数是 exp(0) = 1，不可能溢出。至少有一项是 1，所以和至少为 1，log(1) = 0，不可能下溢到 -inf。

这个 trick 出现在：softmax、交叉熵 loss、序列模型的对数概率求和、混合高斯、变分推断。

### Softmax 为什么必须用 Max-Subtraction

```
softmax(xᵢ) = exp(xᵢ) / Σ exp(xⱼ)
```

不用 trick 时，logits [100, 101, 102]：
```
exp(100) = inf （float32 中 exp(88.7) 就到极限了）
→ 整个计算崩溃
```

用 trick，减去 max = 102：
```
exp(-2) = 0.135
exp(-1) = 0.368
exp(0)  = 1.000
sum = 1.503

softmax = [0.090, 0.245, 0.665]
```

概率结果一模一样，但计算是安全的。这不是优化，是**正确性的必要条件**。

### NaN 和 Inf：检测与预防

`nan` 和 `inf` 会病毒式传播。一个梯度变 `nan`，权重就变 `nan`，后续每个输出都是 `nan`。一步之内训练就死了。

**inf 怎么来的：**
- `exp()` 输入太大
- 除以零：`1.0 / 0.0`
- 累加溢出

**nan 怎么来的：**
- `0.0 / 0.0`
- `inf - inf`
- `inf × 0`
- `sqrt()` 负数
- `log()` 负数
- 任何涉及已有 `nan` 的运算

**预防策略：**
1. Clamp `exp()` 输入：`exp(clamp(x, -80, 80))`
2. 分母加 epsilon：`x / (y + 1e-8)`
3. `log()` 里加 epsilon：`log(x + 1e-8)`
4. 用稳定实现（log-sum-exp、stable softmax）
5. 梯度裁剪防止权重爆炸
6. 调试时每次前向后检查 nan/inf

### 混合精度训练

用 float16/bfloat16 训练能省一半内存、跑快一倍。但低精度带来问题：梯度下溢（小梯度在 fp16 中变成零）。

**Loss Scaling** 解决这个问题：
1. 把 loss 乘以一个大数（比如 1024）
2. 反向传播——梯度也被放大了 1024 倍，不容易下溢
3. 更新权重前把梯度除回来

```python
# PyTorch 混合精度训练
scaler = torch.cuda.amp.GradScaler()

with torch.cuda.amp.autocast():  # 前向用 fp16
    output = model(input)
    loss = criterion(output, target)

scaler.scale(loss).backward()    # 放大 loss 再反向
scaler.step(optimizer)           # 缩放回来再更新
scaler.update()                  # 动态调整 scale factor
```

| 格式 | 训练用途 | 优劣 |
|------|---------|------|
| float32 | 默认，安全但慢 | 精度最高，显存占用大 |
| float16 | 推理、某些训练 | 范围小（65504），需要 loss scaling |
| bfloat16 | 现代 GPU 训练首选 | 范围跟 float32 一样，精度低但够用 |

### 数值梯度检查

解析梯度（反向传播算的）可能有 bug。数值梯度检查用有限差分来验证。

```
中心差分公式：
df/dx ≈ (f(x + h) - f(x - h)) / (2h)

h = 1e-5 到 1e-7 效果最好
```

比较方式：用相对误差而非绝对误差。

```python
def relative_error(analytical, numerical):
    """相对误差，处理零的边界情况"""
    return abs(analytical - numerical) / max(abs(analytical), abs(numerical), 1e-8)

# 相对误差 < 1e-5：正确
# 相对误差 > 1e-3：几乎肯定有 bug
```

## 从零实现

### 第一步：稳定的 softmax

```python
import math

def stable_softmax(logits):
    """数值稳定的 softmax"""
    max_logit = max(logits)
    shifted = [x - max_logit for x in logits]
    exps = [math.exp(x) for x in shifted]
    total = sum(exps)
    return [e / total for e in exps]

def unstable_softmax(logits):
    """不稳定版本——演示用，别在实际中用"""
    exps = [math.exp(x) for x in logits]  # 大 logits 会溢出！
    total = sum(exps)
    return [e / total for e in exps]

# 测试
safe_logits = [1.0, 2.0, 3.0]
dangerous_logits = [100.0, 101.0, 102.0]

print("安全 logits:")
print(f"  稳定版: {stable_softmax(safe_logits)}")
print(f"  不稳定: {unstable_softmax(safe_logits)}")

print("危险 logits:")
print(f"  稳定版: {stable_softmax(dangerous_logits)}")
try:
    print(f"  不稳定: {unstable_softmax(dangerous_logits)}")
except OverflowError as e:
    print(f"  不稳定: 溢出! {e}")
```

### 第二步：Log-Sum-Exp

```python
def log_sum_exp(values):
    """数值稳定的 log(sum(exp(x)))"""
    max_val = max(values)
    shifted_sum = sum(math.exp(x - max_val) for x in values)
    return max_val + math.log(shifted_sum)

def stable_log_softmax(logits):
    """稳定的 log-softmax"""
    lse = log_sum_exp(logits)
    return [x - lse for x in logits]

def stable_cross_entropy(logits, target_index):
    """稳定的交叉熵 loss"""
    log_probs = stable_log_softmax(logits)
    return -log_probs[target_index]
```

### 第三步：演示数值问题

```python
# 灾难性抵消
a = 1.0000001
b = 1.0000000
diff = a - b
true_diff = 1e-7
rel_error = abs(diff - true_diff) / true_diff
print(f"减法结果: {diff}")
print(f"真实差值: {true_diff}")
print(f"相对误差: {rel_error:.1%}")

# 大数求和的累积误差
total_naive = 0.0
for _ in range(1_000_000):
    total_naive += 0.1
print(f"0.1 加 100 万次（朴素）: {total_naive}")
print(f"预期: 100000.0")
print(f"误差: {abs(total_naive - 100000.0):.6f}")

# Kahan 求和补偿误差
def kahan_sum(values):
    """Kahan 补偿求和算法"""
    total = 0.0
    compensation = 0.0
    for x in values:
        y = x - compensation
        t = total + y
        compensation = (t - total) - y
        total = t
    return total

total_kahan = kahan_sum([0.1] * 1_000_000)
print(f"0.1 加 100 万次（Kahan）: {total_kahan}")
```

### 第四步：梯度检查

```python
def gradient_check(f, x, analytical_grad, h=1e-5):
    """用中心差分验证解析梯度"""
    numerical_grad = (f(x + h) - f(x - h)) / (2 * h)
    rel_err = abs(analytical_grad - numerical_grad) / max(abs(analytical_grad), abs(numerical_grad), 1e-8)
    status = "✓" if rel_err < 1e-5 else "✗"
    print(f"  解析: {analytical_grad:.8f}")
    print(f"  数值: {numerical_grad:.8f}")
    print(f"  相对误差: {rel_err:.2e} {status}")
    return rel_err

# 测试几个函数
print("f(x) = x² 在 x=3:")
gradient_check(lambda x: x**2, 3.0, 6.0)

print("f(x) = sin(x) 在 x=1:")
gradient_check(math.sin, 1.0, math.cos(1.0))

print("f(x) = exp(x) 在 x=2:")
gradient_check(math.exp, 2.0, math.exp(2.0))
```

### 第五步：检测和处理 NaN/Inf

```python
import math

def safe_exp(x, max_val=80.0):
    """安全的 exp，防止溢出"""
    return math.exp(min(x, max_val))

def safe_log(x, eps=1e-8):
    """安全的 log，防止 log(0)"""
    return math.log(max(x, eps))

def safe_divide(a, b, eps=1e-8):
    """安全的除法，防止除以零"""
    return a / (b + eps)

def check_tensor_health(values, name="tensor"):
    """检查一组值中是否有 nan 或 inf"""
    has_nan = any(math.isnan(v) for v in values)
    has_inf = any(math.isinf(v) for v in values)
    if has_nan:
        print(f"⚠️  {name} 包含 NaN!")
    if has_inf:
        print(f"⚠️  {name} 包含 Inf!")
    if not has_nan and not has_inf:
        print(f"✓ {name} 健康")
```

## 实际使用（PyTorch）

```python
import torch
import torch.nn.functional as F

# 稳定的 softmax 和 cross-entropy——PyTorch 内部已经用了 trick
logits = torch.tensor([100.0, 101.0, 102.0])
probs = F.softmax(logits, dim=0)       # 内部自动减 max
loss = F.cross_entropy(
    logits.unsqueeze(0),               # (1, 3)
    torch.tensor([2])                   # target
)

# 梯度裁剪
model = torch.nn.Linear(10, 10)
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 检查 nan
if torch.isnan(loss):
    print("Loss is NaN!")
```

## 练习

1. 实现稳定版的 sigmoid：`sigmoid(x) = 1/(1+exp(-x))`，处理大正数和大负数的情况
2. 写一个函数检测梯度中是否有 nan/inf，如果有就跳过这步更新（gradient clipping 的简化版）
3. 用不同的 h 值（1e-3 到 1e-10）做梯度检查，找出最佳 h 值范围。解释为什么 h 太小反而误差更大
4. 实现 Welford 在线方差算法，跟 naive `E[x²] - E[x]²` 对比精度

## 术语表

| 术语 | 通俗说法 | 真正含义 |
|------|---------|---------|
| Overflow（溢出） | "数太大了" | 结果超出浮点格式能表示的最大值，变成 inf |
| Underflow（下溢） | "数太小了" | 结果比最小正数还小，变成 0.0 |
| NaN | "不是数" | 未定义运算的结果（如 0/0、inf-inf），一旦出现就传播到所有后续计算 |
| Catastrophic cancellation | "大数相减灾难" | 两个接近的数相减导致有效位全部丢失 |
| Log-Sum-Exp trick | "先减 max 再 exp" | 把 log(Σexp(x)) 改写为 max(x) + log(Σexp(x-max(x)))，防止溢出 |
| Loss scaling | "放大再缩回" | 混合精度训练中放大 loss 让梯度不下溢，更新前再缩回来 |
| bfloat16 | "Google 的 float16" | 16 位格式，范围跟 float32 一样但精度更低。训练首选 |
| Gradient checking | "用数值验证梯度" | (f(x+h)-f(x-h))/(2h) 跟解析梯度对比，验证反向传播实现的正确性 |
| Mixed precision（混合精度） | "用低精度省内存" | 前向和梯度计算用 fp16/bf16，权重更新用 fp32 |
| Epsilon | "加个小数防爆" | 加在分母或 log 参数中的极小值（如 1e-8），防止除零或 log(0) |

---

## 自测题

:::quiz
question: 为什么 softmax 实现中必须在指数化之前减去最大的 logit？
options:
  - 为了让概率分布更均匀
  - 为了防止 exp() 溢出到 inf，同时数学结果完全不变
  - 为了加快计算速度
  - 为了让梯度更容易计算
correct: 1
explanation: float32 中 exp(89) 就已经是 inf。减去 max 后最大的指数是 exp(0) = 1，不可能溢出。减法在归一化时抵消，概率结果完全相同。
:::

:::quiz
question: float16 和 bfloat16 的核心区别是什么？
options:
  - float16 更快，bfloat16 更慢
  - float16 范围小（最大 65504）但精度高，bfloat16 范围大（跟 float32 一样）但精度低
  - bfloat16 是 32 位格式
  - 它们完全一样只是叫法不同
correct: 1
explanation: float16 用 5 位指数（范围只到 65504）和 10 位尾数。bfloat16 用 8 位指数（范围跟 float32 的 3.4e38 一样）和 7 位尾数。训练时范围比精度重要，所以 bfloat16 更适合。
:::

:::quiz
question: "灾难性抵消"是什么？
options:
  - 训练过程中的学习率突然归零
  - 两个接近的浮点数相减时有效数字互相抵消，留下的全是舍入噪声
  - 模型权重互相抵消导致输出为零
  - GPU 计算被取消
correct: 1
explanation: 比如 1.0000001 - 1.0000000，真实差是 1e-7 但 float32 的计算结果有接近 20% 的相对误差。有效位在减法中对消，剩下的就是噪声。
:::

:::quiz
question: Loss Scaling 在混合精度训练中解决什么问题？
options:
  - 让 loss 值看起来更小方便观察
  - 放大 loss 使得反向传播时的梯度不会在 fp16 中下溢到零
  - 自动选择最优学习率
  - 把 fp16 的 loss 转换成 fp32
correct: 1
explanation: fp16 能表示的最小正数约 6e-8。很多梯度比这还小就下溢到零了。先放大 loss（比如乘 1024），梯度也被放大，不容易下溢。更新权重前再除回来。
:::

:::quiz
question: 梯度检查中 h 太小（比如 1e-15）为什么反而误差更大？
options:
  - 计算变慢了
  - f(x+h) 和 f(x-h) 在浮点表示中几乎完全相同，相减后发生灾难性抵消
  - h 太小会导致溢出
  - 编程语言不支持这么小的数
correct: 1
explanation: 当 h 极小时，f(x+h) 和 f(x-h) 只在最后几位有差异。相减后有效位几乎全部丢失，除以 2h 后得到的是放大了的舍入噪声。最佳 h 通常在 1e-5 到 1e-7 之间。
:::

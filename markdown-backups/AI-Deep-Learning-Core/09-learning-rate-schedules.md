---
title: "学习率调度与 Warmup"
chapter: 9
readTime: 90
description: "学习率是最重要的超参数。不是架构，不是数据集大小，不是激活函数。如果你只调一个东西，调学习率。"
---

> 学习率是最重要的超参数。不是架构，不是数据集大小，不是激活函数。如果你只调一个东西，调学习率。

## 学习目标

- 从零实现 constant、step decay、cosine annealing、warmup + cosine、1cycle 学习率调度
- 演示学习率选择的三种失败模式：发散（太高）、停滞（太低）、振荡（没衰减）
- 解释为什么 Adam 类优化器需要 warmup，它如何稳定早期训练
- 在同一任务上比较五种调度的收敛速度

## 为什么要学这个

lr = 0.1：训练发散，3 步后 loss 飞到 inf。lr = 0.0001：训练爬行，100 epoch 后模型几乎没动。lr = 0.01：前 50 epoch 正常，然后 loss 在最小值附近振荡永远下不去——步长太大了。

最优学习率不是常数，它在训练过程中变化。早期想走大步快速推进，后期想走小步精细调整。90% 精度和 95% 精度之间的差距经常就是调度策略。

LLaMA 3 用 peak lr=3e-4，2000 步 warmup，cosine 衰减到 3e-5。GPT-3 用 lr=6e-4，warmup 覆盖 3.75 亿 token。这些不是随便选的——是几百万美元超参搜索的结果。

## 核心概念

### 常数学习率

最简单。选一个数，每步都用。

```
lr(t) = lr₀
```

很少是最优的。对训练后期太高（在最小值附近振荡）或对开头太低（浪费算力走小步）。适合小模型和调试，不适合正式训练。

### Step Decay（阶梯衰减）

ResNet 时代的老做法。在固定 epoch 处把学习率砍一刀（通常除以 10）。

```
lr(t) = lr₀ × γ^(floor(epoch / step_size))

例：lr₀=0.1, γ=0.1, 每 30 epoch 砍一次
  epoch 0-29:  lr = 0.1
  epoch 30-59: lr = 0.01
  epoch 60-89: lr = 0.001
```

简单有效，但需要手动选什么时候砍。现代做法更平滑。

### Cosine Annealing（余弦退火）

从最大 lr 平滑下降到最小 lr，遵循余弦曲线。

```
lr(t) = lr_min + 0.5 × (lr_max - lr_min) × (1 + cos(π × t / T))
```

T 是总步数。前半段 lr 下降慢（在高处多待一会），后半段下降快。没有需要调的"砍的时机"——曲线形状固定。这是 Transformer 训练的标准选择。

### Warmup（热启动）

训练前几步从很小的 lr 线性升到目标 lr。

```
if t < warmup_steps:
    lr(t) = lr_max × (t / warmup_steps)
else:
    lr(t) = 后续调度（cosine decay 等）
```

**为什么 Adam 需要 warmup**：Adam 的二阶矩（v_t）跟踪梯度平方的移动平均。前几步 v_t 还没稳定，估计很不准。如果一开始就用大 lr，不准的自适应缩放会导致某些参数走大步——方向都未必对。Warmup 在 v_t 稳定之前保持小步，给优化器时间"热机"。

通常 warmup 占总训练的 1-10%。LLM 训练典型值：2000 步。

### Warmup + Cosine Decay（现代标准）

```
warmup_steps = total_steps × 0.05    （前 5% 升温）
lr_max = 3e-4                         （峰值学习率）
lr_min = lr_max × 0.1                 （最终学习率）

if t < warmup_steps:
    lr = lr_max × (t / warmup_steps)
else:
    progress = (t - warmup_steps) / (total_steps - warmup_steps)
    lr = lr_min + 0.5 × (lr_max - lr_min) × (1 + cos(π × progress))
```

这是 GPT、LLaMA、BERT 等几乎所有现代大模型的标准调度。

### 1Cycle（一个周期）

Smith (2019) 的超收敛方法。前半程升学习率，后半程降，最后用很小的 lr 做 anneal。

```
前半程：lr 从 lr_max/25 升到 lr_max
后半程：lr 从 lr_max 降到 lr_max/25
最后 ~10%：lr 进一步降到 lr_max/25000
```

激进但在 CNN 训练中很有效，能在更少的 epoch 达到更好结果。

### 三种失败模式对比

| 问题 | 症状 | 原因 | 修复 |
|------|------|------|------|
| 发散 | Loss 飞到 inf 或 NaN | lr 太高 | 降低 lr 或加 warmup |
| 停滞 | Loss 几乎不动 | lr 太低 | 提高 lr |
| 振荡 | Loss 在某值附近上下跳 | 末期 lr 太高，没有衰减 | 加 cosine 衰减 |

## 从零实现

```python
import math

def constant_schedule(step, lr=0.001, **kwargs):
    return lr

def step_decay_schedule(step, lr=0.01, drop_factor=0.1, drop_every=30, **kwargs):
    return lr * (drop_factor ** (step // drop_every))

def cosine_schedule(step, lr_max=0.001, lr_min=1e-5, total_steps=1000, **kwargs):
    progress = min(step / total_steps, 1.0)
    return lr_min + 0.5 * (lr_max - lr_min) * (1 + math.cos(math.pi * progress))

def warmup_cosine_schedule(step, lr_max=0.001, lr_min=1e-5, warmup_steps=100, total_steps=1000, **kwargs):
    if step < warmup_steps:
        return lr_max * (step / warmup_steps)
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return lr_min + 0.5 * (lr_max - lr_min) * (1 + math.cos(math.pi * progress))

def one_cycle_schedule(step, lr_max=0.01, total_steps=1000, **kwargs):
    pct = step / total_steps
    if pct < 0.45:
        return lr_max * (pct / 0.45)
    elif pct < 0.9:
        progress = (pct - 0.45) / 0.45
        return lr_max * (1 - progress)
    else:
        return lr_max * 0.001

# 打印各调度在关键步骤的 lr
total = 1000
print(f"{'Step':<8} {'Constant':<10} {'StepDecay':<10} {'Cosine':<10} {'W+Cos':<10} {'1Cycle':<10}")
for step in [0, 50, 100, 250, 500, 750, 999]:
    c = constant_schedule(step)
    sd = step_decay_schedule(step, total_steps=total, drop_every=333)
    co = cosine_schedule(step, total_steps=total)
    wc = warmup_cosine_schedule(step, warmup_steps=100, total_steps=total)
    oc = one_cycle_schedule(step, total_steps=total)
    print(f"{step:<8} {c:<10.6f} {sd:<10.6f} {co:<10.6f} {wc:<10.6f} {oc:<10.6f}")
```

## 用库做同样的事

```python
import torch.optim as optim

optimizer = optim.AdamW(model.parameters(), lr=3e-4)

# Cosine annealing
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100, eta_min=1e-5)

# Warmup + cosine（用 lambda 组合）
warmup_steps = 100
total_steps = 2000

def lr_lambda(step):
    if step < warmup_steps:
        return step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return 0.5 * (1 + math.cos(math.pi * progress))

scheduler = optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)

# 1Cycle
scheduler = optim.lr_scheduler.OneCycleLR(optimizer, max_lr=0.01, total_steps=2000)

# 训练循环中
for step in range(total_steps):
    optimizer.zero_grad()
    loss = compute_loss()
    loss.backward()
    optimizer.step()
    scheduler.step()  # 每步更新 lr
```

## 练习

1. 在同一个任务上用 5 种调度分别训练，画 lr 曲线和 loss 曲线。哪个收敛最快？哪个最终 loss 最低？
2. 尝试不同的 warmup 步数 (0, 50, 200, 1000)，观察对早期训练稳定性的影响。
3. 实现 LR Range Test (Smith 2017)：从极小 lr 开始指数增大，记录每步的 loss。loss 开始上升的点就是最大可用 lr。

## 术语表

| 术语 | 通俗说法 | 真正含义 |
|------|---------|---------|
| Learning rate schedule | "lr 随时间变" | 根据训练步数动态调整学习率的函数 |
| Warmup | "热启动" | 前几步从小 lr 线性升到峰值，给优化器时间稳定 |
| Cosine annealing | "余弦退火" | lr 按余弦曲线从高到低平滑下降 |
| Step decay | "阶梯衰减" | 固定间隔把 lr 砍一刀（通常除以 10） |
| 1Cycle | "超收敛" | 先升后降的 lr 策略，能在更少 epoch 达到更好结果 |
| Peak lr | "峰值学习率" | warmup 结束时达到的最大学习率 |
| Divergence（发散） | "loss 飞了" | lr 太高导致参数更新过大，loss 不降反升 |

---

## 自测题

:::quiz
question: 为什么固定学习率通常不是最优选择？
options:
  - 固定 lr 训练更慢但最终更好
  - 训练早期需要大步快速推进，后期需要小步精细调整，固定 lr 只能折中
  - 固定 lr 会导致梯度消失
  - 现代 GPU 不支持固定 lr
correct: 1
explanation: 训练初期距最小值远，大 lr 走得快。末期在最小值附近，大 lr 会来回跳过。调度策略让两阶段都获得合适的步长。
:::

:::quiz
question: Warmup 为什么对 Adam 优化器重要？
options:
  - Adam 计算太慢需要热机
  - Adam 的二阶矩估计前几步不稳定，大 lr 会导致不靠谱的大步更新
  - Warmup 减少内存使用
  - Adam 的参数需要几步才能加载到 GPU
correct: 1
explanation: Adam 用梯度平方的移动平均做自适应缩放。前几步这个估计还没稳定（偏差修正虽然有但不完美）。Warmup 保持小步让估计稳定后再给大步。
:::

:::quiz
question: Cosine annealing 相比 step decay 的优势是什么？
options:
  - 计算更快
  - 平滑连续下降不需要手动选"什么时候砍 lr"，避免了突变带来的训练不稳定
  - 最终 lr 更高
  - 只适用于 CNN
correct: 1
explanation: Step decay 在固定点突然把 lr 砍到 1/10，可能导致 loss 突然跳动。Cosine 连续平滑下降，没有需要调的超参（除了总步数），训练更稳定。
:::

:::quiz
question: LLaMA 3 和 GPT-3 使用的学习率调度策略是什么？
options:
  - 固定学习率
  - Step decay
  - Warmup + cosine decay
  - 指数衰减
correct: 2
explanation: 几乎所有现代 LLM 都用 warmup + cosine decay：先线性升温到峰值 lr，再按余弦曲线平滑衰减到接近零。这是无争议的标准。
:::

:::quiz
question: 训练过程中 loss 在某值附近上下振荡而不下降，最可能的原因是？
options:
  - 模型太小
  - 学习率在训练末期太高，需要加衰减策略
  - 数据有问题
  - batch size 太大
correct: 1
explanation: 当 lr 太高时，每步都跳过最小值在两侧弹跳。加 cosine 或其他衰减让末期 lr 足够小，模型才能稳定收敛到最小值。
:::

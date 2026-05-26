---
title: "JAX 入门"
chapter: 12
readTime: 90
description: "PyTorch 原地修改张量，TensorFlow 构建计算图，JAX 编译纯函数。最后这个会改变你对深度学习的思考方式。"
---

> PyTorch 原地修改张量，TensorFlow 构建计算图，JAX 编译纯函数。最后这个会改变你对深度学习的思考方式。

## 学习目标

- 用 JAX 的函数式 API（jax.numpy、jax.grad、jax.jit、jax.vmap）编写纯函数式神经网络代码
- 解释 PyTorch 的 eager mutation 和 JAX 的函数式编译模型之间的核心设计差异
- 用 jit 编译和 vmap 向量化加速训练循环
- 在 JAX 中训练一个简单网络，对比显式状态管理与 PyTorch 的面向对象方式

## 为什么要学这个

你知道怎么用 PyTorch 搭神经网络。定义 `nn.Module`，调 `.backward()`，step 优化器。它能跑。数百万人在用。

但 PyTorch 有一个刻在 DNA 里的约束：它逐个操作、在 Python 中即时追踪。每个 `tensor + tensor` 都是一次单独的内核调用。每个训练步骤都重新解释同一段 Python 代码。这在小规模没问题，但当你要在 2048 块 TPU 上训练 5400 亿参数的模型时，这些开销就要了命。

Google DeepMind 用 JAX 训练 Gemini。Anthropic 用 JAX 训练 Claude。这不是小打小闹——它们是地球上最大规模的神经网络训练。它们选 JAX 是因为 JAX 把你的训练循环当成一个可编译的程序，而不是一连串 Python 调用。

JAX 本质上就是带三种超能力的 NumPy：自动微分、JIT 编译到 XLA、自动向量化。你写一个处理单个样本的函数，JAX 给你一个能处理批量、计算梯度、编译成机器码、在多设备上运行的函数。而且原始函数一个字不用改。

## 核心概念

### JAX 的哲学

JAX 是函数式框架。没有类，没有可变状态，没有 `.backward()` 方法。取而代之：

| PyTorch | JAX |
|---------|-----|
| `nn.Module` 类带状态 | 纯函数：`f(params, x) -> y` |
| `loss.backward()` | `jax.grad(loss_fn)(params, x, y)` |
| 即时执行 | 通过 XLA 做 JIT 编译 |
| `for x in batch:` 手动循环 | `jax.vmap(f)` 自动向量化 |
| `DataParallel` / `FSDP` | `jax.pmap(f)` 自动并行 |
| 可变的 `model.parameters()` | 不可变的 pytree 数组 |

这不是代码风格偏好，而是编译器约束。JIT 编译要求纯函数——同样的输入永远产生同样的输出，没有副作用。这个限制恰恰是 100 倍加速的前提。

### jax.numpy：熟悉的表面

JAX 在加速器上重新实现了 NumPy API：

```python
import jax.numpy as jnp

a = jnp.array([1.0, 2.0, 3.0])
b = jnp.array([4.0, 5.0, 6.0])
c = jnp.dot(a, b)
```

函数名一样，广播规则一样，切片语义一样。但数组跑在 GPU/TPU 上，而且每一步操作都可以被编译器追踪。

一个关键区别：JAX 数组是不可变的。不能写 `a[0] = 5`，而要写 `a = a.at[0].set(5)`。刚开始会觉得别扭，但一周后就想通了——不可变性正是 `grad`、`jit`、`vmap` 能互相组合的原因。

### jax.grad：函数式自动微分

PyTorch 把梯度附着在张量上（`.grad`）。JAX 把梯度附着在函数上。

```python
import jax

def f(x):
    return x ** 2

df = jax.grad(f)
df(3.0)  # 6.0
```

`jax.grad` 接收一个函数，返回一个计算其梯度的新函数。没有 `.backward()` 调用，张量上也不存计算图。梯度就是另一个可以调用、组合、JIT 编译的函数。

任意组合：

```python
d2f = jax.grad(jax.grad(f))  # 二阶导数
d2f(3.0)  # 2.0
```

二阶导、三阶导、Jacobian、Hessian——都通过组合 `grad` 实现。PyTorch 也能做（`torch.autograd.functional.hessian`），但那是后来加上去的。在 JAX，这是根基。

约束：`grad` 只对纯函数有效。内部不能 print（会在 tracing 时执行而非运行时），不能修改外部状态，不能不带 key 就生成随机数。

### jit：编译到 XLA

```python
@jax.jit
def train_step(params, x, y):
    loss = loss_fn(params, x, y)
    return loss

fast_step = jax.jit(train_step)
```

第一次调用时，JAX 追踪（trace）函数——记录发生了哪些操作，但不真正执行。然后把这个 trace 交给 XLA（Accelerated Linear Algebra），Google 为 TPU 和 GPU 打造的编译器。XLA 融合操作、消除冗余内存拷贝、生成优化的机器码。

后续调用完全跳过 Python。编译后的代码以 C++ 速度跑在加速器上。

JIT 有用的情况：
- 训练步骤（同一计算重复几千次）
- 推理（同一模型，不同输入）
- 任何会被多次调用且输入形状相似的函数

JIT 有害的情况：
- 含有依赖值的 Python 控制流（`if x > 0`，其中 x 是被 trace 的数组）
- 只跑一次的计算（编译开销超过运行时间）
- 调试（tracing 隐藏了实际执行过程）

控制流限制是真实的。`jax.lax.cond` 替代 `if/else`，`jax.lax.scan` 替代 `for` 循环。这不是可选的——这是编译的代价。

### vmap：自动向量化

你写一个处理单样本的函数：

```python
def predict(params, x):
    return jnp.dot(params['w'], x) + params['b']
```

`vmap` 把它提升为处理批量：

```python
batch_predict = jax.vmap(predict, in_axes=(None, 0))
```

`in_axes=(None, 0)` 意思是：不要在 `params` 上批处理（共享的），在 `x` 的第 0 维上批处理。没有手写 `for` 循环，没有 reshape，没有手动穿引 batch 维度。JAX 自己搞定 batch 维并向量化整个计算。

这不是语法糖。`vmap` 生成融合的向量化代码，比 Python 循环快 10–100 倍。而且它跟 `jit` 和 `grad` 可以组合：

```python
per_example_grads = jax.vmap(jax.grad(loss_fn), in_axes=(None, 0, 0))
```

逐样本梯度，一行代码。这在 PyTorch 中几乎不可能不用 hack 实现。

### pmap：跨设备数据并行

```python
parallel_step = jax.pmap(train_step, axis_name='devices')
```

`pmap` 把函数复制到所有可用设备（GPU/TPU）上并切分 batch。函数内部用 `jax.lax.pmean` 和 `jax.lax.psum` 同步梯度。

Google 用 `pmap`（以及后续的 `shard_map`）在数千块 TPU v5e 上训练 Gemini。编程模型：写单设备版本，包一层 `pmap`，搞定。

### Pytree：通用数据结构

JAX 操作"pytree"——列表、元组、字典和数组的嵌套组合。你的模型参数就是一个 pytree：

```python
params = {
    'layer1': {'w': jnp.zeros((784, 256)), 'b': jnp.zeros(256)},
    'layer2': {'w': jnp.zeros((256, 128)), 'b': jnp.zeros(128)},
    'layer3': {'w': jnp.zeros((128, 10)),  'b': jnp.zeros(10)},
}
```

每个 JAX 变换——`grad`、`jit`、`vmap`——都知道怎么遍历 pytree。`jax.tree.map(f, tree)` 把 `f` 应用到每个叶子。优化器就这样一次性更新所有参数：

```python
params = jax.tree.map(lambda p, g: p - lr * g, params, grads)
```

不需要 `.parameters()` 方法，不需要参数注册。树结构本身就是模型。

### 函数式 vs 面向对象

PyTorch 把状态存在对象里：

```python
class Model(nn.Module):
    def __init__(self):
        self.linear = nn.Linear(784, 10)

    def forward(self, x):
        return self.linear(x)
```

JAX 用纯函数加显式状态：

```python
def predict(params, x):
    return jnp.dot(x, params['w']) + params['b']
```

参数是传进来的。没有东西被存储，没有东西被修改。这让每个函数都可测试、可组合、可编译。代价是你要自己管理参数——或者用 Flax、Equinox 这类库。

### JAX 生态系统

JAX 给你基础原语，库给你工程体验：

| 库 | 角色 | 风格 |
|----|------|------|
| **Flax**（Google） | 神经网络层 | `nn.Module` + 显式状态 |
| **Equinox**（Patrick Kidger） | 神经网络层 | 基于 pytree，更 Pythonic |
| **Optax**（DeepMind） | 优化器 + 学习率调度 | 可组合的梯度变换 |
| **Orbax**（Google） | Checkpointing | 保存/恢复 pytree |
| **CLU**（Google） | 指标 + 日志 | 训练循环工具 |

Optax 是标准优化器库。它把梯度变换（Adam、SGD、梯度裁剪）和参数更新分开，组合起来极其方便：

```python
optimizer = optax.chain(
    optax.clip_by_global_norm(1.0),
    optax.adam(learning_rate=1e-3),
)
```

### 什么时候该用 JAX vs PyTorch

| 因素 | JAX | PyTorch |
|------|-----|---------|
| TPU 支持 | 一等公民（Google 两个都造） | 社区维护（torch_xla） |
| GPU 支持 | 不错（通过 XLA 支持 CUDA） | 业界最佳（原生 CUDA） |
| 调试 | 难（tracing + 编译） | 容易（eager，逐行执行） |
| 生态 | 研究向（Flax、Equinox） | 巨大（HuggingFace、torchvision 等） |
| 招聘 | 小众（Google/DeepMind/Anthropic） | 主流（到处都是） |
| 大规模训练 | 更强（XLA、pmap、mesh） | 不错（FSDP、DeepSpeed） |
| 原型速度 | 更慢（函数式开销） | 更快（改了就跑） |
| 生产推理 | TF Serving, Vertex AI | TorchServe, Triton, ONNX |
| 谁在用 | DeepMind（Gemini）、Anthropic（Claude） | Meta（Llama）、OpenAI（GPT）、Stability AI |

坦诚答案：除非有明确理由，否则用 PyTorch。那些理由是——有 TPU、需要逐样本梯度、超大规模多设备训练，或者你在 Google/DeepMind/Anthropic 工作。

### JAX 中的随机数

JAX 没有全局随机状态。每个随机操作都需要显式的 PRNG key：

```python
key = jax.random.PRNGKey(42)
key1, key2 = jax.random.split(key)
w = jax.random.normal(key1, shape=(784, 256))
```

一开始觉得烦。但它保证了跨设备和跨编译的可复现性——这是 PyTorch 的 `torch.manual_seed` 在多 GPU 环境下做不到的。

## 从零实现

### 第一步：准备数据

我们用 JAX 和 Optax 在 MNIST 上训练一个 3 层 MLP。784 输入，两个隐藏层分别 256 和 128 神经元，10 个输出类别。

```python
import jax
import jax.numpy as jnp
from jax import random
import optax

def get_mnist_data():
    from sklearn.datasets import fetch_openml
    mnist = fetch_openml('mnist_784', version=1, as_frame=False, parser='auto')
    X = mnist.data.astype('float32') / 255.0
    y = mnist.target.astype('int')
    X_train, X_test = X[:60000], X[60000:]
    y_train, y_test = y[:60000], y[60000:]
    return X_train, y_train, X_test, y_test
```

### 第二步：初始化参数

没有类。只是一个返回 pytree 的函数：

```python
def init_params(key):
    k1, k2, k3 = random.split(key, 3)
    scale1 = jnp.sqrt(2.0 / 784)
    scale2 = jnp.sqrt(2.0 / 256)
    scale3 = jnp.sqrt(2.0 / 128)
    params = {
        'layer1': {
            'w': scale1 * random.normal(k1, (784, 256)),
            'b': jnp.zeros(256),
        },
        'layer2': {
            'w': scale2 * random.normal(k2, (256, 128)),
            'b': jnp.zeros(128),
        },
        'layer3': {
            'w': scale3 * random.normal(k3, (128, 10)),
            'b': jnp.zeros(10),
        },
    }
    return params
```

He 初始化，手动完成。三个 PRNG key 从一个种子 split 出来。每个权重都是嵌套字典里的不可变数组。

### 第三步：前向传播

```python
def forward(params, x):
    x = jnp.dot(x, params['layer1']['w']) + params['layer1']['b']
    x = jax.nn.relu(x)
    x = jnp.dot(x, params['layer2']['w']) + params['layer2']['b']
    x = jax.nn.relu(x)
    x = jnp.dot(x, params['layer3']['w']) + params['layer3']['b']
    return x

def loss_fn(params, x, y):
    logits = forward(params, x)
    one_hot = jax.nn.one_hot(y, 10)
    return -jnp.mean(jnp.sum(jax.nn.log_softmax(logits) * one_hot, axis=-1))
```

纯函数。参数传入，预测传出。没有 `self`，没有存储状态。`loss_fn` 从头计算交叉熵——softmax、log、取负均值。

### 第四步：JIT 编译的训练步骤

```python
@jax.jit
def train_step(params, opt_state, x, y):
    loss, grads = jax.value_and_grad(loss_fn)(params, x, y)
    updates, opt_state = optimizer.update(grads, opt_state, params)
    params = optax.apply_updates(params, updates)
    return params, opt_state, loss

@jax.jit
def accuracy(params, x, y):
    logits = forward(params, x)
    preds = jnp.argmax(logits, axis=-1)
    return jnp.mean(preds == y)
```

`jax.value_and_grad` 一次调用同时返回 loss 值和梯度。`@jax.jit` 装饰器把两个函数都编译到 XLA。首次调用后，每一步训练都不再碰 Python。

### 第五步：训练循环

```python
optimizer = optax.adam(learning_rate=1e-3)

X_train, y_train, X_test, y_test = get_mnist_data()
X_train, X_test = jnp.array(X_train), jnp.array(X_test)
y_train, y_test = jnp.array(y_train), jnp.array(y_test)

key = random.PRNGKey(0)
params = init_params(key)
opt_state = optimizer.init(params)

batch_size = 128
n_epochs = 10

for epoch in range(n_epochs):
    key, subkey = random.split(key)
    perm = random.permutation(subkey, len(X_train))
    X_shuffled = X_train[perm]
    y_shuffled = y_train[perm]

    epoch_loss = 0.0
    n_batches = len(X_train) // batch_size
    for i in range(n_batches):
        start = i * batch_size
        xb = X_shuffled[start:start + batch_size]
        yb = y_shuffled[start:start + batch_size]
        params, opt_state, loss = train_step(params, opt_state, xb, yb)
        epoch_loss += loss

    train_acc = accuracy(params, X_train[:5000], y_train[:5000])
    test_acc = accuracy(params, X_test, y_test)
    print(f"Epoch {epoch + 1:2d} | Loss: {epoch_loss / n_batches:.4f} | "
          f"Train Acc: {train_acc:.4f} | Test Acc: {test_acc:.4f}")
```

10 个 epoch，测试准确率约 97%。第一个 epoch 慢（JIT 编译），第 2–10 个 epoch 很快。

注意这里缺了什么：没有 `.zero_grad()`，没有 `.backward()`，没有 `.step()`。整个更新是一次组合好的函数调用。梯度计算、Adam 变换、应用到参数——全在 `train_step` 里完成。

## 实战用法

### Flax：Google 标准库

Flax 是最常用的 JAX 神经网络库。它加回了 `nn.Module`，但保持显式状态管理：

```python
import flax.linen as nn

class MLP(nn.Module):
    @nn.compact
    def __call__(self, x):
        x = nn.Dense(256)(x)
        x = nn.relu(x)
        x = nn.Dense(128)(x)
        x = nn.relu(x)
        x = nn.Dense(10)(x)
        return x

model = MLP()
params = model.init(jax.random.PRNGKey(0), jnp.ones((1, 784)))
logits = model.apply(params, x_batch)
```

结构跟 PyTorch 类似，但 `params` 跟模型是分开的。`model.init()` 创建参数，`model.apply(params, x)` 跑前向传播。模型对象本身无状态。

### Equinox：更 Pythonic 的替代品

Equinox（Patrick Kidger 开发）把模型表示为 pytree：

```python
import equinox as eqx

model = eqx.nn.MLP(
    in_size=784, out_size=10, width_size=256, depth=2,
    activation=jax.nn.relu, key=jax.random.PRNGKey(0)
)
logits = model(x)
```

模型本身就是 pytree。不需要 `.apply()`。参数就是模型的叶节点。这更接近 JAX 的思维方式。

### Optax：可组合的优化器

Optax 把梯度变换和参数更新解耦：

```python
schedule = optax.warmup_cosine_decay_schedule(
    init_value=0.0, peak_value=1e-3,
    warmup_steps=1000, decay_steps=50000
)

optimizer = optax.chain(
    optax.clip_by_global_norm(1.0),
    optax.adamw(learning_rate=schedule, weight_decay=0.01),
)
```

梯度裁剪、学习率 warmup、weight decay——全部作为变换链组合起来。每个变换看到梯度，修改它，传给下一个。没有巨大的单体优化器类。

## 练习

1. **给 MLP 加 Dropout。** 在 JAX 中，Dropout 需要 PRNG key——把 key 穿过前向传播，每层 Dropout 都 split 一次。对比有无 Dropout 的测试准确率。

2. **用 `jax.vmap` 计算逐样本梯度。** 对一批 32 张 MNIST 图片计算每个样本的梯度，算出每个样本的梯度范数。哪些样本梯度最大？为什么？

3. **写一个通用的 MLP forward 函数。** 用 `jax.tree.leaves` 自动判断层数，让 `mlp_forward(params, x)` 能处理任意深度的网络。

4. **Benchmark JIT 加速。** 有无 `@jax.jit` 分别跑 100 步训练，计时对比。你的硬件上加速多少倍？第一次调用的编译开销是多少？

5. **实现梯度裁剪。** 组合 `optax.chain(optax.clip_by_global_norm(1.0), optax.adam(1e-3))`。有无裁剪分别训练，画出训练过程中梯度范数的变化曲线。

## 术语表

| 术语 | 通俗说法 | 真正含义 |
|------|---------|---------|
| XLA | "让 JAX 快的东西" | Accelerated Linear Algebra——从计算图生成优化 GPU/TPU 内核的编译器 |
| JIT | "即时编译" | JAX 在首次调用时追踪函数，编译到 XLA，后续调用直接执行编译版本 |
| Pure function（纯函数） | "没有副作用" | 输出只取决于输入——无全局状态、无修改、无隐式随机 |
| vmap | "自动批处理" | 把处理单个样本的函数变成处理整批的函数，无需重写 |
| pmap | "自动并行" | 把函数复制到多设备并切分输入 batch |
| Pytree | "嵌套字典里装数组" | 列表、元组、字典、数组的嵌套结构，JAX 能遍历和变换它们 |
| Tracing（追踪） | "记录计算过程" | JAX 用抽象值执行函数来构建计算图，不真正计算 |
| 函数式自动微分 | "函数的梯度" | 通过变换函数来计算导数，而非在张量上附着梯度存储 |
| Optax | "JAX 的优化器库" | 可组合的梯度变换库——Adam、SGD、裁剪、调度——可以链式组合 |
| Flax | "JAX 的 nn.Module" | Google 的 JAX 神经网络库，添加层抽象同时保持状态显式 |

---

## 自测题

:::quiz
question: PyTorch 和 JAX 之间的根本设计差异是什么？
options:
  - PyTorch 更快
  - PyTorch 即时修改张量，而 JAX 编译无副作用的纯函数
  - JAX 不支持 GPU
  - PyTorch 不支持自动微分
correct: 1
explanation: PyTorch 用 eager execution 和可变状态（如 tensor.grad 被原地修改）。JAX 拥抱函数式编程：函数是纯的，状态是显式的，jit 编译优化整个计算图。
:::

:::quiz
question: jax.jit 做了什么？
options:
  - 添加 Dropout 正则化
  - 把 Python 函数编译成优化的 XLA 代码，比解释执行的 Python 快得多
  - 初始化模型权重
  - 计算梯度
correct: 1
explanation: jax.jit 追踪函数并编译到 XLA 机器码。第一次调用慢（编译），后续调用直接执行优化后的编译版本。
:::

:::quiz
question: jax.vmap 做了什么？
options:
  - 把一个处理单样本的函数向量化为处理整个 batch，不需要写显式循环
  - 验证模型架构
  - 管理 GPU 内存
  - 计算二阶梯度
correct: 0
explanation: jax.vmap 把一个为单个样本写的函数自动向量化为处理整个 batch。你写单样本代码，vmap 负责批处理，通常比手动 batch 循环更高效。
:::

:::quiz
question: JAX 处理模型状态（权重）和 PyTorch 有什么不同？
options:
  - JAX 只在 CPU 上存权重
  - JAX 要求显式传递状态——权重是函数参数，不是可变对象属性
  - JAX 不支持可训练权重
  - JAX 和 PyTorch 处理状态完全一样
correct: 1
explanation: 在 PyTorch 中，权重存在 nn.Module 对象内部，被原地修改。在 JAX 中，权重作为函数参数显式传入，作为新值返回。没有修改，没有隐藏状态。
:::

:::quiz
question: 什么时候应该选 JAX 而不是 PyTorch？
options:
  - 快速原型开发小模型时
  - 在 TPU 集群上超大规模训练时，编译和函数式变换能带来显著加速
  - 需要最大的预训练模型生态时
  - 在移动设备上部署时
correct: 1
explanation: JAX 在大规模场景表现卓越：jit 编译消除 Python 开销，pmap 天然处理多设备并行，XLA 对整个计算图的优化在 TPU 集群上带来显著加速。
:::

---
title: "线性回归、逻辑回归与优化"
chapter: 2
readTime: 45
description: "从线性模型到分类器——梯度下降法、Sigmoid、交叉熵损失、Softmax 多分类、过拟合与正则化"
---

## 线性回归

### 问题定义

给定 $N$ 个样本 $\{(\boldsymbol{x}_i, y_i)\}_{i=1}^N$，其中 $\boldsymbol{x}_i \in \mathbb{R}^d$ 是特征向量，$y_i \in \mathbb{R}$ 是连续目标值。

**目标**：找到一个线性函数，使得 $f(\boldsymbol{x})$ 尽可能接近 $y$。

### 模型（假设类）

$$\hat{y} = f(\boldsymbol{x}; \boldsymbol{w}, b) = w_1 x_1 + w_2 x_2 + \cdots + w_d x_d + b = \boldsymbol{w}^T\boldsymbol{x} + b$$

**简化记号**：将偏置 $b$ 吸收进权重向量——令 $\boldsymbol{x} \leftarrow [1, x_1, \ldots, x_d]^T$，$\boldsymbol{w} \leftarrow [b, w_1, \ldots, w_d]^T$，则：

$$\hat{y} = \boldsymbol{w}^T\boldsymbol{x}$$

### 损失函数：均方误差（MSE）

衡量"预测值和真实值差多少"：

$$J(\boldsymbol{w}) = \frac{1}{2N}\sum_{i=1}^N (y_i - \boldsymbol{w}^T\boldsymbol{x}_i)^2$$

前面的 $\frac{1}{2}$ 是为了求导后消去系数，方便计算。

**矩阵形式**：设 $\boldsymbol{X} \in \mathbb{R}^{N \times (d+1)}$ 每行一个样本，$\boldsymbol{y} \in \mathbb{R}^N$：

$$J(\boldsymbol{w}) = \frac{1}{2N}(\boldsymbol{y} - \boldsymbol{X}\boldsymbol{w})^T(\boldsymbol{y} - \boldsymbol{X}\boldsymbol{w}) = \frac{1}{2N}\|\boldsymbol{y} - \boldsymbol{X}\boldsymbol{w}\|_2^2$$

### 解析解（Normal Equation）

对 $J(\boldsymbol{w})$ 求梯度：

$$\nabla_{\boldsymbol{w}} J = \frac{1}{N}\boldsymbol{X}^T(\boldsymbol{X}\boldsymbol{w} - \boldsymbol{y})$$

令梯度为零：$\boldsymbol{X}^T\boldsymbol{X}\boldsymbol{w} = \boldsymbol{X}^T\boldsymbol{y}$

若 $\boldsymbol{X}^T\boldsymbol{X}$ 可逆，解析解为：

$$\boldsymbol{w}^* = (\boldsymbol{X}^T\boldsymbol{X})^{-1}\boldsymbol{X}^T\boldsymbol{y}$$

**局限性**：
- 计算 $(\boldsymbol{X}^T\boldsymbol{X})^{-1}$ 的时间复杂度是 $O(d^3)$，当 $d$ 很大（如几万维）时不可行
- 只适用于线性模型和平方损失
- 非线性模型（如神经网络）没有解析解

所以实际中几乎都用迭代优化方法。

---

## 梯度下降法

### 核心思想

梯度指向函数值增长最快的方向。沿**负梯度方向**走一小步，函数值就会下降。反复执行直到收敛。

### 更新规则

$$\boldsymbol{w}_{t+1} = \boldsymbol{w}_t - \eta \nabla_{\boldsymbol{w}} J(\boldsymbol{w}_t)$$

$\eta > 0$ 是**学习率（learning rate）**，控制每步走多远。

### 对线性回归的梯度

$$\nabla_{\boldsymbol{w}} J = \frac{1}{N}\sum_{i=1}^N (\boldsymbol{w}^T\boldsymbol{x}_i - y_i)\boldsymbol{x}_i$$

直觉：梯度等于"预测误差 × 对应特征"的平均。误差越大，对应方向的调整越大。

### 学习率的影响

这是最核心的超参数之一。理解它的影响至关重要。

**太小**（如 $\eta = 0.001$）：每步走一丁点，虽然方向对但到达目标要迭代非常多次，效率极低。

**适中**（如 $\eta = 0.1$ 或 $0.3$）：稳步下降，几十步即可接近最优解。

**太大**（如 $\eta = 0.8$ 或 $1.0$）：步子太大，越过最优解跳到另一边，在最优解两侧来回震荡。更极端时甚至**发散**（每步越来越远）。

### 完整手算示例

$f(x) = (x-1)^2 = x^2 - 2x + 1$，导数 $f'(x) = 2x - 2$，最优解 $x^* = 1$。

**情形 1：$\eta = 0.1$，$x_0 = 0$**

| 步 | $x_t$ | $f'(x_t) = 2x_t - 2$ | $x_{t+1} = x_t - 0.1 \cdot f'$ |
|----|--------|----------------------|-------------------------------|
| 0 | 0 | $-2$ | $0 + 0.2 = 0.2$ |
| 1 | 0.2 | $-1.6$ | $0.2 + 0.16 = 0.36$ |
| 2 | 0.36 | $-1.28$ | $0.36 + 0.128 = 0.488$ |
| 3 | 0.488 | $-1.024$ | $0.488 + 0.1024 = 0.5904$ |

每步都朝 $x^* = 1$ 稳步前进，但速度比较慢——4 步后才走到 0.59。

**情形 2：$\eta = 0.3$，$x_0 = 0.5$**

| 步 | $x_t$ | $f'(x_t)$ | $x_{t+1}$ |
|----|--------|-----------|-----------|
| 0 | 0.5 | $-1$ | $0.5 + 0.3 = 0.8$ |
| 1 | 0.8 | $-0.4$ | $0.8 + 0.12 = 0.92$ |
| 2 | 0.92 | $-0.16$ | $0.92 + 0.048 = 0.968$ |
| 3 | 0.968 | $-0.064$ | $0.968 + 0.0192 = 0.9872$ |

非常快地逼近 $x^* = 1$，4 步后已经到 0.987。

**情形 3：$\eta = 0.8$，$x_0 = 0.5$**

| 步 | $x_t$ | $f'(x_t)$ | $x_{t+1}$ |
|----|--------|-----------|-----------|
| 0 | 0.5 | $-1$ | $0.5 + 0.8 = 1.3$ |
| 1 | 1.3 | $0.6$ | $1.3 - 0.48 = 0.82$ |
| 2 | 0.82 | $-0.36$ | $0.82 + 0.288 = 1.108$ |
| 3 | 1.108 | $0.216$ | $1.108 - 0.173 = 0.935$ |

在 $x^* = 1$ 两侧来回震荡（1.3 → 0.82 → 1.108 → 0.935），虽然还在收敛但非常不稳定。

### 三种梯度下降变体

**批量梯度下降（Batch GD）**：每次使用**全部** $N$ 个样本计算梯度。
- 优点：方向最准确
- 缺点：$N$ 很大时每步计算代价高，且内存放不下

**随机梯度下降（Stochastic GD, SGD）**：每次只用 **1 个**随机样本。
$$\boldsymbol{w}_{t+1} = \boldsymbol{w}_t - \eta \cdot (\boldsymbol{w}_t^T\boldsymbol{x}_i - y_i)\boldsymbol{x}_i$$
- 优点：每步极快
- 缺点：梯度方向噪声大，收敛路径锯齿状

**小批量梯度下降（Mini-batch SGD）**：每次用 $B$ 个样本（如 $B=32, 64, 128$）。
$$\boldsymbol{w}_{t+1} = \boldsymbol{w}_t - \frac{\eta}{B}\sum_{j \in \mathcal{B}}(\boldsymbol{w}_t^T\boldsymbol{x}_j - y_j)\boldsymbol{x}_j$$
- 实际中最常用，平衡了准确性和效率
- 可以利用 GPU 并行计算

### 相关术语

- **Batch Size ($B$)**：每次更新用的样本数
- **Epoch**：所有训练样本被用过一遍。$N$ 个样本、batch size $B$ → 每个 epoch 有 $\lceil N/B \rceil$ 次更新
- **Iteration / Step**：一次参数更新

---

## Sigmoid 函数

### 为什么需要 Sigmoid

线性回归输出 $z = \boldsymbol{w}^T\boldsymbol{x} \in (-\infty, +\infty)$。但分类问题需要输出概率（$\in [0,1]$）。我们需要一个函数把 $(-\infty, +\infty)$ 压缩到 $(0, 1)$。

Sigmoid 不是随便选的——它是 Logistic 分布的累积分布函数（CDF），具有严格的概率论基础。

### 定义

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

### 关键性质

1. **值域** $(0, 1)$：可直接解释为概率
2. **单调递增**：输入越大，概率越高
3. $\sigma(0) = 0.5$：决策分界点
4. **对称性**：$\sigma(-z) = 1 - \sigma(z)$
5. $\lim_{z \to +\infty}\sigma(z) = 1$，$\lim_{z \to -\infty}\sigma(z) = 0$

### 导数（极其重要）

$$\sigma'(z) = \sigma(z)(1 - \sigma(z))$$

**推导过程**：

$$\sigma'(z) = \frac{d}{dz}\left(\frac{1}{1+e^{-z}}\right) = \frac{e^{-z}}{(1+e^{-z})^2}$$

注意到 $1 - \sigma(z) = \frac{e^{-z}}{1+e^{-z}}$，所以：

$$\sigma'(z) = \frac{1}{1+e^{-z}} \cdot \frac{e^{-z}}{1+e^{-z}} = \sigma(z) \cdot (1-\sigma(z))$$

**意义**：Sigmoid 的导数只需要其函数值就能算出来，不需要重新算指数——这在反向传播中极其高效。

**导数的最大值**：$\sigma'(z)_{\max} = \sigma(0)(1-\sigma(0)) = 0.5 \times 0.5 = 0.25$

这意味着梯度最大只有 0.25，深层网络中连乘会导致梯度消失——这是后来 ReLU 取代 Sigmoid 的原因。

### 对数 Sigmoid 的导数

在推导交叉熵梯度时需要：

$$\frac{d}{dz}\ln\sigma(z) = \frac{\sigma'(z)}{\sigma(z)} = \frac{\sigma(z)(1-\sigma(z))}{\sigma(z)} = 1 - \sigma(z)$$

$$\frac{d}{dz}\ln(1-\sigma(z)) = \frac{-\sigma'(z)}{1-\sigma(z)} = \frac{-\sigma(z)(1-\sigma(z))}{1-\sigma(z)} = -\sigma(z)$$

---

## 逻辑回归

### 模型

将 Sigmoid 作用在线性输出上，得到正类概率：

$$P(y=1|\boldsymbol{x}; \boldsymbol{w}) = \sigma(\boldsymbol{w}^T\boldsymbol{x}) = \frac{1}{1 + e^{-\boldsymbol{w}^T\boldsymbol{x}}}$$

$$P(y=0|\boldsymbol{x}; \boldsymbol{w}) = 1 - \sigma(\boldsymbol{w}^T\boldsymbol{x})$$

### 决策边界

分类的判定：若 $P(y=1|\boldsymbol{x}) > 0.5$，预测为正类；否则为负类。

$P = 0.5$ 对应 $\sigma(\boldsymbol{w}^T\boldsymbol{x}) = 0.5$，即 $\boldsymbol{w}^T\boldsymbol{x} = 0$。

这是一个**超平面**。二维情况下就是一条直线 $w_1 x_1 + w_2 x_2 + b = 0$。

**关于参数缩放的重要观察**：

设 $\boldsymbol{w} = [1, 1, 1]^T$，$\boldsymbol{w}' = [3, 3, 3]^T$。

- 决策边界相同：$x_1 + x_2 + 1 = 0$ 和 $3x_1 + 3x_2 + 3 = 0$ 是同一条线
- 但输出概率不同：当 $\boldsymbol{x} = [1, 1]^T$ 时
  - $\sigma(1+1+1) = \sigma(3) \approx 0.953$
  - $\sigma(3+3+3) = \sigma(9) \approx 0.9999$
- 参数越大，模型越"自信"（概率越接近 0 或 1）

### 损失函数：交叉熵

**为什么不用 MSE？**
- MSE + Sigmoid 会形成非凸优化问题（存在坏的局部最优）
- 数学上不优雅——正确的做法是从 MLE 出发

**从 MLE 推导**：

单个样本的对数似然：
$$\ln P(y_i|\boldsymbol{x}_i) = y_i\ln\sigma(\boldsymbol{w}^T\boldsymbol{x}_i) + (1-y_i)\ln(1-\sigma(\boldsymbol{w}^T\boldsymbol{x}_i))$$

所有样本的负对数似然（即损失函数）：

$$J(\boldsymbol{w}) = -\frac{1}{N}\sum_{i=1}^N\left[y_i\ln\hat{y}_i + (1-y_i)\ln(1-\hat{y}_i)\right]$$

其中 $\hat{y}_i = \sigma(\boldsymbol{w}^T\boldsymbol{x}_i)$。这就是**二元交叉熵损失（Binary Cross-Entropy, BCE）**。

**直觉理解**：
- 若真实 $y_i = 1$：损失 = $-\ln\hat{y}_i$。$\hat{y}_i$ 越接近 1，损失越小
- 若真实 $y_i = 0$：损失 = $-\ln(1-\hat{y}_i)$。$\hat{y}_i$ 越接近 0，损失越小
- 预测错得越离谱（如 $y=1$ 但 $\hat{y}=0.01$），$-\ln(0.01) = 4.6$ 损失极大

### 梯度推导

$$\frac{\partial J}{\partial \boldsymbol{w}} = -\frac{1}{N}\sum_{i=1}^N\left[y_i(1-\sigma_i) - (1-y_i)\sigma_i\right]\boldsymbol{x}_i$$

展开：$y_i - y_i\sigma_i - \sigma_i + y_i\sigma_i = y_i - \sigma_i$

$$\frac{\partial J}{\partial \boldsymbol{w}} = \frac{1}{N}\sum_{i=1}^N(\sigma_i - y_i)\boldsymbol{x}_i$$

**最终形式极其简洁**：梯度 = "预测概率 - 真实标签" × 特征向量的平均。

这和线性回归的梯度形式几乎一样！只是把预测值 $\hat{y}$ 换成了 $\sigma(\boldsymbol{w}^T\boldsymbol{x})$。

---

## Softmax 与多分类

### 从二分类推广

二分类：一个输出 + Sigmoid → 概率
多分类（$K$ 类）：$K$ 个输出 + Softmax → $K$ 个概率

### Softmax 函数定义

给定 $K$ 个原始分数（logits）$z_1, z_2, \ldots, z_K$：

$$\text{softmax}(z_k) = \frac{e^{z_k}}{\sum_{j=1}^K e^{z_j}}, \quad k = 1, 2, \ldots, K$$

**性质**：
- 每个输出 $\in (0, 1)$
- 所有输出之和 = 1（构成合法概率分布）
- 保序：$z_i > z_j \Rightarrow \text{softmax}(z_i) > \text{softmax}(z_j)$
- 对所有 $z_k$ 加同一常数不改变结果（平移不变性）

### Softmax 与 Sigmoid 的关系

当 $K = 2$ 时：
$$\text{softmax}(z_1) = \frac{e^{z_1}}{e^{z_1} + e^{z_2}} = \frac{1}{1 + e^{-(z_1-z_2)}} = \sigma(z_1 - z_2)$$

所以 Sigmoid 是 Softmax 在二分类情况下的特例。

### 多分类交叉熵损失

$$J = -\frac{1}{N}\sum_{i=1}^N\sum_{k=1}^K y_{ik}\ln\hat{y}_{ik}$$

其中 $y_{ik}$ 是 one-hot 编码（真实类别对应位为 1，其余为 0），$\hat{y}_{ik} = \text{softmax}(z_{ik})$。

由于 one-hot 中只有一个 1，实际上等价于：
$$J = -\frac{1}{N}\sum_{i=1}^N \ln\hat{y}_{i, c_i}$$

其中 $c_i$ 是第 $i$ 个样本的真实类别。

### Log-Softmax 的梯度

$$\frac{\partial}{\partial z_j}\ln\text{softmax}(z_k) = \delta_{jk} - \text{softmax}(z_j)$$

其中 $\delta_{jk}$ 是 Kronecker delta。梯度形式同样简洁：预测概率 - one-hot 真实标签。

---

## 过拟合与正则化

### 泛化能力

**泛化（Generalization）**：模型对**未见过**的新数据的预测能力。这是机器学习的终极目标。

### 过拟合 vs 欠拟合

**过拟合（Overfitting）**：
- 表现：训练误差极低，测试误差很高
- 原因：模型太复杂，把训练数据中的噪声和巧合也学进去了
- 类比：一个学生把答案背了，考试换题就不会了

**欠拟合（Underfitting）**：
- 表现：训练误差和测试误差都很高
- 原因：模型太简单，连数据中的基本规律都没学到
- 类比：一个学生连课本都没看懂

**判断方法**：比较训练误差和测试误差的差距（gap）。

### 正则化（Regularization）

**思想**：在损失函数中增加惩罚项，限制模型复杂度，让模型不能"过度拟合"训练数据。

$$J_{\text{reg}}(\boldsymbol{w}) = J(\boldsymbol{w}) + \lambda\Omega(\boldsymbol{w})$$

$\lambda > 0$ 是正则化强度——越大，对复杂度的惩罚越重，模型越简单。

### L2 正则化（Ridge / Weight Decay）

$$\Omega(\boldsymbol{w}) = \|\boldsymbol{w}\|_2^2 = \sum_{j=1}^d w_j^2$$

**效果**：
- 所有权重都被"往零的方向拉"，但通常不会精确为零
- 对大权重惩罚更重（平方项）
- 使解更平滑

**梯度**：$\nabla_{\boldsymbol{w}}\Omega = 2\boldsymbol{w}$

带 L2 正则化的更新规则：
$$\boldsymbol{w} \leftarrow \boldsymbol{w} - \eta(\nabla J + 2\lambda\boldsymbol{w}) = (1 - 2\eta\lambda)\boldsymbol{w} - \eta\nabla J$$

每次更新时权重先乘以小于 1 的系数——所以也叫"权重衰减（Weight Decay）"。

**贝叶斯视角**：L2 正则化等价于给参数加了高斯先验 $\boldsymbol{w} \sim \mathcal{N}(0, \frac{1}{2\lambda}\boldsymbol{I})$。

### L1 正则化（Lasso）

$$\Omega(\boldsymbol{w}) = \|\boldsymbol{w}\|_1 = \sum_{j=1}^d |w_j|$$

**效果**：
- 能产生**稀疏解**——很多 $w_j$ 精确变为零
- 自动进行特征选择（零权重对应的特征被丢弃）

**为什么 L1 能产生稀疏解？** 几何直觉：L1 约束区域是菱形（在二维是正方形旋转 45°），其顶点在坐标轴上。等值线与约束区域相切时，切点很可能恰好落在顶点（即某些坐标为零）。

**贝叶斯视角**：L1 正则化等价于 Laplace 先验。

### L1 vs L2 完整对比

| 性质 | L1 (Lasso) | L2 (Ridge) |
|------|------------|------------|
| 惩罚形式 | $\sum\|w_j\|$ | $\sum w_j^2$ |
| 稀疏性 | ✓ 很多权重为零 | ✗ 权重缩小但不为零 |
| 特征选择 | ✓ 自动剔除 | ✗ 保留全部 |
| 对异常值 | 相对敏感 | 更鲁棒 |
| 解的唯一性 | 可能不唯一 | 唯一 |
| 约束几何 | 菱形 | 圆（球） |
| 贝叶斯先验 | Laplace 分布 | 高斯分布 |
| 求解 | 不可微（$w=0$ 处），需次梯度 | 处处可微，好优化 |

### 预防过拟合的其他方法

1. **增加训练数据**：更多数据 → 模型更难记住噪声
2. **降低模型复杂度**：更少参数、更浅网络
3. **Dropout**：训练时随机丢弃神经元（后面章节详述）
4. **Early Stopping**：当验证集误差开始上升时停止训练
5. **数据增强**：通过变换制造更多训练数据（翻转、裁剪、加噪声）


---

## 补充：MLE 与交叉熵的联系

### 为什么最小化交叉熵 = 最大化似然

这个联系值得独立阐述，因为它是整个损失函数设计的核心逻辑。

**信息论视角**：给定真实分布 $p$ 和模型分布 $q$，交叉熵定义为：

$$H(p, q) = -\sum_x p(x)\ln q(x)$$

当 $p$ 是 one-hot（单个正确类别概率为 1）时：$H(p, q) = -\ln q(\text{正确类别})$

这恰好等于**负对数似然**。

**统一视角**：
$$\text{最大化似然} \iff \text{最大化对数似然} \iff \text{最小化负对数似然} \iff \text{最小化交叉熵}$$

所以 MLE 和最小化交叉熵本质上是同一件事，只是从不同角度描述。

### 线性回归 MSE 的 MLE 解释

假设 $y = \boldsymbol{w}^T\boldsymbol{x} + \epsilon$，噪声 $\epsilon \sim \mathcal{N}(0, \sigma^2)$。

则 $y | \boldsymbol{x} \sim \mathcal{N}(\boldsymbol{w}^T\boldsymbol{x}, \sigma^2)$。

对数似然：
$$\ell(\boldsymbol{w}) = \sum_{i=1}^N \ln p(y_i|\boldsymbol{x}_i) = -\frac{N}{2}\ln(2\pi\sigma^2) - \frac{1}{2\sigma^2}\sum_{i=1}^N(y_i - \boldsymbol{w}^T\boldsymbol{x}_i)^2$$

最大化 $\ell$ 等价于最小化 $\sum(y_i - \boldsymbol{w}^T\boldsymbol{x}_i)^2$ = MSE。

**结论**：高斯噪声假设下，MSE 是"正确"的损失函数。

---

## 补充：特征工程

### 特征归一化

不同特征的量纲和范围可能差异巨大。梯度下降在各维度步长相同——如果特征尺度差很多，收敛会很慢（椭圆形等值线，沿短轴震荡）。

**Min-Max 归一化**：
$$x' = \frac{x - x_{\min}}{x_{\max} - x_{\min}} \in [0, 1]$$

**Z-Score 标准化**：
$$x' = \frac{x - \mu}{\sigma}$$

变换后均值 0、标准差 1。

**选择原则**：
- 有明确上下界且分布较均匀 → Min-Max
- 有异常值（极大/极小的个别样本）→ Z-Score 更鲁棒
- 原因：Min-Max 受极值影响严重（一个极大值会把其他所有点压到接近 0）

### 齐次坐标与仿射变换

将 $n$ 维向量扩展为 $n+1$ 维（最后加一个 1），可以用矩阵乘法统一表示平移、旋转、缩放。

二维平面的点 $(x_1, x_2)$ 用齐次坐标表示为 $\boldsymbol{v} = [x_1, x_2, 1]^T$。

变换矩阵：
$$\boldsymbol{T} = \begin{pmatrix} 1 & 0 & a \\ 0 & 1 & b \\ 0 & 0 & 1 \end{pmatrix}$$

则 $\boldsymbol{T}\boldsymbol{v} = [x_1 + a, x_2 + b, 1]^T$——几何意义是平移 $(a, b)$。

**与机器学习的联系**：逻辑回归中 $\boldsymbol{x} \leftarrow [1, x_1, \ldots, x_d]^T$（加一个 1 吸收偏置）本质上就是齐次坐标的思想。

---

## 本章核心要点

1. **线性回归**：模型 $\hat{y} = \boldsymbol{w}^T\boldsymbol{x}$，损失 MSE，解析解需要矩阵逆
2. **梯度下降**：沿负梯度方向迭代更新，学习率决定收敛行为
3. **SGD / Mini-batch**：用部分样本估计梯度，平衡效率和准确性
4. **Sigmoid**：$\sigma(z) = 1/(1+e^{-z})$，导数 $\sigma'=\sigma(1-\sigma)$，最大 0.25
5. **逻辑回归**：Sigmoid + 线性 → 二分类概率，损失是交叉熵（= 负对数似然）
6. **Softmax**：多分类的概率化，保证和为 1
7. **正则化**：L1 稀疏化特征选择，L2 权重衰减防止过大
8. **MLE 统一视角**：高斯噪声 → MSE，伯努利 → 交叉熵


---

## 补充：梯度下降的几何直觉

### 等值线与梯度的关系

损失函数 $J(\boldsymbol{w})$ 可以画出等值线——相同损失值的参数点连成的曲线。

- **梯度方向**：垂直于等值线，指向函数增长最快的方向
- **负梯度方向**：垂直于等值线，指向下降最快的方向
- **等值线密集**处梯度大（变化快），**稀疏**处梯度小（变化慢）

### 条件数与收敛速度

对于二次函数 $J(\boldsymbol{w}) = \frac{1}{2}\boldsymbol{w}^T\boldsymbol{A}\boldsymbol{w}$，等值线是椭圆。

**条件数** $\kappa = \lambda_{\max}/\lambda_{\min}$（$\boldsymbol{A}$ 的最大与最小特征值之比）：
- $\kappa \approx 1$：等值线接近圆形，梯度下降直奔最优解
- $\kappa \gg 1$：等值线非常狭长，梯度下降走锯齿形路径，收敛极慢

**特征归一化**的本质作用就是让条件数接近 1——等值线变圆。

### 凸函数与全局最优

**凸函数定义**：对任意 $\boldsymbol{x}, \boldsymbol{y}$ 和 $\lambda \in [0,1]$：
$$f(\lambda\boldsymbol{x} + (1-\lambda)\boldsymbol{y}) \le \lambda f(\boldsymbol{x}) + (1-\lambda)f(\boldsymbol{y})$$

**凸函数的关键性质**：任何局部最优都是全局最优。

- 线性回归的 MSE 是凸函数 → 梯度下降一定能找到全局最优
- 逻辑回归的交叉熵也是凸函数 → 同上
- 神经网络的损失函数**不是凸的** → 只能找到局部最优（但实践中局部最优通常够好）

---

## 补充：逻辑回归的决策边界分析

### 分析不同参数的行为

设特征 $\boldsymbol{x} = [1, x_1, x_2]^T$（含截距项），考虑三组参数：

**参数 I**：$\boldsymbol{w} = [1, 1, 1]^T$

- 决策边界：$1 + x_1 + x_2 = 0$，即 $x_1 + x_2 = -1$
- 对 $\boldsymbol{x} = [1, 1]$：$\boldsymbol{w}^T\boldsymbol{x} = 3$，$P(y=1) = \sigma(3) \approx 0.953$

**参数 II**：$\boldsymbol{w} = [0.5, 2, 0.5]^T$

- 决策边界：$0.5 + 2x_1 + 0.5x_2 = 0$，即 $4x_1 + x_2 = -1$（不同的线！）
- 对 $\boldsymbol{x} = [1, 1]$：$\boldsymbol{w}^T\boldsymbol{x} = 3$，$P(y=1) = \sigma(3) \approx 0.953$

**参数 III**：$\boldsymbol{w} = [3, 3, 3]^T$

- 决策边界：$3 + 3x_1 + 3x_2 = 0$，即 $x_1 + x_2 = -1$（和 I 相同！）
- 对 $\boldsymbol{x} = [1, 1]$：$\boldsymbol{w}^T\boldsymbol{x} = 9$，$P(y=1) = \sigma(9) \approx 0.9999$

**关键观察**：
1. I 和 III 决策边界相同（等比例缩放）但 III 更"自信"
2. I 和 II 决策边界不同（不是等比例缩放）
3. 等比例缩放参数不改变分类决策，但改变概率的"锐度"

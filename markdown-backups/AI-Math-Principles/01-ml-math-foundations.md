---
title: "机器学习基础与数学准备"
chapter: 1
readTime: 45
description: "从概率论、随机变量、贝叶斯定理到最大似然估计——一切模型学习的数学地基"
---

## 为什么需要数学

机器学习的本质是：给定数据，找到一个函数，让这个函数能对未见过的数据做出好的预测。

这句话里的每一步都需要数学：
- "给定数据"——数据有噪声，我们需要**概率论**来描述不确定性
- "找到一个函数"——需要**线性代数**来表示和变换高维数据
- "好的预测"——需要**优化理论**来定义什么是"好"并找到最优解

本章从最基础的概率论开始，逐步搭建起整个机器学习的数学语言。如果你对概率论完全没有基础，这一章会从零讲起。

---

## 概率论基础

### 随机试验与样本空间

**随机试验（Random Experiment）**：在相同条件下重复进行时，结果不确定但所有可能结果已知的实验。例如：抛一枚硬币。

**样本空间（Sample Space）$\Omega$**：随机试验所有可能结果的集合。
- 抛硬币：$\Omega = \{\text{正面}, \text{反面}\}$
- 掷骰子：$\Omega = \{1, 2, 3, 4, 5, 6\}$

**事件（Event）**：样本空间的一个子集。例如"掷骰子结果为偶数"就是事件 $A = \{2, 4, 6\}$。

### 概率的定义

概率是一个从事件到 $[0, 1]$ 的函数 $P$，满足三条公理（Kolmogorov 公理）：

1. **非负性**：$P(A) \ge 0$
2. **规范性**：$P(\Omega) = 1$
3. **可加性**：若 $A \cap B = \emptyset$，则 $P(A \cup B) = P(A) + P(B)$

从这三条公理可以推出所有概率计算规则。

### 随机变量

**定义**：随机变量 $X$ 是从样本空间 $\Omega$ 到实数集 $\mathbb{R}$ 的一个映射函数：

$$X: \Omega \to \mathbb{R}$$

它把"抽象的实验结果"变成"具体的数值"，方便我们用数学工具处理。

**例子**：抛两枚硬币，$X$ = "正面朝上的次数"。样本空间是 $\{(正,正), (正,反), (反,正), (反,反)\}$，$X$ 分别取值 $2, 1, 1, 0$。

### 离散随机变量

**定义**：只取有限个或可数无限个值的随机变量。

**概率质量函数（PMF, Probability Mass Function）**：
$$P(X = x) = p(x), \quad \sum_x p(x) = 1$$

它告诉我们每个取值出现的概率。

### 连续随机变量

**定义**：取值充满某个区间的随机变量。对于连续型随机变量，单个点的概率为零（$P(X = x) = 0$），我们用**概率密度函数（PDF）**来描述：

**概率密度函数（PDF, Probability Density Function）**：
$$P(a \le X \le b) = \int_a^b f(x)\,dx$$

性质：
- $f(x) \ge 0$（密度非负）
- $\int_{-\infty}^{\infty} f(x)\,dx = 1$（总概率为 1）

**注意**：$f(x)$ 本身不是概率，它可以大于 1！概率是密度在区间上的积分。

### 期望与方差

**期望（Mean / Expectation）**——随机变量的"平均值"：

离散：$\mathbb{E}[X] = \sum_x x \cdot P(X=x)$

连续：$\mathbb{E}[X] = \int_{-\infty}^{\infty} x \cdot f(x)\,dx$

**期望的线性性**（极其重要，无条件成立）：
$$\mathbb{E}[aX + bY] = a\mathbb{E}[X] + b\mathbb{E}[Y]$$

**方差（Variance）**——衡量随机变量偏离期望的程度：

$$\text{Var}(X) = \mathbb{E}[(X - \mathbb{E}[X])^2] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$$

**标准差**：$\sigma = \sqrt{\text{Var}(X)}$

**方差的性质**：
- $\text{Var}(aX) = a^2 \text{Var}(X)$
- 若 $X, Y$ 独立：$\text{Var}(X+Y) = \text{Var}(X) + \text{Var}(Y)$

### 独立性

两个随机变量 $X, Y$ **独立**当且仅当：
$$P(X=x, Y=y) = P(X=x) \cdot P(Y=y), \quad \forall x, y$$

直觉：知道 $X$ 的值不会给你关于 $Y$ 的任何信息。

独立性意味着：$\mathbb{E}[XY] = \mathbb{E}[X]\mathbb{E}[Y]$

---

## 几个关键的概率分布

### 伯努利分布（Bernoulli Distribution）

最简单的分布——描述一次"成功/失败"试验。

$$X \sim \text{Bernoulli}(\theta)$$

$$P(X=1) = \theta, \quad P(X=0) = 1-\theta$$

统一写法：$P(X=x) = \theta^x(1-\theta)^{1-x}$，$x \in \{0, 1\}$

- 期望：$\mathbb{E}[X] = \theta$
- 方差：$\text{Var}(X) = \theta(1-\theta)$

**现实意义**：硬币正反、邮件是否垃圾、贷款是否违约——任何二值结果。

### 二项分布（Binomial Distribution）

$n$ 次独立伯努利试验中成功的次数。

$$P(X=k) = \binom{n}{k}\theta^k(1-\theta)^{n-k}, \quad k=0,1,\ldots,n$$

### 高斯分布（正态分布，Gaussian / Normal Distribution）

自然界最常见的分布。由中心极限定理保证：大量独立随机因素的叠加效果趋于正态。

$$X \sim \mathcal{N}(\mu, \sigma^2)$$

**概率密度函数**：

$$f(x) = \frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

- $\mu$：均值（分布中心的位置）
- $\sigma^2$：方差（分布的宽度/分散程度）
- $\sigma$：标准差

**标准正态分布**：$\mu = 0, \sigma = 1$ 时，$f(x) = \frac{1}{\sqrt{2\pi}}e^{-x^2/2}$

**为什么重要**：
1. 中心极限定理：大量独立随机变量之和趋于正态
2. 线性回归中假设噪声服从正态分布
3. 参数初始化、正则化都与正态分布密切相关

### Logistic 分布

分布函数（CDF）为：
$$F(x) = \frac{1}{1 + e^{-(x-\mu)/s}}$$

当 $\mu = 0, s = 1$ 时，CDF 就是 **Sigmoid 函数**：$\sigma(x) = \frac{1}{1+e^{-x}}$

这就是逻辑回归的数学来源——Sigmoid 不是凭空选的函数，它是 Logistic 分布的 CDF。

---

## 条件概率与贝叶斯定理

### 条件概率

**定义**：在事件 $B$ 已经发生的前提下，事件 $A$ 发生的概率：

$$P(A|B) = \frac{P(A \cap B)}{P(B)}, \quad P(B) > 0$$

**直觉**：把"已知 $B$ 发生"看作缩小了样本空间，只在 $B$ 的范围内讨论 $A$。

**乘法公式**：$P(A \cap B) = P(A|B) \cdot P(B) = P(B|A) \cdot P(A)$

### 全概率公式

如果事件 $B_1, B_2, \ldots, B_n$ 构成样本空间的一个**划分**（互斥且并为全集），则对任意事件 $A$：

$$P(A) = \sum_{i=1}^n P(A|B_i) \cdot P(B_i)$$

**直觉**：把复杂事件 $A$ 按"通过哪条路径发生"分解，分别算概率再加起来。

### 贝叶斯定理（Bayes' Theorem）

将乘法公式的两个形式联立：

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

用全概率公式展开分母：

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{\sum_{i} P(B|A_i) \cdot P(A_i)}$$

**各项的名称与含义**：

| 项 | 名称 | 含义 |
|----|------|------|
| $P(A)$ | 先验概率（Prior） | 在看到证据 $B$ 之前，我们对 $A$ 的初始信念 |
| $P(B\|A)$ | 似然（Likelihood） | 如果 $A$ 为真，观测到 $B$ 的可能性有多大 |
| $P(A\|B)$ | 后验概率（Posterior） | 看到证据 $B$ 之后，我们对 $A$ 的更新信念 |
| $P(B)$ | 证据/边际似然（Evidence） | 观测到 $B$ 的总概率，起归一化作用 |

**贝叶斯定理的本质**：用新的证据更新我们的信念。

$$\text{后验} = \frac{\text{似然} \times \text{先验}}{\text{证据}}$$

### 详细例题：贷款诈骗识别

一家银行的贷款诈骗识别系统，10000 份贷款中：
- 实际诈骗 100 份（先验概率 $P(\text{诈骗}) = 0.01$）
- 系统对诈骗的检出率 95%（$P(\text{报警}|\text{诈骗}) = 0.95$）
- 系统对非诈骗的误报率 1%（$P(\text{报警}|\text{正常}) = 0.01$）

**问题**：系统报警了，这笔贷款真是诈骗的概率是多少？

**解答**：

设事件 $A$ = 实际诈骗，事件 $B$ = 系统报警。

第一步，列出已知信息：
- $P(A) = 0.01$，$P(\bar{A}) = 0.99$
- $P(B|A) = 0.95$（似然：是诈骗时，被系统抓到的概率）
- $P(B|\bar{A}) = 0.01$（假阳性率）

第二步，用全概率公式算 $P(B)$：
$$P(B) = P(B|A)P(A) + P(B|\bar{A})P(\bar{A}) = 0.95 \times 0.01 + 0.01 \times 0.99 = 0.0095 + 0.0099 = 0.0194$$

第三步，贝叶斯定理：
$$P(A|B) = \frac{P(B|A)P(A)}{P(B)} = \frac{0.95 \times 0.01}{0.0194} = \frac{0.0095}{0.0194} \approx 0.4897$$

**结论**：即使系统报警了，实际是诈骗的概率只有约 49%！这就是"基率谬误"——当先验概率（诈骗率）很低时，即使检测手段很灵敏，阳性结果中仍有大量假阳性。

---

## 似然函数与最大似然估计

### 从"概率"到"似然"——一个视角翻转

**概率**：参数 $\theta$ 已知，计算数据 $x$ 出现的可能性。"硬币正面概率 0.6 时，抛 10 次出现 7 次正面的概率是多少？"

**似然**：数据 $x$ 已观测到，评估不同参数 $\theta$ 的合理性。"观测到 10 次中 7 次正面，正面概率 $\theta$ 最可能是多少？"

数学形式完全一样，只是"谁固定、谁变化"不同：

$$\underbrace{P(x|\theta)}_{\text{概率：}\theta\text{固定，}x\text{变}} = \underbrace{\mathcal{L}(\theta|x)}_{\text{似然：}x\text{固定，}\theta\text{变}}$$

### 似然函数的定义

给定一组独立同分布（i.i.d.）的观测数据 $\mathcal{D} = \{x_1, x_2, \ldots, x_N\}$，**似然函数**是参数 $\theta$ 的函数：

$$\mathcal{L}(\theta) = \mathcal{L}(\theta | \mathcal{D}) = \prod_{i=1}^N p(x_i | \theta)$$

由于各样本独立，联合概率等于各概率之积。

**为什么取对数**：连乘不便计算（数值下溢、求导复杂），取对数将乘法变加法：

$$\ell(\theta) = \ln\mathcal{L}(\theta) = \sum_{i=1}^N \ln p(x_i | \theta)$$

这就是**对数似然函数（Log-Likelihood）**。由于 $\ln$ 是单调递增函数，最大化 $\ell$ 等价于最大化 $\mathcal{L}$。

### 最大似然估计（Maximum Likelihood Estimation, MLE）

**核心思想**：在所有可能的参数中，选择使"观测到的数据出现概率最大"的那个。

$$\hat{\theta}_{\text{MLE}} = \arg\max_\theta \ell(\theta) = \arg\max_\theta \sum_{i=1}^N \ln p(x_i | \theta)$$

**求解方法**：对 $\theta$ 求导，令导数为零，解方程。

### 完整示例：抛硬币的 MLE

**设定**：抛硬币 $N$ 次，第 $i$ 次结果 $x_i \in \{0, 1\}$（1 为正面），正面概率为 $\theta$。

每次服从伯努利分布：$p(x_i|\theta) = \theta^{x_i}(1-\theta)^{1-x_i}$

**第一步：写出对数似然**

$$\ell(\theta) = \sum_{i=1}^N \ln[\theta^{x_i}(1-\theta)^{1-x_i}] = \sum_{i=1}^N [x_i\ln\theta + (1-x_i)\ln(1-\theta)]$$

设 $k = \sum_{i=1}^N x_i$（正面出现次数），则：

$$\ell(\theta) = k\ln\theta + (N-k)\ln(1-\theta)$$

**第二步：对 $\theta$ 求导**

$$\frac{d\ell}{d\theta} = \frac{k}{\theta} - \frac{N-k}{1-\theta}$$

**第三步：令导数为零**

$$\frac{k}{\theta} = \frac{N-k}{1-\theta}$$

$$k(1-\theta) = (N-k)\theta$$

$$k - k\theta = N\theta - k\theta$$

$$k = N\theta$$

$$\hat{\theta}_{\text{MLE}} = \frac{k}{N} = \frac{\text{正面次数}}{\text{总次数}}$$

**结论**：MLE 告诉我们，最优估计就是正面出现的频率——直觉上非常合理。

**具体数值**：$N=10$，观测 $[1,0,1,1,0,1,1,0,0,1]$，$k=6$，$\hat{\theta} = 0.6$。

### MLE 的几何直觉

对数似然 $\ell(\theta)$ 是 $\theta$ 的函数，画出来是一条曲线。MLE 就是这条曲线的最高点。对于伯努利分布，这条曲线是上凸的（凹函数），所以最高点唯一。

---

## MLE 与损失函数的联系

### 定理：高斯噪声下 MLE = 最小二乘

**设定**：线性回归 $y = \boldsymbol{w}^T\boldsymbol{x} + \epsilon$，噪声 $\epsilon \sim \mathcal{N}(0, \sigma^2)$。

那么 $y | \boldsymbol{x} \sim \mathcal{N}(\boldsymbol{w}^T\boldsymbol{x}, \sigma^2)$，密度为：
$$p(y_i | \boldsymbol{x}_i, \boldsymbol{w}) = \frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{(y_i - \boldsymbol{w}^T\boldsymbol{x}_i)^2}{2\sigma^2}\right)$$

对数似然：
$$\ell(\boldsymbol{w}) = \sum_{i=1}^N \ln p(y_i|\boldsymbol{x}_i, \boldsymbol{w}) = -\frac{N}{2}\ln(2\pi\sigma^2) - \frac{1}{2\sigma^2}\sum_{i=1}^N(y_i - \boldsymbol{w}^T\boldsymbol{x}_i)^2$$

最大化 $\ell(\boldsymbol{w})$ 时，第一项是常数，所以等价于最小化：

$$\sum_{i=1}^N(y_i - \boldsymbol{w}^T\boldsymbol{x}_i)^2$$

这就是**最小二乘法（Least Squares）**。所以平方误差损失不是凭空定义的——它是"假设噪声服从高斯分布"时 MLE 的自然结果。

### 定理：伯努利分布下 MLE = 交叉熵最小化

**设定**：逻辑回归中 $y \in \{0, 1\}$，$P(y=1|\boldsymbol{x}) = \sigma(\boldsymbol{w}^T\boldsymbol{x})$。

对数似然：
$$\ell(\boldsymbol{w}) = \sum_{i=1}^N [y_i\ln\sigma(\boldsymbol{w}^T\boldsymbol{x}_i) + (1-y_i)\ln(1-\sigma(\boldsymbol{w}^T\boldsymbol{x}_i))]$$

最大化对数似然 = 最小化负对数似然 = 最小化**交叉熵损失**。

**总结**：损失函数的选择背后都有概率论的支撑。

---

## 机器学习的基本框架

### 核心术语

**模型 / 假设（Hypothesis）**：从输入到输出的映射 $f: \mathcal{X} \to \mathcal{Y}$，由参数 $\boldsymbol{w}$ 控制。

**假设类（Hypothesis Class）$\mathcal{H}$**：模型能表示的所有函数的集合。例如线性模型的假设类是所有线性函数。

**学习 / 训练**：给定数据，在假设类中找到最优的那个函数。

### 机器学习三要素

| 要素 | 角色 | 举例 |
|------|------|------|
| 假设类 | "搜索空间"——模型能长什么样 | 线性函数、多层神经网络 |
| 损失函数 | "评分标准"——衡量预测有多差 | MSE、交叉熵 |
| 优化算法 | "搜索策略"——怎么找最优参数 | 梯度下降、Adam |

$$\boldsymbol{w}^* = \arg\min_{\boldsymbol{w} \in \mathcal{W}} \frac{1}{N}\sum_{i=1}^N L(y_i, f(\boldsymbol{x}_i; \boldsymbol{w}))$$

### 训练集 vs 测试集

- **训练集**：用来学习参数的数据
- **测试集**：用来评估最终效果的数据，**训练过程中绝不能碰**

为什么要分开？因为我们关心的不是模型对"见过的数据"预测有多好，而是对"没见过的数据"预测有多好——这就是**泛化能力**。

---

## 分类问题的评估指标

### 混淆矩阵

对于二分类问题，模型的预测有四种可能：

|  | 预测为正 | 预测为负 |
|--|----------|----------|
| **实际为正** | TP（真正例：抓对了） | FN（假负例：漏了） |
| **实际为负** | FP（假正例：冤枉了） | TN（真负例：正确放过） |

### 精确率（Precision）

"模型说是正的，有多少真的是正的？"

$$\text{Precision} = \frac{TP}{TP + FP}$$

高 Precision = 低误报率。适用场景：垃圾邮件过滤（宁可放过，不可误杀正常邮件）。

### 召回率（Recall）/ 灵敏度

"所有真正为正的样本，模型抓到了多少？"

$$\text{Recall} = \frac{TP}{TP + FN}$$

高 Recall = 低漏检率。适用场景：癌症筛查（宁可误报，不可漏诊）。

### F1 Score

Precision 和 Recall 的调和平均（兼顾两者）：

$$F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2 \cdot TP}{2 \cdot TP + FP + FN}$$

### 为什么不用准确率（Accuracy）

当正负样本**极度不均衡**时，Accuracy 会误导。例如：1000 个样本中只有 10 个正例，模型全部预测为负，Accuracy = 99%，但完全没用。

### 完整例题

某疾病检测试剂，1000 名志愿者结果如下：

|  | 预测阳性 | 预测阴性 | 合计 |
|--|----------|----------|------|
| 实际患病 | 45 (TP) | 5 (FN) | 50 |
| 实际健康 | 90 (FP) | 860 (TN) | 950 |
| 合计 | 135 | 865 | 1000 |

计算：
- Precision = $45 / (45+90) = 45/135 \approx 33.3\%$
  - 临床意义：报告阳性的 135 人中，只有 1/3 真正患病，假阳性率很高
- Recall = $45 / (45+5) = 45/50 = 90\%$
  - 临床意义：50 个真患者中有 45 个被检出，漏诊率只有 10%

**这种试剂的设计倾向**：宁可多误报，也不能漏诊（高 Recall，牺牲 Precision）。对于致死性疾病，这是正确的取舍。

---

## 线性代数速查

### 向量

**定义**：$\boldsymbol{x} = [x_1, x_2, \ldots, x_n]^T \in \mathbb{R}^n$，是 $n$ 维空间中的一个点或一个方向。

**内积（点积）**：
$$\boldsymbol{a}^T\boldsymbol{b} = \sum_{i=1}^n a_i b_i = |\boldsymbol{a}||\boldsymbol{b}|\cos\theta$$

内积的几何意义：一个向量在另一个方向上的投影长度 × 另一个向量的长度。当两向量正交时内积为零。

**范数（向量长度）**：
- L2 范数：$\|\boldsymbol{x}\|_2 = \sqrt{\sum_i x_i^2}$（欧几里得距离）
- L1 范数：$\|\boldsymbol{x}\|_1 = \sum_i |x_i|$（曼哈顿距离）

### 矩阵

**定义**：$\boldsymbol{A} \in \mathbb{R}^{m \times n}$ 是 $m$ 行 $n$ 列的数表，也可以看作从 $\mathbb{R}^n$ 到 $\mathbb{R}^m$ 的线性变换。

**矩阵乘法**：$\boldsymbol{C} = \boldsymbol{A}\boldsymbol{B}$，$C_{ij} = \sum_k A_{ik}B_{kj}$

- $\boldsymbol{A} \in \mathbb{R}^{m \times n}$，$\boldsymbol{B} \in \mathbb{R}^{n \times p}$ → $\boldsymbol{C} \in \mathbb{R}^{m \times p}$
- 矩阵乘法**不满足交换律**：$\boldsymbol{AB} \ne \boldsymbol{BA}$（一般情况）

**转置的性质**：$(\boldsymbol{AB})^T = \boldsymbol{B}^T\boldsymbol{A}^T$

**对称矩阵**：$\boldsymbol{A} = \boldsymbol{A}^T$

**对角矩阵**：只有对角线上有非零元素

**单位矩阵**：$\boldsymbol{I}$，对角全为 1，$\boldsymbol{AI} = \boldsymbol{IA} = \boldsymbol{A}$

**逆矩阵**：$\boldsymbol{A}^{-1}$ 满足 $\boldsymbol{A}\boldsymbol{A}^{-1} = \boldsymbol{I}$（只有方阵且行列式非零时存在）

### 梯度

**标量对向量的梯度（Gradient）**：设 $f: \mathbb{R}^n \to \mathbb{R}$，梯度是一个向量：

$$\nabla_{\boldsymbol{x}} f = \left[\frac{\partial f}{\partial x_1}, \frac{\partial f}{\partial x_2}, \ldots, \frac{\partial f}{\partial x_n}\right]^T$$

**梯度的几何意义**：指向函数值增长最快的方向，大小等于最大变化率。

**常用梯度**：
- $\nabla_{\boldsymbol{x}}(\boldsymbol{a}^T\boldsymbol{x}) = \boldsymbol{a}$
- $\nabla_{\boldsymbol{x}}(\boldsymbol{x}^T\boldsymbol{A}\boldsymbol{x}) = (\boldsymbol{A} + \boldsymbol{A}^T)\boldsymbol{x}$

---

## 特征工程

### 什么是特征

特征（Feature）是用来描述样本的数值属性。一个样本 $\boldsymbol{x} = [x_1, x_2, \ldots, x_d]^T$ 有 $d$ 个特征。

例如判断贷款是否违约：特征可以是收入、年龄、信用分、负债率等。

### 特征归一化

不同特征的量纲和范围可能差异巨大（收入几万到几百万，年龄 18-80）。不归一化时，范围大的特征会主导梯度方向，训练效率低下。

**Min-Max 归一化**：映射到 $[0, 1]$：
$$x' = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$

- 优点：范围确定
- 缺点：对异常值极度敏感（一个极端值会压缩所有正常值）

**Z-Score 标准化**：映射为均值 0、方差 1：
$$x' = \frac{x - \mu}{\sigma}$$

- 优点：对异常值更鲁棒
- 缺点：不保证范围

**选择依据**：如果特征可能有极端异常值（如收入），用 Z-Score；如果特征范围已知且分布均匀（如像素值 0-255），用 Min-Max。

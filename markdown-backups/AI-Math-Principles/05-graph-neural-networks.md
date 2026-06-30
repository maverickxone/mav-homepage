---
title: "图神经网络"
chapter: 5
readTime: 45
description: "图的数学表示、拉普拉斯矩阵、随机游走、消息传递与邻域聚合、GCN/GAT/GraphSAGE"
---

## 本章导读

前面几章处理的数据都有规则的结构——向量（表格数据）、网格（图像）、序列（文本）。但现实中有大量数据是**图结构**的：社交网络、分子结构、引用网络、知识图谱……

图的核心挑战：节点数量不固定、邻居数量不固定、没有天然的"顺序"——传统的 CNN 和 RNN 都用不了。

图神经网络（GNN）的核心思想：**让每个节点通过"聚合邻居信息"来更新自己的表示**。本章从图的数学基础开始，一步步搭建到 GCN、GAT、GraphSAGE。

---

## 图的数学定义

### 基本定义

**图（Graph）**：一个有序对 $G = (V, E)$

- **节点集（Vertex Set）**：$V = \{v_1, v_2, \ldots, v_n\}$，共 $n$ 个节点
- **边集（Edge Set）**：$E \subseteq V \times V$，连接节点对的集合

**无向图**：边没有方向。若 $(v_i, v_j) \in E$，则 $(v_j, v_i) \in E$。

**有向图**：边有方向。$(v_i, v_j)$ 和 $(v_j, v_i)$ 是两条不同的边。

**邻居（Neighbors）**：节点 $v$ 直接连接的所有节点构成其邻居集：
$$\mathcal{N}(v) = \{u \in V \mid (v, u) \in E\}$$

**度（Degree）**：节点 $v$ 的度数是它的边数：$\deg(v) = |\mathcal{N}(v)|$

### 图的存储方式

**邻接表**：对每个节点存储一个链表，记录它的所有邻居。空间 $O(|V| + |E|)$。

**邻接矩阵**：一个 $n \times n$ 的矩阵。空间 $O(n^2)$，适合稠密图或需要矩阵运算的场景。

---

## 邻接矩阵（Adjacency Matrix）

### 定义

给定图 $G = (V, E)$，$|V| = n$，邻接矩阵 $\boldsymbol{A} \in \{0, 1\}^{n \times n}$：

$$A_{ij} = \begin{cases} 1, & (v_i, v_j) \in E \\ 0, & \text{otherwise} \end{cases}$$

**性质**：
- 对于无向图：$\boldsymbol{A}$ 是对称的，$A_{ij} = A_{ji}$
- 对角线为 0（无自环时）：$A_{ii} = 0$
- 第 $i$ 行的和 = 节点 $i$ 的度数：$\sum_j A_{ij} = \deg(v_i)$

### 示例

考虑以下 4 节点的无向图：

```
  1 --- 2
  |   / |
  |  /  |
  3     4
```

边集：$\{(1,2), (1,3), (2,3), (2,4)\}$

邻接矩阵：
$$\boldsymbol{A} = \begin{pmatrix} 0 & 1 & 1 & 0 \\ 1 & 0 & 1 & 1 \\ 1 & 1 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{pmatrix}$$

验证：
- 节点 1 的邻居是 2、3 → 第 1 行中 $A_{12}=1, A_{13}=1$，度数为 2 ✓
- 节点 2 的邻居是 1、3、4 → 第 2 行中 $A_{21}=A_{23}=A_{24}=1$，度数为 3 ✓
- 节点 4 只连接 2 → 度数为 1 ✓

### 邻接矩阵的代数含义

$\boldsymbol{A}^k$ 的第 $(i,j)$ 元素 = 从节点 $i$ 到节点 $j$ 经过恰好 $k$ 步的路径数。

例如 $\boldsymbol{A}^2$ 的对角线 = 各节点的度数（走两步回到自己 = 选一条边出去再回来）。

---

## 度矩阵（Degree Matrix）

### 定义

度矩阵 $\boldsymbol{D} \in \mathbb{R}^{n \times n}$ 是对角矩阵：

$$D_{ii} = \deg(v_i) = \sum_{j=1}^n A_{ij}$$

非对角元素全为 0。

### 示例

对于上面的图：

$$\boldsymbol{D} = \begin{pmatrix} 2 & 0 & 0 & 0 \\ 0 & 3 & 0 & 0 \\ 0 & 0 & 2 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

### 度矩阵的逆

$$\boldsymbol{D}^{-1} = \begin{pmatrix} 1/2 & 0 & 0 & 0 \\ 0 & 1/3 & 0 & 0 \\ 0 & 0 & 1/2 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

$\boldsymbol{D}^{-1}\boldsymbol{A}$ 的第 $(i,j)$ 元素 = $A_{ij}/\deg(v_i)$，即从节点 $i$ 等概率走到某个邻居 $j$ 的概率。

---

## 拉普拉斯矩阵（Laplacian Matrix）

### 定义

$$\boldsymbol{L} = \boldsymbol{D} - \boldsymbol{A}$$

### 显式形式

$$L_{ij} = \begin{cases} \deg(v_i), & i = j \\ -1, & (v_i, v_j) \in E \\ 0, & \text{otherwise} \end{cases}$$

### 示例

$$\boldsymbol{L} = \boldsymbol{D} - \boldsymbol{A} = \begin{pmatrix} 2 & -1 & -1 & 0 \\ -1 & 3 & -1 & -1 \\ -1 & -1 & 2 & 0 \\ 0 & -1 & 0 & 1 \end{pmatrix}$$

### 性质

1. **对称半正定**：所有特征值 $\ge 0$
2. **每行和为零**：$\sum_j L_{ij} = D_{ii} - \sum_j A_{ij} = 0$
3. **最小特征值为 0**：对应的特征向量是全 1 向量 $\boldsymbol{1}$
4. **零特征值的重数 = 图的连通分量数**
5. **二次型意义**：$\boldsymbol{x}^T\boldsymbol{L}\boldsymbol{x} = \frac{1}{2}\sum_{(i,j)\in E}(x_i - x_j)^2$
   - 这衡量了信号 $\boldsymbol{x}$ 在图上的"平滑度"——相邻节点差异越大，值越大

### 归一化拉普拉斯矩阵

**对称归一化**：

$$\boldsymbol{L}_{\text{sym}} = \boldsymbol{D}^{-1/2}\boldsymbol{L}\boldsymbol{D}^{-1/2} = \boldsymbol{I} - \boldsymbol{D}^{-1/2}\boldsymbol{A}\boldsymbol{D}^{-1/2}$$

其中 $\boldsymbol{D}^{-1/2}$ 是对角矩阵，每个对角元素取 $-1/2$ 次方：$(D^{-1/2})_{ii} = 1/\sqrt{\deg(v_i)}$

**意义**：将邻接矩阵按两端节点的度数做归一化。度大的节点贡献被压低，避免高度节点主导聚合。

### 手算归一化拉普拉斯

$$\boldsymbol{D}^{-1/2} = \begin{pmatrix} 1/\sqrt{2} & 0 & 0 & 0 \\ 0 & 1/\sqrt{3} & 0 & 0 \\ 0 & 0 & 1/\sqrt{2} & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

$$\boldsymbol{D}^{-1/2}\boldsymbol{A}\boldsymbol{D}^{-1/2} = \text{第 }(i,j)\text{ 元素} = \frac{A_{ij}}{\sqrt{\deg(i)\cdot\deg(j)}}$$

例如位置 $(1,2)$：$\frac{1}{\sqrt{2\cdot3}} = \frac{1}{\sqrt{6}} \approx 0.408$

---

## 随机游走（Random Walk）

### 转移矩阵

**定义**：随机游走转移矩阵 $\boldsymbol{P}$ 描述了从每个节点等概率走到某个邻居的概率：

$$\boldsymbol{P} = \boldsymbol{D}^{-1}\boldsymbol{A}$$

第 $(i,j)$ 个元素 $P_{ij} = A_{ij}/\deg(v_i)$ = 从 $i$ 走到 $j$ 的概率。

**性质**：
- 每行和为 1（行随机矩阵）：$\sum_j P_{ij} = 1$
- 非负：$P_{ij} \ge 0$

### 示例

$$\boldsymbol{P} = \boldsymbol{D}^{-1}\boldsymbol{A} = \begin{pmatrix} 0 & 1/2 & 1/2 & 0 \\ 1/3 & 0 & 1/3 & 1/3 \\ 1/2 & 1/2 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{pmatrix}$$

含义：从节点 1 出发，有 1/2 概率走到 2，1/2 概率走到 3。从节点 4 出发，必然走到 2（唯一邻居）。

### 多步游走

设初始分布 $\boldsymbol{r}_0$（行向量，表示游走者在各节点上的概率），则经过 $t$ 步后的分布：

$$\boldsymbol{r}_t = \boldsymbol{r}_0 \boldsymbol{P}^t$$

**示例**：初始在节点 3，即 $\boldsymbol{r}_0 = [0, 0, 1, 0]$

$$\boldsymbol{r}_1 = \boldsymbol{r}_0 \boldsymbol{P} = [1/2, 1/2, 0, 0]$$

（从节点 3 走一步，等概率到节点 1 或 2）

经过足够多步，概率分布趋于**稳态分布** $\boldsymbol{\pi}$，满足 $\boldsymbol{\pi} = \boldsymbol{\pi}\boldsymbol{P}$。

### 稳态分布与图结构的关系

对于连通无向图，稳态分布为：
$$\pi_i = \frac{\deg(v_i)}{2|E|}$$

**结论**：度数越大的节点，在稳态分布中被访问的概率越高。游走者"倾向于停留在连接多的节点"。

上例中：$2|E| = 8$，所以 $\boldsymbol{\pi} = [2/8, 3/8, 2/8, 1/8] = [0.25, 0.375, 0.25, 0.125]$

---

## 图表征学习

### 任务层级

| 层级 | 目标 | 典型任务 | 示例 |
|------|------|----------|------|
| Node-level | 为每个节点学向量 | 节点分类 | 预测用户是否为机器人 |
| Edge-level | 预测节点对之间的关系 | 链接预测 | 推荐好友 |
| Graph-level | 为整个图学一个向量 | 图分类 | 判断分子是否有毒性 |

### 节点嵌入的目标

学习映射 $f: V \to \mathbb{R}^d$，使得在图中"相似"的节点在嵌入空间中也接近：

$$\text{图中 } u \approx v \implies f(u)^T f(v) \text{ 大}$$

"相似"的定义方式决定了不同的方法——可以是邻居关系、随机游走中的共现频率、结构角色等。

---

## 图神经网络的核心：消息传递

### 核心思想

**一个节点的表示应该由它的邻域决定。**

GNN 的每一层执行两步：
1. **消息（Message）**：收集邻居节点的信息
2. **聚合（Aggregate）**：将邻居信息汇总，和自身信息结合，更新节点表示

经过 $K$ 层之后，每个节点的表示融合了 $K$ 跳邻居的信息。

### 通用公式

**消息聚合**：
$$\boldsymbol{m}_v^{(l)} = \text{AGG}^{(l)}\left(\left\{\boldsymbol{h}_u^{(l-1)} \mid u \in \mathcal{N}(v)\right\}\right)$$

**节点更新**：
$$\boldsymbol{h}_v^{(l)} = \text{UPD}^{(l)}\left(\boldsymbol{h}_v^{(l-1)},\; \boldsymbol{m}_v^{(l)}\right)$$

其中：
- $\boldsymbol{h}_v^{(0)}$ 是节点 $v$ 的初始特征
- $\text{AGG}$：聚合函数——对邻居集合做某种"汇总"（必须是置换不变的，因为邻居无序）
- $\text{UPD}$：更新函数——通常是线性变换 + 非线性激活

### 为什么必须置换不变？

图中节点没有天然顺序。对邻居 $\{u_1, u_2, u_3\}$ 的任何排列都应该得到相同的聚合结果。所以 AGG 必须是**集合函数**（set function）。

常见的置换不变操作：求和 $\sum$、平均 mean、最大值 max、注意力加权 $\sum \alpha_i \boldsymbol{h}_i$。

---

## GCN（Graph Convolutional Network）

### 公式

$$\boldsymbol{H}^{(l+1)} = \sigma\left(\tilde{\boldsymbol{D}}^{-1/2} \tilde{\boldsymbol{A}} \tilde{\boldsymbol{D}}^{-1/2} \boldsymbol{H}^{(l)} \boldsymbol{W}^{(l)}\right)$$

其中：
- $\tilde{\boldsymbol{A}} = \boldsymbol{A} + \boldsymbol{I}$：加了自环的邻接矩阵（让每个节点也聚合自己的信息）
- $\tilde{\boldsymbol{D}}$：$\tilde{\boldsymbol{A}}$ 对应的度矩阵，$\tilde{D}_{ii} = \sum_j \tilde{A}_{ij} = \deg(v_i) + 1$
- $\boldsymbol{H}^{(l)} \in \mathbb{R}^{n \times d_l}$：第 $l$ 层所有节点的特征矩阵
- $\boldsymbol{W}^{(l)} \in \mathbb{R}^{d_l \times d_{l+1}}$：可学习参数

### 逐节点理解

对于单个节点 $v$：

$$\boldsymbol{h}_v^{(l+1)} = \sigma\left(\sum_{u \in \mathcal{N}(v) \cup \{v\}} \frac{1}{\sqrt{\tilde{d}_v \cdot \tilde{d}_u}} \boldsymbol{h}_u^{(l)} \boldsymbol{W}^{(l)}\right)$$

直觉：将邻居（含自己）的特征加权求和，权重由两端节点的度数决定。度越大的节点，每次贡献的权重越小。

### GCN 的特点

- 权重**全局固定**（由图结构决定），不需要学习
- 所有节点**共享参数** $\boldsymbol{W}^{(l)}$（类比 CNN 的参数共享）
- 计算高效：可以用稀疏矩阵乘法实现
- **转导式学习**（transductive）：对固定图有效，新节点加入需要重新训练

---

## GAT（Graph Attention Network）

### 动机

GCN 中邻居的权重完全由图结构决定（度数归一化）。但不同邻居的重要性可能不同——**应该让模型自己学习每个邻居的权重**。

### 注意力系数计算

对节点 $i$ 和它的邻居 $j$：

**Step 1**：线性投影
$$\boldsymbol{z}_i = \boldsymbol{W}\boldsymbol{h}_i, \quad \boldsymbol{z}_j = \boldsymbol{W}\boldsymbol{h}_j$$

**Step 2**：计算注意力打分（拼接 + LeakyReLU）
$$e_{ij} = \text{LeakyReLU}\left(\boldsymbol{a}^T [\boldsymbol{z}_i \| \boldsymbol{z}_j]\right)$$

其中 $\|$ 表示向量拼接，$\boldsymbol{a}$ 是可学习的注意力向量。

**Step 3**：归一化（在邻居间做 softmax）
$$\alpha_{ij} = \text{softmax}_j(e_{ij}) = \frac{\exp(e_{ij})}{\sum_{k \in \mathcal{N}(i)} \exp(e_{ik})}$$

**Step 4**：加权聚合
$$\boldsymbol{h}_i' = \sigma\left(\sum_{j \in \mathcal{N}(i)} \alpha_{ij} \boldsymbol{z}_j\right)$$

### 多头注意力

类似 Transformer，使用 $K$ 个独立的注意力头，结果拼接或取平均：

**拼接**（中间层）：
$$\boldsymbol{h}_i' = \|_{k=1}^K \sigma\left(\sum_{j \in \mathcal{N}(i)} \alpha_{ij}^{(k)} \boldsymbol{W}^{(k)}\boldsymbol{h}_j\right)$$

**平均**（最后一层）：
$$\boldsymbol{h}_i' = \sigma\left(\frac{1}{K}\sum_{k=1}^K \sum_{j \in \mathcal{N}(i)} \alpha_{ij}^{(k)} \boldsymbol{W}^{(k)}\boldsymbol{h}_j\right)$$

### GAT 的特点

- 权重**自适应学习**——不同邻居贡献不同权重
- 不需要知道全图结构（只看局部邻居）
- 注意力系数提供**可解释性**（哪些邻居最重要）
- 计算量比 GCN 大（需要计算注意力分数）

---

## GraphSAGE

### 动机

GCN 和 GAT 都是**转导式（transductive）**的——对固定图训练好后，新节点加入需要重新训练。GraphSAGE 是**归纳式（inductive）**的——可以对未见过的新节点直接生成表示。

### 核心做法

1. **采样**：不使用全部邻居，而是随机采样固定数量的邻居（如 10 个）
2. **聚合**：对采样到的邻居用可选的聚合器
3. **拼接**：将自身特征和聚合结果拼接，再做线性变换

$$\boldsymbol{h}_{\mathcal{N}(v)}^{(l)} = \text{AGGREGATE}^{(l)}\left(\left\{\boldsymbol{h}_u^{(l-1)} \mid u \in \text{SAMPLE}(\mathcal{N}(v), S)\right\}\right)$$

$$\boldsymbol{h}_v^{(l)} = \sigma\left(\boldsymbol{W}^{(l)} \cdot [\boldsymbol{h}_v^{(l-1)} \| \boldsymbol{h}_{\mathcal{N}(v)}^{(l)}]\right)$$

### 聚合器选择

| 聚合器 | 操作 | 特点 |
|--------|------|------|
| Mean | $\frac{1}{|\mathcal{S}|}\sum_{u \in \mathcal{S}} \boldsymbol{h}_u$ | 简单高效 |
| Max | $\max_{u \in \mathcal{S}} \boldsymbol{h}_u$（逐元素） | 捕捉显著特征 |
| LSTM | 将邻居序列输入 LSTM | 表达力强但引入顺序假设 |

### GraphSAGE 的特点

- **归纳式**：学到的是"如何聚合"的函数，对新节点直接可用
- **可扩展**：通过邻居采样控制计算量
- 适合大规模图和动态图

---

## 三者对比

| | GCN | GAT | GraphSAGE |
|---|---|---|---|
| 邻居权重 | 固定（归一化度数） | 学习（注意力） | 固定（均值/最大等） |
| 使用全部邻居 | ✓ | ✓ | ✗（采样固定数量） |
| 归纳/转导 | 转导 | 转导 | **归纳** |
| 处理新节点 | 需重训 | 需重训 | **直接推断** |
| 参数共享方式 | 全图共享 $\boldsymbol{W}$ | 全图共享 $\boldsymbol{W}, \boldsymbol{a}$ | 全图共享 $\boldsymbol{W}$ + 聚合器 |
| 计算复杂度 | 低（稀疏矩阵乘） | 中等 | 可控（采样） |
| 可解释性 | 低 | 高（注意力分数） | 中 |

---

## GNN 与随机游走的深层联系

### 简单均值 GNN = 随机游走

考虑最简的 GNN——只做均值聚合，不加线性变换和非线性：

$$\boldsymbol{h}_v^{(l+1)} = \frac{1}{|\mathcal{N}(v)|}\sum_{u \in \mathcal{N}(v)} \boldsymbol{h}_u^{(l)}$$

矩阵形式：
$$\boldsymbol{H}^{(l+1)} = \boldsymbol{D}^{-1}\boldsymbol{A} \cdot \boldsymbol{H}^{(l)} = \boldsymbol{P} \cdot \boldsymbol{H}^{(l)}$$

这就是随机游走转移矩阵 $\boldsymbol{P}$ 作用在特征矩阵上！

**结论**：一层简单均值 GNN = 一步随机游走。$K$ 层 GNN = $K$ 步随机游走。

### 加入残差连接

$$\boldsymbol{h}_v^{(l+1)} = \frac{1}{2}\boldsymbol{h}_v^{(l)} + \frac{1}{2}\cdot\frac{1}{|\mathcal{N}(v)|}\sum_{u \in \mathcal{N}(v)} \boldsymbol{h}_u^{(l)}$$

矩阵形式：
$$\boldsymbol{H}^{(l+1)} = \frac{1}{2}\boldsymbol{I} \cdot \boldsymbol{H}^{(l)} + \frac{1}{2}\boldsymbol{P} \cdot \boldsymbol{H}^{(l)} = \left(\frac{1}{2}\boldsymbol{I} + \frac{1}{2}\boldsymbol{D}^{-1}\boldsymbol{A}\right)\boldsymbol{H}^{(l)}$$

等价的转移矩阵：$\boldsymbol{P}' = \frac{1}{2}\boldsymbol{I} + \frac{1}{2}\boldsymbol{D}^{-1}\boldsymbol{A}$

直觉：游走者有 1/2 概率留在原地（自环），1/2 概率走到邻居。这让信息扩散更温和，缓解 oversmoothing。

---

## 异构图（Heterogeneous Graph）

### 定义

普通图中所有节点和边都是同一类型。**异构图**中存在多种类型的节点和/或边：

$$G = (V, E, \tau_V, \tau_E)$$

- $\tau_V: V \to \mathcal{T}_V$：节点类型映射
- $\tau_E: E \to \mathcal{T}_E$：边类型映射

### 示例

学术网络：
- 节点类型：作者、论文、期刊
- 边类型：作者-写-论文、论文-发表于-期刊、论文-引用-论文

### 处理方式

对不同类型的关系使用不同的参数：

$$\boldsymbol{h}_v^{(l+1)} = \sigma\left(\sum_{r \in \mathcal{R}} \sum_{u \in \mathcal{N}_r(v)} \frac{1}{|\mathcal{N}_r(v)|}\boldsymbol{W}_r^{(l)}\boldsymbol{h}_u^{(l)}\right)$$

每种关系 $r$ 有独立的权重矩阵 $\boldsymbol{W}_r$。

---

## 过平滑问题（Oversmoothing）

### 现象

随着 GNN 层数增加，所有节点的表示趋于相同——信息过度扩散。

### 原因

每一层都做邻域聚合 = 信息向四周扩散。$K$ 层后每个节点接收了 $K$ 跳范围内所有节点的信息。当 $K$ 足够大时，所有节点都获得了几乎相同的全图信息。

### 缓解方法

- 控制层数（2-3 层通常最优）
- 残差连接
- DropEdge（随机丢边）
- JK-Net（跳跃连接，保留各层信息）


---

## 图卷积的谱域视角（补充理解）

### 图上的"频率"

在传统信号处理中，傅里叶变换将信号分解为不同频率的正弦波。类似地，图拉普拉斯矩阵的**特征向量**构成了图上的"频率基"。

拉普拉斯矩阵的特征分解：$\boldsymbol{L} = \boldsymbol{U}\boldsymbol{\Lambda}\boldsymbol{U}^T$

- $\boldsymbol{U}$：特征向量矩阵（图上的"傅里叶基"）
- $\boldsymbol{\Lambda}$：特征值对角矩阵（对应"频率"——特征值越大，信号在相邻节点间变化越剧烈）

### 图傅里叶变换

信号 $\boldsymbol{x} \in \mathbb{R}^n$ 在图上的傅里叶变换：
$$\hat{\boldsymbol{x}} = \boldsymbol{U}^T \boldsymbol{x}$$

逆变换：$\boldsymbol{x} = \boldsymbol{U}\hat{\boldsymbol{x}}$

### GCN 的谱域解释

GCN 中的 $\tilde{\boldsymbol{D}}^{-1/2}\tilde{\boldsymbol{A}}\tilde{\boldsymbol{D}}^{-1/2}$ 本质上是归一化邻接矩阵——它在谱域中充当**低通滤波器**：
- 保留低频分量（相邻节点值相近 → 平滑信号）
- 抑制高频分量（相邻节点值差异大 → 噪声）

这解释了为什么 GCN 有效——它平滑了节点特征，让邻近节点的表示趋于一致，同类节点更容易被分到一起。

也解释了 oversmoothing——过度的低通滤波让所有信号变成了"直流分量"（全图一个值）。

---

## 完整计算示例：邻接矩阵到 GCN 前向

### 题设

4 节点图，边集 $\{(1,2),(1,3),(2,3),(2,4)\}$。每个节点有 2 维特征：

$$\boldsymbol{H}^{(0)} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \\ 0 & 0 \end{pmatrix}$$

### Step 1：加自环

$$\tilde{\boldsymbol{A}} = \boldsymbol{A} + \boldsymbol{I} = \begin{pmatrix} 1 & 1 & 1 & 0 \\ 1 & 1 & 1 & 1 \\ 1 & 1 & 1 & 0 \\ 0 & 1 & 0 & 1 \end{pmatrix}$$

### Step 2：计算度矩阵

$\tilde{D}_{11} = 3, \tilde{D}_{22} = 4, \tilde{D}_{33} = 3, \tilde{D}_{44} = 2$

$$\tilde{\boldsymbol{D}}^{-1/2} = \text{diag}(1/\sqrt{3}, 1/\sqrt{4}, 1/\sqrt{3}, 1/\sqrt{2})$$

### Step 3：归一化

$$\hat{\boldsymbol{A}} = \tilde{\boldsymbol{D}}^{-1/2}\tilde{\boldsymbol{A}}\tilde{\boldsymbol{D}}^{-1/2}$$

位置 $(1,1)$：$\tilde{A}_{11}/(\sqrt{3}\cdot\sqrt{3}) = 1/3$

位置 $(1,2)$：$\tilde{A}_{12}/(\sqrt{3}\cdot\sqrt{4}) = 1/\sqrt{12} \approx 0.289$

位置 $(2,4)$：$\tilde{A}_{24}/(\sqrt{4}\cdot\sqrt{2}) = 1/\sqrt{8} \approx 0.354$

### Step 4：设简单权重

令 $\boldsymbol{W}^{(0)} = \boldsymbol{I}_{2\times2}$（恒等，简化演示），激活函数 ReLU：

$$\boldsymbol{H}^{(1)} = \text{ReLU}(\hat{\boldsymbol{A}} \cdot \boldsymbol{H}^{(0)} \cdot \boldsymbol{I}) = \text{ReLU}(\hat{\boldsymbol{A}} \cdot \boldsymbol{H}^{(0)})$$

结果：每个节点的新特征 = 它和邻居（含自己）的特征的归一化加权和。节点 4 原本特征为 $(0,0)$，经过聚合后会获得来自节点 2 的信息变为非零值。

这就是 GNN 的力量——**没有特征的节点也能通过邻居获得有意义的表示**。

---

## 本章要点回顾

1. **图的三大矩阵**：邻接矩阵 $\boldsymbol{A}$、度矩阵 $\boldsymbol{D}$、拉普拉斯矩阵 $\boldsymbol{L} = \boldsymbol{D} - \boldsymbol{A}$
2. **随机游走**：$\boldsymbol{P} = \boldsymbol{D}^{-1}\boldsymbol{A}$，稳态分布与度数正相关
3. **GNN 核心**：消息传递 + 邻域聚合，置换不变
4. **GCN**：固定归一化权重，$\tilde{\boldsymbol{D}}^{-1/2}\tilde{\boldsymbol{A}}\tilde{\boldsymbol{D}}^{-1/2}$
5. **GAT**：注意力学习权重，可解释
6. **GraphSAGE**：采样 + 归纳式，可处理新节点
7. **GNN ≈ 多步随机游走**（简化情形下等价）

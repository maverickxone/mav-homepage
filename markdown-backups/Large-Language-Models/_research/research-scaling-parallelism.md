# 调研：Scaling Laws 与分布式训练（事实清单）

> 用途：第二卷《预训练》写作素材。调研日期 2026-07-19。
> 标注约定：〔存疑〕= 未能完全核实或来源冲突；未标注的数字均经搜索核对或来自原始论文。

---

## 1. Scaling laws 精确内容

### Kaplan et al. 2020（OpenAI, "Scaling Laws for Neural Language Models"）
- 核心结论：测试损失（cross-entropy loss）随三个量分别呈幂律下降——非嵌入参数量 N、数据量 D（tokens）、训练计算量 C，且幂律跨越 7 个数量级以上成立。
- 关键指数（论文原值）：L ∝ N^(−0.076)、L ∝ D^(−0.095)、计算最优前沿 L ∝ C^(−0.050)。
- 最优分配结论：固定计算预算下，应把绝大部分预算投入**增大模型**——N_opt ∝ C^0.73，D_opt ∝ C^0.27（即数据只需缓慢增长）。这直接导致 2020–2022 年间 GPT-3（175B / 300B tokens）、Gopher、MT-NLG 530B 等"大模型、少数据"的训练方式。
- 注意：Kaplan 统计的是**非嵌入参数**和非嵌入计算量，这是后来分歧的技术原因之一。

### Chinchilla（Hoffmann et al. 2022, DeepMind, "Training Compute-Optimal Large Language Models"）
- 修正结论：N 和 D 应**等比例**随计算量增长——N_opt ∝ C^0.5，D_opt ∝ C^0.5（论文三种方法给出的指数均约 0.46–0.54）。
- 经验法则：约 **20 tokens / 参数** 为计算最优（例：70B 模型 ↔ ~1.4T tokens）。
- 参数化损失函数（Approach 3 的拟合）：L(N, D) = E + A/N^α + B/D^β，其中 E = 1.69（语言的不可约熵），A = 406.4，α = 0.34，B = 410.7，β = 0.28。
- 对照实验：**Gopher（280B 参数，300B tokens）vs Chinchilla（70B 参数，1.4T tokens）**，两者训练计算量相同（约 5.8×10²³ FLOPs，可用 6ND 验证：6×70e9×1.4e12 ≈ 5.9×10²³）。Chinchilla 全面胜出：MMLU 67.6% vs Gopher 60.0%，且推理成本只有 1/4。
- 结论表述：当时的 GPT-3（175B）、Gopher（280B）、MT-NLG（530B）都是"严重欠训练"（significantly undertrained）。

### 两者分歧的技术原因（后续研究已基本厘清）
- Porian et al. 2024（"Resolving Discrepancies in Compute-Optimal Scaling of Language Models", NeurIPS 2024, arXiv:2406.19146）指出三个因素：
  1. Kaplan 只统计**非嵌入参数/计算**，在小模型上嵌入占比大，使拟合偏斜；
  2. **固定长度的 warmup** 对小模型过长，导致小模型显得低效；
  3. **学习率调度未按训练长度调整**（scale-dependent optimizer tuning）——用为大预算设计的长调度训练小模型会使其欠训练，把"参数指数"人为推高。修正这些后，指数收敛到 Chinchilla 的 ~0.5。
  - 该文还发现：仔细的学习率**衰减**本身并非 Chinchilla 定律成立的必要条件（与 Hoffmann 论文自己的归因略有出入）。
- 另一条线：Pearce & Song 2024（"Reconciling Kaplan and Chinchilla Scaling Laws", arXiv:2406.12907）认为主因是非嵌入 vs 总参数的统计口径 + 小规模外推。
- 写书建议表述：Hoffmann 等人对每个计算预算**单独调了余弦调度长度**（调度恰好覆盖训练 tokens 数），而 Kaplan 用固定调度，这是最常被引用的一条原因；但完整归因是上述多因素。

### Chinchilla 复现争议（Epoch AI 2024）
- Besiroglu et al.（Epoch AI）, "Chinchilla Scaling: A replication attempt"（arXiv:2404.10102, 2024-04）：从 Hoffmann 论文图中重建数据、重新拟合 Approach 3。
- 三个发现：
  1. 原文拟合的参数化模型与数据**拟合很差**；
  2. 原文报告的置信区间**窄得不合理**——要得到那么窄的区间需要约 60 万次实验，而他们实际只训练了不到 500 个模型；
  3. 原文 Approach 3 的拟合常数按闭式最优解算出来约 **70 tokens/参数**，与自家 Approach 1、2 及 Chinchilla 实际采用的 20:1 自相矛盾。
- Epoch 重新拟合后得到的估计与 20 tokens/参数一致——即"20:1 法则本身没错，错的是原论文 Approach 3 的拟合数字"。
- 来源：https://epoch.ai/blog/chinchilla-scaling-a-replication-attempt

---

## 2. 6ND 公式

### 训练 FLOPs ≈ 6·N·D
- N = 参数量，D = 训练 tokens 数。来源：Kaplan et al. 2020 附录的计算量核算，现已成行业标准估算。
- 推导要点：每个 token 经过每个参数，前向传播约 2 FLOPs/参数/token（一次乘、一次加），反向传播约为前向的 2 倍（对激活和对权重各算一次梯度），即 4 FLOPs，合计 **前向 2ND + 反向 4ND = 6ND**。
- 忽略项：attention 的 O(L·d) 项（序列不太长时占比小）、embedding、LayerNorm 等；长上下文时 attention 项不可忽略。
- 若用激活重算（activation checkpointing/recomputation），实际硬件执行的 FLOPs 约为 8ND（多算一次前向），但**模型 FLOPs（用于 MFU 分子）仍按 6ND 计**。

### 推理 FLOPs ≈ 2·N·D
- 只有前向：每 token 约 2N FLOPs（N 为**激活**参数——MoE 场景下用激活参数量）。

### 著名估算例子（可直接用于教学）
- GPT-3：6 × 175e9 × 300e9 ≈ **3.1×10²³ FLOPs**（论文报 3.14×10²³，吻合）。
- Chinchilla/Gopher：≈ 5.8×10²³ FLOPs（见上）。
- Llama 3.1 405B：6 × 405e9 × 15.6e12 ≈ **3.8×10²⁵ FLOPs**（Meta 论文亦报 3.8×10²⁵）。
- GPT-4：外界普遍估计 ~2×10²⁵ FLOPs（Epoch AI 估算，非官方）〔估计值〕。

### MFU（Model FLOPs Utilization）
- 定义（出自 PaLM 论文，Chowdhery et al. 2022）：**实际吞吐对应的模型 FLOPs ÷ 硬件理论峰值 FLOPs**。分子只算模型本身的 6ND（不含重算），因此重算会压低 MFU——它衡量"有效利用率"。
- 经典参考值：PaLM 540B 为 46.2%；Llama 3 405B 在 8K–16K H100 上为 **38–43%（BF16）**（Llama 3 论文 Table 4）。
- 2024–26 年大集群典型范围：
  - **Dense 模型**：约 35–45% 常见，优化好的可到 50%+（NVIDIA 报告 Llama 405B 在 GB300 NVL72 上可达 52–56%）。
  - **MoE 模型**：明显更低，约 **20–35%**。DeepSeek-V3、Llama 4 等 FP8 MoE 训练约 20% 量级；Megatron-LM 优化后的标准 MoE 可 >46%；字节 MegaScale-MoE 在 1440 张 Hopper 上训 352B MoE，MFU 随集群扩大从 ~32% 降到 ~28%。〔MoE 的 MFU 数字口径不一（是否按激活 FLOPs、是否 FP8 峰值），书中给"通常 20–40%，低于 dense"即可〕
  - MFU 低的主因：MoE 的 all-to-all 通信、跨节点通信、流水线气泡、重算。
- 来源：Llama 3 论文（arXiv:2407.21783）、MegaScale-MoE（arXiv:2505.11432）、NVIDIA 技术博客。

---

## 3. 过训练（overtraining）与推理最优

- **Chinchilla 最优 ≠ 总成本最优**。Chinchilla 只优化"给定训练计算量的 loss"，不考虑模型训完要被推理多少次。
- Llama 3 8B 训了 **15T tokens ≈ 1,875 tokens/参数**，约为 Chinchilla 最优（8B ↔ ~160–200B tokens）的 **75–100 倍**。Meta 官方博客明确说：8B 和 70B 在训到 15T tokens 时仍在**对数线性**地改进。
- 设计哲学（源自 Touvron et al. 2023 LLaMA 原论文）：目标不是训练最优（compute-optimal）而是**推理最优（inference-optimal）**——在给定服务规模下最好的模型，不计训练成本。小模型多训 = 用更多训练计算换取同等 loss 下更便宜的推理。
- 理论化：Sardana et al., "Beyond Chinchilla-Optimal: Accounting for Inference in Language Model Scaling Laws"（arXiv:2401.00448）——把预期推理量计入总成本后，最优点系统性地移向"更小模型 + 更多数据"。
- 2025–26 现状：过训练已是行业标准。旗舰 MoE 的 **tokens/激活参数比**：
  - DeepSeek-V3：14.8T tokens / 37B 激活 ≈ **400**；
  - Kimi K2：15.5T tokens / 32B 激活 ≈ **480**；
  - Qwen3-235B-A22B：36T tokens / 22B 激活 ≈ **1,600**；
  - 即普遍为 Chinchilla 20:1 的 **20–80 倍**。（MoE 本身让"总参数大、激活参数小"，等于同时买了容量和便宜推理。）
- 2026 年新视角：测试时计算改变最优点——"Test-Time Scaling Makes Overtraining Compute-Optimal"（arXiv:2604.01411）：若模型部署后大量使用推理时计算，过训练小模型在总账上更划算。〔2026 论文，结论方向可引用，具体数字未核〕

---

## 4. Scaling 的现状之争

### Ilya Sutskever, NeurIPS 2024（2024-12-13，温哥华，Test of Time 奖演讲）
- 原话："**Pre-training as we know it will unquestionably end**"。
- 语境与论据："我们已达到 **peak data**，不会有更多了……计算在增长——更好的硬件、更好的算法、更大的集群——但**数据没有增长，因为我们只有一个互联网**。数据是 AI 的**化石燃料（fossil fuel）**。"
- 他预测的后续方向：agents、合成数据、推理时计算（test-time compute），并类比"就像化石燃料会耗尽一样"。
- 来源：The Verge / Techmeme 2024-12-13 报道。

### 2024 底–2025 的"撞墙"叙事
- 背景：2024 年 11 月起多家媒体（The Information、Bloomberg、Reuters）报道 OpenAI（Orion）、Google、Anthropic 的下一代预训练 run 提升不及预期。
- **GPT-4.5**（2025-02-27 发布，内部代号 Orion）成为标志性事件：OpenAI 迄今最大的预训练模型（官方称计算效率比 GPT-4 高 10 倍以上），但发布反响平淡——比 GPT-4o 提升温和、推理任务不如 o1/o3-mini、定价高出 GPT-4o 15–30 倍。OpenAI 自己在发布材料中称它"不是 frontier model"。后于 2025 年中从 API 下线。
- Epoch AI 分析（"Why GPT-5 used less training compute than GPT-4.5"）：**GPT-5（2025-08）的预训练计算量比 GPT-4.5 更少**——因为 2024 年 9 月后推理模型技术让"约 1/10 的预训练计算 + 强后训练"达到同等性能；自 GPT-4 以来最先进模型的训练计算量增长不到 3×，远低于历史上每代 ~100×。但 Epoch 预测 GPT-6 将重新超过 GPT-4.5 的计算量（后训练红利吃完后，预训练 scaling 会回归）。

### Scaling 转向了哪里（2025–26 共识表述）
1. **推理时计算（test-time compute）**：o1→o3、R1 等，让模型"想得更久"；
2. **RL scaling**：后训练 RL 计算量成为新的 scaling 轴——o1→o3 RL 计算 >10×，Grok-3→Grok-4 类似；已出现后训练计算超过预训练的案例（Cursor Composer 1.5，2025-09，RL 计算扩大 20×）〔单一来源〕；
3. **数据质量**：高质量人类文本接近耗尽（"data wall"），转向合成数据、可验证数据、多轮课程化数据。
- 超大集群仍在建：xAI Colossus 训练 Grok 3 用 **200,000 张 H100**（10 万卡 122 天建成，再 92 天翻倍）；2026-01 Colossus 扩至 ~555,000 GPU、约 2 GW。Google 走 TPU 路线（Gemini 系列，官方未公布规模）。
- **GPT-5.5**（2026 年，内部代号 Spud，约 2026-03 完成预训练）：OpenAI 自 GPT-4.5 以来第一次完整重新预训练的基座模型，为 GB200/GB300 NVL72 协同设计；外界对"是否真是全量重训"存在技术性质疑（未公布新知识截止日期），但长上下文与 agent 能力跃升明显。〔2026 年信息，细节以二手报道为主，引用时留余地〕
- 写书可用的平衡结论：预训练 scaling 没有"死"，而是**边际收益变贵 + 数据受限**，前沿实验室把增量计算优先投向 RL/推理时计算；预训练本身转向数据质量与效率（FP8、MoE、更好的 scaling law 拟合）。

---

## 5. 并行策略机制（概念层）

每种策略回答一个问题："模型/数据装不下或算不动时，把什么切开、付出什么通信代价"。

### 数据并行 DP 与 ZeRO / FSDP
- 朴素 DP：每卡一份完整模型副本，各吃不同数据，反向后 all-reduce 梯度。**解决**：算力不够；**不解决**：单卡放不下模型（每卡显存占用不变）。
- ZeRO（Rajbhandari et al. 2020, DeepSpeed）：把冗余的训练状态**分片**到各 DP 卡上——Stage 1 分片优化器状态，Stage 2 再分片梯度，Stage 3 再分片参数本身（用时 all-gather 临时凑齐）。PyTorch 的 **FSDP** ≈ ZeRO-3。
- 一句话逻辑：DP 的显存冗余（每卡都存一份 Adam 状态）是最大的浪费，ZeRO 用"分片 + 按需通信"消掉它。

### 张量并行 TP（Megatron-LM, Shoeybi et al. 2019）
- 把单个矩阵乘按行/列切到多卡：MLP 第一层按列切、第二层按行切，一对 (f, g) 共轭算子使每层前向只需一次 all-reduce；attention 按头切。
- 每层前后向都要 all-reduce **激活值**，通信频繁且在关键路径上 → 需要极高带宽，**通常限制在单机 8 卡 NVLink 域内**（TP≤8 是行业惯例；NVL72 把这个域扩大到 72）。
- 一句话逻辑：单层权重/激活都放不下或单卡算一层太慢时，把"一个矩阵乘"本身拆开，代价是每层一次高频通信。

### 流水线并行 PP（GPipe / PipeDream / 1F1B）
- 按层切成若干段（stage），各段放不同节点；把 batch 切成 **micro-batch** 依次流过，形成流水线。
- **Bubble（气泡）**：流水线灌满/排空阶段有设备空闲，1F1B 调度下气泡占比 ≈ (p−1)/(m+p−1)（p 段数、m 微批数）→ 增大 m 或用交错调度（interleaved 1F1B）、零气泡调度（ZB-H1）、DualPipe 缓解。
- 通信量小（只在段间传激活边界），可跨节点走 InfiniBand。
- 一句话逻辑：整模型放不进一台机器时按层切开，代价是气泡（空转）而不是带宽。

### 专家并行 EP（MoE 专用）
- 不同专家放不同卡；每个 token 路由到 top-k 专家，需要 **all-to-all** 把 token 发到专家所在卡再收回（前向反向各两次 all-to-all）。
- 一句话逻辑：MoE 总参数巨大但每 token 只用一小部分，把专家摊到多卡；代价是 all-to-all 这种最难优化的集合通信。

### 序列/上下文并行（SP / CP）
- 长上下文训练时**激活值随序列长度线性增长**，单卡装不下 → 把序列维切到多卡。attention 需要跨卡拿到其它分片的 K/V：Ring Attention（环形传递 KV 块）或 all-gather KV（Llama 3 的做法，对 GQA 友好）。Megatron 的"sequence parallelism"另指把 TP 组内 LayerNorm/dropout 的激活也按序列切，两者概念相邻。
- 一句话逻辑：解决的是长序列的**激活显存**问题，不是参数问题。

### 典型组合案例（已核实）
- **Llama 3 405B（Meta, 2024）**：4D 并行 = TP × CP × PP × DP(FSDP)，在 **16,384 张 H100** 上。标准 8K 上下文阶段：**TP=8, CP=1, PP=16, DP=128**（8×1×16×128=16,384）；131K 长上下文阶段：**TP=8, CP=16, PP=16, DP=8**。BF16 MFU 38–43%。并行组按 [TP, CP, PP, DP] 从内到外排布（TP 最内层、带宽要求最高）。来源：The Llama 3 Herd of Models（arXiv:2407.21783）Table 4。
- **DeepSeek-V3（2024-12）**：**2,048 张 H800**，采用 **16-way PP（DualPipe）+ 跨 8 节点的 64-way EP + ZeRO-1 DP**，**不用 TP**（靠 FP8、重算、CPU 卸载 EMA 等显存优化省掉了 TP——H800 的 NVLink 被阉割，避开 TP 是刻意的工程选择）。DualPipe：双向流水线调度，把计算与 EP 的 all-to-all 通信全重叠，气泡少于 1F1B。训练总耗 278.8 万 H800 GPU·小时（约 557.6 万美元，按 $2/GPU·小时计），14.8T tokens。来源：DeepSeek-V3 Technical Report（arXiv:2412.19437）。

---

## 6. 显存账：训练为什么比推理贵

### 每参数字节数（混合精度 + Adam，ZeRO 论文的标准核算）
| 项 | 精度 | 字节/参数 |
|---|---|---|
| 权重（工作副本） | FP16/BF16 | 2 |
| 梯度 | FP16/BF16 | 2 |
| 主权重（master weights） | FP32 | 4 |
| Adam 一阶矩 m | FP32 | 4 |
| Adam 二阶矩 v | FP32 | 4 |
| **合计（模型状态）** | | **16** |

- 常见的"12 字节"说法 = 不单独算 FP32 主权重（或把它并入优化器状态口径不同），教学时给 **12–16 字节/参数** 区间并说明口径即可。FP8 训练（DeepSeek-V3）可再压，但优化器状态仍需高精度。
- 对照：**推理**只需权重 2 字节/参数（FP16）或 1 字节（FP8/INT8）+ KV cache。**训练 ≈ 推理的 8 倍起步**，还没算激活。

### 教学数字例子
- 405B 模型：模型状态 16 × 405e9 ≈ **6.5 TB**——H100（80 GB）需要 **80+ 张卡只为装下训练状态**，一张卡连 1% 都装不下；而推理 FP8 只要 ~405 GB（5 张卡多一点）。
- 8B 模型：16 × 8e9 = 128 GB——**单张 80 GB 卡训不了一个 8B 模型**（不开 ZeRO/卸载时），这个反差适合课堂。

### 激活值显存
- 与 batch × 序列长 × 隐藏维 × 层数成正比，长上下文/大 batch 时可超过模型状态本身。
- **Activation checkpointing（重算）**：只存每层（或每段）边界的激活，反向时重新前向算一遍中间值——用 ~1/3 的额外计算（FLOPs 从 6ND → 8ND）换一个数量级的激活显存。选择性重算（selective recomputation，Megatron 2022）只重算便宜且占显存大的部分（如 attention 内部），代价更小。
- **这就是并行策略存在的根本原因**：训练状态 + 激活远超单卡显存，必须有人分担——ZeRO/FSDP 分担训练状态，TP/PP 分担参数与计算，CP 分担激活。

---

## 7. 互联硬件常识（概念层）

### 量级（记数量级即可）
| 互联 | 每 GPU 带宽量级 | 范围 |
|---|---|---|
| NVLink 4（H100） | 900 GB/s | 机内（8 卡域） |
| NVLink 5（B200/GB200） | 1.8 TB/s | 机架内（NVL72：72 卡域，聚合 130 TB/s） |
| InfiniBand NDR / XDR | 400 / 800 Gb/s ≈ 50 / 100 GB/s 每端口 | 跨节点 |
| RoCE（以太网 RDMA） | 400–800 Gb/s，同量级 | 跨节点（Meta、xAI 用 Ethernet/Spectrum-X） |

- 关键比值：**NVLink 比跨节点网络快约 10–20 倍**，且延迟低一个量级以上。
- 为什么 TP 必须在 NVLink 域内：TP 每层前后向都 all-reduce 激活，通信在关键路径上，跨节点带宽会让 GPU 大部分时间在等数据；DP 的梯度 all-reduce 每步只一次、可与反向重叠，PP 只传段间边界激活，二者都能忍受跨节点带宽 → 经典排布 = TP 最内、PP/DP 在外。
- **GB200 NVL72**：一个液冷机架 = 36 Grace CPU + 72 Blackwell GPU，全部 72 卡在同一 NVLink 域（任意两卡 1.8 TB/s 互访）——把"高带宽域"从 8 卡扩到 72 卡，意味着 TP（或 EP）可以在 72 卡内做，改变并行策略设计空间。
- 2026 年典型训练集群拓扑一句话：**若干 NVL72 机架（域内 NVLink 全互联）+ 机架间 rail-optimized 的 800G InfiniBand/以太网 fat-tree，数万到数十万 GPU，跨数据中心训练开始出现**。〔"跨数据中心训练"以传闻/报道为主，如 OpenAI-Microsoft、Gemini 多园区，官方细节少〕

---

## 8. 预训练评估

### 训练中的信号
- **Loss / 困惑度**：最直接的信号——在留出验证集（及各领域切片：代码、数学、多语言）上的 cross-entropy。困惑度 PPL = exp(loss)。跨 tokenizer 比较时用 bits-per-byte（BPB）而非 PPL。
- **Loss 不等于能力**，因此配合下游基准 few-shot 评测基座模型。

### Scaling law 外推预测（"训之前就知道结果"）
- GPT-4 Technical Report（2023）的著名做法：用**不超过 GPT-4 计算量 1/10,000** 的一系列小模型拟合 L(C) = aC^b + c，在大 run 开始后不久（不用任何中间结果）**准确预测了 GPT-4 的最终 loss**；又用 ≤1/1,000 计算量的模型幂律外推，准确预测了 HumanEval 子集的通过率。
- 这套"先拟合、后下注"的流程已是所有前沿实验室启动大 run 的标准前置（Llama 3 也用 scaling law 先预测 405B 在下游任务的表现来定 N 和 D）。
- 反例教学点：下游任务准确率不总是平滑可预测（涌现/相变争议，Schaeffer et al. 2023 认为多为度量方式的伪影）。

### 基座模型常用基准（2025–26）
- 通用知识：MMLU（已趋饱和：顶级模型 88%+，区分度下降）→ **MMLU-Pro**（十选一、更重推理）；
- 研究生级科学：**GPQA / GPQA-Diamond**；
- 数学：GSM8K（饱和）→ MATH、AIME 类；
- 代码：HumanEval（饱和）→ MBPP、LiveCodeBench、SWE-bench（后者更多用于评 agent/后训练模型）;
- 常识/语言：HellaSwag、ARC、WinoGrande、TriviaQA（经典 few-shot 套餐，小模型仍常用）；
- 长尾/前沿：HLE（Humanity's Last Exam）、Arena Elo（这两个主要评最终模型而非基座）。
- 趋势表述：预训练阶段的评测组合 = **验证 loss/BPB + 一篮子 few-shot 基准 + scaling law 预测的命中率**；基准本身在快速轮换，因为饱和与数据污染（contamination）问题——基座模型评测尤其要防训练集混入基准题。

---

## 主要来源汇总

- Kaplan et al. 2020, arXiv:2001.08361；Hoffmann et al. 2022, arXiv:2203.15556
- Epoch AI 复现：arXiv:2404.10102 / epoch.ai/blog/chinchilla-scaling-a-replication-attempt
- 分歧解释：arXiv:2406.19146（NeurIPS 2024）、arXiv:2406.12907
- 推理最优：arXiv:2401.00448；Meta Llama 3 博客 ai.meta.com/blog/meta-llama-3/
- Llama 3 论文：arXiv:2407.21783（4D 并行、MFU 38–43%、3.8e25 FLOPs）
- DeepSeek-V3：arXiv:2412.19437（DualPipe、EP64、无 TP、2048×H800）
- GPT-4 Technical Report：arXiv:2303.08774（loss 预测）
- Epoch AI: "Why GPT-5 used less training compute than GPT-4.5"（epoch.ai/gradient-updates）
- Sutskever NeurIPS 2024：The Verge / Techmeme 2024-12-13 报道
- GB200 NVL72：nvidia.com/en-us/data-center/gb200-nvl72/（130 TB/s、1.8 TB/s/GPU）
- MFU：PaLM（arXiv:2204.02311）、MegaScale-MoE（arXiv:2505.11432）、Lambda MFU 白皮书
- Kimi K2：arXiv:2507.20534；Qwen3：arXiv:2505.09388（36T tokens）
- xAI Colossus：x.ai/colossus 及 2025-26 报道；GPT-4.5 评价：bdtechtalks.com 2025-03-03、thealgorithmicbridge.com

# 现代 LLM 架构机制 · 事实清单(调研日期 2026-07-19)

> 用途:中文技术书写作素材(Transformer → 现代 LLM 架构演化,面向大二学生)。
> 标注约定:【来源】给出处;〔待核〕表示未能完全确认、写书时需再查原文;数字尽量给原始论文/官方配置值。

---

## 1. KV cache 与注意力变体:MHA → MQA → GQA → MLA

### 演进脉络
- **MHA**(2017,Vaswani et al. "Attention Is All You Need"):每个头独立的 Q/K/V。
- **MQA**(2019,Noam Shazeer,"Fast Transformer Decoding: One Write-Head is All You Need",arXiv:1911.02150):所有 query 头共享**一组** K/V。KV cache 缩小 n_head 倍,但质量有损、且当时需重训。
- **GQA**(2023,Ainslie et al.,"GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints",arXiv:2305.13245,EMNLP 2023):h 个 query 头分成 g 组,每组共享一组 K/V,是 MHA(g=h)和 MQA(g=1)之间的插值。关键工程贡献:可用约 **5% 原预训练算力**把已有 MHA 模型"uptrain"成 GQA,无需从头训练。Llama 2 70B(2023-07)首个大规模采用,典型配置 64 个 query 头共享 **8 个 KV 头**;Llama 3 全系沿用。【来源:GQA 论文、IBM/Raschka 解读】
- **MLA**(2024,DeepSeek-V2,arXiv:2405.04434):低秩联合压缩 KV。

### MLA 机制与具体数值(DeepSeek-V2/V3)
- 机制:用降维矩阵把每个 token 的 KV 联合压缩成一个低维 latent 向量 c(维度 d_c),缓存的只是 c;用时再上投影恢复 K/V(推理时上投影矩阵可吸收进 Q/O 投影,不必显式重建)。RoPE 与低秩压缩不兼容,因此**解耦出一小段带 RoPE 的维度**(decoupled RoPE)单独缓存。
- DeepSeek-V2 配置(V3 的 MLA 维度相同):注意力头数 n_h = **128**,每头维度 d_h = **128**;KV 压缩维度 **d_c = 512**(= 4×d_h);解耦 RoPE 维度 **d_h^R = 64**;query 也做低秩压缩,d_c' = **1536**(query 压缩是为省训练激活内存,不影响 KV cache)。
- **每 token 每层 KV cache = d_c + d_h^R = 512 + 64 = 576 个元素**。对比 MHA 的 2×n_h×d_h = 32,768 个元素,约压缩 **57×**;论文表述为相当于 **2.25 组的 GQA**,但效果消融显示 MLA 质量 ≥ MHA(V2 论文消融:同参数下 GQA 比 MHA 差约 0.5 ppl、MQA 差约 1.5 ppl,MLA 反而略优于 MHA)〔ppl 差值来自二手解读,写书前核对 V2 论文原表〕。
- DeepSeek-V2(236B 总参 / 21B 激活):相比自家 67B dense(MHA),KV cache 减少 **93.3%**,最大生成吞吐提升 **5.76×**。【来源:V2 论文摘要】

### KV cache 计算公式与典型对比
- 公式:`KV cache 字节数 = 2(K和V) × 层数 × KV头数 × 每头维度 × 序列长度 × 每元素字节数`。
- 每 token 数值示例(fp16/bf16,2 字节):
  - Llama-2-7B(MHA,32 层×32 头×128):2×32×128×32 = 262,144 元素/token ≈ **512 KB/token**;4K 上下文即 2 GiB。
  - Llama-3-70B(GQA,80 层×8 KV 头×128):163,840 元素/token ≈ **320 KB/token**(若是 MHA 则为 2.5 MB/token,GQA 省 8×)。
  - DeepSeek-V3(MLA,61 层×576):35,136 元素/token ≈ **68.6 KB/token**——671B 的模型,每 token 的 KV cache 比 7B 的 MHA 模型还小一个量级。
- 教学要点:decode 阶段是访存受限(memory-bound),KV cache 大小直接决定 batch 上限与长上下文吞吐,这是整条 MQA→GQA→MLA 演进线的动机。

---

## 2. 稀疏注意力 2025–26 前沿

### NSA(Native Sparse Attention,DeepSeek,2025-02,arXiv:2502.11089)
- "原生可训练"的稀疏注意力:预训练全程使用,而非推理期后加。三个并行分支,由可学习的门控加权组合:
  1. **压缩分支**:把 token 按块(块长 32)压缩成粗粒度表示〔块长数值凭记忆,核对论文〕;
  2. **选择分支**:按块打分,每个 query 选 top-n 个细粒度块(块长 64、top-16)〔同上待核〕;
  3. **滑动窗口分支**:局部窗口(512)保底近邻信息。
- 硬件对齐:按块选择使访存连续,配合 GQA 分组共享选择结果,能真正兑现加速(论文报告 64K 上下文 decode 最高约 11.6× 加速〔待核〕)。发表于 2025;后获 ACL 2025 最佳论文。〔获奖信息凭记忆,写书时核实〕
- NSA 是 27B MoE 实验模型,**没有直接用于 DeepSeek 生产模型**;生产线走的是下面的 DSA。

### DSA(DeepSeek Sparse Attention,DeepSeek-V3.2,2025-09-29 起)
- 组成:**lightning indexer(闪电索引器)+ 细粒度 token 选择**。索引器是个很轻的打分网络(少量头、可 FP8、ReLU 激活),对每个 query 与历史 token 的低维索引 key 算相关性分数,选 **top-k = 2048 个 token**〔2048 来自 V3.2-Exp 报告,核对〕,主注意力(仍是 MLA)只在被选 token 上计算。复杂度从 O(L²) 降到 O(L·k)。
- 训练方式:在 V3.1-Terminus 上继续预训练引入(先冻结主干训练索引器对齐 full attention 的注意力分布,再联合训练),即"改装"而非从头训。V3.2 正式版技术报告 arXiv:2512.02556。
- 官方效果:长上下文推理成本大幅下降(128K 场景 API 降价约 50%+),基准表现与 V3.1 基本持平。【来源:vLLM 博客 2025-09-29、Raschka 解读】

### MoBA(Mixture of Block Attention,月之暗面,2025-02,arXiv:2502.13189)
- 机制:把上下文按块(实验中块长 512)划分,每个 query 通过 gating(query 与块的 mean-pooled key 做内积打分)选 top-k 个相关块做注意力(实验 top-3,含自身所在块;保持因果性)〔块长/top-k 凭记忆,核对论文〕。思想上是"MoE 式路由"应用到注意力块。已在 Kimi 的长上下文线上服务中部署过。
- 与 NSA 区别:MoBA 块粒度较粗、无压缩分支;NSA 是压缩+选择+窗口三路组合,粒度更细。

### 2026 年生产采用
- DeepSeek 自家:V3.2 及后续版本用 DSA。
- **智谱 GLM-5 / GLM-5.1(2026)采用 DSA**——是 DeepSeek 之外第一个在旗舰模型用 DSA 的厂商(GLM-5 论文 arXiv:2602.15763)。【来源:tensoreconomics 分析】
- **MiniMax 预告 M3 将用自研稀疏注意力**(官方给的数字:1M token 下 prefill 9.7×、decode 15.6× 快于 M2)。【来源:VentureBeat 2026;X 公告】
- 总体判断:截至 2026 年中,可训练稀疏注意力已从论文走进旗舰生产模型,但采用者仍是少数;"稀疏(DSA 系)"与"线性混合(下一节)"是两条并行的效率路线。

---

## 3. 线性/混合注意力 2025–26 前沿

### Kimi Linear / KDA(月之暗面,2025-10,arXiv:2510.26692)
- **KDA(Kimi Delta Attention)**:Gated DeltaNet 的改进版,把标量遗忘门升级成**细粒度逐通道(channel-wise)门控**,配 Diagonal-Plus-Low-Rank(DPLR)转移矩阵的 chunkwise 高效算法。
- **Kimi-Linear-48B-A3B**:混合架构,**每 3 层 KDA + 1 层全局注意力(MLA,且全注意力层不用位置编码,NoPE)**,即 3:1。KV cache 减少约 **75%**,1M 上下文 decode 吞吐最高 **6×**;报告称在短文本、长文本、RL 场景都不输 full attention。已开源(HuggingFace: moonshotai/Kimi-Linear-48B-A3B-Instruct)。

### Qwen3-Next 与 Qwen3.5(阿里)
- **Qwen3-Next-80B-A3B**(2025-09):**Gated DeltaNet(线性)与 Gated Attention(带输出门控的标准注意力)按 3:1 混合**——75% 层线性、25% 层全注意力。官方理由:纯线性注意力召回(retrieval)弱、纯标准注意力贵,混合两者在 RULER 长上下文基准上反超自家 235B。MoE 部分:512 专家、top-10 + 1 共享专家〔专家数凭记忆,核对官方博客〕。
- **Qwen3.5-397B-A17B**(2026-02-16 发布):延续该混合路线,397B 总参 / 17B 激活,每第 4 层 full attention,其余为 Gated DeltaNet。【来源:mlabonne 博客 "Qwen3.5: Nobody Agrees on Attention Anymore"、NVIDIA model card】

### MiniMax:lightning attention 的"回退"案例(重要反面教材)
- MiniMax-Text-01 / M1(2025 上半年,arXiv:2506.13585):lightning attention(线性)与全注意力 7:1 混合,456B/46B,主打 1M 上下文。
- **M2(2025-10)回退到全层 full attention(GQA)**。官方博客《Why Did M2 End Up as a Full Attention Model?》给的原因:小规模和常规基准上混合注意力与 full attention 打平,但**规模放大后在多跳推理、检索、复杂 agent 任务上出现明确劣化**,且"没有任何一个高效注意力变体在生产环境全谱任务上可靠追平 full attention";另有 infra 复杂度和评测盲区问题。他们为此做过数千亿~万亿 token 级的对照续训。【来源:MiniMax 官方博客、LMSYS "No Free Lunch" 博文、arXiv:2605.26494】
- 但注意:MiniMax 并未放弃效率路线——2026 年 M3 预告转向**稀疏注意力**(见第 2 节),等于从"线性"换道"稀疏"。

### Mamba/SSM 混合现状(2026)
- 纯 Mamba/纯 RWKV 在短上下文与召回类任务不敌 Transformer,业界共识是**混合**:SSM 层 + 少量注意力层。
- 生产代表:**NVIDIA Nemotron 3**(Nano 30B / Super ~120B-A12B / Ultra ~500B-A55B,Mamba-2 + Transformer + MoE 混合,原生 1M 上下文,NVFP4 训练)、**IBM Granite 4.x**(SSM 与注意力交错,512K 上下文)、**AI21 Jamba 1.5**(398B/94B,256K 上下文)。〔Nemotron 各档参数在不同来源间略有出入(100B/120B、500B/550B),写书前以 NVIDIA 官方技术博客为准〕
- **2026 年主流怎么选(可写成书中论断)**:头部模型分三派——(a) 保守派:full attention(GQA/MLA)+ 长上下文工程,MiniMax M2、多数闭源模型;(b) 稀疏派:DSA 系,DeepSeek V3.2+、GLM-5;(c) 线性混合派:3:1 左右的 linear+full 混合,Qwen3-Next/3.5、Kimi Linear、Nemotron 3。没有一家的选择成为压倒性标准——"Nobody agrees on attention anymore"。

---

## 4. MoE 机制

### 历史三部曲
- **Shazeer et al. 2017**,"Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer"(ICLR 2017):现代稀疏 MoE 起点。LSTM 里插 MoE 层,最多 137B 参数;**noisy top-k gating**(softmax 前加噪声再取 top-k)+ 辅助负载均衡 loss。
- **GShard**(Google,2020,arXiv:2006.16668):把 MoE 搬进 Transformer(每隔一层 FFN 换 MoE),600B 翻译模型;**top-2 路由**、专家容量(capacity factor)、超容量 token 溢出、辅助 loss;确立**专家并行**范式(专家分片到不同设备,token 经 all-to-all 通信路由过去)。
- **Switch Transformer**(Google,2021,arXiv:2101.03961,JMLR 2022):激进简化到 **top-1 路由**,证明"一个 token 一个专家"也能训好且通信更省;最大 1.6T 参数、2048 专家;贡献还有 selective precision、更小的初始化等训练稳定技巧。

### 路由与负载均衡
- 经典做法:router 对各专家打分,**softmax 后取 top-k**,以概率加权组合专家输出;附加**辅助均衡 loss**(约束各专家被选频率×平均概率的乘积,系数典型 0.01)防止"赢者通吃"塌缩。
- **DeepSeek-V3 的 aux-loss-free 负载均衡**:给每个专家的路由分数加一个**可调 bias**,bias 只参与 top-k 选择、不参与最终加权;训练中按专家过载/欠载在每步后手动增减 bias(±γ)。好处:不再用辅助 loss 干扰主目标梯度,均衡与质量解耦(V3 仅保留极弱的序列级均衡 loss 兜底)。
- **sigmoid vs softmax 打分**:DeepSeek-V3 用 **sigmoid** 算亲和度再在选中的 top-k 内归一化(V2 用 softmax);sigmoid 让各专家打分独立、配合 bias 调节更稳〔动机表述为通行解读,核对 V3 报告原文〕。

### DeepSeekMoE:fine-grained + shared expert(2024-01,arXiv:2401.06066)
- 两个核心设计:
  1. **细粒度专家切分**:把每个专家切成 m 个小专家、同时把 top-k 扩大 m 倍,激活参数量不变但**组合数爆炸式增长**——论文例子:16 选 2 只有 120 种组合,切成 64 选 8 后约 4.4×10⁹ 种,专家可以更专业化;
  2. **共享专家隔离**:留 1 个(或几个)专家对所有 token 恒定激活,吸收公共知识,让路由专家去学差异化知识。
- 消融结论:两个设计各自都有可测收益;DeepSeekMoE 16B(2.8B 激活)约用 **40% 算力达到 LLaMA2-7B 同级性能**。〔具体消融数字写书时引论文表格〕

### 典型配置(均为已核实或标注)
| 模型 | 总参/激活 | 专家配置 | 备注 |
|---|---|---|---|
| DeepSeek-V3 | 671B / 37B | **256 路由 + 1 共享,top-8**,专家中间维 2048,61 层 | aux-loss-free bias 路由;限制每 token 跨节点数(node-limited routing) |
| Qwen3-235B-A22B | 235B / 22B | **128 专家,top-8,无共享专家**,94 层 | Qwen3 放弃共享专家(Qwen2.5-MoE 曾用) |
| Kimi K2 | **1T / 32B** | **384 专家,top-8 + 1 共享**,专家中间维 2048,61 层,稀疏度 48 | 预训练 15.5T token,MuonClip 优化器;沿用 DeepSeek-V3 式架构但专家更多、注意力头减半(64 头) |
| Qwen3-Next-80B | 80B / 3B | 512 专家 top-10 + 1 共享〔待核〕 | 极高稀疏比 |
| GLM-5 | 744B〔待核激活数〕 | — | 用 DSA + MTP |

- **专家并行(EP)基本概念**:专家分布在不同 GPU/节点;每层两次 all-to-all(dispatch 把 token 发给所属专家、combine 收回结果)。MoE 推理的瓶颈从算力转向通信与显存;DeepSeek-V3 用限制跨节点路由 + 计算通信重叠(DualPipe)缓解。大批量推理走 prefill/decode 分离 + 大 EP(如 EP=320)部署。

---

## 5. 位置编码与长上下文

### RoPE 机制(Su et al. 2021,RoFormer,arXiv:2104.09864)
- 把每对通道 (2i, 2i+1) 视为复平面上一个二维向量,按位置 m 旋转角度 m·θ_i,其中 **θ_i = base^(−2i/d)**;注意力内积只依赖相对位置差,天然相对编码。高频通道(小 i)编码近邻精细位置,低频通道编码远距离粗粒度位置。
- **base(θ)的意义**:base 越大,低频通道转得越慢,能无混叠地表达的距离越长。演变:**10000**(原始/Llama 1/Llama 2,4K 上下文)→ **500000**(Llama 3.1,128K)→ **1000000**(Qwen2.5 等,常见于 2025-26 模型)。经验规律:上下文越长,需要的 base 越大(有"RoPE base 下界随上下文长度增长"的分析工作)。

### 扩展方法演进
- **位置插值 PI**(2023,Meta Chen et al.,arXiv:2306.15595;社区先驱 kaiokendev):把位置索引线性压缩进原训练范围,少量微调即可扩 4×~8×,代价是近邻分辨率变差。
- **NTK-aware scaling**(2023,Reddit 用户 bloc97 提出,后被 Code Llama 等采用):不均匀插值——高频少插、低频多插,等效于动态放大 base,可"免训练"小幅外推。
- **YaRN**(2023,Peng et al.,arXiv:2309.00071):按通道波长分三段处理(高频不动、低频完全插值、中间平滑过渡)+ 注意力温度缩放;少量微调即可大倍率扩展。**DeepSeek-V2/V3 用 YaRN 从 4K → 32K → 128K 两阶段扩展**。
- 2026 年主流做法:**预训练主体在中等长度(4K–8K)+ 后期长上下文续训(32K–256K,配大 base/YaRN)**;原生上下文普遍 128K–256K,旗舰开始到 1M(Gemini 早已 1M/2M;Nemotron 3、Qwen 部分版本 1M)。业界共识:**原生长上下文训练 > 事后外推**。
- **ALiBi**(Press et al. 2021,arXiv:2108.12409,线性距离惩罚偏置):曾用于 BLOOM、MPT、BloombergGPT;**2026 年新旗舰模型基本不再采用**,但其思想(随距离衰减)影响了滑动窗口设计。
- 相关新趋势:部分混合架构在全注意力层用 **NoPE**(不加位置编码,靠线性层/卷积隐式提供位置信息),如 Kimi Linear 的 MLA 层;Gemma 3 在滑窗层与全局层用不同 RoPE base(局部 10K、全局 1M)。

---

## 6. 归一化与激活

### Post-LN → Pre-LN
- 原始 Transformer(2017)是 **Post-LN**(LN 在残差相加之后):深层时梯度在反传中被放大/缩小,需要 learning-rate warmup,深模型易发散。
- **Pre-LN**(LN 移到子层输入、残差通路保持"干净"):Xiong et al. 2020《On Layer Normalization in the Transformer Architecture》给出理论分析——Pre-LN 梯度尺度稳定,可去掉 warmup。GPT-2 起成为事实标准(GPT-2/3、Llama 系全用)。代价:Pre-LN 深层表示可能"塌"向残差主干(representation collapse / 输出方差随深度增长)。

### RMSNorm(Zhang & Sennrich 2019,arXiv:1910.07467)
- 相比 LayerNorm **去掉均值中心化和偏置项**,只用均方根缩放 + 增益 γ:少一次均值计算、少一组参数,速度更快,质量与 LN 基本持平。Llama 起成为 LLM 默认。

### QK-Norm
- 在注意力内部、**RoPE 之前**,对 query 和 key 各做一次 RMSNorm。作用:限制 QK 内积幅值,防止注意力 logits 爆炸(softmax 饱和),显著提升训练稳定性,被称为"几乎免费的午餐"。
- 起源:**Dehghani et al. 2023《Scaling Vision Transformers to 22B》**(ViT-22B 训练发散的解法);更早的 QKNorm 论文是 Henry et al. 2020〔如需追根溯源〕。
- 谁在用(2025-26):**OLMo 2、Gemma 3、Qwen3、Qwen3-Next、GLM-4.5**等;注意 **Llama 3 与 DeepSeek-V3 没用**。

### 新的 Norm 摆位变体
- **OLMo 2**(arXiv:2501.00656):把 RMSNorm 移到注意力/FFN **之后但仍在残差分支内**(一种"改良 Post-Norm",非原始 Post-LN)+ QK-Norm,两者合起来显著平滑训练 loss(论文消融是二者合并展示,单独贡献难分离——写书时可如实说明)。
- **Gemma 2/3:sandwich norm(前后都放)**——每个子层前 Pre-Norm + 后 Post-Norm 各一个 RMSNorm。
- **Peri-LN**:2025 年论文(Kim et al.)对这种"输入输出都归一化"摆位的系统分析,结论是方差增长更可控、大模型更稳〔论文编号写书时补〕。

### SwiGLU / GeGLU(Shazeer 2020,《GLU Variants Improve Transformer》,arXiv:2002.05202)
- 机制:FFN 从"线性→激活→线性"换成**门控**:`FFN(x) = W_down( Swish(W_gate·x) ⊙ (W_up·x) )`。三个矩阵而非两个,故把中间维从 4d 缩到 **8/3·d** 以持平参数/算力。
- 为什么取代 ReLU/GELU:同算力下 perplexity 与下游任务一致更优(论文里作者的解释是幽默的"divine benevolence"——机制层面可讲:乘法门控提供输入依赖的通道选择,表达力更强)。GeGLU(GELU 门)与 SwiGLU 效果相当;PaLM、Llama 起 SwiGLU 成为主流,Gemma 用 GeGLU。

---

## 7. MTP(Multi-token Prediction)

- 思想来源:Meta,Gloeckle et al. 2024《Better & Faster Large Language Models via Multi-token Prediction》(arXiv:2404.19737):多个并行输出头预测 t+1…t+n,训练信号更密。
- **DeepSeek-V3 的实现**(arXiv:2412.19437):与 Meta 的并行头不同,V3 用**顺序式 MTP 模块**——一个额外的小 Transformer 层(共享 embedding 和输出头),接收主干最后隐状态 + 下一位置 token embedding,预测 t+2(深度 D=1,即只多预测 1 个 token);保持完整因果链。MTP loss 加权并入总 loss(权重 λ 前期 0.3 后期 0.1)〔权重凭记忆,核对报告〕。
- 收益:
  - **训练**:更密的监督信号提升数据效率,消融显示基准普遍小幅上升;
  - **推理**:MTP 模块当作**自带的 speculative decoding 草稿头**——第二 token 接受率 **85%–90%**(跨主题稳定),换来约 **1.8× TPS**。【来源:V3 技术报告】
- 2026 年普及度:已接近"标配"。采用者包括 **GLM-5 / GLM-5.2**(官方称升级版 MTP 层使投机解码接受长度再 +20%)、**Qwen3-Next**、**Nemotron 3**(Ultra:1M 上下文 + MTP)、**MiniMax M2.7**、腾讯、小米 MiMo 等。vLLM/SGLang 均原生支持 MTP 投机解码。研究界指出多数部署只用第一个 MTP 模块,多步潜力未充分挖掘(FastMTP,arXiv:2509.18362)。

---

## 8. Decoder-only 的胜出

### 三条路线
- **Encoder-only**(BERT,2018):双向注意力 + MLM,适合理解/判别任务,不能直接生成。
- **Encoder-decoder**(T5,2019;原始 Transformer 的形态):编码器双向、解码器因果 + 交叉注意力,天然适合"输入→输出"式任务。
- **Decoder-only**(GPT,2018):单向因果注意力,纯 next-token prediction。

### 为什么 decoder-only 赢了(可引用的论据)
1. **零样本泛化最强(权威实证)**:Wang et al., ICML 2022,《What Language Model Architecture and Pretraining Objective Work Best for Zero-Shot Generalization?》(arXiv:2204.05832):纯自监督预训练后,**causal decoder-only + 自回归 LM 目标的 zero-shot 泛化最好**;若允许多任务微调,encoder-decoder+MLM 更强——但 LLM 范式恰恰押注前者(规模化+提示,而非任务微调)。BLOOM 团队的架构选型论文《What Language Model to Train if You Have One Million GPU Hours?》(arXiv:2210.15424)基于此选了 causal decoder。
2. **训练效率**:每个 token 都是监督信号(全序列 loss),而 encoder-decoder 只有 decoder 侧 token 产生 loss;数据利用率高。
3. **KV cache 复用 / 多轮对话工程优势**:decoder-only 下,对话前缀的 KV cache 可跨轮直接复用增量计算;encoder-decoder 每次输入变化需重新编码整个输入。
4. **架构统一与规模化简单**:一套堆叠、一个目标函数,scaling law 干净;生成与理解统一为条件生成。
5. **隐式位置信息与满秩注意力等理论论证**(次要,可选讲):因果掩码使注意力矩阵下三角满秩、causal LM 隐式编码位置等(散见于社区综述,如 Yumo Bai 的"Why are most LLMs decoder-only")。
- 有分量的行业叙事:**Yi Tay《What happened to BERT & T5?》博客(2024)**——从去噪目标 vs 自回归目标角度复盘,指出 encoder-decoder 并非"输了机制"而是"输了范式适配"。
- 注意平衡:2025-26 仍有翻案研究(如《Encoder-Decoder or Decoder-Only? Revisiting Encoder-Decoder LLM》arXiv:2510.26622,以及 Google 的 T5Gemma),encoder-decoder 在给定推理预算下有复兴讨论,但生产旗舰仍清一色 decoder-only。

---

## 9. 词表与 tokenizer

### 机制
- **BPE**:从字符/字节开始,迭代合并最高频相邻对。**byte-level BPE**(GPT-2 引入):基础字母表是 256 个字节,任何 Unicode 都可表示,无 UNK。现代主流 = byte-level BPE(tiktoken 系)或 SentencePiece BPE/Unigram。

### 2025-26 主流词表大小(核实值)
| 模型 | 词表大小 | 备注 |
|---|---|---|
| GPT-2 / GPT-3 | 50,257 | r50k/p50k |
| GPT-4 | ~100K(cl100k_base) | |
| **GPT-4o / o 系列** | **o200k_base,~200K**(实际 200,019 附近;含未训练的 unreachable tokens) | |
| **Llama 3** | **128,256**(从 Llama 2 的 32,000 大幅扩大,tiktoken 风格 BPE) | |
| **Qwen2.5 / Qwen3** | 实际 token 约 **151,669**,embedding 矩阵 **151,936**(留 padding 位) | |
| **DeepSeek-V3** | **129,280**(byte-level BPE)〔来自模型 config,建议直接查 HF config.json 复核〕 | |
| **Kimi K2** | **~160K**(报道值 160,000;config 中疑为 163,840)〔待核〕 | |
- 趋势:2023 年 32K → 2024-26 年 128K–256K;大词表对多语言和代码的压缩率收益最大(同样文本更少 token = 更低成本、更长有效上下文)。

### Embedding 参数占比:小模型 vs 大模型(可自行计算作书中示例)
- 公式:embedding 参数 = vocab × hidden;若输入输出不共享(untied)则 ×2。
- 小模型占比巨大:Qwen3-0.6B:151,936×1024 ≈ 1.56 亿,占总参 ~26%(tied);Llama-3.2-1B:128,256×2048 ≈ 2.63 亿,占 ~21%(tied)。→ 小模型普遍**共享输入/输出 embedding(weight tying)**。
- 大模型占比可忽略:Llama-3-70B:128,256×8,192 ≈ 10.5 亿,untied ×2 ≈ 21 亿,占 ~3%;DeepSeek-V3:129,280×7,168×2 ≈ 18.5 亿,占 671B 的 ~0.28%。
- 教学要点:这解释了为什么大模型可以"奢侈地"用超大词表,而小模型要权衡;也解释了 MoE 模型激活参数统计中 embedding 是固定开销。

---

## 附:本清单主要来源汇总
- DeepSeek-V2 论文 arXiv:2405.04434;DeepSeek-V3 技术报告 arXiv:2412.19437;DeepSeek-V3.2 报告 arXiv:2512.02556;DeepSeekMoE arXiv:2401.06066;NSA arXiv:2502.11089
- MQA arXiv:1911.02150;GQA arXiv:2305.13245;MoBA arXiv:2502.13189
- Kimi Linear arXiv:2510.26692;Kimi K2(MoonshotAI GitHub / IntuitionLabs 解析)
- Qwen3-Next 官方博客(qwen.ai / Alibaba Cloud);Qwen3.5 解析(mlabonne, HuggingFace blog, 2026-02)
- MiniMax:《Why Did M2 End Up as a Full Attention Model?》官方博客;M2 报告 arXiv:2605.26494;LMSYS "No Free Lunch"(2025-11)
- MoE 经典:Shazeer 2017(ICLR);GShard arXiv:2006.16668;Switch Transformer arXiv:2101.03961
- RoPE arXiv:2104.09864;PI arXiv:2306.15595;YaRN arXiv:2309.00071;ALiBi arXiv:2108.12409
- OLMo 2 arXiv:2501.00656;RMSNorm arXiv:1910.07467;SwiGLU arXiv:2002.05202;ViT-22B(QK-Norm)Dehghani et al. 2023
- MTP:Gloeckle arXiv:2404.19737;FastMTP arXiv:2509.18362;GLM-5 arXiv:2602.15763
- Decoder-only:Wang et al. arXiv:2204.05832;BLOOM 选型 arXiv:2210.15424;Yi Tay 博客
- 架构综述:Sebastian Raschka《The Big LLM Architecture Comparison》及 llm-architecture-gallery 系列(MLA/GQA/DSA/MTP/Hybrid Attention 各页)

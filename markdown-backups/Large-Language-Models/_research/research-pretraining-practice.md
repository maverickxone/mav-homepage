# 预训练工程实践调研（2024–2026）事实清单

> 调研日期：2026-07-19。用途：《预训练》卷写作素材。
> 标注约定：〔未公开〕= 官方未披露；〔待核〕= 二手来源、需再核实；〔推测〕= 社区估计非官方数字。

---

## 1. 各家旗舰的预训练规模数据点

### 1.1 总表

| 模型 | 发布 | 参数（总/激活） | 预训练 token 数 | 来源 |
|---|---|---|---|---|
| Llama 3.1 405B | 2024-07 | 405B（稠密） | 15.6T | Llama 3 技术报告 arXiv:2407.21783 |
| DeepSeek-V3 | 2024-12 | 671B / 37B | 14.8T | DeepSeek-V3 技术报告 arXiv:2412.19437 |
| Qwen3（235B-A22B 等） | 2025-05 | 235B / 22B | 36T（三阶段合计） | Qwen3 技术报告 arXiv:2505.09388 |
| Kimi K2 | 2025-07 | 1T / 32B | 15.5T | Kimi K2 技术报告 arXiv:2507.20534 |
| GLM-4.5 | 2025-07 | 355B / 32B | 23T | 据 GLM-5 技术报告回溯提及 |
| GLM-5 | 2026-02-11 | 744B / 40B | 28.5T（含各阶段总计） | GLM-5 技术报告 arXiv:2602.15763；HF 卡片 zai-org/GLM-5 |
| Qwen3.5-397B-A17B | 2026-02-16 | 397B / 17B | 〔未公开确切数〕官方称"数万亿多模态 token"、早期融合（early fusion）、201 种语言 | 据 Qwen3.5 发布信息 |
| Hunyuan Hy3（腾讯） | 2026-04 preview / 07 正式 | 295B / 21B | 〔未公开〕 | github.com/Tencent-Hunyuan/Hy3 |
| DeepSeek-V4-Pro / V4-Flash | 2026（报告 arXiv:2606.19348） | 1.6T / 49B；284B / 13B | >32T（二手来源称 Pro 33T、Flash 32T〔待核〕） | DeepSeek-V4 技术报告摘要 |
| MiniMax M3 | 2026-06 | 428B / 23B | 官方称数据管线"超过 100T tokens"规模；实际训练 token 数表述含糊〔待核，勿直接当训练量引用〕 | MiniMax M3 博客与技术报告（arXiv 2026-06） |
| GLM-5.2 | 2026-06 | 753B MoE〔待核〕 | 〔未公开〕（基座沿用 GLM-5 系） | Zhipu 发布信息 |
| Kimi K3 | 2026-07-16 | 2.8T / 激活数官方未确认（每 token 从 896 专家中激活 16 个） | 〔未公开〕；社区估计总算力 ~1e25 FLOPs、成本 $15–25M〔推测，Emad Mostaque 推文〕 | Moonshot 发布信息；VentureBeat/Tom's Hardware 报道 |

要点：2024→2026 开源旗舰预训练量从 ~15T 抬升到 28–33T；MoE 激活参数普遍压到总参数的 2–6%。

### 1.2 训练时长 / GPU 时公开数据

- DeepSeek-V3：预训练 266.4 万 H800 GPU 时，上下文扩展 11.9 万，后训练 0.5 万，合计 278.8 万 H800 GPU 时；按 $2/GPU 时估算 ~$557.6 万（据 DeepSeek-V3 技术报告；这是"正式一次跑通"的成本，不含实验与失败）。每 T token 约 18 万 H800 时（2048 卡集群，约 3.7 天/T token）。
- Llama 3.1 405B：16,384 块 H100，主训练窗口 54 天（另见第 7 节故障统计）；报告称累计 ~3930 万 H100 GPU 时（含全系列）〔待核，按 Llama 3 报告碳排放章节〕。
- Kimi K2 / K3、Qwen3、GLM-5：GPU 时〔未公开〕。
- Kimi K3 训练效率：官方称 Kimi Delta Attention + Attention Residuals 带来 ~25% 训练效率增益、额外开销 <2%（据 Moonshot 发布信息，二手报道）。

### 1.3 上下文课程（context length curriculum）

- Llama 3 405B 三段式：①主预训练 8K 窗口（AdamW，峰值 LR 8e-5，8000 步线性 warmup，cosine 衰减到 8e-7、120 万步）；②长上下文预训练：8K→128K 分 6 个阶段渐增，共 ~800B tokens；③退火（见第 4 节）。据 Llama 3 报告。
- DeepSeek-V3：4K 窗口做完 14.8T 主训练，再用 YaRN 两阶段扩展 32K→128K（每阶段 1000 步），只花 11.9 万 GPU 时。据 V3 报告。
- Qwen3 三阶段：①通用 ~30T @4K；②推理强化 ~5T（提高 STEM/代码/推理占比）@4K；③长上下文数千亿 token 扩到 32K（长度分布 75% 在 16–32K）。据 Qwen3 技术报告。
- Kimi K2：全程 4096 窗口预训练 15.5T，长上下文能力靠后续扩展阶段。据 K2 技术报告。
- 2026 年趋势：旗舰标配 1M 上下文（DeepSeek-V4、Kimi K3、GLM-5.2、MiniMax M3），实现手段从"纯 RoPE 外推"转向稀疏/线性注意力架构原生支持（DSA、MSA、KDA、CSA/HCA 混合注意力），上下文课程与架构设计合流——这点可作为第二卷与第一卷（架构）的衔接。

---

## 2. 数据管线的公开实践

### 2.1 Common Crawl 与清洗产出比

- Common Crawl：每 1–2 月一个快照，每个快照约 20–40 亿网页；累计快照 100+ 个。总规模数 PB 级〔具体 PB 数待核〕。
- FineWeb（HuggingFace，2024）：从 96 个 CC 快照清洗出 15T tokens / 44TB 文本，公开完整管线（URL 过滤→trafilatura 抽取→语言识别→质量启发式→逐快照 MinHash 去重→PII 处理）。论文 arXiv:2406.17557（NeurIPS 2024 D&B）。关键启发式过滤的删除量示例：行尾标点比例过低的文档（删 10.14% token）、重复行字符占比 ≥0.1（删 12.47%）、短行过多（删 3.73%）。
- FineWeb-Edu：用 Llama3-70B 给 46 万样本按"教育价值"打 0–5 分，训练小分类器（Snowflake embedding + 回归头），保留 ≥3 分的文档，从 15T 中筛出 1.3T——**约 92% 被扔掉**。在 MMLU/ARC 等知识型基准上显著优于全量 FineWeb。这是"质量分类器 + 教育价值打分"路线的公开代表作。
- Nemotron-CC（NVIDIA，2024-12）：99 个 CC 快照 → 6.3T tokens，其中 4.4T 为全局去重的原始文本、1.9T 为合成改写；方法上用分类器集成（ensembling）+ 合成改写、减少对启发式过滤的依赖，论证了"高质量子集反复用会撞量，改写能换取额外 token"。arXiv:2412.02595。
- 粗略经验数字：从原始 CC 到可用预训练语料，产出比大约在百分之几到 10% 量级（FineWeb 一档），再筛"教育级"又只剩 ~10%（FineWeb-Edu 一档）。

### 2.2 开放数据集速查

| 数据集 | 规模 | 特点 |
|---|---|---|
| RedPajama-V2 | ~30T 原始 / 去重后 ~20T | 只给质量信号不做裁决，让用户自己过滤 |
| Dolma（AI2） | 1.6 版 3T；1.7 版 1.2T | 全流程开源工具链，配合 OLMo |
| FineWeb | 15T | 见上 |
| FineWeb-Edu | 1.3T | 教育价值分类器 |
| FineWeb-2 | 多语言，1868 个语言-文字对，20TB/50 亿文档 | 按语言自适应阈值与去重 |
| Nemotron-CC | 6.3T（含 1.9T 合成） | 分类器集成 + 改写 |

对比实验（FineWeb 论文，1.82B 模型同算力）：FineWeb > RefinedWeb / C4 / Dolma / RedPajama2——"大不等于好"，Thomas Wolf 明确说 15T 这个数字本身不重要。

### 2.3 公开的数据配比

- Llama 3（最终 mix）：~50% 通用知识、25% 数学与推理、17% 代码、8% 多语言。配比由小模型缩放实验确定。据 Llama 3 报告。
- Qwen3：第二阶段显式上采样 STEM/代码/推理；总语料覆盖 119 种语言；具体百分比〔未公开〕。来源含网页、PDF OCR（用 Qwen2.5-VL 抽取）、以及 Qwen2.5-Math / Qwen2.5-Coder 生成的合成数据。
- DeepSeek-V3：报告称相对 V2"提高数学与编程样本占比、扩展多语言覆盖"，具体百分比〔未公开〕。
- 通行经验：代码占比 10–20% 已是共识（即便非代码模型也要代码来换推理能力）；数学被普遍上采样；配比实验都在小模型上做再外推。

### 2.4 中文语料的特殊问题

- CC 中中文占比远低于中文互联网真实体量（中文内容多在 App/封闭平台内，公网可爬比例低）；各家中文模型的中文语料高度依赖自有渠道（腾讯/阿里/字节的站内数据）与自建爬虫，这部分从不公开。
- 公开中文/双语数据集：WuDaoCorpora、WanJuan 系列（上海 AI Lab）、CCI 系列（BAAI，CCI4.0 为双语，arXiv:2506.07463）、FineWeb-2 中文子集、CLUECorpus2020（100GB，早期）。规模与英文开放集差一个数量级以上。
- 技术痛点（据 CCI/WanJuan 论文与 IEEE 相关工作）：网页抽取对中文排版更易出错；去重需按字/词混合粒度；质量分类器需中文重训（英文教育价值分类器不可直接迁移）；内容安全过滤要求高于英文管线。

---

## 3. 合成数据 2025–26 现状（预训练侧）

- **已进入生产的证据**：
  - Nemotron-CC 含 1.9T 合成 token（对高质量文档做多样化改写、对低质量文档做 Wikipedia 风格重写），NVIDIA 用于 Nemotron 系列预训练。
  - Kimi K2 报告明确在预训练用改写（rephrasing）扩增知识类与数学语料（把高质量文档改写成多风格版本以提高"每 token 学习效率"，数学改成"学习笔记"风格），并控制改写遍数防过拟合。据 K2 技术报告。
  - Qwen3 预训练含 Qwen2.5-Math/Coder 生成的合成 STEM/代码数据。
  - BeyondWeb（DatologyAI，arXiv:2508.10975）：万亿级合成数据实操经验总结，结论是"朴素改写收益有限，合成数据要设计"。
  - 2026 年出现可复用合成数据集生态：Nemotron-Synth、SYNTH、IBM Toucan 等（据 Vintage Data《Synthetic Pretraining》）。
- **phi 路线后续**：phi-4（2024-12，14.7B）延续"教科书级"合成数据路线（合成 token 约 400B 量级〔待核〕），phi-4-mini/multimodal（2025 上半年）转向端侧小模型。2025 下半年起 phi 系列无新旗舰，微软重心转向 MAI 系列自研大模型；"纯教科书合成"作为独立路线声量下降，但其方法（系统性覆盖推理模式的课程式合成）被大厂吸收进主流数据管线。〔"phi 系列停更"的官方说法：未公开，属行业观察〕
- **"数据墙"2026 年讨论现状**：
  - Epoch AI（Villalobos et al.）估计人类公开文本有效存量 ~300T token 量级，按趋势 2026–2032 年间被"用尽"——2026 年头部模型 28–36T 的原始token 用量 ×5 epoch 级别的重复已逼近高质量子集上限。
  - Ilya Sutskever NeurIPS 2024："pre-training as we know it will end"，数据是 AI 的"化石燃料"。
  - 但 2026 年实际情况是"墙被推后而非撞上"：手段包括改写/知识提取（WRAP 及后续 WRAP++ arXiv:2604.06829 称改写可提速 ~3×）、多模态 token 扩容（Qwen3.5-Omni 第二阶段 4T 多模态 token）、多 epoch 训练、以及付费/私有语料。系统研究（arXiv:2510.01631）：混入 ~30% 合成数据可显著加速收敛；生成器超过 8B 参数并不产出更好的数据。
  - 反方观点仍在：仅靠 LLM 续写网页文档收益有限，"合成数据能否真正突破数据墙"在学术上仍是开放问题（arXiv:2604.13977 等系统研究)。

---

## 4. mid-training / 退火阶段

- **词义演变**：2024 年前"mid-training"很少见；2024–25 随 OLMo 2、Llama 3 报告流行，指**预训练与后训练之间所有以数据/课程/学习率再设计为核心的阶段**——退火（LR decay + 高质量数据上采样）、长上下文扩展、有时含蒸馏与模型融合。2025-10 出现两篇综述把它正式术语化：《Mid-Training of Large Language Models: A Survey》arXiv:2510.06826、《A Survey on LLM Mid-training》arXiv:2510.23081。科普可引 Vintage Data《What's the deal with mid-training?》。**注意各家边界不一致**：有的把长上下文扩展算进 mid-training，有的算预训练末段——写作时要给读者交代这是个边界模糊的工程词。
- **公开退火配方**：
  - Llama 3：最后 40M token 上 LR 线性退火到 0（保持 128K 窗口），同时上采样高质量数据；对最后若干 checkpoint 做 Polyak 平均得到最终模型。另用"退火评估法"：把候选数据集混入退火阶段看基准涨幅，作为数据价值探针（在 GSM8k/MATH 上退火小规模高质量数学数据即显著提分）。
  - OLMo 2：两阶段。Stage 2 用专门的 Dolmino Mix 1124（高质量+数学为主）；7B 版做法：从 stage 1 末尾 checkpoint 出发，取 50B token 子采样、LR 线性退火到 0，用 3 个不同数据顺序各跑一遍，3 个终点 checkpoint 平均（model souping）。arXiv:2501.00656（《2 OLMo 2 Furious》）。
  - DeepSeek-V3：LR 调度为 warmup→恒定→两段衰减的多步（step）方案而非 cosine；最后阶段等效于退火。数据侧上采样细节〔未公开〕。
  - Kimi K2：15.5T 中前 10T 恒定 LR 2e-4（500 步 warmup），后 5.5T cosine 衰到 2e-5——WSD 变体，decay 段即承担退火职能。
- **与 long-context extension 的关系**：主流顺序是"主预训练（短窗口）→ 长上下文扩展 → 退火"（Llama 3）或"主训练 → 退火/高质量阶段 → YaRN 扩展"（DeepSeek）。两个综述都把长上下文扩展列为 mid-training 的三大组件之一（数据课程、LR 调度、上下文扩展）。

---

## 5. 优化器与超参 2026

- **AdamW 现状**：仍是默认基线，且多数西方旗舰（Llama、及据信 GPT/Claude 系〔未公开〕）继续使用。但 2025–26 出现真实份额转移：Muon 系已训练出 Kimi K2（1T）、GLM-5（744B）、DeepSeek-V4、Kimi K3（2.8T）等生产旗舰。
- **Muon 机制要点**：对二维权重矩阵的动量梯度做 Newton–Schulz 迭代近似正交化（相当于用谱范数而非逐元素范数约束更新），embedding/输出层/一维参数仍用 AdamW。优点：token 效率更高（同数据更低 loss）、大 batch 下数据效率保持更好、状态内存约为 Adam 一半。规模化验证见 Moonshot《Muon is Scalable for LLM Training》arXiv:2502.16982。
  - **MuonClip（Kimi K2）**：Muon + QK-clip——按注意力 logits 超阈值程度对 Q/K 投影权重做重缩放，压制 attention logits 爆炸；K2 15.5T token 全程"零 loss spike"。据 K2 技术报告。
  - **Per-Head Muon（Kimi K3）**：把 Muon 的正交化/约束粒度细化到每个注意力头，进一步稳住训练〔细节以 K3 正式报告为准，当前为发布信息转述〕。
  - 其他采用者：GLM-5（Muon 系〔待核具体变体〕）、DeepSeek-V4（摘要明确用 Muon）；衍生研究活跃（AdaMuon、Mousse 等）。
- **WSD vs cosine**：WSD（warmup–stable–decay，MiniCPM 2024 推广）优势是恒定段可随时接续训练、退火段可反复重放，天然适配 mid-training 与数据实验；2025–26 论文与开源训练广泛默认 WSD（decay 常用 1-sqrt 或线性）。cosine 仍见于 Llama 3 等一次性大跑。DeepSeek 用多步恒定+阶梯衰减（效果与 WSD 同类）。可表述为："cosine 是 2023 的默认，WSD 类是 2025+ 的默认"。
- **典型超参**：weight decay 0.1（Llama 3、DeepSeek-V3、Qwen 系一致）；梯度裁剪 1.0；batch size ramp 常见——DeepSeek-V3 前 469B token 内 batch 从 3072 增到 15360 序列然后恒定（据 V3 报告）；Llama 3 405B 分三档 4M→8M→16M tokens/batch〔按报告，待核确切切换点〕。
- **muP**：思想（超参随宽度可迁移，用小代理模型扫超参）被广泛接受，但完整 muP 生产采用有限：明确用过的有 Cerebras-GPT、MiniCPM，Grok 代码中有 muP 痕迹〔推测〕；多数大厂用"muP 风格的经验缩放律"（如 DeepSeek 用自己拟合的 LR/batch 缩放律）而非严格 muP。变体 u-muP（arXiv:2407.17465）针对低精度训练友好。EleutherAI《Practitioner's Guide to muP》是好的教学引用。

---

## 6. 低精度训练

- **FP8（DeepSeek-V3 配方，首个极大规模生产案例）**：
  - FP8 部分：绝大多数 GEMM（前向、激活梯度、权重梯度）。
  - 保持 BF16/FP32：embedding、输出头、MoE 门控、归一化算子、注意力算子；主权重 FP32、梯度累加 FP32，优化器一阶/二阶矩 BF16。
  - 关键技巧：细粒度量化——激活按 1×128 tile、权重按 128×128 block 各自缩放；在 CUDA core 上做高精度累加（每 128 元素提升累加）。相对 BF16 基线 loss 误差 <0.25%。据 V3 技术报告与后续硬件反思论文 arXiv:2505.09343。
  - 此后 FP8 训练在 2025–26 成为国产旗舰标配〔各家细节多未公开〕。
- **FP4 / 2026 状态**：
  - NVIDIA NVFP4 预训练论文（arXiv:2509.25149，2026 年更新版）：12B 混合 Mamba-Transformer 在 **10T token** 全程 NVFP4 预训练，loss 与下游精度贴近 FP8 基线——首个公开的多万亿 token 4-bit 预训练证据。技术要点：Random Hadamard 变换压 block 级离群值、前反向一致的 2D 量化、随机舍入（stochastic rounding）保梯度无偏、少量层保高精度。同文对比：MXFP4 需多 ~36% token 才追平 NVFP4 的 loss。
  - Kimi K3 与 MXFP4 的定性——**查证结论：不是 FP4 预训练**。K3 发布权重为 MXFP4（4-bit 权重 + block 缩放），激活 MXFP8，但量化感知训练（QAT）是**从 SFT 阶段起**引入的；预训练精度官方未公布，社区估计为 BF16/FP16 + Muon〔推测，Emad Mostaque〕。写作时应表述为"MXFP4 是训练后期 QAT + 低精度交付，而非 4-bit 预训练"。（GPT-OSS 2025 已有同类先例：MXFP4 权重发布。）
  - 结论句可用：截至 2026 年中，FP8 预训练已生产化，FP4 预训练处于"论文验证过 10T token、尚无公开旗舰全程使用"的阶段。
- **通用机制现状**：BF16/FP32 母版权重 + 低精度计算副本是所有低精度方案的骨架；FP16 时代的全局 loss scaling 已基本被淘汰，取代者是 FP8/FP4 的分块缩放因子（per-tile/per-block scaling）+ 高精度累加；BF16 因指数位宽通常无需 loss scaling。

---

## 7. 训练稳定性与故障

- **Llama 3 405B 中断统计（核实：属实）**：54 天预训练窗口、16,384 块 H100，共 466 次中断，其中 419 次**非计划**中断——平均约 3 小时一次。归因：GPU 故障 148 次（30.1%）、HBM3 显存 72 次（17.2%）、GPU SRAM 19 次、GPU 系统处理器 17 次、网络交换机/线缆 35 次（8.4%）；CPU 仅 2 次。GPU 及其显存合计约占 58%。尽管如此有效训练时间 >90%，仅 3 次事件需人工介入。据 Llama 3 报告（转引：Tom's Hardware、DCD）。
- **其他公开数据点**：
  - ByteDance MegaScale（arXiv:2402.15627）：万卡级生产训练数周内 100+ 次故障恢复事件。
  - ByteDance ByteRobust（SOSP 2025，arXiv:2509.16293）：9,600 卡三个月检出 38,236 次显式故障 + 5,948 次隐式故障（≈每天 40–50 次异常事件），仍保住 97% 有效训练时间比（ETTR）。
  - 数量级直觉：单节点日故障率哪怕 1.5%，万卡级集群就意味着"每天必然有故障"——容错必须是系统默认态而非异常态。
- **checkpoint 与 spike 处理的公开做法**：
  - PaLM 540B（2022，经典出处）：训练中约 20 次 loss spike；处理法 = 回滚到 spike 前约 100 步的 checkpoint + 跳过 200–500 个 data batch，spike 不复现——说明 spike 是"优化器状态 × 特定数据"的坏组合而非坏数据本身。
  - 现代自动化：spike 检测→自动跳过该次更新、数据重新随机注入后续 batch、必要时临时降 LR（ZClip arXiv:2504.02507、AdaGC 等自适应裁剪方案）；checkpoint 高频异步保存（内存/NVMe 分级）已是标配。
  - 预防路线取代抢救路线：MuonClip/QK-clip（K2 全程零 spike）、更稳初始化与归一化布局（第一卷讲过的 sandwich norm 等）——2026 年头部报告更愿意宣传"零 spike"而不是"如何救 spike"。

---

## 8. 涌现能力之争现状

- 正方：Wei et al. 2022《Emergent Abilities of Large Language Models》（TMLR）——某些能力随规模"突然出现"、不可预测。
- 反方：Schaeffer, Miranda & Koyejo 2023《Are Emergent Abilities of LLMs a Mirage?》（NeurIPS 2023 outstanding paper）——"突变"多是**非线性/不连续指标**（如 exact match）造成的假象；换连续指标（token 级似然、部分得分）曲线就平滑。
- 2024–26 收敛情况：**双方各让一步、无一锤定音结论**。
  - 主流立场：大部分"涌现"确实是指标伪影 + 阈值效应；但少数能力（如某些多步推理任务）换指标后仍呈快速非线性跃升，Schaeffer 等 2024 后续工作也承认"a few breakthrough capabilities remain stubbornly emergent"。
  - 定义被弱化：从"突然且不可预测"退到"超线性但原则上可预测"；研究热点转向**预测涌现**（如 finetune 探针法 arXiv:2411.16035、随机缩放视角 arXiv:2502.17356）而非争论真伪。
  - 2025-08 综述《Why are LLMs' abilities emergent?》(arXiv:2508.04401) 把它定性为"对评测曲线的解释之争，而非已决事实"。
- 写作建议表述：涌现之争的教学价值在于"你测到什么取决于你用什么尺子"——这与预训练的 loss-下游能力换算问题（scaling law 只保证 loss 平滑，不保证任意下游指标平滑）直接相通。

---

## 9. 数据版权与诉讼简况（截至 2026-07）

- **NYT v. OpenAI/Microsoft**（SDNY，2023-12 起诉）：仍在 discovery；未定庭审日期。2026-07 NYT 联合多家媒体申请对 OpenAI **法庭制裁**，指其两年间隐瞒了检索训练集与输出日志中版权内容的能力（报道：Variety、US News 2026-07-09）。无和解迹象。
- **Bartz v. Anthropic**：2025-06 法院判训练本身构成合理使用（fair use），但盗版渠道获取图书另当别论；2025-09 Anthropic 以 **$15 亿**和解（约 50 万本书、每本 ~$3000，销毁盗版文件），为 AI 版权案迄今最大数字；截至 2026 年中和解仍待法院最终批准〔待核最新状态〕。
- **Kadrey v. Meta**（加州北区，Chhabria 法官，2025-06-25）：Meta 在简易判决中胜诉，但判词强调是因**原告未能举证市场损害**的技术性胜利，法官明示"无授权训练在多数情形下可能不构成合理使用"（市场稀释理论）——被双方各自引为有利先例。
- **Authors Guild v. OpenAI**（并入 SDNY 集中审理）：2025-10 Stein 法官驳回 OpenAI 对输出侵权（ChatGPT 生成详细情节摘要）的简易判决动议，案件继续。
- **对预训练数据实践的实际影响**：
  - 授权协议：OpenAI 已公开 18+ 家出版商协议（News Corp 一单据报 5 年 ~$2.5 亿〔待核〕）；但行业分析共识是授权费只流向头部品牌语料，长尾出版商拿不到有意义收入（Nieman Lab 2025-12）。
  - robots.txt 与爬虫封锁：Cloudflare 2025-07-01 起对新域名**默认拦截** AI 爬虫（百万级客户启用），并计划 2026-09 起对展示广告页面默认拦截 Training/Agent 类爬虫；有研究称封锁 AI 爬虫的出版商流量反降 ~23%〔待核方法学〕。
  - Common Crawl 本身成为靶子：2026-06-03 Digital Content Next 代表 AP、NYT、NBCU、彭博、NPR、Fox 向 Common Crawl 发**停止侵权函**，要求停爬并从既有数据集中删除成员内容——直接威胁 FineWeb 等开放数据集的上游。
  - 净效应：公开可爬网页供给收缩（"closing web"），加速三个趋势——付费授权语料、私有渠道数据、合成数据（与第 3 节呼应）。

---

## 附：可引综述/深读清单

- FineWeb 论文 arXiv:2406.17557（数据管线方法学最佳单篇）
- 《Mid-Training of LLMs: A Survey》arXiv:2510.06826；《A Survey on LLM Mid-training》arXiv:2510.23081
- Vintage Data 博客：《What's the deal with mid-training?》《Synthetic Pretraining》
- 《Muon is Scalable for LLM Training》arXiv:2502.16982；EleutherAI muP 实践指南
- 《Pretraining LLMs with NVFP4》arXiv:2509.25149
- Llama 3 报告 arXiv:2407.21783 §3（预训练工程全景的最详实公开叙述）
- OLMo 2 报告 arXiv:2501.00656（唯一全开放复现级配方）
- ByteRobust（SOSP 2025）arXiv:2509.16293（故障工程）

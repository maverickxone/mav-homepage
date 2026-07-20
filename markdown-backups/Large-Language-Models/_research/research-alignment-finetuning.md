# 调研：对齐与微调技术谱系（后训练卷素材）

> 调研日期：2026-07-20。用途：第四卷《后训练》。GRPO/RLVR/reward hacking 另有专门调研，本文不重复。
> 标记约定:〔待核〕= 未能完全确认的数字或说法。

---

## 1. SFT / 指令微调

### 1.1 InstructGPT 的 SFT（2022-03，arXiv:2203.02155）

- **数据量**：SFT 阶段约 **13k 训练 prompts**（含标注员手写 + 从 API 用户请求中采样），标注员为每个 prompt 撰写示范回答（demonstration）。RM 阶段 33k prompts，PPO 阶段 31k prompts。
- **标注员**：约 **40 名合同工**，经 Upwork 和 ScaleAI 招募；通过筛选测试（识别敏感请求的能力、与研究员的标注一致性）录用。团队刻意保持小规模以便高带宽沟通。
- **训练细节**：SFT 训了 16 个 epoch；验证 loss 在 1 epoch 后就过拟合，但继续训练仍能提升 RM 分数和人类偏好评分——早期就说明"SFT 的 loss 不是目标本身"。
- 来源：[InstructGPT 论文](https://arxiv.org/pdf/2203.02155)。

### 1.2 FLAN / T0：指令泛化路线的定位

- **FLAN**（Google，2021-09，arXiv:2109.01652）：137B LaMDA-PT 在 **62 个 NLP 数据集**（模板化成指令）上多任务微调，零样本性能在 25 个数据集中 20 个超过 GPT-3 零样本，10 个超过 GPT-3 少样本。
- **T0**（BigScience，2021-10，arXiv:2110.08207）：11B T5 + P3（PromptSource）提示集合，比 FLAN 小 10 倍以上仍取得竞争性零样本泛化。
- **Flan 2022 集合**（arXiv:2301.13688）：扩到 **1800+ 任务**、每任务至少 20 个模板。
- **定位**：这条路线证明的是"指令微调 → 对未见任务的零样本泛化"，本质是把 NLP 任务集模板化；与 InstructGPT 的"开放式对话对齐"（人写示范 + 偏好）是指令微调的两个分支，后来的 chat 模型融合两者：FLAN 式学术数据管多任务覆盖，InstructGPT 式数据管对话与主观质量。
- 来源：[FLAN](https://arxiv.org/abs/2109.01652)、[T0](https://arxiv.org/pdf/2110.08207)、[Flan Collection](https://arxiv.org/pdf/2301.13688)。

### 1.3 LIMA（2023-05，arXiv:2305.11206）

- 65B LLaMA + **1000 条精选样本**（约 750 条来自 Stack Exchange/wikiHow/Reddit 高票问答，250 条手写），无 RLHF。提出**表层对齐假说**（Superficial Alignment Hypothesis）：模型的知识与能力几乎全部来自预训练，对齐只是教会"用哪种格式/风格与用户交互"。
- **后来的评价**：
  - 评测方法受质疑：LIMA 靠人类 win-rate 取胜，但生成大量事实/推理错误的回答仍能赢得偏好比较——暴露了 win-rate 评测偏风格的问题。
  - "Revisiting the Superficial Alignment Hypothesis"（2024-10，arXiv:2410.03717）：在推理、数学、编码等任务上，后训练性能随微调样本数呈幂律提升，对齐远不只学风格；假说在"风格与格式"维度上成立，在"能力"维度上不成立。
  - 实践共识：千条级 SFT 可以立起对话格式与语气，但可靠性、拒绝行为、复杂推理需要大得多的数据与 RL；且精选千条无法规模化复制。
- 来源：[LIMA](https://arxiv.org/pdf/2305.11206)、[Revisiting SAH](https://arxiv.org/html/2410.03717v1)。

### 1.4 Alpaca 与 self-instruct（2023-03）

- 斯坦福 Alpaca：LLaMA-7B + **52k** 条 self-instruct 风格指令数据，由 **text-davinci-003** 生成，API 成本 **< $500**；微调 8×A100 约 3 小时，**< $100**。总计 < $600 复现出"像 text-davinci-003"的行为，触发 2023 年开源指令微调潮（也开创了"拿强模型输出蒸馏 SFT 数据"的普遍做法，及随之而来的 ToS 争议）。
- 来源：[Stanford CRFM 博客](https://crfm.stanford.edu/2023/03/13/alpaca.html)、[GitHub](https://github.com/tatsu-lab/stanford_alpaca)。

### 1.5 Chat template 的标准化

- **ChatML**（OpenAI，2023 随 GPT-3.5-turbo API 引入）：`<|im_start|>role\n...<|im_end|>`，role 是普通字符串（system/user/assistant），最接近事实标准；Qwen 等直接采用。
- 各家自有格式并存：Llama 2 用 `[INST]`/`<<SYS>>`，Llama 3 改用 `<|start_header_id|>role<|end_header_id|>` + `<|eot_id|>`；Gemma 用 `<start_of_turn>`。
- **Hugging Face `chat_template`**（2023-10 起）：把格式作为 Jinja 模板存进 tokenizer 配置，`apply_chat_template()` 统一渲染——解决"格式不匹配导致无声性能退化"（silent performance degradation）这一著名坑；此后新模型发布必带 chat template，成为事实上的接口标准。
- 训练含义：SFT 时对话被渲染为单一 token 序列，loss 通常只算 assistant 段（mask 掉 user/system 部分）；特殊 token 需加入词表并在 SFT 中学会。
- 来源：[HF Chat Templates 博客](https://huggingface.co/blog/chat-templates)、[HF 文档](https://huggingface.co/docs/transformers/chat_templating)。

### 1.6 2025–26 年 SFT 实践现状

- **数据量级（公开数字）**：
  - Tülu 3（Ai2，2024-11，arXiv:2411.15124）：SFT 混合约 **93.9 万条**〔待核精确数〕，回答大量由 GPT-4o / Claude 3.5 Sonnet（代码）合成。
  - Qwen2.5：后训练数据 **100 万+ 示例**（SFT+DPO+GRPO 合计）。
  - Llama 3.1：SFT 数据主要靠拒绝采样从自家模型合成，人写比例低；总量未给单一数字。
  - DeepSeek-R1 蒸馏用 **80 万条**（60 万推理 + 20 万非推理）。
- **拒绝采样微调（rejection sampling FT）已是标配**：Llama 3 对每个 prompt 从最新 policy 采 K=10–30 个回答、用 RM 挑最优做 SFT 数据；Qwen3 在冷启动查询上用阶段 2 模型拒绝采样生成 thinking 数据。RFT/RAFT 被视为"没有 RL 基础设施时的强 baseline"。
- **强模型蒸馏 SFT 数据已完全普遍化**：开源模型的 SFT 数据大头是前沿模型（GPT-4o、Claude、DeepSeek-R1、Qwen 大杯）的输出；纯人写示范基本只剩种子与审核作用。
- **"SFT Memorizes, RL Generalizes"**（2025-01，arXiv:2501.17161，ICML 2025）：在 GeneralPoints（算术卡牌）与 V-IRL（视觉导航）上对比：**RL（结果奖励）在规则变体与视觉变体上均能 OOD 泛化，SFT 倾向记忆训练分布**；RL 还提升底层视觉识别；但 **SFT 仍是 RL 的前提**——它稳定输出格式，使 RL 得以起效。影响：成为"SFT 立格式、RL 长能力"分工的最常被引用的实证依据，直接影响 2025 年后训练管线中 SFT 与 RL 的配比叙事。
- 来源：[Tülu 3](https://allenai.org/blog/tulu-3-technical)、[Qwen3 报告](https://arxiv.org/pdf/2505.09388)、[SFT vs RL](https://arxiv.org/abs/2501.17161)、[Llama 3](https://arxiv.org/pdf/2407.21783)。

---

## 2. 奖励模型与偏好数据

### 2.1 Bradley-Terry 模型

$$P(y_w \succ y_l \mid x) = \frac{\exp r(x, y_w)}{\exp r(x, y_w) + \exp r(x, y_l)} = \sigma\big(r(x, y_w) - r(x, y_l)\big)$$

RM 训练即最大似然：

$$\mathcal{L}_{RM} = -\mathbb{E}_{(x, y_w, y_l)}\left[\log \sigma\big(r_\theta(x, y_w) - r_\theta(x, y_l)\big)\right]$$

- **直觉**：奖励差就是"胜率的 logit"——两个回答的分差每大一点，人类偏好前者的概率按 sigmoid 上升；奖励只在差值意义上有定义（整体平移不变），所以 RM 分数没有绝对刻度。源自 1952 年配对比较统计模型（也是 Elo 的近亲）。

### 2.2 偏好数据的收集形态

- **成对比较**是主流（噪声最小、与 BT 损失直接对应）；打分（Likert）与多路排序为辅。
- **InstructGPT 的做法（已核实）**：每个 prompt 给标注员 **K = 4 到 9** 个回答做整体排序，产生 $\binom{K}{2}$ 个比较对；RM 数据约 33k prompts。全部比较对放进同一个 batch 元素训练，防止过拟合并提高效率。
- Llama 2/3 收集时还让标注员标"好多少"（significantly better → negligibly better 分档），Llama 2 的 RM 损失里加了 margin 项。

### 2.3 标注一致率（公开数字）

- InstructGPT：标注员之间一致率 **72.6 ± 1.5%**（训练集），held-out 标注员 **77.3 ± 1.3%**〔两个数字方向已核实为 72–77% 区间，精确到小数待核〕。
- Stiennon et al. 2020（摘要 RLHF）：标注员与研究者一致率约 73–77%〔待核〕。
- Anthropic HH（Bai et al. 2022）：作者与众包标注员一致率约 63%〔待核〕。
- **结论**：人与人一致率普遍落在 **60–75%** 量级（问题越主观越低），这构成 RM 精度的天花板——RM 对人类标签的准确率到 70% 上下即接近饱和，不是训练不足而是标签本身有噪声。

### 2.4 RM 的规模惯例

- 两种惯例并存：**InstructGPT 用 6B RM 配 175B policy**（省算力，且他们发现 175B RM 训练不稳定）；**Llama 2/3 用与 policy 同尺寸的 RM**，并从 chat checkpoint 初始化（换掉 LM head 为标量回归头）——理由是 RM 的知识水平不能明显低于 policy，否则被钻空子。
- 2024 年后大厂主流是同尺寸或略小；开源社区常用 8B–70B 独立 RM（如 Skywork-Reward、ArmoRM）。

### 2.5 RM 过优化（Gao, Schulman et al., 2022-10, arXiv:2210.10760）

- **设置**：用一个固定的大"gold RM"扮演人类，给 proxy RM 提供标签；然后针对 proxy RM 做 BoN 采样或 RL 优化，观察 gold 分数。
- **核心图景**：随着对 proxy 的优化推进（横轴用与初始策略的 KL 距离 $d = \sqrt{D_{KL}}$），**proxy 分数单调上涨，gold 分数先涨后跌**——Goodhart 定律的定量版。
- **函数形式**：BoN 下 $R(d) = d(\alpha - \beta d)$（二次），RL 下 $R(d) = d(\alpha - \beta \log d)$（对数）；系数随 RM 参数量平滑缩放——RM 越大、数据越多，峰值越晚越高，但过优化不会消失。
- **实践含义**：KL 惩罚/早停/RM 迭代刷新（Llama 3 每轮重训 RM）都是对这条曲线的工程响应。
- 来源：[arXiv:2210.10760](https://arxiv.org/abs/2210.10760)。

### 2.6 2025–26 RM 新形态

- **Generative RM / LLM-as-judge RM**：不再输出标量，而是让（往往带 CoT 的）LLM 生成批评与判断再抽取分数/偏好；可利用推理算力提升判断质量（如 DeepSeek 的 GRM/SPCT 路线〔待核命名〕）。生产偏好数据的标注主力已从人类转向此类 judge。
- **Rubric RM**：按显式评分细则（rubric）逐维打分再聚合；2025–26 大量工作（Rubrics-as-Rewards 等）把 rubric 作为可审计、可迁移的奖励规格，覆盖数学/代码/开放任务；也用于 RLVR 无法验证的开放域。
- **Process RM（PRM）**：步骤级/Token 级密集奖励，评估推理链每一步（Qwen2.5-Math-PRM 等）；在 2025 年主要位置是**推理搜索的 verifier 与数据筛选器**，而非 RL 主奖励（结果奖励 + 规则验证在 RLVR 中更稳）。
- 评测：RewardBench → RewardBench 2（新人类 prompt、更难、防污染）、RM-Bench、JudgeBench。
- 来源：[RewardBench 2 相关](https://www.emergentmind.com/topics/generative-reward-models-llm-as-a-judge)、[Rubric RM 综述](https://www.emergentmind.com/topics/rubric-based-reward-modeling-rubric-rm)。

---

## 3. DPO 与直接偏好方法

### 3.1 核心推导链（2023-05，arXiv:2305.18290，NeurIPS 2023）

1. RLHF 目标 $\max_\pi \mathbb{E}[r(x,y)] - \beta D_{KL}(\pi \| \pi_{ref})$ 有闭式最优解：
$$\pi^*(y|x) = \frac{1}{Z(x)} \pi_{ref}(y|x) \exp\left(\frac{r(x,y)}{\beta}\right)$$
2. 反解出奖励（**隐式奖励**）：
$$r(x,y) = \beta \log \frac{\pi^*(y|x)}{\pi_{ref}(y|x)} + \beta \log Z(x)$$
3. 代入 Bradley-Terry，配分函数 $Z(x)$ 在两回答相减时消掉，得到纯粹的分类损失：

$$\mathcal{L}_{DPO} = -\mathbb{E}\left[\log \sigma\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l|x)}\right)\right]$$

- **β 的含义**：原 RLHF 目标里 KL 约束的强度，同时是隐式奖励的温度。β 大 → 贴紧参考模型（欠拟合风险）；β 小（0.01–0.1）→ 允许大偏移（漂移/退化风险）。常用 0.1，生产范围约 0.1–0.5。
- **"你的语言模型暗中是个奖励模型"的确切含义**：在 KL 正则的 RLHF 框架下，策略与奖励一一对应（模差一个只依赖 x 的项）——任何策略 $\pi$ 都隐式定义了奖励 $\beta \log \frac{\pi}{\pi_{ref}}$，且它恰是该奖励下的最优策略。因此不必先训显式 RM 再做 RL：直接用策略参数化奖励、在偏好数据上做最大似然，等价于"先拟合 BT 奖励、再精确求解 KL 正则 RL"。语言模型的 logits 本身就承载了奖励函数。

### 3.2 主要变体（各一句话）

- **IPO**（Azar et al., 2023-10, arXiv:2310.12036）：把 log-sigmoid 换成对固定 margin 的平方损失，修 DPO 在偏好接近确定时无界推大 log-ratio、过拟合的问题。
- **KTO**（2024-02, arXiv:2402.01306）：不需要成对偏好，只要单条回答的"好/坏"二元标签，用前景理论（Kahneman-Tversky）式价值函数——数据门槛最低。
- **SimPO**（2024-05, arXiv:2405.14734）：去掉参考模型，用长度归一化的平均 log 概率作隐式奖励并加目标 margin γ——更简、防长度膨胀（AlpacaEval 2 上比 DPO 高约 6.4 分）。
- **ORPO**（2024-03, arXiv:2403.07691）：SFT 损失 + odds-ratio 偏好罚项一阶段完成，无参考模型、无独立 SFT 阶段。

### 3.3 DPO vs PPO 之争（2024 实证）

- **"Is DPO Superior to PPO for LLM Alignment?"**（arXiv:2404.10719，ICML 2024）：调好的 **PPO 全面优于 DPO**，差距在难任务上最大（CodeContest 上 DPO 一轮后 pass 率 0%）；机理分析：DPO 会找到利用**分布外回答**的有偏解，对偏好数据与模型输出的分布偏移敏感；iterative DPO 缓解但不追平。
- **"Unpacking DPO and PPO"**（Tülu 团队，arXiv:2406.09279，NeurIPS 2024）：最大的变量是**偏好数据质量**，其次算法；PPO 平均略优于 DPO，但 DPO 便宜一个数量级、超参更好调。
- 综合共识：PPO/在线 RL 上限更高（尤其可验证任务），DPO 性价比高、离线可扩展；高质量、贴近 on-policy 的偏好数据能大幅缩小差距。

### 3.4 2025–26 生产定位

- **Llama 3（已核实）**：明确弃用 PPO 类复杂 RL，用 SFT + 拒绝采样 + **DPO** 迭代 6 轮，理由是稳定、好扩展。
- **Tülu 3**：偏好阶段用 **length-normalized DPO**（约 27–30 万偏好对），能力阶段用 RLVR。
- **Qwen2.5**：offline **DPO**（约 15 万对）→ online **GRPO**；Qwen3 的通用偏好对齐放在第四阶段 general RL（RM 打分）里，不再单列 DPO〔待核细节〕。
- **"DPO 管风格/偏好、RL 管能力"是否成立**：**大体成立但不绝对**。2025 年后可验证能力（数学/代码/agent）全面转向 RLVR/GRPO 类在线 RL，DPO 保留在人类偏好、格式、安全、风格阶段——这是主流分工（Tülu 3、Qwen 系皆如此）。但反例存在：Llama 3.1 只用 DPO 也达到当时前沿；iterative/on-policy DPO 不断蚕食在线 RL 的地盘。更准确的表述是："离线偏好优化足以对齐分布内行为，在线 RL 在需要探索与可验证反馈的能力上不可替代"。
- 来源：[DPO](https://arxiv.org/pdf/2305.18290)、[2404.10719](https://arxiv.org/pdf/2404.10719)、[2406.09279](https://arxiv.org/html/2406.09279v1)、[Llama 3](https://arxiv.org/pdf/2407.21783)。

---

## 4. RLAIF 与 Constitutional AI

### 4.1 CAI 机制（Anthropic，2022-12，arXiv:2212.08073）

- **两阶段（已核实）**：
  1. **SL-CAI（监督阶段）**：对（红队）prompt 让 helpful 模型先答 → 随机抽一条宪法原则让模型**自我批评** → 按批评**修订**回答（可多轮）→ 用修订后的回答做 SFT。
  2. **RL-CAI（RL 阶段，即 RLAIF）**：SL-CAI 模型对同一 prompt 生成两个回答，由 AI（依据宪法原则，few-shot）选出更优者 → 得到 AI 偏好数据集 → 训偏好模型 → 对其做 RL。harmlessness 标签来自 AI，helpfulness 标签仍用人类。
- **宪法形态**：一组自然语言原则（论文中十几条，主要是批评/比较指令的措辞，如"选择更无害、更不含毒性的回答"）；随机抽取使用。2023-05 公开的 Claude 宪法扩展到数十条，来源包括联合国人权宣言、行业 ToS、自研原则。
- **卖点**：得到"无害但不回避"（harmless but non-evasive）的助手——会解释拒绝理由而非套话搪塞；人类监督压缩为"写原则 + 少量 helpful 标注"。

### 4.2 RLAIF vs RLHF（Google，2023-09，arXiv:2309.00267，Lee et al.，ICML 2024）

- 摘要任务：RLAIF/RLHF 分别以 71% / 73% 优于 SFT 基线；helpful 对话 63% / 64%——**头对头无统计显著差异**。
- 无害对话：harmless rate **RLAIF 88% > RLHF 76% > SFT 64%**。
- 还展示了 same-size RLAIF（AI 标注器与 policy 同尺寸也有效）与 direct-RLAIF（直接拿 LLM 打分当奖励，跳过 RM 蒸馏）。
- 结论：AI 反馈是人类偏好标注的可行替代，且扩展性质好。

### 4.3 Scalable oversight 的逻辑

人类标注的数量与质量不随模型能力增长而扩展（模型超过标注员水平后偏好标签失真）；把人类上移到**写规范/宪法、审核抽样、设计评测**的位置,用 AI 放大监督信号,是 debate/IDA 一脉的工程化落地。CAI 是第一个规模化实证。

### 4.4 2025–26 现状

- **AI 反馈已是偏好数据的主体**：开源侧（UltraFeedback 由 GPT-4 标注、Tülu 3 偏好数据由 LLM judge 生成）与产业侧均如此；多项工作表明 LLM 标注在速度/成本上碾压众包且质量可达或超过众包水平。人类角色收缩为**质量审核、spec 制定、疑难样本仲裁**——"人类退居审核"作为趋势成立，但各家人类标注并未归零（Llama 3 的偏好数据仍大量人标）。
- **Anthropic 的演化（已核实）**：
  - **Character training**（2024 年公开描述，随 Claude 3 引入）：用生成-排序式的合成数据训练性格特质，是 CAI 的变体。
  - **2026-01 发布新版 Claude 宪法**：从"独立原则清单"转向**解释性文档**——立场是模型需要理解"为什么"而非仅被规定"做什么"；宪法直接用于构造合成训练数据（学习宪法内容、生成合规回答、排序候选回答）；以 CC0 协议公开，称为"living document"。配套 Alignment Science 博客文章 "Teaching Claude Why"。
- 来源：[CAI](https://arxiv.org/pdf/2212.08073)、[RLAIF](https://arxiv.org/pdf/2309.00267)、[Claude's new constitution](https://www.anthropic.com/news/claude-new-constitution)、[Teaching Claude Why](https://alignment.anthropic.com/2026/teaching-claude-why/)。

---

## 5. 参数高效微调与蒸馏

### 5.1 LoRA / QLoRA

- **LoRA**（2021-06，arXiv:2106.09685）：冻结 $W_0$，学低秩增量 $\Delta W = \frac{\alpha}{r} BA$（$B \in \mathbb{R}^{d \times r}$ 零初始化，$A$ 高斯初始化，$r \ll d$）。可训参数通常 **0.1–1%**；训完可合并进权重，推理零开销。$r$ 常用 8–64；$\alpha$ 是缩放系数（常取 $\alpha = 2r$ 或固定 16/32）。
- **QLoRA**（2023-05，arXiv:2305.14314）：基座量化为 4-bit **NF4** + 双重量化 + paged optimizer，LoRA 旁路仍是 bf16——单张 48GB 卡可微调 65B 模型（Guanaco），把微调门槛拉到消费级。

### 5.2 LoRA vs 全参微调的差距共识

- **"LoRA Learns Less and Forgets Less"**（2024-05，arXiv:2405.09673，TMLR，已核实）：Llama-2-7B 在代码与数学持续训练中，**标准低秩设置下 LoRA 明显学得少于全参**（差距在偏离预训练分布远的域最大，指令微调类任务差距小），但**遗忘也少**——域外能力保持更好、生成多样性更高；全参微调的权重扰动秩比典型 LoRA 高 **10–100 倍**。
- **"LoRA Without Regret"**（Thinking Machines Lab 博客，2025-09〔月份待核〕，已核实存在）：给出 LoRA 与全参**等效**的条件——(1) LoRA 加在**所有层**（尤其 MLP/MoE，attention-only 明显差）；(2) 学习率约为全参的 **10 倍**；(3) 中小数据 SFT 与**几乎所有 RL 场景**下小 rank 足够（RL 每 episode 只提供 O(1) bit 信息，容量需求极低）；(4) LoRA 对大 batch 更不耐受（建议有效 batch < 32〔待核具体阈值表述〕）。结论"RL 用 LoRA 不亏"对 2025–26 的低成本 RL 微调实践影响大（Tinker API 即基于此）。
- 综合共识：贴近预训练分布的任务（指令、风格、RL 偏好）LoRA ≈ 全参；注入大量新知识/远域持续训练仍需全参。

### 5.3 蒸馏

- **黑盒蒸馏**：只用教师的输出文本当 SFT 数据（Alpaca 传统、R1-distill）。**白盒蒸馏**：对齐教师的 logits/分布（KL 损失），需要拿得到教师权重——Gemma 2/3（从大 Gemini/Gemma 教师蒸 logits）、Qwen3 strong-to-weak（off-policy + on-policy 两阶段 logits 蒸馏）都用白盒。
- **R1-distill 系列**（2025-01，已核实）：用 DeepSeek-R1 生成的 **800k 样本**对 Qwen2.5（1.5B/7B/14B/32B）与 Llama3（8B/70B）做**纯 SFT 蒸馏，不含 RL**；小模型推理成绩大幅超越同尺寸直接做 RL 的结果——论文明确结论：小模型上"蒸馏 > 直接 RL"。
- **On-policy 蒸馏**（2025 趋势）：**学生自己采样轨迹，教师给每个 token 的分布/打分，用 reverse KL 逐 token 监督**——结合了 RL 的 on-policy（改自己会犯的错）与蒸馏的密集信号。Thinking Machines 博客（2025-10）的实验：Qwen3-8B 数学上达到教师水平的成本比纯 RL 低约一个数量级（第三方复现称比 off-policy 蒸馏省 ~30×、比 RL 省 50–100×〔数字待核，量级可信〕）；Qwen3 团队自己报告蒸馏比 RL 好且只需 ~1/10 GPU 时。
- **2026 行业结构**："大模型当教师、小模型当产品"已成主流分工：旗舰大模型（往往不直接大规模部署）承担教师/judge/数据工厂角色，产品线的小模型由蒸馏（黑盒 + on-policy）+ 少量 RL 得到——Qwen3（235B 教 0.6B–14B）、Gemma、GLM、MiMo 等公开报告均如此。
- 来源：[LoRA](https://arxiv.org/abs/2106.09685)、[2405.09673](https://arxiv.org/abs/2405.09673)、[LoRA Without Regret](https://thinkingmachines.ai/blog/lora/)、[On-Policy Distillation](https://thinkingmachines.ai/blog/on-policy-distillation/)、[DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1)。

---

## 6. 后训练全流程编排（2025–26 公开案例）

### 6.1 Llama 3 / 3.1（arXiv:2407.21783）

- 每轮：训 RM → 拒绝采样（每 prompt 采 K=10–30、RM 选优）→ **SFT** → **DPO**；共 **6 轮**，每轮补充新的人类偏好标注并从最新模型采合成数据。
- **Model averaging（已核实）**：在 RM、SFT、DPO 各阶段，把用不同数据版本/超参训出的多个实验模型做**参数平均**（souping）后进入下一步——merging 作为后训练正式工序的最著名公开案例。
- DPO 细节：屏蔽格式特殊 token 的 loss、加 NLL 正则项稳住生成〔待核细节表述〕。

### 6.2 Tülu 3（Ai2，arXiv:2411.15124）

- **SFT（~939k）→ length-normalized DPO（偏好对 27 万+，on-policy + off-policy 混合，prompt 池 30 万+）→ RLVR**（GSM8K/MATH/IFEval 等可验证任务，PPO，verifier 替代 RM）；RLVR 相对 DPO checkpoint 再提升约 1.3–3.3 分。8B/70B/405B 全套开源（配方、数据、代码），是最完整的公开复现管线。

### 6.3 Qwen3（arXiv:2505.09388）

- **四阶段（已核实）**：(1) **长 CoT 冷启动 SFT**（精选数学/代码/STEM 可验证题）→ (2) **推理 RL**（GRPO，可验证奖励）→ (3) **thinking mode fusion**（把非思考能力融合进思考模型，SFT 混合 thinking/non-thinking 样本，支持思考预算控制）→ (4) **general RL**（指令跟随、格式、偏好、agent 等 20+ 任务的综合奖励系统）。
- 小模型不走四阶段，用 **strong-to-weak 蒸馏**（教师 Qwen3-32B/235B）。

### 6.4 DeepSeek-R1（arXiv:2501.12948）

- **四阶段（已核实）**：(1) **冷启动 SFT**（数千条精修长 CoT）→ (2) **推理 RL**（GRPO + 语言一致性奖励）→ (3) **拒绝采样 SFT**（从 RL checkpoint 采样筛选 60 万推理样本 + 20 万非推理 = 800k，重训基座）→ (4) **全场景 RL**（推理题用规则奖励，通用题用 RM 做 helpfulness/harmlessness 对齐,即 RL+RLHF 混合）。

### 6.5 小版本迭代节奏（后训练已成"持续交付"）

- **DeepSeek-V3-0324**（2025-03）：**同一个 base**，只翻新后训练（吸收 R1 的 RL 技术），数学/代码大幅提升——"仅换后训练即换代"的最明确公开案例；同理 R1-0528。
- **Qwen3-235B-A22B-Instruct-2507 / Thinking-2507**（2025-07）：checkpoint 刷新 + 放弃混合思考模式改为分开发布——后训练配方按月迭代。
- 其他证据：Claude 3.5 Sonnet 的 2024-10 升级版（同名新 checkpoint）、GPT-4o 的多个日期快照、Llama 3 → 3.1。共同模式：预训练基座复用数月到一年,后训练以周/月节奏重跑。
- 来源：[Llama 3](https://arxiv.org/pdf/2407.21783)、[Tülu 3](https://arxiv.org/pdf/2411.15124)、[Qwen3](https://arxiv.org/pdf/2505.09388)、[DeepSeek 模型综述](https://www.bentoml.com/blog/the-complete-guide-to-deepseek-models-from-v3-to-r1-and-beyond)。

---

## 7. 对齐税与能力-对齐关系

### 7.1 概念现状（2025–26）

- 术语出自 InstructGPT：对齐后若干 NLP benchmark 回退，用 **PPO-ptx**（RL 中混预训练梯度）缓解。
- **经典意义上的对齐税已大幅缩水甚至反转**：RLVR 时代后训练本身就是能力（数学/代码/agent）的主要来源，"对齐使 benchmark 下降"不再是默认现象。
- 但税以新形式存在：**输出多样性/创造性下降**（RLHF 后同质化，"Creativity Has Left the Chat"，arXiv:2406.05587）、**谄媚**（sycophancy）、**过度拒绝**、风格模板化（"delve"现象）。2025-26 的讨论焦点从"能力税"转向"分布税/行为税"。

### 7.2 过度拒绝：公开数据

- **OR-Bench**（arXiv:2405.20947，ICML 2025）：8 万条"看似敏感实则无害"prompt + 1 千 hard 子集。实测（2024 模型代际）：Claude-3-Opus 在 hard 子集拒绝 **91%** 的安全提示，GPT-3.5-turbo-0301 拒 57.4%，Llama-3-70B 37.7%，GPT-4o 仅 6.7%。
- 关键发现：安全拒绝率与过度拒绝率的 Spearman 相关 **0.89**——大多数模型只是在同一条 trade-off 曲线上挪阈值，真正打破权衡（同时低过拒 + 高安全）的模型很少。
- 其他基准：XSTest（250 条安全但措辞敏感）、FalseReject（arXiv:2505.08054）。

### 7.3 各家 model card 的说法与修复

- **Claude 3**（2024-03 model card）：相对 Claude 2.1 **显著减少对无害请求的拒绝**，作为主打改进宣传;2026 版宪法进一步用"讲清 why"提升判断力而非规则堆叠。
- **Llama 3**（model card）：相对 Llama 2 **false refusal 大幅下降**（Llama 2 曾因拒绝"如何杀死 Python 进程"成为梗），内部建了 false-refusal 基准并专门做了缓解;第三方测量 Llama3 系列拒答率降到接近 0。
- **OpenAI**：o 系列的 **deliberative alignment**（2024-12，让模型推理时阅读安全规范做判断），GPT-5 的 **safe completions**（2025-08，从"拒绝/不拒绝"二元转向"在安全约束内尽量有帮助的输出"）〔细节待核〕——行业方向一致：用更聪明的判断替代模式匹配式硬拒绝，同时压过拒与越狱两头。
- 来源：[OR-Bench](https://arxiv.org/pdf/2405.20947)、[Claude 3 model card](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf)、[Llama 3 model card](https://github.com/meta-llama/llama3/blob/main/MODEL_CARD.md)。

---

## 附：本调研主要来源汇总

- InstructGPT: arXiv:2203.02155 | FLAN: 2109.01652 | T0: 2110.08207 | Flan Collection: 2301.13688
- LIMA: 2305.11206 | Revisiting SAH: 2410.03717 | Alpaca: crfm.stanford.edu/2023/03/13/alpaca.html
- SFT vs RL: 2501.17161 | RM overoptimization: 2210.10760
- DPO: 2305.18290 | IPO: 2310.12036 | KTO: 2402.01306 | SimPO: 2405.14734 | ORPO: 2403.07691
- DPO vs PPO: 2404.10719、2406.09279
- CAI: 2212.08073 | RLAIF: 2309.00267 | Claude 宪法: anthropic.com/constitution（2026-01 新版）
- LoRA: 2106.09685 | QLoRA: 2305.14314 | LoRA tradeoffs: 2405.09673 | thinkingmachines.ai/blog/lora/ | thinkingmachines.ai/blog/on-policy-distillation/
- Llama 3: 2407.21783 | Tülu 3: 2411.15124 | Qwen2.5: 2412.15115 | Qwen3: 2505.09388 | DeepSeek-R1: 2501.12948
- OR-Bench: 2405.20947 | FalseReject: 2505.08054 | Creativity: 2406.05587

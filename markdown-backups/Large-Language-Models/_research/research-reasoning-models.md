# 调研:推理模型的完整技术故事线(2022 CoT → 2026 现状)

> 调研日期:2026-07-20。用途:第四卷《后训练》推理章节素材。
> 分工说明:GRPO 变体(DAPO/GSPO/CISPO)、RLVR 形式定义、reward hacking 实例见 `research-rl-for-llm.md`,本文不重复,只在需要处给指针。
> 标注约定:〔待核〕= 未能从一手来源完全确认;其余关键数字均给出来源。

---

## 1. 思维链的发现史(2022–2023)

### 1.1 CoT prompting 的原始实验(Wei et al., 2022-01)

- 论文:*Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*,Jason Wei 等(Google Brain),arXiv:2201.11903,2022 年 1 月挂出,NeurIPS 2022。
- 核心做法:few-shot 示例里不只给「问题→答案」,而是给「问题→**中间推理步骤**→答案」,8 个手写示例(8-shot)。
- 标志性数字(GSM8K,数学应用题):
  - PaLM 540B 标准 prompting:**17.9%** → 8-shot CoT:**56.9%**(约 18%→57%);再加外部计算器后 **58%**,超过当时 SOTA(微调 GPT-3 + verifier)。
  - 来源:[arXiv:2201.11903](https://arxiv.org/pdf/2201.11903) 原文表格。
- **"涌现能力"的原始表述**:论文明确写 "chain-of-thought prompting is an **emergent ability of model scale**"——只在约 100B 参数以上的模型上产生正收益;小模型(<10B)写出的推理链流畅但逻辑错误,CoT 反而可能降低成绩。这一句是后来「推理是大模型专属」叙事的源头,也是后来被蒸馏工作(第 4 节)部分推翻的命题。
- 叙事要点:CoT 不是训练方法,是**纯 prompting 发现**——能力早已藏在预训练模型里,只是没人用对取出方式。这为「后训练 = 激发而非注入」的整卷主题埋下伏笔。

### 1.2 Zero-shot CoT:"Let's think step by step"(Kojima et al., 2022-05)

- 论文:*Large Language Models are Zero-Shot Reasoners*,Kojima 等(东京大学/Google),arXiv:2205.11916,NeurIPS 2022。
- 做法:不给任何示例,只在答案前加一句 "Let's think step by step"。
- 数字(InstructGPT text-davinci-002):MultiArith 17.7% → **78.7%**,GSM8K 10.4% → **40.7%**〔数字待核,方向与量级确定〕。
- 意义:证明触发推理的成本可以低到一句话;这句话后来成为整个领域的 meme,也是「推理行为是预训练自带、等待触发」的最强证据。

### 1.3 Self-consistency(Wang et al., 2022-03)

- 论文:*Self-Consistency Improves Chain of Thought Reasoning in Language Models*,Xuezhi Wang 等(Google),arXiv:2203.11171,ICLR 2023。
- 做法:同一问题采样多条推理链(如 40 条),对**最终答案做多数投票**(marginalize over reasoning paths)。
- 数字:PaLM 540B 上 GSM8K 由 CoT 的 56.5% 提到 **74.4%**(+17.9pp)〔待核,+17.9pp 为论文摘要口径〕。
- 意义:这是**并行 test-time scaling 的第一个系统性结果**——多花推理算力换准确率,比 o1 的串行 scaling 早两年半。majority voting 也从此成为推理评测的标准配置(R1 论文的 cons@64 即此)。

### 1.4 STaR:自举推理,RLVR 的思想前驱(Zelikman et al., 2022-03)

- 论文:*STaR: Self-Taught Reasoner — Bootstrapping Reasoning With Reasoning*,Zelikman、Wu、Mu、Goodman(斯坦福),arXiv:2203.14465,NeurIPS 2022。
- 循环:①让模型对训练集问题生成 rationale + 答案;②**只保留最终答案正确的 rationale**;③在这些自产数据上微调;④用新模型重复。对做错的题,把正确答案喂给模型让它「倒推」出 rationale(rationalization),补充困难样本。
- 结果:GPT-J 6B 经 STaR 后 CommonsenseQA 达 72.5%,接近大 30 倍的微调 GPT-3。
- **它确实是 RLVR 的思想前驱,核实成立**:「生成→按答案对错过滤→强化正确轨迹→迭代」在数学上等价于一种带二值奖励的策略迭代/拒绝采样微调(后来的 RFT、ReST、R1 的 rejection sampling SFT 都是同一族)。区别只在:STaR 用离线 SFT 实现「强化」,RLVR 用在线 RL 实现。o1 传闻中的 "Q*" 项目名与 STaR 的关联是坊间猜测,不必写实。
- 叙事要点:2022 年一年内,「写出推理过程」(CoT)、「投票」(self-consistency)、「按对错自举」(STaR)三块拼图齐了,缺的只是把它们放大一万倍的算力与决心——中间隔了两年。

### 1.5 2022→2024 的过渡(一段话即可)

Let's-verify-step-by-step(OpenAI 2023-05,过程奖励 PRM800K)、ToT/MCTS 类搜索、Q* 传闻(2023-11)构成中间地带;学界普遍以为通往推理的路是「PRM + 搜索」,结果 2024-09 揭晓的答案是「大规模结果奖励 RL」——这条被证伪的支线放在第 5、6 节讲。

---

## 2. o1 时刻(2024-09)

### 2.1 发布与官方口径

- 2024-09-12,OpenAI 发布 **o1-preview / o1-mini**,博文 *Learning to Reason with LLMs*。官方对训练方法只有一句:通过 **"large-scale reinforcement learning"** 训练模型在回答前生成长内部思维链("learns to hone its chain of thought and refine the strategies it uses");承认 RL 数据与方法细节不公开。CoT 对用户隐藏,只给摘要——这直接刺激了四个月后 R1「全部公开」的反差。
- 官方描述的涌现行为:模型学会**识别并纠正自己的错误、把难题拆步、在当前路径失败时换方法**——这段话后来被 R1 论文用实验复现。

### 2.2 两条对数线性曲线(本章最重要的图)

- 官方博文给出两张图:AIME 准确率分别随 **train-time compute** 和 **test-time compute** 的对数增长而近似线性上升("performance consistently improves with more reinforcement learning and with more time spent thinking")。
- 意义:宣告第三条 scaling 轴(test-time compute)存在,与预训练 scaling law 并列;「花更久思考」第一次被展示为可预测可购买的商品。
- 来源:[openai.com/index/learning-to-reason-with-llms](https://openai.com/index/learning-to-reason-with-llms/)。

### 2.3 关键数字(o1 vs GPT-4o,官方博文)

| 基准 | GPT-4o | o1 |
|---|---|---|
| AIME 2024 pass@1 | 12%(1.8/15) | **74.4%**(11.1/15);cons@64 83.3%;1000 样本重排 93% |
| Codeforces Elo | 808(11 百分位) | **1673(89 百分位)** |
| GPQA Diamond | ~50% | 超过人类博士水平(78%) |

o1-preview(实际先发布的版本)弱于正式版 o1,AIME 约 44%〔待核〕;正式版 o1 于 2024-12-05 随 ChatGPT Pro 上线。

### 2.4 o3:预告、ARC-AGI 与算力争议

- 2024-12-20("12 Days of OpenAI" 最后一天)**预告** o3;正式发布为 **2025-04-16**(o3 + o4-mini)。
- ARC-AGI 半私有集(核实,来源 [ARC Prize 官方博文](https://arcprize.org/blog/oai-o3-pub-breakthrough)):
  - 低算力配置:**75.7%**($10k 算力上限内,约 $20/任务);
  - 高算力配置(172× 算力):**87.5%**,首次跨过约 85% 的人类基准线;ARC Prize 估算高算力档约 **$3.4 万/任务** 量级。
- 争议三点:①「用天价算力暴搜」是否算推理能力;②该模型在 ARC 公开训练集上微调过(Melanie Mitchell 等批评);③2025-04 实际发布的 o3 是另一个更便宜的训练版本,ARC Prize 复测分数明显低于 12 月预告版〔复测具体数字待核〕。教学价值:test-time scaling 的收益真实存在,但**成本轴必须画在同一张图上**。
- 另一数字:o3 预告时 AIME 2024 96.7%、Codeforces Elo 2727([发布报道](https://www.arturmarkus.com/openais-o3-scores-87-5-on-arc-agi-96-7-on-aime-and-2727-codeforces-elo-announced-december-20-with-deliberative-alignment-safety-framework/))。

### 2.5 o 系列并入 GPT-5

- 2025-08-07 GPT-5 发布:官方定位「统一系统」= 快速模型 + 深度推理模型(GPT-5 thinking)+ **实时 router** 按问题复杂度/工具需求/用户意图分流;o3、o4-mini、GPT-4o 等从 ChatGPT 选择器中移除(用户抗议后短暂恢复旧模型)。o 系列作为独立产品线就此终结,「推理模型」从单独品类变成旗舰模型内置的一档能力。来源:[Introducing GPT-5](https://openai.com/index/introducing-gpt-5/)、[TechCrunch](https://techcrunch.com/2025/08/07/openais-gpt-5-is-here/)。

---

## 3. R1 时刻(2025-01-20)——重点

论文:*DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*,arXiv:2501.12948,与模型权重(MIT 协议)同日发布。它的历史地位:**第一次公开完整配方复现 o1**,把闭门四个月的谜底变成人人可跑的 baseline。

### 3.1 R1-Zero:纯 RL 实验设计

- 基模:**DeepSeek-V3-Base**(671B MoE,37B 激活),**跳过 SFT**,直接 RL。
- 算法:GRPO(数学见 RL 速成卷);奖励**纯规则**,不用任何神经奖励模型:
  - accuracy reward:数学题答案装 `\boxed{}` 规则判对错,代码题跑编译器/测试;
  - format reward:思考过程必须包在 `<think>…</think>` 里。
- 模板刻意极简:只要求「先推理后回答」,**不规定也不暗示任何推理策略**(不教反思、不教分步),让 RL 自己找——这是实验设计上最漂亮的一点:观察到的行为都是激励出来的,不是模仿出来的。

### 3.2 结果数字(核实,论文 §2.2 与 Table)

- AIME 2024 pass@1:**15.6% → 71.0%**,cons@64(majority voting)**86.7%**,追平 OpenAI o1-0912。已与任务要求核对一致,来源:[arXiv:2501.12948](https://arxiv.org/html/2501.12948v1)。
- 训练中的**响应长度曲线**:平均思考长度随 RL 步数近乎单调增长(从数百 token 涨到上万 token),论文称之为模型「自发学会用更长的思考时间解决更难的问题」——test-time scaling 不是外部旋钮,而是 RL 的自然产物。这张「长度随训练增长」图 + AIME 曲线图是 R1 论文被引用最多的两张图。

### 3.3 "Aha moment" 与后来的争议

- 原文(§2.2.4,Table 3)展示中间版本在解方程时突然插话:**"Wait, wait. Wait. That's an aha moment I can flag here."** 然后回头重审解法。论文作者称这也是他们自己的 aha moment:不用教方法,给激励,模型自己发展出反思与重试。
- **争议(必写)**:Sea AI Lab 的 *Understanding R1-Zero-Like Training: A Critical Perspective*(Dr. GRPO 论文,arXiv:2503.20783)及其博客 "There May Not Be an Aha Moment" 指出:①**基模(尤其 Qwen2.5 系)在 RL 之前就已表现出自我反思行为**("wait"、"let me check" 等模式在 base model 采样中已出现),RL 是放大器而非创造者;②响应长度增长的一部分是 GRPO 的长度归一化偏差所致(算法细节见 research-rl-for-llm.md,此处只给结论)。修正后的叙事:**RL 把预训练里低概率的反思模式变成高概率策略**——与第 6 节 pass@k 之争同构。
- R1-Zero 的实际缺陷:**语言混杂**(中英夹杂的思考)、可读性差——纯结果奖励不在乎人类是否读得懂。这是引出完整 R1 流水线的动机。

### 3.4 R1 完整四阶段流水线(每阶段数据量与目的,已核实)

1. **冷启动 SFT**:收集**数千条**(论文原话 "thousands of cold-start data")高质量长 CoT——来源包括 few-shot 长 CoT prompting、R1-Zero 输出的人工清洗改写——微调 V3-Base。目的:给 RL 一个可读、格式统一的起点,避免早期不稳定。
2. **推理导向 RL**:与 R1-Zero 相同的大规模 RL,增加**语言一致性奖励**(思考语言与题目语言一致的 token 占比)——牺牲一点点分数换可读性,直到收敛。
3. **拒绝采样 + 全场景 SFT(约 800k)**:用阶段 2 的 checkpoint 拒绝采样生成并筛选**约 600k 推理样本**(部分用 V3 做生成式判分;过滤语言混杂/超长/丑陋输出),加**约 200k 非推理样本**(写作、事实问答、翻译等,复用 V3 的 SFT 管线),合计 **~800k**,在 V3-Base 上重新 SFT 两个 epoch。目的:把推理能力与通用能力装进同一个模型。
4. **全场景二次 RL**:混合奖励——推理数据继续用规则奖励,通用数据用奖励模型(helpfulness 只评最终摘要,harmlessness 评全文含思考)。目的:对齐人类偏好,同时保住推理。
- 最终 R1:AIME 2024 pass@1 **79.8%**、MATH-500 97.3%、Codeforces Elo 2029(超 96.3% 人类选手),与 o1-1217 相当。
- 附:论文「失败尝试」一节明确报告 **PRM 与 MCTS 都没做成**(PRM 奖励 hacking 与步骤界定困难;MCTS 搜索空间爆炸、价值模型难训)——这是「过程奖励+搜索」路线在生产上被证伪的一手证词,与第 5、6 节呼应。

### 3.5 行业冲击(一句话级素材)

- 成本:API 定价约 $0.55/M 输入、$2.19/M 输出,约为 o1 的 1/27;训练成本叙事(V3 的 ~$5.6M GPU 租金口径)被媒体放大为「几百万美元复现 o1」。
- 开源:MIT 协议放出全部权重 + 蒸馏系列,一周内 HuggingFace 下载量破纪录,各云厂商争相托管。
- 股市:2025-01-27,Nvidia 单日跌约 17%,市值蒸发约 **$5890 亿**,美股史上最大单日个股市值损失;「DeepSeek 时刻」进入大众词汇。

---

## 4. 蒸馏推理:能力的第二次传播(2025)

### 4.1 R1-Distill 系列(R1 论文 §2.4)

- 做法:**纯 SFT**——用第 3.4 节的同一批 ~800k 样本直接微调 Qwen2.5(1.5B/7B/14B/32B)与 Llama-3.1-8B/Llama-3.3-70B,**不做任何 RL**。
- AIME 2024 pass@1(核实自论文表格):

| 模型 | AIME 2024 |
|---|---|
| Distill-Qwen-1.5B | 28.9% |
| **Distill-Qwen-7B** | **55.5%** |
| Distill-Qwen-14B | 69.7% |
| **Distill-Qwen-32B** | **72.6%** |
| Distill-Llama-8B | 50.4% |
| Distill-Llama-70B | 70.0% |

7B 超过 GPT-4o/Claude-3.5-Sonnet 的数学水平;32B 超过 o1-mini。1.5B 模型 28.9% 甚至高于 GPT-4o——2022 年「CoT 是 100B+ 涌现能力」的命题被彻底改写:**推理链一旦被大模型显式写出来,小模型学它并不需要涌现,只需要监督**。

### 4.2 「小模型直接 RL 不如蒸馏」

- R1 论文对照实验:对 Qwen-32B-Base 直接做大规模推理 RL(10k+ 步)得 DeepSeek-R1-Zero-Qwen-32B,AIME 约 47%,仅与 QwQ-32B-Preview 相当;而纯蒸馏的 Distill-Qwen-32B 达 72.6%。
- 论文结论原话(意译需注明):"distilling more powerful models into smaller ones yields excellent results, whereas smaller models relying on the large-scale RL mentioned in this paper require enormous computational power and **may not even achieve the performance of distillation**";并补充:要超越智能边界,仍需更强基模与更大规模 RL。
- 教学解读:RL 只能放大基模已有的模式;小基模里模式本身弱,放大器空转。与第 6 节 pass@k 之争同一逻辑。

### 4.3 少样本推理激活:s1 与 LIMO(2025 年初)

- **s1**(斯坦福,Muennighoff 等,arXiv:2501.19393,2025-01-31):**1000 条**精选样本(难度/多样性/质量三准则,蒸馏自 Gemini Flash Thinking)SFT Qwen2.5-32B-Instruct,16 张 H100 训 26 分钟;配合 budget forcing(见第 5 节)在 MATH/AIME24 上超 o1-preview 最多 27%,s1-32B AIME24 56.7%。来源:[arXiv:2501.19393](https://arxiv.org/abs/2501.19393)。
- **LIMO**(上海交大,arXiv:2502.03387):**817 条**样本,AIME 从基线 6.5% 提到 57.1%、MATH 94.8%〔数字待核,量级确定〕;提出 "Less-Is-More Reasoning" 假说:预训练已含全部知识,少量「认知模板」即可激活。
- 两者共同意义:把「激发 vs 注入」推到极端——**千级样本即可打开推理开关**(但天花板仍由基模决定,且这些模型在基模没见过的分布上仍脆弱)。

### 4.4 开源推理数据生态(2025–2026)

- **OpenR1**(HuggingFace 的 R1 复现工程):OpenR1-Math-220k 等数据集 + 完整训练管线。
- **OpenThoughts**(Stanford/UW 等,arXiv:2506.04178,ICLR 2026):系统化「数据配方」研究,OpenThoughts2-1M → **OpenThoughts3-1.2M**(产出 OpenThinker3-7B);结论包括:教师用 QwQ-32B 比 R1 效果更好、验证过滤收益有限等。
- 其他:OpenMathReasoning / OpenCodeReasoning(NVIDIA)、NaturalThoughts(Meta)、AM-Distilled-Dataset 1.4M 等;题源多来自 AoPS、Codeforces、StackOverflow。
- 格局:到 2026 年,「蒸馏一个会推理的小模型」已是数据工程问题而非研究问题;蒸馏 + 小规模 RL 精修成为开源社区标准流水线。来源:[OpenThoughts 论文](https://arxiv.org/pdf/2506.04178)。

---

## 5. 测试时计算的工艺(2024–2026)

### 5.1 三种形态与生产格局

1. **并行**:majority voting / self-consistency、best-of-N + verifier 重排(o1 博文的 "93% re-ranking 1000 samples" 即此)。
2. **串行**:更长的单条 CoT——o1/R1 的主形态,生产中的绝对主流。
3. **搜索**(ToT、MCTS + 价值模型):学界热、**生产中失败**——R1 论文明确报告 MCTS 尝试失败(§3.4 前述);各前沿实验室产品无一采用显式树搜索〔以公开信息论;Gemini Deep Think 的并行思考是否含搜索未公开〕。一条重要例外线:形式化定理证明(AlphaProof、2026 年 IMO 的 AxiomProver)仍依赖搜索,因为 Lean 提供了完美验证器。

### 5.2 Budget forcing 与 thinking budget

- s1 的 **budget forcing**:强行截断(注入终止)或强行延长——模型想停时抑制 end-of-thinking token 并追加 **"Wait"**,迫使复查;AIME24 上约 6 个 "Wait" 后饱和。用一个词实现了 test-time scaling 旋钮,是极好的教学案例。
- 产品化形态:OpenAI 的 `reasoning_effort`(low/medium/high,GPT-5 后为 minimal→xhigh 档位)、Claude 的 thinking budget(token 上限)与 effort 参数、Gemini 的 thinking budget、Qwen3 的 thinking budget。本质都是「买多少思考」的计费界面。

### 5.3 Overthinking 与 adaptive thinking 的兴起

- **Overthinking 问题**:*Do NOT Think That Much for 2+3=?*(arXiv:2412.21187,2024-12)首先系统量化:o1 类模型在 "2+3" 上也生成数百 token、反复验算;后续大量工作(survey:*Towards Concise and Adaptive Thinking in Large Reasoning Models*,arXiv:2507.09662)确认:每类任务存在最优思考长度,超长推理不单调涨分甚至掉分。
- 2025–26 各家 adaptive 形态(按公开资料):
  - **Anthropic**:extended thinking(2025-02,Claude 3.7 起,可见思考+预算)→ adaptive thinking:Opus/Sonnet 4.6 起模型自主决定是否思考、思考多深,并自动启用 interleaved thinking;**Fable 5 为 always-on adaptive thinking**(不再有开关,模型按难度自适应)。
  - **OpenAI**:GPT-5 的**实时 router** 在快模型与 thinking 模型间自动分流("auto thinking"),用户切换行为与正确率信号持续训练 router。
  - **Google**:Gemini 2.5/3.x 的 thinking 默认开 + **Deep Think** 高档位(并行思考,IMO 金牌配置,见第 8 节)。
  - **Qwen3**(2025-04):单模型融合 thinking/non-thinking,`/think` `/no_think` 开关 + thinking budget;**但 2025-07 起放弃融合**,2507 系列拆回独立的 Instruct 与 Thinking 模型——官方理由是融合损害质量(社区实测混合模式不如 Qwen2.5 同级)。来源:[ActuIA 报道](https://www.actuia.com/en/news/alibaba-launches-qwen3-235b-a22b-instruct-2507-and-breaks-away-from-hybrid-reasoning/)。
  - **DeepSeek V3.1**(2025-08):反向选择——把 V3 与 R1 **合并为双模式混合模型**(think/non-think 同一权重);V3.2 延续。
  - 好素材:同一年内 Qwen 拆、DeepSeek 合,说明「混合思考」的最优解 2025 年并无共识;2026 年趋势偏向 Anthropic 式「模型自己决定」而非「用户开关」。
- 学术侧:AdaptThink(arXiv:2505.13417)、AdapThink(ACL 2026)等用 RL 训练「何时思考」的选择本身。

### 5.4 Interleaved thinking:2026 年已成主流(核实)

- 定义:思考块与工具调用交错(想→调工具→看结果→再想),取代「一次想完再行动」。
- 现状:Claude 自 4 系起支持、adaptive thinking 下自动启用;GPT-5 系在 agentic 场景默认推理与工具交错;Kimi K2/K3、GLM-4.5+、MiniMax 等开源模型 2025 下半年起原生支持;训练侧出现直接奖励中间行动的 RL 目标(*Interleaved Reasoning via RL* 等)。**结论:到 2026 年,interleaved thinking 是 agent 场景的默认形态**,「纯串行长 CoT」退为数学/证明类任务的特例。来源:[Medium 综述](https://krayush.medium.com/interleaved-thinking-in-llms-for-llms-97bf8f347fec) 及各家文档。

---

## 6. 推理 RL 的科学(2025–2026)

### 6.1 pass@k 之争:RL 是否只是提炼已有能力

- 引爆点:*Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?*(清华,Yue 等,arXiv:2504.13837,2025-04):RLVR 模型 pass@1 更高,但 **k 大时(数百到 1024)基模 pass@k 反超**;RLVR 模型解对的题几乎是基模可解题的子集→结论:当前 RLVR **收窄分布、提高采样效率,不创造新推理模式**;蒸馏反而能引入新模式。
- 反驳与修正(2025 下半年–2026):
  - **ProRL**(NVIDIA,arXiv:2505.24864):把 RL 拉长到 2000+ 步(KL 重置 + 参考策略重置 + clip-higher),1.5B 模型在部分任务上 pass@128 也超基模,且基模 pass@k 为 0 的题出现非零解——主张「之前看不到扩边,是因为训得不够久、域不够广」。
  - 2026 年后续:多篇工作把分歧归因于**过训练动态**而非原理不可能——分类别隔离更新可使困难基准 pass@256 超基模;*Understanding Diversity Collapse in RLVR via the Lens of Overtraining*(arXiv:2606.15455)、*SFT Overtraining Predicts Rank Inversion via Entropy Collapse Under RLVR*(arXiv:2606.18487)等指出 pass@k 倒挂与熵/多样性坍缩强相关,可通过训练策略缓解。
- 2026 年的平衡表述(供成书):**短训 RLVR ≈ 分布锐化;长训 + 熵管理 + 新鲜任务分布下,边界扩张可测但昂贵**;而「真正的新能力」大头仍来自更强基模与蒸馏。争论已从「是/否」细化为「在什么预算与数据分布下」。

### 6.2 熵坍缩与探索

- 现象:RLVR 训练中策略熵快速塌陷→输出趋同→pass@k 与后续提升封顶。Cui 等 *The Entropy Mechanism of RL for Reasoning LMs*(arXiv:2505.22617)给出经验规律 R = −a·e^H + b:性能天花板由熵轨迹**可预测**,熵耗尽则收益耗尽。
- 工程对策(指针即可,算法细节在 research-rl-for-llm.md):clip-higher(DAPO)、KL/参考重置(ProRL)、只调高协方差 token 的熵正则、clip-low/high 的熵效应分析(arXiv:2509.26114)、on-policy entropy flow(arXiv:2605.11491,2026)。2026 年「熵预算管理」已是推理 RL 训练监控的标配仪表盘项。

### 6.3 过程 vs 结果奖励:2026 年实际格局

- 生产主流:**可验证结果奖励一统数学/代码**(R1 证伪 PRM+MCTS 之后);PRM 作为 RL 奖励信号在前沿实验室基本退场〔以公开信息论〕。
- PRM 的幸存生态位:①test-time 重排/引导(best-of-N 打分);②数据筛选;③生成式 RM / rubric-based rewards——把「过程质量」写成可核查的评分细则交给 LLM 判官,用于不可验证域(写作、agent 轨迹),这是 2025-26 增长最快的方向;④Conditional Reward Modeling 等把过程与结局显式挂钩的 2026 新工作。survey:arXiv:2510.08049。
- 一句话格局:**结果奖励管「对不对」,rubric/GenRM 管「好不好」,纯步骤级 PRM 退居辅助**。

### 6.4 长度与质量

- 共识(2025-26 多篇):正确解通常比错误解短(同题条件下);长度增长有「有效反思」与「无效绕圈」两种成分;GRPO 类目标存在使错误答案变长的偏差(Dr. GRPO 的修正,见另一调研)。最优长度依任务而异——由此催生 5.3 的 adaptive thinking 与「长度惩罚/长度预算」奖励项。overthinking survey(arXiv:2507.09662)可作为该小节的总来源。

### 6.5 Curriculum:由易到难

- 实践:R1 类训练普遍做**难度过滤**(丢弃全对/全错、GRPO 零优势的题——DAPO 的 dynamic sampling 属此,见另一调研);进阶为显式课程:E2H(arXiv:2506.06632)证明由易到难课程能以更少样本达到直接训练达不到的水平;SEC(Self-Evolving Curriculum,arXiv:2505.14970)把难度分布本身当 bandit 在线调;online difficulty filtering(arXiv:2504.03380)按实时通过率维持「50% 左右可解」的甜点区。
- 2026 年状态:静态三段式课程(易→中→难)+ 在线通过率过滤是开源配方常态;「课程即数据调度器」并入更大的 RL infra 议题。

---

## 7. 编程与 agent 能力的训练(2024–2026)

### 7.1 SWE-bench Verified 分数轨迹(核实关键点)

| 时间 | 模型/系统 | SWE-bench(Verified 除注明) |
|---|---|---|
| 2023-10 | GPT-4(原始 SWE-bench 全集,RAG 式) | ~1.7%(非 Verified,全集口径) |
| 2024-03 | Devin(agent 化第一枪,全集子集) | 13.9% |
| 2024-08 | Verified 子集发布(500 题人工核验);GPT-4o 当时 | ~33%(agentless 类脚手架) |
| 2024-10 | Claude 3.5 Sonnet (new) | ~49% |
| 2025-02 | Claude 3.7 Sonnet | 62-70%(含 custom scaffold 高配) |
| 2025-05 | Claude 4 Opus/Sonnet | **~72-73%**(高算力配置 79%+) |
| 2025-11 | Claude Opus 4.5 | 80.9%(首破 80%) |
| 2026-07 | 前沿档(Claude Fable 5 / Mythos 5、GPT-5.5/5.6) | **~88-95%,基准视为饱和** |

- 2026-07 快照:Claude Fable 5 约 95%、GPT-5.5 88.7%、Opus 4.8 88.6%、Gemini 3.1 Pro 80.6%(不同 harness 口径有差;普遍认为 Verified 已饱和且有污染争议,排名意义转移到 SWE-bench Pro,前沿约 55-70%,Opus 4.8 领跑 69.2%)。来源:[SWE-bench Pro leaderboard](https://www.morphllm.com/swe-bench-pro)、[steel.dev leaderboard](https://leaderboard.steel.dev/leaderboards/swe-bench-verified/)、[codeant 综述](https://www.codeant.ai/blogs/swe-bench-scores)。〔2024 年以前各点为混合口径,成书时注明口径差异〕
- 叙事:三年从 2% 到 95%——**推理 RL + agent 脚手架 + 环境训练**三浪叠加的结果,是「基准生命周期」的最佳案例。

### 7.2 代码 RL 的训练方式

- **SWE-RL**(Meta,arXiv:2502.18449):第一个把 RLVR 规模化到真实软件工程——从 GH Archive 的 460 万 repo 抽取 issue→PR 轨迹,奖励 = 生成 patch 与真实合并 patch 的**相似度**(格式错 −1),GRPO 训练;Llama3-SWE-RL-70B 达 Verified 41.0%,当时开源 SOTA,且泛化提升了数学/通用推理。来源:[arXiv:2502.18449](https://arxiv.org/abs/2502.18449)。
- 更主流的路线:**测试驱动奖励**——在可执行环境里跑单元测试/隐藏测试作为奖励(DeepSeek、Qwen、Kimi 系公开报告均此;相对 SWE-RL 的文本相似度,执行奖励更抗 hacking 但更贵)。2026 年补充:execution-free 奖励模型(SWE-RM,arXiv:2512.21919)试图省掉执行成本。

### 7.3 多轮 agentic RL 与「环境即数据」

- 从单轮(给上下文出 patch)转向**多轮工具调用轨迹的端到端 RL**:模型在容器里 bash/编辑/跑测试,按最终 issue 解决与否回传奖励(轨迹级 GRPO 变体;Kimi K2、GLM-4.5、Qwen3-Coder 等开源报告均描述了大规模可执行环境集群)。
- **「环境即数据」成为 2026 年口号**:评测集不够训,RL 需要可再生的任务工厂——Endless Terminals(arXiv:2601.16443)程序化生成终端任务无需人工标注;SETA、Terminal-World(arXiv:2605.20876)等环境合成管线;创业公司出售「RL 环境」成为新市场。教学表述:**预训练吃 token,推理 RL 吃环境;环境工程之于 2026,如同数据工程之于 2023**。
- Computer use:Anthropic 2024-10 首发 computer use API(OSWorld 14.9%),训练细节各家均不公开,公开信息限于「与 agentic RL 同框架,GUI 轨迹 + 任务完成奖励」〔训练方法细节待核,基本无一手来源〕;2026 年 OSWorld 前沿约 60%+〔待核〕。

### 7.4 2026 年 agent 能力刻度

- **Terminal-Bench 2.0**(89 个人工核验终端任务):2026-07 榜首 GPT-5.6 Sol 91.9%,Claude Mythos 5 88.0%,Kimi K3 88.3%(自报)。来源:[BenchLM](https://benchlm.ai/benchmarks/terminalBench2)。
- **METR 时间跨度曲线**(核实,最重要的宏观刻度):
  - 原始结果(2025-03,*Measuring AI Ability to Complete Long Tasks*):模型能以 50% 成功率完成的任务时长(以人类耗时计)2019-2024 每 **~7 个月**翻倍。
  - **TH1.1 更新(2026-01-29)**:全历史倍增期 188 天(6.3 个月);2023 起 129 天;**2024 起仅 89 天(约 3 个月)**——加速而非放缓。
  - 最新数据点:METR 2026-05 前沿风险报告,2026 年 2-3 月与四家实验室试点,最强模型 50% 时间跨度估计 **约 16-20 小时**,并警告 >16h 的估计因任务池饱和不可靠。
  - 来源:[METR TH1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)、[METR time horizons](https://metr.org/time-horizons/)。
- 长时程能力的定性变化:2025 年「几十分钟任务」→ 2026 年「工作日级任务」(多会话、自主分解、中途自纠);这是第 8 节「推理与 agent 融合」的量化基础。

---

## 8. 2026-07 推理模型现状快照

### 8.1 最新一代与推理定位(2026-07 时点)

| 家族 | 当前旗舰(2026-07) | 推理相关定位/公开数字 |
|---|---|---|
| OpenAI | GPT-5.5 / **GPT-5.6**(Sol/Terra/Luna 分档) | 5.6 发布时不再报经典学术基准,只报 agentic 指标(Agents' Last Exam、Terminal-Bench 91.9%);GPT-5.5 Pro FrontierMath Tier-4 39.6%、HLE(带工具)57.2% |
| Anthropic | Claude Opus 4.8、**Claude Fable 5**(Mythos 5 预览中) | Fable 5:always-on adaptive thinking,HLE(带工具)64.5%,SWE-bench Verified ~95%;定位「推理内化于 agent 行为」 |
| Google | **Gemini 3.1 Pro** + Deep Think 档 | GPQA Diamond 94.3%、ARC-AGI-2 77.1%、HLE 44.4%;科学推理与多模态最强档 |
| DeepSeek | **V4-Pro / V4-Flash**(2026-04-24,MIT,1.6T/49B 激活) | reasoning-effort 档位制;LiveCodeBench 93.5(全场第一)、GPQA 90.1、HMMT'26 95.2、IMOAnswerBench 89.8;R2 至今未发布(R 线并入 V 线双模式) |
| Moonshot | **Kimi K3**(2.8T MoE,权重承诺 2026-07-27 放出) | agentic 最强开源:Terminal-Bench 88.3%、HLE 56%、GPQA 93.5% |
| 智谱 | **GLM-5.2**(权重已放) | Terminal-Bench 81%、HLE 54.7%,主打性价比 agent |

来源:[felloai 汇总](https://felloai.com/best-ai-models/)、[techjack 对比](https://techjacksolutions.com/ai-tools/anthropic-claude/fable-5-vs-gpt-5-5-vs-gemini-3-1-pro/)、[morphllm V4](https://www.morphllm.com/deepseek-v4)、[Kimi K3 blog](https://www.kimi.com/blog/kimi-k3)、[BenchLM GLM vs K3](https://benchlm.ai/compare/glm-5-2-vs-kimi-3)。〔第三方榜单口径互有出入,成书引用时以各官方技术报告为准〕

### 8.2 基准的代际更替

- **AIME 已饱和**:前沿模型 95-100%,2026 年起仅在开源小模型报告中出现;竞赛数学的活基准转为 HMMT/IMOAnswerBench/FrontierMath。
- 现役天花板基准:**HLE**(Humanity's Last Exam,前沿带工具 44-65%)、**FrontierMath**(Tier-4 前沿 ~40%)、**ARC-AGI-2**(~77% 最高)、SWE-bench Pro、Terminal-Bench 2.0、Agents' Last Exam。特征:从「题目难」转向「任务长 + 工具真」。

### 8.3 IMO:2025 金牌与 2026 满分事件

- **2025-07(需写实的里程碑)**:Google DeepMind 的 **Gemini Deep Think 高级版**与 **OpenAI 实验推理模型**分别在 IMO 2025 达金牌线——各 **35/42**(解出 5/6 题),自然语言作答、4.5 小时规则内;DeepMind 为官方认证,OpenAI 为自评(引发时序与评分礼仪的争议,Gary Marcus 等评论)。同年 11 月,**DeepSeek-Math-V2** 成为首个达 IMO 金牌线的开源权重模型。来源:[DeepMind 官方博文](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)。
- **2026-07(刚发生,写作时注意时效)**:IMO 2026(上海,7-15/16 考试)——**AxiomProver(Axiom Math,Lean 4 多智能体证明系统)公布 42/42 满分**,六题全解并给出形式化 Lean 证明(GitHub 公开);为**独立评测而非 IMO 官方认证**,各大实验室是否有官方合作结果尚未见公告〔事件极新,细节与官方认证状态待核;赛前 Manifold 对"AI 满分"定价 96%〕。来源:[AxiomMath/IMO2026 GitHub](https://github.com/AxiomMath/IMO2026)、[Tech Insider](https://tech-insider.org/ai-imo-2026-perfect-score-odds-hit-96-percent/)。
- 叙事价值:2024 AlphaProof 银牌(形式化)→ 2025 自然语言金牌(通用 LLM)→ 2026 形式化满分——两条路线(自然语言推理 vs 形式化验证)在竞赛数学上会师。

### 8.4 「推理」与「agent」的融合(收束全章的表述)

- 2024:推理 = 独立产品线(o1 vs GPT-4o 双轨)。2025:推理 = 旗舰内一档(router/开关/预算)。**2026:推理 = agent 的内部过程**——thinking 与工具调用交错、模型自主决定思考深度、发布物不再报「推理基准」而报「任务完成」;RL 的对象从「一条 CoT」变成「一段与环境的交互史」。
- 供成书的收束句素材:o1 证明了「想得久」有价值,R1 证明了「想得久」可以被激励且人人可复现,2026 年的问题已不是「模型会不会想」,而是「想完之后能替你做完多少小时的活」——METR 曲线(50% 成功率任务时长 ~3 个月翻倍)就是这句话的坐标系。

---

## 附:本文与其他调研的接口

- GRPO 数学与 DAPO/GSPO/CISPO、RLVR 定义、reward hacking 案例、Dr. GRPO 的算法细节 → `research-rl-for-llm.md`
- V3/V4、K3、GLM 等模型架构与发布谱系 → `research-model-landscape.md`
- 本文可直接支撑的章节切分建议:①CoT 史前史(§1)→ ②o1(§2)→ ③R1 精读(§3-4)→ ④test-time 工艺(§5)→ ⑤推理 RL 的开放问题(§6)→ ⑥从推理到 agent(§7-8)。

# 调研清单：2026 产业地图收官章——宏观趋势、开放争论与未来不确定性

> 用途：第六卷《2026 产业地图》收官章素材（回望全书、展望未来，面向大二 CS 学生读者）。
> 知识截止 2026-01；2025 之后事实均来自 2026-07-20 联网检索，逐条标来源与日期。
> 不确定或未二次核实的条目标 〔待核〕。前卷（P1–P5）已覆盖的技术细节此处不重复，只做"最新进展 + 产业/社会层面"的更新。
> 检索日期：2026-07-20。

---

## 第 1 节　scaling 之争的最新进展

### 1.1 前卷已建立的证据链（此处仅作锚点，不展开）
- Ilya Sutskever，NeurIPS 2024："pretraining as we know it will end"，"2010 年代是 scaling 的时代，如今我们回到了 wonder and discovery 的时代"。
- GPT-4.5 反响平淡、GPT-5 算力路线相对收敛——前卷已论。

### 1.2 预训练 scaling 是否见顶：2026 年的共识
- **主流判断：不是"能力见顶"，而是"某一条特定路径见顶"**。多篇 2026 年综述的措辞高度一致——"naive pretraining is plateauing, but test-time compute and reasoning chains are genuinely new"；"我们撞上的不是能力的硬天花板，而是'把模型做得更大、喂更多互联网文本'这一具体方法的极限"。来源：buildfastwithai《LLM Scaling Laws Explained (2026)》；MindStudio《AI Scaling Laws Are Breaking Down (2026)》。
- **具体的递减拐点数据**（按任务类别）：知识类任务（MMLU）在约 **30B** 参数以上收益明显递减；推理类任务（GSM8K）在约 **70B+** 参数附近趋于平台；部分任务（类比推理）随规模"无可靠提升"。来源：aimultiple《LLM Scaling Laws: Analysis from AI Researchers (2026)》。〔待核：这些拐点具体数值来自二手综述，原始出处需再确认〕
- **数据墙**：预训练的高质量文本数据正成为真实上限，多篇 2026 综述预计"到 2026 年 Transformer 纯 scaling 撞上数据枯竭"，架构创新因此从"可选"变"必需"。来源：labs.adaline.ai《Beyond Transformers (2026)》。

### 1.3 第二条曲线——RL scaling 走到哪了
- **关键新证据：RL 的 compute–performance 曲线是 S 形（sigmoidal），有渐近上限**。论文《The Art of Scaling Reinforcement Learning Compute for LLMs》（arXiv:2510.13786，约 2025-10，40 万+ GPU-hours 的系统研究）核心发现：
  - RL 训练的算力–性能关系可用 **sigmoidal 曲线**拟合——即存在一个渐近上限 A，与预训练"幂律、在可观测范围内看不到明显天花板"形成对比。
  - "not all recipes yield similar asymptotic performance"——不同配方决定不同的天花板高度。
  - 提出最佳实践配方 **ScaleRL**，并演示可预测性：单次 RL run 外推到 **10 万 GPU-hours** 仍能预测验证集性能。
  - 重要区分：loss aggregation、归一化、curriculum、off-policy 算法等实现细节"主要改变算力效率，而不改变渐近线"——即 RL scaling 比预训练更吃算法选择，但天花板由配方而非细节决定。
  - **给读者的直觉**：预训练像"越充气越大的气球（幂律）"，RL 更像"逼近饱和的 S 曲线"——这正是"新曲线也终将递减"的直接证据。
- **另一份 2026 论文**《Scaling Behaviors of LLM RL Post-Training》：RL post-training 可用跨 base/instruct 模型的预测性幂律建模，但同时识别出"latent saturation trend——更大的模型学习效率更高，但收益随规模增长而递减"。来源：见 1.2 检索返回摘要。〔待核：确切标题/会议/作者〕

### 1.4 第三条曲线——test-time / 推理期 scaling
- test-time compute（"让模型答题时想得更久"）被普遍视为 2024 年 o1 以来最实打实的新维度。2026 年的问题已从"能不能 scale"转向"边际何时递减"。
- **饱和信号来自评测端**：METR 报告其长任务基准正被前沿模型饱和（见第 3 节），侧面说明 test-time + agent 能力的增长快到"测不准"——这既是能力仍在涨的证据，也是"我们缺乏能衡量下一段增长的标尺"的警示。

### 1.5 有没有"第四条 scaling 曲线"的讨论
- **没有形成公认的"第四条曲线"命名**，但候选轴线的讨论活跃：
  - **合成数据 / 数据质量轴**（用模型生成训练数据绕过数据墙）；
  - **agent / 工具使用轴**（把算力花在多步交互、工具调用、环境反馈上）；
  - **持续学习 / 记忆轴**（把"部署后仍在学"当作新的增长维度，见第 2 节）。
- 更主流的框架是 Hassabis 式判断："下一波增长来自**定向的算法突破**（continual learning、memory、world models、reasoning/planning、hybrid systems），而非继续放大现有系统"。来源：Fortune Davos 2026-01-23；labs.adaline.ai。
- 〔待核：是否有人明确用"the fourth scaling curve"措辞——检索未见权威出处，写作时宜表述为"关于新增长轴的讨论"而非坐实"第四条曲线"〕

---

## 第 2 节　下一个范式跃迁的候选

> 总基调（多篇 2026 综述一致）：Transformer 纯 scaling 让位于"多条架构创新并行"；memory、architecture、agency 三者"同时成熟"的收敛叙事很有说服力，但仍属部分预测性。来源：labs.adaline.ai《Beyond Transformers (2026)》。

### 2.1 持续学习 / continual learning（解决"静态权重"）
- **问题**：现有系统能推理出复杂问题的解，却"记不住"——在新数据上训练会覆盖旧知识（catastrophic forgetting，灾难性遗忘），这一顽疾困扰领域数十年。
- **2026 年的乐观信号**：
  - Anthropic 研究员 **Sholto Douglas**（No Priors 播客）：continual learning "will be solved in a satisfying way" 在 2026 年内。
  - Anthropic CEO **Dario Amodei**：这个问题"will turn out to be not as difficult as it seems"。
- **代表工作**：Google **Nested Learning** 范式 + **HOPE** 概念验证（NeurIPS 2025）；**Titans** 架构（带可学习长期记忆模块，2024-12）。
- **热度判断**：真进展方向，被 Hassabis 列为 AGI 关键缺口之一。但"2026 年内解决"目前仍是从业者预测，非既成事实。来源：labs.adaline.ai；nextbigfuture《2026 is Breakthrough Year for ... Continual Learning Prototypes (2026-04)》。〔待核：Douglas/Amodei 原话上下文〕

### 2.2 世界模型 / world models
- **定义对照**：LLM 预测"下一个词"，world model 预测"下一帧（时空）"，建立对物理/数字世界如何运作的内部表征。
- **代表工作与时间线**：
  - Google DeepMind **Genie 3**（2025-08）：实时生成可交互 3D 环境，约 **24 FPS**；"生成运动中的环境，而非静止快照"。
  - 李飞飞 **World Labs / Marble**（2025-11 商用发布，融资 **$230M**，公司此前估值报道见来源）：从单张图或文字/图/视频/空间草图 → 持久、可在浏览器/VR 中导航的 3D 世界；输出 **Gaussian splats**（可视化）+ collision mesh（供物理引擎）。李飞飞称其为"迈向真正空间智能世界模型的第一步"，并撰《A Functional Taxonomy of World Models》将世界模型分为三类。
  - Meta **V-JEPA 2**（2026-01）：在陌生物体的 pick-and-place 机器人任务上 **65–80%** 成功率。
- **重大人事信号**：**Yann LeCun 离开 Meta** 创办新实验室（报道称 **AMI Labs**，寻求 $5B+ 估值），全力押注 world model / JEPA 路线——被视为对该范式的重大机构级背书。来源：labs.adaline.ai；TechCrunch（2025-11-12）；bdtechtalks；drfeifei.substack。〔待核：LeCun 新公司确切名称与估值数字，多处措辞不一〕
- **热度判断**：真进展 + 已有商用产品；但"LLM 单独能否达到 AGI，还是必须有物理 grounding"仍是哲学争论。

### 2.3 具身智能 / 机器人（VLA 模型）
- **2026 年 VLA 井喷**：Physical Intelligence（π 系列，含 **MEM / MemER**）、NVIDIA **DreamZero**、Ant Group（Causal World Modeling 等）、Qwen **VLM4VLA**、AMap **ABot-M0** 等密集发布；**LingBot-VLA 2.0**（2026-07 开源升级，主打形态泛化、DoF 支持、部署效率）。
- **产业信号**：行研报告《Embodied AI Robot Large Model (Including VLA) 2026》——"world models 即将成为标配，OEM 入场并加速量产落地"。来源：GlobeNewswire（2026-05-13）。
- **真实短板**：VLA 仍难应对物理世界的高多样性/不确定性，更像"模仿训练数据中的模式"，缺乏对动作后果的预见与物理逻辑的理解。来源：VLA 综述与 roboticstomorrow。
- 〔待核：Google **Gemini Robotics**、Figure、Tesla Optimus 的 2026 具体进展——本轮检索未返回，写作前建议补检〕

### 2.4 其它候选
- **混合 / 替代架构**：Mamba、Mamba-2（线性时间、约 5× 推理吞吐）、JEPA、diffusion 组件；产品化案例 IBM **Granite 4.0**、Mistral **Codestral Mamba**。近期路线被概括为"Transformer + Mamba/JEPA/diffusion 的 hybrid（2026–2027）"。
- **推理蒸馏**：o3-mini（2025-01，成本约 1/15、速度约 5×，性能匹敌 o1）；Gemini 3 Flash 被披露为"agentic RL distilled model"（2025-12，Ankesh Anand）。说明"智能不只由参数量决定"。
- **神经符号 / 推理架构**：ARC-AGI-3（arXiv:2603.24621）等把"agentic 推理"作为新挑战基准；neurosymbolic 常与 world model、memory augmentation 并列为"Transformer 之外的必要拼图"。〔待核：2026 神经符号代表工作，检索较弱〕
- **agent 作为新范式**：论文《From Chatbot to Digital Colleague: The Paradigm Shift Toward Persistent Autonomous AI》（arXiv:2606.14502）。Gartner 预测 **2026 年中 40%** 企业应用嵌入 agent，但也预测 **到 2027 年 40%** 的 agent 项目因成本与 ROI 不清被取消——"原型到生产"的鸿沟仍大。

### 2.5 真突破 vs 炒作（一句话判断）
- **较实**：world models（已有商用）、continual learning（强势进展但未落地）、推理蒸馏（快速见效）。
- **可信但有 ROI 缺口**：agent 生产化。
- **必要但仍早期**：hybrid/替代架构（数据墙倒逼）、具身 VLA。
- **争论未决**：LLM 是否 AGI 充分条件（LeCun 阵营坚决否）。

---

## 第 3 节　AGI / 超级智能的时间表讨论

### 3.1 2026 年主要人物公开表态
- **Davos 2026（Fortune，2026-01-23，同台/同期发言）**：
  - **Demis Hassabis（DeepMind）**：当前系统"nowhere near"人类级 AGI；十年内达成概率约 **50%**；"maybe we need one or two more breakthroughs"；点名缺口——few-shot 学习、持续学习、更好的记忆、更强推理。
  - **Yann LeCun（离开 Meta）**：LLM 无法达到人类式智能，需"根本不同的方法"；"language is easy"、真正难的是理解物理世界（所以还没有家用机器人和 L5 自动驾驶）；批评业界"completely LLM-pilled"；若采纳新方法，人类级 AI 或 **5–10 年**。
  - **Dario Amodei（Anthropic）**：最乐观——AI **一年内**取代所有软件开发者、**两年内**达到"Nobel-level"科研、**五年内** 50% 白领岗位消失；Anthropic 向美国 OSTP 的正式意见书称强大 AI 将在 **2026 年底 / 2027 年初**出现。
  - **Sam Altman（OpenAI，未出席）**：此前称我们"已在滑向超级智能"（比全体人类加起来更聪明）；AGI 大概率在本届总统任期内（约 **2026–2028**）出现。
- **关键 reframing（写作可用的金句结构）**："当 Altman 说 AGI 临近、LeCun 说 AGI 不可能，他们未必在争同一件事——他们在争**该把哪件事叫做 AGI**。" 来源：多篇 2026 综述与 Fortune。

### 3.2 乐观派 vs 怀疑派
- **乐观派**：Altman、Amodei（近期 2026–2027 窗口）；Hassabis 属"谨慎乐观"（十年 50%，且强调需架构突破）。
- **怀疑派**：**LeCun + Gary Marcus**——现有架构原则上到不了 AGI，需换范式；强调"炒作与现实之间不适的鸿沟"。来源：medium/aftab《AGI: How Far Are We Really?》。

### 3.3 能力增长曲线对时间表的暗示（METR）
- **doubling 速率**：2019–2024 约每 **7 个月**翻倍；2023 年起数据约每 **130.8 天（≈4.3 月）**；仅看 2024+ 模型约每 **88.6 天（≈3 月）**。来源：METR Time Horizon 1.1（2026-01-29）。
- **前沿模型 50% 时间跨度**（TH1.1，2026-01）：Claude Opus 4.5 = **320 分钟**；GPT-5 = **214 分钟**；o3 = **121 分钟**；Claude Opus 4 = **101 分钟**。
- **更晚数据**：Claude Opus 4.6 约 **12–14.5 小时**（2026-02/03）；METR 五月 Frontier Risk Report 称最强 agent 已"near or beyond reliable measurement range"，领先模型达 **16–20 小时**，但 **>16 小时的估计不可靠**（基准饱和：228 个任务里仅 5 个 ≥16h）。
- **写作提醒**：前卷已给"约 3 个月翻倍"，此处用 TH1.1 精确化为 88.6 天（2024+），并补"基准正在饱和、标尺快不够用了"这一新转折。

### 3.4 "AI 2027" 类预测的影响
- **AI 2027**（Kokotajlo et al., AI Futures Project）核心押注：agent 时间跨度自 2024 起每 **4 个月**翻倍。
- **追踪状态**：ai2027-tracker 评估该预测为 **"Ahead"（约 80% 置信）**（截至 2026-05-25）——实测 3–4.3 月的翻倍甚至快于预测。
- **影响**：该情景已成为 AI 预测圈的公共参照系，METR 与 AI Futures Project 的更新"常规性地引用、验证或挑战 4 个月翻倍这一核心指标"。来源：ai2027-tracker.com。

---

## 第 4 节　AI 安全与治理动态（背景，简要）

### 4.1 2026 年治理层面的主要担忧
- 从技术层（前卷已讲：欺骗 deception、失控、reward hacking 泛化）上升到治理层：如何在部署前评估、如何要求实验室公开风险、如何跨国协调。参照《International AI Safety Report 2025》及其首次关键更新（arXiv:2510.13653）。

### 4.2 监管进展
- **欧盟 AI Act**：**GPAI（通用模型）义务的执法自 2026-08-02 起**（一年过渡期后），透明度规则同月生效；最严重违规罚款可达全球年营业额 **7%**；**European AI Office** 为 GPAI 主执法机构；AI Board / Scientific Panel / Advisory Forum 组成治理架构。
- **EU Action Plan on Cybersecurity and AI**（2026-07-07 发布）：强化 AI Act 执法，建立针对前沿模型网络安全威胁的评估能力（预计 2027 投运）。来源：quasa.io；EU digital-strategy。
- **美国州级**：California **SB 53**、New York **RAISE Act** 要求前沿开发者制定并公开灾难性风险评估框架。〔待核：2026 年美国联邦行政令 / 国家层面新规现状，本轮未检索到最新，写作前建议补检〕
- **国际协调**：以《International AI Safety Report》为代表的多国科学共识文件延续。〔待核：中国《生成式人工智能服务管理办法》2026 最新动态本轮未检索——写作前需补检以覆盖任务要求〕

### 4.3 前沿实验室自我治理（RSP / 负责任扩展）
- **Anthropic Responsible Scaling Policy v3.0**（2026-02-24）：新增要求发布 **Frontier Safety Roadmap**（覆盖 Security / Alignment / Safeguards / Policy 四域的具体缓解计划）与 **Risk Reports**（量化所有已部署模型的风险）；另有 **v3.1** PDF 在网。
- **AI Safety Levels（ASL）**：ASL-3 是最强模型所处、且首个"部署与安全防护强制生效"的层级；**ASL-3 针对化学/生物威胁的防护已于 2025-05 实施**。
- 类似地，OpenAI/Google DeepMind 等也有各自的 preparedness/frontier safety 框架。来源：anthropic.com/news/responsible-scaling-policy-v3；techjacksolutions。

### 4.4 对产业的实际约束
- 目前的现实是"自我治理为主 + 法律逐步落地"：EU Act 2026-08 执法是第一个有牙齿（7% 营业额）的硬约束；美国以州法 + 信息披露为主；实验室 RSP 提供了可审计的自愿承诺，但其强制力取决于各家兑现。

---

## 第 5 节　就业与社会影响（简要）

### 5.1 Anthropic 劳动力市场研究（一手、方法清晰）
- 提出"observed exposure"（结合理论能力 + 真实使用数据，自动化实现权重高于增强用途）。
- **最暴露职业**：Computer Programmers **75%** 任务覆盖（居首）；Customer Service Reps 与 Data Entry Keyers **67%**；约 **30%** 劳动者的岗位任务零暴露。
- **理论 vs 实际落差**：Computer & Math 类理论可行性 **94%**，但实际观测覆盖仅 **33%**——说明"能做"远快于"已做"。
- **对增长的回归结论**：观测暴露每 +10 个百分点，BLS 到 2034 的岗位增长预测下降 **0.6 个百分点**。
- **就业趋势**：自 2022 年底以来，高暴露劳动者**未出现系统性失业上升**；但 **22–25 岁年轻劳动者**在暴露职业的**招聘率下降约 14%**。来源：anthropic.com/research/labor-market-impacts。

### 5.2 编程岗位的 2026 现实图景（对 CS 学生切身）
- **采用率**：92% 开发者已在部分工作流使用 AI 工具；GitHub Copilot 付费订阅 **470 万**（2026-01，同比 +75%）。
- **入门岗承压**（多来源，数字较激进，需谨慎引用）：报道称入门级岗位过去一年招聘"下降约 73%"；22–25 岁开发者就业自 2022 年底"下降近 20%"，同公司资深开发者反增 6–12%；某来源称程序员整体就业 2023–2025 "下降 27.5%"。来源：digitalapplied《AI and Jobs in 2026》；IEEE Spectrum；Federal Reserve FEDS 2026-018 paper《AI and Coder Employment》；S&P Global。〔待核：73% / 27.5% / -20% 三个数字口径与原始来源需逐一核对，勿直接当权威事实写〕
- **岗位重构而非清零**：企业把人力转向架构、集成、代码评审；劳动经济学家预计未来五年约 **1/3** 白领编程任务被自动化或重构。Amodei 曾称 2025 年 6–9 月"90% 的新代码由 AI 编写"。
- **另一面**：McKinsey 2025 预计 AI 净创造岗位多于消灭（AI 开发、系统设计、应用 ML）；重度使用 AI 的开发者报告更多"心流"、更高满意度、更低倦怠。
- **给学生的诚实结论**："AI 会取代程序员吗"——2026 的现实是：**取代的是任务不是职业，最受冲击的是入门级重复任务**；价值向"能定义问题、做架构、审查与整合 AI 产出"的能力迁移。

---

## 第 6 节　"六年回望"框架素材（2020→2026）

### 6.1 关键转折点时间轴（可做图）
| 时间 | 里程碑 | 意义（一句话） |
|---|---|---|
| 2020-06 | GPT-3（175B，few-shot） | "续写机器"——规模即能力的第一次震撼 |
| 2022-01 | InstructGPT / RLHF | 从"续写"到"听话"：对齐登场 |
| 2022-11 | ChatGPT | 产品化引爆，AI 进入大众视野 |
| 2023-03 | GPT-4 | 多模态 + 能力跃升，行业竞赛开启 |
| 2024-09 | o1（test-time / 推理） | 第二条曲线：让模型"想得更久" |
| 2025-01 | DeepSeek-R1（开源推理，RLVR/GRPO） | 推理能力开源化、RL 成主角 |
| 2025 | agent 元年（Claude Code / Operator / Deep Research） | 从"答问题"到"干活" |
| 2025 | GPT-5 / Claude Opus 4.x | 算力路线收敛，能力仍升 |
| 2026 | Fable 5（Anthropic Mythos 级，2026-06-09）〔据项目记忆，未二次联网核实〕、世界模型商用、agent 时间跨度 12–16h | "数字同事"雏形；标尺开始测不准 |

> 说明：METR 时间跨度从 2024 年 GPT-4o 的约 4 分钟，到 2026 年 3 月领先模型的十几小时，约 **240×** 跃升（自媒体测算，与 METR 拟合一致）。来源：METR TH1.1；aakashgupta on X。〔待核：4 分钟起点与 240× 为二手测算〕

### 6.2 "从续写机到 agent"主线里程碑（叙事骨架）
1. **续写机**（GPT-3）：只会"接下一个词"。
2. **会听话**（RLHF/InstructGPT → ChatGPT）：对齐把"续写"变成"对话"。
3. **会想**（o1/R1，test-time + RL）：把算力从训练期挪到答题期，推理涌现。
4. **会干活**（2025 agent）：工具使用 + 长任务，从"生成文本"到"完成任务"。
5. **会看世界 / 会记住**（2026 world models + continual learning 前沿）：走向持久、具身、能积累经验的"数字同事"——下一卷之外的未来。

### 6.3 给大二学生的"如何持续跟进"建议
- **一手论文与数据**：arXiv（cs.CL / cs.LG）、Papers with Code、**Epoch AI**（算力/趋势数据）、**METR**（能力时间跨度）、各实验室技术报告与 model card。
- **评测基准（看懂"进步"到底指什么）**：MMLU / MMLU-Pro、GPQA、**SWE-bench**（真实编程）、**ARC-AGI（-2/-3）**、**METR time horizon**、LMArena（人类偏好）、Humanity's Last Exam。
- **值得关注的研究者/声音**：Ilya Sutskever、Andrej Karpathy、Dario Amodei、Demis Hassabis、Yann LeCun、李飞飞（Fei-Fei Li）、François Chollet（ARC）、Gary Marcus（怀疑派对照）。
- **社区与简报**：X/Twitter AI 圈、Hugging Face、r/MachineLearning、LessWrong / Alignment Forum（安全）、简报类 Import AI、The Batch（Andrew Ng）、AI 2027 / AI Futures Project。
- **方法论建议（写给学生的一句话）**：别追单个模型的榜单名次，追**能力曲线**（时间跨度、SWE-bench 通过率）与**范式转折**（哪条 scaling 曲线在涨、哪条在饱和）——这比记住谁家模型今天第一更耐久。

---

## 附：需写作前补检的 〔待核〕清单
1. LeCun 新公司确切名称（"AMI Labs"？）与估值（$5B+？）。
2. 中国《生成式人工智能服务管理办法》2026 最新动态（任务点名，本轮未检索）。
3. 美国 2026 联邦层面 AI 行政令/立法现状。
4. Google Gemini Robotics、Figure、Tesla Optimus 的 2026 具身进展。
5. 就业激进数字（入门岗 -73%、程序员 -27.5%、22–25 岁 -20%）的原始口径与来源逐一核对。
6. Fable 5 发布信息目前仅据项目记忆，建议联网二次确认后再入正文。
7. 《Scaling Behaviors of LLM RL Post-Training》确切标题/作者/venue。
8. MMLU 30B、GSM8K 70B 递减拐点的原始论文出处。

## 主要来源索引（含日期）
- Fortune, "AI luminaries at Davos clash..." 2026-01-23.
- METR, "Time Horizon 1.1" 2026-01-29; METR Frontier Risk Report 2026-05.
- ai2027-tracker.com（AI Futures Project / Kokotajlo et al.），截至 2026-05-25。
- arXiv:2510.13786《The Art of Scaling RL Compute for LLMs》（约 2025-10）。
- Anthropic, "Labor Market Impacts of AI"（研究页）；"Responsible Scaling Policy v3.0" 2026-02-24。
- labs.adaline.ai《Beyond Transformers: 7 AI Breakthroughs Reshaping Production in 2026》。
- TechCrunch 2025-11-12（World Labs Marble）；drfeifei.substack《A Functional Taxonomy of World Models》。
- GlobeNewswire 2026-05-13《Embodied AI Robot Large Model (Including VLA) 2026》。
- EU digital-strategy（AI Act）；quasa.io（EU Action Plan 2026-07-07）。
- Federal Reserve FEDS 2026-018《AI and Coder Employment》；digitalapplied《AI and Jobs in 2026》；S&P Global《AI impact on employment 2026》；IEEE Spectrum。
- aimultiple / buildfastwithai / MindStudio（2026 scaling laws 综述）。

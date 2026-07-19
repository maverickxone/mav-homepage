# 2025 – 2026.7 大语言模型格局调研事实清单

> 调研日期：2026-07-19。联网搜索所得，凡未能核实的均标注"未公开/不确定"。
> 说明：2025 年内（我知识截止 2026-01 之前）的事实以我已有知识为底、并经搜索交叉印证；2026 年之后的事实全部来自搜索结果。
> 部分来源为二手聚合站（标注"二手来源"），写书引用前建议回溯官方技术报告。

---

## 一、国内开源权重系

### 1. DeepSeek

**DeepSeek-V3**（2024-12-26，基线参照）
- 671B 总参 / 37B 激活；MoE：256 路由专家 + 1 共享专家，每 token 激活 8 路由专家（细粒度专家 + 共享专家范式）；MLA（多头潜在注意力）；MTP（多 token 预测）；128K 上下文；FP8 训练；官方报告训练成本 278.8 万 H800 GPU 时（约 $5.576M）。据 DeepSeek-V3 技术报告（arXiv:2412.19437）。

**DeepSeek-R1**（2025-01-20）
- 基于 V3-Base 的推理模型，纯 RL（GRPO）+ 冷启动数据；R1-0528 为 2025-05 更新。据 R1 技术报告（arXiv:2501.12948）。

**DeepSeek-V3.1**（2025-08，V3.1-Terminus 为 2025-09 小更新）
- 685B 总参 / 37B 激活（与 V3 同一架构族，checkpoint 含 MTP 模块故计 685B）；在 V3 base 上继续预训练做长上下文扩展（约 840B tokens），**不是新基模**；单模型双模式：thinking / non-thinking 通过 chat template 切换（混合推理架构首次进入 DeepSeek 主线）；thinking 模式能力接近 R1-0528；使用 UE8M0 FP8 scale 格式、称为适配"下一代国产芯片"。来源：[Hugging Face DeepSeek-V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)、[TechTalks](https://bdtechtalks.com/2025/08/20/deepseek-v3-1/)、[Simon Willison](https://simonwillison.net/2025/Aug/22/deepseek-31/)。

**DeepSeek-V3.2-Exp**（2025-09-29）
- 685B / 37B，架构同 V3.1，首次引入 **DSA（DeepSeek Sparse Attention）**：细粒度稀疏注意力 = lightning indexer（轻量索引器给历史 token 打分）+ top-k token 选择器，在 MLA 之上实现；训练分两阶段：dense warm-up 2.1B tokens + sparse 继续训练 943.7B tokens；128K 上下文；长文本推理快 2–3 倍、显存省 30–40%，API 降价 50%+。来源：[DeepSeek API 公告](https://api-docs.deepseek.com/news/news250929/)、[Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp)、[Sebastian Raschka 技术拆解](https://magazine.sebastianraschka.com/p/technical-deepseek)。

**DeepSeek-V3.2（正式版）+ V3.2-Speciale**（2025-12-01）
- 685B（690GB 权重），DSA 转正；上下文 160K；MIT 许可开源；报道称其智能体训练数据合成覆盖 1800+ 环境、85k+ 复杂指令；**V3.2-Speciale** 为推理特化版（仅 API），IMO/CMO/ICPC World Finals/IOI 2025 达金牌水平。来源：[DeepSeek API 公告](https://api-docs.deepseek.com/news/news251201/)、[Simon Willison](https://simonwillison.net/2025/Dec/1/deepseek-v32/)、V3.2 论文（arXiv:2512.02556）。

**DeepSeek-V4**（2026-04-24 预览发布；报道为 2026 上半年正式 GA）
- 两个规格：**V4-Pro：1.6T 总参 / 49B 激活**；**V4-Flash：284B 总参 / 13B 激活**（专家数配置未在本次搜索中获得，标注：未核实）；预训练超 **32T tokens**；**原生 1M 上下文**；**新基模**（非 V3 系续训）。
- 注意力：混合架构，**CSA（Compressed Sparse Attention）**：softmax 门控池化约 4× 压缩 + FP4 "lightning indexer" 选 top-k 块；**HCA（Heavily Compressed Attention）**：约 128× 重压缩后对压缩块做稠密注意力。另有报道提及 mHC（manifold-constrained Hyper-Connections，超连接的流形约束版）——细节以官方报告为准。
- 定价报道：输出约 $0.87/M（二手来源）。训练成本：未公开。
- 来源：[DeepSeek V4 架构解读（techjacksolutions，二手）](https://techjacksolutions.com/ai-tools/deepseek/deepseek-v4-architecture/)、[morphllm V4 页（二手）](https://www.morphllm.com/deepseek-v4)、[V4 论文 arXiv:2606.19348](https://arxiv.org/pdf/2606.19348)、[BentoML 综述](https://www.bentoml.com/blog/the-complete-guide-to-deepseek-models-from-v3-to-r1-and-beyond)。

**DeepSeek-R2：截至 2026-07 未发布**
- 官方从未确认发布日期；Reuters 报道梁文锋因性能不满意压住发布，另有算力受限说法；网传"1.2T 混合 MoE""32B dense 版 AIME 92.7%"均为**未证实传闻**。推理能力实际由 V3.2-Speciale 与 V4 承接。来源：[Rest of World](https://restofworld.org/2025/deepseek-china-r2-ai-model-us-rivalry/)、[decodethefuture 状态页](https://decodethefuture.org/en/deepseek-r2-explained/)。

### 2. Qwen（阿里）

**Qwen3**（2025-04-29）
- 开源谱系：dense 0.6B–32B + MoE 两档：Qwen3-30B-A3B、旗舰 **Qwen3-235B-A22B**（128 专家 / 激活 8，**无共享专家**，GQA，36T tokens 预训练）；混合 thinking/non-thinking 模式（2507 更新版拆分为 Instruct/Thinking 两线）。据 Qwen3 技术报告（arXiv:2505.09388，我知识范围内）。

**Qwen3-Next-80B-A3B**（2025-09-12）
- 80B 总参 / **仅 3B 激活**（高稀疏 MoE，512 专家 / 激活 10 + 1 共享）；**混合注意力：75% 层 Gated DeltaNet（线性注意力）+ 25% 层 Gated Attention（标准注意力），3:1**；zero-centered weight-decayed layernorm；**MTP**；原生 256K 上下文；官方称训练成本低于 Qwen3-32B dense 的 10%，32K+ 长上下文吞吐 10 倍以上。来源：[Qwen 官方博客](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd)、[Hugging Face](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct)。

**Qwen3.5**（2026-02-16 起）
- 首发 **Qwen3.5-397B-A17B**（397B 总参 / 17B 激活）；60 层，512 专家 / 激活 10 路由 + 1 共享，hidden 4096；**Gated DeltaNet 与全注意力 3:1 混合**（重复块 = 3×(GDN→MoE) + 1×(Gated Attention→MoE)，共 15 组）；262K 上下文；KV cache 较全注意力省约 4×；原生多模态（系列内）。随后放出 122B-A10B、35B-A3B、27B、9B、4B、2B、0.8B 等全谱系。来源：[Maxime Labonne：Qwen3.5 架构分析](https://huggingface.co/blog/mlabonne/qwen35)、[NVIDIA model card](https://build.nvidia.com/qwen/qwen3.5-397b-a17b/modelcard)、[CNBC](https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html)。

**Qwen3.6**（2026-04：3.6-35B-A3B 4/16、3.6-27B 4/22）与 **Qwen3.7-Max**（2026-05-20 云栖/Apsara 峰会发布）
- Qwen3.7-Max：闭源旗舰，定位 agentic model，单会话可自主串 1000+ 工具调用，1M 上下文；参数未公开。来源：[Presenc AI 谱系整理（二手）](https://presenc.ai/research/alibaba-qwen-model-lineage-and-roadmap-2026)、[codersera 指南（二手）](https://codersera.com/blog/qwen-3-5-complete-guide-2026/)。注意：Qwen3.6 官方仓库存在（[GitHub QwenLM/Qwen3.6](https://github.com/QwenLM/Qwen3.6)）；**没有 Qwen4**。

### 3. Kimi（月之暗面）

**Kimi K2**（2025-07-11）
- **1T 总参 / 32B 激活**；MoE：**384 专家 / 每 token 激活 8** + 1 共享专家（每层）；MLA；128K 上下文；**MuonClip 优化器**（Muon + QK-clip 抑制 logit 爆炸），15.5T tokens 预训练全程零 loss spike；非 thinking 的 agentic 定位。K2-Instruct-0905 为 9 月更新（256K）。据 [Kimi K2 技术报告（arXiv:2507.20534）](https://arxiv.org/abs/2507.20534)。
- **K2 Thinking**（2025-11-06）：同 1T/32B 架构的推理版，256K 上下文，原生 INT4（QAT），长程工具调用 200–300 步（我知识范围内，与搜索一致）。

**Kimi Linear / KDA 论文**（2025-10-30，K3 的技术铺垫）
- **KDA（Kimi Delta Attention）**：在 Gated DeltaNet 上加更细粒度（按通道）门控的线性注意力；验证模型 Kimi-Linear-48B-A3B：**KDA 与全局 MLA 按 3:1 逐层混合**；同配方下全面超过纯 MLA，KV cache 省最多 75%，1M 上下文解码吞吐至多 6×。来源：[arXiv:2510.26692](https://arxiv.org/abs/2510.26692)、[Hugging Face 模型](https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct)。

**Kimi K2.6**（2026-04-20）
- 仍为 1T / 32B MoE（K2 架构），转为**原生多模态**（文/图/视频同一架构）；262,144 上下文；原生 INT4；Modified MIT 开源；带 Agent Swarm（至多 300 个领域子 agent、单次自主运行至多 4000 步）。来源：[Verdent 指南](https://www.verdent.ai/guides/what-is-kimi-k2-6)、[OpenRouter](https://openrouter.ai/moonshotai/kimi-k2.6)、[NVIDIA NIM model card](https://build.nvidia.com/moonshotai/kimi-k2.6/modelcard)。

**Kimi K3**（2026-07-16 发布；重点）
- **约 2.8T 总参**，官方定位"全球首个开源 3T 级模型"；MoE：**896 专家 / 每 token 激活 16**（官方称 "Stable LatentMoE"；激活参数量官方未直接给出——本次搜索未获得确切激活参数数，标注：未公开）；**1M 上下文**；原生多模态（文/图/视频）。
- 架构两大更新：**KDA（Kimi Delta Attention）混合线性注意力**（官方称 1M 上下文解码至多 6.3× 加速；即 Kimi Linear 路线上量产）+ **AttnRes（Attention Residuals）**：沿深度方向选择性检索表征而非逐层均匀累加，官方称训练效率约 +25%、额外开销 <2%。另据报道使用 Gated MLA、SiTU（Sigmoid Tanh Unit）激活、Per-Head Muon、Quantile Balancing 专家负载均衡。
- 量化/训练：MXFP4 权重 + MXFP8 激活，从 SFT 阶段即量化感知训练。官方称相对 K2 **scaling 效率约 2.5×**。
- 与 K2 的差异总结：1T→2.8T；384/8 专家→896/16 专家；MLA 全注意力→KDA:MLA 混合线性注意力；128K/256K→1M 上下文；新增 AttnRes；INT4→MXFP4/MXFP8。
- 发布形态：K3 Max（chat/agent）与 K3 Swarm Max（大规模并行）先上线 Kimi Code / Kimi App；**权重承诺 2026-07-27 前以 Modified-MIT 开源**。API 定价：cache-hit $0.30 / cache-miss $3.00 / 输出 $15.00 每 M tokens。
- 基准：Program Bench、SWE Marathon、BrowseComp、Automation Bench、OmniDocBench 领先；FrontierSWE、HLE-Full 落后于 Claude Fable 5，DeepSWE 落后于 GPT-5.6 Sol（据 MarkTechPost 转述官方 blog）。
- 来源：[MarkTechPost](https://www.marktechpost.com/2026/07/16/moonshot-ai-releases-kimi-k3-a-2-8-trillion-parameter-open-moe-model-with-kimi-delta-attention-and-1m-context/)、[Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/moonshot-releases-2-8-trillion-parameter-kimi-k3)、[VentureBeat](https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems)、[Fortune](https://fortune.com/2026/07/16/moonshots-kimi-k3-pushes-chinese-ai-into-fable-level-territory/)、[人民网英文](http://en.people.cn/n3/2026/0717/c90000-20478901.html)。

### 4. 其他国内厂商（简要）

**智谱 GLM**
- **GLM-5**（2026-02-11/12）：约 745B 总参 / 44B 激活；256 专家 / 激活 8（稀疏率约 5.9%）；预训练 28.5T tokens（较 GLM-4.7 +23.9%）；200K 上下文；采用 DeepSeek 式稀疏注意力（DSA 路线）。来源：[llm-stats](https://llm-stats.com/blog/research/glm-5-launch)、[glm5.net（二手）](https://glm5.net/)。
- **GLM-5.2**（2026-06-13）：约 744–753B 总参 / ~40B 激活；**1M 上下文**；MIT 开源；新增 **IndexShare**：每 4 个稀疏注意力层共享同一 indexer，1M 上下文时每 token 计算省约 2.9×。来源：[eigent.ai](https://www.eigent.ai/blog/glm-5-2)、[datanorth](https://datanorth.ai/news/zhipu-ai-releases-glm-5-2)。（中间还有 GLM-5.1，细节未展开。）

**MiniMax**
- **M2**（2025-10-27）：230B 总参 / 10B 激活 MoE；**全注意力**（放弃了 M1 的 lightning attention 线性路线，回归 full attention + RoPE）；205K 上下文；开源。来源：[GitHub MiniMax-M2](https://github.com/MiniMax-AI/MiniMax-M2)、[Vercel 模型页](https://vercel.com/ai-gateway/models/minimax-m2)。
- **M2.1**（2025-12-23）、**M2.5**（2026-02-12，IPO 后一个月）：均沿用 230B/10B 架构（后训练迭代）。来源：[Maxime Labonne M2.5 评测](https://medium.com/@mlabonne/minimax-m2-5-the-1-hour-frontier-model-92168de195b8)。
- **M3**（2026-05-31 上线 API）：**428B 总参 / ~23B 激活**；原生多模态（文/图/视频从预训练第一步进入）；**1M 上下文 + MiniMax Sparse Attention**（官方称 1M 长度下每 token 计算为上代 1/20）。来源：[MiniMax 官方 release notes](https://platform.minimax.io/docs/release-notes/models)、[codersera（二手）](https://codersera.com/blog/minimax-m3-release-date-whats-new-2026/)。

**字节（豆包 / Seed）**
- **Doubao-Seed-2.0**（2026-02-14 发布）：闭源；含 Pro / Lite / Mini 三档通用 Agent 模型 + Code 模型；Pro 主打深度推理与长链任务（宣传 IMO/CMO/ICPC 成绩）；参数规模未公开。来源：[百度百科词条（英文版）](https://baike.baidu.com/en/item/Doubao-Seed-2.0/1515788)、[evolink 评测（二手）](https://evolink.ai/blog/doubao-seed-2-0-review-benchmarks-pricing)。

**腾讯混元**
- **Hy3**（2026-07-06 发布并开源）：快慢思考融合的 MoE；**295B 总参 / 21B 激活**；256K 上下文。来源：[新浪财经](https://finance.sina.com.cn/stock/t/2026-07-06/doc-inifwfpu1887689.shtml)、[网易转载](https://www.163.com/dy/article/L15VT9QN0519QIKK.html)。

**阶跃星辰（StepFun）**
- **Step-3**（2025-07，我知识范围内）：321B 总参 / 38B 激活，多矩阵分解注意力 MFA + AFD 分离部署，主打推理成本效率。
- **Step 3.7 Flash**（2026-05-29 发布并开源）：稀疏 MoE，报道口径"总参 196B+1.8B、激活 11B"（原文如此），生成速度至高 400 tokens/s，面向 Agent 生产化。来源：[网易报道](https://www.163.com/dy/article/KU38P3RH0511B8LM.html)、[阶跃官网](https://www.stepfun.com/)。

**百度文心**
- **ERNIE 5.0**（2025-11-13 百度世界大会）：**2.4T 总参**原生全模态（omni-modal：文/图/音/视频统一建模）MoE，**每次推理激活 <3% 专家**；闭源旗舰。来源：[SCMP](https://www.scmp.com/tech/tech-trends/article/3340866/baidu-launches-ernie-50-firms-ai-assistant-users-reach-200-million-month)、[ERNIE 官方博客](https://ernie.baidu.com/blog/posts/ernie5.0/)。
- 2026-04-15 开源 8B 文生图模型 ERNIE-Image；未见文心 5.5/6.0 主线更新（截至 2026-07）。

**关于 "VIVO5"**
- **没有搜到任何名为 "VIVO5 / Vivo 5" 的大模型**（中英文多轮检索均无）。vivo 的自研 LLM 是**蓝心大模型 BlueLM**（vivo AI Lab，开源 7B 等，矩阵覆盖十亿/百亿/千亿档），未见 2026 年名为 "VIVO5" 的发布。可能的混淆来源：GLM-5（智谱）、文心 5.0（ERNIE 5）、DeepSeek V4 的口误，或蓝心大模型某个版本号。**建议向用户回确认，勿写入书稿**。来源：[vivo BlueLM GitHub](https://github.com/vivo-ai-lab/BlueLM)。

---

## 二、国外

### OpenAI
- **GPT-5**（2025-08-07，我知识范围内）：统一路由架构（instant/thinking 自动分配），o 系列开始并入主线。
- 版本演进（均经搜索确认）：**GPT-5.1**：2025-11-12（Instant/Thinking 等，一周后再发两款）；**GPT-5.2**：2025-12-11（instant / thinking / Pro 三模式）；**GPT-5.4**：2026-03-05（首个原生 SOTA computer-use 的通用模型，主打编码与 agentic）；**GPT-5.5**：2026-04-23——据 Wikipedia，其预训练（代号 **"Spud"**）2026-03-24 完成，即 **5.5 是重新预训练的新基模**；**GPT-5.6**：2026-06-26 受限预览（因出口管制先向少数伙伴开放）、2026-07-09 正式发布，三档：**Luna（最快最便宜）/ Terra（中档，性能对标 5.5、价格一半）/ Sol（旗舰，"best coding model yet"）**；官方称 Sol 编码任务 token 效率 +54%；GPT-5.6 是否新基模：**未公开**。来源：[OpenAI GPT-5.6 发布页](https://openai.com/index/gpt-5-6/)、[TechCrunch](https://techcrunch.com/2026/07/09/openai-launches-its-new-family-of-models-with-gpt-5-6/)、[Wikipedia GPT-5.5](https://en.wikipedia.org/wiki/GPT-5.5)、[Wikipedia GPT-5.6](https://en.wikipedia.org/wiki/GPT-5.6)、[Introducing GPT-5.4](https://openai.com/index/introducing-gpt-5-4/)。
- **o 系列现状**：2026-02-13 OpenAI 从 ChatGPT 退役 GPT-4o、GPT-4.5 及整个 o 系列（o1/o3/o3-mini/o4-mini），由 GPT-5.x 家族接替（推理并入主线，"Thinking" 按任务难度自动调节）；o3 在 ChatGPT 的最终退役日为 2026-08-26，API 侧部分保留。来源：[OpenAI 帮助中心 Model Release Notes](https://help.openai.com/en/articles/9624314-model-release-notes)、[secondtalent 综述（二手）](https://www.secondtalent.com/resources/every-openai-model-explained-compared/)。
- **gpt-oss**（2025-08-05，我知识范围内）：开源权重双模型 gpt-oss-120b（116.8B 总参 / 5.1B 激活，128 专家/激活 4）与 gpt-oss-20b（20.9B / 3.6B），Apache 2.0，MXFP4 量化发布。**2026 年内未搜到 gpt-oss 后续版本**。

### Anthropic
- 时间线（经搜索确认）：**Claude Opus 4.5**（2025-11-24）→ 2026 上半年四个 Opus 点版本（最新 **Opus 4.8**，2026-05-28）+ Sonnet 4.6、Haiku 4.5 → **Claude Fable 5 + Claude Mythos 5**（2026-06-09）：新的 "Mythos-class" 层级（高于 Opus），Fable 5 为首个公开可用的 Mythos-class 模型，**always-on adaptive thinking、1M 上下文、128K 输出**；2026-06-12 因美国出口管制指令暂停，**2026-07-01 恢复全球可用**（API/Bedrock/Vertex/Foundry）→ **Claude Sonnet 5**（2026-06-30）成为消费端与开发端默认模型。当前层级：Haiku < Sonnet < Opus < Fable/Mythos。参数、架构均未公开。来源：[Anthropic Sonnet 5 发布页](https://www.anthropic.com/news/claude-sonnet-5)、[scriptbyai Claude 时间线](https://www.scriptbyai.com/anthropic-claude-timeline/)、[hidekazu-konishi 时间线](https://hidekazu-konishi.com/entry/anthropic_claude_model_release_timeline.html)、[it-connect](https://www.it-connect.tech/claude-fable-5-returns-worldwide-as-anthropic-launches-sonnet-5/)。

### Google
- **Gemini 2.5**（2025-03 起 Pro/Flash，我知识范围内）；**Gemini 3**（2025-11-18 Gemini 3 Pro + Deep Think，1M 上下文，我知识范围内）。
- **Gemini 3.5**：3.5 Flash 于 I/O 2026（5 月）发布并 GA；**3.5 Pro 截至 2026-07-19 尚未发布**——原计划 6 月、后改 7-17，已连续三次跳票；Bloomberg 报道原基模因递归工具调用与 SVG 生成的结构性缺陷被**推倒重建**，重点补编码能力；Vertex AI 上有 Gemini 3.1 Pro 预览与少量 3.5 Pro 企业内测；传闻 2M 上下文未确认。来源：[9to5Google](https://9to5google.com/2026/07/16/gemini-3-5-pro-delays/)、[TechTimes](https://www.techtimes.com/articles/320736/20260716/rebuilt-gemini-35-pro-misses-third-deadline-google-eyes-stopgap-release.htm)、[HackerNoon](https://hackernoon.com/google-delays-gemini-35-pro-to-july-17-the-strategic-play-behind-the-scrapped-base-model)。

### Meta
- **Llama 4**（2025-04-05，我知识范围内）：Scout（109B/17B 激活）、Maverick（400B/17B 激活）开源，Behemoth（~2T）始终未发布。
- **Llama 5**（2026-04-08，据多家报道）：开源权重，报道口径 600B+ 总参 MoE（激活量估计 40–80B，未官方确认）、宣称 5M token 上下文（"公开模型中最大"）。**注意：本次搜到的 Llama 5 来源质量普遍较低（含明显营销化表述），总参/上下文数字建议回溯 Meta 官方 blog 核实后再引用**。来源：[chroniclejournal marketminute](https://markets.chroniclejournal.com/chroniclejournal/article/marketminute-2026-4-8-meta-unleashes-llama-5-zuckerbergs-open-source-gambit-challenges-proprietary-ai-dominance)、[Wikipedia Llama 词条](https://en.wikipedia.org/wiki/Llama_(language_model))。

### xAI（现并入 "SpaceXAI" 品牌）
- **Grok 4**（2025-07，我知识范围内）→ **Grok 4.1**（2025-11）→ **Grok 4.5**（2026-07-08）：首个专攻编码与 agentic 的 Grok，Musk 称 "Opus-class"；API $2/M 输入、$6/M 输出，可配置 reasoning effort；先上 Grok Build/Cursor/xAI API，EU 延后。**Grok 5 截至 2026-07 未发布**（xAI 暗示下月还有一次跨代发布）。来源：[x.ai 官方发布页](https://x.ai/news/grok-4-5)、[TechCrunch](https://techcrunch.com/2026/07/08/spacexai-releases-grok-4-5-which-elon-describes-as-an-opus-class-model/)、[Axios](https://www.axios.com/2026/07/08/spacexai-grok-new-model)。

### Mistral
- **Mistral Large 3**（2025-12，我知识范围内 + 搜索印证）：开源权重（Apache 2.0）旗舰 MoE + 一组紧凑 dense 模型；具体参数（报道约 675B 总参 / ~41B 激活）**未在本次搜索中直接核实，引用前需查官方公告**。2026 年另有 **Mistral Medium 3.5**（256K 上下文）。来源：[llm-stats 更新流](https://llm-stats.com/llm-updates)、[LLM Gateway 时间线](https://llmgateway.io/timeline)。

---

## 三、横向问题

### 1. 2026 年中开源权重旗舰的"标准配方"

综合上文各家 2026 年旗舰（DeepSeek V4、Kimi K3、GLM-5.2、Qwen3.5、MiniMax M3、Hunyuan Hy3）：
- **MoE 稀疏度**：激活参数占总参 **2%–7%** 成为主流带（V4-Pro 49B/1.6T≈3.1%；K3 896 选 16≈1.8% 专家比；GLM-5 约 5.9%；Qwen3.5 17B/397B≈4.3%；M3 23B/428B≈5.4%；Qwen3-Next 3B/80B≈3.75%）。细粒度专家数走向数百至近千（256 → 512 → 896），普遍保留共享专家（Qwen3-235B 是显著例外，无共享专家）。
- **注意力选型分裂为两条路线**（2026 年中最重要的架构分歧）：
  - **稀疏注意力路线**（保留 softmax 全注意力形式、稀疏化 KV 访问）：DeepSeek DSA（lightning indexer + top-k）→ V4 的 CSA/HCA；GLM-5/5.2 跟进 DSA 并加 IndexShare；MiniMax M3 的 MiniMax Sparse Attention。
  - **线性/混合注意力路线**（RNN 式线性层 + 少量全注意力层，约 3:1）：Qwen3-Next / Qwen3.5 的 Gated DeltaNet + Gated Attention（3:1）；Kimi 的 KDA:MLA（3:1，Kimi Linear → K3 量产）。
  - MiniMax 是反例说明路线未定：M1 用 lightning attention（线性），M2 退回 full attention，M3 又转向 sparse attention。参见 [Maxime Labonne "Nobody Agrees on Attention Anymore"](https://huggingface.co/blog/mlabonne/qwen35)。
- **上下文长度**：旗舰主流值从 128K/256K 拉到 **1M**（K3、V4、GLM-5.2、M3、Qwen3.7-Max 均 1M；Hy3 256K、Qwen3.5 262K 为次档）。
- **其他常见件**：MTP（DeepSeek V3 系、Qwen3-Next/3.5）；FP8 预训练常态化并向 FP4/MXFP4 推进（V4 的 FP4 indexer、K3 的 MXFP4 权重 + MXFP8 激活 + 量化感知训练）；原生多模态成为默认（K2.6/K3、M3、Qwen3.5、ERNIE 5.0）；宽松许可（MIT / Modified-MIT / Apache 2.0）。
- 预训练数据量级：**28–32T+ tokens**（GLM-5 28.5T；V4 >32T；Qwen3 时代为 36T）。

### 2. 版本号语义：新基模 vs 后训练更新（公开例证）

- **DeepSeek（最清晰的公开案例）**：V3 → V3.1 = 同一基模上的**继续预训练**（长上下文扩展 ~840B tokens）+ 混合推理后训练，非新基模；V3.1 → V3.2-Exp/V3.2 = 同基模 + DSA **稀疏注意力续训**（~1T tokens）；V3 → **V4 = 全新预训练基模**（32T tokens、新注意力、1M 上下文）。即小数点版本 = 续训/后训练，整数版本 = 新基模。
- **OpenAI**：GPT-5 → 5.1 → 5.2 → 5.4 官方未说明是否重训（间隔 1–3 个月，普遍推断以后训练/中训练为主，**未公开确认**）；**GPT-5.5 例外地有公开证据是新基模**（预训练代号 "Spud" 于 2026-03-24 完成，据 [Wikipedia GPT-5.5](https://en.wikipedia.org/wiki/GPT-5.5)）；GPT-5.6 与 5.5 的基模关系未公开。
- **Anthropic**：完全不披露。Opus 4.5 → 4.6/4.7/4.8 四个点版本在约半年内发出（快节奏点版本通常被解读为后训练迭代，**未官方确认**）；Fable 5 / Mythos 5 是新层级（Mythos-class），大概率新基模但同样未公开。
- **Kimi**：K2 → K2.6 = 同 1T/32B 架构加多模态与后训练升级；K2 → **K3 = 新基模 + 新架构**（KDA、AttnRes、896 专家）。
- **Qwen**：Qwen3.5 = 新架构新基模；3.5 → 3.6 → 3.7 为快速迭代（官方未逐一说明重训与否）。
- **MiniMax**：M2 → M2.1 → M2.5 三个版本共用 230B/10B 同一架构（官方 blog 明示架构不变，即后训练迭代）；M3 = 新基模（428B、原生多模态）。

### 3. 参数量级与训练算力量级（公开数据点）

- **最大模型参数**：公开报道最大为 **Kimi K3 ≈ 2.8T（开源权重最大）**、百度 ERNIE 5.0 **2.4T**（闭源）、DeepSeek V4-Pro **1.6T**；传闻中 Meta Behemoth ~2T 从未发布。美国闭源旗舰（GPT-5.x、Claude、Gemini）参数一律未公开。
- **集群规模**：
  - xAI Colossus（孟菲斯）：扩至 **2GW、约 555,000 块 GPU、约 $18B**（构成含 150k H100 + 50k H200 + 30k GB200 等），称全球最大单址训练集群（[Introl，2026-01](https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026)）；Colossus 2 为全球首个吉瓦级数据中心（[SemiAnalysis](https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter)）。
  - OpenAI/微软 Stargate：Abilene 一期 0.5GW 动工，总体愿景 5GW 多站点。
  - Meta：2025 年底自有 H100 等效算力超 **350,000 块**（据 [howtostoreelectricity 综述](https://howtostoreelectricity.com/frontier-ai-training-power-profile/)，二手）。
  - 行业口径：**10 万卡 H100 集群是 2026 年前沿算力的"工作单位"**，全套资本开支 $3–5B；GB200 NVL72 单机架 132kW，500MW ≈ 4170 机架。
- **训练算力/成本量级**：2026 年前沿训练 run 普遍在 **1e26–1e27 FLOPs**，GPT-5/Gemini-Ultra 级公开成本估计 **$2–5 亿**（[Deluair 综述](https://deluair.com/consultancy/insights/frontier-ai-training-cost-2026)、[Epoch AI GPU clusters 数据集](https://epoch.ai/data/gpu_clusters.csv)、[State of AI Compute Index](https://www.stateof.ai/compute)）。对照：DeepSeek-V3（2024）官方 278.8 万 H800 GPU 时 ≈ $5.6M，凸显中美算力配方差距；DeepSeek V4、Kimi K3 训练成本均未公开。
- 地缘背景数据点：2026-06 美国出口管制指令曾同时波及 Anthropic（Fable/Mythos 5 暂停三周）与 OpenAI（GPT-5.6 先行受限预览），7 月初解除。

---

## 附：写作提醒
- "VIVO5" 未被证实存在，需向用户回确认。
- Llama 5、Mistral Large 3 的具体参数、DeepSeek V4 的专家数配置、K3 的激活参数量：本次搜索未获得可靠一手数字，落笔前需查官方技术报告。
- 多个二手聚合站（kie.ai、codersera、morphllm、felloai 等）数字可能互相转抄，同一数字多站出现不等于多源印证。

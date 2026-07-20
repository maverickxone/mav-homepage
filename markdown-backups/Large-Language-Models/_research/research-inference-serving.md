# 调研：LLM 推理服务技术与 API 定价（2026 现状）

> 调研日期：2026-07-20。用途：第五卷《算力与推理》素材。
> 读者已掌握 KV cache 数学、MLA、MTP/投机解码概念、MoE 显存特性（第一卷），本文侧重服务工程与经济学。
> 价格均为每百万 token（$/MTok），以官方页为准；标〔待核〕者为二手来源，用前需核对官方页。

---

## 1. 推理的两阶段：prefill 与 decode

- **标准表述**（DistServe、Sarathi-Serve 等论文与各框架文档的共识框架）：
  - **Prefill（预填充）**：一次前向并行处理全部 prompt token，算术强度高，**算力受限（compute-bound）**，GPU FLOPs 可以打满。
  - **Decode（解码）**：每步只生成 1 个 token，但每步都要把全部权重 + 不断增长的 KV cache 从 HBM 读一遍，算术强度极低，**访存带宽受限（memory-bound）**。批内并发是提高 decode 算术强度的唯一常规手段。
- **三指标**：
  - **TTFT**（Time To First Token，首 token 延迟）——主要由 prefill 决定；
  - **TPOT / ITL**（Time Per Output Token，逐 token 间隔）——主要由 decode 决定；
  - **吞吐（tokens/s）**，以及更精细的 **goodput**（满足 TTFT/TPOT SLO 前提下的有效吞吐，DistServe 提出的口径）。
- **为什么两阶段最优硬件配置不同**：prefill 要的是 FLOPs（高算力芯片、张量并行少），decode 要的是 HBM 带宽 + 大显存装 KV cache（大批量、宽专家并行）。两阶段混跑在同一 GPU 上会互相干扰（长 prefill 挤占 decode 导致 TPOT 抖动），且任一阶段的最优并行策略/芯片选型都不同——这正是 PD 分离（见 §2）的动机。
- 来源：DistServe（OSDI'24）回顾文 Hao AI Lab "Disaggregated Inference: 18 Months Later"（haoailab.com，查询 2026-07-20）；vLLM/NVIDIA Dynamo 文档。

---

## 2. 服务引擎的关键技术

**Continuous batching（连续批处理）**
解决问题：静态批处理必须等整批最长的请求生成完毕，短请求空占 GPU。连续批处理（Orca，OSDI'22 提出，"iteration-level scheduling"）在每个解码步动态换入换出请求。效果量级：Anyscale 2023 年实测比朴素静态批处理吞吐提升**最高 23×**。2026 年已是所有生产引擎的标配，无人再提"是否启用"。

**PagedAttention（vLLM）**
解决问题：KV cache 按最大长度预分配连续显存，产生严重内部/外部碎片——vLLM 论文（SOSP'23）测得先前系统 **60–80% 的 KV 显存被浪费**。PagedAttention 借鉴操作系统分页，将 KV cache 切成非连续 block 按需分配，浪费降至 **<4%**，等价于同卡装下更大 batch，吞吐较当时 SOTA 提升 **2–4×**。这是 vLLM 立身之本，如今同样是行业标配。

**Chunked prefill（分块预填充）**
解决问题：一个几万 token 的长 prefill 会独占若干个迭代，把同批 decode 请求的 TPOT 拉爆。Sarathi-Serve 提出把 prefill 切成小块、与 decode token 拼在同一批次里执行，既平滑 TPOT 又填满算力空隙。vLLM 已默认开启。它是"不做 PD 分离时缓解两阶段干扰"的单机方案。

**Prefill-decode 分离（disaggregated serving）—— 2025–26 的主线**
解决问题：从根上消除两阶段干扰——用独立的 GPU 池分别跑 prefill 和 decode，中间传输 KV cache，两池可独立扩缩容、独立选择并行策略甚至芯片。里程碑：DistServe/Splitwise（2024 论文）→ Mooncake（Kimi 的服务平台，KV-cache 为中心的 PD 分离架构）→ DeepSeek 2025-02 开源周公开其生产推理系统（PD 分离 + 大规模专家并行 EP）。普及程度（2026）：
- NVIDIA **Dynamo 1.0** 于 2026-03 GTC GA，定位就是 PD 分离的编排层（在 vLLM/TensorRT-LLM 之上路由 prefill/decode 到专用 worker 池）；
- vLLM 的 disaggregated serving 虽标"experimental"，但 Meta、LinkedIn、Mistral、Hugging Face 等已在生产使用；
- Mooncake 支撑 Kimi 生产部署（公开数字：K2 在 128×H200 上 PD 分离 + 大 EP，prefill 224k tok/s、decode 288k tok/s）；
- Hao AI Lab 2026 回顾：**"几乎所有生产级服务框架——Dynamo、llm-d、Ray Serve、SGLang、vLLM、LMCache、Mooncake——都建立在分离架构上"**。该文的判断：2025 年的普及拐点不是技术性的（论文 2024 年就有了），而是经济性的——产品规模化后 SLO 违约变成可度量的收入损失。
- 来源：haoailab.com/blogs/distserve-retro/；vllm.ai/blog/2026-05-06-mooncake-store；NVIDIA Dynamo 文档（均查询 2026-07-20）。

**投机解码的生产采用**
2026 年 vLLM、SGLang、TensorRT-LLM、TGI 均内置投机解码。生产上两条路线：
- **模型自带 MTP 草稿头**（趋势主流）：DeepSeek V3/V4、Kimi、Gemma 4、Nemotron 3 等发布时即带训练好的 MTP 头。vLLM 从模型 config 自动检测 MTP 头（`--speculative-config method: mtp`），SGLang 用 `--speculative-algorithm MTP`，无需单独草稿模型。厂商实测 2–3× 解码加速（接受率依赖于任务，代码类最高）。
- **独立草稿路线**：EAGLE-3、Medusa 系（需要额外训练/校准草稿组件），用于没有原生 MTP 头的模型。
教学要点：MTP 把"投机解码需要找一个分布匹配的小模型"这个工程难题变成了训练阶段就交付的产品特性。
- 来源：docs.vllm.ai/en/latest/features/speculative_decoding/mtp/；Gemma 4 技术报告（arxiv 2607.02770）（查询 2026-07-20）。

**Prefix caching（跨请求前缀缓存）**
解决问题：多请求共享同一前缀（系统提示词、多轮对话历史、agent 的工具定义）时避免重复 prefill。引擎侧代表是 SGLang 的 **RadixAttention**（用基数树管理可复用 KV 前缀）；vLLM 也有 automatic prefix caching。API 侧的商业化形态就是各家的 prompt caching 折扣（见 §5）——本质是厂商替你保存 KV cache，命中即跳过 prefill 计算。agent 时代（每次工具调用都重发全部历史）prefix caching 从优化项变成了成本结构的决定因素。

---

## 3. 主流推理框架 2026

| 框架 | 定位 | 现状（2026 中） |
|---|---|---|
| **vLLM** | 事实默认。PagedAttention 起家，硬件覆盖最广（NVIDIA/AMD/Intel/TPU/Ascend），新模型 day-0 支持，pip 装完即得 OpenAI 兼容服务 | 生产采用最广的通用选择 |
| **SGLang** | RadixAttention + 多调用调度，共享前缀/高并发 MoE 场景占优（第三方评测：共享上下文负载下吞吐比 vLLM 高约 29%〔待核，随版本波动〕）；DeepSeek 系模型的官方推荐路径之一 | agent/RAG/MoE 大规模部署的强力竞争者 |
| **TensorRT-LLM** | NVIDIA 专属编译路线，Blackwell（GB200/300）上原始吞吐最高（高并发下比 vLLM 高 30–50%〔待核〕），代价是运维复杂、模型更新慢 | 单一模型长期上线、吞吐至上的场景 |

其上还有一层编排框架：NVIDIA Dynamo、llm-d（Red Hat/Google 系）、Ray Serve，负责 PD 分离路由、KV 传输、多节点调度。
**开源自托管生态一句话**：开源权重（DeepSeek/Qwen/Kimi/GLM/GPT-OSS）+ vLLM 或 SGLang + OpenAI 兼容 API 已是标准自托管栈，本地端则是 llama.cpp/Ollama。
- 来源：多家 2026 对比评测（spheron.network、jarvislabs.ai、yottalabs.ai 等，查询 2026-07-20）。

---

## 4. 量化在推理侧的实践 2026

**权重量化主流格式**
- **FP8**（H100 及以后原生支持）：2026 年云端服务的默认精度，近乎无损；
- **INT8**：SmoothQuant 一代的遗产，仍广泛用于旧卡；
- **INT4 / AWQ / GPTQ**：自托管社区的主力 PTQ 格式（权重 4bit、激活高精度），显存减半再减半；
- **MXFP4 / NVFP4**：微缩放 4bit 浮点（每 32 元素共享一个尺度因子，约 4.25 bit/参数），随 Blackwell 硬件原生支持而快速上位；NVFP4 是 NVIDIA 为 Blackwell 定义的变体。

**KV cache 量化**
FP8 KV cache 已是生产常规操作：显存减半，主流长上下文基准上精度损失 **<0.5 个百分点**；INT8 KV「几乎无损」（LMDeploy 官方文档口径）；INT4 KV 可用但风险上升——2026 年有研究指出 4bit KV 会引起行为漂移（如拒答行为退化），2bit 则显著崩坏。
- 来源：lmdeploy.readthedocs.io（INT4/INT8 KV Quant）；dev.to KV cache quantization 综述（查询 2026-07-20）。

**质量损失的共识口径**
- **8bit（FP8/INT8）≈ 无损**：权重与 KV 皆然，各框架文档一致；
- **4bit 权重 = 轻微损失**：AWQ/GPTQ 校准后困惑度/基准分数小幅下降，任务敏感（数学/代码降得多些）——这是 PTQ 的天花板；
- **QAT 可以把 4bit 做到接近无损**：这正是 2025–26 的关键转变。

**QAT 交付 vs PTQ 的分工（2026 的新格局）**
- **GPT-OSS**（OpenAI，2025-08）：首个原生 MXFP4 交付的开源模型——MoE 专家权重（约占 90% 参数量）以 MXFP4 训练/发布，120B 模型因此塞进单张 80GB 卡；
- **Kimi K2-Thinking / K2.6**：原生 INT4 QAT（专家权重 INT4，其余 BF16）；
- **Kimi K3**（2026-07-16 发布，2.8T 参数 MoE）：**从 SFT 阶段起做 QAT，MXFP4 权重 + MXFP8 激活**，发布即 4bit——量化不再是发布后的第三方压缩，而是模型设计约束的一部分，带宽需求较 FP16 降约 4×；
- 分工共识：**旗舰开源模型走 QAT 原生低精度交付；社区对存量/其他模型继续用 AWQ/GPTQ 等 PTQ 事后压缩**。NVIDIA ModelOpt 等工具链把 QAT 微调也产品化了。
- 来源：lmsys.org/blog/2025-08-28-gpt-oss-qat/；NVIDIA 技术博客（QAT for gpt-oss）；MarkTechPost/HuggingFace blog 关于 Kimi K3（均查询 2026-07-20）。

---

## 5. API 定价解剖（2026-07）

### 5.1 价格表（$/百万 token，查询日期 2026-07-20）

| 模型 | 输入 | 输出 | 缓存命中输入 | 备注 |
|---|---|---|---|---|
| **GPT-5.6 sol**（OpenAI） | 5.00 | 30.00 | 0.1–0.2×输入价 | 官方 developers.openai.com |
| **GPT-5.6 terra** | 2.50 | 15.00 | 同上 | |
| **GPT-5.6 luna** | 1.00 | 6.00 | 同上 | |
| **GPT-5.5** | 5.00 | 30.00 | 同上 | |
| **GPT-5.4-mini / nano** | 0.75 / 0.20 | 4.50 / 1.25 | 同上 | |
| **Claude Fable 5**（Anthropic） | 10.00 | 50.00 | 1.00（0.1×） | 官方 platform.claude.com |
| **Claude Opus 4.8** | 5.00 | 25.00 | 0.50 | Fast mode 加价：$10/$50 |
| **Claude Sonnet 5** | 3.00（介绍价 2.00 至 2026-08-31） | 15.00（介绍价 10.00） | 0.30 | |
| **Claude Haiku 4.5** | 1.00 | 5.00 | 0.10 | |
| **Gemini 3.1 Pro**（Google） | 2.00 | 12.00 | 0.1×输入价 | >200K 上下文：4.00/18.00〔待核〕 |
| **Gemini 3 Flash（preview）** | 0.50 | 3.00 | 同上 | 〔待核〕 |
| **Gemini 3.5 Flash** | 1.50 | 9.00 | 同上 | 〔待核〕 |
| **DeepSeek V4 Pro** | 0.435（未命中） | 0.87 | 0.003625 | 官方 api-docs.deepseek.com |
| **DeepSeek V4 Flash** | 0.14（未命中） | 0.28 | 0.0028 | 1M 上下文，缓存命中折扣达 98% |
| **Kimi K3**（Moonshot） | 3.00 | 15.00 | 0.30 | 1M 上下文平价无加价〔待核对 platform.moonshot.ai〕 |
| **GLM-5.2**（Z.ai/智谱） | 1.40 | 4.40 | 0.26 | 〔待核〕；OpenRouter 第三方托管更低（~0.95/3.00） |
| **Qwen3.7-Max**（阿里） | 2.50（限时 5 折 1.25） | 7.50（限时 3.75） | — | 〔待核对阿里云百炼官方页〕 |

教学观察：①「旗舰 $3–5 / $15–30、次旗舰 $1–2.5、开源系 $0.3–1.5」的三档格局；②中国开源系（DeepSeek/GLM）把旗舰能力价格压到美系 1/5–1/10；③ Kimi K3 直接对标 Claude Sonnet 5 定价（$3/$15 分毫不差），是「开源模型按闭源旗舰定价」的首例。

### 5.2 为什么输出比输入贵 3–6 倍

各家输出/输入比：OpenAI 6×、Anthropic 5×、Gemini 6×、DeepSeek 2×、Kimi 5×。成本结构解释：
- **输入 token 走 prefill**：一次前向并行算完全部 prompt，GPU 时间被摊薄到数千 token 上，算力利用率高 → 每 token 占用的 GPU·秒极低；
- **输出 token 走 decode**：每个 token 都需要一次完整前向（读全部权重 + KV cache），访存受限、利用率低 → 每 token 占用的 GPU·秒高一个量级；
- 定价比大体是在转嫁这个 GPU 时间成本比（再叠加：推理模型的 thinking token 也按输出计费，进一步推高输出侧收入占比）。

### 5.3 Prompt caching 折扣 = KV cache 复用的商业化

- 通行价：**命中价 ≈ 0.1× 输入价**（OpenAI「90% off」、Anthropic 0.1×、Gemini 2.5+ 0.1×、Kimi 0.1×）；**DeepSeek 激进到 ≈0.02×**（Flash：0.0028 vs 0.14）。
- 机制对应：厂商保存你的前缀 KV cache（Anthropic 显式收缓存写入费：5 分钟 TTL 1.25×、1 小时 TTL 2×输入价；Gemini 显式缓存收 $0.50/M 写入 + 存储费；OpenAI/DeepSeek 隐式缓存不另收费），命中即跳过该前缀的 prefill 计算，只付存取成本——这就是 §2 prefix caching 在 API 账单上的投影。
- Anthropic 官方口径：5 分钟缓存**一次命中即回本**（1.25 + 0.1 < 2×1.0）。
- 来源：platform.claude.com/docs/en/about-claude/pricing；developers.openai.com/api/docs/pricing；ai.google.dev/gemini-api/docs/caching（查询 2026-07-20）。

### 5.4 Batch API 与其他折扣形态

- **Batch API 五折**是行业统一形态：OpenAI 50%、Anthropic 50%（官方 batch 价表：Opus 4.8 $2.5/$12.5）、Gemini 50%〔待核〕。异步 24h 内交付。经济逻辑：批量任务可调度到集群低谷时段填充闲置算力，边际成本极低，五折卖仍有利润——这是「闲置率」直接反映到价格面的例子。
- 其他形态：DeepSeek 曾有错峰（off-peak）折扣（2026-07 官方页已不再列出）；Anthropic 上下文 1M 平价（无长上下文加价）而 Gemini 3.1 Pro >200K 输入加价 2×——长上下文是否加价成为差异点。

### 5.5 2023→2026 同能力价格下降的量级

- **a16z「LLMflation」**（Guido Appenzeller，2024-11）：同等能力的推理价格**每年约降 10×**，比摩尔定律快得多；GPT-3 级能力从 2021 到 2024 降约 1000×。
- **Epoch AI**（llm-inference-price-trends，持续更新）：降幅高度依赖任务——**每年 9× 到 900×，中位数约 50×/年**；"降价"是一条粗均线，任务间极不均匀。
- **GPT-4 级能力**：2023-03 上市 $30/M（输入）→ 2026 年同水平能力约 $0.3–0.5/M——**约 60–100× 的三年降幅**（多家 2026 年测算口径：a16z 后续更新给 ~62×；第三方给 95–100×）。结论可以写成：「GPT-4 级能力三年降百倍」在量级上成立，精确倍数取决于用哪个模型对标。
- 来源：a16z.com/llmflation-llm-inference-cost/；epoch.ai/data-insights/llm-inference-price-trends（查询 2026-07-20）。

---

## 6. 每 token 成本的构成（教学向）

**拆解框架**：每 token 成本 ≈ GPU 每小时总成本 ÷ 该 GPU 每小时产出 token 数。
- GPU 小时成本三件套：**折旧**（卡价 ÷ 3–5 年摊销，AI 卡实际淘汰周期常只有 ~2 年，是最大头）+ **电力/制冷** + **托管运维**。参照系：H800/H100 租赁价 ~$2/小时（DeepSeek 测算采用的口径）。
- **闲置率/利用率是隐藏的放大器**：20% 利用率下的每 token 电费约为 80% 利用率下的 4 倍；vLLM/TensorRT-LLM/SGLang 这代框架把典型利用率从 30–40% 抬到 70–80%——软件优化直接等价于成本减半再减半。
- API 定价 = 上述成本 ÷ (1 − 目标毛利率)，再叠加各家的补贴/占份策略。

**公开测算案例：DeepSeek 的 545%（已核实）**
2025-03-01，DeepSeek 在开源周收官的 GitHub 帖中首次公开 V3/R1 推理集群的成本收入数据：按 H800 租赁价 $2/小时计，**日均推理成本 $87,072，按 R1 定价折算的理论日收入 $562,027，理论成本利润率 545%**（年化理论收入约 $2 亿+）。官方同时声明**实际收入远低于此**：网页/App 免费不产生收入、V3 定价低于 R1、夜间错峰折扣。教学价值：这是头部厂商唯一一次公开推理集群账本，证明了在 PD 分离 + 大 EP + 高利用率下，推理服务毛利可以非常可观——但「理论」二字承担了全部重量。
- 来源：CNBC 2025-03-02（cnbc.com/2025/03/02/chinas-deepseek-claims-theoretical-cost-profit-ratio-of-545percent-per-day.html）；Computerworld（查询 2026-07-20）。

**自托管 vs 调 API 的盈亏平衡直觉**
- 行业经验口径：**持续 GPU 利用率 ≥40–50%（约合每卡每天 1000 万 token 以上）时自托管开始便宜**；低于此，API 更划算——因为你在为闲置买单，而 API 厂商用多租户把闲置摊掉了。
- 修正因素：开源模型 QAT 4bit 交付（§4）显著降低自托管门槛；但 API 侧的 prompt caching/batch 折扣同样在压低有效单价，盈亏线比表面价格对比更偏向 API。
- 来源：introl.com（Inference Unit Economics）、lyceum.technology 等 2026 测算（查询 2026-07-20）。

---

## 7. 推理算力占比的宏观数字

**「推理已超过训练」在 2026 年成为多家口径的共识**：
- 行业估算：推理约占全部 AI 算力的 **2/3（2026）**，此前为 1/3（2023）、1/2（2025）〔多家分析机构口径，非单一来源精确数〕；
- 2026 年初，**推理负载首次占 AI 优化基础设施支出的 55% 以上**，超过训练〔待核，byteiota 等二手口径〕；
- **Deloitte 2026 TMT 预测**：推理优化芯片市场 2026 年超过 **$500 亿**，增速首次超过训练侧；
- 生命周期视角：一个模型全生命周期算力开销中推理占 **80–90%**，训练仅 10–20%。
- 来源：deloitte.com 2026 TMT Predictions（compute-power-ai）；introl.com；byteiota.com（查询 2026-07-20）。

**Agent 时代的 token 消耗暴涨（OpenRouter 数据点）**：
- OpenRouter 年化处理量 2026 年中达 **~1.5 千万亿（quadrillion）token/年**，一年前约 100 万亿/年；周消耗 12.1 万亿 token，**同比 12.7×**；
- **2026 年初，agent 产生的 token 量超过了人类直接对话的 token 量**（OpenRouter COO 口径，爆发始于 2026 年 2 月前后）；
- 单请求量级差：agent 请求平均消耗约为普通人类请求的 **15×**（OpenRouter 数据）；按任务算：一次聊天 200–2,000 token，RAG 查询 2,000–12,000，**一次 agent 任务可超 100 万 token**（5–30× 到千倍级，取决于任务长度）；
- 结构变化：编程类用途占 OpenRouter 总 token 的 **50%+**（2025 年初仅 11%）。
- 来源：menlovc.com（OpenRouter quadrillion tokens）；saastr.com（OpenRouter COO 访谈）；macromicro.me OpenRouter token usage 图表（查询 2026-07-20）。

---

## 附：本卷可用的叙事钩子

1. §1→§2 的因果链：两阶段物理特性不同 → 混跑互相干扰 → 单机缓解（chunked prefill）→ 彻底分离（PD 分离）→ 分离后各阶段独立优化（投机解码加速 decode、prefix caching 消灭重复 prefill）。
2. §2 prefix caching ↔ §5.3 缓存折扣：同一个技术在引擎侧和账单侧的两个投影，适合作为「技术如何变成价格信号」的例子。
3. §4 QAT 交付 ↔ §6 自托管盈亏线：量化从压缩手段变成交付格式，直接改写了自托管经济学。
4. §5.2 输出贵 5 倍 ↔ §1 两阶段：定价表就是 prefill/decode 成本结构的公开化石。
5. §6 DeepSeek 545% ↔ §5.5 三年降百倍：毛利空间与降价空间是同一枚硬币的两面。

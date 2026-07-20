# 中国大模型产业：战略 · 商业模式 · 开放权重生态调研事实清单

> 调研日期：2026-07-20。用途：第六卷《2026 产业地图》。
> 分工说明：**模型技术参数不在本文重复**（见 `research-model-landscape.md` 的发布谱系）。本文只覆盖**公司、商业、战略、生态**层面。
> 方法：我知识截止 2026-01；2026-01 之后的事实全部来自本次联网搜索，均标来源与日期。不确定或单一来源存疑处标〔待核〕。
> 注意：AI 独角兽估值/融资数字在中文财经媒体间口径混乱（人民币/美元、投前/投后、港元市值波动），引用具体数字前建议回溯一手（招股书、官方公告、Reuters/The Information/彭博）。

---

## 一、"开放权重"策略的产业逻辑（本卷核心论点）

### 1.1 事实底盘：中国开源模型已在全球调用量上占据多数

- **OpenRouter 上中国开源模型约占全部 token 消耗的 61%**（2026-05/06），前五大最常用模型中四个是中国模型；Meta Llama 路由份额已跌破 1%。OpenRouter 周处理量已超 20 万亿 token（2025-04 的约 5T/周 → 2026-04 的 20T/周，一年约 4×）。厂商拆分：小米 MiMo 约 21%（编程流量约 22%）、DeepSeek 约 17.6%（高于 Anthropic 15.4%）、Google 从约 37% 跌到约 13%。来源：[datagravity《China's Open-Weight Takeover》2026-06](https://www.datagravity.dev/p/chinas-open-weight-takeover)。
- **美国公司自身把最多 46% 的 OpenRouter token 路由给了中国开源模型**（2026）。来源：同上 / [BCG《The Great Divide》2026](https://www.bcg.com/publications/2026/us-and-china-ai-strategy-causing-global-ai-divide)。
- **成本差**：DeepSeek/Qwen/GLM 等开源模型比 OpenAI、Anthropic 旗舰**便宜 60%–90%**；常见编程任务在 DeepSeek 上成本 < $0.50，在美国前沿模型上约 $10。来源：[ecorpit 2026](https://ecorpit.com/chinese-open-models-enterprise-ai-cost-2026/)、[Stanford AI Index 2026 报道](https://thenextweb.com/news/stanford-ai-index-2026-china-us-performance-gap)。
- 转折点可直接追溯到 **DeepSeek-R1（2025-01）**，随后 Qwen、Kimi、GLM、MiniMax、小米 MiMo 逐一填满美国前沿线以下的每个"性价比生态位"。来源：datagravity 同上。

### 1.2 产业界给出的策略动机（多因叠加，非单一）

1. **开源是"获客漏斗"而非"护城河"**：datagravity 的论断——"Qwen 的十亿下载是阿里云的获客成本，不是产品本身"。权重免费用来播种采用，货币化发生在**云上推理/企业服务**，不是模型授权。ByteDance 以广告收入补贴视频生成、阿里以云服务变现 Qwen，都是"平台补贴模型"模式。
2. **价格武器化 / 绕过闭源巨头的品牌与渠道劣势**：以极低 API 价换市场份额，"前沿变成一个功能，而开放、便宜、够用的那一层吃掉了走量的需求"。DeepSeek 拿下约 17% 的开发者用量却只占约 1% 的收入。来源：datagravity。
3. **算力稀缺下的对冲**：在 HBM/先进芯片受限（2026 年国产 CXMT 约 2.0M 堆栈产出，仅够约 25 万–30 万颗昇腾 910C 封装，内存是硬约束）的条件下，高效开源模型能从有限硬件榨出最大效用。来源：datagravity。
4. **地缘/主权维度**：中国实验室**不需要出口许可、也无法被美国商务部"下线"**（不同于受美国管辖的闭源 API）。这被视为"开放权重挡住了封杀"的结构性优势。来源：[TechTimes 2026-07](https://www.techtimes.com/articles/320171/20260711/washington-wants-chinese-ai-out-corporate-america-open-weights-block-ban.htm)。
5. **国内商业化困难的"副产品"论**也成立：C 端难变现（见第五节豆包），开源+低价 API 反而是把技术能力转成生态影响力的现实路径；行业话术已成"**开源引流 + 低价 API 变现**"闭环，权重全开、API 价约为闭源的 1/10。来源：[新浪财经《开源 AI 的中国时刻》2026-07-07](https://finance.sina.com.cn/jjxw/2026-07-07/doc-inifxpif8309137.shtml)。

### 1.3 学界/智库框架

- **USCC《Two Loops》（美中经济与安全审查委员会，2026-03）**：中国开源 AI 战略由两个反馈回路强化产业主导。
  - **数字回路（训练侧）**：开源降低门槛→加速全球采用→需求驱动迭代→再采用；Qwen 在 Hugging Face 上拥有最大模型生态（10 万+ 衍生模型）。
  - **物理回路（部署侧）**：开源模型让制造、机器人、物流低成本部署→产生真实运营数据→回流精炼模型，形成"互锁的创新飞轮"，是专有美国模型难以复制的。政策层面：中国已把"数据"定为生产要素、允许企业把数据资产入表，制度化地积累这一优势。来源：[USCC《Two Loops》PDF](https://www.uscc.gov/sites/default/files/2026-03/Two_Loops--How_Chinas_Open_AI_Strategy_Reinforces_Its_Industrial_Dominance.pdf)。
- **Stanford HAI / DigiChina《Beyond DeepSeek: China's Diverse Open-Weight AI Ecosystem》** issue brief：强调中国开源生态的多元性与政策含义（非单一 DeepSeek）。来源：[Stanford HAI 简报 PDF](https://hai.stanford.edu/assets/files/hai-digichina-issue-brief-beyond-deepseek-chinas-diverse-open-weight-ai-ecosystem-policy-implications.pdf)。
- **创始人话术**：月之暗面杨植麟——Kimi 的技术创新任何人可获取，形成生态系统共同推进 AI；智谱"**摸高计划**"——"做摸高的人，不摘低垂果实，未来两年战略性投入攀登 AGI 最高峰，坚持开源开放与全球协作"。来源：[WebSearch 聚合，2026-07](https://finance.sina.com.cn/jjxw/2026-07-07/doc-inifxpif8309137.shtml)。

### 1.4 开源 → 蒸馏防御：开源模型多快被复现

- 观点：中国实验室会在美国闭源对手发布**数月内**蒸馏、复现并开源出前沿能力；传统"落后 6–8 个月"的认知已明显收窄。来源：[decodethefuture《Adversarial Distillation 2026》](https://decodethefuture.org/en/adversarial-distillation/)。
- **闭源阵营的反制**：OpenAI、Google、Anthropic 通过 **Frontier Model Forum** 共享威胁情报，检测"对抗性蒸馏"（自动化查询攻击提取前沿模型输出用于训练廉价复制品）。Anthropic 称记录到超 **1600 万次可疑交互**，追溯到 DeepSeek、Moonshot、MiniMax；据称三方合计创建约 **2.4 万个欺诈账户**、生成 1600 万+ 次与 Claude 的交互以训练竞品。来源：[Medium《Three Sworn Rivals, One Enemy》2026-04](https://medium.com/@tatsuru.okada/three-sworn-rivals-one-enemy-inside-the-frontier-model-forums-quiet-war-on-chinese-distillation-60be4183f61a)、[The Rapacke Law Group](https://arapackelaw.com/intellectual-property/chinese-deepseek-distillation/)。〔待核：Anthropic 官方口径与具体数字建议回溯 Anthropic 威胁报告原文〕
- 含义（可供书中论证）：**开放权重把"能力复制"从少数实验室的秘密变成公共品**，反过来削弱了任何单一玩家靠权重保密建立的护城河——这既是中国开源策略的攻势，也解释了美国前沿实验室为何转向"防蒸馏"而非"防开源"。

---

## 二、DeepSeek（深度求索）

### 2.1 公司背景

- 母体为量化私募**幻方量化（High-Flyer）**，创始人**梁文锋**。2019–2022 年间梁把幻方超 **1.39 亿美元**自营交易利润投入 Fire-Flyer 超算平台，并囤积 **1 万+ 颗英伟达 A100**（早于出口管制收紧）。2025 年幻方管理规模突破千亿人民币，业内曾有"北九坤、南幻方"之称。来源：[Forbes 2026-06](https://www.forbes.com/sites/anishasircar/2026/06/17/deepseek-just-raised-74-billion-heres-the-catch/)、[澎湃 2026](https://m.thepaper.cn/newsDetail_forward_33164844)。

### 2.2 融资：此前〔待核〕的"¥510 亿"数字——已交叉证实为真

- **首轮外部融资约 510 亿元人民币（约 74 亿美元 / $7.4B），2026 年 6 月完成**，投后估值约 **$50B–$52B**，为中国估值最高的 AI 创业公司。注意：这是 DeepSeek **成立以来的首次外部融资**，此前完全靠幻方输血、无外部资金。来源：[Forbes 2026-06-17](https://www.forbes.com/sites/anishasircar/2026/06/17/deepseek-just-raised-74-billion-heres-the-catch/)、[The Information](https://www.theinformation.com/articles/deepseek-raise-7-billion-startup-plots-revenue-efforts)、[量子位 2026-05](https://www.qbitai.com/2026/05/414432.html)。
  - 结论：**前卷标注的 ¥510 亿并非伪数字**，对应的正是这轮首次外部融资；但它不是传统意义的"A 轮"，媒体多称"首轮/首次外部融资"。
- **梁文锋本人是本轮最大出资方**：个人出资约 **200 亿元人民币（约 30 亿美元）**，借此维持约 **78%**（另有中文源称直接+间接控制 **84.29%**）的股权。来源：Forbes、[BigGo Finance](https://finance.biggo.com/news/1d259b1d-eeec-4d94-aab1-06f87558f58f)、[证券时报 stcn](https://www.stcn.com/article/detail/3904065.html)。
- **投资方**：腾讯拟投约 100 亿元、宁德时代（CATL）拟投约 50 亿元、**国家人工智能产业投资基金**（国资）等。来源：Forbes。
- **"The Catch"（交易结构异常，写书要点）**：绝大多数投资人是通过**梁文锋控制的有限合伙**入股，**非直接股权**，**5 年锁定期**，**几乎无投票权**；唯一例外是国家 AI 产业投资基金——获**直接投票权且无锁定期**。这加深了外界对 DeepSeek 与国家利益绑定、数据访问的担忧。来源：Forbes 2026-06-17。
- **后续动向**：完成首轮后又在洽谈新一轮，投前估值从 $52B 升至约 **$71B（约 4800 亿元人民币）**；并于 **2026-07-15 前后启动 A 股 IPO 筹备**，拟境内上市，最快 2026 年内递表、目标 2027 挂牌。梁文锋身家升至约 **$36B**，被称"全球最富 AI 创始人"。来源：[新浪 2026-07](https://k.sina.com.cn/article_1651428902_626ece2602001gvoe.html)、[Memeburn](https://memeburn.com/deepseek-ipo-2026-at-71b-valuation/)、[cryptobriefing](https://cryptobriefing.com/deepseek-liang-wenfeng-richest-ai-creator/)。〔待核：IPO 时间表与板块为媒体报道，未见官方确认〕

### 2.3 商业模式与盈利

- 收入主要来自 **API 调用 + 模型授权**，官方**未披露具体营收**。梁文锋名言："钱从来不是问题，先进芯片的禁运才是问题。"（"Money has never been the problem… bans on shipments of advanced chips are the problem."）来源：Forbes。
- 用量地位：V4-Flash 据报**全球 LLM API 调用量第一**；Vercel 2026-06 数据显示 DeepSeek 处理其 AI Gateway 近 **23% 的企业 token**。来源：Forbes、[cryptobriefing](https://cryptobriefing.com/deepseek-liang-wenfeng-richest-ai-creator/)。
- 幻方资金支持仍是底盘：长期"以量化养 AI"，使 DeepSeek 能打**API 价格战**而不依赖外部输血——这是其定价激进的结构性原因。

### 2.4 R2 延期：截至 2026-07 仍未发布

- DeepSeek **从未确认 R2 发布日期**；2026-04 改为先发 **V4 系列（V4-Pro / V4-Flash）**。Reuters 报道**梁文锋因对性能不满压住发布**。来源：[wandb ML-News 复述 Reuters](https://wandb.ai/byyoung3/ml-news/reports/DeepSeek-Delays-R2-Model-Launch-Amid-CEO-Concerns-and-Chip-Constraints--VmlldzoxMzQwNDQ2OQ)、[decodethefuture 状态页](https://decodethefuture.org/en/deepseek-r2-explained/)。
- **芯片罗生门**：2025 年曾传 R2 用华为昇腾训练，因昇腾稳定性问题被迫回切英伟达训练、华为芯片保留做推理（此前中国监管曾敦促用昇腾）。传闻的"1.2T MoE""32B dense"版本均**未证实**。来源：[SiliconANGLE 2025-08](https://siliconangle.com/2025/08/14/deepseek-r2-model-release-reportedly-held-back-faulty-huawei-chips/)、[eWeek](https://www.eweek.com/news/deepseek-ai-model-launch-delayed-chips-nvidia/)。
- 现状：推理能力实际由 **V3.2-Speciale 与 V4** 承接；预测市场把赌注写成"**R2 / V4-Thinking**"，即市场本身也不确定 R2 会独立发布还是并入 V4 的推理特化版。来源：decodethefuture、[recodechinaai](https://www.recodechinaai.com/p/deepseeks-next-move-what-v4-will)。

### 2.5 "DeepSeek 时刻"一年后的象征意义

- 2025-01-27 R1 发布引发英伟达单日约 **6000 亿美元**市值蒸发（"DeepSeek 时刻"）。一年后评估：它启动了中国开源模型从"可忽略"到"OpenRouter 多数份额"的迁移，把"低成本+开放"确立为可与美国前沿抗衡的产业路线，并直接催化了 Qwen/Kimi/GLM/MiniMax 的开源军备竞赛。来源：datagravity、多源综合。

---

## 三、阿里 Qwen（通义千问）

### 3.1 全谱系开源的商业逻辑

- **累计下载超 10 亿次**（2026-03/04 前后），超过 Meta Llama；占**全球开源模型下载量的 50%+**。增长曲线：2026-01 约 7 亿 → 2026-03 约 9.42 亿。来源：[SCMP 2026](https://www.scmp.com/tech/big-tech/article/3349552/alibabas-qwen-family-captures-over-50-global-open-source-downloads-report-finds)、[Xinhua 2026-01](https://english.news.cn/20260113/004b0522f987475cbf83ffc3a8d009aa/c.html)、[Open Source For You 2026-07](https://www.opensourceforu.com/2026/07/alibabas-qwen-crosses-one-billion-downloads-eclipsing-metas-llama/)。
- **衍生生态**：Qwen 谱系累计发布近 **400 个模型**，衍生出 **18 万+ 衍生版本**（Hugging Face）；datagravity 另给出约 **11.3 万+ 衍生、约 20 万 Qwen 标签模型、Hub 新增 LLM 衍生的约 40% 基于 Qwen**（口径不同，均指向"最大开源生态"）。来源：SCMP、datagravity。
- **许可**：开源线全部 **Apache 2.0**（可自由使用/修改/分发）。谱系从 **0.6B（可跑在手机）到 480B（数据中心编程模型）**，"每个部署层级都有一款 Qwen"。来源：datagravity、[opensourceforu](https://www.opensourceforu.com/2026/07/alibabas-qwen-crosses-one-billion-downloads-eclipsing-metas-llama/)。

### 3.2 与阿里云的捆绑

- 商业本质：**下载=获客，变现=阿里云推理/服务**，不靠模型授权收费。阿里 2026 年资本开支约 **¥126.1B（约 $17.5B）** 投向 AI 基础设施。来源：datagravity。

### 3.3 开源线与闭源旗舰的分工

- 开源线（Qwen3 / Qwen3.5 全谱系）负责生态卡位与走量；**闭源旗舰 Qwen-Max / Qwen3.7-Max**（后者 2026-05 云栖峰会发布，定位 agentic、单会话可串 1000+ 工具调用、1M 上下文、参数未公开）负责高端与差异化能力，不开源。来源：[CNBC 2026-02](https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html)、model-landscape 卷。
- 战略定位（datagravity 归纳）："Qwen 拥有生态、DeepSeek 拥有性价比、Kimi 拥有 agentic 节奏、字节拥有媒体/多模态"——**四家分层不正面撞车**。

---

## 四、月之暗面（Kimi）· 智谱（GLM）· MiniMax · 阶跃星辰

> 估值口径混乱，以下取多源交叉后的区间；港股市值随行情波动，注明日期。

### 4.1 估值总览（2026 年中）

- 纯 AI 实验室合计估值约 **$159B**（datagravity）：智谱约 **$56B**、DeepSeek 约 **$50B**、MiniMax 约 **$33B**、月之暗面约 **$20B**。另有中文源给智谱约 580 亿美元、MiniMax 约 320 亿美元、Kimi 约 200 亿美元、阶跃约 100 亿美元。来源：[datagravity](https://www.datagravity.dev/p/chinas-open-weight-takeover)、[知乎《AI 五虎 2026 年中数据》](https://zhuanlan.zhihu.com/p/2040503903507173383)。

### 4.2 智谱（Zhipu / Z.ai，GLM）

- **上市**：2026-01-08 登陆**港交所**，发行价 **HK$116.20**，首日小涨（+3.27%～+13%，源口径不一），市值约 **HK$555 亿**。截至 2026 年中港股稳态市值约 **HK$4000–4700 亿**〔待核：与首日 555 亿差异大，疑不同日期/口径〕。来源：[财新 2026-01-08](https://m.caixin.com/m/2026-01-08/102401574.html)、[投资界](https://news.pedaily.cn/202601/559667.shtml)。
- **融资史/国资背景**：2019 年成立（清华系，张鹏），累计 15+ 轮融资；上市前基石投资人含**北京核心国资背景基金**；国资/G 端色彩最重。来源：[21 经济网](https://www.21jingji.com/article/20260114/herald/e4dd26bc84b9bedb8be24d7c28e819ed.html)。
- **商业模式**：面向 **G 端 + B 端**，以 **MaaS 为核心**的标准化产品；"摸高计划"强调长期投入与开源开放。

### 4.3 MiniMax（稀宇）

- **上市**：2026-01-09 港交所，发行价 **HK$165**，**首日大涨约 109%–110%**，市值超 HK$1050 亿（约 HK$1067 亿）；曾登顶港股第一高价股。截至 2026-05-29 收 **HK$840**（较发行价累计 **+409%**），市值约 **HK$2635 亿**。号称"从成立到 IPO 历时最短的 AI 公司"。另有 A 股 IPO 传闻。来源：[新浪财经 2026-05-30](https://finance.sina.com.cn/stock/zqgd/2026-05-30/doc-inhzsnki8656633.shtml)、[21 经济网](https://www.21jingji.com/article/20260114/herald/90319a3b75011021941567b4d10621c1.html)。
- **国资背景**：2025-07 获**上海国资母基金**约 3 亿美元投资，投后估值约 300 亿元。来源：[新浪](https://finance.sina.cn/roll/2026-05-25/detail-inhzchzf4992540.d.html)。
- **商业模式**：**面向 C 端 + 出海**（Talkie 等垂直/陪伴类应用），聚焦垂直场景，是"出海"路线代表。

### 4.4 月之暗面（Moonshot / Kimi）

- **融资**：2026-05/06 洽谈新一轮，募资上限 **$2B**，对应**投前估值约 $30B**；较 2025-12 的 **$4.3B 估值涨约 7 倍**。来源：[新浪 2026-06-09](https://finance.sina.cn/roll/2026-06-09/detail-iniavshk3028722.d.html)、datagravity（另记 5 月 $2B@$20B）。
- **商业**：**to C 应用（Kimi）+ agentic 模型（K2 系列，编程/智能体节奏快）**；据 datagravity，Kimi **ARR 两个月从 $100M 涨到 $200M**。创始人杨植麟（"清华天才"，马斯克曾点赞）。
- **IPO**：因**循环智能 5 家老股东在香港国际仲裁中心的索赔案未了，尚未启动递表**。来源：[21 经济网](https://www.21jingji.com/article/20260114/herald/e4dd26bc84b9bedb8be24d7c28e819ed.html)、[财联社](https://www.cls.cn/detail/2227664)。

### 4.5 阶跃星辰（StepFun）

- **融资**：完成 **50 亿元人民币 B+ 轮**（2026-01，当月国内 AI 领域最大单笔），创记录。估值约 **¥100 亿 / $10B 量级**。来源：[知乎《极新月报》2026-01](https://zhuanlan.zhihu.com/p/2001758790966595845)、[新浪《阶跃星辰竞速月之暗面》2026-06](https://finance.sina.com.cn/wm/2026-06-03/doc-iniacnus0942558.shtml)。
- **IPO**：目标 **2026 年底递表**，与月之暗面争"下一个上市"。多模态见长。

### 4.6 商业模式差异一句话总结

- **Kimi**：to C 应用 + agentic 编程节奏；**智谱**：to G/to B 的 MaaS，国资色彩最重；**MiniMax**：to C + 出海垂直应用；**阶跃**：多模态、追赶上市。**智谱与 MiniMax 已抢先在港股上市，争"大模型第一股"**。

---

## 五、大厂：字节豆包 · 腾讯混元 · 百度文心

### 5.1 与创业公司的根本不同

大厂有**场景 + 资金 + 分发渠道**，可用现成平台（抖音/微信/搜索/云）变现，不必靠模型本身盈利；创业公司则更依赖开源引流与外部融资。ByteDance 2026 资本开支超 **¥200B（约 $28–29B）**，历史上约一半用于 AI 芯片。来源：[datagravity](https://www.datagravity.dev/p/chinas-open-weight-takeover)。

### 5.2 字节豆包（Doubao）

- **用户规模**：2026 上半年 **DAU 突破 2 亿、MAU 突破 3.45 亿**；2026 Q1 以 **28.7% 市场份额首次超越百度文心（26.3%）登顶国内 C 端**，腾讯混元 17.2% 居第三。来源：[智晓科创 2026 Q1 份额](https://zxiaolin.com/newsflashes/3020.html)、[Soft6](https://www.soft6.com/news/2026/06/26/1639478373.html)。
- **商业化困境（写书要点）**：用户巨大但**单日总收入不足 100 万元**，营收几乎完全依赖内嵌抖音商城的电商佣金，而对应**日算力消耗已达数千万元**，营收仅为成本零头。来源：[新浪《AI 告别"唯流量论"》](https://k.sina.com.cn/article_7857201856_1d45362c001907er8c.html)。
- **战略转向**：从"多拉 C 端用户"转向**开发者、Agent、真实工作流**，把资源从豆包挪向**企业服务与编程模型**；商业化主力是 **to B 的火山引擎**。来源：[信息化观察网《豆包，开始学智谱》2026-07](https://www.infoobs.com/article/20260701/71562.html)、[OFweek](https://www.ofweek.com/ai/2026-06/ART-201717-8110-30692387.html)。

### 5.3 百度文心（ERNIE）：从"坚持闭源"到开源的转变

- **注意方向**：任务描述写"从开源到闭源"，但公开事实是**反向**——李彦宏早年坚持"永远该选闭源模型"，**DeepSeek 开源成功后转向**：2025-04-01 文心一言 App 全面免费，**2025-06-30 正式开源文心 4.5 系列（10 款模型，含 47B、3B MoE，Apache 许可，权重+推理代码全开）**。来源：[证券时报 stcn](https://www.stcn.com/article/detail/2311908.html)、[观察者网 2025-02](https://www.guancha.cn/economy/2025_02_14_765076.shtml)。〔提示：书中如按"从开源到闭源"叙述需修正为"从坚持闭源被迫转向开源"〕
- **2026 动向**：文心 5.1（2026-05，称预训练成本仅业界 6%〔待核〕）搜索能力登顶国内；出现"**文心合并、豆包收费**"的策略调整——文心在 C 端定位为**生态入口而非利润中心**，百度收入主干仍是搜索广告、智能云、企业级 AI。来源：[量子位 2026-05](https://www.qbitai.com/2026/05/414496.html)、[OFweek](https://www.ofweek.com/ai/2026-06/ART-201717-8110-30692387.html)。

### 5.4 腾讯混元（Hunyuan）

- 国内 C 端约 **17.2% 份额居第三**；"腾讯为什么推不出豆包"成为讨论话题（有场景无爆款）。AI 入口争夺战中腾讯曾发 10 亿、百度发 5 亿补贴。来源：[新浪《腾讯为什么推不出豆包》](https://finance.sina.cn/stock/jdts/2026-05-18/detail-inhyivty3705869.d.html)、[古东管家](https://www.gudongtech.com/depth/2541032601643405)。

---

## 六、中美格局对比与竞争动态

### 6.1 前沿差距的公开评估（2026）

- **Epoch AI**：自 2023 年以来中国模型平均落后美国前沿约 **7 个月**（最小 4、最大 14 个月）。来源：[Epoch AI《US vs China ECI》](https://epoch.ai/data-insights/us-vs-china-eci)。
- **Stanford AI Index 2026**：最强美/中模型的性能差距**收窄到 2.7%**（2023-05 时为 17.5–31.6 个百分点），而美国私人 AI 投资是中国的 **23 倍**（$285.9B vs $12.4B）。中国领先于**人才管线、专利、论文、机器人、能源基础设施**；美国领先于**投资与模型性能**。来源：[TNW 报道 Stanford AI Index 2026](https://thenextweb.com/news/stanford-ai-index-2026-china-us-performance-gap)。
- **DeepMind CEO Hassabis**：差距是"**数个月**"；2026-07 部分评估称已逼近"**数周**"。**MCNAIR**：3–9 个月。来源：[VERTU 复述 Hassabis](https://vertu.com/lifestyle/the-global-ai-race-why-china-is-just-months-behind-the-us-according-to-deepminds-ceo/)、[MCNAIR](https://mcnair.center/china/)、[AEI《China Has Caught Up》](https://www.aei.org/foreign-and-defense-policy/china-has-caught-up-in-frontier-ai/)。
- 维度小结：**性能与资本**美国仍领先；**成本效率、开源采用、部署规模、工程人才**中国领先。

### 6.2 开源 vs 闭源的全球采用趋势

- 企业选择开源的主因是**成本（便宜 60–90%）+ 可自托管/合规可控**；到 2026-05 中国开源模型占 OpenRouter token 约 **61%**，美国公司自身把最多 **46%** 的 token 路由给中国开源模型。来源：datagravity、BCG。
- **"中国用开源打全球市场"是否奏效——正面证据**：Qwen 下载超 10 亿（是其后 8 家之和的 2 倍+）；ByteDance、腾讯把开源发布量提高 **8–9 倍**；百度一年内从 0 到 **100+ 个 Hugging Face 发布**；2026-06 Hugging Face 趋势榜前十有五个是中国模型。来源：[Stanford AI Index 报道](https://thenextweb.com/news/stanford-ai-index-2026-china-us-performance-gap)、datagravity。
- 反向风险：美国监管试图"把中国 AI 赶出美国企业"，但**开放权重使封禁难以执行**（可自托管、无需中国 API）。来源：[TechTimes 2026-07-11](https://www.techtimes.com/articles/320171/20260711/washington-wants-chinese-ai-out-corporate-america-open-weights-block-ban.htm)。

### 6.3 出口管制对中国路线的实际影响

- **芯片仍是硬约束**：R2 延期的芯片罗生门（昇腾↔英伟达反复）即是缩影；HBM 是 2026 年的瓶颈——国产 CXMT 约 2.0M 堆栈/年，仅够约 25 万–30 万颗昇腾 910C 封装，逻辑产能（中芯）够、内存不够。来源：datagravity。
- **管制升级**：**BIS 于 2026-05-31 把许可要求扩展到"中国母公司在海外的实体"**（针对 DeepSeek V4-Pro、Kimi K2.6、Qwen 3.5、GLM-5.2 等的部署/接入场景）。来源：datagravity。
- **战略含义**：管制反而强化了"用开源绕过管辖"的中国路线——开放权重无需出口许可、无法被下线，等于把美国的"关闸能力"部分抵消；有分析直言"美国的 AI 守门把开源优势拱手让给中国"。来源：[digitalapplied《Does US AI Gatekeeping Hand China the Open-Source Edge?》](https://www.digitalapplied.com/blog/us-ai-gatekeeping-china-open-source-advantage-2026)。

---

## 附：关键数字速查（均注日期，引用前建议回溯一手）

| 项目 | 数字 | 日期 | 来源 |
|---|---|---|---|
| 中国开源模型占 OpenRouter token | ~61% | 2026-05/06 | datagravity |
| DeepSeek 首轮外部融资 | ~¥510亿 / $7.4B，投后 ~$50B | 2026-06 | Forbes |
| 梁文锋本轮出资 / 持股 | ~¥200亿 / ~78%（一说 84.29%） | 2026-06 | Forbes/BigGo |
| DeepSeek 新一轮投前估值 | ~$71B（¥4800亿） | 2026-07 | 新浪/Memeburn |
| Qwen 累计下载 | 10 亿+（占全球开源 50%+） | 2026-03/04 | SCMP |
| Qwen 衍生模型 | 18 万+（谱系近 400 款） | 2026 | SCMP |
| 智谱上市 | 港交所，HK$116.20，市值~HK$555亿 | 2026-01-08 | 财新 |
| MiniMax 上市 | 港交所，HK$165，首日+~109% | 2026-01-09 | 新浪 |
| MiniMax 市值（涨后） | HK$2635亿（+409%） | 2026-05-29 | 新浪 |
| Kimi 新一轮 | 募 $2B @ 投前 ~$30B（较去年 7×） | 2026-06 | 新浪 |
| 阶跃 B+ 轮 | ¥50亿 | 2026-01 | 知乎 |
| 豆包 DAU / MAU | 2亿 / 3.45亿 | 2026 H1 | Soft6 |
| 豆包单日收入 | <¥100万（成本日耗数千万） | 2026 | 新浪 |
| 中美前沿差距（Epoch） | 平均 7 个月（4–14） | 2026 | Epoch AI |
| 中美最强模型性能差（Stanford） | 2.7%（美投资为中 23×） | 2026 | AI Index 2026 |
| 文心 4.5 开源 | 10 款，Apache | 2025-06-30 | stcn |
| BIS 扩展许可到中企海外实体 | — | 2026-05-31 | datagravity |

---

*调研到此。凡标〔待核〕者写入正文前需二次核实；港股市值与估值口径随行情/日期变动大，务必带日期引用。*

# RL 入门卷调研：经典事实清单

> 调研日期：2026-07-19。用途：强化学习入门卷（零基础大二 → 读懂 RLHF/PPO/GRPO）。
> 主线：MDP → 价值函数 → 策略梯度 → Actor-Critic → PPO。Q-learning/DQN/model-based 仅一笔带过。
> 标注约定：确信事实直接给出处；不确定处标〔待核〕。

---

## 1. 历史脉络与里程碑

### 思想源头（三条河流汇成 RL）

- **试错学习（心理学）**：Edward Thorndike 1898 年博士论文用"迷箱"（puzzle box）实验研究猫的逃脱行为，1911 年在《Animal Intelligence》中正式提出**效果律（Law of Effect）**——带来满意结果的行为会被加强，带来不适的行为会被削弱。这是"奖励塑造行为"的最早科学表述。
- **操作性条件反射**：B.F. Skinner，《The Behavior of Organisms》（1938），"斯金纳箱"实验（按压杠杆得食物），提出 operant conditioning 与 reward shaping（塑造）的概念。
- **动态规划与最优控制（数学）**：Richard Bellman 1950 年代在 RAND 公司发展动态规划；1957 年出版《Dynamic Programming》一书，同年发表论文 "A Markovian Decision Process"（MDP 一词的源头之一）。Bellman 方程与"维度灾难"（curse of dimensionality）一词均出自他。Ronald Howard 1960 年《Dynamic Programming and Markov Processes》给出策略迭代（policy iteration）。
- **时序差分与现代 RL 的成型**：Richard Sutton 与 Andrew Barto 1970 年代末起在 UMass Amherst 合作。里程碑论文：Barto, Sutton & Anderson (1983) "Neuronlike adaptive elements that can solve difficult learning control problems"（IEEE SMC）——**这篇就是 Actor-Critic 架构的起点**（ASE/ACE 两个单元，在倒立摆 cart-pole 上验证）；Sutton (1988) "Learning to Predict by the Methods of Temporal Differences"（Machine Learning 期刊）正式提出 TD 学习。教科书《Reinforcement Learning: An Introduction》第一版 1998、第二版 2018。**Sutton 与 Barto 因奠定 RL 基础获 2024 年度 ACM 图灵奖（2025 年 3 月公布）**——叙事上很好用的收束点。
- 支线定位（一句话即可）：Q-learning 由 Watkins 1989 年博士论文提出（Watkins & Dayan 1992 给出收敛证明），属于价值方法支线，本卷不展开。

### 里程碑年表（年份数字核实）

| 年份 | 事件 | 关键数字 |
|---|---|---|
| 1992 | **TD-Gammon**（Gerald Tesauro, IBM）：TD(λ) + 神经网络 + 自我对弈玩西洋双陆棋 | 1992 年首个版本；到 1995 年（CACM 文章 "Temporal Difference Learning and TD-Gammon"）已接近人类世界顶尖水平，并改变了人类对某些开局的下法 |
| 2013 | **DQN**（Mnih et al., DeepMind）arXiv:1312.5602，NIPS 2013 深度学习 workshop | 7 款 Atari 游戏，其中 3 款超过人类专家 |
| 2015 | **DQN Nature 版**（Mnih et al., Nature 518, 529–533，2015 年 2 月）"Human-level control through deep reinforcement learning" | 49 款 Atari 游戏、同一套网络与超参数；43 款超过此前所有算法；29 款达到论文定义的"人类水平"线（≥职业人类测试员得分的 75%）〔待核：29 这个数字建议引用原文再确认一次〕 |
| 2016 | **AlphaGo**（Silver et al., Nature 2016 年 1 月）；2016 年 3 月**以 4:1 击败李世石** | Nature 论文报告 2015 年 10 月 5:0 击败欧洲冠军樊麾；2017 年 5 月 3:0 击败柯洁 |
| 2017 | **AlphaGo Zero**（Nature 2017 年 10 月）：完全自我对弈从零学起，100:0 击败击败李世石的版本 | — |
| 2017–2018 | **AlphaZero**：arXiv 2017 年 12 月，Science 正式发表于 2018 年 12 月；同一算法通吃围棋、国际象棋、将棋 | — |
| 2019 | **OpenAI Five**（Dota 2）：2019 年 4 月 2:0 击败 TI8 世界冠军 OG 战队 | **训练算法正是大规模 PPO**——本卷最好的叙事钩子之一（2018 年 8 月 TI8 上还曾输给职业队） |
| 2019 | **AlphaStar**（星际争霸 II，DeepMind）：2019 年 1 月表演赛击败职业选手 MaNa（5:0）；2019 年 10 月 Nature 论文达到 Grandmaster 段位 | 天梯排名超过 99.8% 的活跃玩家 |
| 2022 | **InstructGPT / ChatGPT**：RLHF + PPO 进入语言模型——本卷的终点站 | 见第 7 节 |

---

## 2. MDP 形式化

### 五元组与记号

标准定义：MDP 是五元组 $(\mathcal{S}, \mathcal{A}, P, R, \gamma)$：

- $\mathcal{S}$：状态集合；$\mathcal{A}$：动作集合
- $P(s'|s,a)$：转移概率（Sutton & Barto 记号为 $p(s',r|s,a)$，把奖励也并入动力学，四参数函数）
- $R$：奖励函数，常见写法 $r(s,a)$、$r(s,a,s')$ 或随机变量 $R_{t+1}$（S&B 约定：在 $S_t$ 执行 $A_t$ 后收到的奖励下标是 $t+1$，即 $R_{t+1}$——这个下标约定各书不一，写作时须先声明）
- $\gamma \in [0,1]$：折扣因子

**马尔可夫性**：$P(S_{t+1}|S_t, A_t) = P(S_{t+1}|S_1, A_1, \dots, S_t, A_t)$——"未来只依赖当下，不依赖来路"。

回报（return）：$G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}$。

### 奖励假设（reward hypothesis）

Sutton & Barto 第二版 §3.2 的标准表述（英文原文，翻译时建议附原文）：

> "That all of what we mean by goals and purposes can be well thought of as the maximization of the expected value of the cumulative sum of a received scalar signal (called reward)."

即：**我们所说的一切目标与意图，都可以表述为"最大化所收到的标量信号（奖励）累积和的期望值"。** Sutton 在其主页文章中也称之为 reward hypothesis；Michael Littman 亦常被联系到该假设的讨论。出处：Sutton & Barto (2018), §3.2。

### 任务类型与策略类型

- **Episodic**（分幕式）：有终止状态，轨迹有限（棋局、一次对话生成）；**continuing**（持续式）：无终止（服务器调度），此时 $\gamma < 1$ 才能保证回报有限。
- **确定性策略** $a = \mu(s)$ vs **随机策略** $\pi(a|s)$（动作上的概率分布）。策略梯度方法天然使用随机策略——它保证了探索且使目标函数对参数可微。语言模型的采样解码就是随机策略。

### 经典教学例子

- **Gridworld**：S&B 第 3、4 章的标准例子，用于演示 MDP、价值函数、策略迭代；直观可手算。
- **悬崖行走（Cliff Walking）**：S&B Example 6.6。经典用途是对比 Q-learning（学到贴崖最优路径）与 SARSA（学到远崖安全路径），即 on-policy vs off-policy 的行为差异。本卷可只用其地图做"奖励设计影响行为"的直觉。
- **多臂老虎机（multi-armed bandit）**：S&B 第 2 章。定位：**只有一个状态、动作不改变状态的退化 MDP**，用于隔离"探索—利用"问题。与 LLM 的接口有呼应：整条回复只在末尾拿一个奖励时,可以把回复级 RLHF 看成上下文老虎机（contextual bandit）视角。
- **FrozenLake / CartPole**（Gym/Gymnasium 环境）：动手实验的社区标准入门环境；CartPole 恰好就是 1983 年 Actor-Critic 原始论文的任务——历史呼应可用。

---

## 3. 价值函数与 Bellman 方程

### 定义式

$$V^\pi(s) = \mathbb{E}_\pi\!\left[\sum_{k=0}^{\infty} \gamma^k R_{t+k+1} \,\Big|\, S_t = s\right] = \mathbb{E}_\pi[G_t \mid S_t = s]$$

$$Q^\pi(s,a) = \mathbb{E}_\pi[G_t \mid S_t = s, A_t = a]$$

两者关系：$V^\pi(s) = \mathbb{E}_{a \sim \pi(\cdot|s)}[Q^\pi(s,a)]$。

### Bellman 期望方程（S&B 记号）

$$V^\pi(s) = \sum_a \pi(a|s) \sum_{s',r} p(s',r|s,a)\big[r + \gamma V^\pi(s')\big]$$

$$Q^\pi(s,a) = \sum_{s',r} p(s',r|s,a)\Big[r + \gamma \sum_{a'} \pi(a'|s')\, Q^\pi(s',a')\Big]$$

### Bellman 最优方程

$$V^*(s) = \max_a \sum_{s',r} p(s',r|s,a)\big[r + \gamma V^*(s')\big]$$

$$Q^*(s,a) = \sum_{s',r} p(s',r|s,a)\big[r + \gamma \max_{a'} Q^*(s',a')\big]$$

期望方程是线性方程组（给定 π 可解）；最优方程含 max、非线性，需迭代求解——这是"评估"与"优化"两类问题的分界，也是本卷叙事上"价值函数一章"与"策略改进"的接缝。

### 折扣因子 γ 的多重解释（三种都标准）

1. **数学收敛**：$\gamma<1$ 使无穷级数有界，$|G_t| \le r_{\max}/(1-\gamma)$；且 $1/(1-\gamma)$ 可解释为"有效视野"（effective horizon）——$\gamma=0.99$ 约看 100 步。
2. **不确定的未来**：可解释为每步有 $1-\gamma$ 的概率"世界终止"，未来奖励因此打折。
3. **金融利率类比**：今天的 1 元 > 明天的 1 元；γ 即贴现率（S&B 亦用利息类比）。经济学的 discounting 与此同源。

### Monte Carlo vs TD（偏差—方差视角）

| | Monte Carlo | TD(0) |
|---|---|---|
| 更新目标 | 真实回报 $G_t$ | $R_{t+1} + \gamma V(S_{t+1})$（自举 bootstrapping） |
| 偏差 | 无偏 | 有偏（目标依赖当前的不完美估计 $V$） |
| 方差 | 高（整条轨迹的随机性都累积进来） | 低（只含一步随机性） |
| 何时能更新 | 必须等 episode 结束 | 每步在线更新 |

经典教学例子：S&B Example 6.1 "Driving Home"（开车回家沿途不断修正到达时间估计）——TD 是"用预测更新预测"，不必等最终结果。

### TD error 与 advantage 的关系（核实结论：表述准确，需加一个限定词）

TD error 定义：

$$\delta_t = R_{t+1} + \gamma V(S_{t+1}) - V(S_t)$$

核实结论：**当 $V = V^\pi$（真实价值函数）时，TD error 是 advantage 的无偏估计**：

$$\mathbb{E}\big[\delta_t^{V^\pi} \,\big|\, S_t = s, A_t = a\big] = Q^\pi(s,a) - V^\pi(s) = A^\pi(s,a)$$

这是 GAE 论文（Schulman et al. 2015b, arXiv:1506.02438）中的明确表述。所以书里说"TD error 在 Actor-Critic 里就是 advantage 的（单样本、近似）估计"是准确的，但要加限定：实际训练中 $V$ 是学出来的近似值，故 $\delta_t$ 是**有偏**的 advantage 估计；GAE 正是用 λ 在这个偏差与 MC 的方差之间做权衡（见第 5 节）。

---

## 4. 策略梯度

### 目标与策略梯度定理

目标：$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[G(\tau)]$。策略梯度定理（Sutton, McAllester, Singh & Mansour, "Policy Gradient Methods for Reinforcement Learning with Function Approximation", NeurIPS 1999）：

$$\nabla_\theta J(\theta) = \mathbb{E}_{s \sim d^\pi,\, a \sim \pi_\theta}\big[\, Q^\pi(s,a)\, \nabla_\theta \log \pi_\theta(a|s) \,\big]$$

定理的价值：梯度不需要对环境动力学 $P$ 求导——环境可以是黑盒（对 LLM：不需要对奖励模型/世界求导）。

### REINFORCE（Williams 1992，年份已核实）

出处：Ronald J. Williams, "Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning", **Machine Learning, 8, 229–256 (1992)**。（注意与 TD-Gammon 同年，1992 是个好记的年份。）

推导关键步骤——**log-derivative trick（score function）**：

$$\nabla_\theta p_\theta(\tau) = p_\theta(\tau)\, \nabla_\theta \log p_\theta(\tau)$$

代入 $J(\theta) = \int p_\theta(\tau) G(\tau)\, d\tau$，且 $\log p_\theta(\tau) = \sum_t \log \pi_\theta(a_t|s_t) + \text{（与 θ 无关的环境项）}$，得：

$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau}\Big[\sum_t \nabla_\theta \log \pi_\theta(a_t|s_t)\, G_t\Big]$$

（用 $G_t$ 而非全轨迹 $G(\tau)$ 依赖"奖励因果性/reward-to-go"：$t$ 时刻的动作不影响 $t$ 之前的奖励。）

### 为什么高方差

- $G_t$ 是整条轨迹随机性的累积（策略随机 + 环境随机），单样本波动巨大；
- 奖励的绝对量纲直接进梯度：如果所有回报都是正数（比如都在 80~100 之间），每个采到的动作都被"加强"，只是幅度不同——学习信号主要来自幅度差，信噪比低；
- 蒙特卡洛估计不复用中间结构，样本效率低。

### baseline 不改变期望（证明思路）

对任意只依赖状态的 $b(s)$：

$$\mathbb{E}_{a \sim \pi_\theta}\big[b(s)\, \nabla_\theta \log \pi_\theta(a|s)\big] = b(s) \sum_a \nabla_\theta \pi_\theta(a|s) = b(s)\, \nabla_\theta \underbrace{\sum_a \pi_\theta(a|s)}_{=1} = 0$$

即"概率归一化的梯度是零"。所以减去 baseline 无偏、却能显著降方差；最常用的 baseline 是 $V^\pi(s)$。

### Advantage 的引入逻辑

$$A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)$$

直觉：**这个动作比"在此状态下的平均水平"好多少**。它把绝对回报变成相对分数（zero-centered），回答的是"该加强还是削弱"而非"回报是多少"。用 $A$ 替换 $Q$ 后的策略梯度形式不变（因为差的是一个合法 baseline）。GRPO 的"组内相对优势"正是这条逻辑在无 critic 情形下的延续——可作为伏笔。

---

## 5. Actor-Critic 到 PPO 的谱系

### Actor-Critic 与 A3C/A2C

- Actor-Critic 思想源头：Barto, Sutton & Anderson 1983（见第 1 节）。现代形式：actor（策略网络）用 critic（价值网络）提供的 $\delta_t$ 或 $\hat A_t$ 更新，critic 用 TD 学习更新。
- **A3C**：Mnih et al., "Asynchronous Methods for Deep Reinforcement Learning", **arXiv:1602.01783，ICML 2016**。多个并行 worker 异步更新共享参数，去掉了 DQN 的 replay buffer。
- **A2C**：A3C 的同步批量版本，由 OpenAI Baselines（2017）推广；实践中效果相当且更适合 GPU。〔待核：A2C 无独立论文，出处即 OpenAI Baselines 博客/代码库，写作时如此标注即可〕

### 为什么需要信任域：策略崩塌问题

标准动机（TRPO/Spinning Up 的讲法）：策略梯度是**on-policy** 的——数据由当前策略采集。一次过大的参数更新可能让策略跌进坏区域，此后采到的数据全部来自坏策略，可能**无法自我恢复**（performance collapse）。这与监督学习不同：监督学习步子大了下一步还能拉回来（数据分布不变），RL 里"步子决定你之后看到什么数据"。社区常用比喻：**在浓雾中沿悬崖边的山脊登山，步子必须小**（Spinning Up 及多篇博客使用类似说法，标注为社区常用即可，无单一权威出处）。

### 自然梯度与 TRPO

- 自然梯度：Amari 1998（信息几何）；引入 RL：Kakade, "A Natural Policy Gradient", NeurIPS 2001。核心思想：在**策略分布空间**（KL 度量）而非参数空间度量步长。
- **TRPO**：Schulman et al., "Trust Region Policy Optimization", **arXiv:1502.05477，ICML 2015**。优化问题：

$$\max_\theta\ \mathbb{E}_t\!\left[\frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}\, \hat A_t\right] \quad \text{s.t.}\quad \mathbb{E}_t\big[D_{\mathrm{KL}}\big(\pi_{\theta_{\text{old}}}(\cdot|s_t)\,\|\,\pi_\theta(\cdot|s_t)\big)\big] \le \delta$$

需要二阶信息（Fisher 矩阵、共轭梯度），实现复杂、与含 dropout/参数共享的架构不兼容——这是 PPO 论文明说的动机。

### 重要性采样比率的作用

$$r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}$$

作用：数据由 $\pi_{\theta_{\text{old}}}$ 采集，但要评估/优化的是 $\pi_\theta$——比率完成分布校正，使得**同一批数据可以做多个 epoch 的梯度更新**（PPO 的样本效率来源）。$r_t$ 偏离 1 越远，校正越不可靠——这正是 clip 的对象。

### PPO（已核实：Schulman, Wolski, Dhariwal, Radford, Klimov, arXiv:1707.06347，2017 年 7 月提交）

clipped surrogate objective 的精确公式（论文式 (7)）：

$$L^{\mathrm{CLIP}}(\theta) = \hat{\mathbb{E}}_t\Big[\min\big(r_t(\theta)\,\hat A_t,\ \operatorname{clip}(r_t(\theta),\ 1-\epsilon,\ 1+\epsilon)\,\hat A_t\big)\Big]$$

- **ε 典型值 0.2**（论文实验中在 {0.1, 0.2, 0.3} 里 0.2 最佳；RLHF 实现也普遍用 0.1–0.2）。
- 外层 **min 使目标成为悲观下界**（pessimistic bound）：clip 只在"更新方向对自己有利"时生效——$\hat A>0$ 时封顶收益、$\hat A<0$ 时不封顶惩罚。这一点是教学重点，容易被讲错。
- 完整训练目标还含 value loss 与 entropy bonus：$L = L^{\mathrm{CLIP}} - c_1 L^{VF} + c_2 S[\pi_\theta]$。
- 与 TRPO 的关系：**用一阶方法（clip 掉过大的比率）近似实现二阶约束（KL 信任域）的效果**，实现只需改几行代码。论文还给出 KL 惩罚版（adaptive KL），但 clip 版效果更好、成为默认。
- 地位：引用量数万次（Google Scholar 已超两万〔待核：写作时查当日数字〕），是深度 RL 中被引最多的算法论文之一；是 OpenAI Five 与 InstructGPT/ChatGPT RLHF 的训练算法——"从 Dota 到 ChatGPT 用的是同一个算法"是本卷的叙事主钩。

### GAE（Schulman et al. 2015b，arXiv:1506.02438，ICLR 2016）

$$\hat A_t^{\mathrm{GAE}(\gamma,\lambda)} = \sum_{l=0}^{\infty} (\gamma\lambda)^l\, \delta_{t+l}$$

λ 的作用一句话：**在"单步 TD error（λ=0，低方差高偏差）"与"蒙特卡洛回报（λ=1，高方差无偏）"之间连续调节偏差—方差权衡**。典型值 λ=0.95。

---

## 6. 教学素材

### 延伸阅读（公认最好的公开资源）

1. **Sutton & Barto,《Reinforcement Learning: An Introduction》第二版（2018）**——官方免费 PDF：incompleteideas.net/book/the-book-2nd.html。领域圣经，本卷第 1–3 章素材主要来源。
2. **OpenAI Spinning Up in Deep RL**（2018，Josh Achiam）——spinningup.openai.com。"Intro to Policy Optimization" 三部曲是策略梯度→PPO 公认最清晰的推导路径（baseline 无偏证明、reward-to-go、PPO clip 的讲解都可直接对照）。
3. **Lilian Weng, "Policy Gradient Algorithms"**（2018，lilianweng.github.io）——一页纸串起 REINFORCE→AC→TRPO→PPO 全谱系的最佳综述式博客。
4. **Hugging Face Deep RL Course**——免费、动手向、有 Unit 8 专讲 PPO from scratch；适合推荐给想跑代码的读者。
5. **David Silver 的 UCL/DeepMind RL 课程**（2015，YouTube）——MDP/价值函数/策略梯度的讲授经典。
6. **Andrej Karpathy, "Deep Reinforcement Learning: Pong from Pixels"**（2016）——用 130 行代码讲透 policy gradient 的经典博文。
7. **"The 37 Implementation Details of Proximal Policy Optimization"**（Huang et al., ICLR Blog Track 2022）——PPO 论文没写、但复现必需的全部细节；给进阶读者。
8. **Berkeley CS285（Sergey Levine）**——深度 RL 研究生课，策略梯度讲义严谨。
9. 中文资源：**赵世钰《强化学习的数学原理》**（西湖大学，B 站公开课+开源书，数学脉络清晰）；**《动手学强化学习》**（上海交大，hrl.boyuai.com，代码向）。〔两者均为中文社区公认，可放心推荐〕
10. 接口向：**Nathan Lambert,《RLHF Book》**（rlhfbook.com，持续更新的开源书）——通往下一卷 RLHF 的桥梁读物。

### 公认好用的直觉类比（出处标注）

- **浓雾中沿山脊行走，步子必须小**（信任域/PPO clip）：Spinning Up 与多篇教程使用类似表述——社区常用，无单一原始出处。
- **Actor = 学员开车，Critic = 教练打分**（或"演员—评委"）：社区常用；历史依据是 1983 年论文里 critic 部件本就叫 "adaptive critic element"。
- **Baseline / advantage = 按班级平均分算相对成绩**（grading on a curve）："比平均好多少才值得加强"——社区常用。
- **γ = 利率/贴现**：S&B 书中即用利息类比，出处可靠。
- **TD 学习 = 开车回家途中不断修正预计到达时间**：S&B Example 6.1，正式出处。
- **训狗给零食**（奖励假设/reward shaping）：源自 Skinner 操作性条件反射，社区常用。
- **多臂老虎机 = 赌场选机器**（探索—利用）：S&B 第 2 章标准例子。
- **重要性采样 = 用旧考卷估新学生水平，要按难度加权**：社区偶见〔标注为"本书自拟"更稳妥，或直接用"分布校正"讲清〕。

---

## 7. 与 LLM 的接口预览（简要）

### 标准映射（LM-as-policy）

把语言模型看作策略 $\pi_\theta$ 时的标准对应（InstructGPT/Stiennon 论文与各综述的通行表述）：

| RL 概念 | LLM 对应 |
|---|---|
| 状态 $s_t$ | prompt + 已生成的前缀 token $y_{<t}$ |
| 动作 $a_t$ | 词表中的下一个 token（动作空间 = 词表大小，约 3 万–15 万） |
| 策略 $\pi_\theta(a_t\|s_t)$ | LM 的下一 token 条件分布（softmax 输出） |
| 轨迹 $\tau$ | 一条完整回复（episode = 一次生成，长度 = 生成 token 数） |
| 奖励 | 奖励模型对**完整回复**打的标量分（稀疏、终端奖励）；实践中每 token 另加 $-\beta\, \mathrm{KL}(\pi_\theta \| \pi_{\text{ref}})$ 惩罚项 |
| 环境转移 | 确定性：新状态 = 旧状态拼接新 token（无环境随机性——LLM-RL 的特殊之处） |

注：由于奖励只在末尾、转移确定，回复级视角下也可看作**上下文老虎机**——这是文献中出现过的观点，教学上可用来解释为什么 GRPO 能丢掉逐步 critic。

### RLHF 论文谱系（年份与 arXiv 号已核实）

1. **Christiano et al. 2017**, "Deep Reinforcement Learning from Human Preferences", **arXiv:1706.03741**（NeurIPS 2017）——从成对偏好比较中学奖励函数（Bradley-Terry），再跑 RL；奠定"偏好→奖励模型"范式（实验是 Atari/MuJoCo，尚无语言模型）。
2. **Ziegler et al. 2019**, "Fine-Tuning Language Models from Human Preferences", **arXiv:1909.08593**（OpenAI）——**最早把 PPO + 人类偏好用于语言模型**的论文，KL 惩罚设计出自这里；谱系里常被略过但接口映射的最早标准出处应是它。
3. **Stiennon et al. 2020**, "Learning to summarize from human feedback", **arXiv:2009.01325**（NeurIPS 2020）——摘要任务上验证 RLHF 显著超过监督微调，确立三阶段流程（SFT→RM→PPO）。
4. **Ouyang et al. 2022（InstructGPT）**, "Training language models to follow instructions with human feedback", **arXiv:2203.02155**（2022 年 3 月，NeurIPS 2022）——1.3B 的 InstructGPT 输出被人类偏好于 175B GPT-3；ChatGPT（2022 年 11 月）的直接技术前身。
5. 终点伏笔：**GRPO** 出自 **DeepSeekMath（Shao et al. 2024, arXiv:2402.03300）**——去掉 critic，用同一 prompt 的一组采样回复的组内标准化得分作 advantage（即第 4 节 baseline 逻辑的无 critic 版本）；后由 DeepSeek-R1（2025 年 1 月）推广。详细内容另有专门调研。

---

## 附：本卷可用的量级速记

- 有效视野 $\approx 1/(1-\gamma)$：γ=0.99 → ~100 步；RLHF 中常直接取 γ=1（episode 短且有界）。
- PPO 默认超参（原论文 + 通行实现）：ε=0.2，GAE λ=0.95，γ=0.99，每批数据 3–10 个 epoch。
- RLHF 中 PPO 常用 ε=0.1–0.2，KL 系数 β 需调（InstructGPT 用 0.02 量级〔待核〕）。

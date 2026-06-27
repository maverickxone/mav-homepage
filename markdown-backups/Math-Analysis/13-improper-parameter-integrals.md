---
title: "第 13 章 反常积分和含参变量的积分"
chapter: 6
readTime: 85
description: "反常积分敛散、含参积分、一致收敛与 Euler 积分（Γ、B 函数）。"
---

前面各章的定积分、重积分都建立在**有限区间**与**有界被积函数**上。当积分区间无界，或被积函数在区间内无界时，Riemann 和不再直接适用，需要引入**反常积分**（广义积分）并重新讨论敛散性。进一步，若被积函数还依赖参数 $t$，则积分值本身成为 $t$ 的函数——**含参变量的积分**——其连续性、可微性、可积性不能简单「在积分号下求导/换序」，而需**一致收敛**等条件保证。本章末引入 Euler 的 $\Gamma$ 函数与 $B$ 函数，它们是连接分析、概率与特殊函数的经典桥梁。

**学习路线建议**：
1. 先掌握 §13.1 的判敛法（比较法 + $p$-积分），这是后面一切含参反常积分的基础；
2. §13.3 的 Leibniz 法则在有限区间上可直接用，与一元微积分一致；
3. §13.4 的一致收敛是本章难点，务必区分「逐点收敛」与「一致收敛」；
4. §13.5 的 $\Gamma$、$B$ 函数作为计算工具熟记，余元公式 $\Gamma(s)\Gamma(1-s)=\pi/\sin(\pi s)$ 可暂不证。

---

## 13.1 反常积分

### 13.1.1 无穷区间上的反常积分

设 $f$ 在 $[a,+\infty)$ 上定义，且对任意 $A>a$，$\displaystyle\int_a^A f(x)\,dx$ 存在（常义 Riemann 积分）。定义
$$F(A)=\int_a^A f(x)\,dx.$$
若极限 $\displaystyle\lim_{A\to+\infty} F(A)=I$ 存在且有限，则称反常积分 $\displaystyle\int_a^{+\infty} f(x)\,dx$ **收敛**，其值为 $I$；否则称**发散**。类似定义 $\displaystyle\int_{-\infty}^b f(x)\,dx$ 与 $\displaystyle\int_{-\infty}^{+\infty} f(x)\,dx$（后者拆成两段，**两段都收敛**才收敛）。

**例 13.1** $\displaystyle\int_1^{+\infty} \frac{1}{x^2}\,dx=\lim_{A\to+\infty}\int_1^A x^{-2}\,dx=\lim_{A\to+\infty}\Big(1-\frac{1}{A}\Big)=1$，收敛。

**例 13.2** $\displaystyle\int_1^{+\infty} \frac{1}{x}\,dx=\lim_{A\to+\infty}\ln A=+\infty$，发散。

**Cauchy 收敛准则**：$\displaystyle\int_a^{+\infty} f(x)\,dx$ 收敛 ⇔ 对任意 $\varepsilon>0$，存在 $A_0$，当 $A',A''>A_0$ 时有 $\big|\int_{A'}^{A''} f(x)\,dx\big|<\varepsilon$。证明与数列 Cauchy 准则相同：令 $F(A)=\int_a^A f$，则反常积分收敛 ⇔ $\{F(A)\}$ 收敛 ⇔ $\{F(A)\}$ 为 Cauchy 列。

**绝对收敛**：若 $\displaystyle\int_a^{+\infty} |f(x)|\,dx$ 收敛，则称 $\displaystyle\int_a^{+\infty} f(x)\,dx$ **绝对收敛**。绝对收敛 ⇒ 收敛（用 Cauchy 准则与三角不等式）。反之不成立：$\displaystyle\int_1^{+\infty}\frac{\sin x}{x}\,dx$ 收敛但 $\int_1^{+\infty}|\sin x|/x\,dx$ 发散（条件收敛）。

### 13.1.2 无界函数的反常积分

设 $f$ 在 $(a,b]$ 上定义，在 $x=a$ 附近无界（**瑕点**在左端）。若对 $\varepsilon\in(0,b-a)$，$\displaystyle\int_{a+\varepsilon}^b f(x)\,dx$ 存在，且
$$\lim_{\varepsilon\to 0^+}\int_{a+\varepsilon}^b f(x)\,dx=I$$
存在有限，则称 $\displaystyle\int_a^b f(x)\,dx$ 收敛，值为 $I$。瑕点在内部或右端时定义类似；多个瑕点需分段讨论。

**例 13.3** $\displaystyle\int_0^1 \frac{1}{\sqrt{x}}\,dx=\lim_{\varepsilon\to 0^+}\int_\varepsilon^1 x^{-1/2}\,dx=\lim_{\varepsilon\to 0^+}2(1-\sqrt\varepsilon)=2$，收敛。

**例 13.4** $\displaystyle\int_0^1 \frac{1}{x}\,dx=\lim_{\varepsilon\to 0^+}\ln\frac{1}{\varepsilon}=+\infty$，发散。

**混合型反常积分**：区间无穷且被积函数含瑕点（如 $\displaystyle\int_0^{+\infty}\frac{1}{x^p}\,dx$ 在 $p>1$ 时，$0$ 与 $+\infty$ 两端都需单独检验）。**收敛**当且仅当**每一端**（或每一个瑕点）对应的极限都存在有限。

**例 13.4'** $\displaystyle\int_0^{+\infty}\frac{1}{x^2+1}\,dx$。在 $0$ 附近 $\frac{1}{x^2+1}\sim 1$ 常义可积；在 $\infty$ 处 $\frac{1}{x^2+1}\le\frac{1}{x^2}$，由 $p=2>1$ 知收敛。值 $=\big[\arctan x\big]_0^{+\infty}=\pi/2$。

### 13.1.3 比较判别法与 $p$-积分

**定理 13.1（比较判别法）** 设 $f,g\ge 0$，$f(x)\le g(x)$ 在 $[a,+\infty)$ 上成立。
1. 若 $\displaystyle\int_a^{+\infty} g(x)\,dx$ 收敛，则 $\displaystyle\int_a^{+\infty} f(x)\,dx$ 收敛；
2. 若 $\displaystyle\int_a^{+\infty} f(x)\,dx$ 发散，则 $\displaystyle\int_a^{+\infty} g(x)\,dx$ 发散。

**证明思路**：部分积分 $F(A)=\int_a^A f,\ G(A)=\int_a^A g$ 单调增。情形 1：$F(A)\le G(A)\le\int_a^{+\infty}g=I<\infty$，故 $\{F(A)\}$ 有上界且单调增 ⇒ $\lim F(A)$ 存在。情形 2：若 $\int g$ 收敛则 $\int f$ 收敛，与 $\int f$ 发散矛盾。

**极限形式**：若 $f,g\ge 0$ 且 $\displaystyle\lim_{x\to+\infty}\frac{f(x)}{g(x)}=c$（$0<c<+\infty$），则 $\displaystyle\int_a^{+\infty} f$ 与 $\displaystyle\int_a^{+\infty} g$ **同敛散**。

**瑕点处的比较法**：设 $f,g\ge 0$，$f(x)\le g(x)$ 在 $(a,b]$ 上成立，$x=a$ 为瑕点。若 $\displaystyle\int_a^b g(x)\,dx$ 收敛，则 $\displaystyle\int_a^b f(x)\,dx$ 收敛；发散情形类似。极限形式 $\displaystyle\lim_{x\to a^+}\frac{f(x)}{g(x)}=c\in(0,\infty)$ 时同敛散。

**$p$-积分（无穷区间）**：对 $a>0$，
$$\int_a^{+\infty} \frac{1}{x^p}\,dx\begin{cases}
\text{收敛}, & p>1,\\[4pt]
\text{发散}, & p\le 1.
\end{cases}$$
证：$p\neq 1$ 时，
$$\int_a^A x^{-p}\,dx=\frac{x^{1-p}}{1-p}\Big|_a^A=\frac{A^{1-p}-a^{1-p}}{1-p}.$$
当 $p>1$ 时 $1-p<0$，$A^{1-p}\to 0$，极限 $=\dfrac{a^{1-p}}{p-1}$ 有限；当 $p<1$ 时 $A^{1-p}\to+\infty$，发散；$p=1$ 时为 $\ln A|_a^A\to+\infty$。

**$p$-积分（瑕点）**：对 $b>0$，
$$\int_0^b \frac{1}{x^p}\,dx\begin{cases}
\text{收敛}, & p<1,\\[4pt]
\text{发散}, & p\ge 1.
\end{cases}$$
证：$\int_\varepsilon^b x^{-p}\,dx=\dfrac{b^{1-p}-\varepsilon^{1-p}}{1-p}$（$p\neq 1$）；$p<1$ 时 $\varepsilon^{1-p}\to 0$ 收敛；$p\ge 1$ 发散。

**记忆口诀**：无穷区间——**$p$ 越大越易收敛**（$p>1$）；瑕点——**$p$ 越小越易收敛**（$p<1$）。二者对偶：$\int_0^1 x^{-p}\,dx$ 与 $\int_1^{+\infty}x^{-p}\,dx$ 敛散性互补。

**例 13.5** 讨论 $\displaystyle\int_1^{+\infty} \frac{\sin^2 x}{x^2}\,dx$。因 $0\le \sin^2 x\le 1$，有 $\dfrac{\sin^2 x}{x^2}\le \dfrac{1}{x^2}$，而 $\int_1^{+\infty} x^{-2}\,dx$ 收敛，故原积分收敛。

**例 13.5'** 讨论 $\displaystyle\int_0^1 \frac{1}{\sqrt{1-x^2}}\,dx$。瑕点 $x=1$，当 $x\to 1^-$ 时 $\sqrt{1-x^2}=\sqrt{(1-x)(1+x)}\sim\sqrt{2(1-x)}$，故 $\frac{1}{\sqrt{1-x^2}}\sim\frac{1}{\sqrt{2(1-x)}}$，与 $p=1/2<1$ 的 $p$-积分比较，收敛。直接换元 $x=\sin\theta$ 得 $\int_0^{\pi/2}d\theta=\pi/2$。

### 13.1.4 Cauchy 反常积分

**定义**：$\displaystyle\int_{-\infty}^{+\infty} f(x)\,dx$ 的 **Cauchy 主值**（若存在）定义为
$$\text{p.v.}\int_{-\infty}^{+\infty} f(x)\,dx=\lim_{R\to+\infty}\int_{-R}^{R} f(x)\,dx.$$
Cauchy 主值存在**不意味着**反常积分收敛。例如 $\displaystyle\int_{-\infty}^{+\infty} x\,dx$ 发散，但 $\text{p.v.}\int_{-\infty}^{+\infty} x\,dx=\lim_{R\to+\infty}\int_{-R}^R x\,dx=0$（奇函数对称抵消）。

**例 13.6** $\text{p.v.}\displaystyle\int_{-\infty}^{+\infty} \frac{x}{1+x^4}\,dx=0$（奇函数）；而 $\displaystyle\int_{-\infty}^{+\infty} \frac{1}{1+x^2}\,dx=\pi$ 是正常收敛的反常积分。

**例 13.6'** $\displaystyle\int_{-\infty}^{+\infty} \frac{1}{1+x^4}\,dx$ 收敛。因 $\frac{1}{1+x^4}\le\frac{1}{1+x^2}$ 且 $\int_{-\infty}^{+\infty}(1+x^2)^{-1}\,dx=\pi$，比较法知收敛。求值：$\frac{1}{1+x^4}=\frac{1}{2\sqrt2}\Big(\frac{1}{x^2-\sqrt2 x+1}+\frac{1}{x^2+\sqrt2 x+1}\Big)$ 可化为 arctan 组合，结果为 $\dfrac{\pi}{\sqrt2}$。

### 13.1.5 本节小结

| 类型 | 定义方式 | 判敛工具 |
|------|----------|----------|
| 无穷区间 | $\lim_{A\to\infty}\int_a^A f$ | 比较法、$p$-积分（$p>1$） |
| 瑕点 | $\lim_{\varepsilon\to 0}\int_{a+\varepsilon}^b f$ | 比较法、$p$-积分（$p<1$） |
| 全直线 | 分段极限 | 两段都收敛 |
| Cauchy 主值 | $\lim_{R\to\infty}\int_{-R}^R f$ | 不等价于收敛 |

:::callout Cauchy 主值 vs 收敛
工程与 Fourier 分析中常遇到「对称区间上奇函数积分为 0」的形式，那是 Cauchy 主值。判敛散时仍用 §13.1.1 的分段极限定义，二者不可混用。
:::

> [要点]
>
> - 反常积分 = 常义积分的**极限**；收敛 ⇔ 该极限存在且有限。
> - **比较判别法**与 **$p$-积分** 是判敛散的第一工具：无穷区间看 $p>1$，瑕点看 $p<1$。
> - **Cauchy 主值** 是对称极限，不能代替收敛性。

---

## 13.2 反常重积分（简述）

### 13.2.1 无界区域上的二重积分

设 $D$ 为无界区域，$f$ 在 $D$ 上可积。取一列**有界**区域 $D_n\subset D$，$D_n\uparrow D$（即 $D_1\subset D_2\subset\cdots$，$\bigcup D_n=D$），定义
$$\iint_D f\,dx\,dy=\lim_{n\to\infty}\iint_{D_n} f\,dx\,dy,$$
若极限存在且与 $D_n$ 的选取无关，则称反常二重积分收敛。

**例 13.7** $\displaystyle\iint_{\mathbb{R}^2} e^{-(x^2+y^2)}\,dx\,dy$。用极坐标，取 $D_n=\{x^2+y^2\le n^2\}$：
$$\iint_{D_n} e^{-(x^2+y^2)}\,dx\,dy=\int_0^{2\pi}\int_0^n e^{-r^2}r\,dr\,d\theta=\pi\big(1-e^{-n^2}\big)\xrightarrow[n\to\infty]{}\pi.$$

### 13.2.2 无界函数的反常重积分

若 $f$ 在 $D$ 上除有限个**奇点**外有界，用挖去奇点的小邻域 $D_\varepsilon$，令
$$\iint_D f=\lim_{\varepsilon\to 0}\iint_{D\setminus D_\varepsilon} f\,dx\,dy.$$
判敛散可类比于一维比较法：在奇点附近若 $|f(x,y)|\le C r^{-p}$（$r=\sqrt{x^2+y^2}$），则 $p<2$ 时收敛，$p\ge 2$ 时发散。

**例 13.7'** $\displaystyle\iint_{x^2+y^2\le 1}(x^2+y^2)^{-1/2}\,dx\,dy$。极坐标：$\int_0^{2\pi}\int_0^1 r^{-1}\cdot r\,dr\,d\theta=2\pi\int_0^1 dr=2\pi$，收敛。

**例 13.7''** $\displaystyle\iint_{x^2+y^2\le 1}(x^2+y^2)^{-1}\,dx\,dy=\int_0^{2\pi}\int_0^1\frac{1}{r}\,dr\,d\theta$，内层 $\int_0^1 r^{-1}\,dr$ 发散（$p=1$ 瑕点），故整体发散。

**三重积分**：无界区域或奇点的定义与二重完全类似；球坐标下体积元 $r^2\sin\theta\,dr\,d\theta\,d\varphi$ 中的 $r^2$ 因子使原点奇点 $f\sim r^{-p}$ 在 $p<3$ 时 $\iiint f\,dV$ 收敛。

:::callout 与第 10 章的关系
第 10 章在**有界闭区域**上建立重积分；本章把区域扩展到全平面/全空间，或允许被积函数在个别点无界。计算时仍用 Fubini 定理与换元，但必须先验证反常积分的收敛性。
:::

> [要点]
>
> - 反常重积分需说明**逼近方式**（区域穷竭或奇点挖去），极限应独立于合理选取。
> - 二维奇点：$|f|\sim r^{-p}$ 在 $r\to 0$ 时，$p<2$ 收敛，$p\ge 2$ 发散。

---

## 13.3 含参变量的积分

### 13.3.1 定义与连续性

设 $f(x,t)$ 在矩形 $[a,b]\times[\alpha,\beta]$ 上定义。对每个 $t\in[\alpha,\beta]$，若 $\displaystyle\int_a^b f(x,t)\,dx$ 存在，则
$$F(t)=\int_a^b f(x,t)\,dx$$
是 $[\alpha,\beta]$ 上的**含参积分**。

**定理 13.2（连续性）** 若 $f(x,t)$ 在 $[a,b]\times[\alpha,\beta]$ 上**连续**，则 $F(t)$ 在 $[\alpha,\beta]$ 上连续。

**证明思路**：取 $t_0$，$|F(t)-F(t_0)|=\big|\int_a^b [f(x,t)-f(x,t_0)]\,dx\big|$。由 $f$ 在紧集 $[a,b]\times[\alpha,\beta]$ 上一致连续，对 $\varepsilon>0$ 存在 $\delta>0$ 使 $|t-t_0|<\delta\Rightarrow |f(x,t)-f(x,t_0)|<\varepsilon$ 对所有 $x\in[a,b]$ 成立，故 $|F(t)-F(t_0)|\le (b-a)\varepsilon$。

**例 13.8'** $F(t)=\displaystyle\int_0^1 \frac{x^t-1}{\ln x}\,dx$（$t>-1$）。被积函数在 $x=1$ 有可去奇点（极限 $=1$），在 $[0,1]\times[\alpha,\beta]$（$\alpha>-1$）上连续，故 $F$ 连续。事实上 $F(t)=\ln(t+1)$（见例 13.9）。

**可积性**：若 $f$ 连续，则 $F(t)$ 在 $[\alpha,\beta]$ 上可积，且 $\displaystyle\int_\alpha^\beta F(t)\,dt=\int_\alpha^\beta\int_a^b f(x,t)\,dx\,dt=\int_a^b\int_\alpha^\beta f(x,t)\,dt\,dx$（Fubini：连续 ⇒ 可换序）。

### 13.3.2 积分号下求导

**定理 13.3（Leibniz 求导法则）** 设 $f,f_t$ 都在 $[a,b]\times[\alpha,\beta]$ 上连续，则
$$F'(t)=\frac{d}{dt}\int_a^b f(x,t)\,dx=\int_a^b \frac{\partial f}{\partial t}(x,t)\,dx.$$

**证明概要**：对 $h\neq 0$，用中值定理
$$\frac{F(t+h)-F(t)}{h}=\int_a^b \frac{f(x,t+h)-f(x,t)}{h}\,dx=\int_a^b f_t(x,t+\theta h)\,dx,\quad \theta\in(0,1).$$
令 $h\to 0$，由 $f_t$ 连续，被积函数一致趋 $f_t(x,t)$，可交换极限与积分（被积函数连续 ⇒ 一致收敛于 $f_t$），得结论。

**变上限情形**：若 $F(t)=\displaystyle\int_{a(t)}^{b(t)} f(x,t)\,dx$，则
$$F'(t)=f(b(t),t)\,b'(t)-f(a(t),t)\,a'(t)+\int_{a(t)}^{b(t)} f_t(x,t)\,dx.$$
这是单变量微积分 Leibniz 公式的推广：端点移动产生「流量」项，被积函数对参数的偏导产生「内核」项。

**高阶求导**：若 $f,f_t,f_{tt},\ldots$ 连续，可重复在积分号下求导：
$$\frac{d^n F}{dt^n}=\int_a^b \frac{\partial^n f}{\partial t^n}(x,t)\,dx.$$

**例 13.8** 设 $F(t)=\displaystyle\int_0^{\pi/2} \frac{\sin(tx)}{x}\,dx$（$t>0$）。注意 $f(x,0)=0$，$f(x,t)=\sin(tx)/x$ 在 $[0,\pi/2]\times[0,T]$ 上连续（$x=0$ 处极限 $=t$）。形式导数 $\displaystyle\int_0^{\pi/2}\cos(tx)\,dx=\frac{\sin(t\pi/2)}{t}$。严格地，$f_t(x,t)=\cos(tx)$ 连续，由定理 13.3 得 $F'(t)=\sin(t\pi/2)/t$。

**例 13.9** 计算 $\displaystyle\int_0^1 \frac{x^b-x^a}{\ln x}\,dx$（$a,b>-1$）。令 $I(t)=\displaystyle\int_0^1 x^t\,dx=\frac{1}{t+1}$。注意 $\dfrac{d}{dt}x^t=x^t\ln x$，故 $\dfrac{x^b-x^a}{\ln x}=\int_a^b x^t\,dt$。由 Leibniz 法则 $I'(t)=\displaystyle\int_0^1 x^t\ln x\,dx$（需 $f,f_t$ 连续），形式地 $\dfrac{x^b-x^a}{\ln x}=\int_a^b\frac{\partial}{\partial t}x^t\,dt$。交换积分次序（Fubini）：
$$\int_0^1\frac{x^b-x^a}{\ln x}\,dx=\int_a^b I'(t)\,dt=\int_a^b\frac{1}{t+1}\,dt=\ln\frac{b+1}{a+1}.$$

**例 13.9'** 设 $F(a)=\displaystyle\int_0^{\pi/2}\frac{dx}{\cos x+a\sin x}$（$a>0$）。Leibniz 对 $a$ 求导：
$$F'(a)=\int_0^{\pi/2}\frac{-x\sin x}{(\cos x+a\sin x)^2}\,dx,$$
可用于递推或数值验证；端点 $x=\pi/2$ 无问题因分母 $a>0$。

:::callout 何时不能求导
若 $f_t$ 不连续，或积分限、瑕点位置依赖 $t$，Leibniz 公式需修正或失效。例如 $F(t)=\int_0^t f(x,t)\,dx$ 的求导含 $f(t,t)$ 的边界项，不能 naive 地在积分号内求偏导。
:::

> [要点]
>
> - 有限区间 + $f,f_t$ 连续 ⇒ **可在积分号下求导**。
> - 变限积分用 Leibniz 公式：端点贡献 + 被积函数对参数的偏导。

---

## 13.4 含参变量的反常积分

### 13.4.1 一致收敛

设 $f(x,t)$ 在 $[a,+\infty)\times[\alpha,\beta]$ 上定义，$F(t)=\displaystyle\int_a^{+\infty} f(x,t)\,dx$。称 $\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ **一致收敛**，若对任意 $\varepsilon>0$，存在 $A_0\ge a$（**只依赖 $\varepsilon$，不依赖 $t$**），当 $A>A_0$ 时对所有 $t\in[\alpha,\beta]$ 有
$$\left|\int_A^{+\infty} f(x,t)\,dx\right|<\varepsilon.$$

**Weierstrass M-判别法**：若 $|f(x,t)|\le g(x)$ 且 $\displaystyle\int_a^{+\infty} g(x)\,dx$ 收敛，则 $\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t$ 一致收敛。

**例 13.10** $\displaystyle\int_0^{+\infty} e^{-tx}\,dx=\frac{1}{t}$（$t>0$）。对 $t\in[\delta,+\infty)$（$\delta>0$），$e^{-tx}\le e^{-\delta x}$，而 $\int_0^{+\infty}e^{-\delta x}\,dx=1/\delta$ 收敛，故在 $[\delta,+\infty)$ 上一致收敛；但在 $(0,+\infty)$ 上**不一致**收敛：对 $\varepsilon=1/2$，任意 $A>0$，取 $t=1/A$，则 $\int_A^{+\infty}e^{-x/A}\,dx=e^{-1}>\varepsilon$。

**Dirichlet 判别法（含参）**：若 $\displaystyle\left|\int_a^A g(x,t)\,dx\right|\le M$ 对一切 $A\ge a,\ t\in[\alpha,\beta]$ 一致有界，且 $h(x,t)$ 关于 $x$ 单调、$\displaystyle\lim_{x\to+\infty}h(x,t)=0$ 对 $t$ **一致**，则 $\displaystyle\int_a^{+\infty} g(x,t)h(x,t)\,dx$ 关于 $t$ 一致收敛。

**Abel 判别法（含参）**：若 $\displaystyle\int_a^{+\infty} g(x,t)\,dx$ 关于 $t$ 一致收敛，$h(x,t)$ 关于 $x$ 单调且对 $x,t$ **一致有界**，则 $\displaystyle\int_a^{+\infty} g(x,t)h(x,t)\,dx$ 一致收敛。

**一致收敛 vs 逐点收敛**：逐点收敛只要求对每个固定的 $t$，尾项 $\int_A^{+\infty}f(x,t)\,dx\to 0$；一致收敛要求 $A_0$ **不依赖 $t$**。函数项级数 $\sum f_n(x)$ 的一致收敛是同一思想在离散参数上的版本。

**例 13.10'** $\displaystyle\int_1^{+\infty}\frac{\sin x}{x}\,t\,dx$（$t\in[0,1]$）中，$\int_1^A\sin x\,dx=|\cos 1-\cos A|\le 2$ 一致有界，$1/x$ 单调趋于 $0$，由 Dirichlet 判别法一致收敛。

### 13.4.2 一致收敛下的性质

**定理 13.4** 设 $f(x,t)$ 在 $[a,+\infty)\times[\alpha,\beta]$ 上连续，且 $\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ 一致收敛，则
1. $F(t)=\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 在 $[\alpha,\beta]$ 上**连续**；
2. 若 $\displaystyle\int_a^{+\infty} f_t(x,t)\,dx$ 关于 $t$ 一致收敛，则 $F'(t)=\displaystyle\int_a^{+\infty} f_t(x,t)\,dx$；
3. 对任意 $[\alpha,\beta]$ 上的可积 $\varphi(t)$，可交换积分次序：
$$\int_\alpha^\beta F(t)\,dt=\int_a^{+\infty}\int_\alpha^\beta f(x,t)\,dt\,dx.$$

**证明思路（连续性）**：对 $t,t_0\in[\alpha,\beta]$，
$$|F(t)-F(t_0)|\le \int_a^A|f(x,t)-f(x,t_0)|\,dx+\left|\int_A^{+\infty}f(x,t)\,dx\right|+\left|\int_A^{+\infty}f(x,t_0)\,dx\right|.$$
给定 $\varepsilon>0$，由一致收敛取 $A$ 使后两项 $<\varepsilon/3$；再对固定的 $A$，由 $f$ 在紧集上一致连续取 $\delta$ 使 $|t-t_0|<\delta$ 时首项 $<\varepsilon/3$。

**反例（无一致收敛）**：$f_n(x)=x^n$ 在 $[0,1]$ 上逐点趋于 $f(x)=\mathbf{1}_{\{1\}}(x)$，极限不连续。含参版：$F(t)=\int_0^{+\infty}e^{-tx}\,dx=1/t$ 在 $(0,+\infty)$ 上每点收敛，但在 $t=0$ 处积分发散；若只在 $[\delta,\infty)$ 上则 $F$ 连续且一致收敛保证成立。

**逐项积分**：若 $\displaystyle\sum_{n=1}^\infty f_n(x,t)$ 在 $[a,b]\times[\alpha,\beta]$ 上一致收敛且各项连续，则
$$\int_a^b\sum_{n=1}^\infty f_n(x,t)\,dx=\sum_{n=1}^\infty\int_a^b f_n(x,t)\,dx.$$
反常情形需对 $\int_a^{+\infty}$ 加一致收敛条件。

### 13.4.3 几个重要的积分

**例 13.11（Dirichlet 积分）** $\displaystyle\int_0^{+\infty} \frac{\sin x}{x}\,dx=\frac{\pi}{2}$。

**证法概要**：考虑 $F(t)=\displaystyle\int_0^{+\infty} \frac{\sin(tx)}{x}\,dx$（$t>0$）。对 $F(t)$ 求导（需验证一致收敛）：
$$F'(t)=\int_0^{+\infty}\cos(tx)\,dx.$$
该积分在常义下发散，换用 Laplace 阻尼：令 $F_\varepsilon(t)=\displaystyle\int_0^{+\infty}e^{-\varepsilon x}\frac{\sin(tx)}{x}\,dx$，则 $F_\varepsilon'(t)=\displaystyle\int_0^{+\infty}e^{-\varepsilon x}\cos(tx)\,dx=\frac{\varepsilon}{\varepsilon^2+t^2}$，积分得 $F_\varepsilon(t)=\arctan(t/\varepsilon)$。令 $\varepsilon\to 0^+$ 得 $F(t)=\pi/2$（$t>0$）。由被积函数对 $t$ 的奇偶性，$F(0)=\pi/2$ 即原积分。

**例 13.12（Gauss 积分）** $\displaystyle\int_{-\infty}^{+\infty} e^{-x^2}\,dx=\sqrt{\pi}$。

**证法概要**：记 $I=\displaystyle\int_{-\infty}^{+\infty} e^{-x^2}\,dx$。则
$$I^2=\int_{-\infty}^{+\infty}\int_{-\infty}^{+\infty} e^{-(x^2+y^2)}\,dx\,dy=\lim_{n\to\infty}\iint_{x^2+y^2\le n^2}e^{-(x^2+y^2)}\,dx\,dy.$$
极坐标（例 13.7）：$I^2=\pi$，故 $I=\sqrt\pi$（$I>0$）。

**例 13.12'** 含参形式 $I(t)=\displaystyle\int_{-\infty}^{+\infty} e^{-tx^2}\,dx=\sqrt{\pi/t}$（$t>0$）。对 $t$ 求导：
$$\int_{-\infty}^{+\infty}(-x^2)e^{-tx^2}\,dx=-\frac{d}{dt}\sqrt{\frac{\pi}{t}}=\frac{1}{2}\sqrt{\frac{\pi}{t^3}},$$
即 $\displaystyle\int_{-\infty}^{+\infty}x^2 e^{-tx^2}\,dx=\frac{1}{2}\sqrt{\frac{\pi}{t^3}}$。

**例 13.13（Laplace 型）** $\displaystyle\int_0^{+\infty} \frac{\cos(ax)}{1+x^2}\,dx=\frac{\pi}{2}e^{-|a|}$（$a\in\mathbb{R}$）。可通过对 $a$ 求导化为 $\displaystyle\int_0^{+\infty}\frac{-x\sin(ax)}{1+x^2}\,dx$ 并用 residue 或已知表；收敛性由 $1/(1+x^2)$ 控制，对 $a$ 在紧集上一致收敛保证求导合法。

:::callout 一致收敛是核心
含参反常积分「能不能换序、能不能求导」，关键不在点态收敛，而在**一致收敛**（或 dominated convergence 的积分版 M-判别法）。没有一致收敛，极限函数可能不连续，求导可能错——这是分析里最常见的陷阱之一。
:::

> [要点]
>
> - **M-判别法**：找与 $t$ 无关的可积控制函数 $g(x)$。
> - 一致收敛 ⇒ 连续性、逐项求导、换序积分。
> - **Dirichlet 积分** $\int_0^{+\infty}\sin x/x\,dx=\pi/2$，**Gauss 积分** $\int_{-\infty}^{+\infty}e^{-x^2}\,dx=\sqrt\pi$ 应熟记。

---

## 13.5 $\Gamma$ 函数与 $B$ 函数

### 13.5.1 $\Gamma$ 函数

**定义**：对 $s>0$，
$$\Gamma(s)=\int_0^{+\infty} x^{s-1}e^{-x}\,dx.$$
**收敛性**：$s>0$ 时，在 $0$ 附近 $x^{s-1}$ 与 $p$-积分比较，需 $s-1>-1$ 即 $s>0$；在 $+\infty$ 处 $x^{s-1}e^{-x}$ 被 $e^{-x/2}$ 控制，收敛。故 $\Gamma(s)$ 对 $s>0$ 定义良好。

**性质**：
1. **递推公式**：$\Gamma(s+1)=s\,\Gamma(s)$。证：分部积分
$$\Gamma(s+1)=\int_0^{+\infty}x^s e^{-x}\,dx=\Big[-x^s e^{-x}\Big]_0^{+\infty}+s\int_0^{+\infty}x^{s-1}e^{-x}\,dx=s\Gamma(s),$$
其中边界项 $=0$（$s>0$ 时 $x^s e^{-x}\to 0$ 在 $0$ 与 $\infty$ 处）。
2. 故 $\Gamma(n+1)=n!$（$n\in\mathbb{N}$），且 $\Gamma(1)=\int_0^{+\infty}e^{-x}\,dx=1$。
3. **对数凸性**（补充）：$\ln\Gamma(s)$ 在 $s>0$ 上凸，由此可证 $\Gamma$ 在 $(0,\infty)$ 上无零点（除极点外）。

**$\Gamma(1/2)=\sqrt\pi$ 的推导**：令 $t=x^2$，则
$$\Gamma(1/2)=\int_0^{+\infty}x^{-1/2}e^{-x}\,dx=2\int_0^{+\infty}e^{-t^2}\,dt=\sqrt\pi$$
（用到 $\int_0^{+\infty}e^{-t^2}\,dt=\sqrt\pi/2$）。

**例 13.14** $\Gamma(3/2)=\frac12\Gamma(1/2)=\frac{\sqrt\pi}{2}$；$\Gamma(5/2)=\frac{3}{2}\cdot\frac{1}{2}\Gamma(1/2)=\frac{3\sqrt\pi}{4}$。

**例 13.14'** $\displaystyle\int_0^{+\infty}x^{2n}e^{-x^2}\,dx=\frac12\Gamma\Big(n+\frac12\Big)=\frac{(2n-1)!!}{2^{n+1}}\sqrt\pi$（换元 $t=x^2$）。

### 13.5.2 余元公式（补充函数方程）

$\Gamma$ 可解析延拓到 $s\neq 0,-1,-2,\ldots$。经典恒等式**余元公式**（Euler reflection formula）：
$$\Gamma(s)\,\Gamma(1-s)=\frac{\pi}{\sin(\pi s)},\qquad s\notin\mathbb{Z}.$$
由此得 $\Gamma(1/2)=\sqrt\pi$（取 $s=1/2$），以及 $\Gamma(-1/2)=-2\sqrt\pi$ 等负半轴值。负整数 $s=-n$（$n\in\mathbb{N}$）处 $\Gamma$ 有**单极点**；解析延拓的完整证明需复分析或 Weierstrass 乘积 $\Gamma(s)=e^{-\gamma s}s^{-1}\prod_{n=1}^\infty(1+s/n)^{-1}e^{s/n}$，此处作为重要结论记住。

**Stirling 公式（补充）**：$n\to\infty$ 时 $\Gamma(n+1)\sim\sqrt{2\pi n}\,(n/e)^n$，即 $n!\sim\sqrt{2\pi n}\,(n/e)^n$，连接阶乘与渐近分析。

### 13.5.3 $B$ 函数

**定义**：对 $p,q>0$，
$$B(p,q)=\int_0^1 x^{p-1}(1-x)^{q-1}\,dx.$$
**收敛性**：$p,q>0$ 时，$x=0$ 附近 $x^{p-1}$ 可积（$p>0$），$x=1$ 附近 $(1-x)^{q-1}$ 可积（$q>0$），故 $B(p,q)$ 定义良好。

**与 $\Gamma$ 的关系**：
$$\boxed{B(p,q)=\frac{\Gamma(p)\,\Gamma(q)}{\Gamma(p+q)}}.$$

**证明概要**：$\Gamma(p)\Gamma(q)=\displaystyle\int_0^{+\infty}\int_0^{+\infty} x^{p-1}y^{q-1}e^{-(x+y)}\,dx\,dy$。换元 $x+y=u$（$u>0$），$x=vu$（$0<v<1$），Jacobian $|J|=u$，得
$$\Gamma(p)\Gamma(q)=\int_0^{+\infty}u^{p+q-1}e^{-u}\,du\int_0^1 v^{p-1}(1-v)^{q-1}\,dv=\Gamma(p+q)\,B(p,q).$$

**对称性**：$B(p,q)=B(q,p)$（换元 $x\mapsto 1-x$）。

**三角形式**：令 $x=\sin^2\theta$，则
$$B(p,q)=2\int_0^{\pi/2}\sin^{2p-1}\theta\,\cos^{2q-1}\theta\,d\theta.$$

**递推**：$B(p,q)=\dfrac{q-1}{p+q-1}B(p,q-1)$（对 $B$ 分部积分或 Beta 函数性质）。

**例 13.15** $B(1/2,1/2)=\displaystyle\int_0^1\frac{dx}{\sqrt{x(1-x)}}=\frac{\Gamma(1/2)^2}{\Gamma(1)}=\pi$。三角换元 $x=\sin^2\theta$：$B(1/2,1/2)=2\int_0^{\pi/2}d\theta=\pi$。

**例 13.16** 概率论中的 Beta 分布 $X\sim\mathrm{Beta}(\alpha,\beta)$ 的密度 $f(x)\propto x^{\alpha-1}(1-x)^{\beta-1}$，归一化常数
$$\int_0^1 x^{\alpha-1}(1-x)^{\beta-1}\,dx=B(\alpha,\beta)=\frac{\Gamma(\alpha)\Gamma(\beta)}{\Gamma(\alpha+\beta)}.$$

**例 13.16'** $B(2,3)=\dfrac{\Gamma(2)\Gamma(3)}{\Gamma(5)}=\dfrac{1!\cdot 2!}{4!}=\dfrac{2}{24}=\dfrac{1}{12}$；直接积分 $\int_0^1 x(1-x)^2\,dx=\big[\frac{x^2}{2}-\frac{2x^3}{3}+\frac{x^4}{4}\big]_0^1=\frac{1}{12}$，一致。

:::callout $\Gamma$ 与 $B$ 的使用场景
- 无穷区间上 $x^{s-1}e^{-x}$、$[0,1]$ 上 $x^{p-1}(1-x)^{q-1}$ 型积分 → 直接查 $\Gamma$、$B$；
- 概率：Gamma 分布、Beta 分布、$\chi^2$ 分布的归一化；
- 组合：$\binom{n}{k}=\dfrac{\Gamma(n+1)}{\Gamma(k+1)\Gamma(n-k+1)}$（$n,k\in\mathbb{N}$）。
:::

> [要点]
>
> - $\Gamma(s)=\int_0^{+\infty}x^{s-1}e^{-x}\,dx$，$\Gamma(n+1)=n!$，$\Gamma(1/2)=\sqrt\pi$。
> - **余元公式** $\Gamma(s)\Gamma(1-s)=\pi/\sin(\pi s)$ 联系正负半轴。
> - $B(p,q)=\Gamma(p)\Gamma(q)/\Gamma(p+q)$；$B(1/2,1/2)=\pi$。

---

## 本章知识结构

```
反常积分（§13.1–13.2）
  ├─ 无穷区间 / 瑕点 / 混合型
  ├─ 比较判别法、p-积分、Cauchy 准则
  └─ 反常重积分（区域穷竭、奇点挖去）

含参积分（§13.3–13.4）
  ├─ 有限区间：连续 ⇒ 连续；f,f_t 连续 ⇒ 求导
  ├─ 无穷区间：一致收敛（M-、Dirichlet、Abel 判别法）
  └─ 一致收敛 ⇒ 连续、求导、换序

Euler 积分（§13.5）
  ├─ Γ(s) = ∫₀^∞ x^{s-1}e^{-x}dx，递推、余元公式
  └─ B(p,q) = Γ(p)Γ(q)/Γ(p+q)，对称性与三角形式
```

与前面章节的联系：第 10 章重积分 + 本章反常重积分 ⇒ Gauss 积分等；第 12 章 Fourier 分析中的 $\int_0^\infty\sin x/x\,dx$、Cauchy 主值在本章有严格框架；概率论中 Gamma、Beta 分布的归一化常数即 $\Gamma$、$B$ 函数。

---

## 本章综合习题（选）

**13.1** 讨论下列反常积分的敛散性，若收敛则求值：
(a) $\displaystyle\int_0^{+\infty} \frac{1}{1+x^4}\,dx$（见例 13.6'）；
(b) $\displaystyle\int_0^1 \frac{\ln x}{\sqrt{1-x}}\,dx$（提示：换元 $x=\sin^2\theta$ 化为 $4\int_0^{\pi/2}\ln(\sin\theta)\,d\theta$，或化为 $B$ 函数）。

**13.2** 证明：若 $f\in C[0,+\infty)$ 且 $\displaystyle\int_0^{+\infty} f(x)\,dx$ 收敛，则未必有 $\displaystyle\lim_{x\to+\infty} f(x)=0$。

*提示*：构造「尖峰」序列 $f_n(x)=n$ 在 $[n,n+1/n^2]$ 上、否则为 $0$，令 $f=\sum f_n$ 适当缩放；或 $f(x)=\sin(x^2)$。若额外假设 $f$ **单调**且积分收敛，证明 $f(x)\to 0$（反证：若 $f(x)\ge\varepsilon>0$ 无穷多次，则 $\int f$ 发散）。

**13.3** 设 $F(t)=\displaystyle\int_0^{+\infty} e^{-tx}\frac{\sin x}{x}\,dx$（$t>0$）。证明 $F$ 在 $(0,+\infty)$ 上可导并求 $F'(t)$。

*提示*：形式求导 $\int_0^\infty e^{-tx}\sin x\,dx=\dfrac{1}{1+t^2}$；用 M-判别法验证 $\int_0^\infty f_t(x,t)\,dx$ 关于 $t\in[\delta,\infty)$ 一致收敛。

**13.4** 用 $\Gamma$ 函数表示 $\displaystyle\int_0^{+\infty} x^{2n}e^{-x^2}\,dx$（$n\in\mathbb{N}$），并计算 $n=1$ 时的值。

*答案*：$\dfrac12\Gamma(n+\tfrac12)$；$n=1$ 时为 $\dfrac{\sqrt\pi}{4}$。

**13.5** 证明 $B(p,q)=2\displaystyle\int_0^{\pi/2}\sin^{2p-1}\theta\,\cos^{2q-1}\theta\,d\theta$，并由此计算 $\displaystyle\int_0^{\pi/2}\sin^4\theta\,\cos^4\theta\,d\theta$。

*提示*：$p=q=5/2$ 时 $B(5/2,5/2)=\dfrac{\Gamma(5/2)^2}{\Gamma(5)}=\dfrac{3\pi}{128}$；或直接 $2\int_0^{\pi/2}\sin^4\theta\cos^4\theta\,d\theta$。

（详解可在后续修订中补入。）

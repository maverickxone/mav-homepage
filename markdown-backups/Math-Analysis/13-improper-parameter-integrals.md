---
title: "第 13 章 反常积分和含参变量的积分"
chapter: 6
readTime: 200
description: "反常积分敛散、含参积分、一致收敛与 Euler 积分（Γ、B 函数）。"
---

> 📋 **本章期末速查**
> - 必考（每年 2-3 题，20-30 分）：含参积分求导（Leibniz 法则 + 一致收敛验证）、Γ/B 函数计算、一致收敛判别
> - 常考：反常积分收敛性讨论、Dirichlet 积分应用、余元公式
> - 了解：反常重积分、含参积分换序条件

前面各章的定积分、重积分都建立在**有限区间**与**有界被积函数**这两个前提上。但实际问题中经常遇到两类突破：

1. **积分区间无限**，例如 $\displaystyle\int_1^{+\infty}\frac{1}{x^2}\,dx$、$\displaystyle\int_{-\infty}^{+\infty}e^{-x^2}\,dx$；
2. **被积函数在积分区间内有奇点（无界）**，例如 $\displaystyle\int_0^1\frac{1}{\sqrt{x}}\,dx$、$\displaystyle\int_0^1\frac{1}{x}\,dx$。

当这两种情况出现时，常义 Riemann 积分的定义不再直接适用，我们需要把积分重新理解为某种**极限**，这就是**反常积分**（也叫广义积分）。反常积分首先要回答的不是「值是多少」，而是**它是否收敛**。

更进一步，如果被积函数还含有一个额外变量 $t$，例如
$$F(t)=\int_0^{+\infty}e^{-tx}\,dx,\qquad I(\alpha)=\int_0^{+\infty}\frac{\ln(1+\alpha x)}{1+x^2}\,dx,$$
那么积分结果就不再是一个数，而是关于 $t$（或 $\alpha$）的函数。这类对象叫**含参变量的积分**。初学者最容易犯的错误是：看到 $F(t)$ 里有积分，就直觉地认为
$$F'(t)=\int_a^b \frac{\partial f}{\partial t}(x,t)\,dx,$$
好像求导和积分可以随便交换次序。事实上，这种交换**需要条件**——在有限区间上是 $f$ 与 $f_t$ 的连续性；在无穷区间上则需要**一致收敛**。一致收敛是本章最核心的难点，也是考试最喜欢考的点。

本章最后还引入 Euler 的 $\Gamma$ 函数和 $B$ 函数。它们既是重要的特殊函数，也是计算很多积分的速算工具，在概率论（Gamma 分布、Beta 分布）、组合数学中都有广泛应用。

**本章学习地图**（建议按顺序读）：

1. **反常积分**（§13.1）：先学会判断单个反常积分是否收敛——比较法、$p$-积分、Cauchy 准则。
2. **反常重积分**（§13.2）：把一维反常积分推广到二重、三重积分，理解「区域穷竭」和「奇点挖去」。
3. **有限区间含参积分**（§13.3）：在什么条件下，含参积分 $F(t)$ 连续、可导、可换序？
4. **含参反常积分**（§13.4）：一致收敛的定义与判别（M-判别法、Dirichlet、Abel）；一致收敛如何保证连续性、求导、换序。
5. **重要积分**（§13.4.3）：Dirichlet 积分、Gauss 积分、Laplace 型积分的推导。
6. **Euler 积分**（§13.5）：$\Gamma$ 函数和 $B$ 函数的定义、性质、关系，以及余元公式。

**学习路线建议**：
1. 先掌握 §13.1 的判敛法（比较法 + $p$-积分），这是后面一切含参反常积分的基础；
2. §13.3 的 Leibniz 法则在有限区间上可直接用，与一元微积分一致；
3. §13.4 的一致收敛是本章难点，务必区分「逐点收敛」与「一致收敛」；
4. §13.5 的 $\Gamma$、$B$ 函数作为计算工具熟记，余元公式 $\Gamma(s)\Gamma(1-s)=\pi/\sin(\pi s)$ 可暂不证。

> 💡 **给初学者的话**：本章有两个层次的抽象。第一层是「反常积分」——把积分变成极限；第二层是「含参积分」——极限、积分、求导三种运算能否交换。每次做题时，先问自己：这是有限区间还是无穷区间？被积函数有没有奇点？含不含参数？这三个问题搞清，定理就知道该用哪一个。

---

## 13.1 反常积分

> 🟡 **考试重要度：中等** | 判敛法作为含参积分的基础工具出现，偶尔独立出小题
> 🟢 **本节目标**：把「无限区间」或「被积函数无界」的积分，重新定义为常义积分的极限，并学会判断它是否收敛。

### 13.1.1 为什么要研究反常积分？

常义 Riemann 积分的定义要求两个条件：
1. 积分区间**有界**；
2. 被积函数**有界**。

如果这两个条件中的任意一个被破坏，Riemann 和
$$\sum_{i=1}^n f(\xi_i)\Delta x_i$$
就可能失去意义。例如：
- $f(x)=1/x$ 在 $[1,+\infty)$ 上，区间无限长；
- $f(x)=1/\sqrt{x}$ 在 $(0,1]$ 上，$x\to0^+$ 时 $f(x)\to+\infty$。

反常积分的思想很朴素：**先在「好的」部分上做常义积分，再让「好的」部分趋于完整的积分区域，看极限是否存在**。

### 13.1.2 无穷区间上的反常积分

设 $f$ 在 $[a,+\infty)$ 上定义，并且对任意 $A>a$，常义积分 $\displaystyle\int_a^A f(x)\,dx$ 都存在。定义变上限函数
$$F(A)=\int_a^A f(x)\,dx.$$

如果极限
$$\lim_{A\to+\infty}F(A)=\lim_{A\to+\infty}\int_a^A f(x)\,dx=I$$
存在且有限，则称反常积分 $\displaystyle\int_a^{+\infty} f(x)\,dx$ **收敛**，其值为 $I$；否则称**发散**。

> 核心观点：无穷区间积分 = 有限区间积分 + 令上限趋于无穷的极限。

**例 13.1**：$\displaystyle\int_1^{+\infty}\frac{1}{x^2}\,dx$。

先算有限部分：
$$F(A)=\int_1^A\frac{1}{x^2}\,dx=\Big[-\frac{1}{x}\Big]_1^A=1-\frac{1}{A}.$$

再取极限：
$$\lim_{A\to+\infty}F(A)=\lim_{A\to+\infty}\Big(1-\frac{1}{A}\Big)=1.$$

所以该反常积分收敛，值为 $1$。

**例 13.2**：$\displaystyle\int_1^{+\infty}\frac{1}{x}\,dx$。

先算有限部分：
$$F(A)=\int_1^A\frac{1}{x}\,dx=\ln A.$$

再取极限：
$$\lim_{A\to+\infty}\ln A=+\infty.$$

极限不存在（发散到正无穷），所以该反常积分发散。

> 对比一下：$1/x^2$ 和 $1/x$ 在 $x\to+\infty$ 时都趋于 $0$，但前者积分收敛，后者发散。这说明「被积函数趋于 0」只是必要条件（对很多函数来说甚至不是），不是充分条件。收敛与否要看函数趋于 0 的速度是否足够快。

#### 无穷区间积分的其他形式

- **左无穷**：$\displaystyle\int_{-\infty}^b f(x)\,dx=\lim_{B\to-\infty}\int_B^b f(x)\,dx$。
- **全直线**：$\displaystyle\int_{-\infty}^{+\infty} f(x)\,dx$ 必须**拆成两段**：
  $$\int_{-\infty}^{+\infty} f(x)\,dx=\int_{-\infty}^c f(x)\,dx+\int_c^{+\infty} f(x)\,dx,$$
  其中 $c$ 是任意实数（通常取 $0$）。**只有当两段都收敛时**，全直线积分才收敛。

> ⚠️ **常见错误**：不要写成 $\displaystyle\lim_{R\to+\infty}\int_{-R}^{R}f(x)\,dx$。这是 Cauchy 主值，不等于反常积分的收敛性。后面 §13.1.7 会专门讲。

### 13.1.3 无界函数的反常积分（瑕积分）

设 $f$ 在 $(a,b]$ 上有定义，在 $x=a$ 附近无界，即
$$\lim_{x\to a^+}f(x)=\infty\text{ 或不存在}.$$
这样的点 $x=a$ 称为**瑕点**（或奇点）。

若对任意 $\varepsilon\in(0,b-a)$，常义积分 $\displaystyle\int_{a+\varepsilon}^b f(x)\,dx$ 存在，且极限
$$\lim_{\varepsilon\to0^+}\int_{a+\varepsilon}^b f(x)\,dx=I$$
存在有限，则称反常积分 $\displaystyle\int_a^b f(x)\,dx$ 收敛，值为 $I$；否则发散。

> 核心观点：瑕积分 = 挖去瑕点附近的小区间 + 让小区间趋于 0 的极限。

**瑕点位置**：
- 瑕点在左端点：$\displaystyle\int_a^b f(x)\,dx=\lim_{\varepsilon\to0^+}\int_{a+\varepsilon}^b f(x)\,dx$；
- 瑕点在右端点：$\displaystyle\int_a^b f(x)\,dx=\lim_{\varepsilon\to0^+}\int_a^{b-\varepsilon} f(x)\,dx$；
- 瑕点在内部 $c\in(a,b)$：必须拆成两段
  $$\int_a^b f(x)\,dx=\int_a^c f(x)\,dx+\int_c^b f(x)\,dx,$$
  两段都收敛才收敛。

**例 13.3**：$\displaystyle\int_0^1\frac{1}{\sqrt{x}}\,dx$。

$x=0$ 是瑕点，因为 $\lim_{x\to0^+}1/\sqrt{x}=+\infty$。挖去 $[0,\varepsilon]$：
$$\int_\varepsilon^1 x^{-1/2}\,dx=\Big[2\sqrt{x}\Big]_\varepsilon^1=2-2\sqrt{\varepsilon}.$$

令 $\varepsilon\to0^+$：
$$\lim_{\varepsilon\to0^+}(2-2\sqrt{\varepsilon})=2.$$

所以该瑕积分收敛，值为 $2$。

**例 13.4**：$\displaystyle\int_0^1\frac{1}{x}\,dx$。

$x=0$ 是瑕点。挖去 $[0,\varepsilon]$：
$$\int_\varepsilon^1\frac{1}{x}\,dx=\Big[\ln x\Big]_\varepsilon^1=-\ln\varepsilon=\ln\frac{1}{\varepsilon}.$$

令 $\varepsilon\to0^+$：
$$\lim_{\varepsilon\to0^+}\ln\frac{1}{\varepsilon}=+\infty.$$

所以该瑕积分发散。

> 对比一下：$1/\sqrt{x}$ 和 $1/x$ 在 $x\to0^+$ 时都趋于 $+\infty$，但前者积分收敛，后者发散。这说明「函数在瑕点处无界」不意味着积分一定发散——关键看无界的速度是否足够慢。

### 13.1.4 混合型反常积分

有些积分同时具有无限区间和瑕点，例如
$$\int_0^{+\infty}\frac{1}{x^p}\,dx.$$

对这种积分，必须在**每一个「坏点」**处单独判断：
- $x=0$ 可能是瑕点；
- $x=+\infty$ 是无穷区间端点。

**收敛当且仅当所有部分都收敛**。

**例 13.4'**：$\displaystyle\int_0^{+\infty}\frac{1}{x^2+1}\,dx$。

拆成两段，例如
$$\int_0^{+\infty}\frac{1}{x^2+1}\,dx=\int_0^1\frac{1}{x^2+1}\,dx+\int_1^{+\infty}\frac{1}{x^2+1}\,dx.$$

- 第一段：$[0,1]$ 上被积函数连续有界，是常义积分，收敛。
- 第二段：在 $+\infty$ 处，$\dfrac{1}{x^2+1}\le\dfrac{1}{x^2}$，而 $\displaystyle\int_1^{+\infty}\frac{1}{x^2}\,dx$ 收敛，故第二段收敛。

因此整体收敛。计算值：
$$\int_0^{+\infty}\frac{1}{x^2+1}\,dx=\Big[\arctan x\Big]_0^{+\infty}=\frac{\pi}{2}.$$

### 13.1.5 Cauchy 收敛准则

和数列、函数极限一样，反常积分也有 Cauchy 收敛准则。它是判断收敛性的基本工具，也是后面证明比较判别法、一致收敛判别法的基础。

**定理（Cauchy 收敛准则）**：$\displaystyle\int_a^{+\infty} f(x)\,dx$ 收敛 ⇔ 对任意 $\varepsilon>0$，存在 $A_0>a$，使得当 $A',A''>A_0$ 时，
$$\Big|\int_{A'}^{A''} f(x)\,dx\Big| < \varepsilon.$$

**为什么这个定理成立？** 令 $F(A)=\displaystyle\int_a^A f(x)\,dx$。反常积分收敛 ⇔ $\lim_{A\to+\infty}F(A)$ 存在有限 ⇔ $F(A)$ 满足函数极限的 Cauchy 准则 ⇔ 对上述 $\varepsilon$，存在 $A_0$ 使 $A',A''>A_0$ 时 $|F(A'')-F(A')| < \varepsilon$。而 $F(A'')-F(A')=\displaystyle\int_{A'}^{A''}f(x)\,dx$。

> **直观**：收敛意味着「尾巴」可以任意小。Cauchy 准则说：只要从足够远的地方开始，任意一段的积分都小于 $\varepsilon$。

**绝对收敛**：若 $\displaystyle\int_a^{+\infty}|f(x)|\,dx$ 收敛，则称 $\displaystyle\int_a^{+\infty}f(x)\,dx$ **绝对收敛**。

**定理**：绝对收敛 ⇒ 收敛。

**证明**：若 $\displaystyle\int_a^{+\infty}|f|\,dx$ 收敛，由 Cauchy 准则，对任意 $\varepsilon>0$，存在 $A_0$ 使 $A',A''>A_0$ 时
$$\int_{A'}^{A''}|f(x)|\,dx < \varepsilon.$$
由三角不等式，
$$\Big|\int_{A'}^{A''}f(x)\,dx\Big|\le\int_{A'}^{A''}|f(x)|\,dx < \varepsilon.$$
故 $f$ 也满足 Cauchy 准则，所以 $\displaystyle\int_a^{+\infty}f(x)\,dx$ 收敛。

> 注意：收敛不一定绝对收敛。后面我们会看到 $\displaystyle\int_1^{+\infty}\frac{\sin x}{x}\,dx$ 收敛，但 $\displaystyle\int_1^{+\infty}\frac{|\sin x|}{x}\,dx$ 发散，这种情况叫**条件收敛**。

### 13.1.6 比较判别法与 $p$-积分

比较判别法是判断反常积分敛散性最实用的工具。它的思想和级数的比较判别法完全一样：

> 如果 $|f|$ 比已知收敛的函数还小，则 $f$ 的积分收敛；如果 $f$ 比已知发散的函数还大，则 $f$ 的积分发散。

**定理 13.1（比较判别法）**：设 $f,g\ge0$ 在 $[a,+\infty)$ 上可积，且 $f(x)\le g(x)$ 对所有 $x\ge a$ 成立。
1. 若 $\displaystyle\int_a^{+\infty}g(x)\,dx$ 收敛，则 $\displaystyle\int_a^{+\infty}f(x)\,dx$ 也收敛；
2. 若 $\displaystyle\int_a^{+\infty}f(x)\,dx$ 发散，则 $\displaystyle\int_a^{+\infty}g(x)\,dx$ 也发散。

**证明**：
1. 令 $F(A)=\displaystyle\int_a^A f(x)\,dx$，$G(A)=\displaystyle\int_a^A g(x)\,dx$。由于 $f,g\ge0$，$F(A)$ 和 $G(A)$ 都是关于 $A$ 的单调递增函数。又 $f\le g$，所以 $F(A)\le G(A)$。若 $\displaystyle\int_a^{+\infty}g\,dx$ 收敛，则 $G(A)$ 有上界，从而 $F(A)$ 也有上界。单调递增有上界 ⇒ 极限存在，即 $\displaystyle\int_a^{+\infty}f\,dx$ 收敛。
2. 这是 1 的逆否命题：若 $\displaystyle\int g\,dx$ 收敛，则 $\displaystyle\int f\,dx$ 收敛；所以若 $\displaystyle\int f\,dx$ 发散，则 $\displaystyle\int g\,dx$ 必发散。

**极限形式**：设 $f,g\ge0$，且
$$\lim_{x\to+\infty}\frac{f(x)}{g(x)}=c,\qquad 0 < c < +\infty.$$
则 $\displaystyle\int_a^{+\infty}f\,dx$ 与 $\displaystyle\int_a^{+\infty}g\,dx$ **同敛散**。

**为什么？** $f(x)\sim c\,g(x)$ 当 $x$ 充分大时，即 $f$ 和 $g$ 趋于 0（或趋于无穷）的速度是同阶的。同阶函数的积分敛散性相同。

> 实际使用时，我们通常取 $g(x)=1/x^p$，这就引出了 $p$-积分。

#### $p$-积分（无穷区间）

对 $a>0$，
$$\int_a^{+\infty}\frac{1}{x^p}\,dx\begin{cases}
\text{收敛}, & p>1,\\[4pt]
\text{发散}, & p\le 1.
\end{cases}$$

**详细证明**：设 $p\neq1$，
$$\int_a^A x^{-p}\,dx=\frac{x^{1-p}}{1-p}\Big|_a^A=\frac{A^{1-p}-a^{1-p}}{1-p}.$$

- 当 $p>1$ 时，$1-p < 0$，所以 $A^{1-p}=A^{-(p-1)}\to0$（$A\to+\infty$）。于是
  $$\int_a^{+\infty}\frac{1}{x^p}\,dx=\frac{a^{1-p}}{p-1}=\frac{1}{(p-1)a^{p-1}}.$$
- 当 $p < 1$ 时，$1-p>0$，所以 $A^{1-p}\to+\infty$，积分发散。
- 当 $p=1$ 时，
  $$\int_a^A\frac{1}{x}\,dx=\ln A-\ln a\to+\infty,$$
  发散。

**记忆口诀**：无穷区间上，**$p$ 越大越易收敛**（$p>1$ 收敛）。因为 $p$ 大意味着 $1/x^p$ 趋于 0 更快，尾巴更小。

#### $p$-积分（瑕点）

对 $b>0$，
$$\int_0^b\frac{1}{x^p}\,dx\begin{cases}
\text{收敛}, & p < 1,\\[4pt]
\text{发散}, & p\ge 1.
\end{cases}$$

**详细证明**：设 $p\neq1$，
$$\int_\varepsilon^b x^{-p}\,dx=\frac{b^{1-p}-\varepsilon^{1-p}}{1-p}.$$

- 当 $p < 1$ 时，$1-p>0$，所以 $\varepsilon^{1-p}\to0$（$\varepsilon\to0^+$）。于是
  $$\int_0^b\frac{1}{x^p}\,dx=\frac{b^{1-p}}{1-p}.$$
- 当 $p>1$ 时，$1-p < 0$，所以 $\varepsilon^{1-p}=\varepsilon^{-(p-1)}\to+\infty$，积分发散。
- 当 $p=1$ 时，
  $$\int_\varepsilon^b\frac{1}{x}\,dx=\ln b-\ln\varepsilon=\ln\frac{b}{\varepsilon}\to+\infty,$$
  发散。

**记忆口诀**：瑕点处，**$p$ 越小越易收敛**（$p < 1$ 收敛）。因为 $p$ 小意味着 $1/x^p$ 在瑕点附近增长得更慢，挖去的小区间贡献更小。

> 两个 $p$-积分的敛散性正好**互补**：$\displaystyle\int_0^1 x^{-p}\,dx$ 收敛 ⇔ $p < 1$；$\displaystyle\int_1^{+\infty}x^{-p}\,dx$ 收敛 ⇔ $p>1$。一个在 0 处「危险」，一个在 $+\infty$ 处「危险」，危险的原因不同。

#### 瑕点处的比较法

设 $f,g\ge0$ 在 $(a,b]$ 上可积，$x=a$ 是瑕点，且 $f(x)\le g(x)$ 在 $(a,b]$ 上成立。
1. 若 $\displaystyle\int_a^b g(x)\,dx$ 收敛，则 $\displaystyle\int_a^b f(x)\,dx$ 收敛；
2. 若 $\displaystyle\int_a^b f(x)\,dx$ 发散，则 $\displaystyle\int_a^b g(x)\,dx$ 发散。

极限形式：若 $\displaystyle\lim_{x\to a^+}\frac{f(x)}{g(x)}=c\in(0,+\infty)$，则两者同敛散。

实际使用时，瑕点处通常取 $g(x)=1/(x-a)^p$ 或 $g(x)=1/x^p$（当瑕点是 0 时）。

**例 13.5**：讨论 $\displaystyle\int_1^{+\infty}\frac{\sin^2 x}{x^2}\,dx$ 的敛散性。

因为 $0\le\sin^2 x\le1$，所以
$$0\le\frac{\sin^2 x}{x^2}\le\frac{1}{x^2}.$$

而 $\displaystyle\int_1^{+\infty}\frac{1}{x^2}\,dx$ 是 $p=2>1$ 的 $p$-积分，收敛。由比较判别法，原积分收敛。

> 本题不需要算出具体值（其实很难用初等函数表示），只需要判断敛散性，这正是比较法的威力。

**例 13.5'**：讨论 $\displaystyle\int_0^1\frac{1}{\sqrt{1-x^2}}\,dx$ 的敛散性，并求值。

$x=1$ 是瑕点。当 $x\to1^-$ 时，
$$\sqrt{1-x^2}=\sqrt{(1-x)(1+x)}\sim\sqrt{2(1-x)}.$$
所以
$$\frac{1}{\sqrt{1-x^2}}\sim\frac{1}{\sqrt{2(1-x)}}=\frac{1}{\sqrt{2}}\cdot\frac{1}{(1-x)^{1/2}}.$$

这是 $p=1/2 < 1$ 的瑕点 $p$-积分，收敛。因此原积分收敛。

求值：令 $x=\sin\theta$，$dx=\cos\theta\,d\theta$，当 $x=0$ 时 $\theta=0$，当 $x=1$ 时 $\theta=\pi/2$：
$$\int_0^1\frac{1}{\sqrt{1-x^2}}\,dx=\int_0^{\pi/2}\frac{\cos\theta}{\sqrt{1-\sin^2\theta}}\,d\theta=\int_0^{\pi/2}d\theta=\frac{\pi}{2}.$$

> 比较法只能告诉我们是否收敛，不能给出值。要求值，通常需要换元或分部积分等技巧。

### 13.1.7 Cauchy 主值

对于全直线上的积分，有时会遇到对称区间上的形式极限：
$$\text{p.v.}\int_{-\infty}^{+\infty}f(x)\,dx=\lim_{R\to+\infty}\int_{-R}^{R}f(x)\,dx.$$
这个极限如果存在，称为 **Cauchy 主值**（p.v. 是 principal value 的缩写）。

> ⚠️ **重要提醒**：Cauchy 主值存在**不意味着**反常积分收敛。

**例 13.6**：$\displaystyle\int_{-\infty}^{+\infty}x\,dx$。

按反常积分的定义，需拆成两段：
$$\int_{-\infty}^{+\infty}x\,dx=\int_{-\infty}^0 x\,dx+\int_0^{+\infty}x\,dx.$$

但 $\displaystyle\int_0^{+\infty}x\,dx=+\infty$ 发散，所以反常积分发散。

然而 Cauchy 主值：
$$\text{p.v.}\int_{-\infty}^{+\infty}x\,dx=\lim_{R\to+\infty}\int_{-R}^{R}x\,dx=\lim_{R\to+\infty}0=0$$
（因为 $x$ 是奇函数，对称区间积分为 0）。

所以 Cauchy 主值为 0，但反常积分发散。两者不是一回事。

**例 13.6'**：$\displaystyle\int_{-\infty}^{+\infty}\frac{1}{1+x^4}\,dx$。

被积函数是偶函数且非负。在 $+\infty$ 处，$\dfrac{1}{1+x^4}\le\dfrac{1}{1+x^2}$，而 $\displaystyle\int_{-\infty}^{+\infty}\frac{1}{1+x^2}\,dx=\pi$ 收敛，所以原积分收敛。

求值可用部分分式：
$$\frac{1}{1+x^4}=\frac{1}{2\sqrt2}\Big(\frac{x+\sqrt2}{x^2+\sqrt2 x+1}-\frac{x-\sqrt2}{x^2-\sqrt2 x+1}\Big),$$
积分后得
$$\int_{-\infty}^{+\infty}\frac{1}{1+x^4}\,dx=\frac{\pi}{\sqrt2}.$$

> 求值过程较繁琐，考试通常只要求判断敛散性或用 $\Gamma/B$ 函数求值（见 §13.5）。

### 13.1.8 本节小结

| 类型 | 定义方式 | 判敛工具 | 记忆要点 |
|------|----------|----------|----------|
| 无穷区间 | $\lim_{A\to+\infty}\int_a^A f$ | 比较法、$p$-积分 | $p>1$ 收敛 |
| 瑕点（左端） | $\lim_{\varepsilon\to0^+}\int_{a+\varepsilon}^b f$ | 比较法、$p$-积分 | $p < 1$ 收敛 |
| 全直线 | 拆成两段，两段都收敛 | 分别判断 | 不要和 Cauchy 主值混淆 |
| Cauchy 主值 | $\lim_{R\to+\infty}\int_{-R}^{R} f$ | 对称极限 | 不等价于收敛 |

:::callout Cauchy 主值 vs 收敛
工程与 Fourier 分析中常遇到「对称区间上奇函数积分为 0」的形式，那是 Cauchy 主值。判敛散时仍用 §13.1.3 的分段极限定义，二者不可混用。
:::

> [要点]
>
> - 反常积分 = 常义积分的**极限**；收敛 ⇔ 该极限存在且有限。
> - **比较判别法**与 **$p$-积分** 是判敛散的第一工具：无穷区间看 $p>1$，瑕点看 $p < 1$。
> - **Cauchy 主值** 是对称极限，不能代替收敛性。
> - 绝对收敛 ⇒ 收敛；收敛不一定绝对收敛（可能是条件收敛）。
## 13.2 反常重积分（简述）

> 🟢 **考试重要度：了解** | 期末直接考反常重积分的不多，但它是理解 Gauss 积分、Fourier 变换等工具的基础

### 13.2.1 从一维到多维

一维反常积分的思想是：
> 先在有界区域上积分，再让有界区域趋于无界区域（或挖去奇点后趋于完整区域），看极限是否存在。

二维、三维情况完全类似，但几何更复杂：
- **无界区域**：例如全平面 $\mathbb{R}^2$、上半平面、扇形外部等；
- **无界函数**：例如 $f(x,y)=1/\sqrt{x^2+y^2}$ 在原点附近无界。

处理这两种情况的核心方法分别是：
- **区域穷竭**（exhaustion）：用一列有界区域 $D_1\subset D_2\subset\cdots$ 逐渐「填满」无界区域 $D$；
- **奇点挖去**：用一个小邻域挖去奇点，再让邻域缩小到奇点。

### 13.2.2 无界区域上的二重积分

设 $D$ 是 $\mathbb{R}^2$ 中的无界区域，$f$ 在 $D$ 上可积。取一列**有界**区域 $D_n\subset D$ 满足：
$$D_1\subset D_2\subset\cdots,\qquad \bigcup_{n=1}^{\infty}D_n=D.$$
这种 $\{D_n\}$ 称为 $D$ 的一个**穷竭**（exhaustion）。

定义
$$\iint_D f\,dx\,dy=\lim_{n\to\infty}\iint_{D_n} f\,dx\,dy.$$

若该极限存在且**与穷竭 $\{D_n\}$ 的选取无关**，则称反常二重积分收敛。

> 关键点：极限必须不依赖于怎么「填满」$D$。如果换一种填法得到不同极限，那么反常积分就发散。

**为什么要求与穷竭无关？** 考虑一个反例：设 $f(x,y)=x$ 在全平面 $\mathbb{R}^2$ 上。若取 $D_n=[-n,n]\times[-n,n]$，则
$$\iint_{D_n}x\,dx\,dy=\int_{-n}^n\int_{-n}^n x\,dy\,dx=0$$
（因为对每个固定的 $y$，$x$ 关于 $x$ 是奇函数）。极限为 0。

但若取 $D_n=[-n,2n]\times[-n,n]$，则
$$\iint_{D_n}x\,dx\,dy=\int_{-n}^{2n}x\,dx\cdot\int_{-n}^n dy=\frac{(2n)^2-n^2}{2}\cdot 2n=3n^3\to+\infty.$$

两种穷竭得到不同结果，所以 $\displaystyle\iint_{\mathbb{R}^2}x\,dx\,dy$ 发散。

> 这个例子说明：即使被积函数「看起来关于原点对称」，如果它不是绝对可积的，不同穷竭方式可能给出不同极限。

**例 13.7**：$\displaystyle\iint_{\mathbb{R}^2} e^{-(x^2+y^2)}\,dx\,dy$。

取 $D_n=\{(x,y):x^2+y^2\le n^2\}$（以原点为中心、半径为 $n$ 的圆盘）。用极坐标：
$$\iint_{D_n} e^{-(x^2+y^2)}\,dx\,dy=\int_0^{2\pi}\int_0^n e^{-r^2}r\,dr\,d\theta.$$

内层积分：令 $u=r^2$，$du=2r\,dr$，则
$$\int_0^n e^{-r^2}r\,dr=\frac12\int_0^{n^2}e^{-u}\,du=\frac12(1-e^{-n^2}).$$

所以
$$\iint_{D_n}e^{-(x^2+y^2)}\,dx\,dy=\int_0^{2\pi}\frac12(1-e^{-n^2})\,d\theta=\pi(1-e^{-n^2}).$$

令 $n\to\infty$：
$$\iint_{\mathbb{R}^2}e^{-(x^2+y^2)}\,dx\,dy=\lim_{n\to\infty}\pi(1-e^{-n^2})=\pi.$$

> 因为被积函数 $e^{-(x^2+y^2)}>0$，对非负函数而言，不同穷竭方式得到的极限一定相同（单调收敛）。所以这个结果是可靠的。

### 13.2.3 无界函数的反常重积分

若 $f$ 在 $D$ 上除有限个**奇点**外有界，用挖去奇点的小邻域 $D_\varepsilon$，令
$$\iint_D f\,dx\,dy=\lim_{\varepsilon\to0}\iint_{D\setminus D_\varepsilon} f\,dx\,dy.$$

和一维情况一样，极限存在且有限时称收敛。

**二维奇点的判敛法**：在奇点 $(0,0)$ 附近，若 $|f(x,y)|\le C r^{-p}$，其中 $r=\sqrt{x^2+y^2}$，则
- $p < 2$ 时收敛；
- $p\ge 2$ 时发散。

**为什么临界值是 2？** 因为在极坐标下面积元是 $r\,dr\,d\theta$。若 $f\sim r^{-p}$，则被积函数的「有效阶」是 $r^{-p}\cdot r=r^{1-p}$。对 $r$ 从 $0$ 到某正数积分时，$\int_0 r^{1-p}\,dr$ 收敛 ⇔ $1-p>-1$ ⇔ $p < 2$。

**例 13.7'**：$\displaystyle\iint_{x^2+y^2\le 1}(x^2+y^2)^{-1/2}\,dx\,dy$。

用极坐标：$x^2+y^2=r^2$，$dx\,dy=r\,dr\,d\theta$，
$$\iint_{x^2+y^2\le 1}(x^2+y^2)^{-1/2}\,dx\,dy=\int_0^{2\pi}\int_0^1 r^{-1}\cdot r\,dr\,d\theta=\int_0^{2\pi}\int_0^1 dr\,d\theta=2\pi.$$

这里 $p=1/2 < 2$，收敛。

**例 13.7''**：$\displaystyle\iint_{x^2+y^2\le 1}(x^2+y^2)^{-1}\,dx\,dy$。

用极坐标：
$$\iint_{x^2+y^2\le 1}(x^2+y^2)^{-1}\,dx\,dy=\int_0^{2\pi}\int_0^1 r^{-2}\cdot r\,dr\,d\theta=\int_0^{2\pi}\int_0^1 \frac{1}{r}\,dr\,d\theta.$$

内层 $\displaystyle\int_0^1\frac{1}{r}\,dr$ 发散（$p=1$ 瑕点），所以整体发散。这里 $p=1$ 但有效阶是 $r^{-1}$，仍然发散。

### 13.2.4 三重积分与更高维

无界区域或奇点的定义与二重完全类似。在三维球坐标下，体积元为 $r^2\sin\theta\,dr\,d\theta\,d\varphi$。若在原点奇点附近 $f\sim r^{-p}$，则有效阶为 $r^{2-p}$，积分收敛 ⇔ $2-p>-1$ ⇔ $p < 3$。

一般地，在 $n$ 维空间中，若奇点附近 $f\sim r^{-p}$，则收敛的临界值是 $p < n$。

:::callout 与第 10 章的关系
第 10 章在**有界闭区域**上建立重积分；本章把区域扩展到全平面/全空间，或允许被积函数在个别点无界。计算时仍用 Fubini 定理与换元，但必须先验证反常积分的收敛性。

对于非负被积函数，收敛性相对简单：只要某一种合理的穷竭方式给出有限极限，积分就收敛。对于变号函数，则需要更谨慎，可能需要绝对收敛才能保证与穷竭方式无关。
:::

> [要点]
>
> - 反常重积分需说明**逼近方式**（区域穷竭或奇点挖去），极限应独立于合理选取。
> - 二维奇点：$|f|\sim r^{-p}$ 在 $r\to 0$ 时，$p < 2$ 收敛，$p\ge 2$ 发散。
> - 三维奇点：$|f|\sim r^{-p}$ 在 $r\to 0$ 时，$p < 3$ 收敛，$p\ge 3$ 发散。
> - 非负函数的反常重积分，收敛性往往更容易判断。
## 13.3 含参变量的积分

> 🔴 **考试重要度：极高** | 积分号下求导（Leibniz 法则）几乎每年一道大题
> 🟢 **本节目标**：学会处理被积函数含有额外参数 $t$ 的积分，并掌握「积分与极限/求导/积分交换次序」的条件。

### 13.3.1 什么是含参积分？

设 $f(x,t)$ 是二元函数，定义在矩形区域 $[a,b]\times[\alpha,\beta]$ 上。如果对于每个固定的 $t\in[\alpha,\beta]$，$f(x,t)$ 作为 $x$ 的函数在 $[a,b]$ 上可积，那么
$$F(t)=\int_a^b f(x,t)\,dx$$
就是定义在 $[\alpha,\beta]$ 上的函数，称为**含参变量 $t$ 的积分**。

**例子**：
- $F(t)=\displaystyle\int_0^1 x^t\,dx=\frac{1}{t+1}$（$t>-1$）；
- $F(t)=\displaystyle\int_0^{\pi/2}\frac{\sin(tx)}{x}\,dx$（$t>0$）；
- $F(\alpha)=\displaystyle\int_0^1\frac{x^\alpha-1}{\ln x}\,dx$（$\alpha>-1$）。

含参积分的重要性在于：它把「积分」这种整体运算和「关于参数变化」的局部运算联系起来。我们关心三个问题：
1. $F(t)$ 是否连续？
2. $F(t)$ 是否可导？能否在积分号下求导？
3. 对 $F(t)$ 积分时，能否交换积分次序？

### 13.3.2 连续性

**定理 13.2（连续性）**：若 $f(x,t)$ 在矩形 $[a,b]\times[\alpha,\beta]$ 上**连续**，则
$$F(t)=\int_a^b f(x,t)\,dx$$
在 $[\alpha,\beta]$ 上连续。

**直观**：如果 $f$ 连续，那么 $t$ 的微小变化只会导致被积函数整体发生微小变化，从而积分值也发生微小变化。

**详细证明**：取 $t_0\in[\alpha,\beta]$，我们要证 $\lim_{t\to t_0}F(t)=F(t_0)$，即
$$\lim_{t\to t_0}\int_a^b\big[f(x,t)-f(x,t_0)\big]\,dx=0.$$

估计：
$$|F(t)-F(t_0)|=\Big|\int_a^b\big[f(x,t)-f(x,t_0)\big]\,dx\Big|\le\int_a^b\big|f(x,t)-f(x,t_0)\big|\,dx.$$

因为 $f$ 在紧集 $[a,b]\times[\alpha,\beta]$ 上连续，所以 $f$ 在该紧集上**一致连续**。对任意 $\varepsilon>0$，存在 $\delta>0$，使得当 $|t-t_0| < \delta$ 时，对所有 $x\in[a,b]$ 都有
$$|f(x,t)-f(x,t_0)| < \frac{\varepsilon}{b-a}.$$

于是
$$|F(t)-F(t_0)|\le\int_a^b\frac{\varepsilon}{b-a}\,dx=\varepsilon.$$

因此 $F$ 在 $t_0$ 连续。由 $t_0$ 的任意性，$F$ 在 $[\alpha,\beta]$ 上连续。

> 💡 **初学提示**：一致连续是关键。在有限区间上，连续 ⇒ 一致连续，所以条件很容易满足。

**例 13.8'**：$F(t)=\displaystyle\int_0^1\frac{x^t-1}{\ln x}\,dx$（$t>-1$）。

被积函数在 $x=1$ 处有可去奇点：
$$\lim_{x\to1^-}\frac{x^t-1}{\ln x}=\lim_{x\to1^-}\frac{t x^{t-1}}{1/x}=t$$
（用 L'Hôpital 法则）。在 $x=0$ 处，$x^t/\ln x\to0$（$t>-1$）。因此在任意 $[\alpha,\beta]$（$\alpha>-1$）上，$f$ 连续，故 $F$ 连续。

事实上可以算出 $F(t)=\ln(t+1)$（见例 13.9），它在 $t>-1$ 上确实连续。

### 13.3.3 可积性与换序

**定理（Fubini 换序）**：若 $f(x,t)$ 在 $[a,b]\times[\alpha,\beta]$ 上连续，则
$$\int_\alpha^\beta F(t)\,dt=\int_\alpha^\beta\int_a^b f(x,t)\,dx\,dt=\int_a^b\int_\alpha^\beta f(x,t)\,dt\,dx.$$

**直观**：在连续函数的条件下，二重积分可以交换积分次序。这其实就是第 10 章 Fubini 定理的直接应用，因为 $f$ 在矩形区域上连续 ⇒ 可积 ⇒ 两个累次积分相等且都等于二重积分。

### 13.3.4 积分号下求导（Leibniz 法则）

**定理 13.3（Leibniz 求导法则）**：设 $f(x,t)$ 和 $f_t(x,t)=\dfrac{\partial f}{\partial t}(x,t)$ 都在 $[a,b]\times[\alpha,\beta]$ 上连续，则
$$F'(t)=\frac{d}{dt}\int_a^b f(x,t)\,dx=\int_a^b\frac{\partial f}{\partial t}(x,t)\,dx.$$

> 也就是说：在定理条件下，求导和积分可以交换次序。

**直观**：积分是对 $x$ 的「加权平均」，而求导是对 $t$ 的局部变化率。如果 $f$ 和 $f_t$ 都连续，那么这两种运算可以交换。

**详细证明**：对 $h\neq0$，考虑差商
$$\frac{F(t+h)-F(t)}{h}=\int_a^b\frac{f(x,t+h)-f(x,t)}{h}\,dx.$$

对每个固定的 $x$，由一元微分中值定理，存在 $\theta\in(0,1)$（依赖于 $x,t,h$）使得
$$\frac{f(x,t+h)-f(x,t)}{h}=f_t(x,t+\theta h).$$

所以
$$\frac{F(t+h)-F(t)}{h}=\int_a^b f_t(x,t+\theta h)\,dx.$$

令 $h\to0$，我们希望把极限移入积分号内：
$$F'(t)=\lim_{h\to0}\int_a^b f_t(x,t+\theta h)\,dx=\int_a^b\lim_{h\to0}f_t(x,t+\theta h)\,dx=\int_a^b f_t(x,t)\,dx.$$

这里交换极限与积分的合法性来自于 $f_t$ 的连续性：$f_t$ 在紧集 $[a,b]\times[\alpha,\beta]$ 上一致连续，因此 $f_t(x,t+\theta h)$ 关于 $x$ **一致地**趋于 $f_t(x,t)$。一致收敛 ⇒ 可以交换极限与积分。

> 实际上，有限区间上的连续性已经足以保证这里的交换，不需要额外的一致收敛判别法。一致收敛是下一节（无穷区间）才需要强调的。

#### 变上限情形

若积分上下限也依赖于 $t$：
$$F(t)=\int_{a(t)}^{b(t)} f(x,t)\,dx,$$
则
$$F'(t)=f(b(t),t)\,b'(t)-f(a(t),t)\,a'(t)+\int_{a(t)}^{b(t)} f_t(x,t)\,dx.$$

**三项分别是什么？**
1. $f(b(t),t)\,b'(t)$：上限移动带来的「流入」；
2. $-f(a(t),t)\,a'(t)$：下限移动带来的「流出」（负号因为方向相反）；
3. $\displaystyle\int_{a(t)}^{b(t)} f_t(x,t)\,dx$：被积函数本身随 $t$ 变化带来的贡献。

这可以看成一元微积分 Leibniz 公式的推广。

**高阶求导**：若 $f$ 关于 $t$ 的各阶偏导数 $f_t,f_{tt},\ldots$ 都连续，则可重复在积分号下求导：
$$\frac{d^nF}{dt^n}=\int_a^b \frac{\partial^n f}{\partial t^n}(x,t)\,dx.$$

### 13.3.5 例题详解

**例 13.8**：设 $F(t)=\displaystyle\int_0^{\pi/2}\frac{\sin(tx)}{x}\,dx$（$t>0$），求 $F'(t)$。

首先，被积函数 $f(x,t)=\sin(tx)/x$ 在 $x=0$ 处没有定义，但
$$\lim_{x\to0}\frac{\sin(tx)}{x}=t,$$
所以 $x=0$ 是可去奇点。补充定义 $f(0,t)=t$ 后，$f$ 在 $[0,\pi/2]\times[0,T]$ 上连续。

计算偏导数：
$$f_t(x,t)=\frac{\partial}{\partial t}\Big(\frac{\sin(tx)}{x}\Big)=\frac{x\cos(tx)}{x}=\cos(tx).$$

$f_t(x,t)=\cos(tx)$ 在 $[0,\pi/2]\times[0,T]$ 上连续。由 Leibniz 法则：
$$F'(t)=\int_0^{\pi/2}\cos(tx)\,dx=\Big[\frac{\sin(tx)}{t}\Big]_0^{\pi/2}=\frac{\sin(t\pi/2)}{t}.$$

> 注意：这里 $t=0$ 需要单独处理。$F(0)=0$，而 $\lim_{t\to0}F'(t)=\pi/2$ 存在，说明 $F$ 在 $t=0$ 可导。

**例 13.9**：计算 $\displaystyle\int_0^1\frac{x^b-x^a}{\ln x}\,dx$（$b>a>-1$）。

这道题的被积函数直接积分很困难，但含参积分技巧可以巧妙解决。

**关键观察**：注意到
$$\frac{x^b-x^a}{\ln x}=\int_a^b x^t\,dt.$$

为什么？因为对固定的 $x\in(0,1)$，
$$\int_a^b x^t\,dt=\int_a^b e^{t\ln x}\,dt=\Big[\frac{e^{t\ln x}}{\ln x}\Big]_a^b=\frac{x^b-x^a}{\ln x}.$$

所以原积分可以写成
$$\int_0^1\frac{x^b-x^a}{\ln x}\,dx=\int_0^1\int_a^b x^t\,dt\,dx.$$

由 Fubini 定理交换积分次序：
$$=\int_a^b\int_0^1 x^t\,dx\,dt=\int_a^b\frac{1}{t+1}\,dt=\big[\ln(t+1)\big]_a^b=\ln\frac{b+1}{a+1}.$$

> 这个例子展示了含参积分的强大：通过引入一个辅助参数 $t$，把复杂的被积函数表示为某个更简单函数的积分，然后交换次序。

**严格性说明**：用 Fubini 换序需要 $f(x,t)=x^t$ 在 $[0,1]\times[a,b]$ 上连续。在 $x=0$ 处，$x^t\to0$（$t>0$）或 $x^t\to1$（$t=0$）；在 $x=1$ 处，$x^t=1$。因此只要 $a\ge0$，连续性没问题。对于 $-1 < a < 0$，$x^t$ 在 $(0,1]\times[a,b]$ 上连续但在 $x=0$ 处无界，需要更细致处理；不过结论仍然成立。

**例 13.9'**：设 $F(a)=\displaystyle\int_0^{\pi/2}\frac{dx}{\cos x+a\sin x}$（$a>0$），求 $F'(a)$。

被积函数 $f(x,a)=\dfrac{1}{\cos x+a\sin x}$。因为 $a>0$，分母 $\cos x+a\sin x$ 在 $[0,\pi/2]$ 上恒正（最小值在端点处为 $\min(1,a)>0$），所以 $f$ 连续。

计算偏导数：
$$f_a(x,a)=\frac{\partial}{\partial a}\Big(\frac{1}{\cos x+a\sin x}\Big)=-\frac{\sin x}{(\cos x+a\sin x)^2}.$$

$f_a$ 在 $[0,\pi/2]\times[\alpha,\beta]$（$\alpha>0$）上连续。由 Leibniz 法则：
$$F'(a)=\int_0^{\pi/2}\frac{-\sin x}{(\cos x+a\sin x)^2}\,dx.$$

这个积分可以进一步计算（例如令 $u=\cos x+a\sin x$），但这里只要求到 $F'(a)$ 即可。

:::callout 何时不能求导
若 $f_t$ 不连续，或积分限、瑕点位置依赖 $t$，Leibniz 公式需修正或失效。例如 $F(t)=\displaystyle\int_0^t f(x,t)\,dx$ 的求导含 $f(t,t)$ 的边界项，不能 naive 地在积分号内求偏导。

另一个常见陷阱：被积函数在积分区间内有瑕点，且瑕点位置随 $t$ 移动。这种情况下即使 $f_t$ 存在，也未必能在积分号下求导。
:::

> [要点]
>
> - 有限区间 + $f,f_t$ 连续 ⇒ **可在积分号下求导**。
> - 连续性定理保证含参积分是参数的连续函数。
> - Fubini 定理保证连续函数在矩形上的累次积分可换序。
> - 变限积分用 Leibniz 公式：端点贡献 + 被积函数对参数的偏导。
## 13.4 含参变量的反常积分

> 🔴 **考试重要度：极高** | 一致收敛判别 + 积分下求导，年年必考大题（10-15 分）
> 🟢 **本节目标**：掌握无穷区间上含参积分的理论，理解一致收敛为什么是「交换运算次序」的钥匙。

### 13.4.1 从逐点收敛到一致收敛

设 $f(x,t)$ 在 $[a,+\infty)\times[\alpha,\beta]$ 上定义，对每个固定的 $t$，考虑反常积分
$$F(t)=\int_a^{+\infty} f(x,t)\,dx.$$

如果对于每个固定的 $t$，这个积分都收敛，我们称它**逐点收敛**（pointwise convergent）。但这还不够：我们还需要 $A\to+\infty$ 时，尾项
$$\int_A^{+\infty} f(x,t)\,dx$$
趋于 0 的速度**不依赖于 $t$**。

**一致收敛的定义**：$\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ **一致收敛**，如果对任意 $\varepsilon>0$，存在 $A_0\ge a$（**只依赖 $\varepsilon$，不依赖 $t$**），使得当 $A>A_0$ 时，对所有 $t\in[\alpha,\beta]$ 都有
$$\Big|\int_A^{+\infty} f(x,t)\,dx\Big| < \varepsilon.$$

> 核心差别：逐点收敛说「对每个 $t$，尾项最终会小」；一致收敛说「尾项小的速度对所有 $t$ 一样快」。

**类比**：这和函数项级数的一致收敛完全类似。函数项级数 $\sum f_n(x)$ 一致收敛要求部分和与极限函数的差一致小；含参反常积分一致收敛要求截断积分与完整积分的差一致小。

**Cauchy 准则（一致收敛版）**：$\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ 一致收敛 ⇔ 对任意 $\varepsilon>0$，存在 $A_0$，使得当 $A',A''>A_0$ 时，对所有 $t\in[\alpha,\beta]$ 都有
$$\Big|\int_{A'}^{A''} f(x,t)\,dx\Big| < \varepsilon.$$

### 13.4.2 Weierstrass M-判别法

**定理（M-判别法）**：若 $|f(x,t)|\le g(x)$ 对所有 $x\ge a$ 和 $t\in[\alpha,\beta]$ 成立，且 $\displaystyle\int_a^{+\infty} g(x)\,dx$ 收敛，则 $\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ **一致收敛**（且绝对一致收敛）。

**证明**：由 $\displaystyle\int_a^{+\infty}g\,dx$ 收敛，对任意 $\varepsilon>0$，存在 $A_0$ 使 $A',A''>A_0$ 时
$$\int_{A'}^{A''}g(x)\,dx < \varepsilon.$$

于是对所有 $t\in[\alpha,\beta]$，
$$\Big|\int_{A'}^{A''}f(x,t)\,dx\Big|\le\int_{A'}^{A''}|f(x,t)|\,dx\le\int_{A'}^{A''}g(x)\,dx < \varepsilon.$$

由 Cauchy 准则，一致收敛。

> M-判别法是最常用的一致收敛判别法。它的思想是：找一个与 $t$ 无关的「控制函数」$g(x)$，只要 $g$ 的积分收敛，那么 $f$ 就一致收敛。

**例 13.10**：$\displaystyle\int_0^{+\infty}e^{-tx}\,dx=\frac1t$（$t>0$）。

对 $t\in[\delta,+\infty)$（$\delta>0$），有
$$|e^{-tx}|=e^{-tx}\le e^{-\delta x}.$$
而 $\displaystyle\int_0^{+\infty}e^{-\delta x}\,dx=1/\delta$ 收敛。由 M-判别法，$\displaystyle\int_0^{+\infty}e^{-tx}\,dx$ 在 $[\delta,+\infty)$ 上一致收敛。

但在 $(0,+\infty)$ 上**不一致收敛**。证明：取 $\varepsilon=1/2$。对任意 $A>0$，取 $t=1/A$，则
$$\int_A^{+\infty}e^{-x/A}\,dx=A\int_1^{+\infty}e^{-u}\,du=Ae^{-1}>\frac12$$
（当 $A$ 足够大时）。这说明不存在与 $t$ 无关的 $A_0$ 使尾项一致小。

> 这个例子很关键：同样的被积函数，参数范围不同，一致收敛性可能完全不同。

### 13.4.3 Dirichlet 判别法与 Abel 判别法

当被积函数可以写成两个函数的乘积 $g(x,t)h(x,t)$，且其中一个有界、另一个单调趋于 0 时，可以用 Dirichlet 判别法。

**Dirichlet 判别法（含参）**：若
1. $\displaystyle\Big|\int_a^A g(x,t)\,dx\Big|\le M$ 对所有 $A\ge a$ 和 $t\in[\alpha,\beta]$ 一致有界；
2. $h(x,t)$ 关于 $x$ 单调；
3. $\displaystyle\lim_{x\to+\infty}h(x,t)=0$ 对 $t\in[\alpha,\beta]$ **一致**（即对任意 $\varepsilon>0$，存在 $X$ 使 $x>X$ 时 $|h(x,t)| < \varepsilon$ 对所有 $t$ 成立），

则 $\displaystyle\int_a^{+\infty}g(x,t)h(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ 一致收敛。

**证明思路**：用积分第二中值定理。对 $A''>A'>a$，存在 $\xi\in[A',A'']$ 使得
$$\int_{A'}^{A''}g(x,t)h(x,t)\,dx=h(A',t)\int_{A'}^{\xi}g(x,t)\,dx+h(A'',t)\int_{\xi}^{A''}g(x,t)\,dx.$$

由条件 1，两个积分都有界（绝对值 $\le 2M$）；由条件 3，当 $A',A''$ 充分大时 $|h(A',t)|,|h(A'',t)|$ 一致小。因此整个表达式一致小，满足 Cauchy 准则。

> 实际使用时，$g$ 通常是 $\sin x$、$\cos x$ 或有界振荡函数；$h$ 通常是单调趋于 0 的函数如 $1/x^p$（$p>0$）。

**例 13.10'**：$\displaystyle\int_1^{+\infty}\frac{\sin x}{x}\,dx$（不含参数，但可用 Dirichlet 思想）。

令 $g(x)=\sin x$，$h(x)=1/x$。则
$$\Big|\int_1^A\sin x\,dx\Big|=|\cos 1-\cos A|\le 2$$
一致有界；$h(x)=1/x$ 单调递减趋于 0。由 Dirichlet 判别法，积分收敛。

**Abel 判别法（含参）**：若
1. $\displaystyle\int_a^{+\infty}g(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ 一致收敛；
2. $h(x,t)$ 关于 $x$ 单调；
3. $h(x,t)$ 对 $x,t$ **一致有界**（即 $|h(x,t)|\le M$ 对所有 $x,t$ 成立），

则 $\displaystyle\int_a^{+\infty}g(x,t)h(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ 一致收敛。

**证明思路**：同样用积分第二中值定理。因为 $\int g$ 一致收敛，任意尾项一致小；$h$ 一致有界，所以乘积的尾项也一致小。

> Dirichlet 和 Abel 的关系：Dirichlet 是「$g$ 有界，$h$ 单调趋于 0」；Abel 是「$g$ 一致收敛，$h$ 单调有界」。两者都是用积分第二中值定理，只是条件的侧重点不同。

### 13.4.4 一致收敛下的性质

**定理 13.4**：设 $f(x,t)$ 在 $[a,+\infty)\times[\alpha,\beta]$ 上连续，且 $\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 关于 $t\in[\alpha,\beta]$ 一致收敛，则
1. $F(t)=\displaystyle\int_a^{+\infty} f(x,t)\,dx$ 在 $[\alpha,\beta]$ 上**连续**；
2. 若 $\displaystyle\int_a^{+\infty} f_t(x,t)\,dx$ 关于 $t$ 一致收敛，则
   $$F'(t)=\int_a^{+\infty} f_t(x,t)\,dx;$$
3. 对任意 $[\alpha,\beta]$ 上的可积 $\varphi(t)$，可交换积分次序：
   $$\int_\alpha^\beta F(t)\,dt=\int_a^{+\infty}\int_\alpha^\beta f(x,t)\,dt\,dx.$$

**连续性证明思路**：对 $t,t_0\in[\alpha,\beta]$，
$$|F(t)-F(t_0)|\le\int_a^A|f(x,t)-f(x,t_0)|\,dx+\Big|\int_A^{+\infty}f(x,t)\,dx\Big|+\Big|\int_A^{+\infty}f(x,t_0)\,dx\Big|.$$

给定 $\varepsilon>0$：
- 由一致收敛，取 $A$ 充分大使后两项都 $< \varepsilon/3$；
- 对固定的 $A$，$f$ 在紧集 $[a,A]\times[\alpha,\beta]$ 上一致连续，所以存在 $\delta>0$ 使 $|t-t_0| < \delta$ 时首项 $< \varepsilon/3$。

因此 $|F(t)-F(t_0)| < \varepsilon$，$F$ 连续。

**求导证明思路**：和有限区间类似，写出差商
$$\frac{F(t+h)-F(t)}{h}=\int_a^{+\infty}\frac{f(x,t+h)-f(x,t)}{h}\,dx.$$

对每个 $A$，有限区间部分可以用中值定理；无穷尾项由 $\displaystyle\int_a^{+\infty}f_t\,dx$ 的一致收敛控制。令 $h\to0$ 即得结论。

> 这些定理的核心信息：一致收敛是把「积分」和「极限/求导/积分」交换的通行证。没有一致收敛，这些交换可能不合法。

**反例（无一致收敛）**：$f_n(x)=x^n$ 在 $[0,1]$ 上逐点趋于 $f(x)=\mathbf{1}_{\{1\}}(x)$，极限不连续。含参版：$F(t)=\displaystyle\int_0^{+\infty}e^{-tx}\,dx=1/t$ 在 $(0,+\infty)$ 上每点收敛，但在 $t=0$ 处积分发散；若限定在 $[\delta,\infty)$（$\delta>0$）上则一致收敛，$F$ 连续。

### 13.4.5 几个重要的积分

#### 例 13.11：Dirichlet 积分

$$\int_0^{+\infty}\frac{\sin x}{x}\,dx=\frac{\pi}{2}.$$

**证明**：考虑含参积分
$$F(t)=\int_0^{+\infty}\frac{\sin(tx)}{x}\,dx\qquad(t>0).$$

形式地对 $t$ 求导：
$$F'(t)=\int_0^{+\infty}\cos(tx)\,dx.$$
但这个积分在常义下不收敛，不能直接算。我们引入**Laplace 阻尼因子** $e^{-\varepsilon x}$：
$$F_\varepsilon(t)=\int_0^{+\infty}e^{-\varepsilon x}\frac{\sin(tx)}{x}\,dx.$$

先验证可以求导。被积函数 $f_\varepsilon(x,t)=e^{-\varepsilon x}\sin(tx)/x$，其偏导数
$$\frac{\partial f_\varepsilon}{\partial t}=e^{-\varepsilon x}\cos(tx)$$
满足 $|e^{-\varepsilon x}\cos(tx)|\le e^{-\varepsilon x}$，而 $\displaystyle\int_0^{+\infty}e^{-\varepsilon x}\,dx=1/\varepsilon$ 收敛。由 M-判别法，$\displaystyle\int_0^{+\infty}\frac{\partial f_\varepsilon}{\partial t}\,dx$ 关于 $t$ 在任何有界区间上一致收敛。因此
$$F_\varepsilon'(t)=\int_0^{+\infty}e^{-\varepsilon x}\cos(tx)\,dx.$$

计算这个积分：
$$\int_0^{+\infty}e^{-\varepsilon x}\cos(tx)\,dx=\frac{\varepsilon}{\varepsilon^2+t^2}.$$
（可用分部积分两次，或利用 $\cos(tx)=\operatorname{Re}(e^{itx})$。）

所以
$$F_\varepsilon'(t)=\frac{\varepsilon}{\varepsilon^2+t^2}.$$

积分得
$$F_\varepsilon(t)=\int\frac{\varepsilon}{\varepsilon^2+t^2}\,dt=\arctan\frac{t}{\varepsilon}+C.$$

由 $F_\varepsilon(0)=0$ 知 $C=0$，所以 $F_\varepsilon(t)=\arctan(t/\varepsilon)$。

现在令 $\varepsilon\to0^+$：
- 当 $t>0$ 时，$\arctan(t/\varepsilon)\to\pi/2$；
- 当 $t=0$ 时，$F_\varepsilon(0)=0$。

还需要验证 $\lim_{\varepsilon\to0^+}F_\varepsilon(t)=F(t)$。因为
$$|F_\varepsilon(t)-F(t)|=\Big|\int_0^{+\infty}(e^{-\varepsilon x}-1)\frac{\sin(tx)}{x}\,dx\Big|,$$
而 $e^{-\varepsilon x}\to1$ 对 $x$ 在每个有限区间上一致，且 $(1-e^{-\varepsilon x})/x$ 可控，可以证明极限交换合法。

因此 $F(t)=\pi/2$（$t>0$）。特别地，$F(1)=\displaystyle\int_0^{+\infty}\frac{\sin x}{x}\,dx=\frac{\pi}{2}$。

> 这个证明展示了处理含参反常积分的标准技巧：当直接求导不收敛时，加入收敛因子（如 $e^{-\varepsilon x}$）使积分良好，算出结果后再令 $\varepsilon\to0$。

#### 例 13.12：Gauss 积分

$$\int_{-\infty}^{+\infty}e^{-x^2}\,dx=\sqrt{\pi}.$$

**证明**：记 $I=\displaystyle\int_{-\infty}^{+\infty}e^{-x^2}\,dx$。考虑 $I^2$：
$$I^2=\int_{-\infty}^{+\infty}e^{-x^2}\,dx\cdot\int_{-\infty}^{+\infty}e^{-y^2}\,dy=\int_{-\infty}^{+\infty}\int_{-\infty}^{+\infty}e^{-(x^2+y^2)}\,dx\,dy.$$

这是反常二重积分。取 $D_n=\{(x,y):x^2+y^2\le n^2\}$，用极坐标：
$$\iint_{D_n}e^{-(x^2+y^2)}\,dx\,dy=\int_0^{2\pi}\int_0^n e^{-r^2}r\,dr\,d\theta=\pi(1-e^{-n^2})\to\pi.$$

所以 $I^2=\pi$，$I=\sqrt{\pi}$（取正根，因为被积函数恒正）。

> 这是数学中最漂亮的计算之一。关键技巧是把一维积分平方变成二维积分，再用极坐标。

#### 例 13.12'：Gauss 积分的含参形式

$$I(t)=\int_{-\infty}^{+\infty}e^{-tx^2}\,dx=\sqrt{\frac{\pi}{t}}\qquad(t>0).$$

对 $t$ 求导：
$$I'(t)=\int_{-\infty}^{+\infty}(-x^2)e^{-tx^2}\,dx=-\frac{d}{dt}\sqrt{\frac{\pi}{t}}=\frac{1}{2}\sqrt{\frac{\pi}{t^3}}.$$

所以
$$\int_{-\infty}^{+\infty}x^2e^{-tx^2}\,dx=\frac{1}{2}\sqrt{\frac{\pi}{t^3}}.$$

> 这个技巧在概率论中计算正态分布的方差时非常有用。

#### 例 13.13：Laplace 型积分

$$\int_0^{+\infty}\frac{\cos(ax)}{1+x^2}\,dx=\frac{\pi}{2}e^{-|a|}\qquad(a\in\mathbb{R}).$$

**思路**：设 $I(a)=\displaystyle\int_0^{+\infty}\frac{\cos(ax)}{1+x^2}\,dx$。对 $a$ 求导：
$$I'(a)=\int_0^{+\infty}\frac{-x\sin(ax)}{1+x^2}\,dx.$$

这个积分直接算较麻烦。更有效的方法是考虑复指数：设
$$J(a)=\int_0^{+\infty}\frac{e^{iax}}{1+x^2}\,dx,$$
则 $I(a)=\operatorname{Re}J(a)$。利用复变函数中的 residue 定理或已知的 Fourier 变换表可得 $J(a)=\pi e^{-|a|}/2$（$a>0$），从而 $I(a)=\pi e^{-a}/2$。

**收敛性**：$|\cos(ax)/(1+x^2)|\le1/(1+x^2)$，而 $\displaystyle\int_0^{+\infty}\frac{1}{1+x^2}\,dx=\frac{\pi}{2}$ 收敛，由 M-判别法，$I(a)$ 关于 $a$ 在任何紧集上一致收敛，求导合法。

> 考试通常不要求你现场推出这个公式的值，但要会判断收敛性和求导合法性。

:::callout 一致收敛是核心
含参反常积分「能不能换序、能不能求导」，关键不在点态收敛，而在**一致收敛**（或被控制的收敛）。没有一致收敛，极限函数可能不连续，求导可能错——这是分析里最常见的陷阱之一。
:::

> [要点]
>
> - **M-判别法**：找与 $t$ 无关的可积控制函数 $g(x)$。
> - **Dirichlet 判别法**：$g$ 的积分一致有界 + $h$ 单调一致趋于 0。
> - **Abel 判别法**：$g$ 一致收敛 + $h$ 单调一致有界。
> - 一致收敛 ⇒ 连续性、逐项求导、换序积分。
> - **Dirichlet 积分** $\int_0^{+\infty}\sin x/x\,dx=\pi/2$，**Gauss 积分** $\int_{-\infty}^{+\infty}e^{-x^2}\,dx=\sqrt\pi$ 应熟记。
## 13.5 $\Gamma$ 函数与 $B$ 函数

> 🔴 **考试重要度：极高** | Γ/B 函数作为速算工具年年出现，余元公式也常考
> 🟢 **本节目标**：把 $\Gamma$ 和 $B$ 函数当作「积分速查表」来掌握，学会识别哪些积分可以化到它们身上。

### 13.5.1 $\Gamma$ 函数的定义与收敛性

**定义**：对 $s>0$，定义
$$\Gamma(s)=\int_0^{+\infty}x^{s-1}e^{-x}\,dx.$$

这是一个**含参反常积分**，参数是 $s$。我们要先验证它确实收敛。

**收敛性分析**：把积分拆成两段：
$$\Gamma(s)=\int_0^1 x^{s-1}e^{-x}\,dx+\int_1^{+\infty}x^{s-1}e^{-x}\,dx.$$

- **在 $x=0$ 附近**：$e^{-x}\sim1$，所以被积函数 $\sim x^{s-1}$。这是 $p=1-s$ 的瑕点 $p$-积分，收敛 ⇔ $1-s < 1$ ⇔ $s>0$。
- **在 $x=+\infty$ 附近**：指数衰减 $e^{-x}$ 比任何幂函数 $x^{s-1}$ 都快。具体地，对任意 $s$，存在 $M$ 使 $x^{s-1}e^{-x}\le e^{-x/2}$ 当 $x>M$ 时成立（因为指数衰减压倒幂增长）。而 $\displaystyle\int_M^{+\infty}e^{-x/2}\,dx$ 收敛，所以这一段收敛。

因此 $\Gamma(s)$ 对 $s>0$ 定义良好。

> $\Gamma$ 函数之所以重要，是因为它把「阶乘」推广到了正实数。我们马上会看到 $\Gamma(n+1)=n!$。

### 13.5.2 $\Gamma$ 函数的基本性质

**性质 1：递推公式**
$$\Gamma(s+1)=s\,\Gamma(s)\qquad(s>0).$$

**证明**：用分部积分。
$$\Gamma(s+1)=\int_0^{+\infty}x^s e^{-x}\,dx.$$

令 $u=x^s$，$dv=e^{-x}\,dx$，则 $du=sx^{s-1}\,dx$，$v=-e^{-x}$。于是
$$\Gamma(s+1)=\Big[-x^s e^{-x}\Big]_0^{+\infty}+s\int_0^{+\infty}x^{s-1}e^{-x}\,dx.$$

边界项：
- 在 $x=+\infty$ 处，$x^s e^{-x}\to0$（指数衰减）；
- 在 $x=0$ 处，$x^s e^{-x}\to0$（因为 $s>0$）。

所以边界项为 0，得到
$$\Gamma(s+1)=s\int_0^{+\infty}x^{s-1}e^{-x}\,dx=s\,\Gamma(s).$$

**性质 2：阶乘推广**
$$\Gamma(n+1)=n!\qquad(n=0,1,2,\ldots).$$

**证明**：由递推公式，
$$\Gamma(n+1)=n\,\Gamma(n)=n(n-1)\,\Gamma(n-1)=\cdots=n(n-1)\cdots1\cdot\Gamma(1).$$

而
$$\Gamma(1)=\int_0^{+\infty}e^{-x}\,dx=1.$$

所以 $\Gamma(n+1)=n!$。

> 这就是为什么 $\Gamma$ 函数被称为「连续变量的阶乘」。

**性质 3：对数凸性（补充）**

$\ln\Gamma(s)$ 在 $s>0$ 上是凸函数。这个性质加上 Bohr–Mollerup 定理可以唯一刻画 $\Gamma$ 函数：它是满足 $f(1)=1$、$f(s+1)=sf(s)$、$\ln f$ 凸的唯一正函数。不过本课程通常只需要会用公式即可。

### 13.5.3 重要特殊值

**$\Gamma(1/2)=\sqrt{\pi}$ 的推导**：在 $\Gamma(1/2)$ 的积分中令 $x=t^2$，则 $dx=2t\,dt$，$x^{-1/2}=t^{-1}$。当 $x=0$ 时 $t=0$，$x\to+\infty$ 时 $t\to+\infty$。于是
$$\Gamma(1/2)=\int_0^{+\infty}x^{-1/2}e^{-x}\,dx=\int_0^{+\infty}t^{-1}e^{-t^2}\cdot2t\,dt=2\int_0^{+\infty}e^{-t^2}\,dt.$$

而由 Gauss 积分，$\displaystyle\int_{-\infty}^{+\infty}e^{-t^2}\,dt=\sqrt{\pi}$，且 $e^{-t^2}$ 是偶函数，所以
$$\int_0^{+\infty}e^{-t^2}\,dt=\frac{\sqrt{\pi}}{2}.$$

因此
$$\Gamma(1/2)=2\cdot\frac{\sqrt{\pi}}{2}=\sqrt{\pi}.$$

> 这个值极其重要，很多概率积分都要用到它。

**例 13.14**：
- $\Gamma(3/2)=\frac12\Gamma(1/2)=\frac{\sqrt{\pi}}{2}$；
- $\Gamma(5/2)=\frac32\Gamma(3/2)=\frac32\cdot\frac{\sqrt{\pi}}{2}=\frac{3\sqrt{\pi}}{4}$；
- $\Gamma(7/2)=\frac52\Gamma(5/2)=\frac52\cdot\frac{3\sqrt{\pi}}{4}=\frac{15\sqrt{\pi}}{8}$。

一般地，对正整数 $n$，
$$\Gamma\Big(n+\frac12\Big)=\frac{(2n-1)!!}{2^n}\sqrt{\pi}.$$

**例 13.14'**：$\displaystyle\int_0^{+\infty}x^{2n}e^{-x^2}\,dx$。

令 $t=x^2$，则 $x=t^{1/2}$，$dx=\frac12t^{-1/2}\,dt$：
$$\int_0^{+\infty}x^{2n}e^{-x^2}\,dx=\int_0^{+\infty}t^n e^{-t}\cdot\frac12t^{-1/2}\,dt=\frac12\int_0^{+\infty}t^{n-1/2}e^{-t}\,dt=\frac12\Gamma\Big(n+\frac12\Big).$$

例如 $n=1$ 时：
$$\int_0^{+\infty}x^2e^{-x^2}\,dx=\frac12\Gamma(3/2)=\frac{\sqrt{\pi}}{4}.$$

### 13.5.4 余元公式

$\Gamma$ 函数可以**解析延拓**到复平面上除 $s=0,-1,-2,\ldots$ 外的所有点。这些负整数点是**单极点**。一个重要的恒等式是**余元公式**（Euler reflection formula）：
$$\Gamma(s)\,\Gamma(1-s)=\frac{\pi}{\sin(\pi s)},\qquad s\notin\mathbb{Z}.$$

**由余元公式得到的一些值**：
- 取 $s=1/2$：$\Gamma(1/2)\Gamma(1/2)=\pi/\sin(\pi/2)=\pi$，所以 $\Gamma(1/2)=\sqrt{\pi}$（再次验证）。
- 取 $s=1/4$：$\Gamma(1/4)\Gamma(3/4)=\pi/\sin(\pi/4)=\pi\sqrt2$。
- 取 $s=-1/2$：需要先解析延拓。由递推公式 $\Gamma(s+1)=s\Gamma(s)$ 得 $\Gamma(-1/2)=\Gamma(1/2)/(-1/2)=-2\sqrt{\pi}$。

> 余元公式的严格证明需要复分析（如 residue 定理或 Weierstrass 乘积公式）。本课程把它作为重要结论记住即可。

**Stirling 公式（补充）**：当 $n\to\infty$ 时，
$$\Gamma(n+1)\sim\sqrt{2\pi n}\,\Big(\frac{n}{e}\Big)^n,$$
即 $n!\sim\sqrt{2\pi n}\,(n/e)^n$。这是连接阶乘与渐近分析的桥梁，在概率论和大偏差理论中非常重要。

### 13.5.5 $B$ 函数的定义与收敛性

**定义**：对 $p,q>0$，定义
$$B(p,q)=\int_0^1 x^{p-1}(1-x)^{q-1}\,dx.$$

**收敛性分析**：把积分拆成 $(0,1/2)$ 和 $(1/2,1)$ 两段。

- 在 $x=0$ 附近：被积函数 $\sim x^{p-1}$，收敛 ⇔ $p-1>-1$ ⇔ $p>0$；
- 在 $x=1$ 附近：令 $u=1-x$，被积函数 $\sim u^{q-1}$，收敛 ⇔ $q>0$。

因此 $B(p,q)$ 对 $p,q>0$ 定义良好。

### 13.5.6 $B$ 函数与 $\Gamma$ 函数的关系

**定理**：
$$\boxed{B(p,q)=\frac{\Gamma(p)\,\Gamma(q)}{\Gamma(p+q)}}.$$

**详细证明**：从 $\Gamma(p)\Gamma(q)$ 出发：
$$\Gamma(p)\Gamma(q)=\int_0^{+\infty}x^{p-1}e^{-x}\,dx\cdot\int_0^{+\infty}y^{q-1}e^{-y}\,dy=\int_0^{+\infty}\int_0^{+\infty}x^{p-1}y^{q-1}e^{-(x+y)}\,dx\,dy.$$

做换元：令 $x+y=u$（$u>0$），$x=vu$（$0 < v < 1$），则 $y=u-x=u(1-v)$。Jacobian 行列式：
$$\frac{\partial(x,y)}{\partial(u,v)}=\begin{vmatrix}v&u\\1-v&-u\end{vmatrix}=-vu-u(1-v)=-u.$$
所以 $|J|=u$。

于是
$$x^{p-1}y^{q-1}e^{-(x+y)}\,dx\,dy=(vu)^{p-1}\big(u(1-v)\big)^{q-1}e^{-u}\cdot u\,du\,dv$$
$$=v^{p-1}(1-v)^{q-1}u^{p+q-1}e^{-u}\,du\,dv.$$

代回积分：
$$\Gamma(p)\Gamma(q)=\int_0^{+\infty}u^{p+q-1}e^{-u}\,du\cdot\int_0^1 v^{p-1}(1-v)^{q-1}\,dv=\Gamma(p+q)\,B(p,q).$$

因此
$$B(p,q)=\frac{\Gamma(p)\Gamma(q)}{\Gamma(p+q)}.$$

> 这个关系是 $\Gamma$ 和 $B$ 函数之间最重要的公式。它把 $[0,1]$ 上的积分和 $[0,+\infty)$ 上的积分联系起来。

### 13.5.7 $B$ 函数的性质

**对称性**：
$$B(p,q)=B(q,p).$$

**证明**：令 $x=1-u$，则
$$B(p,q)=\int_0^1 x^{p-1}(1-x)^{q-1}\,dx=\int_0^1 (1-u)^{p-1}u^{q-1}\,du=B(q,p).$$

**三角形式**：令 $x=\sin^2\theta$，则 $dx=2\sin\theta\cos\theta\,d\theta$，当 $x=0$ 时 $\theta=0$，$x=1$ 时 $\theta=\pi/2$。于是
$$B(p,q)=\int_0^{\pi/2}(\sin^2\theta)^{p-1}(\cos^2\theta)^{q-1}\cdot2\sin\theta\cos\theta\,d\theta$$
$$=2\int_0^{\pi/2}\sin^{2p-1}\theta\,\cos^{2q-1}\,d\theta.$$

这个形式在计算 Wallis 型积分时非常有用。

**递推公式**：对 $q>1$，
$$B(p,q)=\frac{q-1}{p+q-1}B(p,q-1).$$

**证明**：分部积分。令 $u=(1-x)^{q-1}$，$dv=x^{p-1}\,dx$，则 $du=-(q-1)(1-x)^{q-2}\,dx$，$v=x^p/p$。于是
$$B(p,q)=\Big[\frac{x^p(1-x)^{q-1}}{p}\Big]_0^1+\frac{q-1}{p}\int_0^1 x^p(1-x)^{q-2}\,dx.$$

边界项为 0（因为 $p,q>0$），所以
$$B(p,q)=\frac{q-1}{p}\int_0^1 x^p(1-x)^{q-2}\,dx=\frac{q-1}{p}\int_0^1 x^{(p+1)-1}(1-x)^{(q-1)-1}\,dx$$
$$=\frac{q-1}{p}B(p+1,q-1).$$

再利用 $B(p+1,q-1)=\dfrac{p}{p+q-1}B(p,q-1)$（由 $B$ 与 $\Gamma$ 的关系），即得递推公式。

### 13.5.8 例题详解

**例 13.15**：$B(1/2,1/2)$。

由 $B$ 与 $\Gamma$ 的关系：
$$B(1/2,1/2)=\frac{\Gamma(1/2)\Gamma(1/2)}{\Gamma(1)}=\frac{\sqrt{\pi}\cdot\sqrt{\pi}}{1}=\pi.$$

三角形式验证：
$$B(1/2,1/2)=2\int_0^{\pi/2}\sin^0\theta\,\cos^0\theta\,d\theta=2\int_0^{\pi/2}d\theta=\pi.$$

直接积分验证：
$$B(1/2,1/2)=\int_0^1\frac{dx}{\sqrt{x(1-x)}}.$$
令 $x=\sin^2\theta$，得
$$=\int_0^{\pi/2}\frac{2\sin\theta\cos\theta}{\sin\theta\cos\theta}\,d\theta=2\cdot\frac{\pi}{2}=\pi.$$

**例 13.16**：概率论中的 Beta 分布 $X\sim\mathrm{Beta}(\alpha,\beta)$，其密度函数为
$$f(x)=\frac{1}{B(\alpha,\beta)}x^{\alpha-1}(1-x)^{\beta-1},\qquad 0 < x < 1.$$
归一化常数：
$$\int_0^1 x^{\alpha-1}(1-x)^{\beta-1}\,dx=B(\alpha,\beta)=\frac{\Gamma(\alpha)\Gamma(\beta)}{\Gamma(\alpha+\beta)}.$$

**例 13.16'**：$B(2,3)$。

由关系式：
$$B(2,3)=\frac{\Gamma(2)\Gamma(3)}{\Gamma(5)}=\frac{1!\cdot2!}{4!}=\frac{2}{24}=\frac{1}{12}.$$

直接积分验证：
$$B(2,3)=\int_0^1 x(1-x)^2\,dx=\int_0^1(x-2x^2+x^3)\,dx=\Big[\frac{x^2}{2}-\frac{2x^3}{3}+\frac{x^4}{4}\Big]_0^1$$
$$=\frac12-\frac23+\frac14=\frac{6-8+3}{12}=\frac{1}{12}.$$

**例 13.16''**：计算 $\displaystyle\int_0^{+\infty}\frac{x^{\alpha-1}}{1+x}\,dx$（$0 < \alpha < 1$）。

令 $t=\frac{x}{1+x}$，则 $x=\frac{t}{1-t}$，$dx=\frac{1}{(1-t)^2}\,dt$。当 $x=0$ 时 $t=0$，$x\to+\infty$ 时 $t\to1^-$。于是
$$\int_0^{+\infty}\frac{x^{\alpha-1}}{1+x}\,dx=\int_0^1\Big(\frac{t}{1-t}\Big)^{\alpha-1}\cdot(1-t)\cdot\frac{1}{(1-t)^2}\,dt$$
$$=\int_0^1 t^{\alpha-1}(1-t)^{-\alpha}\,dt=B(\alpha,1-\alpha).$$

由余元公式：
$$B(\alpha,1-\alpha)=\frac{\Gamma(\alpha)\Gamma(1-\alpha)}{\Gamma(1)}=\frac{\pi}{\sin(\pi\alpha)}.$$

所以
$$\int_0^{+\infty}\frac{x^{\alpha-1}}{1+x}\,dx=\frac{\pi}{\sin(\pi\alpha)}.$$

> 这是一个非常经典的结果，经常用来把有理函数积分化为 $B$ 函数。

:::callout $\Gamma$ 与 $B$ 的使用场景
- **$\Gamma$ 函数**：遇到 $\displaystyle\int_0^{+\infty}x^{s-1}e^{-x}\,dx$ 或其变形（如 $x^{2n}e^{-x^2}$、$x^{s-1}e^{-ax}$ 等），都可以尝试化为 $\Gamma$。
- **$B$ 函数**：遇到 $\displaystyle\int_0^1x^{p-1}(1-x)^{q-1}\,dx$ 或其变形（如 $\displaystyle\int_0^{+\infty}\frac{x^{p-1}}{(1+x)^{p+q}}\,dx$），都可以尝试化为 $B$。
- **概率**：Gamma 分布、Beta 分布、$\chi^2$ 分布的归一化常数。
- **组合**：$\displaystyle\binom{n}{k}=\frac{\Gamma(n+1)}{\Gamma(k+1)\Gamma(n-k+1)}$（$n,k\in\mathbb{N}$）。
:::

> [要点]
>
> - $\Gamma(s)=\displaystyle\int_0^{+\infty}x^{s-1}e^{-x}\,dx$（$s>0$），$\Gamma(n+1)=n!$，$\Gamma(1/2)=\sqrt{\pi}$。
> - 递推公式：$\Gamma(s+1)=s\Gamma(s)$。
> - **余元公式**：$\Gamma(s)\Gamma(1-s)=\pi/\sin(\pi s)$。
> - $B(p,q)=\dfrac{\Gamma(p)\Gamma(q)}{\Gamma(p+q)}$；$B(1/2,1/2)=\pi$。
> - 三角形式：$B(p,q)=2\displaystyle\int_0^{\pi/2}\sin^{2p-1}\theta\,\cos^{2q-1}\theta\,d\theta$。

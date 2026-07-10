---
title: "第 12 章 Fourier 分析"
chapter: 5
readTime: 150
description: "Fourier 级数、平方平均收敛、收敛性定理与 Fourier 变换。"
---

> 📋 **本章期末速查**
> - 必考（每年 1-2 题，15-20 分）：Fourier 展开（含半区间展开）+ Parseval 等式求数项级数和
> - 常考：幂级数求和函数、Dirichlet 积分应用
> - 了解：Fourier 变换的基本性质、复数形式

前面各章把函数在**空间区域**上积分；本章换一条思路——把「足够好的」函数写成**三角函数（或复指数）的叠加**，在频率域里分析信号与周期现象。

你可以这样理解：如果说 Taylor 级数是用幂函数 $1,x,x^2,\ldots$ 去逼近函数，那么 Fourier 级数就是用三角函数 $1,\cos x,\sin x,\cos 2x,\ldots$ 去逼近函数。Taylor 关注的是函数在某一点附近的局部性质，而 Fourier 关注的是函数在整个区间上的整体周期性结构。

Fourier 级数处理周期函数；平方平均收敛给出 $L^2$ 意义下「最佳逼近」；Dirichlet 定理回答何时级数在每一点收敛；Fourier 积分与变换把周期推广到全直线，是偏微分方程、信号处理、量子力学的共同语言。

**本章学习地图**（建议按这个顺序读）：

1. **正交性**（§12.1.1）：为什么三角函数系适合当「基」？
2. **系数公式**（§12.1.1–12.1.2）：怎样从 $f$ 算出 $a_n,b_n$？
3. **周期展开**（§12.1.2）：周期函数如何展开成 Fourier 级数？
4. **有限区间展开**（§12.1.3）：非周期函数怎么办？——延拓成周期函数。
5. **复数形式**（§12.1.4）：用复指数把公式写得更紧凑。
6. **平方平均收敛**（§12.2）：$L^2$ 意义下的最佳逼近与 Parseval 等式。
7. **逐点收敛**（§12.3）：Dirichlet 定理告诉你级数在每一点收敛到什么。
8. **Fourier 变换**（§12.4）：从周期函数推广到全直线上的非周期函数。

**本章主线**：正交性 $\Rightarrow$ 系数公式 $\Rightarrow$ 级数展开 $\Rightarrow$ 三种收敛（一致 / 逐点 / 平方平均）$\Rightarrow$ 非周期情形的 Fourier 变换。计算题要分清：周期延拓方式、奇偶性、半区间展开类型；理论题要分清：$L^2$ 收敛条件最宽，Dirichlet 条件保证逐点收敛到 $\tfrac12[f_++f_-]$。

> 💡 **给初学者的话**：本章计算量较大，但套路固定。不要试图一次记住所有公式，重点是理解「正交性 → 投影 → 系数」这条逻辑链。每遇到一道题，先判断：周期还是半区间？奇函数还是偶函数？需要求实形式还是复形式？这三个问题回答完，计算路径就清晰了。

---

## 12.1 Fourier 级数

> 🔴 **考试重要度：极高** | 展开 + 求和函数 + 利用展开求数项级数，每年必考

### 12.1.1 三角函数系的正交性

在区间 $[-\pi,\pi]$ 上，考虑函数系
$$1,\ \cos x,\ \cos 2x,\ \ldots,\ \cos nx,\ \ldots;\qquad \sin x,\ \sin 2x,\ \ldots,\ \sin nx,\ \ldots.$$
对任意 $m,n\in\mathbb{N}$（$m,n\ge 1$），有
$$\int_{-\pi}^{\pi}\cos mx\,\cos nx\,dx=
\begin{cases}
\pi, & m=n,\\
0, & m\neq n,
\end{cases}\qquad
\int_{-\pi}^{\pi}\sin mx\,\sin nx\,dx=
\begin{cases}
\pi, & m=n,\\
0, & m\neq n,
\end{cases}$$
$$\int_{-\pi}^{\pi}\sin mx\,\cos nx\,dx=0,\qquad
\int_{-\pi}^{\pi}\cos nx\,dx=0,\ \int_{-\pi}^{\pi}\sin nx\,dx=0.$$
此外 $\displaystyle\int_{-\pi}^{\pi}1\cdot 1\,dx=2\pi$。

**验证一例**：$m\neq n$ 时，
$$\int_{-\pi}^{\pi}\cos mx\cos nx\,dx=\frac12\int_{-\pi}^{\pi}\big[\cos(m+n)x+\cos(m-n)x\big]\,dx=0,$$
因 $m\pm n\neq 0$，$\cos kx$ 在完整周期上积分为零。$m=n$ 时 $\cos^2 nx=\tfrac12(1+\cos 2nx)$，得 $\pi$。$\sin mx\cos nx$ 可写成 $\tfrac12[\sin(m+n)x+\sin(m-n)x]$，两项在 $[-\pi,\pi]$ 上亦为零。

**内积与正交**：对平方可积函数 $f,g$，定义
$$\langle f,g\rangle=\frac{1}{\pi}\int_{-\pi}^{\pi} f(x)g(x)\,dx.$$
则上述系在加权意义下两两正交；$\{\cos nx\}_{n\ge0}$、$\{\sin nx\}_{n\ge1}$ 各自构成正交系（$\cos 0=1$ 单独计）。

:::callout 正交性的计算技巧
利用 $\cos mx\cos nx=\tfrac12[\cos(m+n)x+\cos(m-n)x]$ 等积化和差，把乘积化为单项三角函数在完整周期上的积分。$\int_{-\pi}^{\pi}\cos kx\,dx=0$（$k\neq0$）来自「正负半周抵消」；$\int_{-\pi}^{\pi}\cos^2 kx\,dx=\pi$ 可用倍角公式 $\cos^2 kx=\tfrac12(1+\cos 2kx)$。

**归一化写法**：令 $\phi_0=1/\sqrt2$，$\phi_n=\cos nx$，$\psi_n=\sin nx$（$n\ge1$），则 $\langle\phi_m,\phi_n\rangle=\delta_{mn}$，$\langle\psi_m,\psi_n\rangle=\delta_{mn}$，$\langle\phi_m,\psi_n\rangle=0$。Fourier 系数可写 $a_n/\sqrt2=\langle f,\phi_n\rangle$（$n\ge0$），$b_n=\langle f,\psi_n\rangle$，与有限维正交基坐标一致。
:::

**由正交性导出系数公式**：设 $f$ 在 $[-\pi,\pi]$ 上可展开为
$$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}\big(a_n\cos nx+b_n\sin nx\big).$$
形式上把 $f$ 与级数等同，两边同乘 $\cos kx$ 并在 $[-\pi,\pi]$ 上积分（**逐项积分**在收敛性未证前只是形式操作，但导出正确的候选系数）：
$$\int_{-\pi}^{\pi}f(x)\cos kx\,dx=\frac{a_0}{2}\underbrace{\int_{-\pi}^{\pi}\cos kx\,dx}_{=0}+\sum_{n=1}^{\infty}a_n\underbrace{\int_{-\pi}^{\pi}\cos nx\cos kx\,dx}_{=\pi\delta_{nk}}+\sum_{n=1}^{\infty}b_n\underbrace{\int_{-\pi}^{\pi}\sin nx\cos kx\,dx}_{=0}=\pi a_k.$$
故 $a_k=\dfrac{1}{\pi}\int_{-\pi}^{\pi} f(x)\cos kx\,dx$（$k\ge 1$）。$k=0$ 时与 $1$ 作内积：
$$\int_{-\pi}^{\pi}f(x)\,dx=\frac{a_0}{2}\cdot 2\pi=a_0\pi\quad\Rightarrow\quad a_0=\frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\,dx.$$
与 $\sin kx$ 作内积得
$$b_k=\frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\sin kx\,dx,\quad k\ge 1.$$
**上述公式对任意可积 $f$ 均有意义**；它们是否给出 $f$ 的「正确展开」取决于收敛性（§12.2、§12.3）。

**计算技巧**：若 $f$ 为偶函数，则 $b_n=0$，只需算 $a_n$；若 $f$ 为奇函数，则 $a_n=0$（含 $a_0$），只需算 $b_n$。若 $f(\pi-x)=f(x)$，则仅含 $\cos 2nx,\sin 2nx$ 等偶次谐波；$f(\pi-x)=-f(x)$ 则仅含奇次谐波。

> [要点]
>
> - 正交性 ⇒ 系数是「在各基函数方向上的投影」。
> - $a_n,b_n$ 由积分公式**唯一**确定，与 $f$ 是否收敛到级数无关。
> - 计算时先检验 $f$ 的奇偶性，常可化简积分。

### 12.1.2 周期函数的 Fourier 级数

设 $f$ 以 $2\pi$ 为周期：$f(x+2\pi)=f(x)$。若 $f$ 在 $[-\pi,\pi]$ 上 Riemann 可积（或 Lebesgue 可积），其 **Fourier 级数** 为
$$S_f(x)=\frac{a_0}{2}+\sum_{n=1}^{\infty}\big(a_n\cos nx+b_n\sin nx\big),$$
系数由 §12.1.1 的公式给出。记号 $\sim$ 表示「形式上的 Fourier 展开」，收敛性需另证。

**Riemann–Lebesgue 引理（陈述）**：$f$ 可积 ⇒ $a_n,b_n\to 0$（$n\to\infty$）。直观上，高频振荡项 $\cos nx,\sin nx$ 与 $f$ 的乘积积分相互抵消。该引理也是 Dirichlet 证明中估计余项的关键工具。

因 $f$ 周期，积分区间可平移，例如
$$a_n=\frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\cos nx\,dx=\frac{1}{\pi}\int_{0}^{2\pi} f(x)\cos nx\,dx.$$

**一般周期** $2L$：设 $f(x+2L)=f(x)$，令 $t=\dfrac{\pi x}{L}$，则 $F(t)=f\big(\tfrac{Lt}{\pi}\big)$ 以 $2\pi$ 为周期。换元得
$$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}\Big(a_n\cos\frac{n\pi x}{L}+b_n\sin\frac{n\pi x}{L}\Big),$$
其中
$$a_n=\frac{1}{L}\int_{-L}^{L} f(x)\cos\frac{n\pi x}{L}\,dx,\qquad
b_n=\frac{1}{L}\int_{-L}^{L} f(x)\sin\frac{n\pi x}{L}\,dx.$$

**换元验证**：令 $x=Lt/\pi$，则 $f(x)=F(t)$ 以 $2\pi$ 为周期，标准公式给出 $a_n=\dfrac{1}{\pi}\int_{-\pi}^{\pi}F(t)\cos nt\,dt$，换回 $x$ 即得上式。周期为 $T$ 时，角频率 $\omega_n=2\pi n/T$，公式中 $\pi/L=\pi/(T/2)=2\pi/T$ 与物理频率对应。

**例 12.1** 求 $f(x)=x$（$-\pi < x < \pi$）的 Fourier 级数，并周期延拓到 $\mathbb{R}$。

$f$ 为奇函数，故 $a_n=0$。$b_n=\dfrac{1}{\pi}\int_{-\pi}^{\pi} x\sin nx\,dx$。分部积分：
$$\int_{-\pi}^{\pi} x\sin nx\,dx=\Big[-\frac{x\cos nx}{n}\Big]_{-\pi}^{\pi}+\frac{1}{n}\int_{-\pi}^{\pi}\cos nx\,dx
=\frac{(-1)^{n+1}2\pi}{n}.$$
故 $b_n=\dfrac{2(-1)^{n+1}}{n}$，级数为
$$x\sim\sum_{n=1}^{\infty}\frac{2(-1)^{n+1}}{n}\sin nx,\quad x\in(-\pi,\pi).$$
在 $x=\pm\pi$ 及整数倍处，级数收敛到 $0$（跳跃间断点的中点），见 §12.3。

**例 12.2** 矩形波：$f(x)=1$（$0 < x < \pi$），$f(x)=-1$（$-\pi < x < 0$），以 $2\pi$ 为周期。$f$ 奇，$b_n=\dfrac{2}{\pi}\int_0^{\pi}\sin nx\,dx=\dfrac{2}{n\pi}[1-(-1)^n]$，故
$$f(x)\sim\frac{4}{\pi}\sum_{k=0}^{\infty}\frac{\sin(2k+1)x}{2k+1}.$$
在 $x=0$ 处级数收敛到 $0$（跳跃平均）；在 $(0,\pi)$ 内收敛到 $1$。

**例 12.2'** 锯齿波 $f(x)=x$（$-\pi < x < \pi$），周期 $2\pi$。这是例 12.1 的同一个周期延拓。$f$ 奇，$b_n=\dfrac{2(-1)^{n+1}}{n}$，即
$$x\sim 2\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin nx.$$
端点取值不影响 Fourier 系数；在跳跃点 $x=(2k+1)\pi$ 处，级数收敛到左右极限的平均值 $0$。

### 12.1.3 有限区间上的展开与延拓

> 🟢 **本节是初学者的第一个大坎**：把只在 $[0,L]$ 上给出的函数写成三角级数，必须先「延拓」。这一步没有任何魔法，只是人为地把函数补全到整个周期上。请你耐着性子把下面的三步走看懂：先画图像 → 再写公式 → 最后算系数。

#### 为什么需要延拓？

Fourier 级数研究的是**周期函数**。如果题目只给你 $f(x)$ 在 $[0,L]$ 上的表达式，比如 $f(x)=x$（$0\le x\le\pi$），它本身并不是周期函数——它只在一段区间上有定义。要套用 §12.1.2 的 Fourier 级数公式，必须先把 $f$ **补成**一个周期函数。补的方法不止一种，不同的补法得到不同的级数（余弦级数或正弦级数）。

**核心原则**：延拓方式由题目要求或物理背景决定，不是唯一的。同一函数在 $[0,L]$ 上可以既有余弦展开，也有正弦展开，两者一般不相等。

#### 标准操作流程（三步走）

以 $f$ 定义在 $[0,L]$ 上为例：

1. **选择延拓方式**：偶延拓或奇延拓。
2. **写出 $[-L,L]$ 上的延拓函数 $F(x)$**：
   - 偶延拓：$F(x)=f(|x|)$；
   - 奇延拓：$F(x)=\begin{cases}f(x),&x>0,\\0,&x=0,\\-f(-x),&x < 0.\end{cases}$（若 $f(0)\neq0$，奇延拓在 $0$ 处会有跳跃）
3. **把 $F$ 以 $2L$ 为周期延拓到 $\mathbb{R}$**，再对 $F$ 用 §12.1.2 的公式算系数。

下面分别细讲。

#### 偶延拓与余弦级数

**定义**：对 $x\in[-L,0]$，令 $F_{\mathrm{even}}(x)=f(-x)$；即把 $[0,L]$ 上的图像关于 $y$ 轴对称翻折到左边。然后以 $2L$ 为周期平铺到整个实轴。

因为 $F_{\mathrm{even}}$ 是偶函数，所有正弦系数 $b_n=0$。在 $[-L,L]$ 上用标准 Fourier 公式：
$$a_n=\frac1L\int_{-L}^{L}F_{\mathrm{even}}(x)\cos\frac{n\pi x}{L}\,dx.$$
由于被积函数是偶函数（偶 × 偶 = 偶），积分可写成 $2\int_0^L$：
$$a_n=\frac{2}{L}\int_0^L f(x)\cos\frac{n\pi x}{L}\,dx\quad(n\ge0),$$
其中 $n=0$ 时 $\cos 0=1$，于是
$$a_0=\frac{2}{L}\int_0^L f(x)\,dx,\qquad \frac{a_0}{2}=\frac1L\int_0^L f(x)\,dx.$$

因此 $f$ 在 $[0,L]$ 上的**余弦级数**为
$$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}a_n\cos\frac{n\pi x}{L},\qquad x\in[0,L].$$

**几何意义**：偶延拓后的函数在 $x=0$ 处自动连续（左右图像对称拼接），在 $x=\pm L,\pm2L,\ldots$ 处若 $f(L-)=f(L+)$（即延拓后左右极限相等）也连续。余弦级数适合**Neumann 型边界条件**（边界处导数/斜率为零，例如绝热杆的热传导问题）。

#### 奇延拓与正弦级数

**定义**：对 $x\in[-L,0)$，令 $F_{\mathrm{odd}}(x)=-f(-x)$；即把 $[0,L]$ 上的图像关于原点对称翻折到左边。然后以 $2L$ 为周期平铺。

因为 $F_{\mathrm{odd}}$ 是奇函数，所有余弦系数 $a_n=0$（包括 $a_0$）。在 $[-L,L]$ 上：
$$b_n=\frac1L\int_{-L}^{L}F_{\mathrm{odd}}(x)\sin\frac{n\pi x}{L}\,dx.$$
被积函数是奇 × 奇 = 偶，所以
$$b_n=\frac{2}{L}\int_0^L f(x)\sin\frac{n\pi x}{L}\,dx\quad(n\ge1).$$

因此 $f$ 在 $[0,L]$ 上的**正弦级数**为
$$f(x)\sim\sum_{n=1}^{\infty}b_n\sin\frac{n\pi x}{L},\qquad x\in[0,L].$$

**几何意义**：奇延拓后函数图像关于原点对称。若 $f(0)\neq0$，在 $x=0$ 处会出现跳跃（左边是 $-f(0+)$，右边是 $f(0+)$），这是初学时最容易漏掉的细节。在 $x=\pm L$ 处同样可能跳跃。正弦级数适合**Dirichlet 型边界条件**（边界处函数值为零，例如两端固定的弦振动）。

#### 三种延拓方式一览

| 延拓方式 | 目标函数 $F$ 的奇偶性 | 非零系数 | 级数形式 | 自然满足的边界 |
|----------|----------------------|----------|----------|----------------|
| 偶延拓 | 偶函数 | $a_n$ | 余弦级数 | $F'(0)=0$，$F'(L)=0$（斜率为零） |
| 奇延拓 | 奇函数 | $b_n$ | 正弦级数 | $F(0)=0$，$F(L)=0$（函数值为零） |
| 一般周期延拓 | 不一定 | $a_n,b_n$ 都可能有 | 完整 Fourier 级数 | 无特殊边界约束 |

> 💡 **初学提示**：如果题目只说「在 $[0,L]$ 上展开」，没有指明余弦或正弦，通常需要你自己判断。判断依据往往是后续物理背景或边界条件；纯数学题目一般会明确说「展成余弦级数」或「展成正弦级数」。

#### 端点处的收敛值

延拓后在 $x=0$ 和 $x=L$ 处经常会出现跳跃，所以级数在这些点的取值要按 Dirichlet 定理判断：收敛到左右极限的平均值。

- **偶延拓**：在 $x=0$ 处左右极限都是 $f(0)$，因此级数收敛到 $f(0)$。在 $x=L$ 处收敛到 $f(L)$（若 $f$ 在端点连续）。
- **奇延拓**：在 $x=0$ 处左极限为 $-f(0+)$，右极限为 $f(0+)$，平均值是 $0$。因此即使原函数 $f(0)\neq0$，正弦级数在 $x=0$ 处也收敛到 $0$。在 $x=L$ 处同理收敛到 $0$。

**这一点在考试里经常考**：比如正弦级数的和函数 $S(x)$ 在 $x=L$ 处一定是 $0$，不管 $f(L)$ 是多少。

#### 系数公式 $\dfrac{2}{L}\int_0^L$ 的推导

有些同学死记这个系数，但很容易混淆什么时候是 $\dfrac{2}{L}$，什么时候是 $\dfrac{1}{L}$。记住下面这个逻辑：

1. 先在全区间 $[-L,L]$ 上用标准公式：系数前面是 $\dfrac{1}{L}$。
2. 如果函数是偶函数或奇函数，利用奇偶性把积分区间折半：$\int_{-L}^{L}=2\int_0^L$。
3. 于是系数变成 $\dfrac{1}{L}\cdot2\int_0^L=\dfrac{2}{L}\int_0^L$。

也就是说，**半区间公式是标准公式 + 奇偶对称性的结果**，不是新公式。

#### 例 12.3：$f(x)=x(\pi-x)$ 在 $[0,\pi]$ 上的两种展开

**（一）余弦展开**

这里 $L=\pi$。先算 $a_0$：
$$a_0=\frac{2}{\pi}\int_0^{\pi}x(\pi-x)\,dx
=\frac{2}{\pi}\Big[\frac{\pi x^2}{2}-\frac{x^3}{3}\Big]_0^{\pi}
=\frac{2}{\pi}\Big(\frac{\pi^3}{2}-\frac{\pi^3}{3}\Big)
=\frac{2}{\pi}\cdot\frac{\pi^3}{6}=\frac{\pi^2}{3}.$$

再算 $a_n$（$n\ge1$）：
$$a_n=\frac{2}{\pi}\int_0^{\pi}x(\pi-x)\cos nx\,dx
=\frac{2}{\pi}\int_0^{\pi}(\pi x-x^2)\cos nx\,dx.$$

分项积分。对 $\int_0^{\pi}x\cos nx\,dx$ 分部积分：
$$\int_0^{\pi}x\cos nx\,dx=\Big[\frac{x\sin nx}{n}\Big]_0^{\pi}-\frac1n\int_0^{\pi}\sin nx\,dx
=0+\frac1{n^2}[\cos nx]_0^{\pi}=\frac{(-1)^n-1}{n^2}.$$

对 $\int_0^{\pi}x^2\cos nx\,dx$ 分部积分两次：
$$\int_0^{\pi}x^2\cos nx\,dx=\Big[\frac{x^2\sin nx}{n}\Big]_0^{\pi}-\frac{2}{n}\int_0^{\pi}x\sin nx\,dx
=-\frac{2}{n}\int_0^{\pi}x\sin nx\,dx.$$
而
$$\int_0^{\pi}x\sin nx\,dx=\Big[-\frac{x\cos nx}{n}\Big]_0^{\pi}+\frac1n\int_0^{\pi}\cos nx\,dx
=-\frac{\pi(-1)^n}{n}+0=\frac{\pi(-1)^{n+1}}{n}.$$
所以
$$\int_0^{\pi}x^2\cos nx\,dx=-\frac{2}{n}\cdot\frac{\pi(-1)^{n+1}}{n}=\frac{2\pi(-1)^n}{n^2}.$$

代回 $a_n$：
$$a_n=\frac{2}{\pi}\Big[\pi\cdot\frac{(-1)^n-1}{n^2}-\frac{2\pi(-1)^n}{n^2}\Big]
=\frac{2}{\pi}\cdot\frac{\pi[(-1)^n-1-2(-1)^n]}{n^2}
=\frac{2[-1-(-1)^n]}{n^2}
=-\frac{2[1+(-1)^n]}{n^2}.$$

因此：
- 当 $n$ 为奇数时，$1+(-1)^n=0$，$a_n=0$；
- 当 $n=2k$ 为偶数时，$a_{2k}=-\dfrac{2\cdot2}{(2k)^2}=-\frac{1}{k^2}$。

最终余弦级数为
$$x(\pi-x)=\frac{\pi^2}{6}-\sum_{k=1}^{\infty}\frac{\cos 2kx}{k^2},\qquad x\in[0,\pi].$$

> 你可以验证：取 $x=0$，右边变成 $\dfrac{\pi^2}{6}-\sum\dfrac{1}{k^2}$。由于左边 $f(0)=0$，立即得到 $\sum\dfrac{1}{k^2}=\dfrac{\pi^2}{6}$——这就是 Euler 的著名结果。

**（二）正弦展开**

$$b_n=\frac{2}{\pi}\int_0^{\pi}x(\pi-x)\sin nx\,dx
=\frac{2}{\pi}\int_0^{\pi}(\pi x-x^2)\sin nx\,dx.$$

分别计算：
$$\int_0^{\pi}x\sin nx\,dx=\frac{\pi(-1)^{n+1}}{n}$$
（前面已经算过）。

$$\int_0^{\pi}x^2\sin nx\,dx=\Big[-\frac{x^2\cos nx}{n}\Big]_0^{\pi}+\frac{2}{n}\int_0^{\pi}x\cos nx\,dx
=-\frac{\pi^2(-1)^n}{n}+\frac{2}{n}\cdot\frac{(-1)^n-1}{n^2}.$$

所以
$$\int_0^{\pi}(\pi x-x^2)\sin nx\,dx
=\pi\cdot\frac{\pi(-1)^{n+1}}{n}-\Big[-\frac{\pi^2(-1)^n}{n}+\frac{2[(-1)^n-1]}{n^3}\Big]$$
$$=\frac{\pi^2(-1)^{n+1}}{n}+\frac{\pi^2(-1)^n}{n}-\frac{2[(-1)^n-1]}{n^3}
=\frac{2[1-(-1)^n]}{n^3}.$$

因此
$$b_n=\frac{4[1-(-1)^n)}{\pi n^3}.$$

- 当 $n$ 为偶数时，$b_n=0$；
- 当 $n=2k+1$ 为奇数时，$b_{2k+1}=\dfrac{8}{\pi(2k+1)^3}$。

正弦级数为
$$x(\pi-x)\sim\frac{8}{\pi}\sum_{k=0}^{\infty}\frac{\sin(2k+1)x}{(2k+1)^3},\qquad x\in[0,\pi].$$

> 注意：虽然 $f(0)=f(\pi)=0$，看似与奇延拓在端点的收敛值一致，但如果 $f(0)\neq0$，正弦级数在 $0$ 处仍然收敛到 $0$，而不是 $f(0)$。这是奇延拓的必然结果。

#### 例 12.3'：$f(x)=x^2$ 在 $[-\pi,\pi]$ 上的 Fourier 级数

这个例子不是半区间展开，而是直接以 $2\pi$ 为周期的展开，用来复习前面的内容。

$f(x)=x^2$ 是偶函数，所以 $b_n=0$。

$$a_0=\frac{1}{\pi}\int_{-\pi}^{\pi}x^2\,dx=\frac{2}{\pi}\int_0^{\pi}x^2\,dx=\frac{2\pi^2}{3}.$$

$$a_n=\frac{1}{\pi}\int_{-\pi}^{\pi}x^2\cos nx\,dx=\frac{2}{\pi}\int_0^{\pi}x^2\cos nx\,dx.$$

分部积分两次：
$$\int_0^{\pi}x^2\cos nx\,dx=\Big[\frac{x^2\sin nx}{n}\Big]_0^{\pi}-\frac{2}{n}\int_0^{\pi}x\sin nx\,dx
=-\frac{2}{n}\cdot\frac{\pi(-1)^{n+1}}{n}=\frac{2\pi(-1)^n}{n^2}.$$

所以 $a_n=\dfrac{4(-1)^n}{n^2}$，得到
$$x^2\sim\frac{\pi^2}{3}+4\sum_{n=1}^{\infty}\frac{(-1)^n}{n^2}\cos nx.$$

取 $x=\pi$（连续点），左边 $f(\pi)=\pi^2$，右边为
$$\frac{\pi^2}{3}+4\sum_{n=1}^{\infty}\frac{1}{n^2}.$$
于是
$$\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{\pi^2}{6}.$$

> 这个例子展示了 Fourier 级数最强大的应用之一：通过合理的取值，把难算的数项级数和求出来。

#### 初学常犯错误

1. **混淆 $a_0$ 的系数**：余弦级数中常数项写成 $\dfrac{a_0}{2}$，但 $a_0=\dfrac{2}{L}\int_0^L f(x)\,dx$，所以常数项实际上是 $\dfrac{1}{L}\int_0^L f(x)\,dx$。不要把 $a_0$ 和 $a_0/2$ 搞混。
2. **正弦级数在端点取值错误**：奇延拓后 $S(0)=S(L)=0$，即使原函数在这些点不为零。
3. **积分区间用错**：偶延拓/奇延拓后，标准公式是在 $[-L,L]$ 上积分；如果你想直接在 $[0,L]$ 上算，别忘了把前面的 $\dfrac{1}{L}$ 改成 $\dfrac{2}{L}$。
4. **不先判断奇偶性**：一看到 $f$ 是偶函数或奇函数，立刻知道一半系数为零，能省大量计算。

> [要点]
>
> - **余弦级数** = 偶延拓 + 全区间展开；**正弦级数** = 奇延拓。
> - 延拓不是唯一的；选择由边界条件或题目要求决定。
> - 半区间系数公式 $\dfrac{2}{L}\int_0^L$ 是标准公式结合奇偶对称性得到的。
> - 奇延拓在端点 $0,L$ 处级数收敛到 $0$；偶延拓在端点收敛到 $f(0),f(L)$。
> - 计算前先判断奇偶性，能省一半工作量。

### 12.1.4 复数形式的 Fourier 级数

> 🟢 **本节目标**：把三角级数写成更紧凑的复指数形式。如果你熟悉复数，这会让很多公式变得更整齐；如果不熟悉，我们会从最基础的 Euler 公式开始复习。

#### 为什么要引入复指数？

实数形式的 Fourier 级数要同时处理 $\cos nx$ 和 $\sin nx$ 两套函数，公式写起来比较长。引入复指数 $e^{inx}$ 后，只需要一套函数 $\{e^{inx}\}_{n\in\mathbb{Z}}$，系数也只有一套 $\{c_n\}$。这样做的好处是：

1. **公式更紧凑**：一个求和号同时包含正弦和余弦信息。
2. **运算更方便**：求导、积分、平移、卷积在复指数下变成简单的代数运算。
3. **物理意义清晰**：$|c_n|^2$ 直接表示第 $n$ 个频率分量的能量（见 Parseval 等式）。
4. **后续课程必需**：偏微分方程、信号处理、量子力学中都默认使用复形式。

#### Euler 公式复习

$$e^{i\theta}=\cos\theta+i\sin\theta,\qquad e^{-i\theta}=\cos\theta-i\sin\theta.$$

由此可以解出
$$\cos\theta=\frac{e^{i\theta}+e^{-i\theta}}{2},\qquad \sin\theta=\frac{e^{i\theta}-e^{-i\theta}}{2i}.$$

这是把三角函数和复指数互相转换的桥梁。

#### 复指数函数的正交性

在区间 $[-\pi,\pi]$ 上，函数系 $\{e^{inx}\}_{n\in\mathbb{Z}}$ 满足
$$\int_{-\pi}^{\pi}e^{inx}e^{-imx}\,dx=2\pi\delta_{nm},$$
其中 $\delta_{nm}$ 是 Kronecker 记号（$n=m$ 时为 $1$，否则为 $0$）。

**验证**：当 $n\neq m$ 时，
$$\int_{-\pi}^{\pi}e^{i(n-m)x}\,dx=\Big[\frac{e^{i(n-m)x}}{i(n-m)}\Big]_{-\pi}^{\pi}
=\frac{e^{i(n-m)\pi}-e^{-i(n-m)\pi}}{i(n-m)}=\frac{2i\sin[(n-m)\pi]}{i(n-m)}=0.$$

当 $n=m$ 时，$e^{inx}e^{-inx}=1$，所以积分等于 $2\pi$。

> 注意这里的内积定义和实三角函数系不同：复形式中是 $\int f\overline{g}$，其中 $\overline{g}$ 表示 $g$ 的复共轭。$e^{-imx}$ 就是 $e^{imx}$ 的复共轭。

#### 从实形式推导复形式

已知实形式 Fourier 级数：
$$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}\big(a_n\cos nx+b_n\sin nx\big).$$

把 $\cos nx$ 和 $\sin nx$ 用 Euler 公式替换：
$$a_n\cos nx+b_n\sin nx
=a_n\cdot\frac{e^{inx}+e^{-inx}}{2}+b_n\cdot\frac{e^{inx}-e^{-inx}}{2i}$$
$$=\frac{a_n-ib_n}{2}e^{inx}+\frac{a_n+ib_n}{2}e^{-inx}.$$

令
$$c_0=\frac{a_0}{2},\qquad c_n=\frac{a_n-ib_n}{2}\ (n\ge1),\qquad c_{-n}=\frac{a_n+ib_n}{2}\ (n\ge1).$$

则级数变为
$$f(x)\sim\sum_{n=-\infty}^{\infty}c_n e^{inx}.$$

这就是**复数形式的 Fourier 级数**。

#### 系数公式的推导

假设 $f(x)=\sum_{n=-\infty}^{\infty}c_n e^{inx}$，两边同乘 $e^{-ikx}$ 并在 $[-\pi,\pi]$ 上积分：
$$\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx=\sum_{n=-\infty}^{\infty}c_n\int_{-\pi}^{\pi}e^{inx}e^{-ikx}\,dx
=\sum_{n=-\infty}^{\infty}c_n\cdot2\pi\delta_{nk}=2\pi c_k.$$

所以
$$c_k=\frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}\,dx,\qquad k\in\mathbb{Z}.$$

> 这里的逐项积分在收敛性未证明前只是形式推导，但它给出正确的系数公式。严格性由 §12.2 和 §12.3 的收敛定理保证。

#### 实系数与复系数的关系

从上面的定义可以直接得到：

| 关系 | 公式 |
|------|------|
| $c_0$ | $\dfrac{a_0}{2}$ |
| $c_n\ (n>0)$ | $\dfrac{a_n-ib_n}{2}$ |
| $c_{-n}\ (n>0)$ | $\dfrac{a_n+ib_n}{2}$ |
| $a_n$ | $c_n+c_{-n}=2\operatorname{Re}(c_n)$ |
| $b_n$ | $i(c_{-n}-c_n)=-2\operatorname{Im}(c_n)$ |

**若 $f$ 是实值函数**，则 $a_n,b_n$ 都是实数，于是
$$c_{-n}=\frac{a_n+ib_n}{2}=\overline{\frac{a_n-ib_n}{2}}=\overline{c_n}.$$

这个性质称为 **Hermitian 对称**（或共轭对称）。它保证尽管每个 $c_n$ 可能是复数，但把所有 $c_n e^{inx}$ 和 $c_{-n}e^{-inx}$ 加在一起后，虚部相互抵消，最终得到实函数。

> 💡 **初学提示**：看到复系数不要害怕。如果 $f$ 是实函数，你完全可以先算 $c_n$，然后用 $a_n=2\operatorname{Re}(c_n)$、$b_n=-2\operatorname{Im}(c_n)$ 转回实形式。很多时候复系数比直接分部积分更好算。

#### 一般周期 $2L$

若 $f$ 的周期为 $2L$，则
$$f(x)\sim\sum_{n=-\infty}^{\infty}c_n e^{in\pi x/L},\qquad
c_n=\frac{1}{2L}\int_{-L}^{L}f(x)e^{-in\pi x/L}\,dx.$$

推导方法和 $2\pi$ 周期完全相同，只是做了换元 $t=\pi x/L$。

#### 例 12.4：$f(x)=e^x$ 在 $(-\pi,\pi)$ 上的复形式展开

$$c_n=\frac{1}{2\pi}\int_{-\pi}^{\pi}e^x e^{-inx}\,dx
=\frac{1}{2\pi}\int_{-\pi}^{\pi}e^{(1-in)x}\,dx.$$

计算积分：
$$\int_{-\pi}^{\pi}e^{(1-in)x}\,dx=\Big[\frac{e^{(1-in)x}}{1-in}\Big]_{-\pi}^{\pi}
=\frac{e^{(1-in)\pi}-e^{-(1-in)\pi}}{1-in}.$$

利用 $e^{\pm in\pi}=(-1)^{\pm n}=(-1)^n$：
$$e^{(1-in)\pi}=e^{\pi}e^{-in\pi}=e^{\pi}(-1)^n,\qquad
 e^{-(1-in)\pi}=e^{-\pi}e^{in\pi}=e^{-\pi}(-1)^n.$$

所以
$$e^{(1-in)\pi}-e^{-(1-in)\pi}=(-1)^n(e^{\pi}-e^{-\pi})=2(-1)^n\sinh\pi.$$

因此
$$c_n=\frac{1}{2\pi}\cdot\frac{2(-1)^n\sinh\pi}{1-in}
=\frac{(-1)^n\sinh\pi}{\pi(1-in)}.$$

为了化简分母，乘以共轭：
$$c_n=\frac{(-1)^n\sinh\pi}{\pi(1-in)}\cdot\frac{1+in}{1+in}
=\frac{(-1)^n\sinh\pi(1+in)}{\pi(1+n^2)}.$$

所以
$$c_n=\frac{(-1)^n\sinh\pi}{\pi(1+n^2)}+i\frac{(-1)^n n\sinh\pi}{\pi(1+n^2)}.$$

由于 $f(x)=e^x$ 是实函数，应有 $c_{-n}=\overline{c_n}$。你可以验证：把上面式子中的 $n$ 换成 $-n$，虚部变号，实部不变，确实得到 $\overline{c_n}$。

还原实系数：
$$a_n=c_n+c_{-n}=2\operatorname{Re}(c_n)=\frac{2(-1)^n\sinh\pi}{\pi(1+n^2)},$$
$$b_n=i(c_{-n}-c_n)=-2\operatorname{Im}(c_n)=-\frac{2(-1)^n n\sinh\pi}{\pi(1+n^2)}.$$

所以实形式为
$$e^x\sim\frac{\sinh\pi}{\pi}+\sum_{n=1}^{\infty}\frac{2(-1)^n\sinh\pi}{\pi(1+n^2)}\big(\cos nx-n\sin nx\big).$$

> 注意：由于 $e^x$ 周期延拓后在 $x=\pm\pi$ 处有跳跃（左极限 $e^{\pi}$，右极限 $e^{-\pi}$），级数在这些点收敛到左右平均 $\cosh\pi$，而不是 $e^{\pm\pi}$。

#### 例 12.4'：用复形式重算 $f(x)=x$

这是例 12.1 的函数。用复形式计算：
$$c_n=\frac{1}{2\pi}\int_{-\pi}^{\pi}x e^{-inx}\,dx.$$

当 $n=0$ 时：
$$c_0=\frac{1}{2\pi}\int_{-\pi}^{\pi}x\,dx=0$$
（奇函数在对称区间积分为零）。

当 $n\neq 0$ 时，分部积分：
$$\int_{-\pi}^{\pi}x e^{-inx}\,dx
=\Big[-\frac{x e^{-inx}}{in}\Big]_{-\pi}^{\pi}+\frac{1}{in}\int_{-\pi}^{\pi}e^{-inx}\,dx.$$

第二项积分：$n\neq0$ 时 $\int_{-\pi}^{\pi}e^{-inx}\,dx=0$。第一项：
$$-\frac{x e^{-inx}}{in}\Big|_{-\pi}^{\pi}
=-\frac{\pi e^{-in\pi}}{in}+\frac{(-\pi)e^{in\pi}}{in}
=-\frac{\pi(-1)^n}{in}-\frac{\pi(-1)^n}{in}
=\frac{2\pi i(-1)^n}{n}.$$

因此
$$c_n=\frac{1}{2\pi}\cdot\frac{2\pi i(-1)^n}{n}=\frac{i(-1)^n}{n}.$$

验证 Hermitian 对称：
$$c_{-n}=\frac{i(-1)^{-n}}{-n}=-\frac{i(-1)^n}{n}=\overline{c_n}.$$

复形式级数为
$$x\sim\sum_{n\neq0}\frac{i(-1)^n}{n}e^{inx}.$$

还原实系数：
$$a_n=c_n+c_{-n}=\frac{i(-1)^n}{n}-\frac{i(-1)^n}{n}=0,$$
$$b_n=i(c_{-n}-c_n)=i\Big(-\frac{i(-1)^n}{n}-\frac{i(-1)^n}{n}\Big)
=i\cdot\Big(-\frac{2i(-1)^n}{n}\Big)=\frac{2(-1)^{n+1}}{n}.$$

所以
$$x\sim2\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin nx,$$
与例 12.1 完全一致。

> 对比两种方法：实形式需要分部积分 $\int x\sin nx\,dx$ 和 $\int x\cos nx\,dx$；复形式只需要分部积分一次 $\int x e^{-inx}\,dx$，然后通过取实部/虚部同时得到 $a_n$ 和 $b_n$。对于更复杂的函数，复形式往往更省事。

:::callout 为什么复形式在工程和物理中更常用
1. **求导简单**：$\dfrac{d}{dx}e^{inx}=in e^{inx}$，微分算子变成乘法。
2. **卷积简单**：时域卷积对应频域乘积（见 §12.4）。
3. **能量解释直接**：$|c_n|^2$ 是第 $n$ 个频率分量的能量。
4. **量子力学**：波函数本质上是复值函数，Fourier 变换是位置表象和动量表象之间的转换。

但初学阶段，**计算 Fourier 展开时两种形式都要会**，因为考试可能指定用实形式或复形式。
:::

> [要点]
>
> - 复形式把 $\cos nx$、$\sin nx$ 统一为 $e^{inx}$，一套系数 $\{c_n\}$ 描述所有频率分量。
> - 系数公式：$c_n=\dfrac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-inx}\,dx$（周期 $2\pi$）。
> - 实值函数满足 $c_{-n}=\overline{c_n}$；还原实系数：$a_n=2\operatorname{Re}(c_n)$，$b_n=-2\operatorname{Im}(c_n)$。
> - 不同教材对 $2\pi$ 因子的放置可能不同，查表时务必核对。

---

## 12.2 平方平均收敛

> 🔴 **考试重要度：极高** | Parseval 等式求 $\sum 1/n^2$, $\sum 1/n^4$, $\sum 1/(2n-1)^k$ 是标准大题
> 🟢 **学习提示**：本节公式看起来抽象，但本质和「最小二乘法」「勾股定理」是一回事。请把 $L^2$ 范数理解为「能量」或「均方误差」。

### 12.2.1 为什么要研究平方平均收敛？

前面 §12.3 的 Dirichlet 定理告诉我们：如果 $f$ 分段光滑，Fourier 级数会逐点收敛到 $f$（在连续点）或左右极限平均（在跳跃点）。但这个定理有两个限制：

1. 它要求 $f$ **分段光滑**，条件比较严格。
2. 有些函数即使连续，其 Fourier 级数也可能在某些点发散（Du Bois-Reymond 反例，超出本课程）。

于是数学家问：能不能放松要求，只要求某种「整体意义」上的收敛？答案是：**平方平均收敛**，也就是 $L^2$ 收敛。它对函数的光滑性要求最低，只要求 $f$ 平方可积。

#### 三种收敛的直观比较

假设 $S_N$ 是 Fourier 部分和：

| 收敛类型 | 含义 | 直观说法 | 对 $f$ 的要求 |
|----------|------|----------|--------------|
| **一致收敛** | $\sup_x|S_N(x)-f(x)|\to0$ | 整条曲线被一致压低到 $f$ | 很强，通常要分段 $C^1$ 且端点连续 |
| **逐点收敛** | 对每个 $x$，$S_N(x)\to f(x)$ | 每一点的函数值都对上 | 分段光滑（Dirichlet 条件） |
| **平方平均收敛** | $\|S_N-f\|_{L^2}\to0$ | 整体误差能量趋于零，允许个别点有偏差 | 最弱，只要求 $f\in L^2$ |

关系：一致收敛 $\Rightarrow$ 逐点收敛（通常）$\Rightarrow$ 平方平均收敛。但反向**不成立**。

> 例子：在跳跃点附近，$S_N$ 会有 Gibbs 现象（约 9% 的过冲），所以不可能一致收敛；但 $S_N$ 与 $f$ 的 $L^2$ 误差仍然趋于零，因为过冲区越来越窄，对积分贡献越来越小。

### 12.2.2 $L^2$ 内积与范数

设 $f,g$ 是 $[-\pi,\pi]$ 上的平方可积函数，定义内积
$$\langle f,g\rangle=\frac{1}{\pi}\int_{-\pi}^{\pi}f(x)g(x)\,dx.$$

对应的范数（长度）为
$$\|f\|_{L^2}=\sqrt{\langle f,f\rangle}=\sqrt{\frac{1}{\pi}\int_{-\pi}^{\pi}|f(x)|^2\,dx}.$$

> 这里的因子 $\dfrac{1}{\pi}$ 是为了让三角函数系的「长度」变成 $1$：$\|\cos nx\|_{L^2}=\|\sin nx\|_{L^2}=1$。不同教材可能用不同的归一化，但结论相同。

**范数的意义**：$\|f\|_{L^2}^2=\dfrac{1}{\pi}\int|f|^2$ 可以理解为函数的「平均能量」。两个函数靠得近，不是说它们每一点都接近，而是说它们能量的差很小。

### 12.2.3 正交投影与最佳逼近

回到 Fourier 部分和：
$$S_N(f)(x)=\frac{a_0}{2}+\sum_{n=1}^{N}\big(a_n\cos nx+b_n\sin nx\big).$$

在 $L^2$ 内积下，三角函数系两两正交。因此 $S_N(f)$ 可以看作 $f$ 在由
$$\{1,\cos x,\sin x,\cos 2x,\sin 2x,\ldots,\cos Nx,\sin Nx\}$$
张成的子空间上的**正交投影**。

**最佳逼近定理**：对任意次数不超过 $N$ 的三角多项式 $T_N$，都有
$$\|f-S_N(f)\|_{L^2}\le\|f-T_N\|_{L^2}.$$

换句话说，在所有次数不超过 $N$ 的三角多项式中，Fourier 部分和 $S_N(f)$ 是离 $f$ 最近的那一个。

**证明（勾股定理版）**：令 $r_N=f-S_N(f)$。由于 $S_N(f)$ 是正交投影，$r_N$ 与 $T_N-S_N(f)$ 正交：
$$\langle r_N,T_N-S_N(f)\rangle=0.$$

于是
$$\|f-T_N\|_{L^2}^2=\|(f-S_N(f))-(T_N-S_N(f))\|_{L^2}^2
=\|r_N\|_{L^2}^2+\|T_N-S_N(f)\|_{L^2}^2\ge\|r_N\|_{L^2}^2
=\|f-S_N(f)\|_{L^2}^2.$$

这就是勾股定理的直接应用。

> 💡 **初学提示**：这和线性代数里「向量在子空间上的投影是最近点」完全一样。$f$ 是高维空间里的向量，$S_N(f)$ 是它在三角多项式子空间上的投影。

### 12.2.4 Bessel 不等式

由于 $S_N(f)$ 是投影，根据勾股定理：
$$\|f\|_{L^2}^2=\|S_N(f)\|_{L^2}^2+\|f-S_N(f)\|_{L^2}^2.$$

右边第二项非负，所以
$$\|S_N(f)\|_{L^2}^2\le\|f\|_{L^2}^2.$$

而 $\|S_N(f)\|_{L^2}^2$ 可以用 Fourier 系数表示。利用三角函数系的正交性：
$$\|S_N(f)\|_{L^2}^2=\frac{a_0^2}{2}+\sum_{n=1}^{N}(a_n^2+b_n^2).$$

因此得到 **Bessel 不等式**：
$$\frac{a_0^2}{2}+\sum_{n=1}^{N}(a_n^2+b_n^2)\le\|f\|_{L^2}^2.$$

令 $N\to\infty$，左边是单调递增有上界的级数，所以收敛：
$$\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2)\le\|f\|_{L^2}^2.$$

**意义**：Fourier 系数的平方和（总能量）不超过原函数的能量。如果某个函数的能量很大，但 Fourier 系数都很小，那它的能量一定集中在高频部分（即 $n$ 很大的项）。

### 12.2.5 Parseval 等式

Bessel 不等式告诉我们左边 $\le$ 右边。Parseval 等式说，对于 $f\in L^2$，实际上等号成立：
$$\|f\|_{L^2}^2=\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2).$$

等价地写成积分形式：
$$\frac{1}{\pi}\int_{-\pi}^{\pi}|f(x)|^2\,dx=\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2).$$

**为什么等号成立？** 关键事实是：三角多项式在 $L^2[-\pi,\pi]$ 中稠密。也就是说，任意 $L^2$ 函数都可以用三角多项式任意逼近。结合最佳逼近定理，$S_N(f)$ 作为最佳 $N$ 阶逼近，其误差 $\|f-S_N(f)\|_{L^2}$ 必然趋于零。于是勾股定理中的余项消失，等号成立。

**误差公式**：如果我们在第 $N$ 项截断，剩余能量的精确表达式为
$$\|f-S_N(f)\|_{L^2}^2=\|f\|_{L^2}^2-\left[\frac{a_0^2}{2}+\sum_{n=1}^{N}(a_n^2+b_n^2)\right].$$

这个公式非常实用：算完系数后，如果右边很小，说明 $N$ 项已经足够；如果还很大，说明需要更多项。

#### 复系数形式的 Parseval

若使用复系数 $c_n=\dfrac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-inx}\,dx$，则
$$\frac{1}{2\pi}\int_{-\pi}^{\pi}|f(x)|^2\,dx=\sum_{n=-\infty}^{\infty}|c_n|^2.$$

用本章的归一化 $\|f\|_{L^2}^2=\dfrac{1}{\pi}\int|f|^2$，则
$$\|f\|_{L^2}^2=2\sum_{n=-\infty}^{\infty}|c_n|^2.$$

**两种形式的等价性**：由 $a_n=c_n+c_{-n}=2\operatorname{Re}(c_n)$，$b_n=i(c_{-n}-c_n)=-2\operatorname{Im}(c_n)$，以及实函数的 $c_{-n}=\overline{c_n}$，我们来验证两者给出相同结果。

先看 $n\ge1$ 的项：
$$a_n^2+b_n^2=(c_n+c_{-n})^2+\big[i(c_{-n}-c_n)\big]^2.$$

注意 $i^2=-1$，所以
$$\big[i(c_{-n}-c_n)\big]^2=-(c_{-n}-c_n)^2.$$

于是
$$a_n^2+b_n^2=(c_n+c_{-n})^2-(c_{-n}-c_n)^2.$$

展开：
$$(c_n+c_{-n})^2=c_n^2+2c_nc_{-n}+c_{-n}^2,$$
$$(c_{-n}-c_n)^2=c_{-n}^2-2c_nc_{-n}+c_n^2.$$

相减：
$$(c_n+c_{-n})^2-(c_{-n}-c_n)^2=4c_nc_{-n}.$$

由于 $f$ 是实值函数，$c_{-n}=\overline{c_n}$，所以 $c_nc_{-n}=c_n\overline{c_n}=|c_n|^2$。因此
$$a_n^2+b_n^2=4|c_n|^2.$$

再看 $n=0$：$a_0=2c_0$，且 $c_0$ 是实数，所以
$$\frac{a_0^2}{2}=\frac{4c_0^2}{2}=2|c_0|^2.$$

综合起来：
$$\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2)
=2|c_0|^2+\sum_{n=1}^{\infty}4|c_n|^2
=2|c_0|^2+2\sum_{n=1}^{\infty}\big(|c_n|^2+|c_{-n}|^2\big)
=2\sum_{n=-\infty}^{\infty}|c_n|^2.$$

因此实形式与复形式的 Parseval 等式完全一致。

### 12.2.6 三种收敛再比较：一个具体例子

设 $f(x)=x$（$-\pi < x < \pi$），周期延拓。它的 Fourier 级数是
$$x\sim2\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin nx.$$

- **逐点收敛**：由 Dirichlet 定理，在连续点收敛到 $x$；在 $x=\pm\pi$ 处收敛到 $0$（左右极限平均）。
- **一致收敛**：不一致，因为在 $x=\pm\pi$ 有跳跃，且存在 Gibbs 现象。
- **平方平均收敛**：成立。因为
$$\frac{1}{\pi}\int_{-\pi}^{\pi}x^2\,dx=\frac{2\pi^2}{3},$$
而
$$\sum_{n=1}^{\infty}\frac{4}{n^2}=4\cdot\frac{\pi^2}{6}=\frac{2\pi^2}{3}.$$
两边相等，Parseval 成立，所以 $L^2$ 收敛。

> 这个例子完美说明：$L^2$ 收敛最宽容——它不在乎跳跃点附近的局部过冲，只关心整体能量。

### 12.2.7 例题：用 Parseval 求数项级数和

**例 12.5**：对 $f(x)=x$（$-\pi,\pi$），用 Parseval 求 $\sum\limits_{n=1}^{\infty}\dfrac{1}{n^2}$。

已知 $b_n=\dfrac{2(-1)^{n+1}}{n}$，$a_n=0$。

左边：
$$\|f\|_{L^2}^2=\frac{1}{\pi}\int_{-\pi}^{\pi}x^2\,dx=\frac{1}{\pi}\cdot\frac{2\pi^3}{3}=\frac{2\pi^2}{3}.$$

右边：
$$\sum_{n=1}^{\infty}b_n^2=\sum_{n=1}^{\infty}\frac{4}{n^2}=4\sum_{n=1}^{\infty}\frac{1}{n^2}.$$

由 Parseval：
$$\frac{2\pi^2}{3}=4\sum_{n=1}^{\infty}\frac{1}{n^2},$$
所以
$$\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{\pi^2}{6}.$$

**例 12.5'**：对 $f(x)=x^2$（$-\pi\le x\le\pi$），用 Parseval 求 $\sum\limits_{n=1}^{\infty}\dfrac{1}{n^4}$。

由例 12.3'，$a_0=\dfrac{2\pi^2}{3}$，$a_n=\dfrac{4(-1)^n}{n^2}$，$b_n=0$。

左边：
$$\|f\|_{L^2}^2=\frac{1}{\pi}\int_{-\pi}^{\pi}x^4\,dx=\frac{1}{\pi}\cdot\frac{2\pi^5}{5}=\frac{2\pi^4}{5}.$$

右边：
$$\frac{a_0^2}{2}+\sum_{n=1}^{\infty}a_n^2
=\frac{1}{2}\cdot\frac{4\pi^4}{9}+\sum_{n=1}^{\infty}\frac{16}{n^4}
=\frac{2\pi^4}{9}+16\sum_{n=1}^{\infty}\frac{1}{n^4}.$$

由 Parseval：
$$\frac{2\pi^4}{5}=\frac{2\pi^4}{9}+16\sum_{n=1}^{\infty}\frac{1}{n^4},$$
$$16\sum_{n=1}^{\infty}\frac{1}{n^4}=\frac{2\pi^4}{5}-\frac{2\pi^4}{9}=\frac{18\pi^4-10\pi^4}{45}=\frac{8\pi^4}{45},$$
所以
$$\sum_{n=1}^{\infty}\frac{1}{n^4}=\frac{\pi^4}{90}.$$

> 这两个例子展示了 Parseval 的杀手锏作用：把函数的 $L^2$ 能量（一个积分）和 Fourier 系数的平方和（一个级数）联系起来，从而求出看似无关的数项级数和。

### 12.2.8 半区间上的 Parseval

如果 $f$ 定义在 $[0,L]$ 上，展成正弦级数或余弦级数，Parseval 等式也要相应调整。

**正弦级数**：
$$\frac{2}{L}\int_0^L|f(x)|^2\,dx=\sum_{n=1}^{\infty}b_n^2.$$

**余弦级数**：
$$\frac{2}{L}\int_0^L|f(x)|^2\,dx=\frac{a_0^2}{2}+\sum_{n=1}^{\infty}a_n^2.$$

这里的系数 $a_n,b_n$ 是半区间展开系数（前面带 $\dfrac{2}{L}\int_0^L$）。

> 记忆方法：半区间的 Parseval 就是把全区间的 $\dfrac{1}{\pi}\int_{-\pi}^{\pi}$ 换成 $\dfrac{2}{L}\int_0^L$，和系数公式前面的因子一致。

### 12.2.9 Riesz–Fischer 定理

**定理（陈述）**：对任意满足
$$\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2) < \infty$$
的系数序列，存在唯一的 $f\in L^2[-\pi,\pi]$（相差零测集），以这些 $a_n,b_n$ 为 Fourier 系数。

**意义**：Fourier 变换把 $L^2[-\pi,\pi]$ 空间中的函数与平方可和的序列空间 $\ell^2$ 一一对应起来，而且 Parseval 等式说明这个对应保持长度（等距同构）。这是 Hilbert 空间理论的优美结论。

> 对我们计算而言，Riesz–Fischer 定理保证：只要你算出的系数平方和收敛，就一定对应某个 $L^2$ 函数。换句话说，不用担心「系数算出来但不存在这样的函数」。

> [要点]
>
> - $L^2$ 收敛只要求函数平方可积，条件最宽；它意味着整体能量误差趋于零，不要求每一点都收敛。
> - Bessel 不等式：系数平方和 $\le$ 函数能量；Parseval 等式：对 $L^2$ 函数等号成立。
> - Fourier 部分和是最佳 $N$ 阶三角逼近，误差可由 Parseval 直接计算。
> - Parseval 是求 $\sum 1/n^2$、$\sum 1/n^4$ 等数项级数和的核心工具。
> - 半区间展开有对应的 Parseval 形式，注意系数前面的因子。

---

## 12.3 收敛性定理

> 🟡 **考试重要度：中等** | Dirichlet 定理的应用（判断间断点收敛值）常作为展开题的一部分

### 12.3.1 Dirichlet 定理（陈述与证明思路）

**Dirichlet 条件**：$f$ 在 $[-\pi,\pi]$ 上分段光滑（分段 $C^1$，有限个第一类间断点），作 $2\pi$ 周期延拓。

**Dirichlet 定理**：在任意点 $x_0$，Fourier 级数 $S_f(x_0)$ 收敛到
$$\frac{f(x_0+)+f(x_0-)}{2}.$$
特别地，若 $f$ 在 $x_0$ 连续，则 $S_f(x_0)=f(x_0)$；在跳跃间断处收敛到**左右极限的平均**（Gibbs 现象：间断点附近部分和有过冲，但不影响积分意义下的收敛）。

**证明思路（概要）**：

1. **Dirichlet 核** $D_N(x)=\dfrac12+\sum_{n=1}^{N}\cos nx=\dfrac{\sin\big(N+\tfrac12\big)x}{2\sin\tfrac{x}{2}}$。利用复指数恒等式
   $$\sum_{n=-N}^{N}e^{inx}=\frac{\sin\big(N+\tfrac12\big)x}{\sin\tfrac{x}{2}}$$
   与系数定义，部分和写为卷积型积分
   $$S_N(f)(x)=\frac{1}{\pi}\int_{-\pi}^{\pi}f(t)D_N(x-t)\,dt.$$
2. **核的性质**：$D_N$ 为偶函数；$\dfrac{1}{\pi}\int_{-\pi}^{\pi}D_N=1$（归一化）。注意 $D_N$ 不是正核，不能把它简单当成普通概率密度；远离 $0$ 的振荡贡献要用 Dirichlet 判别或 Riemann-Lebesgue 型估计处理。
3. **连续点**：设 $x_0$ 连续。拆积分 $I_1=\int_{|t-x_0| < \delta}$、$I_2=\int_{|t-x_0|\ge\delta}$。$I_1$ 中 $f(t)\approx f(x_0)$，结合归一化给出主项；$I_2$ 由于核的快速振荡趋于 $0$，故 $S_N(f)(x_0)\to f(x_0)$。
4. **跳跃点**：设 $f(x_0+)\neq f(x_0-)$。换元 $t=x_0+u$，核的对称性使左右贡献分别趋于 $f(x_0+)$ 与 $f(x_0-)$ 的加权平均，极限为 $\tfrac12[f(x_0+)+f(x_0-)]$。

**一致收敛的补充**：若 $f$ 连续且周期拼接处也连续，并且正则性足够强（例如 $f$ 分段 $C^2$），则 Fourier 级数在 $\mathbb{R}$ 上**一致收敛**于 $f$。若只知道 $f$ 分段光滑，通常只能直接保证逐点收敛；遇到跳跃间断时不可能一致收敛到原函数。

:::callout Gibbs 现象
在跳跃间断附近，$S_N(f)$ 出现过冲（约 9% 跃变量），随 $N$ 增大过冲区变窄但不消失。这不与 Dirichlet 定理矛盾——定理说的是**逐点极限**在间断点等于平均值，而非一致收敛。
:::

### 12.3.2 平方平均收敛的证明思路

**定理**：若 $f\in L^2[-\pi,\pi]$，则 $\|f-S_N(f)\|_{L^2}\to 0$。

**证明思路**：

1. **三角多项式稠密**：$L^2[-\pi,\pi]$ 中任意函数可被三角多项式在 $L^2$ 范数下任意逼近。经典路径之一：Fejér 和 $F_N(f)$（Cesàro 平均）一致收敛于连续 $f$，从而 $L^2$ 收敛；对一般 $f\in L^2$ 用连续函数稠密性过渡。
2. **正交投影**：$S_N(f)$ 是到 $\mathrm{span}\{1,\cos kx,\sin kx\}_{k\le N}$ 的正交投影，故 $\|f-S_N(f)\|_{L^2}$ 等于 $f$ 到该子空间的最小距离。
3. 对给定 $\varepsilon>0$，取三角多项式 $T_M$ 使 $\|f-T_M\|_{L^2} < \varepsilon/2$。当 $N\ge M$ 时，$T_M$ 落在 $S_N$ 的子空间内，而 $S_N(f)$ 是该子空间上对 $f$ 的最佳逼近，故
   $$\|f-S_N(f)\|_{L^2}\le\|f-T_M\|_{L^2} < \varepsilon/2.$$
4. 因此 $N\to\infty$ 时 $\|f-S_N(f)\|_{L^2}\to 0$，Parseval 等式随之成立。

**Riesz–Fischer 定理（陈述）**：对任意满足 $\sum(|a_n|^2+|b_n|^2) < \infty$ 的系数序列，存在 $f\in L^2[-\pi,\pi]$ 以之为 Fourier 系数。即 Fourier 映射是 $L^2$ 到 $\ell^2$ 的**等距同构**（在 Parseval 意义下）。

**对比**：Dirichlet 定理要**分段光滑**（点态）；$L^2$ 收敛只需**平方可积**，但不要求逐点极限等于 $f$。存在连续函数其 Fourier 级数在某点发散（Du Bois-Reymond 型反例，超出本课程范围）；但 $L^2$ 理论保证「几乎处处」意义下 Cesàro 平均收敛（Fejér 定理）。

**Fejér 定理（补充）**：对连续周期 $f$，Fejér 和 $\sigma_N(f)=\dfrac{1}{N+1}\sum_{k=0}^{N}S_k(f)$ 一致收敛于 $f$。说明三角级数在 Cesàro 意义下表现良好，而 Gibbs 现象只影响 $S_N$ 而非 $\sigma_N$。

**例 12.6** $f(x)=\begin{cases}1,&0 < x < \pi,\\-1,&-\pi < x < 0,\end{cases}$ 周期 $2\pi$。在 $x=0$ 处 $f(0+)=1,\ f(0-)=-1$，Dirichlet 给出 $S_f(0)=0$；而 $\|f-S_N\|_{L^2}\to 0$ 仍成立。

**例 12.6'** 锯齿波 $f(x)=x$（$-\pi < x < \pi$），周期 $2\pi$。此即例 12.1 的函数。它在每个周期内部连续，但在 $x=\pi+2k\pi$ 处有跳跃间断：$f(\pi-)=\pi,\ f(\pi+)=f(-\pi+)=-\pi$。Fourier 系数 $b_n=\dfrac{2(-1)^{n+1}}{n}$；级数在连续点收敛到 $f(x)$，在跳跃点收敛到 $\dfrac{\pi+(-\pi)}2=0$。

---

## 12.4 Fourier 积分与 Fourier 变换

> 🟢 **考试重要度：了解** | 期末偶尔考 Dirichlet 积分 $\int_0^\infty \frac{\sin x}{x}dx=\pi/2$ 的应用

### 12.4.1 从周期到非周期

当 $f$ 定义在全直线 $\mathbb{R}$ 上且**非周期**时，可视为周期 $2L$ 的极限 $L\to\infty$。记 $\omega_n=\dfrac{n\pi}{L}$，$\Delta\omega=\dfrac{\pi}{L}$，复系数
$$c_n=\frac{1}{2L}\int_{-L}^{L}f(x)e^{-i\omega_n x}\,dx\approx\frac{\Delta\omega}{2\pi}\int_{-\infty}^{\infty}f(x)e^{-i\omega x}\,dx.$$
形式极限给出 **Fourier 变换**
$$\hat{f}(\omega)=\mathcal{F}[f](\omega)=\int_{-\infty}^{\infty}f(x)e^{-i\omega x}\,dx,$$
**逆变换**
$$f(x)=\mathcal{F}^{-1}[\hat{f}](x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\hat{f}(\omega)e^{i\omega x}\,d\omega.$$
（常数 $\dfrac{1}{2\pi}$ 的放置依约定不同；本书采用上式。）

**Fourier 积分公式**：在适当条件下（如 $f$ 绝对可积且分段光滑），
$$f(x)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\Big[\int_{-\infty}^{\infty}f(t)e^{-i\omega t}\,dt\Big]e^{i\omega x}\,d\omega.$$

**形式推导**：周期 $2L$ 时 $f(x)=\sum_{n=-\infty}^{\infty}c_n e^{in\pi x/L}$，$c_n=\dfrac{1}{2L}\int_{-L}^{L}f(t)e^{-in\pi t/L}\,dt$。令 $\omega_n=n\pi/L$，$\Delta\omega=\pi/L$，则
$$f(x)\approx\sum_n c_n e^{i\omega_n x}=\sum_n\Big[\frac{\Delta\omega}{2\pi}\int_{-L}^{L}f(t)e^{-i\omega_n t}\,dt\Big]e^{i\omega_n x}\to\frac{1}{2\pi}\int_{-\infty}^{\infty}\hat{f}(\omega)e^{i\omega x}\,d\omega.$$

**收敛性**：若 $f\in L^1(\mathbb{R})$ 且在 $x$ 处满足 Dirichlet 型条件，则上述反演公式在 $x$ 成立；若 $f\in L^2(\mathbb{R})$，则
$$\lim_{R\to\infty}\frac{1}{2\pi}\int_{-R}^{R}\hat{f}(\omega)e^{i\omega x}\,d\omega=f(x)\quad\text{（$L^2$ 意义）}.$$

### 12.4.2 基本性质与常用变换

设 $\mathcal{F}[f]=\hat{f}$，在函数足够正则时：

| 性质 | 公式 |
|------|------|
| 线性 | $\mathcal{F}[\alpha f+\beta g]=\alpha\hat{f}+\beta\hat{g}$ |
| 平移 | $\mathcal{F}[f(x-x_0)](\omega)=e^{-i\omega x_0}\hat{f}(\omega)$ |
| 调制 | $\mathcal{F}[e^{i\omega_0 x}f(x)](\omega)=\hat{f}(\omega-\omega_0)$ |
| 微分 | $\mathcal{F}[f'](\omega)=i\omega\hat{f}(\omega)$ |
| 卷积 | $\mathcal{F}[f*g]=\hat{f}\cdot\hat{g}$，$(f*g)(x)=\int f(x-t)g(t)\,dt$ |

**卷积定理的证明梗概**：$\mathcal{F}[f*g](\omega)=\int\int f(x-t)g(t)e^{-i\omega x}\,dt\,dx$，换元 $u=x-t$ 得 $\int f(u)e^{-i\omega u}\,du\cdot\int g(t)e^{-i\omega t}\,dt=\hat{f}(\omega)\hat{g}(\omega)$。

**Plancherel 定理**：对 $f\in L^2(\mathbb{R})$，$\mathcal{F}$ 可延拓为 $L^2$ 上的等距同构（差一个 $2\pi$ 因子），即 Parseval 等式对 $L^2$ 函数成立；这是 Fourier 变换在 Hilbert 空间框架下的严格表述。

**Parseval（连续情形）**：
$$\int_{-\infty}^{\infty}|f(x)|^2\,dx=\frac{1}{2\pi}\int_{-\infty}^{\infty}|\hat{f}(\omega)|^2\,d\omega.$$

**例 12.7** 矩形脉冲 $f(x)=\begin{cases}1,&|x| < a,\\0,&|x|>a,\end{cases}$
$$\hat{f}(\omega)=\int_{-a}^{a}e^{-i\omega x}\,dx=\frac{2\sin a\omega}{\omega}\quad(\omega\neq 0),\qquad \hat{f}(0)=2a.$$
$\hat{f}$ 为 $\operatorname{sinc}$ 型；$\omega\to\infty$ 时振荡衰减，与 Riemann–Lebesgue 引理一致。物理上，窄脉冲（小 $a$）⇒ 频谱展宽。

**例 12.8** 高斯函数 $f(x)=e^{-x^2/2}$。利用 $\int_{-\infty}^{\infty}e^{-ax^2+bx}\,dx=\sqrt{\pi/a}\,e^{b^2/(4a)}$ 得
$$\hat{f}(\omega)=\sqrt{2\pi}\,e^{-\omega^2/2},$$
即高斯的 Fourier 变换仍是高斯（相差常数与尺度）。

**例 12.9** 用微分性质求 $\mathcal{F}[e^{-|x|}]$。令 $g(x)=e^{-|x|}$，则 $-g''+g=2\delta(x)$（分布意义），变换得 $(\omega^2+1)\hat{g}(\omega)=2$，故 $\hat{g}(\omega)=\dfrac{2}{\omega^2+1}$（Lorentz 型谱）。

**例 12.10** 求 $\mathcal{F}[\mathbf{1}_{[-a,a]}(x)]$ 与 $\mathcal{F}[\sin\omega_0 x]$。前者即例 12.7；后者 $\mathcal{F}[\sin\omega_0 x]=\dfrac{i}{2}\big[\delta(\omega+\omega_0)-\delta(\omega-\omega_0)\big]$（分布意义），体现单频信号的线谱。

### 12.4.3 应用简述

**偏微分方程**：一维热方程 $u_t=ku_{xx}$ 在 $[-\pi,\pi]$ 上分离变量 $u=T(t)X(x)$ 得 $X''+\lambda X=0$，本征函数为 $\sin nx,\cos nx$，解展开为 Fourier 级数；无穷长 rod 上用 Fourier 变换把 PDE 化为 $\hat{u}_t=-k\omega^2\hat{u}$，形式解 $\hat{u}(\omega,t)=\hat{u}_0(\omega)e^{-k\omega^2 t}$。

**信号处理**：$|\hat{f}(\omega)|$ 为频谱幅度；卷积定理使滤波（乘窗）对应时域卷积，是数字信号处理的基础。

**Heisenberg 不确定性（直观）**：在 $L^2$ 意义下，$f$ 与其 Fourier 变换不能同时高度局域——$\|xf\|\cdot\|\omega\hat{f}\|$ 有下界（量子力学中位置与动量的对偶关系与此同构）。严格表述需分布理论，此处仅作背景联系。

:::callout $2\pi$ 约定的提醒
不同教材在 $\mathcal{F}$、$\mathcal{F}^{-1}$ 前放置 $2\pi$ 的方式不同（有的在正变换、有的在逆变换、有的各放 $\sqrt{2\pi}$）。本书采用 $\hat{f}(\omega)=\int f e^{-i\omega x}\,dx$，$f(x)=\dfrac{1}{2\pi}\int\hat{f}(\omega)e^{i\omega x}\,d\omega$。换书查表时务必核对 Parseval 式中的系数。
:::

> [要点]
>
> - 周期 $\to$ 离散频谱（Fourier 级数）；非周期 $\to$ 连续频谱（Fourier 积分）。
> - 变换把微分变成乘法，使常系数线性 PDE 化为代数方程（如热方程、波动方程）。
> - 使用前先确认 $f$ 属于 $L^1$ 或 $L^2$，并核对所用教材的 $2\pi$ 约定。

---

## 本章综合习题（真题精选）

**[2025-三]** 将 $f(x)=x$ 在 $[0,\pi]$ 上展开为余弦级数，并计算 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{(2n-1)^2}$，$\displaystyle\sum_{n=1}^{\infty}\frac{1}{(2n-1)^4}$，以及 $\displaystyle\sum_{n=1}^{\infty}\frac{\sin(2n-1)x}{(2n-1)^3}$。

解析要点：偶延拓得 $a_0=\pi$，$a_n=\frac{2}{\pi}\cdot\frac{(-1)^n-1}{n^2}$（仅奇数项非零）。由 Dirichlet 定理：
$$x=\frac{\pi}{2}-\frac{4}{\pi}\sum_{k=1}^{\infty}\frac{\cos(2k-1)x}{(2k-1)^2},\quad x\in[0,\pi].$$

取 $x=0$：$\sum\frac{1}{(2k-1)^2}=\frac{\pi^2}{8}$。用 Parseval：$\sum\frac{1}{(2k-1)^4}=\frac{\pi^4}{96}$。对级数在 $[0,x]$ 逐项积分得
$$\sum_{n=1}^{\infty}\frac{\sin(2n-1)x}{(2n-1)^3}=\frac{\pi}{8}(\pi x-x^2).$$

---

**[2024-一(1)]** 将 $f(x)=1-\frac{x}{\pi}$（$0\le x\le\pi$）展为正弦级数并求和函数 $S(x)$，计算 $S(-3)$ 和 $S(12)$。

解析要点：奇延拓后以 $2\pi$ 为周期，记延拓函数为 $F$。$b_n=\frac{2}{\pi}\int_0^\pi(1-\frac{x}{\pi})\sin nx\,dx=\frac{2}{n\pi}$（所有 $n$），故
$$S(x)=\frac{2}{\pi}\sum_{n=1}^\infty\frac{\sin nx}{n}.$$
在连续点 $S(x)=F(x)$，在跳跃点取左右极限平均。因 $-3\in(-\pi,0)$，
$$S(-3)=F(-3)=-F(3)=-\left(1-\frac{3}{\pi}\right)=\frac{3-\pi}{\pi}.$$
又 $12-4\pi\in(-\pi,0)$，所以
$$S(12)=F(12-4\pi)=-\left(1-\frac{4\pi-12}{\pi}\right)=\frac{3\pi-12}{\pi}.$$

---

**[2024-二]** 设
$$f(x)=\begin{cases}\dfrac{\pi-1}{2}x,&0\le x\le1,\\[4pt]\dfrac{\pi-x}{2},&1 < x\le\pi,\end{cases}$$
将 $f(x)$ 展为正弦级数，并利用 Parseval 证明 $\displaystyle\sum_{n=1}^{\infty}\frac{\sin^2 n}{n^4}=\frac{(\pi-1)^2}{6}$。

解析要点：$f(0)=f(\pi)=0$，分段求导得 $f'(x)=\frac{\pi-1}{2}$（$0 < x < 1$），$f'(x)=-\frac12$（$1 < x < \pi$）。分部积分：
$$b_n=\frac{2}{\pi}\int_0^\pi f(x)\sin nx\,dx
=\frac{2}{\pi n}\int_0^\pi f'(x)\cos nx\,dx
=\frac{2}{\pi n}\left[\frac{\pi-1}{2}\int_0^1\cos nx\,dx-\frac12\int_1^\pi\cos nx\,dx\right]
=\frac{\sin n}{n^2}.$$
于是 $f(x)\sim\sum_{n=1}^\infty\dfrac{\sin n}{n^2}\sin nx$。由 Parseval（半区间正弦形式）
$$\sum_{n=1}^{\infty}b_n^2=\frac{2}{\pi}\int_0^\pi f^2(x)\,dx.$$
而
$$\int_0^\pi f^2(x)\,dx=\int_0^1\frac{(\pi-1)^2x^2}{4}\,dx+\int_1^\pi\frac{(\pi-x)^2}{4}\,dx
=\frac{\pi(\pi-1)^2}{12},$$
故 $\displaystyle\sum_{n=1}^{\infty}\frac{\sin^2 n}{n^4}=\frac{(\pi-1)^2}{6}$。

---

**[2023-三]** 设 $f(x)$ 以 $2\pi$ 为周期，且 $f(x)=\begin{cases}\pi-x,&0\le x\le\pi,\\\pi+x,&-\pi\le x < 0.\end{cases}$ 求 Fourier 级数并计算 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{(2n-1)^3}$ 和 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{(2n-1)^4}$。

解析要点：$f$ 为偶函数，$a_n=\frac{4}{\pi(2n-1)^2}$（仅奇数项）。对级数在 $[0,\pi/2]$ 上积分得 $\sum\frac{(-1)^{n-1}}{(2n-1)^3}=\frac{\pi^3}{32}$；Parseval 得 $\sum\frac{1}{(2n-1)^4}=\frac{\pi^4}{96}$。

---

**[2022-二]** $f(x)=\cos^2 x-\sin^2 x+\frac{1}{3}\sin 2x$（$x\in[-\pi,\pi]$）求 Fourier 级数。

解析要点：化简 $f(x)=\cos 2x+\frac{1}{3}\sin 2x$，本身已是有限三角和，故 $a_2=1$，$b_2=\frac{1}{3}$，其余系数为 $0$。

---

**[2022-四]** 将 $f(x)=\begin{cases}1,&|x| < 1,\\0,&1\le|x|\le\pi,\end{cases}$ 展为 Fourier 级数（周期 $2\pi$），由此求 $\displaystyle\sum_{n=1}^{\infty}\frac{\sin n}{n}$ 和 $\displaystyle\sum_{n=1}^{\infty}\frac{\sin^2 n}{n^2}$。

解析要点：$f$ 偶，$a_0=\frac{2}{\pi}$，$a_n=\frac{2\sin n}{n\pi}$。取 $x=0$（连续点）：$1=\frac{1}{\pi}+\frac{2}{\pi}\sum\frac{\sin n}{n}$，得 $\sum\frac{\sin n}{n}=\frac{\pi-1}{2}$。Parseval：$\sum\frac{\sin^2 n}{n^2}=\frac{\pi-1}{2}$。

---

**[2021-六]** 将 $f(x)=\frac{\pi}{2}-x$（$x\in[0,\pi]$）展为正弦级数，由此求 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{(2n-1)^2}$ 和 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^4}$。

解析要点：直接计算
$$b_n=\frac{2}{\pi}\int_0^\pi\left(\frac{\pi}{2}-x\right)\sin nx\,dx
=\frac{1+(-1)^n}{n}.$$
故 $n$ 奇时 $b_n=0$，$n=2k$ 时 $b_{2k}=\dfrac1k$，正弦级数为
$$\frac{\pi}{2}-x\sim\sum_{k=1}^{\infty}\frac{\sin 2kx}{k},\quad 0 < x < \pi.$$
Parseval 给出
$$\sum_{k=1}^{\infty}\frac1{k^2}=\frac{2}{\pi}\int_0^\pi\left(\frac{\pi}{2}-x\right)^2dx=\frac{\pi^2}{6},$$
从而 $\sum_{n=1}^{\infty}\frac{1}{(2n-1)^2}=\frac{\pi^2}{8}$。再对级数在 $[0,x]$ 上逐项积分：
$$\sum_{k=1}^\infty\frac{1-\cos 2kx}{2k^2}=\frac{\pi x}{2}-\frac{x^2}{2},$$
即 $\sum_{k=1}^\infty\frac{\cos 2kx}{k^2}=\frac{\pi^2}{6}-\pi x+x^2$。对这个余弦级数再用 Parseval，可得 $\sum_{k=1}^{\infty}\frac1{k^4}=\frac{\pi^4}{90}$。

---

**[2023-四] (Dirichlet 积分应用)** 利用 $\int_0^{+\infty}\frac{\sin x}{x}\,dx=\frac\pi2$ 计算 $\int_0^{+\infty}\frac{\sin(ax)\sin(bx)}{x^2}\,dx$（$0 < a < b$）。

解析要点：固定 $b$，令
$$F(a)=\int_0^\infty\frac{\sin(ax)\sin(bx)}{x^2}\,dx,\quad 0\le a < b.$$
对参数 $a$ 求导：
$$F'(a)=\int_0^\infty\frac{\cos(ax)\sin(bx)}{x}\,dx
=\frac12\int_0^\infty\frac{\sin((b+a)x)+\sin((b-a)x)}{x}\,dx=\frac{\pi}{2}.$$
又 $F(0)=0$，故 $F(a)=\dfrac{\pi a}{2}$。

---

**备考提示**：
- 展开时**先判断奇偶**，可省一半计算
- Parseval 求数项级数：先展开得系数 → 写出 Parseval 等式 → 解出目标级数
- 逐项积分：对已知级数在 $[0,x]$ 积分可得新级数的和函数
- Dirichlet 定理：间断点收敛到左右极限的平均值
- $\sum\frac{1}{(2n-1)^2}=\frac{\pi^2}{8}$，$\sum\frac{1}{n^2}=\frac{\pi^2}{6}$，$\sum\frac{1}{(2n-1)^4}=\frac{\pi^4}{96}$，$\sum\frac{1}{n^4}=\frac{\pi^4}{90}$ — 这四个结果反复出现



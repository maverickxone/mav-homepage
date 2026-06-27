---
title: "第 12 章 Fourier 分析"
chapter: 5
readTime: 85
description: "Fourier 级数、平方平均收敛、收敛性定理与 Fourier 变换。"
---

前面各章把函数在**空间区域**上积分；本章换一条思路——把「足够好的」函数写成**三角函数（或复指数）的叠加**，在频率域里分析信号与周期现象。Fourier 级数处理周期函数；平方平均收敛给出 $L^2$ 意义下「最佳逼近」；Dirichlet 定理回答何时级数在每一点收敛；Fourier 积分与变换把周期推广到全直线，是偏微分方程、信号处理、量子力学的共同语言。

**本章主线**：正交性 $\Rightarrow$ 系数公式 $\Rightarrow$ 级数展开 $\Rightarrow$ 三种收敛（一致 / 逐点 / 平方平均）$\Rightarrow$ 非周期情形的 Fourier 变换。计算题要分清：周期延拓方式、奇偶性、半区间展开类型；理论题要分清：$L^2$ 收敛条件最宽，Dirichlet 条件保证逐点收敛到 $\tfrac12[f_++f_-]$。

---

## 12.1 Fourier 级数

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

**例 12.1** 求 $f(x)=x$（$-\pi<x<\pi$）的 Fourier 级数，并周期延拓到 $\mathbb{R}$。

$f$ 为奇函数，故 $a_n=0$。$b_n=\dfrac{1}{\pi}\int_{-\pi}^{\pi} x\sin nx\,dx$。分部积分：
$$\int_{-\pi}^{\pi} x\sin nx\,dx=\Big[-\frac{x\cos nx}{n}\Big]_{-\pi}^{\pi}+\frac{1}{n}\int_{-\pi}^{\pi}\cos nx\,dx
=\frac{(-1)^{n+1}2\pi}{n}.$$
故 $b_n=\dfrac{2(-1)^{n+1}}{n}$，级数为
$$x\sim\sum_{n=1}^{\infty}\frac{2(-1)^{n+1}}{n}\sin nx,\quad x\in(-\pi,\pi).$$
在 $x=\pm\pi$ 及整数倍处，级数收敛到 $0$（跳跃间断点的中点），见 §12.3。

**例 12.2** 矩形波：$f(x)=1$（$0<x<\pi$），$f(x)=-1$（$-\pi<x<0$），以 $2\pi$ 为周期。$f$ 奇，$b_n=\dfrac{2}{\pi}\int_0^{\pi}\sin nx\,dx=\dfrac{2}{n\pi}[1-(-1)^n]$，故
$$f(x)\sim\frac{4}{\pi}\sum_{k=0}^{\infty}\frac{\sin(2k+1)x}{2k+1}.$$
在 $x=0$ 处级数收敛到 $0$（跳跃平均）；在 $(0,\pi)$ 内收敛到 $1$。

**例 12.2'** 方波 $f(x)=x$（$-\pi\le x\le\pi$），周期 $2\pi$。$f$ 奇，$b_n=\dfrac{2(-1)^{n+1}}{n}$，即
$$x\sim 2\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin nx.$$
与例 12.1 差一因子 $2$ 是因为区间端点约定不同；在 $(-\pi,\pi)$ 内结论一致。

### 12.1.3 有限区间上的展开与延拓

函数 $f$ 仅定义在 $[0,L]$（或 $[-L,L]$）上时，**没有**天然的周期；要写成三角级数，须先**延拓**成周期函数，再取 Fourier 级数。延拓方式决定级数形式。

**偶延拓（余弦级数）**：定义
$$F_{\mathrm{even}}(x)=\begin{cases} f(x), & 0\le x\le L,\\ f(-x), & -L\le x<0, \end{cases}$$
再以 $2L$ 为周期延拓。$F_{\mathrm{even}}$ 为偶函数，$b_n=0$，得**余弦级数**
$$f(x)\sim\frac{a_0}{2}+\sum_{n=1}^{\infty}a_n\cos\frac{n\pi x}{L},\quad x\in[0,L],$$
$$a_0=\frac{2}{L}\int_0^L f(x)\,dx,\qquad a_n=\frac{2}{L}\int_0^L f(x)\cos\frac{n\pi x}{L}\,dx.$$

**奇延拓（正弦级数）**：定义
$$F_{\mathrm{odd}}(x)=\begin{cases} f(x), & 0\le x\le L,\\ -f(-x), & -L\le x<0, \end{cases}$$
周期 $2L$ 延拓。得**正弦级数**
$$f(x)\sim\sum_{n=1}^{\infty}b_n\sin\frac{n\pi x}{L},\quad
b_n=\frac{2}{L}\int_0^L f(x)\sin\frac{n\pi x}{L}\,dx.$$

**半区间展开**：在 $[0,\pi]$ 上常取 $L=\pi$。同一 $f$ 的余弦展开与正弦展开**一般不同**——它们对应不同的周期延拓，分别适合 Neumann 型与 Dirichlet 型边界条件的偏微分方程问题。

**偶延拓的几何意义**：把 $[0,L]$ 上的图像关于 $x=0$ 镜像到 $[-L,0]$，再以 $2L$ 为周期平铺。图像在 $x=0,L,\pm L,\ldots$ 处连续（若 $f$ 在端点连续），适合要求边界斜率为零（绝热边界）的扩散问题。

**奇延拓的几何意义**：镜像时取负值，图像过原点（若 $f(0)=0$）并在 $x=\pm L$ 处可能出现跳跃。适合 Dirichlet 边界 $u=0$ 的弦振动、热传导问题。

**系数公式为何是 $\dfrac{2}{L}\int_0^L$**：在 $[0,L]$ 上 $\{\cos\tfrac{n\pi x}{L}\}$ 与 $\{\sin\tfrac{n\pi x}{L}\}$ 关于权 $\tfrac{2}{L}\int_0^L$ 正交归一；偶（奇）延拓后全区间 $[-L,L]$ 上的标准 Fourier 系数化简即得上式。

**例 12.3** 在 $[0,\pi]$ 上 $f(x)=x(\pi-x)$。

**余弦展开**：$a_0=\dfrac{2}{\pi}\int_0^{\pi}x(\pi-x)\,dx=\dfrac{2}{\pi}\Big[\dfrac{\pi x^2}{2}-\dfrac{x^3}{3}\Big]_0^{\pi}=\dfrac{\pi^2}{3}$。
$$a_n=\frac{2}{\pi}\int_0^{\pi}x(\pi-x)\cos nx\,dx.$$
分部积分两次（或利用 $x(\pi-x)$ 关于 $x=\pi/2$ 对称），得 $a_n=-\dfrac{2}{n^2}[1+(-1)^n]$：$n$ 偶时 $a_n=0$；$n=2k+1$ 时 $a_{2k+1}=-\dfrac{4}{(2k+1)^2}$。故
$$x(\pi-x)\sim\frac{\pi^2}{6}-\frac{4}{\pi}\sum_{k=0}^{\infty}\frac{\cos(2k+1)x}{(2k+1)^2},\quad x\in[0,\pi].$$

**正弦展开**：$b_n=\dfrac{2}{\pi}\int_0^{\pi}x(\pi-x)\sin nx\,dx$。设 $I_n=\int_0^{\pi}x(\pi-x)\sin nx\,dx$，分部积分得 $I_n=\dfrac{2\pi}{n^2}[1-(-1)^n]$，故 $b_n=\dfrac{4\big(1-(-1)^n\big)}{\pi n^3}$：$n$ 偶时 $b_n=0$；$n=2k+1$ 时 $b_{2k+1}=\dfrac{8}{\pi(2k+1)^3}$。

**例 12.3'** $f(x)=x^2$（$-\pi\le x\le\pi$），周期 $2\pi$。$f$ 偶，$b_n=0$。$a_0=\dfrac{2}{\pi}\int_0^{\pi}x^2\,dx=\dfrac{2\pi^2}{3}$；$a_n=\dfrac{2}{\pi}\int_0^{\pi}x^2\cos nx\,dx=\dfrac{4(-1)^n}{n^2}$。故
$$x^2\sim\frac{\pi^2}{3}+4\sum_{n=1}^{\infty}\frac{(-1)^n}{n^2}\cos nx.$$
取 $x=\pi$ 得 $\pi^2\sim\dfrac{\pi^2}{3}+4\sum\dfrac{1}{n^2}$，即 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{\pi^2}{6}$（Euler 问题；亦可用 Parseval 从 $x$ 的展开得到）。

> [要点]
>
> - **余弦级数** = 偶延拓 + 全区间展开；**正弦级数** = 奇延拓。
> - 系数公式中 $\dfrac{2}{L}\int_0^L$ 来自「半区间正交归一化」。
> - 延拓在端点 $0,L$ 处的值影响级数在边界点的收敛（通常收敛到 $\tfrac12[f(x_0+)+f(x_0-)]$）。

### 12.1.4 复数形式的 Fourier 级数

Euler 公式 $e^{inx}=\cos nx+i\sin nx$ 把三角系化为指数系 $\{e^{inx}\}_{n\in\mathbb{Z}}$。在 $[-\pi,\pi]$ 上
$$\int_{-\pi}^{\pi} e^{inx}\,e^{-imx}\,dx=2\pi\delta_{nm}.$$
设
$$f(x)\sim\sum_{n=-\infty}^{\infty}c_n e^{inx},\qquad
c_n=\frac{1}{2\pi}\int_{-\pi}^{\pi} f(x)e^{-inx}\,dx.$$
与实系数的关系：
$$c_0=\frac{a_0}{2},\quad c_n=\frac{a_n-ib_n}{2}\ (n>0),\quad c_{-n}=\overline{c_n}=\frac{a_n+ib_n}{2}.$$
若 $f$ 为**实值函数**，则 $c_{-n}=\overline{c_n}$（Hermitian 对称）。

**一般周期 $2L$**：
$$f(x)\sim\sum_{n=-\infty}^{\infty}c_n e^{in\pi x/L},\qquad
c_n=\frac{1}{2L}\int_{-L}^{L} f(x)e^{-in\pi x/L}\,dx.$$

**实部与虚部**：$f$ 实值时 $c_{-n}=\overline{c_n}$；$a_n=c_n+c_{-n}=2\operatorname{Re}c_n$，$b_n=i(c_{-n}-c_n)=-2\operatorname{Im}c_n$（$n>0$）。计算时可先求 $c_n$，再还原 $a_n,b_n$，往往比分部积分更省事。

**例 12.4** $f(x)=e^x$（$-\pi<x<\pi$），周期 $2\pi$ 延拓。
$$c_n=\frac{1}{2\pi}\int_{-\pi}^{\pi}e^x e^{-inx}\,dx=\frac{1}{2\pi}\int_{-\pi}^{\pi}e^{(1-in)x}\,dx
=\frac{1}{2\pi(1-in)}\big[e^{(1-in)\pi}-e^{-(1-in)\pi}\big]
=\frac{(-1)^{n+1}}{\pi(1-in)}\sinh\pi.$$
实部、虚部分别对应 $\cos nx$、$\sin nx$ 的系数；$|c_n|\sim C/n$，级数一致收敛。

**复形式计算 $f(x)=x$（$-\pi,\pi$）**：$c_n=\dfrac{1}{2\pi}\int_{-\pi}^{\pi}x e^{-inx}\,dx$。$n=0$ 时 $c_0=0$；$n\neq 0$ 时分部积分得 $c_n=\dfrac{i(-1)^n}{n}$，故
$$x\sim\sum_{n\neq 0}\frac{i(-1)^n}{n}e^{inx}=2\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n}\sin nx,$$
与例 12.1 一致。

:::callout 为何引入复形式
复指数 $e^{inx}$ 在求导、卷积、偏微分方程（如热方程分离变量）中运算更简洁；物理上 $|c_n|^2$ 直接给出第 $n$ 个频率分量的能量（Parseval，§12.2）。对称性 $c_{-n}=\overline{c_n}$ 保证实函数的级数仍为实值。
:::

---

## 12.2 平方平均收敛

### 12.2.1 $L^2$ 内积与正交投影

设 $f,g\in L^2[-\pi,\pi]$（平方可积），内积
$$\langle f,g\rangle=\frac{1}{\pi}\int_{-\pi}^{\pi}f(x)g(x)\,dx,\qquad
\|f\|_{L^2}=\sqrt{\langle f,f\rangle}=\sqrt{\frac{1}{\pi}\int_{-\pi}^{\pi}|f(x)|^2\,dx}.$$
这是 Hilbert 空间 $L^2[-\pi,\pi]$ 上的标准内积；三角函数系在该内积下正交。

**Fourier 部分和**
$$S_N(f)(x)=\frac{a_0}{2}+\sum_{n=1}^{N}\big(a_n\cos nx+b_n\sin nx\big)$$
的系数 $a_n,b_n$ 恰为 $f$ 在 $\cos nx,\sin nx$ 方向上的「坐标」。记 $e_0=1/\sqrt2$，$e_n=\cos nx$（$n\ge1$），$\tilde{e}_n=\sin nx$，则
$$S_N(f)=\sum_{n=0}^{N}\langle f,e_n\rangle e_n+\sum_{n=1}^{N}\langle f,\tilde{e}_n\rangle\tilde{e}_n$$
（在适当归一化下即正交投影）。

**定理（最佳逼近）**：在 $L^2$ 范数下，$S_N(f)$ 使 $\|f-S_N(f)\|_{L^2}$ 达到最小；即对任意次数 $\le N$ 的三角多项式 $T_N$，有
$$\|f-S_N(f)\|_{L^2}\le\|f-T_N\|_{L^2}.$$
**证明要点**：$f-S_N(f)\perp T_N-S_N(f)$（正交补），由勾股定理 $\|f-T_N\|^2=\|f-S_N\|^2+\|T_N-S_N\|^2\ge\|f-S_N\|^2$。

### 12.2.2 Bessel 不等式与 Parseval 等式

记 $f_n=\cos nx$（$n\ge0$，$f_0=1/\sqrt2$ 归一化亦可）、$g_n=\sin nx$（$n\ge1$）。正交归一系 $\{e_n\}$ 下，部分和系数满足
$$\sum_{n=0}^{N}|c_n|^2\le\|f\|_{L^2}^2\quad\text{（Bessel 不等式）},$$
其中 $c_n$ 为 Fourier 系数（复形式或实形式等价）。等号对一切 $N$ 成立当且仅当 $f\in\mathrm{span}\{e_n\}_{n\le N}$；对无穷级数，等号成立即 Parseval。当 $N\to\infty$ 时，若 $f\in L^2$，则
$$\|f-S_N(f)\|_{L^2}\to 0\quad\text{（平方平均收敛）},$$
且 **Parseval 等式**
$$\|f\|_{L^2}^2=\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2)
=\sum_{n=-\infty}^{\infty}|c_n|^2.$$
实形式下 $\tfrac{a_0^2}{2}+\sum(a_n^2+b_n^2)$ 表示信号总能量在频率上的分配。

**证明 Bessel 不等式（概要）**：设 $r_N=f-S_N(f)$。$S_N(f)\perp r_N$（正交投影），故
$$\|f\|_{L^2}^2=\|S_N(f)\|_{L^2}^2+\|r_N\|_{L^2}^2\ge\|S_N(f)\|_{L^2}^2=\sum_{|n|\le N}|c_n|^2.$$
令 $N\to\infty$ 即得 Bessel；平方平均收敛成立时范数极限给出 Parseval。

**实系数形式的 Parseval**：由 $a_n=c_n+\overline{c_{-n}}$、$b_n=i(c_{-n}-c_n)$（$n>0$）及 $c_{-n}=\overline{c_n}$ 可验证
$$\|f\|_{L^2}^2=\frac{1}{\pi}\int_{-\pi}^{\pi}|f|^2=\frac{a_0^2}{2}+\sum_{n=1}^{\infty}(a_n^2+b_n^2).$$

**三种收敛的比较**：

| 收敛类型 | 定义 | 典型条件 |
|----------|------|----------|
| 一致收敛 | $\sup_x\|S_N-f\|\to 0$ | $f$ 分段 $C^1$ 且端点等化（较强） |
| 逐点收敛 | $S_N(x_0)\to f(x_0)$ | Dirichlet 条件 |
| 平方平均 | $\|S_N-f\|_{L^2}\to 0$ | $f\in L^2$（最宽） |

一致 $\Rightarrow$ 逐点（在适当条件下）$\Rightarrow$ 平方平均；反向一般不成立。

:::callout 为何 $L^2$ 收敛最重要
工程与概率中更关心能量 $\int|f|^2$ 而非逐点值；$L^2$ 收敛保证截断级数的能量误差趋于零。数值计算中 $N$ 项部分和在 $L^2$ 意义下已是「最优」$N$ 阶三角逼近，Parseval 给出可检验的误差上界 $\|r_N\|_{L^2}^2=\|f\|_{L^2}^2-\sum_{|n|\le N}|c_n|^2$。
:::

**例 12.5** 对例 12.1 的 $f(x)=x$（$-\pi,\pi$），Parseval 验证
$$\frac{1}{\pi}\int_{-\pi}^{\pi}x^2\,dx=\frac{2\pi^2}{3}=\sum_{n=1}^{\infty}\frac{4}{n^2}=4\cdot\frac{\pi^2}{6}=\frac{2\pi^2}{3}.$$

**例 12.5'** 对 $f(x)=x^2$（例 12.3'），$\|f\|_{L^2}^2=\dfrac{1}{\pi}\int_{-\pi}^{\pi}x^4\,dx=\dfrac{2\pi^4}{5}$。又 $\dfrac{a_0^2}{2}+\sum a_n^2=\dfrac{2\pi^4}{9}+16\sum\dfrac{1}{n^4}$，得 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^4}=\frac{\pi^4}{90}$。

> [要点]
>
> - **逐点收敛** $\neq$ **平方平均收敛**；后者只需 $f\in L^2$，条件更宽。
> - Bessel：系数平方和不超过函数能量；Parseval：等号当且仅当 $L^2$ 意义下展开完整。
> - 数值上截断级数后，Parseval 可用于检验系数计算是否正确。

---

## 12.3 收敛性定理

### 12.3.1 Dirichlet 定理（陈述与证明思路）

**Dirichlet 条件**：$f$ 在 $[-\pi,\pi]$ 上分段光滑（分段 $C^1$，有限个第一类间断点），作 $2\pi$ 周期延拓。

**Dirichlet 定理**：在任意点 $x_0$，Fourier 级数 $S_f(x_0)$ 收敛到
$$\frac{f(x_0+)+f(x_0-)}{2}.$$
特别地，若 $f$ 在 $x_0$ 连续，则 $S_f(x_0)=f(x_0)$；在跳跃间断处收敛到**左右极限的平均**（Gibbs 现象：间断点附近部分和有过冲，但不影响积分意义下的收敛）。

**证明思路（概要）**：

1. **Dirichlet 核** $D_N(x)=\dfrac{\sin\big(N+\tfrac12\big)x}{2\sin\tfrac{x}{2}}$。利用
   $$\sum_{n=-N}^{N}e^{inx}=\frac{\sin\big(N+\tfrac12\big)x}{\sin\tfrac{x}{2}}$$
   与系数定义，部分和写为卷积型积分
   $$S_N(f)(x)=\frac{1}{\pi}\int_{-\pi}^{\pi}f(t)D_N(x-t)\,dt.$$
2. **核的性质**：$D_N$ 为偶函数；$\dfrac{1}{\pi}\int_{-\pi}^{\pi}D_N=1$（归一化）；对固定 $\delta\in(0,\pi)$，$\dfrac{1}{\pi}\int_{\delta\le|x|\le\pi}|D_N(x)|\,dx\to 0$（$N\to\infty$）——能量集中在 $x=0$ 附近，近似 $\delta$ 函数。
3. **连续点**：设 $x_0$ 连续。拆积分 $I_1=\int_{|t-x_0|<\delta}$、$I_2=\int_{|t-x_0|\ge\delta}$。$I_2$ 由控制项趋于 $0$；$I_1$ 中 $f(t)\approx f(x_0)$，结合归一化得 $S_N(f)(x_0)\to f(x_0)$。
4. **跳跃点**：设 $f(x_0+)\neq f(x_0-)$。换元 $t=x_0+u$，核的对称性使左右贡献分别趋于 $f(x_0+)$ 与 $f(x_0-)$ 的加权平均，极限为 $\tfrac12[f(x_0+)+f(x_0-)]$。

**一致收敛的补充**：若 $f$ 连续且以 $2\pi$ 为周期的导数 $f'$ 分段连续，则 Fourier 级数在 $\mathbb{R}$ 上**一致收敛**于 $f$（M 判别法：$|a_n|,|b_n|=O(1/n)$，$\sum 1/n^2$ 收敛 ⇒ 系数可和）。

:::callout Gibbs 现象
在跳跃间断附近，$S_N(f)$ 出现过冲（约 9% 跃变量），随 $N$ 增大过冲区变窄但不消失。这不与 Dirichlet 定理矛盾——定理说的是**逐点极限**在间断点等于平均值，而非一致收敛。
:::

### 12.3.2 平方平均收敛的证明思路

**定理**：若 $f\in L^2[-\pi,\pi]$，则 $\|f-S_N(f)\|_{L^2}\to 0$。

**证明思路**：

1. **三角多项式稠密**：$L^2[-\pi,\pi]$ 中任意函数可被三角多项式在 $L^2$ 范数下任意逼近。经典路径之一：Fejér 和 $F_N(f)$（Cesàro 平均）一致收敛于连续 $f$，从而 $L^2$ 收敛；对一般 $f\in L^2$ 用连续函数稠密性过渡。
2. **正交投影**：$S_N(f)$ 是到 $\mathrm{span}\{1,\cos kx,\sin kx\}_{k\le N}$ 的正交投影，故 $\|f-S_N(f)\|_{L^2}$ 等于 $f$ 到该子空间的最小距离。
3. 对给定 $\varepsilon>0$，取三角多项式 $T_M$ 使 $\|f-T_M\|_{L^2}<\varepsilon/2$。当 $N\ge M$ 时，$T_M$ 落在 $S_N$ 的子空间内，而 $S_N(f)$ 是该子空间上对 $f$ 的最佳逼近，故
   $$\|f-S_N(f)\|_{L^2}\le\|f-T_M\|_{L^2}<\varepsilon/2.$$
4. 因此 $N\to\infty$ 时 $\|f-S_N(f)\|_{L^2}\to 0$，Parseval 等式随之成立。

**Riesz–Fischer 定理（陈述）**：对任意满足 $\sum(|a_n|^2+|b_n|^2)<\infty$ 的系数序列，存在 $f\in L^2[-\pi,\pi]$ 以之为 Fourier 系数。即 Fourier 映射是 $L^2$ 到 $\ell^2$ 的**等距同构**（在 Parseval 意义下）。

**对比**：Dirichlet 定理要**分段光滑**（点态）；$L^2$ 收敛只需**平方可积**，但不要求逐点极限等于 $f$。存在连续函数其 Fourier 级数在某点发散（Du Bois-Reymond 型反例，超出本课程范围）；但 $L^2$ 理论保证「几乎处处」意义下 Cesàro 平均收敛（Fejér 定理）。

**Fejér 定理（补充）**：对连续周期 $f$，Fejér 和 $\sigma_N(f)=\dfrac{1}{N+1}\sum_{k=0}^{N}S_k(f)$ 一致收敛于 $f$。说明三角级数在 Cesàro 意义下表现良好，而 Gibbs 现象只影响 $S_N$ 而非 $\sigma_N$。

**例 12.6** $f(x)=\begin{cases}1,&0<x<\pi,\\-1,&-\pi<x<0,\end{cases}$ 周期 $2\pi$。在 $x=0$ 处 $f(0+)=1,\ f(0-)=-1$，Dirichlet 给出 $S_f(0)=0$；而 $\|f-S_N\|_{L^2}\to 0$ 仍成立。

**例 12.6'** $f(x)=\begin{cases}x,&0\le x<\pi,\\x-2\pi,&-\pi\le x<0,\end{cases}$ 周期 $2\pi$（锯齿波）。$f$ 连续但 $f'(\pi-)=1,\ f'(\pi+)=1$ 在 $x=\pi$ 处导数跳跃。Fourier 系数 $b_n=\dfrac{2(-1)^n}{n}$，级数在 $\mathbb{R}$ 上收敛到 $f$ 的周期延拓；在 $x=\pi+2k\pi$ 处 Dirichlet 值仍为 $\pi$（连续点）。

---

## 12.4 Fourier 积分与 Fourier 变换

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

**例 12.7** 矩形脉冲 $f(x)=\begin{cases}1,&|x|<a,\\0,&|x|>a,\end{cases}$
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

## 本章综合习题（选）

**12.1** 求 $f(x)=|x|$（$-\pi<x<\pi$）的 Fourier 级数（周期 $2\pi$），并讨论在 $x=0,\pm\pi$ 处的收敛值。（$f$ 为偶函数，仅余弦项。）

**12.2** 将 $f(x)=1$（$0<x<\pi$）在 $[0,\pi]$ 上分别作**余弦展开**与**正弦展开**，写出级数并求和函数（在 $(0,\pi)$ 内）。

**12.3** 设 $f(x)=x^2$（$-\pi\le x\le\pi$），周期延拓。求 Fourier 级数，并用 Parseval 等式计算 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2}$。

**12.4** 证明：若 $f\in L^2[-\pi,\pi]$ 且 $a_n=b_n=0$ 对所有 $n\ge1$，则 $f(x)=\dfrac{a_0}{2}$ 几乎处处成立（提示：$S_N(f)\to f$ 于 $L^2$，部分和为零）。

**12.5** 求 $\mathcal{F}[f]$，其中 $f(x)=e^{-\alpha|x|}$（$\alpha>0$）。验证 Parseval 等式 $\displaystyle\int_{-\infty}^{\infty}|f|^2=\frac{1}{2\pi}\int_{-\infty}^{\infty}|\hat{f}|^2$。

**提示概要**：12.1 注意 $|x|$ 为偶函数；12.2 正弦展开在 $(0,\pi)$ 内和为 $1$，余弦展开和为 $1$ 但延拓不同；12.3 见例 12.3'；12.4 用 $L^2$ 完备性与正交系；12.5 化为 $\dfrac{2\alpha}{\alpha^2+\omega^2}$，左侧积分为 $\dfrac{2}{\alpha}$，右侧用 $\int_{-\infty}^{\infty}(\alpha^2+\omega^2)^{-2}\,d\omega=\dfrac{\pi}{\alpha^3}$。

（详解可在后续修订中补入。）

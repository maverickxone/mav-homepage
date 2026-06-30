---
title: "第 10 章 多变量函数的积分"
chapter: 3
readTime: 90
description: "二重积分、换元、三重积分与 n 重积分，含几何意义、性质与计算。"
---

> 📋 **本章期末速查**
> - 中等（每年 0-1 题，常配合曲面积分出现）：极坐标/柱坐标/球坐标换元、体积计算
> - 了解：二重积分交换积分次序、Fubini 定理、n 重积分
> - 工具性：重积分是 Gauss 定理右端的计算载体

第 9 章建立了多元函数的微分语言；本章转向**积分**：在平面区域、空间体上累积「密度」「高度」等信息。单变量定积分 $\int_a^b f(x)\,dx$ 是「细条面积之和」的极限；二重、三重积分把这一思想推广到 $xy$ 平面与 $\mathbb{R}^3$ 中的有界闭区域。换元公式与 Jacobian 行列式是计算的核心；Fubini 定理把重积分化为逐次定积分。掌握本章，才能进入第 11 章曲线、曲面积分以及 Gauss、Stokes 定理。

---

## 10.1 二重积分

### 10.1.1 用分割和极限定义平面图形的面积

设 $D\subset\mathbb{R}^2$ 为有界闭区域。用曲线网把 $D$ 分成 $n$ 个小闭区域 $\Delta D_1,\ldots,\Delta D_n$，记 $\Delta\sigma_i$ 为 $\Delta D_i$ 的面积，$\|\Delta\|$ 为所有小区域**直径**的上确界。

**定义（平面图形面积）**：若存在常数 $S$，使得对任意 $\varepsilon>0$，存在 $\delta>0$，当 $\|\Delta\|<\delta$ 时，对任意选点 $(\xi_i,\eta_i)\in\Delta D_i$，和式
$$\sum_{i=1}^n \Delta\sigma_i$$
与 $S$ 之差的绝对值小于 $\varepsilon$，则称 $D$ 的**面积为** $S$，记 $S(D)$ 或 $|D|$。

可求长曲线围成的**简单闭区域**（边界分段光滑、无自交）面积存在。这一「分割—近似—取极限」的框架，与定积分定义完全平行。

**曲边梯形面积**：若 $D=\{(x,y):a\le x\le b,\ \varphi_1(x)\le y\le\varphi_2(x)\}$，$\varphi_i$ 连续，则 $|D|=\int_a^b[\varphi_2(x)-\varphi_1(x)]\,dx$——这正是「先竖切再求和」的几何版，与后面 X-型区域上的 $\iint_D 1\,dx\,dy$ 一致。

**例 10.1** 矩形 $D=[a,b]\times[c,d]$ 的面积。均匀分割为 $m\times n$ 个小矩形，每个面积 $\Delta x_i\Delta y_j$，总和为
$$\sum_{i,j}\Delta x_i\Delta y_j=(b-a)(d-c),$$
故 $|D|=(b-a)(d-c)$。

> [要点]
>
> - 面积 = 分割后小区域面积之和的**极限**，与选点无关（在可积条件下）。
> - 简单闭区域（分段光滑边界）面积可定义；为二重积分提供几何基础。

### 10.1.2 二重积分概念

设 $f(x,y)$ 在有界闭区域 $D$ 上有界。作分割 $\Delta$，在每个 $\Delta D_i$ 上取 $(\xi_i,\eta_i)$，作**黎曼和**
$$\sum_{i=1}^n f(\xi_i,\eta_i)\,\Delta\sigma_i.$$
若存在常数 $I$，使得对任意 $\varepsilon>0$，存在 $\delta>0$，当 $\|\Delta\|<\delta$ 时，对任意选点，上述和与 $I$ 之差的绝对值小于 $\varepsilon$，则称 $f$ 在 $D$ 上**可积**，$I$ 为 $f$ 在 $D$ 上的**二重积分**，记
$$\iint_D f(x,y)\,d\sigma=\iint_D f(x,y)\,dx\,dy=I.$$

**几何意义**：若 $f(x,y)\ge 0$，积分值等于以 $D$ 为底、曲面 $z=f(x,y)$ 为顶的**曲顶柱体体积**。

**可积充分条件**：
- $f$ 在 $D$ 上**连续** ⇒ 可积；
- $f$ 在 $D$ 上**有界**，且不连续点集面积为零 ⇒ 可积（例如 bounded 且仅在有限条曲线上不连续）。

**性质**（设 $f,g$ 在 $D$ 上可积）：

1. **线性性**：$\iint_D(\alpha f+\beta g)=\alpha\iint_D f+\beta\iint_D g$。
2. **区域可加性**：若 $D=D_1\cup D_2$，$D_1\cap D_2$ 面积为零，则 $\iint_D f=\iint_{D_1}f+\iint_{D_2}f$。
3. **保序性**：若在 $D$ 上 $f\le g$，则 $\iint_D f\le\iint_D g$。
4. **估值**：$m|D|\le\iint_D f\le M|D|$，其中 $m,M$ 为 $f$ 在 $D$ 上的下、上确界。
5. **积分中值定理**：若 $f$ 连续，存在 $(\xi,\eta)\in D$ 使 $\iint_D f=f(\xi,\eta)|D|$。

**性质 1 的证明（线性性）**：由黎曼和
$$\sum(\alpha f+\beta g)(\xi_i,\eta_i)\Delta\sigma_i=\alpha\sum f(\xi_i,\eta_i)\Delta\sigma_i+\beta\sum g(\xi_i,\eta_i)\Delta\sigma_i,$$
取极限即得。性质 2～4 同理；性质 5 由连续函数在闭区域上取最大最小值与估值性质推出。

**与定积分的关系**：若 $D=[a,b]\times[c,d]$，$f(x,y)=\varphi(x)\psi(y)$，则
$$\iint_D f=\int_a^b\varphi(x)\,dx\cdot\int_c^d\psi(y)\,dy.$$
可分离变量是被积函数能因式分解时的快捷算法。

:::callout 二重积分与定积分
定积分是「细条面积」$\sum f(\xi_i)\Delta x_i$ 的极限；二重积分是「小柱体体积」$\sum f(\xi_i,\eta_i)\Delta\sigma_i$ 的极限。$d\sigma=dx\,dy$ 表示面积元素。后面换元时 $d\sigma$ 会变成 $|J|\,du\,dv$，这正是 Jacobian 的来源。
:::

**例 10.2** 设 $D=[0,1]\times[0,1]$，$f(x,y)=x+y$。由后面 Fubini 定理，
$$\iint_D (x+y)\,dx\,dy=\int_0^1\int_0^1(x+y)\,dy\,dx=\int_0^1\Big(x+\frac12\Big)dx=1.$$

> [要点]
>
> - **二重积分** = 黎曼和极限；$f\ge 0$ 时为曲顶柱体体积。
> - 连续 ⇒ 可积；**线性、可加、保序、估值、中值定理**与定积分类似。
> - 计算时几乎总化为**逐次定积分**（Fubini）。

### 10.1.3 二重积分计算

#### Fubini 定理

设 $f$ 在矩形 $D=[a,b]\times[c,d]$ 上连续。则
$$\iint_D f(x,y)\,dx\,dy=\int_a^b dx\int_c^d f(x,y)\,dy=\int_c^d dy\int_a^b f(x,y)\,dx.$$
即**先对 $y$ 后对 $x$** 与**先对 $x$ 后对 $y$** 结果相同。

**证明思路**：固定 $x$，令 $F(x)=\int_c^d f(x,y)\,dy$。分割 $[a,b]$ 为 $x_0,\ldots,x_m$，同时分割 $[c,d]$ 为 $y_0,\ldots,y_n$，小矩形 $\Delta D_{ij}=[x_{i-1},x_i]\times[y_{j-1},y_j]$ 上黎曼和
$$\sum_{i,j} f(\xi_{ij},\eta_{ij})\Delta x_i\Delta y_j.$$
先对 $j$ 求和（固定 $i$），令 $\Delta x_i\to 0$ 得 $\sum_i F(\xi_i)\Delta x_i$，再令分割细化即 $\int_a^b F(x)\,dx$。另一方向对称。关键：$F(x)$ 连续，因 $f$ 在紧集 $D$ 上一致连续。

**一般区域上的 Fubini**：若 $f$ 在 X-型区域 $D$ 上连续，则
$$\iint_D f=\int_a^b\Big(\int_{\varphi_1(x)}^{\varphi_2(x)} f(x,y)\,dy\Big)dx.$$
证明：把 $D$ 嵌入某矩形，在 $D$ 外令 $f=0$，用矩形上 Fubini 再化简积分限。

**X-型区域**（竖条型）：
$$D=\{(x,y):a\le x\le b,\ \varphi_1(x)\le y\le\varphi_2(x)\},$$
则
$$\iint_D f\,dx\,dy=\int_a^b dx\int_{\varphi_1(x)}^{\varphi_2(x)} f(x,y)\,dy.$$

**Y-型区域**（横条型）：
$$D=\{(x,y):c\le y\le d,\ \psi_1(y)\le x\le\psi_2(y)\},$$
则
$$\iint_D f\,dx\,dy=\int_c^d dy\int_{\psi_1(y)}^{\psi_2(y)} f(x,y)\,dx.$$

复杂区域常**分割**为若干 X-型或 Y-型子区域分别积分再相加。

**例 10.3** 计算 $\iint_D xy\,dx\,dy$，$D$ 由 $y=x$、$y=2x$、$x=1$、$x=2$ 围成。

$D$ 为 X-型：$1\le x\le 2$，$x\le y\le 2x$。
$$\iint_D xy\,dy\,dx=\int_1^2 x\,dx\int_x^{2x}y\,dy=\int_1^2 x\cdot\frac{(2x)^2-x^2}{2}\,dx=\int_1^2\frac{3x^3}{2}\,dx=\frac{45}{8}.$$

**例 10.4** 求 $D=\{(x,y):x^2+y^2\le 1,\ x\ge 0,\ y\ge 0\}$ 的面积。

面积 $S=\iint_D 1\,dx\,dy$。Y-型：$0\le y\le 1$，$0\le x\le\sqrt{1-y^2}$，
$$S=\int_0^1 dy\int_0^{\sqrt{1-y^2}}dx=\int_0^1\sqrt{1-y^2}\,dy=\frac{\pi}{4}.$$

**对称性**：若 $D$ 关于 $x$ 轴对称，$f(x,-y)=-f(x,y)$（$y$ 奇），则 $\iint_D f=0$；若 $f(x,-y)=f(x,y)$（$y$ 偶），则 $\iint_D f=2\iint_{D^+}f$，$D^+$ 为上半部分。关于 $y$ 轴、原点对称同理。

**例 10.5** 计算 $\iint_D e^{x+y}\,dx\,dy$，$D=[0,1]\times[0,1]$。因 $e^{x+y}=e^x e^y$ 可分离：
$$\int_0^1 e^x\,dx\cdot\int_0^1 e^y\,dy=(e-1)^2.$$

**积分次序交换**：当内层积分难以求时，可改换 X-型 / Y-型或交换 $x,y$ 次序。例如 $D$ 由 $y=x$ 与 $y=\sqrt x$ 围成，既可表为 X-型（$0\le x\le 1$，$x\le y\le\sqrt x$），也可表为 Y-型（$0\le y\le 1$，$y^2\le x\le y$），选使被积函数原函数更简单的形式。

**例 10.6** 计算 $\iint_D (x+y)\,dx\,dy$，$D$ 由 $y^2=x$ 与 $y=x-2$ 围成。交点 $(4,2)$ 与 $(1,-1)$。Y-型：$-1\le y\le 2$，$y^2\le x\le y+2$，
$$\int_{-1}^2 dy\int_{y^2}^{y+2}(x+y)\,dx=\int_{-1}^2\Big(\frac{(y+2)^2-y^4}{2}+y(y+2-y^2)\Big)dy=\frac{27}{4}.$$

> [要点]
>
> - **Fubini**：矩形上连续函数可**交换积分次序**。
> - **X-型 / Y-型**：化为「外积分 + 内积分上下限」。
> - 画区域图、判对称性可大幅简化计算。

---

## 10.2 二重积分的换元

### 10.2.1 坐标曲线

在 $uv$ 平面上，方程 $u=u_0$（常数）与 $v=v_0$ 给出两族曲线，称为**坐标曲线**。映射
$$\Phi:(u,v)\mapsto(x,y),\qquad x=x(u,v),\ y=y(u,v)$$
把 $uv$ 平面上的区域 $D'$ 映到 $xy$ 平面的 $D$。

**要求**：$\Phi$ 在 $D'$ 上**一一对应**（双射），且 $x_u,x_v,y_u,y_v$ 连续，Jacobian
$$J=\frac{\partial(x,y)}{\partial(u,v)}=\begin{vmatrix}x_u&x_v\\y_u&y_v\end{vmatrix}\neq 0$$
在 $D'$ 内成立（或除有限条曲线外成立）。

直观：小矩形 $du\times dv$ 映成 $xy$ 平面上的**曲边四边形**，其面积近似 $|J|\,du\,dv$。

:::callout 为何需要 $|J|$
在 $(u,v)$ 处，沿 $\mathbf{r}_u=(x_u,y_u)$、$\mathbf{r}_v=(x_v,y_v)$ 方向的平行四边形面积 $=|\mathbf{r}_u\times\mathbf{r}_v|=|J|$（二维叉积模长）。分割越细，$\Delta u\,\Delta v$ 映过去的面积越接近 $|J|\,\Delta u\,\Delta v$，取极限即得换元公式中的 $|J|$。
:::

### 10.2.2 二重积分的换元

**定理（换元公式）**：设 $D' \subset \mathbb{R}^2$ 为有界闭区域，$\Phi:D'\to D$ 一一对应且连续可微，$J\neq 0$。若 $f$ 在 $D$ 上连续，则
$$\iint_D f(x,y)\,dx\,dy=\iint_{D'} f\big(x(u,v),y(u,v)\big)\,|J|\,du\,dv.$$

**逆映射形式**：若 $(u,v)=(u(x,y),v(x,y))$，则
$$J^{-1}=\frac{\partial(u,v)}{\partial(x,y)},\qquad dx\,dy=|J^{-1}|^{-1}\,du\,dv=|J|\,du\,dv.$$
计算时选「谁当自变量」更方便即可。

**换元公式推导（概要）**：在 $(u,v)$ 处，映射的线性近似把增量 $(du,dv)$ 映为 $(dx,dy)\approx (x_u du+x_v dv,\ y_u du+y_v dv)$。面积元素之比
$$\frac{dx\,dy}{du\,dv}=\Big|\frac{\partial(x,y)}{\partial(u,v)}\Big|=|J|.$$
对 $D$ 作分割，每个小格 $\Delta u\,\Delta v$ 映过去面积 $\approx |J|\Delta u\,\Delta v$，黎曼和 $\sum f(x(u,v),y(u,v))|J|\Delta u\,\Delta v$ 的极限即换元公式。

**一般极坐标**（极点不在原点时）：若圆域 $ (x-a)^2+(y-b)^2\le R^2$，令 $x=a+r\cos\theta,\ y=b+r\sin\theta$，仍有 $J=r$，但 $r\in[0,R]$，$\theta\in[0,2\pi)$ 时映射一一对应。

#### 极坐标换元

$$x=r\cos\theta,\qquad y=r\sin\theta,\qquad r\ge 0,\ \theta\in[0,2\pi).$$

**Jacobian 推导**：
$$J=\begin{vmatrix}\cos\theta&-r\sin\theta\\\sin\theta&\ r\cos\theta\end{vmatrix}=r\cos^2\theta+r\sin^2\theta=r.$$
故
$$\boxed{dx\,dy=r\,dr\,d\theta}.$$

**例 10.7** 计算 $\iint_D e^{-(x^2+y^2)}\,dx\,dy$，$D=\{(x,y):x^2+y^2\le R^2\}$。

极坐标：$D':0\le r\le R,\ 0\le\theta\le 2\pi$，
$$\iint_D e^{-(x^2+y^2)}dx\,dy=\int_0^{2\pi}\int_0^R e^{-r^2}\cdot r\,dr\,d\theta=\pi(1-e^{-R^2}).$$
令 $R\to\infty$ 得 famous $\displaystyle\int_{-\infty}^{+\infty}e^{-x^2}dx=\sqrt\pi$。

**例 10.8** 求 $\iint_D \sqrt{x^2+y^2}\,dx\,dy$，$D$ 为圆 $x^2+y^2\le a^2$ 在第一象限部分。

$$=\int_0^{\pi/2}\int_0^a r\cdot r\,dr\,d\theta=\frac{\pi a^3}{6}.$$

偏移圆盘 $(x-1)^2+y^2\le 1$ 令 $x=1+r\cos\theta,\ y=r\sin\theta$，仍有 $J=r$，得面积 $\pi$。

> [要点]
>
> - 换元核心：$dx\,dy=|J|\,du\,dv$，$J=\dfrac{\partial(x,y)}{\partial(u,v)}$。
> - **极坐标**：$J=r$，圆域、含 $x^2+y^2$ 的被积函数首选。
> - 映射需**一一对应**；圆心在原点时用 $r\ge 0,\ \theta\in[0,2\pi)$。

---

## 10.3 三重积分

### 10.3.1 三重积分定义

设 $\Omega\subset\mathbb{R}^3$ 为有界闭区域，$f(x,y,z)$ 在 $\Omega$ 上有界。作空间分割，黎曼和 $\sum f(\xi_i,\eta_i,\zeta_i)\Delta V_i$，当直径 $\to 0$ 时的极限（若存在）为**三重积分**：
$$\iiint_\Omega f(x,y,z)\,dx\,dy\,dz=\iiint_\Omega f\,dV.$$

**几何意义**：$f\ge 0$ 时，积分值为以 $\Omega$ 为底、$f$ 为「高度」的**曲顶柱体体积**（四维中看）；$f\equiv 1$ 时即为 $\Omega$ 的**体积** $V(\Omega)$。

**性质**与二重积分完全平行：线性、区域可加、保序、估值、中值定理（$f$ 连续时存在 $(\xi,\eta,\zeta)\in\Omega$ 使 $\iiint_\Omega f=f(\xi,\eta,\zeta)|\Omega|$）。

**可积充分条件**：$f$ 在 $\Omega$ 上连续 ⇒ 可积；有界且奇点集体积为零 ⇒ 可积。

**三重积分性质详述**（与 §10.1.2 平行，证明方法相同）：

1. **线性性**：$\iiint_\Omega(\alpha f+\beta g)=\alpha\iiint_\Omega f+\beta\iiint_\Omega g$。
2. **区域可加性**：$\Omega=\Omega_1\cup\Omega_2$，$\Omega_1\cap\Omega_2$ 体积为零 ⇒ 积分可加。
3. **保序与估值**：$f\le g\Rightarrow\iiint f\le\iiint g$；$mV\le\iiint f\le MV$，$V=|\Omega|$。
4. **中值定理**：$f$ 连续 ⇒ $\exists(\xi,\eta,\zeta)\in\Omega$，$\iiint_\Omega f=f(\xi,\eta,\zeta)\,V$。

:::callout 二重 vs 三重
二重积分 $d\sigma=dx\,dy$ 是**面积**元素；三重积分 $dV=dx\,dy\,dz$ 是**体积**元素。Fubini 把 $n$ 重积分化为 $n$ 个一元积分的「嵌套」，换元则把 $dV$ 乘以 Jacobian 变成新坐标下的体积元素——二者是计算重积分的两大支柱。
:::

### 10.3.2 三重积分计算

#### Fubini 定理（三重）

若 $f$ 在长方体 $[a,b]\times[c,d]\times[p,q]$ 上连续，则
$$\iiint f\,dx\,dy\,dz=\int_a^b dx\int_c^d dy\int_p^q f\,dz,$$
且六个积分次序（先积 $x/y/z$ 的任意排列）结果相同。

**Z-型区域**（先固定 $x,y$，$z$ 在上下曲面之间）：
$$\Omega=\{(x,y,z):(x,y)\in D_{xy},\ z_1(x,y)\le z\le z_2(x,y)\},$$
$$\iiint_\Omega f\,dV=\iint_{D_{xy}}dx\,dy\int_{z_1(x,y)}^{z_2(x,y)} f\,dz.$$

**Y-型 / X-型**（先固定 $z$，在 $xy$ 投影上积分）：若 $\Omega=\{(x,y,z):p\le z\le q,\ (x,y)\in D_z(z)\}$，则
$$\iiint_\Omega f\,dV=\int_p^q dz\iint_{D_z(z)} f(x,y,z)\,dx\,dy.$$
旋转体、截面为圆的立体常用此式——对每个 $z$，截面是圆盘或圆环。

**例 10.9** 计算 $\iiint_\Omega z\,dx\,dy\,dz$，$\Omega$ 由 $z=x^2+y^2$ 与 $z=2$ 围成。

投影到 $xy$ 平面：$x^2+y^2\le 2$。用极坐标：
$$\iiint_\Omega z\,dV=\int_0^{2\pi}\int_0^{\sqrt2}\int_{r^2}^2 z\cdot r\,dz\,dr\,d\theta=\int_0^{2\pi}\int_0^{\sqrt2}\frac{r(4-r^4)}{2}\,dr\,d\theta=2\pi\cdot\frac{(\sqrt2)^4}{4}=\pi.$$

**例 10.10** 用「先 $z$ 后 $xy$」计算 $\Omega=\{(x,y,z):0\le z\le 1,\ x^2+y^2\le 1-z\}$ 的体积（圆锥 $x^2+y^2\le 1-z$ 与 $z=0$ 围成）。

对每个 $z\in[0,1]$，截面 $x^2+y^2\le 1-z$ 是半径 $\sqrt{1-z}$ 的圆盘，面积 $\pi(1-z)$，
$$V=\int_0^1\pi(1-z)\,dz=\frac{\pi}{2}.$$

#### 柱面坐标

$$x=r\cos\theta,\ y=r\sin\theta,\ z=z.$$

**Jacobian 推导**：这是极坐标与 $z$ 的直积，$x,y$ 不依赖 $z$，
$$J=\begin{vmatrix}\cos\theta&-r\sin\theta&0\\\sin\theta&\ r\cos\theta&0\\0&0&1\end{vmatrix}=r.$$
故
$$\boxed{dx\,dy\,dz=r\,dr\,d\theta\,dz}.$$

**例 10.11** 求 $\Omega=\{(x,y,z):x^2+y^2\le 1,\ 0\le z\le x^2+y^2\}$ 的体积。

柱坐标：$0\le r\le 1,\ 0\le\theta\le 2\pi,\ 0\le z\le r^2$，
$$V=\int_0^{2\pi}\int_0^1\int_0^{r^2} r\,dz\,dr\,d\theta=\frac{\pi}{2}.$$

#### 球面坐标

$$x=r\sin\theta\cos\varphi,\ y=r\sin\theta\sin\varphi,\ z=r\cos\theta,$$
其中 $r\ge 0$，$\theta\in[0,\pi]$（极角，与 $z$ 轴夹角），$\varphi\in[0,2\pi)$（方位角）。教材符号可能略有差异，以所用书为准。

**Jacobian 推导**：记 $s=\sin\theta,\ c=\cos\theta$，对 $(r,\theta,\varphi)$ 求偏导：
$$\frac{\partial(x,y,z)}{\partial(r,\theta,\varphi)}=
\begin{vmatrix}
s\cos\varphi & r c\cos\varphi & -r s\sin\varphi\\
s\sin\varphi & r c\sin\varphi & \ r s\cos\varphi\\
c & -r s & 0
\end{vmatrix}.$$
按第一行展开：第一行乘以 $c$ 减去第三行乘以 $r c\cos\varphi$ 等，化简得
$$J=r^2\sin\theta\big(c^2\cos^2\varphi+c^2\sin^2\varphi+s^2\big)=r^2\sin\theta.$$
故
$$\boxed{dx\,dy\,dz=r^2\sin\theta\,dr\,d\theta\,d\varphi}.$$
**记忆**：$r^2\sin\theta$ 是单位球面上「纬度圈」半径与经线弧长的乘积因子，与第 9 章散度公式中的体积元一致。

**例 10.12** 求球体 $x^2+y^2+z^2\le R^2$ 的体积。

$$V=\int_0^{2\pi}\int_0^\pi\int_0^R r^2\sin\theta\,dr\,d\theta\,d\varphi=\frac{4\pi R^3}{3}.$$

**例 10.13** 计算 $\iiint_\Omega (x^2+y^2+z^2)\,dV$，$\Omega:x^2+y^2+z^2\le 1$。

被积函数 $=r^2$，球坐标：
$$\int_0^{2\pi}\int_0^\pi\int_0^1 r^2\cdot r^2\sin\theta\,dr\,d\theta\,d\varphi=\frac{4\pi}{5}.$$

> [要点]
>
> - **三重积分**定义、性质同二重；**Fubini** 化为三次定积分。
> - **柱坐标** $J=r$：圆柱、旋转体、含 $x^2+y^2$ 时用。
> - **球坐标** $J=r^2\sin\theta$：球域、含 $x^2+y^2+z^2$ 时用。
> - 先画 $\Omega$、找投影，再选坐标系。

### 10.3.3 三重积分的应用

设体密度 $\rho(x,y,z)$，区域 $\Omega$。

**质量**：
$$M=\iiint_\Omega \rho(x,y,z)\,dV.$$

**质心** $(\bar x,\bar y,\bar z)$：
$$\bar x=\frac{1}{M}\iiint_\Omega x\rho\,dV,\quad \bar y=\frac{1}{M}\iiint_\Omega y\rho\,dV,\quad \bar z=\frac{1}{M}\iiint_\Omega z\rho\,dV.$$
若 $\rho\equiv 1$，则 $(\bar x,\bar y,\bar z)$ 为**几何重心**。

**例 10.14** 均匀半球 $\Omega=\{(x,y,z):x^2+y^2+z^2\le R^2,\ z\ge 0\}$，求质心。

由对称性 $\bar x=\bar y=0$。$\rho\equiv 1$，$M=\frac{2\pi R^3}{3}$。球坐标：
$$\bar z=\frac{3}{2\pi R^3}\int_0^{2\pi}\int_0^{\pi/2}\int_0^R (r\cos\theta)\,r^2\sin\theta\,dr\,d\theta\,d\varphi=\frac{3R}{8}.$$
质心在 $z$ 轴上，距球心 $\dfrac{3R}{8}$。

**例 10.15** 非均匀球体 $\rho(x,y,z)=k z$（$k>0$），$\Omega:x^2+y^2+z^2\le R^2,\ z\ge 0$。求 $M$ 与 $\bar z$。

半球上 $z\ge 0$ 对应 $\theta\in[0,\pi/2]$。先算 $M$：
$$M=k\int_0^{2\pi}\int_0^{\pi/2}\int_0^R (r\cos\theta)\,r^2\sin\theta\,dr\,d\theta\,d\varphi=k\cdot 2\pi\cdot\frac{R^4}{4}\cdot\frac12=\frac{k\pi R^4}{4}.$$
再算 $z$ 的一阶矩：
$$\iiint_\Omega z^2\,dV=\int_0^{2\pi}\int_0^{\pi/2}\int_0^R r^2\cos^2\theta\cdot r^2\sin\theta\,dr\,d\theta\,d\varphi=\frac{\pi R^5}{5}.$$
故 $\bar z=\dfrac{\pi R^5/5}{k\pi R^4/4}\cdot k=\dfrac{2R}{5}$（密度常数 $k$ 约掉）。

**转动惯量**（补充）：绕 $z$ 轴的转动惯量 $I_z=\iiint_\Omega \rho(x^2+y^2)\,dV$。均匀圆柱、球体等对称体的 $I_z$ 是经典力学考题，算法与质心相同——先判对称，再选柱/球坐标。

:::callout 物理量与积分
质量、质心、转动惯量（$I=\iiint_\Omega \rho r^2 dV$）都是**标量场在区域上的积分**。对称性可定性地确定某些分量为零，再选柱/球坐标计算余下分量——这是工科应用题的标准套路。
:::

> [要点]
>
> - **质量** $M=\iiint\rho\,dV$；**质心** 各坐标 = 一阶矩除以质量。
> - 均匀体用对称性；非均匀体先算 $M$ 再算矩。
> - 半球、球壳、圆柱等标准体应熟记体积公式。

---

## 10.4 n 重积分

**定义**：设 $f(x_1,\ldots,x_n)$ 在 $\mathbb{R}^n$ 中有界闭区域 $D$ 上有界，作 $n$ 维分割，黎曼和极限（若存在）为 **$n$ 重积分**
$$\int\!\cdots\!\int_D f(x_1,\ldots,x_n)\,dx_1\cdots dx_n.$$

**Fubini 定理**（$n$ 维）：若 $f$ 在 $n$ 维长方体上连续，则积分可化为 $n$ 次逐次定积分，**积分次序任意交换**。证明可对 $n$ 归纳：$n=1$ 即定积分；$n$ 维时对某一变量用 $n-1$ 维 Fubini。

**概率论联系**：若 $X_1,\ldots,X_n$ 独立，联合密度 $p(\mathbf{x})=\prod_{i=1}^n p_i(x_i)$，则
$$P\big((X_1,\ldots,X_n)\in D\big)=\int\!\cdots\!\int_D p(\mathbf{x})\,dx_1\cdots dx_n=\prod_{i=1}^n\int p_i(x_i)\,dx_i$$
（在 $D$ 为各边区间之积时）。高维积分在统计与机器学习中计算边缘分布、归一化常数时无处不在。

**例 10.16** 四维单位超立方体 $[0,1]^4$ 上 $f=1$ 的积分：
$$\int_0^1\!\int_0^1\!\int_0^1\!\int_0^1 1\,dx_1\,dx_2\,dx_3\,dx_4=1.$$

**例 10.17** $n$ 维球体 $B_n(R)=\{\mathbf{x}:|\mathbf{x}|\le R\}$ 的体积。球坐标推广（$n-1$ 个角坐标 + 径向 $r$）给出
$$V(B_n(R))=\frac{\pi^{n/2}}{\Gamma(n/2+1)}R^n.$$
例如 $n=2$ 得 $\pi R^2$，$n=3$ 得 $\dfrac{4\pi R^3}{3}$。

**换元**：设 $\mathbf{x}=\mathbf{x}(\mathbf{u})$，$\mathbf{u}\in D'$，则
$$dx_1\cdots dx_n=|J|\,du_1\cdots du_n,\qquad J=\det\frac{\partial(x_1,\ldots,x_n)}{\partial(u_1,\ldots,u_n)}.$$
高维 Jacobian 与 2、3 维推导思想一致：在 $\mathbf{u}$ 处，偏导向量 $\partial\mathbf{x}/\partial u_i$ 张成的 $n$ 维平行多面体体积 $=|J|\,du_1\cdots du_n$。

**例 10.18** 计算 $n$ 维球 $B_n(1)$ 上 $f(\mathbf{x})=|\mathbf{x}|^2$ 的积分（了解）。由球对称性可化为径向积分 $\int_0^1 r^2\cdot V(B_n(r))'\,dr$，与 $\Gamma$ 函数相关；此处仅说明：**对称性 + 换元** 是降维的核心技巧。

:::callout 从第 10 章到第 11 章
本章积分区域是平面或空间中的「块」；第 11 章把积分放到**曲线**（一维流形）和**曲面**（二维流形）上。Green 公式把平面区域边界上的曲线积分与区域内的二重积分联系起来——那是「Stokes 定理」的二维版本。学完换元与 Jacobian，曲面积分中的 $dS$ 公式本质上是同一思想的曲面版。
:::

> [要点]
>
> - **$n$ 重积分** = 分割极限；连续 ⇒ Fubini 可逐次积分。
> - **$n$ 维球体积** 含 $\Gamma$ 函数；$n=2,3$ 为特例。
> - 概率论中独立随机变量的联合密度积分，即 $n$ 重积分。

---

## 本章综合习题（选）

**10.1** 计算 $\displaystyle\iint_D (x^2+y^2)\,dx\,dy$，其中 $D$ 由 $y=x^2$ 与 $y=x$ 围成（提示：先画区域，X-型积分）。

**10.2** 用极坐标求 $\displaystyle\iint_D \frac{1}{\sqrt{x^2+y^2}}\,dx\,dy$，$D=\{(x,y):1\le x^2+y^2\le 4,\ x\ge 0\}$。

**10.3** 计算 $\displaystyle\iiint_\Omega z\,dx\,dy\,dz$，$\Omega$ 为椭球 $\dfrac{x^2}{4}+\dfrac{y^2}{4}+z^2\le 1$ 在第一卦限部分（提示：柱坐标或先 $z$ 后 $xy$ 投影）。

**10.4** 求由 $z=4-x^2-y^2$ 与 $z=x^2+y^2$ 所围立体的体积。

**10.5** 密度 $\rho(x,y,z)=x^2+y^2$，区域 $\Omega=\{(x,y,z):x^2+y^2\le 1,\ 0\le z\le 1\}$。求总质量 $M$ 与质心坐标 $(\bar x,\bar y,\bar z)$（利用对称性）。

（详解可在后续修订中补入；先做自测。）

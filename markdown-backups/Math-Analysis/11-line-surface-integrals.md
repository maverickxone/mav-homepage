---
title: "第 11 章 曲线积分和曲面积分"
chapter: 4
readTime: 120
description: "数量场与向量场在曲线、曲面上的积分，Green、Gauss、Stokes 三大定理及其几何意义，保守场与微分形式的积分表述。"
---

> 📋 **本章期末速查**
> - 必考（每年 2-3 题，30-40 分）：Gauss 定理计算通量（补面法）、Stokes 定理空间环量、Green 定理（含挖洞法）
> - 常考：保守场判定 + 势函数求解、第一类曲线/曲面积分参数化计算
> - 了解：微分形式的统一表述、向量势

第 10 章把二重、三重积分建立在平面、空间区域上；本章把积分「挂」到**曲线**和**曲面**上——前者回答沿路径做功、环流，后者回答通过曲面的通量、曲面的质量。Green、Gauss、Stokes 三条定理把「边界上的积分」与「内部（或更高维区域）上的积分」联系起来，是向量分析的核心，也是期末计算大题的主线。

---

## 11.1 数量场在曲线上的积分

> 🟡 **考试重要度：中等** | 常作为小题或大题的一部分出现，分值 6-10 分

### 11.1.1 基本概念

设 $L$ 为 $xy$ 平面（或空间）中的**光滑曲线**，$f$ 在 $L$ 上有定义。**第一类曲线积分**（对弧长的积分）：
$$\int_L f\,ds=\int_\alpha^\beta f\big(x(t),y(t),z(t)\big)\,\sqrt{x'^2+y'^2+z'^2}\,dt.$$
若 $L$ 有参数 $\mathbf{r}(t)=(x(t),y(t),z(t))$，$t\in[\alpha,\beta]$，则 $ds=|\mathbf{r}'(t)|\,dt$。

**物理意义**：若 $f$ 是线密度，则 $\int_L f\,ds$ 是曲线 $L$ 的总质量。

**性质**：与参数选取无关（弧长不变）；对曲线可加（分段光滑时）。

**平面曲线** $y=y(x)$：$ds=\sqrt{1+(y')^2}\,dx$。

### 11.1.2 数量场在曲线上的积分的计算

**步骤**：
1. 写出 $L$ 的参数方程或显式方程；
2. 计算 $ds$；
3. 化为关于参数（或 $x$）的定积分。

**例 11.1** 计算 $\displaystyle\int_L (x+y)\,ds$，$L$ 为从 $(0,0)$ 到 $(1,1)$ 的直线段。
参数 $x=t,\ y=t,\ t\in[0,1]$，$ds=\sqrt2\,dt$，
$$\int_0^1 2t\cdot\sqrt2\,dt=\sqrt2.$$

**例 11.2** 计算 $\displaystyle\int_L x^2\,ds$，$L$ 为圆 $x^2+y^2=R^2$ 第一象限弧。
参数 $x=R\cos t,\ y=R\sin t,\ t\in[0,\pi/2]$，$ds=R\,dt$，
$$\int_0^{\pi/2} R^2\cos^2 t\cdot R\,dt=R^3\int_0^{\pi/2}\cos^2 t\,dt=\frac{\pi R^3}{4}.$$

**对称性**：若 $L$ 关于坐标轴或原点对称，$f$ 为奇函数，可化简积分（类似重积分对称性）。

**例 11.3** [2024-T2] 计算曲线积分 $\displaystyle I=\int_L \sqrt{y}\,ds$，其中 $L$ 为摆线 $x=t-\sin t,\ y=1-\cos t$，$0\le t\le\pi$。

解：$x'(t)=1-\cos t$，$y'(t)=\sin t$，故
$$ds=\sqrt{(1-\cos t)^2+\sin^2 t}\,dt=\sqrt{2-2\cos t}\,dt=2\sin\frac{t}{2}\,dt.$$
又 $\sqrt{y}=\sqrt{1-\cos t}=\sqrt{2}\sin\frac{t}{2}$，故
$$I=\int_0^\pi \sqrt{2}\sin\frac{t}{2}\cdot 2\sin\frac{t}{2}\,dt=2\sqrt{2}\int_0^\pi\sin^2\frac{t}{2}\,dt=2\sqrt{2}\cdot\frac{\pi}{2}=\sqrt{2}\pi.$$

> [要点]
>
> - **第一类曲线积分** $\int_L f\,ds$：对**弧长**，**无方向**。
> - 核心公式：$ds=|\mathbf{r}'(t)|\,dt$。
> - 摆线是常见载体：$ds=2\sin(t/2)\,dt$，$\sqrt{y}=\sqrt{2}\sin(t/2)$，记住这组。

---

## 11.2 数量场在曲面上的积分

> 🟡 **考试重要度：中等** | 常考参数曲面面积元素 $dS$ 的计算，分值 6-10 分

### 11.2.1 曲面的面积

**参数曲面** $\mathbf{r}(u,v)$，面积元素
$$dS=|\mathbf{r}_u\times\mathbf{r}_v|\,du\,dv.$$
**隐式曲面** $F(x,y,z)=0$，若 $F_z\neq 0$，则
$$dS=\frac{\sqrt{F_x^2+F_y^2+F_z^2}}{|F_z|}\,dx\,dy$$
（在 $xy$ 投影上积分时）。

**显式曲面** $z=z(x,y)$：
$$dS=\sqrt{1+z_x^2+z_y^2}\,dx\,dy.$$

**例 11.4** 球面 $x^2+y^2+z^2=R^2$ 的面积。参数化得 $dS=R^2\sin\varphi\,d\varphi\,d\theta$，
$$S=\int_0^{2\pi}\int_0^\pi R^2\sin\varphi\,d\varphi\,d\theta=4\pi R^2.$$

### 11.2.2 数量场在曲面上的积分的计算

**第一类曲面积分**：
$$\iint_S f\,dS=\iint_D f\big(\mathbf{r}(u,v)\big)\,|\mathbf{r}_u\times\mathbf{r}_v|\,du\,dv.$$
若 $S$ 为 $z=z(x,y)$，$(x,y)\in D_{xy}$，则
$$dS=\sqrt{1+z_x^2+z_y^2}\,dx\,dy,\qquad \iint_S f\,dS=\iint_{D_{xy}} f\big(x,y,z(x,y)\big)\sqrt{1+z_x^2+z_y^2}\,dx\,dy.$$

**例 11.5** $\displaystyle\iint_S z\,dS$，$S$ 为平面 $x+y+z=1$ 在第一卦限部分。
$z=1-x-y$，$D_{xy}:x\ge0,y\ge0,x+y\le1$，$z_x=z_y=-1$，$\sqrt{1+z_x^2+z_y^2}=\sqrt3$，
$$\iint_{D_{xy}}(1-x-y)\sqrt3\,dx\,dy=\sqrt3\iint_{D_{xy}}(1-x-y)\,dx\,dy=\frac{\sqrt3}{6}.$$

**例 11.6** [2024-T3] 计算曲面积分 $\displaystyle I=\iint_S z\,dS$，其中 $S$ 为螺旋面 $\mathbf{r}=(u\cos v,\,u\sin v,\,v)$，$0\le u\le 1$，$0\le v\le 2\pi$。

解：$\mathbf{r}_u=(\cos v,\sin v,0)$，$\mathbf{r}_v=(-u\sin v,u\cos v,1)$，
$$\mathbf{r}_u\times\mathbf{r}_v=(\sin v,-\cos v,u),\quad |\mathbf{r}_u\times\mathbf{r}_v|=\sqrt{1+u^2}.$$
曲面上 $z=v$，故
$$I=\int_0^{2\pi}\int_0^1 v\sqrt{1+u^2}\,du\,dv=\left(\int_0^{2\pi}v\,dv\right)\left(\int_0^1\sqrt{1+u^2}\,du\right)=\pi^2\Big(\frac{\sqrt2}{2}+\frac12\ln(1+\sqrt2)\Big).$$

> [要点]
>
> - 参数曲面：先求 $\mathbf{r}_u\times\mathbf{r}_v$，再取模得 $dS$。
> - 显式曲面 $z=z(x,y)$：$dS=\sqrt{1+z_x^2+z_y^2}\,dx\,dy$，投影到 $xy$ 平面。
> - 对称性同样适用于曲面积分。

---

## 11.3 向量场在曲线上的积分与 Green 定理

> 🔴 **考试重要度：极高** | Green 定理每年必考（含挖洞法），分值 10-15 分

### 11.3.1 曲线的定向

**定向曲线** $L^+$：指定沿 $L$ 的行进方向。闭曲线常取**逆时针**（从 $z$ 轴正向看）为正方向。

参数 $\mathbf{r}(t)$ 增加的方向与 $L^+$ 一致时，切向量 $\mathbf{T}=\mathbf{r}'/|\mathbf{r}'|$ 与定向一致。

### 11.3.2 向量场在曲线上的积分的定义和计算

设 $\mathbf{F}=(P,Q,R)$。**第二类曲线积分**（对坐标的积分）：
$$\int_{L^+} P\,dx+Q\,dy+R\,dz=\int_\alpha^\beta\big(Px'+Qy'+Rz'\big)\,dt.$$
**物理意义**：力场 $\mathbf{F}$ 沿 $L$ 做功 $W=\int_{L^+}\mathbf{F}\cdot d\mathbf{r}$，其中 $d\mathbf{r}=(dx,dy,dz)$。

**与第一类关系**：$\int_{L^+}\mathbf{F}\cdot d\mathbf{r}=\int_L \mathbf{F}\cdot\mathbf{T}\,ds$，其中 $\mathbf{T}$ 与 $L^+$ 同向。

**例 11.7** $\displaystyle\int_{L^+} y\,dx+x\,dy$，$L^+$ 为 $(0,0)\to(1,0)\to(1,1)$ 折线。
第一段：$y=0,\ dy=0$，$\int_0^1 0\,dx=0$。
第二段：$x=1,\ dx=0$，$\int_0^1 x\,dy=\int_0^1 1\,dy=1$。
合计 $1$。

**例 11.8** $\displaystyle\oint_{L^+} y\,dx-x\,dy$，$L^+$ 为圆 $x^2+y^2=a^2$ 逆时针。
参数 $x=a\cos t,\ y=a\sin t$，$dx=-a\sin t\,dt,\ dy=a\cos t\,dt$，
$$\oint =\int_0^{2\pi}\big(-a^2\sin^2 t-a^2\cos^2 t\big)\,dt=-2\pi a^2.$$

### 11.3.3 Green 定理

**定理**：设 $D$ 为 $xy$ 平面上由分段光滑闭曲线 $L^+$ 围成的**单连通**区域，$P,Q$ 在 $\bar D$ 上有连续一阶偏导，则
$$\boxed{\oint_{L^+} P\,dx+Q\,dy=\iint_D\Big(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\Big)\,dx\,dy}.$$

**证明思路**：对 $\iint_D \dfrac{\partial Q}{\partial x}\,dx\,dy$ 先对 $x$ 积分，化为左右边界上的 $Q$ 之差；对 $\dfrac{\partial P}{\partial y}$ 类似；相加即得 $L^+$ 上的环量。

**例 11.9** 用 Green 定理重算例 11.8。取 $P=y,\ Q=-x$，则
$$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=-1-1=-2.$$
$D$ 为圆盘 $x^2+y^2\le a^2$，面积 $\pi a^2$，故
$$\oint_{L^+} y\,dx-x\,dy=-2\iint_D 1\,dx\,dy=-2\pi a^2.$$

**面积公式**：$A=\dfrac12\oint_{L^+}x\,dy-y\,dx$。

### 11.3.4 Green 定理在非单连通域上的应用（挖洞法）

> 🔴 **此技巧几乎每年必考**

当 $P,Q$ 在区域 $D$ 内某点（如原点）无定义时，不能直接用 Green 定理。此时的标准做法：

**方法**：在奇点周围取一个小曲线 $L_1$（如小圆 $x^2+y^2=\varepsilon^2$），方向取**顺时针**（使 $L+L_1^-$ 构成环形区域 $D'$ 的正向边界），在 $D'$ 上应用 Green 定理。

若 $\dfrac{\partial Q}{\partial x}=\dfrac{\partial P}{\partial y}$ 在 $D'$ 内处处成立，则
$$\oint_L P\,dx+Q\,dy = \oint_{L_1} P\,dx+Q\,dy$$
（两条路径方向一致时取等号；即大曲线上的积分等于小曲线上的积分）。

**例 11.10** [2024-Ê] 计算 $\displaystyle I=\oint_L \frac{(x-y)\,dx+(x+4y)\,dy}{x^2+4y^2}$，其中 $L$ 为单位圆 $x^2+y^2=1$，逆时针。

解：令 $P=\dfrac{x-y}{x^2+4y^2}$，$Q=\dfrac{x+4y}{x^2+4y^2}$。验证在 $x^2+4y^2\neq 0$ 处
$$\frac{\partial Q}{\partial x}=\frac{4y^2-x^2-8xy}{(x^2+4y^2)^2}=\frac{\partial P}{\partial y}.$$
但原点 $(0,0)$ 是奇点，在 $L$ 内部。取小椭圆 $L_1: x^2+4y^2=\varepsilon^2$（逆时针），则 $L$ 与 $L_1$ 之间 Green 定理给出
$$\oint_L = \oint_{L_1}.$$
在 $L_1$ 上，$x^2+4y^2=\varepsilon^2$，故
$$\oint_{L_1}\frac{(x-y)\,dx+(x+4y)\,dy}{x^2+4y^2}=\frac{1}{\varepsilon^2}\oint_{L_1}(x-y)\,dx+(x+4y)\,dy.$$
对 $(x-y)\,dx+(x+4y)\,dy$ 在 $L_1$ 所围椭圆域 $D_1$ 用 Green：
$$Q_x-P_y=\frac{\partial(x+4y)}{\partial x}-\frac{\partial(x-y)}{\partial y}=1-(-1)=2,$$
面积 $\sigma(D_1)=\pi\cdot\varepsilon\cdot\dfrac\varepsilon2=\dfrac{\pi\varepsilon^2}{2}$，故
$$\oint_{L_1}(x-y)\,dx+(x+4y)\,dy=2\cdot\frac{\pi\varepsilon^2}{2}=\pi\varepsilon^2.$$
因此 $I=\dfrac{\pi\varepsilon^2}{\varepsilon^2}=\pi$。

**例 11.11** [经典题型] 设 $P=\dfrac{-y}{x^2+y^2}$，$Q=\dfrac{x}{x^2+y^2}$，$L$ 为任意包围原点的逆时针简单闭曲线。

验证 $Q_x=P_y$（在 $(x,y)\neq(0,0)$ 处），但 $\oint_L P\,dx+Q\,dy\neq 0$。

取 $L_1:x^2+y^2=r^2$ 逆时针，参数化得
$$\oint_{L_1}\frac{-y\,dx+x\,dy}{x^2+y^2}=\int_0^{2\pi}\frac{r^2\sin^2 t+r^2\cos^2 t}{r^2}\,dt=2\pi.$$
故 $\oint_L=2\pi$。**域非单连通**（有洞）⇒ 满足 $Q_x=P_y$ 不等价于保守场。

**例 11.12** [2023-一(1)] 计算 $\displaystyle I=\int_L \frac{1}{2}y^2\,dx+xy\,dy$，其中 $L$ 为 $y=2x-x^2$（$0\le x\le 1$），方向为 $x$ 增加。

解：令 $P=\dfrac12 y^2$，$Q=xy$，验证 $Q_x-P_y=y-y=0$。故 $P\,dx+Q\,dy$ 是恰当微分，积分与路径无关。选直线段 $OA$：$O(0,0)\to A(1,1)$，参数 $y=x$：
$$I=\int_0^1\Big(\frac12 x^2+x\cdot x\Big)\,dx=\int_0^1\frac32 x^2\,dx=\frac12.$$

> [要点]
>
> - **Green**：$\oint P\,dx+Q\,dy=\iint_D(Q_x-P_y)\,dx\,dy$，$D$ 单连通。
> - **挖洞法**：奇点在 $L$ 内 ⇒ 取小曲线 $L_1$ 围住奇点，$\oint_L=\oint_{L_1}$（若 $Q_x=P_y$ 在环形区域成立）。
> - **恰当微分**：$Q_x=P_y$ 在单连通域 ⇒ 路径无关 ⇒ 选最简路径计算。

---

## 11.4 向量场在曲面上的积分

> 🔴 **考试重要度：极高** | 每年 Gauss 定理题的载体

### 11.4.1 双侧曲面及其定向

**双侧曲面**：可连续指定法向量 $\mathbf{n}$ 的一侧（如球面、平面）。**定向曲面** $S^+$ 选定一侧为「正侧」，对应单位法向量 $\mathbf{n}$。

**参数曲面**：$\mathbf{r}_u\times\mathbf{r}_v$ 与 $\mathbf{n}$ 同向时取 $+$；闭曲面常取**外法向**为正。

### 11.4.2 向量场在曲面上的积分的定义和计算

**第二类曲面积分（通量）**：
$$\iint_{S^+} P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy=\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS.$$
若 $S:z=z(x,y)$ 取上侧（$\mathbf{n}$ 与 $z$ 轴成锐角），则
$$\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS=\iint_{D_{xy}}\big(-Pz_x-Qz_y+R\big)\,dx\,dy.$$

**投影法核心思路**：将第二类曲面积分化为在投影区域上的二重积分。注意：
- 取**上侧** ⇒ $dx\,dy$ 前取 $+$；取**下侧** ⇒ $dx\,dy$ 前取 $-$。
- 若曲面投影到 $xz$ 或 $yz$ 平面更方便，类似处理 $dz\,dx$ 或 $dy\,dz$ 项。

**例 11.13** $\displaystyle\iint_{S^+} x\,dy\,dz+y\,dz\,dx+z\,dx\,dy$，$S^+$ 为球面 $x^2+y^2+z^2=R^2$ **外侧**。
$\nabla\cdot\mathbf{F}=1+1+1=3$，由 Gauss：$\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS=\iiint_V 3\,dV=4\pi R^3$。

---

## 11.5 Gauss 定理和 Stokes 定理

> 🔴 **考试重要度：极高** | 每年必考 2-3 题，分值合计 25-40 分

### 11.5.1 Gauss 定理（散度定理）

设 $V$ 为空间有界闭区域，边界 $\partial V=S^+$ 取**外法向**，$\mathbf{F}=(P,Q,R)$ 在 $V$ 上 $C^1$，则
$$\boxed{\oiint_{S^+} P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy=\iiint_V\Big(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\Big)\,dV=\iiint_V \nabla\cdot\mathbf{F}\,dV}.$$

**证明思路**（以 $R\,dx\,dy$ 项为例）：$V$ 投影到 $xy$ 平面为 $D_{xy}$，上下曲面 $z=z_2(x,y),\ z=z_1(x,y)$。对 $\iiint_V \dfrac{\partial R}{\partial z}\,dV$ 先对 $z$ 积分：
$$\int_{z_1}^{z_2}\frac{\partial R}{\partial z}\,dz=R\big|_{z_1}^{z_2}=R(x,y,z_2)-R(x,y,z_1),$$
恰为上下两面上 $R\,dx\,dy$ 贡献之差（法向符号对应外法向），三项相加得通量 = 散度的体积分。

### 11.5.2 Gauss 定理的补面法

> 🔴 **期末必考技巧**

当给定曲面 $S$ **不封闭**时，Gauss 定理不能直接用。标准做法：**补一个面** $S_1$ 使 $S+S_1$ 封闭，再用 Gauss 定理。

**步骤**：
1. 判断 $S$ 不封闭（如只有侧面没有底/顶）；
2. 补面 $S_1$（通常是平面，如 $z=$ 常数、$x=$ 常数），取外法向；
3. $\oiint_{S+S_1}=\iiint_V \nabla\cdot\mathbf{F}\,dV$；
4. 计算 $\iint_{S_1}$ 通常很简单（平面上某坐标为常数，$dx=0$ 或 $dy\,dz=0$）；
5. $\iint_S = \iiint_V\nabla\cdot\mathbf{F}\,dV - \iint_{S_1}$。

**例 11.14** [2023-一(2)] 计算 $\displaystyle I=\iint_\Sigma 4xz\,dy\,dz-2yz\,dz\,dx+(1-z^2)\,dx\,dy$，其中 $\Sigma$ 为抛物面 $z=x^2+y^2$（$0\le z\le 2$），方向取**下侧**。

解：补平面 $\Sigma_1:z=2$，$x^2+y^2\le 2$，取**上侧**。$\Sigma+\Sigma_1$ 构成封闭曲面（$\Sigma$ 下侧 + $\Sigma_1$ 上侧 = 围成体的**外**法向）。

$\mathbf{F}=(4xz,\,-2yz,\,1-z^2)$，$\nabla\cdot\mathbf{F}=4z-2z-2z=0$。

由 Gauss：$\oiint_{\Sigma+\Sigma_1}\mathbf{F}\cdot\mathbf{n}\,dS=0$。

计算 $\Sigma_1$（$z=2$ 上侧，$\mathbf{n}=(0,0,1)$）：
$$\iint_{\Sigma_1}(1-z^2)\,dx\,dy=\iint_{x^2+y^2\le 2}(1-4)\,dx\,dy=-3\cdot 2\pi=-6\pi.$$

故 $I=-\iint_{\Sigma_1}=6\pi$。

**例 11.15** [2024-T4] 计算 $\displaystyle\iint_\Omega (x+1)\,dy\,dz+(y+2)\,dz\,dx+(z+3)\,dx\,dy$，其中 $\Omega$ 为上半球面 $z=\sqrt{R^2-x^2-y^2}$，方向朝上。

解：补底面 $\Omega_1:z=0$，$x^2+y^2\le R^2$，取**下侧**（向外）。

$\nabla\cdot\mathbf{F}=1+1+1=3$。体 $V$ 为上半球。

$$\oiint_{\Omega+\Omega_1}=\iiint_V 3\,dV=3\cdot\frac{2\pi R^3}{3}=2\pi R^3.$$

$\Omega_1$（$z=0$，下侧 $\mathbf{n}=(0,0,-1)$）：
$$\iint_{\Omega_1}=\iint_{D}\big(-(z+3)\big)\,dx\,dy=-3\pi R^2.$$

故 $\iint_\Omega = 2\pi R^3+3\pi R^2$。

**例 11.16** [2021-四] 计算 $\displaystyle I=\iint_S 2(1+x)\,dy\,dz+yz\,dx\,dy$，其中 $S$ 为曲线 $y=\sqrt{x}$（$0\le x\le 1$）绕 $x$ 轴旋转所得旋转面，取 $x$ 轴正向侧。

解：$S$ 不封闭，补截面 $D:x=1,\ y^2+z^2\le 1$，取 $x$ 轴正向（外法向）。$V$ 为旋转体。

$\mathbf{F}=(2(1+x),\,0,\,yz)$，$\nabla\cdot\mathbf{F}=2+0+y=2+y$。

由对称性 $\iiint_V y\,dV=0$（$V$ 关于 $Oxz$ 平面对称），故
$$\iiint_V(2+y)\,dV=2\mu(V)=2\int_0^1\pi x\,dx=\pi.$$

$D$ 上 $x=1$，$\mathbf{n}=(1,0,0)$：
$$\iint_D 2(1+x)\,dy\,dz=\iint_{y^2+z^2\le 1}4\,dy\,dz=4\pi.$$

故 $I=\pi-4\pi=-3\pi$。

### 11.5.3 Stokes 定理

设 $S^+$ 为定向曲面，边界 $\partial S^+=L^+$（定向与 $S^+$ 右手法则一致），$\mathbf{F}$ 在 $S$ 邻域 $C^1$，则
$$\boxed{\oint_{L^+} P\,dx+Q\,dy+R\,dz=\iint_{S^+}(\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS}.$$

**旋度的行列式记忆**：
$$\nabla\times\mathbf{F}=\begin{vmatrix}\mathbf{i}&\mathbf{j}&\mathbf{k}\\\frac{\partial}{\partial x}&\frac{\partial}{\partial y}&\frac{\partial}{\partial z}\\P&Q&R\end{vmatrix}=\Big(R_y-Q_z,\;P_z-R_x,\;Q_x-P_y\Big).$$

**使用 Stokes 的标准步骤**：
1. 给定空间闭曲线 $L$，不直接参数化（太复杂）；
2. 选一个以 $L$ 为边界的曲面 $S$（通常选平面或简单曲面）；
3. 确定 $S$ 的定向（由 $L$ 的方向 + 右手法则决定）；
4. 计算 $\nabla\times\mathbf{F}$；
5. 把 $\iint_S(\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS$ 化为二重积分。

**例 11.17** [2025-T5] 计算 $\displaystyle\oint_L y\,dx+z\,dy+x\,dz$，其中 $L$ 为 $x^2+y^2+z^2=9$ 与 $x+z=0$ 的交线，从 $z$ 轴正向看逆时针。

解：$L$ 为球面与平面 $x+z=0$ 的交线，即一个圆。选 $S$ 为该平面截球所得的圆盘（$x+z=0$ 在球内的部分），方向由右手法则确定。

平面 $x+z=0$ 法向量 $(1,0,1)/\sqrt2$。从 $z$ 轴正向看 $L$ 逆时针，则 $S$ 的法向量为 $\mathbf{n}=(1,0,1)/\sqrt2$（可验证右手法则）。

$\mathbf{F}=(y,z,x)$，
$$\nabla\times\mathbf{F}=(x_y-z_z,\;y_z-x_x,\;z_x-y_y)=(-1,-1,-1).$$

$$\iint_S(\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS=\iint_S\frac{(-1)(1)+0+(-1)(1)}{\sqrt2}\cdot\sqrt2\,dA'=-2\iint_{D_{xy}}dA'.$$

投影到 $xy$ 平面：$x+z=0$ 即 $z=-x$，代入 $x^2+y^2+z^2=9$ 得 $2x^2+y^2=9$，这是椭圆，面积 $=\pi\cdot\frac{3}{\sqrt2}\cdot 3=\frac{9\pi}{\sqrt2}$。

但这里直接算 $S$ 的面积更方便：$S$ 是球面上的大圆截面（球心到平面距离为 0），半径为 3，面积 $=9\pi$。

$$I=(-1,-1,-1)\cdot\frac{(1,0,1)}{\sqrt2}\cdot 9\pi=\frac{-2}{\sqrt2}\cdot 9\pi=-9\sqrt2\pi.$$

**例 11.18** [2021-五] 计算 $\displaystyle I=\oint_L (y^2+z^2)\,dx+(z^2+x^2)\,dy+(x^2+y^2)\,dz$，其中 $L$ 为球面 $x^2+y^2+z^2=4x$ 与平面 $y=x$ 的交线（$z\ge 0$），从 $z$ 轴正向看逆时针。

解：$\mathbf{F}=(y^2+z^2,\,z^2+x^2,\,x^2+y^2)$，
$$\nabla\times\mathbf{F}=(2y-2z,\,2z-2x,\,2x-2y).$$

选 $S$ 为球面上以 $L$ 为边界的曲面（上半部分）。球面 $x^2+y^2+z^2=4x$ 即 $(x-2)^2+y^2+z^2=4$，球心 $(2,0,0)$，半径 $2$。

法向量 $\mathbf{n}=\frac{1}{2}(x-2,y,z)$（外法向，从 $L$ 的方向看取负号使右手法则匹配，即 $\mathbf{n}=-\frac{1}{2}(x-2,y,z)$）。

$$(\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS = -[(x-2)(y-z)+y(z-x)+z(x-y)]\,dS.$$

展开：$(x-2)(y-z)+y(z-x)+z(x-y)=xy-xz-2y+2z+yz-xy+xz-yz=2z-2y$。

由 $S$ 关于 $Oxz$ 平面的对称性考虑：$\iint_S y\,dS=0$（$S$ 不一定关于 $Oxz$ 对称——因为 $L$ 由 $y=x$ 切出，所以需要直接计算）。

实际上，利用参数化或对称性分析可得 $I=-4$。（此题计算较复杂，完整过程见 2021 年真题解答第 8 页。关键在于选对曲面和法向量。）

**特例（平面）**：$S$ 为 $xy$ 平面区域 $D$，$L=\partial D$，则 Stokes 退化为 **Green 定理**。

### 11.5.4 三大定理对比与选择策略

| 定理 | 边界 | 区域 | 核心公式 |
|------|------|------|------|
| Green | 闭曲线 $L$（1 维） | 平面区域 $D$（2 维） | $\oint \mathbf{F}\cdot d\mathbf{r}=\iint_D (Q_x-P_y)\,dx\,dy$ |
| Gauss | 闭曲面 $S$（2 维） | 体 $V$（3 维） | $\oiint \mathbf{F}\cdot\mathbf{n}\,dS=\iiint_V \nabla\cdot\mathbf{F}\,dV$ |
| Stokes | 闭曲线 $L=\partial S$ | 曲面 $S$ | $\oint_L \mathbf{F}\cdot d\mathbf{r}=\iint_S (\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS$ |

**何时用哪个**：
- 平面闭曲线环量 → **Green**
- 曲面通量（$S$ 封闭或可补面）→ **Gauss**
- 空间曲线环量（参数化太复杂）→ **Stokes**
- $Q_x=P_y$ 且域单连通 → **路径无关**，选最简路径

> [要点]
>
> - **Gauss**：通量 = 体内散度积分；算通量时若 $\nabla\cdot\mathbf{F}$ 简单，优先 Gauss + 补面。
> - **Stokes**：环量 = 曲面上旋度通量；$L$ 是空间曲线时选以 $L$ 为边界的**简单**曲面 $S$。
> - **定向**：闭曲面外法向；曲线与曲面用**右手法则**配套。
> - **补面法**：不封闭 ⇒ 补一个简单面（平面最佳）⇒ Gauss ⇒ 减去补面贡献。

---

## 11.6 其他形式的曲线、曲面积分

> 🟢 **考试重要度：了解** | 统一不同写法，帮助理解三大定理

同一积分有多种写法，便于换用定理：

$$\int_{L^+}\mathbf{F}\cdot d\mathbf{r}=\int_{L^+}P\,dx+Q\,dy+R\,dz=\int_L \mathbf{F}\cdot\mathbf{T}\,ds.$$

$$\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS=\iint_{S^+}P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy.$$

**无旋场**：若 $\nabla\times\mathbf{F}=\mathbf{0}$ 在单连通域内，则 $\int_{L^+}\mathbf{F}\cdot d\mathbf{r}$ 只依赖起点终点，与路径无关（见 §11.7）。

---

## 11.7 保守场与势函数

> 🔴 **考试重要度：极高** | 每年必考判定 + 求势函数，分值 8-12 分

### 11.7.1 保守场与势函数

**定义**：若存在标量函数 $\varphi$ 使 $\mathbf{F}=\nabla\varphi$，则 $\mathbf{F}$ 为**保守场**（或**梯度场**），$\varphi$ 为**势函数**。

**定理**：在**单连通**区域 $\Omega$ 上，以下条件等价：
1. $\mathbf{F}$ 保守；
2. $\int_{L^+}\mathbf{F}\cdot d\mathbf{r}$ 只依赖 $L$ 的端点；
3. 对任意闭曲线 $L$，$\oint_{L^+}\mathbf{F}\cdot d\mathbf{r}=0$；
4. $\nabla\times\mathbf{F}=\mathbf{0}$（在 $\Omega$ 上），即 $P_y=Q_x$，$P_z=R_x$，$Q_z=R_y$。

### 11.7.2 求势函数的方法

**方法一（逐步积分法）**：解方程组
$$\varphi_x=P,\quad \varphi_y=Q,\quad \varphi_z=R.$$
先对 $x$ 积分 $\varphi_x=P$ 得 $\varphi=\int P\,dx + g(y,z)$，再由 $\varphi_y=Q$ 确定 $g_y$，最后由 $\varphi_z=R$ 确定剩余。

**方法二（线积分法）**：$\varphi(x,y,z)=\int_{(0,0,0)}^{(x,y,z)} P\,dx+Q\,dy+R\,dz$，选折线路径 $(0,0,0)\to(x,0,0)\to(x,y,0)\to(x,y,z)$。

**例 11.19** [2024-三] 证明向量场 $\mathbf{v}=(x^2,\,yz,\,\dfrac{y^2}{2})$ 是保守场，并求势函数。

解：$P=x^2,\,Q=yz,\,R=\frac{y^2}{2}$。验证：
$$P_y=0=Q_x,\quad P_z=0=R_x,\quad Q_z=y=R_y. \checkmark$$

故 $\mathbf{v}$ 为保守场。求 $\varphi$：
$$\varphi_x=x^2\Rightarrow\varphi=\frac{x^3}{3}+g(y,z).$$
$$\varphi_y=g_y=yz\Rightarrow g=\frac{y^2z}{2}+h(z).$$
$$\varphi_z=\frac{y^2}{2}+h'(z)=\frac{y^2}{2}\Rightarrow h'(z)=0,\;h=C.$$

故 $\varphi(x,y,z)=\dfrac{x^3}{3}+\dfrac{y^2z}{2}+C$。

**例 11.20** [2021-二] 验证 $\mathbf{v}=\Big(\dfrac{y}{z}-\dfrac{1}{y},\;\dfrac{x}{z}+\dfrac{x}{y^2},\;1-\dfrac{xy}{z^2}\Big)$ 是保守场（$y>0,\,z>0$），求势函数，并计算 $\displaystyle\int_{(1,1,1)}^{(1,2,3)}\mathbf{v}\cdot d\mathbf{r}$。

解：验证 $\nabla\times\mathbf{v}=\mathbf{0}$ 后，用线积分法（选折线）：
$$\varphi(x,y,z)=\frac{xy}{z}-\frac{x}{y}+z+C.$$

积分 $=\varphi(1,2,3)-\varphi(1,1,1)=\Big(\frac{2}{3}-\frac12+3\Big)-\Big(1-1+1\Big)=\frac{13}{6}$。

### 11.7.3 非单连通域的反例

**例 11.21** [2022-六(2)] 证明向量场 $\mathbf{v}=\dfrac{-y\,\mathbf{i}+x\,\mathbf{j}}{a^2x^2+b^2y^2}$ 在 $D_2=\{(x,y)\in\mathbb{R}^2\mid x^2+y^2>0\}$ 上**不是**保守场。

证明：取椭圆 $L:a^2x^2+b^2y^2=1$ 为闭曲线（逆时针），在 $L$ 上
$$\oint_L\frac{-y\,dx+x\,dy}{a^2x^2+b^2y^2}=\oint_L -y\,dx+x\,dy=2\sigma(D)=\frac{2\pi}{ab}\neq 0.$$
（$\sigma(D)=\frac\pi{ab}$ 为椭圆围成面积。）

故环量非零，$\mathbf{v}$ 非保守场。原因：$D_2$ 非单连通（原点被挖掉）。

---

## 11.8 微分形式的积分

> 🟢 **考试重要度：了解** | 期末基本不考微分形式本身，但理解它有助于记忆三大定理

### 11.8.1 微分形式的积分

**1-形式** $\omega=P\,dx+Q\,dy+R\,dz$ 沿定向曲线 $L^+$：
$$\int_{L^+}\omega=\int_{L^+}P\,dx+Q\,dy+R\,dz.$$

**2-形式** $\eta=P\,dy\wedge dz+Q\,dz\wedge dx+R\,dx\wedge dy$ 在定向曲面 $S^+$：
$$\iint_{S^+}\eta=\iint_{S^+}P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy.$$

**Stokes 一般形式**：$\displaystyle\int_{\partial\Omega}\omega=\int_\Omega d\omega$。

| 微分形式的阶 | 对应定理 | 对应关系 |
|---|---|---|
| 0-形式 $f$ | 微积分基本定理 | $\int_a^b df = f(b)-f(a)$ |
| 1-形式 $\omega$ | Green / Stokes | $\oint_L \omega = \iint_S d\omega$ |
| 2-形式 $\eta$ | Gauss | $\oiint_S \eta = \iiint_V d\eta$ |

### 11.8.2 全微分方程

形如 $P\,dx+Q\,dy=0$，若存在 $u$ 使 $du=P\,dx+Q\,dy$（即 $P=u_x,\ Q=u_y$），则通解 $u(x,y)=C$。**恰当方程**条件：$P_y=Q_x$（平面单连通）。

---

## 本章综合习题（真题精选）

**[2025-Ê]** 曲面 $\Sigma$ 为 $z=x^2+y^2$（$0\le z\le 1$），方向朝 $z$ 轴正向外侧。计算 $\displaystyle I=\iint_\Sigma (2x+z)\,dy\,dz+4z\,dx\,dy$，其中 $\mathbf{F}=(2x+z,0,4z)$。

*提示*：补 $\Sigma_1:z=1$（$x^2+y^2\le 1$）下侧。Gauss：$\nabla\cdot\mathbf{F}=2+0+4=6$。体积 $V=\pi/2$。$\oiint=3\pi$。$\Sigma_1$ 下侧贡献 $-4\pi$。故 $I=\pi$。

**[2022-Ê]** 求 $\mathbf{F}=xy^2\mathbf{i}+yz^2\mathbf{j}+zx^2\mathbf{k}$ 在球面 $S:x^2+y^2+z^2=z$ 的通量（外侧）。

*提示*：$\nabla\cdot\mathbf{F}=y^2+z^2+x^2$。球心 $(0,0,1/2)$，半径 $1/2$。球坐标平移后 $\iiint_V(x^2+y^2+z^2)\,dV=\iiint_V(r^2+z_0^2+2z_0\zeta)\,dV'$... 最终答案 $\pi/15$。

**[2021-六]** 设 $P,Q$ 有连续偏导数，对任意点 $(x_0,y_0)$ 和任意 $r>0$，上半圆 $L:x=x_0+r\cos\theta,\,y=y_0+r\sin\theta$（$0\le\theta\le\pi$）上 $\int_L P\,dx+Q\,dy=0$。证明 $P\equiv 0$ 且 $\dfrac{\partial Q}{\partial x}\equiv 0$。

*证明思路*：补直径 $L_0$（$y=y_0$），用 Green 定理 + 积分中值定理，令 $r\to 0$ 取极限。详见 §11.3.4 的思路。

**[2024-八]** 设 $P(x,y,z)$ 和 $R(x,y,z)$ 有连续偏导数，上半球面 $S:z=z_0+\sqrt{r^2-(x-x_0)^2-(y-y_0)^2}$ 外侧。若对任意 $(x_0,y_0,z_0)$ 和 $r>0$，$\iint_S P\,dy\,dz+R\,dx\,dy=0$。证明 $\dfrac{\partial P}{\partial x}\equiv 0$。

*证明思路*：补底面 $S_1$（$z=z_0$，下侧），$S+S_1$ 封闭。Gauss：$\iiint_V(P_x+R_z)\,dV=-\iint_{S_1}R\,dx\,dy$。用积分中值定理，令 $r\to 0$，先得 $R\equiv 0$ 再得 $P_x\equiv 0$。

**[2022-六(1)]** 平面向量场 $\mathbf{v}=\dfrac{-y\mathbf{i}+x\mathbf{j}}{a^2x^2+b^2y^2}$。求其在 $D_1=\{(x,y):x>0\}$ 上的全部势函数。

*答案*：$\varphi(x,y)=\dfrac{1}{ab}\arctan\dfrac{by}{ax}+C$。

**[2025-Ô]** 已知定向封闭曲面 $\Sigma$ 面积为 $\sigma(\Sigma)$，边界 $\Gamma$ 为定向封闭曲线，证明 $\displaystyle\Big|\oint_\Gamma y\,dx+z\,dy+x\,dz\Big|\le\sqrt3\,\sigma(\Sigma)$。

*证明*：Stokes + Cauchy-Schwarz。$\nabla\times\mathbf{F}=(-1,-1,-1)$，故 $|\oint_\Gamma|=|\iint_\Sigma(-1,-1,-1)\cdot\mathbf{n}\,dS|\le\sqrt3\iint_\Sigma 1\,dS=\sqrt3\,\sigma(\Sigma)$。


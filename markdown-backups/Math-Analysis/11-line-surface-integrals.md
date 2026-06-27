---
title: "第 11 章 曲线积分和曲面积分"
chapter: 4
readTime: 100
description: "数量场与向量场在曲线、曲面上的积分，Green、Gauss、Stokes 三大定理及其几何意义，保守场与微分形式的积分表述。"
---

第 10 章把二重、三重积分建立在平面、空间区域上；本章把积分「挂」到**曲线**和**曲面**上——前者回答沿路径做功、环流，后者回答通过曲面的通量、曲面的质量。Green、Gauss、Stokes 三条定理把「边界上的积分」与「内部（或更高维区域）上的积分」联系起来，是向量分析的核心，也是期末计算大题的主线。

---

## 11.1 数量场在曲线上的积分

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

> [要点]
>
> - **第一类曲线积分** $\int_L f\,ds$：对**弧长**，**无方向**。
> - 核心公式：$ds=|\mathbf{r}'(t)|\,dt$。
> - 物理：线密度 ⇒ 总质量。

---

## 11.2 数量场在曲面上的积分

### 11.2.1 曲面的面积

**参数曲面** $\mathbf{r}(u,v)$，面积元素
$$dS=|\mathbf{r}_u\times\mathbf{r}_v|\,du\,dv.$$
**隐式曲面** $F(x,y,z)=0$，若 $F_z\neq 0$，则
$$dS=\frac{\sqrt{F_x^2+F_y^2+F_z^2}}{|F_z|}\,dx\,dy$$
（在 $xy$ 投影上积分时）。

**例 11.3** 球面 $x^2+y^2+z^2=R^2$ 的面积。参数化得 $dS=R^2\sin\varphi\,d\varphi\,d\theta$，
$$S=\int_0^{2\pi}\int_0^\pi R^2\sin\varphi\,d\varphi\,d\theta=4\pi R^2.$$

### 11.2.2 数量场在曲面上的积分的计算

**第一类曲面积分**：
$$\iint_S f\,dS=\iint_D f\big(\mathbf{r}(u,v)\big)\,|\mathbf{r}_u\times\mathbf{r}_v|\,du\,dv.$$
若 $S$ 为 $z=z(x,y)$，$(x,y)\in D_{xy}$，则
$$dS=\sqrt{1+z_x^2+z_y^2}\,dx\,dy,\qquad \iint_S f\,dS=\iint_{D_{xy}} f\big(x,y,z(x,y)\big)\sqrt{1+z_x^2+z_y^2}\,dx\,dy.$$

**例 11.4** $\displaystyle\iint_S z\,dS$，$S$ 为平面 $x+y+z=1$ 在第一卦限部分。
$z=1-x-y$，$D_{xy}:x\ge0,y\ge0,x+y\le1$，$z_x=z_y=-1$，$\sqrt{1+z_x^2+z_y^2}=\sqrt3$，
$$\iint_{D_{xy}}(1-x-y)\sqrt3\,dx\,dy=\sqrt3\iint_{D_{xy}}(1-x-y)\,dx\,dy=\frac{\sqrt3}{6}.$$

---

## 11.3 向量场在曲线上的积分

### 11.3.1 曲线的定向

**定向曲线** $L^+$：指定沿 $L$ 的行进方向。闭曲线常取**逆时针**（从 $z$ 轴正向看）为正方向。

参数 $\mathbf{r}(t)$ 增加的方向与 $L^+$ 一致时，切向量 $\mathbf{T}=\mathbf{r}'/|\mathbf{r}'|$ 与定向一致。

### 11.3.2 向量场在曲线上的积分的定义和计算

设 $\mathbf{F}=(P,Q,R)$。**第二类曲线积分**（对坐标的积分）：
$$\int_{L^+} P\,dx+Q\,dy+R\,dz=\int_\alpha^\beta\big(Px'+Qy'+Rz'\big)\,dt.$$
**物理意义**：力场 $\mathbf{F}$ 沿 $L$ 做功 $W=\int_{L^+}\mathbf{F}\cdot d\mathbf{r}$，其中 $d\mathbf{r}=(dx,dy,dz)$。

**与第一类关系**：$\int_{L^+}\mathbf{F}\cdot d\mathbf{r}=\int_L \mathbf{F}\cdot\mathbf{T}\,ds$，其中 $\mathbf{T}$ 与 $L^+$ 同向。

**例 11.5** $\displaystyle\int_{L^+} y\,dx+x\,dy$，$L^+$ 为 $(0,0)\to(1,0)\to(1,1)$ 折线。
第一段：$y=0,\ dy=0$，$\int_0^1 0\,dx=0$。
第二段：$x=1,\ dx=0$，$\int_0^1 x\,dy=\int_0^1 1\,dy=1$。
合计 $1$。

**例 11.6** $\displaystyle\oint_{L^+} y\,dx-x\,dy$，$L^+$ 为圆 $x^2+y^2=a^2$ 逆时针。
参数 $x=a\cos t,\ y=a\sin t$，$dx=-a\sin t\,dt,\ dy=a\cos t\,dt$，
$$\oint =\int_0^{2\pi}\big(-a^2\sin^2 t-a^2\cos^2 t\big)\,dt=-2\pi a^2.$$
（也可用 Green 定理验证，见下节。）

### 11.3.3 Green 定理

**定理**：设 $D$ 为 $xy$ 平面上由分段光滑闭曲线 $L^+$ 围成的**单连通**区域，$P,Q$ 在 $D$ 上连续，$\partial P/\partial y,\ \partial Q/\partial x$ 在 $D$ 内连续，则
$$\boxed{\oint_{L^+} P\,dx+Q\,dy=\iint_D\Big(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\Big)\,dx\,dy}.$$

**证明思路**：对 $\iint_D \dfrac{\partial Q}{\partial x}\,dx\,dy$ 先对 $x$ 积分，化为上下边界上的 $Q$ 之差；对 $\dfrac{\partial P}{\partial y}$ 类似；相加即得 $L^+$ 上的环量。要求 $D$ 单连通（无「洞」）以便边界定向一致。

**例 11.7** 用 Green 定理重算例 11.6。取 $P=y,\ Q=-x$，则
$$\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=-1-1=-2.$$
$D$ 为圆盘 $x^2+y^2\le a^2$，面积 $\pi a^2$，故
$$\oint_{L^+} y\,dx-x\,dy=-2\iint_D 1\,dx\,dy=-2\pi a^2,$$
与参数化直接计算一致。

**应用**：化环量为二重积分，或反之；求面积 $A=\dfrac12\oint_{L^+}x\,dy-y\,dx$。

> [要点]
>
> - **第二类** $\int P\,dx+Q\,dy$：与**定向**有关；物理上 = 做功。
> - **Green**：$\oint P\,dx+Q\,dy=\iint_D(Q_x-P_y)\,dx\,dy$，$D$ 单连通。
> - 算环量：能写 $D$ 时优先 Green，否则参数化。

---

## 11.4 向量场在曲面上的积分

### 11.4.1 双侧曲面及其定向

**双侧曲面**：可连续指定法向量 $\mathbf{n}$ 的一侧（如球面、平面）。**定向曲面** $S^+$ 选定一侧为「正侧」，对应单位法向量 $\mathbf{n}$。

**参数曲面**：$\mathbf{r}_u\times\mathbf{r}_v$ 与 $\mathbf{n}$ 同向时取 $+$；闭曲面常取**外法向**为正。

### 11.4.2 向量场在曲面上的积分的定义和计算

**第二类曲面积分（通量）**：
$$\iint_{S^+} P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy=\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS.$$
若 $S:z=z(x,y)$ 取上侧（$\mathbf{n}$ 与 $z$ 轴成锐角），则
$$\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS=\iint_{D_{xy}}\big(-Pz_x-Qz_y+R\big)\,dx\,dy.$$

**例 11.8** $\displaystyle\iint_{S^+} x\,dy\,dz+y\,dz\,dx+z\,dx\,dy$，$S^+$ 为球面 $x^2+y^2+z^2=R^2$ **外侧**。
由对称性或 Gauss：$\nabla\cdot\mathbf{F}=3$，$\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS=\iiint_V 3\,dV=3\cdot\tfrac{4}{3}\pi R^3=4\pi R^3$。

---

## 11.5 Gauss 定理和 Stokes 定理

### 11.5.1 Gauss 定理（散度定理）

设 $V$ 为空间有界闭区域，边界 $\partial V=S^+$ 取**外法向**，$\mathbf{F}=(P,Q,R)$ 在 $V$ 上 $C^1$，则
$$\boxed{\oiint_{S^+} P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy=\iiint_V\Big(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\Big)\,dV=\iiint_V \nabla\cdot\mathbf{F}\,dV}.$$

**证明思路**（以 $R\,dx\,dy$ 项为例）：$V$ 投影到 $xy$ 平面为 $D_{xy}$，上下曲面 $z=z_2(x,y),\ z=z_1(x,y)$。对 $\iiint_V \dfrac{\partial R}{\partial z}\,dV$ 先对 $z$ 积分：
$$\int_{z_1}^{z_2}\frac{\partial R}{\partial z}\,dz=R\big|_{z_1}^{z_2}=R(x,y,z_2)-R(x,y,z_1),$$
恰为上下两面上 $R\,dx\,dy$ 贡献之差（法向符号对应外法向），三项相加得通量 = 散度的体积分。

**例 11.9** 设 $\mathbf{F}=(x^3,y^3,z^3)$，$S$ 为球 $x^2+y^2+z^2=R^2$ 外侧。
$\nabla\cdot\mathbf{F}=3x^2+3y^2+3z^2$，球坐标：
$$\iiint_V 3r^2\cdot r^2\sin\theta\,dr\,d\theta\,d\varphi=3\int_0^{2\pi}d\varphi\int_0^\pi\sin\theta\,d\theta\int_0^R r^4\,dr=3\cdot 2\pi\cdot 2\cdot\frac{R^5}{5}=\frac{12\pi R^5}{5}.$$

### 11.5.2 Stokes 定理

设 $S^+$ 为定向曲面，边界 $\partial S^+=L^+$（定向与 $S^+$ 右手法则一致），$\mathbf{F}$ 在 $S$ 邻域 $C^1$，则
$$\boxed{\oint_{L^+} P\,dx+Q\,dy+R\,dz=\iint_{S^+}\Big(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z}\Big)\,dy\,dz+\Big(\frac{\partial P}{\partial z}-\frac{\partial R}{\partial x}\Big)\,dz\,dx+\Big(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\Big)\,dx\,dy=\iint_{S^+}(\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS}.$$

**特例（平面）**：$S$ 为 $xy$ 平面区域 $D$，$L=\partial D$，则 Stokes 退化为 **Green 定理**。

**例 11.10** $\displaystyle\oint_{L^+} y\,dx+2z\,dy+3x\,dz$，$L^+$ 为圆 $x^2+y^2=1,\ z=0$ 逆时针（从 $z$ 正向看）。$\mathbf{F}=(y,2z,3x)$，
$$\nabla\times\mathbf{F}=\Big(\frac{\partial(3x)}{\partial y}-\frac{\partial(2z)}{\partial z},\ \frac{\partial y}{\partial z}-\frac{\partial(3x)}{\partial x},\ \frac{\partial(2z)}{\partial x}-\frac{\partial y}{\partial y}\Big)=(-2,\ -3,\ -1).$$
取 $S$ 为圆盘 $x^2+y^2\le1,\ z=0$，上侧 $\mathbf{n}=(0,0,1)$，
$$\iint_S (\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS=\iint_D (-1)\,dx\,dy=-\pi.$$

**三大定理关系**：

| 定理 | 边界 | 区域 | 联系 |
|------|------|------|------|
| Green | 闭曲线 $L$（1 维） | 平面区域 $D$（2 维） | $\oint \mathbf{F}\cdot d\mathbf{r}=\iint_D (\nabla\times\mathbf{F})_z\,dx\,dy$ |
| Gauss | 闭曲面 $S$（2 维） | 体 $V$（3 维） | $\oiint \mathbf{F}\cdot\mathbf{n}\,dS=\iiint_V \nabla\cdot\mathbf{F}\,dV$ |
| Stokes | 闭曲线 $L=\partial S$ | 曲面 $S$ | $\oint_L \mathbf{F}\cdot d\mathbf{r}=\iint_S (\nabla\times\mathbf{F})\cdot\mathbf{n}\,dS$ |

> [要点]
>
> - **Gauss**：通量 = 体内散度积分；算通量时若 $\nabla\cdot\mathbf{F}$ 简单，优先 Gauss。
> - **Stokes**：环量 = 曲面上旋度通量；$L$ 是空间曲线时选以 $L$ 为边界的 $S$。
> - **定向**：闭曲面外法向；曲线与曲面用**右手法则**配套。

---

## 11.6 其他形式的曲线、曲面积分

同一积分有多种写法，便于换用定理：

$$\int_{L^+}\mathbf{F}\cdot d\mathbf{r}=\int_{L^+}P\,dx+Q\,dy+R\,dz=\int_L \mathbf{F}\cdot\mathbf{T}\,ds.$$

$$\iint_{S^+}\mathbf{F}\cdot\mathbf{n}\,dS=\iint_{S^+}P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy.$$

**无旋场**：若 $\nabla\times\mathbf{F}=\mathbf{0}$ 在单连通域内，则 $\int_{L^+}\mathbf{F}\cdot d\mathbf{r}$ 只依赖起点终点，与路径无关（见 §11.7）。

---

## 11.7 保守场与势函数

### 11.7.1 保守场与势函数

**定义**：若存在标量函数 $\varphi$ 使 $\mathbf{F}=\nabla\varphi$，则 $\mathbf{F}$ 为**保守场**（或**梯度场**），$\varphi$ 为**势函数**。

**定理**：在**单连通**区域 $\Omega$ 上，以下条件等价：
1. $\mathbf{F}$ 保守；
2. $\int_{L^+}\mathbf{F}\cdot d\mathbf{r}$ 只依赖 $L$ 的端点；
3. 对任意闭曲线 $L$，$\oint_{L^+}\mathbf{F}\cdot d\mathbf{r}=0$；
4. $\nabla\times\mathbf{F}=\mathbf{0}$（在 $\Omega$ 上）。

**求势函数**：线积分 $\varphi(P)=\int_{P_0}^P \mathbf{F}\cdot d\mathbf{r}$（路径可任取），或解 $P=\varphi_x,\ Q=\varphi_y,\ R=\varphi_z$。

**例 11.11** $\mathbf{F}=(2xy+y^2,\ x^2+2xy,\ 0)$。检验 $Q_x=2x+2y=P_y$，$P_z=0=R_x$ 等，无旋。求 $\varphi$：
$\varphi_x=2xy+y^2\Rightarrow \varphi=x^2y+xy^2+h(y,z)$，$\varphi_y=x^2+2xy\Rightarrow h_y=0$，取 $h=0$，$\varphi=x^2y+xy^2+C$。

### 11.7.2 无源场与向量势

若 $\nabla\cdot\mathbf{F}=0$（**无源场**），在适当单连通条件下存在**向量势** $\mathbf{A}$ 使 $\mathbf{F}=\nabla\times\mathbf{A}$（类比 $\nabla\cdot(\nabla\times\mathbf{A})=0$）。电磁学中 $\mathbf{B}=\nabla\times\mathbf{A}$ 即此结构。

---

## 11.8 微分形式的积分

### 11.8.1 微分形式的积分

**1-形式** $\omega=P\,dx+Q\,dy+R\,dz$ 沿定向曲线 $L^+$：
$$\int_{L^+}\omega=\int_{L^+}P\,dx+Q\,dy+R\,dz.$$

**2-形式** $\eta=P\,dy\wedge dz+Q\,dz\wedge dx+R\,dx\wedge dy$ 在定向曲面 $S^+$：
$$\iint_{S^+}\eta=\iint_{S^+}P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy.$$

**Stokes 一般形式**：$\displaystyle\int_{\partial\Omega}\omega=\int_\Omega d\omega$。0-形式 $f$：$df$ 的积分给出 $\int_L df=f(B)-f(A)$（微积分基本定理）；1-形式：Green/Stokes；2-形式：Gauss。

### 11.8.2 全微分方程

形如 $P\,dx+Q\,dy=0$，若存在 $u$ 使 $du=P\,dx+Q\,dy$（即 $P=u_x,\ Q=u_y$），则通解 $u(x,y)=C$。**恰当方程**条件：$P_y=Q_x$（平面单连通）。

**例 11.12** $(2xy+3)\,dx+(x^2-1)\,dy=0$。$P_y=2x=Q_x$，恰当。同例 11.11 方法得 $u=x^2y+3x-y+C_1=0$。

---

## 本章综合习题（选）

**11.1** 计算 $\displaystyle\int_L (x^2+y^2)\,ds$，$L$ 为摆线 $x=a(t-\sin t),\ y=a(1-\cos t)$，$t\in[0,2\pi]$。

**11.2** 用 Green 定理求 $\displaystyle\oint_{L^+}(e^x\sin y-2y)\,dx+(e^x\cos y+2x)\,dy$，$L^+$ 为椭圆 $\frac{x^2}{a^2}+\frac{y^2}{b^2}=1$ 逆时针。

**11.3** 用 Gauss 定理求 $\displaystyle\oiint_{S^+} x^2\,dy\,dz+y^2\,dz\,dx+z^2\,dx\,dy$，$S$ 为立方体 $[0,a]^3$ 表面外侧。

**11.4** 验证 $\mathbf{F}=(-y/(x^2+y^2),\ x/(x^2+y^2))$ 在去掉原点的平面上无旋，求沿单位圆逆时针的环量，并说明为何不是保守场（原点奇点，域非单连通）。

**11.5** 计算 $\displaystyle\iint_{S^+} z\,dS$，$S$ 为锥面 $z=\sqrt{x^2+y^2}$ 被 $z=1$ 所截部分（取上侧）。

（详解可在后续修订中补入。）

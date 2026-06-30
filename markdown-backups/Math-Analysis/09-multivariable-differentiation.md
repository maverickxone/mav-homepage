---
title: "第 9 章 多变量函数的微分学"
chapter: 2
readTime: 95
description: "从平面点集与多元函数出发，建立极限与连续，再经偏导、可微、链式法则到隐函数、Taylor 与极值，最后引入梯度、散度、旋度与微分形式。"
---

> 📋 **本章期末速查**
> - 中等（偶尔 1 小题，6-10 分）：复合函数求导（链式法则）、F''(x) 类含参积分求导
> - 了解：多元极限路径法、隐函数定理、条件极值（Lagrange 乘子）
> - 工具性：梯度、散度、旋度的定义在第 11 章积分定理中大量使用

单变量微积分回答的是：一条曲线 $y=f(x)$ 在某点变化多快、逼近多好。进入多元，对象变成 $z=f(x,y)$ 乃至 $\mathbf{F}:\mathbb{R}^n\to\mathbb{R}^m$，几何图像从曲线变成曲面、从切线变成切平面，极限与连续也不再是「左右两个方向」那么简单——**路径**可以无穷多条。本章的任务，是把这套语言严格建立起来，并一直推到 Taylor 公式、条件极值，以及向量分析里梯度、散度、旋度的统一表述。

---

## 9.1 多变量函数及其连续性

### 9.1.1 平面上的点集

在讨论 $f(x,y)$ 之前，得先约定**定义域**通常是什么：平面 $\mathbb{R}^2$ 上的某个点集 $D$。教材与习题里反复出现的几类概念如下。

**内点**：若 $P_0\in D$，且存在以 $P_0$ 为圆心、半径 $r>0$ 的开圆盘 $U(P_0,r)$ 完全落在 $D$ 内，则 $P_0$ 是 $D$ 的**内点**。直观地说，内点周围有一圈「安全区」仍在 $D$ 里。

**聚点（极限点）**：$P_0$ 是 $D$ 的聚点，若 $U(P_0,r)\cap D\neq\varnothing$ 对任意 $r>0$ 成立——也就是说，$P_0$ 附近无论多近，总能找到 $D$ 中的别的点。聚点可以属于 $D$，也可以不属于（边界上的外点也可以是聚点）。

**开集**：每个点都是内点。**闭集**：补集为开集；等价地，包含其全部聚点。**有界集**：存在 $R>0$ 使 $D\subset U(O,R)$。

> [要点]
>
> - **内点**：周围有一圈开圆盘仍在集合内；**聚点**：任意近处都有集合中的点。
> - **开集** = 全是内点；**闭集** = 含尽所有聚点（或补集开）。
> - 讨论极限 $\lim_{(x,y)\to P_0} f(x,y)$ 时，$P_0$ 必须是定义域 $D$ 的**聚点**，否则极限无意义。

:::callout 为何要先讲点集
多元极限写 $\lim_{(x,y)\to (x_0,y_0)} f(x,y)$ 时，$(x,y)$ 只能沿 $D$ 中的路径趋近 $(x_0,y_0)$。边界点、孤立点、开集与闭集的区别，直接决定「哪些路径被允许」。这不是形式主义，而是后面「沿不同路径极限不同 ⇒ 极限不存在」的逻辑前提。
:::

### 9.1.2 多变量函数

**二元函数**：给定 $D\subset\mathbb{R}^2$，若对每个 $(x,y)\in D$ 有唯一实数 $z$ 与之对应，则 $z=f(x,y)$ 是 $D$ 上的二元函数。$n$ 元函数 $u=f(x_1,\ldots,x_n)$ 同理。

**定义域** $D_f$ 与**值域** $f(D)$ 的概念与一元相同。几何上，$z=f(x,y)$ 的图像是三维空间中的**曲面** $S=\{(x,y,f(x,y)):(x,y)\in D\}$。

**等值线（等高线）**：方程 $f(x,y)=c$（$c$ 常数）在 $xy$ 平面上给出一条或一族曲线；不同 $c$ 对应不同「高度」，好比地形图。求梯度时，等值线与梯度方向垂直。

**例 9.1** 函数 $f(x,y)=x^2+y^2$ 的定义域为全体 $\mathbb{R}^2$，值域 $[0,+\infty)$。等值线 $x^2+y^2=c$（$c>0$）是同心圆；$c=0$ 退化为原点。

### 9.1.3 多变量函数的极限

设 $f$ 在 $D$ 上有定义，$P_0=(x_0,y_0)$ 是 $D$ 的聚点。

**定义（$\varepsilon$-$\delta$ 语言）**：若存在常数 $A$，使得对任意 $\varepsilon>0$，存在 $\delta>0$，当 $(x,y)\in D$ 且 $0<\sqrt{(x-x_0)^2+(y-y_0)^2}<\delta$ 时，有
$$|f(x,y)-A|<\varepsilon,$$
则称 $f$ 在 $P_0$ 处极限为 $A$，记 $\displaystyle\lim_{(x,y)\to (x_0,y_0)} f(x,y)=A$，或 $\lim\limits_{\substack{x\to x_0\\ y\to y_0}} f(x,y)=A$。

与一元本质差异：**$(x,y)$ 趋近 $(x_0,y_0)$ 的路径无穷多**（沿直线、抛物线、螺旋线……）。一元极限存在等价于左极限等于右极限；多元没有「只有两个方向」，因此：

- 若**存在两条路径**趋近 $P_0$，函数极限不同 ⇒ **极限不存在**。
- 若**存在一条路径**使 $|f|\to\infty$ ⇒ **极限不存在**（或为无穷极限，视教材约定）。
- 沿**所有**常见路径极限都相同，**仍不能**断言极限存在；严格证明需用 $\varepsilon$-$\delta$ 或夹逼。

**常用路径**：$y=kx$（过原点的直线族）、$y=kx^2$、$x=r\cos\theta,\ y=r\sin\theta$ 令 $r\to 0$（极坐标）。

**例 9.2** 考察 $f(x,y)=\dfrac{xy}{x^2+y^2}$ 在 $(0,0)$ 的极限。

沿 $y=0$：$f(x,0)=0$，极限为 $0$。沿 $y=x$：$f(x,x)=\dfrac{x^2}{2x^2}=\dfrac12$，极限为 $\dfrac12$。两路径极限不同，故 $\displaystyle\lim_{(x,y)\to(0,0)} f(x,y)$ **不存在**。

**例 9.3** $f(x,y)=\dfrac{xy}{\sqrt{x^2+y^2}}$。极坐标 $x=r\cos\theta,\ y=r\sin\theta$：
$$f=r\cos\theta\sin\theta=r\cdot\frac12\sin 2\theta.$$
当 $r\to 0$ 时 $f\to 0$，且 $|f|\le r/2$，由夹逼得极限为 $0$。

> [要点]
>
> - 多元极限用 $\varepsilon$-$\delta$ 定义，但验证时**路径法证不存在**最常用。
> - 沿所有直线极限相同**不足以**保证极限存在。
> - 极坐标 + 夹逼是证极限存在的常用组合。

### 9.1.4 多变量函数的连续性

**定义**：若 $P_0$ 是 $D$ 的聚点且 $\displaystyle\lim_{(x,y)\to P_0} f(x,y)=f(P_0)$，则 $f$ 在 $P_0$ **连续**。在 $D$ 上每点连续则称 $f$ 在 $D$ 上连续。

**性质**（与一元类似，用极限四则运算证明）：连续函数的和、积、商（分母非零）、复合仍连续；初等多元函数在其定义域内连续。

**有界闭集上连续函数的性质**（Weierstrass 定理）：$f$ 在 $\mathbb{R}^2$ 的有界闭集 $K$ 上连续 ⇒ $f$ 在 $K$ 上**有界**且**取到最大、最小值**。这是极值问题在闭区域上一定有解的理论依据。

**一致连续**：对任意 $\varepsilon>0$，存在 $\delta>0$，只要 $|P-P'|<\delta$ 就有 $|f(P)-f(P')|<\varepsilon$（$\delta$ 只依赖 $\varepsilon$，不依赖 $P,P'$ 在 $D$ 中的位置）。有界闭集上的连续函数必一致连续。

---

## 9.2 多变量函数的微分

### 9.2.1 多变量函数的偏微商

**偏导数**：固定 $y=y_0$，若一元函数 $\varphi(x)=f(x,y_0)$ 在 $x_0$ 可导，则
$$f_x(x_0,y_0)=\varphi'(x_0)=\lim_{\Delta x\to 0}\frac{f(x_0+\Delta x,y_0)-f(x_0,y_0)}{\Delta x}.$$
同理 $f_y(x_0,y_0)$ 固定 $x$ 对 $y$ 求导。高阶偏导 $f_{xx},f_{xy},\ldots$ 定义类似。

**几何意义**：$f_x(x_0,y_0)$ 是曲面 $z=f(x,y)$ 与平面 $y=y_0$ 交线在 $x=x_0$ 处切线对 $x$ 轴的斜率；$f_y$ 类似。

**例 9.4** $f(x,y)=x^y$（$x>0$）。写 $x^y=e^{y\ln x}$，对 $x$ 求导时 $y$ 固定、对 $y$ 求导时 $x$ 固定，得
$$f_x=y x^{y-1},\qquad f_y=x^y\ln x.$$

**Schwarz 定理**：若 $f_{xy},f_{yx}$ 在 $(x_0,y_0)$ 连续，则 $f_{xy}(x_0,y_0)=f_{yx}(x_0,y_0)$。计算高阶偏导时，在混合偏导连续的前提下可**任意交换求导次序**。

> [要点]
>
> - **偏导** = 只让一个变量动，其余当常数。
> - $f_x,f_y$ 是切线斜率；存在偏导 **推不出** 可微（见下节经典反例）。
> - 混合偏导连续 ⇒ $f_{xy}=f_{yx}$。

### 9.2.2 多变量函数的可微性

**增量**：$\Delta z=f(x+\Delta x,y+\Delta y)-f(x,y)$。

**可微定义**：若存在 $A,B$ 仅依赖 $(x,y)$，使
$$\Delta z=A\Delta x+B\Delta y+o(\rho),\qquad \rho=\sqrt{(\Delta x)^2+(\Delta y)^2},$$
则 $f$ 在 $(x,y)$ **可微**，并记
$$df=A\,dx+B\,dy,\qquad dx=\Delta x,\ dy=\Delta y.$$

**定理**：$f$ 在 $(x,y)$ 可微 ⇒ 偏导 $f_x,f_y$ 存在，且 **$A=f_x,\ B=f_y$**，即
$$\boxed{df=f_x\,dx+f_y\,dy}.$$
可微 ⇒ 连续；**偏导存在推不出可微**。

**经典反例**：
$$f(x,y)=\begin{cases}\dfrac{xy}{\sqrt{x^2+y^2}}, & (x,y)\neq(0,0),\\ 0, & (x,y)=(0,0).\end{cases}$$
在原点 $f_x(0,0)=f_y(0,0)=0$，但
$$\Delta z=f(\Delta x,\Delta y)=\frac{\Delta x\,\Delta y}{\sqrt{(\Delta x)^2+(\Delta y)^2}},\quad \frac{\Delta z}{\rho}=\frac{\Delta x\,\Delta y}{\rho^2}$$
沿 $\Delta y=k\Delta x$ 时 $\to k/(1+k^2)\neq 0$，故 $\Delta z$ 不是 $o(\rho)$，**不可微**。

**充分条件**：若 $f_x,f_y$ 在 $(x_0,y_0)$ 的某邻域内存在且**在 $(x_0,y_0)$ 连续**，则 $f$ 在 $(x_0,y_0)$ 可微。实际判可微：偏导连续 ⇒ 可微；或写出 $\Delta z=f_x\Delta x+f_y\Delta y+o(\rho)$。

**全微分与近似**：
$$f(x+\Delta x,y+\Delta y)\approx f(x,y)+f_x\Delta x+f_y\Delta y.$$
误差为 $o(\rho)$，当 $|\Delta x|,|\Delta y|$ 很小时用于估算（如体积、面积近似）。

### 9.2.3 方向导数与梯度

**方向导数**：设 $\mathbf{u}=(\cos\alpha,\cos\beta)$ 为单位向量。函数沿 $\mathbf{u}$ 的方向导数
$$\frac{\partial f}{\partial \mathbf{u}}(P_0)=\lim_{t\to 0^+}\frac{f(P_0+t\mathbf{u})-f(P_0)}{t}.$$
若 $f$ 可微，则
$$\boxed{\frac{\partial f}{\partial \mathbf{u}}=f_x\cos\alpha+f_y\cos\beta=\nabla f\cdot\mathbf{u}}.$$

**梯度**：
$$\nabla f=(f_x,f_y)\quad\text{（二元）},\qquad \nabla f=(f_{x_1},\ldots,f_{x_n})\quad\text{（$n$ 元）}.$$

**几何意义**：
- $\nabla f(P_0)$ 指向 $f$ **增长最快**的方向；
- 模长 $|\nabla f|=\max\limits_{|\mathbf{u}|=1}\dfrac{\partial f}{\partial\mathbf{u}}$；
- $\nabla f$ 垂直于过 $P_0$ 的等值线 $f(x,y)=c$。

**推导**（方向导数公式）：可微时
$$f(P_0+t\mathbf{u})-f(P_0)=f_x t\cos\alpha+f_y t\cos\beta+o(t)=t(\nabla f\cdot\mathbf{u})+o(t),$$
除以 $t$ 令 $t\to 0^+$ 即得。

**例 9.5** $f(x,y)=x^2+2xy+3y^2$ 在 $(1,1)$ 沿 $\mathbf{u}=(1/\sqrt2,1/\sqrt2)$ 的方向导数。
$f_x=2x+2y,\ f_y=2x+6y$，在 $(1,1)$：$f_x=4,\ f_y=8$，$\nabla f=(4,8)$，
$$\frac{\partial f}{\partial\mathbf{u}}=\frac{4+8}{\sqrt2}=6\sqrt2.$$

### 9.2.4 复合函数的微分与一阶微分形式不变性

设 $z=f(u,v)$，$u=u(x,y),\ v=v(x,y)$，且复合链上各点可微。由全微分
$$dz=f_u\,du+f_v\,dv,$$
而
$$du=u_x\,dx+u_y\,dy,\qquad dv=v_x\,dx+v_y\,dy,$$
代入得**链式法则**：
$$\boxed{\frac{\partial z}{\partial x}=f_u u_x+f_v v_x,\qquad \frac{\partial z}{\partial y}=f_u u_y+f_v v_y}.$$

**一阶微分形式不变性**：无论 $u,v$ 是自变量还是中间变量，恒有 $dz=f_u\,du+f_v\,dv$。形式相同，便于记忆与换元（例如极坐标 $x=r\cos\theta$ 时直接对 $r,\theta$ 写 $dx,dy$）。

**例 9.6** $z=e^{u}\sin v$，$u=xy,\ v=x+y$。
$$z_x=e^u\sin v\cdot y+e^u\cos v\cdot 1=e^{xy}(y\sin(x+y)+\cos(x+y)).$$
（$z_y$ 类似。）

**隐式求导的预备**：若 $F(x,y,z)=0$ 确定 $z=z(x,y)$，视 $z$ 为 $x,y$ 的函数，对 $F$ 全微分：
$$F_x\,dx+F_y\,dy+F_z\,dz=0\quad\Rightarrow\quad \frac{\partial z}{\partial x}=-\frac{F_x}{F_z},\ \frac{\partial z}{\partial y}=-\frac{F_y}{F_z}\quad(F_z\neq 0).$$

### 9.2.5 向量值函数的微商和微分

**向量值函数**：$\mathbf{r}(t)=(x(t),y(t),z(t))$ 或 $\mathbf{F}:\mathbb{R}^n\to\mathbb{R}^m$，$\mathbf{F}=(F_1,\ldots,F_m)^\top$。

**导数**：$\mathbf{r}'(t)=(x'(t),y'(t),z'(t))$；**Jacobian 矩阵**
$$D\mathbf{F}=\begin{pmatrix}\dfrac{\partial F_1}{\partial x_1}&\cdots&\dfrac{\partial F_1}{\partial x_n}\\\vdots&\ddots&\vdots\\\dfrac{\partial F_m}{\partial x_1}&\cdots&\dfrac{\partial F_m}{\partial x_n}\end{pmatrix}.$$
**全微分**：$d\mathbf{F}=D\mathbf{F}\,d\mathbf{x}$。

**链式法则（矩阵形式）**：若 $\mathbf{F}:\mathbb{R}^n\to\mathbb{R}^m$，$\mathbf{G}:\mathbb{R}^p\to\mathbb{R}^n$，则
$$D(\mathbf{F}\circ\mathbf{G})=D\mathbf{F}(\mathbf{G}(\mathbf{u}))\cdot D\mathbf{G}(\mathbf{u}).$$

空间曲线 $\mathbf{r}(t)$ 的切向量为 $\mathbf{r}'(t)$；模长 $|\mathbf{r}'(t)|$ 是速度。这些为 §9.4 参数曲线铺垫。

---

## 9.3 隐函数的存在性和微商

### 9.3.1 隐函数的存在性和微商

许多关系由方程 $F(x,y)=0$ 或 $F(x,y,z)=0$ 给出，无法显式解出 $y=f(x)$ 或 $z=f(x,y)$。**隐函数定理**回答：何时局部存在可微的隐函数，以及如何求导。

**二元情形**：设 $F(x,y)$ 在 $(x_0,y_0)$ 邻域连续可微，$F(x_0,y_0)=0$，且 $F_y(x_0,y_0)\neq 0$。则存在 $x_0$ 的邻域 $I$ 与唯一连续函数 $y=f(x)$ 于 $I$ 上满足 $f(x_0)=y_0$ 且 $F(x,f(x))=0$；且 $f$ 可微，
$$f'(x)=-\frac{F_x(x,f(x))}{F_y(x,f(x))}.$$

**三元情形**：$F(x,y,z)=0$，$F_z(x_0,y_0,z_0)\neq 0$ ⇒ 局部存在 $z=z(x,y)$ 且
$$\frac{\partial z}{\partial x}=-\frac{F_x}{F_z},\qquad \frac{\partial z}{\partial y}=-\frac{F_y}{F_z}.$$

**例 9.7** $x^2+y^2+z^2=1$ 在 $(x,y,z)=(0,0,1)$ 附近确定 $z=\sqrt{1-x^2-y^2}$。$F=x^2+y^2+z^2-1$，$F_z=2z\big|_{(0,0,1)}=2\neq 0$，
$$z_x=-\frac{2x}{2z}=-\frac{x}{z},\qquad z_y=-\frac{y}{z}.$$

**方程组**：两个方程 $F(x,y,u,v)=0,\ G(x,y,u,v)=0$ 在适当条件下局部确定 $u=u(x,y),v=v(x,y)$；求导时对 $x$ 或 $y$ 求偏导，用 Cramer 法则解线性方程组（见教材习题）。

### 9.3.2 从微分的角度看隐函数定理

全微分 $F_x\,dx+F_y\,dy=0$（二元隐函数 $y=y(x)$）⇒ $\dfrac{dy}{dx}=-F_x/F_y$，与上节一致。多元时 $F_z\,dz=-F_x\,dx-F_y\,dy$，当 $F_z\neq 0$ 时 $dz$ 是 $dx,dy$ 的线性函数，这正是「局部存在可微隐函数 $z=z(x,y)$」的微分形式表述。

### 9.3.3 逆映射的微商

设 $\mathbf{u}=\mathbf{F}(\mathbf{x})$ 在 $\mathbf{x}_0$ 邻域 $C^1$，$D\mathbf{F}(\mathbf{x}_0)$ **非奇异**。则 $\mathbf{F}$ 局部有 $C^1$ 逆 $\mathbf{x}=\mathbf{G}(\mathbf{u})$，且
$$D\mathbf{G}(\mathbf{u}_0)=\big(D\mathbf{F}(\mathbf{x}_0)\big)^{-1}.$$
例如平面极坐标 $(r,\theta)\mapsto(x,y)$，$x=r\cos\theta,\ y=r\sin\theta$，Jacobian
$$\det\frac{\partial(x,y)}{\partial(r,\theta)}=r,$$
故 $(x,y)\mapsto(r,\theta)$ 在 $r>0$ 处局部可逆，这是二重积分极坐标换元的理论基础。

---

## 9.4 空间曲线与曲面

### 9.4.1 参数曲线

**参数方程**：$\mathbf{r}(t)=(x(t),y(t),z(t))$，$t\in[\alpha,\beta]$。切向量 $\mathbf{r}'(t)$，单位切向量 $\mathbf{T}=\mathbf{r}'/|\mathbf{r}'|$。

**弧长**（从 $t_0$ 到 $t$）：
$$s(t)=\int_{t_0}^t|\mathbf{r}'(\tau)|\,d\tau.$$
若 $|\mathbf{r}'(t)|\neq 0$，可反解 $t=t(s)$，得**弧长参数** $\mathbf{r}(s)$，此时 $|\mathbf{r}'(s)|=1$。

**Frenet 标架**（曲线论深入）：切向量、主法向量、副法向量与曲率、挠率；本科常要求掌握切向量与弧长，曲率公式
$$\kappa=\frac{|\mathbf{r}'\times\mathbf{r}''|}{|\mathbf{r}'|^3}$$
作为了解。

### 9.4.2 参数曲面

**参数表示**：$\mathbf{r}(u,v)=(x(u,v),y(u,v),z(u,v))$，$(u,v)\in D$。

**切平面**：若 $\mathbf{r}_u\times\mathbf{r}_v\neq\mathbf{0}$，则在 $P_0=\mathbf{r}(u_0,v_0)$ 处切平面由 $\mathbf{r}_u,\mathbf{r}_v$ 张成。法向量
$$\mathbf{n}=\mathbf{r}_u\times\mathbf{r}_v$$
（方向依定向约定）。

**第一基本形式**（弧长元素）：$ds^2=E\,du^2+2F\,du\,dv+G\,dv^2$，其中 $E=\mathbf{r}_u\cdot\mathbf{r}_u$ 等——用于曲面上弧长与面积（见第 11 章）。

**例 9.8** 球面 $x=R\sin\varphi\cos\theta,\ y=R\sin\varphi\sin\theta,\ z=R\cos\varphi$。
$$\mathbf{r}_\varphi\times\mathbf{r}_\theta=R^2\sin\varphi\,(\sin\varphi\cos\theta,\sin\varphi\sin\theta,\cos\varphi),$$
模长 $R^2\sin\varphi$，故球面面积元素 $dS=R^2\sin\varphi\,d\varphi\,d\theta$。

### 9.4.3 隐式曲线和隐式曲面

**隐式曲面** $F(x,y,z)=0$：梯度 $\nabla F=(F_x,F_y,F_z)$ 垂直于曲面，是法向量方向。当 $F_z\neq 0$ 时可解 $z=z(x,y)$，法向量 $(-z_x,-z_y,1)$ 与 $\nabla F$ 平行。

**隐式曲线**（两曲面交线）：$F(x,y,z)=0,\ G(x,y,z)=0$，切向量 $\nabla F\times\nabla G$。

---

## 9.5 多变量函数的 Taylor 公式与极值

### 9.5.1 二元函数的微分中值定理

**定理**：设 $f(x,y)$ 在闭区域 $D$ 上连续，在 $D$ 内可微，$P_1,P_2\in D$，则存在 $P^*$ 在 $P_1P_2$ 线段上使
$$f(P_2)-f(P_1)=\nabla f(P^*)\cdot(P_2-P_1).$$
证明：令 $\varphi(t)=f(P_1+t(P_2-P_1))$，一元 Lagrange 中值定理应用于 $\varphi$。

### 9.5.2 二元函数的 Taylor 公式

设 $f$ 在 $(x_0,y_0)$ 邻域有直到 $n+1$ 阶的连续偏导。记 $h=x-x_0,\ k=y-y_0$，
$$f(x,y)=f(x_0,y_0)+df\big|_{(x_0,y_0)}+\frac{1}{2!}d^2f\big|_{(x_0,y_0)}+\cdots+R_n,$$
其中
$$d^2f=f_{xx}h^2+2f_{xy}hk+f_{yy}k^2,$$
$$R_n=\frac{1}{(n+1)!}d^{n+1}f\big|_{(x_0+\theta h,y_0+\theta k)},\quad 0<\theta<1.$$
**二阶 Taylor（最常用）**：
$$f(x_0+h,y_0+k)\approx f+f_x h+f_y k+\tfrac12\big(f_{xx}h^2+2f_{xy}hk+f_{yy}k^2\big).$$

**矩阵形式**：Hessian $H=\begin{pmatrix}f_{xx}&f_{xy}\\f_{xy}&f_{yy}\end{pmatrix}$，则 $d^2f=\tfrac12(h,k)\,H\,(h,k)^\top$。

### 9.5.3 二元函数的极值

**必要条件**：极值点 $(x_0,y_0)$ 处若偏导存在，则 $f_x=f_y=0$（**驻点**）。充分条件用 Hessian：

设 $f_x=f_y=0$，记 $A=f_{xx},\ B=f_{xy},\ C=f_{yy}$，$\Delta=AC-B^2$。
- $\Delta>0$ 且 $A>0$ ⇒ **极小**；
- $\Delta>0$ 且 $A<0$ ⇒ **极大**；
- $\Delta<0$ ⇒ **非极值**（鞍点）；
- $\Delta=0$ ⇒ 判别法失效，需更高阶分析。

**闭区域上连续函数的最值**：比较**内部驻点**与**边界**上的值（Lagrange 乘数法处理边界约束）。

**条件极值（Lagrange 乘数法）**：求 $f(x,y)$ 在约束 $g(x,y)=0$ 下的极值。构造
$$L(x,y,\lambda)=f(x,y)+\lambda g(x,y),$$
解
$$L_x=L_y=L_\lambda=0.$$
几何解释：极值处 $\nabla f$ 与 $\nabla g$ 平行。

**例 9.9** 求 $f(x,y)=xy$ 在 $x^2+y^2=1$ 上的极值。
$L=xy+\lambda(x^2+y^2-1)$ ⇒ $y+2\lambda x=0,\ x+2\lambda y=0,\ x^2+y^2=1$。
得 $(\pm1/\sqrt2,\pm1/\sqrt2)$，最大 $f=1/2$，最小 $f=-1/2$。

> [要点]
>
> - 无约束极值：解 $f_x=f_y=0$，用 $\Delta=AC-B^2$ 判极大/极小/鞍点。
> - 闭区域最值 = 内部驻点 vs 边界（常配合 Lagrange）。
> - 约束极值：$L=f+\lambda g$，$\nabla f\parallel\nabla g$。

---

## 9.6 向量场的微商

### 9.6.1 向量场

**标量场** $f(x,y,z)$；**向量场** $\mathbf{F}=(P,Q,R)$。物理中速度场、力场、电场 $\mathbf{E}$、磁场 $\mathbf{B}$ 均为向量场。

### 9.6.2 梯度、散度与旋度

**梯度**（标量场）：$\nabla f=(f_x,f_y,f_z)$。

**散度**（向量场）：$\displaystyle \nabla\cdot\mathbf{F}=\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}$。
物理意义：某点「源」的强度（流出通量密度的体积源）。

**旋度**（向量场）：
$$\nabla\times\mathbf{F}=\begin{vmatrix}\mathbf{i}&\mathbf{j}&\mathbf{k}\\\partial_x&\partial_y&\partial_z\\ P&Q&R\end{vmatrix}=\Big(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z},\ \frac{\partial P}{\partial z}-\frac{\partial R}{\partial x},\ \frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\Big).$$
物理意义：局部「旋转」强度；$\nabla\times\mathbf{F}=\mathbf{0}$ 称**无旋场**。

**恒等式**（可证）：
$$\nabla\times(\nabla f)=\mathbf{0},\qquad \nabla\cdot(\nabla\times\mathbf{F})=0.$$

**例 9.10** $\mathbf{F}=(x^2y, y^2z, z^2x)$。
$$\nabla\cdot\mathbf{F}=2xy+2yz+2zx.$$
$\nabla\times\mathbf{F}$ 各分量按行列式展开计算。

### 9.6.3 Hamilton 算子在柱面坐标系和球面坐标系中的表示

记 $\mathbf{e}_r,\mathbf{e}_\theta,\mathbf{e}_z$（柱坐标）或 $\mathbf{e}_r,\mathbf{e}_\theta,\mathbf{e}_\varphi$（球坐标）。在正交曲线坐标 $(u,v,w)$ 下，尺度因子 $h_1,h_2,h_3$，则
$$\nabla f=\frac{1}{h_1}\frac{\partial f}{\partial u}\mathbf{e}_u+\cdots$$

**柱坐标** $(r,\theta,z)$，$x=r\cos\theta,\ y=r\sin\theta$：
$$\nabla f=\frac{\partial f}{\partial r}\mathbf{e}_r+\frac{1}{r}\frac{\partial f}{\partial\theta}\mathbf{e}_\theta+\frac{\partial f}{\partial z}\mathbf{e}_z.$$
$$\nabla\cdot\mathbf{F}=\frac{1}{r}\frac{\partial(rF_r)}{\partial r}+\frac{1}{r}\frac{\partial F_\theta}{\partial\theta}+\frac{\partial F_z}{\partial z}.$$
$$\nabla\times\mathbf{F}=\cdots\quad\text{（见教材公式表，计算曲面积分时必查）}.$$

**球坐标** $(r,\theta,\varphi)$（$\theta$ 极角，$\varphi$ 方位角，依教材符号约定）：
$$\nabla\cdot\mathbf{F}=\frac{1}{r^2}\frac{\partial(r^2F_r)}{\partial r}+\frac{1}{r\sin\theta}\frac{\partial(F_\theta\sin\theta)}{\partial\theta}+\frac{1}{r\sin\theta}\frac{\partial F_\varphi}{\partial\varphi}.$$

这些公式不必死记推导，但应理解：**正交坐标下偏导要除以尺度因子**，散度中的 $r^2,r\sin\theta$ 来自体积元素 $r^2\sin\theta\,dr\,d\theta\,d\varphi$。第 11 章 Gauss、Stokes 在球、柱坐标下计算时会反复用到。

---

## 9.7 微分形式

### 9.7.1 微分形式的空间

**0-形式**：函数 $f$。**1-形式**：$P\,dx+Q\,dy+R\,dz$。**2-形式**：如 $P\,dy\wedge dz+Q\,dz\wedge dx+R\,dx\wedge dy$（楔积 $\wedge$ 反交换：$dx\wedge dy=-dy\wedge dx$）。

### 9.7.2 微分形式的外积

$dx\wedge dy$ 表示 oriented 面积元素；$dx\wedge dy\wedge dz$ 为体积元素。外积结合律、分配律成立，$dx\wedge dx=0$。

### 9.7.3 微分形式的外微分

对 0-形式 $f$：$df=f_x\,dx+f_y\,dy+f_z\,dz$。
对 1-形式 $\omega=P\,dx+Q\,dy+R\,dz$：
$$d\omega=dP\wedge dx+dQ\wedge dy+dR\wedge dz,$$
利用 $dP=P_x\,dx+P_y\,dy+P_z\,dz$ 等展开，按楔积规则合并。

**定理**：$d(d\omega)=0$（外微分的闭性）。**Stokes 定理**的统一形式 $\displaystyle\int_{\partial\Omega}\omega=\int_\Omega d\omega$ 将在第 11 章出现——Green、Gauss、经典 Stokes 都是其特例。

> [要点]
>
> - 微分形式用 $\wedge$ 统一面积、体积元素与积分换元。
> - $df$ 即全微分；$d\omega$ 将 Stokes 族定理写成同一式子。
> - 与 $\nabla\cdot,\nabla\times$ 的对应：$d$ 把 $(k-1)$-形式映到 $k$-形式。

---

## 本章综合习题（选）

**9.1** 证明 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^3+y^3}{x^2+y^2}=0$（提示：$|x^3+y^3|\le |x|^3+|y|^3\le (|x|^2+|y|^2)^{3/2}$？或用极坐标）。

**9.2** 讨论 $f(x,y)=\begin{cases}(x^2+y^2)\sin(1/(x^2+y^2)),&(x,y)\neq0\\0,&(x,y)=0\end{cases}$ 在原点的连续性与可微性。

**9.3** 求 $z^3-3xyz=1$ 所确定的 $z(x,y)$ 在 $(1,1)$ 附近的 $z_x,z_y$（先验证 $(1,1,1)$ 满足方程且 $F_z\neq 0$）。

**9.4** 求 $f(x,y)=x^3-3xy+y^3$ 的极值点并分类。

**9.5** 用 Lagrange 乘数法求椭球 $x^2/a^2+y^2/b^2+z^2/c^2=1$ 内接长方体的最大体积。

（详解可在后续修订中补入；先做自测。）

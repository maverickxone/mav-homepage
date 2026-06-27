---
title: "第 8 章 空间解析几何"
chapter: 1
readTime: 85
description: "向量代数、平面与直线、二次曲面与坐标变换，为多元微积分提供几何语言。"
---

多元微积分研究的是定义在 $\mathbb{R}^2$、$\mathbb{R}^3$ 乃至 $\mathbb{R}^n$ 上的函数：曲面 $z=f(x,y)$ 的切平面、等值面 $F(x,y,z)=c$ 的法向量、重积分的积分域 $\Omega\subset\mathbb{R}^3$……这些对象都离不开**空间中的位置与方向**。平面几何用 $(x,y)$ 与直线方程 $ax+by+c=0$ 已经够用；进入三维后，「垂直」要用法向量表达，「旋转」要用叉积刻画，「体积」与「是否共面」则落到混合积。

本章建立**空间解析几何**的语言：用坐标与方程描述点、线、面与常见曲面，用向量代数统一距离、夹角与投影。内容按四节展开——§8.1 向量代数，§8.2 平面与直线，§8.3 距离与夹角，§8.4 二次曲面与坐标变换——为第 9～11 章（多元微分、重积分、曲线曲面积分）提供几何基础。

---

## 8.1 向量代数

### 8.1.1 向量与坐标表示

**向量**是有大小又有方向的量，记作 $\mathbf{a},\mathbf{b}$ 或 $\overrightarrow{AB}$。与起点无关的向量称为**自由向量**；模（长度）记 $|\mathbf{a}|$。零向量 $\mathbf{0}$ 模为 $0$，方向不规定。

在直角坐标系 $Oxyz$ 中，取单位向量 $\mathbf{i},\mathbf{j},\mathbf{k}$ 分别沿 $x,y,z$ 轴正向，则
$$\mathbf{a}=a_1\mathbf{i}+a_2\mathbf{j}+a_3\mathbf{k}=(a_1,a_2,a_3),$$
其中 $a_1,a_2,a_3$ 是 $\mathbf{a}$ 在三个轴上的**坐标**。模长
$$|\mathbf{a}|=\sqrt{a_1^2+a_2^2+a_3^2}.$$
**单位向量** $\mathbf{e}=\mathbf{a}/|\mathbf{a}|$（$\mathbf{a}\neq\mathbf{0}$）给出 $\mathbf{a}$ 的方向。

**运算**：设 $\mathbf{a}=(a_1,a_2,a_3)$，$\mathbf{b}=(b_1,b_2,b_3)$，$\lambda\in\mathbb{R}$。
- **加法**：$\mathbf{a}+\mathbf{b}=(a_1+b_1,a_2+b_2,a_3+b_3)$（平行四边形法则）。
- **数乘**：$\lambda\mathbf{a}=(\lambda a_1,\lambda a_2,\lambda a_3)$；$\lambda>0$ 同向，$\lambda<0$ 反向。
- **减法**：$\mathbf{a}-\mathbf{b}=\mathbf{a}+(-\mathbf{b})$。

**线性运算律**（与 $\mathbb{R}^3$ 中分量逐点运算一致）：加法交换律、结合律；数乘与加法分配律；$1\cdot\mathbf{a}=\mathbf{a}$，$0\cdot\mathbf{a}=\mathbf{0}$。这些保证向量代数与几何直观（平移、伸缩）相互对应。

若 $\mathbf{a}\neq\mathbf{0}$，则 $\mathbf{a}$ 的方向可由**方向角** $\alpha,\beta,\gamma$（与 $x,y,z$ 轴正向的夹角）描述，方向余弦
$$\cos\alpha=\frac{a_1}{|\mathbf{a}|},\quad \cos\beta=\frac{a_2}{|\mathbf{a}|},\quad \cos\gamma=\frac{a_3}{|\mathbf{a}|}$$
满足 $\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1$。

:::callout 向量与点的区别
点 $P(x,y,z)$ 是空间中的**位置**；向量 $\overrightarrow{OP}=(x,y,z)$ 描述从原点到 $P$ 的**位移**。运算上常把点与它的位置向量等同，但概念上「点」用于几何对象，「向量」用于代数运算与物理量（力、速度、法向量等）。
:::

### 8.1.2 数量积（点积）

**定义**：$\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta$，其中 $\theta\in[0,\pi]$ 是 $\mathbf{a}$ 与 $\mathbf{b}$ 的夹角。坐标形式
$$\mathbf{a}\cdot\mathbf{b}=a_1b_1+a_2b_2+a_3b_3.$$

**性质**：交换律、分配律；$\mathbf{a}\cdot\mathbf{a}=|\mathbf{a}|^2$；$\mathbf{a}\perp\mathbf{b}\Leftrightarrow\mathbf{a}\cdot\mathbf{b}=0$（零向量除外）。

**坐标公式推导**：设 $\mathbf{a}=a_1\mathbf{i}+a_2\mathbf{j}+a_3\mathbf{k}$，$\mathbf{b}=b_1\mathbf{i}+b_2\mathbf{j}+b_3\mathbf{k}$。由 $\mathbf{i}\cdot\mathbf{j}=\mathbf{j}\cdot\mathbf{k}=\mathbf{k}\cdot\mathbf{i}=0$ 及 $\mathbf{i}\cdot\mathbf{i}=\mathbf{j}\cdot\mathbf{j}=\mathbf{k}\cdot\mathbf{k}=1$，展开
$$\mathbf{a}\cdot\mathbf{b}=(a_1\mathbf{i}+a_2\mathbf{j}+a_3\mathbf{k})\cdot(b_1\mathbf{i}+b_2\mathbf{j}+b_3\mathbf{k})=a_1b_1+a_2b_2+a_3b_3.$$

**Cauchy-Schwarz 不等式**：$|\mathbf{a}\cdot\mathbf{b}|\le|\mathbf{a}||\mathbf{b}|$，等号成立当且仅当 $\mathbf{a},\mathbf{b}$ 共线。由 $\cos\theta\in[-1,1]$ 立得。

**几何意义**：
- **投影**：$\mathbf{a}$ 在 $\mathbf{b}$ 上的投影长为 $\dfrac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{b}|}$；投影向量为 $\dfrac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{b}|^2}\mathbf{b}$。
- **夹角**：$\cos\theta=\dfrac{\mathbf{a}\cdot\mathbf{b}}{|\mathbf{a}||\mathbf{b}|}$。

**例 8.1** 设 $\mathbf{a}=(1,2,-1)$，$\mathbf{b}=(2,0,1)$。则 $\mathbf{a}\cdot\mathbf{b}=2+0-1=1$，$|\mathbf{a}|=\sqrt{6}$，$|\mathbf{b}|=\sqrt{5}$，
$$\cos\theta=\frac{1}{\sqrt{30}},\qquad \theta=\arccos\frac{1}{\sqrt{30}}.$$

### 8.1.3 向量积（叉积）

**定义**：$\mathbf{a}\times\mathbf{b}$ 是向量，模 $|\mathbf{a}\times\mathbf{b}|=|\mathbf{a}||\mathbf{b}|\sin\theta$，方向垂直于 $\mathbf{a},\mathbf{b}$，且 $\mathbf{a},\mathbf{b},\mathbf{a}\times\mathbf{b}$ 成右手系。

**坐标公式**（行列式记忆）：
$$\mathbf{a}\times\mathbf{b}=\begin{vmatrix}\mathbf{i}&\mathbf{j}&\mathbf{k}\\ a_1&a_2&a_3\\ b_1&b_2&b_3\end{vmatrix}=(a_2b_3-a_3b_2,\ a_3b_1-a_1b_3,\ a_1b_2-a_2b_1).$$

**性质**：反交换 $\mathbf{a}\times\mathbf{b}=-\mathbf{b}\times\mathbf{a}$；分配律；$\mathbf{a}\times\mathbf{a}=\mathbf{0}$；$\mathbf{a}\parallel\mathbf{b}\Leftrightarrow\mathbf{a}\times\mathbf{b}=\mathbf{0}$。

**几何意义**：
- $|\mathbf{a}\times\mathbf{b}|$ 等于以 $\mathbf{a},\mathbf{b}$ 为邻边的**平行四边形面积**。
- $\mathbf{a}\times\mathbf{b}$ 垂直于 $\mathbf{a},\mathbf{b}$ 张成的平面，常用于求**法向量**。

**例 8.2** $\mathbf{a}=(1,0,0)$，$\mathbf{b}=(0,1,0)$，则 $\mathbf{a}\times\mathbf{b}=(0,0,1)=\mathbf{k}$，面积为 $1$。再求同时垂直于 $\mathbf{a}'=(1,1,1)$ 与 $\mathbf{b}'=(1,-1,0)$ 的单位向量：$\mathbf{a}'\times\mathbf{b}'=(1,1,-2)$，模 $\sqrt{6}$，故 $\mathbf{e}=\pm\dfrac{1}{\sqrt{6}}(1,1,-2)$。

**Lagrange 恒等式**（叉积与点积的联系）：
$$|\mathbf{a}\times\mathbf{b}|^2+(\mathbf{a}\cdot\mathbf{b})^2=|\mathbf{a}|^2|\mathbf{b}|^2.$$
由 $|\mathbf{a}\times\mathbf{b}|=|\mathbf{a}||\mathbf{b}|\sin\theta$ 与 $\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta$ 及 $\sin^2\theta+\cos^2\theta=1$ 即得。

### 8.1.4 共线与共面

**共线**：$\mathbf{a},\mathbf{b}$ 共线（平行）$\Leftrightarrow$ 存在 $\lambda$ 使 $\mathbf{b}=\lambda\mathbf{a}$（或 $\mathbf{a}=\mathbf{0}$）$\Leftrightarrow\mathbf{a}\times\mathbf{b}=\mathbf{0}$。

**共面**：三点 $A,B,C$ 共面 $\Leftrightarrow\overrightarrow{AB}\times\overrightarrow{AC}=\mathbf{0}$。更一般，向量 $\mathbf{a},\mathbf{b},\mathbf{c}$ **共面** $\Leftrightarrow$ 存在不全为零的 $\alpha,\beta,\gamma$ 使 $\alpha\mathbf{a}+\beta\mathbf{b}+\gamma\mathbf{c}=\mathbf{0}$ $\Leftrightarrow$ 混合积 $[\mathbf{a},\mathbf{b},\mathbf{c}]=\mathbf{a}\cdot(\mathbf{b}\times\mathbf{c})=0$。

**混合积** $[\mathbf{a},\mathbf{b},\mathbf{c}]=\mathbf{a}\cdot(\mathbf{b}\times\mathbf{c})$ 的绝对值等于以 $\mathbf{a},\mathbf{b},\mathbf{c}$ 为棱的**平行六面体体积**；符号表示三向量是否成右手系。坐标形式可写为三阶行列式
$$[\mathbf{a},\mathbf{b},\mathbf{c}]=\begin{vmatrix}a_1&a_2&a_3\\ b_1&b_2&b_3\\ c_1&c_2&c_3\end{vmatrix}.$$
轮换 $\mathbf{a},\mathbf{b},\mathbf{c}$ 顺序混合积不变；交换两向量变号。

**例 8.3** 判断 $A(0,0,0),B(1,2,0),C(3,4,0),D(1,1,1)$ 是否共面。$\overrightarrow{AB}=(1,2,0)$，$\overrightarrow{AC}=(3,4,0)$，$\overrightarrow{AD}=(1,1,1)$，
$$[\overrightarrow{AB},\overrightarrow{AC},\overrightarrow{AD}]=\begin{vmatrix}1&2&0\\ 3&4&0\\ 1&1&1\end{vmatrix}=1\cdot(4-0)-2\cdot(3-0)+0=-2\neq 0,$$
故四点不共面。

> [要点]
>
> - 向量坐标化：$\mathbf{a}=(a_1,a_2,a_3)$，模 $|\mathbf{a}|=\sqrt{a_1^2+a_2^2+a_3^2}$。
> - **点积** $\mathbf{a}\cdot\mathbf{b}=|\mathbf{a}||\mathbf{b}|\cos\theta=a_1b_1+a_2b_2+a_3b_3$；垂直 $\Leftrightarrow$ 点积为 $0$。
> - **叉积** $|\mathbf{a}\times\mathbf{b}|$ = 平行四边形面积；方向垂直于 $\mathbf{a},\mathbf{b}$，右手定则。
> - 共线 $\Leftrightarrow\mathbf{a}\times\mathbf{b}=\mathbf{0}$；共面 $\Leftrightarrow[\mathbf{a},\mathbf{b},\mathbf{c}]=0$。

---

## 8.2 空间直角坐标系与平面、直线

### 8.2.1 空间直角坐标系

取原点 $O$ 与三组两两垂直的单位向量 $\mathbf{i},\mathbf{j},\mathbf{k}$，确定 $x,y,z$ 轴，构成**右手系**（右手四指从 $x$ 转向 $y$，拇指指向 $z$ 正向）。空间中每点 $P$ 唯一对应有序数组 $(x,y,z)$，即 $P$ 的**直角坐标**。

三个坐标平面：$xOy$（$z=0$）、$yOz$（$x=0$）、$zOx$（$y=0$）。坐标轴将空间分为八个**卦限**；第一卦限 $x,y,z>0$，其余由对称性确定。判断点所在卦限是读图与积分限的基本功。

**两点间距离**：$P_1(x_1,y_1,z_1)$，$P_2(x_2,y_2,z_2)$，
$$|P_1P_2|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}.$$

**分点公式**：$P$ 在 $P_1P_2$ 上且 $\overrightarrow{P_1P}=\lambda\overrightarrow{P_1P_2}$（$\lambda$ 为实数），则
$$P=\Bigl(\frac{x_1+\lambda x_2}{1+\lambda},\ \frac{y_1+\lambda y_2}{1+\lambda},\ \frac{z_1+\lambda z_2}{1+\lambda}\Bigr)\quad(\lambda\neq -1).$$
$\lambda=1$ 得中点坐标。

**例 8.4** $A(1,2,3)$，$B(4,6,9)$，距离 $|AB|=\sqrt{9+16+36}=7$；中点 $M(5/2,4,6)$。若 $P$ 分 $AB$ 为 $2:1$（内分），$\lambda=2$，得 $P(3,14/3,7)$。

### 8.2.2 平面的方程

过点 $P_0(x_0,y_0,z_0)$ 且法向量为 $\mathbf{n}=(A,B,C)\neq\mathbf{0}$ 的平面：平面上任一点 $P(x,y,z)$ 满足 $\overrightarrow{P_0P}\perp\mathbf{n}$，即
$$\boxed{A(x-x_0)+B(y-y_0)+C(z-z_0)=0}\quad\text{（点法式）}.$$
展开得**一般式**
$$Ax+By+Cz+D=0,\qquad D=-(Ax_0+By_0+Cz_0).$$
系数 $(A,B,C)$ 是平面的一个法向量；$(kA,kB,kC)$（$k\neq 0$）表示同一平面。

**截距式**：若平面与三轴截距分别为 $a,b,c$（均非零），则
$$\frac{x}{a}+\frac{y}{b}+\frac{z}{c}=1.$$

**两平面位置关系**：设 $\Pi_1,\Pi_2$ 法向量 $\mathbf{n}_1,\mathbf{n}_2$。若 $\mathbf{n}_1\times\mathbf{n}_2\neq\mathbf{0}$，两平面相交于一条直线；若 $\mathbf{n}_1\times\mathbf{n}_2=\mathbf{0}$ 且法向量成比例，则**平行或重合**（常数项比是否一致区分）。求交线：联立两方程，令某坐标为参数，解另两坐标。

**例 8.5** 求过 $A(1,0,0),B(0,2,0),C(0,0,3)$ 的平面。$\overrightarrow{AB}=(-1,2,0)$，$\overrightarrow{AC}=(-1,0,3)$，
$$\mathbf{n}=\overrightarrow{AB}\times\overrightarrow{AC}=(6,3,2),$$
点法式 $6(x-1)+3y+2z=0$，即 $6x+3y+2z=6$，截距式 $\dfrac{x}{1}+\dfrac{y}{2}+\dfrac{z}{3}=1$。

### 8.2.3 直线的方程

过点 $P_0(x_0,y_0,z_0)$，方向向量 $\mathbf{s}=(m,n,p)\neq\mathbf{0}$ 的直线：

**参数式**：
$$x=x_0+mt,\quad y=y_0+nt,\quad z=z_0+pt,\quad t\in\mathbb{R}.$$

**对称式（点向式）**：
$$\frac{x-x_0}{m}=\frac{y-y_0}{n}=\frac{z-z_0}{p}$$
（某分母为 $0$ 时，约定对应分子也为 $0$）。

**一般式（两平面交线）**：
$$\begin{cases}A_1x+B_1y+C_1z+D_1=0,\\ A_2x+B_2y+C_2z+D_2=0,\end{cases}$$
方向向量 $\mathbf{s}=\mathbf{n}_1\times\mathbf{n}_2$，其中 $\mathbf{n}_1=(A_1,B_1,C_1)$，$\mathbf{n}_2=(A_2,B_2,C_2)$。

**例 8.6** 过 $P_0(1,-1,2)$，方向 $\mathbf{s}=(2,1,-1)$，对称式 $\dfrac{x-1}{2}=\dfrac{y+1}{1}=\dfrac{z-2}{-1}$。

**直线与平面的位置**：设直线 $L$ 方向 $\mathbf{s}$，平面 $\Pi$ 法向量 $\mathbf{n}$。若 $\mathbf{s}\cdot\mathbf{n}\neq 0$，$L$ 与 $\Pi$ 交于一点（将参数式代入平面方程求 $t$）；若 $\mathbf{s}\cdot\mathbf{n}=0$ 且直线上某点不在平面上，则 $L\parallel\Pi$；若 $\mathbf{s}\cdot\mathbf{n}=0$ 且直线上点在平面上，则 $L\subset\Pi$。

**例 8.7** 求直线 $\dfrac{x-1}{2}=\dfrac{y}{1}=\dfrac{z-1}{-1}$ 与平面 $x+y+z=0$ 的交点。参数式 $x=1+2t,y=t,z=1-t$，代入得 $1+2t+t+1-t=0$，$t=-1$，交点 $(-1,-1,2)$。

:::callout 平面与直线的确定条件
**平面**：不共线三点，或一点 + 法向量，或一点 + 两条不平行方向向量。**直线**：两点，或一点 + 方向向量，或两相交平面。求方程时先找法向量或方向向量，再写点法式/点向式。
:::

> [要点]
>
> - 平面点法式：$\mathbf{n}\cdot\overrightarrow{P_0P}=0$；一般式 $Ax+By+Cz+D=0$，$(A,B,C)$ 为法向量。
> - 直线参数式、对称式、两平面交线（一般式）三种等价表述。
> - 法向量用叉积：过三点的平面，$\mathbf{n}=\overrightarrow{AB}\times\overrightarrow{AC}$。

---

## 8.3 距离与夹角

### 8.3.1 点到平面的距离

点 $P(x_0,y_0,z_0)$ 到平面 $\Pi:Ax+By+Cz+D=0$ 的距离
$$\boxed{d=\frac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}}.}$$
**推导**：设 $P_1(x_1,y_1,z_1)$ 是 $\Pi$ 上任意一点，$\mathbf{n}=(A,B,C)$。向量 $\overrightarrow{P_1P}=(x_0-x_1,y_0-y_1,z_0-z_1)$ 在 $\mathbf{n}$ 上的投影长（带符号）为
$$\frac{\overrightarrow{P_1P}\cdot\mathbf{n}}{|\mathbf{n}|}=\frac{A(x_0-x_1)+B(y_0-y_1)+C(z_0-z_1)}{|\mathbf{n}|}.$$
因 $P_1\in\Pi$，有 $Ax_1+By_1+Cz_1+D=0$，故分子为 $Ax_0+By_0+Cz_0+D$；距离取绝对值。

**两平行平面** $Ax+By+Cz+D_1=0$ 与 $Ax+By+Cz+D_2=0$ 的距离
$$d=\frac{|D_1-D_2|}{\sqrt{A^2+B^2+C^2}}.$$

**例 8.8** 点 $(1,2,3)$ 到平面 $2x-y+2z-6=0$ 的距离
$$d=\frac{|2-2+6-6|}{\sqrt{4+1+4}}=\frac{0}{3}=0,$$
点在平面上。

### 8.3.2 点到直线的距离

点 $P$ 到过 $P_0$、方向 $\mathbf{s}$ 的直线距离
$$d=\frac{|\overrightarrow{P_0P}\times\mathbf{s}|}{|\mathbf{s}|}.$$
几何上，$|\overrightarrow{P_0P}\times\mathbf{s}|$ 是以 $\overrightarrow{P_0P},\mathbf{s}$ 为邻边的平行四边形面积，除以底边 $|\mathbf{s}|$ 得高。

**例 8.9** $P(0,0,0)$ 到直线 $\dfrac{x-1}{1}=\dfrac{y}{1}=\dfrac{z}{1}$（$P_0=(1,0,0)$，$\mathbf{s}=(1,1,1)$），$\overrightarrow{P_0P}=(-1,0,0)$，
$$\overrightarrow{P_0P}\times\mathbf{s}=(0,1,-1),\quad d=\frac{\sqrt{2}}{\sqrt{3}}=\frac{\sqrt{6}}{3}.$$

### 8.3.3 两直线、两平面的夹角

**两直线**方向 $\mathbf{s}_1,\mathbf{s}_2$，夹角 $\varphi\in\bigl[0,\dfrac{\pi}{2}\bigr]$ 满足
$$\cos\varphi=\frac{|\mathbf{s}_1\cdot\mathbf{s}_2|}{|\mathbf{s}_1||\mathbf{s}_2|}.$$

**两平面**法向量 $\mathbf{n}_1,\mathbf{n}_2$，二面角等于法向量夹角或其补角，常取
$$\cos\theta=\frac{|\mathbf{n}_1\cdot\mathbf{n}_2|}{|\mathbf{n}_1||\mathbf{n}_2|}.$$

**直线与平面**：设直线方向 $\mathbf{s}$，平面法向量 $\mathbf{n}$，夹角 $\psi\in\bigl[0,\dfrac{\pi}{2}\bigr]$，
$$\sin\psi=\frac{|\mathbf{s}\cdot\mathbf{n}|}{|\mathbf{s}||\mathbf{n}|}.$$
注意 $\psi$ 是直线与其在平面内**投影线**的夹角，故用 $\sin$ 而非 $\cos$（与法向量夹角 $\varphi$ 满足 $\psi=\pi/2-\varphi$ 当取锐角时）。

**例 8.10** 平面 $x+y+z=0$ 与 $x-y=0$ 的夹角：$\mathbf{n}_1=(1,1,1)$，$\mathbf{n}_2=(1,-1,0)$，
$$\cos\theta=\frac{|1-1|}{\sqrt{3}\cdot\sqrt{2}}=0,$$
两平面垂直。

**异面直线距离**：直线 $L_1$ 过 $P_1$ 方向 $\mathbf{s}_1$，$L_2$ 过 $P_2$ 方向 $\mathbf{s}_2$，若 $\mathbf{s}_1\times\mathbf{s}_2\neq\mathbf{0}$（不平行），
$$d=\frac{|\overrightarrow{P_1P_2}\cdot(\mathbf{s}_1\times\mathbf{s}_2)|}{|\mathbf{s}_1\times\mathbf{s}_2|}.$$
公垂线方向即为 $\mathbf{s}_1\times\mathbf{s}_2$；混合积的绝对值等于以 $\overrightarrow{P_1P_2},\mathbf{s}_1,\mathbf{s}_2$ 为棱的平行六面体体积。

**例 8.11** 判断 $L_1:\dfrac{x-1}{1}=\dfrac{y}{0}=\dfrac{z}{0}$ 与 $L_2:\dfrac{x}{0}=\dfrac{y-1}{1}=\dfrac{z}{1}$ 是否相交。方向 $\mathbf{s}_1=(1,0,0)$，$\mathbf{s}_2=(0,1,1)$，$\mathbf{s}_1\times\mathbf{s}_2=(0,-1,1)\neq\mathbf{0}$，不平行。联立参数方程可验证无公共解，故为**异面直线**。

:::callout 距离公式的统一思路
点到平面、点到直线、异面直线距离，本质都是「某向量在适当方向上的投影长度」：平面用**法向量**，直线用**叉积给出垂直方向**，异面直线用 $\mathbf{s}_1\times\mathbf{s}_2$ 作为公垂方向。第 11 章曲线积分里还会遇到弧长与面积，同一几何思想延续。
:::

> [要点]
>
> - 点到平面：$d=|Ax_0+By_0+Cz_0+D|/|\mathbf{n}|$。
> - 点到直线：$d=|\overrightarrow{P_0P}\times\mathbf{s}|/|\mathbf{s}|$。
> - 线线、面面、线面夹角均通过点积/叉积与方向向量、法向量联系。

---

## 8.4 二次曲面与坐标变换

### 8.4.1 曲面方程与二次曲面

**曲面方程** $F(x,y,z)=0$ 或 $z=f(x,y)$ 表示空间中的曲面。**二次曲面**是二次多项式方程 $Ax^2+By^2+Cz^2+Dxy+Eyz+Fzx+Gx+Hy+Iz+J=0$ 所确定的曲面（经坐标变换可化为标准形）。

**椭球面**：
$$\frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1\quad(a,b,c>0).$$
三个半轴长 $a,b,c$；若 $a=b=c$ 为球面 $x^2+y^2+z^2=a^2$。

**单叶双曲面**：
$$\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1.$$
**双叶双曲面**：
$$\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=-1.$$

**椭圆抛物面**：
$$\frac{x^2}{a^2}+\frac{y^2}{b^2}=z\quad\text{或}\quad z=\frac{x^2}{a^2}+\frac{y^2}{b^2}.$$
开口沿 $z$ 正向；旋转抛物面 $z=x^2+y^2$ 是 $a=b=1$ 的特例。

**双曲抛物面（马鞍面）**：
$$\frac{x^2}{a^2}-\frac{y^2}{b^2}=z.$$

**二次锥面**：
$$\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=0.$$
顶点在原点，沿 $z$ 轴对称。

**柱面**：动直线沿某曲线平行移动所得。**圆柱面** $x^2+y^2=R^2$（母线平行 $z$ 轴）；**椭圆柱面** $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}=1$；**抛物柱面** $y^2=2px$（缺 $z$，沿 $z$ 方向拉伸）。

**图形速记**：
| 曲面 | 标准形（示意） | 特征 |
|------|----------------|------|
| 椭球 | $\frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1$ | 封闭、有界 |
| 单叶双曲面 | $\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1$ | 一张，沿 $z$ 开口 |
| 双叶双曲面 | 上式 $=-1$ | 两张分离 |
| 椭圆抛物面 | $z=\frac{x^2}{a^2}+\frac{y^2}{b^2}$ | 碗形，$z\ge 0$ |
| 双曲抛物面 | $z=\frac{x^2}{a^2}-\frac{y^2}{b^2}$ | 马鞍形 |
| 锥面 | $\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=0$ | 顶点在原点 |

用**截痕法**辅助想象：令 $z=k$（或 $x=k$）代入，看平面截曲面的曲线类型（椭圆、双曲线、抛物线、点或空集）。

:::callout 如何识别二次曲面
**配方 + 平移**消去一次项，**旋转**（或用特征值对角化二次型）消去交叉项 $xy,yz,zx$，化为标准形 $\dfrac{x'^2}{a^2}\pm\dfrac{y'^2}{b^2}\pm\dfrac{z'^2}{c^2}=1$ 或类似，再对照符号与系数。第 9 章二次型与特征值给出系统方法；此处先建立几何图像。
:::

**例 8.12** 方程 $x^2+y^2=2z$ 是旋转抛物面，顶点在原点，开口向上；与平面 $z=k>0$ 交于圆 $x^2+y^2=2k$。

**例 8.13** 将 $x^2+2y^2+z^2+2x-4y+2z=0$ 化为标准形。配方：
$$(x+1)^2+2(y-1)^2+(z+1)^2=2+2+1=5,$$
令 $x'=x+1,y'=y-1,z'=z+1$，得椭球 $\dfrac{x'^2}{5}+\dfrac{y'^2}{5/2}+\dfrac{z'^2}{5}=1$，中心在 $(-1,1,-1)$，半轴 $\sqrt{5},\sqrt{5/2},\sqrt{5}$。

### 8.4.2 坐标变换与正交变换

**平移变换**：$\begin{cases}x'=x-a,\\ y'=y-b,\\ z'=z-c,\end{cases}$ 将原点移到 $(a,b,c)$，简化方程中的常数项。

**旋转变换（正交变换）**：保持原点不动，新坐标轴仍为正交单位向量。用正交矩阵 $Q$（$Q^\top Q=I$）表示：
$$\begin{pmatrix}x\\ y\\ z\end{pmatrix}=Q\begin{pmatrix}x'\\ y'\\ z'\end{pmatrix},\qquad \det Q=\pm 1.$$
正交变换保持**距离**与**角度**不变（等距变换），故球面经正交变换仍为球面（可能半径相同、轴不同）。

**二次型的对角化**：对称矩阵 $A$ 可正交对角化 $Q^\top AQ=\Lambda$，恰对应将二次项 $x^\top Ax$ 化为 $\lambda_1 x_1'^2+\lambda_2 y_1'^2+\lambda_3 z_1'^2$，从而识别椭球、双曲面等类型。

**例 8.14** 方程 $xy+yz+zx=0$ 含交叉项。对称矩阵 $\begin{pmatrix}0&1/2&1/2\\ 1/2&0&1/2\\ 1/2&1/2&0\end{pmatrix}$ 的特征值为 $\lambda_1=1,\lambda_2=\lambda_3=-1/2$，经正交变换可化为 $x'^2-\dfrac{1}{2}y'^2-\dfrac{1}{2}z'^2=0$，为**实二次锥面**（过原点的锥）。

### 8.4.3 极坐标、柱坐标与球坐标（预告）

除直角坐标外，根据对称性常选用**曲线坐标**，在第 10 章重积分换元中正式使用。

**平面极坐标** $(r,\theta)$：
$$x=r\cos\theta,\quad y=r\sin\theta,\quad r\ge 0,\ \theta\in[0,2\pi).$$
面积元素 $dx\,dy=r\,dr\,d\theta$。

**柱坐标** $(r,\theta,z)$（绕 $z$ 轴）：
$$x=r\cos\theta,\quad y=r\sin\theta,\quad z=z.$$
体积元素 $dx\,dy\,dz=r\,dr\,d\theta\,dz$；适合圆柱、旋转对称区域。

**球坐标** $(\rho,\varphi,\theta)$（$\rho$ 为到原点距离，$\varphi$ 为与 $z$ 轴夹角，$\theta$ 为 $xy$ 平面极角）：
$$x=\rho\sin\varphi\cos\theta,\quad y=\rho\sin\varphi\sin\theta,\quad z=\rho\cos\varphi.$$
体积元素 $dx\,dy\,dz=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta$；适合球域、球壳。

**例 8.15** 球面 $x^2+y^2+z^2=R^2$ 在球坐标下为 $\rho=R$；圆柱 $x^2+y^2=R^2$ 在柱坐标下为 $r=R$。

**例 8.16** 点 $P(1,\sqrt{3},2\sqrt{2})$：$\rho=\sqrt{1+3+8}=2\sqrt{3}$，$\varphi=\arccos\dfrac{2\sqrt{2}}{2\sqrt{3}}=\arccos\dfrac{\sqrt{6}}{3}$，$\theta=\arctan\sqrt{3}=\pi/3$。

:::callout 为何现在就要学曲线坐标
重积分 $\iiint_\Omega f\,dx\,dy\,dz$ 在球对称区域上，被积函数常含 $x^2+y^2+z^2$，直角坐标换元繁琐；柱、球坐标把边界化为常数范围（$r=R$，$\rho=R$），Jacobian 因子 $r$、$\rho^2\sin\varphi$ 来自体积微元的几何缩放，第 10 章将严格推导。
:::

**空间曲线（预告）**：曲线还可用**参数方程** $\mathbf{r}(t)=(x(t),y(t),z(t))$ 描述，例如螺旋线 $x=a\cos t,\ y=a\sin t,\ z=bt$。切向量为 $\mathbf{r}'(t)$，法向量与曲率将在多元微分与曲线积分章节出现。显式曲面 $z=f(x,y)$ 的切平面方程为 $z-z_0=f_x(x-x_0)+f_y(y-y_0)$，其中 $(f_x,f_y,-1)$ 是曲面在 $(x_0,y_0,z_0)$ 处的一个法向量——这直接用到本章的平面点法式与梯度（第 9 章）。

> [要点]
>
> - 椭球、双曲面、抛物面、锥面、柱面：记住标准方程与大致形状。
> - **平移**去一次项，**正交旋转**去交叉项，化为标准形。
> - 极/柱/球坐标：记住与直角坐标的换算及体积（面积）元素中的 Jacobi 因子 $r$、$\rho^2\sin\varphi$。

本章把「几何对象 ↔ 代数方程 ↔ 向量运算」三条线拧在一起：法向量来自叉积，距离来自投影，二次曲面来自配方与正交变换。下一章在这些对象上加入变化率——偏导数描述曲面切平面，梯度指向增长最快方向，而等值面 $F(x,y,z)=c$ 的法向量正是 $\nabla F$。

---

## 本章综合习题（选）

**1.** 设 $|\mathbf{a}|=3$，$|\mathbf{b}|=4$，$\mathbf{a}$ 与 $\mathbf{b}$ 夹角 $\theta=\pi/3$。求 $|\mathbf{a}+\mathbf{b}|$、$|\mathbf{a}-\mathbf{b}|$ 及 $\mathbf{a}\times\mathbf{b}$ 的模。

**2.** 求过点 $P(2,-1,3)$ 且垂直于平面 $2x+y-2z+1=0$，并过点 $Q(1,0,-1)$ 的直线方程（对称式）。

**3.** 求点 $M(1,1,1)$ 到直线 $\dfrac{x}{1}=\dfrac{y-1}{2}=\dfrac{z-2}{3}$ 的距离。

**4.** 讨论方程 $x^2+2y^2+z^2+2x-4y+2z=0$ 表示何种二次曲面，并化为标准形（配方）。

**5.** 将点 $P(1,\sqrt{3},2\sqrt{2})$ 的直角坐标化为球坐标 $(\rho,\varphi,\theta)$；并写出该点所在球面 $x^2+y^2+z^2=8$ 在球坐标下的方程。

*提示*：1 用 $|\mathbf{a}\pm\mathbf{b}|^2=|\mathbf{a}|^2\pm2\mathbf{a}\cdot\mathbf{b}+|\mathbf{b}|^2$；2 方向向量取平面法向量；3 用点到直线距离公式；4 与例 8.13 同型；5 注意 $\theta=\arg(y,x)$ 的象限。

---

*下一章将进入多变量函数的微分学：从平面点集与极限出发，建立偏导、可微与梯度，并用到本章的法向量、切平面与曲面方程。*

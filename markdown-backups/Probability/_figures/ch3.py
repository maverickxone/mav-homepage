# 第三章配图：边缘密度定限 / 二元正态等高线 / 次序统计量密度
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from math import comb
from common import (new_fig, tidy, save, INK, SOFT, FAINT, FILL,
                    ACCENT, ACCENT_FILL, COOL, COOL_FILL)

# ---------- 图 3-1 支撑集与积分限 ----------
def fig_3_1():
    fig, axes = plt.subplots(1, 2, figsize=(8.8, 4.0))
    for ax in axes:
        tidy(ax)
        tri = Polygon([(0, 0), (1, 1), (0, 1)], closed=True,
                      facecolor=FILL, edgecolor=INK, lw=1.4, zorder=1)
        ax.add_patch(tri)
        ax.set_xlim(-0.12, 1.25)
        ax.set_ylim(-0.12, 1.25)
        ax.set_aspect("equal")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xlabel("$x$")
        ax.set_ylabel("$y$", rotation=0, labelpad=8)
        ax.text(0.22, 0.75, "$D$", fontsize=13, color=SOFT)

    # 左：求 f_X —— 竖条
    ax = axes[0]
    x0 = 0.45
    ax.fill_between([x0 - 0.025, x0 + 0.025], [x0, x0], [1, 1],
                    color=ACCENT, alpha=0.85, zorder=3)
    ax.annotate("$y$ 从 $x$ 积到 $1$", xy=(x0, 0.72), xytext=(0.62, 0.38),
                fontsize=10, color=ACCENT,
                arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.1))
    ax.plot([x0], [x0], "o", ms=4, color=INK, zorder=4)
    ax.text(0.80, 0.70, "$y=x$", fontsize=10, color=SOFT,
            rotation=45, ha="center", va="center")
    ax.set_title("求 $f_X(x)$：固定 $x$，沿竖条积分\n"
                 "$f_X(x)=\\int_x^1 f(x,y)\\,\\mathrm{d}y$", fontsize=10.5)

    # 右：求 f_Y —— 横条
    ax = axes[1]
    y0 = 0.62
    ax.fill_betweenx([y0 - 0.025, y0 + 0.025], [0, 0], [y0, y0],
                     color=COOL, alpha=0.85, zorder=3)
    ax.annotate("$x$ 从 $0$ 积到 $y$", xy=(0.30, y0), xytext=(0.52, 0.30),
                fontsize=10, color=COOL,
                arrowprops=dict(arrowstyle="->", color=COOL, lw=1.1))
    ax.set_title("求 $f_Y(y)$：固定 $y$，沿横条积分\n"
                 "$f_Y(y)=\\int_0^y f(x,y)\\,\\mathrm{d}x$", fontsize=10.5)

    fig.suptitle("边缘密度的积分限由支撑集 $D=\\{0<x<y<1\\}$ 决定：先画区域，再定上下限",
                 fontsize=11.5, y=1.02)
    fig.tight_layout()
    save(fig, "03-01.png")


# ---------- 图 3-2 二元正态等高线 ----------
def fig_3_2():
    fig, axes = plt.subplots(1, 2, figsize=(8.8, 4.2))
    g = np.linspace(-3, 3, 240)
    X, Y = np.meshgrid(g, g)

    for ax, rho in zip(axes, (0.0, 0.7)):
        tidy(ax)
        Z = np.exp(-(X**2 - 2 * rho * X * Y + Y**2) / (2 * (1 - rho**2)))
        Z /= 2 * np.pi * np.sqrt(1 - rho**2)
        ax.contour(X, Y, Z, levels=6, colors=INK, linewidths=0.9)
        ax.set_aspect("equal")
        ax.set_xlabel("$x$")
        ax.set_ylabel("$y$", rotation=0, labelpad=6)
        ax.set_title(f"$\\rho = {rho:g}$：" +
                     ("等高线为圆，独立", "椭圆沿对角倾斜，正相关")[rho > 0],
                     fontsize=10.5)
        if rho > 0:
            ax.plot(g, rho * g, color=ACCENT, lw=1.6, ls=(0, (5, 3)))
            ax.text(2.9, 2.35, "$y=\\rho x$（回归直线）", color=ACCENT,
                    fontsize=9.5, ha="right", va="bottom")
        ax.set_xlim(-3, 3)
        ax.set_ylim(-3, 3)

    fig.suptitle("标准二元正态密度的等高线：相关系数 $\\rho$ 决定椭圆的倾斜",
                 fontsize=11.5, y=1.0)
    fig.tight_layout()
    save(fig, "03-02.png")


# ---------- 图 3-3 次序统计量的密度 ----------
def fig_3_3():
    n = 5
    x = np.linspace(0, 1, 300)

    def order_pdf(k):
        # U(0,1) 样本 X_(k) ~ Beta(k, n-k+1)
        return (n * comb(n - 1, k - 1)) * x**(k - 1) * (1 - x)**(n - k)

    fig, ax = new_fig(6.8, 3.9)
    for k, c, lab in ((1, ACCENT, "最小值 $X_{(1)}$"),
                      (3, INK, "中位数 $X_{(3)}$"),
                      (5, COOL, "最大值 $X_{(5)}$")):
        ax.plot(x, order_pdf(k), color=c, lw=1.8, label=lab)

    ax.axhline(1, color=FAINT, lw=0.9, ls=(0, (4, 3)))
    ax.text(0.985, 1.06, "原始 $\\mathcal{U}(0,1)$ 密度", fontsize=9, color=SOFT,
            ha="right", va="bottom")
    ax.set_xlabel("$x$")
    ax.set_ylabel("密度")
    ax.set_title("$\\mathcal{U}(0,1)$ 的 5 个样本：排序把「平」的分布挤向两端与中间")
    ax.legend()
    ax.set_ylim(0, 5.2)
    save(fig, "03-03.png")


if __name__ == "__main__":
    fig_3_1()
    fig_3_2()
    fig_3_3()

"""Chapter 5 figures: mean free path, random walk, three transports, Brownian motion."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Circle, Rectangle
from common import save, INK, GRID, FILL, HOT, COLD


def _arrow(ax, p0, p1, color, lw=2.0, style="-|>"):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle=style, mutation_scale=13,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def fig_cross_section():
    """碰撞截面与平均自由程：扫过的柱体。"""
    fig, ax = plt.subplots(figsize=(6.6, 3.6))
    ax.set_xlim(0, 11); ax.set_ylim(0, 5); ax.axis("off")
    # swept cylinder
    ax.add_patch(Rectangle((1.0, 1.6), 8.4, 1.8, facecolor=FILL, edgecolor=GRID, lw=1.0))
    ax.plot([1.0, 9.4], [2.5, 2.5], color=INK, lw=1.2, ls=(0, (4, 3)))
    # moving molecule
    ax.add_patch(Circle((1.4, 2.5), 0.45, facecolor=HOT, edgecolor=INK, lw=1.3, zorder=4))
    _arrow(ax, (1.9, 2.5), (3.2, 2.5), HOT)
    ax.annotate("", xy=(1.0, 1.4), xytext=(9.4, 1.4),
                arrowprops=dict(arrowstyle="<->", color=INK, lw=1.0))
    ax.text(5.2, 1.0, r"$\bar v\,\Delta t$（走过的路程）", ha="center", fontsize=10.5)
    ax.annotate("", xy=(0.7, 1.6), xytext=(0.7, 3.4),
                arrowprops=dict(arrowstyle="<->", color=INK, lw=1.0))
    ax.text(0.45, 2.5, r"$d$", ha="right", va="center", fontsize=11)
    # target molecules (some inside cylinder => collide)
    rng = np.random.default_rng(5)
    for _ in range(14):
        x, y = rng.uniform(2, 9.2), rng.uniform(0.6, 4.4)
        inside = 1.6 < y < 3.4
        ax.add_patch(Circle((x, y), 0.22, facecolor=(COLD if inside else "white"),
                            edgecolor=INK, lw=1.1, zorder=3))
    ax.text(5.5, 4.5, r"截面 $\sigma=\pi d^2$ 内的分子会被撞上  →  $\bar\lambda=\frac{1}{\sqrt{2}\,\pi d^2 n}$",
            ha="center", fontsize=10.5)
    ax.set_title("碰撞截面与平均自由程", fontsize=12.5)
    save(fig, "05-01.png")


def fig_random_walk():
    """随机游走：净位移 ∝ √t，远小于总路程。"""
    fig, ax = plt.subplots(figsize=(5.6, 4.4))
    rng = np.random.default_rng(2)
    n = 60
    ang = rng.uniform(0, 2 * np.pi, n)
    step = 1.0
    xs = np.concatenate([[0], np.cumsum(step * np.cos(ang))])
    ys = np.concatenate([[0], np.cumsum(step * np.sin(ang))])
    ax.plot(xs, ys, color=INK, lw=1.0)
    ax.plot(xs[0], ys[0], "o", color=COLD, ms=9, zorder=5); ax.text(xs[0] - 0.3, ys[0] - 0.6, "起点", fontsize=10, color=COLD)
    ax.plot(xs[-1], ys[-1], "o", color=HOT, ms=9, zorder=5); ax.text(xs[-1] + 0.2, ys[-1], "终点", fontsize=10, color=HOT)
    _arrow(ax, (xs[0], ys[0]), (xs[-1], ys[-1]), HOT, lw=2.0)
    ax.text(0.5 * (xs[0] + xs[-1]) + 0.3, 0.5 * (ys[0] + ys[-1]) + 0.4,
            "净位移", color=HOT, fontsize=10)
    ax.set_title("随机游走：总路程 ∝ $t$，净位移仅 ∝ $\\sqrt{t}$", fontsize=12)
    ax.set_aspect("equal"); ax.axis("off")
    save(fig, "05-02.png")


def fig_three_transports():
    """三种输运过程的统一图像：梯度驱动的净搬运。"""
    fig, axes = plt.subplots(1, 3, figsize=(8.4, 3.4))
    data = [
        ("黏性", "速度梯度 $du/dz$", "搬运动量", COLD),
        ("热传导", "温度梯度 $dT/dz$", "搬运能量", HOT),
        ("扩散", "浓度梯度 $dn/dz$", "搬运粒子", INK),
    ]
    for ax, (name, grad, what, col) in zip(axes, data):
        ax.set_xlim(0, 4); ax.set_ylim(0, 5); ax.axis("off")
        # two layers
        ax.add_patch(Rectangle((0.5, 3.0), 3.0, 1.3, facecolor=col, alpha=0.32, edgecolor=INK, lw=1.0))
        ax.add_patch(Rectangle((0.5, 0.7), 3.0, 1.3, facecolor=col, alpha=0.12, edgecolor=INK, lw=1.0))
        # molecule crossing
        _arrow(ax, (2.0, 3.0), (2.0, 2.0), col, lw=2.0)
        _arrow(ax, (1.4, 2.0), (1.4, 3.0), col, lw=1.4, style="-|>")
        ax.text(2.0, 4.55, name, ha="center", fontsize=12, color=col, fontweight="bold")
        ax.text(2.0, 0.25, grad, ha="center", fontsize=9.5)
        ax.text(2.0, 2.5, what, ha="center", fontsize=9, color=INK,
                bbox=dict(boxstyle="round,pad=0.15", fc="white", ec=col, lw=0.8))
    fig.suptitle("三种输运过程：分子热运动在梯度中的净搬运", fontsize=12.5, y=1.03)
    save(fig, "05-03.png")


def fig_brownian():
    """布朗运动轨迹。"""
    fig, ax = plt.subplots(figsize=(5.2, 4.4))
    rng = np.random.default_rng(9)
    n = 400
    xs = np.cumsum(rng.normal(0, 1, n))
    ys = np.cumsum(rng.normal(0, 1, n))
    ax.plot(xs, ys, color=COLD, lw=0.9)
    ax.plot(xs[0], ys[0], "o", color=INK, ms=7, zorder=5)
    ax.plot(xs[-1], ys[-1], "o", color=HOT, ms=7, zorder=5)
    ax.text(0.02, 0.02, r"花粉颗粒受大量水分子随机碰撞 → 随机游走，$\overline{r^2}=6Dt$",
            transform=ax.transAxes, fontsize=10)
    ax.set_title("布朗运动：分子热运动的宏观证据", fontsize=12.5)
    ax.set_aspect("equal"); ax.axis("off")
    save(fig, "05-04.png")


if __name__ == "__main__":
    fig_cross_section()
    fig_random_walk()
    fig_three_transports()
    fig_brownian()

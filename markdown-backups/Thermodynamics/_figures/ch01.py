"""Chapter 1 figures: systems, zeroth law, pressure micro-model, isotherms, barometric."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle, Circle
from common import save, INK, GRID, FILL, HOT, COLD

rng = np.random.default_rng(3)


def _arrow(ax, p0, p1, color, lw=2.2, style="-|>"):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle=style, mutation_scale=15,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def fig_systems():
    """开放 / 封闭 / 孤立 三类系统。"""
    fig, axes = plt.subplots(1, 3, figsize=(8.2, 3.4))
    titles = ["开放系统", "封闭系统", "孤立系统"]
    subs = ["物质、能量都可穿越", "能量可穿越，物质不可", "物质、能量都不可穿越"]
    for ax, title, sub, kind in zip(axes, titles, subs, ["open", "closed", "isolated"]):
        ax.set_xlim(0, 6)
        ax.set_ylim(0, 6)
        ax.axis("off")
        # container
        dbl = (kind == "isolated")
        ax.add_patch(Rectangle((1.6, 1.8), 2.8, 2.4, fill=False, edgecolor=INK, lw=1.8))
        if dbl:
            ax.add_patch(Rectangle((1.45, 1.65), 3.1, 2.7, fill=False, edgecolor=INK, lw=1.2))
        # gas dots
        xs = rng.uniform(1.9, 4.1, 16); ys = rng.uniform(2.05, 3.95, 16)
        ax.scatter(xs, ys, s=12, color=COLD, zorder=3)
        # energy arrow (heat/work) — red wavy-ish straight
        if kind in ("open", "closed"):
            _arrow(ax, (5.4, 3.0), (4.4, 3.0), HOT)
            ax.text(5.5, 3.25, "能量", color=HOT, fontsize=10, ha="left")
        # matter arrow
        if kind == "open":
            _arrow(ax, (3.0, 0.6), (3.0, 1.75), COLD)
            ax.text(3.2, 0.7, "物质", color=COLD, fontsize=10)
        ax.set_title(title + "\n" + sub, fontsize=11)
    save(fig, "01-01.png")


def fig_zeroth():
    """第零定律：热平衡的传递性。"""
    fig, ax = plt.subplots(figsize=(5.6, 4.0))
    ax.set_xlim(0, 6)
    ax.set_ylim(0, 5)
    ax.axis("off")
    pos = {"A": (1.2, 3.6), "B": (4.8, 3.6), "C": (3.0, 1.2)}
    for name, (x, y) in pos.items():
        ax.add_patch(Circle((x, y), 0.55, facecolor="white", edgecolor=INK, lw=1.8, zorder=3))
        ax.text(x, y, name, ha="center", va="center", fontsize=15, zorder=4)
    # A-C and B-C solid (measured equilibria)
    ax.plot([1.2, 3.0], [3.6, 1.2], color=INK, lw=1.8)
    ax.plot([4.8, 3.0], [3.6, 1.2], color=INK, lw=1.8)
    ax.text(1.5, 2.2, "热平衡", color=INK, fontsize=10, rotation=52)
    ax.text(4.0, 2.2, "热平衡", color=INK, fontsize=10, rotation=-52)
    # A-B dashed (deduced)
    ax.plot([1.75, 4.25], [3.6, 3.6], color=HOT, lw=2.0, ls=(0, (5, 3)))
    ax.text(3.0, 3.78, "必然也热平衡", color=HOT, fontsize=11, ha="center")
    ax.text(3.0, 0.2, "传递性 ⟹ 存在态函数「温度」", ha="center", fontsize=11)
    ax.set_title("第零定律：热平衡可以传递", fontsize=13)
    save(fig, "01-02.png")


def fig_pressure():
    """压强的微观模型：分子撞壁 + 柱体。"""
    fig, ax = plt.subplots(figsize=(6.2, 4.2))
    ax.set_xlim(0, 7)
    ax.set_ylim(0, 5)
    ax.axis("off")
    # container
    ax.add_patch(Rectangle((0.6, 0.6), 5.8, 3.8, fill=False, edgecolor=INK, lw=1.6))
    # right wall highlighted
    ax.plot([6.4, 6.4], [0.6, 4.4], color=INK, lw=4)
    ax.text(6.55, 2.5, "器壁\n面积 $A$", fontsize=10, va="center")
    # slab of thickness v_x dt near wall
    ax.add_patch(Rectangle((5.0, 0.6), 1.4, 3.8, facecolor=FILL, edgecolor="none", zorder=0))
    ax.annotate("", xy=(6.4, 0.95), xytext=(5.0, 0.95),
                arrowprops=dict(arrowstyle="<->", color=INK, lw=1.1))
    ax.text(5.7, 0.55, r"$v_x\,\Delta t$", ha="center", va="top", fontsize=11)
    # random molecules
    xs = rng.uniform(0.9, 6.1, 22); ys = rng.uniform(0.9, 4.1, 22)
    ax.scatter(xs, ys, s=12, color=COLD, zorder=3)
    # highlighted molecule heading to wall
    ax.scatter([5.4], [2.6], s=40, color=HOT, zorder=5)
    _arrow(ax, (5.4, 2.6), (6.25, 2.6), HOT)
    ax.text(5.5, 2.85, r"$v_x$", color=HOT, fontsize=12)
    ax.set_title("压强的微观来源：分子撞壁的平均效果", fontsize=12.5)
    save(fig, "01-03.png")


def fig_isotherms():
    """等温线族 pV=nRT。"""
    fig, ax = plt.subplots(figsize=(5.8, 4.4))
    V = np.linspace(0.6, 6, 200)
    for T, lab in [(1.0, "$T_1$"), (1.6, "$T_2$"), (2.3, "$T_3$")]:
        ax.plot(V, T / V, color=INK, lw=1.9)
        ax.text(6.05, T / 6.0, lab, fontsize=12, va="center")
    ax.text(4.3, 0.92, r"$pV=nRT=$常数", fontsize=11, color=INK)
    ax.annotate("温度升高\n离原点更远", xy=(2.0, 2.3 / 2.0), xytext=(3.0, 2.7),
                fontsize=10, color=HOT,
                arrowprops=dict(arrowstyle="->", color=HOT, lw=1.3))
    ax.set_xlabel("体积  $V$")
    ax.set_ylabel("压强  $p$")
    ax.set_title("等温线族：$p$-$V$ 图上的双曲线", fontsize=12.5)
    ax.set_xlim(0, 7)
    ax.set_ylim(0, 4)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "01-04.png")


def fig_barometric():
    """等温大气：气压随高度指数衰减。"""
    fig, ax = plt.subplots(figsize=(5.6, 4.2))
    H = 8.8
    z = np.linspace(0, 30, 200)
    p = np.exp(-z / H)
    ax.plot(z, p, color=COLD, lw=2.4)
    ax.fill_between(z, 0, p, color=FILL, zorder=0)
    # characteristic height
    ax.axvline(H, color=HOT, lw=1.4, ls=(0, (5, 3)))
    ax.plot([H], [np.exp(-1)], "o", color=HOT, zorder=5)
    ax.annotate(r"$z=H$ 时降到 $p_0/e$", xy=(H, np.exp(-1)),
                xytext=(H + 1.5, 0.55), fontsize=10, color=HOT,
                arrowprops=dict(arrowstyle="->", color=HOT, lw=1.2))
    ax.text(15, 0.78, r"$p(z)=p_0\,e^{-Mgz/RT}$", fontsize=12)
    ax.text(15, 0.66, r"$H=RT/Mg\approx 8.8$ km", fontsize=10.5, color=INK)
    ax.set_xlabel("高度  $z$ / km")
    ax.set_ylabel(r"气压  $p/p_0$")
    ax.set_title("等温气压公式：随高度指数衰减", fontsize=12.5)
    ax.set_xlim(0, 30)
    ax.set_ylim(0, 1.05)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "01-05.png")


if __name__ == "__main__":
    fig_systems()
    fig_zeroth()
    fig_pressure()
    fig_isotherms()
    fig_barometric()

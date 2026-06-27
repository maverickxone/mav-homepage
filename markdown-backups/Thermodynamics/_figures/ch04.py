"""Chapter 4 figures: Maxwell distribution, 3 speeds, T effect, velocity-space shell, DOF, Stern."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Circle, Wedge, Rectangle, Annulus
from common import save, INK, GRID, FILL, HOT, COLD


def _arrow(ax, p0, p1, color, lw=2.0, style="-|>"):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle=style, mutation_scale=14,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def maxwell(v, T, m=1.0, k=1.0):
    return 4 * np.pi * (m / (2 * np.pi * k * T)) ** 1.5 * v ** 2 * np.exp(-m * v ** 2 / (2 * k * T))


def fig_distribution():
    """Maxwell 速率分布 + 三个特征速率。"""
    fig, ax = plt.subplots(figsize=(6.0, 4.4))
    vp = 1.0
    v = np.linspace(0, 3, 400)
    f = v ** 2 * np.exp(-v ** 2 / vp ** 2)
    f /= f.max()
    ax.plot(v, f, color=INK, lw=2.4)
    ax.fill_between(v, 0, f, color=FILL, zorder=0)
    vbar = vp * np.sqrt(4 / np.pi)
    vrms = vp * np.sqrt(1.5)
    for x, lab, col in [(vp, r"$v_p$", COLD), (vbar, r"$\bar v$", INK), (vrms, r"$v_{rms}$", HOT)]:
        yy = (x ** 2 * np.exp(-x ** 2 / vp ** 2)) / (vp ** 2 * np.exp(-1))
        ax.plot([x, x], [0, yy], color=col, lw=1.6, ls=(0, (4, 2)))
        ax.text(x, -0.06, lab, color=col, ha="center", fontsize=12)
    ax.text(1.7, 0.85, r"$v_p:\bar v:v_{rms}=1:1.13:1.22$", fontsize=10.5)
    ax.set_xlabel("速率  $v$")
    ax.set_ylabel(r"分布 $f(v)$")
    ax.set_title("Maxwell 速率分布与三个特征速率", fontsize=12.5)
    ax.set_xlim(0, 3); ax.set_ylim(0, 1.08)
    ax.set_yticks([])
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "04-01.png")


def fig_temperature():
    """温度升高：峰右移、变矮、变宽。"""
    fig, ax = plt.subplots(figsize=(6.0, 4.4))
    v = np.linspace(0, 4, 500)
    for T, col, lab in [(1.0, COLD, "$T_1$"), (2.0, INK, "$T_2=2T_1$"), (4.0, HOT, "$T_3=4T_1$")]:
        f = maxwell(v, T)
        ax.plot(v, f, color=col, lw=2.2, label=lab)
    ax.legend(fontsize=10.5, frameon=False)
    ax.annotate("温度升高\n峰右移、变矮、变宽", xy=(1.6, maxwell(1.6, 2.0)),
                xytext=(2.2, 0.55 * maxwell(1.0, 1.0)), fontsize=10, color=HOT,
                arrowprops=dict(arrowstyle="->", color=HOT, lw=1.2))
    ax.set_xlabel("速率  $v$")
    ax.set_ylabel(r"分布 $f(v)$")
    ax.set_title("温度对速率分布的影响（面积恒为 1）", fontsize=12.5)
    ax.set_xlim(0, 4); ax.set_ylim(0, None)
    ax.set_yticks([])
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "04-02.png")


def fig_velocity_shell():
    """速度空间球壳：v² 因子的来源。"""
    fig, ax = plt.subplots(figsize=(5.2, 4.8))
    ax.set_xlim(-3.3, 3.3); ax.set_ylim(-3.3, 3.6); ax.set_aspect("equal"); ax.axis("off")
    # axes
    _arrow(ax, (-3, 0), (3.1, 0), INK, lw=1.2); ax.text(3.15, -0.1, r"$v_x$", fontsize=11, va="top")
    _arrow(ax, (0, -3), (0, 3.2), INK, lw=1.2); ax.text(0.1, 3.2, r"$v_y$", fontsize=11)
    # shell annulus
    ax.add_patch(Annulus((0, 0), 2.3, 0.32, facecolor=HOT, edgecolor="none", alpha=0.55))
    ax.add_patch(Circle((0, 0), 2.3, fill=False, edgecolor=INK, lw=1.0, ls=(0, (3, 3))))
    ax.annotate("", xy=(2.3 * np.cos(0.7), 2.3 * np.sin(0.7)), xytext=(0, 0),
                arrowprops=dict(arrowstyle="->", color=INK, lw=1.4))
    ax.text(0.95, 1.15, r"$v$", fontsize=13)
    ax.text(0.2, 2.85, r"半径 $v$、厚 $dv$ 的球壳", fontsize=10.5, color=HOT, ha="center")
    ax.text(0, -3.6, r"球壳体积 $\propto 4\pi v^2\,dv$  →  $f(v)$ 里的 $v^2$ 因子",
            ha="center", fontsize=10.5)
    ax.set_title("速度空间中的球壳", fontsize=12.5)
    save(fig, "04-03.png")


def fig_dof():
    """自由度：单原子 / 双原子 / 多原子。"""
    fig, axes = plt.subplots(1, 3, figsize=(8.0, 3.2))
    data = [
        ("单原子 (He, Ar)", "平动 3", "$i=3$"),
        ("双原子 (N₂, O₂)", "平动 3 + 转动 2", "$i=5$"),
        ("非线性多原子 (H₂O)", "平动 3 + 转动 3", "$i=6$"),
    ]
    for ax, (title, comp, ii) in zip(axes, data):
        ax.set_xlim(0, 4); ax.set_ylim(0, 4); ax.set_aspect("equal"); ax.axis("off")
        if "单原子" in title:
            ax.add_patch(Circle((2, 2.2), 0.45, facecolor=COLD, edgecolor=INK, lw=1.4))
        elif "双原子" in title:
            ax.add_patch(Circle((1.45, 2.2), 0.42, facecolor=COLD, edgecolor=INK, lw=1.4))
            ax.add_patch(Circle((2.55, 2.2), 0.42, facecolor=COLD, edgecolor=INK, lw=1.4))
            ax.plot([1.45, 2.55], [2.2, 2.2], color=INK, lw=2.2)
        else:
            ax.add_patch(Circle((2, 2.55), 0.40, facecolor=HOT, edgecolor=INK, lw=1.4))
            ax.add_patch(Circle((1.4, 1.85), 0.34, facecolor=COLD, edgecolor=INK, lw=1.4))
            ax.add_patch(Circle((2.6, 1.85), 0.34, facecolor=COLD, edgecolor=INK, lw=1.4))
            ax.plot([2, 1.4], [2.55, 1.85], color=INK, lw=2.0)
            ax.plot([2, 2.6], [2.55, 1.85], color=INK, lw=2.0)
        ax.text(2, 0.95, comp, ha="center", fontsize=10)
        ax.text(2, 0.4, ii, ha="center", fontsize=12, color=HOT)
        ax.set_title(title, fontsize=10.5)
    fig.suptitle("自由度与能量均分：每个平方项分 ½kT", fontsize=12.5, y=1.02)
    save(fig, "04-04.png")


def fig_stern():
    """Stern 实验示意。"""
    fig, ax = plt.subplots(figsize=(6.0, 4.2))
    ax.set_xlim(0, 6); ax.set_ylim(0, 6); ax.set_aspect("equal"); ax.axis("off")
    # source at center
    ax.add_patch(Circle((3, 3), 0.35, facecolor=HOT, edgecolor=INK, lw=1.4))
    ax.text(3, 3, "源", ha="center", va="center", color="white", fontsize=9)
    # inner slit ring + outer drum
    ax.add_patch(Circle((3, 3), 2.6, fill=False, edgecolor=INK, lw=2.0))
    ax.add_patch(Circle((3, 3), 1.2, fill=False, edgecolor=GRID, lw=1.0, ls=(0, (3, 3))))
    # atom paths (fast=straight to near, slow=curved offset)
    for ang, col, lab in [(0.0, INK, "快原子"), (-0.35, COLD, "慢原子")]:
        x2 = 3 + 2.6 * np.cos(ang); y2 = 3 + 2.6 * np.sin(ang)
        _arrow(ax, (3 + 1.2 * np.cos(0), 3 + 1.2 * np.sin(0)), (x2, y2), col, lw=1.8)
    ax.annotate("圆筒旋转 →\n快慢原子打在不同位置", xy=(3 + 2.6, 3), xytext=(0.2, 0.55),
                fontsize=9.5, color=INK,
                arrowprops=dict(arrowstyle="->", color=INK, lw=1.0))
    # rotation arrow
    ax.add_patch(FancyArrowPatch((3 + 2.9, 3 + 0.6), (3 + 2.7, 3 + 1.3),
                 connectionstyle="arc3,rad=0.4", arrowstyle="-|>",
                 mutation_scale=14, color=HOT, lw=1.6))
    ax.set_title("Stern 实验：直接测量速率分布", fontsize=12.5)
    save(fig, "04-05.png")


if __name__ == "__main__":
    fig_distribution()
    fig_temperature()
    fig_velocity_shell()
    fig_dof()
    fig_stern()

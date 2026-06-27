"""Chapter 2 figures: work=area, four processes, adiabat vs isotherm, cycle, Joule expansion."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle, Circle, FancyArrow
from common import save, INK, GRID, FILL, HOT, COLD

GAMMA = 1.4
rng = np.random.default_rng(11)


def _arrow(ax, p0, p1, color, lw=2.2, style="-|>"):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle=style, mutation_scale=15,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def fig_work_area():
    """W = ∫p dV = p-V 曲线下方面积。"""
    fig, ax = plt.subplots(figsize=(5.8, 4.4))
    V = np.linspace(1.0, 4.0, 200)
    p = 3.0 / V                      # 某条过程曲线
    ax.plot(V, p, color=INK, lw=2.3)
    ax.fill_between(V, 0, p, color=FILL, zorder=0)
    ax.plot([1, 1], [0, 3.0], color=GRID, lw=1)
    ax.plot([4, 4], [0, 0.75], color=GRID, lw=1)
    ax.text(2.2, 0.7, r"$W=\int_{V_1}^{V_2}p\,dV$", fontsize=13)
    ax.text(2.2, 0.32, "（曲线下方的面积）", fontsize=10, color=INK)
    ax.plot(1, 3.0, "o", color=INK, ms=6); ax.text(0.85, 3.05, "初", fontsize=11)
    ax.plot(4, 0.75, "o", color=INK, ms=6); ax.text(4.05, 0.8, "末", fontsize=11)
    ax.set_xlabel("体积  $V$"); ax.set_ylabel("压强  $p$")
    ax.set_title("体积功 = $p$-$V$ 图上曲线下方的面积", fontsize=12.5)
    ax.set_xlim(0.4, 4.8); ax.set_ylim(0, 3.4)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "02-01.png")


def fig_four_processes():
    """四种过程从同一初态出发的 p-V 形状。"""
    fig, ax = plt.subplots(figsize=(6.0, 4.6))
    V0, p0 = 2.0, 2.0
    ax.plot(V0, p0, "o", color=INK, ms=7, zorder=6)
    ax.text(V0 - 0.15, p0 + 0.12, "初态", fontsize=11, ha="right")

    # 等容：竖直线
    ax.plot([V0, V0], [p0, 0.6], color=COLD, lw=2.2)
    ax.text(V0 + 0.04, 0.75, "等容\n$V$不变", color=COLD, fontsize=9.5)
    # 等压：水平线
    ax.plot([V0, 4.2], [p0, p0], color=HOT, lw=2.2)
    ax.text(3.4, p0 + 0.08, "等压 $p$不变", color=HOT, fontsize=9.5)
    # 等温：pV=const
    V = np.linspace(V0, 4.5, 100)
    ax.plot(V, p0 * V0 / V, color=INK, lw=2.2)
    ax.text(3.7, p0 * V0 / 3.7 + 0.06, "等温", color=INK, fontsize=9.5)
    # 绝热：pV^gamma=const（更陡）
    ax.plot(V, p0 * (V0 / V) ** GAMMA, color=INK, lw=2.2, ls=(0, (5, 2)))
    ax.text(3.55, p0 * (V0 / 3.55) ** GAMMA - 0.18, "绝热\n(更陡)", color=INK, fontsize=9.5)

    ax.set_xlabel("体积  $V$"); ax.set_ylabel("压强  $p$")
    ax.set_title("四种过程在 $p$-$V$ 图上的形状", fontsize=12.5)
    ax.set_xlim(1.2, 5.0); ax.set_ylim(0, 2.8)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "02-02.png")


def fig_adiabat_isotherm():
    """绝热线比等温线更陡。"""
    fig, ax = plt.subplots(figsize=(5.8, 4.4))
    V0, p0 = 1.5, 2.4
    V = np.linspace(1.5, 4.2, 120)
    ax.plot(V, p0 * V0 / V, color=COLD, lw=2.4, label="等温线 $p\\propto1/V$")
    ax.plot(V, p0 * (V0 / V) ** GAMMA, color=HOT, lw=2.4, label="绝热线 $p\\propto1/V^\\gamma$")
    ax.plot(V0, p0, "o", color=INK, ms=7, zorder=6)
    ax.text(V0 - 0.05, p0 + 0.1, "同一初态", fontsize=10, ha="right")
    ax.annotate("绝热膨胀：无热补给，\n做功靠耗内能 → 温度降\n→ 压强掉得更快",
                xy=(3.4, p0 * (V0 / 3.4) ** GAMMA), xytext=(2.7, 1.55),
                fontsize=9.5, color=HOT,
                arrowprops=dict(arrowstyle="->", color=HOT, lw=1.2))
    ax.legend(loc="upper right", fontsize=10, frameon=False)
    ax.set_xlabel("体积  $V$"); ax.set_ylabel("压强  $p$")
    ax.set_title("绝热线比等温线更陡", fontsize=12.5)
    ax.set_xlim(1.0, 4.6); ax.set_ylim(0, 3.0)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "02-03.png")


def fig_cycle():
    """循环过程：闭合曲线面积 = 净功。"""
    fig, ax = plt.subplots(figsize=(5.6, 4.4))
    # 矩形循环（两等容 + 两等压），顺时针
    V1, V2, p1, p2 = 1.5, 3.5, 1.2, 2.6
    xs = [V1, V2, V2, V1, V1]
    ys = [p2, p2, p1, p1, p2]
    ax.fill(xs, ys, color=FILL, zorder=0)
    ax.plot(xs, ys, color=INK, lw=2.2)
    # 顺时针箭头
    _arrow(ax, (V1 + 0.9, p2), (V1 + 1.1, p2), INK)
    _arrow(ax, (V2, p2 - 0.6), (V2, p2 - 0.8), INK)
    _arrow(ax, (V2 - 0.9, p1), (V2 - 1.1, p1), INK)
    _arrow(ax, (V1, p1 + 0.6), (V1, p1 + 0.8), INK)
    ax.text((V1 + V2) / 2, (p1 + p2) / 2, "净功 $W_{net}$\n= 闭合面积",
            ha="center", va="center", fontsize=11)
    ax.text(2.5, 2.95, "顺时针 = 热机（对外做正功）", ha="center", fontsize=10.5, color=HOT)
    ax.set_xlabel("体积  $V$"); ax.set_ylabel("压强  $p$")
    ax.set_title("循环过程：净功 = 闭合曲线围成的面积", fontsize=12)
    ax.set_xlim(0.8, 4.4); ax.set_ylim(0.4, 3.2)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "02-04.png")


def fig_joule():
    """焦耳自由膨胀实验。"""
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    ax.set_xlim(0, 10); ax.set_ylim(0, 6); ax.axis("off")
    # water bath
    ax.add_patch(Rectangle((0.6, 0.6), 8.8, 4.4, facecolor="#eaf3fb", edgecolor=COLD, lw=1.5))
    ax.text(5.0, 5.25, "水浴（测温度变化）", ha="center", fontsize=10.5, color=COLD)
    # two vessels
    ax.add_patch(Rectangle((1.6, 1.6), 2.6, 2.4, fill=False, edgecolor=INK, lw=1.8))
    ax.add_patch(Rectangle((5.8, 1.6), 2.6, 2.4, fill=False, edgecolor=INK, lw=1.8))
    # valve / pipe
    ax.plot([4.2, 5.8], [2.8, 2.8], color=INK, lw=2.0)
    ax.add_patch(Circle((5.0, 2.8), 0.22, facecolor="white", edgecolor=INK, lw=1.5))
    ax.text(5.0, 3.25, "阀门", ha="center", fontsize=9.5)
    # gas dots left, vacuum right
    xs = rng.uniform(1.9, 3.9, 24); ys = rng.uniform(1.9, 3.7, 24)
    ax.scatter(xs, ys, s=11, color=COLD, zorder=3)
    ax.text(2.9, 1.25, "气体", ha="center", fontsize=10)
    ax.text(7.1, 2.8, "真空", ha="center", fontsize=10, color=INK)
    ax.text(5.0, 0.15, r"打开阀门→自由膨胀：$W=0,\ Q=0$（水温不变）$\Rightarrow \Delta U=0$",
            ha="center", fontsize=10.5)
    ax.set_title("焦耳自由膨胀：理想气体内能只与温度有关", fontsize=12)
    save(fig, "02-05.png")


if __name__ == "__main__":
    fig_work_area()
    fig_four_processes()
    fig_adiabat_isotherm()
    fig_cycle()
    fig_joule()

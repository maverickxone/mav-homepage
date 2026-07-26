# 第一章配图：生日问题曲线 / 会面问题区域 / Bertrand 悖论
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle
from common import (new_fig, tidy, save, INK, SOFT, FAINT, FILL,
                    ACCENT, ACCENT_FILL, COOL)

# ---------- 图 1-1 生日问题 ----------
def fig_1_1():
    n = np.arange(1, 81)
    p = np.zeros_like(n, dtype=float)
    q = 1.0
    for i, k in enumerate(n):
        if k > 1:
            q *= (365 - (k - 1)) / 365
        p[i] = 1 - q

    fig, ax = new_fig(6.8, 3.8)
    ax.plot(n, p, color=INK, lw=1.8)
    ax.axhline(0.5, color=FAINT, lw=0.9, ls=(0, (4, 3)))

    for k, dy in ((23, -0.13), (50, -0.13)):
        pk = p[k - 1]
        ax.plot([k], [pk], "o", ms=5, color=ACCENT, zorder=5)
        ax.annotate(f"$n={k}$\n$p_{{{k}}}\\approx{pk:.3f}$",
                    xy=(k, pk), xytext=(k + 3, pk + dy),
                    fontsize=9.5, color=SOFT, ha="left", va="top")

    ax.set_xlim(0, 80)
    ax.set_ylim(0, 1.02)
    ax.set_xlabel("人数 $n$")
    ax.set_ylabel("$p_n$")
    ax.set_title("生日问题：$n$ 人中至少两人同生日的概率")
    save(fig, "01-01.png")


# ---------- 图 1-2 会面问题 ----------
def fig_1_2():
    fig, ax = plt.subplots(figsize=(4.6, 4.6))
    tidy(ax)
    band = Polygon([(0, 0), (20, 0), (60, 40), (60, 60),
                    (40, 60), (0, 20)], closed=True,
                   facecolor=ACCENT_FILL, edgecolor=ACCENT, lw=1.4, zorder=2)
    ax.add_patch(band)
    ax.plot([0, 60], [0, 60], color=FAINT, lw=0.9, ls=(0, (4, 3)), zorder=3)
    ax.plot([0, 60], [20, 80], color=ACCENT, lw=1.2, zorder=3)
    ax.plot([0, 60], [-20, 40], color=ACCENT, lw=1.2, zorder=3)

    ax.text(30, 36.5, "$|x-y|\\leq 20$（相遇）", color=ACCENT,
            fontsize=10.5, rotation=45, ha="center", va="center")
    ax.text(11, 47, "$y-x>20$", color=SOFT, fontsize=10)
    ax.text(38, 11, "$x-y>20$", color=SOFT, fontsize=10)

    ax.set_xlim(0, 60)
    ax.set_ylim(0, 60)
    ax.set_xticks([0, 20, 40, 60])
    ax.set_yticks([0, 20, 40, 60])
    ax.set_aspect("equal")
    ax.set_xlabel("甲的到达时刻 $x$（分钟）")
    ax.set_ylabel("乙的到达时刻 $y$（分钟）")
    ax.set_title("会面问题：$P(A) = \\dfrac{60^2-40^2}{60^2} = \\dfrac{5}{9}$",
                 pad=10)
    save(fig, "01-02.png")


# ---------- 图 1-3 Bertrand 悖论 ----------
def fig_1_3():
    fig, axes = plt.subplots(1, 3, figsize=(9.6, 3.55))
    rng = np.random.default_rng(7)
    n_chord = 110
    titles = ["(a) 端点等可能落在圆周\n$P = 1/3$",
              "(b) 中点等可能落在圆内\n$P = 1/4$",
              "(c) 中点等可能落在直径上\n$P = 1/2$"]

    def draw_chord(ax, p1, p2, long_):
        color = ACCENT if long_ else FAINT
        lw = 0.9 if long_ else 0.6
        zorder = 3 if long_ else 2
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=lw,
                alpha=0.85 if long_ else 0.7, zorder=zorder)

    def chord_from_midpoint(m):
        d = np.hypot(*m)
        if d < 1e-9:
            u = np.array([1.0, 0.0])
        else:
            u = np.array([-m[1], m[0]]) / d
        half = np.sqrt(max(1 - d * d, 0.0))
        return m - half * u, m + half * u

    for k, ax in enumerate(axes):
        ax.set_aspect("equal")
        ax.axis("off")
        ax.add_patch(Circle((0, 0), 1, fill=False, edgecolor=INK, lw=1.4, zorder=4))
        for _ in range(n_chord):
            if k == 0:                       # 随机端点
                t1, t2 = rng.uniform(0, 2 * np.pi, 2)
                p1 = np.array([np.cos(t1), np.sin(t1)])
                p2 = np.array([np.cos(t2), np.sin(t2)])
                long_ = np.hypot(*(p1 - p2)) >= np.sqrt(3)
            elif k == 1:                     # 中点均匀落在圆内
                while True:
                    m = rng.uniform(-1, 1, 2)
                    if m[0]**2 + m[1]**2 <= 1:
                        break
                p1, p2 = chord_from_midpoint(m)
                long_ = np.hypot(*m) <= 0.5
            else:                            # 中点均匀落在直径上
                r = rng.uniform(-1, 1)
                theta = rng.uniform(0, np.pi)
                m = r * np.array([np.cos(theta), np.sin(theta)])
                p1, p2 = chord_from_midpoint(m)
                long_ = abs(r) <= 0.5
            draw_chord(ax, p1, p2, long_)
        ax.set_xlim(-1.18, 1.18)
        ax.set_ylim(-1.32, 1.18)
        ax.set_title(titles[k], fontsize=10.5, pad=6)

    fig.suptitle("Bertrand 悖论：三种「任取一条弦」，弦长 $\\geq\\sqrt{3}$（橙色）的概率各不相同",
                 fontsize=11.5, y=1.02)
    save(fig, "01-03.png")


if __name__ == "__main__":
    fig_1_1()
    fig_1_2()
    fig_1_3()

"""Chapter 6 figures: Lennard-Jones, vdW isotherms, p-T phase diagram, surface tension, Dulong-Petit."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Circle
from common import save, INK, GRID, FILL, HOT, COLD


def _arrow(ax, p0, p1, color, lw=1.8, style="-|>"):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle=style, mutation_scale=12,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def fig_lennard_jones():
    """Lennard-Jones 势能曲线。"""
    fig, ax = plt.subplots(figsize=(5.8, 4.4))
    r = np.linspace(0.95, 2.6, 400)
    U = 4 * ((1 / r) ** 12 - (1 / r) ** 6)
    ax.plot(r, U, color=INK, lw=2.4)
    ax.axhline(0, color=GRID, lw=1)
    r0 = 2 ** (1 / 6)
    ax.plot(r0, -1, "o", color=HOT, ms=7, zorder=5)
    ax.plot([r0, r0], [-1, 0], color=HOT, lw=1.2, ls=(0, (3, 2)))
    ax.annotate(r"平衡距离 $r_0$（$F=0$，势能最低）", xy=(r0, -1), xytext=(1.5, -0.7),
                fontsize=9.5, color=HOT, arrowprops=dict(arrowstyle="->", color=HOT, lw=1.1))
    ax.annotate("近距：强排斥\n(电子云重叠)", xy=(1.02, 2.0), xytext=(1.05, 2.3), fontsize=9, color=COLD)
    ax.annotate("远距：吸引\n(van der Waals)", xy=(2.1, -0.18), xytext=(1.95, 0.55),
                fontsize=9, color=COLD, arrowprops=dict(arrowstyle="->", color=COLD, lw=1.0))
    ax.text(2.05, -1.15, r"势阱深度 $\varepsilon$", fontsize=9.5, color=INK)
    ax.set_xlabel("分子间距  $r$"); ax.set_ylabel("势能  $U(r)$")
    ax.set_title("Lennard-Jones 势：近排斥、远吸引", fontsize=12.5)
    ax.set_xlim(0.95, 2.6); ax.set_ylim(-1.4, 3)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "06-01.png")


def fig_vdw_isotherms():
    """范德瓦尔斯等温线：T<Tc 出现 S 形。"""
    fig, ax = plt.subplots(figsize=(6.0, 4.4))
    a = b = 1.0; R = 1.0
    Tc = 8 * a / (27 * R * b); Vc = 3 * b; pc = a / (27 * b ** 2)
    V = np.linspace(1.15, 7, 500)
    for T, col, lab in [(0.90 * Tc, COLD, r"$T<T_c$"),
                        (Tc, INK, r"$T=T_c$"),
                        (1.12 * Tc, HOT, r"$T>T_c$")]:
        p = R * T / (V - b) - a / V ** 2
        ax.plot(V, p, color=col, lw=2.2, label=lab)
    ax.plot(Vc, pc, "o", color=INK, ms=8, zorder=6)
    ax.annotate("临界点", xy=(Vc, pc), xytext=(Vc + 1.0, pc + 0.012),
                fontsize=10, arrowprops=dict(arrowstyle="->", color=INK, lw=1.1))
    ax.text(4.0, 0.006, "S 形段 → 气液共存区", fontsize=9.5, color=COLD)
    ax.legend(fontsize=10, frameon=False, loc="upper right")
    ax.set_xlabel(r"摩尔体积  $V_m$"); ax.set_ylabel("压强  $p$")
    ax.set_title("范德瓦尔斯等温线", fontsize=12.5)
    ax.set_xlim(0, 7); ax.set_ylim(0, 0.06)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "06-02.png")


def fig_phase_diagram():
    """p-T 相图：三相点、临界点、三条相平衡线。"""
    fig, ax = plt.subplots(figsize=(6.0, 4.4))
    ax.set_xlim(0, 10); ax.set_ylim(0, 8); ax.axis("off")
    # axes
    _arrow(ax, (0.6, 0.6), (9.6, 0.6), INK, lw=1.3); ax.text(9.7, 0.5, "$T$", fontsize=12, va="top")
    _arrow(ax, (0.6, 0.6), (0.6, 7.7), INK, lw=1.3); ax.text(0.45, 7.7, "$p$", fontsize=12)
    tp = (3.0, 2.4)   # triple point
    cp = (7.5, 6.2)   # critical point
    # sublimation (solid-gas): from origin-ish to triple
    ax.plot([1.0, tp[0]], [0.7, tp[1]], color=INK, lw=2.0)
    # fusion (solid-liquid): steep up from triple
    ax.plot([tp[0], tp[0] + 1.0], [tp[1], 7.2], color=INK, lw=2.0)
    # vaporization (liquid-gas): triple to critical
    tv = np.linspace(0, 1, 50)
    ax.plot(tp[0] + (cp[0] - tp[0]) * tv, tp[1] + (cp[1] - tp[1]) * np.sqrt(tv), color=INK, lw=2.0)
    # points
    ax.plot(*tp, "o", color=HOT, ms=8, zorder=5); ax.text(tp[0] - 0.2, tp[1] - 0.55, "三相点", color=HOT, fontsize=10, ha="center")
    ax.plot(*cp, "o", color=COLD, ms=8, zorder=5); ax.text(cp[0] + 0.2, cp[1], "临界点", color=COLD, fontsize=10)
    # region labels
    ax.text(1.6, 5.2, "固", fontsize=14); ax.text(5.0, 5.4, "液", fontsize=14); ax.text(6.6, 1.8, "气", fontsize=14)
    ax.set_title("$p$-$T$ 相图：三相点与临界点", fontsize=12.5)
    save(fig, "06-03.png")


def fig_surface_tension():
    """表面张力：表面分子受力不对称。"""
    fig, ax = plt.subplots(figsize=(5.2, 4.6))
    ax.set_xlim(-3, 3); ax.set_ylim(-3, 3.4); ax.set_aspect("equal"); ax.axis("off")
    drop = Circle((0, 0), 2.2, facecolor="#eaf3fb", edgecolor=COLD, lw=2.0)
    ax.add_patch(drop)
    # interior molecule: balanced
    ax.add_patch(Circle((-0.5, -0.3), 0.18, facecolor=INK, zorder=4))
    for ang in np.linspace(0, 2 * np.pi, 8, endpoint=False):
        _arrow(ax, (-0.5, -0.3), (-0.5 + 0.55 * np.cos(ang), -0.3 + 0.55 * np.sin(ang)), GRID, lw=1.0)
    ax.text(-0.5, -1.15, "内部：合力为零", ha="center", fontsize=9)
    # surface molecule: net inward
    sx, sy = 2.2 * np.cos(1.1), 2.2 * np.sin(1.1)
    ax.add_patch(Circle((sx, sy), 0.18, facecolor=HOT, zorder=4))
    _arrow(ax, (sx, sy), (sx * 0.55, sy * 0.55), HOT, lw=2.0)
    ax.text(sx + 0.2, sy + 0.3, "表面：净向内", color=HOT, fontsize=9)
    ax.text(0, -3.0, r"表面收缩 → 附加压强 $\Delta p=\dfrac{2\sigma}{R}$（拉普拉斯）", ha="center", fontsize=10.5)
    ax.set_title("液体表面张力", fontsize=12.5)
    save(fig, "06-04.png")


def fig_dulong_petit():
    """固体热容：低温趋零，高温趋 3R。"""
    fig, ax = plt.subplots(figsize=(5.8, 4.2))
    x = np.linspace(0.02, 3, 300)          # x = T/Theta
    # Einstein-like rise toward 3
    cv = 3 * (1 / x) ** 2 * np.exp(1 / x) / (np.exp(1 / x) - 1) ** 2
    ax.plot(x, cv, color=INK, lw=2.4)
    ax.axhline(3, color=HOT, lw=1.4, ls=(0, (5, 3)))
    ax.text(2.0, 3.12, r"Dulong-Petit 高温极限 $C_{V,m}=3R$", color=HOT, fontsize=10)
    ax.annotate("低温 → 0\n（需量子解释）", xy=(0.35, cv[np.argmin(np.abs(x - 0.35))]),
                xytext=(0.5, 1.0), fontsize=9.5, color=COLD,
                arrowprops=dict(arrowstyle="->", color=COLD, lw=1.1))
    ax.set_xlabel(r"温度  $T$（相对量）"); ax.set_ylabel(r"$C_{V,m}/R$")
    ax.set_title("固体摩尔热容：低温趋零、高温趋 $3R$", fontsize=12.5)
    ax.set_xlim(0, 3); ax.set_ylim(0, 3.4)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "06-05.png")


if __name__ == "__main__":
    fig_lennard_jones()
    fig_vdw_isotherms()
    fig_phase_diagram()
    fig_surface_tension()
    fig_dulong_petit()

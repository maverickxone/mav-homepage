"""Chapter 3 figures: Carnot cycle (p-V, T-S) and energy-flow diagrams."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle
from common import save, INK, GRID, FILL, HOT, COLD

GAMMA = 1.4

# Carnot state points (nR = 1 units)
T1, T2 = 1.0, 0.75          # hot, cold
V1, V2 = 1.0, 2.5           # isothermal expansion at T1
r = (T1 / T2) ** (1.0 / (GAMMA - 1.0))
V3 = V2 * r                 # adiabatic expansion 2->3
V4 = V1 * r                 # state 4 (adiabatic 4->1 back to 1)


def p_iso(V, T):
    return T / V            # nR = 1


def p_adiab(V, Vref, pref):
    return pref * (Vref / V) ** GAMMA


def fig_pv():
    fig, ax = plt.subplots(figsize=(5.6, 4.4))

    # isotherm segment 1->2 (T1) and 3->4 (T2)
    Va = np.linspace(V1, V2, 100)
    ax.plot(Va, p_iso(Va, T1), color=HOT, lw=2.2)
    Vc = np.linspace(V4, V3, 100)
    ax.plot(Vc, p_iso(Vc, T2), color=COLD, lw=2.2)

    # adiabat 2->3 and 4->1
    p2 = p_iso(V2, T1)
    Vb = np.linspace(V2, V3, 100)
    ax.plot(Vb, p_adiab(Vb, V2, p2), color=INK, lw=2.0, ls=(0, (5, 2)))
    p4 = p_iso(V4, T2)
    Vd = np.linspace(V1, V4, 100)
    ax.plot(Vd, p_adiab(Vd, V4, p4), color=INK, lw=2.0, ls=(0, (5, 2)))

    pts = {
        1: (V1, p_iso(V1, T1)),
        2: (V2, p_iso(V2, T1)),
        3: (V3, p_iso(V3, T2)),
        4: (V4, p_iso(V4, T2)),
    }
    for k, (x, y) in pts.items():
        ax.plot(x, y, "o", color=INK, ms=7, zorder=5)
    ax.annotate("1", pts[1], textcoords="offset points", xytext=(-14, 4), fontsize=13)
    ax.annotate("2", pts[2], textcoords="offset points", xytext=(8, 6), fontsize=13)
    ax.annotate("3", pts[3], textcoords="offset points", xytext=(8, 2), fontsize=13)
    ax.annotate("4", pts[4], textcoords="offset points", xytext=(-16, -2), fontsize=13)

    # process labels
    ax.annotate(r"等温膨胀  吸热 $Q_1$", (1.55, p_iso(1.55, T1)),
                textcoords="offset points", xytext=(6, 12), color=HOT, fontsize=11)
    ax.annotate(r"等温压缩  放热 $Q_2$", (V4 + 0.4, p_iso(V4 + 0.4, T2)),
                textcoords="offset points", xytext=(2, -20), color=COLD, fontsize=11)
    ax.annotate("绝热", (V2 + 0.25, p_adiab(V2 + 0.25, V2, p2)),
                textcoords="offset points", xytext=(8, 6), color=INK, fontsize=10)
    ax.annotate("绝热", (V4 - 0.35, p_adiab(V4 - 0.35, V4, p4)),
                textcoords="offset points", xytext=(-30, 6), color=INK, fontsize=10)

    # enclosed area
    loop_V = np.concatenate([Va, Vb, Vc[::-1], Vd[::-1]])
    loop_p = np.concatenate([
        p_iso(Va, T1), p_adiab(Vb, V2, p2),
        p_iso(Vc, T2)[::-1], p_adiab(Vd, V4, p4)[::-1]])
    ax.fill(loop_V, loop_p, color=FILL, zorder=0)

    ax.set_xlabel("体积  $V$")
    ax.set_ylabel("压强  $p$")
    ax.set_title("卡诺循环（$p$–$V$ 图）", fontsize=13, pad=10)
    ax.set_xlim(0.4, V3 + 0.6)
    ax.set_ylim(0, p_iso(V1, T1) * 1.12)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "03-01.png")


def fig_ts():
    fig, ax = plt.subplots(figsize=(5.6, 4.4))
    S1, S2 = 1.0, 2.4

    # rectangle path
    ax.plot([S1, S2], [T1, T1], color=HOT, lw=2.4)       # top: absorb Q1
    ax.plot([S1, S2], [T2, T2], color=COLD, lw=2.4)      # bottom: release Q2
    ax.plot([S2, S2], [T1, T2], color=INK, lw=2.0, ls=(0, (5, 2)))  # adiabatic
    ax.plot([S1, S1], [T2, T1], color=INK, lw=2.0, ls=(0, (5, 2)))  # adiabatic

    # work area
    ax.add_patch(Rectangle((S1, T2), S2 - S1, T1 - T2, color=FILL, zorder=0))
    ax.text((S1 + S2) / 2, (T1 + T2) / 2, r"$W=(T_1-T_2)\,\Delta S$",
            ha="center", va="center", fontsize=12)

    # Q1 / Q2 band labels
    ax.annotate(r"吸热 $Q_1=T_1\,\Delta S$", ((S1 + S2) / 2, T1),
                textcoords="offset points", xytext=(0, 8), ha="center",
                color=HOT, fontsize=11)
    ax.annotate(r"放热 $Q_2=T_2\,\Delta S$", ((S1 + S2) / 2, T2),
                textcoords="offset points", xytext=(0, -20), ha="center",
                color=COLD, fontsize=11)

    for (x, y, lbl, dx, dy) in [
        (S1, T1, "1", -12, 6), (S2, T1, "2", 6, 6),
        (S2, T2, "3", 6, -4), (S1, T2, "4", -12, -4)]:
        ax.plot(x, y, "o", color=INK, ms=6, zorder=5)
        ax.annotate(lbl, (x, y), textcoords="offset points", xytext=(dx, dy), fontsize=12)

    ax.set_xlabel("熵  $S$")
    ax.set_ylabel("温度  $T$")
    ax.set_title("卡诺循环（$T$–$S$ 图）：一个矩形", fontsize=13, pad=10)
    ax.set_xlim(S1 - 0.5, S2 + 0.5)
    ax.set_ylim(T2 - 0.35, T1 + 0.3)
    ax.spines[["top", "right"]].set_visible(False)
    save(fig, "03-02.png")


def _reservoir(ax, x, y, w, h, color, label):
    ax.add_patch(Rectangle((x, y), w, h, facecolor=color, edgecolor=INK, lw=1.3, alpha=0.85))
    ax.text(x + w / 2, y + h / 2, label, ha="center", va="center",
            color="white", fontsize=12, fontweight="bold")


def _arrow(ax, p0, p1, color, lw=2.4):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", mutation_scale=18,
                                 color=color, lw=lw, shrinkA=0, shrinkB=0))


def fig_flow():
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")

    # ---- Heat engine (left) ----
    cx = 2.4
    _reservoir(ax, cx - 1.6, 5.0, 3.2, 0.8, HOT, r"高温热源 $T_1$")
    _reservoir(ax, cx - 1.6, 0.2, 3.2, 0.8, COLD, r"低温热源 $T_2$")
    eng = plt.Circle((cx, 3.0), 0.85, facecolor="white", edgecolor=INK, lw=1.6)
    ax.add_patch(eng)
    ax.text(cx, 3.0, "热机", ha="center", va="center", fontsize=12)
    _arrow(ax, (cx, 5.0), (cx, 3.85), HOT)
    ax.text(cx + 0.2, 4.45, r"$Q_1$", color=HOT, fontsize=12)
    _arrow(ax, (cx, 2.15), (cx, 1.0), COLD)
    ax.text(cx + 0.2, 1.5, r"$Q_2$", color=COLD, fontsize=12)
    _arrow(ax, (cx + 0.85, 3.0), (cx + 2.2, 3.0), INK)
    ax.text(cx + 1.35, 3.25, r"$W$", color=INK, fontsize=12)
    ax.text(cx, -0.15, r"热机：$\eta=\dfrac{W}{Q_1}=1-\dfrac{Q_2}{Q_1}$",
            ha="center", fontsize=11)

    # ---- Refrigerator (right) ----
    rx = 7.4
    _reservoir(ax, rx - 1.6, 5.0, 3.2, 0.8, HOT, r"高温热源 $T_1$")
    _reservoir(ax, rx - 1.6, 0.2, 3.2, 0.8, COLD, r"低温热源 $T_2$")
    ref = plt.Circle((rx, 3.0), 0.85, facecolor="white", edgecolor=INK, lw=1.6)
    ax.add_patch(ref)
    ax.text(rx, 3.0, "制冷机", ha="center", va="center", fontsize=11)
    _arrow(ax, (rx, 3.85), (rx, 5.0), HOT)
    ax.text(rx + 0.2, 4.45, r"$Q_1$", color=HOT, fontsize=12)
    _arrow(ax, (rx, 1.0), (rx, 2.15), COLD)
    ax.text(rx + 0.2, 1.5, r"$Q_2$", color=COLD, fontsize=12)
    _arrow(ax, (rx - 2.2, 3.0), (rx - 0.85, 3.0), INK)
    ax.text(rx - 1.75, 3.25, r"$W$", color=INK, fontsize=12)
    ax.text(rx, -0.15, r"制冷机：$\varepsilon=\dfrac{Q_2}{W}=\dfrac{Q_2}{Q_1-Q_2}$",
            ha="center", fontsize=11)

    ax.set_title("能流方向：热机（顺循环） vs 制冷机（逆循环）", fontsize=13)
    save(fig, "03-03.png")


def fig_forbidden():
    """第二定律禁止的两件事：克劳修斯反例 + 开尔文反例。"""
    fig, (axL, axR) = plt.subplots(1, 2, figsize=(7.6, 4.2))
    for ax in (axL, axR):
        ax.set_xlim(0, 6)
        ax.set_ylim(0, 6)
        ax.axis("off")

    # --- 左：克劳修斯禁止（热自发从冷到热）---
    _reservoir(axL, 1.4, 5.0, 3.2, 0.8, HOT, r"高温热源 $T_1$")
    _reservoir(axL, 1.4, 0.2, 3.2, 0.8, COLD, r"低温热源 $T_2$")
    _arrow(axL, (3.0, 1.0), (3.0, 5.0), COLD)
    axL.text(3.25, 3.0, r"$Q$", color=COLD, fontsize=13)
    # big red cross
    axL.plot([1.7, 4.3], [1.4, 4.6], color=HOT, lw=4)
    axL.plot([1.7, 4.3], [4.6, 1.4], color=HOT, lw=4)
    axL.set_title("热量自发从冷流向热\n（不消耗功）—— 禁止", fontsize=11.5)

    # --- 右：开尔文禁止（单一热源 100% 取热做功）---
    _reservoir(axR, 1.4, 5.0, 3.2, 0.8, HOT, r"单一热源 $T$")
    eng = plt.Circle((3.0, 2.6), 0.8, facecolor="white", edgecolor=INK, lw=1.6)
    axR.add_patch(eng)
    axR.text(3.0, 2.6, "热机", ha="center", va="center", fontsize=11)
    _arrow(axR, (3.0, 5.0), (3.0, 3.4), HOT)
    axR.text(3.25, 4.2, r"$Q$", color=HOT, fontsize=13)
    _arrow(axR, (3.8, 2.6), (5.2, 2.6), INK)
    axR.text(4.3, 2.9, r"$W=Q$", color=INK, fontsize=12)
    axR.plot([1.7, 4.6], [1.2, 4.4], color=HOT, lw=4)
    axR.plot([1.7, 4.6], [4.4, 1.2], color=HOT, lw=4)
    axR.set_title("从单一热源取热\n全部变功 —— 禁止", fontsize=11.5)

    save(fig, "03-04.png")


def fig_free_expansion():
    """自由膨胀的不可逆性：正向自发，逆向永不自发。"""
    rng = np.random.default_rng(7)
    fig, ax = plt.subplots(figsize=(7.4, 3.4))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)
    ax.axis("off")

    def box(x0, dots_region):
        # 容器外框
        ax.add_patch(plt.Rectangle((x0, 0.6), 2.6, 2.6, fill=False, edgecolor=INK, lw=1.6))
        if dots_region == "left":
            ax.plot([x0 + 1.3, x0 + 1.3], [0.6, 3.2], color=INK, lw=1.2, ls=(0, (3, 3)))
            xs = rng.uniform(x0 + 0.15, x0 + 1.2, 38)
        else:
            xs = rng.uniform(x0 + 0.15, x0 + 2.45, 38)
        ys = rng.uniform(0.75, 3.05, len(xs))
        ax.scatter(xs, ys, s=10, color=COLD, zorder=3)

    box(0.4, "left")
    ax.text(1.7, 0.2, "气体在左半，右半真空", ha="center", fontsize=10.5)
    box(5.0, "full")
    ax.text(6.3, 0.2, "气体充满整个容器", ha="center", fontsize=10.5)

    _arrow(ax, (3.2, 1.9), (4.8, 1.9), INK)
    ax.text(4.0, 2.25, "自发", ha="center", color=INK, fontsize=11)
    # reverse forbidden
    ax.add_patch(FancyArrowPatch((4.8, 1.3), (3.2, 1.3), arrowstyle="-|>",
                                 mutation_scale=16, color=HOT, lw=2.0))
    ax.text(4.0, 0.95, "永不自发", ha="center", color=HOT, fontsize=10.5)
    ax.text(8.1, 1.9, r"$\Delta S = nR\ln 2 > 0$", fontsize=12, va="center")

    ax.set_title("自由膨胀：方向性的最直观例子", fontsize=12.5)
    save(fig, "03-05.png")


if __name__ == "__main__":
    fig_pv()
    fig_ts()
    fig_flow()
    fig_forbidden()
    fig_free_expansion()

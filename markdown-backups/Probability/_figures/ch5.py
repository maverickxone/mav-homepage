# 第五章配图：大数律（频率稳定） / 中心极限定理（直方图趋正态）
import numpy as np
import matplotlib.pyplot as plt
from common import (new_fig, tidy, save, INK, SOFT, FAINT, FILL,
                    ACCENT, ACCENT_FILL, COOL)

# ---------- 图 5-1 大数律 ----------
def fig_5_1():
    rng = np.random.default_rng(3)
    N = 2000
    n = np.arange(1, N + 1)

    fig, ax = new_fig(7.2, 3.9)
    for i, c in enumerate([FAINT, COOL, SOFT, ACCENT]):
        flips = rng.integers(0, 2, N)
        freq = np.cumsum(flips) / n
        ax.plot(n, freq, color=c, lw=1.1 if c != ACCENT else 1.5,
                alpha=0.95, zorder=3 + i)

    ax.axhline(0.5, color=INK, lw=1.0, ls=(0, (5, 3)), zorder=2)
    ax.text(N * 1.28, 0.535, "$p=\\frac{1}{2}$", va="bottom", ha="right",
            fontsize=10.5)
    ax.set_xscale("log")
    ax.set_xlim(1, N * 1.35)
    ax.set_ylim(0, 1)
    ax.set_xlabel("投掷次数 $n$（对数刻度）")
    ax.set_ylabel("正面频率 $N_A/n$")
    ax.set_title("大数律：4 条独立的掷币序列，频率殊途同归地稳定到概率")
    save(fig, "05-01.png")


# ---------- 图 5-2 中心极限定理 ----------
def fig_5_2():
    rng = np.random.default_rng(5)
    m = 60000
    fig, axes = plt.subplots(2, 2, figsize=(8.6, 5.8))
    z = np.linspace(-4, 4, 300)
    phi = np.exp(-z * z / 2) / np.sqrt(2 * np.pi)

    for ax, n in zip(axes.flat, (1, 2, 5, 30)):
        tidy(ax)
        s = rng.exponential(1.0, (m, n)).sum(axis=1)
        zn = (s - n) / np.sqrt(n)          # 标准化：均值 n、方差 n
        ax.hist(zn, bins=64, range=(-4, 4), density=True,
                color=FILL, edgecolor=FAINT, lw=0.4)
        ax.plot(z, phi, color=ACCENT, lw=1.7)
        ax.set_xlim(-4, 4)
        ax.set_ylim(0, 0.62 if n == 1 else 0.5)
        ax.set_title(f"$n = {n}$", fontsize=10.5)
        if n == 1:
            ax.text(1.3, 0.5, "指数分布：\n严重右偏", fontsize=9, color=SOFT)
        if n == 30:
            ax.text(1.5, 0.35, "已与 $N(0,1)$\n难以区分", fontsize=9, color=SOFT)

    fig.suptitle("中心极限定理：指数随机变量之和的标准化 $\\dfrac{S_n-n}{\\sqrt{n}}$ 趋于标准正态（橙线）",
                 fontsize=11.5, y=1.0)
    fig.tight_layout()
    save(fig, "05-02.png")


if __name__ == "__main__":
    fig_5_1()
    fig_5_2()

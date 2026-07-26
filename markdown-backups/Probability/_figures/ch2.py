# 第二章配图：二项→泊松 / 连续密度画廊 / 正态经验法则 / 分布函数
import numpy as np
import matplotlib.pyplot as plt
from math import comb, factorial, gamma as gfun
from common import (new_fig, tidy, save, INK, SOFT, FAINT, FILL,
                    ACCENT, ACCENT_FILL, COOL)

# ---------- 图 2-1 二项分布的泊松逼近 ----------
def fig_2_1():
    ks = np.arange(0, 15)
    lam = 5.0
    binom = [comb(50, int(k)) * 0.1**k * 0.9**(50 - k) for k in ks]
    poi = [np.exp(-lam) * lam**k / factorial(int(k)) for k in ks]

    fig, ax = new_fig(6.8, 3.8)
    w = 0.16
    ax.vlines(ks - w, 0, binom, color=INK, lw=2.6, label="二项 $B(50,\\ 0.1)$")
    ax.vlines(ks + w, 0, poi, color=ACCENT, lw=2.6, label="泊松 $\\mathcal{P}(5)$")
    ax.plot(ks - w, binom, "o", ms=3.4, color=INK)
    ax.plot(ks + w, poi, "o", ms=3.4, color=ACCENT)

    ax.set_xticks(ks)
    ax.set_xlabel("$k$")
    ax.set_ylabel("$P(X=k)$")
    ax.set_title("泊松定理：$n$ 大、$p$ 小、$np=\\lambda$ 时 $B(n,p)\\approx\\mathcal{P}(\\lambda)$")
    ax.legend(loc="upper right")
    ax.set_ylim(0, 0.21)
    save(fig, "02-01.png")


# ---------- 图 2-2 四个连续分布的密度 ----------
def fig_2_2():
    fig, axes = plt.subplots(2, 2, figsize=(8.6, 5.6))
    for ax in axes.flat:
        tidy(ax)

    # 均匀
    ax = axes[0, 0]
    a, b = 1.0, 4.0
    ax.plot([-0.5, a, a], [0, 0, 1 / (b - a)], color=INK, lw=1.8)
    ax.plot([a, b], [1 / (b - a)] * 2, color=INK, lw=1.8)
    ax.plot([b, b, 5.5], [1 / (b - a), 0, 0], color=INK, lw=1.8)
    ax.fill_between([a, b], 1 / (b - a), color=FILL, zorder=0)
    ax.set_xticks([a, b]); ax.set_xticklabels(["$a$", "$b$"])
    ax.set_yticks([1 / (b - a)]); ax.set_yticklabels(["$\\frac{1}{b-a}$"])
    ax.set_title("均匀 $\\mathcal{U}(a,b)$：区间内完全平等")
    ax.set_ylim(0, 0.5)

    # 指数
    ax = axes[0, 1]
    x = np.linspace(0, 5.5, 300)
    for lam, c in ((1.5, ACCENT), (0.7, INK)):
        ax.plot(x, lam * np.exp(-lam * x), color=c, lw=1.8,
                label=f"$\\lambda={lam}$")
    ax.legend()
    ax.set_title("指数 $\\mathcal{E}(\\lambda)$：无记忆的等待")
    ax.set_xlim(0, 5.5)

    # 正态
    ax = axes[1, 0]
    x = np.linspace(-5, 5, 400)
    for mu, s, c in ((0, 1, INK), (0, 1.8, ACCENT), (1.5, 0.6, COOL)):
        ax.plot(x, np.exp(-(x - mu)**2 / (2 * s * s)) / (s * np.sqrt(2 * np.pi)),
                color=c, lw=1.8, label=f"$\\mu={mu},\\ \\sigma={s}$")
    ax.legend(fontsize=8.8)
    ax.set_title("正态 $N(\\mu,\\sigma^2)$：位置由 $\\mu$、胖瘦由 $\\sigma$")

    # Gamma
    ax = axes[1, 1]
    x = np.linspace(0, 12, 400)
    for al, c in ((1, FAINT), (2, ACCENT), (5, INK)):
        beta = 1.0
        y = beta**al * x**(al - 1) * np.exp(-beta * x) / gfun(al)
        ax.plot(x, y, color=c, lw=1.8, label=f"$\\alpha={al}$")
    ax.legend()
    ax.set_title("$\\Gamma(\\alpha,1)$：$\\alpha=1$ 即指数，$\\alpha$ 大渐趋对称")

    fig.suptitle("四个基本连续分布的概率密度", y=1.0, fontsize=12)
    fig.tight_layout()
    save(fig, "02-02.png")


# ---------- 图 2-3 正态 68–95–99.7 ----------
def fig_2_3():
    fig, ax = new_fig(7.2, 3.9)
    x = np.linspace(-4, 4, 500)
    y = np.exp(-x * x / 2) / np.sqrt(2 * np.pi)
    ax.plot(x, y, color=INK, lw=1.8)

    bands = [(3, "#f6f6f6"), (2, "#e8e8e8"), (1, ACCENT_FILL)]
    for k, c in bands:
        m = np.abs(x) <= k
        ax.fill_between(x[m], y[m], color=c, zorder=0)

    for k, p, h in ((1, "68.3%", 0.30), (2, "95.4%", 0.14), (3, "99.7%", 0.045)):
        ax.annotate("", xy=(-k, h), xytext=(k, h),
                    arrowprops=dict(arrowstyle="<->", color=SOFT, lw=0.9))
        ax.text(0, h + 0.012, p, ha="center", fontsize=9.5, color=SOFT)

    ax.set_xticks(range(-4, 5))
    ax.set_xticklabels(["$-4\\sigma$", "$-3\\sigma$", "$-2\\sigma$", "$-\\sigma$",
                        "$\\mu$", "$\\sigma$", "$2\\sigma$", "$3\\sigma$", "$4\\sigma$"])
    ax.set_yticks([])
    ax.spines["left"].set_visible(False)
    ax.set_ylim(0, 0.44)
    ax.set_title("正态分布的 68–95–99.7 法则")
    save(fig, "02-03.png")


# ---------- 图 2-4 分布函数：阶梯与连续 ----------
def fig_2_4():
    fig, axes = plt.subplots(1, 2, figsize=(8.8, 3.7))
    for ax in axes:
        tidy(ax)

    # 离散：B(3, 1/2)
    ax = axes[0]
    xs = [0, 1, 2, 3]
    ps = [1 / 8, 3 / 8, 3 / 8, 1 / 8]
    F = np.cumsum(ps)
    ax.plot([-1, 0], [0, 0], color=INK, lw=1.8)
    prev = 0.0
    for i, (xk, Fk) in enumerate(zip(xs, F)):
        xr = xs[i + 1] if i + 1 < len(xs) else 4
        ax.plot([xk, xr], [Fk, Fk], color=INK, lw=1.8)
        ax.plot([xk], [Fk], "o", ms=5, color=INK, zorder=5)            # 右连续：取到
        ax.plot([xk], [prev], "o", ms=5, mfc="white", mec=INK, zorder=5)  # 左极限：取不到
        ax.vlines(xk, prev, Fk, color=FAINT, lw=0.9, ls=(0, (3, 2)))
        prev = Fk
    ax.annotate("跳跃高度 $=P(X=2)$", xy=(2, 0.68), xytext=(2.45, 0.42),
                fontsize=9.5, color=ACCENT,
                arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.0))
    ax.set_xlim(-1, 4)
    ax.set_ylim(-0.04, 1.08)
    ax.set_xticks(xs)
    ax.set_title("离散型：右连续阶梯，跳跃即单点概率")
    ax.set_xlabel("$x$")
    ax.set_ylabel("$F(x)$")

    # 连续：指数
    ax = axes[1]
    x = np.linspace(-1, 4, 300)
    F = np.where(x < 0, 0, 1 - np.exp(-x))
    ax.plot(x, F, color=INK, lw=1.8)
    ax.axhline(1, color=FAINT, lw=0.9, ls=(0, (4, 3)))
    ax.set_xlim(-1, 4)
    ax.set_ylim(-0.04, 1.08)
    ax.set_title("连续型：处处连续，$P(X=x)\\equiv 0$")
    ax.set_xlabel("$x$")

    fig.tight_layout()
    save(fig, "02-04.png")


if __name__ == "__main__":
    fig_2_1()
    fig_2_2()
    fig_2_3()
    fig_2_4()

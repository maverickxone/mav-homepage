# 第六章配图：泊松过程轨道 / 白噪声与滑动平均滤波
import numpy as np
import matplotlib.pyplot as plt
from common import (new_fig, tidy, save, INK, SOFT, FAINT, FILL,
                    ACCENT, COOL)

# ---------- 图 6-1 泊松过程的轨道 ----------
def fig_6_1():
    rng = np.random.default_rng(9)
    T = 10.0
    fig, ax = new_fig(7.2, 4.0)

    colors = [FAINT, COOL, ACCENT]
    for c in colors:
        arrivals = np.cumsum(rng.exponential(1.0, 40))
        arrivals = arrivals[arrivals <= T]
        t = np.concatenate([[0], np.repeat(arrivals, 2), [T]])
        v = np.repeat(np.arange(len(arrivals) + 1), 2)
        ax.plot(t, v, color=c, lw=1.5, zorder=3)
        if c == ACCENT:   # 标出一条轨道的到达时刻
            ax.vlines(arrivals, -0.75, -0.2, color=ACCENT, lw=1.4)

    ax.axhline(0, color=FAINT, lw=0.8)
    ax.text(0.15, -1.05, "橙色轨道的到达时刻 $S_1, S_2, \\cdots$（间隔独立、服从指数分布）",
            fontsize=9.5, color=SOFT, va="top")
    ax.set_xlim(0, T)
    ax.set_ylim(-2.0, 15)
    ax.set_xlabel("时间 $t$")
    ax.set_ylabel("计数 $N(t)$")
    ax.set_title("泊松过程（$\\lambda=1$）的三条轨道：右连续阶梯，每步恰跳 1")
    save(fig, "06-01.png")


# ---------- 图 6-2 白噪声与滑动平均 ----------
def fig_6_2():
    rng = np.random.default_rng(21)
    N = 300
    t = np.arange(N)
    signal = 1.2 * np.sin(2 * np.pi * t / 90)
    noise = rng.normal(0, 1.0, N)
    x = signal + noise

    M = 2                              # 窗宽 2M+1 = 5
    kernel = np.ones(2 * M + 1) / (2 * M + 1)
    y = np.convolve(x, kernel, mode="same")

    fig, axes = plt.subplots(2, 1, figsize=(7.4, 4.6), sharex=True)
    for ax in axes:
        tidy(ax)
        ax.set_ylim(-4, 4)

    axes[0].plot(t, x, color=SOFT, lw=0.8)
    axes[0].plot(t, signal, color=FAINT, lw=1.2, ls=(0, (4, 3)))
    axes[0].set_title("输入：信号（虚线）淹没在白噪声中", fontsize=10.5)

    axes[1].plot(t, y, color=ACCENT, lw=1.2)
    axes[1].plot(t, signal, color=FAINT, lw=1.2, ls=(0, (4, 3)))
    axes[1].set_title("输出：滑动平均（窗宽 5）滤波后，信号轮廓重现", fontsize=10.5)
    axes[1].set_xlabel("$t$")

    fig.suptitle("线性滤波抑制白噪声：噪声方差降为 $1/(2M+1)$，缓变信号几乎不受影响",
                 fontsize=11.5, y=1.0)
    fig.tight_layout()
    save(fig, "06-02.png")


if __name__ == "__main__":
    fig_6_1()
    fig_6_2()

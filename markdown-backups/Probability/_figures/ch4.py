# 第四章配图：相关系数的散点图直觉
import numpy as np
import matplotlib.pyplot as plt
from common import (tidy, save, INK, SOFT, FAINT, ACCENT, COOL)

def fig_4_1():
    rng = np.random.default_rng(11)
    n = 260
    fig, axes = plt.subplots(2, 2, figsize=(8.2, 7.6))
    for ax in axes.flat:
        tidy(ax)
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_aspect("equal")

    def scatter(ax, x, y, title, color=INK):
        r = np.corrcoef(x, y)[0, 1]
        ax.plot(x, y, "o", ms=3.2, color=color, alpha=0.55, mew=0)
        ax.set_title(f"{title}\n样本相关系数 $\\hat\\rho \\approx {r:+.2f}$",
                     fontsize=10.5)

    # 强正相关
    x = rng.normal(size=n)
    scatter(axes[0, 0], x, 0.9 * x + 0.45 * rng.normal(size=n),
            "强正线性相关")
    # 强负相关
    x = rng.normal(size=n)
    scatter(axes[0, 1], x, -0.9 * x + 0.45 * rng.normal(size=n),
            "强负线性相关")
    # 独立
    scatter(axes[1, 0], rng.normal(size=n), rng.normal(size=n),
            "独立（因而不相关）")
    # 不相关但不独立：y = x^2 - 1
    x = rng.normal(size=n)
    scatter(axes[1, 1], x, x**2 - 1 + 0.3 * rng.normal(size=n),
            "不相关，却强烈相依（$Y\\approx X^2$）", color=ACCENT)

    fig.suptitle("相关系数只探测「线性」联系：$\\rho=0$ 不等于没有关系",
                 fontsize=12, y=0.99)
    fig.tight_layout()
    save(fig, "04-01.png")


if __name__ == "__main__":
    fig_4_1()

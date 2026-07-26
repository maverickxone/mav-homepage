# 概率论精讲 · 配图视觉规范
# 黑白极简 + 单一暖色强调，对齐站点设计系统。
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

# ---- palette ----
INK = "#1a1a1a"        # 主线条 / 文字
SOFT = "#666666"       # 次要文字
FAINT = "#bbbbbb"      # 辅助线 / 边框
FILL = "#ececec"       # 区域淡填充
ACCENT = "#c45d35"     # 暖色强调（sepia 主题同源）
ACCENT_FILL = "#f3ddd3"
COOL = "#4a6e8a"       # 冷色（仅在需要第二种颜色时使用）
COOL_FILL = "#dde6ec"

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "..",
                   "Mav", "knowledge", "probability", "assets", "images")

plt.rcParams.update({
    "font.sans-serif": ["PingFang SC", "PingFang TC", "Hiragino Sans GB", "Arial Unicode MS"],
    "font.family": "sans-serif",
    "axes.unicode_minus": False,
    "font.size": 10.5,
    "axes.labelsize": 10.5,
    "axes.titlesize": 11.5,
    "xtick.labelsize": 9.5,
    "ytick.labelsize": 9.5,
    "axes.edgecolor": FAINT,
    "axes.linewidth": 0.9,
    "xtick.color": SOFT,
    "ytick.color": SOFT,
    "axes.labelcolor": INK,
    "text.color": INK,
    "axes.titlecolor": INK,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "savefig.facecolor": "white",
    "legend.frameon": False,
    "legend.fontsize": 9.5,
})


def new_fig(w=7.0, h=3.9):
    fig, ax = plt.subplots(figsize=(w, h))
    tidy(ax)
    return fig, ax


def tidy(ax):
    """统一坐标轴风格：去上右边框。"""
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.tick_params(length=3, width=0.9)
    return ax


def save(fig, name):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=170, bbox_inches="tight", pad_inches=0.12)
    plt.close(fig)
    print("  ✓", name)

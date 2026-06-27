"""Shared style for thermodynamics figures.

Design language: clean, near-monochrome to match the site's Mono black/white
look, with restrained warm/cool accents only where the physics needs them
(hot vs cold reservoir, heat absorbed vs released). White background so the
figure card stays readable under both light and dark site themes.
"""
import os
import matplotlib as mpl
import matplotlib.pyplot as plt

OUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "..", "..", "..",
    "Mav", "knowledge", "thermodynamics", "assets", "images",
)
OUT_DIR = os.path.abspath(OUT_DIR)

# Palette
INK = "#1a1a1a"      # primary lines / text
GRID = "#d8d8d8"     # faint guides
FILL = "#ececec"     # neutral shading
HOT = "#c0392b"      # high-temperature reservoir / heat absorbed
COLD = "#2c6e9e"     # low-temperature reservoir / heat released
WORK = "#1a1a1a"     # work output

mpl.rcParams.update({
    "figure.dpi": 150,
    "savefig.dpi": 150,
    "font.family": "sans-serif",
    "font.sans-serif": ["PingFang SC", "Heiti SC", "Arial Unicode MS", "DejaVu Sans"],
    "axes.unicode_minus": False,
    "mathtext.fontset": "cm",
    "axes.edgecolor": INK,
    "axes.linewidth": 1.1,
    "axes.labelcolor": INK,
    "text.color": INK,
    "xtick.color": INK,
    "ytick.color": INK,
    "font.size": 12,
})


def save(fig, name):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name)
    fig.savefig(path, bbox_inches="tight", facecolor="white", pad_inches=0.18)
    plt.close(fig)
    print("wrote", path)

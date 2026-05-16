---
title: "实战选择与术语速查"
chapter: 5
readTime: 10
description: "下载视频时该怎么选、常用术语速查表。"
---

## 场景一：用 iPad Pro 2021（11英寸）或 iPad Air 看

你的 iPad 屏幕分辨率大约是 2388×1668，不到 4K 的一半，而且是 11 英寸小屏，观看距离也近。

**推荐选项：1080P 高码率 HEVC（序号 #5）或 1080P 高码率 AV1（序号 #4）**

理由：
- 屏幕不需要 4K，1080P 已经绰绰有余
- M1 芯片支持 HEVC 和 AV1 硬件解码，播放流畅、省电
- HEVC 938 MB，AV1 2531 Mbps（注意 AV1 在这里码率反而高于 HEVC），选 HEVC 节省空间
- 若 HEVC 版本码率只有 938kbps 感觉不够，可考虑 1080P 高清 AV1（#7，883 Mbps，886 MB）

**如果是 AVC 的忠实用户：1080P 高清 AVC（#6）**，1.71GB，兼容性最好。

## 场景二：用 MateBook X Pro 看

14.2英寸屏幕，分辨率 3120×2080（3.1K），自己使用。

**推荐选项：1080P 高码率 HEVC（#5）或 4K HEVC（#1）**

- 1080P 高码率 HEVC：939 MB，画质够用，播放流畅
- 4K HEVC：3.16 GB，屏幕会缩放显示，但高码率确保了细节丰富
- 若在意文件大小：1080P AV1（#7，886MB），Intel Arc 显卡支持 AV1 硬件解码

## 场景三：外接 AOC U27U3XD（4K 144Hz 模式）看

这是唯一一个 4K 视频**真正有意义**的场景。

**推荐选项：4K AV1（#2，2.21GB）或 4K HEVC（#1，3.16GB）**

理由：
- 屏幕是原生 4K，4K 内容可以逐像素原生显示
- 2262 kbps 的 4K AV1 码率对于电影来说稍偏低，如果内容动态场景多，可能出现轻微压缩痕迹
- 4K HEVC（3228 kbps）码率更高，画质更稳定
- 不推荐 4K AVC（8327 kbps），虽然码率最高，但文件是 4K AV1 的近 4 倍，而现代 HEVC/AV1 的画质效率远高于 AVC

**音频建议：** 配合 #0 音频（M4A 323kbps），全程沉浸式体验。

## 场景四：存储空间紧张，只想快速看完

**推荐：720P HEVC（#11，310MB）或 480P AV1（#13，395MB）**

在手机或 iPad 小屏上，720P 完全足够日常观看，310MB 的文件大小非常友好。

## 选择速查表

| 观看设备 | 首选 | 备选 |
|----------|------|------|
| iPad（任何尺寸）| 1080P HEVC 或 AV1 | 1080P AVC（最兼容）|
| MateBook X Pro 2024 | 1080P HEVC 或 AV1 | 4K HEVC（追求画质）|
| MacBook Air | 1080P HEVC 或 AV1 | 1080P AVC |
| MacBook Pro | 1080P HEVC 或 AV1 | 4K HEVC |
| AOC U27U3XD（4K模式）| 4K AV1 | 4K HEVC |
| 网络差/流量有限 | 720P HEVC | 480P HEVC |


## 附录：常用术语速查表

| 术语 | 全称 | 含义 |
|------|------|------|
| PPI | Pixels Per Inch | 每英寸像素数，越高越细腻 |
| fps | Frames Per Second | 帧率，每秒多少帧画面 |
| Hz | Hertz（赫兹）| 刷新率单位，屏幕每秒刷新次数 |
| kbps | Kilobits Per Second | 码率单位，每秒千比特 |
| Mbps | Megabits Per Second | 码率单位，每秒兆比特 |
| AVC | Advanced Video Coding | H.264 编解码器 |
| HEVC | High Efficiency Video Coding | H.265 编解码器 |
| AV1 | AOMedia Video 1 | 新一代开源编解码器 |
| HDR | High Dynamic Range | 高动态范围 |
| SDR | Standard Dynamic Range | 标准动态范围 |
| nits | — | 亮度单位（尼特）|
| IPS | In-Plane Switching | 一种 LCD 面板技术，广视角 |
| OLED | Organic Light-Emitting Diode | 有机发光二极管，自发光 |
| ProMotion | — | 苹果的自适应刷新率技术 |
| LTPO | Low-Temperature Polycrystalline Oxide | 支持自适应刷新率的面板底层技术 |
| sRGB | Standard RGB | 标准色域，覆盖约 35% 人眼可见色 |
| DCI-P3 | — | 数字电影色域标准 |
| VBR | Variable Bit Rate | 可变码率 |
| CBR | Constant Bit Rate | 固定码率 |
| I-Frame | Intra-coded Frame | 关键帧，完整的一帧信息 |
| P/B-Frame | Predictive/Bi-dir Frame | 差异帧，只存储与参考帧的差异 |
| Codec | Coder-Decoder | 编解码器 |
| VPU | Video Processing Unit | 视频处理单元，硬件解码模块 |
| Upscaling | — | 上采样，低分辨率内容放大到高分辨率 |
| DCI 4K | — | 电影行业 4K 标准，4096×2160 |
| UHD 4K | — | 消费级 4K 标准，3840×2160 |
| PWM | Pulse Width Modulation | 屏幕调光方式 |
| ΔE | Delta E | 色彩误差值，越低越准确 |
| KVM | Keyboard, Video, Mouse | 一套外设控制多台电脑 |


## 后记：关于"够用"与"更好"

学完这些技术知识，你可能会开始对自己的设备屏幕不满意——"MateBook 不是 4K！Air 才 60Hz！iPad Pro 分辨率不够高！"

但请记住：**技术规格是为使用服务的，不是为参数而存在的。**

264 PPI 的屏幕，在正常使用距离下，人眼无法分辨单个像素——更高的 PPI 只是数字更好看。60Hz 的屏幕，用于看文档、写代码、浏览网页，和 120Hz 的差别肉眼难以察觉。1080P 的视频，在 13 英寸的屏幕上，配合高码率和良好的编解码，完全是精彩的视觉享受。

真正重要的是：
- 选择你的**设备**能流畅解码的格式
- 选择**码率**足够高的版本（而不是只看分辨率标签）
- 在**合适的设备**上观看对应分辨率的内容
- 享受内容本身，而不是数字游戏

希望这本小书，能让你在下次面对下载列表时，心里有一把清晰的尺子。


*本书写于 2026 年 4 月，所有硬件规格核查至 2025-2026 年。*  
*如有疑问或想深入某个话题，随时可以继续探讨。*

---
title: "快与慢：PDF 阅读器的架构"
chapter: 5
readTime: 20
description: "Sumatra 为什么秒开，WPS 为什么卡 5 秒，浏览器又是怎么做到的——拆解不同 PDF 渲染引擎的设计决策。"
---

## 5.1 打开一份 PDF 需要做什么

### 5.1.1 渲染管线

当你双击一份 PDF 文件，阅读器内部的工作流程大致如下：

```
文件加载 → 解析结构 → 定位目标页 → 解码资源 → 执行绘图指令 → 栅格化 → 显示
```

每个步骤都有可能成为瓶颈：

| 步骤 | 做什么 | 可能的瓶颈 |
|------|--------|------------|
| 文件加载 | 读取文件到内存或 mmap | 大文件 + 机械硬盘 |
| 解析结构 | 读 xref、trailer、page tree | 非线性化文件需全部读入 |
| 定位目标页 | 找到第一页的对象 | Page tree 层级深 |
| 解码资源 | 解压字体、图片流 | 大量高分辨率图片 |
| 执行绘图指令 | 解释内容流操作符 | 复杂的透明度/混合 |
| 栅格化 | 矢量→像素位图 | 高分辨率 + 复杂曲线 |
| 显示 | 位图传输到屏幕 | GPU 合成 |

### 5.1.2 一个数量级的差异

同一份 200 页的学术论文 PDF（约 15MB），在不同阅读器上打开第一页的时间：

| 阅读器 | 首页时间 | 翻页延迟 |
|--------|----------|----------|
| Sumatra PDF | <0.3s | 即时 |
| Firefox (PDF.js) | ~1s | 轻微延迟 |
| Chrome (PDFium) | ~0.5s | 即时 |
| Adobe Acrobat | ~2s | 轻微延迟 |
| WPS Office | 3-6s | 明显延迟 |
| Foxit Reader | ~1s | 即时 |

为什么差异可以达到 10-20 倍？答案在架构设计哲学。

---

## 5.2 MuPDF / Sumatra：极致的轻量

### 5.2.1 设计哲学

Sumatra PDF 的核心渲染引擎是 **MuPDF**（由 Artifex Software 开发，同一家公司也维护 Ghostscript）。MuPDF 的设计目标只有一个词：**fast**。

它的架构特点：

1. **纯 C 实现**：没有 C++ 的虚函数开销，没有 OOP 抽象层，接近裸金属性能
2. **零依赖启动**：不加载插件、不初始化 JavaScript 引擎、不连网检查更新
3. **按需加载**：只解码当前页需要的资源，不预加载全部字体和图片
4. **自己的字体渲染器**：不依赖系统字体渲染管线（如 Windows 的 DirectWrite），避免了 API 调用开销
5. **内存映射（mmap）**：大文件不全部读入内存，而是映射到虚拟地址空间，由操作系统按需加载

### 5.2.2 为什么 Sumatra 秒开

让我们追踪 Sumatra 打开一份 PDF 的精确流程：

```
1. mmap 文件（<1ms）
2. 读文件末尾找 startxref（<1ms）
3. 解析 xref 表，建立对象索引（~5ms for 200 pages）
4. 找到 Page 1 对象，读取其资源引用（<1ms）
5. 解压 Page 1 的内容流（~2ms）
6. 执行绘图指令，渲染为位图（~10ms）
7. 显示（<1ms）
```

总计约 20ms。人眼感知不到任何延迟。

关键在于**步骤 4 只加载第一页需要的东西**。即使整份 PDF 有 500 个嵌入图片、20 种字体，Sumatra 此刻只关心第一页用到的那几个对象。

### 5.2.3 代价是什么

MuPDF / Sumatra 的速度是有代价的：

- **功能极少**：不能编辑、不能填表单、注释功能有限
- **JavaScript 不支持**：含有 JS 交互的 PDF 表单在 Sumatra 里是"死"的
- **渲染精度偏差**：某些复杂的透明度混合和色彩管理场景，MuPDF 的结果与 Acrobat 有细微差异
- **无辅助功能**：不支持 Tagged PDF 的语义导航（屏幕阅读器无法使用）

对于"只想快速看一份论文"的场景，这些代价完全可以接受。

---

## 5.3 Adobe Acrobat：为什么"亲爹"反而慢

### 5.3.1 功能即负担

Adobe Acrobat 不只是一个 PDF 阅读器——它是一个完整的 PDF 平台：

- JavaScript 引擎（支持 PDF 中的交互脚本）
- 表单填写和验证（AcroForm + XFA）
- 数字签名验证（需要联网检查证书吊销列表）
- 辅助功能（Tagged PDF 语义树解析）
- 插件系统
- 云服务连接（Adobe Document Cloud）
- 3D 内容渲染（U3D/PRC 格式）

启动 Acrobat 时，这些子系统都要初始化——即使你打开的只是一份纯文本 PDF，完全用不到它们。

### 5.3.2 启动流程对比

```
Sumatra 启动：
  加载 exe → mmap PDF → 渲染第一页 → 显示
  总计 ~200ms

Acrobat 启动：
  加载 exe → 初始化 COM/OLE → 加载插件（10+ 个 DLL）
  → 检查许可证 → 初始化 JavaScript 引擎 → 初始化辅助功能
  → 连接云服务 → 解析 PDF → 检查安全策略 → 渲染第一页 → 显示
  总计 2000-5000ms
```

### 5.3.3 WPS 为什么更慢

WPS Office 打开 PDF 的延迟通常比 Acrobat 还高。原因更复杂：

1. **PDF 不是 WPS 的核心功能**：WPS 主要是文字处理器，PDF 阅读是附带功能。它的 PDF 渲染器不如专业阅读器优化。
2. **格式转换预处理**：WPS 可能在打开时就尝试"理解"PDF 的文档结构（段落、表格等），为编辑功能做准备。这种预处理远比纯渲染耗时。
3. **UI 框架开销**：WPS 的 UI 是一个完整的 Office 套件界面，初始化比轻量阅读器重得多。
4. **全量字体扫描**：WPS 可能在启动时扫描系统所有字体以建立字体匹配表。

---

## 5.4 浏览器中的 PDF：两条路径

### 5.4.1 Chrome / Edge：PDFium

Chrome 内置的 PDF 引擎叫 **PDFium**——最初是 Foxit Software 的代码，被 Google 收购后开源（BSD 许可证）。

PDFium 的特点：
- C/C++ 实现，性能好
- 作为 Chromium 的一部分，在沙箱（sandbox）中运行——即使 PDF 有恶意代码也无法逃逸
- 支持基本的表单填写和注释
- 不支持 XFA 表单（Chrome 108 后移除了 XFA 支持）

当你在 Chrome 里打开一个 PDF URL 时，Chrome 不是下载完再渲染——它利用 HTTP Range Request 实现**流式渲染**：先下载文件头部和 xref，渲染第一页，后续页面按需下载。

### 5.4.2 Firefox：PDF.js

Firefox 走了一条完全不同的路——用 **JavaScript** 实现 PDF 渲染。这个项目叫 **PDF.js**，由 Mozilla 开发，是目前最著名的 JavaScript PDF 库。

```javascript
// PDF.js 的核心 API（简化版）
const pdf = await pdfjsLib.getDocument('example.pdf').promise;
const page = await pdf.getPage(1);

const viewport = page.getViewport({ scale: 1.5 });
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

canvas.height = viewport.height;
canvas.width = viewport.width;

await page.render({
  canvasContext: context,
  viewport: viewport
}).promise;
```

PDF.js 把 PDF 的绘图指令翻译成 Canvas 2D API 调用，让浏览器的 Canvas 渲染器来最终完成像素输出。

**为什么用 JavaScript 实现？**

1. **安全**：JavaScript 运行在浏览器沙箱中，天然隔离。不需要额外的安全机制来防止恶意 PDF。
2. **跨平台**：一份代码在所有平台运行——桌面、移动、甚至 Web Worker。
3. **可嵌入**：任何网站都可以引入 PDF.js 实现 PDF 预览，不依赖本地安装。

代价当然是性能——JavaScript 比原生 C/C++ 慢 5-10 倍。对于简单文档这不明显，但对于包含上百张高分辨率图片的扫描件，PDF.js 会明显吃力。

### 5.4.3 性能对比实验

用一份 50MB 的扫描版教材（300 DPI，200 页）做基准测试：

| 指标 | PDFium (Chrome) | PDF.js (Firefox) | MuPDF (Sumatra) |
|------|-----------------|-------------------|-----------------|
| 首页渲染 | 0.4s | 1.2s | 0.2s |
| 翻到第 100 页 | 0.3s | 0.8s | 0.1s |
| 内存占用 | ~150MB | ~250MB | ~80MB |
| 缩放到 200% | 即时 | 0.5s 延迟 | 即时 |

PDF.js 在各项指标上都比原生方案慢 2-5 倍，但对于日常使用依然在可接受范围内——毕竟大多数人打开的不是 50MB 扫描件。

---

## 5.5 移动端：不同的约束

### 5.5.1 iOS：内置的极致优化

Apple 的 iOS 内置了 Core Graphics 框架中的 PDF 渲染器（历史上和 macOS 的 Quartz 共享代码）。有趣的冷知识：macOS 的显示服务器 Quartz 在内部使用的就是 PDF 成像模型——窗口内容的合成基于和 PDF 相同的绘图模型。

iOS 上的 PDF 渲染特点：
- 系统级优化，利用 GPU 加速
- 使用 tiled rendering（分块渲染）——先显示低分辨率全貌，再逐块加载高清细节
- 内存限制严格（iOS 会杀死占用过多内存的 app），所以必须分块处理大页面

### 5.5.2 Android：混乱的生态

Android 从 5.0 开始有系统级的 PdfRenderer API（基于 PDFium），但功能极其有限——只能渲染页面为 Bitmap，不支持文字选择、链接点击等交互。

结果是 Android 上的 PDF 阅读体验高度依赖第三方 app。Google Drive 的 PDF 预览、各厂商的"文档查看器"、第三方 app 各有各的渲染器和优化策略，体验参差不齐。

---

## 5.6 渲染优化技巧

### 5.6.1 阅读器常用的性能优化

1. **预渲染相邻页**：当你在看第 5 页时，后台渲染第 4、6 页。翻页时直接显示已渲染的缓存。

2. **多分辨率渲染**：先快速渲染一个低分辨率版本显示给用户（"模糊预览"），再异步渲染高清版本替换。

3. **分块渲染（tiling）**：把页面分成若干小块（如 256×256 像素），只渲染当前可见区域的块。缩放和平移时按需加载新块。

4. **字体缓存**：首次解码字体后缓存字形位图。同一字体同一字号的字母只需渲染一次。

5. **Display List 缓存**：把内容流解析为中间表示（display list），翻回已看过的页面时不需要重新解析内容流。

### 5.6.2 为什么有些 PDF "天生"渲染慢

不是阅读器的问题——有些 PDF 的**内容本身**就对渲染器不友好：

| 情况 | 为什么慢 |
|------|----------|
| 大量透明度混合 | 需要逐层从后往前合成 |
| 超高分辨率图片 | 解码 + 缩放到屏幕分辨率 |
| 复杂的裁剪路径 | 每个像素都要判断是否在路径内 |
| Type 3 字体 | 每个字符都是一小段绘图指令，不能批量渲染 |
| 数千个小对象 | 对象寻址和流解码的开销累积 |
| 超大页面尺寸 | 海报/工程图纸可能是 A0 甚至更大 |

如果你遇到一份"所有阅读器都打开慢"的 PDF，通常不是阅读器的问题，而是 PDF 本身的结构或内容造成的。

---

## 5.7 你应该用什么阅读器？

这不是一个有唯一答案的问题。取决于你的需求：

| 需求 | 推荐 |
|------|------|
| 只想快速看论文/电子书 | Sumatra PDF（Windows）/ Skim（macOS） |
| 需要填表单、加注释 | Adobe Acrobat / Foxit |
| Web 端在线预览 | PDF.js（开源、可嵌入） |
| 需要验证数字签名 | Adobe Acrobat（行业标准） |
| 批量处理/脚本 | MuPDF 命令行工具 / qpdf / Ghostscript |
| 安全性优先 | 浏览器内置（沙箱隔离） |

对于大多数人——只是平常看看课件和论文——Sumatra PDF 是 Windows 上最好的选择。启动快、占资源少、不弹广告、不联网。macOS 上 Preview.app 已经足够好。

---
title: "生成一份 PDF 有多少种路径"
chapter: 6
readTime: 23
description: "Word、LaTeX、Typst、HTML→PDF——不同的生成方式产出结构完全不同的 PDF，有些对机器友好，有些是灾难。"
---

## 6.1 PDF 生成的两大阵营

### 6.1.1 "所见即所得" vs "标记语言"

生成 PDF 的工具大致分为两类：

**WYSIWYG 类（所见即所得）：**
- Microsoft Word / WPS / LibreOffice
- Adobe InDesign
- Google Docs → 导出
- macOS Pages

**标记语言类：**
- LaTeX (pdflatex / xelatex / lualatex)
- Typst
- HTML → PDF（Puppeteer / WeasyPrint / Prince）
- Markdown → PDF（Pandoc）

两类工具生成的 PDF 在内部结构上可能完全不同——即使最终看起来一模一样。这对后续的文字提取、搜索、无障碍访问都有深远影响。

### 6.1.2 一个类比

WYSIWYG 工具像是"画家"——用户在画布上直接操作视觉元素，软件把最终画面"拍照"导出为 PDF。

标记语言工具像是"作曲家"——用户写下"乐谱"（源代码），编译器按照严格的规则"演奏"出最终结果。

画家的优势是所见即所得、学习门槛低；作曲家的优势是可复现、可版本控制、排版质量通常更高。

---

## 6.2 Word / WPS 的路径：打印驱动模型

### 6.2.1 它不是"导出"，是"打印"

当你在 Word 中点"另存为 PDF"或"导出为 PDF"时，Word 内部做的事情本质上是：**假装在打印，把打印输出拦截下来写进文件**。

```
Word 文档模型 → 排版引擎 → 打印 API → PDF Writer（虚拟打印机）→ .pdf
```

这就是所谓的 **GDI/打印驱动模型**。Word 调用 Windows 的打印接口（GDI 或 XPS），PDF 生成器在底层拦截这些绘图指令，翻译成 PDF 内容流。

### 6.2.2 这意味着什么

因为走的是"打印"路径，Word 生成的 PDF 有几个特征：

1. **丢失语义结构**：Word 内部知道"这是标题""这是列表项""这是表格"，但打印 API 只传递"在哪画什么"。最终 PDF 里没有语义标记（除非额外开启 Tagged PDF 选项）。

2. **文字顺序依赖排版引擎**：Word 按照自己的渲染顺序输出文字——通常是从上到下、从左到右，但对于文本框、浮动图片周围的环绕文字，顺序可能和视觉阅读顺序不一致。

3. **字体处理**：Word 会进行字体子集嵌入，通常做得比较规范——Microsoft 在这方面有丰富经验。

4. **图片质量**：Word 默认会压缩嵌入的图片。如果你在 Word 里插入了一张 4000×3000 的照片，导出 PDF 时可能被下采样到 220 DPI。

### 6.2.3 Word 的 Tagged PDF 选项

从 Word 2010 开始，"另存为 PDF"对话框里有一个选项："ISO 19005-1 兼容(PDF/A)"和一个复选框"创建书签使用 标题"。

更重要的是"选项"按钮里的"文档结构标记"——开启后，Word 会在 PDF 中嵌入 **Tag Tree（标记树）**，保留标题层级、段落、列表、表格等语义信息。

```
% Tagged PDF 中的结构树（简化）
/StructTreeRoot
  └── /Document
       ├── /H1 "Chapter 1: Introduction"
       ├── /P  "This is the first paragraph..."
       ├── /L  (List)
       │    ├── /LI /Lbl "1." /LBody "First item"
       │    └── /LI /Lbl "2." /LBody "Second item"
       └── /Table
            ├── /TR /TH "Name" /TH "Age"
            └── /TR /TD "Alice" /TD "25"
```

Tagged PDF 是无障碍访问（Accessibility）的基础——屏幕阅读器依赖标记树来确定阅读顺序和内容结构。它也让文字提取变得容易得多。

但大多数人不知道这个选项，或者不开启它。

---

## 6.3 LaTeX 的路径：三十年的历史包袱

### 6.3.1 TeX → DVI → PDF 的历史链

Donald Knuth 在 1978 年发明 TeX 时，PDF 还不存在。TeX 的原生输出格式是 **DVI（DeVice Independent）**——一种设备无关的中间格式，需要进一步转换才能打印。

历史上的 LaTeX → PDF 路径：

```
1980s: LaTeX → DVI → 打印机（通过 dvi 驱动）
1990s: LaTeX → DVI → PostScript（dvips）→ PDF（Distiller/ps2pdf）
2000s: LaTeX → PDF（pdfTeX 直接输出）
2010s: XeLaTeX / LuaLaTeX → PDF（支持 Unicode 和现代字体）
```

**pdfTeX** 在 1996 年由 Hàn Thế Thành 开发，第一次让 TeX 直接输出 PDF 而不需要经过 DVI/PostScript 中转。这是一个巨大的进步。

### 6.3.2 为什么 LaTeX 编译"特别麻烦"

LaTeX 编译慢和容易出错，有几个结构性原因：

1. **多遍编译**：交叉引用（`\ref`）、目录、参考文献需要多次编译才能解析。典型流程：
   ```bash
   pdflatex main.tex    # 第一遍：生成 .aux 文件
   bibtex main          # 处理参考文献
   pdflatex main.tex    # 第二遍：解析引用
   pdflatex main.tex    # 第三遍：确保页码稳定
   ```

2. **宏展开**：LaTeX 本质上是宏语言，每个命令都是文本替换。复杂的宏包（如 TikZ 画图）可能在内存中展开成数万行中间代码。

3. **字体系统陈旧**：传统 pdflatex 使用 8-bit 字体编码，不原生支持 Unicode。想用中文？需要 `ctex` 宏包 + XeLaTeX/LuaLaTeX + 额外配置。

4. **错误信息晦涩**：TeX 的错误报告来自 1978 年的设计，对现代用户极不友好。一个漏掉的 `}` 可能导致几百行不知所云的错误输出。

### 6.3.3 LaTeX 生成的 PDF 质量

尽管编译麻烦，LaTeX 生成的 PDF 在排版质量上通常是最好的：

- **数学公式**：Computer Modern 字体 + TeX 的数学排版算法是行业黄金标准
- **断行算法**：TeX 的段落断行使用动态规划（Knuth-Plass 算法），考虑整段文字而非逐行贪心，避免"河流"（连续行间对齐的空白）
- **Microtypography**：pdfTeX 支持字符伸缩（character protrusion）和字体展宽（font expansion），让边缘对齐更美观

但 LaTeX PDF 的文字提取质量参差不齐：
- 数学公式通常用特殊字体，ToUnicode 映射可能不完整
- 连字符断词的单词在内容流中是分开的
- 某些宏包（如 `pstricks`）生成的图形可能嵌入为不可搜索的图片

---

## 6.4 Typst：现代的答案

### 6.4.1 为什么 Typst 编译快

Typst（2023 年发布）是 LaTeX 的现代替代品，由两个德国研究生用 Rust 开发。它的编译速度比 LaTeX 快一到两个数量级，原因是：

1. **增量编译**：只重新处理改变的部分，不需要每次从头编译整个文档
2. **单遍编译**：不需要多次 pass，交叉引用在一次编译中解析（通过延迟求值）
3. **现代架构**：Rust 实现 + 高效的内存管理，无历史包袱
4. **内置字体支持**：原生 Unicode + OpenType，不需要额外的字体配置

```typst
// Typst 的源码——比 LaTeX 简洁得多
= Introduction

This is a paragraph with *emphasis* and a citation @knuth1984.

$ integral_0^infinity e^(-x^2) dif x = sqrt(pi) / 2 $
```

编译到 PDF 的时间：

| 文档 | LaTeX (pdflatex) | Typst |
|------|------------------|-------|
| 10 页论文 | ~2s | ~0.1s |
| 200 页书 | ~15s | ~1s |
| 增量编辑（改一行） | ~2s（全量重编译） | ~20ms |

### 6.4.2 Typst 生成的 PDF 结构

Typst 的 PDF 后端设计考虑了现代需求：

- **完整的 ToUnicode 映射**：所有字符（包括数学符号）都有正确的 Unicode 映射
- **合理的内容流顺序**：文字按阅读顺序输出
- **字体子集化**：自动且正确
- **PDF 元数据**：自动嵌入标题、作者、创建时间等

但截至 2026 年，Typst 还不支持 Tagged PDF 输出——这意味着它生成的 PDF 对屏幕阅读器不够友好。这是一个已知的待开发特性。

### 6.4.3 Typst vs LaTeX：PDF 质量对比

| 维度 | LaTeX | Typst |
|------|-------|-------|
| 数学排版质量 | ★★★★★ | ★★★★☆ |
| 文字提取友好度 | ★★★☆☆ | ★★★★★ |
| 编译速度 | ★★☆☆☆ | ★★★★★ |
| 生态/模板丰富度 | ★★★★★ | ★★★☆☆ |
| 字体灵活性 | ★★★★☆（XeLaTeX） | ★★★★★ |
| 无障碍（Tagged PDF） | ★★★☆☆（需配置） | ★★☆☆☆（待开发） |

---

## 6.5 HTML → PDF：Web 技术的路径

### 6.5.1 为什么有人要从 HTML 生成 PDF

- **发票/报表系统**：后端生成 HTML 模板，填入数据，转成 PDF 发送给用户
- **电子书/文档网站**：把 Web 内容导出为可离线阅读的 PDF
- **简历/名片**：用 CSS 排版，导出 PDF 打印

### 6.5.2 主流方案对比

| 工具 | 原理 | 优势 | 劣势 |
|------|------|------|------|
| Puppeteer / Playwright | 启动无头 Chrome，调用浏览器打印功能 | CSS 兼容性最好 | 需要完整 Chromium，资源重 |
| WeasyPrint | Python 实现的 CSS 渲染引擎 | 轻量、纯 Python | CSS 支持不完整（无 flexbox/grid） |
| Prince | 商业级 CSS→PDF 引擎 | 质量最好、支持 CSS Paged Media | 昂贵（$3800 服务器许可证） |
| wkhtmltopdf | 基于旧版 WebKit | 曾经很流行 | 已停止维护，不推荐 |

### 6.5.3 Puppeteer 方式的原理

```javascript
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto('https://example.com/invoice');
await page.pdf({
  path: 'invoice.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
});

await browser.close();
```

本质上就是让 Chrome 打开网页 → 调用"打印为 PDF"功能。优点是 CSS 兼容性完美（毕竟用的是真正的 Chrome 渲染引擎），缺点是需要启动一个完整的 Chromium 实例。

### 6.5.4 CSS Paged Media：为打印而生的 CSS

CSS 有一套专门为分页媒体设计的规范（`@page` 规则），可以控制：

```css
@page {
  size: A4;
  margin: 2cm;
  
  @top-center {
    content: "Chapter " counter(chapter);
  }
  
  @bottom-right {
    content: counter(page);
  }
}

h1 {
  page-break-before: always;  /* 每个 h1 前强制分页 */
}

table {
  page-break-inside: avoid;   /* 表格不跨页 */
}
```

Prince 和 WeasyPrint 对 CSS Paged Media 的支持较好，Puppeteer 则只支持最基本的 `@page` 规则。

---

## 6.6 "打印驱动" vs "原生 PDF"：生成方式对 PDF 质量的影响

### 6.6.1 两种根本不同的生成策略

```
打印驱动模式：
  文档内部模型 → 渲染为绘图指令 → 拦截绘图指令 → 转为 PDF 内容流

原生 PDF 模式：
  文档内部模型 → 直接构造 PDF 对象（页面、字体、元数据）→ 写入文件
```

原生 PDF 模式可以保留更多元信息（结构标记、大纲、链接的精确目标），因为生成器直接控制 PDF 的对象结构。打印驱动模式相当于通过"视觉降级"来生成 PDF——先把一切变成绘图指令，再从绘图指令重建 PDF，中间不可避免地丢失语义。

### 6.6.2 不同工具生成的 PDF 内部差异

同一份文档"Hello World + 一张图片 + 一个表格"，由不同工具生成：

```
Word 导出:
  - 6 个字体对象（Windows 系统字体子集）
  - 图片用 DCTDecode（JPEG）
  - 无结构标记（默认）或简单标记树
  - 内容流按视觉位置排序

LaTeX (pdflatex):
  - 3 个字体对象（Computer Modern 子集）
  - 图片用 FlateDecode（PNG→deflate）
  - 无结构标记
  - 内容流严格按文档源码顺序

Typst:
  - 2 个字体对象（现代字体子集）
  - 图片保持原始编码
  - 完整 ToUnicode
  - 内容流按阅读顺序

HTML (Puppeteer):
  - 大量字体对象（Web 字体子集）
  - 图片用 DCTDecode
  - 有基本结构标记
  - 内容流可能碎片化（CSS 布局导致）
```

---

## 6.7 实用建议：生成"好"PDF 的原则

1. **嵌入字体**：无论用什么工具，确保字体被嵌入（至少子集嵌入）。这是跨平台一致显示的基础。

2. **开启 Tagged PDF**：如果工具支持（Word、InDesign），开启结构标记。这对无障碍和文字提取都有帮助。

3. **图片分辨率要匹配用途**：屏幕阅读 150 DPI 够了，打印需要 300 DPI。不要嵌入 600 DPI 的原图——文件体积和渲染速度都会受影响。

4. **用原生导出而非虚拟打印机**：如果工具提供"导出为 PDF"选项，优先使用它而不是"打印到 PDF"——前者通常生成质量更高的 PDF。

5. **线性化**：如果 PDF 主要在 Web 上分发，用 `qpdf --linearize` 处理一下，让浏览器能边下边看。

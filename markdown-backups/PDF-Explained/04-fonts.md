---
title: "字体的战争与嵌入"
chapter: 4
readTime: 22
description: "Type 1、TrueType、OpenType 三十年混战，字体子集化与 CMap 映射，以及乱码的根本原因。"
---

## 4.1 为什么字体是 PDF 的核心难题

### 4.1.1 一个简单的思想实验

你在自己电脑上用"霞鹜文楷"字体写了一份文档，导出为 PDF，发给朋友。朋友的电脑上没装这个字体。

问题来了：朋友打开这份 PDF 时，看到的是什么？

答案取决于 PDF 生成器做了什么：

- **嵌入了字体**：朋友看到的和你完全一样。PDF 里自带了字体数据。
- **只嵌入了字体子集**：用到的字都正常显示，但如果阅读器想用这个字体渲染其他字符（比如表单输入）就没有了。
- **没嵌入字体**：阅读器尝试用系统字体替代。运气好的话字形差不多，运气不好就面目全非。

**字体嵌入**是 PDF 实现"跨平台视觉一致"承诺的关键机制。没有它，PDF 和 HTML 一样——显示效果取决于接收端有什么字体。

### 4.1.2 字体文件有多大？

这也是字体嵌入不能"无脑全嵌"的原因：

| 字体 | 完整文件大小 |
|------|-------------|
| 英文字体（Inter Regular） | ~300 KB |
| 中文字体（思源黑体 Regular） | ~8 MB |
| 日文字体（Noto Sans JP） | ~5 MB |
| 数学字体（STIX Two Math） | ~1 MB |

一份中文文档如果嵌入完整的中文字体，文件大小瞬间增加 8MB+。这就是为什么**子集化（subsetting）**是中日韩 PDF 的标配——只嵌入文档中实际用到的字形。

---

## 4.2 字体格式的三十年战争

### 4.2.1 Type 1：Adobe 的先手

1984 年，Adobe 随 PostScript 一起推出了 **Type 1** 字体格式。它用三次贝塞尔曲线描述字形轮廓，配合 "hint" 机制在低分辨率设备上优化显示。

Type 1 是 PostScript（因此也是早期 PDF）的原生字体格式。Adobe 最初把 Type 1 的规范保密，只有付费授权的字体厂商才能制作 Type 1 字体。这引发了整个行业的愤怒。

### 4.2.2 TrueType：Apple 和 Microsoft 的反击

1991 年，Apple 设计、Microsoft 参与推广的 **TrueType** 字体格式问世。这是对 Adobe Type 1 垄断的直接反击。

TrueType 的技术特点：
- 使用**二次贝塞尔曲线**（而非 Type 1 的三次贝塞尔）描述轮廓
- 内置一个**字节码解释器**（hinting 虚拟机）来精确控制像素级渲染
- 完全开放的规范

二次 vs 三次贝塞尔曲线的区别：

```
三次贝塞尔（Type 1 / CFF）：
  4 个控制点 → 更少的点就能描述复杂曲线
  B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃

二次贝塞尔（TrueType）：
  3 个控制点 → 需要更多点，但计算更快
  B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
```

二次曲线计算更快（少一次乘法），但表达能力略弱——一条三次曲线可能需要两条二次曲线才能近似。这是当年硬件性能有限时的工程权衡。

### 4.2.3 Hinting：让字在小字号下依然清晰

在 300 DPI 打印机上，12 号字的一个字母大概有 50 像素高，轮廓曲线可以精确渲染。但在 96 DPI 的屏幕上，同样的字只有 16 像素高——曲线必须"卡"到像素网格上，否则会模糊或变形。

**Hinting** 就是一组指令，告诉渲染器在低分辨率下如何调整字形：

- 确保笔画对齐到像素边界
- 保证字母 'H' 的两根竖线一样粗（即使原始坐标有微小差异）
- 防止字母 'e' 的中间空隙在小字号下消失

TrueType 的 hinting 是一门完整的字节码语言（图灵完备的！），可以编写极其精细的调整规则。这也是为什么 Windows 上的字体在小字号下通常比 macOS 更锐利——Windows 严格执行 TrueType hinting，而 macOS 选择忽略大部分 hint 以保持"曲线真实性"。

### 4.2.4 OpenType：大一统

1996 年，Microsoft 和 Adobe 联手推出 **OpenType** 格式。它本质上是一个容器：

- 可以包含 TrueType 轮廓（`.ttf` 后缀）
- 也可以包含 CFF/Type 1 轮廓（`.otf` 后缀）
- 统一的元数据格式（命名、分类、支持的语言等）
- 高级排版特性（连字、小型大写字母、上下文替换等）

OpenType 结束了 Type 1 vs TrueType 的战争，成为今天的通用标准。你电脑上安装的字体，绝大多数都是 OpenType 格式。

---

## 4.3 PDF 中的字体嵌入

### 4.3.1 嵌入的三种级别

| 级别 | 文件体积 | 适用场景 |
|------|----------|----------|
| 完整嵌入 | 大（中文 8MB+） | 需要编辑 PDF 中的文字 |
| 子集嵌入 | 小（通常 50-200KB） | 只需要显示，不需要编辑 |
| 不嵌入 | 无额外开销 | 仅引用系统字体名 |

子集化的原理：扫描文档中用到了哪些字符，只把这些字符的字形数据打包进 PDF。比如一份中文文档用了 800 个不同的汉字，子集化后只嵌入 800 个字形而不是全部 6700+ 个。

子集化字体在 PDF 中的名字通常有前缀标记：`ABCDEF+SimSun`——加号前面的 6 个随机大写字母表明这是一个子集。

### 4.3.2 PDF 中的字体对象

```
5 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /BCDEAA+Times-Roman
   /FirstChar 32
   /LastChar 122
   /Widths [250 333 408 500 ...]
   /FontDescriptor 6 0 R
   /Encoding /WinAnsiEncoding
   /ToUnicode 7 0 R
>>
endobj
```

关键字段：
- `/BaseFont`：字体名（带子集前缀）
- `/Widths`：每个字符的宽度数组（用于文字定位）
- `/FontDescriptor`：指向字体描述（含嵌入的字体数据流）
- `/Encoding`：字符编码方案
- `/ToUnicode`：CMap 映射表（glyph → Unicode）

### 4.3.3 字体描述符和嵌入数据

```
6 0 obj
<< /Type /FontDescriptor
   /FontName /BCDEAA+Times-Roman
   /Flags 34
   /FontBBox [-168 -281 1000 924]
   /ItalicAngle 0
   /Ascent 683
   /Descent -217
   /CapHeight 662
   /StemV 87
   /FontFile 8 0 R          % Type 1 嵌入数据
   % 或 /FontFile2 8 0 R    % TrueType
   % 或 /FontFile3 8 0 R    % CFF/OpenType
>>
endobj
```

`/FontFile`（或 FontFile2、FontFile3）指向一个 stream 对象，里面就是字体的二进制数据。

---

## 4.4 CMap 与 ToUnicode：从字形到字符

### 4.4.1 编码的多层映射

PDF 中从"内容流里的字节"到"屏幕上的字形"再到"可提取的 Unicode 字符"，要经过多层映射：

```
内容流字节 → Encoding → Character Code → CMap → Glyph ID → 字形渲染
                                             ↓
                              ToUnicode → Unicode 码点 → 文字提取
```

这个链条中任何一环断裂，都会导致文字提取失败。

### 4.4.2 一个 ToUnicode CMap 的示例

```
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
5 beginbfchar
<0003> <0020>    % glyph 3 → U+0020 (空格)
<0010> <0048>    % glyph 16 → U+0048 (H)
<0011> <0065>    % glyph 17 → U+0065 (e)
<0012> <006C>    % glyph 18 → U+006C (l)
<0013> <006F>    % glyph 19 → U+006F (o)
endbfchar
endcmap
```

这张表明确声明了：字体中的 glyph 16 对应 Unicode 字符 'H'。有了这张表，阅读器才能在你复制文字时正确还原。

### 4.4.3 CJK 字体的特殊挑战

中日韩字体（CJK fonts）带来了额外复杂性：

1. **字符集巨大**：一个中文字体可能包含 27,000+ 字形，编码空间从单字节变为双字节（CIDFont）
2. **预定义 CMap**：PDF 规范预定义了多个 CJK CMap（如 `UniGB-UCS2-H` 对应 GB 编码的中文），阅读器必须内置这些映射
3. **竖排文字**：中文和日文有竖排模式，需要不同的 CMap（`-V` 后缀表示竖排）和不同的字形宽度/偏移

```
% CIDFont 字体对象（中文）
<< /Type /Font
   /Subtype /CIDFontType2
   /BaseFont /ABCDEF+SimSun
   /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 5 >>
   /W [1 [277] 17 [556 556 556]]    % 字宽数组（CID → 宽度）
   /DW 1000                          % 默认宽度（全角）
>>
```

---

## 4.5 乱码的根本原因

### 4.5.1 乱码分类

| 症状 | 原因 | 常见来源 |
|------|------|----------|
| 方块（□□□） | 字体未嵌入且系统无对应字体 | 旧版生成器、非标准字体 |
| 乱字符（Ã©Â±） | 编码解释错误 | UTF-8/GBK 混淆 |
| 空白/不可选 | 无 ToUnicode 且使用自定义编码 | 数学公式字体 |
| 字形错位 | CMap 映射错误 | 子集化 bug |
| 所有字体都变成同一种 | 字体名冲突（多个嵌入字体同名） | 合并 PDF 时 |

### 4.5.2 最常见的场景：没有嵌入字体的中文 PDF

2000 年代初的中文 PDF 经常不嵌入字体——因为完整的中文字体太大了（8-16MB），而当时的带宽和存储都很有限。PDF 里只记录字体名 "SimSun"，指望接收端有这个字体。

在 Windows 上打开通常没问题（系统自带宋体）。但到了 macOS 或 Linux，没有 SimSun，阅读器用替代字体渲染——笔画粗细不对、间距不对、甚至有些字显示不出来。

现代 PDF 生成器几乎都会做子集嵌入，这个问题已经少多了。但历史遗留的旧 PDF 依然大量存在。

### 4.5.3 用工具诊断字体问题

```bash
# 用 pdffonts（poppler-utils）列出 PDF 中的字体信息
pdffonts document.pdf

# 输出示例：
# name                  type       encoding     emb  sub  uni  object ID
# -------------------- ---------- ------------ ---- ---- ---- ---------
# BCDEAA+SimSun        CID Type 2 Identity-H   yes  yes  yes  15 0
# ArialMT              TrueType   WinAnsi      no   no   yes  23 0
```

关键列：
- `emb`：是否嵌入
- `sub`：是否子集化
- `uni`：是否有 Unicode 映射

如果你看到 `emb = no`，这个字体在没有安装对应系统字体的电脑上就可能出问题。

---

## 4.6 字体渲染的差异：为什么同一份 PDF 在不同设备上"看起来"不一样

### 4.6.1 即使字体嵌入了，渲染结果也可能不同

等等，PDF 的核心承诺不是"所有人看到的完全一样"吗？

严格来说，PDF 保证的是**几何形状完全一样**——字形的轮廓坐标、位置、大小不会变。但最终在屏幕上呈现为像素时，还有几个因素影响视觉效果：

1. **抗锯齿算法**：不同渲染器对曲线边缘的平滑处理不同
2. **子像素渲染**：Windows 的 ClearType、macOS 的子像素抗锯齿（已在 Retina 屏上禁用）
3. **Hinting 执行策略**：是否尊重字体内的 hinting 指令
4. **gamma 校正**：文字灰度与背景的混合方式

这就是为什么同一份 PDF 在 Windows、macOS 和 Linux 上"感觉"不一样——不是字体不对，而是渲染管线的最后一步（栅格化）策略不同。

### 4.6.2 打印 vs 屏幕

在 600 DPI 的打印输出上，一个 12 号字母有约 100 像素高，hinting 几乎不重要——曲线本身就足够精确。但在 96 DPI 的屏幕上，同样的字母只有 16 像素高，每一个像素的决策都影响可读性。

这也是为什么设计师审稿时要求"打印后确认"——屏幕上看到的（受渲染器影响）和打印出来的（接近"真实"的字形轮廓）是两码事。

---

## 4.7 现代趋势：可变字体与 PDF

### 4.7.1 Variable Fonts

OpenType 1.8（2016）引入了**可变字体（Variable Fonts）**——一个字体文件包含连续的字重/字宽/倾斜度变化轴。

传统方式：一个字体家族需要多个文件（Regular、Bold、Italic、Light...各一个）。
可变字体：一个文件，通过参数连续调节。

```
font-weight: 100~900 的任意值
font-stretch: 75%~125% 的任意值
```

但 PDF 对可变字体的支持仍然有限——PDF 2.0 规范中提到了，但大多数生成器在嵌入时会把可变字体"固化"为特定的实例。这意味着你在 PDF 里看到的字体，已经丢失了"可变"的能力。

### 4.7.2 Emoji 和彩色字体

现代字体还可以包含彩色信息（COLR/CPAL 表或 SVG 表），用于渲染 Emoji 和彩色图标。

PDF 对彩色字体的支持同样滞后——大多数 PDF 生成器会把 Emoji 渲染为图片而不是使用彩色字体特性。这是 PDF 规范"年龄"的一个体现：它的字体模型设计于 1990 年代，彩色字体是 2010 年代的概念。

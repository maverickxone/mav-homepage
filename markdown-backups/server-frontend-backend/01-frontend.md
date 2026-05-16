---
title: "前端：浏览器里的三件套"
chapter: 1
readTime: 25
description: "HTML、CSS、JS——你在浏览器里看到的一切，都是这三样东西拼出来的。"
---

## 总览：什么是"前端"？

打开任何一个网页，按下 F12，你会看到一堆代码。这些代码就是"前端"——**所有在你浏览器里运行的东西**，统称前端。

前端的本质很简单：浏览器从服务器那里拿到一堆文件（HTML、CSS、JS、图片等），然后在你的电脑上把它们渲染成你看到的页面。整个过程发生在你的机器上，不需要再和服务器通信（除非页面有动态交互）。

前端由三样东西组成，各司其职：

| 技术 | 角色 | 类比 |
|------|------|------|
| HTML | 结构与内容 | 房子的框架和墙壁 |
| CSS | 样式与外观 | 装修、油漆、家具摆放 |
| JavaScript | 行为与交互 | 电路、开关、智能家居 |

一个纯 HTML 页面是能看的——只是丑。加上 CSS 变好看了。加上 JS 能动了。三者缺一不可，但重要性和学习曲线完全不同。

:::callout-tip 一个直觉
你用 GitHub Pages 部署的那个大作业网站，就是一个纯前端项目。没有后端，没有服务器逻辑，浏览器拿到文件就能直接显示。这种网站叫"静态网站"。
:::

### 前端代码是"透明"的

这是前端最重要的特性之一：**任何人都能看到你的前端代码**。

按 F12 打开开发者工具，Elements 面板里是 HTML 结构，Sources 面板里是所有 JS 文件，Network 面板里能看到每一个请求。你的 CSS 变量、JS 逻辑、页面结构——全部暴露在用户面前。

这意味着：
- 前端**不能存放任何秘密**（密码、API 密钥、加密逻辑）
- 前端的"验证"只是用户体验层面的（比如表单校验），真正的安全校验必须在后端
- 任何人都可以"抄"你的前端代码（所以开源前端框架才这么流行）

这也是为什么需要后端——但那是第二章的事。

### 浏览器是怎么渲染页面的？

当你输入一个网址按下回车，浏览器做了这些事：

1. **DNS 查询**：把域名（如 `github.com`）翻译成 IP 地址
2. **建立连接**：和服务器建立 TCP 连接（如果是 HTTPS 还要握手加密）
3. **发送请求**：告诉服务器"我要 index.html"
4. **接收响应**：服务器把 HTML 文件发回来
5. **解析 HTML**：浏览器从上到下读 HTML，遇到 `<link>` 就去请求 CSS，遇到 `<script>` 就去请求 JS
6. **构建 DOM 树**：把 HTML 标签转换成内存中的树形结构
7. **计算样式**：把 CSS 规则应用到每个 DOM 节点上
8. **布局（Layout）**：计算每个元素在页面上的位置和大小
9. **绘制（Paint）**：把像素画到屏幕上

整个过程通常在几百毫秒内完成。你觉得"网页加载慢"的时候，瓶颈通常不在渲染，而在网络传输（等服务器响应）或者 JS 执行太慢。

### 开发者工具（F12）：你的前端调试利器

F12 打开的"开发者工具"是前端开发最重要的工具，没有之一。几个关键面板：

| 面板 | 用途 |
|------|------|
| Elements | 查看和实时修改 HTML/CSS |
| Console | 运行 JS 代码、查看错误信息 |
| Network | 查看所有网络请求（加载了哪些文件、花了多久） |
| Sources | 查看和调试 JS 源代码 |
| Application | 查看 Cookie、LocalStorage 等本地存储 |

一个实用技巧：在 Elements 面板里，你可以直接修改任何网页的 HTML 和 CSS，实时看到效果。当然这只是在你的浏览器里改，刷新就没了——但这对调试样式非常有用。

:::callout-tip 阅读提示
这一章接下来会分别介绍 HTML、CSS、JS 三件套，每个部分都有一些代码示例。如果你和我一样对前端只是一知半解、主要靠 AI 写——**不需要记住任何代码细节**。快速扫一遍，知道"哦，HTML 长这样、CSS 大概是这种格式、JS 能做这些事"就够了。这本书是帮你建立认知框架的，不是让你背语法的。看不懂的代码块直接跳过，完全不影响后面章节的理解。
:::

---

## HTML：骨架与内容

### HTML 是什么？

HTML（HyperText Markup Language，超文本标记语言）是网页的**结构描述语言**。注意，它不是"编程语言"——它没有变量、没有循环、没有条件判断。它只是告诉浏览器："这里有一个标题，那里有一段文字，下面是一张图片。"

一个最简单的 HTML 页面：

```html
<!DOCTYPE html>
<html>
<head>
  <title>我的页面</title>
</head>
<body>
  <h1>你好，世界</h1>
  <p>这是一段文字。</p>
</body>
</html>
```

浏览器读到这段代码，就知道：页面标题是"我的页面"，正文里有一个大标题和一段文字。就这么简单。

### HTML 文档的基本结构

每个 HTML 文件都有固定的骨架：

```html
<!DOCTYPE html>          <!-- 声明这是 HTML5 文档 -->
<html lang="zh-CN">      <!-- 根元素，lang 指定语言 -->
<head>                   <!-- 头部：元信息，不显示在页面上 -->
  <meta charset="UTF-8">              <!-- 字符编码 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>              <!-- 浏览器标签页上显示的文字 -->
  <link rel="stylesheet" href="style.css">  <!-- 引入 CSS -->
</head>
<body>                   <!-- 正文：所有可见内容 -->
  <!-- 你的内容放这里 -->
  <script src="script.js"></script>    <!-- 引入 JS，通常放在最后 -->
</body>
</html>
```

`<head>` 里的东西用户看不到，但对浏览器很重要：
- `charset="UTF-8"` 告诉浏览器用 UTF-8 编码解读文字（不写的话中文可能乱码）
- `viewport` 那行是移动端适配的关键（没有它，手机上页面会缩得很小）
- `<title>` 是浏览器标签页上的文字，也是搜索引擎显示的标题

### 标签（Tag）：HTML 的基本单位

HTML 的一切都是"标签"。标签用尖括号包裹，通常成对出现：

```html
<h1>这是标题</h1>
<p>这是段落</p>
<a href="https://example.com">这是链接</a>
<img src="photo.jpg" alt="一张照片">
```

标签可以有**属性（Attribute）**，写在开始标签里：
- `href` — 链接的目标地址
- `src` — 图片/脚本的文件路径
- `class` — CSS 类名（用于样式）
- `id` — 唯一标识符（用于 JS 操作或 CSS 定位）
- `alt` — 图片的替代文字（图片加载失败时显示，也用于无障碍访问）

### 常用标签详解

**文本类：**

| 标签 | 用途 | 示例 |
|------|------|------|
| `<h1>` ~ `<h6>` | 标题（1最大，6最小）| `<h1>主标题</h1>` |
| `<p>` | 段落 | `<p>一段文字</p>` |
| `<strong>` | 加粗（有语义：重要） | `<strong>注意</strong>` |
| `<em>` | 斜体（有语义：强调） | `<em>重点</em>` |
| `<br>` | 换行（自闭合） | `第一行<br>第二行` |
| `<hr>` | 水平分割线 | `<hr>` |
| `<code>` | 行内代码 | `<code>console.log()</code>` |
| `<pre>` | 预格式化文本（保留空格和换行）| 代码块 |

**容器类：**

| 标签 | 用途 | 备注 |
|------|------|------|
| `<div>` | 通用块级容器 | 没有语义，纯粹用来分组和布局 |
| `<span>` | 通用行内容器 | 用来给一小段文字加样式 |
| `<header>` | 页头 | 语义化标签 |
| `<nav>` | 导航栏 | 语义化标签 |
| `<main>` | 主要内容 | 语义化标签 |
| `<footer>` | 页脚 | 语义化标签 |
| `<section>` | 内容分区 | 语义化标签 |
| `<article>` | 独立的文章内容 | 语义化标签 |

**链接与媒体：**

```html
<!-- 链接 -->
<a href="https://ustc.edu.cn" target="_blank">中科大官网</a>
<!-- target="_blank" 表示在新标签页打开 -->

<!-- 图片 -->
<img src="images/photo.jpg" alt="校园风景" width="800">

<!-- 视频 -->
<video src="video.mp4" controls width="640"></video>
```

**列表：**

```html
<!-- 无序列表（圆点） -->
<ul>
  <li>第一项</li>
  <li>第二项</li>
  <li>第三项</li>
</ul>

<!-- 有序列表（数字） -->
<ol>
  <li>步骤一</li>
  <li>步骤二</li>
  <li>步骤三</li>
</ol>
```

**表格：**

```html
<table>
  <thead>
    <tr>
      <th>姓名</th>
      <th>学号</th>
      <th>成绩</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>PB2400001</td>
      <td>95</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>PB2400002</td>
      <td>88</td>
    </tr>
  </tbody>
</table>
```

**表单（用户输入）：**

```html
<form action="/api/login" method="POST">
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username" placeholder="请输入用户名">

  <label for="password">密码：</label>
  <input type="password" id="password" name="password">

  <button type="submit">登录</button>
</form>
```

表单是前端和后端交互的最原始方式——用户填写信息，点击提交，浏览器把数据发送到 `action` 指定的地址。现代网站更多用 JS 的 `fetch` 来发送数据（不需要刷新页面），但表单依然是基础。

### HTML 的核心思想：语义化

好的 HTML 不只是"能显示"，而是要**有意义**。比如：

```html
<!-- 不好：用 div 装一切 -->
<div class="header">
  <div class="nav">
    <div class="nav-item">首页</div>
    <div class="nav-item">关于</div>
  </div>
</div>

<!-- 好：用语义标签 -->
<header>
  <nav>
    <a href="/">首页</a>
    <a href="/about">关于</a>
  </nav>
</header>
```

两者在浏览器里可能看起来一样，但语义化的 HTML：
- 搜索引擎能更好地理解你的页面结构（SEO）
- 屏幕阅读器（视障用户使用的工具）能正确朗读内容
- 代码可读性更好，维护更方便
- 浏览器可以提供更好的默认行为（比如 `<nav>` 里的链接会被识别为导航）

:::callout 小结
HTML 就是用标签描述"页面上有什么"。它不管好不好看（那是 CSS 的事），也不管能不能动（那是 JS 的事）。你可以把它理解为一份"内容清单"——告诉浏览器这里有标题、那里有段落、下面有图片，仅此而已。
:::

---

## CSS：装修与美化

### CSS 是什么？

CSS（Cascading Style Sheets，层叠样式表）负责页面的**视觉呈现**。颜色、字体、间距、布局、动画——所有"看起来怎么样"的事情，都是 CSS 管的。

没有 CSS 的 HTML 页面长什么样？你可以试试在 F12 里把所有 CSS 禁用——页面会变成一堆黑色文字从上到下排列，链接是蓝色带下划线，标题大一点，仅此而已。那就是浏览器的"默认样式"。

一段典型的 CSS：

```css
h1 {
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
```

CSS 的基本结构是：**选择器 { 属性: 值; }**。选择器决定"给谁加样式"，花括号里是具体的样式规则。

### 选择器：告诉 CSS "给谁加样式"

选择器是 CSS 的核心概念之一。常见的选择器：

```css
/* 标签选择器：所有 <p> 标签 */
p { color: #333; }

/* 类选择器：所有 class="card" 的元素 */
.card { padding: 16px; }

/* ID 选择器：id="header" 的那一个元素 */
#header { background: black; }

/* 后代选择器：.nav 里面的所有 <a> */
.nav a { color: white; }

/* 伪类：鼠标悬停时 */
a:hover { color: blue; }

/* 伪类：第一个子元素 */
li:first-child { font-weight: bold; }

/* 组合：同时满足多个条件 */
a.active { color: red; }  /* 同时是 <a> 标签且有 active 类 */
```

选择器的**优先级**（Specificity）从低到高：
1. 标签选择器（`p`、`div`）
2. 类选择器（`.card`）
3. ID 选择器（`#header`）
4. 内联样式（`style="..."`）
5. `!important`（核武器，尽量别用）

当多条规则冲突时，优先级高的生效。这就是"层叠"（Cascading）的含义——规则像瀑布一样层层覆盖。

### 为什么 CSS "不像代码"？

你说得对——CSS 确实不是传统意义上的"编程"。它没有变量（好吧，现在有 CSS 变量了，但那是后来加的），没有函数，没有循环。它更像是一份**声明式的配置文件**：你告诉浏览器"我想要这个效果"，浏览器去实现。

这也是很多程序员不喜欢 CSS 的原因：它的行为有时候不直觉。比如：
- 两个元素的 margin 会"塌陷"（合并成一个）
- `width: 100%` 有时候会溢出父容器（因为 padding 和 border 会额外增加宽度）
- 垂直居中在 CSS 里曾经是个世纪难题（现在有 Flexbox 了）
- `z-index` 的层叠上下文规则让人抓狂

但 CSS 的"不像代码"恰恰是它的设计哲学：**描述目标，而非过程**。你不需要写"先计算容器宽度，再把元素放到中间"，你只需要写 `display: flex; justify-content: center;`。

### 盒模型（Box Model）：CSS 的基础概念

CSS 里每个元素都是一个"盒子"，由四层组成（从内到外）：

```
┌─────────────────────────────── margin（外边距）
│  ┌──────────────────────────── border（边框）
│  │  ┌───────────────────────── padding（内边距）
│  │  │  ┌────────────────────── content（内容）
│  │  │  │                    │
│  │  │  │    Hello World     │
│  │  │  │                    │
│  │  │  └────────────────────┘
│  │  └───────────────────────┘
│  └──────────────────────────┘
└─────────────────────────────┘
```

```css
.box {
  width: 200px;        /* 内容宽度 */
  padding: 20px;       /* 内边距 */
  border: 2px solid;   /* 边框 */
  margin: 16px;        /* 外边距 */
}
/* 实际占用宽度 = 200 + 20*2 + 2*2 + 16*2 = 276px */
```

:::callout-tip box-sizing: border-box
默认情况下，`width` 只指内容宽度，padding 和 border 会额外增加。这很反直觉。现代 CSS 通常在全局加上：
```css
* { box-sizing: border-box; }
```
这样 `width` 就包含了 padding 和 border，计算起来直觉得多。几乎所有现代项目都会加这一行。
:::

### CSS 的三种写法

```html
<!-- 1. 内联样式：直接写在标签上（不推荐，难维护） -->
<p style="color: red; font-size: 14px;">红色文字</p>

<!-- 2. 内部样式：写在 <style> 标签里（适合小页面） -->
<style>
  p { color: red; }
</style>

<!-- 3. 外部样式：单独的 .css 文件（推荐！） -->
<link rel="stylesheet" href="style.css">
```

实际项目几乎都用第三种——把样式和结构分离，方便维护。一个 CSS 文件可以被多个 HTML 页面共享，改一处样式全站生效。

### 常用 CSS 属性速览

**文字相关：**

```css
.text {
  color: #333;                    /* 文字颜色 */
  font-size: 16px;                /* 字号 */
  font-weight: 600;               /* 字重（粗细），400=正常，700=粗体 */
  font-family: 'Inter', sans-serif; /* 字体 */
  line-height: 1.6;               /* 行高（1.6 = 字号的 1.6 倍） */
  text-align: center;             /* 对齐：left/center/right */
  text-decoration: none;          /* 去掉下划线（常用于链接） */
  letter-spacing: 0.5px;          /* 字间距 */
}
```

**背景与边框：**

```css
.box {
  background: #f5f5f5;            /* 背景色 */
  background: linear-gradient(135deg, #667eea, #764ba2); /* 渐变 */
  border: 1px solid #ddd;         /* 边框 */
  border-radius: 8px;             /* 圆角 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); /* 阴影 */
}
```

**间距与尺寸：**

```css
.element {
  width: 100%;                    /* 宽度 */
  max-width: 800px;               /* 最大宽度（响应式关键） */
  height: auto;                   /* 高度自适应内容 */
  padding: 24px;                  /* 内边距（上右下左） */
  padding: 16px 24px;             /* 内边距（上下 左右） */
  margin: 0 auto;                 /* 外边距，auto 实现水平居中 */
}
```

### 现代 CSS 布局：Flexbox 和 Grid

早期 CSS 布局靠 `float`（浮动），写起来像在玩拼图游戏，痛苦无比。现代 CSS 有两个强大的布局工具：

**Flexbox（弹性盒子）**——一维布局，适合一行或一列的排列：

```css
/* 水平排列，两端对齐，垂直居中 */
.nav {
  display: flex;
  justify-content: space-between;  /* 主轴对齐方式 */
  align-items: center;             /* 交叉轴对齐方式 */
  gap: 16px;                       /* 元素间距 */
}

/* 垂直居中（曾经的世纪难题，现在一行搞定） */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;  /* vh = viewport height，视口高度 */
}

/* 换行排列 */
.tags {
  display: flex;
  flex-wrap: wrap;  /* 放不下时自动换行 */
  gap: 8px;
}
```

**Grid（网格）**——二维布局，适合复杂的行列结构：

```css
/* 三列等宽网格 */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* fr = fraction，等分 */
  gap: 16px;
}

/* 响应式网格：自动适应列数 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
/* 这行的意思是：每列最小 300px，能放几列放几列，自动适应 */
```

:::callout Flexbox vs Grid 怎么选？
- **一行或一列**的排列 → Flexbox（导航栏、按钮组、标签列表）
- **行和列都要控制**的布局 → Grid（卡片网格、整体页面布局）
- 不确定 → 先试 Flexbox，不够用再换 Grid
:::

### 响应式设计：适配不同屏幕

同一个网站在手机、平板、电脑上都要好看——这就是响应式设计。核心工具是**媒体查询（Media Query）**：

```css
/* 默认样式（移动端优先） */
.container {
  padding: 16px;
}

/* 屏幕宽度 >= 768px 时（平板） */
@media (min-width: 768px) {
  .container {
    padding: 32px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 屏幕宽度 >= 1024px 时（电脑） */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

现代响应式设计的思路是"移动端优先"——先写手机上的样式，再用媒体查询逐步增强大屏幕的布局。

### CSS 变量：让样式可维护

CSS 变量（Custom Properties）让你可以定义"全局常量"，改一处全站生效：

```css
:root {
  --color-primary: #2563eb;
  --color-text: #1f2937;
  --color-bg: #ffffff;
  --radius: 8px;
  --font-body: 'Inter', sans-serif;
}

.button {
  background: var(--color-primary);
  border-radius: var(--radius);
  font-family: var(--font-body);
}

/* 暗色主题只需要改变量值 */
[data-theme="dark"] {
  --color-text: #f3f4f6;
  --color-bg: #111827;
}
```

这就是你的 md2HTML 工具实现暗色/亮色主题切换的原理——切换一个 `data-theme` 属性，CSS 变量自动切换，整个页面颜色跟着变。

:::callout-tip 给不喜欢 CSS 的你
CSS 确实适合让 AI 来写。但理解这些基本概念（选择器、盒模型、Flex 布局、媒体查询、CSS 变量）还是有必要的——至少你要能看懂 AI 写的 CSS 在干什么，以及出了问题知道往哪个方向调。

一个实用的学习方法：打开你喜欢的网站，F12 看它的 CSS，试着修改一些值看看效果。这比看教程有趣得多。
:::

---

## JavaScript：让页面"活"起来

### JS 是什么？

JavaScript（简称 JS）是前端唯一的**编程语言**。HTML 和 CSS 都是声明式的"描述"，而 JS 是命令式的"指令"——它能做判断、循环、处理数据、响应用户操作。

当你点击一个按钮弹出对话框、滑动页面出现动画、输入搜索词实时显示结果——这些都是 JS 在工作。

一个重要的历史背景：JS 最初（1995 年）是为了给网页加一点简单交互而设计的，只花了 10 天就被创造出来。没人想到它会成为世界上使用最广泛的编程语言之一。这也是为什么 JS 有很多"奇怪"的设计——历史包袱太重了。

### JS 的基本语法

如果你学过 C 或 Python，JS 的语法会让你觉得似曾相识：

```javascript
// ===== 变量 =====
let name = "Mav";          // let：可以重新赋值
const age = 19;             // const：常量，不能重新赋值
// var 是老写法，有作用域问题，现代 JS 不推荐用

// ===== 数据类型 =====
let num = 42;               // 数字（整数和浮点数不区分）
let str = "hello";          // 字符串
let bool = true;            // 布尔值
let arr = [1, 2, 3];       // 数组
let obj = { x: 1, y: 2 };  // 对象（类似 Python 的字典）
let nothing = null;         // 空值
let undef = undefined;      // 未定义

// ===== 函数 =====
// 传统写法
function greet(person) {
  return "你好，" + person;
}

// 箭头函数（现代写法，更简洁）
const greet2 = (person) => "你好，" + person;

// ===== 条件 =====
if (age >= 18) {
  console.log("成年了");
} else {
  console.log("未成年");
}

// ===== 循环 =====
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// 遍历数组（更现代的写法）
const fruits = ["苹果", "香蕉", "橘子"];
fruits.forEach(fruit => console.log(fruit));

// ===== 模板字符串（反引号） =====
const message = `你好，${name}，你今年 ${age} 岁`;
// 比 "你好，" + name + "，你今年 " + age + " 岁" 好读多了
```

### JS 和 C/Python 的主要区别

| 特性 | C | Python | JavaScript |
|------|---|--------|------------|
| 类型系统 | 静态强类型 | 动态强类型 | 动态弱类型 |
| 变量声明 | `int x = 1;` | `x = 1` | `let x = 1;` |
| 分号 | 必须 | 不用 | 建议加（不加也行） |
| 代码块 | `{ }` | 缩进 | `{ }` |
| 数组 | 固定大小 | 列表 `[]` | 数组 `[]`（动态大小） |
| 字典/对象 | 无（用 struct） | `dict` | 对象 `{}` |
| 函数 | 一等公民？否 | 是 | 是 |
| 异步 | 手动线程 | async/await | async/await + Promise |

JS 最"奇怪"的地方是**弱类型**——它会自动做类型转换，有时候结果很离谱：

```javascript
"5" + 3    // "53"（字符串拼接）
"5" - 3    // 2（自动转数字）
[] + []    // ""（空字符串）
[] + {}    // "[object Object]"
{} + []    // 0（别问为什么）
```

这就是为什么大型项目都用 TypeScript——给 JS 加上类型检查，避免这类隐式转换的坑。

### JS 在前端做什么？

JS 在浏览器里的核心能力是**操作 DOM（Document Object Model）**。DOM 就是浏览器把 HTML 解析后生成的一棵"树"，JS 可以增删改查这棵树上的任何节点。

```javascript
// ===== 查找元素 =====
const btn = document.querySelector('#my-button');     // 找 id="my-button" 的元素
const cards = document.querySelectorAll('.card');      // 找所有 class="card" 的元素
const title = document.querySelector('h1');           // 找第一个 <h1>

// ===== 修改内容 =====
title.textContent = '新标题';                         // 改文字
title.innerHTML = '<em>斜体标题</em>';                // 改 HTML（注意安全风险）

// ===== 修改样式 =====
title.style.color = 'red';                           // 直接改样式
title.classList.add('highlight');                     // 添加 CSS 类
title.classList.toggle('active');                     // 切换 CSS 类

// ===== 创建和删除元素 =====
const newP = document.createElement('p');
newP.textContent = '我是新创建的段落';
document.body.appendChild(newP);                     // 添加到页面末尾

// ===== 事件监听 =====
btn.addEventListener('click', function() {
  alert('按钮被点击了！');
});

// 更多事件类型：
// 'click'      — 点击
// 'mouseover'  — 鼠标悬停
// 'keydown'    — 键盘按下
// 'submit'     — 表单提交
// 'scroll'     — 页面滚动
// 'load'       — 页面加载完成
```

这就是 JS 最基础的工作模式：**查找元素 → 监听事件 → 操作页面**。

### 一个完整的小例子

把 HTML、CSS、JS 三者结合起来，做一个简单的计数器：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .counter {
      text-align: center;
      padding: 40px;
      font-family: sans-serif;
    }
    .count {
      font-size: 48px;
      font-weight: bold;
      margin: 20px 0;
    }
    button {
      font-size: 18px;
      padding: 8px 24px;
      margin: 0 8px;
      cursor: pointer;
      border: 2px solid #333;
      background: white;
      border-radius: 4px;
    }
    button:hover {
      background: #333;
      color: white;
    }
  </style>
</head>
<body>
  <div class="counter">
    <h1>计数器</h1>
    <div class="count" id="count">0</div>
    <button id="dec">-1</button>
    <button id="inc">+1</button>
  </div>

  <script>
    let count = 0;
    const display = document.getElementById('count');

    document.getElementById('inc').addEventListener('click', () => {
      count++;
      display.textContent = count;
    });

    document.getElementById('dec').addEventListener('click', () => {
      count--;
      display.textContent = count;
    });
  </script>
</body>
</html>
```

这个例子虽然简单，但展示了前端三件套的完整协作：
- HTML 定义了结构（标题、数字显示、两个按钮）
- CSS 定义了样式（居中、字号、按钮样式、悬停效果）
- JS 定义了行为（点击按钮 → 修改计数 → 更新显示）

### 异步编程：JS 最重要的特性

JS 有一个和 C/Python 很不一样的地方：它是**单线程**的，但通过**异步**机制来处理耗时操作。

什么意思？假设你要从服务器获取数据，网络请求可能需要 500ms。如果 JS 像 C 一样"等着"请求完成，整个页面就会卡住 500ms——用户不能点击、不能滚动、什么都做不了。

JS 的解决方案是：发出请求后**不等待**，继续执行后面的代码。等数据回来了，再执行你指定的"回调"。

```javascript
// 现代写法：async/await（看起来像同步代码，但实际是异步的）
async function loadPosts() {
  try {
    const response = await fetch('/api/posts');  // 发请求，等待响应
    const posts = await response.json();         // 解析 JSON
    console.log(posts);                          // 使用数据
  } catch (error) {
    console.error('加载失败:', error);
  }
}

// fetch 是浏览器内置的网络请求函数
// await 表示"等这个操作完成再继续"
// async 标记这个函数里面有 await
```

`fetch` 是前端和后端通信的核心 API。你的前端页面通过 `fetch` 向后端发送请求，后端返回 JSON 数据，前端拿到数据后更新页面。这就是现代 Web 应用的基本模式。

### 你可能听过但不太懂的概念

**npm / Node.js**

Node.js 让 JS 可以在浏览器之外运行（比如在服务器上、在你的电脑终端里）。npm 是 Node.js 的包管理器，类似 Python 的 pip——别人写好的代码打包成"包"，你用 `npm install xxx` 就能安装使用。

你的 md2HTML 工具就是用 Node.js 写的——`node build.js` 就是在终端里用 Node.js 执行 JS 代码。它用了 `marked`（Markdown 解析）、`gray-matter`（YAML 解析）等 npm 包。

**框架（React / Vue / Angular）**

当项目变大，手动操作 DOM 会变得极其复杂。想象一下：一个购物车页面，用户添加商品、修改数量、删除商品、应用优惠券——每个操作都要手动找到对应的 DOM 元素并更新。代码会变成一团乱麻。

框架的核心思想是**数据驱动视图**：你只管修改数据，框架自动帮你更新页面。

```javascript
// 没有框架：手动操作 DOM
document.querySelector('#cart-count').textContent = cart.length;
document.querySelector('#total-price').textContent = calculateTotal();
// ... 还有十几处要更新

// 有框架（React 风格）：只管数据，UI 自动更新
setCart([...cart, newItem]);  // 数据变了，页面自动重新渲染
```

你暂时不需要学框架，但知道它们存在就好。等你需要做复杂的交互式应用时，再学不迟。

**TypeScript**

JS 的"加强版"，给 JS 加上了类型系统。大型项目几乎都用 TypeScript，因为它能在编码阶段就发现很多错误：

```typescript
// TypeScript：编译时就能发现错误
function add(a: number, b: number): number {
  return a + b;
}
add("5", 3);  // 编译错误！不能把字符串传给 number 参数

// JavaScript：运行时才发现问题（或者根本发现不了）
function add(a, b) {
  return a + b;
}
add("5", 3);  // 返回 "53"，没有报错，但结果是错的
```

**打包工具（Vite / Webpack）**

现代前端项目通常有几十甚至几百个 JS 文件、CSS 文件、图片等。打包工具把它们合并、压缩、优化，最终输出几个文件给浏览器加载。你暂时不需要了解细节，知道有这么个东西就行。

:::callout JS 的学习建议
作为大一学生，你不需要精通 JS。但理解以下概念会让你受益：
- 变量、函数、条件、循环（和 C/Python 差不多）
- 对象和数组的操作（`map`、`filter`、`forEach`）
- DOM 操作（`querySelector`、`addEventListener`）
- 异步（`fetch`、`async/await`）
- 模块化（`import/export`）

这些够你看懂大部分前端代码了。深入学习可以等到你真正需要写复杂交互的时候。
:::

---

## 前端的完整工作流程

最后，把前端的完整流程串起来：

1. **你写代码**：HTML 定义结构，CSS 定义样式，JS 定义交互
2. **本地预览**：双击 HTML 文件（或用 Live Server 插件），在浏览器里看效果
3. **调试**：F12 开发者工具，修改样式、查看错误、调试 JS
4. **部署**：把文件上传到服务器（或 GitHub Pages）

用户访问时：
1. **浏览器请求**：用户输入网址，浏览器向服务器发送请求
2. **服务器响应**：服务器把 HTML/CSS/JS 文件发回来
3. **浏览器渲染**：
   - 解析 HTML → 构建 DOM 树
   - 解析 CSS → 计算每个元素的样式
   - 执行 JS → 可能修改 DOM 和样式
   - 合成最终画面 → 显示在屏幕上

对于静态网站（比如你的 GitHub Pages 项目），服务器只是一个"文件柜"——用户要什么文件，它就给什么文件，不做任何处理。

但如果你需要用户登录、存储数据、处理支付……光靠前端就不够了。这时候，就需要**后端**登场了。

---

## 前端生态一览

最后附一张前端技术的"地图"，帮你建立全局认知。你不需要学所有这些，只是知道它们存在：

| 类别 | 技术 | 用途 |
|------|------|------|
| 基础 | HTML / CSS / JS | 前端三件套 |
| CSS 工具 | Tailwind CSS / Sass | 更高效地写 CSS |
| JS 框架 | React / Vue / Svelte | 构建复杂交互式应用 |
| 类型系统 | TypeScript | 给 JS 加类型检查 |
| 打包工具 | Vite / Webpack | 合并压缩代码 |
| 包管理 | npm / yarn / pnpm | 管理第三方依赖 |
| 测试 | Jest / Vitest | 自动化测试 |
| 静态站点 | Hugo / Astro / md2HTML | Markdown → 网站 |
| 部署 | GitHub Pages / Vercel / Netlify | 免费托管静态网站 |

你现在的位置：已经掌握了基础三件套的使用，能做静态网站。这已经比大部分大一学生强了。接下来的路，取决于你想往哪个方向深入。

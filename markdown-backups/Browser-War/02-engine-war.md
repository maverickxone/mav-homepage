---
title: "引擎之争——Chromium 为何一家独大"
chapter: 2
readTime: 25
description: "什么是渲染引擎，Blink/WebKit/Gecko 的前世今生，以及为什么 Edge 最终选择了投降。"
---

## 2.1 浏览器引擎到底是什么

### 2.1.1 引擎 ≠ 浏览器

很多人把"浏览器"和"浏览器引擎"混为一谈，但它们是两个不同的东西。

**浏览器**是你看到的那个应用程序——有地址栏、标签页、书签、设置界面、扩展系统。这些是"壳"。

**浏览器引擎**（也叫渲染引擎或排版引擎）是浏览器的"心脏"——它负责把 HTML、CSS、JavaScript 这些代码变成你屏幕上看到的像素。

类比一下：浏览器是一辆车，引擎就是发动机。不同品牌的车可以用同一款发动机——Chrome、Edge、Brave、Opera、Vivaldi 这些浏览器看起来不一样，但它们的"发动机"都是同一个：Blink。

### 2.1.2 引擎的组成

一个完整的浏览器引擎通常包含两个核心部分：

```
浏览器引擎
├── 渲染引擎（Rendering Engine）
│   ├── HTML 解析器 → 构建 DOM 树
│   ├── CSS 解析器 → 构建 CSSOM 树
│   ├── 布局引擎 → 计算每个元素的位置和大小
│   └── 绘制引擎 → 把计算结果画成像素
│
└── JavaScript 引擎（JS Engine）
    ├── 解析器 → 把 JS 代码变成抽象语法树（AST）
    ├── 解释器 → 逐行执行 AST
    └── JIT 编译器 → 把热点代码编译成机器码
```

| 浏览器 | 渲染引擎 | JS 引擎 |
|--------|----------|---------|
| Chrome / Edge / Brave / Opera | Blink | V8 |
| Safari | WebKit | JavaScriptCore (Nitro) |
| Firefox | Gecko | SpiderMonkey |

注意：渲染引擎和 JS 引擎是可以分开的。比如 Node.js 用的是 V8（Chrome 的 JS 引擎），但它没有渲染引擎，因为它不需要显示网页。

### 2.1.3 渲染引擎的工作流程

当你打开一个网页时，渲染引擎做了以下事情（我们第三章会更详细地讲）：

```
HTML 文本                CSS 文本
    │                       │
    ▼                       ▼
┌─────────┐          ┌──────────┐
│HTML 解析│          │CSS 解析  │
└────┬────┘          └────┬─────┘
     │                    │
     ▼                    ▼
┌─────────┐          ┌──────────┐
│ DOM 树  │          │ CSSOM 树 │
└────┬────┘          └────┬─────┘
     │                    │
     └────────┬───────────┘
              ▼
       ┌─────────────┐
       │  渲染树      │  (合并 DOM + CSSOM)
       │  Render Tree │
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │  布局 Layout │  (计算位置和大小)
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │  绘制 Paint  │  (生成像素)
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │  合成 Composite │  (GPU 加速合成图层)
       └─────────────┘
              ▼
         屏幕上的像素
```

不同的引擎在实现这个流程时有不同的优化策略，这就是为什么同一个网页在不同浏览器里可能渲染速度不同、甚至显示效果略有差异。


## 2.2 三大引擎的前世今生

### 2.2.1 家族树：一切始于 KHTML

今天的三大引擎中，有两个是"亲戚"。让我们画一棵家族树：

```
1998  KHTML (KDE 项目，Linux 桌面环境的浏览器引擎)
        │
        │ 2001: Apple fork
        ▼
2003  WebKit (Apple Safari 的引擎)
        │
        │ 2013: Google fork
        ▼
2013  Blink (Google Chrome 的引擎)


独立血统：
1998  Gecko (Mozilla/Netscape → Firefox)
```

是的，Blink 和 WebKit 是"父子关系"——Blink 是 Google 在 2013 年从 WebKit 分叉（fork）出来的。而 WebKit 本身是 Apple 在 2001 年从 KDE 项目的 KHTML 分叉出来的。

KHTML 是什么？它是 Linux 桌面环境 KDE 的一个浏览器组件，由一群开源志愿者开发。Apple 选择它的原因很务实：代码量小（不到 14 万行），设计干净，标准兼容性好。相比之下，当时的 Gecko（Mozilla 的引擎）代码量庞大且复杂。

### 2.2.2 WebKit：Apple 的选择

2003 年 1 月，Steve Jobs 在 Macworld 上发布了 Safari 浏览器，宣布 Apple 不再依赖 IE for Mac（是的，微软曾经为 Mac 开发过 IE）。

Safari 的引擎就是 WebKit。Apple 最初是秘密开发的，这让 KHTML 的原始开发者很不满——Apple 拿了他们的代码，私下改了很久才公开。后来 Apple 逐步开源了 WebKit，但始终保持着对项目的主导权。

WebKit 的特点：

- **轻量高效**：特别适合移动设备（这也是为什么 iPhone 从第一天起就用 WebKit）
- **Apple 强制要求**：在 iOS 上，所有浏览器（包括 Chrome for iOS）都必须使用 WebKit 引擎。这是 Apple 的 App Store 政策。所以 iPhone 上的 Chrome 本质上只是一个 WebKit 的壳。（注：欧盟 DMA 法案正在迫使 Apple 放松这一限制）
- **JavaScriptCore**：WebKit 自带的 JS 引擎，也叫 Nitro，性能不错但通常略逊于 V8

### 2.2.3 Blink：Google 的分家

2013 年 4 月，Google 宣布将 Chrome 的渲染引擎从 WebKit 分叉为 Blink。

为什么要分家？Google 和 Apple 在 WebKit 的开发方向上产生了分歧。Google 想要实现多进程架构的深度优化，而这需要对引擎做大量的结构性改动。在同一个项目里，两家公司的需求越来越难以调和。

分叉之后，Blink 和 WebKit 各自独立发展了十多年，虽然底层有共同的祖先代码，但现在已经是两个差异很大的引擎了。

Blink 的特点：

- **激进的性能优化**：得益于 Google 的工程资源，Blink 在渲染性能上持续领先
- **快速迭代**：每六周一个版本，新特性上线速度极快
- **V8 引擎**：JavaScript 执行性能长期领先
- **庞大的代码库**：Chromium 的代码量超过 3500 万行，是世界上最大的开源项目之一

### 2.2.4 Gecko：最后的独立者

Gecko 引擎诞生于 1998 年的 Mozilla 项目（Netscape 开源的产物）。它是今天唯一一个不属于任何科技巨头的主流浏览器引擎。

Gecko 的特点：

- **由非营利组织维护**：Mozilla Foundation 是一个非营利组织，其使命是"保持互联网的开放和可访问"
- **隐私优先**：Firefox 默认启用了很多隐私保护功能（如增强型追踪保护）
- **Rust 重写**：Mozilla 从 2016 年开始用 Rust 语言重写 Gecko 的关键组件（项目代号 Quantum/Stylo），提升了性能和安全性
- **市场份额困境**：尽管技术上不差，但 Firefox 的市场份额持续下滑（从 2009 年的 30% 到 2026 年的不到 4%）

Gecko 面临的最大问题不是技术，而是资金。Mozilla 的主要收入来源是 Google 支付的搜索引擎默认协议费用（每年约 4-5 亿美元）。讽刺的是，Firefox 的生存依赖于它最大的竞争对手的施舍。


## 2.3 为什么 Edge 选择了投降

### 2.3.1 EdgeHTML 的困境

2015 年，微软随 Windows 10 发布了 Edge 浏览器，使用全新的 EdgeHTML 引擎。从技术角度看，EdgeHTML 并不差——它比 IE 的 Trident 引擎快得多，支持现代 Web 标准，内存占用也比 Chrome 低。

但它面临一个无解的问题：**兼容性恶性循环**。

```
Web 开发者只针对 Chrome 测试
         │
         ▼
网站在 Edge 上有 bug
         │
         ▼
用户遇到问题，切回 Chrome
         │
         ▼
Edge 市场份额上不去
         │
         ▼
Web 开发者更没动力适配 Edge
         │
         └──────→ 回到起点
```

这个循环和当年 IE 6 统治时期一模一样——只不过角色互换了。当年是"网站只为 IE 优化，其他浏览器打不开"，现在是"网站只为 Chrome 优化，其他浏览器有 bug"。

微软的工程师们发现，他们花了大量时间在"修复网站兼容性问题"上，而不是"开发新功能"。维护一个独立引擎的成本越来越高，收益却越来越低。

### 2.3.2 投降的逻辑

2018 年 12 月，微软宣布放弃 EdgeHTML，转向 Chromium。这个决定背后的逻辑是：

1. **工程成本**：维护一个独立的浏览器引擎需要数百名工程师。微软宁愿把这些人力投入到 Azure、Office 365 等核心业务上。
2. **兼容性**：基于 Chromium 意味着自动获得和 Chrome 一样的网站兼容性。
3. **扩展生态**：Chrome Web Store 有超过 20 万个扩展，EdgeHTML 版 Edge 的扩展生态几乎为零。基于 Chromium 后可以直接使用 Chrome 的扩展。
4. **微软的核心业务不是浏览器**：微软靠 Azure 云服务和 Office 365 赚钱，浏览器只是一个入口。用 Chromium 做一个"够好"的浏览器，比自己维护引擎划算得多。

### 2.3.3 投降的代价

微软的决定是理性的，但它对整个 Web 生态有深远的负面影响：

- **引擎多样性进一步下降**：从四个主流引擎（Blink、WebKit、Gecko、EdgeHTML）变成了三个
- **Google 的话语权进一步增强**：微软虽然是 Chromium 的贡献者，但 Google 依然是项目的主导者
- **先例效应**：如果连微软这样的巨头都维护不起独立引擎，还有谁能？

Opera 在 2013 年就已经放弃了自己的 Presto 引擎转向 Chromium。现在微软也投降了。独立引擎只剩下 Apple 的 WebKit 和 Mozilla 的 Gecko。

而 Apple 维护 WebKit 的动力主要来自 iOS 的封闭生态（强制所有 iOS 浏览器使用 WebKit），而不是桌面市场的竞争。如果有一天 Apple 被迫开放 iOS 的浏览器引擎限制（欧盟正在推动这件事），WebKit 的未来也不确定。


## 2.4 Chromium：开源的垄断

### 2.4.1 Chromium 和 Chrome 的区别

很多人分不清 Chromium 和 Chrome。简单说：

- **Chromium** 是一个开源项目，任何人都可以下载源码、编译、修改
- **Chrome** 是 Google 基于 Chromium 添加了一些私有功能后发布的产品

Chrome 比 Chromium 多了什么？

| 功能 | Chromium | Chrome |
|------|----------|--------|
| 自动更新 | ✗ | ✓ |
| PDF 阅读器 | ✗ | ✓ |
| 崩溃报告 | ✗ | ✓ |
| Google 账号同步 | ✗ | ✓ |
| Widevine DRM（看 Netflix） | ✗ | ✓ |
| 使用统计收集 | ✗ | ✓ |

其他基于 Chromium 的浏览器（Edge、Brave、Opera 等）也是类似的模式：拿 Chromium 的开源代码，去掉 Google 的私有部分，加上自己的功能。

### 2.4.2 "开源"不等于"开放治理"

Chromium 是开源的，但这不意味着它是民主的。

Google 对 Chromium 项目拥有事实上的控制权：

- **代码审查权**：所有提交到 Chromium 的代码都需要通过 Google 员工的审查
- **方向决策权**：Chromium 的技术路线图由 Google 制定
- **资源优势**：Google 雇佣了 Chromium 项目绝大多数的全职开发者。其他公司（微软、Brave、Opera）虽然也有贡献，但规模远小于 Google
- **功能否决权**：如果 Google 不想要某个功能，它就不会被合并到 Chromium 主线

这就是所谓的"开源的垄断"——代码是开放的，但决策权是集中的。

### 2.4.3 Manifest V3：一个典型案例

2024-2025 年发生的 Manifest V3 事件是 Google 控制力的一个典型体现。

**背景**：Chrome 的扩展系统使用一套叫 "Manifest" 的 API 规范。Manifest V2 允许扩展拦截和修改网络请求（这是广告拦截器的核心工作原理）。

**Google 的决定**：从 2024 年开始，Chrome 强制所有扩展迁移到 Manifest V3。V3 限制了扩展拦截网络请求的能力，改用一种叫 `declarativeNetRequest` 的新 API，规则数量有上限。

**争议**：批评者认为这是 Google 在削弱广告拦截器——毕竟 Google 80% 以上的收入来自广告。Google 则声称 V3 是为了"安全和性能"。

**影响**：uBlock Origin（最流行的广告拦截器）的开发者表示 V3 的限制让他无法完全复现 V2 版本的功能，因此发布了功能缩减的 "uBlock Origin Lite"。

**Firefox 的态度**：Mozilla 宣布 Firefox 将同时支持 Manifest V2 和 V3，确保用户可以继续使用完整功能的广告拦截器。

这个事件完美展示了引擎垄断的风险：当一家公司控制了 80% 用户使用的浏览器引擎，它的每一个技术决策都会影响整个 Web 生态——即使这个决策可能与它的商业利益有关。

```javascript
// Manifest V2 的广告拦截方式（被废弃）：
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // 可以检查每一个网络请求，动态决定是否拦截
    if (isAdUrl(details.url)) {
      return { cancel: true };  // 拦截这个请求
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]  // "blocking" 意味着可以同步拦截
);

// Manifest V3 的方式（新规范）：
// 必须预先声明静态规则，不能动态判断
chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    id: 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "ads.example.com",  // 只能用模式匹配
      resourceTypes: ["script", "image"]
    }
  }]
  // 规则数量有上限（静态规则 30 万条，动态规则 5000 条）
});
```

V2 的方式像是一个"智能门卫"——可以检查每个人的证件，根据复杂的逻辑决定放不放行。V3 的方式像是一个"名单"——只能提前写好谁不能进，名单长度还有限制。对于不断变化的广告网络来说，静态名单的效果天然不如动态判断。


## 2.5 引擎多样性的未来

### 2.5.1 为什么我们需要多个引擎

引擎多样性的价值类似于生物多样性：

1. **竞争推动创新**：Chrome 的 V8 引擎逼迫 Firefox 的 SpiderMonkey 不断优化，反过来也是。没有竞争，就没有进步的动力。

2. **制衡权力**：如果只有一个引擎，那它的开发者就能单方面决定 Web 标准的实现方式。多个引擎意味着标准需要在多方协商后才能确定。

3. **安全冗余**：如果所有浏览器都用同一个引擎，那一个引擎的漏洞就是所有浏览器的漏洞。多个引擎意味着攻击面更分散。

4. **避免历史重演**：IE 6 的垄断导致 Web 停滞五年。我们不想再经历一次。

### 2.5.2 新的希望？

尽管形势严峻，但也有一些积极的信号：

**Servo 项目**：最初由 Mozilla 发起，用 Rust 语言从零开始写一个新的浏览器引擎。虽然 Mozilla 在 2020 年裁员时解散了 Servo 团队，但项目后来被 Linux Foundation 接管，继续开发中。它可能是未来唯一有潜力成为第四个独立引擎的项目。

**Ladybird 项目**：一个从零开始用 C++ 编写的新浏览器引擎，由 SerenityOS 的创始人 Andreas Kling 发起。虽然还很早期，但它代表了社区对引擎多样性的渴望。

**欧盟 DMA（数字市场法案）**：要求 Apple 在 iOS 上允许第三方浏览器引擎。如果执行到位，这意味着 Firefox 和 Chrome 可以在 iPhone 上使用自己的引擎，而不是被迫使用 WebKit。这可能会改变移动端的引擎格局。

**Google 与 Linux Foundation 合作**：2025 年初，Google 宣布与 Linux Foundation 合作成立 "Supporters of Chromium-Based Browsers" 组织，旨在让 Chromium 的治理更加开放。但批评者认为这更多是公关行为，实质性的权力转移有限。

### 2.5.3 Web 标准是怎么制定的

理解引擎多样性，还需要了解 Web 标准的制定过程：

**W3C（万维网联盟）**：由 Tim Berners-Lee 创立，负责制定 HTML、CSS 等标准。成员包括浏览器厂商、科技公司、学术机构。

**WHATWG（Web 超文本应用技术工作组）**：2004 年由 Apple、Mozilla、Opera 创立（因为不满 W3C 的缓慢进度）。现在 HTML 标准（Living Standard）由 WHATWG 维护。

**TC39**：负责 JavaScript（ECMAScript）标准的委员会。

标准的制定过程通常是：
1. 某个浏览器厂商提出一个新特性的提案
2. 在标准组织中讨论、修改
3. 多个浏览器实现原型
4. 经过实际使用验证后，正式纳入标准

问题在于：当一个引擎占据 80% 的市场时，它可以"先实现后标准化"——先在 Chrome 中实现某个特性，等开发者都用上了，再推动它成为标准。其他引擎只能被动跟随。这就是"事实标准"（de facto standard）的力量。

### 2.5.4 作为用户，你能做什么

如果你关心 Web 的多样性和开放性：

1. **试试 Firefox**：它是唯一一个由非营利组织维护的、使用独立引擎的主流浏览器。即使你不把它当主力浏览器，偶尔用用也是一种支持。

2. **了解你的浏览器用的是什么引擎**：很多人以为自己在用"不同的浏览器"，其实底层都是 Chromium。Edge、Brave、Opera、Vivaldi、Arc——它们的"发动机"都是一样的。

3. **关注 Web 标准的讨论**：W3C（万维网联盟）和 WHATWG（Web 超文本应用技术工作组）是制定 Web 标准的组织。它们的讨论是公开的，任何人都可以参与。

引擎之争的故事还没有结束。但有一点是确定的：**Web 的未来不应该由任何一家公司单独决定**。这是 Tim Berners-Lee 在 1989 年设计万维网时的初衷，也是我们今天仍然需要守护的原则。


## 2.6 深入理解：引擎的性能差异

### 2.6.1 JavaScript 引擎性能对比

三大 JavaScript 引擎各有特色：

**V8（Chrome/Edge/Node.js）**

V8 的核心优势是它的多层编译架构：

```
JavaScript 源代码
       │
       ▼
┌─────────────┐
│  Ignition   │  ← 解释器：快速启动，逐行执行
│  (解释器)    │     生成字节码，收集类型反馈
└──────┬──────┘
       │ 热点代码（被多次执行的函数）
       ▼
┌─────────────┐
│ TurboFan    │  ← 优化编译器：根据类型反馈生成高效机器码
│ (优化编译器) │     如果类型假设失败，回退到 Ignition
└──────┬──────┘
       │
       ▼
  优化的机器码（接近 C++ 的性能）
```

这种"先解释后编译"的策略让 V8 既能快速启动（不需要等编译完成），又能在运行时达到很高的性能。

**SpiderMonkey（Firefox）**

SpiderMonkey 是世界上第一个 JavaScript 引擎（1995 年由 Brendan Eich 编写），也是持续开发时间最长的。它的架构类似 V8，但有自己的优化策略：

```
JavaScript 源代码
       │
       ▼
┌─────────────┐
│  解释器      │  ← 快速启动
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Baseline   │  ← 基线编译器：快速生成未优化的机器码
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  IonMonkey  │  ← 优化编译器：生成高度优化的机器码
└─────────────┘
```

SpiderMonkey 的一个独特优势是它的部分组件用 Rust 重写了（Stylo 样式引擎），获得了更好的内存安全性。

**JavaScriptCore / Nitro（Safari）**

Apple 的 JS 引擎有四层编译管线，是三者中层数最多的：

```
LLInt → Baseline → DFG → FTL
(解释)   (基线)    (中级优化)  (最高优化)
```

更多的层级意味着更细粒度的优化决策——代码可以根据"热度"逐步升级到更高的优化层级。

### 2.6.2 实际性能差异

在实际使用中，三大引擎的性能差异已经很小了（都在同一个数量级）。差异主要体现在：

- **启动速度**：V8 和 JavaScriptCore 略快
- **峰值性能**：V8 在计算密集型任务上通常领先
- **内存效率**：JavaScriptCore 通常内存占用最低
- **正则表达式**：V8 的 Irregexp 引擎性能突出

对于普通用户来说，这些差异几乎不可感知。真正影响浏览体验的往往是网络延迟和页面本身的优化程度，而不是引擎性能。

### 2.6.3 渲染性能：CSS 和布局

渲染引擎的性能差异更多体现在 CSS 处理和布局计算上：

```css
/* 这种复杂选择器在不同引擎中的性能差异可能很大 */
.container > div:nth-child(odd) .item:not(.hidden):hover {
  transform: scale(1.1);
  transition: all 0.3s ease;
}
```

Blink 在处理复杂 CSS 动画和大量 DOM 节点时通常表现最好，这得益于 Google 在 GPU 加速合成方面的大量投入。

Gecko 的 Stylo 引擎（用 Rust 编写）在 CSS 样式计算上有独特优势——它可以利用多核 CPU 并行计算样式，而 Blink 的样式计算仍然主要是单线程的。

### 2.6.4 Web 标准支持

不同引擎对 Web 标准的支持程度也有差异。你可以在 `caniuse.com` 上查看某个 CSS 属性或 JavaScript API 在不同浏览器中的支持情况。

一般来说：
- **Blink（Chrome）**：新特性支持最快（因为 Google 工程师多，迭代快）
- **Gecko（Firefox）**：标准兼容性好，但新特性上线稍慢
- **WebKit（Safari）**：某些现代 API 支持滞后（如 WebAssembly 的某些特性）

这种差异对前端开发者来说是日常痛点——你需要确保你的网站在所有主流引擎中都能正常工作。

### 2.6.5 如何测试跨引擎兼容性

如果你是一个前端开发者（或者未来想成为一个），这里有一些实用的跨引擎测试方法：

```bash
# 在本地同时安装多个浏览器进行测试
# macOS/Linux 用户可以用 Playwright 自动化测试：
npm install playwright
npx playwright install  # 自动下载 Chromium、Firefox、WebKit

# 然后写一个简单的测试脚本：
```

```javascript
// test.js - 用 Playwright 在三个引擎中测试你的网页
const { chromium, firefox, webkit } = require('playwright');

async function testInAllBrowsers() {
  for (const browserType of [chromium, firefox, webkit]) {
    const browser = await browserType.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    
    // 截图对比
    await page.screenshot({ 
      path: `screenshot-${browserType.name()}.png` 
    });
    
    console.log(`${browserType.name()}: 页面加载成功`);
    await browser.close();
  }
}

testInAllBrowsers();
```

在线工具：
- **BrowserStack**：在真实设备和浏览器上测试
- **Can I Use**（caniuse.com）：查看 API 和 CSS 属性的浏览器支持情况
- **MDN Web Docs**：每个 API 文档底部都有浏览器兼容性表格

作为普通用户，你不需要关心这些。但了解"不同引擎可能有不同表现"这个事实，能帮助你理解为什么有时候同一个网站在不同浏览器里看起来不一样。

下一章，我们从宏观的产业格局转向微观的技术细节——当你在浏览器地址栏输入一个 URL 按下回车，到页面完整显示在屏幕上，这短短一秒钟里到底发生了什么？

---
title: "指纹、追踪与隐私"
chapter: 5
readTime: 25
description: "比 Cookie 更隐蔽的追踪技术：浏览器指纹。它是什么，怎么防，以及指纹浏览器是什么。"
---

## 5.1 当 Cookie 不够用了

### 5.1.1 Cookie 的局限

上一章我们讲了第三方 Cookie 如何被用于跨站追踪。但 Cookie 有一个"致命缺陷"（对追踪者来说）：**用户可以删除它**。

- 清除浏览器数据 → Cookie 消失
- 使用隐私模式 → Cookie 不会被保存
- Safari/Firefox 默认阻止第三方 Cookie → 追踪失效
- 安装广告拦截器 → 追踪脚本被阻止

广告行业需要一种更"持久"的追踪方式——即使用户清除了所有 Cookie、使用了隐私模式，依然能识别出"这是同一个人"。

这就是浏览器指纹（Browser Fingerprinting）。

### 5.1.3 指纹追踪 vs Cookie 追踪的本质区别

Cookie 追踪是"主动标记"——服务器给你贴一个标签，下次见到这个标签就认出你。你可以撕掉标签（删除 Cookie）。

指纹追踪是"被动识别"——不需要给你贴任何标签，只需要观察你的"长相"（设备特征）就能认出你。你不能改变自己的"长相"（除非换设备）。

```
Cookie 追踪（主动标记）：
服务器: "给你贴个标签 #12345"
浏览器: [存储标签]
下次访问: "我看到标签 #12345 了，是你！"
用户清除 Cookie: "标签没了，我不认识你了"

指纹追踪（被动识别）：
服务器: "让我看看你的特征..."
服务器: "1920×1080 + RTX 4060 + 23种字体 + Chrome 125..."
服务器: "这个组合我见过，是你！"
用户清除 Cookie: "没用，你的特征没变，我还是认识你"
```

### 5.1.2 什么是浏览器指纹

浏览器指纹的原理很简单：**你的浏览器在访问网页时，会暴露大量关于你设备的信息。把这些信息组合起来，就能生成一个几乎唯一的标识符——就像人的指纹一样。**

单独看每一项信息都不足以识别你：

- 屏幕分辨率是 1920×1080？全世界有几亿人都是这个分辨率。
- 操作系统是 Windows 11？几亿人。
- 浏览器是 Chrome 125？几千万人。
- 时区是 UTC+8？十几亿人。

但当你把几十项这样的信息组合起来：

- 1920×1080 + Windows 11 + Chrome 125 + UTC+8 + 安装了 23 种字体 + GPU 是 NVIDIA RTX 4060 + 语言是 zh-CN + 有 3 个浏览器插件 + Canvas 渲染哈希是 `a7f3b2c1` + WebGL 渲染哈希是 `d4e5f6a7` + AudioContext 指纹是 `b8c9d0e1` + ...

这个组合在全球可能只有你一个人匹配。研究表明，浏览器指纹通常有超过 30 比特的熵（entropy），这意味着它可以在超过 10 亿人中唯一识别一个用户。


## 5.2 指纹采集的技术手段

### 5.2.1 基础信息

网站可以通过 JavaScript 轻松获取的基础信息：

```javascript
// 这些信息任何网页都可以读取，不需要任何权限
const fingerprint = {
  // 屏幕信息
  screenWidth: screen.width,           // 1920
  screenHeight: screen.height,         // 1080
  colorDepth: screen.colorDepth,       // 24
  devicePixelRatio: window.devicePixelRatio,  // 1.5

  // 浏览器信息
  userAgent: navigator.userAgent,      // "Mozilla/5.0 (Windows NT 10.0..."
  language: navigator.language,        // "zh-CN"
  languages: navigator.languages,      // ["zh-CN", "zh", "en"]
  platform: navigator.platform,        // "Win32"
  hardwareConcurrency: navigator.hardwareConcurrency,  // 8 (CPU 核心数)
  deviceMemory: navigator.deviceMemory,  // 8 (内存 GB 数)

  // 时间信息
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,  // "Asia/Shanghai"
  timezoneOffset: new Date().getTimezoneOffset(),  // -480

  // 存储和功能检测
  cookieEnabled: navigator.cookieEnabled,
  localStorage: !!window.localStorage,
  sessionStorage: !!window.sessionStorage,
  indexedDB: !!window.indexedDB,

  // 触控支持
  touchSupport: navigator.maxTouchPoints,  // 0 (桌面) 或 10 (触屏)
};
```

这些信息本身是浏览器正常工作所需要暴露的——网页需要知道屏幕大小来做响应式布局，需要知道语言来显示正确的内容。但它们被追踪者"借用"了。

### 5.2.2 Canvas 指纹

Canvas 指纹是最强大的指纹技术之一。原理是：让浏览器在一个隐藏的 `<canvas>` 元素上绘制特定的图形和文字，然后读取渲染结果的像素数据。

```javascript
// Canvas 指纹采集示例
function getCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');

  // 绘制文字（不同系统的字体渲染有微小差异）
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(0, 0, 200, 50);
  ctx.fillStyle = '#069';
  ctx.fillText('Browser Fingerprint 🖐️', 2, 15);

  // 绘制图形
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.beginPath();
  ctx.arc(50, 30, 10, 0, Math.PI * 2);
  ctx.fill();

  // 读取像素数据并生成哈希
  const dataURL = canvas.toDataURL();
  return hashFunction(dataURL);  // 返回一个唯一的哈希值
}
```

为什么同样的绘制指令在不同设备上会产生不同的结果？因为：

- 不同的 GPU 有不同的渲染精度和抗锯齿算法
- 不同的操作系统有不同的字体渲染引擎（Windows 用 DirectWrite，macOS 用 Core Text）
- 不同的字体版本有微小的字形差异
- 不同的显卡驱动有不同的颜色处理方式

这些差异在肉眼看来完全相同，但在像素级别是不同的。

### 5.2.3 WebGL 指纹

WebGL 指纹利用了 3D 图形渲染的差异：

```javascript
function getWebGLFingerprint() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');

  // 获取 GPU 信息
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  // 例如: "NVIDIA Corporation", "NVIDIA GeForce RTX 4060/PCIe/SSE2"

  // 获取支持的扩展列表
  const extensions = gl.getSupportedExtensions();

  // 渲染一个 3D 场景并读取像素
  // ...（类似 Canvas，但用 3D 渲染）

  return { vendor, renderer, extensions };
}
```

WebGL 指纹能直接暴露你的 GPU 型号——这是一个非常强的标识符，因为 GPU 型号的组合比操作系统或浏览器版本的组合多得多。

### 5.2.4 AudioContext 指纹

音频处理也能产生指纹：

```javascript
function getAudioFingerprint() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const analyser = audioCtx.createAnalyser();
  const gain = audioCtx.createGain();
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);

  // 生成一个音频信号并分析其频谱
  oscillator.type = 'triangle';
  oscillator.frequency.value = 10000;
  gain.gain.value = 0;  // 静音（用户听不到）

  oscillator.connect(analyser);
  analyser.connect(processor);
  processor.connect(gain);
  gain.connect(audioCtx.destination);

  // 不同设备的音频处理硬件会产生微小的差异
  // 这些差异可以被检测到并用作指纹
}
```

### 5.2.5 字体指纹

通过检测你的系统安装了哪些字体：

```javascript
function detectFonts() {
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New',
    'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS',
    'Impact', 'Lucida Console', '微软雅黑', '宋体', '黑体',
    // ... 测试几百种字体
  ];

  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';

  // 原理：用特定字体渲染文字，测量宽度
  // 如果宽度和默认字体不同，说明该字体存在
  const detected = [];
  const span = document.createElement('span');
  span.style.fontSize = testSize;
  span.textContent = testString;
  document.body.appendChild(span);

  for (const font of testFonts) {
    span.style.fontFamily = `'${font}', monospace`;
    const width = span.offsetWidth;
    // 如果宽度和纯 monospace 不同，说明字体存在
    if (width !== baseWidth) {
      detected.push(font);
    }
  }

  return detected;  // 例如: ["Arial", "微软雅黑", "宋体", ...]
}
```

不同用户安装的字体集合差异很大——设计师可能安装了几百种字体，普通用户只有系统默认的几十种。这个差异是很好的指纹信号。


## 5.3 指纹的威力：为什么它比 Cookie 更可怕

### 5.3.1 Cookie vs 指纹对比

| 特性 | Cookie | 浏览器指纹 |
|------|--------|-----------|
| 用户可见 | ✓（可在设置中查看） | ✗（完全隐形） |
| 用户可删除 | ✓ | ✗（无法"删除"你的硬件配置） |
| 隐私模式有效 | ✓（不保存 Cookie） | ✗（指纹不变） |
| 需要存储 | ✓（存在浏览器中） | ✗（无状态，每次实时计算） |
| 法律要求同意 | ✓（GDPR） | 理论上需要，但难以执行 |
| 跨浏览器追踪 | ✗ | 部分可以（如果硬件相同） |

指纹追踪最可怕的地方在于：**你无法感知它的存在，也无法通过简单的操作消除它**。清除 Cookie 是一键的事，但你不能"清除"你的 GPU 型号或屏幕分辨率。

### 5.3.2 指纹追踪的规模

2025 年约翰霍普金斯大学和德州农工大学的联合研究发现，大量网站在秘密使用浏览器指纹追踪用户。这些追踪脚本通常伪装成正常的网页功能代码，很难被检测到。

2026 年 4 月，The Register 报道指出 Chrome 浏览器缺乏任何有效的指纹防御机制——至少有 30 种不同的指纹技术可以在 Chrome 中正常工作。相比之下，Brave 和 Firefox 都实现了不同程度的指纹防护。

### 5.3.3 合法用途

指纹技术不全是邪恶的。它也有合法用途：

- **反欺诈**：银行用指纹检测异常登录（"这个设备从未登录过你的账户"）
- **反机器人**：区分真实用户和自动化脚本
- **设备认证**：作为多因素认证的一部分
- **许可证管理**：软件绑定到特定设备

问题不在于技术本身，而在于它被用于未经用户同意的追踪。


## 5.4 指纹浏览器：反向利用指纹技术

### 5.4.1 什么是指纹浏览器

"指纹浏览器"（Antidetect Browser）是一类特殊的浏览器工具，它的作用是**伪造浏览器指纹**——让同一台电脑上的多个浏览器实例看起来像是来自完全不同的设备。

常见的指纹浏览器有：Multilogin、GoLogin、AdsPower、Dolphin Anty 等。

### 5.4.2 工作原理

```
普通浏览器：
┌─────────────────────────────────┐
│  你的真实设备                     │
│  GPU: RTX 4060                   │
│  屏幕: 1920×1080                 │
│  字体: 45 种                     │
│  → 指纹: #A7F3B2C1              │
└─────────────────────────────────┘
无论开多少个窗口，指纹都是 #A7F3B2C1

指纹浏览器：
┌─────────────────────────────────┐
│  Profile 1（伪装）               │
│  GPU: Intel UHD 630（伪造）      │
│  屏幕: 1366×768（伪造）          │
│  字体: 32 种（伪造）             │
│  → 指纹: #D4E5F6A7              │
├─────────────────────────────────┤
│  Profile 2（伪装）               │
│  GPU: AMD RX 580（伪造）         │
│  屏幕: 2560×1440（伪造）         │
│  字体: 67 种（伪造）             │
│  → 指纹: #B8C9D0E1              │
├─────────────────────────────────┤
│  Profile 3（伪装）               │
│  GPU: Apple M1（伪造）           │
│  屏幕: 2560×1600（伪造）         │
│  字体: 28 种（伪造）             │
│  → 指纹: #F1E2D3C4              │
└─────────────────────────────────┘
每个 Profile 看起来像完全不同的设备
```

### 5.4.3 使用场景

指纹浏览器的用户群体比较特殊：

**灰色地带的用途：**
- **多账号运营**：在电商平台（Amazon、eBay）或社交媒体上运营多个账号，避免被平台检测到"同一个人"
- **广告投放**：广告从业者需要多个账号来测试不同的广告策略
- **价格比较**：某些网站会根据你的浏览历史显示不同价格，指纹浏览器可以绕过这种"杀熟"

**明确违规的用途：**
- 刷单、刷评论
- 薅羊毛（注册多个新用户领优惠）
- 规避平台封禁

**合法用途：**
- 隐私保护（不想被追踪的普通用户）
- 安全研究和渗透测试
- 新闻记者保护信源

### 5.4.4 指纹浏览器 vs 隐私浏览器

需要区分两个概念：

- **隐私浏览器**（如 Brave、Firefox、Tor Browser）：目标是保护你的隐私，让追踪者无法识别你。它们通过统一化或随机化指纹来实现。
- **指纹浏览器**（如 Multilogin、GoLogin）：目标是让你看起来像多个不同的人。它们通过伪造逼真的指纹来实现。

前者是防御性的，后者是进攻性的。


## 5.5 隐私浏览器对比

### 5.5.1 各浏览器的隐私防护策略

不同浏览器对指纹追踪采取了不同的防御策略：

**Chrome：几乎不防护**

截至 2026 年，Chrome 没有内置任何有效的指纹防护机制。Google 的立场是通过 Privacy Sandbox 提供"隐私保护的广告"，而不是阻止追踪本身。考虑到 Google 的广告业务，这不难理解。

**Firefox：增强型追踪保护（ETP）**

Firefox 的策略是"已知追踪者阻止"：
- 默认阻止已知的第三方追踪 Cookie
- 阻止已知的指纹采集脚本（基于 Disconnect 的追踪者列表）
- 提供 `privacy.resistFingerprinting` 选项（需手动开启），开启后会：
  - 统一报告时区为 UTC
  - 统一报告屏幕分辨率为窗口大小
  - 禁用某些字体枚举 API
  - 返回统一的 Canvas 和 WebGL 数据

```
Firefox 的 about:config 中：
privacy.resistFingerprinting = true  // 开启后大幅降低指纹唯一性
privacy.trackingprotection.fingerprinting.enabled = true
```

**Brave：随机化策略**

Brave 采用了一种独特的方法——**指纹随机化**：

- 不是阻止网站获取指纹信息（这会破坏网站功能）
- 而是每次返回略微不同的随机值
- Canvas 渲染结果每次都有微小的随机噪声
- WebGL 数据被轻微扰动
- 字体列表被随机化

这意味着追踪者每次获取的指纹都不同，无法将多次访问关联到同一个用户。

```
Brave 的指纹防护效果：
第一次访问: 指纹 = #A1B2C3D4
第二次访问: 指纹 = #E5F6A7B8  ← 不同！
第三次访问: 指纹 = #C9D0E1F2  ← 又不同！
追踪者无法确定这是同一个人
```

**Tor Browser：统一化策略**

Tor Browser 采用最极端的方法——让所有用户看起来一模一样：

- 所有 Tor 用户报告相同的屏幕分辨率（初始窗口大小）
- 所有用户报告相同的字体列表
- 所有用户报告相同的时区（UTC）
- 禁用 WebGL
- Canvas 返回空白数据
- 加上 Tor 网络的 IP 匿名化

代价是：很多网站功能受限，浏览体验较差。

### 5.5.2 隐私浏览器推荐

| 浏览器 | 引擎 | 指纹防护 | 广告拦截 | 易用性 | 适合人群 |
|--------|------|---------|---------|--------|---------|
| Brave | Chromium | 强（随机化） | 内置 | 高 | 想要隐私但不想折腾的人 |
| Firefox | Gecko | 中（需配置） | 需装扩展 | 中 | 愿意花时间配置的人 |
| Tor Browser | Gecko | 极强（统一化） | 内置 | 低 | 需要极端匿名的人 |
| Safari | WebKit | 中（ITP） | 需装扩展 | 高 | Apple 生态用户 |
| Mullvad Browser | Gecko | 强（类 Tor） | 内置 | 中 | 不需要 Tor 网络但想要 Tor 级隐私 |

对于大多数人，**Brave** 是最好的平衡点：它基于 Chromium（兼容性好、Chrome 扩展都能用），默认就有强大的隐私保护，不需要任何配置。

如果你更在意引擎多样性和开源理念，**Firefox + uBlock Origin + 隐私设置调优** 是另一个好选择。


## 5.6 你能做什么：实用隐私指南

### 5.6.1 基础防护（适合所有人）

1. **换一个有隐私保护的浏览器**：Brave 或配置好的 Firefox
2. **安装 uBlock Origin**：最好的广告和追踪拦截器（Firefox 版功能最完整）
3. **使用 HTTPS Everywhere**（或确保浏览器开启了"仅 HTTPS 模式"）
4. **不要随便安装浏览器扩展**：每个扩展都能读取你访问的所有网页内容
5. **定期清理 Cookie**：或设置浏览器关闭时自动清除

### 5.6.2 进阶防护

1. **使用 DNS over HTTPS（DoH）**：防止 ISP 看到你的 DNS 查询
   - Firefox：设置 → 隐私与安全 → DNS over HTTPS → 开启
   - 推荐 DNS：Cloudflare（1.1.1.1）或 Quad9（9.9.9.9）

2. **使用 VPN**：隐藏你的真实 IP 地址（但注意：VPN 提供商本身可以看到你的流量）

3. **Firefox 容器标签页**：把不同网站隔离在不同的"容器"中，防止跨站追踪
   ```
   容器 1 [工作]: Gmail, Google Drive
   容器 2 [社交]: Twitter, Reddit
   容器 3 [购物]: Amazon, 淘宝
   容器 4 [银行]: 网银
   → 每个容器有独立的 Cookie，互不干扰
   ```

4. **关闭不需要的浏览器 API**：
   ```
   Firefox about:config:
   media.peerconnection.enabled = false  // 防止 WebRTC 泄露真实 IP
   geo.enabled = false                   // 禁用地理位置
   dom.battery.enabled = false           // 禁用电池状态 API
   ```

### 5.6.3 检测你的指纹唯一性

你可以访问以下网站来查看你的浏览器指纹有多独特：

- **Cover Your Tracks**（EFF 的工具）：`coveryourtracks.eff.org`
- **BrowserLeaks**：`browserleaks.com`
- **CreepJS**：`abrahamjuliot.github.io/creepjs`

这些工具会告诉你：你的浏览器指纹在它们的数据库中有多独特。如果结果是"你的指纹在 X 万个样本中是唯一的"，那说明你很容易被追踪。


## 5.7 隐私的未来

### 5.7.1 技术军备竞赛

隐私保护和追踪技术之间是一场永无止境的军备竞赛：

```
追踪者发明 Cookie → 用户清除 Cookie
追踪者发明第三方 Cookie → 浏览器阻止第三方 Cookie
追踪者发明指纹追踪 → 浏览器随机化指纹
追踪者发明 CNAME 伪装 → 浏览器检测 CNAME 追踪
追踪者发明服务器端追踪 → ???
```

每当一种追踪技术被防御，追踪者就会发明新的技术。这场竞赛不会结束。

### 5.7.2 服务器端追踪：下一个战场

最新的趋势是"服务器端追踪"——追踪逻辑从浏览器端转移到服务器端。比如：

- 网站在自己的服务器上运行 Google Analytics，而不是在浏览器中加载 GA 脚本
- 追踪数据通过第一方域名发送，广告拦截器无法区分它和正常的网站请求

这种方式对用户来说几乎不可见，也很难被浏览器端的工具拦截。

### 5.7.3 立法是最终答案吗

技术手段有其局限性。最终，隐私保护可能需要依赖法律：

- **GDPR**（欧盟）：要求数据处理必须有合法基础，用户有权拒绝
- **CCPA/CPRA**（加州）：给予用户"不要出售我的个人信息"的权利
- **中国个人信息保护法**：2021 年生效，对个人信息处理有严格要求

但法律的执行力度和技术的发展速度之间总是有差距。在法律完善之前，技术自卫仍然是必要的。

### 5.7.4 一个思想实验

想象一下：如果你走在街上，每经过一家商店，商店的摄像头都会扫描你的脸，记录你的身高、体重、穿着、步态，然后把这些信息卖给广告公司。你会接受吗？

大多数人会说"不"。但这正是浏览器指纹在网上做的事情——只不过扫描的不是你的脸，而是你的设备特征。

线上和线下的隐私标准不应该有双重标准。如果我们不接受线下的无差别监控，我们也不应该接受线上的无差别追踪。

### 5.7.5 隐私不是"我没做坏事所以不怕"

一个常见的误解是："我又没做什么见不得人的事，为什么要在意隐私？"

这个逻辑的问题在于：

1. **隐私是一种权力关系**：当别人知道你的一切而你对他们一无所知时，你处于弱势。这种信息不对称可以被用来操纵你（精准广告就是一种温和的操纵）。

2. **"坏事"的定义会变**：今天合法的事情明天可能变成敏感的。你的浏览历史是永久的，但社会规范是变化的。

3. **数据泄露是常态**：即使你信任某家公司，它的数据库也可能被黑客攻破。你的数据越少被收集，泄露时的风险就越小。

4. **隐私是集体权利**：即使你个人不在意，大规模的数据收集会影响整个社会——它使得大规模监控、社会信用系统、选举操纵成为可能。

隐私不是"有什么要隐藏的"，而是"有什么要保护的"。

下一章，我们从技术和隐私的话题中跳出来，看看浏览器背后的公司——它们为什么要做浏览器，浏览器怎么赚钱，以及为什么"免费"的浏览器其实是最赚钱的生意。

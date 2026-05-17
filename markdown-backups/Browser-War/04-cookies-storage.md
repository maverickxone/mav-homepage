---
title: "Cookies、存储与登录态"
chapter: 4
readTime: 25
description: "Cookie 的发明、工作原理、第一方与第三方的区别，以及为什么每个网站都要你 Accept Cookies。"
---

## 4.1 HTTP 的"失忆症"

### 4.1.1 无状态协议的问题

HTTP 协议有一个根本特性：**无状态**（Stateless）。

这意味着服务器不会记住你是谁。每一次 HTTP 请求对服务器来说都是全新的、独立的——它不知道这个请求和上一个请求来自同一个人。

类比一下：想象一个患有短期失忆症的店员。你走进店里说"我要买一杯咖啡"，他给你做了。你说"再加一块蛋糕"，他问"你是谁？你要什么咖啡？"——因为他已经忘了你刚才说过什么。

这在 Web 的早期不是问题——那时候网页就是静态文档，你点一个链接看一篇文章，不需要"登录"或"购物车"这种概念。

但当 Web 开始商业化，问题就来了：

- 电商网站怎么记住你的购物车？
- 网站怎么知道你已经登录了？
- 论坛怎么记住你的语言偏好？

如果没有某种"记忆"机制，用户每点击一个链接、每加载一个新页面，都需要重新登录、重新选择偏好。这显然不可接受。

### 4.1.2 为什么 HTTP 要设计成无状态的

你可能会问：为什么不直接让 HTTP 有状态呢？

答案是：**简单性和可扩展性**。

无状态意味着服务器不需要为每个用户维护会话信息。一台服务器可以处理来自数百万用户的请求，而不需要记住每个人的状态。请求之间是独立的，可以被任何一台服务器处理——这让负载均衡和水平扩展变得简单。

有状态的协议（比如 FTP）需要维护连接状态，一旦连接断开，所有状态都丢失了。HTTP 的无状态设计让它天然适合互联网这种不可靠的网络环境。

所以解决方案不是改变 HTTP 协议本身，而是在 HTTP 之上加一层"记忆"机制。这就是 Cookie。


## 4.2 Cookie 的诞生

### 4.2.1 Lou Montulli 的发明

1994 年秋天，Netscape 的一位 23 岁的工程师 Lou Montulli 面临一个具体的问题：Netscape 的在线商店需要一个购物车功能，但 HTTP 的无状态特性让这变得不可能。

Montulli 考虑了几种方案：

**方案一：给每个用户一个永久 ID**

最简单的方法是让浏览器自动向每个网站发送一个唯一的用户标识符。但 Montulli 和 Netscape 团队否决了这个方案——因为这意味着任何网站都能追踪你的浏览行为。一个广告商只要在多个网站上放置追踪代码，就能知道你访问了哪些网站。

**方案二：把状态存在 URL 里**

把用户信息编码在 URL 中（比如 `?user_id=12345&cart=item1,item2`）。问题是 URL 会出现在浏览器历史、服务器日志、书签里，不安全也不优雅。

**方案三：Cookie**

Montulli 最终设计了 Cookie：一小段文本数据，由服务器发送给浏览器存储，浏览器在后续请求中自动带回给**同一个**服务器。关键设计决策是：Cookie 只会被发送回设置它的那个域名，不会泄露给其他网站。

这个名字来源于计算机科学中的"magic cookie"概念——一个在程序之间传递的不透明数据令牌。

Montulli 写下了第一条 Cookie 的规范：

```
Set-Cookie: CUSTOMER=WILE_E_COYOTE; path=/; expires=Wednesday, 09-Nov-99 23:12:40 GMT
```

这行代码改变了互联网的历史。

### 4.2.2 Cookie 的讽刺

Montulli 发明 Cookie 的初衷是**保护隐私**——相比给每个用户一个全局 ID，Cookie 的设计确保了数据只在用户和特定网站之间流通。

但在两年之内，广告商就找到了绕过这个限制的方法：**第三方 Cookie**。这让 Cookie 从一个隐私保护工具变成了互联网上最大的隐私威胁之一。

Montulli 本人在后来的采访中说："我确实对世界的现状感到有些责任。"


## 4.3 Cookie 的工作原理

### 4.3.1 设置和发送

Cookie 的工作流程非常简单：

```
第一次访问：
浏览器 ──── GET /index.html ────────────────────▶ 服务器
浏览器 ◀─── 200 OK + Set-Cookie: session=abc123 ── 服务器
                     （服务器说："记住这个"）

第二次访问：
浏览器 ──── GET /profile + Cookie: session=abc123 ▶ 服务器
                     （浏览器自动带上 Cookie）
浏览器 ◀─── 200 OK（你的个人资料页面）──────────── 服务器
                     （服务器说："我认识你了"）
```

整个过程对用户是透明的——你不需要做任何事情，浏览器会自动处理 Cookie 的存储和发送。

### 4.3.2 Cookie 的属性

一个完整的 Cookie 有多个属性：

```http
Set-Cookie: session_id=abc123; Domain=example.com; Path=/; Expires=Thu, 01 Jan 2026 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax
```

| 属性 | 含义 |
|------|------|
| `session_id=abc123` | Cookie 的名称和值 |
| `Domain=example.com` | 这个 Cookie 属于哪个域名 |
| `Path=/` | 只在访问这个路径时发送 |
| `Expires` | 过期时间（过期后浏览器自动删除） |
| `Secure` | 只在 HTTPS 连接中发送 |
| `HttpOnly` | JavaScript 无法读取（防 XSS 攻击） |
| `SameSite=Lax` | 限制跨站请求时是否发送 |

### 4.3.3 用代码理解 Cookie

在浏览器的开发者工具（F12）中，你可以看到当前页面的所有 Cookie。你也可以用 JavaScript 操作 Cookie：

```javascript
// 读取所有 Cookie（返回一个字符串）
console.log(document.cookie);
// 输出: "theme=dark; language=zh-CN; visitor_id=xyz789"

// 设置一个新 Cookie
document.cookie = "username=Mav; max-age=86400; path=/";
// max-age=86400 表示 24 小时后过期

// 删除一个 Cookie（设置过期时间为过去）
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
```

注意：标记了 `HttpOnly` 的 Cookie 无法通过 JavaScript 读取。这是一个重要的安全特性——即使攻击者在你的页面上注入了恶意 JavaScript（XSS 攻击），他也无法窃取你的登录 Cookie。

### 4.3.4 Cookie 的限制

Cookie 有一些硬性限制：

- **大小限制**：每个 Cookie 最大 4KB
- **数量限制**：每个域名最多约 50 个 Cookie
- **总量限制**：浏览器总共存储的 Cookie 数量有上限
- **每次请求都会发送**：Cookie 会附加在每一个 HTTP 请求中，增加网络开销

这些限制意味着 Cookie 不适合存储大量数据。它的设计初衷就是存储一小段标识信息（比如一个 session ID），而不是存储实际的用户数据。


## 4.4 Session、Token 与登录态

### 4.4.1 Session（会话）

Cookie 本身只是一个存储机制。要实现"登录"功能，还需要一套逻辑。最传统的方式是 Session：

```
1. 用户提交用户名和密码
2. 服务器验证通过后，在服务器内存中创建一个 Session 对象：
   { id: "abc123", user: "Mav", loginTime: "2026-05-17 10:00" }
3. 服务器把 Session ID 通过 Cookie 发给浏览器：
   Set-Cookie: session_id=abc123; HttpOnly; Secure
4. 之后每次请求，浏览器自动带上这个 Cookie
5. 服务器收到请求，用 session_id 查找对应的 Session 对象
6. 找到了 → 用户已登录；没找到 → 未登录或已过期
```

```python
# 服务器端（Python Flask 示例）
from flask import Flask, session, request

app = Flask(__name__)
app.secret_key = 'super-secret-key'

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    if verify_password(username, password):
        session['user'] = username  # 创建 Session
        return '登录成功'
    return '密码错误', 401

@app.route('/profile')
def profile():
    if 'user' in session:  # 检查 Session
        return f'欢迎回来，{session["user"]}'
    return '请先登录', 401
```

Session 的问题是：状态存储在服务器端。如果你有多台服务器（负载均衡），用户的请求可能被分配到不同的服务器，而那台服务器上没有这个 Session。解决方案是用 Redis 等共享存储来保存 Session，但这增加了复杂性。

### 4.4.2 JWT Token（JSON Web Token）

现代应用更常用 JWT（JSON Web Token）。它的核心思想是：**把用户信息直接编码在 Token 里，服务器不需要存储任何状态**。

```
一个 JWT 长这样（三段用 . 分隔）：
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiTWF2IiwiZXhwIjoxNzE2MDAwMDAwfQ.signature

解码后：
Header:  {"alg": "HS256"}           ← 签名算法
Payload: {"user": "Mav", "exp": 1716000000}  ← 用户信息 + 过期时间
Signature: HMAC-SHA256(header + payload, secret_key)  ← 防篡改签名
```

```javascript
// 服务器端（Node.js 示例）
const jwt = require('jsonwebtoken');
const SECRET = 'my-secret-key';

// 登录时生成 Token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (verifyPassword(username, password)) {
    const token = jwt.sign(
      { user: username },
      SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });  // 返回给前端
  }
});

// 验证 Token
app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ message: `欢迎回来，${decoded.user}` });
  } catch (err) {
    res.status(401).json({ error: '未登录或 Token 已过期' });
  }
});
```

JWT 的优势是服务器无状态——任何一台服务器都能验证 Token 的有效性，不需要查询数据库或共享存储。缺点是 Token 一旦签发就无法撤销（除非等它过期），所以通常设置较短的过期时间。

### 4.4.3 Session vs JWT 对比

| 特性 | Session + Cookie | JWT |
|------|-----------------|-----|
| 状态存储 | 服务器端 | 客户端（Token 自包含） |
| 扩展性 | 需要共享 Session 存储 | 天然支持多服务器 |
| 撤销能力 | 可以随时删除 Session | 无法主动撤销 |
| 安全性 | Cookie 有 HttpOnly 保护 | 需要安全存储 Token |
| 适用场景 | 传统 Web 应用 | API、移动端、微服务 |


## 4.5 第一方 Cookie vs 第三方 Cookie

### 4.5.1 区别

这是理解 Cookie 隐私问题的关键：

**第一方 Cookie（First-Party Cookie）**：由你正在访问的网站设置的 Cookie。

比如你访问 `shopping.com`，`shopping.com` 设置了一个 Cookie 来记住你的购物车。这是第一方 Cookie——合理且必要。

**第三方 Cookie（Third-Party Cookie）**：由你正在访问的网站之外的域名设置的 Cookie。

比如你访问 `news.com`，页面上嵌入了 `ads.tracker.com` 的广告脚本。这个脚本设置了一个 Cookie，域名是 `tracker.com`。这就是第三方 Cookie。

### 4.5.2 第三方 Cookie 如何实现跨站追踪

```
你访问 news.com：
┌─────────────────────────────────────────┐
│  news.com                               │
│  ┌───────────────────────────────────┐  │
│  │ 新闻内容                           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ <iframe src="ads.tracker.com">    │  │ ← 嵌入的广告
│  │   tracker.com 设置 Cookie:        │  │
│  │   user_id=12345                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

你访问 shopping.com：
┌─────────────────────────────────────────┐
│  shopping.com                           │
│  ┌───────────────────────────────────┐  │
│  │ 商品列表                           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ <iframe src="ads.tracker.com">    │  │ ← 同一个广告商
│  │   浏览器自动发送 Cookie:           │  │
│  │   user_id=12345                   │  │
│  │   tracker.com 知道：               │  │
│  │   "12345 刚看了新闻，现在在购物"   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

通过在数千个网站上嵌入追踪代码，广告商可以构建出你的完整浏览画像：你看什么新闻、买什么东西、搜索什么内容、访问什么网站。然后用这些信息向你投放"精准广告"。

这就是为什么你在某个网站搜索了"跑步鞋"，然后在完全不相关的网站上看到跑步鞋广告的原因。

### 4.5.3 第三方 Cookie 的消亡（和反转）

各大浏览器对第三方 Cookie 的态度：

| 浏览器 | 态度 |
|--------|------|
| Safari | 2017 年起默认阻止第三方 Cookie（ITP） |
| Firefox | 2019 年起默认阻止第三方 Cookie（ETP） |
| Brave | 从诞生起就阻止第三方 Cookie |
| Chrome | 2020 年宣布要废弃 → 反复推迟 → 2024 年 7 月宣布放弃废弃计划 |

Chrome 的故事特别有意思：

- **2020 年**：Google 宣布将在两年内废弃 Chrome 中的第三方 Cookie，用 "Privacy Sandbox" 替代
- **2021-2024 年**：时间线反复推迟（2022 → 2023 → 2024 → 2025）
- **2024 年 7 月**：Google 突然宣布不再废弃第三方 Cookie，改为让用户自己选择
- **2025 年 4 月**：Google 宣布连用户选择的弹窗也不做了
- **2025 年 10 月**：Google 关闭了大部分 Privacy Sandbox API

为什么 Google 反悔了？因为 Google 80% 以上的收入来自广告，而第三方 Cookie 是在线广告定向投放的核心基础设施。废弃它等于自断财路。

这再次说明了一个问题：当浏览器厂商的商业利益和用户隐私冲突时，商业利益往往会赢。


## 4.6 为什么网站要你 "Accept Cookies"

### 4.6.1 GDPR 和 ePrivacy 指令

那些烦人的 Cookie 弹窗来自欧盟的两部法律：

**ePrivacy 指令（2002/58/EC，2009 年修订）**：直接规定了"在用户设备上存储或访问信息（包括 Cookie）之前，必须获得用户的知情同意"。这是 Cookie 弹窗的直接法律依据。

**GDPR（2016/679，2018 年生效）**：定义了什么是"有效同意"——必须是自由给予的、具体的、知情的、明确的。这意味着：

- ✗ 预勾选的复选框不算同意
- ✗ "继续浏览即表示同意"不算同意
- ✗ 只有"接受"按钮没有"拒绝"按钮不算有效选择
- ✓ 必须有同样醒目的"接受"和"拒绝"按钮
- ✓ 必须告诉用户 Cookie 的具体用途
- ✓ 用户必须能随时撤回同意

### 4.6.2 Cookie 的分类

法律要求网站按用途对 Cookie 进行分类：

| 类别 | 需要同意？ | 例子 |
|------|-----------|------|
| 严格必要 | 不需要 | 登录状态、购物车、安全 Token |
| 功能性 | 需要 | 语言偏好、主题设置 |
| 分析/统计 | 需要 | Google Analytics、访问量统计 |
| 广告/追踪 | 需要 | 第三方广告 Cookie、行为追踪 |

"严格必要"的 Cookie 不需要同意——因为没有它们网站就无法正常工作。但所有其他类型的 Cookie 都需要在用户明确同意后才能设置。

### 4.6.3 为什么弹窗这么烦人

Cookie 弹窗的设计经常使用"暗黑模式"（Dark Patterns）来诱导用户点击"接受全部"：

- "接受"按钮是醒目的绿色大按钮，"拒绝"是灰色小字链接
- 要拒绝需要点击多次、进入设置页面逐个关闭
- "管理偏好"的界面故意设计得很复杂

这些做法在法律上是有问题的（法国 CNIL 曾因此对 Google 和 Facebook 各罚款 1.5 亿欧元），但执法力度有限，所以很多网站仍然这样做。

### 4.6.4 实际建议

作为用户：

- **直接点"拒绝全部"或"仅必要"**：网站功能基本不受影响
- **安装 Cookie 自动拒绝扩展**：如 "I don't care about cookies" 或 "Consent-O-Matic"，自动帮你拒绝非必要 Cookie
- **定期清理 Cookie**：浏览器设置里可以设置关闭时自动清除
- **使用隐私浏览模式**：关闭窗口后所有 Cookie 自动删除


## 4.7 浏览器的其他存储机制

Cookie 不是浏览器唯一的存储方式。现代浏览器提供了多种存储 API：

### 4.7.1 LocalStorage 和 SessionStorage

```javascript
// LocalStorage：持久存储，关闭浏览器后仍然存在
localStorage.setItem('theme', 'dark');
localStorage.setItem('fontSize', '16');
console.log(localStorage.getItem('theme'));  // "dark"

// SessionStorage：会话存储，关闭标签页后清除
sessionStorage.setItem('tempData', 'some value');
```

| 特性 | Cookie | LocalStorage | SessionStorage |
|------|--------|-------------|----------------|
| 容量 | 4KB | 5-10MB | 5-10MB |
| 生命周期 | 可设置过期时间 | 永久（除非手动清除） | 标签页关闭即清除 |
| 随请求发送 | ✓（每次都发） | ✗ | ✗ |
| JavaScript 访问 | 受 HttpOnly 限制 | ✓ | ✓ |
| 适用场景 | 身份认证、服务器通信 | 用户偏好、缓存数据 | 临时表单数据 |

LocalStorage 的一个重要优势是：它不会随每次 HTTP 请求发送给服务器。如果你只需要在浏览器端存储数据（比如用户的主题偏好），用 LocalStorage 比 Cookie 更合适——既不浪费带宽，容量也大得多。

### 4.7.2 IndexedDB

对于更复杂的数据存储需求，浏览器提供了 IndexedDB——一个完整的客户端数据库：

```javascript
// IndexedDB 可以存储结构化数据，支持索引和查询
const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore('articles', { keyPath: 'id' });
  store.createIndex('title', 'title', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  const tx = db.transaction('articles', 'readwrite');
  const store = tx.objectStore('articles');
  
  // 存储一篇文章（可以是几 MB 的数据）
  store.add({
    id: 1,
    title: '浏览器简史',
    content: '...(很长的文章内容)...',
    savedAt: new Date()
  });
};
```

IndexedDB 的容量可以达到数百 MB 甚至 GB 级别，适合离线应用（PWA）缓存大量数据。

### 4.7.3 存储机制总览

```
浏览器存储
├── Cookie（4KB，随请求发送，服务器可设置）
├── LocalStorage（5-10MB，持久，仅客户端）
├── SessionStorage（5-10MB，会话级，仅客户端）
├── IndexedDB（数百 MB+，结构化数据库，仅客户端）
├── Cache API（用于 Service Worker 缓存网络请求）
└── WebSQL（已废弃，被 IndexedDB 取代）
```


## 4.8 小结

Cookie 的故事是技术与商业博弈的缩影：

- 一个为了解决技术问题（HTTP 无状态）而发明的简单机制
- 被广告行业利用为跨站追踪工具
- 引发了全球性的隐私立法（GDPR、ePrivacy）
- 导致了今天每个网站都有的 Cookie 弹窗
- 而掌控最大浏览器的公司（Google）因为商业利益，至今不愿彻底解决这个问题

Cookie 本身是中性的技术。问题不在于 Cookie 的存在，而在于谁在用它、用来做什么。

但 Cookie 只是追踪技术的冰山一角。下一章，我们要讲一种比 Cookie 更隐蔽、更难防御的追踪技术：浏览器指纹。


## 4.9 动手实验：观察你的 Cookie

### 4.9.1 用开发者工具查看 Cookie

打开任意网站，按 F12 打开开发者工具，切换到 "Application"（Chrome/Edge）或 "Storage"（Firefox）标签页，你就能看到当前网站设置的所有 Cookie。

试试访问几个不同的网站，观察：
- 哪些网站设置了最多的 Cookie？
- 有没有来自第三方域名的 Cookie？
- Cookie 的过期时间是多久？
- 哪些 Cookie 标记了 HttpOnly 和 Secure？

### 4.9.2 用 curl 观察 HTTP 头

如果你有终端（命令行）环境，可以用 `curl` 命令直接观察 HTTP 响应中的 Cookie 设置：

```bash
# 查看服务器返回的 Set-Cookie 头
curl -I https://www.example.com

# 带上 Cookie 发送请求
curl -H "Cookie: session_id=abc123" https://www.example.com/profile

# 查看完整的请求和响应头（包括 Cookie）
curl -v https://www.example.com 2>&1 | grep -i cookie
```

### 4.9.3 一个简单的 Cookie 实验

你可以在浏览器控制台（F12 → Console）里直接实验 Cookie：

```javascript
// 设置一个 Cookie
document.cookie = "test_cookie=hello_world; max-age=60; path=/";

// 读取所有 Cookie
console.log(document.cookie);

// 60 秒后这个 Cookie 会自动消失
// 你也可以手动删除它：
document.cookie = "test_cookie=; max-age=0; path=/";
console.log(document.cookie);  // test_cookie 已经不在了
```

通过这些实验，你可以直观地感受到 Cookie 是如何工作的——它不是什么神秘的东西，就是一小段文本数据在浏览器和服务器之间来回传递。

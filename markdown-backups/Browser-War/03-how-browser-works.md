---
title: "一次请求的旅程——浏览器到底在干什么"
chapter: 3
readTime: 30
description: "从输入 URL 到页面显示，1 秒内发生的一切：DNS、TCP、TLS、HTTP、解析、渲染。"
---

## 3.1 序：一秒钟的奇迹

你在浏览器地址栏输入 `https://www.example.com`，按下回车。

大约 0.5 到 2 秒后，一个完整的网页出现在你面前——有文字、有图片、有动画、有交互按钮。

这短短的时间里，你的浏览器完成了以下所有事情：

1. 解析你输入的 URL
2. 查找域名对应的 IP 地址（DNS 解析）
3. 和服务器建立 TCP 连接（三次握手）
4. 在 TCP 之上建立加密通道（TLS 握手）
5. 发送 HTTP 请求
6. 接收服务器返回的 HTML
7. 解析 HTML，构建 DOM 树
8. 发现 CSS/JS/图片等资源，并行下载
9. 解析 CSS，构建 CSSOM 树
10. 执行 JavaScript
11. 合并 DOM 和 CSSOM，生成渲染树
12. 计算每个元素的位置和大小（布局）
13. 把元素画成像素（绘制）
14. 将图层合成并显示到屏幕上

每一步都涉及复杂的协议和算法。让我们一步步拆解。


## 3.2 第一步：URL 解析

### 3.2.1 URL 的结构

当你输入 `https://www.example.com:443/path/page.html?q=hello#section1` 时，浏览器首先要把这个字符串拆解成各个部分：

```
https://www.example.com:443/path/page.html?q=hello#section1
│        │               │   │              │       │
│        │               │   │              │       └── Fragment（片段）
│        │               │   │              └── Query（查询参数）
│        │               │   └── Path（路径）
│        │               └── Port（端口号）
│        └── Host（主机名/域名）
└── Scheme（协议）
```

- **Scheme（协议）**：`https` 表示使用加密的 HTTP 协议。如果是 `http` 则不加密。
- **Host（主机名）**：`www.example.com`，这是我们需要通过 DNS 解析成 IP 地址的部分。
- **Port（端口）**：`443` 是 HTTPS 的默认端口，通常可以省略。HTTP 的默认端口是 `80`。
- **Path（路径）**：`/path/page.html`，告诉服务器你要访问哪个资源。
- **Query（查询参数）**：`?q=hello`，附加的参数，通常用于搜索或过滤。
- **Fragment（片段）**：`#section1`，指向页面内的某个锚点。注意：这部分不会发送给服务器，只在浏览器端使用。

### 3.2.2 浏览器的"猜测"

现代浏览器在你输入 URL 的过程中就已经开始工作了：

- 如果你输入的不是完整 URL（比如只输入了 `example.com`），浏览器会自动补全协议（加上 `https://`）
- 如果你输入的看起来像搜索词而不是域名（比如 `what is DNS`），浏览器会把它发送给默认搜索引擎
- 浏览器还会根据你的历史记录提供自动补全建议
- 有些浏览器甚至会在你还没按回车时就开始预解析 DNS（DNS prefetch）


## 3.3 第二步：DNS 解析——互联网的电话簿

### 3.3.1 为什么需要 DNS

计算机之间通信用的是 IP 地址（比如 `142.250.80.46`），但人类记不住这些数字。DNS（Domain Name System，域名系统）就是互联网的"电话簿"——把人类能记住的域名（`www.google.com`）翻译成机器能理解的 IP 地址。

### 3.3.2 DNS 解析的完整过程

当浏览器需要解析 `www.example.com` 时，它会按以下顺序查找：

```
1. 浏览器 DNS 缓存
   │ 没找到？
   ▼
2. 操作系统 DNS 缓存
   │ 没找到？
   ▼
3. 本地 hosts 文件
   │ 没找到？
   ▼
4. 递归 DNS 解析器（通常是你的 ISP 或 8.8.8.8）
   │ 没找到？
   ▼
5. 根域名服务器（全球 13 组）
   │ "我不知道 example.com，但 .com 的管理者在这里"
   ▼
6. TLD 域名服务器（管理 .com 的服务器）
   │ "我不知道 www.example.com，但 example.com 的权威服务器在这里"
   ▼
7. 权威域名服务器（example.com 的管理者）
   │ "www.example.com 的 IP 是 93.184.216.34"
   ▼
8. 结果逐层返回并缓存
```

让我们用一个具体的类比来理解这个过程：

你想找"中国科学技术大学计算机学院张三教授"的办公室电话。

1. 先看自己手机通讯录（浏览器缓存）
2. 问室友（操作系统缓存）
3. 查学校通讯录（hosts 文件）
4. 打学校总机（递归解析器）
5. 总机说："我不知道，但中国的大学归教育部管"（根服务器）
6. 教育部说："科大的总机号码是 xxx"（TLD 服务器）
7. 科大总机说："计算机学院张三的电话是 xxx"（权威服务器）

### 3.3.3 DNS 缓存与 TTL

为了避免每次访问网站都要走完整个查询链路，DNS 结果会被缓存。每条 DNS 记录都有一个 TTL（Time To Live，生存时间），表示这条记录可以被缓存多久。

```
$ nslookup www.google.com
# 在终端里你可以用 nslookup 或 dig 命令查看 DNS 解析结果

# dig 命令的输出示例：
$ dig www.example.com

;; ANSWER SECTION:
www.example.com.    3600    IN    A    93.184.216.34
#                   ^^^^
#                   TTL = 3600 秒 = 1 小时
#                   在这 1 小时内，缓存的结果可以直接使用
```

DNS 解析通常耗时 20-100 毫秒。如果命中缓存，则接近 0 毫秒。


## 3.4 第三步：TCP 连接——三次握手

### 3.4.1 为什么需要 TCP

有了 IP 地址，浏览器就知道要和哪台服务器通信了。但在发送 HTTP 请求之前，需要先建立一个可靠的连接通道。

互联网的底层传输是不可靠的——数据包可能丢失、乱序、重复。TCP（Transmission Control Protocol，传输控制协议）的作用就是在不可靠的网络上建立可靠的连接：保证数据按顺序到达、不丢失、不重复。

### 3.4.2 三次握手

TCP 连接的建立需要"三次握手"（Three-Way Handshake）：

```
客户端（浏览器）                    服务器
    │                                │
    │──── SYN (seq=x) ──────────────▶│  第一次：客户端说"我想建立连接"
    │                                │
    │◀─── SYN-ACK (seq=y, ack=x+1) ─│  第二次：服务器说"好的，我也准备好了"
    │                                │
    │──── ACK (ack=y+1) ────────────▶│  第三次：客户端说"收到，开始通信吧"
    │                                │
    │         连接建立完成             │
```

为什么需要三次而不是两次？因为双方都需要确认对方能正常收发数据：

- 第一次握手：服务器确认"客户端能发送数据"
- 第二次握手：客户端确认"服务器能接收和发送数据"
- 第三次握手：服务器确认"客户端能接收数据"

三次握手需要一个 RTT（Round-Trip Time，往返时间）。如果服务器在美国，RTT 大约是 150-200 毫秒。

### 3.4.3 TCP 的代价

TCP 的可靠性是有代价的：

- **建立连接需要时间**：三次握手至少需要 1.5 个 RTT
- **慢启动**：TCP 不会一开始就全速发送数据，而是逐步增加发送速率（拥塞控制）
- **队头阻塞**：如果一个数据包丢失，后面的包都要等它重传

这也是为什么 HTTP/3 选择了基于 UDP 的 QUIC 协议——它在应用层自己实现了可靠传输，避免了 TCP 的一些固有限制。但这是后话了。


## 3.5 第四步：TLS 握手——建立加密通道

### 3.5.1 为什么需要加密

TCP 连接建立后，数据是明文传输的。这意味着任何能截获网络流量的人（比如同一个 WiFi 下的攻击者、你的 ISP、网络中间的路由器）都能看到你发送和接收的所有内容——包括密码、银行卡号、私人消息。

TLS（Transport Layer Security，传输层安全协议）在 TCP 之上建立了一个加密通道。HTTPS 中的 "S" 就是 Secure，指的就是 TLS 加密。

### 3.5.2 TLS 1.3 握手过程

TLS 1.3（2018 年发布的最新版本）将握手简化为只需要 1 个 RTT：

```
客户端（浏览器）                         服务器
    │                                     │
    │── ClientHello ─────────────────────▶│
    │   • 支持的加密算法列表               │
    │   • 客户端随机数                     │
    │   • 客户端的 DH 公钥                 │
    │                                     │
    │◀─ ServerHello + 证书 + Finished ────│
    │   • 选定的加密算法                   │
    │   • 服务器随机数                     │
    │   • 服务器的 DH 公钥                 │
    │   • 服务器证书（证明身份）            │
    │   • 握手完成确认                     │
    │                                     │
    │── Finished ────────────────────────▶│
    │   （此后所有数据都是加密的）          │
    │                                     │
    │◀═══════ 加密通信开始 ═══════════════│
```

这里面有几个关键概念：

**非对称加密 + 对称加密**

TLS 使用两种加密方式的组合：
- **非对称加密**（如 RSA、ECDH）：用于握手阶段交换密钥。特点是有公钥和私钥，公钥加密的数据只有私钥能解密。安全但慢。
- **对称加密**（如 AES-256-GCM）：用于实际数据传输。特点是加密和解密用同一个密钥。快但需要双方事先共享密钥。

TLS 的巧妙之处在于：用非对称加密安全地交换一个对称密钥，然后用这个对称密钥加密后续所有通信。

**证书验证**

服务器会发送一个数字证书，证明"我确实是 www.example.com"。浏览器会验证：
1. 证书是否由受信任的证书颁发机构（CA）签发
2. 证书是否在有效期内
3. 证书上的域名是否和你访问的域名匹配

如果验证失败，浏览器会显示那个可怕的"您的连接不是私密连接"警告页面。

### 3.5.3 时间开销

TLS 1.3 握手需要 1 个 RTT（约 50-200ms，取决于服务器距离）。加上之前 TCP 的 1 个 RTT，光是建立连接就需要 2 个 RTT。

如果你之前访问过这个网站，TLS 1.3 支持 "0-RTT 恢复"——利用之前保存的会话信息，可以在第一个数据包里就携带加密的请求数据，省去一个 RTT。


## 3.6 第五步：HTTP 请求与响应

### 3.6.1 发送请求

加密通道建立后，浏览器终于可以发送 HTTP 请求了。一个典型的 HTTP GET 请求长这样：

```http
GET /index.html HTTP/2
Host: www.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0
Accept: text/html,application/xhtml+xml
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Accept-Encoding: gzip, br
Connection: keep-alive
Cookie: session_id=abc123; theme=dark
```

每一行都是一个"请求头"（Header），告诉服务器各种信息：

- `GET /index.html`：我要获取（GET）这个路径的资源
- `Host`：我要访问的域名（一台服务器可能托管多个网站）
- `User-Agent`：我是什么浏览器（服务器可能根据这个返回不同内容）
- `Accept`：我能接受什么格式的响应
- `Accept-Encoding`：我支持什么压缩算法（gzip、brotli）
- `Cookie`：我之前存储的 Cookie（第四章详细讲）

### 3.6.2 接收响应

服务器处理请求后，返回一个 HTTP 响应：

```http
HTTP/2 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 45678
Content-Encoding: br
Cache-Control: max-age=3600
Set-Cookie: visitor_id=xyz789; Path=/; Secure; HttpOnly

<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例网站</title>
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
</head>
<body>
  <h1>欢迎</h1>
  <img src="/images/hero.webp" alt="首页图片">
  ...
</body>
</html>
```

关键响应头：

- `200 OK`：请求成功（404 = 没找到，500 = 服务器错误，301 = 永久重定向）
- `Content-Type`：响应内容的类型（HTML、JSON、图片等）
- `Content-Encoding: br`：内容用 Brotli 算法压缩了（浏览器需要解压）
- `Cache-Control`：告诉浏览器可以缓存这个响应 3600 秒
- `Set-Cookie`：让浏览器存储一个新的 Cookie

### 3.6.3 HTTP/2 和 HTTP/3

现代浏览器使用的是 HTTP/2 或 HTTP/3，相比古老的 HTTP/1.1 有巨大改进：

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 多路复用 | ✗（一个连接一次一个请求） | ✓（一个连接并行多个请求） | ✓ |
| 头部压缩 | ✗ | ✓（HPACK） | ✓（QPACK） |
| 服务器推送 | ✗ | ✓ | ✓ |
| 底层协议 | TCP | TCP | QUIC (UDP) |
| 队头阻塞 | 严重 | TCP 层仍有 | 完全解决 |

HTTP/2 的多路复用是一个巨大的改进：在 HTTP/1.1 时代，浏览器要同时下载 CSS、JS、图片等多个资源，需要开多个 TCP 连接（通常 6 个）。HTTP/2 允许在一个连接上并行发送多个请求，大幅减少了连接开销。


## 3.7 第六步：HTML 解析与 DOM 构建

### 3.7.1 从文本到树

浏览器收到 HTML 文本后，需要把它解析成一个结构化的数据——DOM 树（Document Object Model，文档对象模型）。

```html
<!-- 原始 HTML 文本 -->
<html>
  <head>
    <title>Hello</title>
  </head>
  <body>
    <h1>标题</h1>
    <p>段落 <a href="/link">链接</a></p>
  </body>
</html>
```

解析后的 DOM 树：

```
Document
└── html
    ├── head
    │   └── title
    │       └── "Hello"
    └── body
        ├── h1
        │   └── "标题"
        └── p
            ├── "段落 "
            └── a (href="/link")
                └── "链接"
```

DOM 树是浏览器内部对网页结构的表示。JavaScript 可以通过 DOM API 来读取和修改这棵树：

```javascript
// JavaScript 操作 DOM 的例子
const title = document.querySelector('h1');
console.log(title.textContent);  // "标题"

title.textContent = '新标题';    // 修改 DOM → 页面立即更新
title.style.color = 'red';       // 改变样式 → 触发重新渲染
```

### 3.7.2 解析过程中的"阻塞"

HTML 解析不是一帆风顺的。当解析器遇到某些标签时，它必须暂停：

**`<script>` 标签（无 defer/async）**：解析器必须停下来，等 JavaScript 下载并执行完毕。因为 JS 可能会修改 DOM（比如 `document.write()`），解析器不知道后面的 HTML 还有没有意义。

```html
<!-- 这会阻塞 HTML 解析 -->
<script src="/js/heavy-script.js"></script>

<!-- 这不会阻塞（defer = 延迟到 HTML 解析完再执行） -->
<script src="/js/app.js" defer></script>

<!-- 这也不会阻塞（async = 下载完就执行，不等 HTML 解析） -->
<script src="/js/analytics.js" async></script>
```

这就是为什么前端开发的最佳实践是：把 `<script>` 标签放在 `<body>` 底部，或者使用 `defer`/`async` 属性。

**`<link rel="stylesheet">` 标签**：CSS 不会阻塞 HTML 解析，但会阻塞渲染——浏览器不会在 CSS 加载完之前显示任何内容，否则用户会看到一个没有样式的"裸"页面闪烁一下再变正常（这叫 FOUC，Flash of Unstyled Content）。

### 3.7.3 并行资源加载

虽然 `<script>` 会阻塞解析，但现代浏览器有一个"预加载扫描器"（Preload Scanner）——它会在主解析器被阻塞时，提前扫描后面的 HTML，发现需要下载的资源（CSS、JS、图片），并提前开始下载。

这是一个纯粹的性能优化，对最终结果没有影响，但能显著减少页面加载时间。


## 3.8 第七步：CSS 解析与渲染树

### 3.8.1 CSSOM 树

CSS 也会被解析成一棵树——CSSOM（CSS Object Model）：

```css
/* 原始 CSS */
body { font-size: 16px; color: #333; }
h1 { font-size: 2em; color: blue; }
p { line-height: 1.6; }
.hidden { display: none; }
```

CSSOM 树记录了每个元素应该有什么样式。它和 DOM 树的结构类似，但存储的是样式信息而不是内容。

### 3.8.2 样式计算：级联与继承

CSS 的全称是 Cascading Style Sheets（层叠样式表）。"层叠"意味着多个样式规则可以作用于同一个元素，浏览器需要按优先级决定最终使用哪个：

```css
/* 优先级从低到高 */
p { color: black; }              /* 元素选择器：优先级 0,0,1 */
.intro { color: blue; }          /* 类选择器：优先级 0,1,0 */
#main { color: red; }            /* ID 选择器：优先级 1,0,0 */
p { color: green !important; }   /* !important：最高优先级 */
```

浏览器还需要处理"继承"——某些属性（如 `color`、`font-size`）会从父元素传递给子元素，而另一些（如 `border`、`margin`）不会。

对于一个复杂的网页，样式计算可能涉及数千条规则和数千个 DOM 节点的匹配，这是一个计算密集的过程。

### 3.8.3 渲染树

DOM 树 + CSSOM 树 = 渲染树（Render Tree）。

渲染树只包含需要显示的元素。`display: none` 的元素不会出现在渲染树中，`<head>` 标签里的内容也不会。

```
DOM 树                    CSSOM                渲染树
─────                    ─────                ─────
html                                          
├── head (不可见)                              
└── body                 body{16px}           body
    ├── h1               h1{2em,blue}         ├── h1 "标题" [blue, 32px]
    ├── p                p{1.6 line-height}   ├── p "段落..."  [#333, 16px]
    └── div.hidden       .hidden{display:none} └── (不在渲染树中)
```


## 3.9 第八步：布局、绘制与合成

### 3.9.1 布局（Layout / Reflow）

有了渲染树，浏览器知道了"要显示什么"和"长什么样"，但还不知道"放在哪里"。布局阶段计算每个元素的精确位置和大小。

```
视口宽度: 1200px

body (width: 1200px, height: auto)
├── header (width: 1200px, height: 60px, top: 0)
├── main (width: 800px, height: 1500px, top: 60px, left: 200px)
│   ├── h1 (width: 800px, height: 45px, top: 60px)
│   ├── p  (width: 800px, height: 72px, top: 105px)
│   └── img (width: 400px, height: 300px, top: 177px)
└── sidebar (width: 200px, height: 1500px, top: 60px, left: 0)
```

布局是一个递归过程——父元素的大小可能取决于子元素的内容（比如 `height: auto`），而子元素的大小可能取决于父元素的宽度（比如 `width: 50%`）。浏览器需要多次遍历渲染树才能确定所有元素的最终位置。

**回流（Reflow）**：当 DOM 结构变化或元素尺寸变化时，浏览器需要重新计算布局。这是一个昂贵的操作。

```javascript
// 这段代码会触发多次回流（性能很差）：
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.style.width = container.offsetWidth + 'px';  // 读取 → 触发回流
  div.textContent = `Item ${i}`;
  container.appendChild(div);  // 写入 → 标记需要回流
}

// 优化后（只触发一次回流）：
const width = container.offsetWidth;  // 只读取一次
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.style.width = width + 'px';
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}
container.appendChild(fragment);  // 一次性插入
```

### 3.9.2 绘制（Paint）

布局完成后，浏览器知道了每个元素的位置和大小，接下来要把它们"画"出来。

绘制阶段将每个元素转换为绘制指令（类似于"在坐标 (100, 200) 画一个 300×200 的蓝色矩形"）。这些指令会被发送给图形系统（在 Chromium 中是 Skia 图形库）来生成实际的像素。

绘制的顺序很重要——后绘制的元素会覆盖先绘制的。CSS 的 `z-index` 属性就是用来控制绘制顺序的。

### 3.9.3 合成（Composite）

现代浏览器不会把整个页面画在一张"画布"上。它会把页面分成多个"图层"（Layer），分别绘制，然后由 GPU 合成最终画面。

哪些情况会创建新图层？

- `transform` 或 `opacity` 动画
- `position: fixed` 的元素
- `will-change` 属性
- `<video>`、`<canvas>` 元素
- 有 3D 变换的元素

为什么要分层？因为当某个图层变化时（比如一个动画），只需要重新绘制那个图层，其他图层保持不变。GPU 擅长做图层合成，这比重新绘制整个页面快得多。

```css
/* 这个动画只触发合成，不触发布局和绘制，所以很流畅 */
.smooth-animation {
  transform: translateX(100px);
  transition: transform 0.3s ease;
  /* transform 变化只需要 GPU 重新合成图层 */
}

/* 这个动画会触发布局 + 绘制 + 合成，性能差 */
.janky-animation {
  left: 100px;
  transition: left 0.3s ease;
  /* left 变化需要重新计算布局 → 重新绘制 → 重新合成 */
}
```


## 3.10 完整时间线

让我们把整个过程的时间加起来，看看一次典型的页面加载需要多久：

```
假设：服务器在美国西海岸，RTT ≈ 150ms

0ms     ─── URL 解析（瞬间）
0ms     ─── DNS 查询（假设缓存命中，0ms；未命中约 50-100ms）
0ms     ─── TCP 三次握手
150ms   ─── TCP 连接建立
150ms   ─── TLS 握手开始
300ms   ─── TLS 握手完成，发送 HTTP 请求
300ms   ─── 请求到达服务器
450ms   ─── 服务器处理请求（假设 50ms）
500ms   ─── 响应开始返回
650ms   ─── 浏览器收到第一个字节（TTFB: Time To First Byte）
650ms   ─── 开始解析 HTML
700ms   ─── 发现 CSS/JS 资源，开始并行下载
850ms   ─── CSS 下载完成，开始构建 CSSOM
900ms   ─── DOM + CSSOM 就绪，构建渲染树
920ms   ─── 布局计算完成
940ms   ─── 绘制完成
950ms   ─── 合成完成，第一帧显示（FCP: First Contentful Paint）
        ...
1200ms  ─── 图片加载完成，页面完全呈现（LCP: Largest Contentful Paint）
```

从按下回车到看到内容，大约 1 秒。这 1 秒里，你的浏览器跨越了半个地球，完成了数十次网络往返、数千次计算、数百万像素的绘制。

### 3.10.1 性能指标

Google 定义了几个关键的性能指标来衡量用户体验：

| 指标 | 含义 | 良好标准 |
|------|------|----------|
| TTFB | 从请求到收到第一个字节 | < 800ms |
| FCP | 第一次有内容显示 | < 1.8s |
| LCP | 最大内容元素显示 | < 2.5s |
| FID/INP | 用户首次交互到响应 | < 200ms |
| CLS | 页面布局偏移量 | < 0.1 |

这些指标被称为 Core Web Vitals，Google 会用它们来影响搜索排名——加载慢的网站在搜索结果中排名更低。这也是为什么前端性能优化是一个重要的工程领域。


## 3.11 浏览器的多进程架构（以 Chrome 为例）

### 3.11.1 进程分工

前面讲的所有步骤不是在一个进程里完成的。Chrome 使用多进程架构，不同的工作由不同的进程负责：

```
┌─────────────────────────────────────────────────┐
│              Browser Process（浏览器主进程）       │
│  • 地址栏、书签、前进/后退按钮                     │
│  • 网络请求的发起和管理                           │
│  • 文件访问权限控制                               │
└─────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Renderer 进程 │ │Renderer 进程 │ │Renderer 进程 │
│  (Tab 1)     │ │  (Tab 2)     │ │  (Tab 3)     │
│  • HTML 解析 │ │  • HTML 解析 │ │  • HTML 解析 │
│  • CSS 计算  │ │  • CSS 计算  │ │  • CSS 计算  │
│  • JS 执行   │ │  • JS 执行   │ │  • JS 执行   │
│  • 布局/绘制 │ │  • 布局/绘制 │ │  • 布局/绘制 │
└──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌──────────────┐ ┌──────────────┐
│  GPU 进程    │ │ Network 进程 │
│  • 图层合成  │ │  • 网络请求  │
│  • 3D 加速   │ │  • DNS/TLS   │
└──────────────┘ └──────────────┘
```

**为什么这样设计？**

1. **安全性**：Renderer 进程运行在沙箱（Sandbox）中，即使网页中的恶意代码获得了 Renderer 进程的控制权，它也无法访问文件系统或其他标签页的数据。
2. **稳定性**：一个标签页崩溃不会影响其他标签页。
3. **性能**：多个 Renderer 进程可以利用多核 CPU 并行工作。

**代价**：每个进程都有自己的内存空间，所以 Chrome 的内存占用比单进程浏览器高得多。这就是为什么 Chrome 是"内存大户"的原因。

### 3.11.2 站点隔离（Site Isolation）

从 2018 年开始，Chrome 实施了"站点隔离"——不同网站的内容运行在不同的 Renderer 进程中，即使它们在同一个标签页里（比如通过 iframe 嵌入）。

这是为了防御 Spectre 等 CPU 侧信道攻击——这类攻击可以让一个进程读取同一进程中其他网站的数据。站点隔离确保不同网站的数据在物理上就是隔离的。

代价是更高的内存占用，但安全性的提升是值得的。


## 3.12 小结

一次看似简单的网页访问，背后是数十年计算机科学积累的结晶：

- **DNS**：分布式数据库系统
- **TCP**：可靠传输协议
- **TLS**：现代密码学的工程应用
- **HTTP**：应用层协议设计
- **HTML/CSS 解析**：编译原理（词法分析、语法分析）
- **布局算法**：约束求解
- **GPU 合成**：计算机图形学
- **多进程架构**：操作系统原理

浏览器可能是普通用户每天使用的最复杂的软件之一。它把所有这些复杂性隐藏在一个简洁的界面后面，让你只需要输入一个地址就能访问全世界的信息。

下一章，我们聚焦于一个具体的技术细节：Cookie。它是怎么来的，为什么网站需要它，以及为什么现在每个网站都要你"Accept Cookies"。

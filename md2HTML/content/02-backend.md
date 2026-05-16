---
title: "后端：服务器背后的逻辑"
chapter: 2
readTime: 22
description: "前端是门面，后端是大脑——所有你看不到的计算、存储、验证，都发生在这里。"
---

## 后端到底是什么？

上一章说了，前端是"浏览器里运行的一切"。那后端就是**服务器上运行的一切**——用户看不到、摸不着，但在背后默默工作的程序。

举个例子：你在 B 站搜索"Rust 教程"，按下回车。这时候发生了什么？

1. 你的浏览器（前端）把搜索请求发送到 B 站的服务器
2. 服务器上的程序（后端）收到请求，去数据库里查找匹配的视频
3. 后端把查询结果打包成数据，发回给你的浏览器
4. 前端拿到数据，渲染成你看到的搜索结果页面

这里的第 2、3 步，就是后端在做的事。

:::callout 一句话定义
后端 = 运行在服务器上的程序，负责处理数据、执行逻辑、与数据库交互，然后把结果返回给前端。
:::

### 前端和后端的分工

| | 前端 | 后端 |
|---|------|------|
| 运行在哪 | 用户的浏览器 | 服务器 |
| 谁能看到代码 | 所有人（F12） | 只有开发者 |
| 负责什么 | 展示界面、用户交互 | 数据处理、业务逻辑、安全验证 |
| 语言 | HTML + CSS + JS | Python、Node.js、Java、Go 等 |
| 类比 | 餐厅的前台和菜单 | 厨房和后厨 |
| 安全性 | 不可信（用户可以篡改） | 可信（只有你能访问代码） |

### 为什么需要后端？

纯前端能做的事情是有限的。以下场景**必须**有后端：

**用户认证（登录/注册）**

密码不能存在前端——F12 一看就暴露了。密码必须发送到后端，后端用哈希算法（如 bcrypt）加密后存入数据库。下次登录时，用户输入密码，后端再次哈希并与数据库里的哈希值比对——匹配则登录成功。

整个过程中，明文密码只在传输的一瞬间存在（而且有 HTTPS 加密保护），数据库里存的是不可逆的哈希值。即使数据库被黑客拿到，他也无法还原出原始密码。

**数据持久化**

前端的数据在用户关闭浏览器后就没了（localStorage 除外，但那只是本地缓存，其他用户看不到）。如果你需要"用户 A 发的帖子，用户 B 也能看到"，就必须有一个中心化的数据库，由后端管理。

想想 B 站：你发的弹幕、评论、收藏——这些数据存在 B 站的服务器上，所以其他人也能看到。如果只有前端，这些数据只存在你自己的浏览器里，换台电脑就没了。

**敏感操作**

支付、权限控制、发送邮件、调用第三方 API（比如 OpenAI 的 API）——这些操作需要密钥或权限，不能暴露在前端。

比如你想在网站里接入 ChatGPT：OpenAI 的 API Key 如果写在前端 JS 里，任何人 F12 就能看到，然后用你的 Key 疯狂调用，账单全算你头上。正确做法是：前端发请求给你的后端，后端用 API Key 调用 OpenAI，再把结果返回给前端。

**计算密集型任务**

图片压缩、视频转码、AI 推理、大数据分析——这些放在用户浏览器里跑会卡死（而且不同用户的设备性能差异巨大），放在服务器上跑更合理、更可控。

**多用户协作**

在线文档（如腾讯文档）、多人游戏、实时聊天——这些需要一个"中心节点"来协调多个用户之间的数据同步。这个中心节点就是后端。

---

## 后端的组成部分

后端不是一个单一的东西，它通常由几个部分组成：

### Web 服务器（接待员）

Web 服务器是最外层的"门卫"，负责接收来自互联网的请求，然后决定怎么处理。

**Nginx** 就是一个 Web 服务器。但注意——Nginx 本身不算"后端应用程序"，它更像是一个**流量调度员**：

- 如果请求的是静态文件（HTML、CSS、图片），Nginx 直接从硬盘读取返回，不需要后端程序参与
- 如果请求的是动态内容（比如 `/api/search?q=rust`），Nginx 把请求转发给后端程序处理

这个"转发"的过程叫做**反向代理（Reverse Proxy）**——第四章会详细讲。

所以回答你的问题："Nginx 是后端吗？"——严格来说，Nginx 是**基础设施层**，不是业务逻辑层。它不处理"用户登录"、"查询数据"这些业务，它只负责"把请求送到正确的地方"。但在广义上，Nginx 确实运行在服务器端，属于"后端"的一部分。

### 应用服务器（厨师）

这是真正的"后端程序"——你用 Python、Node.js 或其他语言写的代码，运行在服务器上，处理业务逻辑。

比如一个简单的后端程序可能做这些事：
- 收到 `/api/login` 请求 → 验证用户名密码 → 返回登录令牌（Token）
- 收到 `/api/posts` 请求 → 从数据库查询文章列表 → 返回 JSON 数据
- 收到 `/api/upload` 请求 → 保存用户上传的文件 → 返回文件地址
- 收到 `/api/ai/chat` 请求 → 调用 OpenAI API → 返回 AI 回复

### 数据库（仓库）

数据库是存储数据的地方。你可以把它想象成一个超级强大的 Excel 表格——但它能存储几百万行数据，支持复杂的查询，而且多个程序可以同时读写。

常见的数据库：

| 数据库 | 类型 | 特点 | 适合场景 |
|--------|------|------|----------|
| PostgreSQL | 关系型 | 功能强大，标准 SQL | 大部分 Web 应用 |
| MySQL | 关系型 | 历史悠久，生态好 | 传统 Web 应用 |
| SQLite | 嵌入式关系型 | 单文件，零配置 | 小项目、原型开发 |
| MongoDB | 文档型 | JSON 格式存储，灵活 | 数据结构不固定的场景 |
| Redis | 键值型 | 内存存储，极快 | 缓存、会话管理 |

**关系型数据库**用表格存储数据，表和表之间可以建立关联（比如"用户表"和"文章表"通过 user_id 关联）。查询用 SQL 语言：

```sql
-- 查询所有文章，按时间倒序
SELECT * FROM posts ORDER BY created_at DESC;

-- 查询某个用户的所有文章
SELECT * FROM posts WHERE author_id = 42;

-- 插入一篇新文章
INSERT INTO posts (title, content, author_id)
VALUES ('学习后端', '后端其实没那么难...', 42);
```

对于大一学生的小项目，**SQLite** 是最好的起步选择——它不需要安装任何东西，数据库就是一个文件，用完可以直接删掉。等项目变大了再迁移到 PostgreSQL。

### 缓存层（快速通道）

数据库查询是相对慢的操作（需要读硬盘）。如果某个数据被频繁访问（比如首页的热门文章列表），每次都查数据库很浪费。

**缓存**就是把常用数据存在内存里（比如 Redis），下次请求直接从内存读取，速度快几十倍。

```
用户请求 → 后端检查缓存
  ├── 缓存命中 → 直接返回（快！）
  └── 缓存未命中 → 查数据库 → 存入缓存 → 返回
```

对于个人项目，你暂时不需要缓存。但知道这个概念有助于理解大型网站的架构。

---

## 后端语言有哪些？

后端不像前端被锁死在 JS 上——你可以用几乎任何编程语言写后端。主流选择：

| 语言 | 代表框架 | 特点 | 典型用户 |
|------|----------|------|----------|
| JavaScript (Node.js) | Express, Nest.js | 前后端同语言，生态庞大 | 全栈开发者、创业公司 |
| Python | Flask, FastAPI, Django | 语法简单，AI/数据生态好 | 数据科学、AI 应用 |
| Java | Spring Boot | 企业级，性能好，生态成熟 | 大公司、银行、电商 |
| Go | Gin, Echo | 高性能，编译快，并发强 | 云原生、微服务 |
| Rust | Actix, Axum | 极致性能，内存安全 | 高性能系统 |
| PHP | Laravel | 老牌 Web 语言 | WordPress、传统网站 |
| C# | ASP.NET | 微软生态 | 企业应用、游戏后端 |

### 我推荐 Node.js (Express) 入手

对于你的背景，我推荐从 **Node.js (Express)** 入手，原因是：

1. **语言统一**：你已经接触过 JS（虽然不深），前后端用同一种语言，不需要切换思维
2. **概念迁移**：前端学的 `fetch`、JSON、异步——在 Node.js 后端里完全一样
3. **极其简洁**：Express 几行代码就能跑起来一个后端
4. **生态庞大**：npm 上有几百万个包，几乎什么功能都有现成的轮子
5. **学习资源多**：Node.js 是最流行的后端技术之一，教程遍地都是
6. **和你的工具链一致**：你的 md2HTML 就是 Node.js 写的，你已经装了 Node.js 环境

---

## Node.js + Express：从零开始

### 最小后端示例

先看一个最简单的后端程序长什么样：

```javascript
// server.js
const express = require('express');
const app = express();

// 定义一个路由：当用户访问 /hello 时，返回一段文字
app.get('/hello', (req, res) => {
  res.send('你好，这是后端返回的数据！');
});

// 定义一个 API：返回 JSON 数据
app.get('/api/time', (req, res) => {
  res.json({
    time: new Date().toISOString(),
    message: '当前服务器时间'
  });
});

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

运行方式：

```bash
# 创建项目
mkdir my-backend && cd my-backend
npm init -y
npm install express

# 启动
node server.js
```

然后打开浏览器访问 `http://localhost:3000/hello`，你就能看到后端返回的文字了。访问 `http://localhost:3000/api/time`，你会看到一段 JSON 数据。

这就是后端的核心模式：**定义路由 → 处理请求 → 返回响应**。

### 理解请求和响应

每次浏览器和后端的通信，都是一个"请求-响应"循环：

```
浏览器发送请求（Request）：
  - 方法：GET / POST / PUT / DELETE
  - URL：/api/posts
  - 请求头：Content-Type, Authorization 等
  - 请求体：POST/PUT 时携带的数据

后端返回响应（Response）：
  - 状态码：200（成功）、404（未找到）、500（服务器错误）
  - 响应头：Content-Type 等
  - 响应体：HTML 或 JSON 数据
```

常见的 HTTP 状态码：

| 状态码 | 含义 | 什么时候出现 |
|--------|------|-------------|
| 200 | OK，成功 | 正常返回数据 |
| 201 | Created，已创建 | 成功创建了新资源 |
| 301 | 永久重定向 | 网址搬家了 |
| 304 | 未修改 | 浏览器缓存仍然有效 |
| 400 | Bad Request | 请求参数有误 |
| 401 | Unauthorized | 未登录 |
| 403 | Forbidden | 没有权限 |
| 404 | Not Found | 页面/资源不存在 |
| 500 | Internal Server Error | 后端代码出 bug 了 |
| 502 | Bad Gateway | Nginx 转发失败（后端挂了） |
| 503 | Service Unavailable | 服务器过载 |

你在浏览网页时遇到的"404 页面"，就是后端告诉浏览器"你要的东西我这里没有"。

### 稍微复杂一点：带数据的 CRUD

CRUD 是后端最基本的操作模式：**C**reate（创建）、**R**ead（读取）、**U**pdate（更新）、**D**elete（删除）。

```javascript
const express = require('express');
const app = express();

// 解析 JSON 请求体
app.use(express.json());

// 模拟数据库（实际项目会用真正的数据库）
let posts = [
  { id: 1, title: '第一篇文章', content: '你好世界', author: 'Mav' },
  { id: 2, title: '第二篇文章', content: '学习后端', author: 'Mav' }
];
let nextId = 3;

// READ：获取所有文章
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// READ：获取单篇文章
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '文章不存在' });
  }
  res.json(post);
});

// CREATE：创建新文章
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }
  const newPost = { id: nextId++, title, content, author: author || '匿名' };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// UPDATE：更新文章
app.put('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '文章不存在' });
  }
  const { title, content } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  res.json(post);
});

// DELETE：删除文章
app.delete('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '文章不存在' });
  }
  posts.splice(index, 1);
  res.json({ message: '删除成功' });
});

app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'));
```

这个例子展示了一个完整的文章管理 API。前端可以通过 `fetch` 调用这些接口：

```javascript
// 前端代码：获取所有文章
const response = await fetch('/api/posts');
const posts = await response.json();

// 前端代码：创建新文章
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '新文章',
    content: '这是内容',
    author: 'Mav'
  })
});
const newPost = await response.json();
```

### 中间件（Middleware）：请求的"流水线"

Express 有一个强大的概念叫**中间件**——请求在到达最终处理函数之前，会经过一系列"中间处理步骤"。

```javascript
// 日志中间件：记录每个请求
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();  // 调用 next() 把请求传给下一个中间件
});

// 认证中间件：检查用户是否登录
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }
  // 验证 token...
  next();
}

// 只有登录用户才能创建文章
app.post('/api/posts', authMiddleware, (req, res) => {
  // 到这里说明已经通过认证了
  // ... 创建文章的逻辑
});
```

中间件的执行顺序就像流水线：

```
请求进来 → 日志中间件 → 认证中间件 → 路由处理 → 返回响应
```

如果某个中间件没有调用 `next()`，请求就停在那里了（比如认证失败直接返回 401）。

---

## Python (Flask)：另一种选择

如果你更熟悉 Python，Flask 是一个同样简洁的选择：

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

# 模拟数据库
posts = [
    {'id': 1, 'title': '第一篇文章', 'content': '你好世界'},
    {'id': 2, 'title': '第二篇文章', 'content': '学习后端'}
]

@app.route('/hello')
def hello():
    return '你好，这是 Flask 后端！'

@app.route('/api/posts')
def get_posts():
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    new_post = {
        'id': len(posts) + 1,
        'title': data['title'],
        'content': data['content']
    }
    posts.append(new_post)
    return jsonify(new_post), 201

@app.route('/api/time')
def get_time():
    from datetime import datetime
    return jsonify({
        'time': datetime.now().isoformat(),
        'message': '当前服务器时间'
    })

if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

运行方式：

```bash
pip install flask
python server.py
```

Flask 和 Express 的思路完全一样：定义路由，处理请求，返回数据。只是语法不同。Python 的装饰器（`@app.route`）对应 Express 的 `app.get()`。

:::callout-tip 选哪个？
- 如果你以后想做全栈（前端+后端都写），选 **Node.js**——一种语言走天下
- 如果你 Python 更熟、或者以后想做数据/AI 方向，选 **Flask/FastAPI**
- 如果你想要更好的性能和类型安全，可以考虑 **Go** 或 **Rust**（但学习曲线更陡）
- 两者都是好选择，不存在"错误答案"。先选一个用起来，以后随时可以换
:::

---

## 后端能在本地开发吗？

**当然可以！** 这是很多新手的误解——后端代码不是只能在服务器上写。

实际的开发流程是：

1. **本地开发**：在你自己的电脑上写代码、运行、调试
2. **本地测试**：用浏览器访问 `localhost:3000` 测试功能
3. **确认没问题后**：把代码部署到服务器上，让外网用户也能访问

这和前端的开发流程几乎一样——本地写，本地调，最后上传。唯一的区别是，后端程序需要一个"运行环境"（Node.js 或 Python），而前端只需要浏览器。

你的电脑就是一台"本地服务器"。`localhost`（或 `127.0.0.1`）就是指"这台电脑自己"。当你运行 `node server.js`，你的电脑就变成了一台后端服务器——只不过只有你自己能访问（因为没有公网 IP）。

### 本地开发的工具

| 工具 | 用途 |
|------|------|
| VS Code | 写代码 |
| 终端 | 运行 `node server.js` 或 `python server.py` |
| 浏览器 | 访问 `localhost:3000` 测试 |
| Postman / Insomnia | 测试 API（可以发送 POST、PUT 等请求） |
| nodemon | 文件修改后自动重启 Node.js（不用手动重启） |

```bash
# 安装 nodemon（开发时自动重启）
npm install -g nodemon

# 用 nodemon 代替 node 启动
nodemon server.js
# 现在每次你保存文件，服务器会自动重启
```

---

## API：前后端的"接口协议"

前端和后端之间通过 **API（Application Programming Interface）** 通信。你可以把 API 理解为一份"菜单"——前端看着菜单点菜（发请求），后端按照菜单做菜（处理请求并返回数据）。

### REST API：最常见的 API 风格

REST（Representational State Transfer）是目前最流行的 API 设计风格。它的核心思想是：

- 用 **URL** 表示"资源"（名词）
- 用 **HTTP 方法** 表示"操作"（动词）
- 用 **JSON** 传输数据

| 方法 | URL | 含义 | 类比 |
|------|-----|------|------|
| GET | `/api/posts` | 获取所有文章 | 看菜单 |
| GET | `/api/posts/42` | 获取第 42 篇文章 | 看某道菜的详情 |
| POST | `/api/posts` | 创建新文章 | 点一道新菜 |
| PUT | `/api/posts/42` | 更新第 42 篇文章 | 修改订单 |
| DELETE | `/api/posts/42` | 删除第 42 篇文章 | 取消订单 |

### JSON：前后端的"通用语言"

数据格式通常是 **JSON**（JavaScript Object Notation）：

```json
{
  "id": 42,
  "title": "学习后端",
  "content": "后端其实没那么难...",
  "author": {
    "name": "Mav",
    "email": "mav@example.com"
  },
  "tags": ["编程", "入门", "后端"],
  "createdAt": "2026-05-16T10:30:00Z",
  "published": true
}
```

JSON 的规则很简单：
- 用 `{}` 表示对象（键值对）
- 用 `[]` 表示数组
- 键必须用双引号
- 值可以是字符串、数字、布尔值、null、对象、数组

JSON 长得像 JS 对象（其实就是从 JS 来的），但它是纯文本格式，任何语言都能解析。这就是为什么前端用 JS、后端用 Python，它们之间依然能顺畅通信——因为中间传的是 JSON。

### 一个完整的前后端交互示例

假设你要做一个简单的"待办事项"应用：

**后端（Express）：**

```javascript
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));  // 提供前端静态文件

let todos = [];
let nextId = 1;

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const todo = { id: nextId++, text: req.body.text, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Not found' });
  todo.done = !todo.done;
  res.json(todo);
});

app.listen(3000);
```

**前端（放在 public/index.html）：**

```html
<!DOCTYPE html>
<html>
<head><title>待办事项</title></head>
<body>
  <h1>待办事项</h1>
  <input id="input" placeholder="输入待办事项...">
  <button onclick="addTodo()">添加</button>
  <ul id="list"></ul>

  <script>
    async function loadTodos() {
      const res = await fetch('/api/todos');
      const todos = await res.json();
      const list = document.getElementById('list');
      list.innerHTML = todos.map(t =>
        `<li style="${t.done ? 'text-decoration:line-through' : ''}"
             onclick="toggleTodo(${t.id})">${t.text}</li>`
      ).join('');
    }

    async function addTodo() {
      const input = document.getElementById('input');
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.value })
      });
      input.value = '';
      loadTodos();
    }

    async function toggleTodo(id) {
      await fetch(`/api/todos/${id}`, { method: 'PUT' });
      loadTodos();
    }

    loadTodos();  // 页面加载时获取数据
  </script>
</body>
</html>
```

这个例子虽然简单，但展示了前后端协作的完整模式：
- 前端负责展示 UI 和用户交互
- 后端负责存储数据和处理逻辑
- 它们通过 REST API + JSON 通信

---

## 认证与安全：后端最重要的职责

### 为什么前端验证不够？

你可能想："我在前端做了表单验证，用户不填密码就不能提交，这不就安全了吗？"

不够。因为前端验证可以被绕过——用户可以直接用 Postman 或 curl 发请求给你的后端，完全跳过前端。所以：

:::callout-warn 安全铁律
**永远不要信任来自前端的数据。** 所有验证必须在后端再做一遍。前端验证只是为了用户体验（即时反馈），不是为了安全。
:::

### Token 认证：现代 Web 的登录方式

传统网站用 Cookie + Session 管理登录状态。现代 Web 应用更多用 **JWT（JSON Web Token）**：

```
1. 用户输入用户名密码，前端发送到后端
2. 后端验证密码正确 → 生成一个 JWT Token → 返回给前端
3. 前端把 Token 存在 localStorage 里
4. 之后每次请求，前端在请求头里带上 Token
5. 后端收到请求，验证 Token 有效 → 允许操作
```

JWT 本质上是一段加密的 JSON，里面包含用户信息和过期时间。后端可以验证它是否被篡改（因为有签名），但不需要在服务器端存储会话信息。

```javascript
// 后端：登录接口
const jwt = require('jsonwebtoken');
const SECRET = 'your-secret-key';  // 实际项目用环境变量存储

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // 验证密码（实际项目用 bcrypt 比对哈希值）
  if (username === 'mav' && password === 'correct-password') {
    const token = jwt.sign({ userId: 1, username }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

// 后端：需要认证的接口
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '未登录' });

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ userId: decoded.userId, username: decoded.username });
  } catch {
    res.status(401).json({ error: 'Token 无效或已过期' });
  }
});
```

### 密码存储：永远不要存明文

如果你的数据库被黑客拿到（这种事经常发生），明文密码意味着所有用户的账号都暴露了。正确做法是存储密码的**哈希值**：

```javascript
const bcrypt = require('bcrypt');

// 注册时：哈希密码后存储
const hashedPassword = await bcrypt.hash('user-password', 10);
// 存入数据库的是类似 "$2b$10$X7..." 的哈希值

// 登录时：比对哈希值
const isMatch = await bcrypt.compare('user-input', hashedPassword);
```

哈希是**不可逆**的——你无法从哈希值还原出原始密码。即使数据库泄露，黑客也只能拿到一堆无意义的哈希字符串。

---

## 后端架构模式

随着项目变大，后端的组织方式也会演进：

### 单体架构（Monolith）

所有功能写在一个程序里。适合小项目和初期开发：

```
一个 Express 应用
├── 用户模块
├── 文章模块
├── 评论模块
└── 支付模块
```

优点：简单、部署方便、开发快
缺点：项目变大后代码臃肿、一个模块出 bug 可能影响全部

### 微服务架构（Microservices）

每个功能是独立的小服务，各自部署、各自扩展：

```
用户服务（独立部署）
文章服务（独立部署）
评论服务（独立部署）
支付服务（独立部署）
```

优点：各服务独立、可以用不同语言、故障隔离
缺点：复杂度高、运维成本大

:::callout 对大一学生的建议
**先用单体架构。** 微服务是大公司解决大规模问题的方案，对于个人项目和小团队来说，单体架构完全够用，而且开发效率高得多。不要过早优化。
:::

---

## 小结：前端与后端的完整图景

```
用户浏览器（前端）              服务器（后端）
┌──────────────────┐          ┌──────────────────────────┐
│                  │          │                          │
│  HTML/CSS/JS     │ ─请求──→ │  Nginx（Web 服务器）      │
│                  │          │    │                     │
│  用户看到的界面   │          │    ├─ 静态文件 → 直接返回  │
│                  │          │    └─ API 请求 → 转发     │
│  fetch('/api/x') │          │         ↓                │
│                  │ ←─响应── │  Express/Flask（应用）    │
│  渲染数据到页面   │          │         ↓                │
│                  │          │  PostgreSQL（数据库）     │
└──────────────────┘          │                          │
                              └──────────────────────────┘
```

核心要点：
- 前端负责"展示"和"交互"，后端负责"逻辑"和"数据"
- 它们通过 API（HTTP + JSON）通信
- 后端可以在本地开发和测试，和前端一样
- 安全验证必须在后端做，前端验证只是锦上添花
- Nginx 是流量调度员，不是业务逻辑处理者
- 数据库存储持久化数据，后端程序负责读写数据库

下一章，我们来看看这个"服务器"到底是什么——它的硬件配置怎么选，为什么你的 DigitalOcean 小机器就够用了。

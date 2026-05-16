---
title: "服务器——软件篇"
chapter: 4
readTime: 30
description: "SSH 连接、Nginx 配置、域名绑定、HTTPS——从零到网站上线的完整链路。"
---

## SSH：远程连接你的服务器

服务器没有显示器，你不能走过去敲键盘。那怎么操作它？答案是 **SSH（Secure Shell）**——一种加密的远程连接协议。

### SSH 的基本原理

SSH 让你通过网络，在自己的电脑上打开一个"远程终端"，就像坐在服务器面前敲命令一样。所有传输的数据都是加密的——即使有人截获了你的网络流量，看到的也只是一堆乱码。

最简单的连接方式：

```bash
ssh root@143.198.123.45
```

这行命令的意思是："用 root 用户身份，通过 SSH 连接到 IP 为 143.198.123.45 的服务器"。

第一次连接时，你会看到类似这样的提示：

```
The authenticity of host '143.198.123.45' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no)?
```

这是在问你："我没见过这台服务器，你确定要连吗？"输入 `yes`，以后就不会再问了（服务器的指纹会被记录在你电脑的 `~/.ssh/known_hosts` 文件里）。

### 为什么不推荐密码登录？

输入密码登录看起来很方便，但**极其不安全**。原因：

**互联网上有大量的自动化攻击脚本（bot）**，24 小时不间断地扫描所有公网 IP 的 22 端口（SSH 默认端口），尝试用常见用户名和密码暴力破解。

这不是夸张——你可以在新服务器上运行这个命令看看：

```bash
# 查看有多少人尝试暴力登录你的服务器
sudo cat /var/log/auth.log | grep "Failed password" | wc -l
```

一台新开的服务器，**几小时内**就会收到成百上千次暴力登录尝试。常见的攻击模式：

```
Failed password for root from 185.234.xx.xx port 54321
Failed password for root from 185.234.xx.xx port 54322
Failed password for admin from 103.45.xx.xx port 12345
Failed password for ubuntu from 45.67.xx.xx port 33333
```

这些 bot 会尝试：
- 常见用户名：`root`、`admin`、`ubuntu`、`test`、`user`
- 常见密码：`123456`、`password`、`admin123`、`root`、`qwerty`
- 字典攻击：用几百万个常见密码逐个尝试

如果你的密码不够复杂，被破解只是时间问题。一旦被攻破，黑客可以：
- 在你的服务器上挖矿（消耗你的 CPU 和电费）
- 把你的服务器当作攻击其他服务器的跳板
- 窃取你的数据
- 植入后门

### SSH 密钥认证：正确的方式

SSH 密钥认证用的是**非对称加密**（也叫公钥加密）。核心思想：

- **私钥（Private Key）**：一把只有你自己有的"钥匙"，存在你的电脑上
- **公钥（Public Key）**：一把"锁"，放在服务器上

私钥和公钥是数学上配对的：用私钥"签名"的东西，只有对应的公钥能验证。反过来不行——知道公钥无法推算出私钥。

**登录过程：**

```
1. 你发起 SSH 连接
2. 服务器生成一个随机数，发给你
3. 你的电脑用私钥对这个随机数进行数字签名
4. 签名发回服务器
5. 服务器用你的公钥验证签名
6. 验证通过 → 允许登录
```

整个过程中，**私钥从不离开你的电脑**，也不会在网络上传输。即使有人截获了所有通信数据，也无法伪造你的身份——因为他没有你的私钥。

这比密码安全得多：
- 密码可以被猜测、被暴力破解
- 私钥是一个 256 位（或更长）的随机数，暴力破解需要的时间超过宇宙年龄

### 生成 SSH 密钥

**在你的电脑上**（不是服务器上）执行：

```bash
ssh-keygen -t ed25519 -C "mav@ustc.edu.cn"
```

参数解释：
- `-t ed25519`：使用 Ed25519 算法（目前最推荐的）
- `-C "..."`：注释，通常写你的邮箱，方便识别这个密钥是谁的

执行后会问你：
```
Enter file in which to save the key (/home/mav/.ssh/id_ed25519):
```
直接回车，用默认路径。

```
Enter passphrase (empty for no passphrase):
```
这是给私钥加一层密码保护。如果你的电脑被偷了，没有这个密码别人也用不了你的私钥。建议设置一个。

生成完成后，`~/.ssh/` 目录下会有两个文件：
- `id_ed25519` — **私钥**（绝对不要分享、不要上传、不要发给任何人！）
- `id_ed25519.pub` — **公钥**（可以放到任何服务器上）

:::callout 关于加密算法的选择
- **Ed25519**：目前最推荐。基于椭圆曲线，密钥短（256位）但安全性极高，签名速度快
- **RSA**：老一代算法，需要 4096 位密钥才能达到同等安全性。如果你看到别人用 `ssh-keygen -t rsa -b 4096`，那是 RSA
- **ECDSA**：也是椭圆曲线，但有一些理论上的安全顾虑，不如 Ed25519

新生成的密钥直接用 Ed25519，没有理由用其他的。
:::

### 把公钥部署到服务器

**方法一：ssh-copy-id（最简单）**

```bash
ssh-copy-id root@143.198.123.45
```

输入密码后，它会自动把你的公钥追加到服务器的 `~/.ssh/authorized_keys` 文件里。

**方法二：手动复制**

如果 `ssh-copy-id` 不可用（比如 Windows 上），手动操作：

```bash
# 1. 查看你的公钥内容
cat ~/.ssh/id_ed25519.pub
# 输出类似：ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... mav@ustc.edu.cn

# 2. 登录服务器（用密码）
ssh root@143.198.123.45

# 3. 在服务器上创建 .ssh 目录并写入公钥
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... mav@ustc.edu.cn" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**方法三：DigitalOcean 创建时添加**

DigitalOcean 在创建 Droplet 时可以选择"SSH Key"，把你的公钥粘贴进去。这样服务器创建好就已经配置好了密钥登录，连密码都不需要设置。

### 禁用密码登录

确认密钥登录正常工作后，禁用密码登录：

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config
```

找到并修改这些行（如果前面有 `#` 注释符号，去掉它）：

```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

最后一行的意思是：root 用户只能用密钥登录，不能用密码。

保存后重启 SSH：

```bash
sudo systemctl restart sshd
```

:::callout-warn 千万注意！
禁用密码登录之前，**务必确认密钥登录能正常工作**！

操作步骤：
1. 保持当前 SSH 会话不要断开
2. 另开一个终端窗口，测试密钥登录：`ssh root@你的IP`
3. 如果能成功登录（不需要输入密码），说明密钥配置正确
4. 这时候再去修改 sshd_config 禁用密码

如果你先禁用了密码，但密钥又没配好——恭喜，你把自己锁在服务器外面了。唯一的补救方法是通过云服务商的 Web 控制台（Recovery Console）进去修复。
:::

### SSH Config：让连接更方便

每次输入 `ssh root@143.198.123.45` 太麻烦了。在你电脑上编辑 `~/.ssh/config`：

```
Host my-server
  HostName 143.198.123.45
  User root
  IdentityFile ~/.ssh/id_ed25519

Host github.com
  IdentityFile ~/.ssh/id_ed25519_github
```

配置好之后：

```bash
# 之前
ssh root@143.198.123.45

# 之后
ssh my-server
```

简洁多了。而且你可以为不同的服务器配置不同的密钥、不同的用户名。

---

## 端口：服务器的"门牌号"

一台服务器上可能同时运行多个服务（网站、SSH、数据库等）。**端口（Port）**就是区分这些服务的编号——就像一栋大楼里的房间号。

IP 地址定位到"哪台服务器"，端口定位到"这台服务器上的哪个服务"。

### 端口的范围

端口号是 0-65535 的整数：
- **0-1023**：系统端口（Well-known Ports），分配给常见服务，需要 root 权限才能监听
- **1024-49151**：注册端口，可以自由使用
- **49152-65535**：动态端口，通常由操作系统临时分配

### 常见端口一览

| 端口 | 服务 | 说明 |
|------|------|------|
| **22** | SSH | 远程连接，最重要的端口 |
| **80** | HTTP | 网页（未加密） |
| **443** | HTTPS | 网页（加密），现代网站必须 |
| 21 | FTP | 文件传输（老旧，不推荐） |
| 25 | SMTP | 发送邮件 |
| 53 | DNS | 域名解析 |
| 3000 | — | Node.js 开发常用端口 |
| 3306 | MySQL | MySQL 数据库 |
| 5432 | PostgreSQL | PostgreSQL 数据库 |
| 6379 | Redis | Redis 缓存 |
| 8080 | — | 备用 HTTP 端口 |
| 8443 | — | 备用 HTTPS 端口 |

### 端口在 URL 中的体现

当你在浏览器输入 `https://example.com` 时，浏览器实际访问的是 `https://example.com:443`——443 是 HTTPS 的默认端口，浏览器帮你省略了。

同理，`http://example.com` 实际是 `http://example.com:80`。

但如果你的应用跑在非标准端口（比如 3000），用户就得输入 `http://example.com:3000`——这很丑，也不专业。解决方案就是用 Nginx 做反向代理：让 Nginx 监听 80/443 端口，然后把请求转发给 3000 端口的应用。

---

## 防火墙（UFW）：控制谁能访问什么

防火墙决定了哪些端口对外开放、哪些关闭。你可以把它想象成服务器的"保安"——只有被允许的人（端口）才能进出。

**UFW（Uncomplicated Firewall）**是 Ubuntu 自带的防火墙工具，操作非常简单。

### 为什么需要防火墙？

假设你的服务器上跑了：
- SSH（端口 22）
- Nginx（端口 80、443）
- Node.js 应用（端口 3000）
- PostgreSQL 数据库（端口 5432）

如果不设防火墙，所有端口都对外开放。这意味着：
- 任何人都可以尝试连接你的数据库（即使有密码，也增加了攻击面）
- 任何人都可以直接访问你的 Node.js 应用（绕过 Nginx）
- 潜在的安全漏洞暴露在公网上

正确做法：**只开放必要的端口**。对于大部分 Web 服务器，只需要开放三个端口：

| 端口 | 用途 | 必须开放？ |
|------|------|-----------|
| 22 | SSH 远程连接 | 是（否则你连不上） |
| 80 | HTTP | 是（用于 HTTPS 重定向和证书验证） |
| 443 | HTTPS | 是（网站访问） |

其他所有端口都关闭。Node.js 和数据库之间的通信走 `localhost`（127.0.0.1），不需要对外暴露。

### UFW 基本操作

```bash
# 查看当前状态
sudo ufw status

# 设置默认策略：拒绝所有入站，允许所有出站
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH（必须第一个开！）
sudo ufw allow 22/tcp
# 或者用服务名：
sudo ufw allow ssh

# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# 或者用服务名：
sudo ufw allow 'Nginx Full'

# 启用防火墙
sudo ufw enable

# 查看详细规则
sudo ufw status verbose
```

输出类似：

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
22/tcp (v6)                ALLOW       Anywhere (v6)
80/tcp (v6)                ALLOW       Anywhere (v6)
443/tcp (v6)               ALLOW       Anywhere (v6)
```

### 其他常用操作

```bash
# 删除规则
sudo ufw delete allow 8080/tcp

# 允许特定 IP 访问特定端口（比如只允许你的 IP 连接数据库）
sudo ufw allow from 你的IP to any port 5432

# 禁用防火墙（调试时临时关闭）
sudo ufw disable

# 重置所有规则
sudo ufw reset
```

:::callout-warn 防火墙的第一条铁律
**永远先允许 SSH（端口 22），再启用防火墙。**

如果你先 `ufw enable` 但忘了 `ufw allow 22`，你的 SSH 连接会被立即切断，你将无法再连上服务器。

补救方法：通过云服务商的 Web 控制台（DigitalOcean 的 "Access" → "Recovery Console"）进入服务器，然后 `ufw allow 22` 或 `ufw disable`。
:::

---

## Nginx：Web 服务器与反向代理

### Nginx 是什么？

Nginx（发音 "engine-x"）是世界上最流行的 Web 服务器，全球约 34% 的网站使用它。它的核心能力：

1. **提供静态文件**：用户请求 HTML/CSS/JS/图片，Nginx 直接从硬盘读取返回（极快）
2. **反向代理**：把请求转发给后端程序（Node.js、Python 等）
3. **负载均衡**：如果有多个后端实例，Nginx 可以分配流量
4. **HTTPS 终端**：处理 SSL/TLS 加密解密
5. **缓存**：缓存后端响应，减少后端压力
6. **压缩**：自动 gzip 压缩响应，减少传输量

### 为什么需要 Nginx？

你可能想："我的 Node.js 应用自己就能监听端口、返回网页，为什么还要 Nginx？"

原因：

| 能力 | Node.js 直接暴露 | Nginx + Node.js |
|------|------------------|-----------------|
| 静态文件性能 | 一般 | 极快（Nginx 专门优化过） |
| 同时服务多个域名 | 需要自己写逻辑 | 配置文件搞定 |
| HTTPS | 需要自己处理证书 | Certbot 一键配置 |
| 安全 | 需要 root 权限监听 80 端口 | Nginx 用 root 监听，转发给普通用户的应用 |
| 抗压能力 | 一般 | Nginx 能处理几万并发连接 |
| 进程管理 | 应用崩了就没了 | Nginx 始终在，应用重启期间返回 502 |

简单说：Nginx 是专业的"门面"，让你的应用专注于业务逻辑。

### 安装和启动 Nginx

```bash
# 更新包列表
sudo apt update

# 安装 Nginx
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启动
sudo systemctl enable nginx

# 查看状态
sudo systemctl status nginx
```

安装完成后，在浏览器输入你的服务器 IP，应该能看到 Nginx 的默认欢迎页面（"Welcome to nginx!"）。如果看到了，说明 Nginx 正常工作。

### Nginx 配置文件结构

Nginx 的配置文件组织方式：

```
/etc/nginx/
├── nginx.conf              # 主配置文件（通常不需要改）
├── sites-available/        # 所有站点的配置文件
│   ├── default             # 默认站点
│   └── my-site             # 你的站点
├── sites-enabled/          # 已启用的站点（符号链接）
│   └── my-site → ../sites-available/my-site
├── conf.d/                 # 额外配置片段
└── snippets/               # 可复用的配置片段
```

工作流程：
1. 在 `sites-available/` 里创建配置文件
2. 用符号链接把它链接到 `sites-enabled/`
3. 重新加载 Nginx

### 配置静态网站

创建站点配置：

```bash
sudo nano /etc/nginx/sites-available/my-site
```

写入：

```nginx
server {
    listen 80;                              # 监听 80 端口
    server_name example.com www.example.com; # 响应这些域名的请求

    root /var/www/my-site;                  # 网站文件所在目录
    index index.html;                       # 默认首页文件

    # 尝试找文件，找不到返回 404
    location / {
        try_files $uri $uri/ =404;
    }

    # 静态资源缓存（浏览器缓存 30 天）
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

启用配置：

```bash
# 删除默认站点（可选）
sudo rm /etc/nginx/sites-enabled/default

# 创建符号链接启用你的站点
sudo ln -s /etc/nginx/sites-available/my-site /etc/nginx/sites-enabled/

# 测试配置语法是否正确
sudo nginx -t

# 如果显示 "syntax is ok"，重新加载
sudo systemctl reload nginx
```

然后把你的网站文件上传到 `/var/www/my-site/` 目录：

```bash
# 创建目录
sudo mkdir -p /var/www/my-site

# 从本地上传文件（在你的电脑上执行）
scp -r ./dist/* root@你的服务器IP:/var/www/my-site/
```

### 配置反向代理

假设你的 Node.js 应用跑在 3000 端口：

```nginx
server {
    listen 80;
    server_name api.example.com;  # 用子域名区分 API

    location / {
        proxy_pass http://localhost:3000;    # 转发到本机 3000 端口
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

这些 `proxy_set_header` 是在告诉后端程序："真正的用户 IP 是什么、用的是 HTTP 还是 HTTPS"——因为后端程序直接看到的连接来自 Nginx（localhost），不是用户。

### 同一台服务器托管多个网站

Nginx 的强大之处在于：一台服务器可以同时托管多个网站，通过 `server_name` 区分：

```nginx
# 站点 1：个人主页
server {
    listen 80;
    server_name mav.dev www.mav.dev;
    root /var/www/homepage;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}

# 站点 2：博客
server {
    listen 80;
    server_name blog.mav.dev;
    root /var/www/blog;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}

# 站点 3：API 后端
server {
    listen 80;
    server_name api.mav.dev;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

当用户访问 `mav.dev` 时，Nginx 看 `Host` 请求头，匹配到第一个 server block，返回个人主页。访问 `api.mav.dev` 时，匹配到第三个，转发给 Node.js。

这就是为什么你只需要一台服务器、一个 IP，就能跑多个网站——Nginx 根据域名做路由。

---

## 域名与 DNS：把 IP 变成好记的名字

### 域名是什么？

IP 地址（如 `143.198.123.45`）是服务器在互联网上的"门牌号"，但没人能记住一串数字。**域名（Domain Name）**就是给 IP 地址起的"别名"——`mav.dev` 比 `143.198.123.45` 好记多了。

域名是有层级结构的：

```
www.example.com
 │      │     │
 │      │     └── 顶级域名（TLD）：.com, .org, .dev, .cn 等
 │      └──────── 二级域名（你购买的部分）：example
 └─────────────── 子域名（你自己设置的）：www
```

你购买的是"二级域名"（如 `example.com`），然后可以免费创建无限个子域名（如 `www.example.com`、`blog.example.com`、`api.example.com`）。

### DNS 是什么？

**DNS（Domain Name System，域名系统）**是互联网的"电话簿"——它负责把域名翻译成 IP 地址。

当你在浏览器输入 `example.com` 时，背后发生了一系列查询：

```
1. 浏览器检查本地缓存（之前查过吗？）
2. 没有 → 问操作系统的 DNS 缓存
3. 没有 → 问你配置的 DNS 服务器（如 8.8.8.8 Google DNS）
4. DNS 服务器逐级查询：
   a. 问根域名服务器：".com 的权威服务器是谁？"
   b. 问 .com 权威服务器："example.com 的权威服务器是谁？"
   c. 问 example.com 的权威服务器："example.com 的 IP 是什么？"
5. 得到答案：143.198.123.45
6. 浏览器连接到这个 IP
```

整个过程通常在 20-100ms 内完成，而且结果会被缓存，下次访问就不用再查了。

### DNS 记录类型详解

DNS 不只是"域名→IP"这么简单。它有多种记录类型：

| 记录类型 | 用途 | 值的格式 | 示例 |
|----------|------|----------|------|
| **A** | 域名 → IPv4 地址 | IP 地址 | `example.com → 143.198.123.45` |
| **AAAA** | 域名 → IPv6 地址 | IPv6 地址 | `example.com → 2001:db8::1` |
| **CNAME** | 域名 → 另一个域名 | 域名 | `www.example.com → example.com` |
| **MX** | 邮件服务器 | 优先级 + 域名 | 用于接收邮件 |
| **TXT** | 文本记录 | 任意文本 | 域名验证、SPF 邮件防伪 |
| **NS** | 域名服务器 | DNS 服务器地址 | 指定谁管理这个域名的 DNS |

**对于部署网站，你主要用 A 记录和 CNAME 记录。**

### A 记录 vs AAAA 记录

- **A 记录**：把域名指向 IPv4 地址（如 `143.198.123.45`）
- **AAAA 记录**：把域名指向 IPv6 地址（如 `2001:0db8:85a3::8a2e:0370:7334`）

IPv4 是目前最常用的（你的服务器 IP 就是 IPv4）。IPv6 是下一代协议，地址更长但数量几乎无限。如果你的服务器有 IPv6 地址，建议同时设置 A 和 AAAA 记录。

### CNAME 记录：域名的"别名"

CNAME 把一个域名指向另一个域名（而不是直接指向 IP）。最常见的用法：

```
www.example.com  →  CNAME  →  example.com  →  A  →  143.198.123.45
```

这样如果你换了服务器 IP，只需要改 `example.com` 的 A 记录，`www.example.com` 会自动跟着变（因为它指向的是域名，不是 IP）。

:::callout-warn CNAME 的限制
根域名（如 `example.com`）**不能**设置 CNAME 记录——这是 DNS 协议的规定。根域名只能用 A/AAAA 记录直接指向 IP。

子域名（如 `www.example.com`、`blog.example.com`）可以用 CNAME。

一些 DNS 服务商（如 Cloudflare）提供了"CNAME Flattening"功能，绕过了这个限制，但那是非标准行为。
:::

### 实操：把域名绑定到服务器

**第一步：购买域名**

在域名注册商购买。推荐：
- **Cloudflare Registrar**：价格最透明（成本价），自带 DNS 管理和 CDN
- **Namecheap**：便宜，界面友好
- **阿里云万网**：国内注册商，方便备案

价格参考：`.com` 约 ¥60-80/年，`.dev` 约 ¥80-100/年，`.cn` 约 ¥30-40/年。

**第二步：设置 DNS 记录**

在域名注册商的 DNS 管理面板里，添加记录：

```
# 根域名指向服务器
类型: A
名称: @（代表根域名）
值: 143.198.123.45
TTL: 3600

# www 子域名也指向服务器
类型: A
名称: www
值: 143.198.123.45
TTL: 3600

# 或者 www 用 CNAME 指向根域名
类型: CNAME
名称: www
值: example.com
TTL: 3600
```

**第三步：等待 DNS 生效**

DNS 记录修改后不会立即全球生效——各地的 DNS 服务器有缓存，需要等缓存过期后才会查询新记录。

- **TTL（Time To Live）**：你设置的缓存时间。TTL=3600 表示 DNS 服务器会缓存这条记录 1 小时
- 实际生效时间：通常几分钟到几小时，极端情况 24-48 小时

你可以用这个命令检查 DNS 是否生效：

```bash
# 查询域名的 A 记录
dig example.com A

# 或者用 nslookup
nslookup example.com
```

**第四步：配置 Nginx 的 server_name**

DNS 只是把域名指向了你的服务器 IP。但服务器上可能有多个网站，Nginx 需要知道"这个域名对应哪个网站"：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;  # 这里写你的域名
    root /var/www/my-site;
    # ...
}
```

### www 有和没有的区别

`example.com` 和 `www.example.com` 在技术上是**两个完全不同的域名**。

- `example.com` — "裸域名"（apex domain / root domain / naked domain）
- `www.example.com` — 一个子域名，`www` 只是约定俗成的前缀

历史上，`www` 是用来区分"Web 服务"和其他服务（如 FTP、邮件）的。现代网站通常两个都配置，然后把其中一个重定向到另一个：

```nginx
# 方案 A：把 www 重定向到裸域名（推荐，更简洁）
server {
    listen 80;
    server_name www.example.com;
    return 301 http://example.com$request_uri;
}

server {
    listen 80;
    server_name example.com;
    root /var/www/my-site;
    # ... 正常配置
}
```

```nginx
# 方案 B：把裸域名重定向到 www
server {
    listen 80;
    server_name example.com;
    return 301 http://www.example.com$request_uri;
}

server {
    listen 80;
    server_name www.example.com;
    root /var/www/my-site;
    # ... 正常配置
}
```

:::callout-tip 选哪个作为主域名？
现代趋势是用**裸域名**（`example.com`），更简洁。GitHub、Twitter、Vercel 等都用裸域名。

但技术上没有对错之分。重要的是**选一个，把另一个 301 重定向过去**。不要让同一个网站有两个不同的地址——这对 SEO（搜索引擎优化）不好，搜索引擎会认为是两个不同的网站。
:::

---

## HTTP 与 HTTPS：加密的重要性

### HTTP 是什么？

**HTTP（HyperText Transfer Protocol）**是浏览器和服务器之间通信的协议——定义了"请求长什么样、响应长什么样"的规则。

但 HTTP 有一个致命问题：**所有数据都是明文传输的**。

这意味着：如果有人在你和服务器之间"窃听"网络流量（比如在公共 WiFi 上用抓包工具），他能看到：
- 你访问了哪些网页
- 你提交的表单数据（包括密码！）
- 服务器返回的所有内容

这在公共 WiFi、公司网络、甚至 ISP（网络运营商）层面都是可能的。

### HTTPS = HTTP + TLS 加密

**HTTPS** 在 HTTP 的基础上加了一层 **TLS（Transport Layer Security）** 加密。所有传输的数据都被加密成密文，即使被截获也无法解读。

HTTPS 的工作原理（简化版）：

```
1. 浏览器连接服务器，说"我要用 HTTPS"
2. 服务器发送自己的 SSL 证书（包含公钥）
3. 浏览器验证证书是否合法（是否由可信的 CA 签发）
4. 浏览器生成一个随机密钥，用服务器的公钥加密后发送
5. 服务器用私钥解密，得到随机密钥
6. 双方用这个随机密钥加密后续所有通信
```

从此，即使有人截获了网络流量，看到的也只是一堆加密后的乱码。

### 为什么 HTTPS 是必须的？

2026 年了，HTTPS 不是"可选的安全加强"，而是**基本要求**：

1. **浏览器警告**：Chrome、Firefox 等浏览器会对 HTTP 网站显示"不安全"警告，吓跑用户
2. **SEO 惩罚**：Google 搜索排名会降低 HTTP 网站的权重
3. **功能限制**：很多现代浏览器 API（地理位置、摄像头、Service Worker）只在 HTTPS 下可用
4. **数据安全**：保护用户的密码、个人信息不被窃取
5. **防篡改**：防止 ISP 或中间人在你的网页里注入广告

### SSL 证书是什么？

HTTPS 需要一个 **SSL/TLS 证书**来证明"这个服务器确实是 example.com 的拥有者"。证书由**CA（Certificate Authority，证书颁发机构）**签发。

以前，SSL 证书很贵（几百到几千元/年）。但 2015 年 **Let's Encrypt** 横空出世——它提供**完全免费**的 SSL 证书，而且有自动化工具帮你配置。

### 用 Certbot 一键配置 HTTPS

**Certbot** 是 Let's Encrypt 官方推荐的自动化工具：

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt install certbot python3-certbot-nginx

# 自动获取证书并配置 Nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot 会自动：
1. 验证你确实拥有这个域名（通过在你的服务器上放一个临时文件，Let's Encrypt 来访问验证）
2. 获取 SSL 证书文件
3. 修改你的 Nginx 配置，添加 SSL 相关设置
4. 设置 HTTP → HTTPS 的自动重定向
5. 设置定时任务自动续期（证书有效期 90 天，但 Certbot 会在到期前自动续期）

运行完后，你的 Nginx 配置会变成：

```nginx
server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/my-site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# HTTP 自动跳转到 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;

    if ($host = www.example.com) {
        return 301 https://$host$request_uri;
    }
    if ($host = example.com) {
        return 301 https://$host$request_uri;
    }
}
```

### 验证 HTTPS 是否正常

```bash
# 测试证书续期是否能正常工作
sudo certbot renew --dry-run

# 查看证书信息
sudo certbot certificates
```

在浏览器里访问你的网站，地址栏应该显示锁头图标 🔒。点击锁头可以查看证书详情。

:::callout-tip 证书续期
Let's Encrypt 证书有效期 90 天。Certbot 安装时会自动设置一个定时任务（systemd timer 或 cron job），每天检查一次，在证书到期前 30 天自动续期。

你基本不需要管它。但建议偶尔运行 `sudo certbot renew --dry-run` 确认续期机制正常工作。
:::

---

## 完整部署实战：从零到网站上线

把前面所有知识串起来，这是一个完整的、可以照着做的部署流程。

### 前置条件

- 你有一台云服务器（Ubuntu），知道它的 IP 地址
- 你有一个域名
- 你的网站文件已经在本地准备好了

### 第一步：SSH 连接并初始化服务器

```bash
# 连接服务器
ssh root@你的服务器IP

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装常用工具
sudo apt install -y curl wget git unzip htop
```

### 第二步：配置 SSH 密钥（如果还没配）

在你的**本地电脑**上：

```bash
# 生成密钥（如果还没有）
ssh-keygen -t ed25519 -C "your@email.com"

# 复制公钥到服务器
ssh-copy-id root@你的服务器IP

# 测试密钥登录（不应该要求输入密码）
ssh root@你的服务器IP
```

确认密钥登录正常后，在**服务器上**禁用密码登录：

```bash
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 第三步：配置防火墙

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 第四步：安装和配置 Nginx

```bash
# 安装
sudo apt install nginx -y
sudo systemctl enable nginx

# 创建网站目录
sudo mkdir -p /var/www/my-site

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/my-site
```

写入配置（先用 HTTP，后面再加 HTTPS）：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/my-site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # 静态资源缓存
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

启用配置：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/my-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 第五步：上传网站文件

在你的**本地电脑**上：

```bash
# 上传整个网站目录
scp -r ./my-site/* root@你的服务器IP:/var/www/my-site/

# 或者用 rsync（更智能，只传输变化的文件）
rsync -avz --delete ./my-site/ root@你的服务器IP:/var/www/my-site/
```

### 第六步：配置域名 DNS

在域名注册商的管理面板：

```
A 记录：@ → 你的服务器IP
A 记录：www → 你的服务器IP（或 CNAME www → example.com）
```

等待 DNS 生效（几分钟到几小时）。验证：

```bash
dig example.com A
# 应该返回你的服务器 IP
```

### 第七步：配置 HTTPS

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d example.com -d www.example.com

# 按提示操作：
# - 输入邮箱（用于证书到期提醒）
# - 同意服务条款
# - 选择是否重定向 HTTP → HTTPS（选 2，重定向）
```

### 第八步：验证

```bash
# 测试 Nginx 配置
sudo nginx -t

# 测试证书续期
sudo certbot renew --dry-run

# 在浏览器访问
# https://example.com ← 应该能看到你的网站，地址栏有锁头
# http://example.com  ← 应该自动跳转到 https
```

:::callout 恭喜！
如果一切顺利，你的网站现在已经：
- 通过 HTTPS 加密访问 ✓
- 有自己的域名 ✓
- 防火墙保护 ✓
- SSH 密钥认证 ✓
- 静态资源有缓存和压缩 ✓

这就是一个生产级别的静态网站部署。
:::

---

## 文件上传与同步

每次修改网站后，你需要把新文件上传到服务器。几种方式：

### scp：最基础的文件传输

```bash
# 上传单个文件
scp index.html root@服务器IP:/var/www/my-site/

# 上传整个目录
scp -r ./dist/* root@服务器IP:/var/www/my-site/
```

### rsync：更智能的同步

```bash
# 只传输变化的文件，删除服务器上多余的文件
rsync -avz --delete ./dist/ root@服务器IP:/var/www/my-site/
```

rsync 比 scp 好在：
- 只传输有变化的文件（增量同步）
- 支持压缩传输
- `--delete` 会删除服务器上本地已经没有的文件（保持同步）

### Git：版本控制 + 部署

更专业的做法是在服务器上用 Git 拉取代码：

```bash
# 服务器上
cd /var/www/my-site
git pull origin main
```

或者设置 GitHub Actions 自动部署——每次你 push 代码到 GitHub，自动把新版本部署到服务器。这属于 CI/CD（持续集成/持续部署）的范畴，感兴趣可以后续了解。

---

## 进程管理：让后端程序持续运行

如果你部署了后端程序（Node.js），直接 `node server.js` 有个问题：你关闭 SSH 连接后，程序就停了。

### 为什么会停？

当你 SSH 连接到服务器并运行程序时，程序是你这个 SSH 会话的"子进程"。SSH 断开 → 会话结束 → 子进程收到 SIGHUP 信号 → 程序退出。

### 解决方案：PM2

**PM2** 是 Node.js 的进程管理器，让你的应用在后台持续运行，并且崩溃后自动重启：

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "my-app"

# 查看运行状态
pm2 status

# 查看日志
pm2 logs my-app

# 重启
pm2 restart my-app

# 停止
pm2 stop my-app

# 设置开机自启动
pm2 startup
pm2 save
```

PM2 的好处：
- 应用崩溃后自动重启
- SSH 断开后应用继续运行
- 开机自动启动
- 内置日志管理
- 可以同时管理多个应用

### 解决方案：systemd（更通用）

如果你的后端不是 Node.js（比如 Python），可以用 systemd 创建服务：

```bash
sudo nano /etc/systemd/system/my-app.service
```

```ini
[Unit]
Description=My Backend App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/my-app
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start my-app
sudo systemctl enable my-app  # 开机自启
sudo systemctl status my-app  # 查看状态
```

---

## 常用服务器命令速查

| 命令 | 用途 |
|------|------|
| `ssh user@ip` | 连接服务器 |
| `scp file user@ip:/path` | 上传文件 |
| `rsync -avz src/ user@ip:dest/` | 智能同步文件 |
| `sudo apt update && sudo apt upgrade` | 更新系统 |
| `free -h` | 查看内存使用 |
| `df -h` | 查看硬盘使用 |
| `htop` | 实时监控 CPU/内存/进程 |
| `du -sh /var/www/*` | 查看各目录大小 |
| `sudo systemctl status nginx` | Nginx 状态 |
| `sudo systemctl reload nginx` | 重载 Nginx 配置 |
| `sudo nginx -t` | 测试 Nginx 配置语法 |
| `sudo ufw status` | 防火墙状态 |
| `sudo certbot renew --dry-run` | 测试证书续期 |
| `sudo tail -f /var/log/nginx/access.log` | 实时查看访问日志 |
| `sudo tail -f /var/log/nginx/error.log` | 实时查看错误日志 |
| `uptime` | 查看服务器运行时间和负载 |
| `whoami` | 当前登录用户 |
| `pwd` | 当前目录 |
| `ls -la` | 列出文件（含隐藏文件和权限） |

:::callout-tip 关于 free -h
`free -h` 的输出里有个容易误解的地方：

```
              total    used    free    shared  buff/cache   available
Mem:          1.9Gi   743Mi   142Mi    1.0Mi      1.1Gi      1.0Gi
```

- `used` 看起来很高？别慌——Linux 会把空闲内存用作磁盘缓存（buff/cache），这是好事
- **`available` 才是你真正可用的内存**——它包括了可以随时释放的缓存
- 只有当 `available` 接近 0 时，才说明内存真的不够了
:::

---

## 常见问题排查

### 网站打不开？

按这个顺序排查：

```
1. 服务器能 ping 通吗？
   → ping 你的服务器IP
   → 不通：检查服务器是否开机、防火墙是否封了 ICMP

2. 端口开了吗？
   → sudo ufw status（检查 80/443 是否 ALLOW）

3. Nginx 在运行吗？
   → sudo systemctl status nginx
   → 没运行：sudo systemctl start nginx

4. Nginx 配置正确吗？
   → sudo nginx -t
   → 有错误：根据提示修复

5. DNS 解析正确吗？
   → dig example.com A
   → IP 不对：去域名注册商修改 DNS 记录

6. 文件存在吗？
   → ls /var/www/my-site/
   → 没有文件：上传你的网站文件

7. 文件权限对吗？
   → sudo chown -R www-data:www-data /var/www/my-site/
```

### 502 Bad Gateway？

这意味着 Nginx 正常工作，但它转发请求给后端时，后端没有响应。

```bash
# 检查后端是否在运行
pm2 status
# 或
sudo systemctl status my-app

# 检查后端日志
pm2 logs my-app
# 或
journalctl -u my-app --since "5 minutes ago"

# 检查端口是否在监听
sudo ss -tlnp | grep 3000
```

### SSH 连不上？

```
1. IP 对吗？服务器开机了吗？
2. 防火墙封了 22 端口？（通过云服务商控制台检查）
3. SSH 服务在运行吗？（通过控制台：sudo systemctl status sshd）
4. 密钥文件权限对吗？（本地：chmod 600 ~/.ssh/id_ed25519）
5. 是否禁用了密码登录但密钥没配好？（通过控制台修复）
```

---

## 小结

这一章覆盖了从"连上服务器"到"网站上线"的完整链路：

1. **SSH** — 用密钥安全地远程连接，禁用密码登录
2. **端口** — 不同服务占用不同端口，22/80/443 是最重要的三个
3. **防火墙（UFW）** — 只开放必要端口，关闭其他一切
4. **Nginx** — 提供静态文件 + 反向代理 + 多站点托管
5. **域名 + DNS** — A 记录把域名指向 IP，CNAME 做别名
6. **HTTPS** — Let's Encrypt + Certbot 免费加密，一键配置
7. **进程管理** — PM2 或 systemd 让后端持续运行
8. **问题排查** — 按顺序检查：网络 → 防火墙 → Nginx → DNS → 文件

掌握这些，你就能独立把任何网站从本地部署到服务器上，让全世界都能通过域名安全地访问。这是一个完整的、生产级别的部署流程——和真正的公司做的事情没有本质区别，只是规模不同。

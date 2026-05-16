---
title: "本地操作：安装、配置与日常命令"
chapter: 2
readTime: 15
description: "安装 Git、配置 SSH、init/add/commit/log/diff/restore——本地工作流全覆盖。"
---
>    
>    只有当你想要看半年前的老代码时，Git 才会稍微花点时间，用最新的版本一层层“倒推”回去计算给你看。这种“牺牲历史代码读取速度，换取最新代码极致性能”的策略，非常划算。
>    
>    3. 针对文件结构的处理：
>    
>    我们已经理解了git如何处理一大堆文件（用哈希值判断有没有更新）和单个大文件多次更新（packfile和增量压缩），那么如果某次重构了代码的结构怎么办？比如移动，新增了某个文件夹？
>    
>    其实很简单：把文件夹看作是一个文件处理：在 Git 眼里，**文件夹（Tree 对象）本质上就是一个特殊格式的“文本文件”**，只不过这个文件里存的不是代码，而是一张“目录清单”。
>    
>    每次移动或者修改了repo结构，针对现有结构生成一个新的文件即可，文本文件本身可能就几十KB，代价极小。



## 安装 Git

**Windows：**

1. 访问 [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. 下载并安装，一路 Next（默认配置即可）
3. 安装完成后右键桌面，看到 "Git Bash Here" 表示成功

**macOS：**

```bash
# 方法1：安装 Xcode Command Line Tools（推荐）
xcode-select --install

# 方法2：使用 Homebrew
brew install git
```

**Linux（Ubuntu/Debian）：**

```bash
sudo apt update
sudo apt install git
```

## 验证安装

```bash
# 查看 Git 版本，输出版本号说明安装成功
git --version
# 输出示例：git version 2.52.0.windows.1
```

## 初始配置（必须做！）

首次使用 Git，必须告诉它你是谁，否则提交时无法记录作者信息。

```bash
# 设置你的用户名（建议与 GitHub 用户名一致）
git config --global user.name "你的名字"

# 设置你的邮箱（必须与 GitHub 注册邮箱一致！）
git config --global user.email "你的邮箱@mail.ustc.edu.cn"

# 设置默认编辑器为 VS Code（可选，默认是 vim）
git config --global core.editor "code --wait"

# 查看所有配置，确认设置正确
git config --global --list
```

> **注意**：`--global` 表示全局生效，即这台电脑上所有 Git 项目都用这个配置。如果某个项目需要不同的配置，去掉 `--global` 即可单独设置。

## 配置 SSH 密钥（连接 GitHub 必备）

密码验证 GitHub 的方式已被废弃，现在需要用 SSH 密钥。
（也可以使用令牌，但是SSH最方便）

```bash
# 第1步：生成 SSH 密钥对
# -t ed25519：使用 ed25519 算法（推荐）
# -C "你的邮箱"：注释，方便识别
ssh-keygen -t ed25519 -C "你的邮箱@mail.ustc.edu.cn"
# 一路按 Enter 使用默认路径即可

# 第2步：查看你的公钥
cat ~/.ssh/id_ed25519.pub
# 复制输出的全部内容（以 ssh-ed25519 开头）

# 第3步：将公钥添加到 GitHub
# 打开 GitHub → Settings → SSH and GPG keys → New SSH key
# 粘贴公钥内容，保存

# 第4步：测试连接
ssh -T git@github.com
# 成功时输出：Hi 你的用户名! You've successfully authenticated...
```



## git init — 初始化仓库

```bash
# 创建一个新文件夹并初始化 Git 仓库
mkdir my-project        # 创建文件夹
cd my-project           # 进入文件夹
git init                # 在当前目录初始化 Git 仓库

# 输出：Initialized empty Git repository in .../my-project/.git/
# 这会创建一个隐藏的 .git 文件夹，Git 的所有数据都在这里
```

```bash
# 也可以直接指定目录名
git init my-project     # 创建 my-project 文件夹并初始化
```

> **警告**：永远不要手动修改或删除 `.git` 文件夹，否则会破坏整个仓库！

## git status — 查看状态

这是你用得最频繁的命令，随时查看当前状态。

```bash
git status
```

输出示例及解读：

```
On branch main                          ← 当前在 main 分支
Changes to be committed:                ← 暂存区中的文件（等待提交）
  (use "git restore --staged <file>..." to unstage)
        new file:   hello.c             ← 新文件被暂存

Changes not staged for commit:          ← 工作区修改了但未暂存
  (use "git add <file>..." to update what will be committed)
        modified:   motor.c             ← 已修改但未暂存

Untracked files:                        ← 未被 Git 追踪的文件
  (use "git add <file>..." to include in what will be committed)
        debug.log                       ← 新文件，Git 不知道它的存在
```

## git add — 添加到暂存区

```bash
# 添加单个文件到暂存区
git add hello.c

# 添加多个文件
git add hello.c motor.c

# 添加当前目录下所有改动（最常用）
git add .

# 添加某个目录下的所有文件
git add src/

# 交互式选择要暂存的内容（适合老手）
git add -p
```

**小技巧**：`git add .` 会添加所有改动，但如果你不希望某些文件被追踪（比如编译产生的 `.o` 文件、IDE 配置文件），需要配置 `.gitignore`（见后文）。

## git commit — 把暂存区内容提交到本地仓库

```bash
# 提交暂存区内容，-m 后面跟提交信息
git commit -m "初始化项目，添加电机控制模块"

# 如果提交信息很长，不加 -m 会打开编辑器让你写详细信息
git commit

# 快捷方式：跳过 git add，直接提交所有已追踪文件的修改
# 注意：新建的（Untracked）文件不会被包含！
git commit -am "修复PID参数溢出问题"
```

**写好提交信息的原则：**

```
❌ 坏的提交信息：
git commit -m "改了一些东西"
git commit -m "fix"
git commit -m "aaa"

✅ 好的提交信息（动词开头，说清楚做了什么）：
git commit -m "feat: 添加PID控制器初始化函数"
git commit -m "fix: 修复电机速度计算溢出的问题"
git commit -m "docs: 更新README安装说明"
git commit -m "refactor: 重构任务调度逻辑"

注：无需备注日期，git commit自带
```

## git log — 查看历史记录

```bash
# 查看完整的提交历史
git log

# 每个提交只显示一行（推荐日常使用）
git log --oneline

# 图形化显示分支合并历史
git log --oneline --graph --all

# 只看最近 5 次提交
git log -5

# 查看某个文件的修改历史
git log --oneline -- motor.c

# 查看某人的提交记录
git log --author="张三"
```

`git log --oneline` 输出示例：

```
a3f8c2d (HEAD -> main) fix: 修复电机反转时的符号错误
7b9e1f3 feat: 添加巡线传感器读取函数
c45d8a1 feat: 完成PID控制器基础框架
09f3b77 init: 初始化项目结构
```

最左侧的 `a3f8c2d` 是哈希值的前7位，用来唯一标识一次提交。

## git diff — 查看差异

```bash
# 查看工作区与暂存区的差异（还没 add 的改动）
git diff

# 查看暂存区与上次提交的差异（已 add 但未 commit 的改动）
git diff --staged

# 比较两次提交之间的差异
git diff a3f8c2d 7b9e1f3

# 比较某个文件在两次提交间的差异
git diff a3f8c2d 7b9e1f3 -- motor.c
```

输出示例：

```diff
- int speed = motor_get_speed();   ← 删除的行（红色）
+ float speed = motor_get_speed(); ← 新增的行（绿色）
```

## git restore — 撤销修改

```bash
# 撤销工作区的修改（让文件回到上次 add 或 commit 的状态）
# 注意：这个操作不可逆！修改会丢失！
git restore motor.c

# 把文件从暂存区移出（撤销 add，但保留工作区修改）
git restore --staged motor.c
```

## git rm — 删除文件

```bash
# 从 Git 追踪中删除文件（同时删除工作区文件）
git rm old_file.c

# 只从 Git 追踪中移除，保留本地文件（常用于".gitignore 漏掉"的情况）
git rm --cached secret.key
```

## .gitignore — 忽略不需要的文件

并不是所有文件都需要 Git 追踪。创建 `.gitignore` 文件来告诉 Git 忽略哪些文件：

```bash
# 在项目根目录创建 .gitignore 文件
touch .gitignore
```

`.gitignore` 文件内容示例（C/嵌入式项目）：

```gitignore
# 编译产生的中间文件
*.o
*.d
*.elf
*.hex
*.bin
*.map

# IDE 配置文件（个人配置不应该提交）
.vscode/
.idea/
*.uvprojx.bak

# 调试和日志文件
*.log
debug/

# 操作系统临时文件
.DS_Store        # macOS
Thumbs.db        # Windows
desktop.ini

# 敏感信息（绝对不能提交！）
secrets.h
api_keys.txt
```

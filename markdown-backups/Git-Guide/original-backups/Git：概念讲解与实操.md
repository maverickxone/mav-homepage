
> 面向中国科学技术大学大一新生 | 配合 GitHub 使用 | 2026 版

注：本书我已经阅读完毕，所有原书解释不到位的地方，我都用 **Mav's Tips:** 进行了补充说明。

---

## 目录

1. [为什么要学 Git？](#1-为什么要学-git)
2. [Git 是什么？核心概念](#2-git-是什么核心概念)
3. [安装与初始配置](#3-安装与初始配置)
4. [本地仓库操作](#4-本地仓库操作)
5. [分支管理](#5-分支管理)
6. [远程仓库与 GitHub](#6-远程仓库与-github)
7. [指令速查表](#7-指令速查表)
---
参考内容：
8. [团队协作工作流](#8-团队协作工作流)
9. [进阶操作](#9-进阶操作)
10. [综合实战操作指南](#10-综合实战操作指南)
11. [常见问题与排错](#11-常见问题与排错)
---

## 1. 为什么要学 Git？

### 1.1 没有 Git 的世界

想象你正在写一篇大作业报告，你可能会这样命名文件：

```
报告.docx
报告_最终版.docx
报告_最终版2.docx
报告_真的最终版.docx
报告_绝对最终版_别改了.docx
```

这就是**没有版本控制**的状态。你不知道哪个是最好的版本，也不记得每个版本改了什么。

现在，换成**写代码**的场景：你和三个队友一起做 RoboGame 的控制程序，每个人各写一部分，最后怎么合并？用 QQ 传文件？谁的版本算数？如果合并出了 Bug，怎么回退？

这就是 Git 要解决的问题。

### 1.2 Git 能做什么

- ✅ **记录每一次修改**：知道什么时候改了什么、谁改的
- ✅ **随时回退**：代码写崩了？一键回到任意历史版本
- ✅ **并行开发**：多人同时开发不同功能，互不干扰
- ✅ **合并代码**：智能合并多人的修改
- ✅ **备份到云端**：通过 GitHub 把代码存到服务器

---

## 2. Git 是什么？核心概念

### 2.1 一个大比喻：Git 是游戏存档系统

把你的代码项目想象成一个**RPG 游戏**：

| 游戏概念    | Git 概念            | 说明         |
| ------- | ----------------- | ---------- |
| 游戏存档    | **commit（提交）**    | 保存当前状态的快照  |
| 存档槽位列表  | **log（历史记录）**     | 所有存档的时间线   |
| 读取存档    | **checkout（读档）**  | 回到某个历史状态   |
| 新开一周目   | **branch（分支）**    | 从某点开辟新的时间线 |
| 合并两周目进度 | **merge（合并）**     | 把两条时间线合并   |
| 游戏云存档   | **GitHub / 远程仓库** | 把存档同步到云端   |
| 下载别人的存档 | **clone（克隆）**     | 把他人项目完整下载  |

### 2.2 三个区域：工作区、暂存区、仓库

这是 Git 最重要的概念，很多初学者在这里卡住。

```
┌─────────────────────────────────────────────────────┐
│                    你的电脑                          │
│                                                     │
│  ┌──────────┐   git add   ┌──────────┐             │
│  │          │ ──────────► │          │             │
│  │  工作区   │             │  暂存区   │             │
│  │(Working  │ ◄────────── │(Staging  │             │
│  │  Tree)   │  git restore│  Area)   │             │
│  │          │             │          │             │
│  └──────────┘             └──────────┘             │
│                                  │                  │
│                           git commit                │
│                                  ▼                  │
│                           ┌──────────┐             │
│                           │  本地仓库 │             │
│                           │ (Local   │             │
│                           │  Repo)   │             │
│                           └──────────┘             │
└─────────────────────────────────────────────────────┘
                                  │  git push / pull
                                  ▼
                         ┌────────────────┐
                         │   远程仓库      │
                         │   (GitHub)     │
                         └────────────────┘
```

**类比理解：**

- **工作区**：你的桌面，你正在写/改的文件
- **暂存区**：打包区，你把要提交的文件先放到这里"打包"
- **本地仓库**：已封存的快递包裹，存在你电脑里的历史记录
- **远程仓库**：寄出去的包裹，存在 GitHub 服务器上

**为什么要有暂存区？**

因为你可能改了 10 个文件，但只想提交其中 3 个相关的改动。暂存区让你可以精确控制每次提交的内容。

### 2.3 commit 是什么

Commit 是 Git 的基本单元，每个 commit 包含：

- 📸 **一个完整的项目快照**（不是差异，是完整状态）
- 💬 **提交信息**（你写的说明，比如"修复电机控制Bug"）
- 🔑 **唯一哈希值**（如 `a3f8c2d`，用于标识这次提交）
- 👤 **作者信息**（谁提交的，什么时间）
- ⬅️ **父提交指针**（指向上一次提交）

> **Mav's Tips:** 
> 你可能会疑惑，既然git宣称自己每次 commit 保存的是“完整的项目快照”，那一个文件被提交100次，.git文件夹岂不是变成原来的100倍？
> 
> 其实并不是这样，Git底层有三个机制保证空间利用最大化：
> 
> 1. 基于SHA-1 哈希的去重：
>    
>    Git会把每一个文件的内容通过哈希算法计算转换成一个40位的SHA-1哈希值，之后压缩对应文件，并把压缩的文件打包到一个名为 **Blob** 的对象，该对象的名称即为哈希值，最后储存在.git/objects里面。（可以理解为，哈希值就是文件的门牌号） 
>    
>    如果某一次修改只修改了文件A而没有修改文件B，那么A会产生一个新的 Blob 对象，但B不会，新的快照会用指针直接指向原来旧的 Blob 对象。
>    
>    因此，对于绝大多数只修改了少数文件的 commit，Git其实没有对所有文件进行处理，只是对更新的文件重新计算哈希值生成一个新的 Blob 对象，老文件直接继续使用。
> 
> 2. 基于 **Packfile** 的差异存储：
>    
>    你可能好奇，虽然我们知道commit只会针对修改过的文件进行处理，但是如果我对一个10MB的文件修改100次，还不是会有近1GB的大小吗？
>    
>    这个时候，git后台的git gc (Garbage Collection)就会触发 Packfile 机制。
>    
>    简单说，Git 会把这 100 个历史版本的 Blob 找出来，对比它们的内容。它会发现，这 100 个文件有 99% 的内容是一模一样的！（因为我们不太可能每次都对一个大文件覆盖重写）
>    因此，他会使用 **增量压缩**，把这100个版本的差异记录下来。
>    
>    **重点来了，Git 的增量压缩是“倒着来”的：**
>    
>     **1. 常规思维（正向差异）：** 存下第 1 版的完整内容。第 2 版只存相对于第 1 版改了什么，第 3 版存相对于第 2 版改了什么……
>     
>     **2. Git 的思维（逆向差异）：** Git 会把**最新的一版（第 100 版）原封不动地完整存下来**。然后，计算第 99 版相对于第 100 版**需要“撤销”哪些修改**，把它存为一个“差异补丁”。第 98 版再存一个基于第 99 版的差异补丁……依此类推。
>     
>    为什么要“倒着来”？因为 Git 的作者（Linus Torvalds）太懂程序员了！
>    
>    在日常开发中，我们 99% 的操作，都是在**查看和修改最新的代码**。
>    
>    如果按常规的“正向差异”存，你要看最新的第 100 版，Git 就必须先拿出第 1 版，然后把后面 99 次的修改像叠罗汉一样一层层算出来给你，这会**慢得令人发指**。
>    
>    而用了“**逆向差异**”，当你要看最新代码时，Git 直接从 Packfile 里把第 100 版的**完整内容**秒速拿出来给你，不需要任何计算！
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

---

## 3. 安装与初始配置

### 3.1 安装 Git

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

### 3.2 验证安装

```bash
# 查看 Git 版本，输出版本号说明安装成功
git --version
# 输出示例：git version 2.52.0.windows.1
```

### 3.3 初始配置（必须做！）

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

### 3.4 配置 SSH 密钥（连接 GitHub 必备）

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

---

## 4. 本地仓库操作

### 4.1 git init — 初始化仓库

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

### 4.2 git status — 查看状态

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

### 4.3 git add — 添加到暂存区

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

### 4.4 git commit — 把暂存区内容提交到本地仓库

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

### 4.5 git log — 查看历史记录

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

### 4.6 git diff — 查看差异

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

### 4.7 git restore — 撤销修改

```bash
# 撤销工作区的修改（让文件回到上次 add 或 commit 的状态）
# 注意：这个操作不可逆！修改会丢失！
git restore motor.c

# 把文件从暂存区移出（撤销 add，但保留工作区修改）
git restore --staged motor.c
```

### 4.8 git rm — 删除文件

```bash
# 从 Git 追踪中删除文件（同时删除工作区文件）
git rm old_file.c

# 只从 Git 追踪中移除，保留本地文件（常用于".gitignore 漏掉"的情况）
git rm --cached secret.key
```

### 4.9 .gitignore — 忽略不需要的文件

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

语法说明：

- `*` 匹配任意字符（`*.o` 忽略所有 .o 文件）
- `/` 结尾表示目录（`build/` 忽略 build 文件夹）
- `!` 开头表示例外（`!important.log` 不忽略这个文件）
- `#` 开头是注释

> **技巧**：GitHub 提供了各种语言/框架的 .gitignore 模板，访问 [gitignore.io](https://gitignore.io) 自动生成。

---

## 5. 分支管理

### 5.1 什么是分支

回到游戏存档的比喻：

> 你在某个时间节点选择了两条不同的剧情分支，每条分支各自发展，互不影响。最后你可以决定把某个分支的结果合并到主线。

在 Git 中，**分支（branch）** 就是从某个提交点开辟的独立开发线路。

**为什么要用分支？**

- 开发新功能时不影响主线（main 分支）的稳定性
- 多人并行开发不同功能
- 安全地实验新想法，不满意直接删掉分支

```
main:     A --- B --- C ------------------- G
                       \                   /
feature:                D --- E --- F ----
```

### 5.2 git branch — 管理分支

```bash
# 查看所有本地分支（* 号表示当前所在分支）
git branch

# 查看所有分支（包括远程分支）
git branch -a

# 创建一个新分支（但不切换过去）
git branch feature-pid

# 删除分支（已合并的分支）
git branch -d feature-pid

# 强制删除分支（未合并也删，谨慎使用！）
git branch -D feature-pid

# 重命名当前分支
git branch -m new-name
```

### 5.3 git switch — 切换分支

```bash
# 切换到已有分支
git switch feature-pid

# 创建并切换到新分支（最常用！）
git switch -c feature-sensor

# 切换到上一个分支（类似 cd -）
git switch -
```

> **注意**：切换分支前，建议先提交或储藏（stash）当前改动，否则 Git 可能会拒绝切换。

### 5.4 git merge — 合并分支

```bash
# 将 feature-pid 合并到当前分支（通常在 main 上操作）
git switch main           # 先切换到目标分支
git merge feature-pid     # 把 feature-pid 合并进来
```

**合并时有三种结果：**

1. **快进合并（Fast-forward）**：没有冲突，直接移动指针，最干净

   ```
   合并前：main: A-B   feature: A-B-C-D
   合并后：main: A-B-C-D
   ```

2. **三方合并（3-way merge）**：两个分支都有新提交，Git 自动合并

   ```
   合并前：main: A-B-E   feature: A-B-C-D
   合并后：main: A-B-E-C-D-M（M 是合并提交）
   ```

3. **冲突（Conflict）**：两个分支修改了同一文件的同一部分，需要手动解决

### 5.5 处理合并冲突

当两人修改了同一文件的同一行，Git 不知道该保留谁的版本，会产生冲突：

```bash
git merge feature-sensor
# 输出：CONFLICT (content): Merge conflict in motor.c
# Automatic merge failed; fix conflicts and then commit the result.
```

打开冲突文件 `motor.c`，会看到 Git 自动插入的标记：

```c
<<<<<<< HEAD                           // 当前分支（main）的内容
int motor_speed = 100;
=======                                // 分隔线
int motor_speed = 150;
>>>>>>> feature-sensor                 // 被合并分支的内容
```

**解决步骤：**

1. 手动编辑文件，保留正确的内容
2. 删除 `<<<<<<<`、`=======`、`>>>>>>>` 标记
3. 保存文件
4. `git add motor.c`（告诉 Git 这个冲突已经解决）
5. `git commit`（完成合并）

```c
// 解决冲突后的文件（手动决定保留哪个版本）
int motor_speed = 150;  // 保留 feature-sensor 的值
```

- 现在很多编辑器（VS Code、JetBrains 等）都有图形化的冲突解决界面，会更友好。
- 解决完所有冲突后，一定要 git add 对应文件，否则无法继续。

### 5.6 git rebase — 变基（整理提交历史）

Rebase 是另一种整合分支变更的方式，让提交历史更整洁：

```bash
# 在 feature 分支上，把它的基础从旧的 main 移到最新的 main
git switch feature-pid
git rebase main
```

```
rebase 前：
main:    A-B-E
feature: A-B-C-D

rebase 后：
main:    A-B-E
feature: A-B-E-C'-D'  ← D 和 E 被"重新播放"到 C 之后
```

> **初学者建议**：先掌握 `merge`，`rebase` 等熟练后再使用。团队协作中，已推送到远程的分支不要 rebase！

> **Mav's Tips:** 
> 
> 这里你可能觉得三方合并和rebase很像
> 的确，一个最后是A-B-E-C-D-M，另一个是A-B-E-C'-D'
> 
> 但二者有本质区别：
> 
> **三方合并时：**
> Git 创建了一个新的合并提交 M，这个 M 把 E（main 的修改）和 C、D（feature 的修改）融合在一起。
> 最终主分支的代码是以 M 为准，包含了 main 和 feature 的所有修改（这正是我们合并的目的）。
> 同时分支依然存在，C和D看起来是在E的前面，但并不包含任何E的修改，只有M有。
> 这样的好处是，历史是完整的，你随时可以回退到纯 feature 分支的状态（只有 C 和 D），不受 main 的干扰。
> 
> **Rebase（变基）：**
> 它把 feature 分支的提交 C 和 D “剪下来”，重新应用到最新的 main（E）后面，生成新的提交 C' 和 D'。
> 这样历史是比较干净，但重写了时间线，再也不能回到只有C，D修改的版本了，C,D已经变成C',D'，哈希值被改变，内容也变成了“在 E 的基础上再加上原来的修改”。
> （代码层面看不出什么不一样，但git管理层面有代价，不可回退）

---

## 6. 远程仓库与 GitHub

### 6.1 GitHub 简介

GitHub 是目前最大的代码托管平台，基于 Git。你可以把它理解为：

- **代码的网盘**：把本地 Git 仓库同步到云端，防止丢失
- **协作平台**：多人共同开发同一个项目
- **代码展示平台**：个人项目组合（Portfolio）
- **showoff平台**：（bushi）

### 6.2 git clone — 克隆远程仓库

`git clone` 是最基础的指令之一：

```bash
# 克隆公开仓库（HTTPS 方式，不需要登录）
git clone https://github.com/用户名/仓库名.git

# 克隆私有仓库或推送代码（SSH 方式，更推荐）
# 假设你前面配置了SSH密钥，那这里就使用这个方式
git clone git@github.com:用户名/仓库名.git

# 克隆到指定文件夹名
git clone git@github.com:用户名/仓库名.git my-folder

# 只克隆最近1次提交，节省时间（适合大型项目）
git clone --depth=1 git@github.com:用户名/仓库名.git
```

`git clone` 做了哪些事？

1. 下载仓库所有文件和历史记录
2. 自动设置远程连接（名为 `origin`）
3. 创建并切换到默认分支（通常是 `main`）

### 6.3 git remote — 管理远程连接

```bash
# 查看远程仓库配置
git remote -v
# 输出示例：
# origin  git@github.com:yourname/project.git (fetch)
# origin  git@github.com:yourname/project.git (push)

# 添加远程仓库（本地 init 后手动关联远程）
git remote add origin git@github.com:yourname/project.git

# 修改远程仓库的 URL（比如从 HTTPS 换成 SSH）
git remote set-url origin git@github.com:yourname/project.git

# 删除远程连接
git remote remove origin
```

### 6.4 git push — 推送到远程

```bash
# 将当前分支推送到 origin 远程
git push origin main

# 第一次推送分支，设置上游（之后可以直接 git push）
git push -u origin main

# 设置好上游后，直接推送
git push

# 推送所有本地分支
git push --all origin

# 推送标签
git push origin --tags
```

**推送失败的常见原因：**

```bash
# 错误：远程有你没有的提交（之前说的三方合并）
# error: failed to push some refs to 'github.com:...'
# hint: Updates were rejected because the remote contains work...

# 解决：先拉取，再推送
git pull origin main
git push origin main
```

### 6.5 git fetch 与 git pull — 从远程获取

```bash
# git fetch：只下载远程变化，不自动合并（安全）
git fetch origin

# 之后你可以查看远程改动再决定是否合并
git log origin/main --oneline   # 查看远程 main 分支的新提交

# git pull：下载 + 自动合并（= fetch + merge）
git pull origin main

# 设置上游后可以简写
git pull
```

**推荐日常工作流：**

```bash
# 每天开始工作前，先拉取最新代码
git pull

# 做你的修改...

# 工作结束，提交并推送
git add .  # 存到暂存区
git commit -m "feat: 完成今日功能"  # 记录修改
git push
```

### 6.6 GitHub 的 Pull Request（PR）

PR 是 GitHub 上的核心协作机制：

1. **你的代码不能直接推送到别人的仓库**（没有权限）
2. 你需要先 **Fork**（复制）对方的仓库到你的账号下
3. 在你的 Fork 上修改后，发起 **Pull Request**，请求对方合并你的改动
4. 对方审查（Code Review）、讨论、通过后合并

```
原始仓库（RoboGame-Team/control）
        │
        │ Fork
        ▼
你的仓库（YourName/control）
        │
        │ git clone
        ▼
      本地修改
        │
        │ git push
        ▼
你的仓库（YourName/control）
        │
        │ Pull Request
        ▼
原始仓库 ← 等待审查合并
```

### 6.7 git tag — 标签

```bash
# 创建轻量标签
git tag v1.0

# 创建附注标签（包含更多信息，推荐）
git tag -a v1.0 -m "第一个正式发布版本"

# 查看所有标签
git tag

# 给历史提交打标签
git tag -a v0.9 a3f8c2d -m "beta版本"

# 推送标签到远程（默认 push 不包括标签）
git push origin v1.0
git push origin --tags   # 推送所有标签
```

---
## 7. 指令速查表

### 仓库初始化与配置

| 命令 | 说明 |
|------|------|
| `git init` | 初始化新仓库 |
| `git clone <url>` | 克隆远程仓库 |
| `git config --global user.name "名字"` | 设置用户名 |
| `git config --global user.email "邮箱"` | 设置邮箱 |
| `git config --global --list` | 查看全局配置 |

### 基础工作流

| 命令 | 说明 |
|------|------|
| `git status` | 查看当前状态（最常用！） |
| `git add <file>` | 暂存指定文件 |
| `git add .` | 暂存所有改动 |
| `git commit -m "msg"` | 提交并附上信息 |
| `git commit -am "msg"` | 暂存并提交已追踪文件 |
| `git commit --amend` | 修改最近一次提交 |
| `git log --oneline` | 简洁查看历史 |
| `git log --oneline --graph --all` | 图形化查看全部分支 |
| `git diff` | 查看未暂存的改动 |
| `git diff --staged` | 查看已暂存的改动 |
| `git show <hash>` | 查看某次提交详情 |

### 撤销与恢复

| 命令 | 说明 |
|------|------|
| `git restore <file>` | 撤销工作区修改 |
| `git restore --staged <file>` | 从暂存区移出 |
| `git reset --soft HEAD~1` | 撤销提交，保留暂存 |
| `git reset HEAD~1` | 撤销提交，保留工作区 |
| `git reset --hard HEAD~1` | 撤销提交，丢弃改动 ⚠️ |
| `git revert HEAD` | 创建反向提交撤销 |
| `git reflog` | 查看操作历史（救命稻草） |

### 分支操作

| 命令 | 说明 |
|------|------|
| `git branch` | 列出本地分支 |
| `git branch -a` | 列出所有分支（含远程） |
| `git branch <name>` | 创建新分支 |
| `git switch <name>` | 切换分支 |
| `git switch -c <name>` | 创建并切换到新分支 |
| `git merge <branch>` | 将指定分支合并到当前 |
| `git branch -d <name>` | 删除已合并分支 |
| `git branch -D <name>` | 强制删除分支 |
| `git rebase <branch>` | 变基到指定分支 |

### 远程操作

| 命令 | 说明 |
|------|------|
| `git remote -v` | 查看远程配置 |
| `git remote add origin <url>` | 添加远程仓库 |
| `git remote set-url origin <url>` | 修改远程 URL |
| `git push origin <branch>` | 推送到远程 |
| `git push -u origin <branch>` | 推送并设置上游 |
| `git push` | 推送到已设置上游 |
| `git fetch origin` | 拉取远程变化（不合并） |
| `git pull` | 拉取并合并 |
| `git pull --rebase` | 拉取并变基 |

### 储藏与标签

| 命令 | 说明 |
|------|------|
| `git stash` | 储藏当前改动 |
| `git stash pop` | 取出并删除最新储藏 |
| `git stash list` | 查看储藏列表 |
| `git stash drop` | 删除最新储藏 |
| `git tag v1.0` | 创建轻量标签 |
| `git tag -a v1.0 -m "msg"` | 创建附注标签 |
| `git push origin --tags` | 推送所有标签 |

### 高级工具

| 命令 | 说明 |
|------|------|
| `git cherry-pick <hash>` | 应用指定提交 |
| `git bisect start/good/bad` | 二分查找 Bug |
| `git blame <file>` | 查看每行的最后修改者 |
| `git rm --cached <file>` | 取消文件的 Git 追踪 |
| `git shortlog -sn` | 统计每人提交次数 |

---

## 附录：Git 学习资源

| 资源                     | 链接                                                           | 说明              |
| ---------------------- | ------------------------------------------------------------ | --------------- |
| 🎮 Learn Git Branching | [learngitbranching.js.org](https://learngitbranching.js.org) | 交互式可视化学习，强烈推荐   |
| 📚 Pro Git（中文版）        | [git-scm.com/book/zh/v2](https://git-scm.com/book/zh/v2)     | 官方免费电子书         |
| 📖 官方文档                | [git-scm.com/doc](https://git-scm.com/doc)                   | 命令参考手册          |
| 🔧 gitignore 生成        | [gitignore.io](https://www.toptal.com/developers/gitignore)  | 自动生成 .gitignore |
| 💡 GitHub Skills       | [skills.github.com](https://skills.github.com)               | GitHub 官方互动教程   |

---

> 📝 **最后的话**
>
> Git 的学习曲线初期比较陡峭，但掌握了核心概念（三个区域、commit、分支）之后，其余命令都是自然延伸。
>
> **最好的学习方法是实践**：建一个自己的仓库，把课程作业、RoboGame 代码都用 Git 管理起来。犯错了不要怕——Git 几乎所有操作都可以撤销，`git reflog` 是你的最后防线。
>
> 记住最重要的三句话：
> 1. **多 commit，常 push**：小步提交，不丢工作
> 2. **分支是免费的**：新功能开分支，主线保稳定
> 3. **先 pull 再 push**：协作时的黄金法则
>
> 加油！💪

---

==到这里，基础入门就结束了，你已经掌握了大部分需要的git代码及知识。==
==后续开发项目时，可以随着自己的使用体会，逐渐加深印象。==

---

以下是一些参考内容，阅读即可。（没有什么解析了）

---

## 8. 团队协作工作流

### 8.1 集中式工作流

最简单的团队协作方式，适合小团队：

```bash
# 所有人在同一个分支（main）上工作

# 1. 开始工作前，先拉取最新代码
git pull origin main

# 2. 做你的修改并提交
git add .
git commit -m "feat: 添加超声波传感器驱动"

# 3. 推送前再次拉取（避免冲突）
git pull origin main

# 4. 解决冲突后推送
git push origin main
```

### 8.2 功能分支工作流（推荐）

每个新功能在独立分支上开发：

```bash
# 1. 从最新的 main 创建功能分支
git switch main
git pull
git switch -c feature/ultrasonic-sensor

# 2. 在功能分支上开发，频繁提交
git add .
git commit -m "feat: 添加超声波传感器头文件"

git add .
git commit -m "feat: 实现距离测量函数"

git add .
git commit -m "test: 添加传感器测试代码"

# 3. 功能完成，推送到远程
git push -u origin feature/ultrasonic-sensor

# 4. 在 GitHub 上创建 Pull Request，请求合并到 main

# 5. 审查通过后合并
git switch main
git merge feature/ultrasonic-sensor
git push origin main

# 6. 删除已合并的功能分支
git branch -d feature/ultrasonic-sensor
git push origin --delete feature/ultrasonic-sensor
```

### 8.3 Fork 工作流（开源贡献）

```bash
# 1. 在 GitHub 上 Fork 原始仓库

# 2. 克隆你的 Fork
git clone git@github.com:YourName/project.git
cd project

# 3. 添加原始仓库为 upstream（上游）
git remote add upstream git@github.com:OriginalOwner/project.git

# 4. 同步原始仓库的最新改动
git fetch upstream
git merge upstream/main

# 5. 创建功能分支并开发
git switch -c fix/motor-bug

# 6. 提交并推送到你的 Fork
git push origin fix/motor-bug

# 7. 在 GitHub 上向原始仓库发起 Pull Request
```

---

## 9. 进阶操作

### 9.1 git stash — 临时储藏

场景：你正在写代码，突然需要切换分支处理紧急问题，但当前改动没写完不想提交。

```bash
# 把当前工作区和暂存区的改动"藏"起来
git stash

# 查看储藏列表
git stash list
# 输出：stash@{0}: WIP on feature: 添加传感器驱动中...

# 取出最近一次储藏并应用（最常用）
git stash pop

# 取出指定储藏（不删除）
git stash apply stash@{1}

# 删除某个储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear
```

### 9.2 git reset — 重置提交

```bash
# --soft：撤销提交，改动保留在暂存区（最安全）
git reset --soft HEAD~1   # 撤销最近1次提交

# --mixed（默认）：撤销提交，改动退到工作区
git reset HEAD~1

# --hard：撤销提交，改动全部丢弃（危险！）
git reset --hard HEAD~1

# 回到某个具体的提交
git reset --hard a3f8c2d
```

> ⚠️ `--hard` 会**永久丢失**改动，确认无误再用！已推送到远程的提交尽量不要 reset！

### 9.3 git revert — 安全地撤销

与 `reset` 不同，`revert` 通过**新增一次提交**来抵消之前的改动，不破坏历史：

```bash
# 撤销最近一次提交（生成一个新的"撤销提交"）
git revert HEAD

# 撤销指定提交
git revert a3f8c2d
```

**选择 reset 还是 revert？**

| 情况 | 选择 |
|------|------|
| 改动还没推送到远程 | 用 `reset` |
| 改动已推送，团队已拉取 | 用 `revert`（更安全） |

### 9.4 git cherry-pick — 精选提交

只想把某个分支上的某次提交应用到当前分支：

```bash
# 将提交 a3f8c2d 应用到当前分支
git cherry-pick a3f8c2d

# 应用连续多个提交
git cherry-pick a3f8c2d..7b9e1f3
```

### 9.5 git bisect — 二分查找 Bug

当你知道某个版本有 Bug，某个版本没有，可以用二分法快速定位是哪次提交引入的：

```bash
# 开始二分查找
git bisect start

# 标记当前版本有 Bug
git bisect bad

# 标记某个已知正确的版本
git bisect good v1.0

# Git 会自动切换到中间版本，你测试后标记：
git bisect good  # 这个版本没问题
git bisect bad   # 这个版本有问题

# Git 不断二分，最终找到引入 Bug 的提交
# 找到后退出
git bisect reset
```

### 9.6 git reflog — 后悔药

`reflog` 记录了 HEAD 的每一次移动，即使误操作了 `reset --hard`，也有机会恢复：

```bash
# 查看 HEAD 的移动历史
git reflog
# 输出：
# a3f8c2d HEAD@{0}: reset: moving to HEAD~1
# 7b9e1f3 HEAD@{1}: commit: feat: 添加传感器

# 恢复到误操作之前的状态
git reset --hard HEAD@{1}
```

---

## 10. 综合实战操作指南

下面通过三个完整场景，把前面学到的所有知识串联起来。

---

### 实战一：独立开发并发布到 GitHub

**场景**：你独自开发一个 RoboGame 的电机控制库，从零建立项目并发布到 GitHub。

#### 第1步：在 GitHub 创建仓库

1. 登录 GitHub，点击右上角 **"+"** → **"New repository"**
2. 填写仓库名：`motor-control-lib`
3. 选择 **Public** 或 **Private**
4. 勾选 **"Add a README file"**
5. 在 `.gitignore` 下拉中选择 **C**
6. 点击 **"Create repository"**

#### 第2步：克隆到本地

```bash
# 复制 GitHub 上的 SSH 地址（点击 Code 按钮获取）
git clone git@github.com:YourName/motor-control-lib.git

# 进入项目目录
cd motor-control-lib

# 查看状态（此时应该是干净的）
git status
```

#### 第3步：创建项目结构

```bash
# 创建目录结构
mkdir -p src include tests
```

创建 `include/motor.h`：

```c
#ifndef MOTOR_H
#define MOTOR_H

/* 电机方向枚举 */
typedef enum {
    MOTOR_FORWARD  =  1,
    MOTOR_BACKWARD = -1,
    MOTOR_STOP     =  0
} MotorDir_t;

/* 初始化电机驱动（调用一次即可） */
void motor_init(void);

/* 设置电机速度，speed 范围 -100 到 100 */
void motor_set_speed(int channel, int speed);

/* 停止所有电机 */
void motor_stop_all(void);

#endif /* MOTOR_H */
```

创建 `src/motor.c`：

```c
#include "motor.h"
#include "stm32f4xx_hal.h"   /* 根据你的 MCU 修改头文件 */

/**
 * @brief 初始化电机驱动
 *        需要在 main() 最开始调用一次
 */
void motor_init(void) {
    /* TODO: 初始化 PWM 定时器和方向控制 GPIO */
}

/**
 * @brief 设置指定通道电机速度
 * @param channel  通道编号，范围 1~4
 * @param speed    速度，范围 -100~100
 *                 正数前进，负数后退，0 停止
 */
void motor_set_speed(int channel, int speed) {
    /* 限幅：确保速度在合法范围内，防止 PWM 越界 */
    if (speed > 100)  speed = 100;
    if (speed < -100) speed = -100;

    /* TODO: 根据 speed 符号设置方向 GPIO */
    /* TODO: 将 speed 绝对值映射到 PWM 占空比 */
}

/**
 * @brief 紧急停止所有电机
 */
void motor_stop_all(void) {
    int i;
    /* 遍历所有通道，全部设为 0 */
    for (i = 1; i <= 4; i++) {
        motor_set_speed(i, 0);
    }
}
```

#### 第4步：第一次提交

```bash
# 查看哪些文件需要提交
git status

# 暂存所有新文件
git add .

# 再次确认暂存内容
git status

# 提交（使用多行信息）
git commit -m "feat: 添加电机控制模块基础框架

- 添加 motor.h 接口定义（init/set_speed/stop_all）
- 实现 motor.c 框架，带参数限幅保护
- TODO: 完成 PWM 初始化"

# 推送到 GitHub
git push origin main
```

#### 第5步：功能迭代——PID 控制器

```bash
# 为新功能创建分支（不在主分支上直接改）
git switch -c feature/pid-controller

# 开发各个小功能，小步提交（万一出错容易回退）
git add include/pid.h
git commit -m "feat: 添加PID控制器结构体和接口定义"

git add src/pid.c
git commit -m "feat: 实现PID计算核心算法"

git add tests/test_pid.c
git commit -m "test: 添加PID控制器单元测试"

# 功能完成，查看本分支的提交历史
git log --oneline

# 推送功能分支到远程
git push -u origin feature/pid-controller
```

#### 第6步：在 GitHub 发起 Pull Request 并合并

1. 打开 GitHub 仓库页面，点击 **"Compare & pull request"**
2. 填写 PR 标题如 `feat: 添加PID控制器`
3. 在描述里说明改动内容
4. 点击 **"Create pull request"**
5. 自我审查后点击 **"Merge pull request"**

#### 第7步：本地收尾

```bash
# 切换回 main 并同步
git switch main
git pull

# 删除已合并的本地功能分支
git branch -d feature/pid-controller
```

---

### 实战二：多人协作开发

**场景**：你和队友小明共同开发 RoboGame 控制系统。

#### 你的日常操作流程

```bash
# ── 每天开始 ── 先同步最新代码
git pull origin main

# 查看队友提交了什么
git log --oneline --graph -10

# ── 开发阶段 ── 在独立分支工作
git switch -c feature/line-follower

# 多次小步提交
git add src/line_sensor.c
git commit -m "feat: 实现5路巡线读取函数"

git add src/line_follower.c
git commit -m "feat: 实现巡线PID调速逻辑"

# ── 定期同步主线 ── 避免积累大量冲突
git fetch origin
git merge origin/main   # 把主线最新内容合并进来

# 如有冲突，解决后：
git add .
git commit -m "merge: 同步主线最新改动"

# ── 推送分支 ──
git push -u origin feature/line-follower
```

#### 处理推送被拒绝（最常见问题）

```bash
# 场景：小明先推送了代码，你推送时被拒绝
git push origin main
# error: failed to push some refs...

# 方法1（推荐）：rebase 方式，历史更线性
git pull --rebase origin main
# 如有冲突，解决后：
git rebase --continue
git push origin main

# 方法2：普通 merge 方式，会多一个合并提交
git pull origin main
git push origin main
```

---

### 实战三：救援操作——误操作后恢复

#### 场景A：不小心删除了文件

```bash
# 误操作：删除了重要文件
rm -f src/motor.c

# 恢复：从 Git 仓库还原（立竿见影！）
git restore src/motor.c
```

#### 场景B：提交信息写错了

```bash
# 刚提交，发现提交信息有错别字
git commit --amend -m "fix: 修复电机反转方向错误"
# 注意：--amend 会修改上次提交的哈希值
# 如果已经推送到远程，不要用这个命令！
```

#### 场景C：不小心提交了敏感文件

```bash
# 情况：把含密码的 secrets.h 提交了
git log --oneline
# a3f8c2d 添加了 secrets.h（事故！）

# 第1步：撤销这次提交，但保留文件在工作区
git reset --soft HEAD~1

# 第2步：把 secrets.h 加入 .gitignore
echo "secrets.h" >> .gitignore

# 第3步：重新提交（不包含 secrets.h）
git add .gitignore
git add src/  include/  # 只加需要的文件
git commit -m "feat: 添加配置模块（已排除敏感文件）"

# 记得：如果已经推送到 GitHub，还需要联系管理员处理
# 或者使用 git filter-branch（高级操作，谨慎）
```

#### 场景D：不小心 reset --hard 丢失了重要提交

```bash
# 查看操作历史（reflog 是你的生命线）
git reflog
# 输出：
# a3f8c2d HEAD@{0}: reset: moving to HEAD~3   ← 误操作
# e7f1234 HEAD@{1}: commit: feat: 重要新功能   ← 这是我们要恢复的

# 恢复到误操作前
git reset --hard e7f1234
# 重要提交回来了！
```

---

## 11. 常见问题与排错

### Q1：git push 报错 "Permission denied (publickey)"

```bash
# 原因：SSH 密钥没配置好
# 排查步骤：
ssh -T git@github.com          # 测试 SSH 连接

# 如果报错：
ls ~/.ssh/                      # 检查密钥是否存在
# 没有密钥 → 重新执行 ssh-keygen 步骤
# 有密钥但出错 → 确认公钥已添加到 GitHub Settings
```

### Q2：如何查看某次提交的完整改动

```bash
# 查看某次提交的详情和改动内容
git show a3f8c2d

# 只显示改动的文件名
git show a3f8c2d --name-only
```

### Q3：如何彻底放弃所有未提交改动

```bash
# 警告：以下操作不可逆！
git restore .             # 恢复所有工作区文件
git restore --staged .    # 清空暂存区
# 或者一步到位：
git reset --hard HEAD
```

### Q4：中文文件名显示乱码

```bash
# 解决 Git 中文路径显示为 \数字 的问题
git config --global core.quotepath false
```

### Q5：每次 push 都要输密码

```bash
# 说明你在使用 HTTPS 地址，改为 SSH 地址：
git remote set-url origin git@github.com:yourname/repo.git
# 之后就不需要输密码了（用 SSH 密钥认证）
```

### Q6：如何查看是谁修改了某一行代码

```bash
# git blame 显示文件每一行的最后修改人和时间
git blame motor.c

# 只查看某个范围的行
git blame -L 10,30 motor.c
```

---
*文档版本：v1.0 | 适用平台：Git 2.x + GitHub | 面向：USTC 大一新生*
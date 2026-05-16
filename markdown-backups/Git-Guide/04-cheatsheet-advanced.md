---
title: "速查表与进阶操作"
chapter: 4
readTime: 12
description: "所有命令速查 + stash/reset/revert/cherry-pick/bisect/reflog。"
---

## 仓库初始化与配置

| 命令 | 说明 |
|------|------|
| `git init` | 初始化新仓库 |
| `git clone <url>` | 克隆远程仓库 |
| `git config --global user.name "名字"` | 设置用户名 |
| `git config --global user.email "邮箱"` | 设置邮箱 |
| `git config --global --list` | 查看全局配置 |

## 基础工作流

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

## 撤销与恢复

| 命令 | 说明 |
|------|------|
| `git restore <file>` | 撤销工作区修改 |
| `git restore --staged <file>` | 从暂存区移出 |
| `git reset --soft HEAD~1` | 撤销提交，保留暂存 |
| `git reset HEAD~1` | 撤销提交，保留工作区 |
| `git reset --hard HEAD~1` | 撤销提交，丢弃改动 ⚠️ |
| `git revert HEAD` | 创建反向提交撤销 |
| `git reflog` | 查看操作历史（救命稻草） |

## 分支操作

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

## 远程操作

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

## 储藏与标签

| 命令 | 说明 |
|------|------|
| `git stash` | 储藏当前改动 |
| `git stash pop` | 取出并删除最新储藏 |
| `git stash list` | 查看储藏列表 |
| `git stash drop` | 删除最新储藏 |
| `git tag v1.0` | 创建轻量标签 |
| `git tag -a v1.0 -m "msg"` | 创建附注标签 |
| `git push origin --tags` | 推送所有标签 |

## 高级工具

| 命令 | 说明 |
|------|------|
| `git cherry-pick <hash>` | 应用指定提交 |
| `git bisect start/good/bad` | 二分查找 Bug |
| `git blame <file>` | 查看每行的最后修改者 |
| `git rm --cached <file>` | 取消文件的 Git 追踪 |
| `git shortlog -sn` | 统计每人提交次数 |


## 附录：Git 学习资源

| 资源                     | 链接                                                           | 说明              |
| ---------------------- | ------------------------------------------------------------ | --------------- |
| 🎮 Learn Git Branching | [learngitbranching.js.org](https://learngitbranching.js.org) | 交互式可视化学习，强烈推荐   |
| 📚 Pro Git（中文版）        | [git-scm.com/book/zh/v2](https://git-scm.com/book/zh/v2)     | 官方免费电子书         |
| 📖 官方文档                | [git-scm.com/doc](https://git-scm.com/doc)                   | 命令参考手册          |
| 🔧 gitignore 生成        | [gitignore.io](https://www.toptal.com/developers/gitignore)  | 自动生成 .gitignore |
| 💡 GitHub Skills       | [skills.github.com](https://skills.github.com)               | GitHub 官方互动教程   |


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




以下是一些参考内容，阅读即可。（没有什么解析了）



## 集中式工作流

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

## 功能分支工作流（推荐）

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

## Fork 工作流（开源贡献）

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



## git stash — 临时储藏

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

## git reset — 重置提交

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

## git revert — 安全地撤销

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

## git cherry-pick — 精选提交

只想把某个分支上的某次提交应用到当前分支：

```bash
# 将提交 a3f8c2d 应用到当前分支
git cherry-pick a3f8c2d

# 应用连续多个提交
git cherry-pick a3f8c2d..7b9e1f3
```

## git bisect — 二分查找 Bug

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

## git reflog — 后悔药

`reflog` 记录了 HEAD 的每一次移动，即使误操作了 `reset --hard`，也有机会恢复：


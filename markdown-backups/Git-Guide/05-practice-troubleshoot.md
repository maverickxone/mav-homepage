---
title: "实战场景与常见排错"
chapter: 5
readTime: 15
description: "三个完整实战流程 + 常见问题解答——从独立开发到多人协作到误操作恢复。"
---
```bash
# 查看 HEAD 的移动历史
git reflog
# 输出：
# a3f8c2d HEAD@{0}: reset: moving to HEAD~1
# 7b9e1f3 HEAD@{1}: commit: feat: 添加传感器

# 恢复到误操作之前的状态
git reset --hard HEAD@{1}
```



下面通过三个完整场景，把前面学到的所有知识串联起来。


## 实战一：独立开发并发布到 GitHub

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


## 实战二：多人协作开发

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


## 实战三：救援操作——误操作后恢复

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



## Q1：git push 报错 "Permission denied (publickey)"

```bash
# 原因：SSH 密钥没配置好
# 排查步骤：
ssh -T git@github.com          # 测试 SSH 连接

# 如果报错：
ls ~/.ssh/                      # 检查密钥是否存在
# 没有密钥 → 重新执行 ssh-keygen 步骤
# 有密钥但出错 → 确认公钥已添加到 GitHub Settings
```

## Q2：如何查看某次提交的完整改动

```bash
# 查看某次提交的详情和改动内容
git show a3f8c2d

# 只显示改动的文件名
git show a3f8c2d --name-only
```

## Q3：如何彻底放弃所有未提交改动

```bash
# 警告：以下操作不可逆！
git restore .             # 恢复所有工作区文件
git restore --staged .    # 清空暂存区
# 或者一步到位：
git reset --hard HEAD
```

## Q4：中文文件名显示乱码

```bash
# 解决 Git 中文路径显示为 \数字 的问题
git config --global core.quotepath false
```

## Q5：每次 push 都要输密码

```bash
# 说明你在使用 HTTPS 地址，改为 SSH 地址：
git remote set-url origin git@github.com:yourname/repo.git
# 之后就不需要输密码了（用 SSH 密钥认证）
```

## Q6：如何查看是谁修改了某一行代码

```bash
# git blame 显示文件每一行的最后修改人和时间
git blame motor.c

# 只查看某个范围的行
git blame -L 10,30 motor.c
```


---
title: "项目走到哪一步了"
chapter: 7
readTime: 26
description: "沿着 Git 历史和当前源码查看项目进度，分清已经接通的链路、已有入口的模块和等待实机验证的部分。"
infoCutoff: "项目状态截至 2026-07-14 · Git HEAD fc3ef5d"
---

## 把镜头从一条命令拉到整个仓库

前面几章一直跟着 `START_MOTION` 行走。它从 USART1 进入 STM32，通过协议解析和命令分发，最后让四路电机得到 PWM。沿着这条路，我们已经看到一段完整的软件链路。现在把镜头拉远，问题变成：整个 RoboGame 2026 下位机已经完成了哪些部分，哪些部分刚刚留好接口，哪些结论还需要实车来证明？

本章以 2026 年 7 月 14 日看到的仓库为准，Git 当前提交是 `fc3ef5d`。这个提交本身产生于 2026 年 6 月 13 日。状态判断优先查看当前源码和 `USER/WHEELTEC.uvprojx`，然后参考各模块 README 与 Git 历史。

完成度在嵌入式项目里有几种不同含义。文件已经写好，说明设计进入了代码；文件已经加入 Keil 工程，说明它会参与目标构建；编译通过、烧录成功、电机实转和整车联调，又是更进一步的证据。把这些证据分开记录，初学者就能清楚理解“代码里有”与“车上验证过”之间的距离。

## 从原厂小车工程长出新的下位机

仓库在 2026 年 4 月 30 日导入 WHEELTEC C50X 原厂工程。2026 年 6 月 6 日，项目重新整理商家源码，只保留 `Mec_Car` 目标，并创建 `LOWER_CONTROLLER/`。电机、编码器、串口、IMU、FreeRTOS 和 STM32 标准库继续提供基础能力，新的比赛业务获得了单独、清楚的代码边界。

随后一周的提交把工作台逐渐接通。6 月 8 日，`main.c` 从原厂的多任务入口切换到新的 `app_task`，UART 接收、协议解析、命令分发和响应发送进入 Keil 工程。6 月 9 日，ICM20948 驱动与系统初始化得到整理，USB 手柄等冲突依赖被清理。6 月 11 日加入 `FlyMcu2188.exe`，为已有工程补上一个烧录工具入口。6 月 12 日更新生成的通信协议。6 月 13 日加入固定 PWM 的平移、旋转和停止，并把新协议通信口确定为 USART1。

| 时间 | 提交 | 留下的关键结果 |
| --- | --- | --- |
| 2026-04-30 | `813481c` | 导入 WHEELTEC 原厂工程 |
| 2026-06-06 | `d87d486` | 重新整理商家源码基线 |
| 2026-06-06 | `927d447` | Keil 工程只保留 `Mec_Car` 目标 |
| 2026-06-06 | `c88087b` | 建立 APP、PROTOCOL、TRANSPORT、MOTION、SENSORS、ACTUATORS、BOARD、COMMON 的目录边界 |
| 2026-06-08 | `be94cd7` | `app_task`、UART 通道、协议解析、命令分发和响应链路接入 |
| 2026-06-09 | `7eae974`、`de7cb00`、`6b23148` | 调整 ICM20948、精简初始化、清理冲突依赖 |
| 2026-06-11 | `6e17464` | 加入 FlyMcu 烧录程序 |
| 2026-06-12 | `6743876` | 更新协议与生成的消息编解码代码 |
| 2026-06-13 | `0191992`、`fc3ef5d` | 接入部分运动命令，通信口切到 USART1 |

这条历史线说明当前阶段的重点很明确：先把新的软件骨架接通，再让第一组运动命令落到真实电机接口。编码器闭环、航向角和操作机构位于下一段工作中。

## 十七条命令分别走到了哪里

协议头文件 `comm_protocol.h` 定义了 17 条命令。命令出现在协议里，表示上下位机已经约定了名称、编号和参数格式。命令分发器拥有具体动作后，它才会真正推动机器人或返回有意义的数据。

当前有 6 条命令具备具体行为。`PING` 回复成功 ACK；`GET_PAYLOAD_VERSION` 回复 ACK 并发送版本值 `20260612`；`TEST_COMMAND` 把收到的 32 位整数作为测试 telemetry 送回；`START_MOTION` 和 `START_ROTATION` 驱动固定 PWM；`STOP_MOTION` 清零四路输出。其余 11 条命令已经进入参数解析和错误回复链路，合法参数得到 `NOT_IMPLEMENTED`。

| 命令 | 当前行为 |
| --- | --- |
| `PING` | 检查空参数，回复 ACK OK |
| `MOVE_BY_TIME` | 解析方向、档位和持续时间，回复 `NOT_IMPLEMENTED` |
| `MOVE_BY_DISTANCE` | 解析方向、档位、距离和容差，回复 `NOT_IMPLEMENTED` |
| `START_MOTION` | 根据方向输出固定 PWM 3000，回复执行状态 |
| `ROTATE_BY_TIME` | 解析方向、档位和持续时间，回复 `NOT_IMPLEMENTED` |
| `ROTATE_BY_ANGLE` | 解析方向、档位、角度和容差，回复 `NOT_IMPLEMENTED` |
| `START_ROTATION` | 根据顺时针或逆时针方向输出固定 PWM 3000 |
| `STOP_MOTION` | 清零 A、B、C、D 四路 PWM 和方向引脚 |
| `GET_HEADING` | 检查空参数，回复 `NOT_IMPLEMENTED` |
| `MOVE_LIFT_TO_HEIGHT` | 解析目标高度，回复 `NOT_IMPLEMENTED` |
| `SET_LIFT` | 解析升降方向和档位，回复 `NOT_IMPLEMENTED` |
| `STOP_LIFT` | 检查空参数，回复 `NOT_IMPLEMENTED` |
| `SET_GRIPPER` | 解析夹爪开合状态，回复 `NOT_IMPLEMENTED` |
| `START_PUSHROD` | 解析推杆方向，回复 `NOT_IMPLEMENTED` |
| `STOP_PUSHROD` | 检查空参数，回复 `NOT_IMPLEMENTED` |
| `GET_PAYLOAD_VERSION` | 回复 ACK，并发送 payload version telemetry `20260612` |
| `TEST_COMMAND` | 回复 ACK，并把输入整数作为测试 telemetry 返回 |

这张表也展示了“协议入口”和“完整功能”之间的进度。按距离移动已经拥有 `distance_mm`、`tolerance_mm` 和参数校验；当前控制板会返回 `NOT_IMPLEMENTED`，清楚告诉上位机这项功能仍在建设。编码器反馈与距离控制接入后，这条命令就能继续向真实动作推进。

## 八个新模块的实际状态

`LOWER_CONTROLLER/` 里的目录名描绘了目标架构，目录中的源码和 Keil 工程文件则显示当前落地程度。

| 模块 | 当前可确认的状态 |
| --- | --- |
| `APP` | `app_task`、命令分发和 ACK/telemetry 发送已经加入 Keil 目标 |
| `PROTOCOL` | 帧解析、CRC、命令参数解码和响应编码已经接入，payload version 为 `20260612` |
| `TRANSPORT` | USART1 中断收字节、256 字节接收缓冲和逐字节发送已经接入 |
| `BOARD` | USART1、115200、固定 PWM、轮位映射和方向系数已有集中配置 |
| `MOTION` | 持续平移、持续旋转和停止已接入；档位、时间、距离、角度和闭环仍待完成 |
| `SENSORS` | 编码器和 ICM20948 底层驱动已经初始化；新的航向、编码器反馈和限位接口仍待接入 |
| `ACTUATORS` | 升降、夹爪、推杆的协议入口和规划已经存在，业务源码与硬件接口仍待接入 |
| `COMMON` | 职责边界已经写入 README，公共类型与工具文件仍待按实际需要增加 |

旧的 `HARDWARE/` 继续承担 GPIO、定时器、电机、编码器和 IMU 驱动。新的模块像一层整齐的接线板，把比赛命令连接到这些底层能力。`USER/main.c` 当前只创建新的 `app_task`，原厂 `Balance_task`、显示任务、手柄任务和数据上报任务已经退出启动链路。

## 代码证据与实车证据之间

`USER/WHEELTEC.uvprojx` 的目标名是 `Mec_Car`，芯片为 STM32F407VE。工程文件已经包含 APP、协议、UART 和运动控制的 `.c` 文件，说明新的主链路进入了构建清单。项目配置会生成 AXF 和 HEX，并在构建后调用 `fromelf` 生成 BIN。

仓库使用 `.gitignore` 将 `OBJ/`、`*.hex` 和 `*.bin` 作为本地产物管理，因此 Git 历史主要保存源码和工程配置。`TESTS/` 当前保存了测试规划，下一次联调可以把提交号、Keil 编译结果、烧录结果、串口抓包和轮子动作写入同一份记录。按照当前仓库证据，最新代码的编译、烧录与整车测试状态记为“仓库中待补验证记录”。

源码已经清楚展示固定 PWM 的输出路径，现场记录将继续回答轮子怎样实际转动。带有提交号、板卡版本、接线、命令帧、ACK 和动作结果的记录，会让这项状态继续向前推进。

阅读文档时还有两处值得留意的同步事项。真实轮位映射以 `board_motion_config.h` 为准，当前是左前 A、左后 D、右前 B、右后 C；`MOTION/README.md` 的一张旧表仍写着 A、B、C、D。真实发送串口由 `board_uart_config.h` 选为 USART1，发送代码会进入 `uart1_send()`；`TRANSPORT/README.md` 的发送路径示例仍保留 `uart3_send()`。这些差异属于文档更新工作，当前书稿采用实际配置头文件和源码的值。

项目现在已经拥有一条能够讲清楚、也能够继续扩展的主干。下一章沿着这条主干安排开发顺序：先让工程可重复构建，再验证通信和单轮动作，随后补齐安全、闭环、航向和操作机构，让每一步都留下看得见的证据。

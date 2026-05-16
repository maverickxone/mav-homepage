---
title: "Rust 在哪里出没——它的边界和地盘"
chapter: 4
readTime: 18
description: "系统编程、WebAssembly、嵌入式、CLI 工具——Rust 擅长什么，不擅长什么。"
---
## 4.1 先说结论：Rust不是全能药

在正式聊Rust的地盘之前，我想先说一件很多Rust布道者不愿意承认的事：**Rust不适合所有场景**。它是一把非常锋利的刀，但你不能拿它来切豆腐，那既浪费了刀，也没把豆腐切好。

理解一门语言"在哪里出没"，不只是要知道它能干什么，更要知道它在哪里有竞争优势、在哪里根本不该出现。这一章我们就来拆解这件事。

Rust的核心价值主张是：**以接近C的性能，提供更安全的系统级编程能力**。这个定位本身就画出了它的地图——凡是需要"低层次控制"且"不能容忍崩溃"的地方，它就有机会。凡是对速度要求不高、对开发效率要求极高的地方，它大概率不是最优解。


## 4.2 系统编程：Rust的老家

#### 4.2.1 操作系统：从理论到现实

"用Rust写操作系统"在2015年听起来像一个大学生的课程项目，在2026年已经是真实发生在Linux主线里的事情。但我们先从头说起。

操作系统是一个对内存控制要求极端严苛的场景。内核代码几乎不能使用垃圾回收，因为GC的停顿是不可预测的——你不能在处理中断的时候突然被GC暂停200毫秒。C语言几十年来是这个领域的唯一选项，C++在内核里也很少见（Linux内核明确拒绝C++，Linus对C++的评价是……不方便引用）。

Rust对这个场景的适应性体现在几个方面：

**没有运行时，没有GC**。Rust的标准库有一个`no_std`模式，去掉标准库的大部分内容后，你得到的是一个几乎没有运行时开销的裸机环境。编译出来的二进制和C的差不多，因为本质上Rust就是"带类型检查的C"，LLVM后端是一样的。

**内存安全不依赖运行时**。所有权系统在编译期完成所有检查，运行时不需要额外的引用计数或GC扫描。这意味着"Rust的内存安全"对运行时性能的影响几乎为零。

**`unsafe`块的存在**。纯Rust在内核里无法做所有事情，因为内核需要操作裸指针、直接访问硬件寄存器、手动管理内存布局。`unsafe`块允许你在必要的地方绕过借用检查器，但它强迫你把"不安全的代码"显式标记出来，集中在有限的几个地方，而不是整个代码库都可能有问题。

这和C的区别很微妙但很重要：C里随便哪一行都可能是内存问题的根源，`unsafe`Rust里只有被标记的那几块是"危险区"，其余的代码编译器已经帮你保证安全了。

**Redox OS** 是目前最成熟的纯Rust操作系统项目，从内核到用户态工具链全部用Rust写。它不是Linux的替代品，更像是一个实验室，用来探索"如果用Rust从零设计一个OS能做到什么"。Redox有自己的微内核架构、自己的libc实现（relibc）、自己的包管理器。跑起来的截图看着和一个古早的Unix桌面差不多，但背后的代码质量和安全属性是完全不同的量级。

#### 4.2.2 驱动程序：另一个雷区

驱动程序是内存漏洞的重灾区。Windows历史上大量的蓝屏死机（BSOD）源于第三方驱动，因为驱动运行在内核态，一个野指针直接就能让系统崩溃。

微软正在推动用Rust写Windows驱动，这件事我们放到第六章细说。但从技术角度，Rust在这里的价值是一样的：**编译期的安全保证比运行时的崩溃恢复要好一个数量级**。驱动程序你无法"捕获异常然后重试"，所以让编译器在代码提交之前就揪出问题是最理想的。

#### 4.2.3 嵌入式：STM32上的铁锈味

这一节和尾声有重叠，我先在这里给一个整体视角，尾声里再给微电子方向的具体建议。

嵌入式场景是Rust近年来发力很猛的地方。嵌入式的需求和操作系统类似：没有OS，没有动态内存分配（有时候），资源极其受限，绝对不能崩。传统上这是C和汇编的天下。

Rust的`embedded-hal`生态在过去五年里从零发展到了相当可用的程度。HAL是Hardware Abstraction Layer（硬件抽象层）的缩写，`embedded-hal`定义了一套通用的trait接口——比如"什么叫一个SPI设备"、"什么叫一个I2C总线"——然后不同的芯片厂商或社区提供各自的实现。

```rust
// 一个简单的嵌入式Rust例子：点亮一个LED
#![no_std]
#![no_main]

use panic_halt as _;
use stm32f4xx_hal::{pac, prelude::*};

#[cortex_m_rt::entry]
fn main() -> ! {
    let dp = pac::Peripherals::take().unwrap();
    let gpioa = dp.GPIOA.split();
    let mut led = gpioa.pa5.into_push_pull_output();

    loop {
        led.set_high();
        cortex_m::asm::delay(8_000_000);
        led.set_low();
        cortex_m::asm::delay(8_000_000);
    }
}
```

这段代码初看有点怪，但如果你写过STM32的HAL库C代码，你会发现逻辑是一样的，只是语法不同。`#![no_std]`和`#![no_main]`告诉编译器不用标准库和标准入口点，这是嵌入式Rust的标准开场。

目前STM32、ESP32、RP2040（树莓派Pico的芯片）、nRF52系列都有社区维护的Rust支持，成熟度参差不齐。RP2040的`rp-hal`算是文档比较完善的，ESP32的Rust支持背后有Espressif官方工程师在维护，相对可靠。STM32的`stm32f4xx-hal`能用，但踩坑概率比直接用STM32CubeMX生成C代码要高，适合有Rust基础的人去探索，不适合刚入门嵌入式的同学作为第一选择。


## 4.3 WebAssembly：前端里的铁锈

#### 4.3.1 WebAssembly是什么

WebAssembly（Wasm）是一个二进制指令格式，设计目标是在浏览器里安全地运行接近原生速度的代码。它不是JavaScript的替代品，而是JS的补充——你用JS做界面交互，用Wasm做计算密集型任务。

Wasm的思路很简单：浏览器沙箱里现在有了一个"虚拟机"，任何语言只要能编译到这个格式，就能在浏览器里跑。最早支持编译到Wasm的语言里，Rust是反应最快、生态最完整的之一。

#### 4.3.2 为什么Rust和Wasm特别搭

第一，**Rust没有GC**。Wasm的早期版本没有内置GC支持（现在有了WasmGC的提案，但还不普及），带GC的语言编译到Wasm时要把GC运行时也打包进去，导致bundle体积暴涨。Rust的二进制可以只包含真正用到的代码，体积小。

第二，**Rust的`wasm-pack`工具链很成熟**。`wasm-pack`是一个把Rust代码打包成npm包的工具，打包出来可以直接`npm install`，在JS/TS项目里像普通npm包一样调用。

第三，**Rust和JS的互操作通过`wasm-bindgen`非常便捷**。你可以直接在Rust里声明"这个函数导出给JS用"，JS那边就能直接调用，数据类型转换也是自动的。

```rust
// Rust侧：用wasm-bindgen暴露接口给JS
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}
```

```javascript
// JS侧：像普通函数一样调用
import init, { fibonacci } from './pkg/my_wasm.js';

await init();
console.log(fibonacci(40)); // 比纯JS快很多
```

#### 4.3.3 真实使用案例

**Figma** 的渲染引擎是用C++写然后编译到Wasm的，但这里提Figma是为了说明Wasm在复杂图形渲染场景下的价值——需要操作大量像素、做矩阵运算、维护复杂状态的场景，JavaScript真的撑不住。

**Cloudflare Workers** 支持运行Wasm，这意味着你可以用Rust写边缘计算逻辑，部署到Cloudflare的全球节点上，延迟极低。Cloudflare自己的很多基础设施也在用Rust。

**wasmtime** 和 **wasmer** 是两个在服务器端运行Wasm的运行时，后端也开始用Wasm做插件系统或者沙箱隔离。这个方向在2024-2025年开始变热，Rust在这里既是编写Wasm程序的语言，也是编写Wasm运行时本身的语言。

WebAssembly不是银弹，它不能直接访问DOM（需要通过JS桥接），初次加载有编译开销，调试比JS麻烦。但对于"需要在浏览器里做大量计算"的场景，Rust+Wasm是目前最好的组合之一。


## 4.4 CLI工具：你可能已经在用Rust写的东西

#### 4.4.1 这个赛道Rust已经赢了

如果你用过现代的命令行工具，你很可能已经在不知情的情况下用了Rust写的软件。这个赛道是Rust渗透率最高的地方之一，原因很简单：CLI工具对启动速度要求高、对内存占用敏感、分发要求简单（最好是一个静态链接的单一可执行文件）。这些需求Rust全部满足。

#### 4.4.2 你可能用过的Rust CLI工具

**ripgrep（rg）**：全文搜索工具，grep的现代替代品。由Rust社区著名人物Andrew Gallant（BurntSushi）开发，速度快到让人怀疑人生。它用了Rust的`regex`库，这个库本身也是极其工程化的产物，支持SIMD加速，在大文件搜索场景下把GNU grep和ag都打得很惨。如果你装了ripgrep但还在用grep，是时候切换了。

```bash
# 搜索当前目录下所有.rs文件里的"unsafe"关键字
rg "unsafe" --type rust

# 输出带行号，忽略大小写
rg -i -n "todo" src/
```

**fd**：`find`命令的现代替代品。语法更人性化，默认忽略`.gitignore`里的文件，彩色输出，速度更快。这是那种你用了一次就不想回去的工具。

**bat**：`cat`命令的现代替代品，带语法高亮和行号，还能和`git`集成显示改动。在终端里查看代码文件用`bat`比`cat`舒服很多。

**exa / eza**：`ls`命令的现代替代品，支持树状显示、Git状态显示、图标。（exa已停止维护，社区fork成了eza继续维护，两个都是Rust写的。）

**tokei**：代码行数统计工具，速度极快，对大型项目效果明显。统计一个几十万行代码的项目，C语言写的cloc要跑几秒，tokei基本上瞬间出结果。

**hyperfine**：命令行基准测试工具，用来比较两个命令的速度，输出很好看，直接给出统计意义上的对比结果。写CLI工具的人基本上都用这个做性能测试。

**delta**：`git diff`的现代显示增强，语法高亮、并排对比，从此diff不再是眼花缭乱的纯文字。

**zoxide**：`cd`命令的智能替代，学习你的目录访问习惯，之后输入模糊路径直接跳转。结合fzf用起来极其舒适。

#### 4.4.3 为什么这些工具要用Rust重写

这里有一个值得思考的问题：这些工具大多有Python或Go的替代品可以做，为什么要选Rust？

原因有几个：

**启动速度**。CLI工具的使用场景往往是频繁调用，每次调用的启动时间都很重要。Python解释器启动就要几十毫秒，在shell脚本里被循环调用时累积效果很明显。Rust的可执行文件启动几乎没有开销。

**单一静态二进制**。Rust默认可以编译成静态链接的单一可执行文件，在Linux上只需要`curl`下载一个文件然后`chmod +x`就能用，不需要安装runtime，不需要依赖管理。Go也能做到这点，但Rust的二进制通常更小（因为没有Go运行时的goroutine调度器等组件）。

**内存占用**。跑一个Python脚本动辄几十MB内存基线，Rust工具通常只需要几MB甚至更少。在服务器上大量并发调用时差距很明显。

当然代价是：写Rust CLI比写Python脚本要慢得多，学习曲线也更陡。这就是工程上的取舍——如果工具是一次性脚本，Python更合适；如果要分发给很多人用、要追求极致性能，Rust更合适。


## 4.5 编辑器与基础设施：Zed就是这里的代言人

#### 4.5.1 Zed：超级快的编辑器

你从VSCode切换到Zed，然后被速度惊艳——这是一个很典型的Zed用户初体验。Zed的核心卖点就是"速度"，而它能做到这一点，Rust是根本原因。

Zed是由前Atom编辑器核心团队成员创办的公司开发的。Atom是GitHub做的编辑器，用Electron（Web技术）实现，在市场上曾经很流行，但慢是它永远绕不开的诟病——因为它本质上是个浏览器跑Web应用。VSCode也是Electron，但微软在优化上下了更多功夫，所以VSCode比Atom好一些，但仍然有Electron的固有开销。

Zed的团队决定不走Web技术路线，从零用Rust重写一个编辑器，自己实现渲染引擎（GPUI）、自己实现文本处理、自己实现协作功能。GPUI直接调用GPU做UI渲染，跳过了大量的中间层，这就是它快的原因。

#### 4.5.2 Zed背后的技术选择

Zed用到了以下Rust生态里的核心组件：

**Rope数据结构**用于文本存储。传统的编辑器用字符串或者数组存储文本，在大文件和频繁编辑的场景下效率很差。Rope是一种树状结构，插入和删除操作是O(log n)的，Zed的`rope`实现专门针对多核并发和协作编辑优化过。

**Tree-sitter**用于语法高亮和代码结构分析。Tree-sitter是一个C写的增量解析器生成器，Zed通过Rust绑定使用它。Tree-sitter的增量特性意味着你每次输入一个字符，它只重新解析改动附近的那一小块，而不是整个文件——这是Zed语法高亮不卡顿的原因。VSCode的TextMate语法高亮是正则表达式实现的，Tree-sitter是真正的语法解析，准确度和性能都更好。

**LSP（Language Server Protocol）**集成。Zed内置了对各语言Language Server的支持，Rust这边自然是`rust-analyzer`，C/C++是`clangd`，等等。LSP本身是微软定义的协议，与语言无关，Zed的LSP客户端实现是用Rust写的。

#### 4.5.3 类似的基础设施项目

Zed不是孤例。一批以"性能"为核心卖点的工具正在涌现，背后大多是Rust：

**SWC**：JavaScript/TypeScript的编译器，Rust实现，用来替代Babel。Next.js 12开始用SWC替代Babel，冷启动速度提升显著。SWC的开发者是韩国大学生DongYoon Kang，他在大学期间开始写这个项目，然后被Vercel招募专门维护它。

**Oxc**：新一代JS工具链，包含parser、linter、formatter、bundler，全部Rust实现。目标是做一个统一的、极速的JS工具集，替代ESLint、Prettier、Babel的组合。

**Biome**（前身是Rome）：JS/TS的格式化和lint工具，Rust实现，目标是比Prettier快，比ESLint更集成。

**turbopack**：Webpack的继任者，Vercel开发，Rust实现，用在Next.js的新版本里。开发模式下的热更新速度提升巨大。

**uv**：Python包管理器，Rust实现，用来替代pip和pip-tools。速度比pip快10-100倍，2024年发布后迅速被很多Python开发者采纳——这是个很有趣的现象，Python开发者用Rust写的工具来管理Python依赖。

这个模式已经很清晰了：当一个工具的性能对使用体验有明显影响，而且这个工具的使用场景足够广泛，就值得用Rust重写一遍。


## 4.6 Rust不擅长什么：划清边界

#### 4.6.1 快速原型和脚本

你有一个想法要验证，需要在两小时内写一个demo，这时候用Rust是在自我折磨。借用检查器会在你还没想清楚数据结构的时候就开始找你麻烦，生命周期标注会让你花大量时间在编译器身上而不是在逻辑上。

这种场景用Python，或者Go（如果你需要并发），或者Node.js（如果原型涉及Web）。Rust是"一旦编译通过就很可靠"，但到达"编译通过"这一步的成本比其他语言高得多。

#### 4.6.2 数据科学和机器学习

Rust在数据科学领域几乎没有地位，原因是生态问题。Python有NumPy、Pandas、PyTorch、TensorFlow、Scikit-learn、Matplotlib……这套生态花了二十年建立，Rust根本没有可比较的替代品。

Rust有`ndarray`、`polars`（DataFrame库，性能很好，但用户量和Python Pandas差距悬殊）、一些ML框架的Rust绑定，但整体生态的完整度和易用性与Python相差太远。如果你做AI/ML，Rust不是你的语言，Python才是。（但Rust可能是你用的AI框架的底层运行时，比如HuggingFace的`tokenizers`库核心逻辑就是Rust写的。）

#### 4.6.3 业务后端和CRUD应用

Rust有Web框架，`Actix-web`的性能基准测试结果非常亮眼，`Axum`的API设计也很现代。但绝大多数业务后端不需要这种性能——瓶颈在数据库，不在服务器代码。这种场景用Go、Python Django/FastAPI、Node.js Express、Java Spring Boot都行，开发效率比Rust高得多。

除非你的业务后端有非常特殊的性能需求（比如实时游戏服务器、高频交易系统），否则Rust不是后端的最优选择。

#### 4.6.4 GUI应用

Rust的GUI生态目前还比较混乱。有`egui`（即时模式GUI，适合工具软件）、`iced`（类Elm架构，更现代）、`Tauri`（用Web技术做界面，Rust做后端逻辑，类似Electron但更轻量）、GTK/Qt的Rust绑定……但没有一个像Qt或者Electron那样相对成熟稳定的选项。如果要做GUI应用，这仍然是一个需要谨慎评估的领域。

**Tauri** 是一个有趣的例外：它用Web技术（HTML/CSS/JS）做界面，Rust做原生功能层，打包出来的体积比Electron小很多，性能也好很多。如果你已经熟悉前端技术栈，Tauri是一个值得关注的桌面应用方案，它让你不必完全用Rust写界面，但仍然能享受Rust在原生功能层面的优势。



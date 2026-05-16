---
title: "Rust 长什么样——给 C 党的语法速览"
chapter: 3
readTime: 40
description: "变量、函数、结构体、枚举、模式匹配、trait——可选的硬核章节。"
---
> 这一章是可选的硬核内容。如果你只想了解Rust的存在价值和适用场景，可以跳过这章，直接看第四章，不影响理解。
>
> 如果你想看看Rust代码实际长什么样，这章给你一个概览——不求你现在就能写Rust，但求看懂基本结构，对语法有直觉。

## 3.1 变量、函数、控制流：和C像不像

#### 3.1.1 变量声明：let和mut

C里声明变量：
```c
int x = 5;
x = 10; // 可以改
```

Rust里：
```rust
let x = 5;       // 不可变绑定，类型自动推断为i32
x = 10;       // 编译错误！默认不可变！
let mut y = 5;   // 可变绑定
y = 10;          // OK
```

最大的区别：Rust默认变量是**不可变的**（immutable）。想要可变必须显式加`mut`。这个设计初看有点烦，但它有几个好处：

1. 不可变性让代码更容易推理——你看到一个没有`mut`的变量，就知道它不会变，不用追踪整个代码路径。
2. 编译器可以做更激进的优化。
3. 在多线程场景，不可变数据天然是安全的，不需要锁。

这和C的设计哲学相反——C里`const`是显式加的，可变是默认。这个选择是有意义的：在1970年代，不可变性不是重要关注点；在现代软件工程里，不可变性被认为是好的实践。

**遮蔽（Shadowing）**是Rust特有的一个小特性：

```rust
let x = 5;
let x = x + 1;    // 重新声明x，遮蔽了上面的x
let x = x * 2;    // 又遮蔽
println!("{}", x); // 输出12
```

遮蔽允许你复用变量名，甚至改变类型，同时不需要`mut`——每次`let`都创建了一个新的绑定。

#### 3.1.2 基本类型

Rust的基本类型和C类似，但更明确：

| Rust类型 | C类型 | 说明 |
|----------|-------|------|
| `i8`, `i16`, `i32`, `i64`, `i128` | `int8_t`等 | 有符号整数，位数明确 |
| `u8`, `u16`, `u32`, `u64`, `u128` | `uint8_t`等 | 无符号整数 |
| `isize`, `usize` | `ptrdiff_t`, `size_t` | 指针大小的整数 |
| `f32`, `f64` | `float`, `double` | 浮点数 |
| `bool` | `_Bool` / `bool` | 布尔值，只有`true`/`false` |
| `char` | `char` | **32位**Unicode字符，不是C的1字节char |
| `&str` | `const char*` | 字符串切片（不可变，UTF-8） |
| `String` | `string` | 堆分配的可增长字符串 |

注意Rust的`char`是32位的——每个`char`是一个Unicode码点，不是字节。这和C的`char`本质不同，避免了很多字符编码的坑。

#### 3.1.3 函数

Rust的函数：

```rust
fn add(x: i32, y: i32) -> i32 {
    x + y  // 注意：没有return，最后一个表达式的值就是返回值
}

fn greet(name: &str) -> String {
    format!("你好，{}", name)  // format!是宏，类似sprintf
}

fn nothing() {
    // 没有显式返回类型表示返回()，即unit类型（类似C的void）
}
```

两个值得注意的地方：

**函数参数必须显式标注类型**，没有自动推断。这是有意为之——函数签名是接口契约，必须明确。

**最后一个表达式可以省略`return`和分号**，它的值就是函数的返回值。在Rust里，几乎一切都是表达式，包括`if`、`match`、代码块。这一点来自函数式编程语言的影响。

```rust
fn abs(x: i32) -> i32 {
    if x >= 0 { x } else { -x }
    // if是表达式，整个if的值是x或-x
}
```

#### 3.1.4 控制流：熟悉但有差异

**if/else**：和C一样，但条件不需要括号，而且是表达式。

```rust
let number = 7;
if number < 5 {
    println!("小");
} else if number == 5 {
    println!("等于5");
} else {
    println!("大");
}

// if作为表达式
let description = if number > 5 { "大" } else { "小" };
```

**loop**：无限循环，用`break`退出，可以从`break`返回值。

```rust
let result = loop {
    // 做一些事情
    let x = some_computation();
    if x > 100 {
        break x; // 从loop返回x的值
    }
};
```

**while**：和C基本一样。

```rust
let mut n = 0;
while n < 10 {
    n += 1;
}
```

**for**：这里Rust和C差异比较大。Rust的`for`是迭代器循环，不是C风格的计数器循环：

```rust
// Rust的for
for i in 0..10 {  // 0..10是Range，一个迭代器
    println!("{}", i);
}

// 遍历数组
let arr = [10, 20, 30, 40, 50];
for element in arr.iter() {
    println!("{}", element);
}
```

不存在C风格的`for (int i = 0; i < n; i++)`。如果你需要下标，用`enumerate()`：

```rust
for (i, val) in arr.iter().enumerate() {
    println!("arr[{}] = {}", i, val);
}
```


## 3.2 所有权三板斧：Move / Borrow / Lifetime

#### 3.2.1 Move：转移所有权

我们在第二章已经介绍了Move的概念，这里用代码更具体地展示：

```rust
fn take_ownership(s: String) {
    println!("{}", s);
    // s在这里离开作用域，String被释放
}

fn main() {
    let s = String::from("hello");
    take_ownership(s);  // s的所有权移入函数
    println!("{}", s);  // 编译错误！s已经被移走了
}
```

和C对比：C里传指针给函数，函数可以自由地操作指针，包括free它，调用者完全不知道。Rust的Move让"所有权转移"在语言层面是可见的、可追踪的。

**Clone**：如果你确实需要两份数据，显式clone：

```rust
let s1 = String::from("hello");
let s2 = s1.clone(); // 深拷贝，两份独立的数据
println!("{} {}", s1, s2); // 都可用
```

Clone是显式的，这很重要——你看到`.clone()`就知道这里有一次堆内存分配和数据复制，性能敏感的场景要注意。和Python不同，Python里`a = b`对于列表来说只是浅拷贝，可能有意外的副作用；Rust的设计强迫你想清楚自己要什么。

#### 3.2.2 Borrow：引用和借用

借用是通过引用实现的，`&`是不可变引用，`&mut`是可变引用：

```rust
fn calculate_length(s: &String) -> usize {
    s.len()  // s是借来的，不会在这里被释放
}

fn change(s: &mut String) {
    s.push_str(", world"); // 可以修改，因为是&mut
}

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s); // 传引用，不移动
    println!("{} 的长度是 {}", s, len); // s还在

    let mut s2 = String::from("hello");
    change(&mut s2); // 传可变引用
    println!("{}", s2); // "hello, world"
}
```

关键规则回顾：
- 任意时刻，要么有多个不可变引用（`&T`），要么有一个可变引用（`&mut T`）。
- 所有引用必须有效（不能是悬垂引用）。

#### 3.2.3 Lifetime：生命周期注解

生命周期是Rust里最让新手头疼的概念。大多数时候编译器可以自动推断生命周期，不需要你显式写。但在某些情况下，编译器需要你帮它一把。

最典型的场景是：函数的返回值是一个引用，编译器需要知道这个引用的有效期是由哪个参数决定的。

```rust
// 这个函数返回两个字符串切片中较长的那个
// 'a是生命周期参数，读作"lifetime a"
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

这里的`'a`说的是：返回值的生命周期和参数`x`、`y`的生命周期中**较短的那个**一样长。这让编译器能在调用方检查：你拿到这个引用，能不能保证在使用它的时候，原始数据还活着？

```rust
fn main() {
    let string1 = String::from("长字符串很长");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
        println!("{}", result); // OK，string2在这里还活着
    }
    // println!("{}", result); // 编译错误！string2已经离开作用域，result的引用不再有效
}
```

生命周期注解不会改变程序的运行时行为，它只是给编译器提供信息，让编译器能做静态分析。在Rust 2018之后，很多常见场景有了"生命周期省略规则"（lifetime elision），不需要显式写生命周期。

老实说：生命周期是Rust学习曲线上最陡的那一段。如果你现在看不明白，完全正常，需要真正写Rust才会逐渐理解。我的建议是，把这一节当作"知道有这个东西，大概了解它是为了解决什么问题就够了"。


## 3.3 枚举和模式匹配：比C的union好在哪

#### 3.3.1 C的union：手动类型标签

C语言里有`union`，允许同一块内存存储不同类型的数据：

```c
union Value {
    int integer;
    double floating;
    const char* string;
};
```

但C的`union`有个根本问题：它不记录当前存的是哪种类型。你必须自己用一个额外的字段（通常叫"tag"）来记录：

```c
typedef struct {
    enum { INT_TYPE, FLOAT_TYPE, STRING_TYPE } tag;
    union {
        int integer;
        double floating;
        const char* string;
    } value;
} TaggedValue;
```

然后使用时：
```c
TaggedValue v;
v.tag = INT_TYPE;
v.value.integer = 42;

// 必须手动检查tag
if (v.tag == INT_TYPE) {
    printf("%d\n", v.value.integer);
} else if (v.tag == FLOAT_TYPE) {
    printf("%f\n", v.value.floating);
}

// 没有任何机制防止你读错类型：
// printf("%f\n", v.value.floating); // 如果tag是INT_TYPE，这是未定义行为
```

这很繁琐，而且容易出错——没有人强制你在读之前检查tag。

#### 3.3.2 Rust枚举：类型安全的带数据枚举

Rust的`enum`是**代数数据类型（Algebraic Data Type, ADT）**的一种，每个变体可以携带不同类型的数据，而且类型是安全的——你必须通过模式匹配来访问，不可能读错类型：

```rust
enum Value {
    Integer(i64),
    Float(f64),
    Text(String),
    Nothing,  // 不携带数据的变体
}

let v = Value::Integer(42);

// 必须通过match来访问，不能直接读
match v {
    Value::Integer(n) => println!("整数：{}", n),
    Value::Float(f) => println!("浮点：{}", f),
    Value::Text(s) => println!("字符串：{}", s),
    Value::Nothing => println!("空"),
}
```

编译器强制你处理所有的变体（除非你用`_`通配符省略）。如果你加了一个新的变体但忘记更新某处的`match`，编译器会报错。这对大型代码库的维护非常友好。

#### 3.3.3 Option：消灭空指针

Rust里没有`null`。这不是说法语——Rust里真的没有`null`这个概念（在安全代码里）。取而代之的是`Option<T>`类型：

```rust
enum Option<T> {
    Some(T),  // 有值
    None,     // 没值
}
```

一个可能不存在的值，类型就是`Option<T>`，而不是裸的`T`。你必须通过模式匹配或者其他方式显式处理`None`的情况：

```rust
fn divide(a: f64, b: f64) -> Option<f64> {
    if b == 0.0 {
        None
    } else {
        Some(a / b)
    }
}

let result = divide(10.0, 2.0);
match result {
    Some(value) => println!("结果是 {}", value),
    None => println!("不能除以零"),
}

// 也可以用if let，更简洁
if let Some(value) = divide(10.0, 2.0) {
    println!("结果是 {}", value);
}

// 或者用unwrap（如果你确信一定有值，否则会panic）
let value = divide(10.0, 2.0).unwrap();

// 或者提供默认值
let value = divide(10.0, 0.0).unwrap_or(0.0);
```

Option消灭了"空指针解引用"这类错误——你不可能忘记处理None，因为编译器不让你直接把`Option<T>`当`T`用。

Tony Hoare（null的发明者）在2009年的一次演讲里称null为"我的十亿美元错误"。Rust选择了彻底废除null。

#### 3.3.4 模式匹配：match不只是switch

`match`在Rust里远比C的`switch`强大。它可以匹配几乎任何东西：

```rust
let pair = (0, -2);

match pair {
    (0, y) => println!("第一个是零，第二个是{}", y),
    (x, 0) => println!("第一个是{}，第二个是零", x),
    _ => println!("其他情况"),
}

// 匹配范围
let x = 5;
match x {
    1..=5 => println!("1到5之间"),
    6..=10 => println!("6到10之间"),
    _ => println!("其他"),
}

// 匹配结构体字段
struct Point { x: i32, y: i32 }
let p = Point { x: 0, y: 7 };
match p {
    Point { x: 0, y } => println!("在y轴上，y={}", y),
    Point { x, y: 0 } => println!("在x轴上，x={}", x),
    Point { x, y } => println!("({}, {})", x, y),
}
```

模式匹配是声明式的——你说"当数据长这样的时候做这个"，而不是命令式地"先检查这个，再检查那个"。这让复杂的条件逻辑更清晰、更不容易遗漏情况。


## 3.4 错误处理：Result代替异常

#### 3.4.1 三种错误处理思路

在编程语言里，处理错误有几种主流思路：

**1. 返回错误码（C的方式）**
```c
int result = some_function(args);
if (result < 0) {
    // 错误
    perror("failed");
    return -1;
}
```
问题：容易忘记检查，错误码的含义不统一，错误信息不够丰富。

**2. 异常（Python、Java、C++的方式）**
```python
try:
    result = might_fail()
except ValueError as e:
    handle_error(e)
```
优点：不能"忘记"——异常会自动向上传播，如果没有被处理最终会让程序崩溃。
问题：函数签名里看不出它会抛什么异常（Python没有checked exception），运行时有开销，控制流不直观（异常可以从任何地方"穿越"到上层）。

**3. Result类型（Rust、Haskell的方式）**

Rust的错误处理是通过`Result<T, E>`类型实现的：

```rust
enum Result<T, E> {
    Ok(T),   // 成功，携带T类型的返回值
    Err(E),  // 失败，携带E类型的错误信息
}
```

#### 3.4.2 Result的使用

```rust
use std::fs::File;
use std::io;

fn open_file(path: &str) -> Result<File, io::Error> {
    File::open(path) // 返回Result<File, io::Error>
}

fn main() {
    let result = open_file("hello.txt");
    match result {
        Ok(file) => println!("文件打开成功"),
        Err(e) => println!("错误：{}", e),
    }
}
```

你不能直接把`Result<File, io::Error>`当`File`用，必须先处理错误情况。这和`Option`消灭null的思路一样——把可能的错误编进类型系统，强制你面对它。

#### 3.4.3 ?运算符：优雅的错误传播

但是如果每一个可能失败的操作都要写`match`，代码会非常啰嗦。Rust提供了`?`运算符来简化错误传播：

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?;
    // ?的意思是：如果是Err，立即从当前函数返回这个Err；如果是Ok，展开Ok里的值

    let mut username = String::new();
    file.read_to_string(&mut username)?;

    Ok(username)
}
```

`?`相当于：
```rust
// 展开版本
let mut file = match File::open("username.txt") {
    Ok(f) => f,
    Err(e) => return Err(e),
};
```

这在行为上类似于其他语言的异常传播——错误会自动向上传递，但它是**显式的**（你看到`?`就知道这里有错误传播），而且函数签名里清楚地写明了它返回`Result`，调用者知道要处理错误。

#### 3.4.4 panic!：不可恢复的错误

Rust还有`panic!`宏，用于处理**程序逻辑错误**——那种理论上不应该发生、但发生了说明程序有bug的情况：

```rust
let v = vec![1, 2, 3];
v[10]; // 越界访问，在debug模式下panic，打印错误信息和堆栈
```

`panic!`会展开调用栈（或直接abort），打印错误信息。它不是用来处理"正常的错误情况"（文件不存在、网络超时）的，那些用`Result`处理。`panic!`是"这不应该发生，程序遇到了无法恢复的状态"的信号。

类比：
- C的段错误（segfault）：无声无息地崩溃，没有有用的错误信息，调试困难。
- Rust的panic：打印出哪个文件哪一行发生了什么，还有完整的调用栈，调试友好。


## 3.5 Cargo：Rust的包管理工具

#### 3.5.1 C的痛苦：没有标准包管理

从C党的视角来看，Cargo可能是Rust最让人心动的特性之一。

C没有官方的包管理工具。你想用一个第三方库，要么系统自带（`apt install libssl-dev`），要么手动下载源码、编译、链接，要么用vcpkg、Conan这些第三方包管理器（但它们不是标准的）。CMakeLists.txt的依赖管理可以把人逼疯。

C++稍好一点，但标准化的包管理在C++领域直到2020年代还是一个让人头疼的问题。

#### 3.5.2 Cargo：一站式解决

Rust从一开始就内置了Cargo，它同时是：
- **包管理器**：管理依赖（类似pip、npm）
- **构建工具**：替代make、cmake
- **测试运行器**：`cargo test`
- **文档生成器**：`cargo doc`
- **代码格式化**：`cargo fmt`（调用rustfmt）
- **代码检查**：`cargo clippy`（lint工具）

一个新Rust项目：

```bash
cargo new my_project  # 创建项目
cd my_project
```

`Cargo.toml`（项目配置文件，类似package.json）：

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1", features = ["full"] }
```

```bash
cargo build    # 构建
cargo run      # 构建并运行
cargo test     # 运行测试
cargo add serde  # 添加依赖（会自动修改Cargo.toml）
```

Cargo会自动下载依赖、管理版本冲突、缓存编译结果。和C相比，这是另一个世界。

Crates.io（发音"crates dot io"）是Rust的官方包仓库，截至2025年已有超过15万个crate（Rust的包称为crate）。质量参差不齐，但核心生态的几个大库——tokio（异步运行时）、serde（序列化）、reqwest（HTTP客户端）——都是高质量、广泛维护的。

#### 3.5.3 trait：Rust的接口系统

简单提一下`trait`，因为它是Rust生态里无处不在的概念。

`trait`类似Java的接口或Python的抽象基类，定义一组类型必须实现的方法：

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}...", self.title, &self.content[..50])
    }
}
```

Rust的trait系统比Java接口更强大的地方在于：你可以给任何类型实现任何trait，包括你没有写的类型（在一定限制下）。这是一种叫做"特设多态"（ad hoc polymorphism）的能力，让代码组合非常灵活。

Rust没有传统意义上的继承（类和子类）。它用trait来实现代码复用和多态，这是一种不同的面向对象思路，更接近组合而不是继承。如果你熟悉Go的接口系统，Rust的trait和它有些像，但功能更强大。


> 好了，第三章到这里。所有权三板斧、枚举、模式匹配、错误处理——这四个东西是Rust语法最有特色的部分，也是和C/Python差异最大的地方。
>
> 说实话，只看文字描述很难真正理解这些概念。所有权和借用需要你亲手写代码，被借用检查器骂几次，才会慢慢内化。这章的目的只是给你一个印象：Rust的语法在哪些地方和C像（控制流、基本类型、函数），在哪些地方根本不同（所有权、枚举、错误处理）。
>
> 下一章我们回到宏观视角：Rust实际上跑在哪里，解决了谁的问题，什么场景用它是多此一举。




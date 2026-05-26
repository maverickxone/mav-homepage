---
title: "子词分词——BPE、WordPiece、Unigram、SentencePiece"
chapter: 7
readTime: 60
description: "词级分词遇到生词就抓瞎，字符级分词又把序列长度炸上天。子词分词取了个折中——2026 年每个主流大模型都用它。"
---
> 词级分词遇到生词就抓瞎，字符级分词又把序列长度炸上天。子词分词取了个折中——2026 年每个主流大模型都用它。






## 为什么要学这个

你的词表有 50,000 个词。用户输入了"untokenizable"。分词器直接返回 `[UNK]`。模型对这个词完全没有信号。更惨的是：语料库中 90% 分位的文档包含 40 个罕见词，意味着每篇文档平均丢掉 40 bit 的信息。

子词分词（Subword Tokenization）解决了这个问题。常见词保持一个 token 不动，罕见词拆成有意义的片段：`untokenizable` → `un`, `token`, `izable`。训练数据能覆盖一切，因为任何字符串归根到底都是一串字节。

2026 年每个前沿大模型都用三种算法之一（BPE、Unigram、WordPiece），套在三个库之一（tiktoken、SentencePiece、HF Tokenizers）上跑。你没法在不选定分词器的情况下发布语言模型。

## 核心概念

![BPE vs Unigram vs WordPiece，逐字符视角](../assets/subword-tokenization.svg)

**BPE（Byte-Pair Encoding，字节对编码）。** 从字符级词表开始。统计所有相邻字符对的频率。把最高频的那对合并成一个新 token。重复，直到达到目标词表大小。主流算法：GPT-2/3/4、Llama、Gemma、Qwen2、Mistral。

**字节级 BPE（Byte-level BPE）。** 同样的算法，但操作对象是原始字节（256 个基础 token）而不是 Unicode 字符。保证零 `[UNK]`——任何字节序列都能编码。GPT-2 使用 50,257 个 token（256 字节 + 50,000 次合并 + 1 个特殊 token）。

**Unigram（一元语言模型分词）。** 从一个巨大词表开始。为每个 token 分配一元概率。反复裁剪那些"移除后对语料对数似然损失最小"的 token。推理时是概率性的：可以采样不同的分词方式（对子词正则化做数据增强很有用）。T5、mBART、ALBERT、XLNet、Gemma 使用此方法。

**WordPiece。** 合并时选择能最大化训练语料似然的字符对，而不是单纯选频率最高的。BERT、DistilBERT、ELECTRA 使用此方法。

**SentencePiece vs tiktoken。** SentencePiece 是一个**训练**词表的库（BPE 或 Unigram），直接在原始 Unicode 文本上操作，将空格编码为 `▁`。tiktoken 是 OpenAI 的快速**编码器**，使用预构建词表；它不负责训练。

经验法则：

- **训练新词表：** SentencePiece（多语言、无需预分词）或 HF Tokenizers。
- **快速推理 + GPT 词表：** tiktoken（cl100k_base、o200k_base）。
- **两者兼顾：** HF Tokenizers——一个库搞定训练 + 服务。

## 从零实现

### 第一步：从零写 BPE

参见 `code/main.py`。核心循环：

```python
def train_bpe(corpus, num_merges):
    vocab = {tuple(word) + ("</w>",): count for word, count in corpus.items()}
    merges = []
    for _ in range(num_merges):
        pairs = Counter()
        for symbols, freq in vocab.items():
            for a, b in zip(symbols, symbols[1:]):
                pairs[(a, b)] += freq
        if not pairs:
            break
        best = pairs.most_common(1)[0][0]
        merges.append(best)
        vocab = apply_merge(vocab, best)
    return merges
```

这个算法编码了三个关键事实。`</w>` 标记词尾，让"low"（后缀）和"lower"（前缀）保持区分。频率加权让高频对优先合并。合并列表有序——推理时按训练顺序依次应用。

### 第二步：用学到的合并规则编码

```python
def encode_bpe(word, merges):
    symbols = list(word) + ["</w>"]
    for a, b in merges:
        i = 0
        while i < len(symbols) - 1:
            if symbols[i] == a and symbols[i + 1] == b:
                symbols = symbols[:i] + [a + b] + symbols[i + 2:]
            else:
                i += 1
    return symbols
```

朴素实现 O(n·|merges|)。生产级实现（tiktoken、HF Tokenizers）用合并排名查找 + 优先队列，近似线性时间。

### 第三步：SentencePiece 实战

```python
import sentencepiece as spm

spm.SentencePieceTrainer.train(
    input="corpus.txt",
    model_prefix="my_tokenizer",
    vocab_size=8000,
    model_type="bpe",          # 或 "unigram"
    character_coverage=0.9995, # CJK 场景可以更低（英文 0.9995，日文 0.995）
    normalization_rule_name="nmt_nfkc",
)

sp = spm.SentencePieceProcessor(model_file="my_tokenizer.model")
print(sp.encode("untokenizable", out_type=str))
# ['▁un', 'token', 'izable']
```

注意：不需要预分词，空格编码为 `▁`，`character_coverage` 控制稀有字符是保留还是映射为 `<unk>`。

### 第四步：tiktoken 用于 OpenAI 兼容词表

```python
import tiktoken
enc = tiktoken.get_encoding("o200k_base")
print(enc.encode("untokenizable"))        # [127340, 101028]
print(len(enc.encode("Hello, world!")))   # 4
```

只做编码。极快（Rust 后端）。与 GPT-4/5 分词完全一致，适合字节计数、成本估算、上下文窗口预算。

## 2026 年还在踩的坑

- **分词器漂移（Tokenizer drift）。** 训练时用词表 A，部署时用词表 B。Token ID 对不上，模型输出垃圾。在 CI 里检查 `tokenizer.json` 的哈希值。
- **空格歧义。** BPE 处理 "hello" 和 " hello" 会产生不同 token。一定要显式指定 `add_special_tokens` 和 `add_prefix_space`。
- **多语言欠训练。** 英语为主的语料训出来的词表，会把非拉丁文字拆成 5-10 倍的 token。同样的 prompt，日文/阿拉伯文在 GPT-3.5 上开销高 5-10 倍。o200k_base 部分修复了这个问题。
- **Emoji 分裂。** 一个 emoji 可能吃掉 5 个 token。做上下文预算时别忘了 emoji 的开销。

## 实战用法

2026 年的技术栈：

| 场景 | 选择 |
|------|------|
| 从零训练单语模型 | HF Tokenizers（BPE） |
| 训练多语言模型 | SentencePiece（Unigram，`character_coverage=0.9995`） |
| 服务 OpenAI 兼容 API | tiktoken（GPT-4+ 用 `o200k_base`） |
| 领域专用词表（代码、数学、蛋白质） | 在领域语料上训练自定义 BPE，合并到基础词表 |
| 边缘推理、小模型 | Unigram（小词表效果更好） |

词表大小是一个随规模变化的决策，不是常数。粗略经验：<1B 参数用 32k，1-10B 用 50-100k，多语言/前沿模型用 200k+。

## 产出物

保存为 `outputs/skill-bpe-vs-wordpiece.md`：

```markdown
---
name: tokenizer-picker
description: Pick tokenizer algorithm, vocab size, library for a given corpus and deployment target.
version: 1.0.0
phase: 5
lesson: 19
tags: [nlp, tokenization]
---

Given a corpus (size, languages, domain) and deployment target (training from scratch / fine-tuning / API-compatible inference), output:

1. Algorithm. BPE, Unigram, or WordPiece. One-sentence reason.
2. Library. SentencePiece, HF Tokenizers, or tiktoken. Reason.
3. Vocab size. Rounded to nearest 1k. Reason tied to model size and language coverage.
4. Coverage settings. `character_coverage`, `byte_fallback`, special-token list.
5. Validation plan. Average tokens-per-word on held-out set, OOV rate, compression ratio, round-trip decode equality.

Refuse to train a character-coverage <0.995 tokenizer on corpora with rare-script content. Refuse to ship a vocab without a frozen `tokenizer.json` hash check in CI. Flag any monolingual tokenizer under 16k vocab as likely under-spec.
```

## 练习

1. **简单。** 用 `code/main.py` 的小型语料训练一个 500 次合并的 BPE。编码三个未见过的词。其中多少个恰好是 1 个 token，多少个 >1 个 token？
2. **中等。** 在 100 句英文维基百科句子上，比较 `cl100k_base`、`o200k_base` 和你自己训练的 vocab=32k SentencePiece BPE 的 token 数。报告每种方案的压缩率。
3. **困难。** 用同一语料分别训练 BPE、Unigram 和 WordPiece。在一个小型情感分类器上测量各自的下游准确率。分词方式能拉开超过 1 个 F1 点的差距吗？

## 术语表

| 术语 | 口语说法 | 实际含义 |
|------|----------|----------|
| BPE | 字节对编码（Byte-Pair Encoding） | 贪心合并最高频字符对，直到达到目标词表大小 |
| 字节级 BPE（Byte-level BPE） | 永远没有未知 token | 在原始 256 字节上做 BPE；GPT-2 / Llama 采用 |
| Unigram | 概率分词器 | 从大候选集出发，用对数似然裁剪；T5、Gemma 使用 |
| SentencePiece | 那个处理空格的库 | 在原始文本上训练 BPE/Unigram 的库；空格编码为 `▁` |
| tiktoken | 那个贼快的 | OpenAI 的 Rust 后端 BPE 编码器，用于预构建词表。不训练 |
| 合并列表（Merge list） | 那串神奇数字 | 有序的 `(a, b) → ab` 合并规则；推理时按顺序应用 |
| 字符覆盖率（Character coverage） | 多罕见算太罕见？ | 分词器必须覆盖的训练语料字符比例；通常 ~0.9995 |

## 延伸阅读

- [Sennrich, Haddow, Birch (2015). Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909) — BPE 论文。
- [Kudo (2018). Subword Regularization with Unigram Language Model](https://arxiv.org/abs/1804.10959) — Unigram 论文。
- [Kudo, Richardson (2018). SentencePiece: A simple and language independent subword tokenizer](https://arxiv.org/abs/1808.06226) — SentencePiece 库论文。
- [Hugging Face — Summary of the tokenizers](https://huggingface.co/docs/transformers/tokenizer_summary) — 简洁参考。
- [OpenAI tiktoken repo](https://github.com/openai/tiktoken) — 教程 + 编码列表。

---

## 自测题

:::quiz
question: 子词分词相比词级词表，核心优势是什么？
options:
  - 罕见词被拆成已知子词片段，消除 OOV 问题，同时词表大小可控
  - 模型更小
  - 训练更快
  - 嵌入更好
correct: 0
explanation: 子词 token 通过分解覆盖任何输入，彻底解决词级词表的 OOV 问题。
:::

:::quiz
question: GPT-2 为什么用字节级 BPE 而不是字符级 BPE？
options:
  - Transformer 要求
  - 字节 BPE 跳过合并
  - 256 字节的基础词表能覆盖任何 UTF-8 输入，保证不会出现 [UNK] token
  - 字节更小
correct: 2
explanation: 字节级 BPE 从 256 个字节起步，任何输入都能编码，不存在 OOV。
:::

:::quiz
question: Unigram 分词器是怎么构建词表的？
options:
  - 贪心 IDF 加权
  - 从一个大候选集出发，反复裁剪那些移除后对语料对数似然损失最小的 token
  - 贪心高频对合并
  - 随机采样
correct: 1
explanation: Unigram 拟合一元语言模型，迭代移除最不重要的 token 直到达到目标大小。
:::

:::quiz
question: WordPiece 的合并标准和 BPE 有什么区别？
options:
  - WordPiece 用字节
  - WordPiece 是无监督的
  - WordPiece 合并能最大化训练语料似然的字符对，BPE 合并最高频的字符对
  - WordPiece 跳过合并
correct: 2
explanation: WordPiece 按似然选合并对；BPE 按频率选。
:::

:::quiz
question: 哪个工具能直接在原始多语言 Unicode 文本上训练分词器？
options:
  - spaCy
  - tiktoken
  - tokenizers-lite
  - SentencePiece（将空格编码为特殊标记，训练 BPE 或 Unigram）
correct: 3
explanation: SentencePiece 在原始文本上训练 BPE/Unigram，无需预分词；tiktoken 只做编码。
:::

:::quiz
question: 为什么生产环境 CI 必须对部署的 tokenizer.json 做哈希校验？
options:
  - 分词器漂移会产生与模型训练时不同的 token ID，悄无声息地毁掉输出
  - Hugging Face 要求
  - 压缩存储
  - 减少词表大小
correct: 0
explanation: 哪怕微小的分词器变动也会移位 ID；哈希检查能在问题到达用户前拦截漂移。
:::

:::quiz
question: 单个 emoji 为什么经常占好多 token？
options:
  - Emoji 是保留字
  - 多码点 emoji 编码成多个 UTF-8 字节；如果没有专门的 token，每个字节就是一个子词
  - Emoji 存储为浮点数
  - Emoji 是停止符
correct: 1
explanation: 组合 emoji 编码为多个字节；字节级分词器可能对每个字形使用多个 token。
:::

:::quiz
question: 新训单语 Transformer 的词表大小有什么经验法则？
options:
  - 永远 8000
  - 永远 1M
  - 大约 1B 参数以下用 32k；1-10B 用 50-100k；多语言或前沿模型用 200k+
  - 跟训练语料大小匹配
correct: 2
explanation: 词表大小随模型和语言覆盖需求扩展；这些是社区粗略共识。
:::


---
title: "文本预处理——分词、词干提取、词形还原"
chapter: 1
readTime: 45
description: "语言是连续的，模型是离散的。预处理就是两者之间的桥。"
---
> 语言是连续的，模型是离散的。预处理就是两者之间的桥。






## 为什么要学这个

模型没法读"The cats were running."这句话。它只认整数。

每个 NLP 系统上来就要回答三个问题：词从哪里断开？一个词的"根"是什么？"run"、"running"、"ran"什么时候该当同一个东西处理，什么时候该区分开？

分词（Tokenization）搞错了，模型就是在垃圾上学习。如果你的分词器把 `don't` 当一个 token，但把 `do n't` 当两个，训练分布就裂了。如果你的词干提取器把 `organization` 和 `organ` 砍成同一个词根，主题模型直接废掉。如果你的词形还原器需要词性信息但你没传，动词会被当名词处理。

这节课从零搭建三个预处理原语，然后展示 NLTK 和 spaCy 怎么做同样的事，让你看清其中的取舍。

## 核心概念

三种操作，各有各的职责和翻车方式。

**分词（Tokenization）** 把字符串切成 token。"Token"这个词故意定义得很模糊，因为正确的粒度取决于任务。经典 NLP 用词级别，Transformer 用子词（subword），没有空格的语言（比如中文）用字符级别。

**词干提取（Stemming）** 用规则砍后缀。快、猛、笨。`running -> run`，没问题。`organization -> organ`，翻车了。第二个就是它的失败模式。

**词形还原（Lemmatization）** 利用语法知识把词还原成字典形式。更慢、更准、需要查找表或形态分析器。`ran -> run`（需要知道 ran 是 run 的过去式）。`better -> good`（需要知道比较级形式）。

经验法则：当速度重要且能容忍噪声时用词干提取（搜索索引、粗分类）。当语义重要时用词形还原（问答、语义搜索、任何用户会看到的文本）。

## 从零实现

### 第一步：正则分词器

最简单有用的分词器在非字母数字字符处断开，同时把标点符号作为独立 token。不完美，但一行就能跑。

```python
import re

def tokenize(text):
    return re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?|[0-9]+|[^\sA-Za-z0-9]", text)
```

三个模式按优先级排列。带可选内部撇号的单词（`don't`、`it's`）。纯数字。任何单个非空白非字母数字字符作为独立 token（标点）。

```python
>>> tokenize("The cats weren't running at 3pm.")
['The', 'cats', "weren't", 'running', 'at', '3', 'pm', '.']
```

注意失败模式：`3pm` 被拆成 `['3', 'pm']`，因为字母和数字交替了。大多数任务够用。URL、邮箱、话题标签全会断错。生产环境要在通用模式前面加专门的模式。

### 第二步：Porter 词干提取器（仅 step 1a）

完整的 Porter 算法有五个阶段的规则。只实现 step 1a 就能覆盖最高频的英语后缀，而且足以教会你整体模式。

```python
def stem_step_1a(word):
    if word.endswith("sses"):
        return word[:-2]
    if word.endswith("ies"):
        return word[:-2]
    if word.endswith("ss"):
        return word
    if word.endswith("s") and len(word) > 1:
        return word[:-1]
    return word
```

```python
>>> [stem_step_1a(w) for w in ["caresses", "ponies", "caress", "cats"]]
['caress', 'poni', 'caress', 'cat']
```

从上往下读规则。`ies -> i` 规则是 `ponies -> poni`（而不是 `pony`）的原因。真正的 Porter 有 step 1b 会修正这个。规则之间相互竞争，前面的规则先赢。顺序比任何单条规则都重要。

### 第三步：基于查找表的词形还原器

真正的词形还原需要形态学知识。教学版用一个小查找表加兜底规则就够了。

```python
LEMMA_TABLE = {
    ("running", "VERB"): "run",
    ("ran", "VERB"): "run",
    ("runs", "VERB"): "run",
    ("better", "ADJ"): "good",
    ("best", "ADJ"): "good",
    ("cats", "NOUN"): "cat",
    ("cat", "NOUN"): "cat",
    ("were", "VERB"): "be",
    ("was", "VERB"): "be",
    ("is", "VERB"): "be",
}

def lemmatize(word, pos):
    key = (word.lower(), pos)
    if key in LEMMA_TABLE:
        return LEMMA_TABLE[key]
    if pos == "VERB" and word.endswith("ing"):
        return word[:-3]
    if pos == "NOUN" and word.endswith("s"):
        return word[:-1]
    return word.lower()
```

```python
>>> lemmatize("running", "VERB")
'run'
>>> lemmatize("cats", "NOUN")
'cat'
>>> lemmatize("better", "ADJ")
'good'
>>> lemmatize("watched", "VERB")
'watched'
```

最后一个例子是关键教学点。`watched` 不在我们的表里，兜底规则也只处理了 `ing`。真正的词形还原要覆盖 `ed`、不规则动词、比较级形容词、不规则复数（`children -> child`）。这就是为什么生产系统用 WordNet、spaCy 的形态分析器或完整的形态学引擎。

### 第四步：把它们串起来

```python
def preprocess(text, pos_tagger=None):
    tokens = tokenize(text)
    stems = [stem_step_1a(t.lower()) for t in tokens]
    tags = pos_tagger(tokens) if pos_tagger else [(t, "NOUN") for t in tokens]
    lemmas = [lemmatize(word, pos) for word, pos in tags]
    return {"tokens": tokens, "stems": stems, "lemmas": lemmas}
```

缺的那块是词性标注器（POS tagger）。Phase 5 · 07（词性标注）那节课会搭一个。现在先默认所有词都当 NOUN，承认这个局限。

## 实战用法

NLTK 和 spaCy 自带生产级实现，几行代码搞定。

### NLTK

```python
import nltk
nltk.download("punkt_tab")
nltk.download("wordnet")
nltk.download("averaged_perceptron_tagger_eng")

from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk import pos_tag

text = "The cats were running."
tokens = word_tokenize(text)
stems = [PorterStemmer().stem(t) for t in tokens]
lemmatizer = WordNetLemmatizer()
tagged = pos_tag(tokens)


def nltk_pos_to_wordnet(tag):
    if tag.startswith("V"):
        return "v"
    if tag.startswith("J"):
        return "a"
    if tag.startswith("R"):
        return "r"
    return "n"


lemmas = [lemmatizer.lemmatize(t, nltk_pos_to_wordnet(tag)) for t, tag in tagged]
```

`word_tokenize` 能处理缩写、Unicode 和你的正则漏掉的各种边界情况。`PorterStemmer` 跑完全部五个阶段。`WordNetLemmatizer` 需要把 NLTK 的 Penn Treebank 词性标签转成 WordNet 的缩写格式。上面那个转换函数就是大多数教程跳过的部分。

### spaCy

```python
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("The cats were running.")

for token in doc:
    print(token.text, token.lemma_, token.pos_)
```

```
The      the     DET
cats     cat     NOUN
were     be      AUX
running  run     VERB
.        .       PUNCT
```

spaCy 把整个流水线藏在 `nlp(text)` 后面。分词、词性标注、词形还原一次性全跑了。大规模处理时比 NLTK 快，开箱即用精度更高。代价是你很难单独替换某个组件。

### 什么时候选哪个

| 场景 | 选择 |
|------|------|
| 教学、研究、需要灵活替换组件 | NLTK |
| 生产环境、多语言、速度重要 | spaCy |
| Transformer 流水线（反正要用模型自带的分词器） | 用 `tokenizers` / `transformers`，跳过经典预处理 |

### 没人警告你的两个翻车模式

大多数教程讲完算法就停了。真正的预处理流水线里有两个坑，几乎从来没人提。

**可复现性漂移。** NLTK 和 spaCy 的分词和词形还原行为在版本之间会变。spaCy 2.x 产出 `['do', "n't"]` 的地方，3.x 可能产出 `["don't"]`。你的模型是在一种分布上训练的，推理时跑的却是另一种分布。准确率悄悄下滑，没人知道为什么。解法：在 `requirements.txt` 里锁死库版本。写一个预处理回归测试，冻结 20 条样本句子的预期分词结果。每次升级都跑一遍。

**训练/推理不一致。** 训练时用了激进的预处理（小写化、去停用词、词干提取），部署时却喂原始用户输入，然后看着性能崩溃。这是生产 NLP 最常见的故障。训练时做了预处理，推理时就必须跑一模一样的函数。把预处理打包成模型包里的函数，而不是留在 notebook 里让上线团队重写。

## Ship It

一个可复用的 prompt，帮工程师在不翻三本教科书的前提下选择预处理策略。

保存为 `outputs/prompt-preprocessing-advisor.md`：

```markdown
---
name: preprocessing-advisor
description: Recommends a tokenization, stemming, and lemmatization setup for an NLP task.
phase: 5
lesson: 01
---

You advise on classical NLP preprocessing. Given a task description, you output:

1. Tokenization choice (regex, NLTK word_tokenize, spaCy, or transformer tokenizer). Explain why.
2. Whether to stem, lemmatize, both, or neither. Explain why.
3. Specific library calls. Name the functions. Quote the POS-tag translation if NLTK is involved.
4. One failure mode the user should test for.

Refuse to recommend stemming for user-visible text. Refuse to recommend lemmatization without POS tags. Flag non-English input as needing a different pipeline.
```

## 练习

1. **简单。** 扩展 `tokenize`，让它把 URL 保留为单个 token。测试：`tokenize("Visit https://example.com today.")` 应该产出一个完整的 URL token。
2. **中等。** 实现 Porter step 1b。如果单词包含元音且以 `ed` 或 `ing` 结尾就去掉后缀。处理双辅音规则（`hopping -> hop`，而不是 `hopp`）。
3. **困难。** 搭一个词形还原器：用 WordNet 做查找表，WordNet 查不到的退回你的 Porter 词干提取器。在标注语料库上对比纯 WordNet 和纯 Porter 的准确率。

## 术语表

| 术语 | 常见说法 | 真正含义 |
|------|----------|----------|
| Token（标记） | "一个词" | 模型实际消费的任何单元。可以是词、子词、字符或字节。 |
| Stem（词干） | "词根" | 基于规则砍后缀的结果。不一定是真实存在的词。 |
| Lemma（词元） | "字典形式" | 你会在词典里查到的那个形式。需要语法上下文才能正确计算。 |
| POS tag（词性标签） | "词性" | NOUN、VERB、ADJ 这类类别。准确做词形还原必须要它。 |
| Morphology（形态学） | "词形变化规则" | 一个词根据时态、数、格等变化形式的规则。词形还原依赖于此。 |

## 延伸阅读

- [Porter, M. F. (1980). An algorithm for suffix stripping](https://tartarus.org/martin/PorterStemmer/def.txt) — 原始论文，五页纸，至今是最清楚的解释。
- [spaCy 101 — linguistic features](https://spacy.io/usage/linguistic-features) — 看看真实流水线怎么接线。
- [NLTK book, chapter 3](https://www.nltk.org/book/ch03.html) — 你没想到的分词边界情况。

---

## 自测题

:::quiz
question: 为什么语言模型在训练前需要预处理？
options:
  - 预处理提升 GPU 利用率
  - 模型消费的是离散整数 token，不是原始文本
  - 模型可以直接读字符串
  - 预处理只有没有空格的语言才需要
correct: 1
explanation: 模型在整数 token ID 上运作；预处理是把连续语言桥接到离散输入的过程。
:::

:::quiz
question: 哪种预处理操作是"基于规则砍后缀"？
options:
  - 词干提取（Stemming）
  - 词性标注（POS tagging）
  - 词形还原（Lemmatization）
  - 分词（Tokenization）
correct: 0
explanation: 词干提取用规则砍后缀，速度快但容易出错。
:::

:::quiz
question: Porter 词干提取器的 step 1a 对 'ponies' 返回什么？
options:
  - ponies
  - ponie
  - pony
  - poni
correct: 3
explanation: 'ies' 规则把后缀替换成 'i'，产出 'poni'；真正 Porter 的 step 1b 会修正它。
:::

:::quiz
question: 为什么词形还原通常需要词性标签？
options:
  - Unicode 处理需要
  - 为了速度
  - 语法上下文能消歧 'better'（形容词）和 'better'（动词）这类形式
  - 为了减少内存占用
correct: 2
explanation: 词元取决于语法角色；没有词性标签，查找就是模糊的。
:::

:::quiz
question: 把 NLTK Penn Treebank 词性标签转成 WordNet 标签时，以 'V' 开头的标签映射到什么？
options:
  - 'n'（名词）
  - 'v'（动词）
  - 'r'（副词）
  - 'a'（形容词）
correct: 1
explanation: 以动词前缀开头的 Penn Treebank 标签映射到 WordNet 的 'v'。
:::

:::quiz
question: NLP 预处理中的"训练/推理不一致"是什么？
options:
  - 训练和测试的 batch size 不同
  - 训练和上线时用了不同的预处理，模型在推理时看到的是陌生的分布
  - 一个 GPU 内存问题
  - 在一个 notebook 里混用了多个分词库
correct: 1
explanation: 训练和推理的预处理不同是生产 NLP 最常见的故障。
:::

:::quiz
question: 在 Transformer 流水线中，你会用什么来代替经典预处理？
options:
  - NLTK word_tokenize
  - 模型自带的分词器（比如通过 tokenizers / transformers 库）
  - 正则分词器
  - spaCy en_core_web_sm
correct: 1
explanation: Transformer 模型自带配对的分词器；经典预处理被直接跳过。
:::

:::quiz
question: 为什么要在 requirements 里锁定 NLTK 和 spaCy 版本？
options:
  - 许可证兼容性
  - 分词器和词形还原器的行为在小版本之间会变，悄悄改变训练分布
  - 旧版本支持更多语言
  - 新版本更慢
correct: 1
explanation: 库升级可能改变分词输出，导致偏离训练分布。
:::

---
title: "BERT — 掩码语言建模"
chapter: 6
readTime: 45
description: "GPT 预测下一个词，BERT 预测被挡住的词。一句话的差别——却催生了半个十年里所有和 embedding 沾边的东西。"
---
> GPT 预测下一个词，BERT 预测被挡住的词。一句话的差别——却催生了半个十年里所有和 embedding 沾边的东西。






## 问题背景

2018 年，每个 NLP 任务——情感分析、命名实体识别（NER）、问答（QA）、文本蕴含——都要从零训练自己的模型，用自己的标注数据。不存在一个预训练好的"理解英语"检查点（checkpoint）可以拿来微调（fine-tune）。ELMo（2018）证明了你可以用双向 LSTM 预训练上下文嵌入（contextual embeddings），有帮助但泛化不够。

BERT（Devlin 等人，2018）问了一个问题：如果我们拿一个 Transformer 编码器（encoder），在互联网上的所有句子上训练它，强迫它从两侧的上下文预测被遮住的词呢？然后你只需要在下游任务上微调一个小头（head）。参数效率（parameter efficiency）是一次启示。

结果：18 个月内，BERT 及其变体（RoBERTa、ALBERT、ELECTRA）统治了当时存在的每一个 NLP 排行榜。到 2020 年，地球上每一个搜索引擎、内容审核管线和语义搜索系统内部都有一个 BERT。

2026 年，纯编码器（encoder-only）模型仍然是分类、检索和结构化抽取的最佳工具——每个 token 的推理速度比解码器（decoder）快 5–10 倍，它们的嵌入是每个现代检索栈的骨干。ModernBERT（2024 年 12 月）用 Flash Attention + RoPE + GeGLU 把架构推到了 8K 上下文。

## 核心概念

![掩码语言建模（Masked Language Modeling）：选 token、遮住、预测原始值](../assets/bert-mlm.svg)

### 训练信号（Training Signal）

拿一个句子：`the quick brown fox jumps over the lazy dog`。

随机遮住 15% 的 token：

```
input:  the [MASK] brown fox jumps [MASK] the lazy dog
target: the  quick brown fox jumps  over  the lazy dog
```

训练模型预测被遮位置的原始 token。因为编码器是双向的（bidirectional），预测位置 1 的 `[MASK]` 可以利用位置 2+ 的 `brown fox jumps`。这正是 GPT 做不到的事。

### BERT 的遮码规则（Mask Rules）

在被选中预测的 15% token 中：

- 80% 被替换为 `[MASK]`。
- 10% 被替换为随机 token。
- 10% 保持不变。

为什么不全部用 `[MASK]`？因为推理时永远不会出现 `[MASK]`。如果训练时 100% 的遮码位置都用 `[MASK]`，预训练和微调之间会产生分布偏移（distribution shift）。10% 随机 + 10% 不变让模型保持诚实。

### 下一句预测（NSP）——以及为什么被抛弃了

原版 BERT 还训练了 NSP（Next Sentence Prediction）：给定两个句子 A 和 B，预测 B 是否跟在 A 后面。RoBERTa（2019）做了消融实验，证明 NSP 不但没帮忙，反而有害。现代编码器都跳过了它。

### 2026 年的变化：ModernBERT

2024 年的 ModernBERT 论文用 2026 年的组件重建了 block：

| 组件 | 原版 BERT（2018） | ModernBERT（2024） |
|------|-------------------|-------------------|
| 位置编码（Positional） | 学习式绝对位置 | RoPE |
| 激活函数（Activation） | GELU | GeGLU |
| 归一化（Normalization） | LayerNorm | Pre-norm RMSNorm |
| 注意力（Attention） | 全连接密集 | 交替局部（128）+ 全局 |
| 上下文长度 | 512 | 8192 |
| 分词器（Tokenizer） | WordPiece | BPE |

而且不像 2018 年的架构，它原生支持 Flash Attention。在 8K 序列长度下推理比 DeBERTa-v3 快 2–3 倍，GLUE 分数还更高。

### 2026 年仍然选编码器的使用场景

| 任务 | 为什么编码器比解码器好 |
|------|----------------------|
| 检索 / 语义搜索嵌入（Retrieval） | 双向上下文 = 每个 token 更好的嵌入质量 |
| 分类（情感、意图、毒性） | 一次前向传播；没有生成开销 |
| 命名实体识别 / token 标注（NER） | 逐位置输出，天然双向 |
| 零样本蕴含（NLI） | 编码器顶上加分类头 |
| RAG 的重排序器（Reranker） | 交叉编码器打分，比 LLM 重排快 10 倍 |

## 动手搭建

### 第 1 步：遮码逻辑

见 `code/main.py`。函数 `create_mlm_batch` 接收一个 token ID 列表、词表大小和遮码概率。返回 input IDs（已应用遮码）和 labels（只有被遮位置有值，其余为 -100——PyTorch 的忽略索引约定）。

```python
def create_mlm_batch(tokens, vocab_size, mask_prob=0.15, rng=None):
    input_ids = list(tokens)
    labels = [-100] * len(tokens)
    for i, t in enumerate(tokens):
        if rng.random() < mask_prob:
            labels[i] = t
            r = rng.random()
            if r < 0.8:
                input_ids[i] = MASK_ID
            elif r < 0.9:
                input_ids[i] = rng.randrange(vocab_size)
            # else: keep original
    return input_ids, labels
```

### 第 2 步：在小语料上跑 MLM 预测

用一个 2 层编码器 + MLM 头在 20 个词的词表、200 个句子上训练。不做梯度更新——我们只做前向传播的健全性检查（sanity check）。完整训练需要 PyTorch。

### 第 3 步：比较遮码类型

展示三路规则如何让模型在没有 `[MASK]` 的情况下仍然可用。在一个未遮码的句子和一个遮码的句子上做预测。两者都应该产生合理的 token 分布，因为模型在训练中见过两种模式。

### 第 4 步：微调头（Fine-tune Head）

把 MLM 头换成一个分类头，在一个玩具情感数据集上训练。只有头在训练；编码器被冻结。这就是每个 BERT 应用遵循的模式。

## 实际使用

```python
from transformers import AutoModel, AutoTokenizer

tok = AutoTokenizer.from_pretrained("answerdotai/ModernBERT-base")
model = AutoModel.from_pretrained("answerdotai/ModernBERT-base")

text = "Attention is all you need."
inputs = tok(text, return_tensors="pt")
out = model(**inputs).last_hidden_state   # (1, N, 768)
```

**嵌入模型（Embedding Models）就是微调过的 BERT。** `sentence-transformers` 中的模型如 `all-MiniLM-L6-v2` 就是用对比损失（contrastive loss）训练的 BERT。编码器一样，损失函数变了。

**交叉编码器重排序器（Cross-encoder Rerankers）也是微调过的 BERT。** 对 `[CLS] query [SEP] doc [SEP]` 做配对分类。query 和 doc 之间的双向注意力正是交叉编码器在质量上优于双塔编码器（biencoder）的原因。

**2026 年什么时候不该选 BERT。** 任何生成式任务。编码器没有合理的方式自回归地生成 token。还有：任何 1B 参数以下的场景，小解码器可以用更大灵活性匹配质量（Phi-3-Mini、Qwen2-1.5B）。

## 上线部署

见 `outputs/skill-bert-finetuner.md`。该技能文档定义了一个 BERT 微调的范围（主干选择、头的规格、数据、评估、停止条件），适用于新的分类或抽取任务。

## 练习

1. **简单。** 运行 `code/main.py`，打印 10,000 个 token 上的遮码分布。确认约 15% 被选中，其中约 80% 变成 `[MASK]`。
2. **中等。** 实现整词遮码（whole-word masking）：如果一个词被分成子词（subwords），要么全部遮住要么全部不遮。衡量这是否在 500 句语料上提升了 MLM 准确率。
3. **困难。** 在一个公开数据集的 10,000 句话上训练一个小型（2 层、d=64）BERT。对 `[CLS]` token 微调做 SST-2 情感分析。与参数匹配的纯解码器基线对比——谁赢？

## 关键术语

| 术语 | 通俗说法 | 实际含义 |
|------|---------|---------|
| MLM（掩码语言建模） | "Masked language modeling" | 训练信号：随机替换 15% 的 token 为 `[MASK]`，预测原始值。 |
| 双向（Bidirectional） | "两边都看" | 编码器注意力没有因果掩码——每个位置能看到所有其他位置。 |
| `[CLS]` | "池化 token（pooler token）" | 一个特殊 token，加在每个序列前面；它的最终嵌入作为句子级表示。 |
| `[SEP]` | "段分隔符（segment separator）" | 分隔配对序列（例如 query/doc、句子 A/B）。 |
| NSP（下一句预测） | "Next sentence prediction" | BERT 的第二个预训练任务；RoBERTa 证明它没用，2019 年后被抛弃。 |
| 微调（Fine-tuning） | "适配到任务" | 保持编码器大部分冻结；在顶上训练一个小头用于下游任务。 |
| 交叉编码器（Cross-encoder） | "重排序器（reranker）" | 一个 BERT 同时接收 query 和 doc 作为输入，输出相关性分数。 |
| ModernBERT | "2024 年刷新版" | 用 RoPE、RMSNorm、GeGLU、交替局部/全局注意力重建的编码器，8K 上下文。 |

## 延伸阅读

- [Devlin et al. (2018). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805) — 原始论文。
- [Liu et al. (2019). RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692) — 如何正确训练 BERT；干掉了 NSP。
- [Clark et al. (2020). ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators](https://arxiv.org/abs/2003.10555) — 替换 token 检测在同等计算量下胜过 MLM。
- [Warner et al. (2024). Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder](https://arxiv.org/abs/2412.13663) — ModernBERT 论文。
- [HuggingFace `modeling_bert.py`](https://github.com/huggingface/transformers/blob/main/src/transformers/models/bert/modeling_bert.py) — 标准编码器参考实现。

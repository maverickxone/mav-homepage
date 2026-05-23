---
title: "文本处理与情感分析"
chapter: 6
readTime: 25
description: "分词与词汇表、词嵌入（Word2Vec）、预训练向量、BiLSTM 文本分类实战。"
---

## 文本预处理完整流程

在实际项目中，文本预处理往往占据大量工作。

**步骤1：分词（Tokenization）**

```python
import re

# 英文分词（按空格和标点分割）
def tokenize_en(text):
    text = text.lower()
    tokens = re.findall(r"\b[\w']+\b", text)
    return tokens

# 中文分词（需要jieba或类似工具）
import jieba
def tokenize_zh(text):
    return list(jieba.cut(text))

# 测试
en_text = "I love natural language processing! It's amazing."
print("英文分词:", tokenize_en(en_text))
# ['i', 'love', 'natural', 'language', 'processing', "it's", 'amazing']

zh_text = "我爱自然语言处理，它真的很神奇！"
print("中文分词:", tokenize_zh(zh_text))
```

**步骤2：建立词汇表**

```python
from collections import Counter

class Vocabulary:
    """词汇表：管理词到索引的映射"""
    SPECIAL_TOKENS = ['<pad>', '<unk>', '<sos>', '<eos>']
    PAD_IDX = 0
    UNK_IDX = 1
    SOS_IDX = 2
    EOS_IDX = 3

    def __init__(self, min_freq=1, max_size=None):
        self.min_freq = min_freq
        self.max_size = max_size
        self.word2idx = {}
        self.idx2word = {}
        self.word_count = Counter()

    def build(self, sentences):
        """从句子列表构建词汇表"""
        for sentence in sentences:
            self.word_count.update(sentence)

        # 添加特殊token
        for i, tok in enumerate(self.SPECIAL_TOKENS):
            self.word2idx[tok] = i
            self.idx2word[i] = tok

        # 按频率排序，过滤低频词
        sorted_words = sorted(self.word_count.items(),
                              key=lambda x: -x[1])
        idx = len(self.SPECIAL_TOKENS)
        for word, count in sorted_words:
            if count < self.min_freq:
                break
            if self.max_size and idx >= self.max_size:
                break
            self.word2idx[word] = idx
            self.idx2word[idx] = word
            idx += 1

        print(f"词汇表构建完成：{len(self.word2idx)} 个词")
        return self

    def encode(self, word):
        return self.word2idx.get(word, self.UNK_IDX)

    def decode(self, idx):
        return self.idx2word.get(idx, '<unk>')

    def sentence_to_indices(self, sentence, add_sos=False, add_eos=False):
        indices = [self.encode(w) for w in sentence]
        if add_sos:
            indices = [self.SOS_IDX] + indices
        if add_eos:
            indices = indices + [self.EOS_IDX]
        return indices

    def __len__(self):
        return len(self.word2idx)
```

**步骤3：Padding与批处理**

```python
def collate_batch(batch, vocab, max_len=None):
    """
    DataLoader的collate_fn：将不等长的句子padding到同一长度

    这个函数在DataLoader内部被调用，每次处理一个batch
    """
    texts, labels = zip(*batch)

    # 将每个句子转换为索引序列
    sequences = [torch.tensor(vocab.sentence_to_indices(text), dtype=torch.long)
                 for text in texts]

    # 计算padding长度
    if max_len:
        lengths = [min(len(seq), max_len) for seq in sequences]
    else:
        lengths = [len(seq) for seq in sequences]

    # Padding（用PAD_IDX补齐到最长序列）
    padded = torch.zeros(len(sequences), max(lengths), dtype=torch.long)
    for i, (seq, length) in enumerate(zip(sequences, lengths)):
        padded[i, :length] = seq[:length]

    labels = torch.tensor(labels, dtype=torch.long)
    lengths = torch.tensor(lengths, dtype=torch.long)

    return padded, labels, lengths
```

## One-Hot编码的问题与词嵌入的优势

**One-Hot编码**：词汇表大小10000，每个词是一个10000维向量，只有对应位置为1。

问题：
1. **维度爆炸**：10000维向量，稀疏，计算浪费
2. **无法表达词义**："猫"和"狗"的One-Hot向量余弦相似度=0，但它们语义上很接近
3. **词义关系**：One-Hot无法表达 king - man + woman ≈ queen 这类关系

**词嵌入**：将每个词映射到一个低维稠密向量（通常100-300维）。

```python
embedding = nn.Embedding(num_embeddings=10000, embedding_dim=300, padding_idx=0)

# 输入：词的整数索引
# 输出：对应的嵌入向量
x = torch.LongTensor([[1, 2, 3, 0, 0],   # 句子1，最后两个是padding
                       [4, 5, 6, 7, 8]])  # 句子2

embedded = embedding(x)  # (2, 5, 300)
print("嵌入后形状:", embedded.shape)

# 注意：padding_idx=0 表示idx=0的词（<pad>）的嵌入向量保持为0，不参与训练
```

## Word2Vec：词嵌入的训练方法

**词嵌入是怎么学到的？**

最经典的方法是Word2Vec（2013年，Mikolov等人）。核心思想是"一个词的语义，由它的上下文决定"（Distributional Hypothesis）。

**两种训练方式**：

```
CBOW（Continuous Bag of Words）：
用上下文词预测中心词

["今天", ___, "天气"] → 预测 "的"
（用周围的词预测中间的词）

Skip-gram：
用中心词预测上下文词

"的" → 预测 "今天", "天气"
（用中间的词预测周围的词）
```

**Word2Vec的神奇性质**：

```python
# 词嵌入空间中可以做词语类比
# 国王 - 男人 + 女人 ≈ 女王

def word_analogy(embeddings, word_a, word_b, word_c, vocab):
    """计算 word_a - word_b + word_c 最接近的词"""
    vec_a = embeddings[vocab.encode(word_a)]
    vec_b = embeddings[vocab.encode(word_b)]
    vec_c = embeddings[vocab.encode(word_c)]

    target = vec_a - vec_b + vec_c
    target = target / target.norm()  # 归一化

    # 找最近邻
    all_vecs = embeddings / embeddings.norm(dim=1, keepdim=True)
    similarities = all_vecs @ target
    best_idx = similarities.argmax().item()

    return vocab.decode(best_idx)

# 理想情况下：
# word_analogy(E, "国王", "男人", "女人") → "女王"
# word_analogy(E, "北京", "中国", "法国") → "巴黎"
```

## 使用预训练词向量

实际项目中，从头训练词嵌入需要大量数据。通常使用预训练好的词向量：

```python
import numpy as np

def load_glove_embeddings(glove_path, vocab, embed_dim=300):
    """
    加载GloVe预训练词向量

    GloVe文件格式：每行 "词 数值1 数值2 ... 数值300"
    """
    pretrained = np.random.randn(len(vocab), embed_dim) * 0.01
    found = 0

    with open(glove_path, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            word = parts[0]
            if word in vocab.word2idx:
                vec = np.array(parts[1:], dtype=float)
                idx = vocab.word2idx[word]
                pretrained[idx] = vec
                found += 1

    print(f"找到 {found}/{len(vocab)} 个词的预训练向量")
    return torch.FloatTensor(pretrained)

# 加载到模型中
def load_pretrained_embedding(model_embedding, pretrained_tensor, freeze=False):
    """将预训练词向量加载到Embedding层"""
    model_embedding.weight.data.copy_(pretrained_tensor)

    if freeze:
        model_embedding.weight.requires_grad = False
        print("词嵌入已冻结（不参与训练）")
    else:
        print("词嵌入将在训练中微调")
```

> 🔍 **深层思考：是否冻结预训练词向量**
>
> 这是个常见的工程决策问题：
>
> **冻结**（freeze=True）：词嵌入不更新。优点：防止过拟合（尤其数据量少时），训练更快（少一批梯度计算）。缺点：无法根据具体任务调整词义。
>
> **微调**（freeze=False）：词嵌入随任务一起更新。优点：可以针对任务调整词义（比如"苹果"在科技文本中更偏向"Apple公司"，在食品文本中更偏向"水果"）。缺点：数据量小时容易过拟合。
>
> **实践建议**：数据量 < 10万时倾向冻结；数据量 > 100万时倾向微调。也可以两阶段训练：先冻结训练若干epoch，再解冻微调。

---


## 完整数据流水线

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from collections import Counter
import re

# 数据准备
train_texts = [
    "I love this movie, it's absolutely amazing!",
    "Terrible film, complete waste of time.",
    "Great acting, beautiful cinematography, highly recommended!",
    "Boring plot, terrible dialogue, would not watch again.",
    "One of the best movies I've seen this year.",
    "Awful direction, makes no sense, avoid at all costs.",
    "Surprisingly good, exceeded my expectations!",
    "Disappointing sequel, fails to capture the original's charm.",
]
train_labels = [1, 0, 1, 0, 1, 0, 1, 0]  # 1=正面, 0=负面

val_texts = [
    "Wonderful experience, touching story.",
    "Not worth watching, very bad.",
]
val_labels = [1, 0]

# 分词和构建词汇表
def tokenize(text):
    return re.findall(r"\b[\w']+\b", text.lower())

all_tokens = [tok for text in train_texts for tok in tokenize(text)]
word_count = Counter(all_tokens)

# 词汇表（只用训练集构建！）
vocab = Vocabulary(min_freq=1)
vocab.build([tokenize(t) for t in train_texts])

# 数据集
class SentimentDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_len=50):
        self.max_len = max_len
        self.data = []
        for text, label in zip(texts, labels):
            tokens = tokenize(text)
            indices = [vocab.encode(t) for t in tokens]
            # 截断或padding
            if len(indices) >= max_len:
                indices = indices[:max_len]
            else:
                indices = indices + [Vocabulary.PAD_IDX] * (max_len - len(indices))
            self.data.append((torch.tensor(indices, dtype=torch.long),
                              torch.tensor(label, dtype=torch.long)))

    def __len__(self): return len(self.data)
    def __getitem__(self, idx): return self.data[idx]

train_dataset = SentimentDataset(train_texts, train_labels, vocab)
val_dataset = SentimentDataset(val_texts, val_labels, vocab)

train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=4)
```

## 基于BiLSTM+注意力的文本分类模型

```python
# 注意力机制的原理将在下一章（Seq2Seq）详细讲解
# 这里先把它当作"加权求和"的黑盒来用
class SelfAttention(nn.Module):
    """简单的Self-Attention层，用于在LSTM输出上加权求和"""
    def __init__(self, hidden_dim):
        super().__init__()
        self.attention = nn.Linear(hidden_dim, 1)

    def forward(self, lstm_output, mask=None):
        """
        lstm_output: (batch, seq_len, hidden_dim)
        mask: (batch, seq_len)，True表示该位置是padding
        """
        # 计算注意力权重
        scores = self.attention(lstm_output).squeeze(-1)  # (batch, seq_len)

        # 对padding位置赋极小值，softmax后接近0
        if mask is not None:
            scores = scores.masked_fill(mask, float('-inf'))

        weights = torch.softmax(scores, dim=1)  # (batch, seq_len)

        # 加权求和
        context = (weights.unsqueeze(-1) * lstm_output).sum(dim=1)  # (batch, hidden_dim)
        return context, weights


class BiLSTMAttentionClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes,
                 num_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=num_layers,
                            batch_first=True, bidirectional=True,
                            dropout=dropout if num_layers > 1 else 0)
        self.attention = SelfAttention(hidden_dim * 2)  # 双向
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.layer_norm = nn.LayerNorm(hidden_dim * 2)

    def forward(self, x):
        # x: (batch, seq_len)
        padding_mask = (x == 0)  # True表示padding位置

        embedded = self.dropout(self.embedding(x))  # (batch, seq, embed_dim)

        lstm_out, _ = self.lstm(embedded)  # (batch, seq, hidden*2)
        lstm_out = self.dropout(lstm_out)

        # 注意力加权求和
        context, attn_weights = self.attention(lstm_out, padding_mask)

        context = self.layer_norm(context)

        logits = self.fc(self.dropout(context))  # (batch, num_classes)
        return logits, attn_weights
```

## 训练与评估

```python
from sklearn.metrics import classification_report, f1_score
import matplotlib.pyplot as plt

def train_epoch(model, loader, criterion, optimizer, device, clip_grad=1.0):
    model.train()
    total_loss = 0
    all_preds, all_labels = [], []

    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits, _ = model(x)
        loss = criterion(logits, y)

        optimizer.zero_grad()
        loss.backward()
        # 梯度裁剪：防止梯度爆炸
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=clip_grad)
        optimizer.step()

        total_loss += loss.item()
        preds = logits.argmax(dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(y.cpu().numpy())

    avg_loss = total_loss / len(loader)
    f1 = f1_score(all_labels, all_preds, average='weighted')
    return avg_loss, f1


def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            logits, _ = model(x)
            loss = criterion(logits, y)

            total_loss += loss.item()
            preds = logits.argmax(dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y.cpu().numpy())

    avg_loss = total_loss / len(loader)
    # 全面的评估指标：精确率、召回率、F1
    report = classification_report(all_labels, all_preds,
                                   target_names=['负面', '正面'],
                                   zero_division=0)
    return avg_loss, report


# 训练配置
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = BiLSTMAttentionClassifier(
    vocab_size=len(vocab), embed_dim=64, hidden_dim=64,
    num_classes=2, num_layers=2, dropout=0.3
).to(device)

# 处理类别不平衡（如果正负样本不均匀）
# class_weights = torch.tensor([1.0, 2.0]).to(device)  # 负面权重1，正面权重2
criterion = nn.CrossEntropyLoss()  # 可改为 weight=class_weights
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)

# 记录训练历史
history = {'train_loss': [], 'val_loss': [], 'train_f1': []}

for epoch in range(50):
    train_loss, train_f1 = train_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, val_report = evaluate(model, val_loader, criterion, device)
    scheduler.step()

    history['train_loss'].append(train_loss)
    history['val_loss'].append(val_loss)
    history['train_f1'].append(train_f1)

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}:")
        print(f"  Train Loss: {train_loss:.4f}, F1: {train_f1:.4f}")
        print(f"  Val Loss: {val_loss:.4f}")
        print(val_report)
```

## 推理：对新文本进行预测

```python
def predict(model, text, vocab, device, max_len=50):
    """对单条文本进行预测"""
    model.eval()
    tokens = tokenize(text)
    indices = [vocab.encode(t) for t in tokens]

    # 截断或padding
    if len(indices) >= max_len:
        indices = indices[:max_len]
    else:
        indices = indices + [Vocabulary.PAD_IDX] * (max_len - len(indices))

    x = torch.tensor([indices], dtype=torch.long).to(device)

    with torch.no_grad():
        logits, attn_weights = model(x)
        probs = torch.softmax(logits, dim=1)
        pred = probs.argmax(dim=1).item()
        confidence = probs[0, pred].item()

    label = "正面 😊" if pred == 1 else "负面 😞"
    print(f"文本: {text}")
    print(f"预测: {label}（置信度: {confidence:.2%}）")

    # 可视化注意力权重（哪些词最重要）
    weights = attn_weights[0, :len(tokens)].cpu().numpy()
    print("注意力权重（词→权重）：")
    for token, weight in zip(tokens, weights):
        bar = "█" * int(weight * 50)
        print(f"  {token:15s} {bar} {weight:.4f}")

    return pred, confidence

# 测试
predict(model, "This movie was absolutely wonderful!", vocab, device)
predict(model, "Terrible waste of time, very boring.", vocab, device)
```

> 🔍 **深层思考：Accuracy vs F1**
>
> 情感分析任务中，为什么要用F1而不只是准确率（Accuracy）？
>
> 假设数据集里90%是正面评论，10%是负面评论。如果模型把所有样本都预测为"正面"，准确率高达90%——但这个模型完全没用！
>
> F1综合了精确率（Precision，预测为正面的样本中真的是正面的比例）和召回率（Recall，真正的正面样本中有多少被找出来）。F1在类别不平衡时更能反映模型的真实表现。

---


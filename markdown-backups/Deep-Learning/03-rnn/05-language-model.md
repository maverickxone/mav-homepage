---
title: "字符级语言模型"
chapter: 5
readTime: 15
description: "语言模型的训练目标、困惑度、字符级 RNN 实现与温度采样文本生成。"
---

这一章介绍RNN最经典、最能体现其本质的应用：**字符级语言模型**。它能让RNN学会写诗、生成代码、甚至模仿莎士比亚。

## 什么是语言模型

**语言模型（Language Model）**：给定一段文本的前缀，预测下一个字符（或词）是什么。

```
输入：  "今 天 天 气 真"
预测下一个字符：P(好) = 0.3, P(不) = 0.25, P(很) = 0.2, ...

依次往后：
输入：  "今 天 天 气 真 好"
预测：  P(，) = 0.4, P(啊) = 0.2, ...
```

语言模型既是一个独立的任务，也是生成文本的基础工具。

**为什么叫字符级（Character-level）**？

- 词级语言模型：以词为单位，词汇表大（几万到几十万），每步预测下一个词
- 字符级语言模型：以字符（字母/汉字）为单位，词汇表小（几百个），每步预测下一个字符

字符级模型的优势：词汇表极小（英文只有95个可打印ASCII字符），天然处理未知词（OOV），能学到拼写规律。

## 困惑度（Perplexity）：衡量语言模型的标准

**困惑度**是衡量语言模型好坏的标准指标。

直觉理解：如果模型在每个位置需要在 k 个字符中"猜"，困惑度就约等于 k。困惑度越低，模型越确定，预测越准。

数学定义：
```
Perplexity = exp(平均每字符的交叉熵损失)
           = exp(L)
```

- 随机猜测（均匀分布）：困惑度 = 词汇表大小（英文字符 ≈ 95）
- 好的字符级模型：困惑度 < 10
- 完美模型：困惑度 = 1

```python
import math

def compute_perplexity(model, data_loader, criterion, device):
    model.eval()
    total_loss = 0
    total_tokens = 0

    with torch.no_grad():
        for x, y in data_loader:
            x, y = x.to(device), y.to(device)
            output, _ = model(x)
            loss = criterion(output.view(-1, output.size(-1)), y.view(-1))
            total_loss += loss.item() * y.numel()
            total_tokens += y.numel()

    avg_loss = total_loss / total_tokens
    perplexity = math.exp(avg_loss)
    return perplexity
```

## 字符级RNN实现

```python
import torch
import torch.nn as nn
import numpy as np

# ===== 数据准备 =====
# 读取文本（这里用一个简单例子，实际可以是任何文本）
text = """
人之初，性本善。性相近，习相远。
苟不教，性乃迁。教之道，贵以专。
昔孟母，择邻处。子不学，断机杼。
窦燕山，有义方。教五子，名俱扬。
养不教，父之过。教不严，师之惰。
"""

# 建立字符词汇表
chars = sorted(set(text))
vocab_size = len(chars)
char2idx = {ch: i for i, ch in enumerate(chars)}
idx2char = {i: ch for ch, i in char2idx.items()}

print(f"词汇表大小: {vocab_size}")
print(f"文本长度: {len(text)}")

# 将文本转换为索引序列
encoded = [char2idx[ch] for ch in text]


# ===== 数据集 =====
class CharDataset(torch.utils.data.Dataset):
    def __init__(self, encoded, seq_len):
        self.data = encoded
        self.seq_len = seq_len

    def __len__(self):
        return len(self.data) - self.seq_len

    def __getitem__(self, idx):
        # 输入：一段字符序列
        x = torch.tensor(self.data[idx:idx+self.seq_len], dtype=torch.long)
        # 标签：向右移动一位（预测每个位置的下一个字符）
        y = torch.tensor(self.data[idx+1:idx+self.seq_len+1], dtype=torch.long)
        return x, y


dataset = CharDataset(encoded, seq_len=30)
loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)


# ===== 字符级语言模型 =====
class CharLM(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, vocab_size)
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

    def forward(self, x, hidden=None):
        # x: (batch, seq_len)
        embedded = self.dropout(self.embedding(x))  # (batch, seq_len, embed_dim)
        output, hidden = self.lstm(embedded, hidden)
        output = self.dropout(output)
        logits = self.fc(output)  # (batch, seq_len, vocab_size)
        return logits, hidden

    def init_hidden(self, batch_size, device):
        h = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        c = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        return h, c


# ===== 训练 =====
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = CharLM(vocab_size=vocab_size, embed_dim=32, hidden_dim=128,
               num_layers=2, dropout=0.3).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.002)

for epoch in range(50):
    model.train()
    total_loss = 0

    for x, y in loader:
        x, y = x.to(device), y.to(device)
        batch_size = x.size(0)

        hidden = model.init_hidden(batch_size, device)
        logits, hidden = model(x, hidden)
        hidden = tuple(h.detach() for h in hidden)  # 截断梯度

        loss = criterion(logits.view(-1, vocab_size), y.view(-1))

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item()

    if (epoch + 1) % 10 == 0:
        avg_loss = total_loss / len(loader)
        ppl = math.exp(avg_loss)
        print(f"Epoch {epoch+1}: Loss={avg_loss:.4f}, Perplexity={ppl:.2f}")
```

## 文本生成：温度采样

训练完成后，可以让模型"续写"文本：

```python
def generate_text(model, start_text, length=200, temperature=1.0, device='cpu'):
    """
    生成文本

    temperature 参数控制"创造性"：
    - temperature 很小（如0.2）：保守，总是选概率最高的字，输出重复
    - temperature = 1.0：正常采样
    - temperature 很大（如2.0）：随机，输出多样但可能不通顺
    """
    model.eval()
    chars = [char2idx[ch] for ch in start_text if ch in char2idx]
    input_tensor = torch.tensor([chars], dtype=torch.long).to(device)

    hidden = model.init_hidden(1, device)
    generated = start_text

    with torch.no_grad():
        # 先"预热"——让模型处理起始文本
        for i in range(len(chars) - 1):
            _, hidden = model(input_tensor[:, i:i+1], hidden)

        # 开始生成
        current_char = input_tensor[:, -1:]
        for _ in range(length):
            logits, hidden = model(current_char, hidden)

            # 温度缩放
            logits = logits[0, -1, :] / temperature
            probs = torch.softmax(logits, dim=-1)

            # 按概率采样（而不是总是选最大值）
            next_char_idx = torch.multinomial(probs, 1).item()
            next_char = idx2char[next_char_idx]

            generated += next_char
            current_char = torch.tensor([[next_char_idx]], dtype=torch.long).to(device)

    return generated

# 生成示例
print("=== temperature=0.5（保守）===")
print(generate_text(model, "人之初", temperature=0.5, device=device))

print("\n=== temperature=1.0（正常）===")
print(generate_text(model, "人之初", temperature=1.0, device=device))
```

> 🔍 **深层思考：语言模型是什么的本质**
>
> 字符级语言模型看起来只是在"猜下一个字"，但实际上它在做更深刻的事情：它**学习了文本的统计规律、语法结构、甚至某种意义上的语义**。
>
> Andrej Karpathy在2015年的经典博文"The Unreasonable Effectiveness of Recurrent Neural Networks"中展示了用字符级RNN训练莎士比亚著作后，模型能生成貌似合理的莎士比亚风格文本；训练C代码后，能生成语法大致正确的C代码（甚至会写注释）。
>
> 这暗示了一个深刻的观点：**理解语言，在某种程度上等价于能够预测下一个词**。这正是GPT系列模型的核心思想——在海量文本上训练语言模型，涌现出强大的语言理解和生成能力。

---


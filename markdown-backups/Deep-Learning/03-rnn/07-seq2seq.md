---
title: "Seq2Seq 与注意力机制"
chapter: 7
readTime: 20
description: "编码器-解码器架构、Bahdanau 注意力、Teacher Forcing 与 Beam Search。"
---

## Seq2Seq架构

Seq2Seq用于将一个序列映射到另一个（可能不同长度的）序列，是机器翻译、文本摘要、对话系统的基础。

```
编码阶段：
"I love you" → Encoder → [上下文向量 c]

解码阶段（自回归）：
[c] → Decoder → "我"
["我", c] → Decoder → "爱"
["我", "爱", c] → Decoder → "你"
["我", "爱", "你", c] → Decoder → "<eos>"（结束）
```

**信息瓶颈问题**：

标准Seq2Seq的致命缺陷：编码器必须将整个输入序列的信息**压缩**到一个固定长度的向量中（LSTM的最后一个隐藏状态）。对于长句子，这个向量根本装不下所有信息。

这就是**注意力机制**被发明的原因。

## Bahdanau注意力（Additive Attention）

Bahdanau等人在2015年提出：解码器在每一步不只依赖固定的上下文向量，而是动态地"关注"编码器序列的不同位置。

```
解码"我"时：主要看 "I"
解码"爱"时：主要看 "love"
解码"你"时：主要看 "you"
```

**数学公式**：

设编码器所有隐藏状态为 h_1, ..., h_T，解码器当前隐藏状态为 s_{t-1}。

```
步骤1：计算注意力分数（能量）
    e_{t,i} = v^T · tanh(W_s · s_{t-1} + W_h · h_i + b)
                 ↑  s_{t-1}和h_i的"兼容性"

步骤2：Softmax得到注意力权重
    α_{t,i} = softmax(e_{t,1}, ..., e_{t,T})_i

步骤3：加权求和，得到上下文向量
    c_t = Σ_i α_{t,i} · h_i
```

**完整实现**：

```python
class BahdanauAttention(nn.Module):
    """Bahdanau注意力（加性注意力）"""
    def __init__(self, encoder_hidden_dim, decoder_hidden_dim, attention_dim):
        super().__init__()
        self.W_encoder = nn.Linear(encoder_hidden_dim, attention_dim, bias=False)
        self.W_decoder = nn.Linear(decoder_hidden_dim, attention_dim, bias=False)
        self.v = nn.Linear(attention_dim, 1, bias=False)

    def forward(self, decoder_hidden, encoder_outputs, encoder_mask=None):
        """
        decoder_hidden: (batch, decoder_hidden_dim)
        encoder_outputs: (batch, src_len, encoder_hidden_dim)
        encoder_mask: (batch, src_len)，True表示padding位置

        返回：
        context: (batch, encoder_hidden_dim) - 上下文向量
        weights: (batch, src_len) - 注意力权重（可用于可视化）
        """
        src_len = encoder_outputs.size(1)

        # 将decoder隐藏状态扩展为 (batch, src_len, decoder_hidden_dim)
        decoder_hidden = decoder_hidden.unsqueeze(1).repeat(1, src_len, 1)

        # 计算能量
        energy = self.v(
            torch.tanh(self.W_encoder(encoder_outputs) +
                       self.W_decoder(decoder_hidden))
        ).squeeze(-1)  # (batch, src_len)

        # Mask掉padding位置
        if encoder_mask is not None:
            energy = energy.masked_fill(encoder_mask, float('-inf'))

        # Softmax
        weights = torch.softmax(energy, dim=1)  # (batch, src_len)

        # 加权求和
        context = torch.bmm(weights.unsqueeze(1), encoder_outputs).squeeze(1)
        # (batch, encoder_hidden_dim)

        return context, weights


class Encoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, n_layers, dropout):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers, batch_first=True,
                            dropout=dropout if n_layers > 1 else 0,
                            bidirectional=True)
        self.fc_h = nn.Linear(hidden_dim * 2, hidden_dim)  # 双向→单向
        self.fc_c = nn.Linear(hidden_dim * 2, hidden_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, src):
        # src: (batch, src_len)
        embedded = self.dropout(self.embedding(src))
        outputs, (hidden, cell) = self.lstm(embedded)
        # outputs: (batch, src_len, hidden*2) - 用于注意力计算
        # hidden: (n_layers*2, batch, hidden)

        # 合并双向隐藏状态（取最后一层）
        hidden = torch.tanh(self.fc_h(
            torch.cat([hidden[-2], hidden[-1]], dim=1)
        )).unsqueeze(0)  # (1, batch, hidden)

        cell = torch.tanh(self.fc_c(
            torch.cat([cell[-2], cell[-1]], dim=1)
        )).unsqueeze(0)

        return outputs, hidden, cell


class AttentionDecoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, encoder_hidden_dim,
                 decoder_hidden_dim, n_layers, dropout):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.attention = BahdanauAttention(encoder_hidden_dim * 2,
                                           decoder_hidden_dim, decoder_hidden_dim)
        self.lstm = nn.LSTM(embed_dim + encoder_hidden_dim * 2,
                            decoder_hidden_dim, n_layers, batch_first=True,
                            dropout=dropout if n_layers > 1 else 0)
        self.fc_out = nn.Linear(decoder_hidden_dim + encoder_hidden_dim * 2 + embed_dim,
                                vocab_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, tgt_token, hidden, cell, encoder_outputs, encoder_mask=None):
        """
        tgt_token: (batch,) - 当前解码器输入token
        hidden:    (1, batch, decoder_hidden_dim)
        encoder_outputs: (batch, src_len, encoder_hidden_dim*2)
        """
        tgt_token = tgt_token.unsqueeze(1)          # (batch, 1)
        embedded = self.dropout(self.embedding(tgt_token))  # (batch, 1, embed_dim)

        # 注意力
        context, attn_weights = self.attention(
            hidden[-1], encoder_outputs, encoder_mask
        )  # context: (batch, encoder_hidden_dim*2)

        # 拼接词嵌入和上下文向量，一起输入LSTM
        lstm_input = torch.cat([embedded, context.unsqueeze(1)], dim=2)
        # (batch, 1, embed_dim + encoder_hidden_dim*2)

        output, (hidden, cell) = self.lstm(lstm_input, (hidden, cell))

        # 三路拼接做最终预测
        prediction = self.fc_out(
            torch.cat([output.squeeze(1), context, embedded.squeeze(1)], dim=1)
        )  # (batch, vocab_size)

        return prediction, hidden, cell, attn_weights
```

## Seq2Seq训练：Teacher Forcing与Exposure Bias

**Teacher Forcing**：训练时，解码器每一步的输入用真实标签（而不是模型的预测）。

```python
class Seq2Seq(nn.Module):
    def __init__(self, encoder, decoder, src_pad_idx):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.src_pad_idx = src_pad_idx

    def make_src_mask(self, src):
        """标记padding位置"""
        return (src == self.src_pad_idx)  # (batch, src_len)

    def forward(self, src, tgt, teacher_forcing_ratio=0.5):
        batch_size = src.size(0)
        tgt_len = tgt.size(1)

        encoder_outputs, hidden, cell = self.encoder(src)
        src_mask = self.make_src_mask(src)

        # 存储输出
        outputs = torch.zeros(batch_size, tgt_len, self.decoder.fc_out.out_features)
        outputs = outputs.to(src.device)

        # 解码器的第一个输入：<sos>
        dec_input = tgt[:, 0]

        for t in range(1, tgt_len):
            output, hidden, cell, _ = self.decoder(
                dec_input, hidden, cell, encoder_outputs, src_mask
            )
            outputs[:, t] = output

            # Teacher Forcing：随机决定用真实标签还是模型预测
            use_teacher_forcing = torch.rand(1).item() < teacher_forcing_ratio
            dec_input = tgt[:, t] if use_teacher_forcing else output.argmax(1)

        return outputs
```

> 🔍 **深层思考：Teacher Forcing的Exposure Bias问题**
>
> Teacher Forcing的设计很聪明：训练时给模型看真实标签，错误不会"雪球"滚大，训练更稳定。
>
> 但它有一个严重缺陷——**Exposure Bias（曝光偏差）**：
>
> - 训练时：解码器输入都是正确的词（真实标签）
> - 推理时：解码器输入是自己的预测（可能有错误）
>
> 这个训练-推理分布不一致，导致推理时错误会累积放大（第一步错了→第二步输入就不对→...）。
>
> **解决方案1：Scheduled Sampling**（Bengio et al. 2015）
> 训练时随机用真实标签或模型预测，随着训练进行，逐渐增大使用模型预测的概率。
>
> **解决方案2：直接优化序列级别的损失**（如BLEU分数），而不是逐词交叉熵。但序列级别的损失不可微，需要强化学习技巧。
>
> **Transformer的解法**：并行计算所有位置，用Mask Attention避免看到未来词，从根本上绕开了这个问题。

## Beam Search解码

贪心解码（每步选概率最大的词）往往不是最优的。Beam Search是一种更好的解码策略。

```
贪心解码：
时刻1: I(0.5) love(0.3) ... → 选 I
时刻2: I+love(0.8) I+hate(0.1) ... → 选 love
最终: "I love"，概率 = 0.5 × 0.8 = 0.4

Beam Search（beam_size=2）：
时刻1: 保留前2个候选
    候选1: I (log_prob=-0.69)
    候选2: She (log_prob=-1.39)

时刻2: 对每个候选扩展，保留前2个
    I+love (log_prob=-0.69-0.22=-0.91)
    I+hate (log_prob=-0.69-2.30=-2.99)
    She+is (log_prob=-1.39-0.51=-1.90)
    She+was (log_prob=-1.39-0.92=-2.31)
    → 保留: "I love", "She is"

最终选择联合概率最高的序列
```

```python
def beam_search_decode(model, src, src_vocab, tgt_vocab,
                       beam_size=5, max_len=50, device='cpu'):
    """
    Beam Search解码

    beam_size: 每步保留的候选数
    """
    model.eval()

    with torch.no_grad():
        src = src.to(device)
        encoder_outputs, hidden, cell = model.encoder(src)
        src_mask = model.make_src_mask(src)

        # 初始beam：[(log_prob, token序列, hidden, cell)]
        sos_token = tgt_vocab.SOS_IDX
        eos_token = tgt_vocab.EOS_IDX

        beams = [(0.0, [sos_token], hidden, cell)]
        completed = []

        for step in range(max_len):
            all_candidates = []

            for log_prob, tokens, h, c in beams:
                if tokens[-1] == eos_token:
                    completed.append((log_prob, tokens))
                    continue

                dec_input = torch.tensor([tokens[-1]], dtype=torch.long).to(device)
                output, new_h, new_c, _ = model.decoder(
                    dec_input, h, c, encoder_outputs, src_mask
                )

                log_probs = torch.log_softmax(output, dim=1)[0]  # (vocab_size,)

                # 扩展到top-beam_size个候选
                top_log_probs, top_indices = log_probs.topk(beam_size)

                for new_log_prob, new_idx in zip(top_log_probs, top_indices):
                    candidate = (
                        log_prob + new_log_prob.item(),
                        tokens + [new_idx.item()],
                        new_h, new_c
                    )
                    all_candidates.append(candidate)

            if not all_candidates:
                break

            # 保留概率最高的beam_size个候选（用长度归一化）
            all_candidates.sort(
                key=lambda x: x[0] / len(x[1]),  # 按平均每词log概率排序
                reverse=True
            )
            beams = all_candidates[:beam_size]

        # 返回最佳结果
        if completed:
            best = max(completed, key=lambda x: x[0] / len(x[1]))
        else:
            best = max(beams, key=lambda x: x[0] / len(x[1]))

        # 将索引转换为词
        tokens = [tgt_vocab.decode(i) for i in best[1]
                  if i not in [tgt_vocab.SOS_IDX, tgt_vocab.PAD_IDX]]
        # 去掉EOS之后的部分
        if tgt_vocab.decode(tgt_vocab.EOS_IDX) in tokens:
            eos_pos = tokens.index(tgt_vocab.decode(tgt_vocab.EOS_IDX))
            tokens = tokens[:eos_pos]

        return ' '.join(tokens)
```

> 💡 **长度归一化的必要性**
>
> 不加归一化时，Beam Search总是偏向短序列（因为每个词都会让log概率更负）。
> 用 `log_prob / length` 归一化后，模型不会"为了避免出错而提前结束"。
> 实践中常用 `log_prob / length^α`，其中 α=0.6~0.7 是经验值。

---


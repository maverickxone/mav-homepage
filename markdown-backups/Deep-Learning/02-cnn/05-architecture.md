---
title: "CNN 模型构建与迁移学习"
chapter: 5
readTime: 30
description: "LeNet、AlexNet、VGG、ResNet 实现，预训练模型、特征提取、微调与模型保存。"
---

## 经典LeNet模型实现

LeNet是1998年Yann LeCun提出的第一个卷积神经网络，是现代CNN的开山之作。

```python
import torch.nn as nn

class LeNet(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()

        # 特征提取部分
        self.features = nn.Sequential(
            # C1: 第一卷积层
            nn.Conv2d(1, 6, kernel_size=5, padding=2),  # 28x28 -> 28x28
            nn.ReLU(inplace=True),
            nn.AvgPool2d(kernel_size=2, stride=2),      # 28x28 -> 14x14

            # C3: 第二卷积层
            nn.Conv2d(6, 16, kernel_size=5),            # 14x14 -> 10x10
            nn.ReLU(inplace=True),
            nn.AvgPool2d(kernel_size=2, stride=2),      # 10x10 -> 5x5
        )

        # 分类器部分
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(16 * 5 * 5, 120),
            nn.ReLU(inplace=True),
            nn.Linear(120, 84),
            nn.ReLU(inplace=True),
            nn.Linear(84, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

# 测试
model = LeNet(num_classes=10)
x = torch.randn(1, 1, 28, 28)
output = model(x)
print("输出形状:", output.shape)  # torch.Size([1, 10])

# 打印模型结构
print(model)
```

**LeNet架构图**：

```
输入 (1, 28, 28)
    ↓
Conv2d(1, 6, 5x5) + ReLU + AvgPool  →  (6, 14, 14)
    ↓
Conv2d(6, 16, 5x5) + ReLU + AvgPool  →  (16, 5, 5)
    ↓
Flatten  →  (400)
    ↓
Linear(400, 120) + ReLU  →  (120)
    ↓
Linear(120, 84) + ReLU  →  (84)
    ↓
Linear(84, 10)  →  (10)
```

---

## AlexNet模型实现

AlexNet在2012年ImageNet竞赛中取得突破性成绩，标志着深度学习的复兴。

```python
class AlexNet(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()

        self.features = nn.Sequential(
            # Conv1
            nn.Conv2d(3, 96, kernel_size=11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),  # 224 -> 55

            # Conv2
            nn.Conv2d(96, 256, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),  # 55 -> 27

            # Conv3
            nn.Conv2d(256, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),

            # Conv4
            nn.Conv2d(384, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),

            # Conv5
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),  # 27 -> 13
        )

        self.avgpool = nn.AdaptiveAvgPool2d((6, 6))

        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

# 测试
model = AlexNet(num_classes=1000)
x = torch.randn(1, 3, 224, 224)
output = model(x)
print("输出形状:", output.shape)  # torch.Size([1, 1000])

# 参数统计
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"总参数: {total_params:,}")
print(f"可训练参数: {trainable_params:,}")
```

---

## VGG模型实现

VGG通过使用更小的3x3卷积核堆叠来增加网络深度，是当时最常用的特征提取网络。

```python
class VGG(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()

        # VGG16配置
        # [64, 64, 'M', 128, 128, 'M', 256, 256, 256, 'M',
        #  512, 512, 512, 'M', 512, 512, 512, 'M']
        # 'M' = MaxPool

        self.features = self._make_layers([
            64, 64, 'M',           # Block 1: 224 -> 112
            128, 128, 'M',         # Block 2: 112 -> 56
            256, 256, 256, 'M',    # Block 3: 56 -> 28
            512, 512, 512, 'M',    # Block 4: 28 -> 14
            512, 512, 512, 'M',    # Block 5: 14 -> 7
        ])

        self.avgpool = nn.AdaptiveAvgPool2d((7, 7))

        self.classifier = nn.Sequential(
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4097, num_classes),
        )

    def _make_layers(self, config):
        layers = []
        in_channels = 3

        for v in config:
            if v == 'M':
                layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
            else:
                layers.append(nn.Conv2d(in_channels, v, kernel_size=3, padding=1))
                layers.append(nn.BatchNorm2d(v))
                layers.append(nn.ReLU(inplace=True))
                in_channels = v

        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

# 测试
model = VGG(num_classes=1000)
x = torch.randn(1, 3, 224, 224)
output = model(x)
print("输出形状:", output.shape)

# 参数统计
total_params = sum(p.numel() for p in model.parameters())
print(f"VGG16参数: {total_params:,}")
```

**VGG变体**：

```python
# VGG11, VGG13, VGG16, VGG19
# 数字表示卷积层+全连接层的总层数
# 常用VGG16（在准确率和参数量之间平衡较好）
```

---

## ResNet残差网络

ResNet通过残差连接解决了深层网络梯度消失问题，是现代CNN的里程碑。

```python
class ResidualBlock(nn.Module):
    """残差块"""
    def __init__(self, in_channels, out_channels, stride=1, downsample=None):
        super().__init__()
        self.conv1 = nn.Conv2d(
            in_channels, out_channels,
            kernel_size=3, stride=stride, padding=1, bias=False
        )
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(
            out_channels, out_channels,
            kernel_size=3, stride=1, padding=1, bias=False
        )
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.downsample = downsample

    def forward(self, x):
        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        if self.downsample is not None:
            identity = self.downsample(x)

        out += identity  # 残差连接
        out = self.relu(out)

        return out


class ResNet(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()

        # 初始卷积层
        self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.relu = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)

        # 残差层
        self.layer1 = self._make_layer(64, 64, blocks=2, stride=1)
        self.layer2 = self._make_layer(64, 128, blocks=2, stride=2)
        self.layer3 = self._make_layer(128, 256, blocks=2, stride=2)
        self.layer4 = self._make_layer(256, 512, blocks=2, stride=2)

        # 全局平均池化和分类器
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(512, num_classes)

    def _make_layer(self, in_channels, out_channels, blocks, stride):
        downsample = None

        if stride != 1 or in_channels != out_channels:
            downsample = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

        layers = []
        layers.append(ResidualBlock(in_channels, out_channels, stride, downsample))

        for _ in range(1, blocks):
            layers.append(ResidualBlock(out_channels, out_channels))

        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.fc(x)

        return x


# 测试
model = ResNet(num_classes=1000)
x = torch.randn(1, 3, 224, 224)
output = model(x)
print("输出形状:", output.shape)

# ResNet18参数统计
total_params = sum(p.numel() for p in model.parameters())
print(f"ResNet参数: {total_params:,}")
```

**ResNet的优势**：

```
普通网络: 输出 = F(x)
残差网络: 输出 = F(x) + x

残差连接使得梯度可以直接反向传播到浅层
解决了深层网络梯度消失的问题
```

---


## torchvision.models：预训练模型

PyTorch提供了在ImageNet上预训练的模型，可以直接下载使用。

```python
import torchvision.models as models

# 加载预训练模型
resnet18 = models.resnet18(pretrained=True)
resnet50 = models.resnet50(pretrained=True)
vgg16 = models.vgg16(pretrained=True)
alexnet = models.alexnet(pretrained=True)

# 加载未训练的模型（用于微调）
resnet18_no_pretrain = models.resnet18(pretrained=False)

# 查看模型结构
print(resnet18)
```

**常用预训练模型**：

```python
# ImageNet预训练模型
models.resnet18(pretrained=True)    # 11.7M参数
models.resnet34(pretrained=True)   # 21.8M参数
models.resnet50(pretrained=True)   # 25.6M参数
models.resnet101(pretrained=True)  # 44.5M参数

models.vgg11(pretrained=True)       # 132.9M参数
models.vgg13(pretrained=True)
models.vgg16(pretrained=True)      # 138.4M参数

models.alexnet(pretrained=True)    # 61.1M参数

# EfficientNet系列（最新最强）
models.efficientnet_b0(pretrained=True)
models.efficientnet_b1(pretrained=True)

# MobileNet系列（移动端优化）
models.mobilenet_v2(pretrained=True)
models.mobilenet_v3_small(pretrained=True)

# ViT（Vision Transformer）
models.vit_b_16(pretrained=True)    # 需要较大计算资源
```

## 特征提取：冻结主干网络

特征提取是最常用的迁移学习方法，将预训练模型作为固定特征提取器。

```python
import torchvision.models as models

# 加载预训练模型
model = models.resnet18(pretrained=True)

# 冻结所有层（不更新参数）
for param in model.parameters():
    param.requires_grad = False

# 修改最后的全连接层
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 10)  # 10类分类

# 训练时只有fc层的参数会更新
# 其他层参数固定不变
```

**特征提取的完整示例**：

```python
import torchvision.models as models
import torch.nn as nn

# 1. 加载预训练模型
feature_extractor = models.resnet18(pretrained=True)

# 2. 冻结所有参数
for param in feature_extractor.parameters():
    param.requires_grad = False

# 3. 替换分类头
feature_extractor.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(512, 256),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(256, 10)
)

# 4. 冻结BatchNorm（可选，防止更新running stats）
for module in feature_extractor.modules():
    if isinstance(module, nn.BatchNorm2d):
        module.eval()

# 5. 训练
optimizer = torch.optim.Adam(feature_extractor.fc.parameters(), lr=0.001)

# 训练循环
for images, labels in train_loader:
    outputs = feature_extractor(images)
    loss = criterion(outputs, labels)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

## 微调：解冻部分层

微调（Fine-tuning）是在预训练模型基础上解冻部分层进行训练。

```python
# 方法1：解冻所有层
model = models.resnet18(pretrained=True)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 方法2：只解冻最后几层
model = models.resnet18(pretrained=True)

# 冻结前面的层
for name, param in model.named_parameters():
    if 'layer4' not in name and 'fc' not in name:
        param.requires_grad = False

# 只优化可训练参数
optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=0.001
)

# 方法3：使用不同的学习率
model = models.resnet18(pretrained=True)

# 基础层（浅层）使用较小学习率
base_params = []
base_layers = ['conv1', 'bn1', 'layer1', 'layer2']
for name, param in model.named_parameters():
    if any(layer in name for layer in base_layers):
        base_params.append(param)
        param.requires_grad = True
    else:
        param.requires_grad = False

optimizer = torch.optim.Adam([
    {'params': base_params, 'lr': 1e-4},      # 基础层：低学习率
    {'params': model.fc.parameters(), 'lr': 1e-3}  # 分类头：高学习率
])
```

## 模型保存与加载

```python
import torch

# 方法1：只保存参数（推荐）
torch.save(model.state_dict(), 'model.pth')

# 加载
model = MyModel()
model.load_state_dict(torch.load('model.pth'))

# 方法2：保存完整模型
torch.save(model, 'model_full.pth')

# 加载
model = torch.load('model_full.pth')

# 方法3：保存检查点（训练中断恢复）
checkpoint = {
    'epoch': 10,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': 0.5,
}
torch.save(checkpoint, 'checkpoint.pth')

# 加载检查点
checkpoint = torch.load('checkpoint.pth')
model.load_state_dict(checkpoint['model_state_dict'])
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
start_epoch = checkpoint['epoch'] + 1

# 方法4：GPU到CPU的模型加载
device = torch.device('cpu')
model = MyModel()
model.load_state_dict(torch.load('model.pth', map_location=device))

# 方法5：跨设备加载（GPU/CPU兼容）
model = MyModel()
model.load_state_dict(torch.load('model.pth', map_location='cuda:0' if torch.cuda.is_available() else 'cpu'))
```

---


---
title: "训练技巧与模型评估"
chapter: 6
readTime: 30
description: "学习率调度、早停、混合精度、GradCAM 可视化、常见错误与速查表。"
---

## 学习率调度器

学习率调度器可以根据训练进程动态调整学习率。

```python
import torch.optim as optim

# 1. StepLR：固定步长衰减
optimizer = optim.SGD(model.parameters(), lr=0.1)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)

for epoch in range(100):
    train(...)
    scheduler.step()
    print(f"Epoch {epoch}: LR = {scheduler.get_last_lr()[0]}")

# 2. MultiStepLR：多个里程碑衰减
scheduler = optim.lr_scheduler.MultiStepLR(
    optimizer, milestones=[30, 60, 90], gamma=0.1
)

# 3. CosineAnnealingLR：余弦退火
scheduler = optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=50, eta_min=1e-6
)

# 4. ReduceLROnPlateau：监控指标下降时调整
scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.1, patience=5
)

# 训练循环
for epoch in range(100):
    train_loss = train(...)
    val_loss = validate(...)

    scheduler.step(val_loss)  # 根据验证损失调整

# 5. Warmup策略：学习率预热
class WarmupScheduler:
    def __init__(self, optimizer, warmup_epochs, base_lr):
        self.optimizer = optimizer
        self.warmup_epochs = warmup_epochs
        self.base_lr = base_lr

    def step(self, epoch):
        if epoch < self.warmup_epochs:
            lr = self.base_lr * (epoch + 1) / self.warmup_epochs
            for param_group in self.optimizer.param_groups:
                param_group['lr'] = lr
```

## 早停策略

早停（Early Stopping）防止过拟合。

```python
class EarlyStopping:
    def __init__(self, patience=7, min_delta=0, mode='min'):
        self.patience = patience
        self.min_delta = min_delta
        self.mode = mode
        self.counter = 0
        self.best_score = None
        self.early_stop = False

    def __call__(self, score):
        if self.best_score is None:
            self.best_score = score
        elif self._is_improvement(score):
            self.best_score = score
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True

        return self.early_stop

    def _is_improvement(self, score):
        if self.mode == 'min':
            return score < self.best_score - self.min_delta
        else:
            return score > self.best_score + self.min_delta

# 使用
early_stopping = EarlyStopping(patience=10, mode='min')

for epoch in range(100):
    train_loss = train(...)
    val_loss = validate(...)

    early_stopping(val_loss)
    if early_stopping.early_stop:
        print(f"早停！Epoch {epoch}")
        break
```

## 梯度裁剪

梯度裁剪防止梯度爆炸。

```python
# 方法1：按值裁剪
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)

# 方法2：按范数裁剪（推荐）
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 训练循环中的使用
for images, labels in train_loader:
    outputs = model(images)
    loss = criterion(outputs, labels)

    optimizer.zero_grad()
    loss.backward()

    # 梯度裁剪
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

    optimizer.step()
```

## 混合精度训练

混合精度训练可以显著加速训练并减少显存使用。

```python
from torch.cuda.amp import autocast, GradScaler

# 检查GPU是否支持混合精度
print(torch.cuda.is_available())
print(torch.cuda.get_device_capability())

# 创建scaler
scaler = GradScaler()

# 训练循环
model = model.cuda()
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    for images, labels in train_loader:
        images = images.cuda()
        labels = labels.cuda()

        optimizer.zero_grad()

        # 前向传播使用自动混合精度
        with autocast():
            outputs = model(images)
            loss = criterion(outputs, labels)

        # 反向传播
        scaler.scale(loss).backward()

        # 梯度裁剪
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

        # 更新参数
        scaler.step(optimizer)
        scaler.update()
```

## 完整的训练流程

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import torchvision.models as models
from tqdm import tqdm

def train_one_epoch(model, train_loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    pbar = tqdm(train_loader, desc='Training')
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)

        # 前向传播
        outputs = model(images)
        loss = criterion(outputs, labels)

        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # 统计
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        pbar.set_postfix({
            'loss': running_loss / (pbar.n + 1),
            'acc': 100. * correct / total
        })

    return running_loss / len(train_loader), 100. * correct / total


def validate(model, val_loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return running_loss / len(val_loader), 100. * correct / total


# 主训练流程
def main():
    # 设置设备
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"使用设备: {device}")

    # 数据增强
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # 加载数据
    train_dataset = datasets.FakeData(
        size=1000, image_size=(3, 224, 224), transform=train_transform
    )
    val_dataset = datasets.FakeData(
        size=200, image_size=(3, 224, 224), transform=val_transform
    )

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32)

    # 创建模型
    model = models.resnet18(pretrained=True)
    model.fc = nn.Linear(model.fc.in_features, 10)
    model = model.to(device)

    # 损失函数和优化器
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)

    # 训练
    best_acc = 0.0
    num_epochs = 10

    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch + 1}/{num_epochs}")

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device
        )

        val_loss, val_acc = validate(model, val_loader, criterion, device)

        scheduler.step()

        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")

        # 保存最佳模型
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), 'best_model.pth')
            print("保存最佳模型!")

    print(f"\n最佳验证准确率: {best_acc:.2f}%")

if __name__ == '__main__':
    main()
```

---


## 混淆矩阵

```python
import numpy as np
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

def plot_confusion_matrix(y_true, y_pred, classes):
    cm = confusion_matrix(y_true, y_pred)

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=classes, yticklabels=classes)
    plt.ylabel('真实标签')
    plt.xlabel('预测标签')
    plt.title('混淆矩阵')
    plt.show()

# 使用
all_preds = []
all_labels = []

model.eval()
with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        _, predicted = outputs.max(1)

        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.numpy())

plot_confusion_matrix(all_labels, all_preds, classes)
```

## 分类报告

```python
from sklearn.metrics import classification_report

# 详细分类报告
print(classification_report(
    all_labels,
    all_preds,
    target_names=['T恤', '裤子', '套头衫', '连衣裙', '外套',
                  '凉鞋', '衬衫', '运动鞋', '包', '短靴']
))
```

## 学习曲线可视化

```python
import matplotlib.pyplot as plt

def plot_learning_curves(train_losses, val_losses, train_accs, val_accs):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    # 损失曲线
    ax1.plot(train_losses, label='训练损失')
    ax1.plot(val_losses, label='验证损失')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('损失')
    ax1.set_title('损失曲线')
    ax1.legend()
    ax1.grid(True)

    # 准确率曲线
    ax2.plot(train_accs, label='训练准确率')
    ax2.plot(val_accs, label='验证准确率')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('准确率 (%)')
    ax2.set_title('准确率曲线')
    ax2.legend()
    ax2.grid(True)

    plt.tight_layout()
    plt.show()

# 使用
history = {
    'train_loss': [],
    'val_loss': [],
    'train_acc': [],
    'val_acc': []
}

for epoch in range(num_epochs):
    # 训练...
    history['train_loss'].append(train_loss)
    history['val_loss'].append(val_loss)
    history['train_acc'].append(train_acc)
    history['val_acc'].append(val_acc)

plot_learning_curves(
    history['train_loss'],
    history['val_loss'],
    history['train_acc'],
    history['val_acc']
)
```

## 中间层特征可视化

```python
import matplotlib.pyplot as plt

def visualize_feature_maps(model, image, layer_idx=0):
    """可视化指定层的特征图"""
    model.eval()

    # 提取中间层
    layers = list(model.features.children())
    layer = layers[layer_idx]

    # 创建特征提取器
    feature_extractor = nn.Sequential(*layers[:layer_idx+1])

    with torch.no_grad():
        features = feature_extractor(image)

    # 可视化前16个通道
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))
    for i, ax in enumerate(axes.flat):
        if i < features.shape[1]:
            feature_map = features[0, i].cpu()
            ax.imshow(feature_map, cmap='viridis')
            ax.set_title(f'Channel {i}')
        ax.axis('off')

    plt.tight_layout()
    plt.show()

# 使用
model = models.resnet18(pretrained=True)
image = torch.randn(1, 3, 224, 224).cuda()
visualize_feature_maps(model, image, layer_idx=4)
```

## Grad-CAM：梯度加权类激活映射

Grad-CAM可以可视化模型关注图像的哪些区域进行分类。

```python
import torch
import torch.nn.functional as F
import numpy as np
import cv2

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # 注册hook
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate_cam(self, input_tensor, target_class):
        # 前向传播
        output = self.model(input_tensor)

        # 反向传播
        self.model.zero_grad()
        one_hot = torch.zeros_like(output)
        one_hot[0][target_class] = 1
        output.backward(gradient=one_hot, retain_graph=True)

        # 计算CAM
        gradients = self.gradients[0]  # (C, H, W)
        activations = self.activations[0]  # (C, H, W)

        # 全局平均池化梯度作为权重
        weights = torch.mean(gradients, dim=(1, 2))  # (C,)

        # 加权求和
        cam = torch.zeros(activations.shape[1:], dtype=torch.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        # ReLU
        cam = F.relu(cam)

        # 归一化
        cam = cam.cpu().numpy()
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)

        # 调整大小到输入图像
        cam = cv2.resize(cam, (224, 224))

        return cam


def show_gradcam(image, cam):
    """显示Grad-CAM结果"""
    img = image.cpu().squeeze().permute(1, 2, 0).numpy()
    img = (img - img.min()) / (img.max() - img.min())

    # 热力图
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    heatmap = np.float32(heatmap) / 255

    # 叠加
    result = heatmap * 0.4 + np.float32(img) * 0.6

    plt.figure(figsize=(10, 4))
    plt.subplot(1, 3, 1)
    plt.imshow(img)
    plt.title('原图')
    plt.axis('off')

    plt.subplot(1, 3, 2)
    plt.imshow(heatmap)
    plt.title('热力图')
    plt.axis('off')

    plt.subplot(1, 3, 3)
    plt.imshow(result)
    plt.title('叠加')
    plt.axis('off')

    plt.tight_layout()
    plt.show()


# 使用
model = models.resnet18(pretrained=True)
target_layer = model.layer4[-1]
gradcam = GradCAM(model, target_layer)

image = torch.randn(1, 3, 224, 224)
image.requires_grad = True
cam = gradcam.generate_cam(image, target_class=0)
show_gradcam(image, cam)
```

---

## 常见错误与解决方案

### 图像维度错误

```python
# 错误：PIL Image直接传入模型
img = Image.open('cat.jpg')
output = model(img)  # 错误！

# 解决：转换为张量
transform = transforms.Compose([
    transforms.ToTensor(),
])
img_tensor = transform(img).unsqueeze(0)  # 添加batch维度
output = model(img_tensor)
```

### 标准化不一致

```python
# 错误：训练和测试使用不同的标准化
train_transform = transforms.Compose([
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

test_transform = transforms.Compose([
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 解决：使用相同的标准化
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

normalize = transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
# 训练和测试都使用这个normalize
```

### GPU内存不足

```python
# 错误：batch_size太大
train_loader = DataLoader(dataset, batch_size=256)  # 可能OOM

# 解决1：减小batch_size
train_loader = DataLoader(dataset, batch_size=32)

# 解决2：使用梯度累积
accumulation_steps = 8
optimizer.zero_grad()
for i, (images, labels) in enumerate(train_loader):
    outputs = model(images)
    loss = criterion(outputs, labels)
    loss = loss / accumulation_steps
    loss.backward()

    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()

# 解决3：使用混合精度
scaler = GradScaler()
with autocast():
    outputs = model(images)
```

### 模型eval模式忘记切换

```python
# 错误：训练后忘记切换到eval模式
model.train()
# 训练完成后直接测试
test_acc = evaluate(model, test_loader)  # 错误！

# 解决：在评估前切换到eval模式
model.eval()
with torch.no_grad():
    test_acc = evaluate(model, test_loader)
```

---

## CNN训练快速查阅表

```python
# ============ 导入 ============
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms, datasets, models

# ============ 数据变换 ============
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ============ 数据加载 ============
train_dataset = datasets.CIFAR10(root='./data', train=True, transform=train_transform)
test_dataset = datasets.CIFAR10(root='./data', train=False, transform=test_transform)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=4)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False, num_workers=4)

# ============ 模型构建 ============
model = models.resnet18(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 10)  # 10类分类
model = model.cuda()  # 或 .to(device)

# ============ 损失函数和优化器 ============
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)

# ============ 训练循环 ============
for epoch in range(20):
    model.train()
    for images, labels in train_loader:
        images, labels = images.cuda(), labels.cuda()

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

    scheduler.step()

    # 验证
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.cuda(), labels.cuda()
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    print(f'Epoch {epoch}: Accuracy {100 * correct / total}%')

# ============ 保存模型 ============
torch.save(model.state_dict(), 'model.pth')

# 加载模型
model.load_state_dict(torch.load('model.pth'))
```

---

## 总结与下一步

### 本篇笔记核心要点

1. **卷积操作**：nn.Conv2d的参数（kernel_size, stride, padding, groups, dilation）
2. **池化层**：MaxPool2d, AvgPool2d, AdaptiveAvgPool2d
3. **归一化**：BatchNorm2d, LayerNorm, GroupNorm, Dropout
4. **数据增强**：transforms的各种变换（翻转、旋转、裁剪、颜色抖动等）
5. **模型构建**：LeNet, AlexNet, VGG, ResNet
6. **迁移学习**：特征提取、微调、模型保存加载
7. **训练技巧**：学习率调度、早停、梯度裁剪、混合精度

### 下一步学习建议

- **目标检测**：YOLO, Faster R-CNN, SSD
- **语义分割**：U-Net, DeepLabV3
- **实例分割**：Mask R-CNN
- **Transformer视觉**：ViT, DETR
- **自监督学习**：SimCLR, MoCo, MAE

### 推荐资源

- PyTorch官方文档：https://pytorch.org/docs/
- torchvision：https://pytorch.org/vision/
- Papers With Code：https://paperswithcode.com/

---

*本笔记是USTC学生深度学习笔记系列第二篇*

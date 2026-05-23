---
title: "数据增强与数据集加载"
chapter: 4
readTime: 25
description: "transforms 系列变换、数据增强策略、ImageFolder、自定义 Dataset、DataLoader。"
---

数据增强是提升模型泛化能力的关键技术。torchvision.transforms提供了丰富的图像变换函数。

## 图像变换与数据增强

### transforms.Compose：组合多个变换

Compose用于将多个变换组合成管道。

```python
from torchvision import transforms

# 创建变换管道
transform = transforms.Compose([
    transforms.ToTensor(),           # 1. 转为张量
    transforms.Normalize([0.5], [0.5]),  # 2. 标准化
    transforms.RandomHorizontalFlip(),   # 3. 随机翻转
])

# 应用变换
from PIL import Image
img = Image.open('cat.jpg')
img_tensor = transform(img)
print(img_tensor.shape)  # torch.Size([3, H, W])
```

### transforms.ToTensor：图像转张量

ToTensor将PIL Image或NumPy数组转换为PyTorch张量，并自动归一化到[0, 1]。

```python
from torchvision import transforms
from PIL import Image
import numpy as np

# 从PIL Image转换
img_pil = Image.open('cat.jpg')
print("PIL Image:", img_pil.mode, img_pil.size)

to_tensor = transforms.ToTensor()
tensor = to_tensor(img_pil)
print("Tensor:", tensor.shape, tensor.min(), tensor.max())
# 自动转换为 (C, H, W)，值在 [0, 1]

# 从NumPy数组转换
img_np = np.array(img_pil)
print("NumPy:", img_np.shape)
tensor_np = to_tensor(img_np)
print("Tensor from NumPy:", tensor_np.shape)

# 转换前后对比
print("\n=== 转换说明 ===")
# PIL Image (H, W, C) [0-255]
# NumPy   (H, W, C) [0-255]
# Tensor  (C, H, W) [0, 1]
```

### transforms.Normalize：标准化

Normalize使用均值和标准差对图像进行标准化。

**数学公式**：

```
normalized = (input - mean) / std
```

```python
# ImageNet常用均值和标准差
normalize = transforms.Normalize(
    mean=[0.485, 0.456, 0.406],  # RGB通道的均值
    std=[0.229, 0.224, 0.225]     # RGB通道的标准差
)

# 标准化流程
x = torch.rand(3, 224, 224)  # [0, 1]
x_normalized = normalize(x)

print("标准化前: min={:.3f}, max={:.3f}".format(x.min(), x.max()))
print("标准化后: min={:.3f}, max={:.3f}".format(x_normalized.min(), x_normalized.max()))
# 标准化后值通常在 [-2, 2] 范围内
```

**训练和测试使用相同的标准化**：

```python
# 定义标准化参数（ImageNet）
imagenet_mean = [0.485, 0.456, 0.406]
imagenet_std = [0.229, 0.224, 0.225]

# 训练变换
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=imagenet_mean, std=imagenet_std),
])

# 测试变换（验证集、测试集）
test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=imagenet_mean, std=imagenet_std),
])

# 使用变换
train_dataset = datasets.FashionMNIST(
    root='./data',
    train=True,
    transform=train_transform,
    download=True
)

test_dataset = datasets.FashionMNIST(
    root='./data',
    train=False,
    transform=test_transform,
    download=True
)
```

### transforms.Resize与transforms.CenterCrop

调整图像尺寸并裁剪。

```python
# Resize：调整图像大小
resize = transforms.Resize(size=(224, 224))  # 调整为指定尺寸
# 或者
resize = transforms.Resize(size=224)  # 短边调整为224，保持比例

# CenterCrop：中心裁剪
center_crop = transforms.CenterCrop(size=(224, 224))

# FiveCrop：四个角和中心裁剪（返回5个图像）
five_crop = transforms.FiveCrop(size=(224, 224))

# TenCrop：水平翻转后裁剪（返回10个图像）
ten_crop = transforms.TenCrop(size=(224, 224), vertical_flip=False)

# 组合使用
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
])
```

### transforms.RandomHorizontalFlip：随机水平翻转

随机水平翻转是数据增强中最常用、最有效的技术之一。

```python
# 随机水平翻转
hflip = transforms.RandomHorizontalFlip(p=0.5)  # p: 翻转概率

# 随机垂直翻转
vflip = transforms.RandomVerticalFlip(p=0.5)

# 实际应用
img = Image.open('cat.jpg')
flipped = hflip(img)
```

### transforms.RandomRotation：随机旋转

```python
# 随机旋转
rotation = transforms.RandomRotation(degrees=15)  # -15到15度之间随机旋转
rotation10 = transforms.RandomRotation(degrees=(10, 30))  # 10到30度之间随机旋转

# 随机旋转（包含填充）
rotation_fill = transforms.RandomRotation(
    degrees=30,
    fill=(255, 255, 255)  # 填充颜色
)
```

### transforms.ColorJitter：颜色抖动

```python
# 颜色抖动
color_jitter = transforms.ColorJitter(
    brightness=0.2,    # 亮度调整范围
    contrast=0.2,      # 对比度调整范围
    saturation=0.2,    # 饱和度调整范围
    hue=0.1           # 色调调整范围
)

# 单独使用
brightness = transforms.ColorJitter(brightness=0.3)
contrast = transforms.ColorJitter(contrast=0.3)
saturation = transforms.ColorJitter(saturation=0.3)
hue = transforms.ColorJitter(hue=0.1)
```

### transforms.RandomAffine：随机仿射变换

```python
# 随机仿射变换
affine = transforms.RandomAffine(
    degrees=15,              # 旋转角度
    translate=(0.1, 0.1),   # 平移范围（相对于尺寸的比例）
    scale=(0.9, 1.1),        # 缩放范围
    shear=15                # 剪切角度
)
```

### transforms.RandomErasing：随机擦除

RandomErasing（随机擦除）是一种有效的正则化技术，模拟遮挡。

```python
# 随机擦除
random_erase = transforms.RandomErasing(
    p=0.5,                  # 擦除概率
    scale=(0.02, 0.33),     # 擦除区域相对于图像的比例范围
    ratio=(0.3, 3.3),       # 擦除区域宽高比范围
    value=0                 # 擦除区域的值
)

# 在张量上应用
to_tensor = transforms.ToTensor()
img_tensor = to_tensor(img)
erased = random_erase(img_tensor)
```

### 综合数据增强示例

```python
# 完整的数据增强策略
train_transform = transforms.Compose([
    # 1. 随机大小裁剪并调整到224x224
    transforms.RandomResizedCrop(
        224,
        scale=(0.8, 1.0),    # 裁剪区域为原图的80%-100%
        ratio=(0.9, 1.1)     # 宽高比范围
    ),

    # 2. 随机水平翻转
    transforms.RandomHorizontalFlip(p=0.5),

    # 3. 随机旋转（-15到15度）
    transforms.RandomRotation(15),

    # 4. 颜色抖动
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
        hue=0.1
    ),

    # 5. 转换为张量
    transforms.ToTensor(),

    # 6. 标准化
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),

    # 7. 随机擦除
    transforms.RandomErasing(p=0.3),
])

# 测试变换
test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])
```

---


## torchvision.datasets：内置数据集

PyTorch提供了常用的图像数据集，可以直接下载使用。

```python
from torchvision import datasets, transforms

# Fashion-MNIST
fashion_train = datasets.FashionMNIST(
    root='./data',
    train=True,
    transform=transforms.ToTensor(),
    download=True
)

fashion_test = datasets.FashionMNIST(
    root='./data',
    train=False,
    transform=transforms.ToTensor(),
    download=True
)

# CIFAR-10
cifar10_train = datasets.CIFAR10(
    root='./data',
    train=True,
    transform=transforms.ToTensor(),
    download=True
)

cifar10_test = datasets.CIFAR10(
    root='./data',
    train=False,
    transform=transforms.ToTensor(),
    download=True
)

# ImageNet（需要手动下载）
# imagenet_train = datasets.ImageNet(
#     root='./data/imagenet',
#     split='train',
#     transform=transforms.ToTensor()
# )

# 查看数据集信息
print("Fashion-MNIST训练集:", len(fashion_train))
print("Fashion-MNIST测试集:", len(fashion_test))
print("CIFAR-10类别:", datasets.CIFAR10.classes)
```

**常用数据集速查**：

| 数据集 | 类别数 | 训练集大小 | 图像大小 | 说明 |
|--------|--------|-----------|----------|------|
| MNIST | 10 | 60,000 | 28x28 | 手写数字 |
| Fashion-MNIST | 10 | 60,000 | 28x28 | 服装分类 |
| CIFAR-10 | 10 | 50,000 | 32x32 | 通用物体 |
| CIFAR-100 | 100 | 50,000 | 32x32 | 100类物体 |
| ImageNet | 1000 | 1.2M | 可变 | 大规模图像 |

## Dataset类：自定义数据集

当需要加载自己的数据时，需要自定义Dataset类。

```python
from torch.utils.data import Dataset
from PIL import Image
import os

class CustomDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []

        # 读取数据目录
        for label_name in os.listdir(root_dir):
            label_path = os.path.join(root_dir, label_name)
            if os.path.isdir(label_path):
                for img_name in os.listdir(label_path):
                    if img_name.endswith(('.jpg', '.png', '.jpeg')):
                        self.image_paths.append(os.path.join(label_path, img_name))
                        self.labels.append(label_name)

        # 创建标签到索引的映射
        self.classes = sorted(list(set(self.labels)))
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        # 加载图像
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert('RGB')

        # 应用变换
        if self.transform:
            image = self.transform(image)

        # 获取标签
        label = self.labels[idx]
        label_idx = self.class_to_idx[label]

        return image, label_idx

# 使用自定义数据集
custom_dataset = CustomDataset(
    root_dir='./my_data/train',
    transform=train_transform
)

print("数据集大小:", len(custom_dataset))
print("类别:", custom_dataset.classes)
```

**处理文件夹结构**：

```
my_data/
├── train/
│   ├── cat/
│   │   ├── cat001.jpg
│   │   ├── cat002.jpg
│   │   └── ...
│   ├── dog/
│   │   ├── dog001.jpg
│   │   └── ...
│   └── ...
└── val/
    ├── cat/
    └── dog/
```

## DataLoader：批量数据加载

DataLoader是PyTorch中最重要的数据加载工具。

```python
from torch.utils.data import DataLoader

# 基础用法
train_loader = DataLoader(
    dataset=train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=4,
    pin_memory=True,
    drop_last=True
)

# 迭代数据
for batch_idx, (images, labels) in enumerate(train_loader):
    print("批次数:", batch_idx)
    print("图像形状:", images.shape)    # [32, 3, 224, 224]
    print("标签形状:", labels.shape)    # [32]
    break
```

**DataLoader参数详解**：

| 参数 | 说明 | 常用值 |
|------|------|--------|
| dataset | 数据集 | - |
| batch_size | 批大小 | 32, 64, 128 |
| shuffle | 是否打乱 | True(训练), False(测试) |
| num_workers | 数据加载进程数 | 4, 8 |
| pin_memory | 锁页内存，加快GPU传输 | True |
| drop_last | 丢弃最后一个不完整batch | True(训练), False(测试) |
| collate_fn | 自定义批处理函数 | 自定义 |

**多GPU数据加载**：

```python
# 多GPU时使用DistributedSampler
from torch.utils.data.distributed import DistributedSampler

train_sampler = DistributedSampler(
    dataset,
    num_replicas=num_gpus,
    rank=rank,
    shuffle=True
)

train_loader = DataLoader(
    dataset,
    batch_size=batch_size,
    sampler=train_sampler,
    num_workers=4,
    pin_memory=True
)
```

---


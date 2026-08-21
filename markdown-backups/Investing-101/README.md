# ⚠️ 备份目录，禁止构建

**日期：2026-08-21**

本目录是《投资入门：从一股股票到一套认知》**图文单页版**的内容备份。

- 现行版本：手写的图文单页科普书（Magazine 格式），位于 `Mav/knowledge/investing-101/index.html`。
- 本目录的 9 个 md 源稿经过客观口吻改写后**留在原位，仅作内容备份**，不参与任何构建管线。
- 旧的 `chapters/` 分章产物与 `assets/script.js`、`assets/search-index.json` 已于 2026-08-21 删除。

## 禁止执行以下命令

```bash
node build.js --book Investing-101
node build.js Investing-101
node build.js --book Investing-101/*.md     # 任何会构建本书的命令都算
node build.js --force --book Investing-101  # 即使加 --force 也一样
```

**原因**：`md2HTML/build.js` 的 buildBook 会**无条件重写** `Mav/knowledge/investing-101/index.html`，`build-lock.yaml` 锁机制对整书构建防不住——一旦运行，手写单页即被覆盖，且无法从本仓库恢复。

## 如未来需要恢复教材版

先确认手写图文单页版（`Mav/knowledge/investing-101/` 整个目录）已**另行备份到仓库之外**，再考虑运行构建。否则不要动这个目录。

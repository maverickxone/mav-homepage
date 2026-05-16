#!/usr/bin/env node
// Quick script to convert BUILD-JOURNEY-0516.md into a standalone HTML page
'use strict';

const fs = require('fs');
const path = require('path');
const MD2HTML_DIR = path.join(__dirname, '..', '..', 'md2HTML');
const { marked } = require(path.join(MD2HTML_DIR, 'node_modules', 'marked'));

const md = fs.readFileSync(path.join(__dirname, 'BUILD-JOURNEY-0516.md'), 'utf-8');
const html = marked.parse(md);

const page = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>个人主页搭建历程 — Mav</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/style.css">
</head>
<body>

<nav class="topnav">
  <div class="topnav-inner">
    <a class="brand" href="../index.html">← Mav</a>
    <div class="nav-links">
      <a href="../about/index.html">关于我</a>
      <a href="../knowledge/index.html">知识库</a>
      <a href="../blog/index.html" class="active">博客</a>
    </div>
  </div>
</nav>

<main class="page-wrap">
${html}
<p style="margin-top: var(--space-7);"><a href="index.html" style="display: inline-block; padding-top: var(--space-5); border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; color: var(--muted);">← 返回博客列表</a></p>
</main>

<footer>
  <div class="footer-inner">
    <span>Mav · 2026</span>
    <span>Built with Claude and curiosity.</span>
  </div>
</footer>

<script src="../assets/script.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'build-journey.html'), page, 'utf-8');
console.log('✓ build-journey.html generated');

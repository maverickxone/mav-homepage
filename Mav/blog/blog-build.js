#!/usr/bin/env node
// ============================================================
// Blog Builder — converts posts/*.md into HTML blog pages
// 2026-07：博客列表已并入时间线（Mav/timeline/index.html，手写维护）。
// 本脚本只生成文章详情页，不再改写 blog/index.html 和主页「最近动态」。
// 发新长文后，记得在时间线里手动加一条指向它。
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');

// Use dependencies from md2HTML's node_modules
const MD2HTML_DIR = path.join(__dirname, '..', '..', 'md2HTML');
const matter = require(path.join(MD2HTML_DIR, 'node_modules', 'gray-matter'));
const { marked } = require(path.join(MD2HTML_DIR, 'node_modules', 'marked'));

const BLOG_DIR = __dirname;
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const HTML_DIR = path.join(BLOG_DIR, 'html');
const MAV_DIR = path.join(BLOG_DIR, '..');

// ============================================================
// 1. Read all posts
// ============================================================
function readPosts() {
  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('BUILD-'))
    .sort()
    .reverse(); // newest first

  return files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const slug = file.replace('.md', '');
    const html = marked.parse(content);
    return { slug, frontmatter: data, html, file };
  });
}

// ============================================================
// 2. Generate individual blog post HTML
// ============================================================
function generatePostHTML(post) {
  const { slug, frontmatter, html } = post;
  const date = frontmatter.date ? new Date(frontmatter.date).toISOString().slice(0, 10).replace(/-/g, '.') : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${frontmatter.title} — Mav's Blog</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/style.css">
</head>
<body>

<nav class="topnav">
  <div class="topnav-inner">
    <a class="brand" href="../../index.html">← Mav</a>
    <div class="nav-links">
      <a href="../../about/index.html">关于我</a>
      <a href="../../knowledge/index.html">知识库</a>
      <a href="../../timeline/index.html" class="active">时间线</a>
    </div>
  </div>
</nav>

<main class="page-wrap">

  <p style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase; margin-bottom: var(--space-3);">${date}</p>

  <h1>${frontmatter.title}</h1>

  ${html}

  <p style="margin-top: var(--space-7);"><a href="../../timeline/index.html" style="display: inline-block; padding-top: var(--space-5); border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; color: var(--muted); transition: color 0.15s ease;">← 返回时间线</a></p>

</main>

<footer>
  <div class="footer-inner">
    <span>Mav · 2026</span>
    <span>Built with Claude and curiosity.</span>
  </div>
</footer>

<script src="../../assets/script.js"></script>
</body>
</html>`;
}

// ============================================================
// 3. Main
//（原先的 generateBlogIndex / updateMainPageRecent 已随时间线上线移除：
//  blog/index.html 现在是手写的迁移提示页，主页「最近动态」手写维护）
// ============================================================
function build() {
  console.log('📝 Blog Builder\n');

  if (!fs.existsSync(POSTS_DIR)) {
    console.log('  No posts/ directory found. Creating it...');
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    console.log('  Created posts/ — add .md files there and run again.');
    return;
  }

  const posts = readPosts();
  console.log(`  Found ${posts.length} post(s):\n`);

  // Ensure html output directory exists
  if (!fs.existsSync(HTML_DIR)) {
    fs.mkdirSync(HTML_DIR, { recursive: true });
  }

  // Generate individual post pages
  posts.forEach(post => {
    const html = generatePostHTML(post);
    const outPath = path.join(HTML_DIR, `${post.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`    ✓ html/${post.slug}.html`);
  });

  // Build BUILD-JOURNEY-0516.md as standalone page
  const journeyPath = path.join(POSTS_DIR, 'BUILD-JOURNEY-0516.md');
  if (fs.existsSync(journeyPath)) {
    const journeyMd = fs.readFileSync(journeyPath, 'utf-8');
    const journeyHtml = marked.parse(journeyMd);
    const journeyPage = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>个人主页搭建历程 — Mav</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/style.css">
</head>
<body>
<nav class="topnav">
  <div class="topnav-inner">
    <a class="brand" href="../../index.html">← Mav</a>
    <div class="nav-links">
      <a href="../../about/index.html">关于我</a>
      <a href="../../knowledge/index.html">知识库</a>
      <a href="../../timeline/index.html" class="active">时间线</a>
    </div>
  </div>
</nav>
<main class="page-wrap">
${journeyHtml}
<p style="margin-top: var(--space-7);"><a href="../../timeline/index.html" style="display: inline-block; padding-top: var(--space-5); border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; color: var(--muted);">← 返回时间线</a></p>
</main>
<footer>
  <div class="footer-inner">
    <span>Mav · 2026</span>
    <span>Built with Claude and curiosity.</span>
  </div>
</footer>
<script src="../../assets/script.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(HTML_DIR, 'build-journey.html'), journeyPage, 'utf-8');
    console.log('  ✓ html/build-journey.html (standalone journey page)');
  }

  console.log('\n✅ Blog build complete!\n');
}

build();

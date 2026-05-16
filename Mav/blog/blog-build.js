#!/usr/bin/env node
// ============================================================
// Blog Builder — converts posts/*.md into HTML blog pages
// Also updates blog/index.html and main page "recent" section
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
const MAIN_INDEX = path.join(MAV_DIR, 'index.html');

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
      <a href="../index.html" class="active">博客</a>
    </div>
  </div>
</nav>

<main class="page-wrap">

  <p style="font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase; margin-bottom: var(--space-3);">${date}</p>

  <h1>${frontmatter.title}</h1>

  ${html}

  <p style="margin-top: var(--space-7);"><a href="../index.html" style="display: inline-block; padding-top: var(--space-5); border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; color: var(--muted); transition: color 0.15s ease;">← 返回博客列表</a></p>

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
// 3. Generate blog index.html
// ============================================================
function generateBlogIndex(posts) {
  const listItems = posts.map(post => {
    const date = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString().slice(0, 10).replace(/-/g, '.') : '';
    return `    <li>
      <a href="html/${post.slug}.html">
        <span class="blog-date">${date}</span>
        <span class="blog-title">${post.frontmatter.title}</span>
      </a>
    </li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>博客 — Mav</title>
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

  <h1>博客</h1>

  <p>
    不定期的想法、感想、踩坑记录。
  </p>

  <ul class="blog-list">
${listItems}
  </ul>

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
}

// ============================================================
// 4. Update main page "recent" section
// ============================================================
function updateMainPageRecent(posts) {
  if (!fs.existsSync(MAIN_INDEX)) {
    console.log('  ⚠ Main index.html not found, skipping recent update');
    return;
  }

  let mainHTML = fs.readFileSync(MAIN_INDEX, 'utf-8');

  // Take the 3 most recent posts for the "recent" list
  const recentItems = posts.slice(0, 3).map(post => {
    const date = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString().slice(0, 7).replace('-', '.') : '2026.05';
    return `      <li>
        <span class="date">${date}</span>
        <span class="title">${post.frontmatter.title}</span>
        <a href="blog/html/${post.slug}.html" class="link">阅读 →</a>
      </li>`;
  }).join('\n');

  // Add a static "搭建个人主页" entry at the end
  const staticEntry = `      <li>
        <span class="date">2026.05</span>
        <span class="title">搭建个人主页</span>
        <span class="link dim">就是这里</span>
      </li>`;

  const fullList = recentItems + '\n' + staticEntry;

  // Replace the content between <ul class="recent-list"> and </ul>
  const regex = /(<ul class="recent-list">)\s*[\s\S]*?(\s*<\/ul>)/;
  if (regex.test(mainHTML)) {
    mainHTML = mainHTML.replace(regex, `$1\n${fullList}\n    $2`);
    fs.writeFileSync(MAIN_INDEX, mainHTML, 'utf-8');
    console.log('  ✓ Updated main page "recent" section');
  } else {
    console.log('  ⚠ Could not find recent-list in main index.html');
  }
}

// ============================================================
// 5. Main
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

  // Generate blog index
  const indexHTML = generateBlogIndex(posts);
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHTML, 'utf-8');
  console.log(`\n  ✓ blog/index.html (${posts.length} entries)`);

  // Update main page recent section
  updateMainPageRecent(posts);

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
      <a href="../index.html" class="active">博客</a>
    </div>
  </div>
</nav>
<main class="page-wrap">
${journeyHtml}
<p style="margin-top: var(--space-7);"><a href="../index.html" style="display: inline-block; padding-top: var(--space-5); border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12px; letter-spacing: 0.06em; color: var(--muted);">← 返回博客列表</a></p>
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

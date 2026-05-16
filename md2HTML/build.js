#!/usr/bin/env node
// ============================================================
// md2HTML — Static Site Generator
// Converts Markdown chapters into a beautiful documentation site
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');
const { marked } = require('marked');

// ============================================================
// Configuration
// ============================================================
const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const ASSETS_DIR = path.join(ROOT, 'assets');
const DIST_DIR = path.join(ROOT, 'dist');

// ============================================================
// 1. Read book metadata from book.yaml
// ============================================================
function readBookConfig() {
  const configPath = path.join(CONTENT_DIR, 'book.yaml');
  if (!fs.existsSync(configPath)) {
    console.error('Error: content/book.yaml not found');
    process.exit(1);
  }
  const raw = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(raw);
}

// ============================================================
// 2. Read and parse all markdown chapter files
// ============================================================
function readChapters() {
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  return files.map(file => {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    return {
      file,
      slug: file.replace('.md', ''),
      frontmatter,
      content
    };
  }).sort((a, b) => (a.frontmatter.chapter || 0) - (b.frontmatter.chapter || 0));
}

// ============================================================
// 3. Custom Marked renderer for extended syntax
// ============================================================
function createRenderer() {
  const renderer = new marked.Renderer();

  // Custom heading with auto-generated IDs and data-num attribute
  renderer.heading = function(text, level, raw) {
    // Handle {#custom-id} syntax
    let id = '';
    let cleanText = text;
    const idMatch = text.match(/\s*\{#([^}]+)\}\s*$/);
    if (idMatch) {
      id = idMatch[1];
      cleanText = text.replace(/\s*\{#([^}]+)\}\s*$/, '');
    } else {
      id = cleanText
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    if (level === 2) {
      return `<h2 id="${id}">${cleanText}</h2>\n`;
    }
    if (level === 3) {
      return `<h3 id="${id}">${cleanText}</h3>\n`;
    }
    return `<h${level} id="${id}">${cleanText}</h${level}>\n`;
  };

  // Code blocks with language labels
  renderer.code = function(code, lang) {
    const langLabel = lang || '';
    const dataLabel = langLabel ? ` data-label="${langLabel}"` : '';
    const langClass = langLabel ? ` class="language-${langLabel}"` : '';
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre${dataLabel}><code${langClass}>${escaped}</code></pre>\n`;
  };

  // Tables wrapped in .table-wrap
  renderer.table = function(header, body) {
    return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
  };

  // Blockquotes
  renderer.blockquote = function(quote) {
    return `<blockquote>${quote}</blockquote>\n`;
  };

  return renderer;
}

// ============================================================
// 4. Pre-process extended markdown syntax
//    Handles :::callout, :::tabs, :::collapsible
// ============================================================
let _collapseCounter = 0;
function preprocessExtendedSyntax(markdown) {
  // Normalize line endings to \n for consistent regex matching
  let result = markdown.replace(/\r\n/g, '\n');

  // Process :::collapsible blocks
  result = result.replace(
    /^:::collapsible\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      const slug = title.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
      const id = 'collapse-' + (slug || (++_collapseCounter));
      return `<div class="collapsible">
<button class="collapsible-trigger" aria-expanded="false" aria-controls="${id}">
  <span>${title.trim()}</span>
  <svg class="collapsible-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>
</button>
<div class="collapsible-content" id="${id}" hidden>
  <div class="collapsible-inner">

${content.trim()}

  </div>
</div>
</div>`;
    }
  );

  // Process :::tabs blocks
  result = result.replace(
    /^:::tabs\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, tabNames, content) => {
      const tabs = tabNames.split('|').map(t => t.trim());
      const tabId = 'tabs-' + tabs[0].toLowerCase().replace(/[^\w]+/g, '-');

      // Split content by ::tab markers
      const tabContents = [];
      const parts = content.split(/^::tab\s+(.+)$/gm);
      // parts[0] is before first ::tab (usually empty)
      // parts[1] = tab name, parts[2] = content, parts[3] = tab name, etc.
      for (let i = 1; i < parts.length; i += 2) {
        tabContents.push({
          name: parts[i].trim(),
          content: (parts[i + 1] || '').trim()
        });
      }

      // Build tab list
      let tabList = `<div class="tabs"><div class="tabs-list" role="tablist">`;
      tabs.forEach((tab, i) => {
        const panelId = `${tabId}-panel-${i}`;
        const tabBtnId = `${tabId}-tab-${i}`;
        tabList += `<button role="tab" id="${tabBtnId}" aria-controls="${panelId}" aria-selected="${i === 0 ? 'true' : 'false'}" ${i !== 0 ? 'tabindex="-1"' : ''}>${tab}</button>`;
      });
      tabList += `</div>`;

      // Build tab panels
      tabs.forEach((tab, i) => {
        const panelId = `${tabId}-panel-${i}`;
        const tabBtnId = `${tabId}-tab-${i}`;
        const panelContent = tabContents[i] ? tabContents[i].content : '';
        tabList += `<div role="tabpanel" id="${panelId}" aria-labelledby="${tabBtnId}"${i !== 0 ? ' hidden' : ''}>\n\n${panelContent}\n\n</div>`;
      });

      tabList += `</div>`;
      return tabList;
    }
  );

  // Process :::callout-tip blocks
  result = result.replace(
    /^:::callout-tip\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      return `<div class="callout callout-tip">
<p class="callout-title">${title.trim()}</p>

${content.trim()}

</div>`;
    }
  );

  // Process :::callout-warn blocks
  result = result.replace(
    /^:::callout-warn\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      return `<div class="callout callout-warn">
<p class="callout-title">${title.trim()}</p>

${content.trim()}

</div>`;
    }
  );

  // Process :::callout blocks (generic)
  result = result.replace(
    /^:::callout\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      return `<div class="callout">
<p class="callout-title">${title.trim()}</p>

${content.trim()}

</div>`;
    }
  );

  return result;
}

// ============================================================
// 5. Extract headings for sidebar TOC
// ============================================================
function extractHeadings(html) {
  const headings = [];
  const regex = /<h([23])\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/h[23]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, '').trim()
    });
  }
  return headings;
}

// ============================================================
// 6. Generate HTML components
// ============================================================

// Navigation bar
function generateNav(book, chapters, activeSlug) {
  const links = chapters.map(ch => {
    const num = String(ch.frontmatter.chapter || '').padStart(2, '0');
    const isActive = ch.slug === activeSlug ? ' class="active"' : '';
    return `      <a href="${ch.slug}.html"${isActive}>${num}</a>`;
  }).join('\n');

  return `<nav class="topnav" id="topnav">
  <div class="topnav-inner">
    <a class="brand" href="../index.html">${book.title}</a>
    <div class="nav-links">
${links}
    </div>
    <div class="nav-controls">
      <button class="nav-btn" id="search-btn" aria-label="搜索 (Ctrl+K)">⌘K</button>
      <button class="nav-btn" id="settings-btn" aria-label="阅读设置">Aa</button>
      <a class="nav-btn" href="../../index.html" aria-label="返回知识库">← 知识库</a>
    </div>
  </div>
</nav>`;
}

// Index page navigation
function generateIndexNav(book, chapters) {
  const links = chapters.map(ch => {
    const num = String(ch.frontmatter.chapter || '').padStart(2, '0');
    return `      <a href="chapters/${ch.slug}.html">${num}</a>`;
  }).join('\n');

  return `<nav class="topnav" id="topnav">
  <div class="topnav-inner">
    <a class="brand" href="index.html">${book.title}</a>
    <div class="nav-links">
${links}
    </div>
    <div class="nav-controls">
      <button class="nav-btn" id="search-btn" aria-label="搜索 (Ctrl+K)">⌘K</button>
      <button class="nav-btn" id="settings-btn" aria-label="阅读设置">Aa</button>
      <a class="nav-btn" href="../index.html" aria-label="返回知识库">← 知识库</a>
    </div>
  </div>
</nav>`;
}

// Sidebar TOC
function generateSidebar(chapter, headings) {
  const num = String(chapter.frontmatter.chapter || '').padStart(2, '0');
  const title = chapter.frontmatter.title || 'Untitled';

  const items = headings
    .filter(h => h.level === 2)
    .map(h => `    <li><a href="#${h.id}">${h.text}</a></li>`)
    .join('\n');

  return `<aside class="sidebar">
  <div class="chapter-num">CHAPTER ${num}</div>
  <div class="chapter-name">${title}</div>
  <h4>目录</h4>
  <ul>
${items}
  </ul>
</aside>`;
}

// Chapter header
function generateChapterHead(chapter) {
  const num = String(chapter.frontmatter.chapter || '').padStart(2, '0');
  const title = chapter.frontmatter.title || 'Untitled';
  const readTime = chapter.frontmatter.readTime || '10';

  return `<header class="chapter-head">
  <div class="chapter-head-meta">
    <span class="num">CHAPTER ${num}</span>
    <span>≈ ${readTime} MIN READ</span>
  </div>
  <h1>${title}</h1>
</header>`;
}

// Pager (prev/next navigation)
function generatePager(chapters, currentIndex) {
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  let html = '<nav class="pager">';

  if (prev) {
    html += `  <a href="${prev.slug}.html">
    <span class="label">← 上一章</span>
    <span class="title">${prev.frontmatter.title}</span>
  </a>`;
  } else {
    html += `  <a class="disabled"><span class="label">← 上一章</span><span class="title"></span></a>`;
  }

  if (next) {
    html += `  <a href="${next.slug}.html" class="next">
    <span class="label">下一章 →</span>
    <span class="title">${next.frontmatter.title}</span>
  </a>`;
  } else {
    html += `  <a class="disabled next"><span class="label">下一章 →</span><span class="title"></span></a>`;
  }

  html += '</nav>';
  return html;
}

// Settings popover
function generateSettingsPop() {
  return `<div class="settings-pop" id="settings-pop">
  <h5>主题</h5>
  <div class="row">
    <button class="seg" data-theme-set="light">明亮</button>
    <button class="seg" data-theme-set="dark">暗色</button>
  </div>
  <h5>字号</h5>
  <div class="row">
    <button class="seg" data-size-set="s">小</button>
    <button class="seg" data-size-set="m">中</button>
    <button class="seg" data-size-set="l">大</button>
  </div>
</div>`;
}

// Footer
function generateFooter(book) {
  return `<footer>
  <div class="set">
    <span>${book.title.toUpperCase()}</span>
    <span>${new Date().getFullYear()} · ${book.language || 'ZH-CN'}</span>
  </div>
  <div class="set">
    <span>${book.author || ''}</span>
  </div>
</footer>`;
}

// Search overlay
function generateSearchOverlay() {
  return `<div class="search-backdrop" id="search-overlay" role="dialog" aria-modal="true" aria-label="搜索" hidden>
  <div class="search-modal">
    <div class="search-input-wrap">
      <input type="search" class="search-input" placeholder="搜索内容..." aria-label="搜索内容" autocomplete="off">
      <kbd>ESC</kbd>
    </div>
    <div class="search-results" role="listbox" aria-label="搜索结果"></div>
  </div>
</div>`;
}

// Chapter grid for index page
function generateChaptersGrid(chapters) {
  const cards = chapters.map(ch => {
    const num = String(ch.frontmatter.chapter || '').padStart(2, '0');
    const title = ch.frontmatter.title || 'Untitled';
    const desc = ch.frontmatter.description || '';
    const readTime = ch.frontmatter.readTime || '10';

    return `      <a class="toc-card" href="chapters/${ch.slug}.html">
        <div class="num"><strong>${num}</strong><span>CH. ${num}</span></div>
        <div>
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>
        <div class="read"><span>开始阅读</span><span>→</span></div>
      </a>`;
  }).join('\n');

  return `<div class="toc-grid">\n${cards}\n</div>`;
}

// ============================================================
// 7. Build search index
// ============================================================
function buildSearchIndex(chapters) {
  const documents = [];

  chapters.forEach(ch => {
    const headings = extractHeadings(ch.html);
    const num = String(ch.frontmatter.chapter || '').padStart(2, '0');

    // Add chapter as a document
    documents.push({
      id: ch.slug,
      title: ch.frontmatter.title || 'Untitled',
      chapter: num,
      chapterTitle: ch.frontmatter.title,
      url: `chapters/${ch.slug}.html`,
      body: ch.content.replace(/[#*`\[\](){}|>_~-]/g, ' ').substring(0, 2000)
    });

    // Add each heading as a document
    headings.forEach(h => {
      documents.push({
        id: `${ch.slug}-${h.id}`,
        title: h.text,
        chapter: num,
        chapterTitle: ch.frontmatter.title,
        url: `chapters/${ch.slug}.html#${h.id}`,
        body: ''
      });
    });
  });

  return { documents };
}

// ============================================================
// 8. Main build process
// ============================================================
function build() {
  console.log('📖 md2HTML — Building static site...\n');

  // Read config
  const book = readBookConfig();
  console.log(`  Book: ${book.title}`);
  console.log(`  Author: ${book.author || 'Unknown'}\n`);

  // Read chapters
  const chapters = readChapters();
  console.log(`  Found ${chapters.length} chapter(s):\n`);

  // Configure marked
  marked.setOptions({
    renderer: createRenderer(),
    gfm: true,
    breaks: false
  });

  // Process each chapter
  chapters.forEach(ch => {
    // Pre-process extended syntax
    const preprocessed = preprocessExtendedSyntax(ch.content);
    // Convert to HTML
    ch.html = marked.parse(preprocessed);
    ch.headings = extractHeadings(ch.html);
    console.log(`    ✓ ${ch.slug} — "${ch.frontmatter.title}" (${ch.headings.length} sections)`);
  });

  // Read templates
  const chapterTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'chapter.html'), 'utf-8');
  const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf-8');

  // Create dist directories
  fs.mkdirSync(path.join(DIST_DIR, 'chapters'), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'assets'), { recursive: true });

  // Build chapter pages
  console.log('\n  Building chapter pages...');
  chapters.forEach((ch, index) => {
    const nav = generateNav(book, chapters, ch.slug);
    const sidebar = generateSidebar(ch, ch.headings);
    const chapterHead = generateChapterHead(ch);
    const pager = generatePager(chapters, index);
    const settingsPop = generateSettingsPop();
    const footer = generateFooter(book);
    const searchOverlay = generateSearchOverlay();

    let html = chapterTemplate
      .replace(/\{\{book_title\}\}/g, book.title)
      .replace(/\{\{chapter_title\}\}/g, ch.frontmatter.title || 'Untitled')
      .replace('{{nav}}', nav)
      .replace('{{settings_pop}}', settingsPop)
      .replace('{{sidebar}}', sidebar)
      .replace('{{chapter_head}}', chapterHead)
      .replace('{{content}}', ch.html)
      .replace('{{pager}}', pager)
      .replace('{{footer}}', footer)
      .replace('{{search_overlay}}', searchOverlay);

    const outPath = path.join(DIST_DIR, 'chapters', `${ch.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`    ✓ dist/chapters/${ch.slug}.html`);
  });

  // Build index page
  console.log('\n  Building index page...');
  const indexNav = generateIndexNav(book, chapters);
  const chaptersGrid = generateChaptersGrid(chapters);
  const indexSettingsPop = generateSettingsPop();
  const indexFooter = generateFooter(book);
  const indexSearchOverlay = generateSearchOverlay();

  let indexHtml = indexTemplate
    .replace(/\{\{title\}\}/g, book.title)
    .replace(/\{\{description\}\}/g, book.description || '')
    .replace(/\{\{author\}\}/g, book.author || '')
    .replace('{{nav}}', indexNav)
    .replace('{{settings_pop}}', indexSettingsPop)
    .replace('{{chapters_grid}}', chaptersGrid)
    .replace('{{footer}}', indexFooter)
    .replace('{{search_overlay}}', indexSearchOverlay);

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml, 'utf-8');
  console.log('    ✓ dist/index.html');

  // Copy assets
  console.log('\n  Copying assets...');
  const assetFiles = fs.readdirSync(ASSETS_DIR);
  assetFiles.forEach(file => {
    const src = path.join(ASSETS_DIR, file);
    const dest = path.join(DIST_DIR, 'assets', file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      console.log(`    ✓ dist/assets/${file}`);
    }
  });

  // Build search index
  console.log('\n  Building search index...');
  const searchIndex = buildSearchIndex(chapters);
  fs.writeFileSync(
    path.join(DIST_DIR, 'assets', 'search-index.json'),
    JSON.stringify(searchIndex, null, 2),
    'utf-8'
  );
  console.log('    ✓ dist/assets/search-index.json');

  console.log('\n✅ Build complete! Open dist/index.html in your browser.\n');
}

// Run
build();

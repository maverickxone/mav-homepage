'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

/**
 * Read a template file.
 */
function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');
}

/**
 * Generate top navigation bar for chapter pages.
 */
function generateNav(book, chaptersMeta, activeSlug) {
  const links = chaptersMeta.map(ch => {
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
      <a class="nav-btn" href="https://github.com/maverickxone/mav-homepage" target="_blank" rel="noopener" aria-label="GitHub" style="padding: 6px 8px;"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg></a>
    </div>
  </div>
</nav>`;
}

/**
 * Generate top navigation bar for index page.
 */
function generateIndexNav(book, chaptersMeta) {
  const links = chaptersMeta.map(ch => {
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
      <a class="nav-btn" href="https://github.com/maverickxone/mav-homepage" target="_blank" rel="noopener" aria-label="GitHub" style="padding: 6px 8px;"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg></a>
    </div>
  </div>
</nav>`;
}

/**
 * Generate sidebar TOC for a chapter.
 */
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

/**
 * Generate chapter header.
 */
function generateChapterHead(chapter) {
  const num = String(chapter.frontmatter.chapter || '').padStart(2, '0');
  const title = chapter.frontmatter.title || 'Untitled';
  const readTime = chapter.frontmatter.readTime || '10';
  const infoCutoff = chapter.frontmatter.infoCutoff
    ? `  <div class="chapter-info-cutoff">${chapter.frontmatter.infoCutoff}</div>\n`
    : '';

  return `<header class="chapter-head">
  <div class="chapter-head-meta">
    <span class="num">CHAPTER ${num}</span>
    <span>≈ ${readTime} MIN READ</span>
  </div>
  <h1>${title}</h1>
${infoCutoff}
</header>`;
}

/**
 * Generate prev/next pager navigation.
 */
function generatePager(chaptersMeta, currentIndex) {
  const prev = currentIndex > 0 ? chaptersMeta[currentIndex - 1] : null;
  const next = currentIndex < chaptersMeta.length - 1 ? chaptersMeta[currentIndex + 1] : null;

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

/**
 * Generate settings popover.
 */
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

/**
 * Generate footer.
 */
function generateFooter(book) {
  return `<footer>
  <div class="set">
    <span>${book.title}</span>
    <span>${new Date().getFullYear()} · ${book.language || 'ZH-CN'}</span>
  </div>
  <div class="set">
    <span>${book.author || ''}</span>
  </div>
</footer>`;
}

/**
 * Generate search overlay.
 */
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

/**
 * Generate chapter cards grid for index page.
 */
function generateChaptersGrid(chaptersMeta) {
  const cards = chaptersMeta.map(ch => {
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

/**
 * Build a complete chapter HTML page.
 */
function buildChapterPage(book, chapter, chaptersMeta, currentIndex, headings, contentHtml) {
  const template = readTemplate('chapter.html');

  const nav = generateNav(book, chaptersMeta, chapter.slug);
  const sidebar = generateSidebar(chapter, headings);
  const chapterHead = generateChapterHead(chapter);
  const pager = generatePager(chaptersMeta, currentIndex);
  const settingsPop = generateSettingsPop();
  const footer = generateFooter(book);
  const searchOverlay = generateSearchOverlay();

  return template
    .replace(/\{\{book_title\}\}/g, book.title)
    .replace(/\{\{chapter_title\}\}/g, chapter.frontmatter.title || 'Untitled')
    .replace('{{nav}}', nav)
    .replace('{{settings_pop}}', settingsPop)
    .replace('{{sidebar}}', sidebar)
    .replace('{{chapter_head}}', chapterHead)
    .replace('{{content}}', contentHtml)
    .replace('{{pager}}', pager)
    .replace('{{footer}}', footer)
    .replace('{{search_overlay}}', searchOverlay);
}

/**
 * Build the index (cover) HTML page.
 */
function buildIndexPage(book, chaptersMeta) {
  const template = readTemplate('index.html');

  const nav = generateIndexNav(book, chaptersMeta);
  const chaptersGrid = generateChaptersGrid(chaptersMeta);
  const settingsPop = generateSettingsPop();
  const footer = generateFooter(book);
  const searchOverlay = generateSearchOverlay();

  return template
    .replace(/\{\{title\}\}/g, book.title)
    .replace(/\{\{description\}\}/g, book.description || '')
    .replace(/\{\{author\}\}/g, book.author || '')
    .replace('{{nav}}', nav)
    .replace('{{settings_pop}}', settingsPop)
    .replace('{{chapters_grid}}', chaptersGrid)
    .replace('{{footer}}', footer)
    .replace('{{search_overlay}}', searchOverlay);
}

/**
 * Copy assets to output directory.
 */
function copyAssets(outputDir, slug) {
  const assetsOut = path.join(outputDir, 'assets');
  fs.mkdirSync(assetsOut, { recursive: true });

  const lock = require('./lock');
  const files = fs.readdirSync(ASSETS_DIR);
  files.forEach(file => {
    const src = path.join(ASSETS_DIR, file);
    if (fs.statSync(src).isFile()) {
      const lockPath = slug ? `${slug}/assets/${file}` : file;
      if (lock.isLocked(lockPath)) {
        return; // skip locked assets
      }
      fs.copyFileSync(src, path.join(assetsOut, file));
    }
  });
}

/**
 * Build search index JSON.
 */
function buildSearchIndex(chapters) {
  const documents = [];

  chapters.forEach(ch => {
    const num = String(ch.frontmatter.chapter || '').padStart(2, '0');

    documents.push({
      id: ch.slug,
      title: ch.frontmatter.title || 'Untitled',
      chapter: num,
      chapterTitle: ch.frontmatter.title,
      url: `chapters/${ch.slug}.html`,
      body: (ch.content || '').replace(/[#*`\[\](){}|>_~-]/g, ' ').substring(0, 2000)
    });

    if (ch.headings) {
      ch.headings.forEach(h => {
        documents.push({
          id: `${ch.slug}-${h.id}`,
          title: h.text,
          chapter: num,
          chapterTitle: ch.frontmatter.title,
          url: `chapters/${ch.slug}.html#${h.id}`,
          body: ''
        });
      });
    }
  });

  return { documents };
}

module.exports = {
  buildChapterPage,
  buildIndexPage,
  copyAssets,
  buildSearchIndex,
  generateChaptersGrid
};

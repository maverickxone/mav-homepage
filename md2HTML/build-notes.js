#!/usr/bin/env node
// ============================================================
// build-notes.js — Notes (手记) pages generator
//
// Reads note .md files from markdown-backups/notes/
// Each note is a standalone short-form piece (1-2 sections).
//
// Generates:
//   1. Note pages        → Mav/knowledge/notes/<slug>.html
//   2. Notes index       → Mav/knowledge/notes/index.html
//   3. Search index      → Mav/knowledge/notes/assets/search-index.json
//   4. Knowledge index   → AUTO:NOTES section in Mav/knowledge/index.html
//
// Usage:
//   node build-notes.js                  Build all notes + index + assets
//   node build-notes.js <file.md>        Build single note (+ refresh index)
//   node build-notes.js --index          Rebuild index page only
//   node build-notes.js --force [...]    Ignore lock, force overwrite
//
// Lock paths (build-lock.yaml):
//   notes/<file.md>          Skip that note's HTML regeneration
//   notes/index.html         Skip index page regeneration
//   notes/assets/<filename>  Skip asset copy
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

const renderer = require('./lib/renderer');
const lock = require('./lib/lock');

// ============================================================
// Paths
// ============================================================
const ROOT = __dirname;
const NOTES_SRC = path.resolve(ROOT, '..', 'markdown-backups', 'notes');
const OUTPUT_BASE = path.resolve(ROOT, '..', 'Mav', 'knowledge', 'notes');
const KNOWLEDGE_INDEX = path.resolve(ROOT, '..', 'Mav', 'knowledge', 'index.html');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const ASSETS_DIR = path.join(ROOT, 'assets');
const NOTES_ASSETS_DIR = path.join(ROOT, 'notes-assets');

const NOTES_START = '<!-- AUTO:NOTES:START -->';
const NOTES_END = '<!-- AUTO:NOTES:END -->';
const PREVIEW_COUNT = 6; // notes shown on knowledge index tab

// ============================================================
// Helpers
// ============================================================

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');
}

function readConfig() {
  const configPath = path.join(NOTES_SRC, 'notes.yaml');
  if (!fs.existsSync(configPath)) {
    console.error(`Error: notes.yaml not found in ${NOTES_SRC}`);
    process.exit(1);
  }
  return yaml.load(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Read all note .md files, sorted by date descending (newest first).
 * @param {boolean} includeContent - Parse full markdown content
 */
function readNotes(includeContent = true) {
  if (!fs.existsSync(NOTES_SRC)) return [];

  const files = fs.readdirSync(NOTES_SRC).filter(f => f.endsWith('.md'));

  const notes = files.map(file => {
    const raw = fs.readFileSync(path.join(NOTES_SRC, file), 'utf-8');
    const { data: frontmatter, content } = matter(raw);
    return {
      file,
      slug: file.replace(/\.md$/, ''),
      frontmatter,
      content: includeContent ? content : undefined
    };
  });

  // Sort by date descending; missing dates go last
  notes.sort((a, b) => {
    const da = formatDate(a.frontmatter.date) || '0000-00-00';
    const db = formatDate(b.frontmatter.date) || '0000-00-00';
    return db.localeCompare(da);
  });

  return notes;
}

function formatDate(date) {
  if (!date) return '';
  // js-yaml parses YYYY-MM-DD as a Date at UTC midnight;
  // use UTC components to avoid off-by-one in any local timezone.
  if (date instanceof Date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return String(date);
}

function getTags(note) {
  const tags = note.frontmatter.tags;
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

function getAllTags(notes) {
  const tagSet = new Set();
  notes.forEach(note => getTags(note).forEach(t => tagSet.add(t)));
  return [...tagSet];
}

// ============================================================
// HTML Generation — Note page
// ============================================================

function generateNoteNav(config) {
  const title = config.title || '手记';
  return `<nav class="topnav" id="topnav">
  <div class="topnav-inner">
    <a class="brand" href="index.html">${escapeHtml(title)}</a>
    <div class="nav-links"></div>
    <div class="nav-controls">
      <button class="nav-btn" id="search-btn" aria-label="搜索 (Ctrl+K)">⌘K</button>
      <button class="nav-btn" id="settings-btn" aria-label="阅读设置">Aa</button>
      <a class="nav-btn" href="../index.html" aria-label="返回知识库">← 知识库</a>
    </div>
  </div>
</nav>`;
}

function generateNoteHead(note) {
  const title = note.frontmatter.title || note.slug;
  const date = formatDate(note.frontmatter.date);
  const readTime = note.frontmatter.readTime || '5';
  const tags = getTags(note);

  const tagsHtml = tags.length
    ? `  <div class="note-tags">\n${tags.map(t => `    <span class="note-tag">${escapeHtml(t)}</span>`).join('\n')}\n  </div>\n`
    : '';

  return `<header class="note-head">
  <div class="note-head-meta">
    <span class="num">NOTE</span>
    <span>${escapeHtml(date)}</span>
    <span>≈ ${escapeHtml(String(readTime))} MIN READ</span>
  </div>
  <h1>${escapeHtml(title)}</h1>
${tagsHtml}</header>`;
}

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

function generateFooter(config) {
  return `<footer>
  <div class="set">
    <span>${escapeHtml(config.title || '手记')}</span>
    <span>${new Date().getFullYear()} · ${escapeHtml(config.language || 'ZH-CN')}</span>
  </div>
  <div class="set">
    <span>${escapeHtml(config.author || '')}</span>
  </div>
</footer>`;
}

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

function buildNotePage(note, config) {
  const template = readTemplate('note.html');
  const html = renderer.renderMarkdown(note.content);

  return template
    .replace(/\{\{note_title\}\}/g, () => escapeHtml(note.frontmatter.title || note.slug))
    .replace('{{nav}}', () => generateNoteNav(config))
    .replace('{{settings_pop}}', () => generateSettingsPop())
    .replace('{{note_head}}', () => generateNoteHead(note))
    .replace('{{content}}', () => html)
    .replace('{{footer}}', () => generateFooter(config))
    .replace('{{search_overlay}}', () => generateSearchOverlay());
}

// ============================================================
// HTML Generation — Index page
// ============================================================

function buildNoteCard(note) {
  const title = note.frontmatter.title || note.slug;
  const desc = note.frontmatter.description || '';
  const date = formatDate(note.frontmatter.date);
  const readTime = note.frontmatter.readTime || '5';
  const tags = getTags(note);

  const tagsHtml = tags.length
    ? `\n      <div class="note-card-tags">${tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  return `    <a class="note-card" href="${escapeHtml(note.slug)}.html" data-tags="${escapeHtml(tags.join(','))}">
      <div class="note-card-side">
        <span class="note-card-date">${escapeHtml(date)}</span>
        <span class="note-card-time">${escapeHtml(String(readTime))} min</span>
      </div>
      <div class="note-card-main">
        <h3 class="note-card-title">${escapeHtml(title)}</h3>
        <p class="note-card-desc">${escapeHtml(desc)}</p>${tagsHtml}
      </div>
    </a>`;
}

function buildIndexPage(notes, config) {
  const template = readTemplate('notes-index.html');
  const allTags = getAllTags(notes);

  const pills = allTags
    .map(t => `    <button class="filter-pill" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
    .join('\n');

  const list = notes.map(buildNoteCard).join('\n');

  return template
    .replace(/\{\{title\}\}/g, () => escapeHtml(config.title || '手记'))
    .replace(/\{\{description\}\}/g, () => escapeHtml(config.description || ''))
    .replace(/\{\{note_count\}\}/g, () => String(notes.length))
    .replace('{{filter_pills}}', () => pills)
    .replace('{{notes_list}}', () => list)
    .replace('{{settings_pop}}', () => generateSettingsPop())
    .replace('{{footer}}', () => generateFooter(config))
    .replace('{{search_overlay}}', () => generateSearchOverlay());
}

// ============================================================
// Search index
// ============================================================

function buildSearchIndex(notes) {
  const documents = [];

  notes.forEach(note => {
    const title = note.frontmatter.title || note.slug;
    const date = formatDate(note.frontmatter.date);

    documents.push({
      id: note.slug,
      title,
      chapter: date,
      chapterTitle: title,
      url: `${note.slug}.html`,
      body: (note.content || '').replace(/[#*`\[\](){}|>_~-]/g, ' ').substring(0, 2000)
    });

    // Heading entries for finer-grained search
    if (note.content) {
      const html = renderer.renderMarkdown(note.content);
      const headings = renderer.extractHeadings(html);
      headings.forEach(h => {
        documents.push({
          id: `${note.slug}-${h.id}`,
          title: h.text,
          chapter: date,
          chapterTitle: title,
          url: `${note.slug}.html#${h.id}`,
          body: ''
        });
      });
    }
  });

  return { documents };
}

// ============================================================
// Assets
// ============================================================

function copyAssets(slug) {
  const assetsOut = path.join(OUTPUT_BASE, 'assets');
  fs.mkdirSync(assetsOut, { recursive: true });

  const sources = [ASSETS_DIR, NOTES_ASSETS_DIR];
  for (const sourceDir of sources) {
    if (!fs.existsSync(sourceDir)) continue;
    for (const file of fs.readdirSync(sourceDir)) {
      const src = path.join(sourceDir, file);
      if (!fs.statSync(src).isFile()) continue;
      const lockPath = `${slug}/assets/${file}`;
      if (lock.isLocked(lockPath)) {
        console.log(`    ⏭ assets/${file} (locked, skipping)`);
        continue;
      }
      fs.copyFileSync(src, path.join(assetsOut, file));
    }
  }
}

// ============================================================
// Knowledge index — AUTO:NOTES section
// ============================================================

function buildPreviewCard(note) {
  const title = note.frontmatter.title || note.slug;
  const desc = note.frontmatter.description || '';
  const date = formatDate(note.frontmatter.date);
  const tags = getTags(note);
  const tagStr = tags.length ? ` · ${tags.join(' / ')}` : '';

  return `        <a class="knowledge-card" href="notes/${escapeHtml(note.slug)}.html">
          <span class="tag">NOTE · ${escapeHtml(date)}${escapeHtml(tagStr)}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(desc)}</p>
        </a>`;
}

function updateKnowledgeIndex(notes) {
  if (!fs.existsSync(KNOWLEDGE_INDEX)) return;

  const indexHtml = fs.readFileSync(KNOWLEDGE_INDEX, 'utf-8');
  const eol = indexHtml.includes('\r\n') ? '\r\n' : '\n';
  const start = indexHtml.indexOf(NOTES_START);
  const end = indexHtml.indexOf(NOTES_END);

  if (start === -1 || end === -1 || end < start) {
    console.log('  ⚠ AUTO:NOTES markers not found in knowledge/index.html — skipping preview update.');
    return;
  }

  const previewNotes = notes.slice(0, PREVIEW_COUNT);
  const cards = previewNotes.map(buildPreviewCard).join('\n\n');
  const allLink = `        <a class="notes-all-link" href="notes/index.html">查看全部 ${notes.length} 篇手记 →</a>`;

  const replacement = `${NOTES_START}${eol}      <div class="knowledge-grid notes-grid">${eol}${cards}${eol}      </div>${eol}${eol}${allLink}${eol}      ${NOTES_END}`;
  const updated = indexHtml.slice(0, start) + replacement + indexHtml.slice(end + NOTES_END.length);
  fs.writeFileSync(KNOWLEDGE_INDEX, updated, 'utf-8');
}

// ============================================================
// Main
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const filtered = args.filter(a => a !== '--force');

  const config = readConfig();
  const slug = config.slug || 'notes';

  fs.mkdirSync(OUTPUT_BASE, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_BASE, 'assets'), { recursive: true });

  // ── Command: --index (rebuild index only) ──
  if (filtered[0] === '--index') {
    console.log('\n📋 Building notes index only...\n');
    const notes = readNotes(false);
    const indexHtml = buildIndexPage(notes, config);
    fs.writeFileSync(path.join(OUTPUT_BASE, 'index.html'), indexHtml, 'utf-8');
    console.log('  ✓ index.html');
    updateKnowledgeIndex(notes);
    console.log('  ✓ knowledge/index.html notes preview\n');
    return;
  }

  // ── Command: single note ──
  if (filtered[0] && filtered[0].endsWith('.md')) {
    const targetFile = filtered[0];
    const filePath = path.join(NOTES_SRC, targetFile);

    if (!fs.existsSync(filePath)) {
      console.error(`Error: ${targetFile} not found in ${NOTES_SRC}`);
      const available = fs.readdirSync(NOTES_SRC).filter(f => f.endsWith('.md'));
      console.log('Available notes:', available.join(', '));
      process.exit(1);
    }

    console.log(`\n📝 Building note: ${targetFile}\n`);

    const sourcePath = `notes/${targetFile}`;
    if (!force && lock.isLocked(sourcePath)) {
      console.log(`  ⏭ ${targetFile} is locked. Use --force to override.\n`);
      return;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);
    const note = { file: targetFile, slug: targetFile.replace(/\.md$/, ''), frontmatter, content };

    const page = buildNotePage(note, config);
    fs.writeFileSync(path.join(OUTPUT_BASE, `${note.slug}.html`), page, 'utf-8');
    console.log(`  ✓ ${note.slug}.html`);

    // Refresh index + search + preview (cheap operations)
    const allNotes = readNotes(true);
    const indexHtml = buildIndexPage(allNotes, config);
    fs.writeFileSync(path.join(OUTPUT_BASE, 'index.html'), indexHtml, 'utf-8');
    console.log('  ✓ index.html (refreshed)');

    const searchIndex = buildSearchIndex(allNotes);
    fs.writeFileSync(
      path.join(OUTPUT_BASE, 'assets', 'search-index.json'),
      JSON.stringify(searchIndex, null, 2),
      'utf-8'
    );
    console.log('  ✓ search-index.json');

    updateKnowledgeIndex(allNotes);
    console.log('  ✓ knowledge/index.html notes preview');
    console.log(`\n  Done! Output: ${OUTPUT_BASE}/${note.slug}.html\n`);
    return;
  }

  // ── Command: build all ──
  if (filtered.length > 0) {
    console.error(`Error: unknown argument '${filtered[0]}'.`);
    console.log('Usage: node build-notes.js [file.md | --index] [--force]');
    process.exit(1);
  }

  console.log('\n📝 Building all notes...\n');

  const notes = readNotes(true);
  if (notes.length === 0) {
    console.log('  No .md files found in markdown-backups/notes/');
    return;
  }

  let builtCount = 0;
  let skippedCount = 0;

  // Build each note page
  for (const note of notes) {
    const sourcePath = `notes/${note.file}`;
    if (!force && lock.isLocked(sourcePath)) {
      console.log(`  ⏭ ${note.file} (locked, skipping)`);
      skippedCount++;
      continue;
    }

    const page = buildNotePage(note, config);
    fs.writeFileSync(path.join(OUTPUT_BASE, `${note.slug}.html`), page, 'utf-8');
    console.log(`  ✓ ${note.slug}.html`);
    builtCount++;
  }

  // Build index
  const indexLockPath = 'notes/index.html';
  if (!force && lock.isLocked(indexLockPath)) {
    console.log('  ⏭ index.html (locked, skipping)');
  } else {
    const indexHtml = buildIndexPage(notes, config);
    fs.writeFileSync(path.join(OUTPUT_BASE, 'index.html'), indexHtml, 'utf-8');
    console.log('  ✓ index.html');
    builtCount++;
  }

  // Copy assets
  copyAssets(slug);
  console.log('  ✓ assets copied');

  // Build search index
  const searchIndex = buildSearchIndex(notes);
  fs.writeFileSync(
    path.join(OUTPUT_BASE, 'assets', 'search-index.json'),
    JSON.stringify(searchIndex, null, 2),
    'utf-8'
  );
  console.log('  ✓ search-index.json');

  // Update knowledge index preview
  updateKnowledgeIndex(notes);
  console.log('  ✓ knowledge/index.html notes preview');

  console.log(`\n  Done! Built: ${builtCount}, Skipped: ${skippedCount}`);
  console.log(`  Output: ${OUTPUT_BASE}/\n`);
}

main();

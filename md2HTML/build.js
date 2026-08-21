#!/usr/bin/env node
// ============================================================
// md2HTML — Static Site Generator (v3)
// Modular build with fine-grained control and lock support.
//
// Usage:
//   node build.js --book <Book-Name>                Build entire book
//   node build.js --book <Book-Name>/chapter.md     Build single book chapter
//   node build.js --series <Series-Name>            Build entire series
//   node build.js --series <Series-Name>/part/ch.md Build single series chapter
//   node build.js --lock <path>              Lock a file (skip in future builds)
//   node build.js --unlock <path>            Unlock a file
//   node build.js --list-lock                List all locked files
//   node build.js --force <...>              Force build, ignore lock
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');

const reader = require('./lib/reader');
const renderer = require('./lib/renderer');
const templates = require('./lib/templates');
const lock = require('./lib/lock');

// ============================================================
// Paths
// ============================================================
const ROOT = __dirname;
const BOOKS_DIR = path.resolve(ROOT, '..', 'markdown-backups');
const OUTPUT_BASE = path.resolve(ROOT, '..', 'Mav', 'knowledge');
const KNOWLEDGE_INDEX = path.join(OUTPUT_BASE, 'index.html');

// 已迁移为手写图文单页书的源（Mav/knowledge/investing-101/），md 源仅作备份：
// 任何构建都会覆盖手写单页，必须在入口硬拦截。
const FORBIDDEN_SOURCES = new Set(['Investing-101']);

function warnIfBookHasNoEntry(slug, book) {
  if (book.catalog === false || !fs.existsSync(KNOWLEDGE_INDEX)) return;
  const indexHtml = fs.readFileSync(KNOWLEDGE_INDEX, 'utf-8');
  if (!indexHtml.includes(`href="${slug}/index.html"`)) {
    console.warn(`  ⚠ No knowledge homepage entry for '${slug}'.`);
  }
}

// ============================================================
// Argument parsing
// ============================================================
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { force: false, kind: null, command: null, target: null };

  const filtered = [];
  for (const arg of args) {
    if (arg === '--force') {
      result.force = true;
    } else if (arg === '--book' || arg === '--series') {
      const kind = arg.slice(2);
      if (result.kind && result.kind !== kind) {
        console.error('Error: choose either --book or --series.');
        process.exit(1);
      }
      result.kind = kind;
    } else {
      filtered.push(arg);
    }
  }

  if (filtered.length === 0) {
    result.command = 'help';
    return result;
  }

  if (filtered[0] === '--help' || filtered[0] === '-h') {
    result.command = 'help';
    return result;
  }

  // Special commands
  if (filtered[0] === '--lock') {
    result.command = 'lock';
    result.target = filtered[1];
    return result;
  }
  if (filtered[0] === '--unlock') {
    result.command = 'unlock';
    result.target = filtered[1];
    return result;
  }
  if (filtered[0] === '--list-lock') {
    result.command = 'list-lock';
    return result;
  }

  if (filtered.length > 1) {
    console.error(`Error: unexpected argument '${filtered[1]}'.`);
    process.exit(1);
  }

  // Build target
  const target = filtered[0];
  result.kind = result.kind || 'book';
  const configName = result.kind === 'series' ? 'series.yaml' : 'book.yaml';

  // Check if it contains a slash (Source-Name/file or Source-Name/part/file)
  if (target.includes('/')) {
    const slashIndex = target.indexOf('/');
    const sourceName = target.slice(0, slashIndex);
    const fileName = target.slice(slashIndex + 1);
    const sourceDir = path.join(BOOKS_DIR, sourceName);

    if (!fs.existsSync(sourceDir)) {
      console.error(`Error: ${result.kind} '${sourceName}' not found in ${BOOKS_DIR}`);
      process.exit(1);
    }

    if (fileName.endsWith('.yaml')) {
      if (fileName !== configName) {
        console.error(`Error: ${result.kind} builds expect ${configName}.`);
        process.exit(1);
      }
      result.command = 'build-index';
      result.sourceName = sourceName;
      result.sourceDir = sourceDir;
    } else if (fileName.endsWith('.md')) {
      result.command = 'build-chapter';
      result.sourceName = sourceName;
      result.sourceDir = sourceDir;
      result.chapterFile = fileName;
    } else {
      console.error(`Error: Unknown file type '${fileName}'. Expected .md or .yaml`);
      process.exit(1);
    }
  } else {
    // Just a source name - build the complete book or series.
    const sourceDir = path.join(BOOKS_DIR, target);
    if (!fs.existsSync(sourceDir)) {
      console.error(`Error: ${result.kind} '${target}' not found in ${BOOKS_DIR}`);
      listAvailableSources();
      process.exit(1);
    }
    result.command = result.kind === 'series' ? 'build-series' : 'build-book';
    result.sourceName = target;
    result.sourceDir = sourceDir;
  }

  if (!fs.existsSync(path.join(result.sourceDir, configName))) {
    console.error(`Error: ${configName} not found in ${result.sourceDir}`);
    process.exit(1);
  }

  return result;
}

function listAvailableSources() {
  const books = [];
  const series = [];
  fs.readdirSync(BOOKS_DIR).forEach(name => {
    const full = path.join(BOOKS_DIR, name);
    if (fs.statSync(full).isDirectory() && name !== 'original-backups') {
      if (fs.existsSync(path.join(full, 'book.yaml'))) books.push(name);
      if (fs.existsSync(path.join(full, 'series.yaml'))) series.push(name);
    }
  });

  console.log('\nAvailable books:');
  books.forEach(name => {
    if (FORBIDDEN_SOURCES.has(name)) {
      console.warn(`  ⚠ ${name} — 已迁移为手写图文单页书，禁止构建（md 源仅作备份）`);
    } else {
      console.log(`  ${name}`);
    }
  });
  console.log('\nAvailable series:');
  series.forEach(name => console.log(`  ${name}`));
}

function showHelp() {
  console.log(`
📖 md2HTML — Static Site Generator (v3)

Usage:
  node build.js --book <Book-Name>                  Build an entire book
  node build.js --book <Book-Name>/chapter.md       Build one book chapter
  node build.js --book <Book-Name>/book.yaml        Build a book cover
  node build.js --series <Series-Name>              Build an entire series
  node build.js --series <Series-Name>/part/ch.md   Build one series chapter
  node build.js --series <Series-Name>/series.yaml  Build a series cover

Compatibility:
  node build.js <Book-Name>                         Same as --book

Options:
  --force                                  Ignore lock, force overwrite
  --lock <path>                            Lock a file (e.g. browser-war/chapters/01-browser-history.html)
  --unlock <path>                          Unlock a file
  --list-lock                              Show all locked files
`);
  listAvailableSources();
}

// ============================================================
// Build: entire book
// ============================================================
function buildBook(bookDir, bookName, force) {
  console.log(`\n📖 Building: ${bookName}\n`);

  const book = reader.readBookConfig(bookDir);
  const chapters = reader.readChapters(bookDir);
  const slug = bookName.toLowerCase().replace(/ /g, '-');
  const outputDir = path.join(OUTPUT_BASE, slug);

  console.log(`  Book: ${book.title}`);
  console.log(`  Author: ${book.author || 'Unknown'}`);
  console.log(`  Chapters: ${chapters.length}\n`);

  // Ensure output directories
  fs.mkdirSync(path.join(outputDir, 'chapters'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'assets'), { recursive: true });

  // Build each chapter
  let builtCount = 0;
  let skippedCount = 0;

  chapters.forEach((ch, index) => {
    const sourcePath = `${bookName}/${ch.file}`;

    if (!force && lock.isLocked(sourcePath)) {
      console.log(`    ⏭ ${ch.file} (locked, skipping)`);
      skippedCount++;
      return;
    }

    const html = renderer.renderMarkdown(ch.content);
    ch.html = html;
    ch.headings = renderer.extractHeadings(html);

    const page = templates.buildChapterPage(book, ch, chapters, index, ch.headings, html);
    fs.writeFileSync(path.join(outputDir, 'chapters', `${ch.slug}.html`), page, 'utf-8');
    console.log(`    ✓ ${ch.slug}.html (${ch.headings.length} sections)`);
    builtCount++;
  });

  // Build index
  const indexHtml = templates.buildIndexPage(book, chapters);
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');
  console.log(`    ✓ index.html`);
  builtCount++;

  // Copy assets
  templates.copyAssets(outputDir, slug);
  console.log(`    ✓ assets copied`);

  // Build search index
  // Need to ensure all chapters have headings for search index
  chapters.forEach(ch => {
    if (!ch.html) {
      ch.html = renderer.renderMarkdown(ch.content);
      ch.headings = renderer.extractHeadings(ch.html);
    }
  });
  const searchIndex = templates.buildSearchIndex(chapters);
  fs.writeFileSync(
    path.join(outputDir, 'assets', 'search-index.json'),
    JSON.stringify(searchIndex, null, 2),
    'utf-8'
  );
  console.log(`    ✓ search-index.json`);

  console.log(`\n  Done! Built: ${builtCount}, Skipped: ${skippedCount}`);
  console.log(`  Output: ${outputDir}/\n`);
  warnIfBookHasNoEntry(slug, book);
}

function getSeriesSlug(series, seriesName) {
  const slug = series.slug || seriesName.toLowerCase().replace(/ /g, '-');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid series slug '${slug}'. Use lowercase letters, numbers, and hyphens.`);
  }
  return slug;
}

// ============================================================
// Build: entire series
// ============================================================
function buildSeries(seriesDir, seriesName, force) {
  console.log(`\n📚 Building series: ${seriesName}\n`);

  const series = reader.readSeriesConfig(seriesDir);
  const chapters = reader.readSeriesChapters(seriesDir, series, true);
  const slug = getSeriesSlug(series, seriesName);
  const outputDir = path.join(OUTPUT_BASE, slug);

  console.log(`  Series: ${series.title}`);
  console.log(`  Parts: ${series.parts.length}`);
  console.log(`  Chapters: ${chapters.length}\n`);

  fs.mkdirSync(path.join(outputDir, 'chapters'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'assets'), { recursive: true });

  let builtCount = 0;
  let skippedCount = 0;

  chapters.forEach((chapter, index) => {
    const sourcePath = `${seriesName}/${chapter.sourceFile}`;
    if (!force && lock.isLocked(sourcePath)) {
      console.log(`    ⏭ ${chapter.sourceFile} (locked, skipping)`);
      skippedCount++;
      return;
    }

    const html = renderer.renderMarkdown(chapter.content);
    chapter.html = html;
    chapter.headings = renderer.extractHeadings(html);
    const page = templates.buildSeriesChapterPage(
      series,
      chapter,
      chapters,
      index,
      chapter.headings,
      html
    );
    fs.writeFileSync(path.join(outputDir, 'chapters', `${chapter.slug}.html`), page, 'utf-8');
    console.log(`    ✓ ${chapter.slug}.html (${chapter.headings.length} sections)`);
    builtCount++;
  });

  const indexHtml = templates.buildSeriesIndexPage(series, chapters);
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');
  console.log('    ✓ index.html');
  builtCount++;

  templates.copySeriesAssets(outputDir, slug);
  console.log('    ✓ shared + series assets copied');

  chapters.forEach(chapter => {
    if (!chapter.html) {
      chapter.html = renderer.renderMarkdown(chapter.content);
      chapter.headings = renderer.extractHeadings(chapter.html);
    }
  });
  const searchIndex = templates.buildSearchIndex(chapters);
  fs.writeFileSync(
    path.join(outputDir, 'assets', 'search-index.json'),
    JSON.stringify(searchIndex, null, 2),
    'utf-8'
  );
  console.log('    ✓ search-index.json');

  console.log(`\n  Done! Built: ${builtCount}, Skipped: ${skippedCount}`);
  console.log(`  Output: ${outputDir}/\n`);
  warnIfBookHasNoEntry(slug, series);
}

// ============================================================
// Build: single chapter
// ============================================================
function buildChapter(bookDir, bookName, chapterFile, force) {
  console.log(`\n📄 Building chapter: ${bookName}/${chapterFile}\n`);

  const book = reader.readBookConfig(bookDir);
  const chaptersMeta = reader.readChaptersMeta(bookDir);
  const chapter = reader.readSingleChapter(path.join(bookDir, chapterFile));

  const slug = bookName.toLowerCase().replace(/ /g, '-');
  const outputDir = path.join(OUTPUT_BASE, slug);
  const sourcePath = `${bookName}/${chapterFile}`;

  // Check lock
  if (!force && lock.isLocked(sourcePath)) {
    console.log(`  ⏭ ${chapterFile} is locked. Use --force to override.`);
    return;
  }

  // Find index in chapters list
  const currentIndex = chaptersMeta.findIndex(ch => ch.slug === chapter.slug);
  if (currentIndex === -1) {
    console.error(`  Error: ${chapterFile} not found in chapter list.`);
    process.exit(1);
  }

  // Render
  const html = renderer.renderMarkdown(chapter.content);
  const headings = renderer.extractHeadings(html);

  // Build page
  const page = templates.buildChapterPage(book, chapter, chaptersMeta, currentIndex, headings, html);

  // Write
  fs.mkdirSync(path.join(outputDir, 'chapters'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'chapters', `${chapter.slug}.html`), page, 'utf-8');

  console.log(`  ✓ ${chapter.slug}.html (${headings.length} sections)`);
  console.log(`  Output: ${outputDir}/chapters/${chapter.slug}.html\n`);
}

// ============================================================
// Build: single series chapter
// ============================================================
function buildSeriesChapter(seriesDir, seriesName, chapterFile, force) {
  console.log(`\n📄 Building series chapter: ${seriesName}/${chapterFile}\n`);

  const series = reader.readSeriesConfig(seriesDir);
  const chaptersMeta = reader.readSeriesChapters(seriesDir, series, false);
  const normalizedFile = chapterFile.split(path.sep).join('/');
  const currentIndex = chaptersMeta.findIndex(chapter => chapter.sourceFile === normalizedFile);

  if (currentIndex === -1) {
    console.error(`  Error: ${chapterFile} is not declared by ${seriesName}/series.yaml.`);
    process.exit(1);
  }

  const sourcePath = `${seriesName}/${normalizedFile}`;
  if (!force && lock.isLocked(sourcePath)) {
    console.log(`  ⏭ ${chapterFile} is locked. Use --force to override.`);
    return;
  }

  const chapter = chaptersMeta[currentIndex];
  const parsedChapter = reader.readSingleChapter(path.join(seriesDir, chapterFile));
  chapter.content = parsedChapter.content;
  const html = renderer.renderMarkdown(chapter.content);
  const headings = renderer.extractHeadings(html);
  const page = templates.buildSeriesChapterPage(
    series,
    chapter,
    chaptersMeta,
    currentIndex,
    headings,
    html
  );

  const slug = getSeriesSlug(series, seriesName);
  const outputDir = path.join(OUTPUT_BASE, slug);
  fs.mkdirSync(path.join(outputDir, 'chapters'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'chapters', `${chapter.slug}.html`), page, 'utf-8');

  console.log(`  ✓ ${chapter.slug}.html (${headings.length} sections)`);
  console.log(`  Output: ${outputDir}/chapters/${chapter.slug}.html\n`);
}

// ============================================================
// Build: index only
// ============================================================
function buildIndex(bookDir, bookName, force) {
  console.log(`\n📑 Building index: ${bookName}\n`);

  const book = reader.readBookConfig(bookDir);
  const chaptersMeta = reader.readChaptersMeta(bookDir);

  const slug = bookName.toLowerCase().replace(/ /g, '-');
  const outputDir = path.join(OUTPUT_BASE, slug);
  const outputPath = `${slug}/index.html`;

  // Check lock
  if (!force && lock.isLocked(outputPath)) {
    console.log(`  ⏭ index.html is locked. Use --force to override.`);
    return;
  }

  // Build
  const indexHtml = templates.buildIndexPage(book, chaptersMeta);

  // Write
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');

  console.log(`  ✓ index.html`);
  console.log(`  Output: ${outputDir}/index.html\n`);
  warnIfBookHasNoEntry(slug, book);
}

// ============================================================
// Build: series index only
// ============================================================
function buildSeriesIndex(seriesDir, seriesName, force) {
  console.log(`\n📑 Building series index: ${seriesName}\n`);

  const series = reader.readSeriesConfig(seriesDir);
  const chaptersMeta = reader.readSeriesChapters(seriesDir, series, false);
  const slug = getSeriesSlug(series, seriesName);
  const outputDir = path.join(OUTPUT_BASE, slug);
  const outputPath = `${slug}/index.html`;

  if (!force && lock.isLocked(outputPath)) {
    console.log('  ⏭ index.html is locked. Use --force to override.');
    return;
  }

  const indexHtml = templates.buildSeriesIndexPage(series, chaptersMeta);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');

  console.log('  ✓ index.html');
  console.log(`  Output: ${outputDir}/index.html\n`);
  warnIfBookHasNoEntry(slug, series);
}

// ============================================================
// Main
// ============================================================
function main() {
  const args = parseArgs();

  // 硬拦截：禁止构建已迁移为手写图文单页书的源。
  // lock/unlock/list-lock/help 命令不设 sourceName，不受影响；
  // build-all.sh 是转发 wrapper（--all 已禁用），同样会走到这里。
  if (args.sourceName && FORBIDDEN_SOURCES.has(args.sourceName)) {
    console.error(
      '❌ ' + args.sourceName + ' 已迁移为图文单页书，禁止构建（会覆盖手写单页）。见 markdown-backups/Investing-101/README.md'
    );
    process.exit(1);
  }

  switch (args.command) {
    case 'help':
      showHelp();
      break;

    case 'build-book':
      buildBook(args.sourceDir, args.sourceName, args.force);
      break;

    case 'build-series':
      buildSeries(args.sourceDir, args.sourceName, args.force);
      break;

    case 'build-chapter':
      if (args.kind === 'series') {
        buildSeriesChapter(args.sourceDir, args.sourceName, args.chapterFile, args.force);
      } else {
        buildChapter(args.sourceDir, args.sourceName, args.chapterFile, args.force);
      }
      break;

    case 'build-index':
      if (args.kind === 'series') {
        buildSeriesIndex(args.sourceDir, args.sourceName, args.force);
      } else {
        buildIndex(args.sourceDir, args.sourceName, args.force);
      }
      break;

    case 'lock':
      if (!args.target) {
        console.error('Error: --lock requires a path argument');
        process.exit(1);
      }
      lock.addLock(args.target);
      break;

    case 'unlock':
      if (!args.target) {
        console.error('Error: --unlock requires a path argument');
        process.exit(1);
      }
      lock.removeLock(args.target);
      break;

    case 'list-lock':
      lock.listLock();
      break;

    default:
      showHelp();
  }
}

main();

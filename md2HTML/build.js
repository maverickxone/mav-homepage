#!/usr/bin/env node
// ============================================================
// md2HTML — Static Site Generator (v2)
// Modular build with fine-grained control and lock support.
//
// Usage:
//   node build.js <Book-Name>                Build entire book
//   node build.js <Book-Name>/chapter.md     Build single chapter
//   node build.js <Book-Name>/book.yaml      Build index (cover) only
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
  const result = { force: false, command: null, target: null };

  const filtered = [];
  for (const arg of args) {
    if (arg === '--force') {
      result.force = true;
    } else {
      filtered.push(arg);
    }
  }

  if (filtered.length === 0) {
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

  // Build target
  const target = filtered[0];

  // Check if it contains a slash (Book-Name/file)
  if (target.includes('/')) {
    const [bookName, fileName] = target.split('/');
    const bookDir = path.join(BOOKS_DIR, bookName);

    if (!fs.existsSync(bookDir)) {
      console.error(`Error: Book '${bookName}' not found in ${BOOKS_DIR}`);
      process.exit(1);
    }

    if (fileName.endsWith('.yaml')) {
      result.command = 'build-index';
      result.bookName = bookName;
      result.bookDir = bookDir;
    } else if (fileName.endsWith('.md')) {
      result.command = 'build-chapter';
      result.bookName = bookName;
      result.bookDir = bookDir;
      result.chapterFile = fileName;
    } else {
      console.error(`Error: Unknown file type '${fileName}'. Expected .md or .yaml`);
      process.exit(1);
    }
  } else {
    // Just a book name — build entire book
    const bookDir = path.join(BOOKS_DIR, target);
    if (!fs.existsSync(bookDir)) {
      console.error(`Error: Book '${target}' not found in ${BOOKS_DIR}`);
      listAvailableBooks();
      process.exit(1);
    }
    result.command = 'build-book';
    result.bookName = target;
    result.bookDir = bookDir;
  }

  return result;
}

function listAvailableBooks() {
  console.log('\nAvailable books:');
  fs.readdirSync(BOOKS_DIR).forEach(name => {
    const full = path.join(BOOKS_DIR, name);
    if (fs.statSync(full).isDirectory() && name !== 'original-backups') {
      console.log(`  ${name}`);
    }
  });
}

function showHelp() {
  console.log(`
📖 md2HTML — Static Site Generator (v2)

Usage:
  node build.js <Book-Name>                Build entire book
  node build.js <Book-Name>/chapter.md     Build single chapter only
  node build.js <Book-Name>/book.yaml      Build index (cover) only

Options:
  --force                                  Ignore lock, force overwrite
  --lock <path>                            Lock a file (e.g. browser-war/chapters/01-browser-history.html)
  --unlock <path>                          Unlock a file
  --list-lock                              Show all locked files
`);
  listAvailableBooks();
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
// Main
// ============================================================
function main() {
  const args = parseArgs();

  switch (args.command) {
    case 'help':
      showHelp();
      break;

    case 'build-book':
      buildBook(args.bookDir, args.bookName, args.force);
      break;

    case 'build-chapter':
      buildChapter(args.bookDir, args.bookName, args.chapterFile, args.force);
      break;

    case 'build-index':
      buildIndex(args.bookDir, args.bookName, args.force);
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

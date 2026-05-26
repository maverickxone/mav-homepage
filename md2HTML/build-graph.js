#!/usr/bin/env node
// ============================================================
// build-graph.js — Knowledge Graph data generator
//
// Reads all book/chapter metadata + graph-edges.yaml
// Outputs: Mav/knowledge/graph/graph-data.json
//
// Usage:
//   node build-graph.js
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = __dirname;
const BOOKS_DIR = path.resolve(ROOT, '..', 'markdown-backups');
const EDGES_FILE = path.resolve(BOOKS_DIR, 'projects', 'graph-edges.yaml');
const OUTPUT_DIR = path.resolve(ROOT, '..', 'Mav', 'knowledge', 'graph');

// ============================================================
// Helpers
// ============================================================

function getBookDirs() {
  return fs.readdirSync(BOOKS_DIR).filter(d => {
    const full = path.join(BOOKS_DIR, d);
    return fs.statSync(full).isDirectory()
      && d !== 'projects'
      && d !== 'original-backups'
      && fs.existsSync(path.join(full, 'book.yaml'));
  });
}

function readBookYaml(dirName) {
  const content = fs.readFileSync(path.join(BOOKS_DIR, dirName, 'book.yaml'), 'utf-8');
  return yaml.load(content);
}

function getChapters(dirName) {
  const bookDir = path.join(BOOKS_DIR, dirName);
  return fs.readdirSync(bookDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(file => {
      const content = fs.readFileSync(path.join(bookDir, file), 'utf-8');
      const titleMatch = content.match(/title:\s*"?([^"\n]+)"?/);
      const descMatch = content.match(/description:\s*"?([^"\n]+)"?/);
      const chapterMatch = content.match(/chapter:\s*(\d+)/);
      const slug = file.replace('.md', '');
      return {
        file,
        slug,
        title: titleMatch ? titleMatch[1].trim() : slug,
        description: descMatch ? descMatch[1].trim() : '',
        chapter: chapterMatch ? parseInt(chapterMatch[1]) : 0
      };
    });
}

// ============================================================
// Main
// ============================================================

function main() {
  console.log('\n🕸  Building knowledge graph data...\n');

  // 1. Collect all books and chapters as nodes
  const books = [];
  const chapters = [];
  const bookDirs = getBookDirs();

  for (const dirName of bookDirs) {
    const meta = readBookYaml(dirName);
    const slug = dirName.toLowerCase().replace(/ /g, '-');

    books.push({
      id: slug,
      dirName,
      title: meta.title || dirName,
      description: meta.description || '',
      chapterCount: 0,
      url: `../${slug}/index.html`
    });

    const chaps = getChapters(dirName);
    books[books.length - 1].chapterCount = chaps.length;

    for (const ch of chaps) {
      chapters.push({
        id: `${slug}/${ch.slug}`,
        bookId: slug,
        title: ch.title,
        description: ch.description,
        chapter: ch.chapter,
        url: `../${slug}/chapters/${ch.slug}.html`
      });
    }
  }

  console.log(`  Books: ${books.length}`);
  console.log(`  Chapters: ${chapters.length}`);

  // 2. Read edges
  let edges = [];
  if (fs.existsSync(EDGES_FILE)) {
    const edgesContent = fs.readFileSync(EDGES_FILE, 'utf-8');
    const edgesData = yaml.load(edgesContent);
    if (edgesData && edgesData.edges) {
      edges = edgesData.edges.map(e => ({
        from: e.from,
        to: e.to,
        label: e.label || ''
      }));
    }
  }

  // Validate edges — filter out any with non-existent nodes
  const chapterIds = new Set(chapters.map(c => c.id));
  const validEdges = edges.filter(e => {
    const fromValid = chapterIds.has(e.from);
    const toValid = chapterIds.has(e.to);
    if (!fromValid) console.log(`  ⚠ Edge from "${e.from}" — node not found, skipping`);
    if (!toValid) console.log(`  ⚠ Edge to "${e.to}" — node not found, skipping`);
    return fromValid && toValid;
  });

  console.log(`  Edges: ${validEdges.length} (${edges.length - validEdges.length} invalid skipped)`);

  // 3. Output
  const graphData = {
    books,
    chapters,
    edges: validEdges
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'graph-data.json'),
    JSON.stringify(graphData, null, 2),
    'utf-8'
  );
  console.log(`\n  ✓ graph-data.json`);
  console.log(`  Output: ${OUTPUT_DIR}/\n`);
}

main();

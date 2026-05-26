#!/usr/bin/env node
// ============================================================
// build-projects.js — Project pages generator
//
// Reads project YAML files from markdown-backups/projects/
// Generates:
//   1. Project detail pages → Mav/knowledge/projects/<slug>/index.html
//   2. A JSON manifest → Mav/knowledge/projects/manifest.json
//      (consumed by the knowledge index page)
//
// Usage:
//   node build-projects.js              Build all projects
//   node build-projects.js <slug>       Build single project
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ============================================================
// Paths
// ============================================================
const ROOT = __dirname;
const PROJECTS_SRC = path.resolve(ROOT, '..', 'markdown-backups', 'projects');
const OUTPUT_BASE = path.resolve(ROOT, '..', 'Mav', 'knowledge', 'projects');
const BOOKS_DIR = path.resolve(ROOT, '..', 'markdown-backups');

// ============================================================
// Helpers
// ============================================================

function readProjectYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(content);
}

function getAllProjects() {
  if (!fs.existsSync(PROJECTS_SRC)) return [];
  return fs.readdirSync(PROJECTS_SRC)
    .filter(f => f.endsWith('.yaml'))
    .map(f => readProjectYaml(path.join(PROJECTS_SRC, f)))
    .filter(p => p && Array.isArray(p.books) && p.slug);
}

/**
 * Read book.yaml for a given slug to get its title and metadata.
 */
function getBookMeta(slug) {
  // Try to find the book directory by slug matching
  const dirs = fs.readdirSync(BOOKS_DIR).filter(d => {
    const full = path.join(BOOKS_DIR, d);
    return fs.statSync(full).isDirectory() && d !== 'projects';
  });

  for (const dir of dirs) {
    const dirSlug = dir.toLowerCase().replace(/ /g, '-');
    if (dirSlug === slug) {
      const yamlPath = path.join(BOOKS_DIR, dir, 'book.yaml');
      if (fs.existsSync(yamlPath)) {
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const meta = yaml.load(content);
        return { ...meta, slug: dirSlug, dirName: dir };
      }
    }
  }
  return null;
}

/**
 * Count chapters in a book directory.
 */
function countChapters(dirName) {
  const bookDir = path.join(BOOKS_DIR, dirName);
  return fs.readdirSync(bookDir).filter(f => f.endsWith('.md')).length;
}

/**
 * Estimate total read time for a project's books.
 */
function estimateReadTime(books) {
  let total = 0;
  for (const book of books) {
    const meta = getBookMeta(book.slug);
    if (meta && meta.dirName) {
      const bookDir = path.join(BOOKS_DIR, meta.dirName);
      const mdFiles = fs.readdirSync(bookDir).filter(f => f.endsWith('.md'));
      for (const mdFile of mdFiles) {
        const content = fs.readFileSync(path.join(bookDir, mdFile), 'utf-8');
        // Extract readTime from front-matter
        const match = content.match(/readTime:\s*(\d+)/);
        if (match) total += parseInt(match[1]);
      }
    }
  }
  return total;
}

// ============================================================
// HTML Generation
// ============================================================

/**
 * Get chapter front-matter info for a book.
 */
function getChaptersMeta(dirName) {
  const bookDir = path.join(BOOKS_DIR, dirName);
  const mdFiles = fs.readdirSync(bookDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  return mdFiles.map(file => {
    const content = fs.readFileSync(path.join(bookDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*"?([^"\n]+)"?/);
    const chapterMatch = content.match(/chapter:\s*(\d+)/);
    const readTimeMatch = content.match(/readTime:\s*(\d+)/);
    const slug = file.replace('.md', '');
    return {
      file,
      slug,
      title: titleMatch ? titleMatch[1].trim() : slug,
      chapter: chapterMatch ? parseInt(chapterMatch[1]) : 0,
      readTime: readTimeMatch ? parseInt(readTimeMatch[1]) : 10
    };
  });
}

function buildProjectDetailPage(project, booksMeta) {
  const totalTime = estimateReadTime(project.books);
  const timeDisplay = totalTime > 60
    ? `${Math.round(totalTime / 60)} 小时`
    : `${totalTime} 分钟`;

  const stepsHtml = project.books.map((book, i) => {
    const meta = booksMeta[i];
    const title = meta ? meta.title : book.slug;
    const desc = meta ? (meta.description || '') : '';
    const isLast = i === project.books.length - 1;

    // Get chapters info for read time calculation
    let bookReadTime = 0;
    let chapCount = 0;
    if (meta && meta.dirName) {
      const chapters = getChaptersMeta(meta.dirName);
      chapCount = chapters.length;
      bookReadTime = chapters.reduce((sum, ch) => sum + ch.readTime, 0);
    }

    const timeStr = bookReadTime > 60
      ? `约 ${Math.round(bookReadTime / 60)} 小时`
      : `约 ${bookReadTime} 分钟`;

    // Transition text (between books)
    let transitionHtml = '';
    if (!isLast && project.transitions && project.transitions[i]) {
      transitionHtml = `
        <div class="path-transition">
          <p>${project.transitions[i]}</p>
        </div>`;
    }

    return `      <div class="path-step${isLast ? ' last' : ''}">
        <div class="path-node">
          <div class="path-dot"></div>
          ${!isLast ? '<div class="path-connector"></div>' : ''}
        </div>
        <div class="path-content">
          <div class="path-step-num">第 ${i + 1} 站</div>
          <a class="book-card" href="../../${book.slug}/index.html">
            <h3>${title}</h3>
            <p class="book-card-role">${book.role}</p>
            <p class="book-card-desc">${desc}</p>
            <div class="book-card-footer">
              <span>${chapCount} 章 · ${timeStr}</span>
              <span class="book-card-cta">开始阅读 →</span>
            </div>
          </a>${transitionHtml}
        </div>
      </div>`;
  }).join('\n');

  // Build sidebar HTML
  const sidebar = project.sidebar || {};
  let sidebarHtml = '';

  if (sidebar.prerequisites && sidebar.prerequisites.length) {
    const items = sidebar.prerequisites.map(p => `          <li>${p}</li>`).join('\n');
    sidebarHtml += `
      <div class="sidebar-section">
        <h4>前置知识</h4>
        <ul>
${items}
        </ul>
      </div>`;
  }

  if (sidebar.concepts && sidebar.concepts.length) {
    const items = sidebar.concepts.map(c => `          <li>${c}</li>`).join('\n');
    sidebarHtml += `
      <div class="sidebar-section">
        <h4>涉及概念</h4>
        <ul>
${items}
        </ul>
      </div>`;
  }

  if (sidebar.outcomes && sidebar.outcomes.length) {
    const items = sidebar.outcomes.map(o => `          <li>${o}</li>`).join('\n');
    sidebarHtml += `
      <div class="sidebar-section">
        <h4>读完之后你能</h4>
        <ul>
${items}
        </ul>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.title} — Projects — Mav</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../../assets/style.css">
<link rel="stylesheet" href="../../../assets/projects.css">
</head>
<body>

<nav class="topnav">
  <div class="topnav-inner">
    <a class="brand" href="../../../index.html">← Mav</a>
    <div class="nav-links">
      <a href="../../../about/index.html">关于我</a>
      <a href="../../index.html" class="active">知识库</a>
      <a href="../../../blog/index.html">博客</a>
    </div>
  </div>
</nav>

<main class="project-detail-wrap">

  <a href="../../index.html" class="back-link">← 返回知识库</a>

  <div class="project-layout">
    <div class="project-main">
      <header class="project-header">
        <span class="eyebrow">PROJECT</span>
        <h1>${project.title}</h1>
        <p class="project-desc">${project.description}</p>
        <div class="project-stats">
          <span>${project.books.length} 本书</span>
          <span>·</span>
          <span>预计 ${timeDisplay}</span>
        </div>
      </header>

      <section class="path-timeline">
${stepsHtml}
      </section>
    </div>

    <aside class="project-sidebar">
${sidebarHtml}
    </aside>
  </div>

</main>

<footer>
  <div class="footer-inner">
    <span>Mav · ${new Date().getFullYear()}</span>
    <span>Built with Claude and curiosity.</span>
  </div>
</footer>

</body>
</html>`;
}

// ============================================================
// Main
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const targetSlug = args[0] || null;

  // Ensure output directory
  fs.mkdirSync(OUTPUT_BASE, { recursive: true });

  const allProjects = getAllProjects();

  if (allProjects.length === 0) {
    console.log('No project YAML files found in markdown-backups/projects/');
    return;
  }

  const projectsToBuild = targetSlug
    ? allProjects.filter(p => p.slug === targetSlug)
    : allProjects;

  if (targetSlug && projectsToBuild.length === 0) {
    console.error(`Project '${targetSlug}' not found.`);
    console.log('Available projects:', allProjects.map(p => p.slug).join(', '));
    process.exit(1);
  }

  console.log(`\n🗂  Building ${projectsToBuild.length} project(s)...\n`);

  for (const project of projectsToBuild) {
    const booksMeta = project.books.map(b => getBookMeta(b.slug));
    const outputDir = path.join(OUTPUT_BASE, project.slug);
    fs.mkdirSync(outputDir, { recursive: true });

    const html = buildProjectDetailPage(project, booksMeta);
    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');
    console.log(`  ✓ ${project.slug}/index.html`);
  }

  // Build manifest (used by knowledge index page)
  const manifest = allProjects.map(project => {
    const totalTime = estimateReadTime(project.books);
    return {
      title: project.title,
      slug: project.slug,
      description: project.description,
      bookCount: project.books.length,
      readTimeMinutes: totalTime,
      books: project.books.map(b => {
        const meta = getBookMeta(b.slug);
        return {
          slug: b.slug,
          title: meta ? meta.title : b.slug,
          role: b.role
        };
      })
    };
  });

  fs.writeFileSync(
    path.join(OUTPUT_BASE, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(`  ✓ manifest.json`);
  console.log(`\n  Done! Output: ${OUTPUT_BASE}/\n`);
}

main();

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

/**
 * Read book.yaml metadata from a book directory.
 * @param {string} bookDir - Absolute path to the book's source directory
 * @returns {object} Parsed book config
 */
function readBookConfig(bookDir) {
  const configPath = path.join(bookDir, 'book.yaml');
  if (!fs.existsSync(configPath)) {
    throw new Error(`book.yaml not found in ${bookDir}`);
  }
  return yaml.load(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Read series.yaml metadata from a series directory.
 * @param {string} seriesDir - Absolute path to the series source directory
 * @returns {object} Parsed series config
 */
function readSeriesConfig(seriesDir) {
  const configPath = path.join(seriesDir, 'series.yaml');
  if (!fs.existsSync(configPath)) {
    throw new Error(`series.yaml not found in ${seriesDir}`);
  }
  const config = yaml.load(fs.readFileSync(configPath, 'utf-8'));
  if (!config || !config.title) {
    throw new Error(`series.yaml requires a title in ${seriesDir}`);
  }
  if (!Array.isArray(config.parts) || config.parts.length === 0) {
    throw new Error(`series.yaml requires a non-empty parts list in ${seriesDir}`);
  }
  return {
    ...config,
    parts: config.parts.map(normalizePart)
  };
}

/**
 * Read and parse all markdown chapter files from a book directory.
 * @param {string} bookDir - Absolute path to the book's source directory
 * @returns {Array} Sorted array of chapter objects with frontmatter and content
 */
function readChapters(bookDir) {
  const files = fs.readdirSync(bookDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  return files.map(file => {
    const filePath = path.join(bookDir, file);
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

/**
 * Read only frontmatter from all markdown files (no full content parsing).
 * Used when building a single chapter but needing nav context.
 * @param {string} bookDir - Absolute path to the book's source directory
 * @returns {Array} Sorted array of {file, slug, frontmatter}
 */
function readChaptersMeta(bookDir) {
  const files = fs.readdirSync(bookDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  return files.map(file => {
    const filePath = path.join(bookDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(raw);

    return {
      file,
      slug: file.replace('.md', ''),
      frontmatter
    };
  }).sort((a, b) => (a.frontmatter.chapter || 0) - (b.frontmatter.chapter || 0));
}

/**
 * Read a single chapter file.
 * @param {string} filePath - Absolute path to the .md file
 * @returns {object} Chapter object with frontmatter and content
 */
function readSingleChapter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  const file = path.basename(filePath);

  return {
    file,
    slug: file.replace('.md', ''),
    frontmatter,
    content
  };
}

function assertInsideDirectory(baseDir, relativePath) {
  const absolutePath = path.resolve(baseDir, relativePath);
  const relative = path.relative(baseDir, absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Series source path leaves its directory: ${relativePath}`);
  }
  return absolutePath;
}

function normalizePart(part, index) {
  if (!part || typeof part !== 'object') {
    throw new Error(`Invalid series part at position ${index + 1}`);
  }
  if (!part.id || !part.title || !part.source) {
    throw new Error(`Series part ${index + 1} requires id, title, and source`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part.id)) {
    throw new Error(`Invalid series part id: ${part.id}`);
  }

  return {
    ...part,
    order: index + 1,
    label: part.label || `PART ${index + 1}`
  };
}

/**
 * Read chapters from the directories declared by series.yaml.
 * Local chapter numbers restart inside each Part. The returned chapter number
 * and slug are global across the complete series.
 */
function readSeriesChapters(seriesDir, series, includeContent = true) {
  if (!series || !Array.isArray(series.parts) || series.parts.length === 0) {
    throw new Error('series.yaml requires a non-empty parts list');
  }

  const partIds = new Set();
  const sourceDirs = new Set();
  const chapters = [];
  let globalChapter = 1;

  series.parts.map(normalizePart).forEach(part => {
    if (partIds.has(part.id)) {
      throw new Error(`Duplicate series part id: ${part.id}`);
    }
    if (sourceDirs.has(part.source)) {
      throw new Error(`Duplicate series part source: ${part.source}`);
    }
    partIds.add(part.id);
    sourceDirs.add(part.source);

    const partDir = assertInsideDirectory(seriesDir, part.source);
    if (!fs.existsSync(partDir) || !fs.statSync(partDir).isDirectory()) {
      throw new Error(`Series part source not found: ${part.source}`);
    }

    const files = fs.readdirSync(partDir)
      .filter(file => file.endsWith('.md'))
      .sort();

    if (files.length === 0) {
      throw new Error(`Series part has no Markdown chapters: ${part.source}`);
    }

    const partChapters = files.map(file => {
      const filePath = path.join(partDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const localChapter = Number(parsed.data.chapter || 0);
      if (!Number.isInteger(localChapter) || localChapter < 1) {
        throw new Error(`Invalid chapter number in ${part.source}/${file}`);
      }
      if (!parsed.data.title) {
        throw new Error(`Missing chapter title in ${part.source}/${file}`);
      }

      return {
        file,
        sourceFile: path.posix.join(part.source, file),
        localChapter,
        originalSlug: file.replace(/\.md$/, ''),
        frontmatter: parsed.data,
        content: includeContent ? parsed.content : undefined
      };
    }).sort((a, b) => a.localChapter - b.localChapter);

    const localNumbers = new Set();
    partChapters.forEach((chapter, index) => {
      if (localNumbers.has(chapter.localChapter)) {
        throw new Error(`Duplicate chapter ${chapter.localChapter} in ${part.source}`);
      }
      if (chapter.localChapter !== index + 1) {
        throw new Error(`Chapter numbering in ${part.source} must be continuous from 1`);
      }
      localNumbers.add(chapter.localChapter);

      const baseSlug = chapter.originalSlug.replace(/^\d+-/, '');
      const number = String(globalChapter).padStart(2, '0');
      chapters.push({
        ...chapter,
        slug: `${number}-${baseSlug}`,
        part,
        partId: part.id,
        frontmatter: {
          ...chapter.frontmatter,
          chapter: globalChapter,
          part: part.id,
          partChapter: chapter.localChapter
        }
      });
      globalChapter += 1;
    });
  });

  const slugs = new Set();
  chapters.forEach(chapter => {
    if (slugs.has(chapter.slug)) {
      throw new Error(`Duplicate generated chapter slug: ${chapter.slug}`);
    }
    slugs.add(chapter.slug);
  });

  return chapters;
}

module.exports = {
  readBookConfig,
  readSeriesConfig,
  readChapters,
  readChaptersMeta,
  readSingleChapter,
  readSeriesChapters
};

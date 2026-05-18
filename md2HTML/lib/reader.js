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

module.exports = {
  readBookConfig,
  readChapters,
  readChaptersMeta,
  readSingleChapter
};

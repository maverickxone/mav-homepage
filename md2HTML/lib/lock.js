'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LOCK_FILE = path.join(__dirname, '..', 'build-lock.yaml');

/**
 * Read the lock file. Returns an array of locked output paths.
 * @returns {string[]} Array of relative paths (e.g. "browser-war/chapters/01-browser-history.html")
 */
function readLock() {
  if (!fs.existsSync(LOCK_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(LOCK_FILE, 'utf-8');
  const data = yaml.load(raw);
  return (data && data.locked) || [];
}

/**
 * Check if a specific source file is locked.
 * @param {string} sourcePath - Relative path like "Browser-War/01-browser-history.md"
 * @returns {boolean}
 */
function isLocked(sourcePath) {
  const locked = readLock();
  const normalized = sourcePath.replace(/\\/g, '/');
  return locked.some(entry => entry.replace(/\\/g, '/') === normalized);
}

/**
 * Add a path to the lock file.
 * @param {string} outputPath - Relative path to lock
 */
function addLock(outputPath) {
  const locked = readLock();
  const normalized = outputPath.replace(/\\/g, '/');
  if (!locked.includes(normalized)) {
    locked.push(normalized);
    writeLock(locked);
    console.log(`  🔒 Locked: ${normalized}`);
  } else {
    console.log(`  Already locked: ${normalized}`);
  }
}

/**
 * Remove a path from the lock file.
 * @param {string} outputPath - Relative path to unlock
 */
function removeLock(outputPath) {
  const locked = readLock();
  const normalized = outputPath.replace(/\\/g, '/');
  const filtered = locked.filter(entry => entry.replace(/\\/g, '/') !== normalized);
  if (filtered.length < locked.length) {
    writeLock(filtered);
    console.log(`  🔓 Unlocked: ${normalized}`);
  } else {
    console.log(`  Not found in lock: ${normalized}`);
  }
}

/**
 * Write the lock file.
 */
function writeLock(locked) {
  const content = yaml.dump({ locked }, { flowLevel: -1 });
  fs.writeFileSync(LOCK_FILE, `# build-lock.yaml\n# Files listed here will be skipped during build (manually optimized).\n# Use --force to override, or --unlock to remove entries.\n\n${content}`, 'utf-8');
}

/**
 * List all locked files.
 */
function listLock() {
  const locked = readLock();
  if (locked.length === 0) {
    console.log('  No locked files.');
  } else {
    console.log(`  Locked files (${locked.length}):`);
    locked.forEach(f => console.log(`    🔒 ${f}`));
  }
}

module.exports = {
  readLock,
  isLocked,
  addLock,
  removeLock,
  listLock
};

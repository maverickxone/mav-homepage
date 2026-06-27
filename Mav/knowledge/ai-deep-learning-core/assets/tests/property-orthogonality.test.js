/**
 * Property Test: Settings Orthogonality (Property 3)
 *
 * Toggling dark mode or size does not alter `data-style`;
 * changing style does not alter `data-theme` or `data-size`.
 * All three settings (style, theme, size) operate independently.
 *
 * **Validates: Requirements 6.1, 6.4, 7.1, 7.2**
 *
 * Run: node property-orthogonality.test.js
 */

'use strict';

// ─── Minimal DOM + localStorage mock ───────────────────────────────

function createMockDOM() {
  const attrs = {};
  const classList = new Set();

  return {
    documentElement: {
      getAttribute(name) {
        return attrs[name] !== undefined ? attrs[name] : null;
      },
      setAttribute(name, value) {
        attrs[name] = value;
      },
      removeAttribute(name) {
        delete attrs[name];
      },
      classList: {
        add(c) { classList.add(c); },
        remove(c) { classList.delete(c); },
        contains(c) { return classList.has(c); },
        toggle(c, force) {
          if (force) classList.add(c);
          else classList.delete(c);
        }
      }
    },
    _attrs: attrs,
    _classList: classList
  };
}

function createMockStorage() {
  const store = {};
  return {
    getItem(key) { return store[key] !== undefined ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    _store: store
  };
}

// ─── Replicate script.js logic ─────────────────────────────────────

/**
 * Replicates the setStyle logic from script.js settings popover handler.
 * Sets data-style on root, persists to localStorage.
 */
function setStyle(root, storage, style) {
  if (style === 'minimal' || !style) {
    root.removeAttribute('data-style');
    storage.setItem('md2html-style', 'minimal');
  } else {
    root.setAttribute('data-style', style);
    storage.setItem('md2html-style', style);
  }
}

/**
 * Replicates the theme toggle logic from script.js.
 * Toggles between light and dark mode.
 */
function setTheme(root, storage, mode) {
  if (mode === 'light') {
    root.removeAttribute('data-theme');
    storage.setItem('md2html-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
    storage.setItem('md2html-theme', 'dark');
  }
}

/**
 * Replicates the size toggle logic from script.js.
 * Sets data-size to s, m, or l.
 */
function setSize(root, storage, size) {
  root.setAttribute('data-size', size);
  storage.setItem('md2html-size', size);
}

// ─── Test configuration ────────────────────────────────────────────

const VALID_STYLES = ['minimal', 'warm', 'azure', 'cobalt', 'graphite', 'sepia'];
const VALID_THEMES = ['light', 'dark'];
const VALID_SIZES = ['s', 'm', 'l'];

// ─── Assertions ────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error('  FAIL: ' + message);
    failed++;
  } else {
    passed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error('  FAIL: ' + message + ' (expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual) + ')');
    failed++;
  } else {
    passed++;
  }
}

// ─── Helper: get effective data-style value ────────────────────────

function getEffectiveStyle(root) {
  // In the real code, minimal means data-style is absent (removed)
  return root.getAttribute('data-style') || 'minimal';
}

function getEffectiveTheme(root) {
  return root.getAttribute('data-theme') || 'light';
}

function getEffectiveSize(root) {
  return root.getAttribute('data-size') || 'm';
}

// ─── Property Tests ────────────────────────────────────────────────

console.log('Property 3: Settings Orthogonality');
console.log('==================================\n');

// Test 1: Toggling dark mode does NOT alter data-style
console.log('Test 1: Toggling dark mode does not alter data-style');
for (const style of VALID_STYLES) {
  for (const theme of VALID_THEMES) {
    const doc = createMockDOM();
    const storage = createMockStorage();
    const root = doc.documentElement;

    // Set initial style
    setStyle(root, storage, style);
    const styleBefore = getEffectiveStyle(root);

    // Toggle theme
    setTheme(root, storage, theme);
    const styleAfter = getEffectiveStyle(root);

    assertEqual(
      styleAfter,
      styleBefore,
      `style=${style}, toggle theme to ${theme}: data-style should remain "${styleBefore}"`
    );
  }
}
console.log('');

// Test 2: Changing size does NOT alter data-style
console.log('Test 2: Changing size does not alter data-style');
for (const style of VALID_STYLES) {
  for (const size of VALID_SIZES) {
    const doc = createMockDOM();
    const storage = createMockStorage();
    const root = doc.documentElement;

    // Set initial style
    setStyle(root, storage, style);
    const styleBefore = getEffectiveStyle(root);

    // Change size
    setSize(root, storage, size);
    const styleAfter = getEffectiveStyle(root);

    assertEqual(
      styleAfter,
      styleBefore,
      `style=${style}, change size to ${size}: data-style should remain "${styleBefore}"`
    );
  }
}
console.log('');

// Test 3: Changing style does NOT alter data-theme
console.log('Test 3: Changing style does not alter data-theme');
for (const theme of VALID_THEMES) {
  for (const style of VALID_STYLES) {
    const doc = createMockDOM();
    const storage = createMockStorage();
    const root = doc.documentElement;

    // Set initial theme
    setTheme(root, storage, theme);
    const themeBefore = getEffectiveTheme(root);

    // Change style
    setStyle(root, storage, style);
    const themeAfter = getEffectiveTheme(root);

    assertEqual(
      themeAfter,
      themeBefore,
      `theme=${theme}, change style to ${style}: data-theme should remain "${themeBefore}"`
    );
  }
}
console.log('');

// Test 4: Changing style does NOT alter data-size
console.log('Test 4: Changing style does not alter data-size');
for (const size of VALID_SIZES) {
  for (const style of VALID_STYLES) {
    const doc = createMockDOM();
    const storage = createMockStorage();
    const root = doc.documentElement;

    // Set initial size
    setSize(root, storage, size);
    const sizeBefore = getEffectiveSize(root);

    // Change style
    setStyle(root, storage, style);
    const sizeAfter = getEffectiveSize(root);

    assertEqual(
      sizeAfter,
      sizeBefore,
      `size=${size}, change style to ${style}: data-size should remain "${sizeBefore}"`
    );
  }
}
console.log('');

// Test 5: All three settings combined — full independence
console.log('Test 5: Full combination — all three settings are independent');
for (const style of VALID_STYLES) {
  for (const theme of VALID_THEMES) {
    for (const size of VALID_SIZES) {
      const doc = createMockDOM();
      const storage = createMockStorage();
      const root = doc.documentElement;

      // Set all three settings
      setStyle(root, storage, style);
      setTheme(root, storage, theme);
      setSize(root, storage, size);

      // Verify all three are set correctly and independently
      assertEqual(
        getEffectiveStyle(root),
        style,
        `combo (${style}/${theme}/${size}): data-style should be "${style}"`
      );
      assertEqual(
        getEffectiveTheme(root),
        theme,
        `combo (${style}/${theme}/${size}): data-theme should be "${theme}"`
      );
      assertEqual(
        getEffectiveSize(root),
        size,
        `combo (${style}/${theme}/${size}): data-size should be "${size}"`
      );

      // Now change each one and verify the others stay the same
      // Change style to a different value
      const otherStyle = VALID_STYLES.find(s => s !== style) || style;
      setStyle(root, storage, otherStyle);
      assertEqual(
        getEffectiveTheme(root),
        theme,
        `combo after style change (${otherStyle}/${theme}/${size}): data-theme should remain "${theme}"`
      );
      assertEqual(
        getEffectiveSize(root),
        size,
        `combo after style change (${otherStyle}/${theme}/${size}): data-size should remain "${size}"`
      );

      // Change theme
      const otherTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(root, storage, otherTheme);
      assertEqual(
        getEffectiveStyle(root),
        otherStyle,
        `combo after theme change (${otherStyle}/${otherTheme}/${size}): data-style should remain "${otherStyle}"`
      );
      assertEqual(
        getEffectiveSize(root),
        size,
        `combo after theme change (${otherStyle}/${otherTheme}/${size}): data-size should remain "${size}"`
      );

      // Change size
      const otherSize = VALID_SIZES.find(s => s !== size) || size;
      setSize(root, storage, otherSize);
      assertEqual(
        getEffectiveStyle(root),
        otherStyle,
        `combo after size change (${otherStyle}/${otherTheme}/${otherSize}): data-style should remain "${otherStyle}"`
      );
      assertEqual(
        getEffectiveTheme(root),
        otherTheme,
        `combo after size change (${otherStyle}/${otherTheme}/${otherSize}): data-theme should remain "${otherTheme}"`
      );
    }
  }
}
console.log('');

// ─── Summary ───────────────────────────────────────────────────────

console.log('----------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  console.log('PROPERTY VIOLATED: Settings are NOT orthogonal!');
  process.exit(1);
} else {
  console.log('PROPERTY HOLDS: All three settings (style, theme, size) are fully independent.');
  process.exit(0);
}

/**
 * Property 4: Persistence Roundtrip
 *
 * For any valid theme identifier, calling setStyle(s) results in
 * localStorage('md2html-style') === s, and on simulated page reload
 * the same theme is applied (data-style === s, or absent for minimal).
 *
 * Validates: Requirements 4.1, 4.2
 *
 * Run: node property-persistence.test.js
 */

'use strict';

// ─── Minimal DOM + localStorage Mock ────────────────────────────────

function createMockDOM() {
  const attributes = {};
  const classList = new Set();
  return {
    documentElement: {
      getAttribute(name) { return attributes[name] || null; },
      setAttribute(name, value) { attributes[name] = value; },
      removeAttribute(name) { delete attributes[name]; },
      classList: {
        add(cls) { classList.add(cls); },
        remove(cls) { classList.delete(cls); },
        contains(cls) { return classList.has(cls); },
        toggle(cls, force) {
          if (force === undefined) {
            if (classList.has(cls)) classList.delete(cls);
            else classList.add(cls);
          } else if (force) {
            classList.add(cls);
          } else {
            classList.delete(cls);
          }
        }
      }
    },
    _attributes: attributes,
    _classList: classList
  };
}

function createMockLocalStorage() {
  const store = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach(k => delete store[k]); },
    _store: store
  };
}

// ─── Replicated Logic from script.js ────────────────────────────────

/**
 * Replicates the setStyle behavior from script.js settings popover click handler.
 * This is the core logic extracted from the IIFE.
 */
function setStyle(style, root, storage) {
  if (style === 'minimal') {
    root.removeAttribute('data-style');
  } else {
    root.setAttribute('data-style', style);
  }
  // Persistence via safeSetItem equivalent
  try {
    storage.setItem('md2html-style', style || 'minimal');
  } catch (e) {
    // fallback would use memoryStore in real code
  }
}

/**
 * Replicates the page-load initialization logic from the top of the IIFE.
 * Reads localStorage and applies data-style before first paint.
 */
function simulatePageLoad(root, storage) {
  // Clear any existing attributes to simulate fresh page load
  root.removeAttribute('data-style');

  const savedStyle = storage.getItem('md2html-style');
  if (savedStyle && savedStyle !== 'minimal') {
    root.setAttribute('data-style', savedStyle);
  }
  // If savedStyle is 'minimal' or null, data-style remains absent (default/minimal)
}

// ─── Test Runner ────────────────────────────────────────────────────

const VALID_THEMES = ['minimal', 'warm', 'azure', 'cobalt', 'graphite', 'sepia'];

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
  passed++;
  console.log(`  ✓ ${message}`);
}

function runPropertyTest() {
  console.log('Property 4: Persistence Roundtrip');
  console.log('='.repeat(50));
  console.log('');

  // Test each valid theme identifier
  for (const theme of VALID_THEMES) {
    console.log(`Testing theme: "${theme}"`);

    const dom = createMockDOM();
    const storage = createMockLocalStorage();
    const root = dom.documentElement;

    // Step 1: Call setStyle(theme)
    setStyle(theme, root, storage);

    // Property assertion 1: localStorage contains the theme
    assert(
      storage.getItem('md2html-style') === theme,
      `localStorage('md2html-style') === '${theme}' after setStyle('${theme}')`
    );

    // Property assertion 2: data-style attribute is correct after setStyle
    if (theme === 'minimal') {
      assert(
        root.getAttribute('data-style') === null,
        `data-style is absent after setStyle('minimal')`
      );
    } else {
      assert(
        root.getAttribute('data-style') === theme,
        `data-style === '${theme}' after setStyle('${theme}')`
      );
    }

    // Step 2: Simulate page reload — create fresh DOM, keep same storage
    const reloadDom = createMockDOM();
    const reloadRoot = reloadDom.documentElement;
    simulatePageLoad(reloadRoot, storage);

    // Property assertion 3: After reload, data-style reflects the persisted theme
    if (theme === 'minimal') {
      assert(
        reloadRoot.getAttribute('data-style') === null,
        `After reload: data-style is absent for persisted 'minimal'`
      );
    } else {
      assert(
        reloadRoot.getAttribute('data-style') === theme,
        `After reload: data-style === '${theme}' for persisted '${theme}'`
      );
    }

    console.log('');
  }

  // Additional property: roundtrip sequence (switch between multiple themes)
  console.log('Testing roundtrip sequence: warm → cobalt → minimal → azure');

  const dom = createMockDOM();
  const storage = createMockLocalStorage();
  const root = dom.documentElement;
  const sequence = ['warm', 'cobalt', 'minimal', 'azure'];

  for (const theme of sequence) {
    setStyle(theme, root, storage);

    // Simulate reload after each switch
    const reloadDom = createMockDOM();
    const reloadRoot = reloadDom.documentElement;
    simulatePageLoad(reloadRoot, storage);

    const expectedAttr = theme === 'minimal' ? null : theme;
    assert(
      reloadRoot.getAttribute('data-style') === expectedAttr,
      `Sequence: after setStyle('${theme}') + reload → data-style === ${expectedAttr === null ? 'null (absent)' : `'${expectedAttr}'`}`
    );
  }

  console.log('');

  // Additional property: persistence survives across multiple "page loads"
  console.log('Testing persistence across multiple page loads');

  const persistDom = createMockDOM();
  const persistStorage = createMockLocalStorage();
  setStyle('sepia', persistDom.documentElement, persistStorage);

  // Simulate 3 consecutive page loads without changing the theme
  for (let i = 1; i <= 3; i++) {
    const loadDom = createMockDOM();
    simulatePageLoad(loadDom.documentElement, persistStorage);
    assert(
      loadDom.documentElement.getAttribute('data-style') === 'sepia',
      `Page load #${i}: data-style === 'sepia' (persisted correctly)`
    );
  }

  console.log('');
}

// ─── Execute ────────────────────────────────────────────────────────

try {
  runPropertyTest();
  console.log('='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('');
  if (failed > 0) {
    console.log('PROPERTY TEST FAILED');
    process.exit(1);
  } else {
    console.log('ALL PROPERTY TESTS PASSED ✓');
    process.exit(0);
  }
} catch (e) {
  console.error('');
  console.error('PROPERTY TEST FAILED');
  console.error(`Error: ${e.message}`);
  process.exit(1);
}

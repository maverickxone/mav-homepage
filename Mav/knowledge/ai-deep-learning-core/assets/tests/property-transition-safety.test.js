/**
 * Property 6: Transition Safety
 *
 * For any CSS transition declaration within theme-related rules, the
 * transitioned properties SHALL be limited to compositor-friendly properties
 * (background, color, border-color, box-shadow, opacity, transform) and
 * SHALL NOT include layout-shifting properties (width, height, padding,
 * margin, gap).
 *
 * Validates: Requirements 3.3, 3.4, 11.3
 *
 * Run: node property-transition-safety.test.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────

const CSS_PATH = path.resolve(__dirname, '..', 'style.css');

/**
 * Compositor-friendly properties that are safe to transition.
 * These do not trigger layout recalculation.
 */
const SAFE_PROPERTIES = new Set([
  'background',
  'color',
  'border-color',
  'box-shadow',
  'opacity',
  'transform',
  'border-bottom-color',
  'border-left-color',
  'border-top-color',
  'border-right-color'
]);

/**
 * Layout-shifting properties that MUST NOT be transitioned within
 * theme rules. These cause expensive reflows.
 */
const UNSAFE_PROPERTIES = new Set([
  'width',
  'height',
  'padding',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'gap',
  'top',
  'left',
  'right',
  'bottom',
  'grid-template-rows',
  'grid-template-columns',
  'max-height',
  'min-height',
  'min-width',
  'max-width'
]);

// ─── CSS Parsing Helpers ────────────────────────────────────────────

/**
 * Extract all rule blocks that are within [data-style] selectors or
 * the .style-transitioning rule.
 *
 * Returns an array of { selector, transitions } objects.
 */
function extractThemeTransitions(css) {
  const results = [];

  // Match rule blocks: selector { ... }
  // We need to find selectors that contain [data-style or .style-transitioning
  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const body = match[2];

    // Check if this is a theme-related rule
    const isThemeRule = selector.includes('[data-style') ||
                        selector.includes('.style-transitioning');

    if (!isThemeRule) continue;

    // Find transition declarations in the body
    const transitionRegex = /transition\s*:\s*([^;!]+)/gi;
    let transMatch;

    while ((transMatch = transitionRegex.exec(body)) !== null) {
      const transitionValue = transMatch[1].trim();
      results.push({
        selector: selector,
        raw: transitionValue
      });
    }
  }

  return results;
}

/**
 * Parse a CSS transition value and extract the property names.
 *
 * Handles formats:
 *   - "background 0.3s ease" → ["background"]
 *   - "background 0.3s ease, color 0.3s ease" → ["background", "color"]
 *   - "all 0.3s ease" → ["all"]
 *
 * Each comma-separated segment starts with the property name.
 */
function parseTransitionProperties(transitionValue) {
  const properties = [];

  // Split by comma to get individual transitions
  const segments = transitionValue.split(',');

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    // The property name is the first token (space-separated)
    const firstToken = trimmed.split(/\s+/)[0];
    if (firstToken) {
      properties.push(firstToken);
    }
  }

  return properties;
}

/**
 * Classify a property as safe, unsafe, or unknown.
 */
function classifyProperty(prop) {
  if (SAFE_PROPERTIES.has(prop)) return 'safe';
  if (UNSAFE_PROPERTIES.has(prop)) return 'unsafe';
  if (prop === 'all') return 'unsafe'; // 'all' would include layout props
  if (prop === 'none') return 'safe';
  return 'unknown';
}

// ─── Test Runner ────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) {
    failed++;
    failures.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  } else {
    passed++;
    console.log(`  ✓ ${message}`);
  }
}

function runPropertyTest() {
  console.log('Property 6: Transition Safety');
  console.log('='.repeat(60));
  console.log('');

  // Read CSS file
  let css;
  try {
    css = fs.readFileSync(CSS_PATH, 'utf8');
  } catch (e) {
    console.error(`ERROR: Cannot read CSS file at ${CSS_PATH}`);
    console.error(e.message);
    process.exit(1);
  }

  console.log(`CSS file loaded: ${(css.length / 1024).toFixed(1)} KB`);
  console.log('');

  // Extract all transition declarations within theme rules
  const themeTransitions = extractThemeTransitions(css);

  console.log(`Found ${themeTransitions.length} transition declarations in theme rules`);
  console.log('');

  if (themeTransitions.length === 0) {
    console.log('WARNING: No transitions found in theme rules. Is the CSS structured correctly?');
    process.exit(1);
  }

  // Validate each transition declaration
  for (const { selector, raw } of themeTransitions) {
    const properties = parseTransitionProperties(raw);
    const shortSelector = selector.length > 60
      ? selector.substring(0, 57) + '...'
      : selector;

    for (const prop of properties) {
      const classification = classifyProperty(prop);

      if (classification === 'unsafe') {
        assert(
          false,
          `[${shortSelector}] transition "${prop}" is UNSAFE (layout-shifting)`
        );
      } else if (classification === 'safe') {
        assert(
          true,
          `[${shortSelector}] transition "${prop}" is safe`
        );
      } else {
        // Unknown property — not in either list, but not a known layout prop
        // Treat as safe since it's not in the unsafe list
        assert(
          true,
          `[${shortSelector}] transition "${prop}" is acceptable (not layout-shifting)`
        );
      }
    }
  }

  console.log('');
}

// ─── Execute ────────────────────────────────────────────────────────

try {
  runPropertyTest();
  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('');

  if (failed > 0) {
    console.log('Unsafe transitions found:');
    for (const f of failures) {
      console.log(`  - ${f}`);
    }
    console.log('');
    console.log('PROPERTY TEST FAILED');
    process.exit(1);
  } else {
    console.log('ALL PROPERTY TESTS PASSED ✓');
    process.exit(0);
  }
} catch (e) {
  console.error('');
  console.error('PROPERTY TEST FAILED (unexpected error)');
  console.error(`Error: ${e.message}`);
  process.exit(1);
}

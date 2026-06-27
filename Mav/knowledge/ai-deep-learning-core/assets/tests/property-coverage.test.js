/**
 * Property 5: Component Coverage
 *
 * For any non-minimal theme identifier, the CSS file SHALL contain rule blocks
 * addressing all 15 component groups (topnav, sidebar, toc-grid, typography,
 * code, blockquote, callout, table, quiz, pager, settings, search, panel,
 * comments, spacing) under that theme's [data-style] selector.
 *
 * Validates: Requirements 3.5, 10.1, 10.3
 *
 * Run: node property-coverage.test.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────

const CSS_PATH = path.resolve(__dirname, '..', 'style.css');

const NON_MINIMAL_THEMES = ['warm', 'azure', 'cobalt', 'graphite', 'sepia'];

/**
 * Each component group maps to one or more CSS selector patterns.
 * A group is "covered" if at least one rule matching
 * [data-style="themeName"] <componentSelector> exists in the CSS.
 */
const COMPONENT_GROUPS = {
  topnav:     ['.topnav', '.nav-btn', '.nav-links'],
  sidebar:    ['.sidebar'],
  'toc-grid': ['.toc-grid', '.toc-card'],
  typography: ['h1', 'h2', 'h3', 'h4', 'article p'],
  code:       ['pre', 'code', '.copy-btn'],
  blockquote: ['blockquote'],
  callout:    ['.callout'],
  table:      ['.table-wrap', 'table', 'th', 'td'],
  quiz:       ['.quiz-card', '.quiz-option', '.quiz-check'],
  pager:      ['.pager'],
  settings:   ['.settings-pop', '.seg'],
  search:     ['.search-modal', '.search-result'],
  panel:      ['.side-panel'],
  comments:   ['.comments', '.comment', '.like-btn'],
  spacing:    ['.chapter-body', '.sidebar', '.pager']
};

// ─── CSS Parsing Helpers ────────────────────────────────────────────

/**
 * Check whether the CSS content contains at least one rule that matches
 * [data-style="theme"] followed by the given selector pattern.
 *
 * We look for patterns like:
 *   [data-style="warm"] .topnav
 *   [data-style="warm"] h2
 *   [data-style="warm"] .sidebar li a  (still matches .sidebar)
 *
 * The check is intentionally broad — if the selector appears anywhere
 * in a rule prefixed with the theme's data-style attribute selector,
 * it counts as coverage.
 */
function hasThemeRule(css, theme, selector) {
  // Escape special regex characters in the selector
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match [data-style="theme"] followed by whitespace and then the selector
  // The selector could be followed by more specificity (e.g., .sidebar li a)
  // or combinators, so we just need to find it after the theme attribute selector
  const pattern = new RegExp(
    `\\[data-style="${theme}"\\]\\s+${escaped}(?=[\\s,.:{[>~+]|$)`,
    'm'
  );

  return pattern.test(css);
}

/**
 * For the "spacing" group, we need special handling because sidebar and pager
 * also appear in their own groups. For spacing, we specifically check for
 * padding/margin-related rules (not just any rule mentioning the selector).
 */
function hasSpacingRule(css, theme, selector) {
  // Look for rules that set padding or margin on the selector under the theme
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Find the theme+selector pattern and check if it contains padding or margin
  const pattern = new RegExp(
    `\\[data-style="${theme}"\\]\\s+${escaped}[^}]*(?:padding|margin)`,
    's'
  );

  return pattern.test(css);
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
  console.log('Property 5: Component Coverage');
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
  console.log(`Testing ${NON_MINIMAL_THEMES.length} themes × ${Object.keys(COMPONENT_GROUPS).length} component groups = ${NON_MINIMAL_THEMES.length * Object.keys(COMPONENT_GROUPS).length} checks`);
  console.log('');

  // For each non-minimal theme, verify all 15 component groups are covered
  for (const theme of NON_MINIMAL_THEMES) {
    console.log(`Theme: "${theme}"`);

    for (const [group, selectors] of Object.entries(COMPONENT_GROUPS)) {
      let covered = false;

      if (group === 'spacing') {
        // Spacing group: check for padding/margin rules specifically
        for (const selector of selectors) {
          if (hasSpacingRule(css, theme, selector)) {
            covered = true;
            break;
          }
        }
      } else {
        // Standard group: check if at least one selector is present
        for (const selector of selectors) {
          if (hasThemeRule(css, theme, selector)) {
            covered = true;
            break;
          }
        }
      }

      assert(
        covered,
        `[${theme}] ${group} — at least one of [${selectors.join(', ')}] has a rule`
      );
    }

    console.log('');
  }
}

// ─── Execute ────────────────────────────────────────────────────────

try {
  runPropertyTest();
  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('');

  if (failed > 0) {
    console.log('Missing coverage:');
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

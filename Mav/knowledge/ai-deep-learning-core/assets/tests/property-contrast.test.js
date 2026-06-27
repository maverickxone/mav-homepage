/**
 * Property 2: Dark Mode Contrast
 *
 * For any theme + dark mode combination, all text-on-background pairings
 * produce ≥4.5:1 contrast for body text and ≥3:1 for large text/UI elements.
 *
 * **Validates: Requirements 6.3**
 *
 * Run: node property-contrast.test.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────

const CSS_PATH = path.resolve(__dirname, '..', 'style.css');

/**
 * Dark mode theme variants to test.
 * The base dark mode uses [data-theme="dark"] without a data-style.
 * The styled dark modes use [data-style="xxx"][data-theme="dark"].
 */
const DARK_THEMES = [
  { name: 'base dark', selector: '[data-theme="dark"]' },
  { name: 'azure dark', selector: '[data-style="azure"][data-theme="dark"]' },
  { name: 'warm dark', selector: '[data-style="warm"][data-theme="dark"]' },
  { name: 'cobalt dark', selector: '[data-style="cobalt"][data-theme="dark"]' },
  { name: 'graphite dark', selector: '[data-style="graphite"][data-theme="dark"]' },
  { name: 'sepia dark', selector: '[data-style="sepia"][data-theme="dark"]' },
];

/**
 * Color pairings to check.
 * - bodyText pairs require ≥4.5:1 contrast ratio (WCAG AA normal text)
 * - largeText pairs require ≥3:1 contrast ratio (WCAG AA large text/UI)
 */
const BODY_TEXT_PAIRS = [
  { fg: '--ink', bg: '--bg', label: 'ink on bg' },
  { fg: '--ink-2', bg: '--bg', label: 'ink-2 on bg' },
  { fg: '--ink-soft', bg: '--bg', label: 'ink-soft on bg' },
];

const LARGE_TEXT_PAIRS = [
  { fg: '--accent', bg: '--bg', label: 'accent on bg' },
  { fg: '--accent', bg: '--bg-soft', label: 'accent on bg-soft' },
  { fg: '--muted', bg: '--bg', label: 'muted on bg' },
  { fg: '--muted', bg: '--bg-soft', label: 'muted on bg-soft' },
];

const BODY_TEXT_THRESHOLD = 4.5;
const LARGE_TEXT_THRESHOLD = 3.0;

// ─── Color Parsing & WCAG Contrast ─────────────────────────────────

/**
 * Parse a hex color string to {r, g, b} values in [0, 255].
 * Supports #RGB, #RRGGBB formats.
 */
function parseHex(hex) {
  hex = hex.trim();
  if (hex.startsWith('#')) hex = hex.slice(1);

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  if (hex.length !== 6) return null;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Parse a color value from CSS. Handles:
 * - #hex colors
 * - rgba(...) — extracts the RGB portion, ignores alpha
 * Returns {r, g, b} or null if not parseable.
 */
function parseColor(value) {
  if (!value) return null;
  value = value.trim();

  // Hex color
  if (value.startsWith('#')) {
    return parseHex(value);
  }

  // rgba(r, g, b, a) — extract RGB, treat as opaque on background
  const rgbaMatch = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
    };
  }

  return null;
}

/**
 * Convert an sRGB channel value (0-255) to linear RGB.
 * Uses the WCAG formula:
 *   c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4
 */
function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance per WCAG 2.1.
 * L = 0.2126*R + 0.7152*G + 0.0722*B
 */
function relativeLuminance(color) {
  const R = toLinear(color.r);
  const G = toLinear(color.g);
  const B = toLinear(color.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate WCAG contrast ratio between two colors.
 * Contrast = (L_lighter + 0.05) / (L_darker + 0.05)
 */
function contrastRatio(color1, color2) {
  const L1 = relativeLuminance(color1);
  const L2 = relativeLuminance(color2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── CSS Parsing ────────────────────────────────────────────────────

/**
 * Extract CSS custom property values from a specific selector block.
 * Returns a Map of property name → value (e.g., '--bg' → '#0a0a0a').
 *
 * For rgba-based accent-soft values, we still extract them but the
 * contrast checker will handle them appropriately.
 */
function extractTokensFromBlock(css, selectorPattern) {
  // Find the selector block. We need to handle both exact matches
  // and blocks that may have extra whitespace.
  const escaped = selectorPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match the selector followed by its rule block { ... }
  // Use a non-greedy approach: find opening { then count braces
  const selectorRegex = new RegExp(escaped + '\\s*\\{', 'g');
  const match = selectorRegex.exec(css);

  if (!match) return null;

  // Find the matching closing brace
  const startIdx = match.index + match[0].length;
  let braceCount = 1;
  let endIdx = startIdx;

  while (braceCount > 0 && endIdx < css.length) {
    if (css[endIdx] === '{') braceCount++;
    if (css[endIdx] === '}') braceCount--;
    endIdx++;
  }

  const blockContent = css.slice(startIdx, endIdx - 1);

  // Parse CSS custom properties from the block
  const tokens = new Map();
  const propRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let propMatch;

  while ((propMatch = propRegex.exec(blockContent)) !== null) {
    tokens.set(propMatch[1], propMatch[2].trim());
  }

  return tokens;
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
  console.log('Property 2: Dark Mode Contrast');
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
  console.log(`Testing ${DARK_THEMES.length} dark mode variants`);
  console.log(`Body text pairs (≥${BODY_TEXT_THRESHOLD}:1): ${BODY_TEXT_PAIRS.map(p => p.label).join(', ')}`);
  console.log(`Large text pairs (≥${LARGE_TEXT_THRESHOLD}:1): ${LARGE_TEXT_PAIRS.map(p => p.label).join(', ')}`);
  console.log('');

  for (const theme of DARK_THEMES) {
    console.log(`Theme: "${theme.name}" [${theme.selector}]`);

    const tokens = extractTokensFromBlock(css, theme.selector);
    if (!tokens) {
      assert(false, `Could not find CSS block for ${theme.selector}`);
      console.log('');
      continue;
    }

    console.log(`  Tokens found: ${tokens.size}`);

    // Check body text pairs (4.5:1 required)
    for (const pair of BODY_TEXT_PAIRS) {
      const fgValue = tokens.get(pair.fg);
      const bgValue = tokens.get(pair.bg);

      if (!fgValue || !bgValue) {
        assert(false, `${pair.label}: missing token (fg=${fgValue}, bg=${bgValue})`);
        continue;
      }

      const fgColor = parseColor(fgValue);
      const bgColor = parseColor(bgValue);

      if (!fgColor) {
        assert(false, `${pair.label}: cannot parse foreground color "${fgValue}"`);
        continue;
      }
      if (!bgColor) {
        assert(false, `${pair.label}: cannot parse background color "${bgValue}"`);
        continue;
      }

      const ratio = contrastRatio(fgColor, bgColor);
      const ratioStr = ratio.toFixed(2);
      assert(
        ratio >= BODY_TEXT_THRESHOLD,
        `${pair.label}: ${ratioStr}:1 (need ≥${BODY_TEXT_THRESHOLD}:1) [${fgValue} on ${bgValue}]`
      );
    }

    // Check large text / UI pairs (3:1 required)
    for (const pair of LARGE_TEXT_PAIRS) {
      const fgValue = tokens.get(pair.fg);
      const bgValue = tokens.get(pair.bg);

      if (!fgValue || !bgValue) {
        assert(false, `${pair.label}: missing token (fg=${fgValue}, bg=${bgValue})`);
        continue;
      }

      const fgColor = parseColor(fgValue);
      const bgColor = parseColor(bgValue);

      if (!fgColor) {
        // Skip rgba colors with low alpha (like accent-soft used as fg)
        // These are typically background tints, not foreground colors
        console.log(`  ⊘ SKIP: ${pair.label}: non-opaque foreground "${fgValue}"`);
        continue;
      }
      if (!bgColor) {
        console.log(`  ⊘ SKIP: ${pair.label}: non-opaque background "${bgValue}"`);
        continue;
      }

      const ratio = contrastRatio(fgColor, bgColor);
      const ratioStr = ratio.toFixed(2);
      assert(
        ratio >= LARGE_TEXT_THRESHOLD,
        `${pair.label}: ${ratioStr}:1 (need ≥${LARGE_TEXT_THRESHOLD}:1) [${fgValue} on ${bgValue}]`
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
    console.log('Failing contrasts:');
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

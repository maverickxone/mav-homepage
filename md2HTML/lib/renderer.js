'use strict';

const { marked } = require('marked');

/**
 * Create a custom Marked renderer for the design system.
 */
function createRenderer() {
  const renderer = new marked.Renderer();

  renderer.heading = function (text, level) {
    let id = '';
    let cleanText = text;
    const idMatch = text.match(/\s*\{#([^}]+)\}\s*$/);
    if (idMatch) {
      id = idMatch[1];
      cleanText = text.replace(/\s*\{#([^}]+)\}\s*$/, '');
    } else {
      id = cleanText
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    return `<h${level} id="${id}">${cleanText}</h${level}>\n`;
  };

  renderer.code = function (code, lang) {
    const langLabel = lang || '';
    const dataLabel = langLabel ? ` data-label="${langLabel}"` : '';
    const langClass = langLabel ? ` class="language-${langLabel}"` : '';
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre${dataLabel}><code${langClass}>${escaped}</code></pre>\n`;
  };

  renderer.table = function (header, body) {
    return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
  };

  renderer.blockquote = function (quote) {
    return `<blockquote>${quote}</blockquote>\n`;
  };

  return renderer;
}

/**
 * Pre-process extended markdown syntax (:::callout, :::tabs, :::collapsible).
 */
let _collapseCounter = 0;
function preprocessExtendedSyntax(markdown) {
  let result = markdown.replace(/\r\n/g, '\n');

  // :::collapsible
  result = result.replace(
    /^:::collapsible\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      const slug = title.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
      const id = 'collapse-' + (slug || (++_collapseCounter));
      return `<div class="collapsible">
<button class="collapsible-trigger" aria-expanded="false" aria-controls="${id}">
  <span>${title.trim()}</span>
  <svg class="collapsible-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>
</button>
<div class="collapsible-content" id="${id}" hidden>
  <div class="collapsible-inner">

${content.trim()}

  </div>
</div>
</div>`;
    }
  );

  // :::tabs
  result = result.replace(
    /^:::tabs\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, tabNames, content) => {
      const tabs = tabNames.split('|').map(t => t.trim());
      const tabId = 'tabs-' + tabs[0].toLowerCase().replace(/[^\w]+/g, '-');

      const tabContents = [];
      const parts = content.split(/^::tab\s+(.+)$/gm);
      for (let i = 1; i < parts.length; i += 2) {
        tabContents.push({
          name: parts[i].trim(),
          content: (parts[i + 1] || '').trim()
        });
      }

      let tabList = `<div class="tabs"><div class="tabs-list" role="tablist">`;
      tabs.forEach((tab, i) => {
        const panelId = `${tabId}-panel-${i}`;
        const tabBtnId = `${tabId}-tab-${i}`;
        tabList += `<button role="tab" id="${tabBtnId}" aria-controls="${panelId}" aria-selected="${i === 0 ? 'true' : 'false'}" ${i !== 0 ? 'tabindex="-1"' : ''}>${tab}</button>`;
      });
      tabList += `</div>`;

      tabs.forEach((tab, i) => {
        const panelId = `${tabId}-panel-${i}`;
        const tabBtnId = `${tabId}-tab-${i}`;
        const panelContent = tabContents[i] ? tabContents[i].content : '';
        tabList += `<div role="tabpanel" id="${panelId}" aria-labelledby="${tabBtnId}"${i !== 0 ? ' hidden' : ''}>\n\n${panelContent}\n\n</div>`;
      });

      tabList += `</div>`;
      return tabList;
    }
  );

  // :::callout-tip
  result = result.replace(
    /^:::callout-tip\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      return `<div class="callout callout-tip">
<p class="callout-title">${title.trim()}</p>

${content.trim()}

</div>`;
    }
  );

  // :::callout-warn
  result = result.replace(
    /^:::callout-warn\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      return `<div class="callout callout-warn">
<p class="callout-title">${title.trim()}</p>

${content.trim()}

</div>`;
    }
  );

  // :::callout (generic)
  result = result.replace(
    /^:::callout\s+(.+)\n([\s\S]*?)^:::/gm,
    (match, title, content) => {
      return `<div class="callout">
<p class="callout-title">${title.trim()}</p>

${content.trim()}

</div>`;
    }
  );

  return result;
}

/**
 * Convert markdown content to HTML.
 * @param {string} markdown - Raw markdown string
 * @returns {string} HTML string
 */
function renderMarkdown(markdown) {
  marked.setOptions({
    renderer: createRenderer(),
    gfm: true,
    breaks: false
  });

  const preprocessed = preprocessExtendedSyntax(markdown);
  return marked.parse(preprocessed);
}

/**
 * Extract h2/h3 headings from rendered HTML for TOC.
 * @param {string} html - Rendered HTML
 * @returns {Array} Array of {level, id, text}
 */
function extractHeadings(html) {
  const headings = [];
  const regex = /<h([23])\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/h[23]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, '').trim()
    });
  }
  return headings;
}

module.exports = {
  renderMarkdown,
  extractHeadings
};

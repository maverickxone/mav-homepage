#!/usr/bin/env node
// ============================================================
// inject-quiz.js
//
// Injects quiz.css and quiz.js references into built HTML files
// for the 5 AI books. Run AFTER build.
//
// Usage: node inject-quiz.js
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');

const BOOKS = [
  'ai-math-foundations',
  'ai-deep-learning-core',
  'ai-computer-vision',
  'ai-nlp-foundations',
  'ai-transformers',
];

const KNOWLEDGE_DIR = path.resolve(__dirname, '..', 'Mav', 'knowledge');

let totalInjected = 0;

for (const slug of BOOKS) {
  const chaptersDir = path.join(KNOWLEDGE_DIR, slug, 'chapters');
  if (!fs.existsSync(chaptersDir)) {
    console.log(`  ⚠ No chapters dir for ${slug}`);
    continue;
  }

  const htmlFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.html'));

  for (const file of htmlFiles) {
    const filePath = path.join(chaptersDir, file);
    let html = fs.readFileSync(filePath, 'utf-8');

    // Skip if already injected
    if (html.includes('quiz.css')) continue;

    // Inject CSS before </head>
    html = html.replace(
      '</head>',
      '<link rel="stylesheet" href="../assets/quiz.css">\n</head>'
    );

    // Inject mermaid-init.js before </body>
    html = html.replace(
      '</body>',
      '<script src="../assets/mermaid-init.js"></script>\n</body>'
    );

    // Inject JS before </body>
    html = html.replace(
      '</body>',
      '<script src="../assets/quiz.js"></script>\n</body>'
    );

    fs.writeFileSync(filePath, html, 'utf-8');
    totalInjected++;
  }

  console.log(`  ✓ ${slug}: ${htmlFiles.length} files processed`);
}

console.log(`\n  Done! Injected quiz assets into ${totalInjected} HTML files.\n`);

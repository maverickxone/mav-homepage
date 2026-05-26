#!/usr/bin/env node
// ============================================================
// convert-ai-lessons.js
//
// Converts ai-engineering-from-scratch lesson files (en.md + quiz.json)
// into md2HTML-compatible chapter .md files.
//
// Usage:
//   node convert-ai-lessons.js <target-book> [--dry-run]
//
// Example:
//   node convert-ai-lessons.js AI-Math-Foundations
//   node convert-ai-lessons.js AI-Deep-Learning-Core --dry-run
//
// Reads the lesson map below, processes each lesson, outputs to
// markdown-backups/<target-book>/
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================
// Lesson Map: target book → list of source lessons
// ============================================================
const LESSON_MAP = {
  'AI-Math-Foundations': [
    { chapter: 1, src: 'phases/01-math-foundations/01-linear-algebra-intuition', slug: '01-linear-algebra-intuition' },
    { chapter: 2, src: 'phases/01-math-foundations/02-vectors-matrices-operations', slug: '02-vectors-matrices-operations' },
    { chapter: 3, src: 'phases/01-math-foundations/04-calculus-for-ml', slug: '03-calculus-for-ml' },
    { chapter: 4, src: 'phases/01-math-foundations/05-chain-rule-and-autodiff', slug: '04-chain-rule-and-autodiff' },
    { chapter: 5, src: 'phases/01-math-foundations/06-probability-and-distributions', slug: '05-probability-and-distributions' },
    { chapter: 6, src: 'phases/01-math-foundations/08-optimization', slug: '06-optimization' },
    { chapter: 7, src: 'phases/01-math-foundations/12-tensor-operations', slug: '07-tensor-operations' },
    { chapter: 8, src: 'phases/01-math-foundations/13-numerical-stability', slug: '08-numerical-stability' },
  ],
  'AI-Deep-Learning-Core': [
    { chapter: 1, src: 'phases/03-deep-learning-core/01-the-perceptron', slug: '01-the-perceptron' },
    { chapter: 2, src: 'phases/03-deep-learning-core/02-multi-layer-networks', slug: '02-multi-layer-networks' },
    { chapter: 3, src: 'phases/03-deep-learning-core/03-backpropagation', slug: '03-backpropagation' },
    { chapter: 4, src: 'phases/03-deep-learning-core/04-activation-functions', slug: '04-activation-functions' },
    { chapter: 5, src: 'phases/03-deep-learning-core/05-loss-functions', slug: '05-loss-functions' },
    { chapter: 6, src: 'phases/03-deep-learning-core/06-optimizers', slug: '06-optimizers' },
    { chapter: 7, src: 'phases/03-deep-learning-core/07-regularization', slug: '07-regularization' },
    { chapter: 8, src: 'phases/03-deep-learning-core/08-weight-initialization', slug: '08-weight-initialization' },
    { chapter: 9, src: 'phases/03-deep-learning-core/09-learning-rate-schedules', slug: '09-learning-rate-schedules' },
    { chapter: 10, src: 'phases/03-deep-learning-core/10-mini-framework', slug: '10-mini-framework' },
    { chapter: 11, src: 'phases/03-deep-learning-core/11-intro-to-pytorch', slug: '11-intro-to-pytorch' },
    { chapter: 12, src: 'phases/03-deep-learning-core/12-intro-to-jax', slug: '12-intro-to-jax' },
    { chapter: 13, src: 'phases/03-deep-learning-core/13-debugging-neural-networks', slug: '13-debugging-neural-networks' },
  ],
  'AI-Computer-Vision': [
    { chapter: 1, src: 'phases/04-computer-vision/01-image-fundamentals', slug: '01-image-fundamentals' },
    { chapter: 2, src: 'phases/04-computer-vision/02-convolutions-from-scratch', slug: '02-convolutions-from-scratch' },
    { chapter: 3, src: 'phases/04-computer-vision/03-cnns-lenet-to-resnet', slug: '03-cnns-lenet-to-resnet' },
    { chapter: 4, src: 'phases/04-computer-vision/04-image-classification', slug: '04-image-classification' },
    { chapter: 5, src: 'phases/04-computer-vision/05-transfer-learning', slug: '05-transfer-learning' },
  ],
  'AI-NLP-Foundations': [
    { chapter: 1, src: 'phases/05-nlp-foundations-to-advanced/01-text-processing', slug: '01-text-processing' },
    { chapter: 2, src: 'phases/05-nlp-foundations-to-advanced/03-word-embeddings-word2vec', slug: '02-word-embeddings-word2vec' },
    { chapter: 3, src: 'phases/05-nlp-foundations-to-advanced/04-glove-fasttext-subword', slug: '03-glove-fasttext-subword' },
    { chapter: 4, src: 'phases/05-nlp-foundations-to-advanced/08-cnns-rnns-for-text', slug: '04-cnns-rnns-for-text' },
    { chapter: 5, src: 'phases/05-nlp-foundations-to-advanced/09-sequence-to-sequence', slug: '05-sequence-to-sequence' },
    { chapter: 6, src: 'phases/05-nlp-foundations-to-advanced/10-attention-mechanism', slug: '06-attention-mechanism' },
    { chapter: 7, src: 'phases/05-nlp-foundations-to-advanced/19-subword-tokenization', slug: '07-subword-tokenization' },
  ],
  'AI-Transformers': [
    { chapter: 1, src: 'phases/07-transformers-deep-dive/01-why-transformers', slug: '01-why-transformers' },
    { chapter: 2, src: 'phases/07-transformers-deep-dive/02-self-attention-from-scratch', slug: '02-self-attention-from-scratch' },
    { chapter: 3, src: 'phases/07-transformers-deep-dive/03-multi-head-attention', slug: '03-multi-head-attention' },
    { chapter: 4, src: 'phases/07-transformers-deep-dive/04-positional-encoding', slug: '04-positional-encoding' },
    { chapter: 5, src: 'phases/07-transformers-deep-dive/05-full-transformer', slug: '05-full-transformer' },
    { chapter: 6, src: 'phases/07-transformers-deep-dive/06-bert-masked-language-modeling', slug: '06-bert-masked-language-modeling' },
    { chapter: 7, src: 'phases/07-transformers-deep-dive/07-gpt-causal-language-modeling', slug: '07-gpt-causal-language-modeling' },
  ],
};

// ============================================================
// Source root
// ============================================================
const AI_SRC = path.resolve(__dirname, '..', 'ai-engineering-from-scratch');
const MD_BACKUPS = path.resolve(__dirname, '..', 'markdown-backups');

// ============================================================
// Helpers
// ============================================================

/**
 * Extract title from the first H1 line of markdown.
 */
function extractTitle(md) {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

/**
 * Extract time estimate from the meta block (e.g. "**Time:** ~60 minutes").
 */
function extractReadTime(md) {
  const match = md.match(/\*\*Time:\*\*\s*~?(\d+)/);
  return match ? parseInt(match[1]) : 15;
}

/**
 * Extract the blockquote motto (first line after H1 that starts with >).
 */
function extractDescription(md) {
  const match = md.match(/^>\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

/**
 * Strip the header metadata block (everything from start to "## " first section).
 * Keeps the H1 title as the beginning but removes Type/Languages/Prerequisites/Time lines.
 */
function stripMetaBlock(md) {
  // Remove the meta lines (Type, Languages, Prerequisites, Time)
  let result = md.replace(/^\*\*Type:\*\*.+$/gm, '');
  result = result.replace(/^\*\*Languages:\*\*.+$/gm, '');
  result = result.replace(/^\*\*Prerequisites:\*\*.+$/gm, '');
  result = result.replace(/^\*\*Time:\*\*.+$/gm, '');

  // Remove H1 (we use front-matter title instead)
  result = result.replace(/^#\s+.+$/m, '');

  // Clean up excess blank lines at the top
  result = result.replace(/^\n{3,}/, '\n\n');

  return result.trim();
}

/**
 * Convert quiz.json questions into :::quiz blocks.
 */
function quizToMarkdown(quizData) {
  let questions = [];

  // Handle both array format and {questions: [...]} format
  if (Array.isArray(quizData)) {
    questions = quizData;
  } else if (quizData && Array.isArray(quizData.questions)) {
    questions = quizData.questions;
  }

  if (!questions.length) return '';

  let md = '\n\n---\n\n## Self-Check Quiz\n\n';

  for (const q of questions) {
    md += ':::quiz\n';
    md += `question: ${q.question}\n`;
    md += 'options:\n';
    for (const opt of q.options) {
      md += `  - ${opt}\n`;
    }
    md += `correct: ${q.correct}\n`;
    if (q.explanation) {
      md += `explanation: ${q.explanation}\n`;
    }
    md += ':::\n\n';
  }

  return md;
}

/**
 * Build the final md2HTML-compatible markdown file.
 */
function buildChapterMd(lesson, enMd, quizData) {
  const title = extractTitle(enMd);
  const readTime = extractReadTime(enMd);
  const description = extractDescription(enMd);
  const body = stripMetaBlock(enMd);
  const quizMd = quizToMarkdown(quizData);

  const frontMatter = [
    '---',
    `title: "${title}"`,
    `chapter: ${lesson.chapter}`,
    `readTime: ${readTime}`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    '---',
    '',
  ].join('\n');

  return frontMatter + body + quizMd + '\n';
}

// ============================================================
// Main
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const target = args.find(a => !a.startsWith('--'));

  if (!target) {
    console.log('Usage: node convert-ai-lessons.js <BookName> [--dry-run]');
    console.log('Available books:', Object.keys(LESSON_MAP).join(', '));
    process.exit(1);
  }

  const lessons = LESSON_MAP[target];
  if (!lessons) {
    console.error(`Unknown book: ${target}`);
    console.log('Available:', Object.keys(LESSON_MAP).join(', '));
    process.exit(1);
  }

  const outputDir = path.join(MD_BACKUPS, target);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n📖 Converting ${lessons.length} lessons → ${target}/\n`);

  let successCount = 0;

  for (const lesson of lessons) {
    const lessonDir = path.join(AI_SRC, lesson.src);
    const enMdPath = path.join(lessonDir, 'docs', 'en.md');
    const quizPath = path.join(lessonDir, 'quiz.json');

    if (!fs.existsSync(enMdPath)) {
      console.log(`  ⚠ SKIP ${lesson.slug} — no docs/en.md`);
      continue;
    }

    const enMd = fs.readFileSync(enMdPath, 'utf-8');

    let quizData = null;
    if (fs.existsSync(quizPath)) {
      try {
        quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
      } catch (e) {
        console.log(`  ⚠ Quiz parse error for ${lesson.slug}: ${e.message}`);
      }
    }

    const output = buildChapterMd(lesson, enMd, quizData);
    const outputFile = path.join(outputDir, `${lesson.slug}.md`);

    if (dryRun) {
      console.log(`  [DRY] ${lesson.slug}.md — ${output.length} chars`);
    } else {
      fs.writeFileSync(outputFile, output, 'utf-8');
      console.log(`  ✓ ${lesson.slug}.md`);
    }
    successCount++;
  }

  console.log(`\n  Done! ${successCount}/${lessons.length} lessons converted.`);
  if (dryRun) console.log('  (dry-run mode — no files written)');
  console.log('');
}

main();

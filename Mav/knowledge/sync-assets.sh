#!/bin/bash
# sync-assets.sh
# Copies style.css and script.js from ai-deep-learning-core/assets/ to all other knowledge book assets/ directories.
# This ensures cross-book consistency (Requirements 9.1, 9.2, 9.3).
#
# Usage: Run from the knowledge/ directory, or from anywhere — the script resolves its own location.
#   ./sync-assets.sh
#
# Source of truth: ai-deep-learning-core/assets/
# Targets: All other book directories that contain an assets/ subdirectory.
#
# Book directories with assets/ (23 total, 22 targets excluding source):
#   ai-computer-vision
#   ai-math-foundations
#   ai-nlp-foundations
#   ai-transformers
#   bite-to-byte-硬件篇
#   blockchain-crypto
#   browser-war
#   claude-code
#   claude-d2l-to-rnn
#   d2l-cnn
#   d2l-rnn
#   d2l-toolbox
#   data-structures
#   euv-lithography
#   git-guide
#   math-analysis
#   money-bank
#   pdf-explained
#   rust-book
#   server-frontend-backend
#   thermodynamics
#   video-screen
#
# Note: Directories without an assets/ subdirectory (e.g., graph, projects) are auto-skipped.

set -e

# Resolve the directory where this script lives (the knowledge/ directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

SOURCE_DIR="$SCRIPT_DIR/ai-deep-learning-core/assets"
SOURCE_CSS="$SOURCE_DIR/style.css"
SOURCE_JS="$SOURCE_DIR/script.js"

# Verify source files exist
if [ ! -f "$SOURCE_CSS" ]; then
  echo "ERROR: Source file not found: $SOURCE_CSS"
  exit 1
fi
if [ ! -f "$SOURCE_JS" ]; then
  echo "ERROR: Source file not found: $SOURCE_JS"
  exit 1
fi

echo "=== Knowledge Library Asset Sync ==="
echo "Source: $SOURCE_DIR"
echo "Files: style.css, script.js"
echo ""

copied=0
skipped=0

# Iterate over all directories in knowledge/ that have an assets/ subdirectory
for book_dir in "$SCRIPT_DIR"/*/; do
  book_name="$(basename "$book_dir")"

  # Skip the source directory itself
  if [ "$book_name" = "ai-deep-learning-core" ]; then
    continue
  fi

  # Skip directories without an assets/ subdirectory
  if [ ! -d "$book_dir/assets" ]; then
    skipped=$((skipped + 1))
    echo "  SKIP: $book_name (no assets/ directory)"
    continue
  fi

  # Copy files
  cp "$SOURCE_CSS" "$book_dir/assets/style.css"
  cp "$SOURCE_JS" "$book_dir/assets/script.js"
  copied=$((copied + 1))
  echo "  DONE: $book_name"
done

echo ""
echo "=== Sync Complete ==="
echo "Copied to: $copied books"
echo "Skipped:   $skipped directories"
echo "Source:    ai-deep-learning-core/assets/"

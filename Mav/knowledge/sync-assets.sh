#!/bin/bash
# sync-assets.sh
# Copies style.css and script.js from ai-deep-learning-core/assets/ to all other
# knowledge book assets/ directories.
#
# SAFETY CHANGES (2026-07):
# - Default mode is DRY-RUN. Use --force to actually copy.
# - Respects md2HTML/build-lock.yaml: any entry matching
#   "<book-slug>/assets/style.css" or "<book-slug>/assets/script.js" is skipped.
#
# Usage:
#   ./sync-assets.sh            # dry-run: list what would change
#   ./sync-assets.sh --force    # actually copy, but still skip locked files

set -e

# Resolve the directory where this script lives (the knowledge/ directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

SOURCE_DIR="$SCRIPT_DIR/ai-deep-learning-core/assets"
SOURCE_CSS="$SOURCE_DIR/style.css"
SOURCE_JS="$SOURCE_DIR/script.js"
LOCK_FILE="$(dirname "$(dirname "$SCRIPT_DIR")")/md2HTML/build-lock.yaml"

# Verify source files exist
if [ ! -f "$SOURCE_CSS" ]; then
  echo "ERROR: Source file not found: $SOURCE_CSS"
  exit 1
fi
if [ ! -f "$SOURCE_JS" ]; then
  echo "ERROR: Source file not found: $SOURCE_JS"
  exit 1
fi

FORCE=false
if [ "$1" = "--force" ]; then
  FORCE=true
elif [ -n "$1" ]; then
  echo "Unknown argument: $1"
  echo "Usage: $0 [--force]"
  exit 1
fi

# Parse build-lock.yaml into a newline-separated list of normalized entries.
# Assumes the simple YAML format:
#   locked:
#     - BookName/chapter.md
#     - slug/assets/filename
locked_list=""
if [ -f "$LOCK_FILE" ]; then
  # Strip leading "- " and inline spaces/tabs, but keep line breaks for grep.
  locked_list="$(sed -n 's/^[[:space:]]*-[[:space:]]*//p' "$LOCK_FILE" | tr -d ' \t')"
fi

is_locked() {
  echo "$locked_list" | grep -qx "$1"
}

echo "=== Knowledge Library Asset Sync ==="
echo "Source: $SOURCE_DIR"
echo "Files:  style.css, script.js"
echo "Lock:   $LOCK_FILE"
if [ "$FORCE" = false ]; then
  echo "Mode:   DRY-RUN (use --force to apply)"
fi
echo ""

copied=0
skipped_lock=0
skipped_no_assets=0
would_copy=0

# Iterate over all directories in knowledge/ that have an assets/ subdirectory
for book_dir in "$SCRIPT_DIR"/*/; do
  book_name="$(basename "$book_dir")"

  # Skip the source directory itself
  if [ "$book_name" = "ai-deep-learning-core" ]; then
    continue
  fi

  # Skip directories without an assets/ subdirectory
  if [ ! -d "$book_dir/assets" ]; then
    skipped_no_assets=$((skipped_no_assets + 1))
    echo "  SKIP: $book_name (no assets/ directory)"
    continue
  fi

  for file in style.css script.js; do
    lock_key="$book_name/assets/$file"
    target="$book_dir/assets/$file"

    if is_locked "$lock_key"; then
      skipped_lock=$((skipped_lock + 1))
      echo "  LOCK: $book_name/$file (build-lock.yaml)"
      continue
    fi

    if [ "$FORCE" = true ]; then
      cp "$SOURCE_DIR/$file" "$target"
      copied=$((copied + 1))
      echo "  DONE: $book_name/$file"
    else
      would_copy=$((would_copy + 1))
      echo "  WOULD: $book_name/$file"
    fi
  done
done

echo ""
if [ "$FORCE" = true ]; then
  echo "=== Sync Complete ==="
  echo "Copied:        $copied files"
  echo "Locked skip:   $skipped_lock files"
  echo "No assets/:    $skipped_no_assets directories"
  echo "Source:        ai-deep-learning-core/assets/"
else
  echo "=== Dry Run Complete ==="
  echo "Would copy:    $would_copy files"
  echo "Locked skip:   $skipped_lock files"
  echo "No assets/:    $skipped_no_assets directories"
  echo ""
  echo "To apply changes, run: $0 --force"
fi

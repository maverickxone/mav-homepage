#!/bin/bash
# md2HTML Build Script
# Usage:
#   ./build-all.sh <book-name>   Build a single book (folder name in markdown-backups/)
#   ./build-all.sh --all         Build all books
#   ./build-all.sh               Show usage

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BOOKS_DIR="$(dirname "$SCRIPT_DIR")/markdown-backups"
OUTPUT_BASE="$(dirname "$SCRIPT_DIR")/Mav/knowledge"

build_book() {
  local book_dir="$1"
  local book_name=$(basename "$book_dir")

  # Skip original-backups subdirectories
  if [ "$book_name" = "original-backups" ]; then
    return
  fi

  echo "--- Building: $book_name ---"

  # Clean content directory and dist
  rm -rf "$SCRIPT_DIR/content/"*.md "$SCRIPT_DIR/content/"*.yaml
  rm -rf "$SCRIPT_DIR/dist"

  # Copy book files to content/
  cp "$book_dir"/*.yaml "$SCRIPT_DIR/content/" 2>/dev/null
  cp "$book_dir"/*.md "$SCRIPT_DIR/content/" 2>/dev/null

  # Run build
  cd "$SCRIPT_DIR"
  node build.js

  if [ $? -eq 0 ]; then
    # Convert book name to lowercase kebab for URL friendliness
    slug=$(echo "$book_name" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
    rm -rf "$OUTPUT_BASE/$slug"
    mkdir -p "$OUTPUT_BASE/$slug"
    cp -r "$SCRIPT_DIR/dist/"* "$OUTPUT_BASE/$slug/"
    echo "  ✓ Output: $OUTPUT_BASE/$slug/"
  else
    echo "  ✗ Build failed for $book_name"
    return 1
  fi

  echo ""
}

# --- Main ---

if [ $# -eq 0 ]; then
  echo "Usage:"
  echo "  ./build-all.sh <book-name>   Build a single book"
  echo "  ./build-all.sh --all         Build all books"
  echo ""
  echo "Available books:"
  for d in "$BOOKS_DIR"/*/; do
    name=$(basename "$d")
    if [ "$name" != "original-backups" ]; then
      echo "  $name"
    fi
  done
  exit 0
fi

echo "=== md2HTML Build ==="
echo "Source: $BOOKS_DIR"
echo "Output: $OUTPUT_BASE"
echo ""

if [ "$1" = "--all" ]; then
  for book_dir in "$BOOKS_DIR"/*/; do
    build_book "$book_dir"
  done
else
  target="$BOOKS_DIR/$1"
  if [ ! -d "$target" ]; then
    echo "Error: Book '$1' not found in $BOOKS_DIR"
    echo ""
    echo "Available books:"
    for d in "$BOOKS_DIR"/*/; do
      name=$(basename "$d")
      if [ "$name" != "original-backups" ]; then
        echo "  $name"
      fi
    done
    exit 1
  fi
  build_book "$target"
fi

echo "=== Done ==="

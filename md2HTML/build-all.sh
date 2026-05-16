#!/bin/bash
# Build all 7 books from markdown-restructure-backups into separate dist folders

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BOOKS_DIR="$(dirname "$SCRIPT_DIR")/markdown-restructure-backups"
OUTPUT_BASE="$(dirname "$SCRIPT_DIR")/Mav/knowledge"

echo "=== md2HTML Batch Build ==="
echo "Source: $BOOKS_DIR"
echo "Output: $OUTPUT_BASE"
echo ""

for book_dir in "$BOOKS_DIR"/*/; do
  book_name=$(basename "$book_dir")
  
  # Skip original-backups subdirectories
  if [ "$book_name" = "original-backups" ]; then
    continue
  fi

  echo "--- Building: $book_name ---"
  
  # Clean content directory and dist
  rm -rf "$SCRIPT_DIR/content/"*.md "$SCRIPT_DIR/content/"*.yaml
  rm -rf "$SCRIPT_DIR/dist"
  
  # Copy book files to content/
  cp "$book_dir"*.yaml "$SCRIPT_DIR/content/" 2>/dev/null
  cp "$book_dir"*.md "$SCRIPT_DIR/content/" 2>/dev/null
  
  # Run build
  cd "$SCRIPT_DIR"
  node build.js
  
  if [ $? -eq 0 ]; then
    # Create output directory and copy dist
    # Convert book name to lowercase kebab for URL friendliness
    slug=$(echo "$book_name" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
    rm -rf "$OUTPUT_BASE/$slug"
    mkdir -p "$OUTPUT_BASE/$slug"
    cp -r "$SCRIPT_DIR/dist/"* "$OUTPUT_BASE/$slug/"
    echo "  ✓ Output: $OUTPUT_BASE/$slug/"
  else
    echo "  ✗ Build failed for $book_name"
  fi
  
  echo ""
done

echo "=== Done ==="
echo "All books built to: $OUTPUT_BASE/"

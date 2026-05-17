#!/bin/bash
# md2HTML Build Script (thin wrapper around build.js)
#
# Usage:
#   ./build-all.sh Browser-War                    Build entire book
#   ./build-all.sh Browser-War/01-xxx.md          Build single chapter
#   ./build-all.sh Browser-War/book.yaml          Build index only
#   ./build-all.sh --lock <path>                  Lock a file
#   ./build-all.sh --unlock <path>                Unlock a file
#   ./build-all.sh --list-lock                    List locked files
#   ./build-all.sh --force Browser-War            Force build (ignore lock)
#   ./build-all.sh --all                          Build ALL books (use with caution!)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BOOKS_DIR="$(dirname "$SCRIPT_DIR")/markdown-backups"

if [ $# -eq 0 ]; then
  cd "$SCRIPT_DIR" && node build.js
  exit 0
fi

# Handle --all: iterate over all book directories
if [ "$1" = "--all" ]; then
  echo "⚠️  Building ALL books. Locked files will be skipped."
  echo ""
  for book_dir in "$BOOKS_DIR"/*/; do
    name=$(basename "$book_dir")
    if [ "$name" != "original-backups" ]; then
      cd "$SCRIPT_DIR" && node build.js "$name"
    fi
  done
  echo "=== All done ==="
  exit 0
fi

# Pass all arguments directly to build.js
cd "$SCRIPT_DIR" && node build.js "$@"

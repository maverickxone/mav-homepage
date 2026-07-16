#!/bin/bash
# md2HTML Build Script (thin wrapper around build.js)
#
# Usage:
#   ./build-all.sh --book Browser-War                    Build entire book
#   ./build-all.sh --book Browser-War/01-xxx.md          Build one book chapter
#   ./build-all.sh --book Browser-War/book.yaml          Build book index only
#   ./build-all.sh --series Deep-Learning                Build entire series
#   ./build-all.sh --series Deep-Learning/01-toolbox/01-why-pytorch.md
#   ./build-all.sh --lock <path>                  Lock a file
#   ./build-all.sh --unlock <path>                Unlock a file
#   ./build-all.sh --list-lock                    List locked files
#   ./build-all.sh --force --book Browser-War     Force build (ignore lock)
#
# NOTE: --all is intentionally removed. Building all books at once overwrites
# per-book frontend customizations. See note4ai.md for details.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Explicitly reject --all to prevent accidental mass overwrites.
for arg in "$@"; do
  if [ "$arg" = "--all" ]; then
    echo "❌ --all is disabled."
    echo "   Building all books at once overwrites per-book frontend customizations."
    echo "   See note4ai.md for the recommended targeted build workflow."
    exit 1
  fi
done

cd "$SCRIPT_DIR" && node build.js "$@"

#!/bin/bash
# Fetches exercise GIF animations from hasaneyldrm/exercises-dataset
# Run from project root: bash setup-gifs.sh

set -e

DEST="app/public/videos"
REPO="https://github.com/hasaneyldrm/exercises-dataset.git"
TMP_DIR=".tmp-exercises-dataset"

if [ -d "$DEST" ] && [ "$(ls -A "$DEST" 2>/dev/null)" ]; then
  echo "GIFs already present in $DEST ($(ls "$DEST"/*.gif 2>/dev/null | wc -l) files). Skipping."
  exit 0
fi

echo "Cloning exercises-dataset (shallow)..."
git clone --depth 1 "$REPO" "$TMP_DIR"

echo "Copying GIFs to $DEST..."
mkdir -p "$DEST"
cp "$TMP_DIR/videos/"*.gif "$DEST/"

echo "Cleaning up..."
rm -rf "$TMP_DIR"

echo "Done. $(ls "$DEST"/*.gif | wc -l) GIFs copied to $DEST"

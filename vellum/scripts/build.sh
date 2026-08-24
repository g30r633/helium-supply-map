#!/usr/bin/env bash
# Package the extension for the Chrome Web Store.
# Only ships extension/ — docs and scripts stay out of the zip.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="$(node -p "require('$root/extension/manifest.json').version")"
out="$root/dist/vellum-$version.zip"

node "$root/scripts/verify.js"

mkdir -p "$root/dist"
rm -f "$out"
(cd "$root/extension" && zip -qr "$out" . -x '.*' -x '__MACOSX/*' -x '*/.DS_Store')

echo "built $out ($(du -h "$out" | cut -f1))"

#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
release_dir="$project_dir/release"
archive="$release_dir/MeshOps-v1.0.1-itch.zip"
staging_dir="$(mktemp -d)"
trap 'rm -rf "$staging_dir"' EXIT

mkdir -p "$release_dir"
rm -f "$archive"
cp -a "$project_dir/dist/client/." "$staging_dir/"

# itch.io serves HTML games below a generated path, so root-relative assets
# must become archive-relative without changing the Sites production build.
find "$staging_dir" -type f \( -name '*.html' -o -name '*.rsc' \) \
  -exec sed -i 's#/assets/#./assets/#g; s#/favicon\.svg#./favicon.svg#g' {} +

if grep -R -E '(^|[^.])/(assets/|favicon[.]svg)' "$staging_dir" --include='*.html' --include='*.rsc'; then
  echo "Root-relative asset remained in itch.io staging output." >&2
  exit 1
fi

(cd "$staging_dir" && zip -qr "$archive" .)
echo "$archive"

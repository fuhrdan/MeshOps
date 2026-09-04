#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
page="$project_dir/app/page.tsx"
styles="$project_dir/app/globals.css"

grep -q 'v1.0.1' "$page"
grep -q 'Quick tutorial' "$page"
grep -q 'Open command console' "$page"
grep -q "Explain it like I’m five" "$page"
grep -q 'Start screen' "$page"
grep -q 'About 90 seconds' "$page"
grep -q 'No quiz · no setup · plain language' "$page"
grep -q 'entry-choice' "$styles"
grep -q 'lesson-rail' "$styles"
grep -q 'six-step' "$project_dir/docs/quick-start-tutorial.md"
grep -q 'cover, tutorial, and console' "$project_dir/docs/adr/0011-cover-and-tutorial.md"
grep -q 'version.*1.0.1' "$project_dir/package.json"

echo 'Cover screen and quick-start tutorial contracts validated.'

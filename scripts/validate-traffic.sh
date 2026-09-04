#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
grep -q 'attempts: 2' "$project_dir/deploy/istio/traffic/resilience.yaml"
grep -q 'timeout: 750ms' "$project_dir/deploy/istio/traffic/resilience.yaml"
grep -q 'weight: 90' "$project_dir/deploy/istio/traffic/catalog-canary.yaml"
grep -q 'weight: 10' "$project_dir/deploy/istio/traffic/catalog-canary.yaml"
grep -q 'Apply & observe' "$project_dir/app/page.tsx"
echo "Traffic engineering contracts valid."

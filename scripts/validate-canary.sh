#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
page="$project_dir/app/page.tsx"
for stage in 5 10 25 50 100; do grep -Eq "canaryStages = \[5, 10, 25, 50, 100\]|$stage" "$page"; done
for scenario in bad-deployment memory-leak slow-db malformed-response dependency-mismatch cache-stampede; do grep -q "$scenario" "$page"; done
grep -q 'weight: 95' "$project_dir/deploy/istio/canary/catalog-routing.yaml"
grep -q 'weight: 5' "$project_dir/deploy/istio/canary/catalog-routing.yaml"
grep -q 'histogram_quantile(0.99' "$project_dir/scripts/analyze-canary.sh"
echo "Canary Commander contracts valid."

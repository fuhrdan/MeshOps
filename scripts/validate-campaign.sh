#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
page="$project_dir/app/page.tsx"

grep -q 'v1.0 Full Incident Commander' "$page"
grep -q 'Campaign command' "$page"
grep -q 'Export after-action report' "$page"
for mission in restore-service guard-release trace-root-cause prove-resilience contain-breach; do
  grep -q "$mission" "$page"
done
for call_sign in REDLINE 'NARROW GATE' NEEDLE BULKHEAD LOCKBOX; do
  grep -q "$call_sign" "$page"
done
grep -q 'version.*1.0.1' "$project_dir/package.json"
grep -q 'version: 1.0.1' "$project_dir/deploy/kubernetes/Chart.yaml"
grep -q 'five-mission campaign' "$project_dir/docs/incident-commander-campaign.md"
grep -q 'preflight' "$project_dir/scripts/campaign.sh"
grep -q 'status' "$project_dir/scripts/campaign.sh"

echo 'Campaign contracts validated.'

#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fault_dir="$project_dir/deploy/istio/faults"
faults=(payments-latency inventory-errors catalog-brownout auth-failure orders-latency)

for fault in "${faults[@]}"; do
  file="$fault_dir/$fault.yaml"
  test -f "$file" || { echo "Missing incident manifest: $file" >&2; exit 1; }
  grep -q '^kind: VirtualService$' "$file"
  grep -q 'app.kubernetes.io/component: incident-fault' "$file"
  grep -q "meshops.dev/fault-id: $fault" "$file"
  grep -q 'fault:' "$file"
  grep -q 'number: 8080' "$file"
done

ui="$project_dir/app/page.tsx"
for fault in "${faults[@]}"; do
  grep -q "$fault" "$ui" || { echo "Browser incident twin missing: $fault" >&2; exit 1; }
done

grep -q 'Guided' "$ui"
grep -q 'Standard' "$ui"
grep -q 'Senior' "$ui"
grep -q 'Commander' "$ui"
grep -q 'Wrong calls' "$ui"
grep -q 'Confirm diagnosis' "$ui"
grep -q 'Remove fault & recover' "$ui"

echo "Five incident twins, four difficulty levels, diagnosis flow, and recovery contracts validated."

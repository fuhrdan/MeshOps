#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
manifest="$project_dir/deploy/istio/canary/catalog-routing.yaml"
action="${1:-status}"
weight="${2:-}"

set_weight() {
  local next="$1" stable=$((100-next))
  [[ "$next" =~ ^(5|10|25|50|100)$ ]] || { echo "Stage must be 5, 10, 25, 50, or 100." >&2; exit 2; }
  kubectl -n meshops patch virtualservice catalog-progressive --type=json -p="[{\"op\":\"replace\",\"path\":\"/spec/http/0/route/0/weight\",\"value\":$stable},{\"op\":\"replace\",\"path\":\"/spec/http/0/route/1/weight\",\"value\":$next}]"
}

case "$action" in
  start) kubectl apply -f "$project_dir/deploy/istio/canary/catalog-canary-deployment.yaml"; kubectl apply -f "$manifest" ;;
  stage) set_weight "$weight" ;;
  hold) kubectl -n meshops annotate virtualservice catalog-progressive meshops.dev/held=true --overwrite ;;
  rollback) set_weight 5; kubectl -n meshops scale deployment catalog-canary --replicas=0 ;;
  promote) set_weight 100; kubectl -n meshops annotate virtualservice catalog-progressive meshops.dev/promoted=true --overwrite ;;
  status) kubectl -n meshops get deployment catalog-canary; kubectl -n meshops get virtualservice catalog-progressive -o yaml ;;
  *) echo "Usage: $0 {start|stage <5|10|25|50|100>|hold|rollback|promote|status}" >&2; exit 2 ;;
esac

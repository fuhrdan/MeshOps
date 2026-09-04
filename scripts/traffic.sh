#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
traffic_dir="$project_dir/deploy/istio/traffic"
action="${1:-list}"
profile="${2:-}"

case "$action" in
  list) find "$traffic_dir" -maxdepth 1 -name '*.yaml' -printf '%f\n' | sed 's/\.yaml$//' | sort ;;
  apply)
    [[ -n "$profile" && -f "$traffic_dir/$profile.yaml" ]] || { echo "Unknown traffic profile: $profile" >&2; exit 2; }
    kubectl apply -f "$traffic_dir/$profile.yaml"
    ;;
  status) kubectl -n meshops get virtualservice,destinationrule -l app.kubernetes.io/component=traffic-policy ;;
  clear) kubectl -n meshops delete virtualservice,destinationrule -l app.kubernetes.io/component=traffic-policy --ignore-not-found ;;
  *) echo "Usage: $0 {list|apply <profile>|status|clear}" >&2; exit 2 ;;
esac

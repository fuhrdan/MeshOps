#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fault_dir="$project_dir/deploy/istio/faults"
namespace="meshops"

faults=(payments-latency inventory-errors catalog-brownout auth-failure orders-latency)

usage() {
  cat <<USAGE
MeshOps v0.4.0 incident controller

Usage:
  bash scripts/incident.sh list
  bash scripts/incident.sh apply <fault-id>
  bash scripts/incident.sh clear
  bash scripts/incident.sh status

Fault IDs:
  ${faults[*]}
USAGE
}

is_fault() {
  local candidate="${1:-}"
  for fault in "${faults[@]}"; do
    [[ "$candidate" == "$fault" ]] && return 0
  done
  return 1
}

command="${1:-}"
case "$command" in
  list)
    printf '%s\n' "${faults[@]}"
    ;;
  apply)
    fault="${2:-}"
    if ! is_fault "$fault"; then
      echo "Unknown fault: ${fault:-<missing>}" >&2
      usage >&2
      exit 64
    fi
    kubectl -n "$namespace" delete virtualservice -l app.kubernetes.io/component=incident-fault --ignore-not-found >/dev/null
    kubectl apply -f "$fault_dir/$fault.yaml"
    echo "Applied MeshOps fault '$fault'. Clear it with: bash scripts/incident.sh clear"
    ;;
  clear)
    kubectl -n "$namespace" delete virtualservice -l app.kubernetes.io/component=incident-fault --ignore-not-found
    ;;
  status)
    kubectl -n "$namespace" get virtualservice -l app.kubernetes.io/component=incident-fault -o wide
    ;;
  *)
    usage
    [[ -z "$command" ]] || exit 64
    ;;
esac

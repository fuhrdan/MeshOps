#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
action="${1:-brief}"

brief() {
  printf '%s\n' \
    'MeshOps v1.0.1 — Full Incident Commander campaign' \
    '01 REDLINE     Diagnose and recover a payment latency incident' \
    '02 NARROW GATE Roll back an unsafe canary release' \
    '03 NEEDLE      Confirm the first failing distributed span' \
    '04 BULKHEAD    Validate dependency-timeout resilience' \
    '05 LOCKBOX     Contain a stolen workload identity' \
    '' \
    'Browser missions use deterministic twins. Real-lab actions remain explicit in their existing scripts.'
}

preflight() {
  local validators=(
    validate-services.sh validate-mesh.sh validate-incidents.sh validate-traffic.sh
    validate-canary.sh validate-tracing.sh validate-resilience.sh validate-security-chaos.sh
    validate-campaign.sh
  )
  for validator in "${validators[@]}"; do
    bash "$project_dir/scripts/$validator"
  done
}

status() {
  command -v kubectl >/dev/null || { echo 'kubectl is required for real-lab status.' >&2; exit 69; }
  kubectl -n meshops get pods,gateway,httproute
  kubectl -n meshops get virtualservice,destinationrule,authorizationpolicy,peerauthentication 2>/dev/null || true
  kubectl -n meshops get networkpolicy,networkchaos,podchaos,stresschaos 2>/dev/null || true
}

case "$action" in
  brief) brief ;;
  preflight) preflight ;;
  status) status ;;
  *) echo "Usage: $0 {brief|preflight|status}" >&2; exit 64 ;;
esac

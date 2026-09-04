#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
action="${1:-status}"

case "$action" in
  apply)
    kubectl apply -f "$project_dir/deploy/istio/resilience/policies.yaml"
    helm upgrade --install meshops "$project_dir/deploy/kubernetes"
    ;;
  experiment)
    case "${2:-}" in
      dependency-timeout) "$project_dir/scripts/incident.sh" apply payments-latency ;;
      retry-storm) "$project_dir/scripts/incident.sh" apply inventory-errors ;;
      *) echo "Real lab experiments: dependency-timeout or retry-storm" >&2; exit 2 ;;
    esac
    ;;
  load)
    kubectl create -f "$project_dir/deploy/loadtest/fortio.yaml"
    ;;
  status)
    kubectl -n meshops get destinationrule,virtualservice,poddisruptionbudget,hpa -l app.kubernetes.io/component=resilience-policy
    ;;
  clear)
    "$project_dir/scripts/incident.sh" clear
    kubectl delete -f "$project_dir/deploy/istio/resilience/policies.yaml" --ignore-not-found
    ;;
  *) echo "Usage: $0 {apply|experiment <dependency-timeout|retry-storm>|load|status|clear}" >&2; exit 2 ;;
esac

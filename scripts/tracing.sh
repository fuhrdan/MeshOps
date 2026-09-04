#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
action="${1:-status}"

case "$action" in
  install)
    kubectl apply -f "$project_dir/deploy/observability/tempo.yaml"
    kubectl apply -f "$project_dir/deploy/observability/otel-collector.yaml"
    kubectl apply -f "$project_dir/deploy/istio/telemetry/default.yaml"
    kubectl -n meshops rollout status deployment/tempo --timeout=120s
    kubectl -n meshops rollout status deployment/opentelemetry-collector --timeout=120s
    ;;
  status) kubectl -n meshops get deployment,service -l app.kubernetes.io/component=tracing ;;
  logs) kubectl -n meshops logs deployment/opentelemetry-collector --tail=100 ;;
  port-forward) kubectl -n meshops port-forward service/tempo 3200:3200 ;;
  *) echo "Usage: $0 {install|status|logs|port-forward}" >&2; exit 2 ;;
esac

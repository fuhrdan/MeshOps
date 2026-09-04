#!/usr/bin/env bash
set -euo pipefail

for tool in kubectl istioctl; do
  command -v "$tool" >/dev/null 2>&1 || { echo "$tool is required" >&2; exit 1; }
done

kubectl -n meshops get peerauthentication default
kubectl -n meshops get gateway meshops-gateway
kubectl -n meshops get httproute meshops
kubectl -n meshops get deployment prometheus
kubectl -n meshops get deployment opentelemetry-collector
kubectl -n meshops get deployment tempo

not_ready="$(kubectl -n meshops get pods -l app.kubernetes.io/part-of=meshops -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.containerStatuses[*].ready}{"\n"}{end}' | grep -vc 'true true$' || true)"
if [[ "$not_ready" -ne 0 ]]; then
  echo "$not_ready MeshOps pods do not have both application and sidecar containers ready." >&2
  exit 1
fi

istioctl proxy-status
kubectl -n meshops exec deployment/ops-telemetry -c ops-telemetry -- \
  node -e 'fetch("http://127.0.0.1:8080/api/snapshot").then((response) => { if (!response.ok) process.exit(1) })'
echo "MeshOps service mesh is ready."

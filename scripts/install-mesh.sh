#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for tool in kubectl istioctl helm; do
  command -v "$tool" >/dev/null 2>&1 || { echo "$tool is required" >&2; exit 1; }
done

kubectl get crd gateways.gateway.networking.k8s.io >/dev/null 2>&1 || {
  echo "Install the Kubernetes Gateway API CRDs before running this script." >&2
  exit 1
}

istioctl install -f "$project_dir/deploy/istio/profiles/meshops.yaml" -y
helm upgrade --install meshops "$project_dir/deploy/kubernetes"
kubectl apply -f "$project_dir/deploy/observability"
kubectl apply -f "$project_dir/deploy/istio/gateway"
kubectl apply -f "$project_dir/deploy/istio/routes"
kubectl apply -f "$project_dir/deploy/istio/policies"
kubectl apply -f "$project_dir/deploy/istio/telemetry"
kubectl -n meshops rollout status deployment --all --timeout=180s
"$project_dir/scripts/verify-mesh.sh"

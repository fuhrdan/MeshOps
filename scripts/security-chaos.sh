#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
action="${1:-status}"

require_training_namespace() {
  kubectl get crd networkchaos.chaos-mesh.org >/dev/null 2>&1 || { echo "Chaos Mesh CRDs are required." >&2; exit 2; }
  environment="$(kubectl get namespace meshops -o jsonpath='{.metadata.labels.meshops\.dev/environment}')"
  allowed="$(kubectl get namespace meshops -o jsonpath='{.metadata.annotations.meshops\.dev/allow-chaos}')"
  [[ "$environment" == "training" && "$allowed" == "true" ]] || {
    echo "Chaos is locked. Label meshops.dev/environment=training and annotate meshops.dev/allow-chaos=true only on a disposable lab namespace." >&2
    exit 2
  }
  [[ "${3:-}" == "--confirm" ]] || { echo "Add --confirm after the scenario name." >&2; exit 2; }
}

case "$action" in
  apply-zero-trust)
    kubectl apply -f "$project_dir/deploy/istio/security/zero-trust.yaml"
    kubectl apply -f "$project_dir/deploy/kubernetes/security/network-policies.yaml"
    ;;
  chaos)
    require_training_namespace "$@"
    case "${2:-}" in
      payment-network-delay) kubectl apply -f "$project_dir/deploy/chaos/payment-network-delay.yaml" ;;
      orders-pod-failure) kubectl apply -f "$project_dir/deploy/chaos/orders-pod-failure.yaml" ;;
      search-cpu-stress) kubectl apply -f "$project_dir/deploy/chaos/search-cpu-stress.yaml" ;;
      *) echo "Scenario: payment-network-delay, orders-pod-failure, or search-cpu-stress" >&2; exit 2 ;;
    esac
    ;;
  status)
    kubectl -n meshops get requestauthentication,authorizationpolicy,sidecar,networkpolicy
    kubectl -n meshops get networkchaos,podchaos,stresschaos 2>/dev/null || true
    ;;
  clear-chaos)
    kubectl -n meshops delete networkchaos,podchaos,stresschaos -l app.kubernetes.io/component=chaos-experiment --ignore-not-found
    ;;
  clear-zero-trust)
    kubectl delete -f "$project_dir/deploy/kubernetes/security/network-policies.yaml" --ignore-not-found
    kubectl delete -f "$project_dir/deploy/istio/security/zero-trust.yaml" --ignore-not-found
    ;;
  *) echo "Usage: $0 {apply-zero-trust|chaos <scenario> --confirm|status|clear-chaos|clear-zero-trust}" >&2; exit 2 ;;
esac

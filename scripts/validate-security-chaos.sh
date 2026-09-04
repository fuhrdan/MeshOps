#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
page="$project_dir/app/page.tsx"
for defense in strict-mtls workload-identity least-privilege jwt-validation egress-allowlist network-segmentation outlier-ejection bounded-timeout disruption-budget; do grep -q "$defense" "$page"; done
for scenario in plaintext-downgrade identity-theft lateral-movement jwt-escalation egress-exfiltration payment-network-chaos orders-pod-failure; do grep -q "$scenario" "$page"; done
zero="$project_dir/deploy/istio/security/zero-trust.yaml"
grep -q 'kind: RequestAuthentication' "$zero"
grep -q 'request.auth.claims\[roles\]' "$zero"
grep -q 'kind: Sidecar' "$zero"
grep -q 'kind: NetworkPolicy' "$project_dir/deploy/kubernetes/security/network-policies.yaml"
grep -q 'kind: NetworkChaos' "$project_dir/deploy/chaos/payment-network-delay.yaml"
grep -q 'kind: PodChaos' "$project_dir/deploy/chaos/orders-pod-failure.yaml"
grep -q 'kind: StressChaos' "$project_dir/deploy/chaos/search-cpu-stress.yaml"
grep -q 'allow-chaos' "$project_dir/scripts/security-chaos.sh"
grep -q -- '--confirm' "$project_dir/scripts/security-chaos.sh"
echo "Zero Trust and Chaos contracts valid."

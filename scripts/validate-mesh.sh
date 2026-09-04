#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required=(
  deploy/istio/profiles/meshops.yaml
  deploy/istio/gateway/gateway.yaml
  deploy/istio/routes/meshops.yaml
  deploy/istio/policies/strict-mtls.yaml
  deploy/istio/policies/authorization.yaml
  deploy/istio/telemetry/default.yaml
  deploy/kubernetes/templates/destination-rules.yaml
  deploy/observability/prometheus.yaml
)

for file in "${required[@]}"; do
  test -f "$project_dir/$file" || { echo "Missing $file" >&2; exit 1; }
done

grep -q 'gatewayClassName: istio' "$project_dir/deploy/istio/gateway/gateway.yaml"
grep -q 'kind: HTTPRoute' "$project_dir/deploy/istio/routes/meshops.yaml"
grep -q 'mode: STRICT' "$project_dir/deploy/istio/policies/strict-mtls.yaml"
grep -q 'mode: ISTIO_MUTUAL' "$project_dir/deploy/kubernetes/templates/destination-rules.yaml"
grep -q 'serviceAccountName:' "$project_dir/deploy/kubernetes/templates/workloads.yaml"
grep -q 'job_name: meshops-pods' "$project_dir/deploy/observability/prometheus.yaml"
grep -q 'name: ops-telemetry' "$project_dir/deploy/istio/routes/meshops.yaml"

policy_count="$(grep -c '^kind: AuthorizationPolicy$' "$project_dir/deploy/istio/policies/authorization.yaml")"
test "$policy_count" -eq 7 || { echo "Expected 7 authorization policies, found $policy_count" >&2; exit 1; }

if command -v helm >/dev/null 2>&1; then
  helm lint "$project_dir/deploy/kubernetes"
fi

echo "Istio, Gateway API, identity, telemetry, and mTLS contracts validated."

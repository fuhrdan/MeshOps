#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
page="$project_dir/app/page.tsx"
for pattern in circuit-breaker outlier-ejection bulkhead timeout retry-budget fallback; do grep -q "$pattern" "$page"; done
for scenario in dependency-timeout retry-storm replica-loss zone-failure resource-saturation cache-outage; do grep -q "$scenario" "$page"; done
policy="$project_dir/deploy/istio/resilience/policies.yaml"
grep -q 'connectionPool:' "$policy"
grep -q 'outlierDetection:' "$policy"
grep -q 'attempts: 2' "$policy"
grep -q 'kind: PodDisruptionBudget' "$project_dir/deploy/kubernetes/templates/resilience.yaml"
grep -q 'kind: HorizontalPodAutoscaler' "$project_dir/deploy/kubernetes/templates/resilience.yaml"
grep -q 'topologySpreadConstraints:' "$project_dir/deploy/kubernetes/templates/workloads.yaml"
grep -q 'fortio/fortio:' "$project_dir/deploy/loadtest/fortio.yaml"
echo "Resilience Engineering contracts valid."

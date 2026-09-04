#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
grep -q 'name: meshops-otel' "$project_dir/deploy/istio/profiles/meshops.yaml"
grep -q 'randomSamplingPercentage: 100.0' "$project_dir/deploy/istio/telemetry/default.yaml"
grep -q 'otlp/tempo' "$project_dir/deploy/observability/otel-collector.yaml"
grep -q 'grafana/tempo:' "$project_dir/deploy/observability/tempo.yaml"
grep -q 'traceparent' "$project_dir/services/api-gateway/index.mjs"
grep -q 'traceparent' "$project_dir/services/orders/main.go"
grep -q 'Distributed Trace Explorer' "$project_dir/app/page.tsx"
for scenario in 'Payment tail latency' 'Inventory 503' 'Canary regression'; do grep -q "$scenario" "$project_dir/app/page.tsx"; done
echo "OpenTelemetry tracing contracts valid."

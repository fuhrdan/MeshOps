#!/usr/bin/env bash
set -euo pipefail

prometheus_url="${PROMETHEUS_URL:-http://localhost:9090}"
query() { curl -fsSG "$prometheus_url/api/v1/query" --data-urlencode "query=$1"; }

echo "Stable success rate"
query 'sum(rate(istio_requests_total{destination_service_name="catalog",destination_version="stable",response_code!~"5.."}[5m])) / sum(rate(istio_requests_total{destination_service_name="catalog",destination_version="stable"}[5m]))'
echo "Canary success rate"
query 'sum(rate(istio_requests_total{destination_service_name="catalog",destination_version="canary",response_code!~"5.."}[5m])) / sum(rate(istio_requests_total{destination_service_name="catalog",destination_version="canary"}[5m]))'
echo "Canary P99 latency"
query 'histogram_quantile(0.99,sum(rate(istio_request_duration_milliseconds_bucket{destination_service_name="catalog",destination_version="canary"}[5m])) by (le))'

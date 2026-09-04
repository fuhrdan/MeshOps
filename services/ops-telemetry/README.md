# Ops Telemetry

The v1.0.0 telemetry adapter converts Istio's Prometheus metrics into a small console-facing API while distributed traces flow through the OpenTelemetry Collector.

- `GET /health` reports adapter readiness.
- `GET /api/snapshot` returns service and aggregate RED metrics.
- `GET /api/stream` emits a Server-Sent Events snapshot every two seconds.

The itch.io build uses a deterministic in-browser adapter. A cluster deployment can consume this service through `/api/telemetry/snapshot` or `/api/telemetry/stream` without changing the console's telemetry model.

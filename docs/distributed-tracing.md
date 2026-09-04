# Distributed tracing

MeshOps v0.7.0 adds an OpenTelemetry trace explorer to the browser simulator and an OTLP pipeline to the real service mesh.

## Browser workflow

The deterministic trace catalog includes healthy, slow, and failed checkouts. Filter by slow or error traces, search by trace ID/request/scenario, select a trace, then inspect its service waterfall. Selecting a span reveals its parent, operation, duration, HTTP status, semantic attributes, and span events. **Capture current trace** correlates the explorer with the active incident, canary rollout, or healthy traffic stream.

## Real mesh pipeline

```text
W3C traceparent → Istio/Envoy spans → OTLP/gRPC → OpenTelemetry Collector → Tempo
```

`deploy/istio/profiles/meshops.yaml` registers the Collector as Istio's tracing provider. `deploy/istio/telemetry/default.yaml` enables demo-only 100% sampling and adds the request ID as a custom tag. The gateway creates or accepts a valid W3C `traceparent`; orders and payments propagate it to downstream calls.

The Collector applies memory limiting, resource attribution, and batching before exporting to Tempo. Tempo uses ephemeral local storage with a 24-hour training retention. Production deployments should lower sampling, use durable object storage, authenticate telemetry endpoints, and define retention from compliance and cost requirements.

Run `scripts/tracing.sh install`, then use `status`, `logs`, or `port-forward`. The full mesh installation also applies the observability directory automatically.

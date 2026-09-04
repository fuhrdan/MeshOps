# ADR 0007: OpenTelemetry and W3C trace context

Status: Accepted for v0.7.0.

## Decision

Use W3C `traceparent` as the cross-service correlation contract, Istio/Envoy for uniform mesh spans, an OpenTelemetry Collector as the vendor-neutral telemetry boundary, and Tempo as the local training backend.

The static browser release uses deterministic trace twins and clearly labels them as demo telemetry. It does not claim to connect to the player's cluster.

## Consequences

- Traces correlate the browser's incidents and canary regressions with individual service spans.
- The real lab can replace Tempo without changing service propagation or the Collector ingress.
- One hundred percent sampling is appropriate only for this bounded training environment.
- Resilience policies and dependency-failure exercises remain reserved for v0.8.0.

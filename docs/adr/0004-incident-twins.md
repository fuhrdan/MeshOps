# ADR 0004: Deterministic incident twins

## Status

Accepted for v0.4.0.

## Context

MeshOps needs to remain playable as a static itch.io export while also demonstrating real service-mesh engineering in the repository. A static browser cannot truthfully claim to query or mutate an operator's Kubernetes cluster.

## Decision

Each training incident has two explicitly separated implementations:

1. A deterministic browser incident twin that degrades simulated RED and business metrics.
2. A namespace-scoped Istio `VirtualService` fault profile that injects the corresponding HTTP delay and/or abort behavior into the runnable lab.

The browser labels its data as demo telemetry. Real fault application is performed separately with `scripts/incident.sh`.

Only detection, investigation, diagnosis, score penalties, and fault removal are part of v0.4.0. Traffic-engineering remediation is deferred to v0.5.0.

## Consequences

- The itch.io build remains safe, deterministic, and dependency-free at runtime.
- GitHub visitors can inspect and run genuine Istio fault-injection resources.
- Browser impact metrics can model downstream business effects rather than pretending to be raw Prometheus results.
- Future v0.5 controls can build on the same incident catalog without changing the v0.4 training contract.

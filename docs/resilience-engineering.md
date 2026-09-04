# Resilience Engineering

MeshOps v0.8.0 turns resilience into a controlled game-day exercise. Choose one of six failures, inject it into the deterministic browser twin, select the smallest effective protection set, and run a 500-request validation. The result compares checkout success, P95 latency, saturation, and recovery time before and after protection.

## Protection catalog

- **Circuit breaker:** stops repeated calls into a failing dependency.
- **Outlier ejection:** temporarily removes unhealthy endpoints.
- **Bulkhead:** bounds concurrent work and isolates resource pools.
- **Bounded timeout:** limits how long a dependency can occupy capacity.
- **Retry budget:** permits limited retries without amplifying an outage.
- **Graceful fallback:** returns safe degraded data when full fidelity is unavailable.

Each protection has a tradeoff. The browser deducts score for unnecessary patterns and requires every failure mode relevant to the selected experiment to be covered.

## Real mesh lab

`deploy/istio/resilience/policies.yaml` provides connection pools, outlier ejection, timeouts, and bounded retries. The Helm chart adds PodDisruptionBudgets, autoscaling, and topology spreading. `deploy/loadtest/fortio.yaml` runs a bounded 40-QPS, 60-second checkout test.

Use `scripts/resilience.sh apply`, inject either `dependency-timeout` or `retry-storm`, run `load`, inspect `status`, then `clear`. These are training defaults: validate budgets, capacity, fallback semantics, and customer SLOs before adapting them to production.

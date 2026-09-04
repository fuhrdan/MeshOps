# ADR 0006: Guarded progressive delivery

Status: Accepted for v0.6.0.

## Decision

Canary releases progress only through 5%, 10%, 25%, 50%, and 100% traffic stages. Each promotion requires a fresh automated comparison with the stable baseline. Failed guardrails block promotion; operators retain explicit hold and rollback control.

## Consequences

- Subtle regressions can emerge as sample size and blast radius increase.
- Promotion is a deliberate operational decision rather than a timer.
- The browser twin remains deterministic and the repository provides equivalent Istio routing primitives.
- Distributed tracing remains reserved for v0.7.0.

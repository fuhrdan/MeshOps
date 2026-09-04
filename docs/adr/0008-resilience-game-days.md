# ADR 0008: Guardrail-driven resilience game days

Status: Accepted for v0.8.0.

## Decision

Resilience is evaluated through controlled experiments rather than configuration presence. An operator must match protections to a failure mode and pass four customer-impact guardrails under bounded load.

The real lab uses Istio connection pools, outlier detection, timeouts, and retry limits together with Kubernetes disruption budgets, autoscaling, and topology spread. Application fallbacks remain application-owned because a mesh cannot invent correct degraded business data.

## Consequences

- Operators see the tradeoff between protection coverage and unnecessary complexity.
- Tests remain deterministic and non-production by default.
- The itch.io build models outcomes without claiming cluster access.
- Zero-trust and chaos-security exercises remain reserved for v0.9.0.

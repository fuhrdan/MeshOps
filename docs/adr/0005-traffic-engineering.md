# ADR 0005: Explicit apply-and-observe traffic policies

Status: Accepted for v0.5.0.

## Decision

Traffic mitigation is a separate phase after diagnosis. Operators choose retry, timeout, and canary values, explicitly apply the policy, and observe resulting telemetry before fault removal becomes available.

## Consequences

- Recovery demonstrates mitigation verification instead of treating configuration as automatically successful.
- Empty policies are rejected and penalized.
- The browser remains deterministic while real Istio examples preserve the infrastructure learning path.
- Automated canary analysis and promotion remain reserved for v0.6.0 Canary Commander.

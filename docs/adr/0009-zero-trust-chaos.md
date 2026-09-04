# ADR 0009: Safety-gated zero-trust and chaos exercises

Status: Accepted for v0.9.0.

## Decision

Zero trust is modeled as layered identity, transport, authorization, egress, and network controls. Chaos profiles are stored separately, opt-in, time bounded where the mechanism supports duration, and protected by disposable-environment labels plus explicit confirmation.

The static itch.io experience uses deterministic twins and never connects to or mutates a cluster.

## Consequences

- Operators can reason about blast radius and least privilege together.
- Security policies may intentionally block an unprepared lab, so they are not part of the default mesh installation.
- Chaos dependencies and permissions remain visible and auditable.
- v1.0.0 can focus on the complete campaign, release hardening, and portfolio polish.

# ADR 0010: Compose the release as a scored campaign

Status: Accepted for v1.0.0.

## Decision

The 1.0 experience composes the existing incident, canary, tracing, resilience, and trust-boundary surfaces into five sequential operations. A campaign controller configures the relevant scenario, observes the underlying state machine, and advances only after a concrete completion contract is true.

Campaign scoring is separate from the historical operations score so an operator can understand both the current console state and the quality of the completed shift. The final report is generated locally as Markdown.

The real-lab companion is intentionally read-only at the campaign layer. Mutating actions remain in their domain scripts, preserving the established safety and confirmation boundaries.

## Consequences

- Earlier training surfaces stay independently usable.
- The campaign demonstrates cross-discipline judgment without duplicating their mechanics.
- Completion and ranking are deterministic and testable in the static itch.io build.
- A full campaign cannot silently inject faults or chaos into a real cluster.

# ADR 0003: Separate demo telemetry from cluster telemetry

- Status: Accepted
- Date: 2026-09-02

## Context

The itch.io release must remain playable without a Kubernetes cluster, while the GitHub project must demonstrate how the operations console consumes real Istio signals. Presenting simulated values as live cluster data would undermine the educational goal.

## Decision

Define one console telemetry shape with two adapters. The browser build uses a deterministic local stream and labels it **Demo telemetry**. Kubernetes deployments use `ops-telemetry`, which queries Istio metrics in Prometheus and exposes JSON snapshots plus a Server-Sent Events stream.

## Consequences

The itch.io build remains portable and deterministic. The cluster path remains real and independently verifiable. Future incident scenarios can drive the demo adapter and the Kubernetes environment through the same service and aggregate metric model.

# ADR 0001: Use a polyglot baseline before adding Istio

- Status: Accepted
- Date: 2026-09-02

## Context

MeshOps must demonstrate that service-mesh capabilities are independent of application language. It also needs a baseline where request propagation, health checks, logging, and failures are implemented by the applications themselves.

## Decision

Version 0.1.0 uses Go, Node.js, and Python services with only standard-library runtime dependencies. Istio is intentionally deferred to v0.2.0.

## Consequences

The repository is slightly larger than a single-language example, but each service remains easy to inspect. Later releases can attribute new behavior to the mesh instead of hiding it inside a framework abstraction.

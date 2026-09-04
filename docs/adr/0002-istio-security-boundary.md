# ADR 0002: Enforce the service graph with Istio identity

- Status: Accepted
- Date: 2026-09-02

## Context

MeshOps needs service-mesh behavior that is observable, enforceable, and independent of application language. A namespace-wide shared identity would encrypt traffic but would not demonstrate workload-level authorization.

## Decision

Assign each service its own Kubernetes ServiceAccount, require strict mTLS across the namespace, and use Istio authorization policies to allow only the documented call graph. Use Kubernetes Gateway API resources for ingress and keep internal services off the public route.

## Consequences

The Go, Node.js, and Python services gain consistent workload identity and transport security without application rewrites. New service-to-service edges must be intentionally added to policy, and configuration drift can fail closed. Mesh contract tests and the verification script make that boundary visible during development.

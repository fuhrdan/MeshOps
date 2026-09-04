# Changelog

All notable changes to MeshOps are documented here.

## [1.0.1] - 2026-09-04

### Added

- Clean start screen with separate **Quick tutorial** and **Open command console** routes
- Six-step Explain-Like-I'm-Five walkthrough covering services, mesh security, incidents, traces, recovery controls, and safe practice
- Interactive lesson navigation, progress indicators, skip controls, and direct console handoff
- Quick-start guide, ADR 0011, repository contracts, and CI validation

### Changed

- Release metadata, Helm chart, service health versions, browser branding, and itch.io packaging advanced to v1.0.1
- Production entry experience now introduces the product before revealing the full operations console

## [1.0.0] - 2026-09-02

### Added

- Full five-operation Incident Commander campaign spanning incident response, progressive delivery, tracing, resilience, and zero trust
- Objective-gated mission advancement and direct workspace handoff
- Separate 6,400-point campaign record with four certification ranks
- Confirmable failing-span evidence in the Distributed Trace Explorer
- Local Markdown after-action report export
- Read-only real-lab campaign brief, preflight, and status script
- Campaign guide, ADR 0010, repository contracts, and CI validation

### Changed

- Release metadata, Helm chart, service health versions, browser branding, and itch.io packaging advanced to v1.0.0
- Roadmap marks the Full Incident Commander campaign as released
- Production deployment description now reflects the complete cross-discipline campaign

## [0.9.0] - 2026-09-02

### Added

- Trust Boundary Commander with seven identity, authorization, egress, network, and chaos scenarios
- Nine selectable zero-trust and resilience defenses
- Policy-coverage, unnecessary-control, blast-radius, and trust-score mechanics
- Retestable containment probes with blocked-request and encryption metrics
- Opt-in Istio JWT validation, claim authorization, egress boundary, and unknown-principal denial
- Kubernetes default-deny segmentation and checkout call-graph policies
- Bounded Chaos Mesh network delay, pod failure, and CPU stress profiles
- Disposable-environment and explicit-confirmation safety gates
- Zero-trust/chaos guide and ADR 0009

### Changed

- CI, Helm metadata, service versions, browser branding, and itch.io packaging advanced to v0.9.0
- Roadmap marks Zero Trust and Chaos as released

## [0.8.0] - 2026-09-02

### Added

- Interactive Resilience Game Day with six controlled failure experiments
- Six selectable protection patterns with explicit operational tradeoffs
- Bounded 500-request validation and before/after customer-impact comparison
- Success, P95 latency, saturation, recovery-time guardrails, and resilience scoring
- Real Istio connection pools, outlier ejection, timeouts, and retry budgets
- Kubernetes PodDisruptionBudgets, HPA policies, and topology spreading
- Bounded Fortio load-test job and resilience lifecycle/validation scripts
- Resilience guide and ADR 0008

### Changed

- CI, Helm metadata, service health versions, browser branding, and itch.io packaging advanced to v0.8.0
- Roadmap marks Resilience Engineering as released

## [0.7.0] - 2026-09-02

### Added

- Distributed Trace Explorer with trace search and all/slow/error filtering
- Service waterfall with proportional span timing and selectable span inspection
- Span parentage, HTTP status, attributes, and events
- Six deterministic healthy, latency, error, cache, authentication, and canary traces
- Trace correlation with the active incident, canary rollout, or healthy checkout stream
- W3C `traceparent` creation and downstream propagation
- Istio OpenTelemetry provider, OTLP Collector pipeline, and Tempo backend
- Tracing lifecycle/validation scripts, documentation, and ADR 0007

### Changed

- Mesh verification checks the Collector and Tempo deployments
- CI, Helm metadata, browser branding, and itch.io packaging advanced to v0.7.0
- Roadmap marks OpenTelemetry tracing as released

## [0.6.0] - 2026-09-02

### Added

- Canary Commander with guarded 5%, 10%, 25%, 50%, and 100% rollout stages
- Explicit hold, rollback, staged promotion, and promote-to-stable decisions
- Automated stable-versus-canary analysis for success rate and P50/P95/P99 latency
- Six deterministic release regressions with signals that emerge at different exposure levels
- Real Istio stable/canary subsets, 95/5 routing, and a separate canary workload
- Canary lifecycle, Prometheus analysis, and contract-validation scripts
- Progressive-delivery documentation and ADR 0006

### Changed

- Release metadata, Helm chart, browser branding, and itch.io packaging advanced to v0.6.0
- Roadmap marks Canary Commander as released

## [0.5.0] - 2026-09-02

### Added

- Interactive retry-budget, request-timeout, and weighted-canary controls after root-cause diagnosis
- Apply-and-observe loop that recalculates success rate and P95 latency before recovery
- Guard against clearing an incident before a traffic policy is verified
- Real Istio resilience and 90/10 catalog canary manifests
- `scripts/traffic.sh` and traffic-policy contract validation
- Traffic engineering guide and ADR 0005

### Changed

- Recovery now requires a diagnosed cause and an observed mitigation policy
- Browser and itch.io release branding advanced to v0.5.0
- Roadmap marks Traffic Engineering as released

## [0.4.0] - 2026-09-02

### Added

- Incident Engine with five selectable deterministic failure scenarios
- Guided, Standard, Senior, and Commander difficulty levels
- Live request-rate, success-rate, latency, CPU, objective, and topology degradation during incidents
- Root-cause investigation choices with explicit wrong-call score penalties
- Difficulty-, elapsed-time-, and mistake-weighted recovery scoring
- Incident-specific event filtering and SLO breach visualization
- Five real Istio `VirtualService` fault profiles matching the browser incident catalog
- `scripts/incident.sh` to list, apply, inspect, and clear controlled mesh faults
- Incident contract validation, documentation, and ADR 0004

### Changed

- MeshOps branding now identifies the experience as Incident Commander
- Kubernetes image tags and itch.io packaging now target v0.4.0
- Service inspector and topology nodes expose degraded incident state while preserving workload and mTLS health
- Release roadmap marks the Incident Engine milestone as released

### Scope boundary

- v0.4.0 recovery removes the injected fault only; retry, timeout, failover, and traffic-shift controls remain reserved for v0.5.0

## [0.3.0] - 2026-09-02

### Added

- Continuous deterministic telemetry stream with pause, step, and speed controls
- Animated request traversal with live per-service RED metrics
- Rolling P95 latency chart and visible service-level objective threshold
- Filterable production event timeline for requests, mesh, and system events
- Availability, revenue, customer satisfaction, cost, and operational score objectives
- Prometheus deployment configured to scrape Istio sidecar metrics
- `ops-telemetry` snapshot and Server-Sent Events API
- Gateway API route for cluster-backed telemetry access

### Changed

- Dashboard typography and responsive layouts were improved for operational readability
- Service inspector now includes CPU usage and live workload readiness
- Mesh installation and verification scripts now deploy and test observability

## [0.2.0] - 2026-09-02

### Added

- Istio 1.31 installation profile with automatic sidecar enrollment
- Kubernetes Gateway API `Gateway` and `HTTPRoute` ingress resources
- Dedicated ServiceAccounts and SPIFFE identities for all eight services
- Namespace-wide strict mutual TLS and explicit destination TLS policies
- Authorization policies that enforce the documented service call graph
- Mesh-wide Prometheus metrics and Envoy access-log configuration
- Reproducible mesh installation, validation, and proxy verification scripts
- Interactive mesh overlay with sidecar, identity, encryption, and coverage states

### Changed

- Kubernetes workloads now run 14 application pods and 14 Envoy sidecars
- The service inspector separates application health from mesh health
- Repository documentation and CI now validate the service-mesh contract

## [0.1.0] - 2026-09-02

### Added

- Interactive, responsive SRE operations console
- Deterministic customer-checkout traffic generator
- Eight-node selectable service topology
- Animated active-request path and trace waterfall
- Live service metrics, workload inspection, and event feed
- Eight runnable Go, Node.js, and Python microservices
- Request-ID propagation and structured service logging
- Docker Compose development environment
- Kubernetes Helm chart with probes and resource boundaries
- CI checks, architecture notes, contributor guidance, and security policy
- Static HTML5 build suitable for itch.io upload

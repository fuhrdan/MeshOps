# Canary Commander

MeshOps v0.6.0 introduces progressive delivery as a first-class operator exercise. A release advances through **5%, 10%, 25%, 50%, and 100%** traffic stages. At every stage, automated analysis compares success rate and P50/P95/P99 latency with the stable baseline.

## Decisions

- **Promote** advances one guarded stage. A failed analysis blocks promotion.
- **Hold** freezes the current weight for investigation.
- **Roll back** removes canary exposure and restores stable traffic.
- **Promote to stable** completes a successful 100% stage.

Six deterministic browser scenarios model bad deployments, memory leaks, slow database queries, malformed responses, dependency incompatibility, and cache stampedes. Signals can remain subtle until exposure increases.

## Real mesh lab

`deploy/istio/canary` contains stable/canary subsets, an initial 95/5 `VirtualService`, and a separate canary deployment. Use `scripts/canary.sh` to start, stage, hold, roll back, promote, or inspect the rollout. `scripts/analyze-canary.sh` queries Prometheus for stable/canary success and P99 latency.

# Traffic engineering

MeshOps v0.5.0 turns a correct diagnosis into an operational decision. The browser twin exposes retry budgets, request timeouts, and weighted canary traffic, immediately recalculating success rate and P95 latency so an operator can verify mitigation before clearing the fault.

## Safe workflow

1. Inject and diagnose an incident.
2. Select the smallest retry budget and a bounded timeout.
3. Optionally send 10–50% of traffic to the canary.
4. Apply the policy and inspect the reported success and latency.
5. Clear the fault only after the policy is verified.

The repository contains real Istio equivalents in `deploy/istio/traffic`. Run `scripts/traffic.sh list`, then `apply resilience` or `apply catalog-canary`. `status` shows active policies and `clear` removes all MeshOps traffic policies.

Retries can amplify load, short timeouts can create false failures, and large canary shifts increase blast radius. The simulator makes these controls explicit rather than presenting them as a universal fix.

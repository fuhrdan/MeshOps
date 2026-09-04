# Istio integration

MeshOps v1.0.0 enrolls every workload in Istio, collects metrics and traces, and supports the full Incident Commander campaign plus opt-in zero-trust and safety-gated chaos exercises.

## Install order

1. Install the Gateway API CRDs.
2. Install Istio using `profiles/meshops.yaml`.
3. Install the MeshOps Helm chart, which creates an injectable namespace and one service account per workload.
4. Deploy Prometheus and apply the Gateway, HTTPRoute, security policies, and telemetry configuration.

```bash
kubectl get crd gateways.gateway.networking.k8s.io
istioctl install -f deploy/istio/profiles/meshops.yaml -y
helm upgrade --install meshops deploy/kubernetes
kubectl apply -f deploy/observability
kubectl apply -f deploy/istio/gateway
kubectl apply -f deploy/istio/routes
kubectl apply -f deploy/istio/policies/strict-mtls.yaml
kubectl apply -f deploy/istio/policies/authorization.yaml
kubectl apply -f deploy/istio/telemetry
```

The authorization policies implement the expected call graph. Any source identity outside that graph receives an Istio RBAC denial before the request reaches application code.

## v0.4.0 controlled incidents

Fault injection is opt-in and is not installed by `scripts/install-mesh.sh`. Use the incident controller only after the baseline mesh is healthy:

```bash
bash scripts/incident.sh list
bash scripts/incident.sh apply payments-latency
bash scripts/incident.sh status
bash scripts/incident.sh clear
```

## v0.5.0 traffic engineering

```bash
bash scripts/traffic.sh list
bash scripts/traffic.sh apply resilience
bash scripts/traffic.sh status
bash scripts/traffic.sh clear
```

## v0.6.0 canary rollout

```bash
bash scripts/canary.sh start
bash scripts/canary.sh stage 10
bash scripts/analyze-canary.sh
bash scripts/canary.sh hold
bash scripts/canary.sh rollback
```

## v0.7.0 distributed tracing

```bash
bash scripts/tracing.sh install
bash scripts/tracing.sh status
bash scripts/tracing.sh logs
bash scripts/tracing.sh port-forward
```

## v0.8.0 resilience game day

```bash
bash scripts/resilience.sh apply
bash scripts/resilience.sh experiment dependency-timeout
bash scripts/resilience.sh load
bash scripts/resilience.sh status
bash scripts/resilience.sh clear
```

## v0.9.0 zero trust and chaos

```bash
bash scripts/security-chaos.sh apply-zero-trust
bash scripts/security-chaos.sh status
bash scripts/security-chaos.sh chaos payment-network-delay --confirm
bash scripts/security-chaos.sh clear-chaos
bash scripts/security-chaos.sh clear-zero-trust
```

The five manifests under `deploy/istio/faults/` are labeled `app.kubernetes.io/component: incident-fault`. The controller clears only that labeled training resource before applying another scenario, so unrelated Istio configuration remains untouched.

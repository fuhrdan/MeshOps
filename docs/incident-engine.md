# Incident engine

MeshOps v0.4.0 introduces a deterministic incident-training loop with a browser simulation and real Istio fault profiles.

## Design goals

The incident engine is intended to teach detection and root-cause isolation before adding traffic-management remediation. It therefore changes observable production signals, asks the operator to diagnose the failure, penalizes incorrect calls, and permits only one v0.4 remediation: remove the injected fault.

Retries, timeout policy editing, weighted routing, failover, and traffic shifting remain out of scope until v0.5.0.

## Browser state machine

```text
IDLE -> ACTIVE -> DIAGNOSED -> RECOVERED -> IDLE
          |            |
          |            +-- remove controlled fault
          +-- wrong diagnosis -> score penalty, remain ACTIVE
```

An incident begins with a 75-point declaration cost. Each incorrect root-cause call costs 300 points. A successful recovery award is calculated from the selected difficulty multiplier, elapsed incident time, and wrong calls.

## Difficulty

| Level | Clues | Score multiplier |
|---|---:|---:|
| Guided | 3 | 0.75x |
| Standard | 2 | 1.00x |
| Senior | 1 | 1.35x |
| Commander | 0 | 1.70x |

Commander mode intentionally supplies no textual investigation clue. The operator must use service selection, topology health, RED metrics, SLO state, and the event timeline.

## Browser/runtime twins

The browser uses deterministic impact values so the static build remains playable without Kubernetes. The real cluster profiles use Istio `VirtualService` HTTP fault injection.

| Fault ID | Browser signature | Cluster fault |
|---|---|---|
| `payments-latency` | Severe P95 increase, modest throughput loss | 650 ms delay, 100% |
| `inventory-errors` | Success rate below 90%, reduced throughput | HTTP 503 abort, 45% |
| `catalog-brownout` | Mixed latency and errors | 420 ms delay, 40%; HTTP 503, 15% |
| `auth-failure` | Downstream traffic collapse, severe errors | HTTP 503 abort, 55% |
| `orders-latency` | P95 above one second, reduced throughput | 900 ms delay, 60% |

The browser's global business metrics are intentionally not a one-to-one copy of the target service's fault percentage. They model downstream business impact through the checkout dependency graph.

## Real-cluster workflow

First verify that the healthy mesh is running. Then list or apply an exercise:

```bash
bash scripts/incident.sh list
bash scripts/incident.sh apply inventory-errors
bash scripts/incident.sh status
```

Generate traffic and investigate with the usual MeshOps telemetry. To recover:

```bash
bash scripts/incident.sh clear
```

`scripts/incident.sh apply` clears any previous MeshOps-managed `incident-fault` `VirtualService` before applying the selected profile. It does not delete unrelated user-created `VirtualService` resources.

## Safety boundary

Fault manifests are namespace-scoped to `meshops`. They should be used only in a training or test cluster. Do not point the Helm values or fault controller at a production namespace.

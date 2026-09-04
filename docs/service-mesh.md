# Service mesh

MeshOps uses Istio as an infrastructure layer around the existing polyglot services. The application protocol remains plain HTTP inside each container; Envoy proxies transparently authenticate peers and encrypt traffic between workloads.

## Enrollment and identity

The `meshops` namespace has `istio-injection: enabled`. Helm creates one Kubernetes ServiceAccount per service and assigns it to the corresponding Deployment. Istio turns that account into a SPIFFE identity such as:

```text
spiffe://cluster.local/ns/meshops/sa/orders
```

This prevents unrelated services from sharing one broad identity.

## Authentication and authorization

A namespace-wide `PeerAuthentication` sets mTLS mode to `STRICT`. Destination rules explicitly select `ISTIO_MUTUAL`, so service clients use Istio-managed certificates.

Authorization policies allow only these edges:

- `api-gateway` → `auth`, `catalog`, `search`, `orders`
- `orders` → `inventory`, `payments`
- `payments` → `notifications`

The public Gateway can reach `api-gateway`; internal services are not exposed through an external route.

## Telemetry

The default `Telemetry` resource enables Prometheus metrics and Envoy access logs for the namespace. Pod annotations expose merged application and sidecar metrics. The Prometheus deployment introduced in v0.3.0 scrapes those endpoints, while `ops-telemetry` converts Istio time series into console-facing RED metrics and a two-second Server-Sent Events stream.

## Verification

Run `bash scripts/verify-mesh.sh` after a deployment. It checks the routing and strict-mTLS resources, confirms that every expected pod has both containers ready, and asks Istio to report proxy synchronization state.

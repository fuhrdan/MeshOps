# Getting started

## Browser console

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run build
```

The exported browser build is written to `dist/client`. Create an itch.io-ready archive after a successful build with:

```bash
bash scripts/package-itch.sh
```

## Microservices with Docker

Requirements: Docker with Compose v2.

```bash
docker compose up --build -d
curl http://localhost:8080/health
curl http://localhost:8080/api/checkout
docker compose logs -f
```

Stop the environment with `docker compose down`.

## Kubernetes with Istio

Requirements: Docker, kind, kubectl, Helm 3, and `istioctl` 1.31. Install the Kubernetes Gateway API standard channel CRDs before running MeshOps.

Build and tag each image using the names in `deploy/kubernetes/values.yaml`, then load the images into the local cluster or point the values file at an accessible registry.

```bash
kind create cluster --config deploy/kind/cluster.yaml
bash scripts/install-mesh.sh
kubectl -n meshops get pods,services,gateway,httproute
```

The installer applies the MeshOps Istio profile, installs the Helm chart, and then applies Prometheus, routing, authorization, strict-mTLS, and telemetry resources.

Verify the mesh at any time:

```bash
bash scripts/verify-mesh.sh
istioctl proxy-status
kubectl -n meshops get peerauthentication,authorizationpolicy,destinationrule,telemetry
```

All 15 application pods should report two ready containers: one application container and one Envoy sidecar. Prometheus intentionally runs without a sidecar and remains internal.

## Reach the Gateway

Inspect the provisioned Gateway service and then call the checkout route:

```bash
kubectl -n meshops get gateway meshops
kubectl -n meshops get service
curl http://<gateway-address>/api/checkout
curl http://<gateway-address>/api/telemetry/snapshot
```

The response returns a completed status, request ID, total duration, and downstream results. All participating containers log the same request ID. Envoy emits a second, consistent access-log layer for the same call.

## Run a v0.4.0 incident exercise

Validate the incident catalog locally:

```bash
bash scripts/validate-incidents.sh
```

With the Istio lab running, list the five controlled profiles:

```bash
bash scripts/incident.sh list
```

Apply one profile, generate checkout traffic, and inspect the mesh:

```bash
bash scripts/incident.sh apply catalog-brownout
bash scripts/incident.sh status
curl http://<gateway-address>/api/checkout
```

Recover by removing the MeshOps-managed fault:

```bash
bash scripts/incident.sh clear
```

The script intentionally manages only resources labeled `app.kubernetes.io/component=incident-fault` in the `meshops` namespace. It does not remove unrelated Istio configuration.

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const serviceNames = ["api-gateway", "auth", "catalog", "search", "orders", "inventory", "payments", "notifications", "ops-telemetry"];

test("ships eight business services and the operations telemetry adapter", async () => {
  await Promise.all(serviceNames.map((name) => access(path.join(root, "services", name, "Dockerfile"))));
});

test("every service implements the shared health contract", async () => {
  const sourceNames = { "api-gateway": "index.mjs", auth: "main.go", catalog: "index.mjs", search: "app.py", orders: "main.go", inventory: "main.go", payments: "index.mjs", notifications: "app.py", "ops-telemetry": "index.mjs" };
  for (const [service, source] of Object.entries(sourceNames)) {
    const contents = await readFile(path.join(root, "services", service, source), "utf8");
    assert.match(contents, /\/health/, `${service} must expose /health`);
  }
});

test("declares an itch-compatible static export", async () => {
  const nextConfig = await readFile(path.join(root, "next.config.ts"), "utf8");
  const hosting = JSON.parse(await readFile(path.join(root, ".openai", "hosting.json"), "utf8"));
  assert.match(nextConfig, /output:\s*["']export["']/);
  assert.equal(hosting.static.directory, "dist/client");
});

test("enrolls every Kubernetes workload with a distinct identity", async () => {
  const namespace = await readFile(path.join(root, "deploy/kubernetes/templates/namespace.yaml"), "utf8");
  const workloads = await readFile(path.join(root, "deploy/kubernetes/templates/workloads.yaml"), "utf8");
  assert.match(namespace, /istio-injection:\s*enabled/);
  assert.match(workloads, /kind:\s*ServiceAccount/);
  assert.match(workloads, /serviceAccountName:/);
});

test("ships strict mTLS and explicit Istio mutual TLS destinations", async () => {
  const peerAuth = await readFile(path.join(root, "deploy/istio/policies/strict-mtls.yaml"), "utf8");
  const destinations = await readFile(path.join(root, "deploy/kubernetes/templates/destination-rules.yaml"), "utf8");
  assert.match(peerAuth, /mode:\s*STRICT/);
  assert.match(destinations, /mode:\s*ISTIO_MUTUAL/);
});

test("uses Gateway API ingress backed by Istio", async () => {
  const gateway = await readFile(path.join(root, "deploy/istio/gateway/gateway.yaml"), "utf8");
  const route = await readFile(path.join(root, "deploy/istio/routes/meshops.yaml"), "utf8");
  assert.match(gateway, /gatewayClassName:\s*istio/);
  assert.match(route, /kind:\s*HTTPRoute/);
  assert.match(route, /name:\s*api-gateway/);
});

test("enforces every internal edge with authorization policies", async () => {
  const authorization = await readFile(path.join(root, "deploy/istio/policies/authorization.yaml"), "utf8");
  assert.equal((authorization.match(/kind:\s*AuthorizationPolicy/g) ?? []).length, 7);
  for (const identity of ["api-gateway", "orders", "payments"]) {
    assert.match(authorization, new RegExp(`cluster\\.local/ns/meshops/sa/${identity}`));
  }
});

test("ships the Prometheus-backed operations telemetry boundary", async () => {
  const adapter = await readFile(path.join(root, "services/ops-telemetry/index.mjs"), "utf8");
  const prometheus = await readFile(path.join(root, "deploy/observability/prometheus.yaml"), "utf8");
  const route = await readFile(path.join(root, "deploy/istio/routes/meshops.yaml"), "utf8");
  assert.match(adapter, /\/api\/snapshot/);
  assert.match(adapter, /text\/event-stream/);
  assert.match(adapter, /istio_requests_total/);
  assert.match(prometheus, /job_name: meshops-pods/);
  assert.match(route, /value: \/api\/telemetry/);
});

test("ships five labeled Istio incident fault profiles with browser twins", async () => {
  const faults = ["payments-latency", "inventory-errors", "catalog-brownout", "auth-failure", "orders-latency"];
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  for (const fault of faults) {
    const manifest = await readFile(path.join(root, `deploy/istio/faults/${fault}.yaml`), "utf8");
    assert.match(manifest, /kind:\s*VirtualService/);
    assert.match(manifest, /app\.kubernetes\.io\/component:\s*incident-fault/);
    assert.match(manifest, /fault:/);
    assert.match(manifest, /number:\s*8080/);
    assert.match(page, new RegExp(fault));
  }
});

test("integrates v0.5 traffic engineering after diagnosis", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  assert.match(page, /Guided/);
  assert.match(page, /Commander/);
  assert.match(page, /Confirm diagnosis/);
  assert.match(page, /Apply & observe/);
  assert.match(page, /Retry budget/);
  assert.match(page, /Request timeout/);
  assert.match(page, /Canary traffic/);
});

test("ships real Istio retry timeout and weighted canary policies", async () => {
  const resilience = await readFile(path.join(root, "deploy/istio/traffic/resilience.yaml"), "utf8");
  const canary = await readFile(path.join(root, "deploy/istio/traffic/catalog-canary.yaml"), "utf8");
  assert.match(resilience, /attempts:\s*2/);
  assert.match(resilience, /timeout:\s*750ms/);
  assert.match(canary, /weight:\s*90/);
  assert.match(canary, /weight:\s*10/);
});

test("ships the v0.6 Canary Commander progression and failure catalog", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  for (const stage of [5, 10, 25, 50, 100]) assert.match(page, new RegExp(`\\b${stage}\\b`));
  for (const scenario of ["bad-deployment", "memory-leak", "slow-db", "malformed-response", "dependency-mismatch", "cache-stampede"]) assert.match(page, new RegExp(scenario));
  assert.match(page, /Hold/);
  assert.match(page, /Roll back/);
  assert.match(page, /Promotion blocked/);
});

test("ships real canary workload routing and Prometheus analysis", async () => {
  const routing = await readFile(path.join(root, "deploy/istio/canary/catalog-routing.yaml"), "utf8");
  const workload = await readFile(path.join(root, "deploy/istio/canary/catalog-canary-deployment.yaml"), "utf8");
  const analysis = await readFile(path.join(root, "scripts/analyze-canary.sh"), "utf8");
  assert.match(routing, /subset:\s*stable/);
  assert.match(routing, /subset:\s*canary/);
  assert.match(routing, /weight:\s*95/);
  assert.match(routing, /weight:\s*5/);
  assert.match(workload, /version:\s*canary/);
  assert.match(analysis, /histogram_quantile\(0\.99/);
});

test("ships the v0.7 distributed trace explorer and deterministic trace twins", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  assert.match(page, /Distributed Trace Explorer/);
  assert.match(page, /Capture current trace/);
  assert.match(page, /Payment tail latency/);
  assert.match(page, /Inventory 503/);
  assert.match(page, /Canary regression/);
  assert.match(page, /P50|Span details/);
  assert.match(page, /traceparent|Trace ID/);
});

test("ships a real OpenTelemetry Collector and Tempo pipeline", async () => {
  const profile = await readFile(path.join(root, "deploy/istio/profiles/meshops.yaml"), "utf8");
  const telemetry = await readFile(path.join(root, "deploy/istio/telemetry/default.yaml"), "utf8");
  const collector = await readFile(path.join(root, "deploy/observability/otel-collector.yaml"), "utf8");
  const tempo = await readFile(path.join(root, "deploy/observability/tempo.yaml"), "utf8");
  assert.match(profile, /opentelemetry:/);
  assert.match(telemetry, /randomSamplingPercentage:\s*100\.0/);
  assert.match(collector, /receivers:\s*[\s\S]*otlp:/);
  assert.match(collector, /exporters:\s*[\s\S]*otlp\/tempo:/);
  assert.match(tempo, /grafana\/tempo:/);
});

test("propagates W3C trace context through the checkout path", async () => {
  const gateway = await readFile(path.join(root, "services/api-gateway/index.mjs"), "utf8");
  const orders = await readFile(path.join(root, "services/orders/main.go"), "utf8");
  const payments = await readFile(path.join(root, "services/payments/index.mjs"), "utf8");
  assert.match(gateway, /traceparent/);
  assert.match(gateway, /00-\[0-9a-f\]/);
  assert.match(orders, /Header\.Set\("traceparent"/);
  assert.match(payments, /traceparent:/);
});

test("ships the v0.8 resilience game-day loop and protection catalog", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  assert.match(page, /Resilience Game Day/);
  assert.match(page, /500-request load test/);
  for (const pattern of ["circuit-breaker", "outlier-ejection", "bulkhead", "timeout", "retry-budget", "fallback"]) assert.match(page, new RegExp(pattern));
  for (const scenario of ["dependency-timeout", "retry-storm", "replica-loss", "zone-failure", "resource-saturation", "cache-outage"]) assert.match(page, new RegExp(scenario));
});

test("ships real Istio and Kubernetes resilience guardrails", async () => {
  const policies = await readFile(path.join(root, "deploy/istio/resilience/policies.yaml"), "utf8");
  const guardrails = await readFile(path.join(root, "deploy/kubernetes/templates/resilience.yaml"), "utf8");
  const workloads = await readFile(path.join(root, "deploy/kubernetes/templates/workloads.yaml"), "utf8");
  const load = await readFile(path.join(root, "deploy/loadtest/fortio.yaml"), "utf8");
  assert.match(policies, /connectionPool:/);
  assert.match(policies, /outlierDetection:/);
  assert.match(policies, /retries:/);
  assert.match(guardrails, /kind:\s*PodDisruptionBudget/);
  assert.match(guardrails, /kind:\s*HorizontalPodAutoscaler/);
  assert.match(workloads, /topologySpreadConstraints:/);
  assert.match(load, /fortio\/fortio:/);
});

test("ships the v0.9 trust-boundary command loop", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  assert.match(page, /Trust Boundary Commander/);
  for (const defense of ["strict-mtls", "workload-identity", "least-privilege", "jwt-validation", "egress-allowlist", "network-segmentation", "outlier-ejection", "bounded-timeout", "disruption-budget"]) assert.match(page, new RegExp(defense));
  for (const scenario of ["plaintext-downgrade", "identity-theft", "lateral-movement", "jwt-escalation", "egress-exfiltration", "payment-network-chaos", "orders-pod-failure"]) assert.match(page, new RegExp(scenario));
  assert.match(page, /blast radius/i);
});

test("ships opt-in zero-trust policies and safety-gated chaos", async () => {
  const zeroTrust = await readFile(path.join(root, "deploy/istio/security/zero-trust.yaml"), "utf8");
  const network = await readFile(path.join(root, "deploy/kubernetes/security/network-policies.yaml"), "utf8");
  const networkChaos = await readFile(path.join(root, "deploy/chaos/payment-network-delay.yaml"), "utf8");
  const podChaos = await readFile(path.join(root, "deploy/chaos/orders-pod-failure.yaml"), "utf8");
  const script = await readFile(path.join(root, "scripts/security-chaos.sh"), "utf8");
  assert.match(zeroTrust, /kind:\s*RequestAuthentication/);
  assert.match(zeroTrust, /request\.auth\.claims\[roles\]/);
  assert.match(zeroTrust, /kind:\s*Sidecar/);
  assert.match(network, /kind:\s*NetworkPolicy/);
  assert.match(networkChaos, /kind:\s*NetworkChaos/);
  assert.match(podChaos, /kind:\s*PodChaos/);
  assert.match(script, /allow-chaos/);
  assert.match(script, /--confirm/);
});

test("ships the v1.0 full Incident Commander campaign", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  const docs = await readFile(path.join(root, "docs/incident-commander-campaign.md"), "utf8");
  const runbook = await readFile(path.join(root, "scripts/campaign.sh"), "utf8");
  for (const mission of ["restore-service", "guard-release", "trace-root-cause", "prove-resilience", "contain-breach"]) assert.match(page, new RegExp(mission));
  for (const callSign of ["REDLINE", "NARROW GATE", "NEEDLE", "BULKHEAD", "LOCKBOX"]) assert.match(page, new RegExp(callSign));
  assert.match(page, /Export after-action report/);
  assert.match(page, /Principal Commander/);
  assert.match(docs, /five-mission campaign/i);
  assert.match(runbook, /preflight/);
  assert.match(runbook, /status/);
});

test("ships the v1.0.1 cover and Explain-Like-I'm-Five tutorial", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  const styles = await readFile(path.join(root, "app/globals.css"), "utf8");
  const docs = await readFile(path.join(root, "docs/quick-start-tutorial.md"), "utf8");
  const adr = await readFile(path.join(root, "docs/adr/0011-cover-and-tutorial.md"), "utf8");
  for (const label of ["Quick tutorial", "Open command console", "Start screen", "About 90 seconds"]) assert.match(page, new RegExp(label));
  for (const visual of ["helpers", "mesh", "incident", "trace", "controls", "practice"]) assert.match(page, new RegExp(`visual: \\\"${visual}\\\"`));
  assert.match(styles, /\.entry-choice/);
  assert.match(styles, /\.lesson-rail/);
  assert.match(docs, /six-step Explain-Like-I'm-Five walkthrough/);
  assert.match(adr, /cover, tutorial, and console/);
});

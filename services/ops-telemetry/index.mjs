import http from "node:http";

const port = Number(process.env.PORT ?? 8080);
const prometheusUrl = process.env.PROMETHEUS_URL ?? "http://prometheus:9090";
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN ?? "*";

const queries = {
  requestRate: 'sum(rate(istio_requests_total{reporter="destination",destination_workload_namespace="meshops"}[1m])) by (destination_workload)',
  errorRate: 'sum(rate(istio_requests_total{reporter="destination",destination_workload_namespace="meshops",response_code=~"5.."}[1m])) by (destination_workload)',
  p95: 'histogram_quantile(0.95, sum(rate(istio_request_duration_milliseconds_bucket{reporter="destination",destination_workload_namespace="meshops"}[1m])) by (le,destination_workload))',
};

function send(response, status, body, contentType = "application/json") {
  response.writeHead(status, {
    "content-type": contentType,
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "no-store",
  });
  response.end(contentType === "application/json" ? JSON.stringify(body) : body);
}

async function queryPrometheus(query) {
  const url = new URL("/api/v1/query", prometheusUrl);
  url.searchParams.set("query", query);
  const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error(`Prometheus returned ${response.status}`);
  const payload = await response.json();
  if (payload.status !== "success") throw new Error("Prometheus query failed");
  return payload.data?.result ?? [];
}

function vectorByWorkload(vector) {
  return Object.fromEntries(vector.map((sample) => [
    sample.metric?.destination_workload ?? "unknown",
    Number(sample.value?.[1] ?? 0),
  ]));
}

async function snapshot() {
  const [requestRate, errorRate, p95] = await Promise.all(Object.values(queries).map(queryPrometheus));
  const rates = vectorByWorkload(requestRate);
  const errors = vectorByWorkload(errorRate);
  const latency = vectorByWorkload(p95);
  const serviceNames = Array.from(new Set([...Object.keys(rates), ...Object.keys(errors), ...Object.keys(latency)])).filter((name) => name !== "unknown");
  const services = serviceNames.map((name) => ({
    name,
    requestsPerSecond: rates[name] ?? 0,
    errorRate: rates[name] ? (errors[name] ?? 0) / rates[name] : 0,
    p95Milliseconds: latency[name] ?? 0,
  }));
  return {
    collectedAt: new Date().toISOString(),
    source: "prometheus",
    services,
    aggregate: {
      requestsPerSecond: services.reduce((total, service) => total + service.requestsPerSecond, 0),
      errorRate: services.reduce((total, service) => total + service.errorRate, 0) / Math.max(services.length, 1),
      p95Milliseconds: Math.max(0, ...services.map((service) => service.p95Milliseconds)),
    },
  };
}

const server = http.createServer(async (request, response) => {
  const path = new URL(request.url ?? "/", "http://ops-telemetry").pathname.replace(/^\/api\/telemetry/, "/api");
  if (request.method === "OPTIONS") return send(response, 204, "", "text/plain");
  if (path === "/health") return send(response, 200, { ok: true, service: "ops-telemetry", version: "1.0.1" });

  if (path === "/api/snapshot") {
    try {
      return send(response, 200, await snapshot());
    } catch (error) {
      return send(response, 503, { ok: false, error: "telemetry_unavailable", message: error.message });
    }
  }

  if (path === "/api/stream") {
    response.writeHead(200, {
      "content-type": "text/event-stream",
      "access-control-allow-origin": allowedOrigin,
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    });
    const publish = async () => {
      try {
        response.write(`event: snapshot\ndata: ${JSON.stringify(await snapshot())}\n\n`);
      } catch {
        response.write(`event: warning\ndata: ${JSON.stringify({ error: "telemetry_unavailable" })}\n\n`);
      }
    };
    await publish();
    const interval = setInterval(publish, 2000);
    request.on("close", () => clearInterval(interval));
    return;
  }

  return send(response, 404, { error: "not_found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ level: "info", service: "ops-telemetry", message: "listening", port }));
});

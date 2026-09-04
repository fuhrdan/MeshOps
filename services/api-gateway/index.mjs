import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT || 8080);
const endpoints = {
  auth: process.env.AUTH_URL || "http://auth:8080",
  catalog: process.env.CATALOG_URL || "http://catalog:8080",
  search: process.env.SEARCH_URL || "http://search:8080",
  orders: process.env.ORDERS_URL || "http://orders:8080",
};

function send(response, status, body, traceparent = "") {
  response.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", ...(traceparent ? { traceparent } : {}) });
  response.end(JSON.stringify(body));
}

async function call(name, path, requestId, traceparent, options = {}) {
  const started = performance.now();
  const response = await fetch(`${endpoints[name]}${path}`, {
    ...options,
    headers: { "content-type": "application/json", "x-request-id": requestId, traceparent, ...(options.headers || {}) },
  });
  const body = await response.json();
  return { service: name, status: response.status, durationMs: Math.round(performance.now() - started), body };
}

http.createServer(async (request, response) => {
  const requestId = request.headers["x-request-id"] || randomUUID();
  const traceparent = /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(request.headers.traceparent || "")
    ? request.headers.traceparent
    : `00-${randomUUID().replaceAll("-", "")}-${randomUUID().replaceAll("-", "").slice(0, 16)}-01`;
  const started = performance.now();
  if (request.url === "/health") return send(response, 200, { ok: true, service: "api-gateway", version: "1.0.1" });
  if (request.url?.startsWith("/api/checkout")) {
    try {
      const auth = await call("auth", "/validate", requestId, traceparent);
      const catalog = await call("catalog", "/products/premium-monitor", requestId, traceparent);
      const search = await call("search", "/search?q=monitor", requestId, traceparent);
      const orders = await call("orders", "/orders", requestId, traceparent, {
        method: "POST",
        body: JSON.stringify({ customerId: "customer-7281", sku: "premium-monitor", quantity: 1 }),
      });
      const durationMs = Math.round(performance.now() - started);
      console.log(JSON.stringify({ level: "info", service: "api-gateway", requestId, route: request.url, durationMs, status: 200 }));
      return send(response, 200, { requestId, traceId: traceparent.split("-")[1], durationMs, status: "completed", spans: [auth, catalog, search, orders] }, traceparent);
    } catch (error) {
      console.error(JSON.stringify({ level: "error", service: "api-gateway", requestId, message: error.message }));
      return send(response, 502, { requestId, traceId: traceparent.split("-")[1], status: "failed", error: "downstream service unavailable" }, traceparent);
    }
  }
  return send(response, 404, { requestId, error: "not found" });
}).listen(port, "0.0.0.0", () => console.log(JSON.stringify({ level: "info", service: "api-gateway", port })));

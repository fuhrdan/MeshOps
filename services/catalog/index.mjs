import http from "node:http";
const port = Number(process.env.PORT || 8080);
const products = { "premium-monitor": { sku: "premium-monitor", name: "SignalView 32", price: 42900, currency: "USD" } };
const server = http.createServer((request, response) => {
  const requestId = request.headers["x-request-id"] || "missing";
  const path = new URL(request.url, `http://${request.headers.host}`).pathname;
  let status = 200; let body;
  if (path === "/health") body = { ok: true, service: "catalog", version: "1.0.1" };
  else if (path.startsWith("/products/")) { const sku = path.split("/").pop(); body = products[sku]; if (!body) { status = 404; body = { error: "product not found" }; } }
  else { status = 404; body = { error: "not found" }; }
  console.log(JSON.stringify({ level: "info", service: "catalog", requestId, path, status }));
  response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(body));
});
server.listen(port, "0.0.0.0", () => console.log(JSON.stringify({ level: "info", service: "catalog", port })));

import http from "node:http";
import { randomUUID } from "node:crypto";
const port = Number(process.env.PORT || 8080);
const notificationUrl = process.env.NOTIFICATIONS_URL || "http://notifications:8080";
async function readBody(request) { const chunks = []; for await (const chunk of request) chunks.push(chunk); return JSON.parse(Buffer.concat(chunks).toString() || "{}"); }
http.createServer(async (request, response) => {
  const requestId = request.headers["x-request-id"] || randomUUID(); let status = 200; let body;
  if (request.url === "/health") body = { ok: true, service: "payments", version: "1.0.1" };
  else if (request.url === "/charge" && request.method === "POST") {
    const charge = await readBody(request); const paymentId = `pay-${requestId.slice(0, 8)}`;
    const notify = await fetch(`${notificationUrl}/notify`, { method: "POST", headers: { "content-type": "application/json", "x-request-id": requestId, traceparent: request.headers.traceparent || "" }, body: JSON.stringify({ type: "payment.accepted", paymentId }) });
    body = { approved: true, paymentId, amount: charge.amount, notificationAccepted: notify.ok };
  } else { status = 404; body = { error: "not found" }; }
  console.log(JSON.stringify({ level: "info", service: "payments", requestId, route: request.url, status }));
  response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(body));
}).listen(port, "0.0.0.0", () => console.log(JSON.stringify({ level: "info", service: "payments", port })));

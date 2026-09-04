import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urlparse(self.path)
        request_id = self.headers.get("X-Request-Id", "missing")
        if parsed.path == "/health":
            self.send_json(200, {"ok": True, "service": "search", "version": "1.0.1"})
        elif parsed.path == "/search":
            query = parse_qs(parsed.query).get("q", [""])[0]
            print(json.dumps({"level": "info", "service": "search", "requestId": request_id, "query": query}), flush=True)
            self.send_json(200, {"query": query, "results": [{"sku": "premium-monitor", "score": 0.98}]})
        else:
            self.send_json(404, {"error": "not found"})

    def log_message(self, *_):
        return

ThreadingHTTPServer(("0.0.0.0", int(os.getenv("PORT", "8080"))), Handler).serve_forever()

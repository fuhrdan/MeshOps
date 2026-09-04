import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"ok": True, "service": "notifications", "version": "1.0.1"})
        else:
            self.send_json(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/notify":
            self.send_json(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", "0"))
        event = json.loads(self.rfile.read(length) or b"{}")
        print(json.dumps({"level": "info", "service": "notifications", "requestId": self.headers.get("X-Request-Id", "missing"), "event": event}), flush=True)
        self.send_json(202, {"accepted": True, "channel": "email"})

    def log_message(self, *_):
        return

ThreadingHTTPServer(("0.0.0.0", int(os.getenv("PORT", "8080"))), Handler).serve_forever()

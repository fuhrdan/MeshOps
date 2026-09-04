package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func reply(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { reply(w, 200, map[string]any{"ok": true, "service": "auth", "version": "1.0.1"}) })
	http.HandleFunc("/validate", func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-Id")
		log.Printf(`{"level":"info","service":"auth","requestId":%q,"route":"/validate","status":200}`, requestID)
		reply(w, 200, map[string]any{"valid": true, "subject": "customer-7281", "roles": []string{"customer"}})
	})
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

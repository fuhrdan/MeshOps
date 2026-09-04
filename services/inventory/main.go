package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type reservation struct { SKU string `json:"sku"`; Quantity int `json:"quantity"` }
func reply(w http.ResponseWriter, status int, body any) { w.Header().Set("Content-Type", "application/json"); w.WriteHeader(status); json.NewEncoder(w).Encode(body) }
func main() {
	port := os.Getenv("PORT"); if port == "" { port = "8080" }
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { reply(w, 200, map[string]any{"ok": true, "service": "inventory", "version": "1.0.1"}) })
	http.HandleFunc("/reserve", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost { reply(w, 405, map[string]string{"error":"method not allowed"}); return }
		var item reservation; if err := json.NewDecoder(r.Body).Decode(&item); err != nil { reply(w, 400, map[string]string{"error":"invalid body"}); return }
		log.Printf(`{"level":"info","service":"inventory","requestId":%q,"sku":%q,"quantity":%d}`, r.Header.Get("X-Request-Id"), item.SKU, item.Quantity)
		reply(w, 200, map[string]any{"reserved": true, "sku": item.SKU, "quantity": item.Quantity, "remaining": 41})
	})
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

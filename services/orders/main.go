package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type orderRequest struct { CustomerID string `json:"customerId"`; SKU string `json:"sku"`; Quantity int `json:"quantity"` }
func reply(w http.ResponseWriter, status int, body any) { w.Header().Set("Content-Type", "application/json"); w.WriteHeader(status); json.NewEncoder(w).Encode(body) }
func downstream(client *http.Client, url, requestID, traceparent string, body any) (map[string]any, error) {
	payload, _ := json.Marshal(body); request, _ := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload)); request.Header.Set("Content-Type", "application/json"); request.Header.Set("X-Request-Id", requestID); request.Header.Set("traceparent", traceparent)
	response, err := client.Do(request); if err != nil { return nil, err }; defer response.Body.Close(); data, _ := io.ReadAll(response.Body)
	if response.StatusCode >= 400 { return nil, fmt.Errorf("downstream %s: %s", url, data) }
	result := map[string]any{}; json.Unmarshal(data, &result); return result, nil
}
func main() {
	port := os.Getenv("PORT"); if port == "" { port = "8080" }
	inventoryURL := os.Getenv("INVENTORY_URL"); if inventoryURL == "" { inventoryURL = "http://inventory:8080" }
	paymentsURL := os.Getenv("PAYMENTS_URL"); if paymentsURL == "" { paymentsURL = "http://payments:8080" }
	client := &http.Client{Timeout: 3 * time.Second}
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { reply(w, 200, map[string]any{"ok": true, "service": "orders", "version": "1.0.1"}) })
	http.HandleFunc("/orders", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost { reply(w, 405, map[string]string{"error":"method not allowed"}); return }
		requestID := r.Header.Get("X-Request-Id"); var input orderRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil { reply(w, 400, map[string]string{"error":"invalid body"}); return }
		traceparent := r.Header.Get("traceparent")
		inventory, err := downstream(client, inventoryURL+"/reserve", requestID, traceparent, map[string]any{"sku":input.SKU,"quantity":input.Quantity}); if err != nil { reply(w, 502, map[string]string{"error":err.Error()}); return }
		payment, err := downstream(client, paymentsURL+"/charge", requestID, traceparent, map[string]any{"amount":42900,"currency":"USD"}); if err != nil { reply(w, 502, map[string]string{"error":err.Error()}); return }
		log.Printf(`{"level":"info","service":"orders","requestId":%q,"status":201}`, requestID)
		reply(w, 201, map[string]any{"orderId":"MO-7282","status":"confirmed","inventory":inventory,"payment":payment})
	})
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

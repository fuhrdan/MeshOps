"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Boxes, CheckCircle2, ChevronRight, CircleDot,
  Clock3, Cpu, Database, DollarSign, Gauge, GitBranch, HeartPulse, LockKeyhole,
  Network, Pause, Play, RotateCcw, Server, ShieldCheck, Smile, Target,
  TerminalSquare, TimerReset, TrendingUp, Wrench, Zap, Route, RefreshCw, Split,
  Rocket, Hand, Undo2, SearchCheck,
  Waypoints, Search, ListFilter, Braces, Link2,
  FlaskConical, ShieldAlert, Layers3,
  Fingerprint, KeyRound,
  Award, ClipboardCheck, Download, Flag, Trophy,
  ArrowLeft, ArrowRight, BookOpen, GraduationCap, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

type ServiceName = "api-gateway" | "auth" | "catalog" | "search" | "orders" | "inventory" | "payments" | "notifications";
type EventTone = "request" | "success" | "mesh" | "system" | "incident";
type EventFilter = "all" | "requests" | "mesh" | "incidents";
type IncidentStatus = "idle" | "active" | "diagnosed" | "recovered";
type DifficultyId = "guided" | "standard" | "senior" | "commander";
type IncidentId = "payments-latency" | "inventory-errors" | "catalog-brownout" | "auth-failure" | "orders-latency";
type ServiceInfo = {
  name: ServiceName; label: string; language: string; latency: number;
  rate: number; success: number; instances: number; cpu: number;
};
type EventItem = { id: number; time: string; tone: EventTone; text: string };
type IncidentDefinition = {
  id: IncidentId; label: string; target: ServiceName; severity: string; summary: string;
  symptom: string; manifest: string; rateFactor: number; successRate: number; latencyPenalty: number;
  cpuPenalty: number; answer: string; clues: string[]; choices: string[];
};
type Difficulty = { id: DifficultyId; label: string; multiplier: number; clueCount: number; description: string };
type TrafficPolicy = { retries: number; timeoutMs: number; canaryPercent: number };
type CanaryStatus = "idle" | "running" | "held" | "rolled-back" | "promoted";
type CanaryScenarioId = "bad-deployment" | "memory-leak" | "slow-db" | "malformed-response" | "dependency-mismatch" | "cache-stampede";
type CanaryScenario = { id: CanaryScenarioId; label: string; service: ServiceName; signal: string; impactStart: number; successPenalty: number; latencyPenalty: number };
type TraceFilter = "all" | "slow" | "errors";
type SpanStatus = "ok" | "error";
type TraceSpan = { id: string; parent: string | null; service: ServiceName; operation: string; start: number; duration: number; status: SpanStatus; code: number; tags: string[]; events: string[] };
type TraceRecord = { id: string; request: string; scenario: string; duration: number; status: SpanStatus; started: string; spans: TraceSpan[] };
type ResilienceStatus = "idle" | "fault" | "testing" | "passed" | "failed";
type ResiliencePatternId = "circuit-breaker" | "outlier-ejection" | "bulkhead" | "timeout" | "retry-budget" | "fallback";
type ResilienceScenarioId = "dependency-timeout" | "retry-storm" | "replica-loss" | "zone-failure" | "resource-saturation" | "cache-outage";
type ResiliencePattern = { id: ResiliencePatternId; label: string; summary: string; tradeoff: string };
type ResilienceScenario = { id: ResilienceScenarioId; label: string; target: ServiceName; symptom: string; required: ResiliencePatternId[]; success: number; p95: number; saturation: number; recovery: number };
type SecurityStatus = "idle" | "armed" | "probing" | "contained" | "breached";
type DefenseId = "strict-mtls" | "workload-identity" | "least-privilege" | "jwt-validation" | "egress-allowlist" | "network-segmentation" | "outlier-ejection" | "bounded-timeout" | "disruption-budget";
type SecurityScenarioId = "plaintext-downgrade" | "identity-theft" | "lateral-movement" | "jwt-escalation" | "egress-exfiltration" | "payment-network-chaos" | "orders-pod-failure";
type Defense = { id: DefenseId; label: string; layer: string; summary: string };
type SecurityScenario = { id: SecurityScenarioId; label: string; category: "zero-trust" | "chaos"; target: ServiceName; attempt: string; required: DefenseId[]; blastRadius: number };
type CampaignStatus = "briefing" | "active" | "complete";
type CampaignMissionId = "restore-service" | "guard-release" | "trace-root-cause" | "prove-resilience" | "contain-breach";
type CampaignMission = {
  id: CampaignMissionId; callSign: string; title: string; discipline: string; brief: string;
  objective: string; sectionId: string; reward: number;
};
type EntryMode = "cover" | "tutorial" | "console";
type TutorialVisual = "helpers" | "mesh" | "incident" | "trace" | "controls" | "practice";
type TutorialStep = { kicker: string; title: string; explanation: string; remember: string; visual: TutorialVisual };

const services: ServiceInfo[] = [
  { name: "api-gateway", label: "API Gateway", language: "Node.js", latency: 24, rate: 184, success: 99.99, instances: 2, cpu: 38 },
  { name: "auth", label: "Auth", language: "Go", latency: 18, rate: 172, success: 100, instances: 2, cpu: 24 },
  { name: "catalog", label: "Catalog", language: "Node.js", latency: 37, rate: 149, success: 99.98, instances: 2, cpu: 42 },
  { name: "search", label: "Search", language: "Python", latency: 49, rate: 76, success: 99.97, instances: 1, cpu: 46 },
  { name: "orders", label: "Orders", language: "Go", latency: 42, rate: 93, success: 99.99, instances: 2, cpu: 34 },
  { name: "inventory", label: "Inventory", language: "Go", latency: 31, rate: 91, success: 100, instances: 2, cpu: 28 },
  { name: "payments", label: "Payments", language: "Node.js", latency: 58, rate: 88, success: 99.96, instances: 2, cpu: 51 },
  { name: "notifications", label: "Notifications", language: "Python", latency: 22, rate: 85, success: 100, instances: 1, cpu: 19 },
];

const incidents: IncidentDefinition[] = [
  {
    id: "payments-latency", label: "Payment latency spike", target: "payments", severity: "SEV-2",
    summary: "Checkout latency climbs while authorization still mostly succeeds.",
    symptom: "P95 checkout latency breaches 700 ms and completed-order throughput falls.",
    manifest: "deploy/istio/faults/payments-latency.yaml", rateFactor: .82, successRate: 98.90, latencyPenalty: 650, cpuPenalty: 11,
    answer: "Istio delay injected on payments",
    clues: ["The latency increase begins at the payments hop.", "mTLS and workload readiness remain healthy.", "Errors stay low while response time rises sharply."],
    choices: ["Istio delay injected on payments", "Inventory database connection exhaustion", "Auth certificate rotation failure", "API Gateway CPU saturation"],
  },
  {
    id: "inventory-errors", label: "Inventory 503 storm", target: "inventory", severity: "SEV-1",
    summary: "Stock reservations intermittently fail and orders cannot advance reliably.",
    symptom: "Checkout success drops below 90% with a concentrated burst of HTTP 503 responses.",
    manifest: "deploy/istio/faults/inventory-errors.yaml", rateFactor: .68, successRate: 88.40, latencyPenalty: 180, cpuPenalty: 5,
    answer: "Istio HTTP abort injected on inventory",
    clues: ["503s originate on the orders → inventory edge.", "Inventory pods remain Ready during the failure.", "The failure is probabilistic rather than a full outage."],
    choices: ["Payments DNS resolution failure", "Istio HTTP abort injected on inventory", "Catalog memory leak", "Notification queue backlog"],
  },
  {
    id: "catalog-brownout", label: "Catalog brownout", target: "catalog", severity: "SEV-2",
    summary: "Product reads become slow and occasionally fail before order creation.",
    symptom: "Both latency and error rate worsen on catalog traffic, producing a mixed brownout signature.",
    manifest: "deploy/istio/faults/catalog-brownout.yaml", rateFactor: .72, successRate: 93.50, latencyPenalty: 420, cpuPenalty: 8,
    answer: "Combined delay and abort fault on catalog",
    clues: ["Catalog shows simultaneous latency and 503 degradation.", "Search remains healthy despite being adjacent in the topology.", "The fault affects only a percentage of requests."],
    choices: ["Combined delay and abort fault on catalog", "Orders deployment regression", "Payments upstream throttling", "Mesh-wide mTLS failure"],
  },
  {
    id: "auth-failure", label: "Authentication failure", target: "auth", severity: "SEV-1",
    summary: "Requests are rejected near the start of the checkout path.",
    symptom: "Request volume collapses downstream and success rate falls rapidly while the gateway stays available.",
    manifest: "deploy/istio/faults/auth-failure.yaml", rateFactor: .45, successRate: 71.80, latencyPenalty: 80, cpuPenalty: 3,
    answer: "Istio HTTP abort injected on auth",
    clues: ["The first failing internal hop is API Gateway → Auth.", "Downstream services receive substantially less traffic.", "Auth readiness remains 2/2 despite the request failures."],
    choices: ["Expired payments token", "Istio HTTP abort injected on auth", "Inventory replica loss", "Gateway route misconfiguration"],
  },
  {
    id: "orders-latency", label: "Orders saturation simulation", target: "orders", severity: "SEV-2",
    summary: "Order coordination stalls long enough to violate the checkout SLO.",
    symptom: "Orders requests develop a long tail, driving P95 above one second and reducing throughput.",
    manifest: "deploy/istio/faults/orders-latency.yaml", rateFactor: .74, successRate: 96.20, latencyPenalty: 900, cpuPenalty: 14,
    answer: "Istio delay injected on orders",
    clues: ["The long tail starts on the catalog → orders hop.", "Orders CPU appears elevated but pods remain Ready.", "The dominant signal is latency rather than HTTP errors."],
    choices: ["Notification worker starvation", "Istio delay injected on orders", "Catalog 503 injection", "Cluster-wide network partition"],
  },
];

const difficulties: Difficulty[] = [
  { id: "guided", label: "Guided", multiplier: .75, clueCount: 3, description: "All investigation clues visible" },
  { id: "standard", label: "Standard", multiplier: 1, clueCount: 2, description: "Two investigation clues" },
  { id: "senior", label: "Senior", multiplier: 1.35, clueCount: 1, description: "One investigation clue" },
  { id: "commander", label: "Commander", multiplier: 1.7, clueCount: 0, description: "Metrics and topology only" },
];

const canaryStages = [5, 10, 25, 50, 100];
const canaryScenarios: CanaryScenario[] = [
  { id: "bad-deployment", label: "Bad deployment", service: "payments", signal: "Immediate 5xx regression", impactStart: 5, successPenalty: 30, latencyPenalty: 110 },
  { id: "memory-leak", label: "Memory leak", service: "catalog", signal: "Latency grows with exposure", impactStart: 25, successPenalty: 1.4, latencyPenalty: 260 },
  { id: "slow-db", label: "Slow database queries", service: "orders", signal: "P95 and P99 divergence", impactStart: 10, successPenalty: .8, latencyPenalty: 430 },
  { id: "malformed-response", label: "Malformed API response", service: "catalog", signal: "Low-volume schema failures", impactStart: 25, successPenalty: 2.2, latencyPenalty: 45 },
  { id: "dependency-mismatch", label: "Dependency incompatibility", service: "inventory", signal: "Errors rise after wider routing", impactStart: 50, successPenalty: 3.7, latencyPenalty: 95 },
  { id: "cache-stampede", label: "Cache stampede", service: "search", signal: "Tail latency and CPU surge", impactStart: 25, successPenalty: 1.1, latencyPenalty: 520 },
];

const traces: TraceRecord[] = [
  { id: "4fd91a8c2e70", request: "MO-7314", scenario: "Healthy checkout", duration: 184, status: "ok", started: "09:43:18", spans: [
    { id: "a01", parent: null, service: "api-gateway", operation: "POST /api/checkout", start: 0, duration: 184, status: "ok", code: 200, tags: ["http.route=/api/checkout", "mesh.peer=customer"], events: ["request.accepted"] },
    { id: "a02", parent: "a01", service: "auth", operation: "GET /validate", start: 9, duration: 18, status: "ok", code: 200, tags: ["rpc.system=http", "mtls=true"], events: ["token.validated"] },
    { id: "a03", parent: "a01", service: "catalog", operation: "GET /products/:sku", start: 31, duration: 37, status: "ok", code: 200, tags: ["cache.hit=true", "sku=premium-monitor"], events: [] },
    { id: "a04", parent: "a01", service: "orders", operation: "POST /orders", start: 72, duration: 102, status: "ok", code: 201, tags: ["order.id=MO-7314"], events: ["inventory.reserved", "payment.authorized"] },
    { id: "a05", parent: "a04", service: "inventory", operation: "POST /reserve", start: 82, duration: 29, status: "ok", code: 200, tags: ["stock.remaining=18"], events: [] },
    { id: "a06", parent: "a04", service: "payments", operation: "POST /charge", start: 118, duration: 48, status: "ok", code: 200, tags: ["currency=USD"], events: ["authorization.approved"] },
  ]},
  { id: "9ac21e734bb5", request: "MO-7315", scenario: "Payment tail latency", duration: 842, status: "ok", started: "09:43:31", spans: [
    { id: "b01", parent: null, service: "api-gateway", operation: "POST /api/checkout", start: 0, duration: 842, status: "ok", code: 200, tags: ["http.route=/api/checkout", "slo.breached=true"], events: [] },
    { id: "b02", parent: "b01", service: "auth", operation: "GET /validate", start: 8, duration: 19, status: "ok", code: 200, tags: ["mtls=true"], events: [] },
    { id: "b03", parent: "b01", service: "catalog", operation: "GET /products/:sku", start: 31, duration: 39, status: "ok", code: 200, tags: ["cache.hit=true"], events: [] },
    { id: "b04", parent: "b01", service: "orders", operation: "POST /orders", start: 75, duration: 754, status: "ok", code: 201, tags: ["retry.count=0"], events: [] },
    { id: "b05", parent: "b04", service: "inventory", operation: "POST /reserve", start: 88, duration: 30, status: "ok", code: 200, tags: [], events: [] },
    { id: "b06", parent: "b04", service: "payments", operation: "POST /charge", start: 124, duration: 692, status: "ok", code: 200, tags: ["istio.fault=delay", "net.peer.name=payments"], events: ["client.wait"] },
  ]},
  { id: "7e840dc11f29", request: "MO-7316", scenario: "Inventory 503", duration: 219, status: "error", started: "09:43:44", spans: [
    { id: "c01", parent: null, service: "api-gateway", operation: "POST /api/checkout", start: 0, duration: 219, status: "error", code: 502, tags: ["error.type=upstream"], events: ["checkout.failed"] },
    { id: "c02", parent: "c01", service: "auth", operation: "GET /validate", start: 8, duration: 17, status: "ok", code: 200, tags: [], events: [] },
    { id: "c03", parent: "c01", service: "catalog", operation: "GET /products/:sku", start: 29, duration: 36, status: "ok", code: 200, tags: [], events: [] },
    { id: "c04", parent: "c01", service: "orders", operation: "POST /orders", start: 71, duration: 135, status: "error", code: 502, tags: ["error.type=downstream"], events: ["order.aborted"] },
    { id: "c05", parent: "c04", service: "inventory", operation: "POST /reserve", start: 83, duration: 111, status: "error", code: 503, tags: ["istio.fault=abort", "retry.count=2"], events: ["retry.1", "retry.2", "retries.exhausted"] },
  ]},
  { id: "1c06bf849aa2", request: "MO-7317", scenario: "Catalog cache miss", duration: 328, status: "ok", started: "09:44:02", spans: [
    { id: "d01", parent: null, service: "api-gateway", operation: "POST /api/checkout", start: 0, duration: 328, status: "ok", code: 200, tags: [], events: [] },
    { id: "d02", parent: "d01", service: "catalog", operation: "GET /products/:sku", start: 28, duration: 177, status: "ok", code: 200, tags: ["cache.hit=false", "db.system=postgresql"], events: ["cache.miss", "db.query"] },
    { id: "d03", parent: "d01", service: "orders", operation: "POST /orders", start: 211, duration: 101, status: "ok", code: 201, tags: [], events: [] },
  ]},
  { id: "5b7ee302ad18", request: "MO-7318", scenario: "Auth rejection", duration: 74, status: "error", started: "09:44:17", spans: [
    { id: "e01", parent: null, service: "api-gateway", operation: "POST /api/checkout", start: 0, duration: 74, status: "error", code: 401, tags: ["enduser.id=redacted"], events: ["request.rejected"] },
    { id: "e02", parent: "e01", service: "auth", operation: "GET /validate", start: 7, duration: 54, status: "error", code: 401, tags: ["auth.reason=expired", "mtls=true"], events: ["token.expired"] },
  ]},
  { id: "c832be19a704", request: "MO-7319", scenario: "Canary regression", duration: 571, status: "error", started: "09:44:29", spans: [
    { id: "f01", parent: null, service: "api-gateway", operation: "POST /api/checkout", start: 0, duration: 571, status: "error", code: 502, tags: ["deployment.track=canary"], events: [] },
    { id: "f02", parent: "f01", service: "catalog", operation: "GET /products/:sku", start: 24, duration: 531, status: "error", code: 500, tags: ["service.version=canary", "exception.type=SchemaError"], events: ["decode.failed", "span.exception"] },
  ]},
];

const resiliencePatterns: ResiliencePattern[] = [
  { id: "circuit-breaker", label: "Circuit breaker", summary: "Stop calls after repeated failures", tradeoff: "Can reject requests during recovery" },
  { id: "outlier-ejection", label: "Outlier ejection", summary: "Remove unhealthy endpoints", tradeoff: "Needs enough healthy replicas" },
  { id: "bulkhead", label: "Bulkhead", summary: "Limit concurrent downstream work", tradeoff: "Queues or rejects excess demand" },
  { id: "timeout", label: "Bounded timeout", summary: "Cap dependency wait time", tradeoff: "Too short creates false failures" },
  { id: "retry-budget", label: "Retry budget", summary: "Retry only a bounded fraction", tradeoff: "Still adds controlled load" },
  { id: "fallback", label: "Graceful fallback", summary: "Return safe degraded data", tradeoff: "May be stale or incomplete" },
];

const resilienceScenarios: ResilienceScenario[] = [
  { id: "dependency-timeout", label: "Payment dependency timeout", target: "payments", symptom: "Hung authorizations consume workers until checkout stalls.", required: ["timeout", "circuit-breaker"], success: 72.4, p95: 1480, saturation: 94, recovery: 168 },
  { id: "retry-storm", label: "Inventory retry storm", target: "inventory", symptom: "Unbounded retries amplify a partial inventory failure.", required: ["retry-budget", "bulkhead"], success: 81.1, p95: 940, saturation: 97, recovery: 142 },
  { id: "replica-loss", label: "Orders replica loss", target: "orders", symptom: "Traffic continues reaching an unhealthy orders endpoint.", required: ["outlier-ejection", "bulkhead"], success: 86.7, p95: 710, saturation: 88, recovery: 96 },
  { id: "zone-failure", label: "Availability-zone failure", target: "catalog", symptom: "A failed zone removes capacity and product reads degrade.", required: ["outlier-ejection", "fallback"], success: 78.9, p95: 1120, saturation: 91, recovery: 214 },
  { id: "resource-saturation", label: "Search resource saturation", target: "search", symptom: "Concurrent expensive searches exhaust the worker pool.", required: ["bulkhead", "circuit-breaker"], success: 83.5, p95: 1260, saturation: 99, recovery: 187 },
  { id: "cache-outage", label: "Catalog cache outage", target: "catalog", symptom: "Cache misses force slow database reads for every request.", required: ["timeout", "fallback"], success: 89.2, p95: 830, saturation: 86, recovery: 121 },
];

const defenses: Defense[] = [
  { id: "strict-mtls", label: "Strict mTLS", layer: "Transport", summary: "Reject plaintext service traffic" },
  { id: "workload-identity", label: "Workload identity", layer: "Identity", summary: "Authenticate SPIFFE principals" },
  { id: "least-privilege", label: "Least privilege", layer: "Authorization", summary: "Allow only documented callers" },
  { id: "jwt-validation", label: "JWT validation", layer: "Edge identity", summary: "Verify issuer, signature, and claims" },
  { id: "egress-allowlist", label: "Egress allowlist", layer: "Exfiltration", summary: "Restrict outbound destinations" },
  { id: "network-segmentation", label: "Network segmentation", layer: "Network", summary: "Default-deny lateral reach" },
  { id: "outlier-ejection", label: "Outlier ejection", layer: "Chaos", summary: "Remove unhealthy endpoints" },
  { id: "bounded-timeout", label: "Bounded timeout", layer: "Chaos", summary: "Limit slow dependency waits" },
  { id: "disruption-budget", label: "Disruption budget", layer: "Chaos", summary: "Preserve minimum healthy replicas" },
];

const securityScenarios: SecurityScenario[] = [
  { id: "plaintext-downgrade", label: "Plaintext downgrade", category: "zero-trust", target: "payments", attempt: "A caller bypasses Envoy and attempts unencrypted payment traffic.", required: ["strict-mtls"], blastRadius: 4 },
  { id: "identity-theft", label: "Stolen service identity", category: "zero-trust", target: "orders", attempt: "A compromised catalog token attempts to create orders.", required: ["workload-identity", "least-privilege"], blastRadius: 5 },
  { id: "lateral-movement", label: "Lateral movement", category: "zero-trust", target: "inventory", attempt: "Notifications probes inventory and payments outside the call graph.", required: ["least-privilege", "network-segmentation"], blastRadius: 6 },
  { id: "jwt-escalation", label: "JWT role escalation", category: "zero-trust", target: "api-gateway", attempt: "A forged admin claim reaches a protected checkout operation.", required: ["jwt-validation", "least-privilege"], blastRadius: 4 },
  { id: "egress-exfiltration", label: "Egress exfiltration", category: "zero-trust", target: "catalog", attempt: "A compromised catalog pod attempts an unknown external connection.", required: ["egress-allowlist", "network-segmentation"], blastRadius: 7 },
  { id: "payment-network-chaos", label: "Payment network delay", category: "chaos", target: "payments", attempt: "Three hundred milliseconds of latency and jitter hit the payment edge.", required: ["bounded-timeout", "outlier-ejection"], blastRadius: 5 },
  { id: "orders-pod-failure", label: "Orders pod failure", category: "chaos", target: "orders", attempt: "One orders workload is terminated during sustained checkout traffic.", required: ["disruption-budget", "outlier-ejection"], blastRadius: 3 },
];

const campaignMissions: CampaignMission[] = [
  { id: "restore-service", callSign: "REDLINE", title: "Restore the checkout path", discipline: "Incident response", brief: "A payment delay is violating the checkout latency objective during a high-value traffic window.", objective: "Diagnose the payment fault in Commander mode, apply a verified traffic policy, and recover production.", sectionId: "incident-engine", reward: 1500 },
  { id: "guard-release", callSign: "NARROW GATE", title: "Stop an unsafe release", discipline: "Progressive delivery", brief: "A new payment build produces an immediate 5xx regression at the first canary stage.", objective: "Start the 5% bad-deployment canary, trust the failed guardrail, and roll back before wider exposure.", sectionId: "canary-commander", reward: 1200 },
  { id: "trace-root-cause", callSign: "NEEDLE", title: "Prove the failing span", discipline: "Observability", brief: "The incident review needs trace evidence that identifies the first failing service boundary.", objective: "Filter or inspect an error trace, select its failing span, and confirm the root span for the record.", sectionId: "trace-explorer", reward: 900 },
  { id: "prove-resilience", callSign: "BULKHEAD", title: "Validate the protection design", discipline: "Resilience engineering", brief: "A hanging payment dependency threatens worker exhaustion and cascading checkout failure.", objective: "Contain the dependency-timeout experiment with the smallest protection set and pass the 500-request test.", sectionId: "resilience-game-day", reward: 1300 },
  { id: "contain-breach", callSign: "LOCKBOX", title: "Contain stolen identity", discipline: "Zero trust", brief: "A compromised catalog identity is attempting an unauthorized order operation.", objective: "Use the minimum justified trust controls to contain the identity-theft probe with zero remaining blast radius.", sectionId: "trust-boundary", reward: 1500 },
];

const tutorialSteps: TutorialStep[] = [
  { kicker: "1 · The little helpers", title: "An online store is a team", explanation: "Imagine several tiny helpers passing one shopping order down a line. One checks who you are, one finds the item, and another takes the payment.", remember: "Each helper is a service. Together, they make one checkout work.", visual: "helpers" },
  { kicker: "2 · The safe hallways", title: "The mesh connects the team", explanation: "The service mesh is like a set of guarded hallways between the helpers. It directs each message and makes every helper prove who it is before talking.", remember: "Istio manages the hallways; mTLS locks and verifies them.", visual: "mesh" },
  { kicker: "3 · Something goes wrong", title: "An incident is a struggling helper", explanation: "Sometimes a helper becomes slow, confused, or unavailable. Customers notice the whole store feels broken even when only one small part has trouble.", remember: "Red numbers are symptoms. Your first job is to find the cause.", visual: "incident" },
  { kicker: "4 · Follow one order", title: "A trace is a trail of footprints", explanation: "A distributed trace follows one order through every helper it visited. The longest or broken footprint usually shows where the trouble began.", remember: "Use the trace waterfall to find the first slow or failed span.", visual: "trace" },
  { kicker: "5 · Fix it carefully", title: "Small guardrails beat wild guesses", explanation: "Retries, timeouts, canaries, and circuit breakers are small safety tools. Pick only what the problem needs, then watch the numbers before declaring victory.", remember: "Change a little, observe, and avoid making the problem bigger.", visual: "controls" },
  { kicker: "6 · Your practice room", title: "MeshOps lets you practice safely", explanation: "The browser creates pretend failures with predictable results, so you can learn without hurting a real system. The included Kubernetes lab is real, but it never injects faults or chaos by itself.", remember: "Start the campaign, inspect the evidence, make a decision, and recover.", visual: "practice" },
];

const requestPath: ServiceName[] = ["api-gateway", "auth", "catalog", "orders", "inventory", "payments", "notifications"];
const serviceRows: ServiceName[][] = [["api-gateway"], ["auth", "catalog", "orders"], ["search", "inventory", "payments"], ["notifications"]];
const seedLatency = [113, 118, 116, 121, 119, 124, 120, 117, 122, 126, 123, 121, 125, 119, 122, 124, 120, 118, 123, 122];
const seedEvents: EventItem[] = [
  { id: 4, time: "09:42:08", tone: "mesh", text: "Istio reports 100% sidecar coverage" },
  { id: 3, time: "09:42:04", tone: "success", text: "All service health checks passing" },
  { id: 2, time: "09:41:48", tone: "system", text: "payments scaled to 2 ready workloads" },
  { id: 1, time: "09:41:15", tone: "request", text: "Steady checkout traffic profile loaded" },
];
const baseClock = 9 * 3600 + 42 * 60 + 10;

function formatClock(seconds: number) {
  const time = baseClock + seconds;
  return [Math.floor(time / 3600) % 24, Math.floor((time % 3600) / 60), time % 60]
    .map((value) => value.toString().padStart(2, "0")).join(":");
}

function sparklinePoints(values: number[]) {
  const width = 500;
  const height = 88;
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  return values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / Math.max(max - min, 1)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function ServiceNode({ service, active, visited, selected, meshOverlay, rateMultiplier, degraded, latencyPenalty, onSelect }: {
  service: ServiceInfo; active: boolean; visited: boolean; selected: boolean; meshOverlay: boolean;
  rateMultiplier: number; degraded: boolean; latencyPenalty: number; onSelect: () => void;
}) {
  const nodeLatency = service.latency * 2 + 12 + (degraded ? latencyPenalty : 0);
  return (
    <button
      className={`service-node ${active ? "is-active" : ""} ${visited ? "is-visited" : ""} ${selected ? "is-selected" : ""} ${degraded ? "is-degraded" : ""}`}
      onClick={onSelect} type="button" aria-label={`Inspect ${service.label}`}
    >
      <span className="service-node__pulse" aria-hidden="true" />
      <span className="service-node__topline">
        <span className="service-node__icon"><Server size={16} /></span>
        <span className="node-health"><i className={`health-dot ${degraded ? "health-dot--degraded" : ""}`} /> {degraded ? "Degraded" : "Healthy"}</span>
      </span>
      <strong>{service.label}</strong>
      <span className="node-runtime">{service.language}</span>
      <span className="node-metrics"><b>{Math.round(service.rate * rateMultiplier)}</b> rpm <b>{nodeLatency}</b> ms</span>
      {meshOverlay && <span className="proxy-badge"><Network size={12} /> envoy · mTLS</span>}
    </button>
  );
}

function TutorialPicture({ kind }: { kind: TutorialVisual }) {
  if (kind === "helpers") return <div className="lesson-picture helper-picture" aria-label="Four services passing a checkout request"><div><Server /><span>Gate</span></div><i>→</i><div><KeyRound /><span>Auth</span></div><i>→</i><div><Boxes /><span>Order</span></div><i>→</i><div><DollarSign /><span>Pay</span></div></div>;
  if (kind === "mesh") return <div className="lesson-picture mesh-picture" aria-label="Protected service mesh connection"><div><Server /><span>Service A</span></div><span className="guarded-link"><LockKeyhole /><i /></span><div><Server /><span>Service B</span></div><strong><Network /> Istio checks the path</strong></div>;
  if (kind === "incident") return <div className="lesson-picture incident-picture" aria-label="One unhealthy service causing bad customer metrics"><div className="incident-helper"><AlertTriangle /><span>Payments is slow</span></div><div className="simple-metrics"><span><i style={{ width: "91%" }} />Success</span><span className="is-alert"><i style={{ width: "38%" }} />Speed</span><span className="is-alert"><i style={{ width: "62%" }} />Happy customers</span></div></div>;
  if (kind === "trace") return <div className="lesson-picture trace-picture" aria-label="Trace waterfall with one long payment span"><span>Gateway<i style={{ width: "84%" }} /></span><span>Auth<i style={{ width: "20%" }} /></span><span>Orders<i style={{ width: "58%" }} /></span><span className="is-alert">Payments<i style={{ width: "92%" }} /></span><strong><Waypoints /> One order, every stop</strong></div>;
  if (kind === "controls") return <div className="lesson-picture controls-picture" aria-label="Three reliability controls"><div><RefreshCw /><span>Retry</span><small>Try once more</small></div><div><TimerReset /><span>Timeout</span><small>Stop waiting</small></div><div><Rocket /><span>Canary</span><small>Start small</small></div></div>;
  return <div className="lesson-picture practice-picture" aria-label="Safe practice loop"><div><FlaskConical /><span>Practice fault</span></div><i>→</i><div><SearchCheck /><span>Find clues</span></div><i>→</i><div><ShieldCheck /><span>Recover</span></div><strong>Safe, repeatable, local</strong></div>;
}

function MeshOpsConsole({ onExit }: { onExit: () => void }) {
  const [selectedName, setSelectedName] = useState<ServiceName>("payments");
  const [activeHop, setActiveHop] = useState(-1);
  const [visited, setVisited] = useState<ServiceName[]>([]);
  const [live, setLive] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simSeconds, setSimSeconds] = useState(0);
  const [requestNumber, setRequestNumber] = useState(7281);
  const [completed, setCompleted] = useState(2487);
  const [score, setScore] = useState(9280);
  const [events, setEvents] = useState<EventItem[]>(seedEvents);
  const [latencySeries, setLatencySeries] = useState(seedLatency);
  const [meshOverlay, setMeshOverlay] = useState(true);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [selectedIncidentId, setSelectedIncidentId] = useState<IncidentId>("payments-latency");
  const [difficultyId, setDifficultyId] = useState<DifficultyId>("standard");
  const [activeIncidentId, setActiveIncidentId] = useState<IncidentId | null>(null);
  const [incidentStatus, setIncidentStatus] = useState<IncidentStatus>("idle");
  const [incidentElapsed, setIncidentElapsed] = useState(0);
  const [diagnosis, setDiagnosis] = useState("");
  const [wrongCalls, setWrongCalls] = useState(0);
  const [lastAward, setLastAward] = useState(0);
  const [policy, setPolicy] = useState<TrafficPolicy>({ retries: 0, timeoutMs: 0, canaryPercent: 0 });
  const [policyApplied, setPolicyApplied] = useState(false);
  const [canaryScenarioId, setCanaryScenarioId] = useState<CanaryScenarioId>("memory-leak");
  const [canaryStatus, setCanaryStatus] = useState<CanaryStatus>("idle");
  const [canaryStageIndex, setCanaryStageIndex] = useState(0);
  const [analysisRuns, setAnalysisRuns] = useState(0);
  const [traceFilter, setTraceFilter] = useState<TraceFilter>("all");
  const [traceQuery, setTraceQuery] = useState("");
  const [selectedTraceId, setSelectedTraceId] = useState(traces[1].id);
  const [selectedSpanId, setSelectedSpanId] = useState(traces[1].spans.at(-1)?.id ?? "");
  const [resilienceScenarioId, setResilienceScenarioId] = useState<ResilienceScenarioId>("dependency-timeout");
  const [resilienceStatus, setResilienceStatus] = useState<ResilienceStatus>("idle");
  const [selectedPatterns, setSelectedPatterns] = useState<ResiliencePatternId[]>([]);
  const [experimentRuns, setExperimentRuns] = useState(0);
  const [securityScenarioId, setSecurityScenarioId] = useState<SecurityScenarioId>("identity-theft");
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>("idle");
  const [selectedDefenses, setSelectedDefenses] = useState<DefenseId[]>([]);
  const [securityRuns, setSecurityRuns] = useState(0);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>("briefing");
  const [campaignMissionIndex, setCampaignMissionIndex] = useState(0);
  const [completedMissionIds, setCompletedMissionIds] = useState<CampaignMissionId[]>([]);
  const [campaignScore, setCampaignScore] = useState(0);
  const [traceRootConfirmed, setTraceRootConfirmed] = useState(false);
  const clockRef = useRef(0);
  const eventIdRef = useRef(5);

  const activeName = activeHop >= 0 ? requestPath[activeHop] : null;
  const configuredIncident = useMemo(() => incidents.find((item) => item.id === selectedIncidentId) ?? incidents[0], [selectedIncidentId]);
  const currentIncident = useMemo(() => incidents.find((item) => item.id === activeIncidentId) ?? null, [activeIncidentId]);
  const difficulty = useMemo(() => difficulties.find((item) => item.id === difficultyId) ?? difficulties[1], [difficultyId]);
  const incidentDegrading = incidentStatus === "active" || incidentStatus === "diagnosed";
  const incidentRateFactor = incidentDegrading && currentIncident ? currentIncident.rateFactor : 1;
  const rateMultiplier = (live ? 1 + (speed - 1) * .18 : 1) * incidentRateFactor;
  const retryLift = policyApplied ? Math.min(8, policy.retries * 2.6) : 0;
  const canaryLift = policyApplied ? policy.canaryPercent * .12 : 0;
  const globalSuccess = incidentDegrading && currentIncident ? Math.min(99.75, currentIncident.successRate + retryLift + canaryLift) : 99.98;
  const selected = useMemo(() => services.find((service) => service.name === selectedName) ?? services[0], [selectedName]);
  const selectedDegraded = Boolean(incidentDegrading && currentIncident?.target === selected.name);
  const selectedLatencyPenalty = selectedDegraded ? currentIncident?.latencyPenalty ?? 0 : 0;
  const selectedCpu = Math.min(99, selected.cpu + (selectedDegraded ? currentIncident?.cpuPenalty ?? 0 : 0));
  const selectedSuccess = selectedDegraded && currentIncident ? Math.min(selected.success, currentIncident.successRate) : selected.success;
  const rawP95 = latencySeries.at(-1) ?? 122;
  const p95 = policyApplied && policy.timeoutMs > 0 ? Math.min(rawP95, policy.timeoutMs) : rawP95;
  const availability = incidentDegrading ? Math.max(70, globalSuccess - .15) : 99.98;
  const revenue = incidentDegrading ? (18.4 * incidentRateFactor).toFixed(1) : "18.4";
  const satisfaction = incidentDegrading ? Math.max(60, Math.round(globalSuccess - 2)) : 98;
  const filteredEvents = useMemo(() => events.filter((event) => {
    if (eventFilter === "requests") return event.tone === "request" || event.tone === "success";
    if (eventFilter === "mesh") return event.tone === "mesh";
    if (eventFilter === "incidents") return event.tone === "incident";
    return true;
  }), [eventFilter, events]);
  const canaryScenario = useMemo(() => canaryScenarios.find((item) => item.id === canaryScenarioId) ?? canaryScenarios[0], [canaryScenarioId]);
  const canaryWeight = canaryStatus === "idle" || canaryStatus === "rolled-back" ? 0 : canaryStages[canaryStageIndex];
  const canaryAffected = canaryWeight >= canaryScenario.impactStart;
  const exposure = canaryAffected ? canaryWeight / 100 : 0;
  const canarySuccess = 99.98 - canaryScenario.successPenalty * exposure;
  const canaryP50 = 62 + Math.round(canaryScenario.latencyPenalty * exposure * .18);
  const canaryP95 = 122 + Math.round(canaryScenario.latencyPenalty * exposure * .62);
  const canaryP99 = 178 + Math.round(canaryScenario.latencyPenalty * exposure);
  const analysisVerdict = !canaryAffected ? "pass" : canarySuccess < 98.8 || canaryP99 > 520 ? "fail" : canarySuccess < 99.5 || canaryP95 > 250 ? "warn" : "pass";
  const visibleTraces = useMemo(() => traces.filter((trace) => {
    if (traceFilter === "slow" && trace.duration < 250) return false;
    if (traceFilter === "errors" && trace.status !== "error") return false;
    const query = traceQuery.trim().toLowerCase();
    return !query || `${trace.id} ${trace.request} ${trace.scenario}`.toLowerCase().includes(query);
  }), [traceFilter, traceQuery]);
  const selectedTrace = useMemo(() => traces.find((trace) => trace.id === selectedTraceId) ?? traces[0], [selectedTraceId]);
  const selectedSpan = useMemo(() => selectedTrace.spans.find((span) => span.id === selectedSpanId) ?? selectedTrace.spans[0], [selectedSpanId, selectedTrace]);
  const traceScale = Math.max(selectedTrace.duration, 1);
  const resilienceScenario = useMemo(() => resilienceScenarios.find((item) => item.id === resilienceScenarioId) ?? resilienceScenarios[0], [resilienceScenarioId]);
  const matchedPatterns = resilienceScenario.required.filter((pattern) => selectedPatterns.includes(pattern)).length;
  const resilienceCoverage = matchedPatterns / resilienceScenario.required.length;
  const extraPatterns = selectedPatterns.filter((pattern) => !resilienceScenario.required.includes(pattern)).length;
  const protectedSuccess = Math.min(99.85, resilienceScenario.success + (99.82 - resilienceScenario.success) * resilienceCoverage - extraPatterns * .12);
  const protectedP95 = Math.max(145, Math.round(resilienceScenario.p95 - (resilienceScenario.p95 - 185) * resilienceCoverage + extraPatterns * 18));
  const protectedSaturation = Math.max(48, Math.round(resilienceScenario.saturation - 38 * resilienceCoverage + extraPatterns * 2));
  const protectedRecovery = Math.max(18, Math.round(resilienceScenario.recovery - (resilienceScenario.recovery - 28) * resilienceCoverage + extraPatterns * 4));
  const resilienceScore = Math.max(0, Math.round(resilienceCoverage * 1000 - extraPatterns * 75));
  const securityScenario = useMemo(() => securityScenarios.find((item) => item.id === securityScenarioId) ?? securityScenarios[0], [securityScenarioId]);
  const matchedDefenses = securityScenario.required.filter((defense) => selectedDefenses.includes(defense)).length;
  const defenseCoverage = matchedDefenses / securityScenario.required.length;
  const extraDefenses = selectedDefenses.filter((defense) => !securityScenario.required.includes(defense)).length;
  const trustScore = Math.max(0, Math.round(defenseCoverage * 1200 - extraDefenses * 65));
  const postBlastRadius = defenseCoverage === 1 ? 0 : Math.max(1, Math.ceil(securityScenario.blastRadius * (1 - defenseCoverage)));
  const blockedRequests = defenseCoverage === 1 ? 100 : Math.round(defenseCoverage * 64);
  const encryptedTraffic = selectedDefenses.includes("strict-mtls") || securityScenario.category === "chaos" ? 100 : 72;
  const campaignMission = campaignMissions[campaignMissionIndex];
  const campaignReady = campaignMission.id === "restore-service" ? incidentStatus === "recovered" && activeIncidentId === "payments-latency"
    : campaignMission.id === "guard-release" ? canaryStatus === "rolled-back" && canaryScenarioId === "bad-deployment"
      : campaignMission.id === "trace-root-cause" ? traceRootConfirmed && selectedTrace.status === "error" && selectedSpan.status === "error"
        : campaignMission.id === "prove-resilience" ? resilienceStatus === "passed" && resilienceScenarioId === "dependency-timeout"
          : securityStatus === "contained" && securityScenarioId === "identity-theft" && postBlastRadius === 0;
  const campaignProgress = Math.round(completedMissionIds.length / campaignMissions.length * 100);
  const campaignRank = campaignScore >= 5800 ? "Principal Commander" : campaignScore >= 5000 ? "Incident Commander" : campaignScore >= 4200 ? "Senior Responder" : "Responder";

  const addEvent = useCallback((tone: EventTone, text: string) => {
    const next: EventItem = { id: eventIdRef.current++, time: formatClock(clockRef.current), tone, text };
    setEvents((current) => [next, ...current].slice(0, 18));
  }, []);

  const advanceHop = useCallback(() => {
    setActiveHop((currentHop) => {
      const nextHop = (currentHop + 1) % requestPath.length;
      const service = requestPath[nextHop];
      setSelectedName(service);
      if (nextHop === 0) {
        setVisited(["api-gateway"]);
        setRequestNumber((current) => current + 1);
        addEvent("request", `Customer ${requestNumber + 1} entered the gateway`);
      } else {
        setVisited((current) => Array.from(new Set([...current, service])));
      }
      if (nextHop === requestPath.length - 1) {
        const baseline = 116 + ((requestNumber * 7 + clockRef.current) % 15);
        const penalty = incidentDegrading && currentIncident ? currentIncident.latencyPenalty : 0;
        const sample = baseline + penalty;
        setLatencySeries((current) => [...current.slice(-23), sample]);
        if (!incidentDegrading || globalSuccess > 90) setCompleted((current) => current + 1);
        if (!incidentDegrading) setScore((current) => Math.min(9999, current + 3));
        addEvent(globalSuccess >= 95 ? "success" : "incident", globalSuccess >= 95
          ? `Order MO-${requestNumber} completed in ${sample + 48} ms`
          : `Order MO-${requestNumber} degraded; checkout success ${globalSuccess.toFixed(1)}%`);
      }
      return nextHop;
    });
  }, [addEvent, currentIncident, globalSuccess, incidentDegrading, requestNumber]);

  useEffect(() => {
    if (!live) return;
    const interval = window.setInterval(() => {
      const increment = speed * 2;
      clockRef.current += increment;
      setSimSeconds(clockRef.current);
      if (incidentDegrading) setIncidentElapsed((current) => current + increment);
      advanceHop();
    }, Math.max(280, 820 / speed));
    return () => window.clearInterval(interval);
  }, [advanceHop, incidentDegrading, live, speed]);

  const sendSingleRequest = () => { if (!live) advanceHop(); };

  const injectIncident = () => {
    const incident = configuredIncident;
    setActiveIncidentId(incident.id);
    setIncidentStatus("active");
    setIncidentElapsed(0);
    setDiagnosis("");
    setWrongCalls(0);
    setLastAward(0);
    setPolicy({ retries: 0, timeoutMs: 0, canaryPercent: 0 });
    setPolicyApplied(false);
    setSelectedName(incident.target);
    setLive(true);
    setLatencySeries((current) => [...current.slice(-19), 122 + Math.round(incident.latencyPenalty * .55)]);
    setScore((current) => Math.max(0, current - 75));
    addEvent("incident", `${incident.severity} declared: ${incident.label}`);
    addEvent("mesh", `Fault profile ${incident.id} injected against ${incident.target}`);
  };

  const confirmDiagnosis = () => {
    if (!currentIncident || !diagnosis || incidentStatus !== "active") return;
    if (diagnosis === currentIncident.answer) {
      setIncidentStatus("diagnosed");
      addEvent("incident", `Root cause confirmed: ${currentIncident.answer}`);
      return;
    }
    setWrongCalls((current) => current + 1);
    setScore((current) => Math.max(0, current - 300));
    addEvent("incident", `Incorrect diagnosis rejected; operational score -300`);
  };

  const recoverIncident = () => {
    if (!currentIncident || incidentStatus !== "diagnosed" || !policyApplied) return;
    const timePenalty = Math.min(900, incidentElapsed * 4);
    const baseAward = 1400 * difficulty.multiplier;
    const award = Math.max(250, Math.round(baseAward - timePenalty - wrongCalls * 200));
    setLastAward(award);
    setScore((current) => Math.min(9999, current + award));
    setIncidentStatus("recovered");
    setLive(false);
    setLatencySeries((current) => [...current.slice(-16), 312, 238, 171, 126]);
    addEvent("success", `Recovery complete after verified traffic policy (+${award} points)`);
    addEvent("mesh", `Istio fault profile cleared; ${currentIncident.target} returned to baseline`);
  };

  const applyTrafficPolicy = () => {
    if (!currentIncident || incidentStatus !== "diagnosed") return;
    if (policy.retries === 0 && policy.timeoutMs === 0 && policy.canaryPercent === 0) {
      setScore((current) => Math.max(0, current - 150));
      addEvent("incident", "Empty traffic policy rejected; operational score -150");
      return;
    }
    setPolicyApplied(true);
    setLatencySeries((current) => [...current.slice(-16), 488, 352, 276, policy.timeoutMs || 238]);
    addEvent("mesh", `Traffic policy applied: ${policy.retries} retries, ${policy.timeoutMs || "off"} ms timeout, ${policy.canaryPercent}% canary`);
  };

  const startCanary = () => {
    setCanaryStageIndex(0); setCanaryStatus("running"); setAnalysisRuns(1); setSelectedName(canaryScenario.service);
    addEvent("system", `Canary ${canaryScenario.id} started at 5% on ${canaryScenario.service}`);
    addEvent("mesh", `Automated analysis: 5% stage ${canaryScenario.impactStart === 5 ? "requires attention" : "passes guardrails"}`);
  };

  const promoteCanary = () => {
    if (canaryStatus !== "running" && canaryStatus !== "held") return;
    if (analysisVerdict === "fail") { addEvent("incident", "Promotion blocked by failed canary guardrails"); return; }
    if (canaryStageIndex === canaryStages.length - 1) { setCanaryStatus("promoted"); addEvent("success", `${canaryScenario.service} canary promoted to stable`); return; }
    const next = canaryStageIndex + 1;
    setCanaryStageIndex(next); setCanaryStatus("running"); setAnalysisRuns((current) => current + 1);
    addEvent("system", `Canary promoted to ${canaryStages[next]}% traffic`);
  };

  const holdCanary = () => { if (canaryStatus === "running") { setCanaryStatus("held"); addEvent("system", `Canary held at ${canaryWeight}% for investigation`); } };
  const rollbackCanary = () => { if (canaryStatus !== "idle") { setCanaryStatus("rolled-back"); addEvent("success", `Canary rolled back; 100% traffic restored to stable`); } };
  const resetCanary = () => { setCanaryStatus("idle"); setCanaryStageIndex(0); setAnalysisRuns(0); };

  const selectTrace = (trace: TraceRecord) => { setSelectedTraceId(trace.id); setSelectedSpanId(trace.spans[0].id); setTraceRootConfirmed(false); };
  const captureCurrentTrace = () => {
    const trace = incidentDegrading ? traces[activeIncidentId === "inventory-errors" ? 2 : 1] : canaryStatus === "running" || canaryStatus === "held" ? traces[5] : traces[0];
    selectTrace(trace); setTraceQuery(""); setTraceFilter("all");
    addEvent("mesh", `Trace ${trace.id} correlated with ${incidentDegrading ? "active incident" : canaryStatus === "running" || canaryStatus === "held" ? "canary rollout" : "live checkout"}`);
  };
  const confirmTraceRoot = () => {
    if (selectedTrace.status !== "error" || selectedSpan.status !== "error") {
      addEvent("incident", "Trace review rejected: select the first failing span");
      return;
    }
    setTraceRootConfirmed(true);
    addEvent("mesh", `Root span confirmed: ${selectedSpan.service} · ${selectedSpan.operation}`);
  };

  const injectResilienceFault = () => {
    setResilienceStatus("fault"); setSelectedPatterns([]); setSelectedName(resilienceScenario.target);
    addEvent("incident", `Resilience experiment injected: ${resilienceScenario.label}`);
  };
  const togglePattern = (pattern: ResiliencePatternId) => setSelectedPatterns((current) => current.includes(pattern) ? current.filter((item) => item !== pattern) : [...current, pattern]);
  const runResilienceTest = () => {
    if ((resilienceStatus !== "fault" && resilienceStatus !== "failed") || !selectedPatterns.length) return;
    setResilienceStatus("testing"); setExperimentRuns((current) => current + 1);
    window.setTimeout(() => {
      const passed = resilienceCoverage === 1;
      setResilienceStatus(passed ? "passed" : "failed");
      setScore((current) => Math.min(9999, Math.max(0, current + (passed ? resilienceScore : -200))));
      addEvent(passed ? "success" : "incident", passed ? `Resilience test passed (+${resilienceScore} points)` : "Resilience test failed: customer-impact guardrails still breached");
    }, 650);
  };
  const resetResilience = () => { setResilienceStatus("idle"); setSelectedPatterns([]); };
  const armSecurityScenario = () => {
    setSecurityStatus("armed"); setSelectedDefenses([]); setSelectedName(securityScenario.target);
    addEvent(securityScenario.category === "chaos" ? "incident" : "system", `${securityScenario.category === "chaos" ? "Chaos drill" : "Trust probe"} armed: ${securityScenario.label}`);
  };
  const toggleDefense = (defense: DefenseId) => setSelectedDefenses((current) => current.includes(defense) ? current.filter((item) => item !== defense) : [...current, defense]);
  const runSecurityProbe = () => {
    if ((securityStatus !== "armed" && securityStatus !== "breached") || !selectedDefenses.length) return;
    setSecurityStatus("probing"); setSecurityRuns((current) => current + 1);
    window.setTimeout(() => {
      const contained = defenseCoverage === 1;
      setSecurityStatus(contained ? "contained" : "breached");
      setScore((current) => Math.min(9999, Math.max(0, current + (contained ? trustScore : -250))));
      addEvent(contained ? "success" : "incident", contained ? `Probe contained at the policy boundary (+${trustScore} points)` : `Probe breached ${postBlastRadius} service boundaries`);
    }, 650);
  };
  const resetSecurity = () => { setSecurityStatus("idle"); setSelectedDefenses([]); };

  const focusCampaignMission = (index: number) => {
    const mission = campaignMissions[index];
    if (mission.id === "restore-service") {
      setSelectedIncidentId("payments-latency"); setDifficultyId("commander"); closeIncident();
    } else if (mission.id === "guard-release") {
      setCanaryScenarioId("bad-deployment"); resetCanary();
    } else if (mission.id === "trace-root-cause") {
      setTraceFilter("errors"); setTraceQuery(""); setTraceRootConfirmed(false);
    } else if (mission.id === "prove-resilience") {
      setResilienceScenarioId("dependency-timeout"); resetResilience();
    } else {
      setSecurityScenarioId("identity-theft"); resetSecurity();
    }
    window.setTimeout(() => document.getElementById(mission.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const startCampaign = () => {
    setCampaignStatus("active"); setCampaignMissionIndex(0); setCompletedMissionIds([]); setCampaignScore(0);
    focusCampaignMission(0);
    addEvent("system", "Incident Commander campaign started: Operation REDLINE");
  };

  const completeCampaignMission = () => {
    if (campaignStatus !== "active" || !campaignReady || completedMissionIds.includes(campaignMission.id)) return;
    const earned = campaignMission.id === "restore-service" ? Math.max(500, campaignMission.reward - wrongCalls * 200 - Math.min(600, incidentElapsed * 3))
      : campaignMission.id === "prove-resilience" ? Math.min(campaignMission.reward, resilienceScore + 300)
        : campaignMission.id === "contain-breach" ? Math.min(campaignMission.reward, trustScore + 300)
          : campaignMission.reward;
    const nextScore = campaignScore + earned;
    setCampaignScore(nextScore);
    setScore((current) => Math.min(9999, current + earned));
    setCompletedMissionIds((current) => [...current, campaignMission.id]);
    addEvent("success", `${campaignMission.callSign} complete (+${earned} campaign points)`);
    if (campaignMissionIndex === campaignMissions.length - 1) {
      setCampaignStatus("complete");
      addEvent("system", `Full Incident Commander campaign certified: ${nextScore} points`);
      window.setTimeout(() => document.getElementById("campaign-command")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }
    const nextIndex = campaignMissionIndex + 1;
    setCampaignMissionIndex(nextIndex);
    focusCampaignMission(nextIndex);
  };

  const resetCampaign = () => {
    setCampaignStatus("briefing"); setCampaignMissionIndex(0); setCompletedMissionIds([]); setCampaignScore(0); setTraceRootConfirmed(false);
  };

  const exportAfterActionReport = () => {
    const report = [
      "# MeshOps Incident Commander — After-Action Report", "", "Release: v1.0.1", `Rank: ${campaignRank}`, `Campaign score: ${campaignScore} / 6400`, "",
      "## Mission record", ...campaignMissions.map((mission, index) => `${index + 1}. ${mission.callSign} — ${completedMissionIds.includes(mission.id) ? "COMPLETE" : "INCOMPLETE"}`), "",
      "## Operational summary", `- Checkout incidents recovered: ${incidentStatus === "recovered" ? 1 : 0}`, `- Canary outcome: ${canaryStatus}`, `- Confirmed error span: ${traceRootConfirmed ? `${selectedSpan.service} / ${selectedSpan.operation}` : "none"}`, `- Resilience score: ${resilienceStatus === "passed" ? resilienceScore : 0}`, `- Trust score: ${securityStatus === "contained" ? trustScore : 0}`, "",
      "Generated by the deterministic MeshOps v1.0.1 browser simulation.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([report], { type: "text/markdown" }));
    const link = document.createElement("a"); link.href = url; link.download = "meshops-v1-after-action-report.md"; link.click(); URL.revokeObjectURL(url);
  };

  const closeIncident = () => {
    setActiveIncidentId(null);
    setIncidentStatus("idle");
    setIncidentElapsed(0);
    setDiagnosis("");
    setWrongCalls(0);
    setLastAward(0);
  };

  const resetConsole = () => {
    setLive(false); setActiveHop(-1); setVisited([]); setSelectedName("payments"); setSimSeconds(0);
    clockRef.current = 0; setRequestNumber(7281); setCompleted(2487); setScore(9280); setEvents(seedEvents);
    setLatencySeries(seedLatency); setActiveIncidentId(null); setIncidentStatus("idle"); setIncidentElapsed(0);
    setDiagnosis(""); setWrongCalls(0); setLastAward(0);
    setPolicy({ retries: 0, timeoutMs: 0, canaryPercent: 0 }); setPolicyApplied(false);
    setCanaryStatus("idle"); setCanaryStageIndex(0); setAnalysisRuns(0);
    setTraceFilter("all"); setTraceQuery(""); setSelectedTraceId(traces[1].id); setSelectedSpanId(traces[1].spans.at(-1)?.id ?? "");
    setResilienceStatus("idle"); setSelectedPatterns([]); setExperimentRuns(0);
    setSecurityStatus("idle"); setSelectedDefenses([]); setSecurityRuns(0);
    setTraceRootConfirmed(false);
  };

  const healthLabel = incidentDegrading ? "degraded" : "healthy";
  const latencyDelta = 250 - p95;

  return (
    <main className="meshops-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><GitBranch size={22} /></div>
          <div><div className="brand-name">MeshOps</div><div className="brand-kicker">Incident Commander</div></div>
        </div>
        <div className={`environment-pill ${incidentDegrading ? "is-degraded" : ""}`}><span className={`health-dot ${incidentDegrading ? "health-dot--degraded" : ""}`} /><span>demo-production</span><ChevronRight size={14} /><strong>{healthLabel}</strong></div>
        <div className="topbar-meta">
          <span className="telemetry-source"><Activity size={14} /> Istio 1.31 · Demo telemetry</span>
          <span className="version-tag">v1.0.1</span>
          <span className="clock"><Clock3 size={15} /> {formatClock(simSeconds)} UTC</span>
          <Button className="entry-return" variant="outline" onClick={onExit}><Home /> Start screen</Button>
        </div>
      </header>

      <section id="campaign-command" className={`panel campaign-panel campaign-${campaignStatus}`} aria-label="Full Incident Commander campaign">
        <div className="campaign-heading">
          <div><span className="eyebrow">v1.0 Full Incident Commander</span><h1><Trophy size={21} /> Campaign command</h1><p>One connected shift across incident response, delivery, observability, resilience, and zero trust.</p></div>
          <div className="campaign-score"><span>Campaign score</span><strong>{campaignScore.toLocaleString()}</strong><small>{campaignStatus === "complete" ? campaignRank : `${completedMissionIds.length}/${campaignMissions.length} missions`}</small></div>
        </div>

        {campaignStatus === "briefing" && <div className="campaign-briefing">
          <div className="campaign-intro"><Flag size={25} /><div><span className="eyebrow">Shift briefing</span><strong>Protect checkout through five escalating operations</strong><p>Each operation activates an existing MeshOps command surface. Decisions carry forward into a scored after-action record.</p></div></div>
          <div className="campaign-mission-grid">{campaignMissions.map((mission, index) => <article key={mission.id}><span>0{index + 1} · {mission.discipline}</span><strong>{mission.callSign}</strong><p>{mission.title}</p><small>up to {mission.reward.toLocaleString()} pts</small></article>)}</div>
          <div className="campaign-launch"><div><strong>Commander rules</strong><span>No guided clues in the opening incident. Least-privilege and smallest-effective-set scoring remain active.</span></div><Button className="run-button" onClick={startCampaign}><Flag /> Begin campaign</Button></div>
        </div>}

        {campaignStatus === "active" && <div className="campaign-active">
          <div className="campaign-progress"><div><span>Shift progress</span><strong>{completedMissionIds.length}/{campaignMissions.length}</strong></div><Progress value={campaignProgress} aria-label={`Campaign progress ${campaignProgress} percent`} /></div>
          <div className="campaign-operation">
            <div className="operation-index"><span>OP</span><strong>0{campaignMissionIndex + 1}</strong></div>
            <div className="operation-brief"><span className="eyebrow">{campaignMission.callSign} · {campaignMission.discipline}</span><h2>{campaignMission.title}</h2><p>{campaignMission.brief}</p><div><ClipboardCheck size={16} /><span>{campaignMission.objective}</span></div></div>
            <div className="operation-actions"><span className={campaignReady ? "mission-ready is-ready" : "mission-ready"}><i /> {campaignReady ? "Objective verified" : "Objective pending"}</span><Button variant="outline" className="secondary-button" onClick={() => focusCampaignMission(campaignMissionIndex)}>Open workspace</Button><Button className="recover-button" onClick={completeCampaignMission} disabled={!campaignReady}><Award /> Complete & advance</Button></div>
          </div>
          <div className="campaign-track">{campaignMissions.map((mission, index) => <div key={mission.id} className={`${completedMissionIds.includes(mission.id) ? "is-complete" : ""} ${index === campaignMissionIndex ? "is-current" : ""}`}><i>{completedMissionIds.includes(mission.id) ? "✓" : index + 1}</i><span>{mission.callSign}</span></div>)}</div>
        </div>}

        {campaignStatus === "complete" && <div className="campaign-complete">
          <div className="campaign-cert"><Trophy size={34} /><div><span className="eyebrow">Shift certified</span><h2>{campaignRank}</h2><p>All five command disciplines completed. The campaign record is ready for review or export.</p></div></div>
          <dl><div><dt>Campaign score</dt><dd>{campaignScore.toLocaleString()} / 6,400</dd></div><div><dt>Incident wrong calls</dt><dd>{wrongCalls}</dd></div><div><dt>Resilience score</dt><dd>{resilienceScore}</dd></div><div><dt>Trust score</dt><dd>{trustScore}</dd></div></dl>
          <div className="campaign-complete-actions"><Button variant="outline" className="secondary-button" onClick={resetCampaign}><RotateCcw /> New campaign</Button><Button className="run-button" onClick={exportAfterActionReport}><Download /> Export after-action report</Button></div>
        </div>}
      </section>

      <section className="command-strip" aria-label="Simulation controls">
        <div className="stream-state">
          <span className={`stream-indicator ${live ? "is-live" : ""}`}><i /> {live ? "Stream running" : "Stream paused"}</span>
          <p>Operate the mesh while deterministic production traffic moves across the checkout path.</p>
        </div>
        <div className="speed-control" aria-label="Simulation speed">
          <span>Speed</span>{[1, 2, 4].map((value) => <button key={value} type="button" className={speed === value ? "is-selected" : ""} onClick={() => setSpeed(value)}>{value}×</button>)}
        </div>
        <div className="command-actions">
          <Button className="secondary-button" variant="outline" onClick={resetConsole}><RotateCcw /> Reset</Button>
          <Button className="secondary-button" variant="outline" onClick={sendSingleRequest} disabled={live}><Zap /> Step request</Button>
          <Button className="run-button" onClick={() => setLive((current) => !current)}>{live ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}{live ? "Pause stream" : "Start live traffic"}</Button>
        </div>
      </section>

      <section id="incident-engine" className={`panel incident-panel ${incidentDegrading ? "has-incident" : ""}`} aria-label="Incident engine">
        <div className="incident-heading">
          <div className="incident-heading__title"><AlertTriangle size={19} /><div><span className="eyebrow">v0.5 Traffic Engineering</span><h2>{incidentStatus === "idle" ? "Fault injection lab" : currentIncident?.label}</h2></div></div>
          {currentIncident && incidentStatus !== "idle" && <span className={`severity-chip ${currentIncident.severity === "SEV-1" ? "is-sev1" : ""}`}>{currentIncident.severity}</span>}
        </div>

        {incidentStatus === "idle" ? (
          <div className="incident-config">
            <div className="incident-config__block">
              <span className="config-label">Failure scenario</span>
              <div className="scenario-grid">
                {incidents.map((incident) => <button key={incident.id} type="button" className={selectedIncidentId === incident.id ? "is-selected" : ""} onClick={() => setSelectedIncidentId(incident.id)}>
                  <span>{incident.severity}</span><strong>{incident.label}</strong><small>{incident.target}</small>
                </button>)}
              </div>
            </div>
            <div className="incident-config__block">
              <span className="config-label">Difficulty</span>
              <div className="difficulty-grid">
                {difficulties.map((level) => <button key={level.id} type="button" className={difficultyId === level.id ? "is-selected" : ""} onClick={() => setDifficultyId(level.id)}><strong>{level.label}</strong><small>{level.description}</small><span>{level.multiplier.toFixed(2)}× score</span></button>)}
              </div>
            </div>
            <div className="incident-launch">
              <div><strong>{configuredIncident.summary}</strong><span>Runtime twin: <code>{configuredIncident.manifest}</code></span></div>
              <Button className="inject-button" onClick={injectIncident}><AlertTriangle /> Inject controlled failure</Button>
            </div>
          </div>
        ) : (
          <div className="incident-active">
            <div className="incident-brief">
              <div><span className="eyebrow">Observed symptom</span><p>{currentIncident?.symptom}</p></div>
              <dl>
                <div><dt>Elapsed</dt><dd>{incidentElapsed}s</dd></div>
                <div><dt>Wrong calls</dt><dd>{wrongCalls}</dd></div>
                <div><dt>Difficulty</dt><dd>{difficulty.label}</dd></div>
                <div><dt>Manifest</dt><dd>{currentIncident?.id}</dd></div>
              </dl>
            </div>

            {incidentStatus === "active" && currentIncident && <div className="investigation-grid">
              <div className="signal-card"><span className="config-label"><Target size={14} /> Investigation signals</span>
                {difficulty.clueCount > 0 ? <ul>{currentIncident.clues.slice(0, difficulty.clueCount).map((clue) => <li key={clue}>{clue}</li>)}</ul> : <p className="no-clues">Commander mode: use telemetry, topology, and service inspection only.</p>}
              </div>
              <div className="diagnosis-card"><span className="config-label"><Wrench size={14} /> Root-cause decision</span>
                <div className="diagnosis-options">{currentIncident.choices.map((choice) => <button type="button" key={choice} className={diagnosis === choice ? "is-selected" : ""} onClick={() => setDiagnosis(choice)}>{choice}</button>)}</div>
                <Button className="diagnose-button" onClick={confirmDiagnosis} disabled={!diagnosis}>Confirm diagnosis</Button>
              </div>
            </div>}

            {incidentStatus === "diagnosed" && currentIncident && <div className="traffic-engineering">
              <div className="traffic-heading"><Route size={22} /><div><span className="eyebrow">Root cause confirmed</span><strong>Design a safe traffic policy</strong><p>Mitigate the customer impact, observe the new telemetry, then remove the fault.</p></div></div>
              <div className="traffic-controls">
                <label><span><RefreshCw size={14} /> Retry budget</span><select value={policy.retries} onChange={(event) => { setPolicy((current) => ({ ...current, retries: Number(event.target.value) })); setPolicyApplied(false); }}><option value="0">Off</option><option value="1">1 retry</option><option value="2">2 retries</option><option value="3">3 retries</option></select></label>
                <label><span><TimerReset size={14} /> Request timeout</span><select value={policy.timeoutMs} onChange={(event) => { setPolicy((current) => ({ ...current, timeoutMs: Number(event.target.value) })); setPolicyApplied(false); }}><option value="0">Off</option><option value="500">500 ms</option><option value="750">750 ms</option><option value="1500">1500 ms</option></select></label>
                <label><span><Split size={14} /> Canary traffic</span><select value={policy.canaryPercent} onChange={(event) => { setPolicy((current) => ({ ...current, canaryPercent: Number(event.target.value) })); setPolicyApplied(false); }}><option value="0">Stable only</option><option value="10">10% canary</option><option value="25">25% canary</option><option value="50">50% canary</option></select></label>
              </div>
              <div className="policy-actions"><Button className="diagnose-button" onClick={applyTrafficPolicy}><Route /> Apply & observe</Button><span className={policyApplied ? "policy-status is-applied" : "policy-status"}>{policyApplied ? `Verified: ${globalSuccess.toFixed(2)}% success · ${p95} ms P95` : "Policy not yet applied"}</span><Button className="recover-button" onClick={recoverIncident} disabled={!policyApplied}><Wrench /> Remove fault & recover</Button></div>
            </div>}
            {incidentStatus === "recovered" && <div className="recovery-card is-recovered"><ShieldCheck size={24} /><div><span className="eyebrow">Incident resolved</span><strong>Production telemetry returned to baseline</strong><p>Recovery award: +{lastAward.toLocaleString()} points. Wrong calls: {wrongCalls}.</p></div><Button className="secondary-button" variant="outline" onClick={closeIncident}>Run another incident</Button></div>}
          </div>
        )}
      </section>

      <section id="canary-commander" className={`panel canary-panel canary-${canaryStatus}`} aria-label="Canary Commander">
        <div className="canary-heading">
          <div><span className="eyebrow">v0.6 Progressive Delivery</span><h2><Rocket size={19} /> Canary Commander</h2><p>Advance a release through guarded stages. Hold, roll back, or promote based on automated analysis.</p></div>
          <span className={`canary-status status-${canaryStatus}`}>{canaryStatus.replace("-", " ")}</span>
        </div>
        <div className="rollout-track" aria-label={`Canary rollout at ${canaryWeight} percent`}>
          {canaryStages.map((stage, index) => <div key={stage} className={`rollout-stage ${index < canaryStageIndex || canaryStatus === "promoted" ? "is-complete" : ""} ${index === canaryStageIndex && canaryStatus !== "idle" && canaryStatus !== "rolled-back" ? "is-current" : ""}`}><i /><strong>{stage}%</strong><span>{stage === 100 ? "full" : "stage"}</span></div>)}
        </div>
        {canaryStatus === "idle" || canaryStatus === "rolled-back" || canaryStatus === "promoted" ? <div className="canary-config">
          <label><span>Release scenario</span><select value={canaryScenarioId} onChange={(event) => setCanaryScenarioId(event.target.value as CanaryScenarioId)}>{canaryScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label} · {scenario.service}</option>)}</select></label>
          <div><span className="config-label">Hidden production signal</span><strong>{canaryScenario.signal}</strong><small>Guardrail sensitivity changes as traffic exposure increases.</small></div>
          <Button className="run-button" onClick={canaryStatus === "idle" ? startCanary : resetCanary}>{canaryStatus === "idle" ? <><Rocket /> Start 5% canary</> : <><RotateCcw /> Configure next release</>}</Button>
        </div> : <div className="canary-live">
          <div className="canary-metrics">
            <article><span>Success</span><strong>{canarySuccess.toFixed(2)}%</strong><small>stable 99.98%</small></article>
            <article><span>P50</span><strong>{canaryP50} ms</strong><small>stable 62 ms</small></article>
            <article className={canaryP95 > 250 ? "is-alert" : ""}><span>P95</span><strong>{canaryP95} ms</strong><small>guardrail 250 ms</small></article>
            <article className={canaryP99 > 520 ? "is-alert" : ""}><span>P99</span><strong>{canaryP99} ms</strong><small>guardrail 520 ms</small></article>
          </div>
          <div className={`analysis-card verdict-${analysisVerdict}`}><SearchCheck size={20} /><div><span>Automated analysis #{analysisRuns}</span><strong>{analysisVerdict === "pass" ? "Guardrails passing" : analysisVerdict === "warn" ? "Degradation detected" : "Promotion blocked"}</strong><small>{canaryWeight}% canary versus stable baseline · {canaryScenario.signal}</small></div></div>
          <div className="canary-actions"><Button variant="outline" className="secondary-button" onClick={holdCanary} disabled={canaryStatus === "held"}><Hand /> Hold</Button><Button variant="outline" className="rollback-button" onClick={rollbackCanary}><Undo2 /> Roll back</Button><Button className="recover-button" onClick={promoteCanary} disabled={analysisVerdict === "fail"}><Rocket /> {canaryStageIndex === canaryStages.length - 1 ? "Promote to stable" : `Promote to ${canaryStages[canaryStageIndex + 1]}%`}</Button></div>
        </div>}
      </section>

      <section id="trace-explorer" className="panel tracing-panel" aria-label="OpenTelemetry trace explorer">
        <div className="tracing-heading">
          <div><span className="eyebrow">v0.7 OpenTelemetry</span><h2><Waypoints size={19} /> Distributed Trace Explorer</h2><p>Follow one checkout across service boundaries and isolate the span responsible for latency or failure.</p></div>
          <Button className="secondary-button" variant="outline" onClick={captureCurrentTrace}><Link2 /> Capture current trace</Button>
        </div>
        <div className="trace-toolbar">
          <label className="trace-search"><Search size={15} /><input value={traceQuery} onChange={(event) => setTraceQuery(event.target.value)} placeholder="Trace ID, request, or scenario" aria-label="Search traces" /></label>
          <div className="trace-filters" role="group" aria-label="Filter traces"><ListFilter size={15} />{(["all", "slow", "errors"] as TraceFilter[]).map((filter) => <button type="button" key={filter} className={traceFilter === filter ? "is-selected" : ""} onClick={() => setTraceFilter(filter)}>{filter}</button>)}</div>
          <span className="trace-count">{visibleTraces.length} traces · OTLP demo stream</span>
        </div>
        <div className="trace-workspace">
          <div className="trace-list" aria-label="Trace results">
            {visibleTraces.map((trace) => <button type="button" key={trace.id} className={`trace-row ${selectedTrace.id === trace.id ? "is-selected" : ""} ${trace.status === "error" ? "has-error" : ""}`} onClick={() => selectTrace(trace)}><span className={`trace-state state-${trace.status}`} /><div><strong>{trace.scenario}</strong><code>{trace.id}</code></div><span>{trace.request}</span><b>{trace.duration} ms</b></button>)}
            {!visibleTraces.length && <p className="trace-empty">No traces match this filter.</p>}
          </div>
          <div className="waterfall-panel">
            <div className="waterfall-summary"><div><span className="eyebrow">Selected trace</span><strong>{selectedTrace.scenario}</strong><code>{selectedTrace.id}</code></div><dl><div><dt>Started</dt><dd>{selectedTrace.started}</dd></div><div><dt>Duration</dt><dd>{selectedTrace.duration} ms</dd></div><div><dt>Spans</dt><dd>{selectedTrace.spans.length}</dd></div><div><dt>Status</dt><dd className={selectedTrace.status === "error" ? "is-error" : ""}>{selectedTrace.status}</dd></div></dl></div>
            <div className="waterfall-scale"><span>0 ms</span><span>{Math.round(traceScale / 2)} ms</span><span>{traceScale} ms</span></div>
            <div className="waterfall">
              {selectedTrace.spans.map((span) => <button type="button" key={span.id} className={`span-row ${span.id === selectedSpan.id ? "is-selected" : ""}`} onClick={() => setSelectedSpanId(span.id)}><span className="span-label"><b>{span.service}</b><small>{span.operation}</small></span><span className="span-lane"><i className={span.status === "error" ? "is-error" : ""} style={{ left: `${span.start / traceScale * 100}%`, width: `${Math.max(3, span.duration / traceScale * 100)}%` }}><em>{span.duration} ms</em></i></span></button>)}
            </div>
          </div>
          <aside className={`span-inspector ${selectedSpan.status === "error" ? "has-error" : ""}`}>
            <div><span className="eyebrow">Span details</span><h3>{selectedSpan.service}</h3><code>{selectedSpan.id} · parent {selectedSpan.parent ?? "root"}</code></div>
            <dl><div><dt>Operation</dt><dd>{selectedSpan.operation}</dd></div><div><dt>Duration</dt><dd>{selectedSpan.duration} ms</dd></div><div><dt>HTTP status</dt><dd>{selectedSpan.code}</dd></div><div><dt>Span status</dt><dd>{selectedSpan.status}</dd></div></dl>
            <div className="span-section"><span><Braces size={14} /> Attributes</span>{selectedSpan.tags.length ? selectedSpan.tags.map((tag) => <code key={tag}>{tag}</code>) : <small>No custom attributes</small>}</div>
            <div className="span-section"><span><Activity size={14} /> Events</span>{selectedSpan.events.length ? selectedSpan.events.map((event) => <code key={event}>{event}</code>) : <small>No span events</small>}</div>
            <Button className="trace-confirm" onClick={confirmTraceRoot} disabled={traceRootConfirmed}>{traceRootConfirmed ? <><CheckCircle2 /> Root span confirmed</> : <><ClipboardCheck /> Confirm root span</>}</Button>
          </aside>
        </div>
      </section>

      <section id="resilience-game-day" className={`panel resilience-panel resilience-${resilienceStatus}`} aria-label="Resilience Engineering Lab">
        <div className="resilience-heading">
          <div><span className="eyebrow">v0.8 Resilience Engineering</span><h2><FlaskConical size={19} /> Resilience Game Day</h2><p>Inject a controlled failure, assemble service-mesh protections, and prove them against customer-impact guardrails.</p></div>
          <span className={`experiment-status status-${resilienceStatus}`}>{resilienceStatus}</span>
        </div>
        {resilienceStatus === "idle" ? <div className="resilience-config">
          <label><span>Failure experiment</span><select value={resilienceScenarioId} onChange={(event) => setResilienceScenarioId(event.target.value as ResilienceScenarioId)}>{resilienceScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label} · {scenario.target}</option>)}</select></label>
          <div><span className="config-label">Expected symptom</span><strong>{resilienceScenario.symptom}</strong><small>Baseline first; protections are selected after injection.</small></div>
          <Button className="inject-button" onClick={injectResilienceFault}><ShieldAlert /> Inject controlled failure</Button>
        </div> : <div className="resilience-workspace">
          <div className="failure-brief"><ShieldAlert size={21} /><div><span className="eyebrow">Active experiment · {resilienceScenario.target}</span><strong>{resilienceScenario.label}</strong><p>{resilienceScenario.symptom}</p></div></div>
          <div className="resilience-comparison">
            <article><span>Checkout success</span><strong>{resilienceScenario.success.toFixed(1)}%</strong><i>fault</i>{resilienceStatus === "passed" || resilienceStatus === "failed" ? <><b>→</b><strong className={protectedSuccess >= 99.5 ? "is-good" : "is-bad"}>{protectedSuccess.toFixed(2)}%</strong></> : null}</article>
            <article><span>P95 latency</span><strong>{resilienceScenario.p95} ms</strong><i>fault</i>{resilienceStatus === "passed" || resilienceStatus === "failed" ? <><b>→</b><strong className={protectedP95 <= 250 ? "is-good" : "is-bad"}>{protectedP95} ms</strong></> : null}</article>
            <article><span>Saturation</span><strong>{resilienceScenario.saturation}%</strong><i>fault</i>{resilienceStatus === "passed" || resilienceStatus === "failed" ? <><b>→</b><strong className={protectedSaturation <= 70 ? "is-good" : "is-bad"}>{protectedSaturation}%</strong></> : null}</article>
            <article><span>Recovery time</span><strong>{resilienceScenario.recovery}s</strong><i>fault</i>{resilienceStatus === "passed" || resilienceStatus === "failed" ? <><b>→</b><strong className={protectedRecovery <= 60 ? "is-good" : "is-bad"}>{protectedRecovery}s</strong></> : null}</article>
          </div>
          <div className="pattern-lab"><div className="pattern-heading"><div><span className="config-label"><Layers3 size={14} /> Protection design</span><strong>Select the smallest effective set</strong></div><span>{selectedPatterns.length} selected</span></div><div className="pattern-grid">{resiliencePatterns.map((pattern) => <button type="button" key={pattern.id} className={selectedPatterns.includes(pattern.id) ? "is-selected" : ""} onClick={() => togglePattern(pattern.id)} disabled={resilienceStatus === "testing" || resilienceStatus === "passed"}><span>{selectedPatterns.includes(pattern.id) ? "Enabled" : "Available"}</span><strong>{pattern.label}</strong><small>{pattern.summary}</small><em>{pattern.tradeoff}</em></button>)}</div></div>
          {resilienceStatus === "testing" && <div className="test-progress"><RefreshCw className="is-spinning" /><div><strong>Running 500-request load test</strong><span>Comparing success, tail latency, saturation, and recovery guardrails…</span></div></div>}
          {(resilienceStatus === "passed" || resilienceStatus === "failed") && <div className={`resilience-result result-${resilienceStatus}`}><ShieldCheck size={23} /><div><span className="eyebrow">Experiment #{experimentRuns}</span><strong>{resilienceStatus === "passed" ? "Resilience guardrails passed" : "Protection design incomplete"}</strong><p>{resilienceStatus === "passed" ? `All required failure modes are contained. Resilience score: ${resilienceScore}.` : `${matchedPatterns}/${resilienceScenario.required.length} required protections matched. Review the remaining customer impact.`}</p></div></div>}
          <div className="resilience-actions"><Button variant="outline" className="secondary-button" onClick={resetResilience}><RotateCcw /> End experiment</Button><span>{resilienceStatus === "fault" ? "Choose protections, then validate under load." : resilienceStatus === "failed" ? "Adjust the protection design and retest." : ""}</span><Button className="recover-button" onClick={runResilienceTest} disabled={!selectedPatterns.length || resilienceStatus === "testing" || resilienceStatus === "passed"}><FlaskConical /> {resilienceStatus === "failed" ? "Retest design" : "Run resilience test"}</Button></div>
        </div>}
      </section>

      <section id="trust-boundary" className={`panel security-panel security-${securityStatus}`} aria-label="Zero Trust and Chaos Lab">
        <div className="security-heading">
          <div><span className="eyebrow">v0.9 Zero Trust + Chaos</span><h2><Fingerprint size={19} /> Trust Boundary Commander</h2><p>Defend the service graph against identity attacks and bounded chaos without granting unnecessary privilege.</p></div>
          <span className={`security-status status-${securityStatus}`}>{securityStatus}</span>
        </div>
        {securityStatus === "idle" ? <div className="security-config">
          <label><span>Trust or chaos scenario</span><select value={securityScenarioId} onChange={(event) => setSecurityScenarioId(event.target.value as SecurityScenarioId)}>{securityScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.category === "chaos" ? "CHAOS" : "ZERO TRUST"} · {scenario.label}</option>)}</select></label>
          <div><span className="config-label">Adversary action</span><strong>{securityScenario.attempt}</strong><small>Potential blast radius: {securityScenario.blastRadius} services.</small></div>
          <Button className="inject-button" onClick={armSecurityScenario}><KeyRound /> Arm controlled probe</Button>
        </div> : <div className="security-workspace">
          <div className="security-brief"><Fingerprint size={22} /><div><span className="eyebrow">{securityScenario.category} · target {securityScenario.target}</span><strong>{securityScenario.label}</strong><p>{securityScenario.attempt}</p></div></div>
          <div className="trust-metrics">
            <article><span>Required defenses</span><strong>{matchedDefenses}/{securityScenario.required.length}</strong><small>least privilege target</small></article>
            <article><span>Requests blocked</span><strong>{securityStatus === "contained" || securityStatus === "breached" ? blockedRequests : 0}%</strong><small>policy enforcement</small></article>
            <article><span>Encrypted traffic</span><strong>{encryptedTraffic}%</strong><small>mTLS coverage</small></article>
            <article><span>Blast radius</span><strong className={securityStatus === "contained" ? "is-good" : securityStatus === "breached" ? "is-bad" : ""}>{securityStatus === "contained" || securityStatus === "breached" ? postBlastRadius : securityScenario.blastRadius}</strong><small>reachable services</small></article>
          </div>
          <div className="defense-lab"><div className="defense-heading"><div><span className="config-label"><KeyRound size={14} /> Policy design</span><strong>Enable only justified controls</strong></div><span>{selectedDefenses.length} enabled</span></div><div className="defense-grid">{defenses.map((defense) => <button type="button" key={defense.id} className={selectedDefenses.includes(defense.id) ? "is-selected" : ""} onClick={() => toggleDefense(defense.id)} disabled={securityStatus === "probing" || securityStatus === "contained"}><span>{defense.layer}</span><strong>{defense.label}</strong><small>{defense.summary}</small></button>)}</div></div>
          {securityStatus === "probing" && <div className="security-progress"><RefreshCw className="is-spinning" /><div><strong>Executing bounded policy probe</strong><span>Evaluating authentication, authorization, encryption, reachability, and workload health…</span></div></div>}
          {(securityStatus === "contained" || securityStatus === "breached") && <div className={`security-result result-${securityStatus}`}>{securityStatus === "contained" ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}<div><span className="eyebrow">Probe #{securityRuns}</span><strong>{securityStatus === "contained" ? "Threat contained" : "Trust boundary breached"}</strong><p>{securityStatus === "contained" ? `Required controls stopped the probe. Trust score: ${trustScore}.` : `${matchedDefenses}/${securityScenario.required.length} required controls matched; ${postBlastRadius} service boundaries remain exposed.`}</p></div></div>}
          <div className="security-actions"><Button variant="outline" className="secondary-button" onClick={resetSecurity}><RotateCcw /> End probe</Button><span>{securityStatus === "armed" ? "Select the smallest defensible policy set." : securityStatus === "breached" ? "Adjust controls and rerun the probe." : ""}</span><Button className="recover-button" onClick={runSecurityProbe} disabled={!selectedDefenses.length || securityStatus === "probing" || securityStatus === "contained"}><Fingerprint /> {securityStatus === "breached" ? "Rerun probe" : "Execute probe"}</Button></div>
        </div>}
      </section>

      <section className="metric-row" aria-label="Live production metrics">
        <article className="metric-card metric-card--primary"><div><Activity size={19} /><span>Request rate</span></div><strong>{Math.round(184 * rateMultiplier)}<small> / min</small></strong><span className="trend"><TrendingUp size={13} /> {incidentDegrading ? "incident impact" : live ? `live at ${speed}×` : "steady baseline"}</span></article>
        <article className={`metric-card ${globalSuccess < 95 ? "metric-card--alert" : ""}`}><div><CheckCircle2 size={19} /><span>Success rate</span></div><strong>{globalSuccess.toFixed(2)}<small>%</small></strong><span className="metric-note">{(100 - globalSuccess).toFixed(2)}% errors</span></article>
        <article className={`metric-card ${p95 > 250 ? "metric-card--alert" : ""}`}><div><TimerReset size={19} /><span>P95 latency</span></div><strong>{p95}<small> ms</small></strong><span className="metric-note">SLO threshold 250 ms</span></article>
        <article className="metric-card"><div><BarChart3 size={19} /><span>Ops score</span></div><strong>{score.toLocaleString()}</strong><span className="metric-note">{completed.toLocaleString()} orders completed</span></article>
      </section>

      <div className="workspace-grid">
        <section className="panel topology-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Live topology</span><h1>Customer checkout path</h1></div>
            <div className="mesh-overlay-control"><label htmlFor="mesh-overlay">Mesh overlay</label><Switch id="mesh-overlay" checked={meshOverlay} onCheckedChange={setMeshOverlay} aria-label="Toggle service mesh overlay" /></div>
            <div className="topology-legend"><span><i className="legend-dot legend-dot--healthy" /> Healthy</span><span><i className="legend-dot legend-dot--request" /> Active request</span><span><i className="legend-dot legend-dot--mesh" /> mTLS</span><span><i className="legend-dot legend-dot--degraded" /> Incident</span></div>
          </div>
          <div className={`topology-stage ${meshOverlay ? "mesh-visible" : ""} ${live ? "traffic-live" : ""}`}>
            <div className={`request-badge ${activeName ? "is-live" : ""}`}><CircleDot size={14} /> MO-{requestNumber} <span>{activeName ? `→ ${activeName}` : "waiting"}</span></div>
            <svg className="topology-lines" viewBox="0 0 900 560" preserveAspectRatio="none" aria-hidden="true">
              <path d="M450 95 L190 207" /><path d="M450 95 L450 207" /><path d="M450 95 L710 207" />
              <path d="M450 255 L190 365" /><path d="M710 255 L450 365" /><path d="M710 255 L710 365" /><path d="M710 415 L450 515" />
            </svg>
            <div className="topology-nodes">
              {serviceRows.map((row, rowIndex) => <div className={`topology-row topology-row--${rowIndex + 1}`} key={row.join("-")}>
                {row.map((serviceName) => {
                  const service = services.find((item) => item.name === serviceName)!;
                  const degraded = Boolean(incidentDegrading && currentIncident?.target === serviceName);
                  return <ServiceNode key={serviceName} service={service} active={activeName === serviceName} visited={visited.includes(serviceName)} selected={selectedName === serviceName} meshOverlay={meshOverlay} rateMultiplier={rateMultiplier} degraded={degraded} latencyPenalty={degraded ? currentIncident?.latencyPenalty ?? 0 : 0} onSelect={() => setSelectedName(serviceName)} />;
                })}
              </div>)}
            </div>
          </div>
          <div className="latency-strip">
            <div className="latency-summary"><span className="eyebrow">P95 latency · last 20 samples</span><strong>{p95} ms</strong><small className={p95 > 250 ? "is-alert" : ""}>{p95 > 250 ? `SLO breached · ${Math.abs(latencyDelta)} ms over` : `Healthy · ${latencyDelta} ms below SLO`}</small></div>
            <div className="sparkline-wrap"><svg viewBox="0 0 500 96" preserveAspectRatio="none" role="img" aria-label="P95 latency history"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42e8c5" stopOpacity=".26" /><stop offset="1" stopColor="#42e8c5" stopOpacity="0" /></linearGradient></defs><line x1="0" y1="16" x2="500" y2="16" className="slo-line" /><polygon points={`0,96 ${sparklinePoints(latencySeries)} 500,96`} fill="url(#chart-fill)" /><polyline points={sparklinePoints(latencySeries)} className={`spark-line ${p95 > 250 ? "is-alert" : ""}`} /></svg><span className="slo-label">250 ms SLO</span></div>
          </div>
        </section>

        <aside className="side-column">
          <section className={`panel inspector-panel ${selectedDegraded ? "is-degraded" : ""}`}>
            <div className="inspector-title"><div className="service-avatar"><Server size={21} /></div><div><span>Service details</span><h2>{selected.label}</h2></div><span className={`status-chip ${selectedDegraded ? "is-degraded" : ""}`}><span className={`health-dot ${selectedDegraded ? "health-dot--degraded" : ""}`} /> {selectedDegraded ? "Degraded" : "Healthy"}</span></div>
            <dl className="service-stats"><div><dt>Request rate</dt><dd>{Math.round(selected.rate * rateMultiplier)} / min</dd></div><div><dt>Success rate</dt><dd>{selectedSuccess.toFixed(2)}%</dd></div><div><dt>P95 latency</dt><dd>{selected.latency * 2 + 12 + selectedLatencyPenalty} ms</dd></div><div><dt>CPU usage</dt><dd>{selectedCpu}%</dd></div></dl>
            <div className="runtime-card"><div><Boxes size={17} /><span>Runtime</span><strong>{selected.language}</strong></div><div><HeartPulse size={17} /><span>Application</span><strong>Ready</strong></div><div><Cpu size={17} /><span>Workloads</span><strong>{selected.instances}/{selected.instances} ready</strong></div><div><LockKeyhole size={17} /><span>mTLS</span><strong>STRICT</strong></div></div>
            <div className="identity-card"><span className="eyebrow">Workload identity</span><code>cluster.local/ns/meshops/sa/{selected.name}</code></div>
          </section>

          <section className="panel objectives-panel">
            <div className="objectives-heading"><div><Gauge size={18} /><div><span className="eyebrow">Shift objectives</span><h2>Production health</h2></div></div><strong>{score.toLocaleString()}</strong></div>
            <div className="objective-list">
              <div className="objective-row"><div><ShieldCheck size={16} /><span>Availability</span><strong>{availability.toFixed(2)}%</strong></div><Progress value={availability} aria-label={`Availability ${availability.toFixed(2)} percent`} /><small>Target ≥ 99.90%</small></div>
              <div className="objective-row"><div><DollarSign size={16} /><span>Revenue retained</span><strong>${revenue}k/min</strong></div><Progress value={Math.min(100, Number(revenue) / 20 * 100)} aria-label="Revenue retained" /><small>Target ≥ $16k/min</small></div>
              <div className="objective-row"><div><Smile size={16} /><span>Customer satisfaction</span><strong>{satisfaction}%</strong></div><Progress value={satisfaction} aria-label={`Customer satisfaction ${satisfaction} percent`} /><small>Target ≥ 95%</small></div>
              <div className="objective-row"><div><Database size={16} /><span>Infrastructure cost</span><strong>$1,142/hr</strong></div><Progress value={82} aria-label="Infrastructure budget health 82 percent" /><small>Budget ≤ $1,400/hr</small></div>
            </div>
          </section>
        </aside>
      </div>

      <section className="panel event-panel">
        <div className="event-heading"><div><TerminalSquare size={18} /><div><span className="eyebrow">Timeline</span><h2>Production events</h2></div></div><div className="event-filters" role="group" aria-label="Filter production events">{(["all", "requests", "mesh", "incidents"] as EventFilter[]).map((filter) => <button key={filter} type="button" className={eventFilter === filter ? "is-selected" : ""} onClick={() => setEventFilter(filter)}>{filter}</button>)}</div></div>
        <div className="event-list" aria-live="polite">{filteredEvents.length ? filteredEvents.map((event) => <div className="event-row" key={event.id}><time>{event.time}</time><span className={`event-marker event-marker--${event.tone}`} /><p>{event.text}</p><span className="event-source">{event.tone === "mesh" ? "istio" : event.tone === "system" ? "kubernetes" : event.tone === "incident" ? "incident-engine" : "checkout"}</span></div>) : <p className="empty-events">No events match this filter.</p>}</div>
      </section>

      <footer className="console-footer"><div><Database size={15} /> Deterministic demo stream · resets locally</div><div><ShieldCheck size={15} /> STRICT mTLS · 9 identities · 15 sidecars · Gateway API</div></footer>
    </main>
  );
}

export default function Home() {
  const [entryMode, setEntryMode] = useState<EntryMode>("cover");
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const lesson = tutorialSteps[tutorialIndex];

  if (entryMode === "console") return <MeshOpsConsole onExit={() => setEntryMode("cover")} />;

  if (entryMode === "tutorial") return (
    <main className="entry-shell tutorial-shell">
      <header className="entry-header">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><GitBranch size={22} /></div><div><div className="brand-name">MeshOps</div><div className="brand-kicker">Explain Like I’m Five</div></div></div>
        <button type="button" className="text-action" onClick={() => setEntryMode("cover")}><ArrowLeft /> Back to start</button>
      </header>
      <section className="tutorial-card" aria-live="polite">
        <aside className="lesson-rail" aria-label="Tutorial progress">
          <div><BookOpen /><span>Quick walkthrough</span><strong>{tutorialIndex + 1} of {tutorialSteps.length}</strong></div>
          <ol>{tutorialSteps.map((step, index) => <li key={step.title}><button type="button" className={`${index === tutorialIndex ? "is-current" : ""} ${index < tutorialIndex ? "is-complete" : ""}`} onClick={() => setTutorialIndex(index)} aria-label={`Open lesson ${index + 1}: ${step.title}`}><i>{index < tutorialIndex ? "✓" : index + 1}</i><span>{step.title}</span></button></li>)}</ol>
          <button type="button" className="text-action tutorial-skip" onClick={() => setEntryMode("console")}>Skip to console <ArrowRight /></button>
        </aside>
        <article className="lesson-content">
          <div className="lesson-copy"><span className="eyebrow">{lesson.kicker}</span><h1>{lesson.title}</h1><p>{lesson.explanation}</p><div className="remember-card"><GraduationCap /><div><span>Remember this</span><strong>{lesson.remember}</strong></div></div></div>
          <TutorialPicture kind={lesson.visual} />
          <div className="lesson-actions"><Button variant="outline" className="secondary-button" onClick={() => setTutorialIndex((current) => Math.max(0, current - 1))} disabled={tutorialIndex === 0}><ArrowLeft /> Previous</Button><div className="lesson-dots" aria-label="Choose tutorial step">{tutorialSteps.map((step, index) => <button type="button" key={step.title} className={index === tutorialIndex ? "is-current" : ""} onClick={() => setTutorialIndex(index)} aria-label={`Step ${index + 1}`} />)}</div><Button className="run-button" onClick={() => tutorialIndex === tutorialSteps.length - 1 ? setEntryMode("console") : setTutorialIndex((current) => current + 1)}>{tutorialIndex === tutorialSteps.length - 1 ? "Open command console" : "Next idea"} <ArrowRight /></Button></div>
        </article>
      </section>
      <footer className="entry-footer"><span>About 90 seconds</span><span>No quiz · no setup · plain language</span></footer>
    </main>
  );

  return (
    <main className="entry-shell cover-shell">
      <header className="entry-header">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><GitBranch size={22} /></div><div><div className="brand-name">MeshOps</div><div className="brand-kicker">Incident Commander</div></div></div>
        <span className="cover-version">v1.0.1</span>
      </header>
      <section className="cover-stage">
        <div className="cover-copy"><span className="eyebrow">Service-mesh training console</span><h1>Keep the tiny helpers talking.</h1><p>Practice finding and fixing failures across a realistic online checkout system. Learn the idea first, or go straight to the full operations console.</p><div className="cover-facts"><span><ShieldCheck /> Safe simulation</span><span><Network /> Real Istio lab</span><span><Trophy /> Five-mission campaign</span></div></div>
        <div className="cover-map" aria-label="Checkout services connected through a protected mesh">
          <div className="cover-map__header"><span>demo-production</span><strong>All systems healthy</strong></div>
          <div className="cover-route"><div><Server /><span>Gateway</span></div><i /><div><KeyRound /><span>Auth</span></div><i /><div><Boxes /><span>Orders</span></div><i /><div><DollarSign /><span>Payments</span></div></div>
          <div className="cover-map__metrics"><span><b>99.98%</b> success</span><span><b>122 ms</b> P95</span><span><b>STRICT</b> mTLS</span></div>
        </div>
      </section>
      <section className="entry-choices" aria-label="Choose how to start">
        <button type="button" className="entry-choice tutorial-choice" onClick={() => { setTutorialIndex(0); setEntryMode("tutorial"); }}><span className="choice-icon"><BookOpen /></span><span className="choice-copy"><small>New to service meshes?</small><strong>Quick tutorial</strong><em>Explain it like I’m five in six simple ideas.</em></span><ArrowRight /></button>
        <button type="button" className="entry-choice console-choice" onClick={() => setEntryMode("console")}><span className="choice-icon"><TerminalSquare /></span><span className="choice-copy"><small>Ready to operate?</small><strong>Open command console</strong><em>Start the campaign or use any lab directly.</em></span><ArrowRight /></button>
      </section>
      <footer className="entry-footer"><span>Deterministic browser simulation</span><span>Kubernetes + Istio lab included in the source</span></footer>
    </main>
  );
}

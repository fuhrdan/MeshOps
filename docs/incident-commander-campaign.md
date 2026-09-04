# Full Incident Commander campaign

MeshOps v1.0.0 joins every training surface into a five-mission campaign. The browser experience remains a deterministic simulation: it does not claim to read from or mutate a Kubernetes cluster. Each mission activates the same controls that are available independently elsewhere in the console.

## Mission sequence

| Operation | Discipline | Completion contract |
|---|---|---|
| REDLINE | Incident response | Diagnose the payment latency fault in Commander mode, verify a traffic policy, and recover checkout. |
| NARROW GATE | Progressive delivery | Start the bad-deployment canary and roll it back at the first failed guardrail. |
| NEEDLE | Observability | Select an error trace, inspect a failing span, and confirm it as the root span. |
| BULKHEAD | Resilience | Pass the dependency-timeout load test with the smallest effective protection set. |
| LOCKBOX | Zero trust | Contain the stolen-identity probe with zero remaining blast radius. |

The campaign advances only after the current objective is verifiably complete. Existing lab scoring still applies, and the campaign adds a separate 6,400-point record. Wrong incident diagnoses, unnecessary resilience patterns, and unnecessary trust controls reduce the final result.

## Certification ranks

| Score | Rank |
|---:|---|
| 5,800–6,400 | Principal Commander |
| 5,000–5,799 | Incident Commander |
| 4,200–4,999 | Senior Responder |
| Below 4,200 | Responder |

Completing the shift unlocks a Markdown after-action report containing the mission record, rank, major outcomes, and discipline scores. The report is generated locally in the browser and includes no hidden telemetry.

## Real-lab companion

The campaign never chains real cluster mutations. Use `bash scripts/campaign.sh brief` for the phase map, `preflight` to validate every repository contract, and `status` for a read-only view of the installed lab. Operators invoke the established incident, canary, resilience, traffic, tracing, and security/chaos scripts explicitly for each exercise.

Chaos remains opt-in and retains every v0.9.0 disposable-environment and confirmation gate.

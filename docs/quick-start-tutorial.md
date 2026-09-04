# Quick-start tutorial

MeshOps v1.0.1 opens with a deliberate choice: learn the basic service-mesh mental model or go straight to the operations console. The tutorial is a deterministic, browser-only introduction that takes about 90 seconds and never connects to a Kubernetes cluster.

## Start-screen routes

| Choice | Result |
|---|---|
| **Quick tutorial** | Opens the six-step Explain-Like-I'm-Five walkthrough |
| **Open command console** | Opens the complete v1.0 Incident Commander product immediately |

The console includes a **Start screen** control so the operator can return and take the tutorial later.

## Lesson sequence

1. **The little helpers** — each microservice has one small job in the checkout team.
2. **The safe hallways** — the service mesh secures and observes messages moving between services.
3. **Something goes wrong** — customer-visible symptoms are clues, not necessarily the root cause.
4. **Follow one order** — a distributed trace shows the path and timing of one request.
5. **Fix it carefully** — retries, timeouts, canaries, and circuit breakers have benefits and costs.
6. **Practice safely** — the browser simulations are safe twins; real lab actions remain explicit and opt-in.

Operators can move with the lesson rail or previous/next buttons, skip to the console at any point, or enter the console from the final step. The tutorial does not score the operator, change campaign state, or execute a fault.

## Design contract

- Plain language appears before specialist terminology.
- Each lesson has one idea, a small visual, and a short explanation.
- Tutorial and console state remain local to the current browser session.
- The full v1.0 campaign and every standalone lab remain unchanged behind the entry screen.
- Static hosting and itch.io use the same tutorial experience.

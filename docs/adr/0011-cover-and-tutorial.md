# ADR 0011: Cover screen and quick-start tutorial

- Status: Accepted
- Date: 2026-09-04

## Context

MeshOps had grown into a complete service-mesh operations simulator, but it opened directly on a dense command console. First-time users needed a small mental model before facing metrics, topology, incidents, traces, and recovery controls.

## Decision

Add an in-application entry controller with three local states: cover, tutorial, and console. The cover offers two equally visible routes. The tutorial teaches six concepts in plain language and then hands the user to the existing console; the direct route bypasses all instruction.

The tutorial is implemented inside the static React application. It uses the existing icon set and CSS rather than external media, stores no progress, runs no quiz, and never invokes cluster operations.

## Consequences

- New users can understand the product before operating it.
- Experienced operators retain a one-click route to the console.
- The Sites and itch.io releases remain a single static build.
- Initial server-rendered HTML describes the cover instead of the internal console, so rendering contracts now validate the two entry choices.
- Returning to the start screen resets tutorial position but does not reset the console's browser-local simulator state.

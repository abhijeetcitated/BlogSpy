---
applyTo: "src/**/*.ts,src/**/*.tsx,next.config.ts,proxy.ts,package.json"
---
# Wiring Instructions

## Objective
Prevent breakage when editing shared modules and cross-feature dependencies.

## Rules
- Build import/export dependency map before edits.
- Keep public module contracts stable unless migration is explicit.
- If a shared file changes, list all impacted consumers and update them together.
- Do not remove or rename exports without repository-wide validation.

## Required Artifacts
- Wiring audit output for every feature change.
- Regression scope list for impacted routes, actions, and components.
- Use generated maps:
  - `memory-bank/maps/import-graph.json`
  - `memory-bank/maps/route-action-map.json`
  - `memory-bank/maps/db-table-map.json`

## Required Checks
- Run targeted tests for impacted flows.
- Run `npm run build` and verify no unresolved imports/types.

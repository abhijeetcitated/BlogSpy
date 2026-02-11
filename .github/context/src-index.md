# Source Index (Internal Architecture Map)

Last updated: 2026-02-06
Scope: High-signal index for agent planning. Use with `memory-bank/maps/*.json` for machine-readable scans.

## Core `src/` Domains

| Path | Purpose | Typical Connections |
| --- | --- | --- |
| `src/app` | App Router routes (`page.tsx`, `layout.tsx`, `route.ts`) | `src/features`, `src/lib`, `src/components`, auth/session |
| `src/features` | Feature modules (UI + actions + services + types) | `src/lib`, `src/services`, external providers |
| `src/components` | Shared UI/layout primitives | `src/store`, `src/hooks`, feature components |
| `src/lib` | Cross-cutting runtime libraries | Supabase, auth, safe-action, security, external API clients |
| `src/services` | Integration/service clients and orchestration | DataForSEO, third-party APIs, helper clients |
| `src/store` | Zustand state for UI/session/project-level state | sidebar/project switcher/modals |
| `src/hooks` | shared hooks and adapters | auth/profile/credits and feature UI behavior |
| `src/config` | env parsing + feature flags + runtime config | used by app/features/services |
| `src/constants` | global constants and endpoint references | app/features/lib |
| `src/types` | shared TS contracts | app/features/lib/services |
| `src/utils` | general utilities | all layers |
| `src/styles` | styling tokens/utilities | app/components/features |
| `src/contexts` | React providers (auth/user) | app layouts + feature widgets |
| `src/data` | static/mock seed data | features/tests/demo states |

## Route Surface (high level)
- `src/app/dashboard/**`: authenticated dashboard experience and feature entry points.
- `src/app/(auth)/**` + `src/app/auth/**`: authentication flows.
- `src/app/api/**`: webhook/cron/provider endpoints and specialized handlers.
- `src/app/(marketing)/**`: marketing/public pages.

## Feature Surface (high level)
Feature modules currently exist under `src/features/**` (30+ modules including `dashboard`, `keyword-research`, `settings`, `notifications`, `trend-spotter`, `topic-clusters`, `video-hijack`, `ai-visibility`, `social-tracker`, etc.).

Use these generated files for exact paths and relationships:
- `memory-bank/maps/import-graph.json`
- `memory-bank/maps/route-action-map.json`
- `memory-bank/maps/db-table-map.json`

## How agents must use this file
1. Planner reads this file first for scope boundaries.
2. Planner loads only impacted feature folders (delta scan) unless Tier-3 change.
3. Implementer and reviewer must reference corresponding map files before verdict.

# Wiring Map (Repository-Level)

Last updated: 2026-02-06

## Canonical flow
`UI component` -> `feature action` -> `service/lib` -> `db/external provider` -> `cache/notification` -> `UI refresh`

## Core wiring layers
1. **Presentation layer**
- `src/app/**` and `src/features/**/components/**`
- Reads typed view models and triggers actions.

2. **Action layer**
- `src/features/**/actions/*.ts` and `src/app/**/actions.ts`
- Validation, auth context, orchestration.

3. **Domain/service layer**
- `src/features/**/services/*.ts`, `src/lib/services/*.ts`, `src/services/*.ts`
- Business logic + provider adapters.

4. **Data/integration layer**
- Supabase/Prisma clients (`src/lib/supabase/**`, `src/lib/prisma.ts`, `prisma/**`)
- Provider APIs (DataForSEO, Upstash, LemonSqueezy, webhooks).

## Known cross-cutting connections
- Sidebar/project switcher/global modals rely on shared store state (`src/store/ui-store.ts`, `src/store/user-store.ts`).
- Auth/session flows cross `proxy.ts`, `src/lib/supabase/middleware.ts`, `src/app/auth/**`, and dashboard layouts.
- Notifications cross feature events, queue/email dispatchers, and `notification_history` persistence.
- Credits/billing logic cross feature actions + Supabase RPC + billing pages/components.

## Required verification by tier
- Tier-1: impacted component + local state + smoke checks.
- Tier-2: import/export map + action/service/db path validation.
- Tier-3: full route/action/db/external integration review + security gate + rollback plan.

## Machine-readable companions
- `memory-bank/maps/import-graph.json`
- `memory-bank/maps/route-action-map.json`
- `memory-bank/maps/db-table-map.json`

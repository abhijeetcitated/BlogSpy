# AI Suggestions V1 — Feature Plan (v2)

**Feature slug**: `ai-suggestions-v1`
**Risk tier**: Tier-2 (medium — existing feature wiring, server action + Prisma reads, no schema change, no external API in V1)
**Date**: 2026-02-07 (v1 initial), updated 2026-02-07 (v2 — card contract + auto-refresh + error state)
**Author**: Gama Orchestrator (planner phase)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-02-07 | Initial: replaced static mock with 7-rule engine + server action |
| v2 | 2026-02-07 | Card contract alignment (evidence, ctaLabel, ctaHref, freshness, effort), 30m auto-refresh, error state UI |

---

## Phase 0: Preflight Baseline

### Governance files loaded
- `AGENTS.md` — source-of-truth policy
- `.github/copilot-instructions.md` — repo-wide AI rules
- `.github/instructions/backend.instructions.md` — server action rules
- `.github/instructions/db.instructions.md` — Prisma/query rules
- `.github/instructions/security.instructions.md` — tenant isolation, auth, abuse
- `.github/instructions/wiring.instructions.md` — export/import contracts

### Build baseline
- `npm run build` — passing (70/70 pages, exit 0, verified at end of v1)

---

## Phase 1: Discovery — V1 Scope

### Purpose
AI Suggestions = dashboard decision engine. Shows "what to do next" based on project data already in DB. NOT an LLM tracking engine.

### V1 Suggestion Types (7 — SEO-only)

| # | Type | Trigger | Data Source |
|---|---|---|---|
| 1 | `rank_drop` | Keyword position dropped >=3 in 7 days | `rank_history` + `kw_cache` |
| 2 | `content_decay` | Content status = DECAYING | `content_performance` + `rank_history` |
| 3 | `trend_spike` | Topic growth >= 100% | `trend_watchlist` |
| 4 | `snippet_opportunity` | Position 2-5 | `rank_history` |
| 5 | `weak_spot` | Position 4-15 + KD < 30 | `rank_history` + `kw_cache.raw_data` |
| 6 | `ai_overview_gap` | Rank <= 5, no AI scan logged | `rank_history` + `activity_logs` |
| 7 | `rtv_alert` | loss_percentage > 50% | `kw_cache.loss_percentage` |

### System Alerts (Optional Separate Section — V2 stub)
- `low_credit` — defined in types only, no generator, no UI
- `inactivity` — defined in types only, no generator, no UI

### Non-Goals (V1)
- No OpenRouter / LLM calls
- No DataForSEO API calls (Live Refresh = V2)
- No schema/migration changes
- No persistent dismiss state (client-side only)
- No alert frequency settings (V2)

### Card Contract (V1 — Spec-Aligned)

Fields:
- `id: number`
- `type: string` — one of 7 SEO types
- `priority: "high" | "medium" | "low"`
- `icon: LucideIcon`
- `iconColor: string`
- `bgColor: string`
- `borderColor: string`
- `title: string` — problem/opportunity headline
- `description: string` — actionable advice
- `evidence: string` — data-backed proof (NEW in v2)
- `ctaLabel: string` — CTA button label (RENAMED from `action`)
- `ctaHref: string` — CTA link (RENAMED from `actionHref`)
- `impact: string` — expected gain/loss
- `impactColor: string`
- `freshness: string` — when detected (RENAMED from `timeAgo`)
- `effort?: string` — optional estimated effort (NEW in v2)

### v2 Delta — Changes from v1 Implementation

| Change | Files Impacted | Risk |
|--------|---------------|------|
| Rename `action` -> `ctaLabel` | interface, engine (8 push sites), card UI | LOW |
| Rename `actionHref` -> `ctaHref` | same | LOW |
| Rename `timeAgo` -> `freshness` | same | LOW |
| Add `evidence` field | interface, engine, card UI | LOW |
| Add `effort?` optional field | interface, engine, card UI | LOW |
| 30m auto-refresh interval | DashboardClient.tsx | LOW |
| Error state (UI) | agentic-suggestions.tsx, DashboardClient, CommandCenter | LOW |

### API Call Matrix

| Trigger | What happens | Cost |
|---|---|---|
| Dashboard open | fetchAISuggestions server action -> internal DB reads | 0 credits |
| Manual refresh | Re-call (30s client cooldown) | 0 credits |
| Auto refresh (30m) | setInterval re-call | 0 credits |
| Live refresh (V2) | DataForSEO -> DB update -> recompute | Credits deducted |

---

## Phase 2: Security & Risk

### Threat Model (unchanged from v1)

| Threat | Impact | Mitigation |
|---|---|---|
| Unauthorized data access | HIGH | Auth + ownership validation |
| Cross-tenant data leak | HIGH | All queries scoped by project_id |
| Refresh spam | LOW | 30s client cooldown + 30m auto-refresh cap |
| Large result set | LOW | Max 20 suggestions |
| Invalid projectId | MEDIUM | Zod UUID validation |
| Exposed internal errors | LOW | try/catch -> empty arrays |

### Risk Register

| Risk | Severity | Status |
|---|---|---|
| DB tables with no production data | LOW | Accepted |
| kw_cache.raw_data JSON varies | LOW | Mitigated — optional chaining |
| safeRankings N+1 pattern | MEDIUM | Accepted V1; batch in V2 |
| Auto-refresh after tab switch | LOW | Mitigated — React cleanup |

### Unresolved HIGH risks: NONE -> Phase 2 GATE: PASS

---

## Phase 3: Wiring Blueprint (v2 delta only)

### Files Modified in v2

| File | What Changes | Risk |
|---|---|---|
| `command-center-data.ts` | Interface: rename 3 fields, add evidence + effort | LOW |
| `suggestion-engine.ts` | 8 push sites: rename 3 fields, add evidence + effort | LOW |
| `agentic-suggestions.tsx` | Card render: new field names, show evidence, show effort, add error prop + ErrorState | LOW |
| `CommandCenter.tsx` | Add suggestionsError prop, pass to AgenticSuggestions | LOW |
| `DashboardClient.tsx` | Add 30m auto-refresh interval, suggestionsError state, pass error prop | LOW |

### Files NOT Touched in v2
- `fetch-ai-suggestions.ts` — returns AgenticSuggestion[] by reference, no field access
- `components/index.ts` — barrel, no field access
- All files outside `src/features/dashboard/`
- prisma/schema.prisma
- src/lib/prisma.ts

### Implementation Order (v2)

1. `command-center-data.ts` — update interface
2. `suggestion-engine.ts` — update all push sites
3. `agentic-suggestions.tsx` — update card render + error state
4. `CommandCenter.tsx` — add error prop
5. `DashboardClient.tsx` — add auto-refresh + error tracking
6. `npm run build` — verify

---

## Phase Gate Summary

| Phase | Status |
|---|---|
| Phase 0: Preflight | PASS |
| Phase 1: Discovery | PASS — scope frozen |
| Phase 2: Security | PASS — no unresolved HIGH |
| Phase 3: Wiring | PASS — all impacted files mapped |
| Phase 4: Implementation | READY |

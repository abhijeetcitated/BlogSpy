# AI Visibility V2 — Production Roadmap

**Created:** 2026-02-09  
**Risk Tier:** T3 (High) — new external provider APIs, schema/migration edits, RLS policies, DataForSEO cost surface  
**Feature Slug:** `ai-visibility-v2-production`  
**Status:** Planning Complete

---

## 1. Current State Assessment

### 1.1 What IS Working (Build Passes ✅)

| Layer | File(s) | Status |
|-------|---------|--------|
| **Core Service** | `services/dataforseo-visibility.service.ts` (794 lines) | ✅ Complete — 3 parallel API calls (LLM Mentions + Google AI Mode + Organic), brand detection, sentiment analysis, mock mode, citation generation |
| **run-scan action** | `actions/run-scan.ts` (354 lines) | ✅ Complete — credits deduct → scan → save scan + citations + snapshot → refund on failure |
| **run-citation action** | `actions/run-citation.ts` (331 lines) | ✅ Complete — single platform check (1 credit), full visibility check (2 credits), batch check (5 credits/keyword) |
| **save-config action** | `actions/save-config.ts` (223 lines) | ✅ Complete — CRUD against `ai_visibility_configs` (RLS-protected) |
| **save-keyword action** | `actions/save-keyword.ts` (180 lines) | ✅ Complete — CRUD against `ai_visibility_keywords` |
| **get-dashboard-data action** | `actions/get-dashboard-data.ts` (195 lines) | ✅ Complete — fetches citations + aggregates scans into 30-day trend |
| **run-tracker action** | `actions/run-tracker.ts` | ✅ Refactored to use shared DataForSEO client |
| **run-audit action** | `actions/run-audit.ts` | ✅ Already working (tech audit, no API cost) |
| **Page.tsx** | `src/app/dashboard/ai-visibility/page.tsx` (591 lines) | ✅ Compiles — guest gate, login modal, demo mode, real scan wiring |
| **Dashboard Component** | `components/AIVisibilityDashboard.tsx` (765 lines) | ✅ Compiles — scan input, stat cards, charts, citations list, competitor comparison |
| **Migration SQL** | `supabase/migrations/20260209100000_ai_visibility_v2_tables.sql` | ✅ Written — 4 tables with RLS + indexes |
| **All 14 Components** | 14 files in `components/` | ✅ Compile — barrel exported |
| **Types** | `types/index.ts` (547 lines) | ✅ Complete — FullScanResult, AICitation, TrackedKeyword, all config types |
| **Constants** | `constants/index.tsx` (344 lines) | ✅ Updated — all platform configs point to `dataforseo` apiSource |
| **Utils** | `utils/index.ts` (356 lines) + `utils/pdf-generator.ts` (176 lines) | ✅ Complete — calculations + print report support |
| **Old Code Deleted** | 4 OpenRouter-dependent files removed | ✅ Backups in `backups/2026-02-08_ai-visibility-delete/` |

### 1.2 What Is NOT Working / Not Verified ❌

| Issue | Impact | Severity |
|-------|--------|----------|
| **Migration NOT applied** to Supabase | All DB writes (scans, citations, keywords, snapshots) will 400/404 | 🔴 Critical |
| **No end-to-end test** with real DataForSEO API | Unknown if API response shapes match our parsers | 🔴 Critical |
| **Credits badge hard-coded to "500"** in dashboard | User sees wrong balance | 🟡 Medium |
| **`_INTEGRATION_GUIDE.ts` is stale** — references OpenRouter as primary API | Misleading documentation | 🟢 Low |
| **`FactPricingGuard` uses static SAMPLE_DEFENSE_LOG** | Always shows demo data, never real hallucination checks | 🟡 Medium |
| **`TechAuditWidget` operates standalone** — not wired to selected config's domain | Audits generic input, not user's tracked domain | 🟡 Medium |
| **No update policy on `ai_visibility_scans`** | Can't update scan records (intentional? no use case yet) | 🟢 Low |
| **`ai_visibility_keywords` has no `last_results` or `last_checked_at` columns** in migration SQL | Migration SQL only has `id, user_id, config_id, keyword, category, created_at`. But `save-keyword.ts` type expects `last_results` and `last_checked_at` | 🟡 Medium |
| **No rate limiting / abuse protection** on DataForSEO calls beyond authAction | A user could burn credits rapidly (authAction has basic rate limits only) | 🟡 Medium |
| **No error telemetry / logging** | DataForSEO errors silently caught with `console.error` only | 🟡 Medium |
| **`listVisibilityConfigs` not exported** from action index | Action is defined in save-config.ts but used by page.tsx — needs verification it's properly exported | 🟡 Medium |
| **Batch check charges `BATCH_CHECK_COST * keywords.length`** but `BATCH_CHECK_COST = 5` | 10 keywords = 50 credits — might be expensive | 🟢 Low |
| **No Prisma model** for any ai_visibility tables | All queries go through Supabase client directly (acceptable pattern for this feature) | 🟢 Info |

### 1.3 Dangling References Found

| Reference | Location | Action Needed |
|-----------|----------|---------------|
| `openrouter` (comments only) | `_INTEGRATION_GUIDE.ts`, `services/index.ts`, `actions/index.ts` | Update `_INTEGRATION_GUIDE.ts` as documentation-only cleanup |
| `serper` | None found in feature code | ✅ Clean |
| Mock mode (`NEXT_PUBLIC_USE_MOCK_DATA`) | `dataforseo-visibility.service.ts`, `tracker.service.ts`, `page.tsx` | ✅ Intentional — controlled via env var |

---

## 2. Dependency Map

```
page.tsx
├── components/AIVisibilityDashboard.tsx
│   ├── components/CitationCard.tsx
│   ├── components/PlatformBreakdown.tsx
│   ├── components/VisibilityTrendChart.tsx
│   ├── components/QueryOpportunities.tsx
│   ├── components/FactPricingGuard.tsx          ← STATIC DATA ONLY
│   ├── components/TechAuditWidget.tsx           ← NOT WIRED TO CONFIG
│   ├── components/HowItWorksCard.tsx
│   ├── components/CompetitorComparison.tsx
│   ├── components/NetSentimentCard.tsx
│   ├── utils/index.ts (calculations)
│   ├── utils/pdf-generator.ts
│   └── constants/index.tsx
├── components/SetupWizard.tsx
├── components/AddKeywordModal.tsx
├── components/SetupConfigModal.tsx
├── actions/run-scan.ts
│   ├── services/dataforseo-visibility.service.ts
│   │   ├── @/lib/seo/dataforseo (getDataForSEOClient)
│   │   └── @/constants/api-endpoints (DATAFORSEO endpoints)
│   ├── @/lib/services/credit-banker.service.ts
│   └── @/lib/supabase/server (createClient)
├── actions/save-config.ts → ai_visibility_configs table
├── actions/save-keyword.ts → ai_visibility_keywords table
├── actions/get-dashboard-data.ts → ai_visibility_citations + ai_visibility_scans
├── actions/run-citation.ts → run-scan service + credits
└── actions/run-audit.ts → standalone tech audit
```

### External Dependencies
- **DataForSEO API** — 3 endpoints: LLM Mentions, Google AI Mode, Google Organic
- **Supabase** — 5 tables: `ai_visibility_configs` (exists), `scans`, `citations`, `keywords`, `snapshots` (migration pending)
- **CreditBanker** — `@/lib/services/credit-banker.service.ts` (singleton, already working)
- **authAction** — `@/lib/safe-action` wrapper (already working)

---

## 3. Production Roadmap — Ordered Phases

### Phase 0: Migration Deployment (CRITICAL BLOCKER)
**Priority:** 🔴 P0 — Nothing works without this  
**Effort:** 15 minutes  
**Risk:** Low (SQL is already written and reviewed)

| # | Task | File | Notes |
|---|------|------|-------|
| 0.1 | Apply migration to Supabase | `supabase/migrations/20260209100000_ai_visibility_v2_tables.sql` | Run via Supabase Dashboard SQL Editor or `supabase db push` |
| 0.2 | Verify all 4 tables exist with RLS | Supabase Dashboard → Tables | Check: `ai_visibility_scans`, `ai_visibility_citations`, `ai_visibility_keywords`, `ai_visibility_snapshots` |
| 0.3 | Verify FK relation to `ai_visibility_configs` | - | All 4 tables reference `ai_visibility_configs(id)` |
| 0.4 | Add missing columns to `ai_visibility_keywords` | Migration SQL | Add `last_results jsonb`, `last_checked_at timestamptz` — the `save-keyword.ts` KeywordRow type expects these |

**Pre-condition:** `ai_visibility_configs` table must already exist in Supabase (confirmed via `sql/ai_visibility_configs.sql` + existing save-config action).

**Rollback:** `DROP TABLE IF EXISTS` for each of the 4 new tables.  

---

### Phase 1: DataForSEO API Validation (CRITICAL)
**Priority:** 🔴 P0  
**Effort:** 2-4 hours  
**Risk:** Medium — API response shapes may differ from our type assumptions  
**Dependencies:** Phase 0 complete

| # | Task | File | Notes |
|---|------|------|-------|
| 1.1 | Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` | `.env.local` | Ensure DataForSEO credentials are set |
| 1.2 | Run single LLM Mentions API call manually | Test script or Postman | Verify response shape matches `LLMMentionsResult` type — check `items[].source` field values |
| 1.3 | Run single Google AI Mode API call | Same | Verify `ai_mode_response` item type and sub-items structure |
| 1.4 | Run single Google Organic API call | Same | Verify `organic` item type and `domain` field |
| 1.5 | Run full scan via UI (mock mode off) | Page.tsx → Run Scan | End-to-end: credits → API → DB → display |
| 1.6 | Verify citations saved to `ai_visibility_citations` | Supabase Dashboard | Check inserted rows match schema |
| 1.7 | Verify scan result saved to `ai_visibility_scans` | Supabase Dashboard | Check `scan_result` JSONB is valid FullScanResult |
| 1.8 | Verify snapshot upserted to `ai_visibility_snapshots` | Supabase Dashboard | Check date-based upsert works |
| 1.9 | Fix any API parsing mismatches | `services/dataforseo-visibility.service.ts` | Adjust transform functions if needed |

**Key Risk:** DataForSEO LLM Mentions `items[].source` field — we map `"chatgpt"`, `"gemini"`, `"perplexity"`, `"claude"`. If DataForSEO uses different platform identifiers (e.g., `"ChatGPT"` capitalized or `"openai"`), brand detection will silently fail for that platform. Must verify actual API response.

---

### Phase 2: Dashboard Data Flow Fixes (IMPORTANT)
**Priority:** 🟡 P1  
**Effort:** 3-5 hours  
**Risk:** Low — mostly UI logic + data plumbing  
**Dependencies:** Phase 0 + Phase 1

| # | Task | File | Notes |
|---|------|------|-------|
| 2.1 | **Wire real credit balance** (replace hard-coded "500") | `components/AIVisibilityDashboard.tsx` L525 | Call `getCreditBalance()` action and display actual balance |
| 2.2 | **Pass domain to TechAuditWidget** | `components/AIVisibilityDashboard.tsx` L675 | Change `<TechAuditWidget />` → `<TechAuditWidget domain={selectedConfig?.trackedDomain} />` |
| 2.3 | **Verify `listVisibilityConfigs` export** | `actions/index.ts` | Confirm it's exported from `save-config.ts` barrel — used by page.tsx `refreshConfigs()` |
| 2.4 | **Dashboard data refresh after scan** | `page.tsx` L365 (`router.refresh()`) | Verify this triggers useEffect re-fetch of dashboard data — may need state-based refetch instead |
| 2.5 | **Handle empty state** when user has config but no scans yet | `AIVisibilityDashboard.tsx` | Currently falls back to demo data via `generateCitations()` even in non-demo mode if citations array is empty |
| 2.6 | **Wire date range filter** to `getVisibilityDashboardData` | `AIVisibilityDashboard.tsx` filters + `page.tsx` | Currently `days: 30` is hard-coded. Filter changes should re-fetch with new `days` param |
| 2.7 | **PlatformCheckButton needs configId** | `PlatformBreakdown.tsx` → `PlatformCheckButton` | Button exists but needs `configId` and `query` from parent context |

---

### Phase 3: FactPricingGuard — From Static to Dynamic (IMPORTANT)
**Priority:** 🟡 P1  
**Effort:** 4-6 hours  
**Risk:** Medium — needs new action + possibly new API calls  
**Dependencies:** Phase 1

| # | Task | File | Notes |
|---|------|------|-------|
| 3.1 | Design hallucination detection flow | Plan only | After a scan, compare AI responses vs known brand data (pricing, features) from user config |
| 3.2 | Add `brand_facts` field to `ai_visibility_configs` | Migration SQL | JSON field: `{ pricing: "$29/mo", features: ["..."], founded: "2024" }` |
| 3.3 | Create `check-facts.ts` action | `actions/check-facts.ts` | Compare scan result snippets against `brand_facts` — keyword match or use DataForSEO Content Analysis |
| 3.4 | Create `ai_visibility_defense_log` table | Migration SQL | `id, user_id, config_id, platform, check_type, status, ai_response, actual_data, created_at` |
| 3.5 | Wire `FactPricingGuard` to real data | `components/FactPricingGuard.tsx` | Replace `SAMPLE_DEFENSE_LOG` with data from DB |
| 3.6 | Add "Run Fact Check" button | `FactPricingGuard.tsx` | Manual trigger to check current AI responses against brand facts |

**NOTE:** This is a significant sub-feature. Can be deferred to v2.1 if needed.  

---

### Phase 4: Keyword Tracking Loop (IMPORTANT)
**Priority:** 🟡 P1  
**Effort:** 3-4 hours  
**Risk:** Low  
**Dependencies:** Phase 0 + Phase 1

| # | Task | File | Notes |
|---|------|------|-------|
| 4.1 | Add `last_results` and `last_checked_at` columns to `ai_visibility_keywords` | Migration SQL amendment | `ALTER TABLE ai_visibility_keywords ADD COLUMN last_results jsonb, ADD COLUMN last_checked_at timestamptz` |
| 4.2 | Display tracked keywords in dashboard | New component or tab in dashboard | Show list of tracked keywords with last check status |
| 4.3 | "Check Now" on individual keyword | Wire to `checkPlatformNow` or `runVisibilityCheck` | When user clicks, scan that keyword and update `last_results` |
| 4.4 | "Scan All Keywords" batch action | Wire to `batchVisibilityCheck` | Scan all tracked keywords at once |
| 4.5 | Update `last_results` and `last_checked_at` after scan | `actions/save-keyword.ts` or `run-scan.ts` | Upsert keyword row with latest results |

---

### Phase 5: Error Handling & Production Hardening (IMPORTANT)
**Priority:** 🟡 P1  
**Effort:** 4-6 hours  
**Risk:** Medium  
**Dependencies:** Phase 1

| # | Task | File | Notes |
|---|------|------|-------|
| 5.1 | Add DataForSEO API timeout handling | `services/dataforseo-visibility.service.ts` | Set Axios timeout (e.g., 15s), handle `ECONNABORTED` |
| 5.2 | Add partial failure handling | `runVisibilityScan()` | Currently `Promise.allSettled` handles individual failures — but scan still saves. Add per-platform error status |
| 5.3 | Add structured logging | All action files | Replace `console.error` with structured logger including `userId`, `action`, `error`, `duration` |
| 5.4 | Add DataForSEO cost tracking | `dataforseo-visibility.service.ts` | Log actual API costs per scan for billing reconciliation |
| 5.5 | Add error toast differentiation | `page.tsx` | Different messages for: insufficient credits, API timeout, rate limit, auth error |
| 5.6 | Verify CreditBanker refund atomicity | `@/lib/services/credit-banker.service.ts` | Ensure refunds happen even if the DB connection drops |
| 5.7 | Add scan cooldown per keyword | `actions/run-scan.ts` | Prevent duplicate scans for same keyword within 5 minutes |
| 5.8 | Add DataForSEO account balance check | Service layer | Optional: warn user if DataForSEO balance is low |

---

### Phase 6: UI Polish & Missing Integrations (NICE-TO-HAVE)
**Priority:** 🟢 P2  
**Effort:** 3-5 hours  
**Risk:** Low  
**Dependencies:** Phase 2

| # | Task | File | Notes |
|---|------|------|-------|
| 6.1 | Update `_INTEGRATION_GUIDE.ts` | `_INTEGRATION_GUIDE.ts` | Remove OpenRouter references, document DataForSEO-only architecture |
| 6.2 | Add scan history view | New component or tab | Show past scans with keyword, score, date — data already in `getScanHistory` action |
| 6.3 | Wire print/PDF report to real scan data | `utils/pdf-generator.ts` | Currently uses whatever's on-screen. Verify it works with real data |
| 6.4 | Add keyword auto-complete/suggestions | `AddKeywordModal.tsx` | Pull from search volume data or past scans |
| 6.5 | Export citations to CSV | Dashboard UI | New button to download citation data |
| 6.6 | Add platform icons to `public/assets/icons/ai-platforms/` | Public folder | Verify all 7 platform SVGs exist: `google-aio.svg`, `chatgpt.svg`, `perplexity.svg`, `searchgpt.svg`, `claude.svg`, `gemini.svg`, `apple-siri.svg` |
| 6.7 | Mobile responsiveness pass | All components | Dashboard is partially responsive but needs testing on small screens |

---

### Phase 7: Monitoring & Observability (NICE-TO-HAVE)
**Priority:** 🟢 P2  
**Effort:** 2-3 hours  
**Risk:** Low  

| # | Task | Notes |
|---|------|-------|
| 7.1 | Add DataForSEO API health check endpoint | Cron or manual check to verify API credentials are valid |
| 7.2 | Add usage dashboard (internal) | Track: API calls/day, credits consumed, error rates |
| 7.3 | Add alerting for API errors | Notify when DataForSEO returns sustained errors |
| 7.4 | Add scan analytics | Track which keywords users scan most, popular platforms |

---

## 4. What Can Be Tested in Isolation vs Full Integration

### Testable in Isolation (mock mode / unit tests):
- ✅ `transformLLMMentions()` — pure function, test with mock input
- ✅ `transformGoogleAIMode()` — pure function
- ✅ `detectBrandMention()` — pure function
- ✅ `detectSentiment()` — pure function
- ✅ `calculateVirtualPlatforms()` — pure function
- ✅ `generateCitationsFromScan()` — pure function
- ✅ All `utils/index.ts` functions — pure calculations
- ✅ All components — render with mock props
- ✅ Zod schema validation — test with invalid inputs
- ✅ Mock mode scan — full flow without API calls

### Requires Full Integration:
- 🔗 Real DataForSEO API calls — need credentials + costs money
- 🔗 DB writes (scans, citations, keywords, snapshots) — need migration applied
- 🔗 CreditBanker deduct/refund — needs `credit_ledger` table + user balance
- 🔗 Dashboard data loading — needs scan results in DB
- 🔗 RLS verification — needs authenticated Supabase user
- 🔗 End-to-end scan → display flow — needs all of the above

---

## 5. Risk Assessment Summary

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| DataForSEO API response shape mismatch | Medium | High — silent data loss | Phase 1 manual validation with real API |
| DataForSEO API rate limits hit | Low | Medium — failed scans | Add retry logic + cooldown per keyword |
| Migration breaks existing `ai_visibility_configs` FK | Low | High — table creation fails | Migration uses `IF NOT EXISTS` and references existing table |
| CreditBanker refund fails silently | Low | Medium — user loses credits | Add structured logging + manual refund path |
| LLM Mentions returns unexpected platform identifiers | Medium | Medium — platforms show as "hidden" | Log raw API responses, add fallback mapping |
| Concurrent scans from same user | Medium | Low — wasted credits | Add scan cooldown / dedup |
| DataForSEO account runs out of balance | Low | High — all scans fail | Add balance monitoring + alert |

---

## 6. Recommended Execution Order

```
Phase 0 (15 min)   → Apply migration SQL + verify tables
         ↓
Phase 1 (2-4 hrs)  → Validate DataForSEO API responses end-to-end
         ↓
Phase 2 (3-5 hrs)  → Fix dashboard data flow (credits, domain, refresh)
         ↓
Phase 4 (3-4 hrs)  → Keyword tracking loop (can parallel with Phase 2)
         ↓
Phase 5 (4-6 hrs)  → Error handling & production hardening
         ↓
Phase 3 (4-6 hrs)  → FactPricingGuard dynamic data (can be v2.1)
         ↓
Phase 6 (3-5 hrs)  → UI polish & integrations
         ↓
Phase 7 (2-3 hrs)  → Monitoring & observability
```

**Critical Path (MVP):** Phase 0 → Phase 1 → Phase 2 → Phase 5  
**Total Critical Path Effort:** ~12-20 hours  
**Total Full Roadmap Effort:** ~25-40 hours  

---

## 7. Files Inventory (Complete)

### Actions (7 files)
- `actions/index.ts` — barrel exports
- `actions/run-scan.ts` — full scan orchestration
- `actions/run-citation.ts` — single/batch platform checks
- `actions/save-config.ts` — config CRUD
- `actions/save-keyword.ts` — keyword CRUD
- `actions/get-dashboard-data.ts` — dashboard queries
- `actions/run-audit.ts` — tech audit
- `actions/run-tracker.ts` — tracker (Google AIO, rankings)

### Services (3 files + barrel)
- `services/index.ts` — barrel
- `services/dataforseo-visibility.service.ts` — core engine (794 lines)
- `services/audit.service.ts` — tech audit
- `services/tracker.service.ts` — ranking tracker

### Components (14 files + barrel)
- `components/index.ts` — barrel exports all 14
- `components/AIVisibilityDashboard.tsx` — main dashboard (765 lines)
- `components/CitationCard.tsx`
- `components/PlatformBreakdown.tsx`
- `components/VisibilityTrendChart.tsx`
- `components/QueryOpportunities.tsx`
- `components/FactPricingGuard.tsx` — ⚠️ static data
- `components/TechAuditWidget.tsx` — ⚠️ not wired to config
- `components/HowItWorksCard.tsx`
- `components/CompetitorComparison.tsx`
- `components/NetSentimentCard.tsx`
- `components/SetupConfigModal.tsx`
- `components/SetupWizard.tsx`
- `components/AddKeywordModal.tsx`
- `components/PlatformCheckButton.tsx`

### Data / Mocks (4 files)
- `data/index.ts` — barrel
- `data/mock-scan-results.ts` — static mock results
- `mocks/index.ts`
- `mocks/scan.mock.ts`

### Types / Constants / Utils
- `types/index.ts` (547 lines)
- `constants/index.tsx` (344 lines)
- `utils/index.ts` (356 lines)
- `utils/pdf-generator.ts` (176 lines)

### Other
- `index.ts` — client barrel
- `server.ts` — server barrel (re-exports services + actions)
- `_INTEGRATION_GUIDE.ts` — documentation (⚠️ stale OpenRouter references)
- `sql/ai_visibility_configs.sql` — existing config table migration

### Migration
- `supabase/migrations/20260209100000_ai_visibility_v2_tables.sql` — 4 new tables

---

## 8. Assumptions & Unknowns

### Assumptions
1. `ai_visibility_configs` table already exists in Supabase production (confirmed by working save-config action).
2. DataForSEO credentials are configured in environment variables.
3. CreditBanker service and `credit_ledger` table are functional.
4. `authAction` rate limiting is sufficient for now (confirmed existing in `@/lib/safe-action`).
5. Mock mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`) is currently active in development.

### Unknowns (Flagged)
1. **DataForSEO LLM Mentions `items[].source` values** — haven't verified if they're lowercase platform names as assumed.
2. **DataForSEO `ai_mode_response` sub-item structure** — assumed based on docs, not validated against production API.
3. **Supabase project plan limits** — unknown if current plan supports the added table/row volume.
4. **Credit system initial balance** — page hard-codes "500" but actual user balance is unknown.
5. **SearchGPT accuracy** — proxied from Perplexity, actual accuracy unknown.

---

*Plan generated by Planner Agent following AGENTS.md Phase 1-3 workflow.*

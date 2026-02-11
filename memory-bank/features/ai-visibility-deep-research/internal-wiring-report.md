# AI Visibility Feature — Internal Deep Research Report

**Date:** 2026-01-XX  
**Scope:** Every file in `src/features/ai-visibility/` + page routes + lib dependencies  
**Total files read:** 45 feature files + 2 page routes  

---

## 1. Executive Summary

AI Visibility is the **flagship feature** of CitaTed (BlogSpy). It lets brands track how they appear across 7 AI platforms: Google AIO, ChatGPT, Claude, Gemini, Perplexity, SearchGPT, and Apple Siri. The feature has a **well-designed UI layer** but a **partially-stubbed backend**. Key actions (`run-scan`, `save-config`, `save-keyword`, `get-dashboard-data`) return "V2 rebuild" stubs, meaning the dashboard currently **only shows demo/mock data** for non-audit flows.

### Status Verdict
| Layer | Status |
|---|---|
| **Types & Contracts** | ✅ Complete (441 lines, 30+ interfaces) |
| **UI Components** | ✅ Complete (13 components, responsive, polished) |
| **Services (Business Logic)** | ✅ Implemented (5 services, 2890+ lines) |
| **Server Actions (Wiring)** | ⚠️ Mixed — `run-audit`, `run-defense`, `run-citation`, `run-tracker` work via `authAction`; `run-scan`, `save-config`, `save-keyword`, `get-dashboard-data` are **STUBBED** |
| **Database** | ⚠️ SQL migration exists but no Prisma model for `ai_visibility_configs` |
| **Credits/Billing** | ❌ Hardcoded ("500 credits", "5 free credits") |
| **External APIs** | ✅ OpenRouter + DataForSEO integrated (with mock mode fallback) |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE ROUTE: /dashboard/ai-visibility                           │
│  (src/app/dashboard/ai-visibility/page.tsx — 420 lines)         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ AIVisibilityPage (Client Component)                       │  │
│  │  • Auth check via Supabase browser client                 │  │
│  │  • Guest mode / Demo mode / Live mode                     │  │
│  │  • Config management (CRUD via save-config action)        │  │
│  │  • Scan orchestration (via run-scan action)               │  │
│  │  • Keyword tracking (via save-keyword action)             │  │
│  │  • Dashboard data loading (via get-dashboard-data action) │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │ renders                                 │
│  ┌─────────────────────▼─────────────────────────────────────┐  │
│  │  AIVisibilityDashboard (765 lines)                        │  │
│  │  Main orchestrator component — all metrics computed here  │  │
│  │                                                           │  │
│  │  ┌─ Row 1 ──────────────────────────────────────────────┐ │  │
│  │  │ VisibilityScore(ring) │ SOV(ring) │ NetSentiment     │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌─ Row 2 ──────────────────────────────────────────────┐ │  │
│  │  │ Trust Score │ Hallucination │ Revenue Risk │ AI Ready │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌─ Charts ─────────────────────────────────────────────┐ │  │
│  │  │ VisibilityTrendChart │ HowItWorksCard ∥ PlatformBrkdn│ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  CompetitorComparison → FactPricingGuard → QueryOpps     │  │
│  │  TechAuditWidget → CitationCard list (with filters)      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. File-by-File Wiring Map

### 3.1 Entry Points

| File | Purpose | Imports From |
|---|---|---|
| `src/app/dashboard/ai-visibility/page.tsx` | **Main page** — auth, state, CRUD, scan, render | Components: `AIVisibilityDashboard`, `SetupWizard`, `AddKeywordModal`, `SetupConfigModal`. Actions: `runFullScan`, `addTrackedKeyword`, `saveVisibilityConfig`, `listVisibilityConfigs`, `getVisibilityDashboardData`. Types: `AIVisibilityConfig`, `AICitation`, `VisibilityTrendData`. Service type: `FullScanResult` |
| `src/app/dashboard/tracking/ai-visibility/page.tsx` | **Secondary route** (legacy?) | Only `AIVisibilityDashboard` |

### 3.2 Barrel Exports

| File | Role |
|---|---|
| `index.ts` | Client-safe exports: types, constants, utils, components |
| `server.ts` | Server-only: `"server-only"` → re-exports services + actions |
| `components/index.ts` | 13 component exports |
| `services/index.ts` | 5 service exports (citation, scan, defense, audit, tracker) |
| `actions/index.ts` | All action re-exports |

### 3.3 Types (`types/index.ts` — 441 lines)

Defines the **entire contract** for the feature:

| Type | Key Fields | Used By |
|---|---|---|
| `AIPlatform` | 7 union: `"google-aio" \| "chatgpt" \| "perplexity" \| "searchgpt" \| "claude" \| "gemini" \| "apple-siri"` | Everything |
| `CitationType` | 5 union: `"direct-quote" \| "recommendation" \| "paraphrase" \| "source-link" \| "reference"` | CitationCard, utils |
| `AICitation` | query, platform, position, context, citedUrl, sentiment, competitors, sources[] | Dashboard, CitationCard |
| `AIVisibilityConfig` | id, userId, projectName, trackedDomain, brandKeywords[], competitorDomains[] | Page, save-config, citation.service |
| `VisibilityCheckResult` | platform, isVisible, mentionType, aiResponse, creditsUsed, sentiment | citation.service, PlatformCheckButton |
| `TrustMetrics` | factAccuracy, hallucinationCount, aiReadinessScore | Dashboard row 2 |
| `NetSentiment` | positive, neutral, negative, score (-100 to +100) | NetSentimentCard |
| `CompetitorBenchmark` | domain, mentions, platforms, avgPosition, sentiment | CompetitorComparison |
| `DashboardMetrics` | Aggregates all the above | Dashboard |
| `TechAuditResult` | domain, robotsTxt[], llmsTxt{}, schema{}, overallScore | TechAuditWidget |
| `TrackedKeyword` | id, keyword, category, lastChecked, results{} | save-keyword |

### 3.4 Constants (`constants/index.tsx` — 344 lines)

| Constant | Content |
|---|---|
| `PlatformIcons` | 7 SVG icon components loaded from `/assets/icons/ai-platforms/` |
| `AI_PLATFORMS` | Config for each platform: `{ name, color, bgColor, marketShare, apiSource, isComingSoon?, isReadinessOnly? }`. SearchGPT = `isComingSoon: true`. Apple Siri = `isReadinessOnly: true` |
| `CITATION_TYPES` | 5 types with label, icon, impact score (100→60) |
| `SAMPLE_CITATIONS` | 9 demo AICitation entries used when `isDemoMode=true` |
| `VISIBILITY_TIERS` | 5 tiers: excellent(≥80), good(≥60), moderate(≥40), low(≥20), minimal(≥0) |
| `DATE_RANGE_OPTIONS` | 7d, 30d, 90d filter options |

### 3.5 Utils (`utils/index.ts` — 356 lines)

All pure computation functions, no API calls:

| Function | Input → Output | Notes |
|---|---|---|
| `generateCitations()` | config → AICitation[] | Generates demo citations, used for SAMPLE_CITATIONS |
| `calculateVisibilityStats()` | citations[] → stats | citationScore + positionScore + diversityScore = 0-100 |
| `getPlatformStats()` | citations[] → PlatformStats[] | Groups by platform, calculates trend |
| `generateTrendData()` | citations[] → VisibilityTrendData[] | **DETERMINISTIC seed** (not random), produces 7 days |
| `analyzeQueries()` | citations[] → QueryAnalysis[] | Top queries with position/frequency |
| `calculateShareOfVoice()` | citations[] → number | yourMentions/totalMentions × 100 |
| `calculateNetSentiment()` | citations[] → NetSentiment | (positive-negative)/total × 100 |
| `calculateCompetitorBenchmarks()` | citations[] → CompetitorBenchmark[] | Top 5 competitors from citation data |
| `calculateDashboardMetrics()` | citations[] → DashboardMetrics | Orchestrator of all above |
| `calculateTrustMetrics()` | scanResult? → TrustMetrics | **⚠️ HARDCODED demo values** when no scanResult: accuracy=85, hallucinations=1, readiness=68 |
| `formatRelativeTime()` | timestamp → "X ago" string | Used by CitationCard |
| `formatNumber()` | number → compact string | "1.2K" format |
| `getVisibilityTier()` | score → tier label | Maps score to tier name |
| `getCitationTypeConfig()` | type → config | Icon, label, score |

---

## 4. Services (Business Logic)

### 4.1 `citation.service.ts` (732 lines) — **Core Citation Engine**

**Purpose:** Query AI platforms for a keyword and detect if a brand is mentioned.

**Flow:**
```
User enters keyword → checkCitationOnPlatform() per platform → 
  Platform is OpenRouter? → queryOpenRouterPlatform(model, query)
  Platform is Google AIO? → queryGoogleAIO(query) via DataForSEO
  Platform is Siri/SearchGPT? → return placeholder
→ detectBrandMention(response, brandKeywords, domain) →
→ analyzeSentiment(response, brand) →
→ detectCompetitors(response, competitorDomains) →
→ Return VisibilityCheckResult
```

**Key mappings:**
| Platform | Model Used | Source |
|---|---|---|
| ChatGPT | `openai/gpt-4o-mini` | OpenRouter |
| Claude | `anthropic/claude-3-haiku` | OpenRouter |
| Perplexity | `perplexity/sonar` | OpenRouter |
| Gemini | `google/gemini-flash-1.5` | OpenRouter |
| Google AIO | DataForSEO SERP API (no AI model) | DataForSEO |
| SearchGPT | N/A — "coming soon" | - |
| Apple Siri | N/A — "readiness only" | - |

**Exports:** `checkCitationOnPlatform()`, `runFullVisibilityCheck()`, `quickPlatformCheck()`

**⚠️ Issue:** Uses `PLATFORM_MODEL_MAP` (its own model map), different from scan.service's map and defense.service's map. Three separate model constant definitions exist in the codebase.

### 4.2 `scan.service.ts` (642 lines) — **Full 7-Platform Scan Orchestrator**

**Purpose:** Run a complete scan across all 7 platforms for a single keyword.

**Flow:**
```
ScanService(brandName, brandDomain)
  .runFullScan(keyword, techAudit)
    → [Mock mode] → return createMockScanResult()
    → [Real mode] → Promise.allSettled([
        fetchGoogleData(keyword),     // DataForSEO Axios client
        fetchAIResponse("chatgpt"),   // OpenRouter
        fetchAIResponse("claude"),    // OpenRouter
        fetchAIResponse("gemini"),    // OpenRouter
        fetchAIResponse("perplexity") // OpenRouter
      ])
    → calculateVirtualPlatforms(google, chatgpt, perplexity, techAudit)
      → SearchGPT = copy Perplexity result
      → Siri = weighted score (Google rank 40pts + ChatGPT visibility 30pts + Applebot access 30pts)
    → Overall score = visiblePlatforms / 7 × 100
```

**⚠️ Issue:** `fetchGoogleData()` uses `getDataForSEOClient()` (shared Axios), but `fetchAIResponse()` uses `getOpenRouter()` (shared OpenAI SDK) — **good**. However, tracker.service uses raw `fetch()` for the same DataForSEO API — inconsistent.

### 4.3 `defense.service.ts` (427 lines) — **Hallucination Detector**

**Purpose:** Ask AI about your brand, compare response to known facts, detect inaccuracies.

**Flow:**
```
DefenseService(apiKey, brandName, brandFacts)
  .runDefenseCheck()
    → [Mock mode] → return mock results
    → [Real mode] → parallel checkPlatform() × 4 (chatgpt, claude, gemini, perplexity)
      → queryModel(model, prompt) — raw fetch() to OpenRouter
      → detectHallucinations(response, platform)
        → Check pricing accuracy
        → Check company description accuracy  
        → Check feature list completeness
      → Return {visibility, hallucinations[]}
```

**⚠️ Issues:**
1. **Separate `OPENROUTER_MODELS` constant** — hardcoded model IDs, not using shared `MODELS` from `src/lib/ai/openrouter.ts`
2. **Raw `fetch()`** to OpenRouter instead of shared OpenAI SDK client
3. **Sentiment analysis** is keyword-based (count positive/negative words in 100-char window) — not AI-powered

### 4.4 `audit.service.ts` (606 lines) — **AI Technical Readiness Auditor**

**Purpose:** Check if a website is optimized for AI crawlers.

**Flow:**
```
AuditService(domain)
  .runFullAudit()
    → [Mock mode] → return generateMockAuditResult()
    → [Real mode] → Promise.all([
        checkRobotsTxt(),    // Fetch robots.txt, parse with robots-parser
        checkLlmsTxt(),      // HEAD then GET /llms.txt and /.well-known/llms.txt
        checkSchemaOrg()     // Fetch homepage HTML, parse JSON-LD with cheerio
      ])
    → calculateReadinessScore()
      → robots.txt = 50pts (weighted per bot: GPTBot=12, Claude=10, Applebot=10, Perplexity=8, Google-Extended=6, CCBot=4)
      → llms.txt = 15pts (exists = full points)
      → Schema.org = 35pts (has any=10 + important types × 5, max 25)
```

**6 AI bots checked:** GPTBot, ClaudeBot, Applebot, CCBot, PerplexityBot, Google-Extended

**11 important Schema.org types:** Organization, Product, SoftwareApplication, WebSite, FAQPage, HowTo, Article, Review, Service, LocalBusiness, Person

**This is the ONLY fully working real-API action** (no V2 stub). The page's TechAuditWidget → `runTechAudit` action → `createAuditService()` → live audit.

### 4.5 `tracker.service.ts` (471 lines) — **Google Rankings & AIO Tracker**

**Purpose:** Track Google rankings and AI Overview presence via DataForSEO.

**Flow:**
```
TrackerService(credentials, brandDomain)
  .search(query)           → POST DataForSEO SERP API (raw fetch, NOT Axios)
  .checkGoogleAIO(query)   → Check answer_box, knowledge_graph, ai_overview
  .getRanking(query)       → Find domain in organic results
  .checkCitations(queries) → Batch check AIO + ranking
  .calculateSiriReadiness(query, applebotAllowed)
    → Google rank ≤1 = 70pts, ≤3 = 50pts, ≤5 = 30pts, ≤10 = 10pts
    → Applebot = 30pts
    → Score ≥70 = "ready", ≥40 = "at-risk", else "not-ready"
```

**⚠️ Issue:** Uses raw `fetch()` to DataForSEO instead of shared Axios client — wiring inconsistency with scan.service.

---

## 5. Server Actions Wiring

### 5.1 LIVE Actions (functional with `authAction` + Zod)

| Action File | Exports | Wires To |
|---|---|---|
| `run-audit.ts` (259 lines) | `runTechAudit` | → `AuditService.runFullAudit()` |
| `run-defense.ts` | `runDefenseCheck`, `checkPlatformVisibility`, `batchCheckVisibility` | → `DefenseService` |
| `run-citation.ts` (209 lines) | `runVisibilityCheck`, `checkPlatformNow`, `batchKeywordCheck` | → `citation.service` functions |
| `run-tracker.ts` (151 lines) | `checkGoogleAIO`, `getRanking`, `getRankings`, `checkCitations`, `checkSiriReadiness` | → `TrackerService` |

### 5.2 STUBBED Actions (return "V2 rebuild" errors)

| Action File | Exports | Status |
|---|---|---|
| `run-scan.ts` | `runFullScan`, `getScanHistory`, `getKeywordScanResult`, `getCreditBalance` | 🔴 **ALL STUBBED** — returns `"This feature is being rebuilt in V2"` |
| `save-config.ts` | `saveVisibilityConfig`, `getVisibilityConfig`, `listVisibilityConfigs`, `deleteVisibilityConfig` | 🔴 **ALL STUBBED** — no Supabase CRUD wiring |
| `save-keyword.ts` | `addTrackedKeyword`, `getTrackedKeywords`, `deleteTrackedKeyword` | 🔴 **ALL STUBBED** |
| `get-dashboard-data.ts` | `getVisibilityDashboardData` | 🔴 **STUBBED** — returns empty `{ citations: [], trendData: [] }` |

### 5.3 Impact of Stubs

Because `save-config`, `save-keyword`, and `get-dashboard-data` are stubbed:
- **Logged-in users** get no configs → page opens config modal → saving fails → stuck in demo mode
- **Dashboard always shows demo data** (SAMPLE_CITATIONS from constants)
- **Scans complete** but results aren't persisted 
- **Credits system** doesn't exist — "500 credits" is hardcoded text

---

## 6. Components Deep Dive

### 6.1 Core Layout Components

| Component | Lines | Input Props | Purpose |
|---|---|---|---|
| `AIVisibilityDashboard` | 765 | citations, isDemoMode, onScan, isScanning, lastScanResult, configs, selectedConfigId, reportDomain, trendData + 6 callbacks | **Master orchestrator** — domain switcher, keyword scan input, all metric cards, charts, filters, citation list |
| `NetSentimentCard` | 219 | `{ sentiment: NetSentiment }` | Recharts PieChart donut with 3 segments, animated active shape on hover, center score, bottom legend |
| `CompetitorComparison` | 496 | competitors[], yourBrand metrics, isDemoMode | Pure CSS grouped vertical bars (3 bars per competitor), detail table row expansion |
| `VisibilityTrendChart` | 210 | `VisibilityTrendData[]` | Recharts stacked AreaChart, 6 areas (Google AIO, ChatGPT, Perplexity, Claude, Gemini, Apple Siri), gradient fills |
| `PlatformBreakdown` | 220 | `PlatformStats[]`, onScan, isScanning | Platform list with progress bars, "Run Full Scan (⚡5)" button |
| `CitationCard` | 242 | `AICitation`, isDemoMode | Individual citation display with platform icon, sentiment dot, action menu (Verify/Flag/Fix Schema) |

### 6.2 Widget/Feature Components

| Component | Lines | Purpose |
|---|---|---|
| `TechAuditWidget` | 483 | **Standalone widget** — domain input, triggers `runTechAudit` action, shows results (robots.txt bots, llms.txt, Schema.org), score badge. **FULLY FUNCTIONAL** |
| `QueryOpportunities` | 300+ | Keyword tracking list — each keyword shows position, frequency, platforms, intent badge (buying/learning), "Optimize" button → routes to AI Writer (if `FEATURE_FLAGS.AI_WRITER` is true) |
| `FactPricingGuard` | 200 | **⚠️ HARDCODED SAMPLE_DEFENSE_LOG** — not wired to DefenseService. Shows static hallucination log entries |
| `HowItWorksCard` | 200 | Dismissible info card explaining credit costs (Track Keyword=1, Full Scan=5, Tech Audit=FREE, Verify Fact=1). Uses localStorage for dismiss state |

### 6.3 Modal Components

| Component | Lines | Purpose |
|---|---|---|
| `SetupWizard` | 300 | First-time setup form — domain + brand name, 3 feature preview cards, trust badge |
| `SetupConfigModal` | 393 | Full config modal — project name, domain, brand keywords (tag input), competitor domains (tag input) |
| `AddKeywordModal` | 236 | Keyword input + category selection (Product/Comparison/How-to/Review/Feature/Other) + suggestions |
| `PlatformCheckButton` | 180 | "Check Now" button → calls `checkPlatformNow` action → shows ✅/❌ result |

---

## 7. Data Flow Diagram

```
┌──────────────── USER ACTION ─────────────────────────────────────┐
│                                                                   │
│  A. FIRST VISIT (Guest)                                          │
│  Page → checkAuth() → isGuest=true → isDemoMode=true             │
│  → Shows DemoBanner + AIVisibilityDashboard(isDemoMode=true)     │
│  → All metrics calculated from SAMPLE_CITATIONS (demo data)      │
│  → Guest gate on: Scan, Track, Verify, Setup                     │
│  → "Sign Up" → /login?redirectTo=/dashboard/ai-visibility        │
│                                                                   │
│  B. LOGGED-IN USER (No Config)                                   │
│  Page → checkAuth() → user found → refreshConfigs()              │
│  → listVisibilityConfigs() → 🔴 STUBBED returns [] → open modal │
│  → saveVisibilityConfig() → 🔴 STUBBED → error toast            │
│  → Stuck in demo mode (can't save config)                        │
│                                                                   │
│  C. TECH AUDIT (Works fully)                                     │
│  TechAuditWidget → user enters domain → handleAudit()            │
│  → runTechAudit(server action) → AuditService.runFullAudit()     │
│  → Real HTTP: fetch robots.txt + llms.txt + homepage HTML        │
│  → Parse: robots-parser + cheerio                                │
│  → Calculate readiness score (0-100)                             │
│  → Display: BotAccessRow × 6, LlmsTxtSection, SchemaSection     │
│                                                                   │
│  D. KEYWORD SCAN (Partially works)                               │
│  User enters keyword → handleScan()                              │
│  → runFullScan(action) → 🔴 STUBBED → returns error             │
│  → BUT run-citation and run-defense actions ARE wired            │
│  → PlatformCheckButton → checkPlatformNow() → WORKS (via        │
│    citation.service → OpenRouter API call → brand detection)     │
│                                                                   │
│  E. DASHBOARD DATA                                               │
│  useEffect on selectedConfigId → getVisibilityDashboardData()    │
│  → 🔴 STUBBED → returns { citations: [], trendData: [] }        │
│  → Dashboard falls back to demo data                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. External API Dependencies

### 8.1 OpenRouter (`src/lib/ai/openrouter.ts`)
- **SDK:** OpenAI SDK with `baseURL: "https://openrouter.ai/api/v1"`
- **Auth:** `OPENROUTER_API_KEY` env var
- **Models defined (shared constants):**
  - `GPT4O_MINI` = `"openai/gpt-4o-mini"` ← ⚠️ **DEPRECATED Feb 2026**
  - `GPT4O` = `"openai/gpt-4o"` ← ⚠️ **DEPRECATED Feb 2026**
  - `CLAUDE_3_HAIKU/SONNET/OPUS`
  - `GEMINI_FLASH/PRO` (1.5 versions)
  - `PERPLEXITY_SONAR`
  - `LLAMA_3_8B/70B`
- **Used by:** `citation.service` (via shared SDK), `scan.service` (via shared SDK)
- **NOT used by:** `defense.service` (uses raw fetch with its own model IDs)

### 8.2 DataForSEO
- **Endpoint:** `POST /serp/google/organic/live/advanced`
- **Auth:** Basic auth from `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` env vars
- **Location:** `location_code: 2840` (US)
- **Used by:**
  - `scan.service` → via shared Axios client (`getDataForSEOClient()`)
  - `citation.service` → via raw `fetch()` in `queryGoogleAIO()`
  - `tracker.service` → via raw `fetch()` with manual auth header
- **⚠️ Three different HTTP client approaches for same API**

### 8.3 Supabase
- **Client-side:** `createBrowserClient()` for auth check only
- **Server-side:** No direct Supabase calls in feature (save-config is stubbed)
- **SQL migration:** `sql/ai_visibility_configs.sql` exists with RLS policies

---

## 9. Mock/Demo System

The feature has a **two-layer mock system:**

### Layer 1: Demo Mode (UI-only)
- `isDemoMode=true` in page state when guest or no config
- Dashboard falls back to `SAMPLE_CITATIONS` (9 entries from constants)
- Hardcoded demo values: SOV=42, netSentiment={5,3,1,score:44}, 5 demo competitors
- Trust metrics: accuracy=85%, hallucinations=1, readiness=68

### Layer 2: Mock API Mode (Service-level)
- `NEXT_PUBLIC_USE_MOCK_DATA=true` env var
- Every service checks `isMockMode()` before API calls
- Returns static mock results with simulated delays:
  - `data/mock-scan-results.ts` — complete FullScanResult (6/7 visible, score 86%)
  - `mocks/scan.mock.ts` — randomized mock generators for each platform

---

## 10. Critical Wiring Issues

### 🔴 HIGH — Stubbed Backend
1. **`run-scan.ts`** — `runFullScan()` returns stub. The `ScanService` is fully implemented but the action doesn't call it.
2. **`save-config.ts`** — All CRUD operations stubbed. No Supabase integration despite SQL migration existing.
3. **`save-keyword.ts`** — Keyword tracking stubbed. No persistence.
4. **`get-dashboard-data.ts`** — Dashboard data stubbed. Returns empty arrays.

### 🟡 MEDIUM — Inconsistent Wiring
5. **3 separate model ID definitions:** citation.service (`PLATFORM_MODEL_MAP`), defense.service (`OPENROUTER_MODELS`), openrouter.ts (`MODELS`) — should be unified.
6. **3 different DataForSEO HTTP approaches:** Axios client (scan), raw fetch (citation + tracker) — should use shared client.
7. **Defense.service uses raw fetch()** to OpenRouter instead of shared SDK — bypasses request interceptors/error handling.
8. **FactPricingGuard uses `SAMPLE_DEFENSE_LOG`** — hardcoded 4 entries, not wired to defense.service at all.

### 🟡 MEDIUM — Hardcoded Values
9. **Credits display: "500"** hardcoded in dashboard header.
10. **"5 Free Credits"** hardcoded in setup/login modals.
11. **`calculateTrustMetrics()`** returns hardcoded values when no scan result.
12. **`generateTrendData()`** uses deterministic seed — not real historical data.

### 🟢 LOW — Polish Issues
13. **CompetitorComparison** calculates bar widths with inline pixel math — should use CSS grid.
14. **QueryOpportunities "Optimize" button** routes to AI Writer which is behind `FEATURE_FLAGS.AI_WRITER`.
15. **SearchGPT** is marked `isComingSoon` — OpenAI SearchGPT has been available since 2025.
16. **Model IDs** are all Dec 2024-era — GPT-4o-mini/GPT-4o deprecated Feb 2026.

---

## 11. What Actually Works Right Now

| Feature | Status | Notes |
|---|---|---|
| **View demo dashboard** | ✅ Works | Shows 9 sample citations with all metrics |
| **Guest gating** | ✅ Works | Requires login for any real action |
| **Tech Audit** | ✅ **Fully works with live APIs** | robots.txt + llms.txt + Schema.org check |
| **Single platform check** | ✅ Works via PlatformCheckButton | `checkPlatformNow()` → citation.service → OpenRouter |
| **Full visibility check** | ✅ Service works, action works | `runVisibilityCheck()` using authAction |
| **Defense check** | ✅ Service works, action works | `runDefenseCheck()` — but NOT wired to UI (FactPricingGuard is static) |
| **Tracker (Rankings/AIO)** | ✅ Service works, action works | All 5 tracker actions functional |
| **Full scan** | ❌ Action stubbed | Service exists but action returns "V2" error |
| **Save config/keyword** | ❌ Action stubbed | No Supabase persistence |
| **Dashboard data** | ❌ Action stubbed | No real data loading |
| **Credits system** | ❌ Not implemented | All display is hardcoded |
| **PDF Export** | ⚠️ Partial | Uses `window.print()` with `beforeprint` event |

---

## 12. Database Schema

**SQL file exists at:** `sql/ai_visibility_configs.sql`

```sql
-- Adds project_name column
-- Drops single-config-per-user constraints (allows multiple projects)
-- Enables RLS with 4 policies: select/insert/update/delete own
```

**No Prisma model found** — the `ai_visibility_configs` table is likely created via direct SQL/Supabase migration but not in Prisma schema.

---

## 13. Recommended V2 Activation Sequence

To bring this feature from demo-only to production:

1. **Add `ai_visibility_configs` to Prisma schema** + generate client
2. **Wire `save-config.ts`** — CRUD operations using Prisma
3. **Wire `save-keyword.ts`** — keyword persistence
4. **Wire `run-scan.ts`** — connect to `ScanService.runFullScan()`
5. **Wire `get-dashboard-data.ts`** — query citations/trends from DB
6. **Unify model constants** — single source of truth in `openrouter.ts`
7. **Unify DataForSEO client** — shared Axios client everywhere
8. **Wire FactPricingGuard** → defense.service (replace `SAMPLE_DEFENSE_LOG`)
9. **Implement credits system** — deduct on scan, display real balance
10. **Update model IDs** — replace deprecated GPT-4o-mini/GPT-4o

---

*End of Internal Deep Research Report*

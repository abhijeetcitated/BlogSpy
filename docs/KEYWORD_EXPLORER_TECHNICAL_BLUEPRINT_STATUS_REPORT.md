# Keyword Explorer (Keyword Research / Keyword Magic) — Technical Implementation Blueprint & Status Report

> Role: Senior Chief Technology Officer (CTO) + Lead Architect for BlogSpy.
>
> Objective: “Single Source of Truth” blueprint to connect current frontend (`src/features/keyword-research/**`) to backend (Supabase + DataForSEO) with controlled costs and explicit caching/credits rules.
>
> Language: Hindi narrative, code identifiers/files in English.

---

## 1) Project Structure (The Anatomy)

### 1.1 Canonical Feature Entry Points

| Route | Page Component | Feature Root | Notes | Evidence |
|---|---|---|---|---|
| `/dashboard/research/keyword-magic` | `KeywordResearchPage` | `KeywordResearchContent` | Dashboard entry | [`app/dashboard/research/keyword-magic/page.tsx`](app/dashboard/research/keyword-magic/page.tsx:1) + [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:74) |
| `/keyword-magic` | `KeywordResearchDemoPage` | `KeywordResearchContent` | Demo entry | [`app/keyword-magic/page.tsx`](app/keyword-magic/page.tsx:1) |

**Proxy gating risk note:** demo allow-list includes `/keyword-magic`. Evidence: `DEMO_ROUTES` in [`proxy.ts`](proxy.ts:79). और `isDemoMode = true` hardcoded block auth bypass कर सकता है. Evidence: [`proxy.ts`](proxy.ts:182).

### 1.2 File Tree (A–Z complete) + Integration Tagging

Legend:
- **[UI]** = purely UI/presentation (no backend wiring expected)
- **[INTEGRATE]** = needs backend integration (DataForSEO/Supabase/credits/cache)
- **[MIXED]** = UI + calls actions/services
- **[SERVER]** = `server-only` / server-side services

> Source of truth tree: exact recursive listing of `src/features/keyword-research/**`.

```
src/features/keyword-research/
  index.ts                         [MIXED]
  keyword-research-content.tsx      [MIXED]
  README.md                         [UI]
  __mocks__/                         
    index.ts                        [UI]
    keyword-data.ts                 [UI]
  actions/                           
    fetch-drawer-data.ts            [INTEGRATE]
    fetch-keywords.ts               [INTEGRATE]
    index.ts                        [MIXED]
    refresh-keyword.ts              [INTEGRATE]
    refresh-row.ts                  [INTEGRATE]
  components/
    index.ts                        [UI]
    drawers/
      CommerceTab.tsx               [MIXED]
      index.ts                      [UI]
      KeywordDetailsDrawer.tsx      [MIXED]
      KeywordDrawer.tsx             [MIXED]
      OverviewTab.tsx               [MIXED]
      RtvBreakdownWidget.tsx        [UI]
      RtvFormulaDialog.tsx          [UI]
      RtvWidget.tsx                 [UI]
      SocialTab.tsx                 [MIXED]
      YouTubeStrategyPanel.tsx      [UI]
      widgets/
        RtvBreakdown.tsx            [UI]
        RtvFormulaButton.tsx        [UI]
    filters/
      FilterBar.tsx                 [MIXED]
      index.ts                      [UI]
      cpc/
        cpc-filter.tsx              [MIXED]
        index.ts                    [UI]
      geo/
        geo-filter.tsx              [MIXED]
        index.ts                    [UI]
      include-exclude/
        include-exclude-filter.tsx  [MIXED]
        index.ts                    [UI]
      intent/
        index.ts                    [UI]
        intent-filter.tsx           [MIXED]
      kd/
        index.ts                    [UI]
        kd-filter.tsx               [MIXED]
      match-type/
        index.ts                    [UI]
        match-type-toggle.tsx       [MIXED]
      serp/
        index.ts                    [UI]
        serp-filter.tsx             [MIXED]
      trend/
        index.ts                    [UI]
        trend-filter.tsx            [MIXED]
      volume/
        index.ts                    [UI]
        volume-filter.tsx           [MIXED]
      weak-spot/
        index.ts                    [UI]
        weak-spot-filter.tsx        [MIXED]
    header/
      country-selector.tsx          [MIXED]
      CreditBalance.tsx             [MIXED]
      index.ts                      [UI]
      page-header.tsx               [UI]
      results-header.tsx            [MIXED]
    modals/
      export-modal.tsx              [MIXED]
      filter-presets-modal.tsx      [MIXED]
      index.ts                      [UI]
      keyword-details-modal.tsx     [UI]
    page-sections/
      index.ts                      [UI]
      KeywordResearchFilters.tsx    [MIXED]
      KeywordResearchHeader.tsx     [MIXED]
      KeywordResearchResults.tsx    [MIXED]
      KeywordResearchSearch.tsx     [MIXED]
    search/
      bulk-keywords-input.tsx       [MIXED]
      bulk-mode-toggle.tsx          [MIXED]
      index.ts                      [UI]
      search-input.tsx              [MIXED]
      search-suggestions.tsx        [INTEGRATE]
    shared/
      empty-states.tsx              [UI]
      error-boundary.tsx            [UI]
      index.tsx                     [UI]
      loading-skeleton.tsx          [UI]
    table/
      index.ts                      [MIXED]
      KeywordDataTable.tsx          [MIXED]
      KeywordTable.tsx              [MIXED]
      KeywordTableFooter.tsx        [MIXED]
      KeywordTableHeader.tsx        [UI]
      KeywordTableRow.tsx           [MIXED]
      action-bar/
        action-bar.tsx              [MIXED]
        bulk-actions.tsx            [INTEGRATE]
        index.ts                    [UI]
        selection-info.tsx          [UI]
      columns/
        columns.tsx                 [MIXED]
        index.ts                    [UI]
        actions/
          actions-column.tsx        [INTEGRATE]
          index.ts                  [UI]
        checkbox/
          checkbox-column.tsx       [UI]
          index.ts                  [UI]
        cpc/
          cpc-column.tsx            [UI]
          index.ts                  [UI]
        geo/
          geo-column.tsx            [UI]
          index.ts                  [UI]
        intent/
          index.ts                  [UI]
          intent-column.tsx         [UI]
        kd/
          index.ts                  [UI]
          kd-column.tsx             [UI]
        keyword/
          index.ts                  [UI]
          keyword-column.tsx        [MIXED]
        refresh/
          index.ts                  [UI]
          refresh-column.tsx        [INTEGRATE]
          RefreshCell.tsx           [INTEGRATE]
          RefreshCreditsHeader.tsx  [MIXED]
        serp/
          index.ts                  [UI]
          serp-column.tsx           [UI]
        trend/
          index.ts                  [UI]
          trend-column.tsx          [UI]
        volume/
          index.ts                  [UI]
          volume-column.tsx         [UI]
        weak-spot/
          index.ts                  [UI]
          weak-spot-column.tsx      [UI]
  config/
    api-config.ts                   [INTEGRATE]
    feature-config.ts               [INTEGRATE]
    index.ts                        [MIXED]
  constants/
    index.ts                        [UI]
    table-config.ts                 [UI]
  data/
    index.ts                        [UI]
    mock-keywords.ts                [UI]
  hooks/
    index.ts                        [UI]
  providers/
    index.ts                        [MIXED]
  services/
    api-base.ts                     [SERVER]
    bulk-analysis.service.ts        [SERVER]
    export.service.ts               [SERVER]
    index.ts                        [SERVER]
    keyword-discovery.ts            [SERVER]
    keyword.service.ts              [SERVER]
    live-serp.ts                    [SERVER]
    mock-utils.ts                   [SERVER]
    social.service.ts               [SERVER]
    suggestions.service.ts          [SERVER]
  store/
    index.ts                        [MIXED]
  types/
    api.types.ts                    [MIXED]
    index.ts                        [MIXED]
  utils/
    data-mapper.ts                  [MIXED]
    export-utils.ts                 [MIXED]
    filter-utils.ts                 [MIXED]
    geo-calculator.ts               [BRAIN]
    index.ts                        [MIXED]
    mock-helpers.ts                 [UI]
    rtv-calculator.ts               [BRAIN]
    serp-parser.ts                  [BRAIN]
    sort-utils.ts                   [MIXED]
    youtube-intelligence.ts         [BRAIN]
```

Evidence that these barrels exist and represent the intended module boundaries:
- [`src/features/keyword-research/components/index.ts`](src/features/keyword-research/components/index.ts:1)
- [`src/features/keyword-research/actions/index.ts`](src/features/keyword-research/actions/index.ts:1)
- [`src/features/keyword-research/services/index.ts`](src/features/keyword-research/services/index.ts:1)
- [`src/features/keyword-research/utils/index.ts`](src/features/keyword-research/utils/index.ts:1)
- [`src/features/keyword-research/config/index.ts`](src/features/keyword-research/config/index.ts:1)

### 1.3 Where new “Logic Utility Files” should live

Decision: `src/features/keyword-research/utils/` is the correct home for algorithmic/score utilities (already has `youtube-intelligence.ts`, `rtv-calculator.ts`, `serp-parser.ts`). Evidence: utilities barrel exports YouTube intelligence and filter/sort/export. [`utils/index.ts`](src/features/keyword-research/utils/index.ts:1).

Proposed new files (to implement specs below, no duplication):
- [`src/features/keyword-research/utils/reddit-scoring.ts`](src/features/keyword-research/utils/reddit-scoring.ts:1) — Reddit Heat Index + Parasite Score utilities (new).
- [`src/features/keyword-research/utils/weak-spot-detector.ts`](src/features/keyword-research/utils/weak-spot-detector.ts:1) — unify “Labs vs Live SERP” weak spot detection (new).
- [`src/features/keyword-research/utils/youtube-virality.ts`](src/features/keyword-research/utils/youtube-virality.ts:1) — YouTube Viral Score + FGI helpers (new) OR fold into existing [`youtube-intelligence.ts`](src/features/keyword-research/utils/youtube-intelligence.ts:1) (preferred to avoid fragmentation).

---

## 2) The “Money Logic” & Algorithms (The Brain)

> This section uses ONLY your provided specs (no hallucinated formulas). Existing code may differ; where so, mark as “needs alignment”.

### 2.1 YouTube Viral Score

**Spec (authoritative):**
- ViralScore = `(Views / Subs)`
- Viral threshold: `> 5x` → Viral

Implementation target:
- Input: `views: number`, `subs: number` (subs=0 guard)
- Output: `{ score: number, isViral: boolean }`

Existing code note:
- Current YouTube Intelligence has `VIRAL_THRESHOLD` and badges pipeline. Evidence: exports show `VIRAL_THRESHOLD` and analysis functions in [`utils/index.ts`](src/features/keyword-research/utils/index.ts:46). Exact formula inside current [`youtube-intelligence.ts`](src/features/keyword-research/utils/youtube-intelligence.ts:1) must be aligned to this spec.

### 2.2 YouTube FGI (Freshness Gap Index)

**Spec (authoritative):**
- FGI = `% of videos > 2 years old`

Implementation target:
- Requires each video publish date or age days.
- `FGI = outdatedCount / totalCount` (percentage).

Existing code note:
- Current engine exports `OUTDATED_DAYS`. Evidence: [`utils/index.ts`](src/features/keyword-research/utils/index.ts:49). Needs alignment to “2 years” exactly.

### 2.3 Reddit Heat Index

**Spec (authoritative):**
- HeatIndex = `Comments / (Days Since Posted + 1)`
- Hot threshold: `> 2.0` → Hot

Implementation target:
- Input: `comments: number`, `postedAt: Date`
- Output: `{ heat: number, isHot: boolean }`

### 2.4 Parasite Score

**Spec (authoritative):**
- Parasite score ranks potential based on Google Rank + Thread Velocity

Implementation target:
- Inputs: `googleRank: number` (lower better), `velocity: number` (Reddit Heat Index or thread velocity)
- Output: numeric score with monotonic behavior:
  - better rank + higher velocity → higher parasite score

**UNKNOWN (not found in repo):** exact parasite score normalization, weightings, and caps.

### 2.5 Weak Spot Detection

**Spec (authoritative):**
- Detect Forums in Top 10 results from DataForSEO Labs vs SERP data.

Implementation target:
- Labs payload: “Labs API” top results for keyword+country
- Live SERP payload: “Google Organic SERP (Live)” results
- Output: `weakSpots` compatible with existing domain type. Evidence: `WeakSpots` type exists in [`types/index.ts`](src/features/keyword-research/types/index.ts:24).

Existing code note:
- Current weak spot detection logic exists in SERP parser util. Evidence: [`detectWeakSpots()`](src/features/keyword-research/utils/serp-parser.ts:187).
- Needs extension for “Labs vs Live SERP” dual-source comparison.

---

## 3) API & Data Strategy (The Engine)

### 3.1 Profit-Margin Rules (authoritative)

- **Initial Table Loading:** MUST use **DataForSEO Labs API** (bulk fetch).
- **Refresh Button:** MUST use **Google Organic SERP API (Live)** with cost target `$0.002` per refresh.
- **Social Deep Dive:** Triggered only on “Unlock”. Uses `site:reddit.com` and `youtube_live` endpoints.
- **Caching / retention:**
  - Volume/CPC (Labs): **30 days**
  - SERP/Rankings (Weak Spot): **7 days**
  - Social Viral Metrics: **3 days**

### 3.2 Where this maps in current code

- Initial fetch action exists: [`fetchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:1) (internals must be wired to Labs).
- Refresh orchestration exists: [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:225) (must call Live SERP API).
- Social deep dive action exists: [`fetchSocialInsights`](src/features/keyword-research/actions/fetch-drawer-data.ts:201) (must be behind “Unlock” + 1 credit).
- Services layer is server-only; this is the correct place for DataForSEO HTTP client and endpoint mapping. Evidence: `import "server-only"` in [`services/index.ts`](src/features/keyword-research/services/index.ts:7).

### 3.3 Required backend API shape (Next.js Route Handlers)

> This blueprint recommends adding **server route handlers** under `app/api/keyword-explorer/**` which call DataForSEO and persist to Supabase.

Proposed endpoints:
- `POST /api/keyword-explorer/labs/bulk`
  - body: `{ keywords: string[], country: string }`
  - returns: `{ rows: KeywordRow[] }`
  - caching: 30 days (Volume/CPC)
- `POST /api/keyword-explorer/serp/refresh`
  - body: `{ keyword: string, country: string }`
  - returns: `{ serpSnapshotId: string, weakSpots: WeakSpots, serpFeatures: SERPFeature[] }`
  - caching: 7 days
- `POST /api/keyword-explorer/social/unlock`
  - body: `{ keyword: string, country: string }`
  - returns: `{ youtube: ..., reddit: ... }`
  - caching: 3 days

**UNKNOWN (not found in repo):** current `app/api/**` routes dedicated to keyword explorer (not scanned in this doc).

---

## 4) Database Schema Design (Supabase)

> Goal: support caching + cost control + auditing credits.

### 4.1 `master_keywords`

Purpose: canonical keyword entity (keyword+country). Stores latest Labs metrics and derived fields.

```sql
create table public.master_keywords (
  id bigserial primary key,
  keyword text not null,
  country text not null,

  -- Labs metrics (cache 30d)
  volume integer,
  cpc numeric,
  kd integer,
  intent text[],

  -- Derived fields (may be computed client or server)
  geo_score integer,
  rtv integer,

  -- Cache timestamps
  labs_fetched_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(keyword, country)
);
```

### 4.2 `serp_snapshots`

Purpose: raw Live SERP response retention + weak spot detection + auditability.

```sql
create table public.serp_snapshots (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  country text not null,

  source text not null check (source in ('dataforseo_live_serp')),

  raw jsonb not null,

  -- extracted
  weak_spots jsonb,
  serp_features jsonb,

  fetched_at timestamptz not null default now(),

  -- retention (7d) enforced by scheduled job
  expires_at timestamptz generated always as (fetched_at + interval '7 days') stored
);
```

### 4.3 `user_credits` (ledger)

Purpose: transaction log (append-only), supports audit + refunds.

```sql
create table public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,

  action text not null check (action in ('row_refresh', 'social_unlock')),
  keyword text,
  country text,

  delta integer not null, -- e.g. -1

  created_at timestamptz not null default now()
);
```

**Alignment with existing code:** refresh action already attempts Supabase RPC + fallback update. Evidence: credit deduction logic in [`refresh-keyword.ts`](src/features/keyword-research/actions/refresh-keyword.ts:109).

---

## 5) Frontend & UX State (The Face)

### 5.1 Responsiveness status

- Mobile toolbar “grid layout” stabilization and action grouping has been implemented in [`KeywordTable`](src/features/keyword-research/components/table/KeywordTable.tsx:39).
  - Exact UX behaviors must be verified by UI run, but code changes are present in that file.

### 5.2 Credit consumption triggers (authoritative)

- **1 Credit**: Row Refresh
  - Backend hook: `refreshKeywordAction` should consume. Evidence: exists [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:225).
- **1 Credit**: Social Modal Unlock
  - Backend hook: `fetchSocialInsights` must be gated by “Unlock” UI and credit deduction.
  - Current status: action exists, but explicit “Unlock” credit gating is **UNKNOWN** (not proven without reading SocialTab internals).
- **No charge**: Cached data views
  - Drawer cache TTL exists (client-side 5min). Evidence: `DRAWER_CACHE_TTL` in [`store/index.ts`](src/features/keyword-research/store/index.ts:90).
  - Backend retention policy must override this with 30d/7d/3d server cache.

### 5.3 Active filters + columns (high confidence from structure)

Filters exist as components:
- `VolumeFilter`, `KDFilter`, `IntentFilter`, `CPCFilter`, `GeoFilter`, `WeakSpotFilter`, `SerpFilter`, `TrendFilter`, `IncludeExcludeFilter`, `MatchTypeToggle`. Evidence: exports in [`components/index.ts`](src/features/keyword-research/components/index.ts:8).

Columns exist (TanStack renderers):
- `KeywordColumn`, `VolumeColumn`, `KdColumn`, `CpcColumn`, `IntentColumn`, `TrendColumn`, `SerpColumn`, `GeoColumn`, `WeakSpotColumn`, `RefreshColumn`, `ActionsColumn`, and selection checkbox. Evidence: exports in [`components/table/index.ts`](src/features/keyword-research/components/table/index.ts:26).

---

## 6) Implementation Roadmap (Static Frontend → Functional SaaS)

### Phase 1 — Backend foundations (Supabase)

- [ ] Create tables: `master_keywords`, `serp_snapshots`, `user_credits` (plus RLS policies)
- [ ] Implement scheduled cleanup jobs for retention windows (30d/7d/3d)
- [ ] Implement credit ledger RPC: `deduct_credits(action, user_id, keyword, country)` and read balance

### Phase 2 — DataForSEO integration layer (server-only)

- [ ] Add DataForSEO HTTP client under `src/features/keyword-research/services/` (reuse existing server-only structure). Evidence: [`services/index.ts`](src/features/keyword-research/services/index.ts:7).
- [ ] Implement Labs bulk fetch → map response to internal `Keyword` type. Evidence: internal domain type in [`types/index.ts`](src/features/keyword-research/types/index.ts:30).
- [ ] Implement Live SERP refresh endpoint + raw snapshot write.

### Phase 3 — Next.js API routes / Server Actions wiring

- [ ] Add `app/api/keyword-explorer/labs/bulk/route.ts` calling Labs and caching to `master_keywords`.
- [ ] Add `app/api/keyword-explorer/serp/refresh/route.ts` calling Live SERP, writing `serp_snapshots`, returning extracted weak spots.
- [ ] Add `app/api/keyword-explorer/social/unlock/route.ts` calling YouTube + site:reddit.com endpoints, caching 3d.

### Phase 4 — Frontend enablement

- [ ] Wire `fetchKeywords` to call Labs bulk route.
- [ ] Wire `RefreshCell`/`RefreshColumn` to call refresh route and then update row state.
- [ ] Add explicit “Unlock Social” gate in `SocialTab` (consume 1 credit then fetch).
- [ ] Replace client-only 5min drawer cache with server timestamps awareness (do not re-charge when cache valid).

### Phase 5 — Algorithm alignment

- [ ] Align YouTube virality + FGI to authoritative formulas (and update UI badges accordingly).
- [ ] Implement `reddit-scoring.ts` (Heat Index + Parasite Score scaffolding).
- [ ] Implement `weak-spot-detector.ts` dual-source Labs vs Live SERP.

### Phase 6 — Observability + QA

- [ ] Add cost counters per endpoint (per user/day) for profit margin monitoring.
- [ ] Add error taxonomy surfaced to UI (quota, auth, upstream failures).
- [ ] End-to-end tests for: bulk fetch, refresh credit consumption, social unlock credit consumption.

---

## Status Snapshot (Today)

- Frontend feature folder structure is comprehensive and modular (filters/columns/drawers/services/store). Evidence: complete tree above.
- Server-side services layer exists and is explicitly server-only, suitable for DataForSEO integration. Evidence: [`services/index.ts`](src/features/keyword-research/services/index.ts:7).
- Credits deduction code exists for refresh action; must be reconciled with ledger design. Evidence: [`refresh-keyword.ts`](src/features/keyword-research/actions/refresh-keyword.ts:109).
- Client-side drawer cache exists (5 minutes); must be replaced/extended with backend retention policy. Evidence: [`store/index.ts`](src/features/keyword-research/store/index.ts:90).

# Keyword Explorer Forensic Code Audit (January 2026)

Target: `src/features/keyword-research/` (plus related libs used by the feature).
Related libs reviewed: `src/lib/seo/dataforseo.ts`, `services/dataforseo/client.ts`, `src/lib/safe-action.ts`, `src/lib/supabase/server.ts`.
Method: static code review only (no tests run).

## Phase 1: UI & UX Integrity (Frontend)

### Column logic check
- WeakSpotColumn UI is correct for Reddit/Quora/Pinterest; parsing comes from `detectWeakSpot` in `src/features/keyword-research/utils/serp-parser.ts` and is mapped by discovery/service code. `src/features/keyword-research/components/table/columns/weak-spot/weak-spot-column.tsx`
- GeoColumn colors and tooltips cover 0-100 and show the Bot icon when AIO exists; scores are clamped in `calculateGeoScore`. `src/features/keyword-research/components/table/columns/geo/geo-column.tsx`, `src/features/keyword-research/utils/geo-calculator.ts`
- RefreshColumn shows a spinner when `isRefreshing` is true, but it is not wired in the active custom table. `src/features/keyword-research/components/table/columns/refresh/refresh-column.tsx`, `src/features/keyword-research/components/table/KeywordTable.tsx`

### Filter logic check
- Include terms use AND logic; exclude terms use OR logic and are case-insensitive. `src/features/keyword-research/utils/filter-utils.ts`
- Volume filter treats null/undefined as 0 via `safeNumber`, so nulls are handled gracefully. `src/features/keyword-research/utils/filter-utils.ts`
- SERP filter options include features not emitted by current mapping (only `video` and `featured_snippet` are emitted), which can cause "no results" when selecting other features. `src/features/keyword-research/components/filters/serp/serp-filter.tsx`, `src/features/keyword-research/utils/serp-parser.ts`

### Responsive design
- Tables are horizontally scrollable with `overflow-auto` and `min-w-[800px]`; usable on mobile but dense and dependent on horizontal scrolling. `src/features/keyword-research/components/table/KeywordTable.tsx`
- Drawer content uses fixed 3-column grids without small-screen breakpoints, making cards/pins cramped on mobile. `src/features/keyword-research/components/drawers/CommerceTab.tsx`, `src/features/keyword-research/components/drawers/SocialTab.tsx`

## Phase 2: Security & Safety (Backend)

### Auth guards
- `search.action.ts` and `refresh-keyword.ts` use `authAction` (auth + rate limit). `src/features/keyword-research/actions/search.action.ts`, `src/features/keyword-research/actions/refresh-keyword.ts`
- `fetch-keywords.ts`, `fetch-drawer-data.ts`, and `refresh-row.ts` are public actions and can trigger paid API calls without auth or credit checks. `src/features/keyword-research/actions/fetch-keywords.ts`, `src/features/keyword-research/actions/fetch-drawer-data.ts`, `src/features/keyword-research/actions/refresh-row.ts`
- Supabase credit reads/updates rely on RLS; verify RLS prevents cross-user access. `src/features/keyword-research/actions/refresh-keyword.ts`, `src/lib/supabase/server.ts`

### Input validation
- All server actions validate keyword/country inputs with Zod. `src/features/keyword-research/actions/search.action.ts`, `src/features/keyword-research/actions/fetch-keywords.ts`, `src/features/keyword-research/actions/refresh-keyword.ts`, `src/features/keyword-research/actions/fetch-drawer-data.ts`
- No direct SQL string interpolation or DB query concatenation found in this feature.

### Data leakage
- Responses are mapped to internal DTOs before returning to the client; no raw DataForSEO payloads are exposed. `src/features/keyword-research/actions/search.action.ts`, `src/features/keyword-research/services/keyword-discovery.ts`, `src/features/keyword-research/services/live-serp.ts`

## Phase 3: Performance & Cost (FinOps)

### API optimization
- Bulk discovery uses DataForSEO Labs (cheap). `src/features/keyword-research/services/keyword-discovery.ts`, `src/features/keyword-research/services/keyword.service.ts`
- Single-row refresh uses SERP Live Advanced (expensive) as intended. `src/features/keyword-research/services/live-serp.ts`
- Main UI uses `fetchKeywords` (public) instead of the authenticated search action, bypassing auth/credits. `src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx`, `src/features/keyword-research/actions/fetch-keywords.ts`

### Mock mode
- Mock mode is honored in discovery/service/social paths, but live SERP refresh ignores mock mode and will call DataForSEO even when `NEXT_PUBLIC_USE_MOCK_DATA=true`. `src/features/keyword-research/services/live-serp.ts`, `src/features/keyword-research/actions/refresh-keyword.ts`

### Caching
- No Supabase caching/dedupe layer exists for search or refresh to avoid repeat charges; only config placeholders exist. `src/features/keyword-research/config/api-config.ts`

## Verdict Report

**1. 🟢 READY TO SHIP**
- Weak-spot detection and display pipeline is consistent (parser -> mapper -> column). `src/features/keyword-research/utils/serp-parser.ts`, `src/features/keyword-research/services/keyword-discovery.ts`, `src/features/keyword-research/components/table/columns/weak-spot/weak-spot-column.tsx`
- GEO score computation is deterministic and clamped to 0-100 with clear visual scaling. `src/features/keyword-research/utils/geo-calculator.ts`, `src/features/keyword-research/components/table/columns/geo/geo-column.tsx`
- Include/Exclude filtering and volume null handling are correct. `src/features/keyword-research/utils/filter-utils.ts`

**2. 🔴 CRITICAL ISSUES**
- Unauthenticated public actions can trigger paid DataForSEO calls. `src/features/keyword-research/actions/fetch-keywords.ts`, `src/features/keyword-research/actions/fetch-drawer-data.ts`, `src/features/keyword-research/actions/refresh-row.ts`
- Row refresh is broken in the active custom table (no handler passed to rows). `src/features/keyword-research/components/table/KeywordTable.tsx`, `src/features/keyword-research/components/table/KeywordTableRow.tsx`
- Bulk refresh uses store selection, but the active table uses local selection state; bulk refresh targets the wrong set or none. `src/features/keyword-research/components/table/KeywordTable.tsx`, `src/features/keyword-research/components/table/columns/refresh/RefreshCreditsHeader.tsx`
- Mock mode does not block live SERP refresh, risking unexpected API charges in dev. `src/features/keyword-research/services/live-serp.ts`, `src/features/keyword-research/actions/refresh-keyword.ts`

**3. 🟡 IMPROVEMENTS**
- GEO score 0 is hidden in the custom row UI; display 0 consistently. `src/features/keyword-research/components/table/KeywordTableRow.tsx`
- SERP filter shows features not emitted by current mapping; align filter options to actual features. `src/features/keyword-research/components/filters/serp/serp-filter.tsx`, `src/features/keyword-research/utils/serp-parser.ts`
- Drawer grids lack mobile breakpoints; add responsive columns for small screens. `src/features/keyword-research/components/drawers/CommerceTab.tsx`, `src/features/keyword-research/components/drawers/SocialTab.tsx`
- Consider caching/dedupe on keyword+country to prevent repeat charges. `src/features/keyword-research/services/keyword-discovery.ts`, `src/features/keyword-research/actions/refresh-keyword.ts`
- Credit deduction happens before the API call; failures still consume credits (UX/FinOps concern). `src/features/keyword-research/actions/refresh-keyword.ts`

**4. 📊 FINAL SCORE**
- 58/100

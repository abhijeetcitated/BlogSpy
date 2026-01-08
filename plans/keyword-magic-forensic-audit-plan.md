# Keyword Magic Forensic Audit Plan (End-to-End)

Scope: both user-facing routes:
- [`app/dashboard/research/keyword-magic/page.tsx`](../app/dashboard/research/keyword-magic/page.tsx:1)
- [`app/keyword-magic/page.tsx`](../app/keyword-magic/page.tsx:1)

Primary feature implementation:
- [`src/features/keyword-research/keyword-research-content.tsx`](../src/features/keyword-research/keyword-research-content.tsx:1)
- Results + drawer wiring: [`src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx`](../src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:1), [`src/features/keyword-research/components/drawers/KeywordDrawer.tsx`](../src/features/keyword-research/components/drawers/KeywordDrawer.tsx:1)

---

## 1) Canonical user journeys to audit

### Journey A: Explore search
- Input seed keyword + country in header: [`KeywordResearchHeader()`](../src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:34)
- Server action fetch and results render: [`fetchKeywords()`](../src/features/keyword-research/actions/fetch-keywords.ts:1)
- Filtering and sorting in table: [`FilterBar()`](../src/features/keyword-research/components/filters/FilterBar.tsx:31), [`applyAllFilters()`](../src/features/keyword-research/utils/filter-utils.ts:592), [`sortKeywords()`](../src/features/keyword-research/utils/sort-utils.ts:10)

### Journey B: Row click → drawer
- Row click opens drawer: [`KeywordTableRow()`](../src/features/keyword-research/components/table/KeywordTableRow.tsx:40)
- Drawer tabs fetch/compute:
  - Social tab: [`SocialTab()`](../src/features/keyword-research/components/drawers/SocialTab.tsx:1)
  - Commerce tab: [`CommerceTab()`](../src/features/keyword-research/components/drawers/CommerceTab.tsx:1)

### Journey C: Refresh metrics
- Per-row refresh button (should call an authenticated, credit-charging action): Refresh UI exists in [`KeywordTableRow()`](../src/features/keyword-research/components/table/KeywordTableRow.tsx:264)
- Bulk refresh via header: [`RefreshCreditsHeader()`](../src/features/keyword-research/components/table/columns/refresh/RefreshCreditsHeader.tsx:31)
- Credit charging + SERP refresh:
  - Authenticated action: [`refreshKeywordAction`](../src/features/keyword-research/actions/refresh-keyword.ts:82)
  - Live SERP service: [`refreshLiveSerp()`](../src/features/keyword-research/services/live-serp.ts:62)

### Journey D: Export
- CSV/clipboard export paths:
  - Table copy/export UI: [`KeywordTable()`](../src/features/keyword-research/components/table/KeywordTable.tsx:39)
  - Export utils (CSV injection sanitization): [`exportToCSV()`](../src/features/keyword-research/utils/export-utils.ts:35)

---

## 2) Audit dimensions + acceptance criteria

### UI/UX
Checklist:
- Empty/loading/error states for search, drawer fetch, refresh.
- Responsive behavior (table horizontal scroll, drawer on mobile).
- Column semantics clarity:
  - Weak Spot: tooltip + label correctness.
  - GEO: score meaning + AIO badge meaning.
  - SERP features: normalization and display consistency.
  - Refresh: states (idle, in-flight, done) and click behavior.

Key files:
- [`KeywordTable()`](../src/features/keyword-research/components/table/KeywordTable.tsx:39)
- [`KeywordTableHeader()`](../src/features/keyword-research/components/table/KeywordTableHeader.tsx:33)
- [`KeywordTableRow()`](../src/features/keyword-research/components/table/KeywordTableRow.tsx:40)

### Correctness
Checklist:
- Filter semantics match UI:
  - Include must be AND, exclude must be OR: [`filterByIncludeTerms()`](../src/features/keyword-research/utils/filter-utils.ts:415), [`filterByExcludeTerms()`](../src/features/keyword-research/utils/filter-utils.ts:445)
  - Match types behave as expected: [`filterBySearchText()`](../src/features/keyword-research/utils/filter-utils.ts:121)
  - Null/undefined handling is intentional (not silently biasing results): [`safeNumber()`](../src/features/keyword-research/utils/filter-utils.ts:69)
- Sorting fields are consistent across implementations (custom table vs store sort): [`sortKeywords()`](../src/features/keyword-research/utils/sort-utils.ts:10) and store sort in [`useKeywordStore`](../src/features/keyword-research/store/index.ts:198)

### Credits + refresh correctness
Checklist:
- All refresh operations that call DataForSEO in production are authenticated and charge credits.
- Guest gating aligns with server enforcement (UI guard alone is not sufficient).
- Per-row refresh is actually wired (currently UI shows a refresh icon but parent may not supply handler).

Key files:
- [`refreshKeywordAction`](../src/features/keyword-research/actions/refresh-keyword.ts:82)
- Public/dev refresh action (risk): [`refreshRow`](../src/features/keyword-research/actions/refresh-row.ts:19)
- UI refresh wiring: [`KeywordTableRow()`](../src/features/keyword-research/components/table/KeywordTableRow.tsx:264), [`KeywordTable()`](../src/features/keyword-research/components/table/KeywordTable.tsx:39)

### Security
Checklist:
- Ensure all DataForSEO calls are server-only and cannot be triggered without auth if they incur cost.
- Ensure server actions use the hardened safe-action variant with rate limiting + sanitized errors.
- Validate env usage: no secret reads on client; mock-mode gating doesn’t open production bypass.

Key files:
- Safe action module (hardened): [`authAction`](../src/lib/safe-action.ts:1)
- Feature actions: [`fetchKeywords()`](../src/features/keyword-research/actions/fetch-keywords.ts:1), [`refreshKeywordAction`](../src/features/keyword-research/actions/refresh-keyword.ts:82)
- DataForSEO client: [`getDataForSEOClient()`](../src/lib/seo/dataforseo.ts:1)

### Performance / FinOps
Checklist:
- Identify all DataForSEO endpoints used and their call rates.
- Concurrency controls (bulk refresh batching) and timeouts.
- Caching/dedup opportunities (avoid repeated refresh on same keyword+country).
- Cost visibility: ensure cost returned by DataForSEO client is plumbed if available.

---

## 3) Known risk signals already observed (to validate)

- Per-row Refresh button in [`KeywordTableRow()`](../src/features/keyword-research/components/table/KeywordTableRow.tsx:264) depends on `onRefresh`, but [`KeywordTable()`](../src/features/keyword-research/components/table/KeywordTable.tsx:39) currently does not pass `onRefresh` (likely non-functional per-row refresh in the custom table path).
- Mixed server action hardening: some actions still use public/dev `action` (example: [`refreshRow`](../src/features/keyword-research/actions/refresh-row.ts:19)) while credit-charging refresh uses [`authAction`](../src/features/keyword-research/actions/refresh-keyword.ts:82).
- Duplicate implementations exist (custom table vs TanStack table) which increases drift risk; audit will identify which path is active in each route and judge dead code vs migration.

---

## 4) Output deliverable

A final report (no code changes unless CRITICAL) written to:
- [`plans/keyword-magic-forensic-audit.md`](keyword-magic-forensic-audit.md:1)

Report structure:
- Verdict: READY TO SHIP or NOT READY
- CRITICAL ISSUES (must-fix before production)
- NON-CRITICAL IMPROVEMENTS (post-ship)
- Security notes
- FinOps notes
- Maintainability notes
- Scorecard

CRITICAL definition for this audit:
- Allows unauthed users to trigger paid DataForSEO calls
- Incorrect credit charging (under/over charging) in production
- Refresh/search actions can leak secrets or break production (500s) under normal usage
- Major user-facing broken interaction in canonical flows (search, drawer open, refresh, export)

---

## 5) If CRITICAL fixes are approved

I will request switching to implementation mode and apply the minimal patch set, then run `npm run build`.

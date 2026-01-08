# KEYWORD EXPLORER - COMPLETE FORENSIC REPORT (2026-01-07)

Generated: 2026-01-07
Reviewer: Codex (manual code audit)
Scope root: `src/features/keyword-research/`
Related entry points: `app/keyword-magic/page.tsx`, `app/dashboard/research/keyword-magic/page.tsx`, `components/features/index.ts`
Related shared infra: `src/lib/safe-action.ts`, `src/lib/seo/dataforseo.ts`, `services/dataforseo/client.ts`

---

## 1) Scope and Method

This report is focused on the Keyword Explorer (Keyword Magic) feature.
I reviewed all files under `src/features/keyword-research/` plus the related entry pages and the shared services/actions used by this feature.

What is NOT covered:
- Entire repo or other unrelated features
- Runtime testing (no browser or network calls)

Method:
- File-by-file manual read for the scope above
- Cross-check of server actions, data services, store, and UI wiring
- Spot checks for unused code, security, performance, and data flow risks

---

## 2) Folder-by-Folder Summary (Keyword Explorer)

`src/features/keyword-research/`
- `actions/`: server actions for fetch, refresh, drawer data
- `components/`: header, filters, search, table, drawers
- `config/`: feature and API config
- `constants/`: UI and table config
- `data/` + `__mocks__/`: demo/mock keyword datasets
- `services/`: server-only API wrappers (DataForSEO, mock, social)
- `store/`: Zustand state (single source of truth for this feature)
- `types/`: data contracts for keyword records
- `utils/`: filtering, sorting, mapping, export, GEO/RTV logic

---

## 3) Major Findings (Severity Ordered)

### HIGH
1) Paid API exposure to guests
- `fetchKeywords` is a public action and can call real DataForSEO if mock mode is off.
- Rate limiting only applies if Upstash is configured; otherwise there is no limit.
- Risk: unauthed guests can trigger paid API calls.
- Files: `src/features/keyword-research/actions/fetch-keywords.ts`, `src/lib/safe-action.ts`

2) Mock mode does NOT stop live SERP calls
- `refreshKeywordAction` always calls live SERP service; mock gating is missing here.
- Risk: dev/demo usage can trigger paid API calls unintentionally.
- File: `src/features/keyword-research/actions/refresh-keyword.ts`

### MEDIUM
3) URL params are not applied to store state
- `initialSearch` is read but never set into filters.
- `selectedCountry` is local only; store country stays default until user changes.
- Result: shareable URLs do not restore state; refresh uses US by default.
- File: `src/features/keyword-research/keyword-research-content.tsx`

4) Bulk analyze results are not consumed
- Bulk mode writes `sessionStorage` but no reader exists in this feature.
- Result: bulk flow does not display results; only a toast is shown.
- File: `src/features/keyword-research/keyword-research-content.tsx`

5) Bulk search credits not deducted
- `bulkSearchKeywords` has a TODO and does not deduct credits.
- Result: paid usage can be undercounted.
- File: `src/features/keyword-research/actions/fetch-keywords.ts`

6) Export trend percentage can divide by zero
- Trend export uses `(last - first) / first` without zero guard.
- Result: CSV/TSV can contain Infinity/NaN.
- File: `src/features/keyword-research/utils/export-utils.ts`

### LOW
7) Duplicate DataForSEO clients
- Two separate client implementations exist (`services/dataforseo/client.ts` and `src/lib/seo/dataforseo.ts`).
- Risk: inconsistent error handling and config drift.

8) Duplicate store implementations
- `store/keyword-store.ts` appears unused (no imports found) and diverges from feature store.
- Risk: confusion/maintenance overhead.

9) Credit purchase flow is stubbed
- UI shows pricing, but purchase only sleeps and shows toast.
- Result: buy credits is not functional.
- File: `src/features/keyword-research/components/header/CreditBalance.tsx`

10) Unused imports and dead code
- Unused imports exist (e.g., `useRouter` in drawer).
- Multiple legacy/unused utilities remain.

---

## 4) File-by-File Notes (Key Files)

### Entry Pages
- `app/keyword-magic/page.tsx`
  - Demo wrapper only; OK.
- `app/dashboard/research/keyword-magic/page.tsx`
  - Simple wrapper; OK.
- `components/features/index.ts`
  - Exports keyword-research feature from `src/features`; OK.

### Core Orchestrator
- `src/features/keyword-research/keyword-research-content.tsx`
  - Good: debounced filters, memoized results, guest banner.
  - Issue: URL params not applied to store; `initialSearch` unused.
  - Issue: bulk mode stores `sessionStorage` but no consumer.

### Store
- `src/features/keyword-research/store/index.ts`
  - Good: centralized state; cache TTL for drawer data.
  - OK: credit updates are UI-only; real enforcement in server actions.

### Actions
- `src/features/keyword-research/actions/fetch-keywords.ts`
  - Good: Zod validation and public/ auth actions split.
  - Issue: public action can call paid API if mock mode off.
  - Issue: bulk credit deduction TODO.

- `src/features/keyword-research/actions/refresh-keyword.ts`
  - Good: server-side credit deduction via RPC with fallback.
  - Issue: no mock gate for live SERP fetch.

- `src/features/keyword-research/actions/fetch-drawer-data.ts`
  - Good: strong validation and structured error handling.

### Services
- `src/features/keyword-research/services/keyword.service.ts`
  - Good: server-only, mock mode support, mapping from DataForSEO.
  - Note: mock mode returns full dataset (no query filter).

- `src/features/keyword-research/services/live-serp.ts`
  - Good: clear SERP parsing, GEO score calculation.

- `src/features/keyword-research/services/social.service.ts`
  - Good: safe mapping, mock mode, retryable error structure.

### Utils
- `src/features/keyword-research/utils/filter-utils.ts`
  - Good: O(n) filters, safe number handling, ordered filtering.

- `src/features/keyword-research/utils/sort-utils.ts`
  - Good: division-by-zero safe trend sort.

- `src/features/keyword-research/utils/export-utils.ts`
  - Issue: trend export division-by-zero.

- `src/features/keyword-research/utils/data-mapper.ts`
  - Good: mapping handles LABS and related keywords.

### Table + UI
- `src/features/keyword-research/components/table/KeywordTable.tsx`
  - Good: guest gating for export/copy.
  - Note: uses local state to manage keywords; updates from props OK.

- `src/features/keyword-research/components/table/KeywordDataTable.tsx`
  - Alternative table implementation; not used by current page.

- `src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx`
  - Unused imports; otherwise OK.

- `src/features/keyword-research/components/header/CreditBalance.tsx`
  - Issue: purchase is stubbed; no Stripe integration.

---

## 5) Security Review

- Server actions use `publicAction` and `authAction`; validation via Zod is good.
- Rate limiting depends on Upstash. If not configured, public endpoint is unbounded.
- Sensitive keys are stored in env; no client leaks found.
- Credit enforcement exists for refresh (server-side). Missing for bulk search.

Security gaps to fix:
1) Gate paid API calls behind auth or strict rate limiting.
2) Add mock mode guard in refresh to avoid paid calls in demo/dev.
3) Implement server-side credit checks for bulk search.

---

## 6) Performance Review

- Filtering: efficient and memoized.
- Table: uses render-all rows. For 1k+ rows, add virtualization.
- Drawer data: cached in store with TTL (good).

---

## 7) Credits and Billing Flow

What works:
- Refresh uses server action and deducts credits via RPC (good).

What is missing:
- Bulk search credit deduction not implemented.
- Buy credits UI is a stub (no Stripe).
- Credits are displayed from server but not enforced for all actions.

---

## 8) Unused / Duplicate Code

- `store/keyword-store.ts` appears unused (no references found).
- Duplicate DataForSEO clients in `services/` and `src/lib/seo/`.
- Some unused imports in drawer components.

---

## 9) Recommended Fix Order

Priority 1 (Security/Cost)
1) Protect `fetchKeywords` in production (auth-only or hard rate limit).
2) Add mock guard in `refreshKeywordAction` for dev/demo.

Priority 2 (Core correctness)
3) Apply URL params into store (search text and country).
4) Implement bulk results display (read `sessionStorage` or build a bulk results view).
5) Deduct credits for bulk search.

Priority 3 (Quality)
6) Fix export trend division-by-zero.
7) Remove unused store/client duplicates or consolidate.
8) Add virtualization if large datasets are expected.

---

## 10) Testing Status

No automated tests were run. Suggest adding:
- Unit tests for filters, sorting, export functions.
- Integration tests for fetch and refresh actions.

---

## 11) Final Verdict

The feature is well-structured and close to production-ready, but there are real cost/security risks around public API access and missing credit deductions. Fixing those first will make the system safe and consistent for production use.

End of report.

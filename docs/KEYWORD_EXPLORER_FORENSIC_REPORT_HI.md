# Keyword Explorer (Keyword Magic) — Complete Forensic Report (Tree + Logic + Math + UI + APIs) (Hindi)

> Scope: BlogSpy SaaS codebase (`e:/startup/blogspy-saas`) में Keyword Explorer / Keyword Research feature page का end-to-end forensic breakdown.
>
> Hard Rules applied:
> - Narrative: Hindi
> - Code identifiers (functions/components/files): English (as-is)
> - Evidence: हर claim के साथ clickable file link (with line)
> - Unknowns: `UNKNOWN (not found in repo)`
>
> Repo scan priority followed (as available in this report): `src/features/keyword-research/**`, `components/**`, `lib/**`, `constants/**`, `hooks/**`, `app/**`.

---

## 0) Executive Summary (Hindi)

- Feature के 2 main entry points हैं:
  - Dashboard route [`/dashboard/research/keyword-magic`](app/dashboard/research/keyword-magic/page.tsx:1) → renders [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:74)
  - Demo route [`/keyword-magic`](app/keyword-magic/page.tsx:1) → renders same [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:74) but wrapped in [`DemoWrapper`](components/common/demo-wrapper.tsx:1)
- Feature implementation clearly “feature folder architecture” follow करती है: barrel exports exist at [`components/index.ts`](src/features/keyword-research/components/index.ts:1), [`actions/index.ts`](src/features/keyword-research/actions/index.ts:1), [`services/index.ts`](src/features/keyword-research/services/index.ts:1), [`utils/index.ts`](src/features/keyword-research/utils/index.ts:1), [`config/index.ts`](src/features/keyword-research/config/index.ts:1).
- Table system अब **single TanStack v8-powered** है: production results [`KeywordTable`](src/features/keyword-research/components/table/KeywordTable.tsx:70) render करते हैं, और table internals TanStack v8 (`useReactTable`) पर हैं. Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:93) + [`useReactTable()`](src/features/keyword-research/components/table/KeywordTable.tsx:508).
- Column factory [`createColumns()`](src/features/keyword-research/components/table/columns/columns.tsx:55) repo में मौजूद है, पर current production table path में use नहीं हो रही (cleanup candidate).
- Drawer system: store-connected wrapper [`KeywordDrawer`](src/features/keyword-research/components/drawers/KeywordDrawer.tsx:13) → main UI [`KeywordDetailsDrawer`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:65) → tabs: [`OverviewTab`](src/features/keyword-research/components/drawers/OverviewTab.tsx:1), [`SocialTab`](src/features/keyword-research/components/drawers/SocialTab.tsx:1), Commerce implemented but feature-flagged off (`SHOW_COMMERCE_TAB=false`). Evidence: [`KeywordDetailsDrawer`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:47).
- Metrics calculators exist and are code-defined:
  - RTV: [`calculateRtv()`](src/features/keyword-research/utils/rtv-calculator.ts:115)
  - GEO score: [`calculateGeoScore()`](src/features/keyword-research/utils/geo-calculator.ts:47)
  - Weak spots: [`detectWeakSpots()`](src/features/keyword-research/utils/serp-parser.ts:187)
  - YouTube Intelligence engine: [`analyzeYouTubeCompetition()`](src/features/keyword-research/utils/youtube-intelligence.ts:548)

---

## 1) STEP 0 — Route Map (Entry Points)

| Route | Page Component | Imported Feature Root | Auth requirement (if any) | Evidence |
|---|---|---|---|---|
| `/dashboard/research/keyword-magic` | `KeywordResearchPage` | `KeywordResearchContent` | UNKNOWN (auth middleware not proven here) | [`app/dashboard/research/keyword-magic/page.tsx`](app/dashboard/research/keyword-magic/page.tsx:1) + [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:74) |
| `/keyword-magic` | `KeywordResearchDemoPage` | `KeywordResearchContent` | Demo/guest allowed | [`app/keyword-magic/page.tsx`](app/keyword-magic/page.tsx:1) |

**Proxy demo gating note (risk):** `DEMO_ROUTES` list contains `/keyword-magic`. Evidence: [`proxy.ts`](proxy.ts:79). और `isDemoMode = true` hardcoded block auth bypass कर सकता है. Evidence: [`proxy.ts`](proxy.ts:182).

---

## 2) STEP 1 — Feature Tree + Purpose (A–Z complete, no-miss)

नीचे दिया गया tree **exactly** `src/features/keyword-research/**` recursive listing से बनाया गया है (no file/folder missed). Purpose 1-line है; जहाँ file internals अभी read/cite नहीं हुए, वहाँ **approx** लिखा है.

```
src/features/keyword-research/
  index.ts
  keyword-research-content.tsx
  README.md
  __mocks__/
    index.ts
    keyword-data.ts
  actions/
    fetch-drawer-data.ts
    fetch-keywords.ts
    index.ts
    refresh-keyword.ts
    refresh-row.ts
  components/
    index.ts
    drawers/
      CommerceTab.tsx
      index.ts
      KeywordDetailsDrawer.tsx
      KeywordDrawer.tsx
      OverviewTab.tsx
      RtvBreakdownWidget.tsx
      RtvFormulaDialog.tsx
      RtvWidget.tsx
      SocialTab.tsx
      YouTubeStrategyPanel.tsx
      widgets/
        RtvBreakdown.tsx
        RtvFormulaButton.tsx
    filters/
      FilterBar.tsx
      index.ts
      cpc/
        cpc-filter.tsx
        index.ts
      geo/
        geo-filter.tsx
        index.ts
      include-exclude/
        include-exclude-filter.tsx
        index.ts
      intent/
        index.ts
        intent-filter.tsx
      kd/
        index.ts
        kd-filter.tsx
      match-type/
        index.ts
        match-type-toggle.tsx
      serp/
        index.ts
        serp-filter.tsx
      trend/
        index.ts
        trend-filter.tsx
      volume/
        index.ts
        volume-filter.tsx
      weak-spot/
        index.ts
        weak-spot-filter.tsx
    header/
      country-selector.tsx
      CreditBalance.tsx
      index.ts
      page-header.tsx
      results-header.tsx
    modals/
      export-modal.tsx
      filter-presets-modal.tsx
      index.ts
      keyword-details-modal.tsx
    page-sections/
      index.ts
      KeywordResearchFilters.tsx
      KeywordResearchHeader.tsx
      KeywordResearchResults.tsx
      KeywordResearchSearch.tsx
    search/
      bulk-keywords-input.tsx
      bulk-mode-toggle.tsx
      index.ts
      search-input.tsx
      search-suggestions.tsx
    shared/
      empty-states.tsx
      error-boundary.tsx
      index.tsx
      loading-skeleton.tsx
    table/
      index.ts
      KeywordDataTable.tsx
      KeywordTable.tsx
      KeywordTableFooter.tsx
      KeywordTableHeader.tsx
      KeywordTableRow.tsx
      action-bar/
        action-bar.tsx
        bulk-actions.tsx
        index.ts
        selection-info.tsx
      columns/
        columns.tsx
        index.ts
        actions/
          actions-column.tsx
          index.ts
        checkbox/
          checkbox-column.tsx
          index.ts
        cpc/
          cpc-column.tsx
          index.ts
        geo/
          geo-column.tsx
          index.ts
        intent/
          index.ts
          intent-column.tsx
        kd/
          index.ts
          kd-column.tsx
        keyword/
          index.ts
          keyword-column.tsx
        refresh/
          index.ts
          refresh-column.tsx
          RefreshCell.tsx
          RefreshCreditsHeader.tsx
        serp/
          index.ts
          serp-column.tsx
        trend/
          index.ts
          trend-column.tsx
        volume/
          index.ts
          volume-column.tsx
        weak-spot/
          index.ts
          weak-spot-column.tsx
  config/
    api-config.ts
    feature-config.ts
    index.ts
  constants/
    index.ts
    table-config.ts
  data/
    index.ts
    mock-keywords.ts
  hooks/
    index.ts
  providers/
    index.ts
  services/
    api-base.ts
    bulk-analysis.service.ts
    export.service.ts
    index.ts
    keyword-discovery.ts
    keyword.service.ts
    live-serp.ts
    mock-utils.ts
    social.service.ts
    suggestions.service.ts
  store/
    index.ts
  types/
    api.types.ts
    index.ts
  utils/
    data-mapper.ts
    export-utils.ts
    filter-utils.ts
    geo-calculator.ts
    index.ts
    mock-helpers.ts
    rtv-calculator.ts
    serp-parser.ts
    sort-utils.ts
    youtube-intelligence.ts
```

### 2.1 1-line purpose (file-wise)

Top-level:
- [`src/features/keyword-research/index.ts`](src/features/keyword-research/index.ts:1) — feature barrel export (re-exports components/types/utils/store/config; intentionally does **NOT** re-export server-only services). Evidence: [`index.ts`](src/features/keyword-research/index.ts:69)
- [`src/features/keyword-research/keyword-research-content.tsx`](src/features/keyword-research/keyword-research-content.tsx:74) — main client feature root; composes page-sections.
- [`src/features/keyword-research/README.md`](src/features/keyword-research/README.md:1) — internal docs.

Mocks:
- [`__mocks__/index.ts`](src/features/keyword-research/__mocks__/index.ts:1) — mock barrel exporting `MOCK_KEYWORDS`. Evidence: [`__mocks__/index.ts`](src/features/keyword-research/__mocks__/index.ts:1)
- [`__mocks__/keyword-data.ts`](src/features/keyword-research/__mocks__/keyword-data.ts:1) — `MOCK_KEYWORDS: Keyword[]` dataset used for demo/placeholder flows. Evidence: [`MOCK_KEYWORDS`](src/features/keyword-research/__mocks__/keyword-data.ts:7)

Actions:
- [`actions/index.ts`](src/features/keyword-research/actions/index.ts:1) — action barrel.
- [`actions/fetch-keywords.ts`](src/features/keyword-research/actions/fetch-keywords.ts:1) — keyword discovery actions.
- [`actions/fetch-drawer-data.ts`](src/features/keyword-research/actions/fetch-drawer-data.ts:1) — drawer data actions.
- [`actions/refresh-keyword.ts`](src/features/keyword-research/actions/refresh-keyword.ts:1) — refresh orchestration (credits + SERP + RTV + DB).
- [`actions/refresh-row.ts`](src/features/keyword-research/actions/refresh-row.ts:1) — lightweight per-row refresh: calls `refreshLiveSerp()` and returns `{ weakSpot, hasAio, checkedAt }`. Evidence: [`refreshRow`](src/features/keyword-research/actions/refresh-row.ts:17)

Components barrels:
- [`components/index.ts`](src/features/keyword-research/components/index.ts:1) — component barrel across filters/header/search/table/drawers/modals/page-sections/shared.

Components → page-sections:
- [`components/page-sections/index.ts`](src/features/keyword-research/components/page-sections/index.ts:1) — exports page sections.
- [`components/page-sections/KeywordResearchHeader.tsx`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:1) — seed search + country selector + mode/match toggles; wired to server action `fetchKeywords()`. Evidence: [`handleSearch()`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:55)
- [`components/page-sections/KeywordResearchSearch.tsx`](src/features/keyword-research/components/page-sections/KeywordResearchSearch.tsx:1) — client-side “Filter keywords…” input row. Evidence: [`KeywordResearchSearch()`](src/features/keyword-research/components/page-sections/KeywordResearchSearch.tsx:18)
- [`components/page-sections/KeywordResearchFilters.tsx`](src/features/keyword-research/components/page-sections/KeywordResearchFilters.tsx:1) — filter popovers row with temp state + Apply pattern writing into Zustand. Evidence: [`KeywordResearchFilters()`](src/features/keyword-research/components/page-sections/KeywordResearchFilters.tsx:23)
- [`components/page-sections/KeywordResearchResults.tsx`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:1) — results section: loading/empty/table + row click opens drawer. Evidence: [`KeywordResearchResults()`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:25)

Components → header:
- [`components/header/index.ts`](src/features/keyword-research/components/header/index.ts:1) — header exports.
- [`components/header/page-header.tsx`](src/features/keyword-research/components/header/page-header.tsx:1) — breadcrumb + title/description header; defaults to “Keyword Magic Tool”. Evidence: [`PageHeader()`](src/features/keyword-research/components/header/page-header.tsx:18)
- [`components/header/results-header.tsx`](src/features/keyword-research/components/header/results-header.tsx:1) — results counts + optional Refresh/Export buttons. Evidence: [`ResultsHeader()`](src/features/keyword-research/components/header/results-header.tsx:19)
- [`components/header/country-selector.tsx`](src/features/keyword-research/components/header/country-selector.tsx:1) — Popover country picker with search + “Worldwide” + popular/all sections. Evidence: [`CountrySelector()`](src/features/keyword-research/components/header/country-selector.tsx:24)
- [`components/header/CreditBalance.tsx`](src/features/keyword-research/components/header/CreditBalance.tsx:1) — credits pill; on mount calls `getUserCreditsAction({})` and writes remaining credits into Zustand. Evidence: [`CreditBalance()`](src/features/keyword-research/components/header/CreditBalance.tsx:69)

Components → search:
- [`components/search/index.ts`](src/features/keyword-research/components/search/index.ts:1) — search exports.
- [`components/search/search-input.tsx`](src/features/keyword-research/components/search/search-input.tsx:1) — reusable search input with clear button + Enter-submit support. Evidence: [`SearchInput()`](src/features/keyword-research/components/search/search-input.tsx:19)
- [`components/search/search-suggestions.tsx`](src/features/keyword-research/components/search/search-suggestions.tsx:1) — autocomplete dropdown; closes on outside click; supports suggestion types `{recent,trending,related}`. Evidence: [`SearchSuggestions()`](src/features/keyword-research/components/search/search-suggestions.tsx:24)
- [`components/search/bulk-mode-toggle.tsx`](src/features/keyword-research/components/search/bulk-mode-toggle.tsx:1) — Explore vs Bulk Analysis toggle; calls `onChange("explore"|"bulk")`. Evidence: [`BulkModeToggle()`](src/features/keyword-research/components/search/bulk-mode-toggle.tsx:15)
- [`components/search/bulk-keywords-input.tsx`](src/features/keyword-research/components/search/bulk-keywords-input.tsx:1) — bulk textarea + keywordCount from `parseBulkKeywords()` and limit display via `MAX_BULK_KEYWORDS`; triggers `onAnalyze(parseBulkKeywords(value))`. Evidence: [`BulkKeywordsInput()`](src/features/keyword-research/components/search/bulk-keywords-input.tsx:18)

Components → filters:
- [`components/filters/index.ts`](src/features/keyword-research/components/filters/index.ts:1) — barrel exporting individual filter UI widgets.
- [`components/filters/FilterBar.tsx`](src/features/keyword-research/components/filters/FilterBar.tsx:1) — alternate “all-in-one” filter bar wired to Zustand (includes search input + popovers + reset). Evidence: [`FilterBar()`](src/features/keyword-research/components/filters/FilterBar.tsx:31)
- Individual filter widgets: see tree links above (all listed).

Components → table:
- [`components/table/index.ts`](src/features/keyword-research/components/table/index.ts:1) — table exports + `createColumns`.
- [`components/table/KeywordTable.tsx`](src/features/keyword-research/components/table/KeywordTable.tsx:70) — **production** table (UI preserved, TanStack v8 logic inside).
- Column factory: [`components/table/columns/columns.tsx`](src/features/keyword-research/components/table/columns/columns.tsx:55) (currently unused by production table; cleanup candidate).

Components → drawers:
- [`components/drawers/index.ts`](src/features/keyword-research/components/drawers/index.ts:1) — drawer exports.
- [`components/drawers/KeywordDrawer.tsx`](src/features/keyword-research/components/drawers/KeywordDrawer.tsx:13) — store-bound drawer mount.
- [`components/drawers/KeywordDetailsDrawer.tsx`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:65) — main drawer UI.
- Tabs/widgets: see tree links above.

Components → modals:
- [`components/modals/index.ts`](src/features/keyword-research/components/modals/index.ts:1) — modal barrel exporting `ExportModal`, `FilterPresetsModal`, `KeywordDetailsModal`. Evidence: [`modals/index.ts`](src/features/keyword-research/components/modals/index.ts:5)
- [`components/modals/export-modal.tsx`](src/features/keyword-research/components/modals/export-modal.tsx:1) — export dialog.
- [`components/modals/filter-presets-modal.tsx`](src/features/keyword-research/components/modals/filter-presets-modal.tsx:1) — presets.

Components → shared:
- [`components/shared/index.tsx`](src/features/keyword-research/components/shared/index.tsx:1) — shared exports.
- [`components/shared/empty-states.tsx`](src/features/keyword-research/components/shared/empty-states.tsx:1) — empty state UIs.
- [`components/shared/error-boundary.tsx`](src/features/keyword-research/components/shared/error-boundary.tsx:1) — boundary.
- [`components/shared/loading-skeleton.tsx`](src/features/keyword-research/components/shared/loading-skeleton.tsx:1) — skeletons.

Config:
- [`config/index.ts`](src/features/keyword-research/config/index.ts:1) — config barrel.
- [`config/api-config.ts`](src/features/keyword-research/config/api-config.ts:1) — legacy client URL builder for `/api/keyword-magic/*` endpoints (not used in current Server Actions path). Evidence: [`keywordMagicApiConfig.endpoints`](src/features/keyword-research/config/api-config.ts:10)
- [`config/feature-config.ts`](src/features/keyword-research/config/feature-config.ts:1) — feature flags + defaults (note: `defaultCountry` uses lowercase `"us"`). Evidence: [`FEATURE_CONFIG.ui.defaultCountry`](src/features/keyword-research/config/feature-config.ts:26)

Constants:
- [`constants/index.ts`](src/features/keyword-research/constants/index.ts:1) — countries/KD/intent/presets/defaults.
- [`constants/table-config.ts`](src/features/keyword-research/constants/table-config.ts:1) — legacy table column definitions + SERP icon mapping + KD levels. Evidence: [`TABLE_COLUMNS`](src/features/keyword-research/constants/table-config.ts:93)

Data:
- [`data/index.ts`](src/features/keyword-research/data/index.ts:1) — data barrel exporting `MOCK_KEYWORDS`. Evidence: [`data/index.ts`](src/features/keyword-research/data/index.ts:5)
- [`data/mock-keywords.ts`](src/features/keyword-research/data/mock-keywords.ts:1) — mock keyword dataset.

Hooks:
- [`hooks/index.ts`](src/features/keyword-research/hooks/index.ts:1) — legacy hooks removed; re-export `useDebounce`.

Providers:
- [`providers/index.ts`](src/features/keyword-research/providers/index.ts:1) — legacy provider removed; re-exports `useKeywordStore` for backward compatibility. Evidence: [`providers/index.ts`](src/features/keyword-research/providers/index.ts:4)

Services (server-only):
- [`services/index.ts`](src/features/keyword-research/services/index.ts:7) — server-only services barrel + `keywordMagicAPI`.
- Remaining service files: see tree links above (all listed; internals not cited yet).

Store:
- [`store/index.ts`](src/features/keyword-research/store/index.ts:231) — Zustand store.

Types:
- [`types/index.ts`](src/features/keyword-research/types/index.ts:30) — core domain types.
- [`types/api.types.ts`](src/features/keyword-research/types/api.types.ts:1) — API contract types + helpers `transformAPIKeyword()` and `buildAPIRequest()`. Evidence: [`transformAPIKeyword()`](src/features/keyword-research/types/api.types.ts:301)

Utils:
- [`utils/index.ts`](src/features/keyword-research/utils/index.ts:1) — filter/sort/export + YouTube intelligence exports.
- Remaining util files: see tree links above.

---

## 3) STEP 2 — UI/UX Spec Extraction (Inventory)

यह section **UI के exact controls + handlers + state wiring** को map करता है — ताकि आप “Keyword Explorer” के पूरे UX को spec-level detail में समझ सकें.

### 3.1 Feature root layout + Demo Mode (PLG)

- Feature root component `KeywordResearchContent` client-side है. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:1)
- Guest mode detection Supabase browser client से होता है (`createBrowserClient` + `supabase.auth.getUser()`). Default `isGuest=true` और auth मिलने पर flip होता है. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:78)
- Guest होने पर top banner render होता है: “Demo Mode — Viewing sample data…” + CTA `/register`. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:244)

### 3.2 Header (Seed keyword search + Country + Mode + MatchType + Reset)

Header component: `KeywordResearchHeader`.

**Seed keyword input (actual fetch trigger):**
- Local state: `seedKeyword` (header-level). Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:47)
- Placeholder: `Enter a seed keyword (e.g., 'best crm software')...`. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:109)
- Enter press triggers `handleSearch()` when not searching. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:95)
- “Explore” button triggers `handleSearch()` and disables if empty/ searching. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:117)

**Server Action wiring:**
- `handleSearch()` calls server action [`fetchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:42) with `{ query, country }`. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:68)
- Success path → Zustand store में results set: `setKeywords(result.data.data)`. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:74)

**Mode toggle (Explore vs Bulk):**
- UI: `BulkModeToggle` buttons: Explore/Bulk Analysis. Evidence: [`BulkModeToggle`](src/features/keyword-research/components/search/bulk-mode-toggle.tsx:15)
- Root wiring: `bulkMode={search.mode}` + `onBulkModeChange={(mode) => setMode(mode)}`. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:265)

**Country selector:**
- Root-level local UI state: `selectedCountry` + popover open state `countryOpen`. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:144)
- Header gets country props + callbacks, and root also writes to store `setCountry(country?.code || "US")`. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:269)

**Match type toggle + Reset:**
- Root passes `matchType={filters.matchType}` and updates via `setFilter("matchType", type)`. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:275)
- Reset button shows only if `activeFilterCount > 0` and triggers `resetFilters`. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:161)

### 3.3 Explore mode body: (A) Filter text row + (B) Filter popovers row

Explore mode में root दो rows दिखाता है:

**Row 1: Filter keywords (client-side filter text):**
- Component `KeywordResearchSearch` (simple input) “Filter keywords…”. Evidence: [`KeywordResearchSearch`](src/features/keyword-research/components/page-sections/KeywordResearchSearch.tsx:25)
- Root binding: `filters.searchText` + `setFilter("searchText", text)`. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:286)

**Row 2: Filter popovers wrapper:**
- Root uses local popover states in `KeywordResearchFiltersWrapper` (volume/kd/cpc/intent/geo/serp/weakSpot/trend) and applies via `setFilter(...)` on Apply. Evidence: [`KeywordResearchContent`](src/features/keyword-research/keyword-research-content.tsx:322)

### 3.4 Bulk mode body: BulkKeywordsInput

- Bulk textarea placeholder: “Paste up to 100 keywords, one per line...”. Evidence: [`BulkKeywordsInput`](src/features/keyword-research/components/search/bulk-keywords-input.tsx:25)
- Count display uses `MAX_BULK_KEYWORDS` + `parseBulkKeywords`. Evidence: [`BulkKeywordsInput`](src/features/keyword-research/components/search/bulk-keywords-input.tsx:9)
- “Analyze Keywords” button → `onAnalyze(parseBulkKeywords(value))`. Evidence: [`BulkKeywordsInput`](src/features/keyword-research/components/search/bulk-keywords-input.tsx:34)

Bulk analyze handler (current state):
- Root `handleBulkAnalyze()` अभी “API integration pending” toast + sessionStorage write करता है; 1 keyword case में navigate to `/dashboard/research/overview/<keyword>` करता है. Evidence: [`handleBulkAnalyze()`](src/features/keyword-research/keyword-research-content.tsx:197)

### 3.5 Results section (loading/empty/table/drawer)

Results wrapper: `KeywordResearchResults`.

- Loading state shows spinner “Searching keywords…”. Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:41)
- Empty state दो types:
  - filters active → “No keywords found” / “Try adjusting…” Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:56)
  - no filters → “Ready to explore keywords” / “Enter a seed keyword…” Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:67)
- Main table currently renders legacy `KeywordTable` (TanStack वाला `KeywordDataTable` default usage में नहीं है). Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:93)
- Row click → opens drawer by store action `openKeywordDrawer(keyword)`. Evidence: [`handleKeywordClick`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:37)

### 3.6 Legacy Table top action bar (Export / Copy / To Clusters / Credits)

- Guest gating uses `guardAction(actionName, callback)`; guest होने पर toast + CTA “Sign Up Free” → `/register`. Evidence: [`guardAction()`](src/features/keyword-research/components/table/KeywordTable.tsx:53)
- Copy button: selected keywords को TSV-like format में clipboard में डालता है. Evidence: [`handleCopy()`](src/features/keyword-research/components/table/KeywordTable.tsx:102)
- Export CSV: `downloadKeywordsCSV(data, selectedRows)` calls export util. Evidence: [`handleExportCSV()`](src/features/keyword-research/components/table/KeywordTable.tsx:154) + [`downloadKeywordsCSV()`](src/features/keyword-research/utils/export-utils.ts:1)
- “To Topic Clusters” export:
  - localStorage keys: `keyword-explorer-export`, `keyword-explorer-export-time`.
  - navigates to `/topic-clusters`. Evidence: [`handleExportToTopicCluster()`](src/features/keyword-research/components/table/KeywordTable.tsx:127)
- Credits display: `CreditBalance` component. Evidence: [`KeywordTable`](src/features/keyword-research/components/table/KeywordTable.tsx:24)

### 3.7 Drawer UX

- Drawer is a dialog-based sheet: `KeywordDetailsDrawer` with tabs. Evidence: [`KeywordDetailsDrawer`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:65)
- Top actions:
  - “✍️ Write Content” uses `onWriteClick?.(keyword)` (caller-driven). Evidence: [`KeywordDetailsDrawer`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:217)
  - “📊 Keyword Overview” navigates via `window.location.href = /keyword-overview?...`. Evidence: [`KeywordDetailsDrawer`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:225)
- Footer CTA: “🚀 View Full Deep GEO Report” → `/dashboard/research/geo-report/<keyword>`. Evidence: [`KeywordDetailsDrawer`](src/features/keyword-research/components/drawers/KeywordDetailsDrawer.tsx:327)

Social tab gating:
- Social tab initially locked (`state === "idle"`) और “🔄 Load Social Data (⚡ 1 Credit)” button दिखाता है. Evidence: [`LockedState`](src/features/keyword-research/components/drawers/SocialTab.tsx:102)

---

## 4) STEP 3 — Table System (Columns Spec)

यह feature में **single production table** है:

1) **TanStack v8-powered table**: `KeywordTable` (legacy UI preserved, logic is TanStack). Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:93) + [`useReactTable()`](src/features/keyword-research/components/table/KeywordTable.tsx:508)

Note:
- `createColumns()` exists but is not wired into the production table currently: [`createColumns()`](src/features/keyword-research/components/table/columns/columns.tsx:55)

### 4.1 Legacy table columns (11 slots; 10 “high value” + refresh)

Legacy table ने `<colgroup>` में fixed widths declare किए हैं. Order (left → right):

1. Checkbox (40px)
2. Keyword (220px)
3. Intent (70px)
4. Volume (80px)
5. Trend (80px)
6. KD (60px)
7. CPC (60px)
8. Weak Spot (180px)
9. GEO (60px)
10. SERP (100px)
11. Refresh (50px)

Evidence: [`KeywordTable` colgroup](src/features/keyword-research/components/table/KeywordTable.tsx:297)

Header semantics:
- Volume, Trend, KD, CPC, GEO sortable icons. Evidence: [`KeywordTableHeader`](src/features/keyword-research/components/table/KeywordTableHeader.tsx:58)
- “Weak Spot”, “SERP” tooltips explain meaning. Evidence: [`KeywordTableHeader`](src/features/keyword-research/components/table/KeywordTableHeader.tsx:90)
- Last column header is bulk refresh/credits header: `RefreshCreditsHeader`. Evidence: [`KeywordTableHeader`](src/features/keyword-research/components/table/KeywordTableHeader.tsx:127) + [`RefreshCreditsHeader`](src/features/keyword-research/components/table/columns/refresh/RefreshCreditsHeader.tsx:1)

Row refresh behavior:
- Per-row refresh cell computes “Just now / Xm ago / …” and calls server action `refreshKeywordAction(...)`. Evidence: [`RefreshColumn`](src/features/keyword-research/components/table/columns/refresh/refresh-column.tsx:84)

### 4.2 TanStack table columns (strict 11-column layout)

`createColumns()` returns exactly **11 columns**, with explicit sizes. Evidence: [`createColumns()`](src/features/keyword-research/components/table/columns/columns.tsx:55)

| # | Column | Source | Sorting | Renderer | Evidence |
|---:|---|---|---|---|---|
| 1 | Select | row selection | ❌ | `<Checkbox>` | [`createColumns` select](src/features/keyword-research/components/table/columns/columns.tsx:66) |
| 2 | Keyword | `keyword` | ✅ | `KeywordColumn` (copy + google search buttons) | [`KeywordColumn`](src/features/keyword-research/components/table/columns/keyword/keyword-column.tsx:24) |
| 3 | Volume | `volume` | ✅ | `VolumeColumn` (K/M formatting) | [`VolumeColumn`](src/features/keyword-research/components/table/columns/volume/volume-column.tsx:17) |
| 4 | Trend | `trend` array | ❌ | `TrendColumn` sparkline + % change | [`TrendColumn`](src/features/keyword-research/components/table/columns/trend/trend-column.tsx:22) |
| 5 | KD | `kd` | ✅ | `KdColumn` + tooltip + progress bar | [`KdColumn`](src/features/keyword-research/components/table/columns/kd/kd-column.tsx:31) |
| 6 | CPC | `cpc` | ✅ | `CpcColumn` + tooltip | [`CpcColumn`](src/features/keyword-research/components/table/columns/cpc/cpc-column.tsx:29) |
| 7 | Intent | `intent` codes | ❌ | `IntentColumn` (color-coded) | [`IntentColumn`](src/features/keyword-research/components/table/columns/intent/intent-column.tsx:62) |
| 8 | Weak Spot | `weakSpots` | ❌ | `WeakSpotColumn` multi-badge (ranks ≤ 10 only) | [`WeakSpotColumn`](src/features/keyword-research/components/table/columns/weak-spot/weak-spot-column.tsx:104) |
| 9 | GEO | `geoScore` + `hasAio` | ✅ | `GeoColumn` (badge + bot icon if AI overview) | [`GeoColumn`](src/features/keyword-research/components/table/columns/geo/geo-column.tsx:48) |
| 10 | SERP | `serpFeatures` | ❌ | `SerpColumn` (icons + “+N”) | [`SerpColumn`](src/features/keyword-research/components/table/columns/serp/serp-column.tsx:41) |
| 11 | Refresh | `lastUpdated` + action | ❌ | date label + ghost refresh button | [`createColumns` refresh](src/features/keyword-research/components/table/columns/columns.tsx:276) |

Important detail: TanStack `createColumns()` **Actions column define नहीं करता** (हालाँकि `ActionsColumn` component मौजूद है). Evidence: [`ActionsColumn`](src/features/keyword-research/components/table/columns/actions/actions-column.tsx:48)

---

## 5) STEP 4 — Data Flow (State, Query, Caching)

यह section बताता है कि “search → fetch → store → filter → table → drawer” flow कैसे चलता है.

### 5.1 Central state: Zustand store (`useKeywordStore`)

- Store `keywords`, `filters`, `search`, `selectedKeyword`, `drawerCache`, `credits` manage करता है. Evidence: [`KeywordState`](src/features/keyword-research/store/index.ts:140)
- Filter schema fields: `searchText`, `matchType`, ranges, intents, serp features, include/exclude, trend filters, weak spot toggle/types. Evidence: [`KeywordFilters`](src/features/keyword-research/store/index.ts:38)

### 5.2 Search flow (seed keyword → server action → store)

1) User types seed keyword in header and clicks Explore
2) Header calls server action [`fetchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:42)
3) Action calls `keywordService.fetchKeywords(query, country)` (server-only) and returns `Keyword[]`. Evidence: [`fetchKeywords()`](src/features/keyword-research/actions/fetch-keywords.ts:42) + [`keywordService.fetchKeywords()`](src/features/keyword-research/services/keyword.service.ts:64)
4) UI receives and stores via `setKeywords(...)` in Zustand. Evidence: [`KeywordResearchHeader`](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:74)

### 5.3 Filtering flow (client-side)

- Root computes `filteredKeywords = applyAllFilters(storeKeywords, {...filters})` with a debounced filterText. Evidence: [`applyAllFilters`](src/features/keyword-research/keyword-research-content.tsx:158) + [`useDebounce()`](hooks/use-debounce.ts:1)
- Active filter count is calculated purely from filter state. Evidence: [`getActiveFilterCount()`](src/features/keyword-research/keyword-research-content.tsx:48)

**Note:** Table filtering currently happens upstream in feature root (client-side) and `KeywordTable` receives already-filtered `keywords`. Evidence: [`KeywordResearchContent` filtering](src/features/keyword-research/keyword-research-content.tsx:158) + [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:93)

### 5.4 URL sync (share/bookmark)

- Root reads initial params: `q` + `country`. Evidence: [`useSearchParams()`](src/features/keyword-research/keyword-research-content.tsx:103)
- Root writes current filter text + country to URL via `window.history.replaceState`. Evidence: [`URL sync effect`](src/features/keyword-research/keyword-research-content.tsx:222)

### 5.5 Drawer flow (row click → drawer open)

- Results: `onKeywordClick` calls `openKeywordDrawer(keyword)` store action. Evidence: [`KeywordResearchResults`](src/features/keyword-research/components/page-sections/KeywordResearchResults.tsx:34)
- Drawer uses `selectedKeyword` to render details. Evidence: [`openKeywordDrawer`](src/features/keyword-research/store/index.ts:197)

### 5.6 Drawer cache + TTL (Social/Commerce)

- Store keeps `drawerCache[keyword]` entries with `fetchedAt` and a TTL of 5 minutes. Evidence: [`DRAWER_CACHE_TTL`](src/features/keyword-research/store/index.ts:90)
- `getCachedData()` returns null when expired. Evidence: [`getCachedData()`](src/features/keyword-research/store/index.ts:358)
- Social tab reads cache on keyword change; if present, it avoids network call. Evidence: [`SocialTab` cache effect](src/features/keyword-research/components/drawers/SocialTab.tsx:284)

---

## 6) STEP 5 — Math / Formulas / Scoring (expanded)

### 6.1 Trend % change (Table + Overview)

- TanStack `TrendColumn` uses: `change = ((last - first) / first) * 100` (with guard), and threshold ±5% for up/down/stable. Evidence: [`TrendColumn` change](src/features/keyword-research/components/table/columns/trend/trend-column.tsx:32)
- Drawer `OverviewTab` uses a similar growth calc over 12-month trend. Evidence: [`OverviewTab` trendGrowth](src/features/keyword-research/components/drawers/OverviewTab.tsx:132)

### 6.2 KD (Difficulty bands)

- `KdColumn` bands:
  - ≤14 Very Easy, ≤29 Easy, ≤49 Moderate, ≤69 Difficult, ≤84 Hard, else Very Hard. Evidence: [`getKdLevel()`](src/features/keyword-research/components/table/columns/kd/kd-column.tsx:22)
- Drawer KD gauge uses color thresholds (≤29 emerald, ≤49 amber, ≤69 orange, else rose). Evidence: [`KdGauge`](src/features/keyword-research/components/drawers/OverviewTab.tsx:45)

### 6.3 CPC bands

- `CpcColumn` bands: ≤0.5 Low, ≤2 Medium, ≤5 High, else Very High. Evidence: [`getCpcLevel()`](src/features/keyword-research/components/table/columns/cpc/cpc-column.tsx:22)

### 6.4 Weak Spots detection (Live SERP)

- Live SERP service only checks top 10 organic and matches domains against platform list. Evidence: [`extractWeakSpots()`](src/features/keyword-research/services/live-serp.ts:107)

### 6.5 SERP feature mapping

- `SERP_FEATURE_MAP` converts DataForSEO `item_types` → internal `SERPFeature` union, de-duplicated. Evidence: [`SERP_FEATURE_MAP`](src/features/keyword-research/services/live-serp.ts:69) + [`extractSerpFeatures()`](src/features/keyword-research/services/live-serp.ts:139)

### 6.6 GEO score calculation

- Live SERP computes GEO score with `calculateGeoScore(hasAio, hasSnippet, intent, wordCount)`. Evidence: [`fetchLiveSerp` geoScore](src/features/keyword-research/services/live-serp.ts:229)

### 6.7 RTV

- Refresh orchestrator uses `calculateRtv({ volume, cpc, serpFeatures })`. Evidence: [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:240)

### 6.8 YouTube Intelligence Engine

- Social tab calls `analyzeYouTubeCompetition(videoInputs)` + `analyzeVideosWithBadges(videoInputs)` after fetching/caching. Evidence: [`processYouTubeData()`](src/features/keyword-research/components/drawers/SocialTab.tsx:269)

---

## 7) STEP 6 — API Map (Internal + External)

### 7.1 Internal “entry” APIs (Server Actions)

| User intent | Entry function | Auth | Purpose | Evidence |
|---|---|---|---|---|
| Seed keyword explore | `fetchKeywords` | `publicAction` | PLG demo allowed keyword fetch | [`fetchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:42) |
| Bulk search | `bulkSearchKeywords` | `authAction` | authenticated Labs bulk fetch | [`bulkSearchKeywords`](src/features/keyword-research/actions/fetch-keywords.ts:75) |
| Drawer: Social | `fetchSocialInsights` | `authAction` | YouTube + Reddit + Pinterest aggregation | [`fetchSocialInsights`](src/features/keyword-research/actions/fetch-drawer-data.ts:201) |
| Drawer: Commerce | `fetchAmazonData` | `authAction` | Amazon PA-API placeholder / mock | [`fetchAmazonData`](src/features/keyword-research/actions/fetch-drawer-data.ts:91) |
| Refresh keyword (credits + live SERP + RTV) | `refreshKeywordAction` | `authAction` | deduct 1 credit + DataForSEO SERP + update DB | [`refreshKeywordAction`](src/features/keyword-research/actions/refresh-keyword.ts:225) |
| Credits fetch | `getUserCreditsAction` | `authAction` | credits_total/used/remaining | [`getUserCreditsAction`](src/features/keyword-research/actions/refresh-keyword.ts:325) |

### 7.2 External APIs (DataForSEO)

**Historical keyword research (Labs):**
- Related keywords: `/v3/dataforseo_labs/google/related_keywords/live`. Evidence: [`fetchBulkKeywords` endpoint](src/features/keyword-research/services/keyword-discovery.ts:18)

**Live SERP:**
- Google Organic SERP Advanced: `/v3/serp/google/organic/live/advanced`. Evidence: [`fetchLiveSerp`](src/features/keyword-research/services/live-serp.ts:190)

**Social:**
- YouTube SERP Advanced: `/v3/serp/youtube/organic/live/advanced`. Evidence: [`fetchYouTubeData`](src/features/keyword-research/services/social.service.ts:222)
- Reddit Social: `/v3/business_data/social_media/reddit/live`. Evidence: [`fetchRedditData`](src/features/keyword-research/services/social.service.ts:277)
- Pinterest Social: `/v3/business_data/social_media/pinterest/live`. Evidence: [`fetchPinterestData`](src/features/keyword-research/services/social.service.ts:321)

### 7.3 Legacy/unused API config (potential tech debt)

- `keywordMagicApiConfig` अभी `/api/keyword-magic/*` endpoints declare करता है, पर current feature path Server Actions पर है. Evidence: [`keywordMagicApiConfig`](src/features/keyword-research/config/api-config.ts:8)

---

## 8) STEP 7 — Risks + Fix Suggestions (expanded)

### 8.1 Hydration / render-loop risk (legacy table)

- `KeywordTable` props बदलने पर render के अंदर `setKeywords(keywordsProp)` call करता है. यह React में anti-pattern है और hydration warnings / render loop कर सकता है. Evidence: [`KeywordTable` setState-in-render](src/features/keyword-research/components/table/KeywordTable.tsx:72)

**Fix suggestion (conceptual):** `useEffect(() => setKeywords(keywordsProp ?? MOCK_KEYWORDS), [keywordsProp])` pattern.

### 8.2 Credits mismatch (UX vs backend)

- Social tab locked CTA “⚡ 1 Credit” दिखाती है, पर `fetchSocialInsights` action में कोई credit deduction logic नहीं है. Evidence: [`LockedState` copy](src/features/keyword-research/components/drawers/SocialTab.tsx:102) + [`fetchSocialInsights`](src/features/keyword-research/actions/fetch-drawer-data.ts:201)
- Bulk search action explicitly TODO: “Deduct 1 Credit”. Evidence: [`bulkSearchKeywords` TODO](src/features/keyword-research/actions/fetch-keywords.ts:89)

### 8.3 Country code normalization drift

- `fetchKeywords` schema `country` default “us” रखता है, जबकि UI path `"US"` भेजता है. Evidence: [`FetchKeywordsSchema`](src/features/keyword-research/actions/fetch-keywords.ts:24) + [`KeywordResearchHeader` call](src/features/keyword-research/components/page-sections/KeywordResearchHeader.tsx:68)

यह break नहीं करता (service lowercases), पर consistency rules जरूरी हैं.

### 8.4 DB update assumptions in refresh

- Refresh action `keywords` table में JSON columns update करने की कोशिश करता है (“schema migration pending” comment). अगर production DB schema mismatch हुआ तो update silently fail हो सकता है. Evidence: [`updateKeywordInDb()`](src/features/keyword-research/actions/refresh-keyword.ts:183)

### 8.5 Columns duplication risk (maintenance risk)

- Production table (`KeywordTable`) में columns inline defined हैं. Evidence: [`KeywordTable` columns](src/features/keyword-research/components/table/KeywordTable.tsx:141)
- Parallel `createColumns()` column factory भी repo में मौजूद है, पर currently used नहीं है. Evidence: [`createColumns()`](src/features/keyword-research/components/table/columns/columns.tsx:55)
- Risk: two column definitions drift.

**Fix direction:** Either `KeywordTable` को `createColumns()` पर shift करें, या `createColumns()` exports/delete करके single source of truth रखें.

### 8.6 Demo-mode proxy hardcode

- `proxy.ts` में demo routes list और `isDemoMode = true` जैसे blocks security risk बना सकते हैं. Evidence: [`proxy.ts`](proxy.ts:79) + [`proxy.ts`](proxy.ts:182)

---

## 9) Glossary

- `RTV`: Realizable Traffic Value — refresh action में `calculateRtv()` से derived. Evidence: [`calculateRtv()`](src/features/keyword-research/utils/rtv-calculator.ts:115)
- `GEO`: Generative Engine Optimization score — live SERP में `calculateGeoScore()` से computed. Evidence: [`calculateGeoScore()`](src/features/keyword-research/utils/geo-calculator.ts:47)
- `Weak Spot`: SERP में Reddit/Quora/Pinterest का top-10 presence (easy outrank signal). Evidence: [`extractWeakSpots()`](src/features/keyword-research/services/live-serp.ts:107)
- `SERPFeature`: DataForSEO `item_types` mapping से derived union. Evidence: [`SERP_FEATURE_MAP`](src/features/keyword-research/services/live-serp.ts:69)
- `PLG Demo`: Guest users को `publicAction` based exploration देना (no auth). Evidence: [`fetchKeywords` uses `publicAction`](src/features/keyword-research/actions/fetch-keywords.ts:42)


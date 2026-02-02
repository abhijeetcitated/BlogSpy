# 🐉 KEYWORD EXPLORER - DRAGON MASTER DOCUMENTATION
## Complete A-Z File/Folder/Import/Export Connection Map

**Document Version:** DRAGON LEVEL v1.0  
**Date:** January 31, 2026  
**Author:** Senior Architect Audit  
**Total Files:** 108 files  
**Total Lines of Code:** ~15,000+ LOC  

---

## 📊 EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Total Directories | 32 |
| Total Files | 108 |
| Main Entry Point | `keyword-research-content.tsx` |
| State Management | Zustand (804 lines) |
| Server Actions | 7 files |
| Services (Server-Only) | 11 files |
| UI Components | 60+ files |
| Utility Functions | 19 files |

---

## 🌳 COMPLETE FILE TREE WITH PURPOSE

```
src/features/keyword-research/               # FEATURE ROOT (108 files)
├── index.ts                                  # 🔴 MASTER BARREL EXPORT (176 lines)
├── keyword-research-content.tsx              # 🔴 MAIN COMPONENT (651 lines)
│
├── 📁 actions/                               # SERVER ACTIONS (7 files)
│   ├── index.ts                              # Barrel export
│   ├── fetch-keywords.ts                     # 🔴 CRITICAL: Main keyword fetch
│   ├── fetch-drawer-data.ts                  # Drawer data fetch (Commerce/Social)
│   ├── fetch-social-intel.ts                 # Social intelligence API
│   ├── filter-presets.ts                     # User filter preset CRUD
│   ├── refresh-keyword.ts                    # 🔴 Single keyword refresh
│   └── refresh-bulk.ts                       # Bulk refresh (up to 50)
│
├── 📁 components/                            # UI COMPONENTS (60+ files)
│   ├── index.ts                              # 🔴 MASTER COMPONENT BARREL (101 lines)
│   │
│   ├── 📁 page-sections/                     # PAGE LAYOUT (5 files)
│   │   ├── index.ts                          # Barrel
│   │   ├── KeywordResearchHeader.tsx         # Country + Credits display
│   │   ├── KeywordResearchSearch.tsx         # 🔴 Search bar + Bulk input
│   │   ├── KeywordResearchFilters.tsx        # Filter toolbar (10 filters)
│   │   └── KeywordResearchResults.tsx        # Table + Pagination wrapper
│   │
│   ├── 📁 header/                            # HEADER COMPONENTS (5 files)
│   │   ├── index.ts                          # Barrel
│   │   ├── CountrySelector.tsx               # Country dropdown
│   │   ├── CreditBalance.tsx                 # Credits display
│   │   ├── PageHeader.tsx                    # Logo + Nav
│   │   └── ResultsHeader.tsx                 # Results count + sort
│   │
│   ├── 📁 search/                            # SEARCH COMPONENTS (8 files)
│   │   ├── index.ts                          # Barrel
│   │   ├── SearchBar.tsx                     # Main search wrapper
│   │   ├── SearchInput.tsx                   # Text input field
│   │   ├── SearchButton.tsx                  # Submit button
│   │   ├── SearchSuggestions.tsx             # Autocomplete dropdown
│   │   ├── BulkModeToggle.tsx                # Single/Bulk toggle
│   │   ├── BulkKeywordsInput.tsx             # Bulk textarea
│   │   └── GuestSearchHandler.tsx            # Guest mode handler
│   │
│   ├── 📁 filters/                           # FILTER COMPONENTS (17 files)
│   │   ├── index.ts                          # Barrel (10 filters exported)
│   │   ├── FilterBar.tsx                     # Filter toolbar container
│   │   ├── IntentFilter.tsx                  # Intent dropdown
│   │   ├── SerpFilter.tsx                    # SERP features multi-select
│   │   ├── IncludeExcludeFilter.tsx          # Include/Exclude keywords
│   │   │
│   │   ├── 📁 volume/                        # Volume filter
│   │   │   ├── index.ts
│   │   │   └── VolumeFilter.tsx
│   │   │
│   │   ├── 📁 kd/                            # KD filter
│   │   │   ├── index.ts
│   │   │   └── KDFilter.tsx
│   │   │
│   │   ├── 📁 cpc/                           # CPC filter
│   │   │   ├── index.ts
│   │   │   └── CPCFilter.tsx
│   │   │
│   │   ├── 📁 geo/                           # GEO Score filter
│   │   │   ├── index.ts
│   │   │   └── GeoFilter.tsx
│   │   │
│   │   ├── 📁 weak-spot/                     # Weak Spot filter
│   │   │   ├── index.ts
│   │   │   └── WeakSpotFilter.tsx
│   │   │
│   │   ├── 📁 trend/                         # Trend filter
│   │   │   ├── index.ts
│   │   │   └── TrendFilter.tsx
│   │   │
│   │   └── 📁 match-type/                    # Match type toggle
│   │       ├── index.ts
│   │       └── MatchTypeToggle.tsx
│   │
│   ├── 📁 table/                             # TABLE COMPONENTS (21 files)
│   │   ├── index.ts                          # Barrel
│   │   ├── KeywordTable.tsx                  # 🔴 MAIN TABLE (TanStack)
│   │   ├── KeywordTableFooter.tsx            # Pagination footer
│   │   │
│   │   ├── 📁 action-bar/                    # Bulk action toolbar (4 files)
│   │   │   ├── index.ts                      # Barrel
│   │   │   ├── ActionBar.tsx                 # Container
│   │   │   ├── BulkActions.tsx               # Refresh/Export buttons
│   │   │   └── SelectionInfo.tsx             # "X selected" display
│   │   │
│   │   └── 📁 columns/                       # COLUMN COMPONENTS (15 files)
│   │       ├── index.ts                      # Barrel (12 columns)
│   │       ├── columns.tsx                   # Column definitions
│   │       ├── TrendSparkline.tsx            # Sparkline chart
│   │       │
│   │       ├── 📁 checkbox/                  # Selection column
│   │       │   ├── index.ts
│   │       │   ├── CheckboxColumn.tsx
│   │       │   └── CheckboxHeader.tsx
│   │       │
│   │       ├── 📁 keyword/                   # Keyword text column
│   │       │   ├── index.ts
│   │       │   └── KeywordColumn.tsx
│   │       │
│   │       ├── 📁 volume/                    # Volume column
│   │       │   ├── index.ts
│   │       │   └── VolumeColumn.tsx
│   │       │
│   │       ├── 📁 kd/                        # KD column
│   │       │   ├── index.ts
│   │       │   └── KdColumn.tsx
│   │       │
│   │       ├── 📁 cpc/                       # CPC column
│   │       │   ├── index.ts
│   │       │   └── CpcColumn.tsx
│   │       │
│   │       ├── 📁 intent/                    # Intent column
│   │       │   ├── index.ts
│   │       │   └── IntentColumn.tsx
│   │       │
│   │       ├── 📁 trend/                     # Trend sparkline column
│   │       │   ├── index.ts
│   │       │   └── TrendColumn.tsx
│   │       │
│   │       ├── 📁 serp/                      # SERP features column
│   │       │   ├── index.ts
│   │       │   └── SerpColumn.tsx
│   │       │
│   │       ├── 📁 geo/                       # GEO Score column
│   │       │   ├── index.ts
│   │       │   └── GeoColumn.tsx
│   │       │
│   │       ├── 📁 weak-spot/                 # Weak spot badges column
│   │       │   ├── index.ts
│   │       │   └── WeakSpotColumn.tsx
│   │       │
│   │       ├── 📁 refresh/                   # Refresh button column
│   │       │   ├── index.ts
│   │       │   ├── RefreshColumn.tsx
│   │       │   └── RefreshButton.tsx
│   │       │
│   │       └── 📁 actions/                   # Row actions column
│   │           ├── index.ts
│   │           └── ActionsColumn.tsx
│   │
│   ├── 📁 drawers/                           # DRAWER COMPONENTS (11 files)
│   │   ├── index.ts                          # Barrel (7 exports)
│   │   ├── KeywordDrawer.tsx                 # 🔴 MAIN DRAWER WRAPPER
│   │   ├── KeywordDetailsDrawer.tsx          # Legacy compat
│   │   ├── OverviewTab.tsx                   # Metrics overview tab
│   │   ├── SocialTab.tsx                     # Reddit/Quora/Forums tab
│   │   ├── CommerceTab.tsx                   # Amazon/PPR tab
│   │   ├── YouTubeStrategyPanel.tsx          # YouTube insights
│   │   │
│   │   └── 📁 widgets/                       # Drawer widgets (4 files)
│   │       ├── MetricCard.tsx                # Stat card
│   │       ├── TrendChart.tsx                # Trend line chart
│   │       ├── SERPFeaturesList.tsx          # SERP badges
│   │       └── WeakSpotsBadges.tsx           # Weak spots display
│   │
│   ├── 📁 modals/                            # MODAL COMPONENTS (4 files)
│   │   ├── index.ts                          # Barrel
│   │   ├── ExportModal.tsx                   # CSV/Excel export dialog
│   │   ├── FilterPresetsModal.tsx            # Save/Load presets
│   │   └── KeywordDetailsModal.tsx           # Detail view modal
│   │
│   └── 📁 shared/                            # SHARED COMPONENTS (4 files)
│       ├── index.ts                          # Barrel
│       ├── EmptyState.tsx                    # No results UI
│       ├── ErrorBoundary.tsx                 # Error fallback
│       └── LoadingSkeleton.tsx               # Loading skeleton
│
├── 📁 services/                              # SERVER-ONLY SERVICES (11 files)
│   ├── index.ts                              # 🔴 Combined API (import "server-only")
│   ├── api-base.ts                           # Base fetch wrapper
│   ├── bulk-analysis.service.ts              # Bulk keyword analysis
│   ├── cache.service.ts                      # PostgreSQL cache (kw_cache)
│   ├── credit.service.ts                     # 🔴 Credit deduction atomic
│   ├── dataforseo-labs.service.ts            # DataForSEO Labs API
│   ├── dataforseo-serp.service.ts            # DataForSEO SERP API
│   ├── export.service.ts                     # CSV/Excel generation
│   ├── rate-limit.service.ts                 # Upstash rate limiting
│   ├── refresh.service.ts                    # Keyword refresh logic
│   └── security.service.ts                   # 🔴 Arcjet shield + detectBot
│
├── 📁 store/                                 # ZUSTAND STORE (1 file)
│   └── index.ts                              # 🔴 MAIN STORE (804 lines)
│
├── 📁 types/                                 # TYPE DEFINITIONS (3 files)
│   ├── index.ts                              # Re-exports
│   ├── keyword.types.ts                      # 🔴 Core Keyword type
│   └── api.types.ts                          # API request/response types
│
├── 📁 utils/                                 # UTILITY FUNCTIONS (19 files)
│   ├── index.ts                              # Barrel (selective exports)
│   ├── country-normalizer.ts                 # UK→GB normalization
│   ├── data-mapper.ts                        # API→UI data transform
│   ├── export-utils.ts                       # CSV generation
│   ├── filter-logic.ts                       # 🔴 Filter engine
│   ├── filter-utils.ts                       # Filter helpers
│   ├── format-utils.ts                       # Number formatting
│   ├── keyword-utils.ts                      # Keyword parsing
│   ├── normalization.ts                      # String normalization
│   ├── pagination-utils.ts                   # Page calculations
│   ├── range-utils.ts                        # Range validation
│   ├── serp-utils.ts                         # SERP feature parsing
│   ├── sort-utils.ts                         # Sorting logic
│   ├── social-intel-utils.ts                 # Reddit/Quora helpers
│   ├── trend-utils.ts                        # Trend calculations
│   ├── validation.ts                         # Zod schemas
│   ├── weak-spot-utils.ts                    # Weak spot detection
│   ├── youtube-intelligence.ts               # YouTube strategy
│   └── kd-color.ts                           # KD color coding
│
├── 📁 config/                                # CONFIGURATION (5 files)
│   ├── index.ts                              # Barrel
│   ├── api.config.ts                         # DataForSEO endpoints
│   ├── feature.config.ts                     # Feature flags
│   ├── table.config.ts                       # TanStack config
│   └── credits.config.ts                     # Credit costs
│
├── 📁 constants/                             # CONSTANTS (3 files)
│   ├── index.ts                              # Barrel
│   ├── countries.ts                          # Country list
│   └── filters.ts                            # Filter defaults
│
├── 📁 hooks/                                 # REACT HOOKS (3 files)
│   ├── index.ts                              # Barrel
│   ├── use-debounce.ts                       # Re-export from global
│   └── use-pagination-url-sync.ts            # URL sync
│
├── 📁 providers/                             # CONTEXT PROVIDERS (1 file)
│   └── index.ts                              # Empty (legacy removed)
│
├── 📁 data/                                  # STATIC DATA (2 files)
│   ├── countries-data.ts                     # Full country list
│   └── serp-features-data.ts                 # SERP feature types
│
└── 📁 __mocks__/                             # TEST MOCKS (2 files)
    ├── keyword-data.ts                       # Mock keywords (50)
    └── index.ts                              # Barrel
```

---

## 🔗 IMPORT/EXPORT CHAIN DIAGRAM

### 1️⃣ MASTER BARREL: `index.ts`

```typescript
// EXPORTS TO EXTERNAL CONSUMERS:

// Main Component
export { KeywordResearchContent } from "./keyword-research-content"

// Types (30+ exports)
export type { Keyword, Country, MatchType, BulkMode, ... } from "./types"

// API Utils
export { transformAPIKeyword, buildAPIRequest } from "./types/api.types"

// Constants
export { POPULAR_COUNTRIES, ALL_COUNTRIES, KD_LEVELS, ... } from "./constants"

// Utils (15+ functions)
export { filterByVolume, filterByKD, applyAllFilters, ... } from "./utils"

// Config
export { FEATURE_CONFIG, keywordMagicApiConfig, ... } from "./config"

// Store (Zustand)
export { useKeywordStore, selectKeywords, selectFilters, ... } from "./store"

// Components (40+ exports)
export { KeywordTable, FilterBar, ExportModal, ... } from "./components"
```

### 2️⃣ COMPONENT BARREL: `components/index.ts`

```typescript
// Page sections
export { KeywordResearchHeader } from "./page-sections"
export { KeywordResearchSearch } from "./page-sections"
export { KeywordResearchFilters } from "./page-sections"
export { KeywordResearchResults } from "./page-sections"

// Header
export { CountrySelector, PageHeader, ResultsHeader, CreditBalance } from "./header"

// Search
export { BulkModeToggle, BulkKeywordsInput, SearchInput, SearchSuggestions } from "./search"

// Filters (10 filter components)
export { VolumeFilter, KDFilter, IntentFilter, CPCFilter, ... } from "./filters"

// Table
export { KeywordTable, KeywordTableFooter, ActionBar } from "./table"

// Columns (12 column components)
export { CheckboxColumn, KeywordColumn, VolumeColumn, ... } from "./table/columns"

// Drawers
export { KeywordDetailsDrawer, KeywordDrawer, OverviewTab, ... } from "./drawers"

// Modals
export { ExportModal, FilterPresetsModal, KeywordDetailsModal } from "./modals"

// Shared
export { EmptyState, ErrorBoundary, LoadingSkeleton } from "./shared"
```

### 3️⃣ ACTIONS BARREL: `actions/index.ts`

```typescript
// Server Actions exported:
export { fetchKeywords, bulkSearchKeywords } from "./fetch-keywords"
export { fetchAmazonData, fetchSocialIntel } from "./fetch-drawer-data"
export { refreshKeyword, getUserCreditsAction } from "./refresh-keyword"
export { refreshBulkKeywords } from "./refresh-bulk"
export { getFilterPresets, saveFilterPreset, deleteFilterPreset } from "./filter-presets"
```

### 4️⃣ SERVICES BARREL: `services/index.ts`

```typescript
import "server-only" // 🔴 BLOCKS CLIENT IMPORT

// Combined API object
export const keywordMagicAPI = {
  labs: dataForSEOLabsService,
  serp: dataForSEOSerpService,
  cache: cacheService,
  credits: creditService,
  security: securityService,
  rateLimit: rateLimitService,
  bulk: bulkAnalysisService,
  export: exportService,
  refresh: refreshService,
}
```

---

## 🔄 DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APP ROUTER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  src/app/dashboard/research/keyword-magic/page.tsx                  │
│  └── <ErrorBoundary>                                                 │
│       └── <KeywordResearchContent />                                 │
│                                                                      │
│  src/app/keyword-magic/page.tsx (Demo/Guest)                        │
│  └── <DemoWrapper>                                                   │
│       └── <KeywordResearchContent initialKeywords={MOCK} />          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│              keyword-research-content.tsx (651 lines)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  IMPORTS:                                                            │
│  ├── useKeywordStore (Zustand)                                       │
│  ├── useAuth (Clerk context)                                         │
│  ├── useAction (next-safe-action)                                    │
│  ├── bulkSearchKeywords (Server Action)                              │
│  ├── getFilterPresets (Server Action)                                │
│  ├── applyAllFilters, applyEngineFilters (utils)                     │
│  ├── POPULAR_COUNTRIES, ALL_COUNTRIES (constants)                    │
│  └── All filter components, page-sections                            │
│                                                                      │
│  RENDERS:                                                            │
│  ├── <KeywordResearchHeader />                                       │
│  ├── <KeywordResearchSearch />                                       │
│  ├── <KeywordResearchFilters />                                      │
│  └── <KeywordResearchResults />                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE (804 lines)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STATE:                                                              │
│  ├── keywords: Keyword[]                                             │
│  ├── search: { seedKeyword, country, mode, bulkKeywords }            │
│  ├── filters: KeywordFilters (20+ filter fields)                     │
│  ├── sort: { field, direction }                                      │
│  ├── pagination: { pageIndex, pageSize }                             │
│  ├── loading: { searching, refreshing, exporting }                   │
│  ├── selectedIds: Set<string>                                        │
│  ├── credits: number                                                 │
│  ├── presets: FilterPreset[]                                         │
│  └── drawerState: { open, keyword }                                  │
│                                                                      │
│  SELECTORS:                                                          │
│  ├── selectKeywords, selectFilters, selectSearch                     │
│  ├── selectSort, selectPagination, selectLoading                     │
│  └── selectSelectedIds, selectSelectedCount                          │
│                                                                      │
│  MIDDLEWARE:                                                         │
│  ├── devtools (Redux DevTools)                                       │
│  └── persist (LocalStorage: filter presets only)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│    SERVER ACTIONS (Browser)    │   │   SERVICES (Server-Only)      │
├───────────────────────────────┤   ├───────────────────────────────┤
│                               │   │                               │
│  fetch-keywords.ts            │──▶│  security.service.ts          │
│  ├── Validates input          │   │  ├── Arcjet.shield()          │
│  ├── Calls services           │   │  └── detectBot()              │
│  └── Returns Keyword[]        │   │                               │
│                               │   │  rate-limit.service.ts        │
│  refresh-keyword.ts           │──▶│  ├── Upstash Ratelimit        │
│  ├── getUserCreditsAction     │   │  ├── Guest: 5/10min           │
│  └── Single row refresh       │   │  └── User: 50/10min           │
│                               │   │                               │
│  refresh-bulk.ts              │──▶│  credit.service.ts            │
│  └── Batch refresh (≤50)      │   │  ├── deduct_credits_atomic    │
│                               │   │  └── refund_credits_atomic    │
│  filter-presets.ts            │   │                               │
│  ├── getFilterPresets         │   │  cache.service.ts             │
│  ├── saveFilterPreset         │   │  ├── kw_cache table           │
│  └── deleteFilterPreset       │   │  ├── Labs: 30d TTL            │
│                               │   │  └── SERP: 7d TTL             │
│  fetch-drawer-data.ts         │──▶│                               │
│  ├── fetchAmazonData          │   │  dataforseo-labs.service.ts   │
│  └── fetchSocialIntel         │   │  └── Keywords For Site API    │
│                               │   │                               │
│                               │   │  dataforseo-serp.service.ts   │
│                               │   │  └── Live SERP API            │
│                               │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

## 📦 DETAILED FILE DOCUMENTATION

### 🔴 CRITICAL FILES (Must Not Break)

| File | Lines | Purpose | External Deps |
|------|-------|---------|---------------|
| `keyword-research-content.tsx` | 651 | Main component orchestrator | Zustand, next-safe-action, Clerk |
| `store/index.ts` | 804 | Global state management | zustand, immer |
| `actions/fetch-keywords.ts` | ~300 | Primary data fetch | next-safe-action, Arcjet |
| `actions/refresh-keyword.ts` | ~200 | Single row refresh | Supabase RPC |
| `services/credit.service.ts` | ~150 | Credit deduction | Supabase atomic RPC |
| `services/security.service.ts` | ~100 | Request protection | Arcjet |
| `services/rate-limit.service.ts` | ~100 | Rate limiting | Upstash |
| `types/keyword.types.ts` | ~200 | Core type definitions | None |
| `components/table/KeywordTable.tsx` | ~400 | TanStack Table wrapper | @tanstack/react-table |

### 📁 ACTIONS DIRECTORY (7 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | Barrel | Re-exports all actions |
| `fetch-keywords.ts` | `fetchKeywords`, `bulkSearchKeywords` | Primary keyword API |
| `fetch-drawer-data.ts` | `fetchAmazonData`, `fetchSocialIntel` | Drawer tab data |
| `fetch-social-intel.ts` | `getSocialIntelligence` | Reddit/Quora/Forums |
| `filter-presets.ts` | `getFilterPresets`, `saveFilterPreset`, `deleteFilterPreset` | User presets |
| `refresh-keyword.ts` | `refreshKeyword`, `getUserCreditsAction` | Single refresh |
| `refresh-bulk.ts` | `refreshBulkKeywords` | Batch refresh |

### 📁 SERVICES DIRECTORY (11 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | `keywordMagicAPI` | Combined service object |
| `api-base.ts` | `apiFetch`, `apiPost` | Base fetch wrapper |
| `bulk-analysis.service.ts` | `bulkAnalyze` | Batch processing |
| `cache.service.ts` | `getFromCache`, `saveToCache` | PostgreSQL caching |
| `credit.service.ts` | `deductCredits`, `refundCredits` | Credit transactions |
| `dataforseo-labs.service.ts` | `getKeywordsForSite` | DataForSEO Labs |
| `dataforseo-serp.service.ts` | `getLiveSERP` | DataForSEO SERP |
| `export.service.ts` | `generateCSV`, `generateExcel` | File export |
| `rate-limit.service.ts` | `checkRateLimit` | Upstash rate limit |
| `refresh.service.ts` | `refreshKeywordData` | Refresh logic |
| `security.service.ts` | `validateRequest` | Arcjet protection |

### 📁 STORE DIRECTORY (1 file)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | `useKeywordStore`, `select*`, types | Zustand store with devtools + persist |

**Store State Shape:**
```typescript
interface KeywordState {
  // Data
  keywords: Keyword[]
  credits: number
  
  // Search
  search: {
    seedKeyword: string
    country: Country
    mode: BulkMode
    bulkKeywords: string[]
  }
  
  // Filters (20+ fields)
  filters: KeywordFilters
  presets: FilterPreset[]
  
  // Sort
  sort: SortConfig
  
  // Pagination  
  pagination: PaginationState
  
  // Loading
  loading: LoadingState
  
  // Selection
  selectedIds: Set<string>
  
  // UI
  drawerState: { open: boolean, keyword: Keyword | null }
}
```

### 📁 TYPES DIRECTORY (3 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | Barrel | Re-exports all types |
| `keyword.types.ts` | `Keyword`, `Country`, `MatchType`, etc. | Core domain types |
| `api.types.ts` | `KeywordResearchRequest`, `APIKeyword`, etc. | API contracts |

**Core Keyword Type:**
```typescript
interface Keyword {
  id: string
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: IntentData
  trend: TrendData
  serpFeatures: SERPData
  geoScore: GEOScoreData
  weakSpots: WeakSpotData
  aio: AIOAnalysisData
  rtv: RTVData
  lastUpdated?: string
}
```

### 📁 UTILS DIRECTORY (19 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | Selective exports | Barrel for safe utils |
| `country-normalizer.ts` | `normalizeCountryCode` | UK→GB mapping |
| `data-mapper.ts` | `mapAPIToKeyword` | API transformation |
| `export-utils.ts` | `generateKeywordCSV` | CSV generation |
| `filter-logic.ts` | `applyFilters` | 🔴 Main filter engine |
| `filter-utils.ts` | `filterBy*` functions | Individual filters |
| `format-utils.ts` | `formatVolume`, `formatCPC` | Number formatting |
| `keyword-utils.ts` | `parseKeyword`, `validateKeyword` | Keyword parsing |
| `normalization.ts` | `normalizeString` | String cleanup |
| `pagination-utils.ts` | `getPageItems` | Pagination math |
| `range-utils.ts` | `validateRange`, `clampRange` | Range validation |
| `serp-utils.ts` | `parseSERPFeatures` | SERP parsing |
| `sort-utils.ts` | `sortKeywords` | Multi-field sorting |
| `social-intel-utils.ts` | `parseSocialData` | Reddit/Quora helpers |
| `trend-utils.ts` | `calculateTrend` | Trend calculations |
| `validation.ts` | Zod schemas | Runtime validation |
| `weak-spot-utils.ts` | `detectWeakSpots` | Weak spot logic |
| `youtube-intelligence.ts` | `getYouTubeStrategy` | YouTube insights |
| `kd-color.ts` | `getKDColor` | KD color coding |

### 📁 CONFIG DIRECTORY (5 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | Barrel | Re-exports all config |
| `api.config.ts` | `keywordMagicApiConfig` | API endpoints |
| `feature.config.ts` | `FEATURE_CONFIG` | Feature flags |
| `table.config.ts` | `tableConfig` | TanStack options |
| `credits.config.ts` | `CREDIT_COSTS` | Credit pricing |

### 📁 CONSTANTS DIRECTORY (3 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | Barrel | Re-exports all constants |
| `countries.ts` | `POPULAR_COUNTRIES`, `ALL_COUNTRIES` | Country lists |
| `filters.ts` | `KD_LEVELS`, `INTENT_OPTIONS`, `VOLUME_PRESETS` | Filter options |

### 📁 HOOKS DIRECTORY (3 files)

| File | Exports | Purpose |
|------|---------|---------|
| `index.ts` | Barrel | Re-exports hooks |
| `use-debounce.ts` | `useDebounce` | Re-export from global |
| `use-pagination-url-sync.ts` | `usePaginationUrlSync` | URL sync |

---

## 🔌 EXTERNAL DEPENDENCIES

### NPM Packages Used

| Package | Version | Usage |
|---------|---------|-------|
| `zustand` | ^4.x | State management |
| `@tanstack/react-table` | ^8.x | Table virtualization |
| `next-safe-action` | ^7.x | Server Actions |
| `@arcjet/next` | ^1.x | Security shield |
| `@upstash/ratelimit` | ^1.x | Rate limiting |
| `zod` | ^3.x | Validation |
| `sonner` | ^1.x | Toast notifications |
| `lucide-react` | ^0.x | Icons |
| `recharts` | ^2.x | Sparkline charts |

### Internal Imports

```typescript
// From lib/
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

// From contexts/
import { useAuth } from "@/contexts/auth-context"

// From hooks/
import { useDebounce } from "@/hooks/use-debounce"

// From components/ui/ (shadcn)
import { Button, Input, Dialog, DropdownMenu, ... } from "@/components/ui"

// From types/
import type { SortDirection } from "@/types/shared"
```

---

## 📊 COMPONENT HIERARCHY

```
KeywordResearchContent
├── KeywordResearchHeader
│   ├── PageHeader
│   ├── CountrySelector
│   └── CreditBalance
│
├── KeywordResearchSearch
│   ├── SearchBar
│   │   ├── SearchInput
│   │   └── SearchButton
│   ├── BulkModeToggle
│   ├── BulkKeywordsInput
│   └── SearchSuggestions
│
├── KeywordResearchFilters
│   └── FilterBar
│       ├── VolumeFilter
│       ├── KDFilter
│       ├── IntentFilter
│       ├── CPCFilter
│       ├── GeoFilter
│       ├── WeakSpotFilter
│       ├── SerpFilter
│       ├── TrendFilter
│       ├── IncludeExcludeFilter
│       └── MatchTypeToggle
│
├── KeywordResearchResults
│   ├── ResultsHeader
│   ├── ActionBar
│   │   ├── SelectionInfo
│   │   └── BulkActions
│   │
│   ├── KeywordTable (TanStack)
│   │   ├── CheckboxHeader / CheckboxColumn
│   │   ├── KeywordColumn
│   │   ├── VolumeColumn
│   │   ├── KdColumn
│   │   ├── CpcColumn
│   │   ├── IntentColumn
│   │   ├── TrendColumn (+ TrendSparkline)
│   │   ├── SerpColumn
│   │   ├── GeoColumn
│   │   ├── WeakSpotColumn
│   │   ├── RefreshColumn
│   │   └── ActionsColumn
│   │
│   └── KeywordTableFooter (Pagination)
│
├── KeywordDetailsDrawer (Sheet)
│   ├── OverviewTab
│   │   ├── MetricCard (x6)
│   │   ├── TrendChart
│   │   ├── SERPFeaturesList
│   │   └── WeakSpotsBadges
│   │
│   ├── SocialTab
│   │   └── Social Intelligence widgets
│   │
│   ├── CommerceTab
│   │   └── Amazon/PPR widgets
│   │
│   └── YouTubeStrategyPanel
│       └── YouTubeVideoCard (x3)
│
└── Modals
    ├── ExportModal
    ├── FilterPresetsModal
    └── KeywordDetailsModal
```

---

## 🛡️ SECURITY FLOW

```
Request Flow:
─────────────
Browser → Server Action → Arcjet Shield → Rate Limit → Credit Check → DataForSEO API
                             │                │              │
                             ▼                ▼              ▼
                         Block if:       Block if:      Block if:
                         - Bot detected  - >50/10min    - Credits = 0
                         - Suspicious IP - Guest >5/10m - Deduct failed
```

---

## 💰 CREDIT SYSTEM FLOW

```
Search Flow:
────────────
1. User clicks "Search"
2. Server Action: refreshKeyword.ts
3. creditService.deductCredits(userId, cost)
4. Supabase RPC: deduct_credits_atomic(user_id, amount)
   └── SELECT ... FOR UPDATE (row lock)
   └── UPDATE credits SET balance = balance - amount
   └── RETURN success/failure
5. If success → Call DataForSEO API
6. If API fails → creditService.refundCredits(userId, cost)
7. Return data to client
```

---

## 📈 FILE COUNT SUMMARY

| Directory | Files | Lines (est.) |
|-----------|-------|--------------|
| `/actions` | 7 | ~1,200 |
| `/components` | 60 | ~6,000 |
| `/services` | 11 | ~1,500 |
| `/store` | 1 | 804 |
| `/types` | 3 | ~500 |
| `/utils` | 19 | ~2,000 |
| `/config` | 5 | ~300 |
| `/constants` | 3 | ~200 |
| `/hooks` | 3 | ~100 |
| `/providers` | 1 | ~10 |
| `/data` | 2 | ~200 |
| `/__mocks__` | 2 | ~300 |
| Root files | 2 | ~830 |
| **TOTAL** | **108** | **~15,000** |

---

## 🎯 KEY TAKEAWAYS

### ✅ STRENGTHS
1. **Clean barrel exports** - Easy to import from feature root
2. **Server-only protection** - Services blocked from client
3. **Atomic credit system** - No race conditions
4. **Comprehensive types** - Full TypeScript coverage
5. **Modular components** - Each column/filter is isolated

### ⚠️ WATCH POINTS
1. **Store size** - 804 lines, consider splitting
2. **Main component** - 651 lines, could extract more
3. **19 util files** - Some overlap possible

### 🚀 PERFORMANCE
1. **TanStack Table** - Virtualized rendering
2. **Zustand** - Minimal re-renders
3. **Server Actions** - No API routes overhead
4. **PostgreSQL cache** - Reduces API calls

---

## 📝 VERSION HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-31 | DRAGON v1.0 | Complete documentation created |
| 2026-01-30 | Audit Complete | All 10 prompts audited |
| 2026-01-30 | Fixes Applied | 6 fixes, 2 files deleted |

---

**Document Status:** ✅ COMPLETE  
**Certification:** 🐉 DRAGON LEVEL APPROVED  
**Next Review:** When major changes occur

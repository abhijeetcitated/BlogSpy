# 🔍 KEYWORD EXPLORER - COMPLETE FILE STRUCTURE & IMPORT/EXPORT MAP

## 📁 COMPLETE TREE STRUCTURE

```
📦 KEYWORD EXPLORER FEATURE
│
├── 🌐 APP ROUTES (Entry Points)
│   ├── app/keyword-magic/page.tsx                    [Demo Page - Public]
│   └── app/dashboard/research/keyword-magic/page.tsx [Dashboard Page - Auth Required]
│
└── 🧩 src/features/keyword-research/                 [Feature Module]
    │
    ├── index.ts                          [Main Barrel Export - 184 lines]
    ├── keyword-research-content.tsx      [Main Component - 516 lines]
    ├── README.md                         [Documentation]
    │
    ├── 📂 actions/                       [Server Actions]
    │   ├── index.ts                      [Barrel Export]
    │   └── search.action.ts              [Search Keywords Action]
    │
    ├── 📂 components/                    [UI Components]
    │   ├── index.ts                      [Components Barrel - 111 lines]
    │   │
    │   ├── 📂 drawers/                   [Side Drawers]
    │   │   ├── index.ts
    │   │   ├── KeywordDetailsDrawer.tsx  [Main Drawer Container]
    │   │   ├── OverviewTab.tsx           [Overview Data Tab]
    │   │   ├── CommerceTab.tsx           [E-commerce Data Tab]
    │   │   └── SocialTab.tsx             [Social Media Data Tab]
    │   │
    │   ├── 📂 filters/                   [Filter Components]
    │   │   ├── index.ts                  [Filters Barrel Export]
    │   │   │
    │   │   ├── 📂 cpc/
    │   │   │   ├── index.ts
    │   │   │   └── cpc-filter.tsx        [CPC Range Filter]
    │   │   │
    │   │   ├── 📂 geo/
    │   │   │   ├── index.ts
    │   │   │   └── geo-filter.tsx        [GEO Score Filter]
    │   │   │
    │   │   ├── 📂 include-exclude/
    │   │   │   ├── index.ts
    │   │   │   └── include-exclude-filter.tsx [Include/Exclude Terms]
    │   │   │
    │   │   ├── 📂 intent/
    │   │   │   ├── index.ts
    │   │   │   └── intent-filter.tsx     [Search Intent Filter]
    │   │   │
    │   │   ├── 📂 kd/
    │   │   │   ├── index.ts
    │   │   │   └── kd-filter.tsx         [Keyword Difficulty Filter]
    │   │   │
    │   │   ├── 📂 match-type/
    │   │   │   ├── index.ts
    │   │   │   └── match-type-toggle.tsx [Broad/Phrase/Exact/Related/Questions]
    │   │   │
    │   │   ├── 📂 serp/
    │   │   │   ├── index.ts
    │   │   │   └── serp-filter.tsx       [SERP Features Filter]
    │   │   │
    │   │   ├── 📂 trend/
    │   │   │   ├── index.ts
    │   │   │   └── trend-filter.tsx      [Trend Direction Filter]
    │   │   │
    │   │   ├── 📂 volume/
    │   │   │   ├── index.ts
    │   │   │   └── volume-filter.tsx     [Search Volume Filter]
    │   │   │
    │   │   └── 📂 weak-spot/
    │   │       ├── index.ts
    │   │       └── weak-spot-filter.tsx  [Weak Spot Filter]
    │   │
    │   ├── 📂 header/                    [Header Components]
    │   │   ├── index.ts
    │   │   ├── country-selector.tsx      [Country Dropdown]
    │   │   ├── page-header.tsx           [Main Page Header]
    │   │   └── results-header.tsx        [Results Count Header]
    │   │
    │   ├── 📂 modals/                    [Modal Dialogs]
    │   │   ├── index.ts
    │   │   ├── export-modal.tsx          [Export Options Modal]
    │   │   ├── filter-presets-modal.tsx  [Save/Load Filter Presets]
    │   │   └── keyword-details-modal.tsx [Keyword Details Modal]
    │   │
    │   ├── 📂 page-sections/             [Main Page Sections]
    │   │   ├── index.ts
    │   │   ├── KeywordResearchHeader.tsx [Page Header Section]
    │   │   ├── KeywordResearchSearch.tsx [Search Section]
    │   │   ├── KeywordResearchFilters.tsx[Filters Section]
    │   │   └── KeywordResearchResults.tsx[Results Table Section]
    │   │
    │   ├── 📂 search/                    [Search Components]
    │   │   ├── index.ts
    │   │   ├── bulk-keywords-input.tsx   [Bulk Keywords Textarea]
    │   │   ├── bulk-mode-toggle.tsx      [Explore/Bulk Mode Toggle]
    │   │   ├── search-input.tsx          [Main Search Input]
    │   │   └── search-suggestions.tsx    [Autocomplete Suggestions]
    │   │
    │   ├── 📂 shared/                    [Shared/Utility Components]
    │   │   ├── index.tsx
    │   │   ├── empty-states.tsx          [Empty/No Results States]
    │   │   ├── error-boundary.tsx        [Error Boundary]
    │   │   └── loading-skeleton.tsx      [Loading Skeletons]
    │   │
    │   └── 📂 table/                     [Data Table]
    │       ├── index.ts
    │       ├── KeywordTable.tsx          [Main Table Component]
    │       ├── KeywordTableRow.tsx       [Table Row]
    │       ├── KeywordTableHeader.tsx    [Table Header]
    │       ├── KeywordTableFooter.tsx    [Pagination Footer]
    │       │
    │       ├── 📂 action-bar/            [Bulk Action Bar]
    │       │   ├── index.ts
    │       │   ├── action-bar.tsx        [Main Action Bar]
    │       │   ├── bulk-actions.tsx      [Bulk Action Buttons]
    │       │   └── selection-info.tsx    [Selection Count Info]
    │       │
    │       └── 📂 columns/               [Table Column Components]
    │           ├── index.ts
    │           │
    │           ├── 📂 actions/
    │           │   ├── index.ts
    │           │   └── actions-column.tsx    [Row Actions Column]
    │           │
    │           ├── 📂 checkbox/
    │           │   ├── index.ts
    │           │   └── checkbox-column.tsx   [Selection Checkbox]
    │           │
    │           ├── 📂 cpc/
    │           │   ├── index.ts
    │           │   └── cpc-column.tsx        [CPC Display Column]
    │           │
    │           ├── 📂 geo/
    │           │   ├── index.ts
    │           │   └── geo-column.tsx        [GEO Score Column]
    │           │
    │           ├── 📂 intent/
    │           │   ├── index.ts
    │           │   └── intent-column.tsx     [Intent Badges Column]
    │           │
    │           ├── 📂 kd/
    │           │   ├── index.ts
    │           │   └── kd-column.tsx         [KD Score Column]
    │           │
    │           ├── 📂 keyword/
    │           │   ├── index.ts
    │           │   └── keyword-column.tsx    [Keyword Text Column]
    │           │
    │           ├── 📂 refresh/
    │           │   ├── index.ts
    │           │   └── refresh-column.tsx    [Refresh Button Column]
    │           │
    │           ├── 📂 serp/
    │           │   ├── index.ts
    │           │   └── serp-column.tsx       [SERP Features Column]
    │           │
    │           ├── 📂 trend/
    │           │   ├── index.ts
    │           │   └── trend-column.tsx      [Trend Sparkline Column]
    │           │
    │           ├── 📂 volume/
    │           │   ├── index.ts
    │           │   └── volume-column.tsx     [Volume Display Column]
    │           │
    │           └── 📂 weak-spot/
    │               ├── index.ts
    │               └── weak-spot-column.tsx  [Weak Spot Badge Column]
    │
    ├── 📂 config/                        [Configuration]
    │   ├── index.ts                      [Config Barrel Export]
    │   ├── api-config.ts                 [API Endpoints Config]
    │   └── feature-config.ts             [Feature Toggle Config]
    │
    ├── 📂 constants/                     [Constants/Static Data]
    │   ├── index.ts                      [Constants Barrel Export]
    │   └── table-config.ts               [Table Column Config]
    │
    ├── 📂 hooks/                         [React Hooks]
    │   └── index.ts                      [Hooks Barrel Export]
    │
    ├── 📂 providers/                     [Context Providers]
    │   ├── index.ts                      [Providers Barrel Export]
    │   └── keyword-research-provider.tsx [Legacy Context Provider]
    │
    ├── 📂 services/                      [API Services - SERVER ONLY]
    │   ├── index.ts                      [Services Barrel Export]
    │   ├── api-base.ts                   [Base API Client]
    │   ├── keyword.service.ts            [Keyword Research Service]
    │   ├── bulk-analysis.service.ts      [Bulk Analysis Service]
    │   ├── export.service.ts             [Export Service]
    │   ├── suggestions.service.ts        [Suggestions Service]
    │   └── mock-utils.ts                 [Mock Data Utilities]
    │
    ├── 📂 store/                         [Zustand State Management]
    │   └── index.ts                      [Main Zustand Store - 382 lines]
    │
    ├── 📂 types/                         [TypeScript Types]
    │   ├── index.ts                      [Types Barrel Export - 107 lines]
    │   └── api.types.ts                  [API Request/Response Types]
    │
    ├── 📂 utils/                         [Utility Functions]
    │   ├── index.ts                      [Utils Barrel Export]
    │   ├── filter-utils.ts               [Filter Logic - 321 lines]
    │   ├── sort-utils.ts                 [Sorting Logic]
    │   └── export-utils.ts               [CSV/JSON Export Logic]
    │
    └── 📂 __mocks__/                     [Mock Data]
        ├── index.ts                      [Mocks Barrel Export]
        └── keyword-data.ts               [Mock Keywords Data]
```

---

## 🔗 IMPORT/EXPORT CHAIN

### 1️⃣ ENTRY POINTS (App Routes)

```
┌─────────────────────────────────────────────────────────────────┐
│  app/keyword-magic/page.tsx (Demo Page)                         │
├─────────────────────────────────────────────────────────────────┤
│  IMPORTS:                                                        │
│  ├── { Suspense } from "react"                                  │
│  ├── { AppSidebar } from "@/components/layout"                  │
│  ├── { SidebarProvider, SidebarInset } from "@/components/ui"   │
│  ├── { KeywordResearchContent } from "@/components/features"    │
│  └── { DemoWrapper } from "@/components/common/demo-wrapper"    │
│                                                                  │
│  EXPORTS:                                                        │
│  └── default KeywordResearchDemoPage                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  app/dashboard/research/keyword-magic/page.tsx (Dashboard)      │
├─────────────────────────────────────────────────────────────────┤
│  IMPORTS:                                                        │
│  ├── { KeywordResearchContent } from "@/components/features"    │
│  └── { ErrorBoundary } from "@/components/common/error-boundary"│
│                                                                  │
│  EXPORTS:                                                        │
│  └── default KeywordResearchPage                                │
└─────────────────────────────────────────────────────────────────┘
```

### 2️⃣ MAIN FEATURE INDEX (Barrel Export)

```
┌─────────────────────────────────────────────────────────────────┐
│  src/features/keyword-research/index.ts                         │
├─────────────────────────────────────────────────────────────────┤
│  EXPORTS TO OUTSIDE WORLD:                                       │
│                                                                  │
│  📦 MAIN COMPONENT:                                              │
│  └── KeywordResearchContent ← "./keyword-research-content"      │
│                                                                  │
│  📦 TYPES (35+ types):                                          │
│  └── Keyword, Country, MatchType, BulkMode, FilterState, etc    │
│      ← "./types"                                                 │
│                                                                  │
│  📦 CONSTANTS (10+ exports):                                     │
│  └── POPULAR_COUNTRIES, KD_LEVELS, INTENT_OPTIONS, etc          │
│      ← "./constants"                                             │
│                                                                  │
│  📦 UTILS (15+ functions):                                       │
│  └── filterBySearchText, applyAllFilters, formatVolume, etc    │
│      ← "./utils"                                                 │
│                                                                  │
│  📦 CONFIG:                                                      │
│  └── FEATURE_CONFIG, keywordMagicApiConfig, getEndpoint, etc   │
│      ← "./config"                                                │
│                                                                  │
│  📦 PROVIDERS:                                                   │
│  └── KeywordResearchProvider, useKeywordResearch                │
│      ← "./providers"                                             │
│                                                                  │
│  📦 ZUSTAND STORE:                                               │
│  └── useKeywordStore, selectKeywords, selectFilters, etc       │
│      ← "./store"                                                 │
│                                                                  │
│  📦 COMPONENTS (50+ components):                                 │
│  └── All UI components                                           │
│      ← "./components"                                            │
│                                                                  │
│  ⚠️ SERVICES (Not re-exported - Server Only):                   │
│  └── Import directly from "@/src/features/keyword-research/services" │
└─────────────────────────────────────────────────────────────────┘
```

### 3️⃣ COMPONENTS BARREL EXPORT CHAIN

```
src/features/keyword-research/components/index.ts
│
├── FILTERS ← "./filters/index.ts"
│   ├── VolumeFilter     ← "./volume/index.ts"     ← volume-filter.tsx
│   ├── KDFilter         ← "./kd/index.ts"         ← kd-filter.tsx
│   ├── IntentFilter     ← "./intent/index.ts"     ← intent-filter.tsx
│   ├── CPCFilter        ← "./cpc/index.ts"        ← cpc-filter.tsx
│   ├── GeoFilter        ← "./geo/index.ts"        ← geo-filter.tsx
│   ├── WeakSpotFilter   ← "./weak-spot/index.ts"  ← weak-spot-filter.tsx
│   ├── SerpFilter       ← "./serp/index.ts"       ← serp-filter.tsx
│   ├── TrendFilter      ← "./trend/index.ts"      ← trend-filter.tsx
│   ├── IncludeExcludeFilter ← "./include-exclude/index.ts"
│   └── MatchTypeToggle  ← "./match-type/index.ts" ← match-type-toggle.tsx
│
├── HEADER ← "./header/index.ts"
│   ├── CountrySelector  ← country-selector.tsx
│   ├── PageHeader       ← page-header.tsx
│   └── ResultsHeader    ← results-header.tsx
│
├── SEARCH ← "./search/index.ts"
│   ├── BulkModeToggle      ← bulk-mode-toggle.tsx
│   ├── BulkKeywordsInput   ← bulk-keywords-input.tsx
│   ├── SearchInput         ← search-input.tsx
│   └── SearchSuggestions   ← search-suggestions.tsx
│
├── TABLE ← "./table/index.ts"
│   ├── KeywordTable        ← KeywordTable.tsx
│   ├── KeywordTableRow     ← KeywordTableRow.tsx
│   ├── KeywordTableHeader  ← KeywordTableHeader.tsx
│   ├── KeywordTableFooter  ← KeywordTableFooter.tsx
│   │
│   ├── ACTION BAR ← "./action-bar/index.ts"
│   │   ├── ActionBar       ← action-bar.tsx
│   │   ├── BulkActions     ← bulk-actions.tsx
│   │   └── SelectionInfo   ← selection-info.tsx
│   │
│   └── COLUMNS ← "./columns/index.ts"
│       ├── CheckboxColumn  ← "./checkbox/index.ts"
│       ├── KeywordColumn   ← "./keyword/index.ts"
│       ├── VolumeColumn    ← "./volume/index.ts"
│       ├── KdColumn        ← "./kd/index.ts"
│       ├── CpcColumn       ← "./cpc/index.ts"
│       ├── IntentColumn    ← "./intent/index.ts"
│       ├── TrendColumn     ← "./trend/index.ts"
│       ├── SerpColumn      ← "./serp/index.ts"
│       ├── GeoColumn       ← "./geo/index.ts"
│       ├── WeakSpotColumn  ← "./weak-spot/index.ts"
│       ├── RefreshColumn   ← "./refresh/index.ts"
│       └── ActionsColumn   ← "./actions/index.ts"
│
├── DRAWERS ← "./drawers/index.ts"
│   ├── KeywordDetailsDrawer ← KeywordDetailsDrawer.tsx
│   ├── OverviewTab         ← OverviewTab.tsx
│   ├── CommerceTab         ← CommerceTab.tsx
│   └── SocialTab           ← SocialTab.tsx
│
├── MODALS ← "./modals/index.ts"
│   ├── ExportModal          ← export-modal.tsx
│   ├── FilterPresetsModal   ← filter-presets-modal.tsx
│   └── KeywordDetailsModal  ← keyword-details-modal.tsx
│
├── PAGE SECTIONS ← "./page-sections/index.ts"
│   ├── KeywordResearchHeader  ← KeywordResearchHeader.tsx
│   ├── KeywordResearchSearch  ← KeywordResearchSearch.tsx
│   ├── KeywordResearchFilters ← KeywordResearchFilters.tsx
│   └── KeywordResearchResults ← KeywordResearchResults.tsx
│
└── SHARED ← "./shared/index.tsx"
    ├── EmptyState          ← empty-states.tsx
    ├── NoSearchState       ← empty-states.tsx
    ├── NoResultsState      ← empty-states.tsx
    ├── ErrorState          ← empty-states.tsx
    ├── ErrorBoundary       ← error-boundary.tsx
    ├── LoadingSkeleton     ← loading-skeleton.tsx
    ├── TableLoadingSkeleton    ← loading-skeleton.tsx
    ├── FilterLoadingSkeleton   ← loading-skeleton.tsx
    └── HeaderLoadingSkeleton   ← loading-skeleton.tsx
```

---

## 📊 DETAILED IMPORT MAP PER FILE

### MAIN COMPONENT: `keyword-research-content.tsx`

```typescript
// ============================================
// IMPORTS
// ============================================

// React & Next.js
import React, { useMemo, useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// UI Libraries
import { toast } from "sonner"

// Hooks
import { useDebounce } from "@/hooks/use-debounce"

// Auth
import { createBrowserClient } from "@supabase/ssr"

// Icons
import { AlertCircle, Sparkles } from "lucide-react"

// Zustand Store
import { useKeywordStore, type KeywordFilters } from "./store"

// Feature Types
import type { Country, MatchType, BulkMode, SERPFeature } from "./types"

// Constants
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "./constants"

// Mock Data
import { MOCK_KEYWORDS } from "./__mocks__"

// Utils
import { applyAllFilters } from "./utils"

// Filter Components
import { 
  BulkKeywordsInput,
  VolumeFilter,
  KDFilter,
  IntentFilter,
  CPCFilter,
  GeoFilter,
  WeakSpotFilter,
  SerpFilter,
  TrendFilter,
  IncludeExcludeFilter,
} from "./components"

// Page Section Components
import {
  KeywordResearchHeader,
  KeywordResearchSearch,
  KeywordResearchResults,
} from "./components/page-sections"
```

### ZUSTAND STORE: `store/index.ts`

```typescript
// ============================================
// IMPORTS
// ============================================

// Zustand
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

// Types
import type { Keyword, MatchType, BulkMode, Country, SERPFeature } from "../types"
import type { SortDirection as SharedSortDirection } from "@/src/types/shared"

// ============================================
// EXPORTS
// ============================================

export type { 
  SortField, 
  SortDirection, 
  SortConfig,
  PaginationConfig,
  KeywordFilters,
  SearchState,
  LoadingState,
  KeywordState 
}

export { useKeywordStore }

// Selector exports
export const selectKeywords = (state: KeywordState) => state.keywords
export const selectFilters = (state: KeywordState) => state.filters
export const selectSearch = (state: KeywordState) => state.search
export const selectSort = (state: KeywordState) => state.sort
export const selectPagination = (state: KeywordState) => state.pagination
export const selectLoading = (state: KeywordState) => state.loading
export const selectSelectedIds = (state: KeywordState) => state.selectedIds
export const selectSelectedCount = (state: KeywordState) => state.selectedIds.size
```

### TYPES: `types/index.ts`

```typescript
// ============================================
// IMPORTS
// ============================================

import type { CTRStealingFeature } from "@/types/rtv.types"
import type { 
  SortDirection, 
  Country as SharedCountry,
  PaginationState as SharedPaginationState 
} from "@/src/types/shared"

// ============================================
// EXPORTS
// ============================================

// Re-exports
export type { SortDirection } from "@/src/types/shared"

// Type exports
export type SERPFeature = ...
export interface Keyword { ... }
export type Country = SharedCountry
export interface KDLevel { ... }
export interface IntentOption { ... }
export interface VolumePreset { ... }
export type MatchType = "broad" | "phrase" | "exact" | "related" | "questions"
export type BulkMode = "explore" | "bulk"
export type KeywordResearchSortField = ...
export interface FilterState { ... }

// Re-export all from api.types.ts
export * from "./api.types"
```

### SERVICES: `services/index.ts` (SERVER-ONLY)

```typescript
// ============================================
// CRITICAL: SERVER-ONLY IMPORTS
// ============================================

import "server-only"  // ← Prevents import in Client Components

// ============================================
// EXPORTS
// ============================================

// API Base
export { KeywordAPIError, simulateNetworkDelay, API_BASE_URL } from "./api-base"

// Mock utilities
export { convertToAPIKeyword, generateMockAPIKeyword } from "./mock-utils"

// Individual services
export { keywordResearchService } from "./keyword.service"
export { bulkAnalysisService } from "./bulk-analysis.service"
export { exportService } from "./export.service"
export { suggestionsService } from "./suggestions.service"

// Combined API (backward compatible)
export const keywordMagicAPI = { ... }
```

---

## 🔄 COMPONENT DEPENDENCY FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY FLOW DIAGRAM                       │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │  Page Route (Next)  │
                    │  /keyword-magic     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ KeywordResearchContent │
                    │    (Main Component)    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Zustand Store │    │  Page Sections  │    │    Utilities    │
│ useKeywordStore│   │ Header/Search/  │    │ filter-utils.ts │
└───────────────┘    │ Filters/Results │    │  sort-utils.ts  │
        │            └────────┬────────┘    └─────────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌─────────────────┐
│    Types      │    │   Components    │
│ types/index.ts│    │ Filters/Table/  │
└───────────────┘    │ Search/Modals   │
                     └────────┬────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐          ┌───────────────┐
        │  @/components │          │  Constants    │
        │   /ui (shadcn)│          │ constants/    │
        └───────────────┘          └───────────────┘
```

---

## 📋 FILE COUNT SUMMARY

| Directory | Files | Purpose |
|-----------|-------|---------|
| `/actions` | 2 | Server Actions |
| `/components` | 62 | UI Components |
| `/components/filters` | 22 | Filter Components |
| `/components/table` | 30 | Table Components |
| `/config` | 3 | Configuration |
| `/constants` | 2 | Static Data |
| `/hooks` | 1 | React Hooks |
| `/providers` | 2 | Context Providers |
| `/services` | 7 | API Services (Server-Only) |
| `/store` | 1 | Zustand Store |
| `/types` | 2 | TypeScript Types |
| `/utils` | 4 | Utility Functions |
| `/__mocks__` | 2 | Mock Data |
| **TOTAL** | **~118 files** | Complete Feature |

---

## 🔐 SPECIAL NOTES

### 1. Server-Only Services
```typescript
// services/index.ts
import "server-only"  // ← This line prevents client import

// ❌ WRONG: Import in Client Component
import { keywordMagicAPI } from "@/src/features/keyword-research/services"

// ✅ CORRECT: Import in Server Component or Server Action
import { keywordMagicAPI } from "@/src/features/keyword-research/services"
```

### 2. Barrel Export Pattern
Every folder has an `index.ts` that re-exports all modules. This allows:
```typescript
// Instead of:
import { VolumeFilter } from "./components/filters/volume/volume-filter"

// You can:
import { VolumeFilter } from "./components"
```

### 3. Type Re-exports
Types are re-exported through multiple layers for convenience:
```typescript
// All these work:
import type { Keyword } from "@/src/features/keyword-research/types"
import type { Keyword } from "@/src/features/keyword-research"
```

### 4. Store Selectors
Zustand store exports pre-made selectors for performance:
```typescript
import { useKeywordStore, selectKeywords, selectFilters } from "./store"

// Using selector
const keywords = useKeywordStore(selectKeywords)
const filters = useKeywordStore(selectFilters)
```

---

## 📁 EXTERNAL DEPENDENCIES

```typescript
// UI Components (shadcn/ui)
@/components/ui/button
@/components/ui/input
@/components/ui/select
@/components/ui/slider
@/components/ui/popover
@/components/ui/checkbox
@/components/ui/table
@/components/ui/tooltip
@/components/ui/badge
@/components/ui/dialog
@/components/ui/dropdown-menu
@/components/ui/sheet (for drawers)

// Layout
@/components/layout/AppSidebar

// Shared Types
@/types/rtv.types (CTRStealingFeature)
@/src/types/shared (SortDirection, Country, PaginationState)

// Global Hooks
@/hooks/use-debounce

// Auth
@supabase/ssr (createBrowserClient)

// State Management
zustand
zustand/middleware (devtools, persist)

// UI Libraries
sonner (toast notifications)
lucide-react (icons)
```

---

**Created: January 4, 2026**  
**Feature: Keyword Explorer / Keyword Magic**  
**Total Files: ~118**  
**Total Lines: ~15,000+**

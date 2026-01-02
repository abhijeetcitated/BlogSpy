# 🧙‍♂️ Keyword Magic Feature - Complete A-Z Structure

> Last Updated: January 2025  
> Architecture: Feature-First + Zustand Store + Server-Only Services + PLG Guest Mode

---

## 📁 Root Structure Overview

```
src/features/keyword-magic/
├── 📄 index.ts                    # Main barrel export
├── 📄 keyword-magic-content.tsx   # Main feature component (isGuest, Demo Banner)
├── 📄 README.md                   # Feature documentation
├── 📁 actions/                    # Server Actions (authAction + Zod)
├── 📁 components/                 # All UI Components
├── 📁 config/                     # Feature & API Configuration
├── 📁 constants/                  # Static Constants
├── 📁 hooks/                      # Custom React Hooks
├── 📁 providers/                  # Context Providers
├── 📁 services/                   # Server-Only Services
├── 📁 store/                      # Zustand State Management
├── 📁 types/                      # TypeScript Types
├── 📁 utils/                      # Utility Functions
└── 📁 __mocks__/                  # Mock Data for Development
```

---

## 📁 Detailed File Structure

### 🔷 Root Files

| File | Purpose |
|------|---------|
| `index.ts` | Main barrel export - exports all public APIs |
| `keyword-magic-content.tsx` | Main component with `isGuest` check via Supabase, Demo Mode Banner for guests |
| `README.md` | Feature documentation and usage guide |

---

### 📁 actions/
> **Purpose:** Server Actions with authentication & validation

```
actions/
├── 📄 index.ts           # Barrel export for all actions
└── 📄 search.action.ts   # Search action (authAction + Zod validation)
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all server actions |
| `search.action.ts` | Main search action - secured with `authAction`, validates with Zod schema |

---

### 📁 components/
> **Purpose:** All UI Components organized by functionality

```
components/
├── 📄 index.ts                    # Components barrel export
├── 📁 filters/                    # All filter components
├── 📁 header/                     # Header & navigation
├── 📁 modals/                     # Modal dialogs
├── 📁 page-sections/              # Main page sections
├── 📁 search/                     # Search input & suggestions
├── 📁 shared/                     # Shared components
└── 📁 table/                      # Keyword table & columns
```

---

#### 📁 components/filters/
> **Purpose:** Filter components for keyword data

```
filters/
├── 📄 index.ts                    # Filters barrel export
├── 📁 cpc/
│   ├── 📄 index.ts
│   └── 📄 cpc-filter.tsx          # CPC range filter
├── 📁 geo/
│   ├── 📄 index.ts
│   └── 📄 geo-filter.tsx          # Geographic/Location filter
├── 📁 include-exclude/
│   ├── 📄 index.ts
│   └── 📄 include-exclude-filter.tsx  # Include/Exclude keywords filter
├── 📁 intent/
│   ├── 📄 index.ts
│   └── 📄 intent-filter.tsx       # Search intent filter (I/N/C/T)
├── 📁 kd/
│   ├── 📄 index.ts
│   └── 📄 kd-filter.tsx           # Keyword Difficulty filter
├── 📁 match-type/
│   ├── 📄 index.ts
│   └── 📄 match-type-toggle.tsx   # Broad/Phrase/Exact/Related/Questions toggle
├── 📁 serp/
│   ├── 📄 index.ts
│   └── 📄 serp-filter.tsx         # SERP features filter
├── 📁 trend/
│   ├── 📄 index.ts
│   └── 📄 trend-filter.tsx        # Trend direction filter
├── 📁 volume/
│   ├── 📄 index.ts
│   └── 📄 volume-filter.tsx       # Search volume range filter
└── 📁 weak-spot/
    ├── 📄 index.ts
    └── 📄 weak-spot-filter.tsx    # Weak spot opportunity filter
```

**Filter Types:**
- **CPC** - Cost Per Click range
- **Geo** - Country/Location targeting
- **Include/Exclude** - Keyword text filtering
- **Intent** - Informational, Navigational, Commercial, Transactional
- **KD** - Keyword Difficulty percentage
- **Match Type** - Broad, Phrase, Exact, Related, Questions
- **SERP** - Featured Snippets, PAA, Videos, etc.
- **Trend** - Rising, Stable, Declining
- **Volume** - Monthly search volume range
- **Weak Spot** - Ranking opportunity indicators

---

#### 📁 components/header/
> **Purpose:** Page header components

```
header/
├── 📄 index.ts              # Header barrel export
├── 📄 country-selector.tsx  # Country dropdown selector
├── 📄 page-header.tsx       # Main page header
└── 📄 results-header.tsx    # Results count & actions header
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all header components |
| `country-selector.tsx` | Country dropdown with flags & codes |
| `page-header.tsx` | Feature title & navigation |
| `results-header.tsx` | Shows result count, sort options |

---

#### 📁 components/modals/
> **Purpose:** Modal dialog components

```
modals/
├── 📄 index.ts                    # Modals barrel export
├── 📄 export-modal.tsx            # Export keywords modal (CSV/Excel)
├── 📄 filter-presets-modal.tsx    # Save/Load filter presets
└── 📄 keyword-details-modal.tsx   # Detailed keyword view
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all modal components |
| `export-modal.tsx` | Export selected keywords (gated for guests) |
| `filter-presets-modal.tsx` | Save and load filter configurations |
| `keyword-details-modal.tsx` | Full keyword analysis view |

---

#### 📁 components/page-sections/
> **Purpose:** Main page layout sections

```
page-sections/
├── 📄 index.ts                    # Page sections barrel export
├── 📄 KeywordMagicFilters.tsx     # Filters panel section
├── 📄 KeywordMagicHeader.tsx      # Main header section
├── 📄 KeywordMagicResults.tsx     # Results table section
└── 📄 KeywordMagicSearch.tsx      # Search input section
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all page section components |
| `KeywordMagicFilters.tsx` | Container for all filter components |
| `KeywordMagicHeader.tsx` | Top header with title, tabs, actions |
| `KeywordMagicResults.tsx` | Results area with table |
| `KeywordMagicSearch.tsx` | Search form with mode toggle |

---

#### 📁 components/search/
> **Purpose:** Search input and related components

```
search/
├── 📄 index.ts                  # Search barrel export
├── 📄 bulk-keywords-input.tsx   # Bulk keyword textarea
├── 📄 bulk-mode-toggle.tsx      # Explore/Bulk Analysis toggle
├── 📄 search-input.tsx          # Main search input field
└── 📄 search-suggestions.tsx    # Autocomplete suggestions
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all search components |
| `bulk-keywords-input.tsx` | Textarea for bulk keyword input |
| `bulk-mode-toggle.tsx` | Toggle between Explore/Bulk Analysis mode |
| `search-input.tsx` | Primary keyword search input |
| `search-suggestions.tsx` | Autocomplete dropdown suggestions |

---

#### 📁 components/shared/
> **Purpose:** Reusable shared components

```
shared/
├── 📄 index.tsx             # Shared barrel export
├── 📄 empty-states.tsx      # Empty/No results states
├── 📄 error-boundary.tsx    # Error boundary wrapper
└── 📄 loading-skeleton.tsx  # Loading skeleton animations
```

| File | Description |
|------|-------------|
| `index.tsx` | Re-exports all shared components |
| `empty-states.tsx` | UI for no results, first search, etc. |
| `error-boundary.tsx` | Catches and displays errors gracefully |
| `loading-skeleton.tsx` | Loading placeholders |

---

#### 📁 components/table/
> **Purpose:** Keyword results table

```
table/
├── 📄 index.ts              # Table barrel export
├── 📄 KeywordTable.tsx      # Main table (accepts isGuest prop)
├── 📄 KeywordTableFooter.tsx # Pagination footer
├── 📄 KeywordTableHeader.tsx # Sticky column headers
├── 📄 KeywordTableRow.tsx   # Individual row component
├── 📄 export-utils.ts       # Export helper functions
├── 📄 sorting-utils.ts      # Sorting helper functions
├── 📁 action-bar/           # Bulk action bar
└── 📁 columns/              # Individual column components
```

---

##### 📁 components/table/action-bar/
> **Purpose:** Bulk selection action bar

```
action-bar/
├── 📄 index.ts           # Action bar barrel export
├── 📄 action-bar.tsx     # Main action bar container
├── 📄 bulk-actions.tsx   # Bulk action buttons
└── 📄 selection-info.tsx # Selection count display
```

---

##### 📁 components/table/columns/
> **Purpose:** Individual table column components

```
columns/
├── 📄 index.ts                   # Columns barrel export
├── 📁 checkbox/
│   ├── 📄 index.ts
│   └── 📄 checkbox-column.tsx    # Row selection checkbox
├── 📁 cpc/
│   ├── 📄 index.ts
│   └── 📄 cpc-column.tsx         # CPC value display
├── 📁 geo/
│   ├── 📄 index.ts
│   └── 📄 geo-column.tsx         # Country flag & code
├── 📁 intent/
│   ├── 📄 index.ts
│   └── 📄 intent-column.tsx      # Intent badge (I/N/C/T)
├── 📁 kd/
│   ├── 📄 index.ts
│   └── 📄 kd-column.tsx          # KD percentage with color
├── 📁 keyword/
│   ├── 📄 index.ts
│   └── 📄 keyword-column.tsx     # Keyword text with actions
├── 📁 refresh/
│   ├── 📄 index.ts
│   └── 📄 refresh-column.tsx     # Refresh data button
├── 📁 serp/
│   ├── 📄 index.ts
│   └── 📄 serp-column.tsx        # SERP features icons
├── 📁 trend/
│   ├── 📄 index.ts
│   └── 📄 trend-column.tsx       # Trend chart/indicator
├── 📁 volume/
│   ├── 📄 index.ts
│   └── 📄 volume-column.tsx      # Search volume display
└── 📁 weak-spot/
    ├── 📄 index.ts
    └── 📄 weak-spot-column.tsx   # Weak spot score
```

**Column Types:**
- **Checkbox** - Multi-select rows
- **Keyword** - Primary keyword text
- **Volume** - Monthly search volume
- **KD** - Keyword Difficulty (0-100%)
- **CPC** - Cost Per Click ($)
- **Intent** - Search intent type
- **Trend** - 12-month trend
- **SERP** - SERP feature indicators
- **Geo** - Country/Region
- **Weak Spot** - Opportunity score
- **Refresh** - Re-fetch data action

---

### 📁 config/
> **Purpose:** Feature configuration

```
config/
├── 📄 index.ts           # Config barrel export
├── 📄 api-config.ts      # API endpoints & settings
└── 📄 feature-config.ts  # Feature flags & limits
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all configuration |
| `api-config.ts` | DataForSEO API endpoints, rate limits |
| `feature-config.ts` | Feature toggles, guest limits, defaults |

---

### 📁 constants/
> **Purpose:** Static constants

```
constants/
├── 📄 index.ts           # Constants barrel export
└── 📄 table-config.ts    # Table configuration
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all constants |
| `table-config.ts` | Column widths, default sort, pagination |

---

### 📁 hooks/
> **Purpose:** Custom React hooks

```
hooks/
├── 📄 index.ts                 # Hooks barrel export
├── 📄 use-bulk-analysis.ts     # Bulk keyword analysis
├── 📄 use-country-selector.ts  # Country selection logic
├── 📄 use-keyword-data.ts      # Keyword data fetching
├── 📄 use-keyword-filters.ts   # Filter state management
└── 📄 use-table-state.ts       # Table sorting/pagination
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all custom hooks |
| `use-bulk-analysis.ts` | Handles bulk keyword submission |
| `use-country-selector.ts` | Country selection state & handlers |
| `use-keyword-data.ts` | Fetches & caches keyword data |
| `use-keyword-filters.ts` | Filter state & handlers |
| `use-table-state.ts` | Sorting, pagination, selection |

---

### 📁 providers/
> **Purpose:** React Context providers

```
providers/
├── 📄 index.ts                     # Providers barrel export
└── 📄 keyword-magic-provider.tsx   # Main feature provider
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all providers |
| `keyword-magic-provider.tsx` | Wraps feature with necessary context |

---

### 📁 services/
> **Purpose:** Server-only API services

```
services/
├── 📄 index.ts                    # Services barrel export
├── 📄 api-base.ts                 # Base API client (server-only)
├── 📄 bulk-analysis.service.ts    # Bulk analysis API (server-only)
├── 📄 export.service.ts           # Export functionality (server-only)
├── 📄 keyword-research.service.ts # Main keyword API (server-only)
├── 📄 mock-utils.ts               # Mock data utilities
└── 📄 suggestions.service.ts      # Autocomplete API (server-only)
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all services |
| `api-base.ts` | Base HTTP client with auth, uses `server-only` |
| `bulk-analysis.service.ts` | Bulk keyword processing, uses `server-only` |
| `export.service.ts` | CSV/Excel export, uses `server-only` |
| `keyword-research.service.ts` | Main DataForSEO integration, uses `server-only` |
| `mock-utils.ts` | Utilities for mock mode detection |
| `suggestions.service.ts` | Search autocomplete, uses `server-only` |

**🔒 Security Note:** All services import `"server-only"` to prevent client-side usage.

---

### 📁 store/
> **Purpose:** Zustand state management

```
store/
└── 📄 index.ts    # Zustand store with selectors
```

| File | Description |
|------|-------------|
| `index.ts` | Central Zustand store with filters, sorting, pagination, selectors |

**Store Features:**
- ✅ Filter state (all filter types)
- ✅ Sorting state (column, direction)
- ✅ Pagination state (page, pageSize)
- ✅ Selection state (selected keywords)
- ✅ Selectors for derived state
- ✅ Actions for state updates

---

### 📁 types/
> **Purpose:** TypeScript type definitions

```
types/
├── 📄 index.ts        # Types barrel export
└── 📄 api.types.ts    # API response types
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all types |
| `api.types.ts` | DataForSEO API response interfaces |

---

### 📁 utils/
> **Purpose:** Utility functions

```
utils/
├── 📄 index.ts          # Utils barrel export
├── 📄 export-utils.ts   # CSV/Excel export helpers
├── 📄 filter-utils.ts   # Filter logic utilities
└── 📄 sort-utils.ts     # Sorting utilities
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all utilities |
| `export-utils.ts` | Format data for export |
| `filter-utils.ts` | Apply filters to data |
| `sort-utils.ts` | Sort data by column |

---

### 📁 __mocks__/
> **Purpose:** Mock data for development

```
__mocks__/
├── 📄 index.ts           # Mocks barrel export
└── 📄 keyword-data.ts    # Sample keyword data
```

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all mock data |
| `keyword-data.ts` | Realistic mock keyword data for testing |

---

## 📊 Complete File Count

| Category | Files | Folders |
|----------|-------|---------|
| Root | 3 | - |
| Actions | 2 | 1 |
| Components | 65+ | 30+ |
| Config | 3 | 1 |
| Constants | 2 | 1 |
| Hooks | 6 | 1 |
| Providers | 2 | 1 |
| Services | 7 | 1 |
| Store | 1 | 1 |
| Types | 2 | 1 |
| Utils | 4 | 1 |
| Mocks | 2 | 1 |
| **TOTAL** | **~100** | **~40** |

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│  Components ──► Hooks ──► Zustand Store ──► Server Actions  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js)                          │
├─────────────────────────────────────────────────────────────┤
│  actions/*.ts                                                │
│  ├── authAction() wrapper                                   │
│  └── Zod validation                                         │
├─────────────────────────────────────────────────────────────┤
│  services/*.ts  ← import "server-only"                      │
│  ├── api-base.ts (base client)                             │
│  ├── keyword-research.service.ts                           │
│  └── ... (all protected)                                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL API                              │
│                    (DataForSEO)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PLG Guest Mode Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  keyword-magic-content.tsx                   │
│                                                              │
│  1. Check Supabase → isGuest = !user                        │
│  2. If guest → Show Demo Mode Banner                        │
│  3. Pass isGuest to KeywordTable                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    KeywordTable.tsx                          │
│                                                              │
│  guardAction(isGuest, action) {                             │
│    if (isGuest) {                                           │
│      toast("Sign up for full access")                       │
│      return                                                 │
│    }                                                        │
│    action()                                                 │
│  }                                                          │
│                                                              │
│  - Export button → 🔒 Lock icon for guests                  │
│  - Refresh button → 🔒 Lock icon for guests                 │
│  - Bulk actions → Gated                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Import Pattern

All modules use barrel exports (`index.ts`) for clean imports:

```typescript
// ✅ Clean imports from feature root
import { KeywordMagicContent } from '@/features/keyword-magic'
import { useKeywordFilters } from '@/features/keyword-magic/hooks'
import { searchKeywords } from '@/features/keyword-magic/actions'

// ✅ Internal feature imports
import { VolumeFilter } from '../filters/volume'
import { KeywordTable } from '../table'
```

---

## 🚀 Key Technologies

| Technology | Usage |
|------------|-------|
| **Next.js 16** | App Router, Server Actions |
| **React 19** | Components, Hooks |
| **Zustand** | Client state management |
| **Zod** | Schema validation |
| **Supabase** | Authentication |
| **DataForSEO** | Keyword data API |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |

---

## ✅ Recent Updates

1. **Sticky Table Header** - `max-h-[calc(100vh-180px)] overflow-auto`
2. **Zustand Migration** - Removed legacy `state/` folder
3. **Server-Only Services** - All services use `import "server-only"`
4. **PLG Guest Mode** - `isGuest` prop, `guardAction()` pattern
5. **Responsive Layout** - Explore/Bulk + Country on left, Match types on right

---

> 📄 **Document Generated:** Complete A-Z Structure of Keyword Magic Feature  
> 🎯 **Total Files:** ~100 files across ~40 folders  
> 🔒 **Security:** Server-only services + authAction + Zod validation

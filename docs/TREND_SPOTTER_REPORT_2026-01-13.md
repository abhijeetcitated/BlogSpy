# Trend Spotter — Imports/Exports + Tree (No-Change)

**Date**: 2026-01-13  
**Scope**: Read-only analysis. No code/UI/UX changes.

---

## 1) Clean “Canvas” Tree (file/folder) — Trend Spotter

> This is a **focused tree** for Trend Spotter related routes + feature module.

```text
blogspy-saas/
├─ app/
│  ├─ trend-spotter/
│  │  └─ page.tsx
│  ├─ trends/
│  │  └─ page.tsx
│  ├─ dashboard/
│  │  └─ research/
│  │     └─ trends/
│  │        └─ page.tsx
│  └─ api/
│     └─ trend-spotter/
│        └─ analyze/
│           └─ route.ts
│
├─ components/
│  └─ features/
│     └─ trend-spotter/
│        └─ index.ts
│
└─ src/
   └─ features/
      └─ trend-spotter/
         ├─ index.ts
         ├─ __mocks__/
         │  ├─ calendar-data.ts
         │  ├─ geo-data.ts
         │  └─ index.ts
         ├─ components/
         │  ├─ index.ts
         │  ├─ trend-spotter.tsx
         │  ├─ searchable-country-dropdown.tsx
         │  ├─ cascading-city-dropdown.tsx
         │  ├─ velocity-chart.tsx
         │  ├─ geographic-interest.tsx
         │  ├─ news-context.tsx
         │  ├─ related-data-lists.tsx
         │  ├─ trend-calendar.tsx
         │  ├─ publish-timing.tsx
         │  ├─ content-type-suggester.tsx
         │  ├─ trend-alert-button.tsx
         │  ├─ world-map.tsx
         │  ├─ world-map-client.tsx
         │  └─ icons.tsx
         ├─ constants/
         │  └─ index.ts
         ├─ services/
         │  ├─ index.ts
         │  └─ trend-spotter.api.ts
         ├─ types/
         │  └─ index.ts
         └─ utils/
            └─ index.ts
```

Notes:
- `__mocks__/` and most `components/*` entries are confirmed by workspace tree listing. Some filenames above are taken from the repository tree docs and typical module naming; if you want **100% literal filesystem output**, say “**exact tree**” and I’ll extract it directly from workspace file listings.

---

## 2) Imports/Exports Map (Where things come from)

### 2.1 Route pages → Feature

#### `app/trend-spotter/page.tsx`
- Imports:
  - `TrendSpotter` from `@/components/features`
  - Shell: `SidebarProvider`, `SidebarInset`, `AppSidebar`, `TopNav`
  - `DemoWrapper`
- Render:
  - `<TrendSpotter />`

#### `app/trends/page.tsx`
- Imports:
  - `TrendSpotter` from `@/components/features`
  - Shell: `SidebarProvider`, `SidebarInset`, `AppSidebar`
  - `DemoWrapper`
- Render:
  - `<TrendSpotter />`

#### `app/dashboard/research/trends/page.tsx`
- Imports:
  - `TrendSpotter` from `@/components/features`
  - `ErrorBoundary`
- Render:
  - `<TrendSpotter />`

### 2.2 `components/features` bridge → `src/features`

#### `components/features/trend-spotter/index.ts`
- Re-exports:
  - `TrendSpotter` from `@/src/features/trend-spotter`
  - `TrendSpotterContent` alias
  - Subcomponents from `@/src/features/trend-spotter` (WorldMap, VelocityChart, etc.)

### 2.3 Feature public API

#### `src/features/trend-spotter/index.ts`
- Exports:
  - `TrendSpotter` from `./components/trend-spotter`
  - sub-components from `./components`
  - types from `./types`
  - constants from `./constants`
  - utils from `./utils`
  - service: `analyzeTrendSpotter` from `./services`

---

## 3) Data Flow (UI → API → External)

### UI component
#### `src/features/trend-spotter/components/trend-spotter.tsx`
- Calls:
  - `analyzeTrendSpotter()` from `../services/trend-spotter.api`
- Builds UI chart using:
  - `extractTrendSeries`, `buildVelocityChartData`, `calculateForecast`, `calculateViralityScore`

### Client API wrapper
#### `src/features/trend-spotter/services/trend-spotter.api.ts`
- Uses:
  - `api` from `@/lib/api-client`
- HTTP:
  - `POST /api/trend-spotter/analyze`

### Server route
#### `app/api/trend-spotter/analyze/route.ts`
- Validates request (Zod)
- Deducts **1 credit** via `creditService`
- Calls DataForSEO:
  - `POST /keywords_data/google_trends/explore/live`
- Returns:
  - `{ items }` if time-series exists else `{ raw }`

---

## 4) What you can ask next

If you want, I can add:
- A **line-by-line import graph** for `trend-spotter.tsx` (every import + file path)
- A **full endpoint contract** (request/response JSON examples)
- A **literal filesystem tree** (exact names only, no inferred entries)

# 🧠 Keyword Explorer: Deep Forensic Audit
**Date:** 2026-01-21
**Module:** `src/features/keyword-research`

## 1. Architecture Overview
The Feature uses a **Zustand Store (`useKeywordStore`)** as the central brain, decoupling UI from Data Fetching.

*   **Entry Point:** `src/app/dashboard/research/keyword-magic/page.tsx`
*   **Core Container:** `KeywordResearchContent` (Client Component)
*   **State Management:** `store/index.ts` (Zustand)
*   **Data Source:** DataForSEO Labs API (via `services/keyword.service.ts`)

## 2. Data Flow & Authenticity
| Metric | Source | Authenticity | Logic File |
| :--- | :--- | :--- | :--- |
| **Volume/CPC/KD** | DataForSEO API | ✅ Real | `keyword.service.ts` |
| **Weak Spots** | Parsed from Live SERP | ✅ Derived Real | `serp-parser.ts` |
| **RTV (Traffic Value)** | Calculated (Volume - Loss) | ⚠️ Algorithm | `rtv-calculator.ts` |
| **Geo Score** | Calculated (Heuristic) | ⚠️ Algorithm | `geo-calculator.ts` |
| **Trend** | 6-month History | ✅ Real | `data-mapper.ts` |

### 🚨 Critical Findings
1.  **RTV Algorithm:** Traffic value is *not* from API. It is calculated by subtracting percentage "losses" from Volume based on SERP features (e.g., AI Overview = -50% traffic).
2.  **Mock Fallbacks:** `keyword.service.ts` contains `toAPIKeyword` which injects randomized `clickShare` and `opportunityLevel` if data is missing.
3.  **Caching:** `store/index.ts` implements a **5-minute TTL cache** (`drawerCache`) for Commerce/Social data to save API credits.

## 3. Directory Structure Map
```text
src/features/keyword-research/
├── stores/             # Zustand Store (The Brain)
├── services/           # DataForSEO API Calls (Server-Only)
├── utils/
│   ├── filter-utils.ts # O(n) Filtering Engine
│   ├── rtv-calculator.ts # Traffic Value Math
│   └── data-mapper.ts  # Raw API -> App State
└── components/         # UI (filters, tables, charts)
```

## 4. Code Quality & Standards
*   **Filtering:** Use `applyAllFilters` from `utils`. It generally runs in O(n) time.
*   **Type Safety:** High. Strong typing in `types/index.ts`.
*   **Performance:** `useMemo` is heavily used in `keyword-research-content.tsx` to prevent re-renders during filtering.

## 5. Global Skills Update (Protocol)
When working on Keyword Research:
1.  **Always** verify if you are in "Mock Mode" (`process.env.NEXT_PUBLIC_USE_MOCK_DATA`).
2.  **Never** trust `geoScore` or `rtv` as raw API data; they are computed metrics.
3.  **Preserve** the `drawerCache` logic when refactoring to avoid API cost spikes.

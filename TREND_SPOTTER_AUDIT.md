# 🧠 Trend Spotter: Master Intelligence Report

> **Confidential Architecture Audit**
> **Scope**: Logic, Math, API Flows, Connectivity
> **Generated**: 2026-02-02

---

## 1. 🏗️ High-Level Architecture
Trend Spotter is a **Hybrid Engine** that combines external raw data (DataForSEO) with internal proprietary algorithms (Forecasting, Virality, Volume Distribution) to generate actionable intelligence. It does NOT just display data; it *enhances* it.

**Core Flow:**
1.  **Input**: User Query (Keyword, Country, Timeframe).
2.  **Extraction**: Parallel fetch from DataForSEO (Web, YouTube, News, Shopping).
3.  **Enhancement (The "Brain")**:
    *   **Forecasting**: Projects trend 3 steps ahead (Linear Regression).
    *   **Volume Modeling**: Anchors relative trend (0-100) to absolute search volume using `distributeVolume`.
    *   **Virality Scoring**: Detects Breakout/Rising/Cooling signals.
4.  **Presentation**: Unified Timeline, Map Heatmap, Forecast overlay.

---

## 2. 🧠 The "Brain" (Logic & Math Formulas)

The intelligence resides in `src/features/trend-spotter/utils/`.

### A. Forecast Engine (`trend-math.ts`, `forecast-engine.ts`)
**Purpose**: Predict future popularity based on historical momentum.
**Algorithm**: **Least Squares Linear Regression (LSLR)**.
**Formula**:
- **Dataset**: Takes the last **50%** of data points (Recent momentum).
- **Equation**: $y = mx + b$
    - $m$ (Slope) = $\frac{n\sum(xy) - \sum x \sum y}{n\sum(x^2) - (\sum x)^2}$
    - $b$ (Intercept) = $\frac{\sum y - m\sum x}{n}$
- **Output**: Clamped between 0-100 (Google Trends Scale).

### B. Geo-Volume Distribution (`trend-math.ts`)
**Purpose**: Convert abstract "Interest Score (0-100)" into "Estimated Searches".
**Logic**:
- Raw Google Trends gives relative scores per region (e.g., US: 100, IN: 80).
- DataForSEO gives "Global Keyword Volume" (e.g., 500,000).
- **Formula**:
    $$ \text{Volume}_{region} = \left( \frac{\text{Score}_{region}}{\sum \text{AllScores}} \right) \times \text{GlobalVolume} $$

### C. Virality Detector (`trend-logic.ts`)
**Purpose**: Assign badges (🚀 Breakout, 🔥 Rising).
**Formula**:
$$ \text{change} = \frac{\text{Current} - \text{Baseline}}{\text{Baseline}} \times 100 $$
- **Breakout 🚀**: > 50% growth.
- **Rising 🔥**: > 20% growth.
- **Cooling ❄️**: < 0% growth.

---

## 3. 🌐 API Intelligence & Connectivity

**Service Layer**: `src/features/trend-spotter/services/trend-api.ts`

### External Calls (DataForSEO)
Triggered when generic `fetchTrendBatch` is called.

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/keywords_data/google_trends/explore/live` | POST | **Primary Data**. Fetches Index (0-100) trends for Web, YouTube, News, Shopping in ONE batch. |
| `/dataforseo_labs/google/historical_search_volume/live` | POST | **Volume Anchoring**. Fetches absolute search volume (e.g. 50k searches/mo) to convert trend lines into numbers. |
| `/keywords_data/google_trends/subregion_interests/live` | POST | **Geo Heatmap**. Fetches state/region level breakdown. |

### Internal Data Flow
1.  **Frontend**: Calls `fetchTrendBatch(keyword, country, time)`.
2.  **Service**:
    *   Checks `MOCK_MODE`. If true, generates sine-wave mock data.
    *   If false, calls DataForSEO APIs in `Promise.all` (Trends + Volume).
3.  **Transform**:
    *   Parses raw JSON.
    *   **Injects Forecasts**: Calls `calculateForecast()` locally.
    *   **Distributes Volume**: Calls `distributeVolume()` locally.
4.  **Return**: Returns `TrendAnalysisResult` object to UI.

---

## 4. 📂 File Structure (The Connectivity Tree)

```text
src/features/trend-spotter/
├── trend-spotter.tsx             # [UI ENTRY] Main Container (The View)
├── components/                   # [UI ATOMS]
│   ├── trend-calendar.tsx        # Date Picker UI
│   ├── trend-alert-button.tsx    # Alert Trigger
│   └── (Charts/Cards...)
├── services/                     # [DATA LAYER]
│   ├── trend-api.ts              # ★ MAIN SERVICE (API Calls + Logic Binding)
│   └── trend-spotter.api.ts      # (Legacy/Facade)
├── utils/                        # [THE BRAIN]
│   ├── trend-math.ts             # ★ CORE MATH (Regression, Volume)
│   ├── forecast-engine.ts        # Advanced Forecasting (Date-aware)
│   ├── trend-logic.ts            # UI Logic (Badges)
│   └── trend-transform.ts        # Adapters (API -> UI Shape)
└── types/                        # [CONTRACTS]
    └── trend.types.ts            # Type Definitions
```

## 5. ⚠️ Weak Spots / Optimization Opportunities
1.  **Redundant Logic**: `trend-math.ts` and `trend-logic.ts` duplicate core math functions. Suggest consolidation.
2.  **Mock Mode Dependency**: Code heavily relies on `isMockMode()`. Ensure Production Env has distinct DataForSEO credentials.
3.  **Volume Anchoring**: If `historical_search_volume` returns null, the Map shows 0 volume (fallback needed).
